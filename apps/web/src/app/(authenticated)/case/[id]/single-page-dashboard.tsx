import { createClient } from '@/lib/supabase/server'
import { NextStepCard } from '@/components/dashboard/next-step-card'
import { DeadlinesCard } from '@/components/dashboard/deadlines-card'
import { ProgressCard } from '@/components/dashboard/progress-card'
import { PriorityAlertsSection } from '@/components/dashboard/priority-alerts-section'
import { InsightsCard } from '@/components/dashboard/insights-card'
import { StrategyCard } from '@/components/dashboard/strategy-card'
import { PriorityBanners } from '@/components/dashboard/priority-banners'
import ProSeBanner from '@/components/dashboard/pro-se-banner'
import { BackfillBanner } from '@/components/dashboard/backfill-banner'
import { OutcomePrompt } from '@/components/dashboard/outcome-prompt'
import { SavingsCard } from '@/components/dashboard/savings-card'
import { CaseStatusStrip } from '@/components/dashboard/case-status-strip'
import type { ReminderEscalation } from '@lawyer-free/shared/schemas/reminder-escalation'
import type { DashboardData, SharedCaseData } from './types'

export async function SinglePageDashboard({
  caseId,
  disputeType,
  jurisdiction,
  courtType,
  county,
  outcome,
  createdAt,
}: SharedCaseData) {
  try {
    const supabase = await createClient()

    const dashboardResult = await supabase.rpc('get_case_dashboard', { p_case_id: caseId })
    const dashboard = dashboardResult.data as DashboardData | null

    const [
      escalationResult,
      riskScoreResult,
      insightsResult,
      strategyResult,
      taskDescResult,
      skippedResult,
    ] = await Promise.all([
      supabase
        .from('reminder_escalations')
        .select('id, case_id, deadline_id, escalation_level, message, triggered_at, deadlines(due_at, key)')
        .eq('case_id', caseId)
        .eq('acknowledged', false)
        .order('escalation_level', { ascending: false })
        .order('triggered_at', { ascending: false }),
      supabase
        .from('case_risk_scores')
        .select('risk_level')
        .eq('case_id', caseId)
        .order('computed_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('case_insights')
        .select('id, insight_type, title, body, priority, created_at')
        .eq('case_id', caseId)
        .eq('dismissed', false)
        .order('created_at', { ascending: false })
        .limit(3),
      supabase
        .from('ai_cache')
        .select('content, generated_at')
        .eq('case_id', caseId)
        .eq('cache_key', 'strategy')
        .single(),
      dashboard?.next_task
        ? supabase.from('tasks').select('metadata').eq('id', dashboard.next_task.id).single()
        : Promise.resolve({ data: null }),
      supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('case_id', caseId)
        .eq('status', 'skipped'),
    ])

    if (!dashboard) {
      return (
        <div className="rounded-xl border border-warm-border bg-white p-6 text-center">
          <p className="text-warm-text font-medium mb-2">Dashboard data unavailable.</p>
          <p className="text-sm text-warm-muted">Try refreshing the page.</p>
        </div>
      )
    }

    const taskMeta = taskDescResult.data?.metadata as Record<string, unknown> | null
    const taskDescription =
      (taskMeta?.ai_description as
        | { description: string; importance: 'critical' | 'important' | 'helpful' }
        | undefined) ?? null

    const alerts: ReminderEscalation[] = (escalationResult.data ?? []).map(
      (row: Record<string, unknown>) => {
        const deadline = row.deadlines as { due_at: string; key: string } | null
        return {
          id: row.id as string,
          case_id: row.case_id as string,
          deadline_id: (row.deadline_id as string | null) ?? null,
          escalation_level: row.escalation_level as number,
          message: row.message as string,
          triggered_at: row.triggered_at as string,
          due_at: deadline?.due_at ?? '',
          deadline_key: deadline?.key ?? '',
        }
      }
    )

    const strategyRecs =
      (
        strategyResult.data?.content as {
          recommendations: { title: string; body: string; priority: string }[]
        } | null
      )?.recommendations?.slice(0, 3) ?? null

    const tasksSummary = dashboard.tasks_summary ?? {}
    const totalTasks = Object.values(tasksSummary).reduce((s: number, v) => s + (v as number), 0)
    const completedTasks =
      (tasksSummary.completed as number ?? 0) + (tasksSummary.skipped as number ?? 0)

    return (
      <div className="space-y-6">
        {/* 1. Today's Action */}
        <NextStepCard
          caseId={caseId}
          nextTask={dashboard.next_task}
          taskDescription={taskDescription}
        />

        {/* 2. Case Status Strip */}
        <CaseStatusStrip
          upcomingDeadlines={dashboard.upcoming_deadlines}
          tasksSummary={tasksSummary}
          riskLevel={riskScoreResult.data?.risk_level}
        />

        {/* Priority alerts (urgent, stays near top) */}
        <PriorityAlertsSection caseId={caseId} alerts={alerts} />

        <PriorityBanners
          caseId={caseId}
          disputeType={disputeType}
          jurisdiction={jurisdiction}
          courtType={courtType}
          county={county}
          placement="focus"
        />

        {/* 3. Insights & Recommendations */}
        <InsightsCard caseId={caseId} initialInsights={insightsResult.data ?? []} />
        <StrategyCard
          caseId={caseId}
          recommendations={strategyRecs}
          generatedAt={strategyResult.data?.generated_at ?? null}
        />

        {/* 4. Deadlines */}
        <DeadlinesCard caseId={caseId} deadlines={dashboard.upcoming_deadlines} />

        {/* 5. Progress */}
        <ProgressCard tasksSummary={dashboard.tasks_summary} />

        <ProSeBanner />
        <BackfillBanner caseId={caseId} skippedCount={skippedResult.count ?? 0} />
        <OutcomePrompt
          caseId={caseId}
          currentOutcome={outcome}
          allTasksDone={totalTasks > 0 && completedTasks === totalTasks}
        />
        <SavingsCard disputeType={disputeType} outcome={outcome} userTier="free" />
      </div>
    )
  } catch (error) {
    console.error('SinglePageDashboard error:', error)
    return (
      <div className="rounded-xl border border-warm-border bg-white p-6 text-center">
        <p className="text-warm-text font-medium mb-2">Something went wrong loading the dashboard.</p>
        <p className="text-sm text-warm-muted mb-4">Your case data is safe. Try refreshing the page.</p>
      </div>
    )
  }
}
