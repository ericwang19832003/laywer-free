import { createClient } from '@/lib/supabase/server'
import { CaseHealthCard } from '@/components/dashboard/case-health-card'
import { InsightsCard } from '@/components/dashboard/insights-card'
import { StrategyCard } from '@/components/dashboard/strategy-card'
import { ConfidenceScoreCard } from '@/components/dashboard/confidence-score-card'
import { TimelineCard } from '@/components/dashboard/timeline-card'
import { CaseComparisonCard } from '@/components/dashboard/case-comparison-card'
import type { ConfidenceBreakdown } from '@/lib/confidence/types'
import type { TimelineEvent } from '@/components/dashboard/timeline-card'

interface OverviewTabProps {
  caseId: string
  disputeType: string
  createdAt: string | null
}

export async function OverviewTab({ caseId, disputeType, createdAt }: OverviewTabProps) {
  try {
    const supabase = await createClient()
    const ago7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const ago30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

    const [
      riskScoreResult,
      score7dResult,
      score30dResult,
      insightsResult,
      strategyResult,
      confidenceResult,
      eventsResult,
      tasksResult,
      evidenceResult,
    ] = await Promise.all([
      supabase
        .from('case_risk_scores')
        .select('id, overall_score, deadline_risk, response_risk, evidence_risk, activity_risk, risk_level, breakdown, computed_at')
        .eq('case_id', caseId)
        .order('computed_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('case_risk_scores')
        .select('overall_score')
        .eq('case_id', caseId)
        .lte('computed_at', ago7d)
        .order('computed_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('case_risk_scores')
        .select('overall_score')
        .eq('case_id', caseId)
        .lte('computed_at', ago30d)
        .order('computed_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('case_insights')
        .select('id, insight_type, title, body, priority, created_at')
        .eq('case_id', caseId)
        .eq('dismissed', false)
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('ai_cache')
        .select('content, generated_at')
        .eq('case_id', caseId)
        .eq('cache_key', 'strategy')
        .single(),
      supabase
        .from('case_confidence_scores')
        .select('score, breakdown')
        .eq('case_id', caseId)
        .order('computed_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('task_events')
        .select('id, kind, payload, created_at, tasks(title)')
        .eq('case_id', caseId)
        .order('created_at', { ascending: false })
        .limit(10),
      supabase
        .from('tasks')
        .select('status')
        .eq('case_id', caseId),
      supabase
        .from('evidence_items')
        .select('id', { count: 'exact', head: true })
        .eq('case_id', caseId),
    ])

    const tasks = tasksResult.data ?? []
    const totalTasks = tasks.length
    const doneTasks = tasks.filter((t) => t.status === 'completed' || t.status === 'skipped').length
    const taskCompletionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0
    const evidenceCount = evidenceResult.count ?? 0
    const daysSinceCreation = createdAt
      ? Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24))
      : 0

    const strategyRecs =
      (
        strategyResult.data?.content as {
          recommendations: { title: string; body: string; priority: string }[]
        } | null
      )?.recommendations?.slice(0, 3) ?? null

    const events: TimelineEvent[] = (eventsResult.data ?? []).map((e: Record<string, unknown>) => ({
      id: e.id as string,
      kind: e.kind as string,
      payload: e.payload as Record<string, unknown>,
      created_at: e.created_at as string,
      task_title: (e.tasks as { title: string } | null)?.title,
    }))

    return (
      <div className="space-y-6">
        <CaseHealthCard
          caseId={caseId}
          riskScore={riskScoreResult.data}
          score7DaysAgo={score7dResult.data}
          score30DaysAgo={score30dResult.data}
        />
        {confidenceResult.data && (
          <ConfidenceScoreCard
            score={confidenceResult.data.score}
            breakdown={confidenceResult.data.breakdown as ConfidenceBreakdown}
          />
        )}
        <InsightsCard caseId={caseId} initialInsights={insightsResult.data ?? []} />
        <StrategyCard
          caseId={caseId}
          recommendations={strategyRecs}
          generatedAt={strategyResult.data?.generated_at ?? null}
        />
        <TimelineCard caseId={caseId} events={events} />
        <CaseComparisonCard
          taskCompletionRate={taskCompletionRate}
          evidenceCount={evidenceCount}
          daysSinceCreation={daysSinceCreation}
          disputeType={disputeType}
        />
      </div>
    )
  } catch (error) {
    console.error('OverviewTab error:', error)
    return (
      <div className="rounded-xl border border-warm-border bg-white p-6 text-center">
        <p className="text-warm-text font-medium mb-2">Something went wrong loading this tab.</p>
        <p className="text-sm text-warm-muted">Try refreshing the page.</p>
      </div>
    )
  }
}
