'use client'

import { Button } from '@/components/ui/button'
import { Pencil, AlertTriangle, User, MapPin, FileText, Scale, DollarSign } from 'lucide-react'

interface PartyInfo {
  full_name: string
  address?: string
  city?: string
  state?: string
  zip?: string
}

interface FormData {
  yourInfo: PartyInfo
  opposingParties: PartyInfo[]
  description: string
  incidentDate: string
  incidentLocation: string
  claimDetails: string
  amountSought: string
  otherRelief: string
  requestAttorneyFees: boolean
  requestCourtCosts: boolean
  defendantCounty: string
  incidentCounty: string
  propertyCounty: string
  contractCounty: string
}

interface ReviewStepProps {
  formData: FormData
  caseData: {
    court_type: string
    county: string | null
    dispute_type: string | null
    government_entity?: boolean
  }
  onEditStep: (stepIndex: number) => void
}

function courtTypeLabel(courtType: string): string {
  switch (courtType) {
    case 'jp':
    case 'JP':
      return 'JP Court'
    case 'county':
    case 'County':
      return 'County Court'
    case 'district':
    case 'District':
      return 'District Court'
    case 'federal':
    case 'Federal':
      return 'Federal Court'
    default:
      return courtType
  }
}

function formatAddress(info: PartyInfo): string {
  const parts: string[] = []
  if (info.address) parts.push(info.address)
  const cityStateZip = [info.city, info.state, info.zip].filter(Boolean).join(', ')
  if (cityStateZip) parts.push(cityStateZip)
  return parts.join(', ') || 'Not provided'
}

function SectionCard({
  icon: Icon,
  title,
  stepIndex,
  onEdit,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  stepIndex: number
  onEdit: (stepIndex: number) => void
  children: React.ReactNode
}) {
  return (
    <div className="rounded-lg border border-warm-border p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-calm-indigo" />
          <h3 className="text-sm font-semibold text-warm-text">{title}</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(stepIndex)}
          className="text-xs text-calm-indigo hover:text-calm-indigo/80 h-auto py-1 px-2"
        >
          <Pencil className="h-3 w-3 mr-1" />
          Edit
        </Button>
      </div>
      {children}
    </div>
  )
}

function ReviewField({ label, value }: { label: string; value: string | undefined | null }) {
  return (
    <div>
      <dt className="text-xs text-warm-muted">{label}</dt>
      <dd className="text-sm text-warm-text mt-0.5">
        {value || <span className="italic text-warm-muted">Not provided</span>}
      </dd>
    </div>
  )
}

export function ReviewStep({ formData, caseData, onEditStep }: ReviewStepProps) {
  const {
    yourInfo,
    opposingParties,
    description,
    incidentDate,
    incidentLocation,
    claimDetails,
    amountSought,
    otherRelief,
    requestAttorneyFees,
    requestCourtCosts,
    defendantCounty,
  } = formData

  const formattedAmount = amountSought
    ? `$${parseFloat(amountSought).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : null

  return (
    <div className="space-y-4">
      <p className="text-sm text-warm-muted">
        Review the information below. Click &quot;Edit&quot; on any section to make changes.
        When everything looks right, click &quot;Generate My Petition&quot; below.
      </p>

      {/* Government entity warning */}
      {caseData.government_entity && (
        <div className="rounded-lg border border-calm-amber/40 bg-calm-amber/5 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-calm-amber shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-warm-text">Government Entity Involved</p>
              <p className="text-sm text-warm-muted mt-1">
                Suing a government entity in Texas may require you to file a notice of claim
                before filing suit. Check the Texas Tort Claims Act requirements. This tool
                cannot provide legal advice on government immunity issues.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Parties */}
      <SectionCard icon={User} title="Parties" stepIndex={1} onEdit={onEditStep}>
        <dl className="space-y-3">
          <ReviewField label="Your name" value={yourInfo.full_name} />
          <ReviewField label="Your address" value={formatAddress(yourInfo)} />
          {opposingParties.map((party, i) => (
            <div key={i}>
              <ReviewField
                label={opposingParties.length > 1 ? `Opposing party ${i + 1}` : 'Opposing party'}
                value={party.full_name}
              />
              {party.address && (
                <ReviewField label="Their address" value={party.address} />
              )}
            </div>
          ))}
        </dl>
      </SectionCard>

      {/* Venue */}
      <SectionCard icon={MapPin} title="Court & Venue" stepIndex={2} onEdit={onEditStep}>
        <dl className="space-y-3">
          <ReviewField
            label="Court type"
            value={courtTypeLabel(caseData.court_type)}
          />
          <ReviewField label="County" value={caseData.county} />
          {defendantCounty && (
            <ReviewField label="Defendant's county" value={defendantCounty} />
          )}
          {caseData.dispute_type && (
            <ReviewField label="Dispute type" value={caseData.dispute_type.replace(/_/g, ' ')} />
          )}
        </dl>
      </SectionCard>

      {/* Facts */}
      <SectionCard icon={FileText} title="What Happened" stepIndex={3} onEdit={onEditStep}>
        <dl className="space-y-3">
          <div>
            <dt className="text-xs text-warm-muted">Your description</dt>
            <dd className="text-sm text-warm-text mt-0.5 whitespace-pre-wrap">
              {description || <span className="italic text-warm-muted">Not provided</span>}
            </dd>
          </div>
          <ReviewField label="When" value={incidentDate} />
          <ReviewField label="Where" value={incidentLocation} />
        </dl>
      </SectionCard>

      {/* Claims */}
      <SectionCard icon={Scale} title="Legal Basis" stepIndex={4} onEdit={onEditStep}>
        <dl className="space-y-3">
          <div>
            <dt className="text-xs text-warm-muted">Claim details</dt>
            <dd className="text-sm text-warm-text mt-0.5 whitespace-pre-wrap">
              {claimDetails || <span className="italic text-warm-muted">Not provided (optional)</span>}
            </dd>
          </div>
        </dl>
      </SectionCard>

      {/* Relief */}
      <SectionCard icon={DollarSign} title="What You Want" stepIndex={5} onEdit={onEditStep}>
        <dl className="space-y-3">
          <ReviewField label="Amount sought" value={formattedAmount} />
          <ReviewField label="Other relief" value={otherRelief} />
          <div>
            <dt className="text-xs text-warm-muted">Additional requests</dt>
            <dd className="text-sm text-warm-text mt-0.5">
              {[
                requestCourtCosts && 'Court costs',
                requestAttorneyFees && 'Attorney fees',
              ]
                .filter(Boolean)
                .join(', ') || 'None'}
            </dd>
          </div>
        </dl>
      </SectionCard>
    </div>
  )
}
