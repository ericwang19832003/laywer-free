'use client'

import { Button } from '@/components/ui/button'
import {
  Pencil,
  User,
  MapPin,
  FileText,
  DollarSign,
  Clock,
  Mail,
} from 'lucide-react'
import type { DamageItem } from '@/lib/small-claims/damages-calculator'

interface PartyInfo {
  full_name: string
  address?: string
  city?: string
  state?: string
  zip?: string
}

interface TimelineEvent {
  date: string
  description: string
}

interface SmallClaimsReviewStepProps {
  claimSubType: string
  plaintiff: PartyInfo
  defendant: PartyInfo
  defendantIsBusiness: boolean
  defendantBusinessName: string
  claimDetails: Record<string, string | boolean>
  damageItems: DamageItem[]
  totalDamages: number
  timelineEvents: TimelineEvent[]
  demandLetterSent: boolean
  demandLetterDate: string
  deadlineDays: string
  preferredResolution: string
  defendantCounty: string
  incidentCounty: string
  precinct: string
  onEdit: (stepId: string) => void
}

function SectionCard({
  icon: Icon,
  title,
  stepId,
  onEdit,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  stepId: string
  onEdit: (stepId: string) => void
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
          onClick={() => onEdit(stepId)}
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

function formatAddress(info: PartyInfo): string {
  const parts: string[] = []
  if (info.address) parts.push(info.address)
  const cityStateZip = [info.city, info.state, info.zip].filter(Boolean).join(', ')
  if (cityStateZip) parts.push(cityStateZip)
  return parts.join(', ') || 'Not provided'
}

function subTypeLabel(subType: string): string {
  switch (subType) {
    case 'security_deposit': return 'Security Deposit'
    case 'breach_of_contract': return 'Breach of Contract'
    case 'consumer_refund': return 'Consumer Refund'
    case 'property_damage': return 'Property Damage'
    case 'car_accident': return 'Car Accident'
    case 'neighbor_dispute': return 'Neighbor Dispute'
    case 'unpaid_loan': return 'Unpaid Loan'
    case 'other': return 'Other'
    default: return subType.replace(/_/g, ' ')
  }
}

function getClaimDetailsSummary(
  claimSubType: string,
  details: Record<string, string | boolean>
): { label: string; value: string }[] {
  const fields: { label: string; value: string }[] = []
  const str = (key: string) => (details[key] as string) ?? ''

  switch (claimSubType) {
    case 'security_deposit':
      if (str('leaseStartDate')) fields.push({ label: 'Lease start', value: str('leaseStartDate') })
      if (str('leaseEndDate')) fields.push({ label: 'Lease end', value: str('leaseEndDate') })
      if (str('depositAmount')) fields.push({ label: 'Deposit amount', value: `$${str('depositAmount')}` })
      if (str('moveOutDate')) fields.push({ label: 'Move-out date', value: str('moveOutDate') })
      if (str('deductions')) fields.push({ label: 'Deductions', value: str('deductions') })
      break
    case 'breach_of_contract':
      if (str('contractDate')) fields.push({ label: 'Contract date', value: str('contractDate') })
      if (str('whatWasPromised')) fields.push({ label: 'What was promised', value: str('whatWasPromised') })
      if (str('whatHappened')) fields.push({ label: 'What happened', value: str('whatHappened') })
      if (str('breachDate')) fields.push({ label: 'Breach date', value: str('breachDate') })
      break
    case 'consumer_refund':
      if (str('purchaseDate')) fields.push({ label: 'Purchase date', value: str('purchaseDate') })
      if (str('productService')) fields.push({ label: 'Product/service', value: str('productService') })
      if (str('amountPaid')) fields.push({ label: 'Amount paid', value: `$${str('amountPaid')}` })
      if (str('whatWentWrong')) fields.push({ label: 'What went wrong', value: str('whatWentWrong') })
      if (str('refundAttempts')) fields.push({ label: 'Refund attempts', value: str('refundAttempts') })
      break
    case 'property_damage':
      if (str('whatWasDamaged')) fields.push({ label: 'What was damaged', value: str('whatWasDamaged') })
      if (str('damageDate')) fields.push({ label: 'Date of damage', value: str('damageDate') })
      if (str('howDamaged')) fields.push({ label: 'How damaged', value: str('howDamaged') })
      if (str('repairEstimates')) fields.push({ label: 'Repair estimates', value: str('repairEstimates') })
      break
    case 'car_accident':
      if (str('accidentDate')) fields.push({ label: 'Accident date', value: str('accidentDate') })
      if (str('accidentLocation')) fields.push({ label: 'Location', value: str('accidentLocation') })
      if (str('accidentDescription')) fields.push({ label: 'Description', value: str('accidentDescription') })
      if (str('faultReason')) fields.push({ label: 'Fault reason', value: str('faultReason') })
      fields.push({ label: 'Has insurance', value: details.hasInsurance ? 'Yes' : 'No' })
      break
    case 'neighbor_dispute':
      if (str('disputeNature')) fields.push({ label: 'Nature of dispute', value: str('disputeNature') })
      if (str('yourPropertyAddress')) fields.push({ label: 'Your address', value: str('yourPropertyAddress') })
      if (str('neighborPropertyAddress')) fields.push({ label: 'Neighbor address', value: str('neighborPropertyAddress') })
      if (str('disputeDuration')) fields.push({ label: 'Duration', value: str('disputeDuration') })
      if (str('resolutionAttempts')) fields.push({ label: 'Resolution attempts', value: str('resolutionAttempts') })
      break
    case 'unpaid_loan':
      if (str('loanDate')) fields.push({ label: 'Loan date', value: str('loanDate') })
      if (str('loanAmount')) fields.push({ label: 'Loan amount', value: `$${str('loanAmount')}` })
      if (str('loanTerms')) fields.push({ label: 'Loan terms', value: str('loanTerms') })
      if (str('paymentsMade')) fields.push({ label: 'Payments made', value: str('paymentsMade') })
      if (str('amountStillOwed')) fields.push({ label: 'Amount still owed', value: `$${str('amountStillOwed')}` })
      break
    case 'other':
    default:
      if (str('incidentDate')) fields.push({ label: 'Incident date', value: str('incidentDate') })
      if (str('claimDescription')) fields.push({ label: 'Description', value: str('claimDescription') })
      break
  }

  return fields
}

export function SmallClaimsReviewStep({
  claimSubType,
  plaintiff,
  defendant,
  defendantIsBusiness,
  defendantBusinessName,
  claimDetails,
  damageItems,
  totalDamages,
  timelineEvents,
  demandLetterSent,
  demandLetterDate,
  deadlineDays,
  preferredResolution,
  defendantCounty,
  incidentCounty,
  precinct,
  onEdit,
}: SmallClaimsReviewStepProps) {
  const detailFields = getClaimDetailsSummary(claimSubType, claimDetails)
  const hasTimeline = timelineEvents.length > 0 && timelineEvents.some((e) => e.date || e.description)

  return (
    <div className="space-y-4">
      <p className="text-sm text-warm-muted">
        Review the information below. Click &quot;Edit&quot; on any section to make changes.
        When everything looks right, click the button below to continue.
      </p>

      {/* Case type */}
      <div className="rounded-lg border border-calm-indigo/20 bg-calm-indigo/5 p-3">
        <p className="text-sm text-warm-text">
          <span className="text-warm-muted">Claim type:</span>{' '}
          <span className="font-medium">{subTypeLabel(claimSubType)}</span>
        </p>
      </div>

      {/* Parties */}
      <SectionCard icon={User} title="Parties" stepId="parties" onEdit={onEdit}>
        <dl className="space-y-3">
          <ReviewField label="Plaintiff (you)" value={plaintiff.full_name} />
          <ReviewField label="Your address" value={formatAddress(plaintiff)} />
          <ReviewField label="Defendant" value={defendant.full_name} />
          <ReviewField label="Their address" value={formatAddress(defendant)} />
          {defendantIsBusiness && (
            <ReviewField label="Business name" value={defendantBusinessName} />
          )}
        </dl>
      </SectionCard>

      {/* Claim Details */}
      <SectionCard icon={FileText} title="Claim Details" stepId="claim-details" onEdit={onEdit}>
        <dl className="space-y-3">
          {detailFields.map((field) => (
            <div key={field.label}>
              <dt className="text-xs text-warm-muted">{field.label}</dt>
              <dd className="text-sm text-warm-text mt-0.5 whitespace-pre-wrap">
                {field.value || <span className="italic text-warm-muted">Not provided</span>}
              </dd>
            </div>
          ))}
          {detailFields.length === 0 && (
            <p className="text-sm italic text-warm-muted">No details provided</p>
          )}
        </dl>
      </SectionCard>

      {/* Damages */}
      <SectionCard icon={DollarSign} title="Damages" stepId="damages" onEdit={onEdit}>
        <div className="space-y-3">
          {damageItems.filter((item) => item.amount > 0).map((item, i) => (
            <div key={i} className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm text-warm-text">{item.category || 'Unnamed item'}</p>
                {item.description && (
                  <p className="text-xs text-warm-muted">{item.description}</p>
                )}
              </div>
              <span className="text-sm font-medium text-warm-text shrink-0">
                ${item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          ))}
          <div className="border-t border-warm-border pt-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-warm-text">Total</span>
            <span className="text-lg font-semibold text-warm-text">
              ${totalDamages.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </SectionCard>

      {/* Timeline (conditional) */}
      {hasTimeline && (
        <SectionCard icon={Clock} title="Timeline" stepId="timeline" onEdit={onEdit}>
          <div className="space-y-2">
            {timelineEvents
              .filter((e) => e.date || e.description)
              .sort((a, b) => (a.date || '').localeCompare(b.date || ''))
              .map((event, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-xs text-warm-muted shrink-0 w-24">
                    {event.date || 'No date'}
                  </span>
                  <p className="text-sm text-warm-text">{event.description}</p>
                </div>
              ))}
          </div>
        </SectionCard>
      )}

      {/* Demand Letter */}
      <SectionCard icon={Mail} title="Demand Letter" stepId="demand-letter" onEdit={onEdit}>
        <dl className="space-y-3">
          <ReviewField
            label="Demand letter sent?"
            value={demandLetterSent ? 'Yes' : 'Not yet'}
          />
          {demandLetterSent ? (
            <>
              <ReviewField label="Date sent" value={demandLetterDate} />
              <div>
                <dt className="text-xs text-warm-muted">Response received</dt>
                <dd className="text-sm text-warm-text mt-0.5 whitespace-pre-wrap">
                  {preferredResolution || (
                    <span className="italic text-warm-muted">Not provided</span>
                  )}
                </dd>
              </div>
            </>
          ) : (
            <>
              <ReviewField
                label="Deadline for response"
                value={deadlineDays ? `${deadlineDays} days` : undefined}
              />
              <div>
                <dt className="text-xs text-warm-muted">Preferred resolution</dt>
                <dd className="text-sm text-warm-text mt-0.5 whitespace-pre-wrap">
                  {preferredResolution || (
                    <span className="italic text-warm-muted">Not provided</span>
                  )}
                </dd>
              </div>
            </>
          )}
        </dl>
      </SectionCard>

      {/* Venue */}
      <SectionCard icon={MapPin} title="Venue" stepId="venue" onEdit={onEdit}>
        <dl className="space-y-3">
          <ReviewField label="Defendant's county" value={defendantCounty} />
          {incidentCounty && (
            <ReviewField label="Incident county" value={incidentCounty} />
          )}
          {precinct && (
            <ReviewField label="JP Court precinct" value={precinct} />
          )}
        </dl>
      </SectionCard>
    </div>
  )
}
