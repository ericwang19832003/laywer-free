import { NextRequest, NextResponse } from 'next/server'
import { AIClient } from '@/lib/ai/client'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { checkDistributedRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/security/rate-limit'
import { safeError } from '@/lib/security/safe-log'
import {
  exhibitSuggestionSchema,
  EXHIBIT_SUGGESTION_SYSTEM_PROMPT,
  buildExhibitSuggestionPrompt,
  isExhibitSuggestionSafe,
} from '@/lib/ai/exhibit-suggestions'

export const maxDuration = 30

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase, user } = auth

    const rl = await checkDistributedRateLimit(
      supabase, user.id, 'ai', RATE_LIMITS.ai.maxRequests, RATE_LIMITS.ai.windowMs
    )
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs)

    const [caseResult, exhibitSetResult] = await Promise.all([
      supabase
        .from('cases')
        .select('dispute_type, state')
        .eq('id', caseId)
        .single(),
      supabase
        .from('exhibit_sets')
        .select('id')
        .eq('case_id', caseId)
        .single(),
    ])

    if (caseResult.error || !caseResult.data) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    if (exhibitSetResult.error || !exhibitSetResult.data) {
      return NextResponse.json({
        suggestions: [],
        message: 'Create an exhibit set first',
      })
    }

    const exhibitSetId = exhibitSetResult.data.id

    const [existingExhibitsResult, exhibitedIdsResult, allEvidenceResult] = await Promise.all([
      supabase
        .from('exhibits')
        .select('exhibit_no, title')
        .eq('exhibit_set_id', exhibitSetId),
      supabase
        .from('exhibits')
        .select('evidence_item_id')
        .eq('exhibit_set_id', exhibitSetId),
      supabase
        .from('evidence_items')
        .select('id, file_name, category, notes')
        .eq('case_id', caseId)
        .limit(20),
    ])

    const existingExhibits = (existingExhibitsResult.data ?? []).map((e) => ({
      exhibit_no: Number(e.exhibit_no) || 0,
      title: e.title ?? '',
    }))

    const exhibitedIds = new Set(
      (exhibitedIdsResult.data ?? []).map((e) => e.evidence_item_id).filter(Boolean)
    )

    const unexhibited = (allEvidenceResult.data ?? [])
      .filter((e) => !exhibitedIds.has(e.id))
      .map((e) => ({
        id: e.id,
        file_name: e.file_name ?? '',
        category: e.category,
        notes: e.notes,
      }))

    if (unexhibited.length === 0) {
      return NextResponse.json({ suggestions: [] })
    }

    let suggestions: { evidence_id: string; suggested_title: string; reason: string }[] = []

    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const userPrompt = buildExhibitSuggestionPrompt({
          dispute_type: caseResult.data.dispute_type,
          state: caseResult.data.state,
          existing_exhibits: existingExhibits,
          unexhibited_evidence: unexhibited,
        })

        const client = new AIClient({ model: 'claude-sonnet-4-6', maxRetries: 1 })
        const { raw } = await client.complete({
          systemPrompt: EXHIBIT_SUGGESTION_SYSTEM_PROMPT,
          userPrompt,
          temperature: 0.3,
          jsonMode: true,
          caller: 'exhibit-suggest',
        })

        if (raw) {
          const parsed = JSON.parse(raw)
          const validated = exhibitSuggestionSchema.safeParse(parsed)
          if (validated.success) {
            const allText = validated.data.suggestions
              .map((s) => `${s.suggested_title} ${s.reason}`)
              .join(' ')
            if (isExhibitSuggestionSafe(allText)) {
              suggestions = validated.data.suggestions
            }
          }
        }
      } catch (err) {
        safeError('exhibit-suggest', err)
      }
    }

    return NextResponse.json({ suggestions })
  } catch (err) {
    safeError('exhibit-suggest', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
