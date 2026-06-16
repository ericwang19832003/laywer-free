import { NextRequest } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { buildAgentGraph } from '@/lib/ai/agent/graph'
import { createInitialState } from '@/lib/ai/agent/state'
import { loadCheckpoint, saveCheckpoint } from '@/lib/ai/agent/checkpointer'

const TIMEOUT_MS = 60_000

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: caseId } = await params
  const auth = await getAuthenticatedClient()
  if (!auth.ok) return auth.error
  const { supabase, user } = auth

  const body = await request.json().catch(() => null)
  if (!body?.message || typeof body.message !== 'string') {
    return new Response(JSON.stringify({ error: 'message is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const [caseResult, tasksResult, deadlinesResult, evidenceResult, { data: evidenceItems }, { data: courtDocs }] = await Promise.all([
    supabase.from('cases').select('dispute_type, role, county').eq('id', caseId).single(),
    supabase.from('tasks').select('task_key, title, status').eq('case_id', caseId).limit(20),
    supabase.from('deadlines').select('key, due_at, label').eq('case_id', caseId).order('due_at'),
    supabase.from('evidence_items').select('id', { count: 'exact', head: true }).eq('case_id', caseId),
    supabase.from('evidence_items').select('id, file_name').eq('case_id', caseId).order('created_at', { ascending: false }),
    supabase.from('court_documents').select('id, file_name').eq('case_id', caseId),
  ])

  if (caseResult.error) {
    const isNotFound = caseResult.error.code === 'PGRST116'
    return new Response(JSON.stringify({ error: isNotFound ? 'Case not found' : 'Failed to load case' }), {
      status: isNotFound ? 404 : 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  if (!caseResult.data) {
    return new Response(JSON.stringify({ error: 'Case not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { dispute_type, role, county } = caseResult.data

  const allEvidenceItems = [
    ...(courtDocs ?? []).map((d) => ({ id: d.id, file_name: d.file_name, source_type: 'court_document' as const })),
    ...(evidenceItems ?? []).map((e) => ({ id: e.id, file_name: e.file_name, source_type: 'evidence_item' as const })),
  ]

  let existingCheckpoint = null
  try {
    existingCheckpoint = await loadCheckpoint(supabase, caseId, user.id)
  } catch { /* start fresh if load fails */ }

  const saveDraft = async (p: { caseId: string; documentType: string; content: string }) => {
    const { data } = await supabase
      .from('draft_versions')
      .insert({ case_id: p.caseId, content: p.content, source: 'agent' })
      .select('id')
      .single()
    return data?.id ?? 'unknown'
  }

  const graph = buildAgentGraph({ supabaseClient: supabase, saveDraft })

  const state = createInitialState({
    caseId,
    disputeType: dispute_type ?? 'general',
    role: (role === 'defendant' ? 'defendant' : 'plaintiff') as 'plaintiff' | 'defendant',
    county: county ?? 'Unknown',
    healthScore: 0,
    tasks: tasksResult.data ?? [],
    deadlines: deadlinesResult.data ?? [],
    evidenceCount: evidenceResult.count ?? 0,
    evidenceItems: allEvidenceItems,
  })

  if (existingCheckpoint?.messages) {
    state.messages = existingCheckpoint.messages
  }

  state.messages = [...state.messages, { role: 'user', content: body.message }]

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const abortController = new AbortController()
      const timeout = setTimeout(() => abortController.abort(), TIMEOUT_MS)

      try {
        const agentStream = graph.stream(state)

        for await (const event of agentStream) {
          if (abortController.signal.aborted) break

          if (event.type === 'token') {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'token', content: event.content })}\n\n`))
          } else if (event.type === 'tool_start') {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'tool_start', tool: event.tool })}\n\n`))
          } else if (event.type === 'tool_end') {
            controller.enqueue(encoder.encode('data: {"type":"tool_end"}\n\n'))
          } else if (event.type === 'done') {
            // Persist checkpoint — best-effort
            try {
              await saveCheckpoint(supabase, caseId, user.id, {
                messages: state.messages,
                toolCallCount: 0,
              })
            } catch { /* non-fatal */ }

            controller.enqueue(encoder.encode('data: {"type":"done"}\n\n'))
          }
        }
      } catch (err) {
        const isAbort = err instanceof Error && (err.name === 'AbortError' || err.message.includes('abort'))
        const msg = isAbort
          ? 'Request timed out after 60 seconds'
          : (err instanceof Error ? err.message : 'Unknown error')
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', content: msg })}\n\n`))
        } catch { /* controller already closed */ }
      } finally {
        clearTimeout(timeout)
        try { controller.close() } catch { /* already closed */ }
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
