import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { reviewFilingRequestSchema } from '@lawyer-free/shared/schemas/review-filing'
import { loadJurisdictionRules } from '@lawyer-free/shared/jurisdiction-rules'
import { runTripleReview } from '@lawyer-free/shared/validators/triple-review'
import { checkDistributedRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/security/rate-limit'
import { safeError } from '@/lib/security/safe-log'
import { logger, metrics, METRIC } from '@/lib/observability'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now()
  try {
    const { id: caseId } = await params
    logger.info('ai.review-filing started', { caseId })
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase, user } = auth

    const rl = await checkDistributedRateLimit(supabase, user.id, 'ai', RATE_LIMITS.ai.maxRequests, RATE_LIMITS.ai.windowMs)
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs)

    // Verify case exists (RLS handles ownership)
    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .select('id')
      .eq('id', caseId)
      .single()

    if (caseError || !caseData) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const parsed = reviewFilingRequestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 422 }
      )
    }

    const { petitionDraft, state, disputeType, subType } = parsed.data

    const config = loadJurisdictionRules(state, disputeType, subType)
    if (!config) {
      return NextResponse.json(
        { error: 'No jurisdiction rules found for this state/dispute type' },
        { status: 404 }
      )
    }

    const anthropic = new Anthropic()

    async function callAI(system: string, user: string): Promise<string> {
      const message = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system,
        messages: [{ role: 'user', content: user }],
      })

      return message.content
        .filter((block) => block.type === 'text')
        .map((block) => block.text)
        .join('\n')
    }

    const result = await runTripleReview(config, petitionDraft, callAI)

    const durationMs = Date.now() - startTime
    logger.info('ai.review-filing succeeded', { caseId, durationMs })

    return NextResponse.json(result)
  } catch (err) {
    const durationMs = Date.now() - startTime
    logger.error('ai.review-filing failed', err instanceof Error ? err : undefined, { durationMs })
    safeError('review-filing', err)
    return NextResponse.json(
      { error: 'Failed to review filing. Please try again.' },
      { status: 500 }
    )
  }
}
