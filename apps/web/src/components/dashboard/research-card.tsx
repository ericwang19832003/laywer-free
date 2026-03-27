'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Scale } from 'lucide-react'
import Link from 'next/link'

interface ResearchCardProps {
  caseId: string
  authorityCount: number
}

export function ResearchCard({ caseId, authorityCount }: ResearchCardProps) {
  return (
    <Card>
      <CardContent className="pt-4 pb-3">
        <div className="flex items-center gap-2 mb-2">
          <Scale className="h-4 w-4" style={{ color: '#78716C' }} />
          <h3 className="text-sm font-semibold" style={{ color: '#1C1917' }}>Legal Research</h3>
        </div>
        <p className="text-xs mb-3" style={{ color: '#78716C' }}>
          Search for case law that supports your position. Ask AI-powered questions backed by real court decisions.
        </p>
        {authorityCount > 0 && (
          <p className="text-xs mb-2" style={{ color: '#57534E' }}>
            {authorityCount} saved authorit{authorityCount === 1 ? 'y' : 'ies'}
          </p>
        )}
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link href={`/case/${caseId}/research`}>Open Research &rarr;</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
