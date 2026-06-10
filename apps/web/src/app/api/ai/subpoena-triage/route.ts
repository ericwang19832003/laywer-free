import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { AIClient, AIError } from '@/lib/ai/client'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { checkDistributedRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/security/rate-limit'
import { incrementAiUsage } from '@/lib/subscription/check'
import { buildCaseContext, applyProSeGuardrails } from '@/lib/ai/litigation-legal/pro-se-adapter'
import { buildSubpoenaTriagePrompt } from '@/lib/ai/litigation-legal/subpoena-triage'

const RequestSchema = z.object({
  caseId: z.string().uuid(),
  subpoenaText: z.string().min(20).max(10000),
})

export const maxDuration = 60

export async function POST(request: NextRequest) {
  // Auth
  const auth = await getAuthenticatedClient()
  if (!auth.ok) return auth.error
  const { supabase, user } = auth

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'AI service not configured' }, { status: 503 })
  }

  // Rate limit — 5-arg signature
  const rl = await checkDistributedRateLimit(supabase, user.id, 'ai', RATE_LIMITS.ai.maxRequests, RATE_LIMITS.ai.windowMs)
  if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs)

  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const parsed = RequestSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

  const { caseId, subpoenaText } = parsed.data

  const { data: caseRow } = await supabase
    .from('cases')
    .select('name, dispute_type, state, role, court_type, opposing_party')
    .eq('id', caseId)
    .single()

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

  const { systemPrompt, userPrompt } = buildSubpoenaTriagePrompt({
    state: caseRow.state ?? 'TX',
    caseContext,
    subpoenaText,
  })

  try {
    const client = new AIClient({ model: 'claude-sonnet-4-6', maxRetries: 1 })
    const result = await client.complete({
      systemPrompt,
      userPrompt,
      temperature: 0.2,
      maxTokens: 2000,
      caller: 'subpoena-triage',
    })

    const safeResult = applyProSeGuardrails(result.content)

    // Documents table schema: doc_type, content_text, version
    const { data: existing } = await supabase
      .from('documents')
      .select('version')
      .eq('case_id', caseId)
      .eq('doc_type', 'subpoena_triage')
      .order('version', { ascending: false })
      .limit(1)

    const nextVersion = existing && existing.length > 0 ? existing[0].version + 1 : 1

    const { data: doc } = await supabase
      .from('documents')
      .insert({
        case_id: caseId,
        doc_type: 'subpoena_triage',
        version: nextVersion,
        status: 'draft',
        content_text: safeResult,
        metadata: { generator: 'subpoena-triage-v1' },
      })
      .select('id')
      .single()

    await incrementAiUsage(supabase).catch(() => {})

    return NextResponse.json({ triage: safeResult, documentId: doc?.id ?? null })
  } catch (error) {
    if (error instanceof AIError) {
      return NextResponse.json({ error: error.message }, { status: 502 })
    }
    return NextResponse.json({ error: 'Failed to triage subpoena' }, { status: 500 })
  }
}
