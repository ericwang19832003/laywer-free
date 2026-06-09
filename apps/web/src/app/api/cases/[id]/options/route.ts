import { NextRequest, NextResponse } from 'next/server'
import { AIClient } from '@/lib/ai/client'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import {
  optionsAdvisorSchema,
  isOptionsAdvisorSafe,
  buildStaticOptionsAdvisor,
  buildOptionsAdvisorPrompt,
  OPTIONS_ADVISOR_SYSTEM_PROMPT,
} from '@/lib/ai/options-advisor'
import { safeError } from '@/lib/security/safe-log'
import { checkDistributedRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/security/rate-limit'

export const maxDuration = 45

const CACHE_KEY = 'options_advisor'
const STALE_HOURS = 24

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const force = request.nextUrl.searchParams.get('force') === 'true'

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

    // Fetch all context in parallel
    const [caseResult, tasksResult, evidenceResult, deadlinesResult] = await Promise.all([
      supabase
        .from('cases')
        .select('dispute_type, jurisdiction, court_type')
        .eq('id', caseId)
        .single(),
      supabase
        .from('tasks')
        .select('task_key, status, metadata')
        .eq('case_id', caseId)
        .neq('status', 'locked'),
      supabase
        .from('evidence_items')
        .select('id', { count: 'exact', head: true })
        .eq('case_id', caseId),
      supabase
        .from('deadlines')
        .select('key, due_at')
        .eq('case_id', caseId)
        .gte('due_at', new Date().toISOString())
        .order('due_at', { ascending: true })
        .limit(5),
    ])

    if (caseResult.error || !caseResult.data) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    const caseData = caseResult.data
    const disputeType = caseData.dispute_type ?? 'other'
    const allTasks = tasksResult.data ?? []
    const evidenceCount = evidenceResult.count ?? 0
    const upcomingDeadlines = deadlinesResult.data ?? []

    const completedTasks = allTasks
      .filter((t) => t.status === 'completed' || t.status === 'skipped')
      .map((t) => t.task_key)
    const pendingTasks = allTasks
      .filter((t) => ['todo', 'in_progress', 'needs_review'].includes(t.status))
      .map((t) => t.task_key)

    // Next task: first pending, ordered by task position in workflow
    const nextTaskKey = pendingTasks[0] ?? null

    // Flatten guided_answers from all task metadata
    const guidedAnswers: Record<string, string> = {}
    for (const task of allTasks) {
      const meta = task.metadata as Record<string, unknown> | null
      const answers = meta?.guided_answers as Record<string, string> | undefined
      if (answers && typeof answers === 'object') {
        Object.assign(guidedAnswers, answers)
      }
    }

    // Check cache (skipped if force=true)
    if (!force) {
      const { data: cached } = await supabase
        .from('ai_cache')
        .select('content, generated_at')
        .eq('case_id', caseId)
        .eq('cache_key', CACHE_KEY)
        .single()

      if (cached) {
        const ageMs = Date.now() - new Date(cached.generated_at).getTime()
        if (ageMs < STALE_HOURS * 60 * 60 * 1000) {
          return NextResponse.json({
            ...(cached.content as object),
            _meta: { source: 'cached', generated_at: cached.generated_at },
          })
        }
      }
    }

    // Static fallback
    let result = buildStaticOptionsAdvisor(disputeType, completedTasks, pendingTasks)
    let source: 'ai' | 'static' = 'static'

    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const client = new AIClient({ model: 'claude-sonnet-4-6' })

        const userPrompt = buildOptionsAdvisorPrompt({
          disputeType,
          jurisdiction: caseData.jurisdiction ?? 'TX',
          courtType: caseData.court_type ?? 'unknown',
          completedTasks,
          pendingTasks,
          nextTaskKey,
          guidedAnswers,
          evidenceCount,
          upcomingDeadlines: upcomingDeadlines as { key: string; due_at: string }[],
        })

        const { raw } = await client.complete({
          systemPrompt: OPTIONS_ADVISOR_SYSTEM_PROMPT,
          userPrompt,
          maxTokens: 2048,
          jsonMode: true,
          caller: 'options-advisor',
        })

        if (raw) {
          const parsed = JSON.parse(raw)
          const validated = optionsAdvisorSchema.safeParse(parsed)
          if (validated.success) {
            const allText = validated.data.decisions
              .flatMap((d) => [
                d.question,
                d.context,
                ...d.options.flatMap((o) => [o.name, o.description, ...o.pros, ...o.cons]),
              ])
              .join(' ')
            if (isOptionsAdvisorSafe(allText)) {
              result = validated.data
              source = 'ai'
            }
          }
        }
      } catch (err) {
        safeError('options-advisor', err)
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
    safeError('options-advisor', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
