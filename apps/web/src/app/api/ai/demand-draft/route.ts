import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { AIClient, AIError } from '@/lib/ai/client'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { checkDistributedRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/security/rate-limit'
import { incrementAiUsage } from '@/lib/subscription/check'
import { buildCaseContext, applyProSeGuardrails } from '@/lib/ai/litigation-legal/pro-se-adapter'
import { validateDemandIntake, buildDemandDraftPrompt } from '@/lib/ai/litigation-legal/demand-draft'

const IntakeSchema = z.object({
  caseId: z.string().uuid(),
  role: z.enum(['plaintiff', 'defendant']),
  opposingParty: z.string().min(1).max(200),
  reliefSought: z.string().min(1).max(1000),
  keyFacts: z.string().min(10).max(5000),
  tone: z.enum(['measured', 'assertive']),
  responseDeadlineDays: z.number().int().min(7).max(60).default(14),
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

  const parsed = IntakeSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

  const intake = parsed.data

  const [{ data: caseRow }, { data: tasks }, { data: evidence }, { data: deadlines }] =
    await Promise.all([
      supabase.from('cases').select('dispute_type, state, role, name, opposing_party, court_type').eq('id', intake.caseId).single(),
      supabase.from('tasks').select('title, status').eq('case_id', intake.caseId).eq('status', 'completed').limit(10),
      supabase.from('evidence_items').select('title, description').eq('case_id', intake.caseId).limit(10),
      supabase.from('deadlines').select('title, due_date').eq('case_id', intake.caseId).gte('due_date', new Date().toISOString()).limit(5),
    ])

  if (!caseRow) return NextResponse.json({ error: 'Case not found' }, { status: 404 })

  const caseContext = buildCaseContext({
    caseId: intake.caseId,
    disputeType: caseRow.dispute_type,
    state: caseRow.state ?? 'TX',
    role: (caseRow.role ?? intake.role) as 'plaintiff' | 'defendant',
    caseName: caseRow.name ?? 'Your Case',
    opposingParty: intake.opposingParty,
    court: caseRow.court_type ?? null,
    caseNumber: null,
    keyFacts: intake.keyFacts.split('\n').filter(Boolean),
    evidenceSummary: evidence?.map((e) => e.title).join(', ') ?? 'No evidence recorded',
    upcomingDeadlines: deadlines?.map((d) => `${d.title} (${d.due_date})`) ?? [],
    completedSteps: tasks?.map((t) => t.title) ?? [],
  })

  const demandIntake = {
    role: intake.role,
    opposingParty: intake.opposingParty,
    reliefSought: intake.reliefSought,
    keyFacts: intake.keyFacts,
    tone: intake.tone,
    responseDeadlineDays: intake.responseDeadlineDays,
    caseContext,
  }

  const validation = validateDemandIntake(demandIntake)
  if (!validation.valid) return NextResponse.json({ error: validation.errors }, { status: 422 })

  const { systemPrompt, userPrompt } = buildDemandDraftPrompt(demandIntake)

  try {
    const client = new AIClient({ model: 'claude-opus-4-7', maxRetries: 1 })
    const result = await client.complete({ systemPrompt, userPrompt, temperature: 0.4, maxTokens: 3000, caller: 'demand-draft' })

    const safeDraft = applyProSeGuardrails(result.content)

    // Determine next version for this doc_type in the case
    const { data: existing } = await supabase
      .from('documents')
      .select('version')
      .eq('case_id', intake.caseId)
      .eq('doc_type', 'demand_letter')
      .order('version', { ascending: false })
      .limit(1)

    const nextVersion = existing && existing.length > 0 ? existing[0].version + 1 : 1

    const { data: doc } = await supabase
      .from('documents')
      .insert({
        case_id: intake.caseId,
        doc_type: 'demand_letter',
        version: nextVersion,
        status: 'draft',
        content_text: safeDraft,
        metadata: { generator: 'demand-draft-v1', tone: intake.tone, opposingParty: intake.opposingParty },
      })
      .select('id')
      .single()

    await incrementAiUsage(supabase).catch(() => {})

    return NextResponse.json({ draft: safeDraft, documentId: doc?.id ?? null })
  } catch (error) {
    if (error instanceof AIError) {
      return NextResponse.json({ error: error.message }, { status: 502 })
    }
    return NextResponse.json({ error: 'Failed to generate demand letter' }, { status: 500 })
  }
}
