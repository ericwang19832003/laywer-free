import { createClient } from '@/lib/supabase/server'
import { NextStepCard } from '@/components/dashboard/next-step-card'
import { DeadlinesCard } from '@/components/dashboard/deadlines-card'
import { ProgressCard } from '@/components/dashboard/progress-card'
import { CaseHealthCard } from '@/components/dashboard/case-health-card'
import { PriorityAlertsSection } from '@/components/dashboard/priority-alerts-section'
import ProSeBanner from '@/components/dashboard/pro-se-banner'
import { SolBanner } from '@/components/dashboard/sol-banner'
import { FilingInstructionsCard } from '@/components/dashboard/filing-instructions-card'
import { OutcomePrompt } from '@/components/dashboard/outcome-prompt'
import { SavingsCard } from '@/components/dashboard/savings-card'
import { BackfillBanner } from '@/components/dashboard/backfill-banner'
import { calculateSol } from '@/lib/rules/statute-of-limitations'
import { getPriorityCards } from '@/lib/dashboard-card-priority'
import type { ReminderEscalation } from '@lawyer-free/shared/schemas/reminder-escalation'
import type { DashboardData, SharedCaseData } from './types'

export async function FocusTab({ caseId, disputeType, jurisdiction, courtType, county, outcome, createdAt }: SharedCaseData) {
  const supabase = await createClient()

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [dashboardResult, escalationResult, riskScoreResult, score7dResult, score30dResult, skippedResult] = await Promise.all([
    supabase.rpc('get_case_dashboard', { p_case_id: caseId }),
    supabase
      .from('reminder_escalations')
      .select('id, case_id, deadline_id, escalation_level, message, triggered_at, deadlines(due_at, key)')
      .eq('case_id', caseId)
      .eq('acknowledged', false)
      .order('escalation_level', { ascending: false })
      .order('triggered_at', { ascending: false }),
    supabase
      .from('case_risk_scores')
      .select('id, overall_score, deadline_risk, response_risk, evidence_risk, activity_risk, risk_level, breakdown, computed_at')
      .eq('case_id', caseId)
      .order('computed_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('case_risk_scores')
      .select('id, overall_score')
      .eq('case_id', caseId)
      .lte('computed_at', sevenDaysAgo)
      .order('computed_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('case_risk_scores')
      .select('id, overall_score')
      .eq('case_id', caseId)
      .lte('computed_at', thirtyDaysAgo)
      .order('computed_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('case_id', caseId)
      .eq('status', 'skipped'),
  ])

  // AI cache: task description + health tips
  const dashboard = dashboardResult.data as DashboardData | null
  const [taskDescResult, healthTipsResult] = await Promise.all([
    dashboard?.next_task
      ? supabase.from('tasks').select('metadata').eq('id', dashboard.next_task.id).single()
      : Promise.resolve({ data: null }),
    supabase.from('ai_cache').select('content').eq('case_id', caseId).eq('cache_key', 'health_tips').single(),
  ])

  if (!dashboard) return null

  const taskMeta = taskDescResult.data?.metadata as Record<string, unknown> | null
  const taskDescription = (taskMeta?.ai_description as { description: string; importance: 'critical' | 'important' | 'helpful' } | undefined) ?? null
  const aiTips = (healthTipsResult.data?.content as { tips: { tip: string; area: string }[] } | null)?.tips ?? null

  const { data: riskScoreData } = riskScoreResult
  const { data: raw7d } = score7dResult
  const { data: raw30d } = score30dResult
  const score7dData = raw7d && riskScoreData && raw7d.id !== riskScoreData.id ? raw7d : null
  const score30dData = raw30d && riskScoreData && raw30d.id !== riskScoreData.id ? raw30d : null

  const alerts: ReminderEscalation[] = (escalationResult.data ?? []).map((row: Record<string, unknown>) => {
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
  })

  // SOL calculation
  const intakeKeys = [
    'pi_intake', 'small_claims_intake', 'lt_intake', 'family_intake',
    'contract_intake', 'property_dispute_intake', 'other_dispute_intake',
    're_intake', 'business_intake', 'intake', 'debt_defense_intake',
  ]
  const { data: intakeTask } = await supabase
    .from('tasks')
    .select('metadata')
    .eq('case_id', caseId)
    .in('task_key', intakeKeys)
    .eq('status', 'completed')
    .limit(1)
    .maybeSingle()

  const intakeMeta = intakeTask?.metadata as Record<string, unknown> | null
  const incidentDate = (intakeMeta?.incident_date as string)
    ?? (intakeMeta?.contract_date as string)
    ?? (intakeMeta?.lease_start_date as string)
    ?? (intakeMeta?.separation_date as string)
    ?? null

  const rawSol = calculateSol(jurisdiction, disputeType, null, incidentDate)
  const solResult = { ...rawSol, expiresAt: rawSol.expiresAt?.toISOString() ?? null }

  const tasksSummary = dashboard.tasks_summary ?? {}
  const totalTasks = Object.values(tasksSummary).reduce((s: number, v) => s + (v as number), 0)
  const completedTasks = (tasksSummary.completed as number ?? 0) + (tasksSummary.skipped as number ?? 0)
  const priorityCards = getPriorityCards(disputeType)

  return (
    <div className="space-y-6">
      <ProSeBanner />
      <BackfillBanner caseId={caseId} skippedCount={skippedResult.count ?? 0} />
      <PriorityAlertsSection caseId={caseId} alerts={alerts} />
      {priorityCards.includes('sol_banner') && (
        <SolBanner caseId={caseId} sol={solResult} disputeType={disputeType} state={jurisdiction} />
      )}
      <NextStepCard caseId={caseId} nextTask={dashboard.next_task} taskDescription={taskDescription} />
      <DeadlinesCard caseId={caseId} deadlines={dashboard.upcoming_deadlines} />
      <ProgressCard tasksSummary={dashboard.tasks_summary} />
      <CaseHealthCard
        caseId={caseId}
        riskScore={riskScoreData}
        score7DaysAgo={score7dData}
        score30DaysAgo={score30dData}
        aiTips={aiTips}
      />
      {priorityCards.includes('filing_instructions') && (
        <FilingInstructionsCard state={jurisdiction} courtType={courtType} county={county} disputeType={disputeType} />
      )}
      <OutcomePrompt
        caseId={caseId}
        currentOutcome={outcome}
        allTasksDone={totalTasks > 0 && completedTasks === totalTasks}
      />
      <SavingsCard disputeType={disputeType} outcome={outcome} userTier="free" />
    </div>
  )
}
