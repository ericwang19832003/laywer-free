import { createClient } from '@/lib/supabase/server'
import { WorkflowSidebar } from '@/components/case/workflow-sidebar'
import { MobileSidebarDrawer } from '@/components/case/mobile-sidebar-drawer'
import { ContextSidebar } from '@/components/case/context-sidebar'
import { MobileNav } from '@/components/layout/mobile-nav'
import { WORKFLOW_PHASES } from '@/lib/workflow-phases'
import type { SidebarTask } from '@/components/case/workflow-sidebar'

export default async function CaseLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: tasks }, { data: caseRow }, { data: deadline }, { data: riskScore }, { data: piDetails }, { data: familyDetails }, { data: businessDetails }] =
    await Promise.all([
      supabase
        .from('tasks')
        .select('id, task_key, title, status')
        .eq('case_id', id)
        .order('created_at', { ascending: true }),
      supabase
        .from('cases')
        .select('dispute_type')
        .eq('id', id)
        .single(),
      supabase
        .from('deadlines')
        .select('key, due_at')
        .eq('case_id', id)
        .gte('due_at', new Date().toISOString())
        .order('due_at', { ascending: true })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('case_risk_scores')
        .select('overall_score, risk_level, breakdown')
        .eq('case_id', id)
        .order('computed_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('personal_injury_details')
        .select('pi_sub_type')
        .eq('case_id', id)
        .maybeSingle(),
      supabase
        .from('family_case_details')
        .select('family_sub_type')
        .eq('case_id', id)
        .maybeSingle(),
      supabase
        .from('business_details')
        .select('business_sub_type')
        .eq('case_id', id)
        .maybeSingle(),
    ])

  const taskList: SidebarTask[] = (tasks ?? []).map((t) => ({
    id: t.id,
    task_key: t.task_key,
    title: t.title,
    status: t.status,
  }))

  const disputeType = caseRow?.dispute_type ?? 'civil'
  // Family and business cases use sub-type-specific phases
  const phaseKey = disputeType === 'business' && businessDetails?.business_sub_type
    ? businessDetails.business_sub_type
    : disputeType === 'family' && familyDetails?.family_sub_type
      ? familyDetails.family_sub_type
      : disputeType
  const phases = WORKFLOW_PHASES[phaseKey] ?? WORKFLOW_PHASES['civil']

  // Determine current task_key (first actionable task)
  const currentTaskKey =
    taskList.find(
      (t) => t.status === 'in_progress' || t.status === 'needs_review'
    )?.task_key ??
    taskList.find((t) => t.status === 'todo')?.task_key ??
    null

  return (
    <>
      <div className="flex min-h-[calc(100vh-3.5rem)] pb-20 md:pb-0">
        <aside className="hidden lg:block w-64 shrink-0 bg-warm-bg shadow-[1px_0_3px_0_rgba(0,0,0,0.04)] sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto">
          <WorkflowSidebar caseId={id} tasks={taskList} phases={phases} />
        </aside>

        <main className="flex-1 min-w-0 bg-warm-bg">
          {children}
        </main>

        <aside className="hidden xl:block w-72 shrink-0 bg-white shadow-[-1px_0_3px_0_rgba(0,0,0,0.04)] sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto">
          <ContextSidebar
            caseId={id}
            tasks={taskList.map((t) => ({ id: t.id, task_key: t.task_key }))}
            fallbackTaskKey={currentTaskKey}
            deadline={deadline}
            riskScore={riskScore}
            disputeType={disputeType}
            piSubType={piDetails?.pi_sub_type ?? undefined}
          />
        </aside>

        <MobileSidebarDrawer caseId={id} tasks={taskList} phases={phases} />
      </div>
      <MobileNav caseId={id} />
    </>
  )
}
