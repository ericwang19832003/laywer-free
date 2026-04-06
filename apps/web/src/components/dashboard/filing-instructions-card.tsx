'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'
import {
  STATE_FILING_INFO,
} from '@lawyer-free/shared/guided-steps/personal-injury/state-filing-info'
import {
  FILING_CONFIGS,
  getEFilingUrl,
  getStateFeeRange,
  getCourtLabel,
  getStateName,
} from '@/lib/filing-configs'

interface FilingInstructionsCardProps {
  state: string
  courtType: string
  county: string | null
  disputeType: string
}

export function FilingInstructionsCard({
  state,
  courtType,
  county,
  disputeType,
}: FilingInstructionsCardProps) {
  const [expanded, setExpanded] = useState(false)

  const stateInfo = STATE_FILING_INFO[state]
  if (!stateInfo) return null

  // Skip if court type is unknown — user hasn't selected one yet
  if (courtType === 'unknown') return null

  const courtInfo = stateInfo.courts[courtType]
  const filingConfig = FILING_CONFIGS[disputeType] ?? FILING_CONFIGS.other
  const eFilingUrl = getEFilingUrl(state, filingConfig)
  const feeRange = getStateFeeRange(state, courtType)
  const courtLabel = getCourtLabel(state, courtType)
  const stateName = getStateName(state)

  return (
    <Card>
      <CardContent className="pt-5 pb-4 px-5">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="h-4 w-4 text-calm-indigo" />
          <h3 className="text-sm font-semibold text-warm-text">Filing Instructions</h3>
        </div>

        {/* Quick reference */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="rounded-md bg-warm-bg px-3 py-2">
            <p className="text-xs text-warm-muted">Court</p>
            <p className="text-sm font-medium text-warm-text">{courtLabel}</p>
            {county && (
              <p className="text-xs text-warm-muted">{county} County, {stateName}</p>
            )}
          </div>
          <div className="rounded-md bg-warm-bg px-3 py-2">
            <p className="text-xs text-warm-muted">Filing Fee</p>
            <p className="text-sm font-medium text-warm-text">{feeRange}</p>
            {stateInfo.feeWaiverForm && (
              <p className="text-xs text-warm-muted">Fee waiver available</p>
            )}
          </div>
        </div>

        {/* Filing methods */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {stateInfo.filingMethods.map((method) => (
            <span
              key={method}
              className="text-xs bg-calm-indigo/10 text-calm-indigo px-2 py-0.5 rounded-full"
            >
              {method}
            </span>
          ))}
        </div>

        {/* E-filing link */}
        {eFilingUrl && (
          <a
            href={eFilingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-calm-indigo hover:underline mb-3"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {stateInfo.eFilingSystem?.name ?? 'E-File Online'}
            {stateInfo.eFilingSystem?.mandatory && (
              <span className="text-xs text-warm-muted ml-1">(mandatory for attorneys)</span>
            )}
          </a>
        )}

        {/* Expandable step-by-step instructions */}
        {courtInfo?.filingSteps && courtInfo.filingSteps.length > 0 && (
          <div>
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-xs font-medium text-warm-muted hover:text-warm-text transition-colors"
            >
              {expanded ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
              {expanded ? 'Hide' : 'Show'} step-by-step instructions
            </button>

            {expanded && (
              <ol className="mt-2 space-y-2 pl-5 list-decimal">
                {courtInfo.filingSteps.map((step, i) => (
                  <li key={i} className="text-xs text-warm-text leading-relaxed">
                    {step}
                  </li>
                ))}
              </ol>
            )}
          </div>
        )}

        {/* Fee waiver info */}
        {expanded && stateInfo.feeWaiverForm && (
          <div className="mt-3 rounded-md border border-warm-border bg-warm-bg px-3 py-2">
            <p className="text-xs font-medium text-warm-text">Fee Waiver</p>
            <p className="text-xs text-warm-muted mt-0.5">
              {stateInfo.feeWaiverForm}
              {stateInfo.feeWaiverRule && (
                <span className="italic"> ({stateInfo.feeWaiverRule})</span>
              )}
            </p>
          </div>
        )}

        {/* Court selection guide */}
        {expanded && stateInfo.courtSelectionGuide && (
          <div className="mt-2 rounded-md border border-warm-border bg-warm-bg px-3 py-2">
            <p className="text-xs font-medium text-warm-text">Court Selection Guide</p>
            <p className="text-xs text-warm-muted mt-0.5">
              {stateInfo.courtSelectionGuide}
            </p>
          </div>
        )}

        {/* Special requirements */}
        {courtInfo?.specialRequirements && (
          <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2">
            <p className="text-xs text-amber-800">{courtInfo.specialRequirements}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
