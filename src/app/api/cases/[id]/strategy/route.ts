import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import {
  strategyRecommendationSchema,
  isStrategySafe,
  buildStaticStrategy,
  buildStrategyPrompt,
} from '@/lib/ai/strategy-recommendations'
import { safeError } from '@/lib/security/safe-log'
import { checkRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/security/rate-limit'

export const runtime = 'nodejs'
export const maxDuration = 60

const CACHE_KEY = 'strategy'
const STALE_DAYS = 7

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase, user } = auth

    const rl = checkRateLimit(user.id, 'ai', RATE_LIMITS.ai.maxRequests, RATE_LIMITS.ai.windowMs)
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs)

    // Fetch all case context in parallel
    const [caseResult, tasksResult, deadlinesResult, evidenceResult, riskResult, motionsResult, discoveryResult] =
      await Promise.all([
        supabase.from('cases').select('id, role, court_type, dispute_type, created_at').eq('id', caseId).single(),
        supabase.from('tasks').select('task_key, status').eq('case_id', caseId),
        supabase.from('deadlines').select('key, due_at').eq('case_id', caseId).gte('due_at', new Date().toISOString()).order('due_at', { ascending: true }).limit(5),
        supabase.from('evidence_items').select('id', { count: 'exact', head: true }).eq('case_id', caseId),
        supabase.from('case_risk_scores').select('overall_score, deadline_risk, response_risk, evidence_risk, activity_risk').eq('case_id', caseId).order('computed_at', { ascending: false }).limit(1).single(),
        supabase.from('motions').select('id', { count: 'exact', head: true }).eq('case_id', caseId).eq('status', 'filed'),
        supabase.from('discovery_packs').select('id').eq('case_id', caseId).eq('status', 'served').limit(1),
      ])

    if (caseResult.error) return NextResponse.json({ error: 'Case not found' }, { status: 404 })

    const caseData = caseResult.data
    const allTasks = tasksResult.data ?? []
    const completed = allTasks.filter((t) => t.status === 'completed')
    const pending = allTasks.filter((t) => ['todo', 'in_progress', 'needs_review'].includes(t.status))
    const locked = allTasks.filter((t) => t.status === 'locked')

    // Check cache
    const { data: cached } = await supabase
      .from('ai_cache')
      .select('content, generated_at')
      .eq('case_id', caseId)
      .eq('cache_key', CACHE_KEY)
      .single()

    if (cached) {
      const ageDays = (Date.now() - new Date(cached.generated_at).getTime()) / (1000 * 60 * 60 * 24)
      if (ageDays < STALE_DAYS) {
        return NextResponse.json({
          ...cached.content,
          _meta: { source: 'cached', generated_at: cached.generated_at },
        })
      }
    }

    // Static fallback
    const evidenceCount = evidenceResult.count ?? 0
    let result = buildStaticStrategy({
      tasks_completed: completed.length,
      tasks_total: allTasks.length,
      has_evidence: evidenceCount > 0,
      has_deadlines: (deadlinesResult.data ?? []).length > 0,
    })
    let source: 'ai' | 'static' = 'static'

    const daysSinceCreation = Math.round(
      (Date.now() - new Date(caseData.created_at).getTime()) / (1000 * 60 * 60 * 24)
    )

    const risk = riskResult.data

    // Try Claude
    try {
      const anthropic = new Anthropic()
      const prompt = buildStrategyPrompt({
        court_type: caseData.court_type ?? 'unknown',
        dispute_type: caseData.dispute_type,
        role: caseData.role ?? 'plaintiff',
        completed_tasks: completed.map((t) => t.task_key),
        pending_tasks: pending.map((t) => t.task_key),
        locked_tasks: locked.map((t) => t.task_key),
        upcoming_deadlines: (deadlinesResult.data ?? []).map((d) => ({ key: d.key, due_at: d.due_at })),
        evidence_count: evidenceCount,
        risk_score: risk?.overall_score ?? null,
        risk_areas: risk
          ? [
              { area: 'deadline', score: risk.deadline_risk },
              { area: 'response', score: risk.response_risk },
              { area: 'evidence', score: risk.evidence_risk },
              { area: 'activity', score: risk.activity_risk },
            ]
          : [],
        motions_filed: motionsResult.count ?? 0,
        discovery_served: (discoveryResult.data ?? []).length > 0,
        days_since_creation: daysSinceCreation,
      })

      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: prompt.system,
        messages: [{ role: 'user', content: prompt.user }],
      })

      const text = message.content
        .filter((block) => block.type === 'text')
        .map((block) => block.text)
        .join('\n')

      // Extract JSON from response (may be wrapped in markdown code blocks)
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        const validated = strategyRecommendationSchema.safeParse(parsed)
        if (validated.success) {
          const allText = validated.data.recommendations.map((r) => `${r.title} ${r.body}`).join(' ')
          if (isStrategySafe(allText)) {
            result = validated.data
            source = 'ai'
          }
        }
      }
    } catch (err) {
      safeError('strategy', err)
    }

    // Cache
    await supabase
      .from('ai_cache')
      .upsert({
        case_id: caseId,
        cache_key: CACHE_KEY,
        content: result,
        generated_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + STALE_DAYS * 24 * 60 * 60 * 1000).toISOString(),
      }, { onConflict: 'case_id,cache_key' })

    // Audit
    await supabase.from('task_events').insert({
      case_id: caseId,
      kind: 'strategy_generated',
      payload: { source, recommendation_count: result.recommendations.length },
    })

    return NextResponse.json({ ...result, _meta: { source } })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
