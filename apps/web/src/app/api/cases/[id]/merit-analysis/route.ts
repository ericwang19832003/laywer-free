import { NextRequest, NextResponse } from 'next/server'
import { aiClient } from '@/lib/ai/client'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import {
  meritAnalysisSchema,
  isMeritAnalysisSafe,
  buildStaticMeritAnalysis,
  buildMeritAnalysisPrompt,
  MERIT_ANALYSIS_SYSTEM_PROMPT,
} from '@/lib/ai/merit-analysis'
import { safeError } from '@/lib/security/safe-log'
import { checkDistributedRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/security/rate-limit'

export const runtime = 'nodejs'
export const maxDuration = 45

const CACHE_KEY = 'merit_analysis'
const STALE_HOURS = 48

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase } = auth
    await supabase.from('ai_cache').delete().eq('case_id', caseId).eq('cache_key', CACHE_KEY)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Failed to clear cache' }, { status: 500 })
  }
}

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
      supabase,
      user.id,
      'ai',
      RATE_LIMITS.ai.maxRequests,
      RATE_LIMITS.ai.windowMs
    )
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs)

    // Fetch case data, tasks with guided answers, and evidence count in parallel
    const [caseResult, tasksResult, evidenceResult, cachedResult] = await Promise.all([
      supabase
        .from('cases')
        .select('dispute_type, jurisdiction, court_type')
        .eq('id', caseId)
        .single(),
      supabase
        .from('tasks')
        .select('task_key, metadata, status')
        .eq('case_id', caseId)
        .neq('status', 'locked'),
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

    const caseData = caseResult.data
    const disputeType = caseData.dispute_type ?? 'other'
    const evidenceCount = evidenceResult.count ?? 0

    // Check cache first (skip if force refresh requested)
    if (!forceRefresh && cachedResult.data) {
      const age = Date.now() - new Date(cachedResult.data.generated_at).getTime()
      if (age < STALE_HOURS * 60 * 60 * 1000) {
        return NextResponse.json({
          ...(cachedResult.data.content as object),
          _meta: { source: 'cached', generated_at: cachedResult.data.generated_at },
        })
      }
    }

    // Flatten all guided_answers from task metadata
    const allTasks = tasksResult.data ?? []
    const guidedAnswers: Record<string, string> = {}
    for (const task of allTasks) {
      const meta = task.metadata as Record<string, unknown> | null
      const answers = meta?.guided_answers as Record<string, string> | undefined
      if (answers && typeof answers === 'object') {
        Object.assign(guidedAnswers, answers)
      }
    }

    const completedCount = allTasks.filter(
      (t) => t.status === 'completed' || t.status === 'skipped'
    ).length

    // Static fallback
    let result = buildStaticMeritAnalysis(disputeType, evidenceCount)
    let source: 'ai' | 'static' = 'static'

    if (process.env.DEEPSEEK_API_KEY) {
      try {
        const userPrompt = buildMeritAnalysisPrompt({
          disputeType,
          jurisdiction: caseData.jurisdiction ?? 'TX',
          courtType: caseData.court_type ?? 'unknown',
          guidedAnswers,
          evidenceCount,
          tasksCompleted: completedCount,
          tasksTotal: allTasks.length,
        })

        const { raw } = await aiClient.complete({
          systemPrompt: MERIT_ANALYSIS_SYSTEM_PROMPT,
          userPrompt,
          temperature: 0.3,
          jsonMode: true,
          caller: 'merit-analysis',
        })

        if (raw) {
          const parsed = JSON.parse(raw)
          const validated = meritAnalysisSchema.safeParse(parsed)
          if (validated.success) {
            const allText = [
              validated.data.summary,
              ...validated.data.strengths.map((s) => `${s.element} ${s.reason}`),
              ...validated.data.gaps.map((g) => `${g.element} ${g.recommendation}`),
              ...validated.data.next_actions.map((a) => a.action),
            ].join(' ')
            if (isMeritAnalysisSafe(allText)) {
              result = validated.data
              source = 'ai'
            }
          }
        }
      } catch (err) {
        safeError('merit-analysis', err)
      }
    }

    // Cache result
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

    return NextResponse.json({ ...result, _meta: { source } })
  } catch (err) {
    safeError('merit-analysis', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
