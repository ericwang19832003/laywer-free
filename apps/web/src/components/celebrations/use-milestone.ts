'use client'

import { useState, useCallback, useMemo } from 'react'

export type MilestoneType = 'step' | 'halfway' | 'resolved'

interface UseMilestoneParams {
  caseId: string
  totalSteps: number
  completedSteps: number
  caseStatus: 'active' | 'won' | 'settled' | 'resolved' | 'dismissed' | string
  disputeType?: string
}

interface UseMilestoneReturn {
  /** Which milestone to show right now, or null if none */
  activeMilestone: MilestoneType | null
  /** Call after the modal is dismissed to persist and clear */
  dismissMilestone: () => void
}

function storageKey(caseId: string, milestone: string): string {
  return `milestone_shown_${caseId}_${milestone}`
}

function isShown(caseId: string, milestone: string): boolean {
  try {
    return localStorage.getItem(storageKey(caseId, milestone)) === '1'
  } catch {
    return false
  }
}

function markShown(caseId: string, milestone: string): void {
  try {
    localStorage.setItem(storageKey(caseId, milestone), '1')
  } catch {
    // localStorage unavailable
  }
}

/**
 * Determines which milestone (if any) should display for the current case state.
 * Priority order: resolved > halfway > step
 * Only returns a milestone that has not yet been shown (tracked in localStorage).
 */
export function computeMilestone(
  caseId: string,
  completedSteps: number,
  totalSteps: number,
  caseStatus: string,
): MilestoneType | null {
  // Case resolved — highest priority
  if (['won', 'settled', 'resolved'].includes(caseStatus)) {
    if (!isShown(caseId, 'resolved')) return 'resolved'
  }

  if (totalSteps === 0) return null

  const ratio = completedSteps / totalSteps

  // 50% milestone — triggers once per case
  if (ratio >= 0.5 && !isShown(caseId, 'halfway')) {
    return 'halfway'
  }

  // Step completion — only show if there is at least 1 completed step
  // and it hasn't already been shown for this exact step count
  if (completedSteps > 0 && !isShown(caseId, `step_${completedSteps}`)) {
    return 'step'
  }

  return null
}

export function useMilestone({
  caseId,
  totalSteps,
  completedSteps,
  caseStatus,
}: UseMilestoneParams): UseMilestoneReturn {
  const milestone = useMemo(
    () => computeMilestone(caseId, completedSteps, totalSteps, caseStatus),
    [caseId, completedSteps, totalSteps, caseStatus],
  )

  const [activeMilestone, setActiveMilestone] = useState<MilestoneType | null>(milestone)

  const dismissMilestone = useCallback(() => {
    if (!activeMilestone) return

    if (activeMilestone === 'resolved') {
      markShown(caseId, 'resolved')
    } else if (activeMilestone === 'halfway') {
      markShown(caseId, 'halfway')
    } else if (activeMilestone === 'step') {
      markShown(caseId, `step_${completedSteps}`)
    }

    setActiveMilestone(null)
  }, [activeMilestone, caseId, completedSteps])

  return { activeMilestone, dismissMilestone }
}
