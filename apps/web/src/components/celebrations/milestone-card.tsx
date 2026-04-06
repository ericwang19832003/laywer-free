'use client'

import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface MilestoneCardProps {
  caseId: string
  onDismiss: () => void
}

function getStorageKey(caseId: string) {
  return `milestone-50-${caseId}`
}

export function shouldShowMilestone(caseId: string, completedCount: number, totalCount: number): boolean {
  if (totalCount === 0) return false
  if (completedCount / totalCount < 0.5) return false
  try {
    return !localStorage.getItem(getStorageKey(caseId))
  } catch {
    return false
  }
}

export function MilestoneCard({ caseId, onDismiss }: MilestoneCardProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(id)
  }, [])

  function handleDismiss() {
    try {
      localStorage.setItem(getStorageKey(caseId), '1')
    } catch {
      // localStorage unavailable
    }
    onDismiss()
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="transition-all duration-500 ease-out"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
      }}
    >
      <Card className="border-amber-300/50 bg-amber-50/30">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-amber-500 shrink-0" />
            <h3 className="text-lg font-semibold text-warm-text">Halfway there!</h3>
          </div>

          <p className="text-sm text-warm-muted">
            Most people who reach this point successfully complete their case. You&apos;re doing great.
          </p>

          <Button onClick={handleDismiss} className="w-full">
            Keep going
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
