import { createClient } from '@/lib/supabase/server'
import { SupportiveHeader } from '@/components/layout/supportive-header'
import { LegalDisclaimer } from '@/components/layout/legal-disclaimer'
import { NextStepCard } from '@/components/dashboard/next-step-card'
import { DeadlinesCard } from '@/components/dashboard/deadlines-card'
import { ProgressCard } from '@/components/dashboard/progress-card'
import { TimelineCard } from '@/components/dashboard/timeline-card'
import { PriorityAlertsSection } from '@/components/dashboard/priority-alerts-section'
import { CaseHealthCard } from '@/components/dashboard/case-health-card'
import type { ReminderEscalation } from '@/lib/schemas/reminder-escalation'

interface DashboardData {
  next_task: {
    id: string
    task_key: string
    title: string
    status: string
  } | null
  tasks_summary: Record<string, number>
  upcoming_deadlines: Array<{
    id: string
    key: string
    due_at: string
    source: string
  }>
  recent_events: Array<{
    id: string
    kind: string
    payload: Record<string, unknown>
    created_at: string
    task_title?: string
  }>
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [dashboardResult, escalationResult, riskScoreResult, score7dResult, score30dResult] = await Promise.all([
    supabase.rpc('get_case_dashboard', { p_case_id: id }),
    supabase
      .from('reminder_escalations')
      .select('id, case_id, deadline_id, escalation_level, message, triggered_at, deadlines(due_at, key)')
      .eq('case_id', id)
      .eq('acknowledged', false)
      .order('escalation_level', { ascending: false })
      .order('triggered_at', { ascending: false }),
    supabase
      .from('case_risk_scores')
      .select('id, overall_score, deadline_risk, response_risk, evidence_risk, activity_risk, risk_level, breakdown, computed_at')
      .eq('case_id', id)
      .order('computed_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('case_risk_scores')
      .select('overall_score')
      .eq('case_id', id)
      .lte('computed_at', sevenDaysAgo)
      .order('computed_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('case_risk_scores')
      .select('overall_score')
      .eq('case_id', id)
      .lte('computed_at', thirtyDaysAgo)
      .order('computed_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  const { data, error } = dashboardResult
  const { data: escalationData } = escalationResult
  const { data: riskScoreData } = riskScoreResult
  const { data: score7dData } = score7dResult
  const { data: score30dData } = score30dResult

  const alerts: ReminderEscalation[] = (escalationData ?? []).map((row: Record<string, unknown>) => {
    const deadline = row.deadlines as { due_at: string; key: string } | null
    return {
      id: row.id as string,
      case_id: row.case_id as string,
      deadline_id: row.deadline_id as string,
      escalation_level: row.escalation_level as number,
      message: row.message as string,
      triggered_at: row.triggered_at as string,
      due_at: deadline?.due_at ?? '',
      deadline_key: deadline?.key ?? '',
    }
  })

  if (error || data === null) {
    return (
      <div className="min-h-screen bg-warm-bg">
        <main className="mx-auto max-w-2xl px-4 py-10">
          <SupportiveHeader
            title="Case not found"
            subtitle="We couldn't find this case. It may have been removed, or you may not have access."
          />
        </main>
      </div>
    )
  }

  const dashboard = data as DashboardData

  return (
    <div className="min-h-screen bg-warm-bg">
      <main className="mx-auto max-w-2xl px-4 py-10">
        <SupportiveHeader
          title="One step at a time."
          subtitle="You're in control. We'll guide the process and track deadlines."
        />

        <div className="space-y-6">
          <PriorityAlertsSection caseId={id} alerts={alerts} />
          <NextStepCard caseId={id} nextTask={dashboard.next_task} />
          <CaseHealthCard
            caseId={id}
            riskScore={riskScoreData}
            score7DaysAgo={score7dData}
            score30DaysAgo={score30dData}
          />
          <DeadlinesCard caseId={id} deadlines={dashboard.upcoming_deadlines} />
          <ProgressCard tasksSummary={dashboard.tasks_summary} />
          <TimelineCard events={dashboard.recent_events} />
        </div>

        <LegalDisclaimer />
      </main>
    </div>
  )
}
