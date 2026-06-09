import { NextRequest, NextResponse } from 'next/server'
import { AIClient } from '@/lib/ai/client'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { checkDistributedRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/security/rate-limit'
import { incrementAiUsage } from '@/lib/subscription/check'
import { safeError } from '@/lib/security/safe-log'
import {
  healthTipsSchema,
  HEALTH_TIPS_SYSTEM_PROMPT,
  buildHealthTipsPrompt,
  buildStaticHealthTips,
  isHealthTipsSafe,
} from '@/lib/ai/health-tips'

export const maxDuration = 30

const CACHE_KEY = 'health_tips'
const STALE_HOURS = 24

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const forceRefresh = request.nextUrl.searchParams.has('force')
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase, user } = auth

    const rl = await checkDistributedRateLimit(
      supabase, user.id, 'ai', RATE_LIMITS.ai.maxRequests, RATE_LIMITS.ai.windowMs
    )
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs)

    const [caseResult, riskResult, tasksResult, evidenceResult, cachedResult] = await Promise.all([
      supabase
        .from('cases')
        .select('court_type, dispute_type')
        .eq('id', caseId)
        .single(),
      supabase
        .from('case_risk_scores')
        .select('overall_score, deadline_risk, response_risk, evidence_risk, activity_risk')
        .eq('case_id', caseId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single(),
      supabase
        .from('tasks')
        .select('status')
        .eq('case_id', caseId),
      supabase
        .from('evidence_items')
        .select('id', { count: 'exact', head: true })
        .eq('case_id', caseId),
      supabase
        .from('ai_cache')
        .select('content, generated_at')
        .eq('case_id', caseId)
        .eq('cache_key', CACHE_KEY)
        .single(),
    ])

    if (caseResult.error || !caseResult.data) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    if (!forceRefresh && cachedResult.data) {
      const age = Date.now() - new Date(cachedResult.data.generated_at).getTime()
      if (age < STALE_HOURS * 60 * 60 * 1000) {
        return NextResponse.json({
          ...(cachedResult.data.content as object),
          _meta: { source: 'cached', generated_at: cachedResult.data.generated_at },
        })
      }
    }

    const scores = riskResult.data
    const tasks = tasksResult.data ?? []
    const tasksCompleted = tasks.filter(
      (t) => t.status === 'completed' || t.status === 'skipped'
    ).length

    if (!scores) {
      const fallback = buildStaticHealthTips({ deadline_risk: 0, response_risk: 0, evidence_risk: 0, activity_risk: 0 })
      return NextResponse.json({ ...fallback, _meta: { source: 'static' } })
    }

    let result = buildStaticHealthTips(scores)
    let source: 'ai' | 'static' = 'static'

    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const userPrompt = buildHealthTipsPrompt({
          overall_score: scores.overall_score,
          deadline_risk: scores.deadline_risk,
          response_risk: scores.response_risk,
          evidence_risk: scores.evidence_risk,
          activity_risk: scores.activity_risk,
          court_type: caseResult.data.court_type ?? 'unknown',
          dispute_type: caseResult.data.dispute_type,
          tasks_completed: tasksCompleted,
          tasks_total: tasks.length,
          evidence_count: evidenceResult.count ?? 0,
        })

        const client = new AIClient({ model: 'claude-haiku-4-5-20251001', maxRetries: 1 })
        const { raw } = await client.complete({
          systemPrompt: HEALTH_TIPS_SYSTEM_PROMPT,
          userPrompt,
          temperature: 0.2,
          jsonMode: true,
          caller: 'health-tips',
        })

        if (raw) {
          const parsed = JSON.parse(raw)
          const validated = healthTipsSchema.safeParse(parsed)
          if (validated.success) {
            const allText = validated.data.tips.map((t) => t.tip).join(' ')
            if (isHealthTipsSafe(allText)) {
              result = validated.data
              source = 'ai'
            }
          }
        }
      } catch (err) {
        safeError('health-tips', err)
      }
    }

    await supabase.from('ai_cache').upsert(
      {
        case_id: caseId,
        cache_key: CACHE_KEY,
        content: result,
        generated_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + STALE_HOURS * 60 * 60 * 1000).toISOString(),
      },
      { onConflict: 'case_id,cache_key' }
    )

    await incrementAiUsage(supabase).catch(() => {})

    return NextResponse.json({ ...result, _meta: { source } })
  } catch (err) {
    safeError('health-tips', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
