'use client'

import { Button } from '@/components/ui/button'
import {
  Pencil,
  User,
  MapPin,
  Home,
  FileText,
  DollarSign,
  Clock,
  Mail,
  Wrench,
  ShieldAlert,
  Receipt,
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

interface RepairRequest {
  date: string
  issue: string
  response: string
  status: string
}

interface Deduction {
  amount: number
  reason: string
}

interface LtReviewStepProps {
  subType: string
  partyRole: string
  landlordInfo: PartyInfo
  tenantInfo: PartyInfo
  propertyAddress: string
  propertyType: string
  unitNumber: string
  leaseStartDate: string
  leaseEndDate: string
  leaseType: string
  monthlyRent: string
  damageItems: DamageItem[]
  totalDamages: number
  depositAmount: string
  noticeDate: string
  noticeType: string
  evictionReason: string
  tenantCured: string
  repairRequests: RepairRequest[]
  deductions: Deduction[]
  timelineEvents: TimelineEvent[]
  demandLetterSent: boolean
  demandLetterDate: string
  deadlineDays: string
  preferredResolution: string
  propertyCounty: string
  defendantCounty: string
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
    case 'eviction': return 'Eviction'
    case 'security_deposit': return 'Security Deposit'
    case 'repair': return 'Repair / Maintenance'
    case 'habitability': return 'Habitability'
    case 'property_damage': return 'Property Damage'
    case 'nonpayment': return 'Nonpayment of Rent'
    case 'lease_termination': return 'Lease Termination'
    default: return subType.replace(/_/g, ' ')
  }
}

function leaseTypeLabel(leaseType: string): string {
  switch (leaseType) {
    case 'fixed_term': return 'Fixed-term lease'
    case 'month_to_month': return 'Month-to-month'
    case 'oral': return 'Oral (verbal) agreement'
    default: return leaseType || 'Not specified'
  }
}

function noticeTypeLabel(noticeType: string): string {
  switch (noticeType) {
    case '3_day_pay_or_quit': return '3-Day Pay or Quit'
    case '30_day': return '30-Day Notice'
    case 'cure_or_quit': return 'Cure or Quit'
    case 'unconditional_quit': return 'Unconditional Quit'
    default: return noticeType || 'Not specified'
  }
}

function evictionReasonLabel(reason: string): string {
  switch (reason) {
    case 'nonpayment': return 'Nonpayment of rent'
    case 'lease_violation': return 'Lease violation'
    case 'holdover': return 'Holdover (lease expired)'
    case 'criminal_activity': return 'Criminal activity'
    default: return reason || 'Not specified'
  }
}

function statusLabel(status: string): string {
  switch (status) {
    case 'pending': return 'Pending'
    case 'completed': return 'Completed'
    case 'ignored': return 'Ignored'
    case 'partial': return 'Partially completed'
    default: return status || 'Not specified'
  }
}

function propertyTypeLabel(type: string): string {
  switch (type) {
    case 'house': return 'House'
    case 'apartment': return 'Apartment'
    case 'condo': return 'Condo'
    case 'commercial': return 'Commercial'
    case 'other': return 'Other'
    default: return type || 'Not specified'
  }
}

