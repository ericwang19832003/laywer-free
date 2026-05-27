import { createClient } from '@/lib/supabase/server'
import { NextStepCard } from '@/components/dashboard/next-step-card'
import { DeadlinesCard } from '@/components/dashboard/deadlines-card'
import { ProgressCard } from '@/components/dashboard/progress-card'
import ProSeBanner from '@/components/dashboard/pro-se-banner'
import { BackfillBanner } from '@/components/dashboard/backfill-banner'
import { OutcomePrompt } from '@/components/dashboard/outcome-prompt'
import { SavingsCard } from '@/components/dashboard/savings-card'
import type { DashboardData, SharedCaseData } from './types'

export async function FocusTab({
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
      taskDescResult,
      skippedResult,
    ] = await Promise.all([
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

        {/* 2. Deadlines */}
        <DeadlinesCard caseId={caseId} deadlines={dashboard.upcoming_deadlines} />

        {/* 3. Progress */}
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
    console.error('FocusTab error:', error)
    return (
      <div className="rounded-xl border border-warm-border bg-white p-6 text-center">
        <p className="text-warm-text font-medium mb-2">Something went wrong loading the dashboard.</p>
        <p className="text-sm text-warm-muted mb-4">Your case data is safe. Try refreshing the page.</p>
      </div>
    )
  }
}
