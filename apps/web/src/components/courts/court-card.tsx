'use client'

import { MapPin, Phone, Globe, DollarSign, FileText, ChevronRight, ExternalLink } from 'lucide-react'
import type { Court } from '@lawyer-free/shared/courts/court-types'
import { getCourtTypeLabel, getCourtLevelLabel, formatPhone } from '@lawyer-free/shared/courts/court-database'
import { cn } from '@/lib/utils'

interface CourtCardProps {
  court: Court
  onSelect?: (court: Court) => void
  isSelected?: boolean
  showDetails?: boolean
  compact?: boolean
}

export function CourtCard({ court, onSelect, isSelected, showDetails = true, compact = false }: CourtCardProps) {
  const typeLabel = getCourtTypeLabel(court.type)
  const levelLabel = getCourtLevelLabel(court.level)
  const isFederal = court.type === 'federal'

  return (
    <div
      className={cn(
        'rounded-lg border bg-white transition-all',
        isSelected
          ? 'border-calm-indigo ring-2 ring-calm-indigo/20'
          : 'border-warm-border hover:border-warm-muted hover:shadow-sm',
        compact ? 'p-3' : 'p-4'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={cn(
                'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                isFederal
                  ? 'bg-calm-indigo/10 text-calm-indigo'
                  : 'bg-warm-bg text-warm-muted'
              )}
            >
              {levelLabel}
            </span>
            {court.county && (
              <span className="text-xs text-warm-muted">{court.county} County</span>
            )}
          </div>

          <h3 className={cn('font-semibold text-warm-text mt-1', compact ? 'text-sm' : 'text-base')}>
            {court.name}
          </h3>

          {!compact && (
            <p className="text-sm text-warm-muted mt-0.5">{typeLabel}</p>
          )}

          {!compact && showDetails && (
            <div className="mt-3 space-y-2">
              <div className="flex items-start gap-2 text-sm text-warm-text">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-warm-muted" />
                <span>
                  {court.address}
                  <br />
                  {court.city}, {court.state} {court.zip}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-warm-text">
                <Phone className="h-4 w-4 shrink-0 text-warm-muted" />
                <a href={`tel:${court.phone}`} className="hover:text-calm-indigo">
                  {formatPhone(court.phone)}
                </a>
              </div>

              {court.website && (
                <div className="flex items-center gap-2 text-sm text-warm-text">
                  <Globe className="h-4 w-4 shrink-0 text-warm-muted" />
                  <a
                    href={court.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-calm-indigo flex items-center gap-1"
                  >
                    {court.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}

              {court.filingFee && (
                <div className="flex items-center gap-2 text-sm text-warm-text">
                  <DollarSign className="h-4 w-4 shrink-0 text-warm-muted" />
                  <span>
                    Filing fee: ${court.filingFee.filing}
                    {court.filingFee.service && ` + Service: $${court.filingFee.service}`}
                  </span>
                </div>
              )}
            </div>
          )}

          {!compact && court.jurisdiction && court.jurisdiction.length > 0 && (
            <div className="mt-3">
              <div className="flex items-center gap-1 text-xs font-medium text-warm-muted mb-1">
                <FileText className="h-3 w-3" />
                Jurisdiction
              </div>
              <ul className="text-xs text-warm-text space-y-0.5">
                {court.jurisdiction.slice(0, 4).map((item, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <span className="text-calm-indigo">•</span>
                    {item}
                  </li>
                ))}
                {court.jurisdiction.length > 4 && (
                  <li className="text-warm-muted">
                    +{court.jurisdiction.length - 4} more
                  </li>
                )}
              </ul>
            </div>
          )}

          {court.notes && !compact && (
            <p className="mt-2 text-xs text-warm-muted italic">
              {court.notes}
            </p>
          )}
        </div>

        {onSelect && (
          <button
            type="button"
            onClick={() => onSelect(court)}
            className={cn(
              'shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              isSelected
                ? 'bg-calm-indigo text-white'
                : 'bg-calm-indigo/10 text-calm-indigo hover:bg-calm-indigo/20'
            )}
          >
            {isSelected ? 'Selected' : 'Select'}
          </button>
        )}

        {!onSelect && (
          <ChevronRight className="h-5 w-5 shrink-0 text-warm-muted" />
        )}
      </div>
    </div>
  )
}

interface CourtCardListProps {
  courts: Court[]
  onSelect?: (court: Court) => void
  selectedId?: string
  emptyMessage?: string
  compact?: boolean
}

export function CourtCardList({
  courts,
  onSelect,
  selectedId,
  emptyMessage = 'No courts found',
  compact = false,
}: CourtCardListProps) {
  if (courts.length === 0) {
    return (
      <div className="text-center py-8 text-warm-muted">
        <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {courts.map((court) => (
        <CourtCard
          key={court.id}
          court={court}
          onSelect={onSelect}
          isSelected={court.id === selectedId}
          compact={compact}
        />
      ))}
    </div>
  )
}
