'use client'

import { cn } from '@/lib/utils'
import { FileText } from 'lucide-react'

export interface PetitionPreviewProps {
  data: {
    yourInfo?: { full_name?: string; address?: string }
    opposingParties?: Array<{ full_name?: string; address?: string }>
    courtType?: string
    county?: string | null
    state?: string
    description?: string
    incidentDate?: string
    disputeType?: string | null
    claimDetails?: string
    amountSought?: string
    otherRelief?: string
    requestAttorneyFees?: boolean
    requestCourtCosts?: boolean
    role?: string
  }
  activeField?: string
  onFieldClick?: (fieldPath: string) => void
  className?: string
}

const COURT_TYPE_LABELS: Record<string, string> = {
  JP: 'Justice Court',
  jp: 'Justice Court',
  county: 'County Court',
  district: 'District Court',
  federal: 'United States District Court',
}

const DISPUTE_TYPE_LABELS: Record<string, string> = {
  debt_collection: 'Debt Collection',
  personal_injury: 'Personal Injury',
  contract: 'Contract Dispute',
  property: 'Property Dispute',
  landlord_tenant: 'Landlord-Tenant',
  family: 'Family Law',
  small_claims: 'Small Claims',
  other: 'Other',
}

export function PetitionPreview({
  data,
  activeField,
  onFieldClick,
  className,
}: PetitionPreviewProps) {
  const isPlaintiff = data.role !== 'defendant'
  const documentTitle = isPlaintiff ? 'PETITION' : 'ANSWER'
  const partyLabel = isPlaintiff ? 'Plaintiff' : 'Defendant'
  const opposingLabel = isPlaintiff ? 'Defendant' : 'Plaintiff'

  const handleClick = (fieldPath: string) => {
    onFieldClick?.(fieldPath)
  }

  return (
    <div
      className={cn(
        'bg-white border border-warm-border rounded-lg p-6 font-serif text-sm shadow-sm',
        className
      )}
    >
      {/* Document Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-4">
          <FileText className="h-5 w-5 text-calm-indigo" />
          <span className="text-xs text-calm-indigo font-sans uppercase tracking-wider">
            Live Preview
          </span>
        </div>
        <p className="text-warm-text font-semibold">{documentTitle}</p>
      </div>

      {/* Court Info */}
      <div className="text-center mb-6 space-y-1">
        <p
          className={cn(
            'cursor-pointer hover:bg-calm-indigo/5 -mx-2 px-2 py-0.5 rounded transition-colors',
            activeField === 'court_type' && 'bg-calm-indigo/10'
          )}
          onClick={() => handleClick('court_type')}
        >
          {COURT_TYPE_LABELS[data.courtType ?? ''] ?? data.courtType ?? '[Court Type]'}
          {data.county && ` - ${data.county} County`}
          {data.state && `, ${data.state}`}
        </p>
      </div>

      {/* Divider */}
      <div className="border-b border-warm-border mb-6" />

      {/* Parties */}
      <div className="mb-6">
        {/* Plaintiff */}
        <div className="mb-4">
          <p
            className={cn(
              'cursor-pointer hover:bg-calm-indigo/5 -mx-2 px-2 py-0.5 rounded transition-colors',
              activeField?.startsWith('yourInfo') && 'bg-calm-indigo/10'
            )}
            onClick={() => handleClick('your_info')}
          >
            <span className="font-semibold">{partyLabel}:</span>{' '}
            <span className="text-warm-muted">
              {data.yourInfo?.full_name || '[Your Name]'}
            </span>
          </p>
          {data.yourInfo?.address && (
            <p className="text-warm-muted ml-4">
              {data.yourInfo.address}
            </p>
          )}
        </div>

        {/* vs */}
        <div className="text-center text-warm-muted mb-4">
          <span className="text-xs uppercase tracking-wider">vs.</span>
        </div>

        {/* Defendant */}
        <div>
          <p
            className={cn(
              'cursor-pointer hover:bg-calm-indigo/5 -mx-2 px-2 py-0.5 rounded transition-colors',
              activeField?.startsWith('opposingParties') && 'bg-calm-indigo/10'
            )}
            onClick={() => handleClick('opposing_parties')}
          >
            <span className="font-semibold">{opposingLabel}:</span>{' '}
            <span className="text-warm-muted">
              {data.opposingParties?.[0]?.full_name || '[Defendant Name]'}
            </span>
          </p>
          {data.opposingParties?.[0]?.address && (
            <p className="text-warm-muted ml-4">
              {data.opposingParties[0].address}
            </p>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="border-b border-warm-border mb-6" />

      {/* Cause No */}
      <div className="text-center mb-6 text-warm-muted">
        <p>Cause No. _______________</p>
      </div>

      {/* Claims Section */}
      {data.disputeType && (
        <div className="mb-6">
          <h3 className="font-semibold mb-2">NATURE OF CLAIM</h3>
          <p
            className={cn(
              'cursor-pointer hover:bg-calm-indigo/5 -mx-2 px-2 py-0.5 rounded transition-colors',
              activeField === 'dispute_type' && 'bg-calm-indigo/10'
            )}
            onClick={() => handleClick('dispute_type')}
          >
            {DISPUTE_TYPE_LABELS[data.disputeType] ?? data.disputeType}
          </p>
        </div>
      )}

      {/* Statement of Facts */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2">STATEMENT OF FACTS</h3>
        <p
          className={cn(
            'text-warm-muted leading-relaxed whitespace-pre-wrap cursor-pointer hover:bg-calm-indigo/5 -mx-2 px-2 py-2 rounded transition-colors',
            activeField === 'description' && 'bg-calm-indigo/10'
          )}
          onClick={() => handleClick('description')}
        >
          {data.description || '[Your statement of facts will appear here...]'}
        </p>
      </div>

      {/* Claim Details */}
      {data.claimDetails && (
        <div className="mb-6">
          <h3 className="font-semibold mb-2">CAUSES OF ACTION</h3>
          <p
            className={cn(
              'text-warm-muted leading-relaxed cursor-pointer hover:bg-calm-indigo/5 -mx-2 px-2 py-0.5 rounded transition-colors',
              activeField === 'claim_details' && 'bg-calm-indigo/10'
            )}
            onClick={() => handleClick('claim_details')}
          >
            {data.claimDetails}
          </p>
        </div>
      )}

      {/* Prayer for Relief */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2">PRAYER</h3>
        <p className="text-warm-muted mb-2">
          {isPlaintiff ? 'Plaintiff' : 'Defendant'} respectfully requests:
        </p>
        <ul className="list-disc pl-6 text-warm-muted space-y-1">
          {data.amountSought && (
            <li
              className={cn(
                'cursor-pointer hover:bg-calm-indigo/5 -mx-2 px-2 py-0.5 rounded transition-colors',
                activeField === 'amount_sought' && 'bg-calm-indigo/10'
              )}
              onClick={() => handleClick('amount_sought')}
            >
              Judgment in the amount of ${parseFloat(data.amountSought).toLocaleString()}
            </li>
          )}
          {data.requestCourtCosts && <li>Court costs</li>}
          {data.requestAttorneyFees && <li>Attorney&apos;s fees</li>}
          {data.otherRelief && (
            <li
              className={cn(
                'cursor-pointer hover:bg-calm-indigo/5 -mx-2 px-2 py-0.5 rounded transition-colors',
                activeField === 'other_relief' && 'bg-calm-indigo/10'
              )}
              onClick={() => handleClick('other_relief')}
            >
              {data.otherRelief}
            </li>
          )}
        </ul>
      </div>

      {/* Signature Lines */}
      <div className="mt-12 space-y-8">
        <div className="border-t border-warm-border pt-4">
          <p className="text-warm-muted">
            _______________________________________<br />
            {partyLabel} Signature
          </p>
          <p className="text-warm-muted mt-4">
            Date: _____________________
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-warm-border text-center">
        <p className="text-xs text-warm-muted">
          Draft generated by Lawyer Free — Not legal advice
        </p>
      </div>
    </div>
  )
}
