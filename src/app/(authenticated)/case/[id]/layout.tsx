import { createClient } from '@/lib/supabase/server'
import { WorkflowSidebar } from '@/components/case/workflow-sidebar'
import { MobileSidebarDrawer } from '@/components/case/mobile-sidebar-drawer'
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

  const [{ data: tasks }, { data: caseRow }] = await Promise.all([
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
  ])

  const taskList: SidebarTask[] = (tasks ?? []).map((t) => ({
    id: t.id,
    task_key: t.task_key,
    title: t.title,
    status: t.status,
  }))

  const disputeType = caseRow?.dispute_type ?? 'civil'
  const phases = WORKFLOW_PHASES[disputeType] ?? WORKFLOW_PHASES['civil']

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)]">
      <aside className="hidden lg:block w-64 shrink-0 border-r border-warm-border bg-white sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto">
        <WorkflowSidebar caseId={id} tasks={taskList} phases={phases} />
      </aside>

      <main className="flex-1 min-w-0">
        {children}
      </main>

      <MobileSidebarDrawer caseId={id} tasks={taskList} phases={phases} />
    </div>
  )
}
