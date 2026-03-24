import { NextRequest, NextResponse } from 'next/server'
import { aiClient } from '@/lib/ai/client'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import {
  timelineSummarySchema,
  isTimelineSummarySafe,
  buildStaticTimelineSummary,
  buildTimelineSummaryPrompt,
  TIMELINE_SUMMARY_SYSTEM_PROMPT,
} from '@/lib/ai/timeline-summary'
import { safeError } from '@/lib/security/safe-log'
import { checkDistributedRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/security/rate-limit'

export const runtime = 'nodejs'
export const maxDuration = 30

const AI_MODEL = 'gpt-4o-mini'
const CACHE_KEY = 'timeline_summary'
const STALE_HOURS = 24
const MIN_EVENTS = 3

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase, user } = auth

    const rl = await checkDistributedRateLimit(supabase, user.id, 'ai', RATE_LIMITS.ai.maxRequests, RATE_LIMITS.ai.windowMs)
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs)

    // Verify case
    const { error: caseError } = await supabase
      .from('cases').select('id').eq('id', caseId).single()
    if (caseError) return NextResponse.json({ error: 'Case not found' }, { status: 404 })

    // Fetch events
    const { data: events } = await supabase
      .from('task_events')
      .select('kind, created_at, tasks(title)')
      .eq('case_id', caseId)
      .order('created_at', { ascending: true })

    const eventList = (events ?? []).map((e: Record<string, unknown>) => ({
      kind: e.kind as string,
      created_at: e.created_at as string,
      task_title: (e.tasks as Record<string, unknown> | null)?.title as string | undefined,
    }))

    if (eventList.length < MIN_EVENTS) {
      return NextResponse.json({
        summary: null,
        message: 'Not enough activity for a summary yet.',
        _meta: { source: 'none' },
      })
    }

    // Check cache
    const { data: cached } = await supabase
      .from('ai_cache')
      .select('content, generated_at')
      .eq('case_id', caseId)
      .eq('cache_key', CACHE_KEY)
      .single()

    if (cached) {
      const age = Date.now() - new Date(cached.generated_at).getTime()
      const staleMs = STALE_HOURS * 60 * 60 * 1000
      if (age < staleMs) {
        return NextResponse.json({
          ...cached.content,
          _meta: { source: 'cached', generated_at: cached.generated_at },
        })
      }
    }

    // Build static fallback
    let result = buildStaticTimelineSummary(
      eventList.length,
      eventList[0].created_at,
      eventList[eventList.length - 1].created_at
    )
    let source: 'ai' | 'static' = 'static'

    // Try AI
    if (process.env.OPENAI_API_KEY) {
      try {
        const userPrompt = buildTimelineSummaryPrompt(eventList)

        const { raw } = await aiClient.complete({
          systemPrompt: TIMELINE_SUMMARY_SYSTEM_PROMPT,
          userPrompt,
          temperature: 0.4,
          jsonMode: true,
          caller: 'timeline-summary',
        })

        if (raw) {
          const parsed = JSON.parse(raw)
          const validated = timelineSummarySchema.safeParse(parsed)
          if (validated.success && isTimelineSummarySafe(validated.data.summary)) {
            result = validated.data
            source = 'ai'
          }
        }
      } catch (err) {
        safeError('timeline-summary', err)
      }
    }

    // Cache result
    await supabase
      .from('ai_cache')
      .upsert({
        case_id: caseId,
        cache_key: CACHE_KEY,
        content: result,
        generated_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + STALE_HOURS * 60 * 60 * 1000).toISOString(),
      }, { onConflict: 'case_id,cache_key' })

    return NextResponse.json({
      ...result,
      _meta: { source, model: source === 'ai' ? AI_MODEL : null },
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
