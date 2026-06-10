import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { AIClient } from '@/lib/ai/client'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { checkDistributedRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/security/rate-limit'
import { incrementAiUsage } from '@/lib/subscription/check'
import { applyProSeGuardrails } from '@/lib/ai/litigation-legal/pro-se-adapter'
import { buildBriefSectionPrompt, type SectionType } from '@/lib/ai/litigation-legal/brief-section'
import { safeError } from '@/lib/security/safe-log'

export const maxDuration = 120

const RequestSchema = z.object({
  keyArgument: z.string().min(10).max(3000),
})

const SECTIONS: SectionType[] = ['introduction', 'statement_of_facts', 'argument', 'conclusion']

const SECTION_LABELS: Record<SectionType, string> = {
  introduction: 'Introduction',
  statement_of_facts: 'Statement of Facts',
  argument: 'Argument',
  conclusion: 'Conclusion / Prayer for Relief',
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; motionId: string }> }
) {
  try {
    const { id: caseId, motionId } = await params
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase, user } = auth

    const rl = await checkDistributedRateLimit(
      supabase, user.id, 'ai', RATE_LIMITS.ai.maxRequests, RATE_LIMITS.ai.windowMs
    )
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs)

    const body = await request.json().catch(() => null)
    if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

    const parsed = RequestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
    }
    const { keyArgument } = parsed.data

    const [motionResult, caseResult, evidenceResult, authoritiesResult] = await Promise.all([
      supabase
        .from('motions')
        .select('motion_type, facts')
        .eq('id', motionId)
        .eq('case_id', caseId)
        .single(),
      supabase
        .from('cases')
        .select('name, dispute_type, state, role, opposing_party, court_type')
        .eq('id', caseId)
        .single(),
      supabase
        .from('evidence_items')
        .select('file_name, category, notes')
        .eq('case_id', caseId)
        .limit(10),
      supabase
        .from('case_authorities')
        .select('citation, summary')
        .eq('case_id', caseId)
        .limit(5),
    ])

    if (motionResult.error || !motionResult.data) {
      return NextResponse.json({ error: 'Motion not found' }, { status: 404 })
    }
    if (caseResult.error || !caseResult.data) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    const { motion_type, facts } = motionResult.data
    const caseData = caseResult.data

    const caseContext = [
      `Case: ${caseData.name ?? 'Your Case'} vs. ${caseData.opposing_party ?? 'Opposing Party'}`,
      `Type: ${caseData.dispute_type ?? 'civil'}`,
      `State: ${caseData.state ?? 'TX'}`,
      `Role: ${caseData.role ?? 'plaintiff'}`,
      `Court: ${caseData.court_type ?? 'unknown'}`,
    ].join('\n')

    const evidenceSummary = (evidenceResult.data ?? [])
      .map((e) => `${e.file_name}${e.category ? ` (${e.category})` : ''}`)
      .join(', ')

    const authorities = (authoritiesResult.data ?? []).map((a) => ({
      citation: a.citation,
      summary: a.summary ?? '',
    }))

    const facts_str = typeof facts === 'string'
      ? facts
      : facts
        ? JSON.stringify(facts)
        : ''

    const motionTitle = [motion_type ?? 'Motion', facts_str ? `— ${facts_str.slice(0, 80)}` : '']
      .filter(Boolean)
      .join(' ')

    const client = new AIClient({ model: 'claude-opus-4-7', maxRetries: 1 })
    const sectionTexts: string[] = []

    for (const sectionType of SECTIONS) {
      const { systemPrompt, userPrompt } = buildBriefSectionPrompt({
        sectionType,
        motionTitle,
        keyArgument,
        caseContext,
        evidenceSummary,
        authorities,
      })

      const { content } = await client.complete({
        systemPrompt,
        userPrompt,
        temperature: 0.3,
        maxTokens: 2000,
        caller: `motion-draft-${sectionType}`,
      })

      sectionTexts.push(`## ${SECTION_LABELS[sectionType]}\n\n${content}`)
    }

    const assembledDraft = applyProSeGuardrails(sectionTexts.join('\n\n'))

    const { data: existingDocs } = await supabase
      .from('documents')
      .select('version')
      .eq('case_id', caseId)
      .eq('doc_type', 'full_motion')
      .order('version', { ascending: false })
      .limit(1)

    const nextVersion = existingDocs && existingDocs.length > 0 ? existingDocs[0].version + 1 : 1

    const [, docResult] = await Promise.all([
      supabase
        .from('motions')
        .update({ draft_text: assembledDraft })
        .eq('id', motionId),
      supabase
        .from('documents')
        .insert({
          case_id: caseId,
          doc_type: 'full_motion',
          version: nextVersion,
          status: 'draft',
          content_text: assembledDraft,
          metadata: { motion_id: motionId, generator: 'full-motion-drafter-v1' },
        })
        .select('id')
        .single(),
    ])

    await incrementAiUsage(supabase).catch(() => {})

    return NextResponse.json({
      draft: assembledDraft,
      documentId: docResult.data?.id ?? null,
      motionId,
    })
  } catch (err) {
    safeError('motion-draft', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
