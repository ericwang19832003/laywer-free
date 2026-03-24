import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import {
  healthTipsSchema,
  isHealthTipsSafe,
  buildStaticHealthTips,
  buildHealthTipsPrompt,
  HEALTH_TIPS_SYSTEM_PROMPT,
} from '@/lib/ai/health-tips'
import { safeError } from '@/lib/security/safe-log'
import { checkDistributedRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/security/rate-limit'

export const runtime = 'nodejs'
export const maxDuration = 30

const AI_MODEL = 'gpt-4o-mini'
const CACHE_KEY = 'health_tips'
const STALE_HOURS = 24

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

    // Fetch case + risk score + tasks + evidence in parallel
    const [caseResult, riskResult, tasksResult, evidenceResult] = await Promise.all([
      supabase.from('cases').select('id, court_type, dispute_type').eq('id', caseId).single(),
      supabase.from('case_risk_scores').select('*').eq('case_id', caseId)
        .order('computed_at', { ascending: false }).limit(1).single(),
      supabase.from('tasks').select('status').eq('case_id', caseId),
      supabase.from('evidence_items').select('id', { count: 'exact', head: true }).eq('case_id', caseId),
    ])

    if (caseResult.error) return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    if (riskResult.error || !riskResult.data) {
      return NextResponse.json({ tips: [], _meta: { source: 'none' } })
    }

    const risk = riskResult.data

    // Check cache
    const { data: cached } = await supabase
      .from('ai_cache')
      .select('content, generated_at')
      .eq('case_id', caseId)
      .eq('cache_key', CACHE_KEY)
      .single()

    if (cached) {
      const age = Date.now() - new Date(cached.generated_at).getTime()
      if (age < STALE_HOURS * 60 * 60 * 1000) {
        return NextResponse.json({
          ...cached.content,
          _meta: { source: 'cached', generated_at: cached.generated_at },
        })
      }
    }

    // Static fallback
    let result = buildStaticHealthTips({
      deadline_risk: risk.deadline_risk,
      response_risk: risk.response_risk,
      evidence_risk: risk.evidence_risk,
      activity_risk: risk.activity_risk,
    })
    let source: 'ai' | 'static' = 'static'

    const allTasks = tasksResult.data ?? []
    const completedCount = allTasks.filter((t) => t.status === 'completed').length

    // Try AI
    if (process.env.OPENAI_API_KEY) {
      try {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
        const userPrompt = buildHealthTipsPrompt({
          overall_score: risk.overall_score,
          deadline_risk: risk.deadline_risk,
          response_risk: risk.response_risk,
          evidence_risk: risk.evidence_risk,
          activity_risk: risk.activity_risk,
          court_type: caseResult.data.court_type ?? 'unknown',
          dispute_type: caseResult.data.dispute_type,
          tasks_completed: completedCount,
          tasks_total: allTasks.length,
          evidence_count: evidenceResult.count ?? 0,
        })

        const completion = await openai.chat.completions.create({
          model: AI_MODEL,
          temperature: 0.4,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: HEALTH_TIPS_SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
          ],
        })

        const raw = completion.choices[0]?.message?.content
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

    // Cache
    await supabase
      .from('ai_cache')
      .upsert({
        case_id: caseId,
        cache_key: CACHE_KEY,
        content: result,
        generated_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + STALE_HOURS * 60 * 60 * 1000).toISOString(),
      }, { onConflict: 'case_id,cache_key' })

    return NextResponse.json({ ...result, _meta: { source } })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
