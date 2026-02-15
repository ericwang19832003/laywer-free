import { createClient } from '@/lib/supabase/server'
import { SupportiveHeader } from '@/components/layout/supportive-header'
import { LegalDisclaimer } from '@/components/layout/legal-disclaimer'
import { NextStepCard } from '@/components/dashboard/next-step-card'
import { DeadlinesCard } from '@/components/dashboard/deadlines-card'
import { ProgressCard } from '@/components/dashboard/progress-card'
import { TimelineCard } from '@/components/dashboard/timeline-card'

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

  const { data, error } = await supabase.rpc('get_case_dashboard', {
    p_case_id: id,
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
          <NextStepCard caseId={id} nextTask={dashboard.next_task} />
          <DeadlinesCard caseId={id} deadlines={dashboard.upcoming_deadlines} />
          <ProgressCard tasksSummary={dashboard.tasks_summary} />
          <TimelineCard events={dashboard.recent_events} />
        </div>

        <LegalDisclaimer />
      </main>
    </div>
  )
}
