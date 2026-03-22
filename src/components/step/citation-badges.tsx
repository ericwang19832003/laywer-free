'use client'

import { useState } from 'react'
import { Check, AlertTriangle, X } from 'lucide-react'

interface Citation {
  citation: string
  status: 'verified' | 'format_valid' | 'unverifiable'
  type: string
  details?: string
}

interface CitationBadgesProps {
  citations: Citation[]
}

const STATUS_CONFIG = {
  verified: {
    icon: Check,
    label: 'Verified',
    badge: 'bg-calm-green/10 text-calm-green border-calm-green/20',
  },
  format_valid: {
    icon: AlertTriangle,
    label: 'Format Valid',
    badge: 'bg-calm-amber/10 text-calm-amber border-calm-amber/20',
  },
  unverifiable: {
    icon: X,
    label: 'Unverifiable',
    badge: 'bg-destructive/10 text-destructive border-destructive/20',
  },
} as const

function getTooltipText(citation: Citation): string {
  if (citation.status === 'verified' && citation.details) {
    return citation.details
  }
  if (citation.status === 'format_valid') {
    return (
      citation.details ??
      'This citation looks correct but could not be independently verified. Please check before filing.'
    )
  }
  return (
    citation.details ??
    'This reference could not be verified. Please verify before filing.'
  )
}

function CitationBadge({ citation }: { citation: Citation }) {
  const [showTooltip, setShowTooltip] = useState(false)
  const config = STATUS_CONFIG[citation.status]
  const Icon = config.icon
  const tooltip = getTooltipText(citation)

  return (
    <div className="relative inline-block">
      <button
        type="button"
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${config.badge}`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        aria-label={`${citation.citation} — ${config.label}: ${tooltip}`}
      >
        <Icon className="h-3 w-3 flex-shrink-0" />
        <span className="truncate max-w-[200px]">{citation.citation}</span>
      </button>

      {showTooltip && (
        <div
          role="tooltip"
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 max-w-xs rounded-md bg-warm-bg border border-warm-border px-3 py-2 text-xs text-warm-text shadow-md"
        >
          <p>{tooltip}</p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-warm-border" />
        </div>
      )}
    </div>
  )
}

export function CitationBadges({ citations }: CitationBadgesProps) {
  if (!citations.length) return null

  return (
    <div className="flex flex-wrap gap-2">
      {citations.map((citation, index) => (
        <CitationBadge
          key={`${citation.citation}-${index}`}
          citation={citation}
        />
      ))}
    </div>
  )
}
