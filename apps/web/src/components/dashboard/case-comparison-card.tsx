'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3 } from 'lucide-react'

interface CaseComparisonCardProps {
  taskCompletionRate: number    // 0-100, what % of tasks completed
  evidenceCount: number
  daysSinceCreation: number
  disputeType: string
}

export function CaseComparisonCard({
  taskCompletionRate,
  evidenceCount,
  daysSinceCreation,
  disputeType,
}: CaseComparisonCardProps) {
  const avgEvidenceForType = getAvgEvidence(disputeType)

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-warm-text flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-calm-indigo" />
          How You Compare
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <ComparisonRow
          label="Task completion"
          value={`${taskCompletionRate}%`}
          detail={taskCompletionRate >= 50 ? 'Above average' : 'Keep going'}
          positive={taskCompletionRate >= 50}
        />
        <ComparisonRow
          label="Evidence organized"
          value={`${evidenceCount} items`}
          detail={evidenceCount >= avgEvidenceForType
            ? `More than typical ${formatDisputeType(disputeType)} cases`
            : `Most ${formatDisputeType(disputeType)} cases have ${avgEvidenceForType}+ items`}
          positive={evidenceCount >= avgEvidenceForType}
        />
        <ComparisonRow
          label="Time invested"
          value={`${daysSinceCreation} days`}
          detail="Every day of preparation counts"
          positive={true}
        />
      </CardContent>
    </Card>
  )
}

function ComparisonRow({ label, value, detail, positive }: {
  label: string; value: string; detail: string; positive: boolean
}) {
  return (
    <div className="flex items-start justify-between gap-2">
      <div>
        <p className="text-sm font-medium text-warm-text">{label}</p>
        <p className="text-xs text-warm-muted">{detail}</p>
      </div>
      <span className={`text-sm font-semibold ${positive ? 'text-calm-green' : 'text-warm-muted'}`}>
        {value}
      </span>
    </div>
  )
}

function getAvgEvidence(disputeType: string): number {
  const avgs: Record<string, number> = {
    personal_injury: 8, small_claims: 4, landlord_tenant: 5, family: 6,
    contract: 5, property: 6, debt_defense: 3, other: 4, civil: 5,
  }
  return avgs[disputeType] ?? 5
}

function formatDisputeType(dt: string): string {
  return dt.replace(/_/g, ' ')
}
