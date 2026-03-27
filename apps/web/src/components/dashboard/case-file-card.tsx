'use client'

import Link from 'next/link'
import { FileText, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface CaseFileCardProps {
  caseId: string
  evidenceCount: number
  exhibitCount: number
  discoveryPackCount: number
  binderCount: number
}

export function CaseFileCard({
  caseId,
  evidenceCount,
  exhibitCount,
  discoveryPackCount,
  binderCount,
}: CaseFileCardProps) {
  return (
    <Link href={`/case/${caseId}/case-file`} className="block">
      <Card className="border-warm-border bg-white/90 hover:shadow-md transition-shadow">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-calm-indigo/10">
                <FileText className="h-4 w-4 text-calm-indigo" />
              </div>
              <h3 className="text-sm font-semibold text-warm-text">Case File</h3>
            </div>
            <ChevronRight className="h-4 w-4 text-warm-muted" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-lg font-semibold text-warm-text">{evidenceCount}</p>
              <p className="text-xs text-warm-muted">Evidence Items</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-warm-text">{exhibitCount}</p>
              <p className="text-xs text-warm-muted">Exhibits</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-warm-text">{discoveryPackCount}</p>
              <p className="text-xs text-warm-muted">Discovery Packs</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-warm-text">{binderCount}</p>
              <p className="text-xs text-warm-muted">Binders</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
