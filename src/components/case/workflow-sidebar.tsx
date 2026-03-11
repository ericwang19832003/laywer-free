'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
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
    default:
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
  return ['todo', 'in_progress', 'needs_review', 'completed', 'skipped'].includes(status)
}

export function WorkflowSidebar({ caseId, tasks, phases }: WorkflowSidebarProps) {
  const params = useParams()
  const activeTaskId = params?.taskId as string | undefined

  const taskMap = new Map(tasks.map((t) => [t.task_key, t]))

  const currentTaskKey = tasks.find(
    (t) => t.status === 'todo' || t.status === 'in_progress' || t.status === 'needs_review'
  )?.task_key

  const countable = tasks.filter((t) => t.status !== 'skipped')
  const completedCount = countable.filter((t) => t.status === 'completed').length
  const totalCount = countable.length
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const initialCollapsed = new Set<number>()
  phases.forEach((phase, idx) => {
    const phaseTasks = phase.taskKeys
      .map((k) => taskMap.get(k))
      .filter(Boolean) as SidebarTask[]
    const allDone =
      phaseTasks.length > 0 &&
      phaseTasks.every((t) => t.status === 'completed' || t.status === 'skipped')
    if (allDone) initialCollapsed.add(idx)
  })

  const [collapsed, setCollapsed] = useState(initialCollapsed)
  const currentStepRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    currentStepRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [activeTaskId, currentTaskKey])

  const setCurrentRef = useCallback((el: HTMLDivElement | null, taskId: string) => {
    if (taskId === activeTaskId || (!activeTaskId && tasks.find(t => t.task_key === currentTaskKey)?.id === taskId)) {
      (currentStepRef as React.MutableRefObject<HTMLDivElement | null>).current = el
    }
  }, [activeTaskId, currentTaskKey, tasks])

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
                        <div key={task.id} ref={(el) => setCurrentRef(el, task.id)}>
                          <Link href={`/case/${caseId}/step/${task.id}`}>
                            {content}
                          </Link>
                        </div>
                      )
                    }

                    return <div key={task.id} ref={(el) => setCurrentRef(el, task.id)}>{content}</div>
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
