import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { SupportiveHeader } from '@/components/layout/supportive-header'
import { LegalDisclaimer } from '@/components/layout/legal-disclaimer'
import { CaseStatusStrip } from '@/components/dashboard/case-status-strip'
import { PriorityAlertsSection } from '@/components/dashboard/priority-alerts-section'
import { PriorityBanners } from '@/components/dashboard/priority-banners'
import { DashboardTabs } from '@/components/dashboard/dashboard-tabs'
import { FocusTab } from './focus-tab'
import { OverviewTab } from './overview-tab'
import { ToolsTab } from './tools-tab'
import { TabSkeleton } from './tab-skeleton'
import type { ReminderEscalation } from '@lawyer-free/shared/schemas/reminder-escalation'

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: caseRow, error } = await supabase
    .from('cases')
    .select('dispute_type, jurisdiction, court_type, county, created_at, outcome')
    .eq('id', id)
    .single()

  if (error || !caseRow) {
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

  const shared = {
    caseId: id,
    disputeType: caseRow.dispute_type ?? 'other',
    jurisdiction: caseRow.jurisdiction ?? 'TX',
    courtType: caseRow.court_type ?? 'unknown',
    county: caseRow.county ?? null,
    outcome: caseRow.outcome ?? null,
    createdAt: caseRow.created_at ?? null,
  }

  const [escalationResult, riskScoreResult, tasksResult, upcomingDeadlinesResult] =
    await Promise.all([
      supabase
        .from('reminder_escalations')
        .select(
          'id, case_id, deadline_id, escalation_level, message, triggered_at, deadlines(due_at, key)'
        )
        .eq('case_id', id)
        .eq('acknowledged', false)
        .order('escalation_level', { ascending: false })
        .order('triggered_at', { ascending: false }),
      supabase
        .from('case_risk_scores')
        .select('risk_level')
        .eq('case_id', id)
        .order('computed_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase.from('tasks').select('status').eq('case_id', id),
      supabase
        .from('deadlines')
        .select('due_at, label')
        .eq('case_id', id)
        .gte('due_at', new Date().toISOString())
        .order('due_at', { ascending: true })
        .limit(3),
    ])

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

  const tasksSummary: Record<string, number> = (tasksResult.data ?? []).reduce(
    (acc: Record<string, number>, task: { status: string }) => {
      acc[task.status] = (acc[task.status] ?? 0) + 1
      return acc
    },
    {}
  )

  const upcomingDeadlines = (upcomingDeadlinesResult.data ?? []) as Array<{
    due_at: string
    label: string | null
  }>

  return (
    <div className="bg-warm-bg min-h-full">
      <main className="mx-auto max-w-2xl px-4 py-10">
        <SupportiveHeader
          title="One step at a time."
          subtitle="You're in control. We'll guide the process and track deadlines."
        />

        <div className="space-y-4 mb-6">
          <CaseStatusStrip
            upcomingDeadlines={upcomingDeadlines}
            tasksSummary={tasksSummary}
            riskLevel={riskScoreResult.data?.risk_level}
          />
          <PriorityAlertsSection caseId={id} alerts={alerts} />
          <PriorityBanners
            caseId={id}
            disputeType={shared.disputeType}
            jurisdiction={shared.jurisdiction}
            courtType={shared.courtType}
            county={shared.county}
            placement="focus"
          />
        </div>

        <DashboardTabs
          focus={
            <Suspense fallback={<TabSkeleton />}>
              <FocusTab {...shared} />
            </Suspense>
          }
          overview={
            <Suspense fallback={<TabSkeleton />}>
              <OverviewTab caseId={id} />
            </Suspense>
          }
          tools={
            <Suspense fallback={<TabSkeleton />}>
              <ToolsTab caseId={id} />
            </Suspense>
          }
        />

        <LegalDisclaimer />
      </main>
    </div>
  )
}
