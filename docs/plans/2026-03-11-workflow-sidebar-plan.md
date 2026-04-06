# Workflow Sidebar Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a TurboTax-style left sidebar to all case pages showing the full workflow with phase groupings, step statuses, and overall progress.

**Architecture:** Server-side case layout fetches all tasks + dispute_type, renders a two-column layout (sidebar + children). Sidebar is a client component for collapsible phases and mobile drawer. Phase groupings defined in a pure data module per dispute_type.

**Tech Stack:** Next.js server layout, React client components, Supabase queries, lucide-react icons, Tailwind CSS, existing UI primitives (Progress).

---

### Task 1: Create Phase Definitions Module

**Files:**
- Create: `src/lib/workflow-phases.ts`

**Step 1: Create the phase config file**

This is a pure data module — no UI, no tests needed. It maps each `dispute_type` to an ordered array of phases, each containing a label and ordered list of task_keys.

```typescript
export interface WorkflowPhase {
  label: string
  taskKeys: string[]
}

export const WORKFLOW_PHASES: Record<string, WorkflowPhase[]> = {
  personal_injury: [
    {
      label: 'Getting Started',
      taskKeys: ['welcome', 'pi_intake'],
    },
    {
      label: 'Building Your Case',
      taskKeys: ['pi_medical_records', 'evidence_vault', 'pi_insurance_communication'],
    },
    {
      label: 'Pre-Litigation',
      taskKeys: ['prepare_pi_demand_letter', 'pi_settlement_negotiation'],
    },
    {
      label: 'Filing & Service',
      taskKeys: ['prepare_pi_petition', 'pi_file_with_court', 'pi_serve_defendant'],
    },
    {
      label: 'Litigation',
      taskKeys: [
        'pi_wait_for_answer', 'pi_review_answer', 'pi_discovery_prep',
        'pi_discovery_responses', 'pi_scheduling_conference',
        'pi_pretrial_motions', 'pi_mediation', 'pi_trial_prep',
      ],
    },
    {
      label: 'Resolution',
      taskKeys: ['pi_post_resolution'],
    },
  ],

  small_claims: [
    {
      label: 'Getting Started',
      taskKeys: ['welcome', 'small_claims_intake'],
    },
    {
      label: 'Building Your Case',
      taskKeys: ['evidence_vault', 'prepare_demand_letter'],
    },
    {
      label: 'Filing & Service',
      taskKeys: ['prepare_small_claims_filing', 'file_with_court', 'serve_defendant'],
    },
    {
      label: 'Hearing',
      taskKeys: ['prepare_for_hearing', 'hearing_day'],
    },
  ],

  landlord_tenant: [
    {
      label: 'Getting Started',
      taskKeys: ['welcome', 'landlord_tenant_intake'],
    },
    {
      label: 'Building Your Case',
      taskKeys: ['evidence_vault', 'prepare_lt_demand_letter'],
    },
    {
      label: 'Filing & Service',
      taskKeys: ['prepare_landlord_tenant_filing', 'file_with_court', 'serve_other_party'],
    },
    {
      label: 'Hearing',
      taskKeys: ['prepare_for_hearing', 'hearing_day'],
    },
    {
      label: 'Resolution',
      taskKeys: ['post_judgment'],
    },
  ],

  debt_collection: [
    {
      label: 'Getting Started',
      taskKeys: ['welcome', 'debt_defense_intake'],
    },
    {
      label: 'Building Your Case',
      taskKeys: ['evidence_vault', 'prepare_debt_validation_letter'],
    },
    {
      label: 'Filing & Service',
      taskKeys: ['prepare_debt_defense_answer', 'debt_file_with_court', 'serve_plaintiff'],
    },
    {
      label: 'Hearing',
      taskKeys: ['debt_hearing_prep', 'debt_hearing_day'],
    },
    {
      label: 'Resolution',
      taskKeys: ['debt_post_judgment'],
    },
  ],

  family: [
    {
      label: 'Getting Started',
      taskKeys: ['welcome', 'family_intake', 'safety_screening'],
    },
    {
      label: 'Building Your Case',
      taskKeys: ['evidence_vault'],
    },
    {
      label: 'Filing & Service',
      taskKeys: ['prepare_family_filing', 'file_with_court', 'upload_return_of_service', 'confirm_service_facts'],
    },
    {
      label: 'Process',
      taskKeys: ['waiting_period', 'temporary_orders', 'mediation'],
    },
    {
      label: 'Resolution',
      taskKeys: ['final_orders'],
    },
  ],
}

// Civil / default fallback
WORKFLOW_PHASES['civil'] = [
  {
    label: 'Getting Started',
    taskKeys: ['welcome', 'intake'],
  },
  {
    label: 'Building Your Case',
    taskKeys: ['evidence_vault', 'preservation_letter'],
  },
  {
    label: 'Filing & Service',
    taskKeys: ['prepare_filing', 'file_with_court', 'upload_return_of_service', 'confirm_service_facts'],
  },
  {
    label: 'Post-Filing',
    taskKeys: ['wait_for_answer', 'check_docket_for_answer', 'upload_answer', 'default_packet_prep'],
  },
  {
    label: 'Discovery',
    taskKeys: ['discovery_starter_pack', 'rule_26f_prep', 'mandatory_disclosures'],
  },
]
```

