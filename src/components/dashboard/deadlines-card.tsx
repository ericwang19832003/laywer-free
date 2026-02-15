'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface Deadline {
  id: string
  key: string
  due_at: string
  source: string
}

interface DeadlinesCardProps {
  caseId: string
  deadlines: Deadline[]
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function isWithinDays(dateStr: string, days: number): boolean {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)
  return diffDays >= 0 && diffDays <= days
}

export function DeadlinesCard({ caseId, deadlines }: DeadlinesCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg text-warm-text">Upcoming Deadlines</CardTitle>
      </CardHeader>
      <CardContent>
        {deadlines.length === 0 ? (
          <p className="text-warm-muted text-sm">
            No deadlines yet. That&apos;s okay — we&apos;ll add them as your case develops.
          </p>
        ) : (
          <ul className="space-y-3">
            {deadlines.slice(0, 5).map((deadline) => (
              <li key={deadline.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-warm-text">{deadline.key}</p>
                  <p
                    className={`text-xs ${
                      isWithinDays(deadline.due_at, 3)
                        ? 'text-calm-amber font-medium'
                        : 'text-warm-muted'
                    }`}
                  >
                    {formatDate(deadline.due_at)}
                  </p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {deadline.source}
                </Badge>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/case/${caseId}/deadlines`} className="text-calm-indigo">
              Add a deadline
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
