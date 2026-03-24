'use client'

import { useEffect, useState } from 'react'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface StepCompleteCardProps {
  completedCount: number
  totalCount: number
  onContinue: () => void
  onDismiss: () => void
}

function getMessage(ratio: number): string {
  if (ratio < 0.25) return 'Great start! You\'re building momentum.'
  if (ratio < 0.5) return 'You\'re making real progress.'
  if (ratio < 0.75) return 'Over halfway there! Keep going.'
  return 'Almost done — the finish line is in sight.'
}

export function StepCompleteCard({ completedCount, totalCount, onContinue, onDismiss }: StepCompleteCardProps) {
  const [visible, setVisible] = useState(false)
  const ratio = totalCount > 0 ? completedCount / totalCount : 0
  const pct = Math.round(ratio * 100)

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(id)
  }, [])

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
      <Card className="border-calm-green/30">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-calm-green shrink-0" />
            <h3 className="text-lg font-semibold text-warm-text">Step Complete!</h3>
          </div>

          <div>
            <div className="flex justify-between text-xs text-warm-muted mb-1">
              <span>{completedCount} of {totalCount} steps</span>
              <span>{pct}%</span>
            </div>
            <div className="h-2 rounded-full bg-warm-border overflow-hidden">
              <div
                className="h-full rounded-full bg-calm-green transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          <p className="text-sm text-warm-muted">{getMessage(ratio)}</p>

          <div className="flex items-center gap-3">
            <Button onClick={onContinue} className="flex-1">
              Continue to next step &rarr;
            </Button>
            <button
              onClick={onDismiss}
              className="text-sm text-warm-muted hover:text-warm-text transition-colors"
            >
              Dismiss
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
