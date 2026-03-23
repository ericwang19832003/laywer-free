'use client'

import { AlertTriangle, Clock, ShieldAlert, Info, HelpCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
/** Serializable version of SolResult (Date → ISO string) */
interface SerializedSolResult {
  years: number | null
  expiresAt: string | null
  daysRemaining: number | null
  level: 'expired' | 'critical' | 'warning' | 'caution' | 'safe' | 'not_applicable'
  notes: string | null
}

interface SolBannerProps {
  caseId: string
  sol: SerializedSolResult
  disputeType: string
  state: string
}

const LEVEL_CONFIG = {
  expired: {
    icon: ShieldAlert,
    border: 'border-l-amber-600',
    bg: 'bg-amber-50',
    iconColor: 'text-calm-amber',
    titleColor: 'text-amber-800',
    title: 'Statute of Limitations Has Expired',
    description: 'The deadline to file this type of claim has passed. You should consult with an attorney immediately to discuss your options.',
  },
  critical: {
    icon: AlertTriangle,
    border: 'border-l-amber-500',
    bg: 'bg-amber-50',
    iconColor: 'text-calm-amber',
    titleColor: 'text-amber-700',
    title: 'Statute of Limitations Expiring Soon',
    description: 'You must file your case before the statute of limitations expires. Missing this deadline means you lose the right to sue.',
  },
  warning: {
    icon: AlertTriangle,
    border: 'border-l-amber-500',
    bg: 'bg-amber-50',
    iconColor: 'text-amber-500',
    titleColor: 'text-amber-700',
    title: 'Statute of Limitations Approaching',
    description: 'Your filing deadline is approaching. Plan to file well before the expiration date.',
  },
  caution: {
    icon: Clock,
    border: 'border-l-calm-amber',
    bg: 'bg-calm-amber/5',
    iconColor: 'text-calm-amber',
    titleColor: 'text-warm-text',
    title: 'Statute of Limitations',
    description: null,
  },
  safe: {
    icon: Info,
    border: 'border-l-calm-indigo',
    bg: 'bg-calm-indigo/5',
    iconColor: 'text-calm-indigo',
    titleColor: 'text-warm-text',
    title: 'Statute of Limitations',
    description: null,
  },
  not_applicable: null,
} as const

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatCountdown(days: number): string {
  if (days <= 0) return 'Expired'
  if (days === 1) return '1 day remaining'
  if (days < 30) return `${days} days remaining`
  const months = Math.floor(days / 30)
  const remainingDays = days % 30
  if (months < 12) {
    return remainingDays > 0
      ? `${months} month${months > 1 ? 's' : ''}, ${remainingDays} day${remainingDays > 1 ? 's' : ''} remaining`
      : `${months} month${months > 1 ? 's' : ''} remaining`
  }
  const years = Math.floor(days / 365)
  const remainingMonths = Math.floor((days % 365) / 30)
  return remainingMonths > 0
    ? `${years} year${years > 1 ? 's' : ''}, ${remainingMonths} month${remainingMonths > 1 ? 's' : ''} remaining`
    : `${years} year${years > 1 ? 's' : ''} remaining`
}

export function SolBanner({ caseId, sol, disputeType, state }: SolBannerProps) {
  const config = LEVEL_CONFIG[sol.level]
  if (!config) return null

  const Icon = config.icon

  return (
    <div className={`rounded-lg border-l-4 ${config.border} ${config.bg} px-4 py-3`}>
      <div className="flex items-start gap-3">
        <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${config.iconColor}`} />
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold ${config.titleColor}`}>
            <span className="inline-flex items-center gap-1">
              {config.title}
              <span className="relative group">
                <HelpCircle className="h-4 w-4 text-warm-muted cursor-help" />
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-warm-text text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none w-64 text-center z-10">
                  The deadline to file your case in court. If this passes, you may lose your right to sue. This date is based on Texas law and your case type.
                </span>
              </span>
            </span>
            {sol.years !== null && (
              <span className="font-normal text-warm-muted ml-1">
                ({sol.years}-year limit in {state})
              </span>
            )}
          </p>

          {/* Countdown */}
          {sol.daysRemaining !== null && sol.expiresAt && (
            <div className="mt-1">
              {sol.daysRemaining > 0 ? (
                <p className="text-sm text-warm-text">
                  <span className="font-medium">{formatCountdown(sol.daysRemaining)}</span>
                  {' '}— expires {formatDate(new Date(sol.expiresAt))}
                </p>
              ) : (
                <p className="text-sm text-amber-700 font-medium">
                  Expired on {formatDate(new Date(sol.expiresAt))}
                </p>
              )}
            </div>
          )}

          {/* No incident date warning */}
          {sol.years !== null && !sol.expiresAt && (
            <p className="text-sm text-warm-muted mt-1">
              Add your incident date to calculate the exact expiration.
            </p>
          )}

          {/* Description for urgent levels */}
          {config.description && (sol.level === 'expired' || sol.level === 'critical' || sol.level === 'warning') && (
            <p className="text-xs text-warm-muted mt-2">{config.description}</p>
          )}

          {/* Citation */}
          {sol.notes && (
            <p className="text-xs text-warm-muted mt-1 italic">{sol.notes}</p>
          )}

          {/* Action buttons for urgent levels */}
          {(sol.level === 'expired' || sol.level === 'critical') && (
            <div className="flex gap-2 mt-3">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/case/${caseId}/deadlines`}>View Deadlines</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
