'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { ListChecks, X } from 'lucide-react'
import { WorkflowSidebar } from './workflow-sidebar'
import type { SidebarTask } from './workflow-sidebar'
import type { WorkflowPhase } from '@/lib/workflow-phases'

interface MobileSidebarDrawerProps {
  caseId: string
  tasks: SidebarTask[]
  phases: WorkflowPhase[]
}

export function MobileSidebarDrawer({ caseId, tasks, phases }: MobileSidebarDrawerProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Close drawer on navigation
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed bottom-6 left-4 z-40 flex items-center gap-2 rounded-full bg-calm-indigo text-white px-4 py-2.5 shadow-lg hover:bg-calm-indigo/90 transition-colors"
        aria-label="Open workflow steps"
      >
        <ListChecks className="h-4 w-4" />
        <span className="text-sm font-medium">Steps</span>
      </button>

      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transform transition-transform duration-200 ease-in-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-warm-border">
          <h2 className="text-sm font-semibold text-warm-text">Your Steps</h2>
          <button
            onClick={() => setOpen(false)}
            className="p-1 rounded-md hover:bg-warm-bg transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4 text-warm-muted" />
          </button>
        </div>
        <WorkflowSidebar caseId={caseId} tasks={tasks} phases={phases} />
      </div>
    </>
  )
}
