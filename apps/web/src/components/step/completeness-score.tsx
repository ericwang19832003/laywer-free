'use client'

import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import type { CompletenessResult } from '@/hooks/usePetitionCompleteness'

export interface CompletenessScoreProps {
  completeness: CompletenessResult
  className?: string
}

export function CompletenessScore({ completeness, className }: CompletenessScoreProps) {
  const { score, criticalMissing, recommendedMissing, canFile } = completeness

  return (
    <div className={cn('space-y-4', className)}>
      {/* Score Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-warm-text">Petition Readiness</span>
        <span
          className={cn(
            'text-sm font-semibold',
            score >= 80
              ? 'text-calm-green'
              : score >= 50
              ? 'text-calm-amber'
              : 'text-destructive'
          )}
        >
          {score}%
        </span>
      </div>

      {/* Progress Bar */}
      <Progress
        value={score}
        className="h-2"
      />

      {/* Filing Status */}
      {canFile ? (
        <div className="flex items-center gap-2 text-calm-green">
          <CheckCircle2 className="h-4 w-4" />
          <span className="text-sm">Ready to file</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-calm-amber">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">Some information needed</span>
        </div>
      )}

      {/* Missing Items */}
      {criticalMissing.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-warm-muted uppercase tracking-wider">
            Required Information
          </p>
          <ul className="space-y-1">
            {criticalMissing.slice(0, 3).map((field) => (
              <li key={field.id} className="flex items-start gap-2 text-sm">
                <span className="text-destructive mt-0.5">•</span>
                <span className="text-warm-text">{field.label}</span>
              </li>
            ))}
            {criticalMissing.length > 3 && (
              <li className="text-xs text-warm-muted">
                +{criticalMissing.length - 3} more required
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Optional Items */}
      {recommendedMissing.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-warm-muted uppercase tracking-wider">
            Suggested (Optional)
          </p>
          <ul className="space-y-1">
            {recommendedMissing.slice(0, 2).map((field) => (
              <li key={field.id} className="flex items-start gap-2 text-sm">
                <span className="text-calm-amber mt-0.5">○</span>
                <span className="text-warm-muted">{field.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
