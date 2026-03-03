'use client'

import { Button } from '@/components/ui/button'
import {
  Pencil,
  User,
  MapPin,
  FileText,
  Scale,
  DollarSign,
  Heart,
  Home,
  AlertTriangle,
  Shield,
  Baby,
  Gavel,
} from 'lucide-react'

interface FamilyReviewStepProps {
  familySubType: string
  formData: Record<string, unknown>
  onEditStep: (stepIndex: number) => void
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

interface PartyInfo {
  full_name: string
  address?: string
  city?: string
  state?: string
  zip?: string
}

interface ChildInfo {
  name: string
  date_of_birth: string
  relationship: string
}

function formatAddress(info: PartyInfo): string {
  const parts: string[] = []
  if (info.address) parts.push(info.address)
  const cityStateZip = [info.city, info.state, info.zip].filter(Boolean).join(', ')
  if (cityStateZip) parts.push(cityStateZip)
  return parts.join(', ') || 'Not provided'
}

function formatRelationship(r: string): string {
  switch (r) {
    case 'biological': return 'Biological'
    case 'adopted': return 'Adopted'
    case 'step': return 'Step-child'
    default: return r
  }
}

function subTypeLabel(subType: string): string {
  switch (subType) {
    case 'divorce': return 'Divorce'
    case 'custody': return 'Custody'
    case 'child_support': return 'Child Support'
    case 'visitation': return 'Visitation'
    case 'spousal_support': return 'Spousal Support'
    case 'modification': return 'Modification'
    case 'protective_order': return 'Protective Order'
    default: return subType.replace(/_/g, ' ')
  }
}

function arrangementLabel(v: string): string {
  switch (v) {
    case 'joint_managing': return 'Joint Managing Conservators'
    case 'sole_managing': return 'Sole Managing Conservator'
    case 'possessory': return 'Possessory Conservator'
    default: return v
  }
}

export function FamilyReviewStep({
  familySubType,
  formData,
  onEditStep,
}: FamilyReviewStepProps) {
  const petitioner = formData.petitioner as PartyInfo | undefined
  const respondent = formData.respondent as PartyInfo | undefined
  const children = formData.children as ChildInfo[] | undefined

  const isDivorce = familySubType === 'divorce'
  const isSpousal = ['divorce', 'spousal_support'].includes(familySubType)
  const hasChildren = ['divorce', 'custody', 'child_support', 'visitation', 'modification'].includes(familySubType)
  const hasCustody = ['divorce', 'custody', 'visitation', 'modification'].includes(familySubType)
  const hasChildSupport = ['divorce', 'custody', 'child_support', 'modification'].includes(familySubType)
  const isModification = familySubType === 'modification'
  const isProtectiveOrder = familySubType === 'protective_order'
  const isDVFlagged = Boolean(formData.dvFlag) || isProtectiveOrder

  return (
    <div className="space-y-4">
      <p className="text-sm text-warm-muted">
        Review the information below. Click &quot;Edit&quot; on any section to make changes.
        When everything looks right, click the button below to continue.
      </p>

      {/* Case type */}
      <div className="rounded-lg border border-calm-indigo/20 bg-calm-indigo/5 p-3">
        <p className="text-sm text-warm-text">
          <span className="text-warm-muted">Case type:</span>{' '}
          <span className="font-medium">{subTypeLabel(familySubType)}</span>
        </p>
      </div>

      {/* DV / safety reminder */}
      {isDVFlagged && (
        <div className="rounded-lg border border-calm-amber/40 bg-calm-amber/5 p-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-calm-amber shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-warm-text">Safety Reminder</p>
              <p className="text-sm text-warm-muted mt-1">
                This case involves domestic violence concerns. If you are in immediate danger,
                call 911. National DV Hotline: 1-800-799-7233 (24/7, free, confidential).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Parties */}
      <SectionCard icon={User} title="Parties" stepIndex={1} onEdit={onEditStep}>
        <dl className="space-y-3">
          <ReviewField label="Petitioner (you)" value={petitioner?.full_name} />
          <ReviewField label="Your address" value={petitioner ? formatAddress(petitioner) : undefined} />
          <ReviewField label="Respondent" value={respondent?.full_name} />
          <ReviewField label="Their address" value={respondent ? formatAddress(respondent) : undefined} />
        </dl>
      </SectionCard>

      {/* Marriage info (divorce / spousal support) */}
      {isSpousal && (
        <SectionCard icon={Heart} title="Marriage Information" stepIndex={2} onEdit={onEditStep}>
          <dl className="space-y-3">
            <ReviewField label="Marriage date" value={formData.marriageDate as string} />
            <ReviewField label="Separation date" value={formData.separationDate as string} />
            <ReviewField
              label="Marriage location"
              value={
                (formData.marriageCounty || formData.marriageState)
                  ? `${formData.marriageCounty || ''}${formData.marriageCounty && formData.marriageState ? ', ' : ''}${formData.marriageState || ''}`
                  : undefined
              }
            />
            <ReviewField
              label="County residency"
              value={
                formData.countyMonths !== undefined && formData.countyMonths !== ''
                  ? `${formData.countyMonths} months`
                  : undefined
              }
            />
            <ReviewField
              label="State residency"
              value={
                formData.stateMonths !== undefined && formData.stateMonths !== ''
                  ? `${formData.stateMonths} months`
                  : undefined
              }
            />
          </dl>
        </SectionCard>
      )}

      {/* Children */}
      {hasChildren && children && children.length > 0 && (
        <SectionCard icon={Baby} title="Children" stepIndex={3} onEdit={onEditStep}>
          <div className="space-y-3">
            {children.map((child, i) => (
              <div key={i} className="rounded-md border border-warm-border/50 p-3">
                <dl className="space-y-1">
                  <ReviewField label={`Child ${i + 1}`} value={child.name} />
                  <ReviewField label="Date of birth" value={child.date_of_birth} />
                  <ReviewField label="Relationship" value={formatRelationship(child.relationship)} />
                </dl>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Venue */}
      <SectionCard icon={MapPin} title="Venue" stepIndex={4} onEdit={onEditStep}>
        <dl className="space-y-3">
          <ReviewField label="Your county" value={formData.petitionerCounty as string} />
          {hasChildren && (
            <ReviewField label="Children's county" value={formData.childrenCounty as string} />
          )}
        </dl>
      </SectionCard>

      {/* Grounds / Facts */}
      <SectionCard icon={FileText} title="Grounds / Facts" stepIndex={5} onEdit={onEditStep}>
        <dl className="space-y-3">
          {isDivorce && (
            <ReviewField
              label="Divorce grounds"
              value={
                (formData.divorceGroundsType as string) === 'insupportability'
                  ? 'Insupportability (no-fault)'
                  : (formData.divorceGroundsType as string)?.replace(/_/g, ' ')
              }
            />
          )}
          <div>
            <dt className="text-xs text-warm-muted">
              {isDivorce ? 'Grounds description' : 'Situation description'}
            </dt>
            <dd className="text-sm text-warm-text mt-0.5 whitespace-pre-wrap">
              {(formData.grounds as string) || (
                <span className="italic text-warm-muted">Not provided</span>
              )}
            </dd>
          </div>
          {(formData.additionalFacts as string) && (
            <div>
              <dt className="text-xs text-warm-muted">Additional facts</dt>
              <dd className="text-sm text-warm-text mt-0.5 whitespace-pre-wrap">
                {formData.additionalFacts as string}
              </dd>
            </div>
          )}
        </dl>
      </SectionCard>

      {/* Custody arrangement */}
      {hasCustody && (formData.arrangement as string) && (
        <SectionCard icon={Scale} title="Custody Arrangement" stepIndex={6} onEdit={onEditStep}>
          <dl className="space-y-3">
            <ReviewField
              label="Arrangement"
              value={arrangementLabel(formData.arrangement as string)}
            />
            <div>
              <dt className="text-xs text-warm-muted">Reasoning</dt>
              <dd className="text-sm text-warm-text mt-0.5 whitespace-pre-wrap">
                {(formData.reasoning as string) || (
                  <span className="italic text-warm-muted">Not provided</span>
                )}
              </dd>
            </div>
          </dl>
        </SectionCard>
      )}

      {/* Child support */}
      {hasChildSupport && (formData.grossIncome as string) && (
        <SectionCard icon={DollarSign} title="Child Support" stepIndex={7} onEdit={onEditStep}>
          <dl className="space-y-3">
            <ReviewField
              label="Gross monthly income"
              value={
                (formData.grossIncome as string)
                  ? `$${parseFloat(formData.grossIncome as string).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                  : undefined
              }
            />
            <ReviewField
              label="Number of children"
              value={String(formData.numberOfChildren ?? '')}
            />
            <ReviewField
              label="Amount type"
              value={(formData.useGuidelineAmount as boolean) ? 'Guideline amount' : 'Custom amount'}
            />
            {!(formData.useGuidelineAmount as boolean) && (
              <>
                <ReviewField
                  label="Custom amount"
                  value={
                    (formData.customAmount as string)
                      ? `$${parseFloat(formData.customAmount as string).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                      : undefined
                  }
                />
                <ReviewField label="Reasoning" value={formData.customReasoning as string} />
              </>
            )}
          </dl>
        </SectionCard>
      )}

      {/* Spousal support */}
      {isSpousal && (formData.requestingSpousalSupport as boolean) && (
        <SectionCard icon={Heart} title="Spousal Support" stepIndex={8} onEdit={onEditStep}>
          <dl className="space-y-3">
            <ReviewField
              label="Monthly amount"
              value={
                (formData.spousalAmount as string)
                  ? `$${parseFloat(formData.spousalAmount as string).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                  : undefined
              }
            />
            <ReviewField
              label="Duration"
              value={
                (formData.spousalDurationMonths as string)
                  ? `${formData.spousalDurationMonths} months`
                  : undefined
              }
            />
          </dl>
        </SectionCard>
      )}

      {/* Property (divorce only) */}
      {isDivorce && (
        <SectionCard icon={Home} title="Property Division" stepIndex={9} onEdit={onEditStep}>
          <dl className="space-y-3">
            <ReviewField
              label="Community property to divide"
              value={(formData.communityPropertyExists as boolean) ? 'Yes' : 'No'}
            />
            {(formData.communityPropertyExists as boolean) && (
              <div>
                <dt className="text-xs text-warm-muted">Property description</dt>
                <dd className="text-sm text-warm-text mt-0.5 whitespace-pre-wrap">
                  {(formData.propertyDescription as string) || (
                    <span className="italic text-warm-muted">Not provided</span>
                  )}
                </dd>
              </div>
            )}
          </dl>
        </SectionCard>
      )}

      {/* Existing orders (modification only) */}
      {isModification && (
        <SectionCard icon={Gavel} title="Existing Orders" stepIndex={10} onEdit={onEditStep}>
          <dl className="space-y-3">
            <ReviewField label="Court" value={formData.existingCourt as string} />
            <ReviewField label="Cause number" value={formData.causeNumber as string} />
            <ReviewField
              label="What to modify"
              value={
                (formData.whatToModify as string[])?.length
                  ? (formData.whatToModify as string[]).map((v) => v.replace(/_/g, ' ')).join(', ')
                  : undefined
              }
            />
            <div>
              <dt className="text-xs text-warm-muted">Change description</dt>
              <dd className="text-sm text-warm-text mt-0.5 whitespace-pre-wrap">
                {(formData.changeDescription as string) || (
                  <span className="italic text-warm-muted">Not provided</span>
                )}
              </dd>
            </div>
          </dl>
        </SectionCard>
      )}
    </div>
  )
}
