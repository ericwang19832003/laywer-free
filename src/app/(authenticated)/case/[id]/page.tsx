import { createClient } from '@/lib/supabase/server'
import { SupportiveHeader } from '@/components/layout/supportive-header'
import { LegalDisclaimer } from '@/components/layout/legal-disclaimer'
import { NextStepCard } from '@/components/dashboard/next-step-card'
import { DeadlinesCard } from '@/components/dashboard/deadlines-card'
import { ProgressCard } from '@/components/dashboard/progress-card'
import { TimelineCard } from '@/components/dashboard/timeline-card'
import { PriorityAlertsSection } from '@/components/dashboard/priority-alerts-section'
import { CaseHealthCard } from '@/components/dashboard/case-health-card'
import { ConfidenceScoreCard } from '@/components/dashboard/confidence-score-card'
import { computeConfidenceScore } from '@/lib/confidence/compute'
import { CaseComparisonCard } from '@/components/dashboard/case-comparison-card'
import { InsightsCard } from '@/components/dashboard/insights-card'
import { StrategyCard } from '@/components/dashboard/strategy-card'
import { DiscoveryCard } from '@/components/dashboard/discovery-card'
import { ResearchCard } from '@/components/dashboard/research-card'
import { EmailsCard } from '@/components/dashboard/emails-card'
import { NotesCard } from '@/components/dashboard/notes-card'
import { ShareCaseCard } from '@/components/dashboard/share-case-card'
import { DeleteCaseCard } from '@/components/dashboard/delete-case-card'
import { OutcomePrompt } from '@/components/dashboard/outcome-prompt'
import { SavingsCard } from '@/components/dashboard/savings-card'
import { MoreSection } from '@/components/dashboard/more-section'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import ProSeBanner from '@/components/dashboard/pro-se-banner'
import { SolBanner } from '@/components/dashboard/sol-banner'
import { FilingInstructionsCard } from '@/components/dashboard/filing-instructions-card'
import { calculateSol } from '@/lib/rules/statute-of-limitations'
import { getPriorityCards } from '@/lib/dashboard-card-priority'
import { BackfillBanner } from '@/components/dashboard/backfill-banner'
import { CaseFileCard } from '@/components/dashboard/case-file-card'
import Link from 'next/link'
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
    label: string | null
    consequence: string | null
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
      .select('id, overall_score')
      .eq('case_id', id)
      .lte('computed_at', sevenDaysAgo)
      .order('computed_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('case_risk_scores')
      .select('id, overall_score')
      .eq('case_id', id)
      .lte('computed_at', thirtyDaysAgo)
      .order('computed_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  // Compute confidence score
  const confidenceResult = await computeConfidenceScore(supabase, id)

  // Case comparison data
  const { data: caseRow } = await supabase
    .from('cases')
    .select('dispute_type, jurisdiction, court_type, county, created_at, outcome')
    .eq('id', id)
    .single()

  // SOL: find incident_date from intake task metadata
  const intakeKeys = [
    'pi_intake', 'small_claims_intake', 'lt_intake', 'family_intake',
    'contract_intake', 'property_dispute_intake', 'other_dispute_intake',
    're_intake', 'business_intake', 'intake', 'debt_defense_intake',
  ]
  const { data: intakeTask } = await supabase
    .from('tasks')
    .select('metadata')
    .eq('case_id', id)
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

  const rawSol = calculateSol(
    caseRow?.jurisdiction ?? 'TX',
    caseRow?.dispute_type ?? 'other',
    null,
    incidentDate,
  )
  // Serialize Date → ISO string for client component
  const solResult = {
    ...rawSol,
    expiresAt: rawSol.expiresAt?.toISOString() ?? null,
  }

  // Case insights
  const { data: insightsData } = await supabase
    .from('case_insights')
    .select('id, insight_type, title, body, priority, created_at')
    .eq('case_id', id)
    .eq('dismissed', false)
    .order('created_at', { ascending: false })
    .limit(5)

  const { data, error } = dashboardResult
  const { data: escalationData } = escalationResult
  const { data: riskScoreData } = riskScoreResult
  // Exclude historical scores that are the same row as the current score (stale case)
  const { data: raw7d } = score7dResult
  const { data: raw30d } = score30dResult
  const score7dData = raw7d && riskScoreData && raw7d.id !== riskScoreData.id ? raw7d : null
  const score30dData = raw30d && riskScoreData && raw30d.id !== riskScoreData.id ? raw30d : null

  const alerts: ReminderEscalation[] = (escalationData ?? []).map((row: Record<string, unknown>) => {
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

  // Discovery card data
  const { data: discoveryTaskRow } = await supabase
    .from('tasks')
    .select('id, status')
    .eq('case_id', id)
    .eq('task_key', 'discovery_starter_pack')
    .maybeSingle()

  let discoveryPackCount = 0
  let discoveryServedCount = 0
  let discoveryItemCount = 0

  if (discoveryTaskRow?.status === 'completed') {
    const { data: packs } = await supabase
      .from('discovery_packs')
      .select('id, status')
      .eq('case_id', id)

    const packList = packs ?? []
    discoveryPackCount = packList.length
    discoveryServedCount = packList.filter((p: { status: string }) => p.status === 'served').length

    if (packList.length > 0) {
      const { count } = await supabase
        .from('discovery_items')
        .select('id', { count: 'exact', head: true })
        .in('pack_id', packList.map((p: { id: string }) => p.id))

      discoveryItemCount = count ?? 0
    }
  }

  // Motion tasks + motions count
  const motionTaskKeys = ['motion_to_compel', 'trial_prep_checklist', 'appellate_brief']
  const { data: motionTaskRows } = await supabase
    .from('tasks')
    .select('id, task_key, title, status')
    .eq('case_id', id)
    .in('task_key', motionTaskKeys)

  const motionTasks = motionTaskRows ?? []

  const { count: motionsCount } = await supabase
    .from('motions')
    .select('*', { count: 'exact', head: true })
    .eq('case_id', id)

  const hasMotionActivity = motionTasks.some(t => t.status !== 'locked') || (motionsCount ?? 0) > 0

  // Case notes
  const { data: caseNotes } = await supabase
    .from('case_notes')
    .select('id, content, pinned, created_at, updated_at')
    .eq('case_id', id)
    .order('pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(10)

  // Share data
  const { data: shareData } = await supabase
    .from('cases')
    .select('share_token, share_enabled')
    .eq('id', id)
    .single()

  // Research / legal authorities count
  const { count: authorityCount } = await supabase
    .from('case_authorities')
    .select('id', { count: 'exact', head: true })
    .eq('case_id', id)

  // Skipped tasks count (for backfill banner)
  const { count: skippedCount } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('case_id', id)
    .eq('status', 'skipped')

  // Case file counts
  const { count: evidenceCount } = await supabase
    .from('evidence_items')
    .select('id', { count: 'exact', head: true })
    .eq('case_id', id)

  const { count: binderCount } = await supabase
    .from('trial_binders')
    .select('id', { count: 'exact', head: true })
    .eq('case_id', id)

  // AI cache fetches
  const dashboard = data as DashboardData | null
  const [taskDescResult, timelineSummaryResult, healthTipsResult, strategyResult] = await Promise.all([
    // Task description for next task
    dashboard?.next_task
      ? supabase.from('tasks').select('metadata').eq('id', dashboard.next_task.id).single()
      : Promise.resolve({ data: null }),
    // Timeline summary cache
    supabase.from('ai_cache').select('content').eq('case_id', id).eq('cache_key', 'timeline_summary').single(),
    // Health tips cache
    supabase.from('ai_cache').select('content').eq('case_id', id).eq('cache_key', 'health_tips').single(),
    // Strategy cache
    supabase.from('ai_cache').select('content, generated_at').eq('case_id', id).eq('cache_key', 'strategy').single(),
  ])

  const taskMeta = taskDescResult.data?.metadata as Record<string, unknown> | null
  const taskDescription = (taskMeta?.ai_description as { description: string; importance: 'critical' | 'important' | 'helpful' } | undefined) ?? null

  const timelineSummary = timelineSummaryResult.data?.content as { summary: string; key_milestones: string[] } | null

  const aiTips = (healthTipsResult.data?.content as { tips: { tip: string; area: string }[] } | null)?.tips ?? null

  const strategyRecs = (strategyResult.data?.content as { recommendations: { title: string; body: string; priority: string }[] } | null)?.recommendations ?? null

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

  const tasksSummary = (data as DashboardData)?.tasks_summary ?? {}
  const totalTasks = Object.values(tasksSummary).reduce((s: number, v) => s + (v as number), 0)
  const completedTasks = (tasksSummary.completed as number ?? 0) + (tasksSummary.skipped as number ?? 0)
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  const daysSinceCreation = caseRow?.created_at
    ? Math.ceil((Date.now() - new Date(caseRow.created_at).getTime()) / 86400000)
    : 0

  // Focus Mode: all dispute types get a streamlined priority dashboard with "More" section
  const disputeType = caseRow?.dispute_type ?? 'other'
  const priorityCards = getPriorityCards(disputeType)

  return (
    <div className="bg-warm-bg min-h-full">
      <main className="mx-auto max-w-2xl px-4 py-10">
        <SupportiveHeader
          title="One step at a time."
          subtitle="You're in control. We'll guide the process and track deadlines."
        />

        <ProSeBanner />
        <BackfillBanner caseId={id} skippedCount={skippedCount ?? 0} />

        <CaseFileCard
          caseId={id}
          evidenceCount={evidenceCount ?? 0}
          exhibitCount={0}
          discoveryPackCount={discoveryPackCount}
          binderCount={binderCount ?? 0}
        />

        <div className="space-y-6">
          {/* Priority cards — always visible */}
          <PriorityAlertsSection caseId={id} alerts={alerts} />
          {priorityCards.includes('sol_banner') && (
            <SolBanner
              caseId={id}
              sol={solResult}
              disputeType={disputeType}
              state={caseRow?.jurisdiction ?? 'TX'}
            />
          )}
          <NextStepCard caseId={id} nextTask={dashboard!.next_task} taskDescription={taskDescription} />
          <DeadlinesCard caseId={id} deadlines={dashboard!.upcoming_deadlines} />
          <ProgressCard tasksSummary={dashboard!.tasks_summary} />
          <CaseHealthCard
            caseId={id}
            riskScore={riskScoreData}
            score7DaysAgo={score7dData}
            score30DaysAgo={score30dData}
            aiTips={aiTips}
          />
          {priorityCards.includes('filing_instructions') && (
            <FilingInstructionsCard
              state={caseRow?.jurisdiction ?? 'TX'}
              courtType={caseRow?.court_type ?? 'unknown'}
              county={caseRow?.county ?? null}
              disputeType={disputeType}
            />
          )}
          <OutcomePrompt
            caseId={id}
            currentOutcome={caseRow?.outcome ?? null}
            allTasksDone={totalTasks > 0 && completedTasks === totalTasks}
          />
          <SavingsCard
            disputeType={disputeType}
            outcome={caseRow?.outcome ?? null}
            userTier="free"
          />

          {/* Secondary cards — in "More" section for all dispute types */}
          <MoreSection>
            <ConfidenceScoreCard
              score={confidenceResult.score}
              breakdown={confidenceResult.breakdown}
            />
            <CaseComparisonCard
              taskCompletionRate={taskCompletionRate}
              evidenceCount={evidenceCount ?? 0}
              daysSinceCreation={daysSinceCreation}
              disputeType={disputeType}
            />
            <InsightsCard caseId={id} initialInsights={insightsData ?? []} />
            <StrategyCard
              caseId={id}
              recommendations={strategyRecs}
              generatedAt={strategyResult.data?.generated_at ?? null}
            />
            {!priorityCards.includes('sol_banner') && (
              <SolBanner
                caseId={id}
                sol={solResult}
                disputeType={disputeType}
                state={caseRow?.jurisdiction ?? 'TX'}
              />
            )}
            {!priorityCards.includes('filing_instructions') && (
              <FilingInstructionsCard
                state={caseRow?.jurisdiction ?? 'TX'}
                courtType={caseRow?.court_type ?? 'unknown'}
                county={caseRow?.county ?? null}
                disputeType={disputeType}
              />
            )}
            <DiscoveryCard
              caseId={id}
              discoveryTask={discoveryTaskRow}
              packCount={discoveryPackCount}
              servedCount={discoveryServedCount}
              itemCount={discoveryItemCount}
            />
            <ResearchCard caseId={id} authorityCount={authorityCount ?? 0} />
            <EmailsCard caseId={id} />
            {hasMotionActivity && (
              <Card>
                <CardContent className="pt-5 pb-4 px-5">
                  <h3 className="text-sm font-semibold text-warm-text mb-3">Motions</h3>
                  {motionTasks
                    .filter(t => t.status === 'todo')
                    .map(t => (
                      <div key={t.id} className="flex items-center justify-between py-2 border-b border-warm-border last:border-0">
                        <div>
                          <span className="text-sm text-warm-text">{t.title}</span>
                          <span className="text-xs bg-calm-indigo/10 text-calm-indigo px-2 py-0.5 rounded-full ml-2">
                            Suggested
                          </span>
                        </div>
                        <Button size="sm" asChild>
                          <Link href={`/case/${id}/step/${t.id}`}>Start</Link>
                        </Button>
                      </div>
                    ))
                  }
                  {(motionsCount ?? 0) > 0 && (
                    <p className="text-xs text-warm-muted mt-2">
                      {motionsCount} motion{motionsCount !== 1 ? 's' : ''} created
                    </p>
                  )}
                  <Button variant="outline" size="sm" className="mt-3 w-full" asChild>
                    <Link href={`/case/${id}/motions`}>View Motions Hub &rarr;</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
            <NotesCard caseId={id} initialNotes={caseNotes ?? []} />
            <TimelineCard caseId={id} events={dashboard!.recent_events} summary={timelineSummary} />
            <ShareCaseCard
              caseId={id}
              initialEnabled={shareData?.share_enabled ?? false}
              initialToken={shareData?.share_token ?? null}
            />
            <DeleteCaseCard caseId={id} />
          </MoreSection>
        </div>

        <LegalDisclaimer />
      </main>
    </div>
  )
}
