import { NextRequest, NextResponse } from 'next/server'
import { AIClient } from '@/lib/ai/client'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { checkDistributedRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/security/rate-limit'
import { incrementAiUsage } from '@/lib/subscription/check'
import { applyProSeGuardrails } from '@/lib/ai/litigation-legal/pro-se-adapter'
import { safeError } from '@/lib/security/safe-log'
import {
  settlementValuationSchema,
  SETTLEMENT_VALUATION_SYSTEM_PROMPT,
  buildSettlementValuationPrompt,
  buildStaticSettlementValuation,
} from '@/lib/ai/settlement-valuation'

export const maxDuration = 30

const CACHE_KEY = 'settlement_value'
const STALE_HOURS = 48

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

    const [caseResult, riskResult, tasksResult, evidenceResult, deadlinesResult, cachedResult] =
      await Promise.all([
        supabase
          .from('cases')
          .select('dispute_type, state, role, name, opposing_party')
          .eq('id', caseId)
          .single(),
        supabase
          .from('case_risk_scores')
          .select('overall_score')
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
          .from('deadlines')
          .select('id', { count: 'exact', head: true })
          .eq('case_id', caseId)
          .gte('due_date', new Date().toISOString().slice(0, 10)),
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

    const tasks = tasksResult.data ?? []
    const tasksCompleted = tasks.filter(
      (t) => t.status === 'completed' || t.status === 'skipped'
    ).length

    let result = buildStaticSettlementValuation()
    let source: 'ai' | 'static' = 'static'

    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const userPrompt = buildSettlementValuationPrompt({
          dispute_type: caseResult.data.dispute_type,
          state: caseResult.data.state,
          role: caseResult.data.role,
          case_name: caseResult.data.name,
          opposing_party: caseResult.data.opposing_party,
          overall_score: riskResult.data?.overall_score ?? 0,
          evidence_count: evidenceResult.count ?? 0,
          tasks_completed: tasksCompleted,
          upcoming_deadlines: deadlinesResult.count ?? 0,
        })

        const client = new AIClient({ model: 'claude-haiku-4-5-20251001', maxRetries: 1 })
        const { raw } = await client.complete({
          systemPrompt: SETTLEMENT_VALUATION_SYSTEM_PROMPT,
          userPrompt,
          temperature: 0.3,
          jsonMode: true,
          caller: 'settlement-value',
        })

        if (raw) {
          const safeRaw = applyProSeGuardrails(raw)
          const parsed = JSON.parse(safeRaw)
          const validated = settlementValuationSchema.safeParse(parsed)
          if (validated.success) {
            result = validated.data
            source = 'ai'
          }
        }
      } catch (err) {
        safeError('settlement-value', err)
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
    safeError('settlement-value', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
