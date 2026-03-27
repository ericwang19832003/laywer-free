import { createClient } from '@/lib/supabase/server'
import { ConfidenceScoreCard } from '@/components/dashboard/confidence-score-card'
import { computeConfidenceScore } from '@/lib/confidence/compute'
import { CaseComparisonCard } from '@/components/dashboard/case-comparison-card'
import { InsightsCard } from '@/components/dashboard/insights-card'
import { StrategyCard } from '@/components/dashboard/strategy-card'
import { TimelineCard } from '@/components/dashboard/timeline-card'
import { PriorityBanners } from '@/components/dashboard/priority-banners'
import type { SharedCaseData } from './types'

export async function OverviewTab({ caseId, disputeType, jurisdiction, courtType, county, createdAt }: Omit<SharedCaseData, 'outcome'>) {
  try {
  const supabase = await createClient()

  const [confidenceResult, insightsResult, strategyResult, timelineSummaryResult, dashboardResult, evidenceResult] = await Promise.all([
    computeConfidenceScore(supabase, caseId),
    supabase
      .from('case_insights')
      .select('id, insight_type, title, body, priority, created_at')
      .eq('case_id', caseId)
      .eq('dismissed', false)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase.from('ai_cache').select('content, generated_at').eq('case_id', caseId).eq('cache_key', 'strategy').single(),
    supabase.from('ai_cache').select('content').eq('case_id', caseId).eq('cache_key', 'timeline_summary').single(),
    supabase.rpc('get_case_dashboard', { p_case_id: caseId }),
    supabase.from('evidence_items').select('id', { count: 'exact', head: true }).eq('case_id', caseId),
  ])

  const strategyRecs = (strategyResult.data?.content as { recommendations: { title: string; body: string; priority: string }[] } | null)?.recommendations ?? null
  const timelineSummary = timelineSummaryResult.data?.content as { summary: string; key_milestones: string[] } | null

  const dashboard = dashboardResult.data as { tasks_summary: Record<string, number>; recent_events: Array<{ id: string; kind: string; payload: Record<string, unknown>; created_at: string; task_title?: string }> } | null
  const tasksSummary = dashboard?.tasks_summary ?? {}
  const totalTasks = Object.values(tasksSummary).reduce((s: number, v) => s + (v as number), 0)
  const completedTasks = (tasksSummary.completed as number ?? 0) + (tasksSummary.skipped as number ?? 0)
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  const daysSinceCreation = createdAt ? Math.ceil((Date.now() - new Date(createdAt).getTime()) / 86400000) : 0

  return (
    <div className="space-y-6">
      <ConfidenceScoreCard score={confidenceResult.score} breakdown={confidenceResult.breakdown} />
      <CaseComparisonCard
        taskCompletionRate={taskCompletionRate}
        evidenceCount={evidenceResult.count ?? 0}
        daysSinceCreation={daysSinceCreation}
        disputeType={disputeType}
      />
      <InsightsCard caseId={caseId} initialInsights={insightsResult.data ?? []} />
      <StrategyCard
        caseId={caseId}
        recommendations={strategyRecs}
        generatedAt={strategyResult.data?.generated_at ?? null}
      />
      <PriorityBanners
        caseId={caseId}
        disputeType={disputeType}
        jurisdiction={jurisdiction}
        courtType={courtType}
        county={county}
        placement="overview"
      />
      <TimelineCard caseId={caseId} events={dashboard?.recent_events ?? []} summary={timelineSummary} />
    </div>
  )
  } catch (error) {
    console.error('OverviewTab error:', error)
    return (
      <div className="rounded-xl border border-warm-border bg-white p-6 text-center">
        <p className="text-warm-text font-medium mb-2">Something went wrong loading this tab.</p>
        <p className="text-sm text-warm-muted mb-4">Your case data is safe. Try refreshing the page.</p>
      </div>
    )
  }
}
