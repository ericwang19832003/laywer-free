import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { AIClient, AIError } from '@/lib/ai/client'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { checkDistributedRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/security/rate-limit'
import { incrementAiUsage } from '@/lib/subscription/check'
import { buildCaseContext, applyProSeGuardrails } from '@/lib/ai/litigation-legal/pro-se-adapter'
import { buildBriefSectionPrompt } from '@/lib/ai/litigation-legal/brief-section'

const RequestSchema = z.object({
  caseId: z.string().uuid(),
  motionTitle: z.string().min(1).max(200),
  sectionType: z.enum(['statement_of_facts', 'argument', 'introduction', 'conclusion']),
  keyArgument: z.string().min(10).max(3000),
})

export const maxDuration = 60

export async function POST(request: NextRequest) {
  // Auth — MUST use this exact pattern
  const auth = await getAuthenticatedClient()
  if (!auth.ok) return auth.error
  const { supabase, user } = auth

  // API key guard
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'AI service not configured' }, { status: 503 })
  }

  // Rate limit
  const rl = await checkDistributedRateLimit(supabase, user.id, 'ai', RATE_LIMITS.ai.maxRequests, RATE_LIMITS.ai.windowMs)
  if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs)

  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const parsed = RequestSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

  const { caseId, motionTitle, sectionType, keyArgument } = parsed.data

  const [{ data: caseRow }, { data: evidence }, { data: authorities }] = await Promise.all([
    supabase.from('cases').select('name, dispute_type, state, role, court_type, opposing_party').eq('id', caseId).single(),
    supabase.from('evidence_items').select('title, description').eq('case_id', caseId).limit(15),
    supabase.from('case_authorities').select('citation, summary').eq('case_id', caseId).limit(10),
  ])

  if (!caseRow) return NextResponse.json({ error: 'Case not found' }, { status: 404 })

  const caseContext = buildCaseContext({
    caseId,
    disputeType: caseRow.dispute_type,
    state: caseRow.state ?? 'TX',
    role: (caseRow.role ?? 'plaintiff') as 'plaintiff' | 'defendant',
    caseName: caseRow.name ?? 'Your Case',
    opposingParty: caseRow.opposing_party ?? 'Opposing Party',
    court: caseRow.court_type ?? null,
    caseNumber: null,
    keyFacts: [],
    evidenceSummary: '',
    upcomingDeadlines: [],
    completedSteps: [],
  })

  const { systemPrompt, userPrompt } = buildBriefSectionPrompt({
    motionTitle,
    sectionType,
    keyArgument,
    caseContext,
    evidenceSummary: evidence?.map((e) => `${e.title}: ${e.description ?? ''}`).join('\n') ?? 'No evidence recorded',
    authorities: authorities ?? [],
  })

  try {
    const client = new AIClient({ model: 'claude-opus-4-7', maxRetries: 1 })
    const result = await client.complete({
      systemPrompt,
      userPrompt,
      temperature: 0.3,
      maxTokens: 3000,
      caller: 'brief-section',
    })

    const safeDraft = applyProSeGuardrails(result.content)

    // Documents table schema: doc_type, content_text, version (NOT title/content/document_type)
    const { data: existing } = await supabase
      .from('documents')
      .select('version')
      .eq('case_id', caseId)
      .eq('doc_type', 'brief_section')
      .order('version', { ascending: false })
      .limit(1)

    const nextVersion = existing && existing.length > 0 ? existing[0].version + 1 : 1

    const { data: doc } = await supabase
      .from('documents')
      .insert({
        case_id: caseId,
        doc_type: 'brief_section',
        version: nextVersion,
        status: 'draft',
        content_text: safeDraft,
        metadata: { generator: 'brief-section-v1', motionTitle, sectionType },
      })
      .select('id')
      .single()

    await incrementAiUsage(supabase).catch(() => {})

    return NextResponse.json({ draft: safeDraft, documentId: doc?.id ?? null })
  } catch (error) {
    if (error instanceof AIError) {
      return NextResponse.json({ error: error.message }, { status: 502 })
    }
    return NextResponse.json({ error: 'Failed to generate brief section' }, { status: 500 })
  }
}
