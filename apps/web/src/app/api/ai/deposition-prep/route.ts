import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { AIClient, AIError } from '@/lib/ai/client'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { checkDistributedRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/security/rate-limit'
import { incrementAiUsage } from '@/lib/subscription/check'
import { buildCaseContext, applyProSeGuardrails } from '@/lib/ai/litigation-legal/pro-se-adapter'
import { buildDepoPrompt } from '@/lib/ai/litigation-legal/deposition-prep'

const RequestSchema = z.object({
  caseId: z.string().uuid(),
  witnessName: z.string().min(1).max(200),
  witnessRole: z.enum(['opposing_party', 'expert_witness', 'fact_witness']),
  depositionPerspective: z.enum(['deposing', 'defending']),
  keyFacts: z.string().min(10).max(3000),
})

export const maxDuration = 60

export async function POST(request: NextRequest) {
  // Auth
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

  const { caseId, witnessName, witnessRole, depositionPerspective, keyFacts } = parsed.data

  const [{ data: caseRow }, { data: evidence }] = await Promise.all([
    supabase.from('cases').select('name, dispute_type, state, role, court_type, opposing_party').eq('id', caseId).single(),
    supabase.from('evidence_items').select('title, description').eq('case_id', caseId).limit(15),
  ])

  if (!caseRow) return NextResponse.json({ error: 'Case not found' }, { status: 404 })

  const caseContext = buildCaseContext({
    caseId,
    disputeType: caseRow.dispute_type,
    state: caseRow.state ?? 'TX',
    role: (caseRow.role ?? 'plaintiff') as 'plaintiff' | 'defendant',
    caseName: caseRow.name ?? 'Your Case',
    opposingParty: caseRow.opposing_party ?? witnessName,
    court: caseRow.court_type ?? null,
    caseNumber: null,
    keyFacts: keyFacts.split('\n').filter(Boolean),
    evidenceSummary: '',
    upcomingDeadlines: [],
    completedSteps: [],
  })

  const { systemPrompt, userPrompt } = buildDepoPrompt({
    witnessName,
    witnessRole,
    depositionPerspective,
    caseContext,
    keyFacts,
    evidenceSummary: evidence?.map((e) => `${e.title}: ${e.description ?? ''}`).join('\n') ?? 'No evidence recorded',
  })

  try {
    const client = new AIClient({ model: 'claude-opus-4-7', maxRetries: 1 })
    const result = await client.complete({
      systemPrompt,
      userPrompt,
      temperature: 0.4,
      maxTokens: 3000,
      caller: 'deposition-prep',
    })

    const safeDraft = applyProSeGuardrails(result.content)

    // Documents table schema: doc_type, content_text, version
    const { data: existing } = await supabase
      .from('documents')
      .select('version')
      .eq('case_id', caseId)
      .eq('doc_type', 'deposition_prep')
      .order('version', { ascending: false })
      .limit(1)

    const nextVersion = existing && existing.length > 0 ? existing[0].version + 1 : 1

    const { data: doc } = await supabase
      .from('documents')
      .insert({
        case_id: caseId,
        doc_type: 'deposition_prep',
        version: nextVersion,
        status: 'draft',
        content_text: safeDraft,
        metadata: { generator: 'depo-prep-v1', witnessName, witnessRole, depositionPerspective },
      })
      .select('id')
      .single()

    await incrementAiUsage(supabase).catch(() => {})

    return NextResponse.json({ prep: safeDraft, documentId: doc?.id ?? null })
  } catch (error) {
    if (error instanceof AIError) {
      return NextResponse.json({ error: error.message }, { status: 502 })
    }
    return NextResponse.json({ error: 'Failed to generate deposition prep' }, { status: 500 })
  }
}
