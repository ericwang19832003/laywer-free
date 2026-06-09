import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { AIClient, AIError } from '@/lib/ai/client'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { checkDistributedRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/security/rate-limit'
import { incrementAiUsage } from '@/lib/subscription/check'
import { buildCaseContext } from '@/lib/ai/litigation-legal/pro-se-adapter'
import { buildChronologyPrompt, parseChronologyResponse } from '@/lib/ai/litigation-legal/chronology'

const RequestSchema = z.object({
  caseId: z.string().uuid(),
  perspective: z.enum(['plaintiff', 'defendant']),
})

export const maxDuration = 60

export async function POST(request: NextRequest) {
  const auth = await getAuthenticatedClient()
  if (!auth.ok) return auth.error
  const { supabase, user } = auth

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'AI service not configured' }, { status: 503 })
  }

  const rl = await checkDistributedRateLimit(supabase, user.id, 'ai', RATE_LIMITS.ai.maxRequests, RATE_LIMITS.ai.windowMs)
  if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs)

  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const parsed = RequestSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

  const { caseId, perspective } = parsed.data

  const [{ data: caseRow }, { data: taskEvents }, { data: evidenceItems }] = await Promise.all([
    supabase
      .from('cases')
      .select('dispute_type, state, role, name, opposing_party, court_type')
      .eq('id', caseId)
      .single(),
    supabase
      .from('task_events')
      .select('kind, payload, created_at')
      .eq('case_id', caseId)
      .order('created_at', { ascending: true })
      .limit(50),
    supabase
      .from('evidence_items')
      .select('label, notes, captured_at, file_name')
      .eq('case_id', caseId)
      .limit(30),
  ])

  if (!caseRow) return NextResponse.json({ error: 'Case not found' }, { status: 404 })

  // Build rawFacts array from task_events and evidence_items
  const rawFacts: string[] = []

  if (taskEvents) {
    for (const event of taskEvents) {
      const date = event.created_at ? new Date(event.created_at).toISOString().slice(0, 10) : 'unknown date'
      const detail = event.payload && typeof event.payload === 'object' && 'description' in event.payload
        ? String((event.payload as Record<string, unknown>).description)
        : event.kind
      rawFacts.push(`${date}: [task event] ${detail}`)
    }
  }

  if (evidenceItems) {
    for (const item of evidenceItems) {
      const date = item.captured_at ?? 'unknown date'
      const label = item.label ?? item.file_name ?? 'Untitled evidence'
      const notes = item.notes ? ` — ${item.notes}` : ''
      rawFacts.push(`${date}: [evidence] ${label}${notes}`)
    }
  }

  if (rawFacts.length === 0) {
    return NextResponse.json({ error: 'No facts available to build chronology' }, { status: 422 })
  }

  const caseContext = buildCaseContext({
    caseId,
    disputeType: caseRow.dispute_type,
    state: caseRow.state ?? 'TX',
    role: (caseRow.role ?? perspective) as 'plaintiff' | 'defendant',
    caseName: caseRow.name ?? 'Your Case',
    opposingParty: caseRow.opposing_party ?? 'Opposing Party',
    court: caseRow.court_type ?? null,
    caseNumber: null,
    keyFacts: [],
    evidenceSummary: evidenceItems?.map((e) => e.label ?? e.file_name).filter(Boolean).join(', ') ?? 'No evidence recorded',
    upcomingDeadlines: [],
    completedSteps: [],
  })

  const { systemPrompt, userPrompt } = buildChronologyPrompt({
    caseName: caseRow.name ?? 'Your Case',
    perspective,
    caseContext,
    rawFacts,
  })

  try {
    const client = new AIClient({ model: 'claude-opus-4-7', maxRetries: 1 })
    const result = await client.complete({
      systemPrompt,
      userPrompt,
      temperature: 0.2,
      maxTokens: 4000,
      caller: 'chronology-builder',
      jsonMode: true,
    })

    const entries = parseChronologyResponse(result.content, perspective)

    if (entries.length > 0) {
      // Delete existing entries for this case+perspective then insert fresh ones
      await supabase
        .from('chronologies')
        .delete()
        .eq('case_id', caseId)
        .eq('perspective', perspective)

      await supabase.from('chronologies').insert(
        entries.map((entry) => ({
          case_id: caseId,
          entry_date: entry.entry_date,
          description: entry.description,
          source: entry.source,
          source_id: entry.source_id ?? null,
          significance: entry.significance,
          perspective: entry.perspective,
        }))
      )
    }

    await incrementAiUsage(supabase).catch(() => {})

    return NextResponse.json({ entries, count: entries.length })
  } catch (error) {
    if (error instanceof AIError) {
      return NextResponse.json({ error: error.message }, { status: 502 })
    }
    return NextResponse.json({ error: 'Failed to build chronology' }, { status: 500 })
  }
}
