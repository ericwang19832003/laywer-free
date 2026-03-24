'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface DiscoveryCardProps {
  caseId: string
  discoveryTask: {
    id: string
    status: string
  } | null
  packCount: number
  servedCount: number
  itemCount: number
}

export function DiscoveryCard({
  caseId,
  discoveryTask,
  packCount,
  servedCount,
  itemCount,
}: DiscoveryCardProps) {
  // Hidden if task doesn't exist or is locked
  if (!discoveryTask || discoveryTask.status === 'locked') {
    return null
  }

  // State B: step not completed yet
  if (discoveryTask.status !== 'completed') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-warm-text">Discovery</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-warm-muted mb-4">
            Learn about discovery tools available for your case and how to use them.
          </p>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/case/${caseId}/step/${discoveryTask.id}`}>
              Get Started →
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  // State C: completed, packs exist
  if (packCount > 0) {
    const parts: string[] = []
    parts.push(`${packCount} pack${packCount !== 1 ? 's' : ''}`)
    if (servedCount > 0) {
      parts.push(`${servedCount} served`)
    }
    parts.push(`${itemCount} item${itemCount !== 1 ? 's' : ''}`)

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-warm-text">Discovery</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-warm-muted mb-4">{parts.join(' · ')}</p>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/case/${caseId}/discovery`}>
              View Discovery Hub →
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  // State D: completed, no packs yet
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg text-warm-text">Discovery</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-warm-muted mb-4">
          Ready to start building your discovery requests.
        </p>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/case/${caseId}/discovery`}>
            Go to Discovery Hub →
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
