import { createClient } from '@/lib/supabase/server'
import { WorkflowSidebar } from '@/components/case/workflow-sidebar'
import { MobileSidebarDrawer } from '@/components/case/mobile-sidebar-drawer'
import { MobileNav } from '@/components/layout/mobile-nav'
import { BottomNav } from '@/components/layout/bottom-nav'
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

  const [{ data: tasks }, { data: caseRow }, { data: piDetails }, { data: familyDetails }, { data: businessDetails }] =
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
  const phaseKey = disputeType === 'business' && businessDetails?.business_sub_type
    ? businessDetails.business_sub_type
    : disputeType === 'family' && familyDetails?.family_sub_type
      ? familyDetails.family_sub_type
      : disputeType
  const phases = WORKFLOW_PHASES[phaseKey] ?? WORKFLOW_PHASES['civil']

  return (
    <>
      <div className="grid min-h-[calc(100vh-3.5rem)] grid-cols-1 pb-24 lg:grid-cols-[16rem_minmax(0,1fr)] lg:pb-0">
        <aside className="hidden bg-warm-bg shadow-[1px_0_3px_0_rgba(0,0,0,0.04)] sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto lg:block">
          <WorkflowSidebar caseId={id} tasks={taskList} phases={phases} />
        </aside>

        <main className="flex-1 min-w-0 bg-warm-bg" id="main-content">
          {children}
        </main>

        <MobileSidebarDrawer caseId={id} tasks={taskList} phases={phases} />
      </div>
      <MobileNav caseId={id} />
      <BottomNav caseId={id} />
    </>
  )
}
