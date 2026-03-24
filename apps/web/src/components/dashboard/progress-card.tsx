'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface ProgressCardProps {
  tasksSummary: Record<string, number>
}

export function ProgressCard({ tasksSummary }: ProgressCardProps) {
  const completed = tasksSummary['done'] ?? 0
  const total = Object.values(tasksSummary).reduce((sum, count) => sum + count, 0)
  const remaining = total - completed
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
  const allDone = total > 0 && completed === total

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg text-warm-text">Your Progress</CardTitle>
      </CardHeader>
      <CardContent>
        {allDone ? (
          <p className="text-warm-muted text-sm">
            You&apos;re all caught up. Nice work!
          </p>
        ) : total === 0 ? (
          <p className="text-warm-muted text-sm">
            No steps yet. We&apos;ll set them up as your case gets started.
          </p>
        ) : (
          <>
            <p className="text-sm mb-3">
              <span className="text-calm-green font-medium">{completed} completed</span>
              <span className="text-warm-muted"> &middot; {remaining} remaining</span>
            </p>
            <Progress value={percentage} className="h-2" />
          </>
        )}
      </CardContent>
    </Card>
  )
}
