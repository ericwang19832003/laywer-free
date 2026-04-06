'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface Citation {
  case_name: string
  court: string
  year: number | null
  excerpt: string
  opinion_type: string
}

export function CitationCard({ citation }: { citation: Citation }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <Card>
      <CardContent className="pt-3 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium" style={{ color: '#1C1917' }}>
              {citation.case_name}
            </p>
            <p className="text-xs" style={{ color: '#78716C' }}>
              {citation.court} {citation.year ? `(${citation.year})` : ''} &middot; {citation.opinion_type}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="flex-shrink-0"
          >
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </Button>
        </div>
        {expanded && (
          <div className="mt-2 pt-2 border-t" style={{ borderColor: '#E7E5E4' }}>
            <p className="text-xs leading-relaxed" style={{ color: '#57534E' }}>
              &ldquo;{citation.excerpt}&rdquo;
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