**Step 2: Commit**

```bash
git add src/lib/workflow-phases.ts
git commit -m "feat: add workflow phase definitions for sidebar"
```

---

### Task 2: Create Workflow Sidebar Component

**Files:**
- Create: `src/components/case/workflow-sidebar.tsx`

**Step 1: Create the sidebar component**

This is a client component. It receives the task list and phase config, renders collapsible phase sections with status icons for each step.

```tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  CheckCircle2,
  Circle,
  Lock,
  SkipForward,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import type { WorkflowPhase } from '@/lib/workflow-phases'

export interface SidebarTask {
  id: string
  task_key: string
  title: string
  status: string
}

interface WorkflowSidebarProps {
  caseId: string
  tasks: SidebarTask[]
  phases: WorkflowPhase[]
}

function getStatusIcon(status: string, isCurrent: boolean) {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="h-4 w-4 text-calm-green shrink-0" />
    case 'skipped':
      return <SkipForward className="h-4 w-4 text-warm-muted shrink-0" />
    case 'locked':
      return <Lock className="h-3.5 w-3.5 text-warm-muted/50 shrink-0" />
    default: // todo, in_progress, needs_review
      return (
        <Circle
          className={`h-4 w-4 shrink-0 ${
            isCurrent ? 'text-calm-indigo fill-calm-indigo/20' : 'text-warm-muted'
          }`}
        />
      )
  }
}

function isClickable(status: string) {
  return ['todo', 'in_progress', 'needs_review', 'completed'].includes(status)
}

export function WorkflowSidebar({ caseId, tasks, phases }: WorkflowSidebarProps) {
  const params = useParams()
  const activeTaskId = params?.taskId as string | undefined

  // Build a map for quick lookup
  const taskMap = new Map(tasks.map((t) => [t.task_key, t]))

  // Find the first non-completed, non-skipped, non-locked task (the "current" step)
  const currentTaskKey = tasks.find(
    (t) => t.status === 'todo' || t.status === 'in_progress' || t.status === 'needs_review'
  )?.task_key

  // Calculate overall progress (exclude skipped from denominator)
  const countable = tasks.filter((t) => t.status !== 'skipped')
  const completedCount = countable.filter((t) => t.status === 'completed').length
  const totalCount = countable.length
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  // Determine which phases to collapse by default (completed phases)
  const initialCollapsed = new Set<number>()
  phases.forEach((phase, idx) => {
    const phaseTasks = phase.taskKeys
      .map((k) => taskMap.get(k))
      .filter(Boolean) as SidebarTask[]
    const allDone = phaseTasks.length > 0 && phaseTasks.every(
      (t) => t.status === 'completed' || t.status === 'skipped'
    )
    if (allDone) initialCollapsed.add(idx)
  })

  const [collapsed, setCollapsed] = useState(initialCollapsed)

  function togglePhase(idx: number) {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  return (
    <nav className="flex flex-col h-full overflow-y-auto py-4 pr-2">
      {/* Overall progress */}
      <div className="px-3 mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-warm-muted uppercase tracking-wide">
            Progress
          </span>
          <span className="text-xs font-medium text-warm-text">{percentage}%</span>
        </div>
        <Progress value={percentage} className="h-1.5" />
        <p className="text-xs text-warm-muted mt-1">
          {completedCount} of {totalCount} steps
        </p>
      </div>

      {/* Phases */}
      <div className="space-y-1">
        {phases.map((phase, phaseIdx) => {
          const phaseTasks = phase.taskKeys
            .map((k) => taskMap.get(k))
            .filter(Boolean) as SidebarTask[]

          if (phaseTasks.length === 0) return null

          const doneInPhase = phaseTasks.filter(
            (t) => t.status === 'completed' || t.status === 'skipped'
          ).length
          const isCollapsed = collapsed.has(phaseIdx)

          return (
            <div key={phaseIdx}>
              {/* Phase header */}
              <button
                onClick={() => togglePhase(phaseIdx)}
                className="flex items-center justify-between w-full px-3 py-1.5 text-left hover:bg-warm-bg/60 rounded-md transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  {isCollapsed ? (
                    <ChevronRight className="h-3.5 w-3.5 text-warm-muted" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 text-warm-muted" />
                  )}
                  <span className="text-xs font-semibold text-warm-text">
                    {phase.label}
                  </span>
                </div>
                <span className="text-xs text-warm-muted">
                  {doneInPhase}/{phaseTasks.length}
                </span>
              </button>

              {/* Steps */}
              {!isCollapsed && (
                <div className="ml-3 border-l border-warm-border/50 pl-2 space-y-0.5 mt-0.5 mb-1">
                  {phaseTasks.map((task) => {
                    const isCurrent = task.task_key === currentTaskKey
                    const isActive = task.id === activeTaskId
                    const clickable = isClickable(task.status)

                    const content = (
                      <div
                        className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors ${
                          isActive
                            ? 'bg-calm-indigo/10 border-l-2 border-calm-indigo -ml-[3px] pl-[11px]'
                            : isCurrent
                            ? 'bg-calm-indigo/5'
                            : clickable
                            ? 'hover:bg-warm-bg/60'
                            : ''
                        }`}
                      >
                        {getStatusIcon(task.status, isCurrent)}
                        <span
                          className={`truncate ${
                            task.status === 'locked'
                              ? 'text-warm-muted/50'
                              : task.status === 'skipped'
                              ? 'text-warm-muted line-through'
                              : isActive || isCurrent
                              ? 'text-warm-text font-medium'
                              : task.status === 'completed'
                              ? 'text-warm-muted'
                              : 'text-warm-text'
                          }`}
                        >
                          {task.title}
                        </span>
                      </div>
                    )

                    if (clickable) {
                      return (
                        <Link
                          key={task.id}
                          href={`/case/${caseId}/step/${task.id}`}
                        >
                          {content}
                        </Link>
                      )
                    }

                    return <div key={task.id}>{content}</div>
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </nav>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/case/workflow-sidebar.tsx
git commit -m "feat: add WorkflowSidebar component with phase groupings"
```

---

### Task 3: Create Mobile Sidebar Drawer

**Files:**
- Create: `src/components/case/mobile-sidebar-drawer.tsx`

**Step 1: Create the mobile drawer component**

A client component that wraps the sidebar in a slide-out drawer on mobile, toggled by a floating button.

```tsx
'use client'