export function LtReviewStep({
  subType,
  partyRole,
  landlordInfo,
  tenantInfo,
  propertyAddress,
  propertyType,
  unitNumber,
  leaseStartDate,
  leaseEndDate,
  leaseType,
  monthlyRent,
  damageItems,
  totalDamages,
  depositAmount,
  noticeDate,
  noticeType,
  evictionReason,
  tenantCured,
  repairRequests,
  deductions,
  timelineEvents,
  demandLetterSent,
  demandLetterDate,
  deadlineDays,
  preferredResolution,
  propertyCounty,
  defendantCounty,
  onEdit,
}: LtReviewStepProps) {
  const hasTimeline = timelineEvents.length > 0 && timelineEvents.some((e) => e.date || e.description)
  const hasRepairRequests = repairRequests.length > 0 && repairRequests.some((r) => r.issue || r.date)
  const hasDeductions = deductions.length > 0 && deductions.some((d) => d.amount > 0 || d.reason)
  const isEviction = subType === 'eviction'
  const isRepairOrHabitability = subType === 'repair' || subType === 'habitability'
  const isSecurityDeposit = subType === 'security_deposit'
  const yourInfo = partyRole === 'landlord' ? landlordInfo : tenantInfo
  const otherInfo = partyRole === 'landlord' ? tenantInfo : landlordInfo

  const missingItems: string[] = []
  if (!yourInfo.full_name) missingItems.push('Your name')
  if (!otherInfo.full_name) missingItems.push('Other party name')
  if (!propertyAddress) missingItems.push('Property address')
  if (totalDamages <= 0) missingItems.push('Financial damages')
  if (!propertyCounty) missingItems.push('Venue selection')

  return (
    <div className="space-y-4">
      <p className="text-sm text-warm-muted">
        Review the information below. Click &quot;Edit&quot; on any section to make changes.
        When everything looks right, click the button below to continue.
      </p>

      {missingItems.length > 0 && (
        <div className="rounded-lg border border-calm-amber/40 bg-calm-amber/5 p-4">
          <p className="text-sm font-semibold text-warm-text">Some sections look incomplete</p>
          <p className="text-xs text-warm-muted mt-1">
            You can still continue, but filling these in helps your filing go smoothly.
          </p>
          <ul className="mt-2 space-y-1 text-sm text-warm-text">
            {missingItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-lg border border-calm-indigo/20 bg-calm-indigo/5 p-4">
        <p className="text-sm font-semibold text-warm-text">Key totals</p>
        <div className="mt-2 grid gap-2 text-sm text-warm-text sm:grid-cols-2">
          <div>
            <span className="text-xs text-warm-muted">Total damages</span>
            <p className="font-semibold">
              ${totalDamages.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <span className="text-xs text-warm-muted">Line items</span>
            <p className="font-semibold">
              {damageItems.filter((item) => item.amount > 0).length}
            </p>
          </div>
          <div>
            <span className="text-xs text-warm-muted">Timeline events</span>
            <p className="font-semibold">
              {timelineEvents.filter((event) => event.date || event.description).length} events
            </p>
          </div>
          <div>
            <span className="text-xs text-warm-muted">Demand letter</span>
            <p className="font-semibold">{demandLetterSent ? 'Sent' : 'Not sent'}</p>
          </div>
        </div>
      </div>

      {/* Case type */}
      <div className="rounded-lg border border-calm-indigo/20 bg-calm-indigo/5 p-3">
        <p className="text-sm text-warm-text">
          <span className="text-warm-muted">Case type:</span>{' '}
          <span className="font-medium">{subTypeLabel(subType)}</span>
          <span className="text-warm-muted"> &middot; Role:</span>{' '}
          <span className="font-medium capitalize">{partyRole}</span>
        </p>
      </div>

      {/* Parties */}
      <SectionCard icon={User} title="Parties" stepId="parties" onEdit={onEdit}>
        <dl className="space-y-3">
          <ReviewField label={`${partyRole === 'landlord' ? 'Landlord' : 'Tenant'} (you)`} value={yourInfo.full_name} />
          <ReviewField label="Your address" value={formatAddress(yourInfo)} />
          <ReviewField label={partyRole === 'landlord' ? 'Tenant' : 'Landlord'} value={otherInfo.full_name} />
          <ReviewField label="Their address" value={formatAddress(otherInfo)} />
        </dl>
      </SectionCard>

      {/* Property */}
      <SectionCard icon={Home} title="Property" stepId="property" onEdit={onEdit}>
        <dl className="space-y-3">
          <ReviewField label="Property address" value={propertyAddress} />
          <ReviewField label="Property type" value={propertyTypeLabel(propertyType)} />
          {unitNumber && <ReviewField label="Unit number" value={unitNumber} />}
        </dl>
      </SectionCard>

      {/* Lease (conditional — shown for most sub-types) */}
      {(leaseType || leaseStartDate || monthlyRent) && (
        <SectionCard icon={FileText} title="Lease Details" stepId="lease" onEdit={onEdit}>
          <dl className="space-y-3">
            <ReviewField label="Lease type" value={leaseTypeLabel(leaseType)} />
            {leaseStartDate && <ReviewField label="Lease start" value={leaseStartDate} />}
            {leaseEndDate && <ReviewField label="Lease end" value={leaseEndDate} />}
            {monthlyRent && <ReviewField label="Monthly rent" value={`$${monthlyRent}`} />}
          </dl>
        </SectionCard>
      )}

      {/* Financial */}
      <SectionCard icon={DollarSign} title="Financial Damages" stepId="financial" onEdit={onEdit}>
        <div className="space-y-3">
          {isSecurityDeposit && depositAmount && (
            <div className="pb-2 border-b border-warm-border">
              <ReviewField label="Security deposit paid" value={`$${depositAmount}`} />
            </div>
          )}
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

      {/* Eviction Notice (conditional) */}
      {isEviction && (noticeDate || noticeType || evictionReason) && (
        <SectionCard icon={ShieldAlert} title="Eviction Notice" stepId="eviction-notice" onEdit={onEdit}>
          <dl className="space-y-3">
            {noticeDate && <ReviewField label="Notice date" value={noticeDate} />}
            {noticeType && <ReviewField label="Notice type" value={noticeTypeLabel(noticeType)} />}
            {evictionReason && <ReviewField label="Reason" value={evictionReasonLabel(evictionReason)} />}
            {noticeType === 'cure_or_quit' && tenantCured && (
              <ReviewField label="Tenant cured?" value={tenantCured === 'yes' ? 'Yes' : 'No'} />
            )}
          </dl>
        </SectionCard>
      )}

      {/* Repair History (conditional) */}
      {isRepairOrHabitability && hasRepairRequests && (
        <SectionCard icon={Wrench} title="Repair History" stepId="repair-history" onEdit={onEdit}>
          <div className="space-y-3">
            {repairRequests
              .filter((r) => r.issue || r.date)
              .map((request, i) => (
                <div key={i} className="rounded-lg border border-warm-border p-3">
                  <div className="flex items-start gap-3">
                    <span className="text-xs text-warm-muted shrink-0 w-24">
                      {request.date || 'No date'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-warm-text">{request.issue}</p>
                      {request.response && (
                        <p className="text-xs text-warm-muted mt-1">Response: {request.response}</p>
                      )}
                      {request.status && (
                        <p className="text-xs text-warm-muted">Status: {statusLabel(request.status)}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </SectionCard>
      )}

      {/* Deposit Deductions (conditional) */}
      {isSecurityDeposit && hasDeductions && (
        <SectionCard icon={Receipt} title="Deposit Deductions" stepId="deposit-deductions" onEdit={onEdit}>
          <div className="space-y-3">
            {deductions
              .filter((d) => d.amount > 0 || d.reason)
              .map((deduction, i) => (
                <div key={i} className="flex items-start justify-between gap-2">
                  <p className="text-sm text-warm-text">{deduction.reason || 'Unnamed deduction'}</p>
                  <span className="text-sm font-medium text-warm-text shrink-0">
                    ${deduction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            <div className="border-t border-warm-border pt-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-warm-text">Total deductions</span>
              <span className="text-sm font-semibold text-warm-text">
                ${deductions.reduce((sum, d) => sum + (d.amount || 0), 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </SectionCard>
      )}

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
          <ReviewField label="Property county" value={propertyCounty} />
          {defendantCounty && (
            <ReviewField label="Other party's county" value={defendantCounty} />
          )}
        </dl>
      </SectionCard>
    </div>
  )
}
