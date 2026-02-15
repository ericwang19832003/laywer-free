'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface CaseCardProps {
  id: string
  county: string | null
  role: string
  createdAt: string
}

export function CaseCard({ id, county, role, createdAt }: CaseCardProps) {
  const displayCounty = county || 'County not set'
  const displayDate = new Date(createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  const roleLabel = role === 'plaintiff' ? 'Plaintiff' : 'Defendant'

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="flex items-center justify-between py-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-warm-text">{displayCounty}</span>
            <Badge variant="secondary" className="text-xs">{roleLabel}</Badge>
          </div>
          <p className="text-sm text-warm-muted">Started {displayDate}</p>
        </div>
        <Button asChild>
          <Link href={`/case/${id}`}>Continue</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