import { useState } from 'react'
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

  return (
    <>
      {/* Floating toggle button — mobile only */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed bottom-6 left-4 z-40 flex items-center gap-2 rounded-full bg-calm-indigo text-white px-4 py-2.5 shadow-lg hover:bg-calm-indigo/90 transition-colors"
        aria-label="Open workflow steps"
      >
        <ListChecks className="h-4 w-4" />
        <span className="text-sm font-medium">Steps</span>
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
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
```

**Step 2: Commit**

```bash
git add src/components/case/mobile-sidebar-drawer.tsx
git commit -m "feat: add mobile drawer for workflow sidebar"
```

---

### Task 4: Create Case Layout with Sidebar

**Files:**
- Create: `src/app/(authenticated)/case/[id]/layout.tsx`

**Step 1: Create the case layout**

This is a server component that fetches all tasks + dispute_type, renders a two-column layout on desktop with sidebar on the left. On mobile, the sidebar is hidden (handled by the drawer).

```tsx
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
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 border-r border-warm-border bg-white sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto">
        <WorkflowSidebar caseId={id} tasks={taskList} phases={phases} />
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">
        {children}
      </main>

      {/* Mobile drawer */}
      <MobileSidebarDrawer caseId={id} tasks={taskList} phases={phases} />
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/app/\(authenticated\)/case/\[id\]/layout.tsx
git commit -m "feat: add case layout with workflow sidebar"
```

---

### Task 5: Adjust Dashboard Page Layout

**Files:**
- Modify: `src/app/(authenticated)/case/[id]/page.tsx:242-244`

**Step 1: Remove the outer `min-h-screen` and adjust max-width**

The case layout now provides the two-column structure. The dashboard page content should fill the available space within the main column without its own `min-h-screen`.

Change line 243-244 from:
```tsx
    <div className="min-h-screen bg-warm-bg">
      <main className="mx-auto max-w-2xl px-4 py-10">
```
to:
```tsx
    <div className="bg-warm-bg min-h-full">
      <main className="mx-auto max-w-2xl px-4 py-10">
```

This is a minimal change — keep `max-w-2xl` since the dashboard content looks best at that width, and the sidebar + content area provides plenty of space.

**Step 2: Verify the page renders correctly**

Open `http://localhost:3000/case/<any-case-id>` in the browser. Verify:
- Sidebar appears on the left on desktop
- Dashboard content is centered in the main area
- Sidebar phases match the case type
- Task statuses show correct icons

**Step 3: Commit**

```bash
git add src/app/\(authenticated\)/case/\[id\]/page.tsx
git commit -m "fix: adjust dashboard wrapper for case layout"
```

---

### Task 6: Visual Polish & Testing

**Step 1: Test on the dashboard page**

Open `http://localhost:3000/case/<any-case-id>`. Verify:
- Progress bar shows correct percentage
- Completed phases are collapsed by default
- Current step is highlighted
- Locked steps are grayed out and not clickable
- Completed/active steps link correctly to step pages

**Step 2: Test on a step page**

Click into a step from the sidebar. Verify:
- Sidebar persists, showing the same phases
- The active step (matching the URL's taskId) is highlighted with indigo border
- "Back to dashboard" link still works inside the step component

**Step 3: Test mobile drawer**

Resize browser to mobile width. Verify:
- Sidebar is hidden
- Floating "Steps" button appears bottom-left
- Clicking it opens the drawer from the left
- Backdrop closes the drawer
- X button closes the drawer
- Clicking a step in the drawer navigates correctly

**Step 4: Test skipped tasks**

If a case has skipped tasks, verify they show with strikethrough text and skip icon.

**Step 5: Final commit if any polish needed**

```bash
git add -A
git commit -m "fix: workflow sidebar visual polish"
```
