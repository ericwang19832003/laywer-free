'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface NextStepCardProps {
  caseId: string
  nextTask: {
    id: string
    task_key: string
    title: string
    status: string
  } | null
}

export function NextStepCard({ caseId, nextTask }: NextStepCardProps) {
  if (!nextTask) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-warm-text">Today&apos;s Next Step</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-warm-muted">You&apos;re all caught up. Nice work!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-calm-indigo/20 bg-calm-indigo/5">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-warm-muted uppercase tracking-wide">
          Today&apos;s Next Step
        </CardTitle>
      </CardHeader>
      <CardContent>
        <h3 className="text-lg font-semibold text-warm-text mb-1">{nextTask.title}</h3>
        <p className="text-sm text-warm-muted mb-4">
          This helps us organize your documents and timeline.
        </p>
        <Button asChild>
          <Link href={`/case/${caseId}/step/${nextTask.id}`}>
            Review &amp; Continue
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
