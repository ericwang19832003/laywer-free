'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  Check,
  Circle,
  Lock,
  SkipForward,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import type { WorkflowPhase } from '@/lib/workflow-phases'

const SKIPPABLE_TASKS = new Set([
  'prepare_pi_demand_letter',
  'pi_settlement_negotiation',
  'pi_mediation',
  'prepare_demand_letter',
  'prepare_lt_demand_letter',
  'lt_negotiation',
  'lt_mediation',
  'preservation_letter',
  'contract_demand_letter',
  'contract_negotiation',
  'contract_mediation',
  'property_demand_letter',
  'property_negotiation',
  'other_demand_letter',
  'divorce_temporary_orders',
  'divorce_mediation',
  'custody_temporary_orders',
  'child_support_temporary_orders',
  'spousal_support_temporary_orders',
  'mod_mediation',
])

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
      return (
        <span className="flex items-center justify-center size-5 rounded-full bg-calm-green/10 shrink-0">
          <Check className="size-3 text-calm-green" strokeWidth={2.5} />
        </span>
      )
    case 'skipped':
      return (
        <span className="flex items-center justify-center size-5 rounded-full bg-warm-border/40 shrink-0">
          <SkipForward className="size-3 text-warm-muted" />
        </span>
      )
    case 'locked':
      return (
        <span className="flex items-center justify-center size-5 shrink-0">
          <Lock className="size-3.5 text-warm-muted/40" />
        </span>
      )
    default:
      return isCurrent ? (
        <span className="flex items-center justify-center size-5 rounded-full bg-calm-indigo/10 shrink-0">
          <Circle className="size-2.5 text-calm-indigo fill-calm-indigo" />
        </span>
      ) : (
        <span className="flex items-center justify-center size-5 shrink-0">
          <Circle className="size-2 text-warm-muted/60 fill-warm-muted/20" />
        </span>
      )
  }
}

function isClickable(status: string) {
  return ['todo', 'in_progress', 'needs_review', 'completed', 'skipped'].includes(status)
}

export function WorkflowSidebar({ caseId, tasks, phases }: WorkflowSidebarProps) {
  const params = useParams()
  const router = useRouter()
  const activeTaskId = params?.taskId as string | undefined
  const [skippingId, setSkippingId] = useState<string | null>(null)

  async function handleSkip(taskId: string) {
    if (skippingId) return
    setSkippingId(taskId)
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'skipped',
          metadata: { skip_reason: 'user_skipped_from_sidebar' },
        }),
      })
      if (!res.ok) throw new Error('Failed to skip')
      router.refresh()
    } catch {
      setSkippingId(null)
    }
  }

  const taskMap = new Map(tasks.map((t) => [t.task_key, t]))

  const currentTaskKey = tasks.find(
    (t) => t.status === 'todo' || t.status === 'in_progress' || t.status === 'needs_review'
  )?.task_key

  const currentPhaseIdx = phases.findIndex((phase) =>
    phase.taskKeys.includes(currentTaskKey ?? '')
  )

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
    <nav className="flex flex-col h-full overflow-y-auto py-5 px-3">
      {/* Progress section */}
      <div className="mb-6 px-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-warm-muted">
            Your progress
          </span>
          <span className="text-xs font-semibold text-warm-text tabular-nums">{percentage}%</span>
        </div>
        <div className="h-2 bg-warm-border/40 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-calm-indigo to-[#6366F1] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="text-xs text-warm-muted/60 mt-1.5 tabular-nums">
          {completedCount} of {totalCount} steps complete
        </p>
      </div>

      {/* Phase sections */}
      <div className="space-y-1">
        {phases.map((phase, phaseIdx) => {
          const phaseTasks = phase.taskKeys
            .map((k) => taskMap.get(k))
            .filter(Boolean) as SidebarTask[]

          if (phaseTasks.length === 0) return null

          const doneInPhase = phaseTasks.filter(
            (t) => t.status === 'completed' || t.status === 'skipped'
          ).length
          const allPhaseComplete = doneInPhase === phaseTasks.length
          const isCollapsed = collapsed.has(phaseIdx)

          return (
            <div key={phaseIdx} className="mb-1">
              {/* Phase header */}
              <button
                onClick={() => togglePhase(phaseIdx)}
                className="flex items-center justify-between w-full px-2 py-2 text-left rounded-lg hover:bg-warm-border/20 transition-colors duration-150 group"
              >
                <div className="flex items-center gap-2">
                  <span className={`transition-transform duration-200 ${isCollapsed ? '' : 'rotate-0'}`}>
                    {isCollapsed ? (
                      <ChevronRight className="size-3.5 text-warm-muted/50 group-hover:text-warm-muted" />
                    ) : (
                      <ChevronDown className="size-3.5 text-warm-muted/50 group-hover:text-warm-muted" />
                    )}
                  </span>
                  {allPhaseComplete && (
                    <Check className="size-3 text-calm-green" strokeWidth={2.5} />
                  )}
                  <span className={`text-xs font-medium ${
                    allPhaseComplete
                      ? 'text-calm-green/70'
                      : phaseIdx === currentPhaseIdx
                      ? 'text-calm-indigo font-semibold'
                      : 'text-warm-muted/70'
                  }`}>
                    {phase.label}
                  </span>
                </div>
                <span className={`text-xs tabular-nums rounded-full px-1.5 py-0.5 font-medium ${
                  allPhaseComplete
                    ? 'bg-calm-green/10 text-calm-green'
                    : phaseIdx === currentPhaseIdx
                    ? 'bg-calm-indigo/10 text-calm-indigo'
                    : 'text-warm-muted/40'
                }`}>
                  {doneInPhase}/{phaseTasks.length}
                </span>
              </button>

              {/* Phase tasks */}
              {!isCollapsed && (
                <div className="mt-0.5 mb-2 space-y-0.5 pl-1">
                  {phaseTasks.map((task) => {
                    const isCurrent = task.task_key === currentTaskKey
                    const isActive = task.id === activeTaskId
                    const clickable = isClickable(task.status)
                    const canSkip = SKIPPABLE_TASKS.has(task.task_key) &&
                      (task.status === 'todo' || task.status === 'in_progress')

                    const content = (
                      <div
                        className={`relative flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm transition-all duration-150 ${
                          isActive
                            ? 'bg-calm-indigo/[0.07] shadow-[inset_3px_0_0_0] shadow-calm-indigo'
                            : isCurrent
                            ? 'bg-calm-indigo/[0.04]'
                            : clickable
                            ? 'hover:bg-warm-border/20'
                            : 'opacity-40'
                        }`}
                      >
                        {getStatusIcon(task.status, isCurrent)}
                        <span
                          className={`truncate leading-snug ${
                            task.status === 'locked'
                              ? 'text-warm-muted/40'
                              : task.status === 'skipped'
                              ? 'text-warm-muted/60'
                              : isActive
                              ? 'text-calm-indigo font-semibold'
                              : isCurrent
                              ? 'text-warm-text font-medium'
                              : task.status === 'completed'
                              ? 'text-warm-muted/70'
                              : 'text-warm-text/80'
                          }`}
                        >
                          {task.title}
                        </span>
                        {canSkip && (
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              handleSkip(task.id)
                            }}
                            disabled={skippingId === task.id}
                            className="ml-auto shrink-0 text-xs text-warm-muted/50 hover:text-warm-muted transition-colors duration-150"
                            title="Skip this step"
                          >
                            {skippingId === task.id ? '...' : 'Skip'}
                          </button>
                        )}
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
