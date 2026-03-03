'use client'

import {
  Home,
  FileText,
  ShoppingBag,
  Car,
  TreePine,
  Banknote,
  HelpCircle,
  type LucideIcon,
} from 'lucide-react'

export type SmallClaimsSubType =
  | 'security_deposit'
  | 'breach_of_contract'
  | 'consumer_refund'
  | 'property_damage'
  | 'car_accident'
  | 'neighbor_dispute'
  | 'unpaid_loan'
  | 'other'

interface SmallClaimsSubTypeOption {
  value: SmallClaimsSubType
  label: string
  description: string
  icon: LucideIcon
}

const SMALL_CLAIMS_OPTIONS: SmallClaimsSubTypeOption[] = [
  {
    value: 'security_deposit',
    label: 'Security Deposit',
    description: 'Landlord kept your deposit unfairly',
    icon: Home,
  },
  {
    value: 'breach_of_contract',
    label: 'Breach of Contract',
    description: 'Someone didn\'t hold up their end of an agreement',
    icon: FileText,
  },
  {
    value: 'consumer_refund',
    label: 'Consumer Refund',
    description: 'Business won\'t refund you for a product or service',
    icon: ShoppingBag,
  },
  {
    value: 'property_damage',
    label: 'Property Damage',
    description: 'Someone damaged your property',
    icon: Home,
  },
  {
    value: 'car_accident',
    label: 'Car Accident',
    description: 'Minor vehicle damage from an accident',
    icon: Car,
  },
  {
    value: 'neighbor_dispute',
    label: 'Neighbor Dispute',
    description: 'Property line, noise, or other neighbor issue',
    icon: TreePine,
  },
  {
    value: 'unpaid_loan',
    label: 'Unpaid Loan',
    description: 'Someone owes you money and won\'t pay',
    icon: Banknote,
  },
  {
    value: 'other',
    label: 'Other Small Claim',
    description: 'Another type of claim under $20,000',
    icon: HelpCircle,
  },
]

interface SmallClaimsSubTypeStepProps {
  value: SmallClaimsSubType | ''
  onSelect: (subType: SmallClaimsSubType) => void
}

export function SmallClaimsSubTypeStep({ value, onSelect }: SmallClaimsSubTypeStepProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-warm-text">
        What type of small claim?
      </p>
      <div className="space-y-2">
        {SMALL_CLAIMS_OPTIONS.map((opt) => {
          const Icon = opt.icon
          const selected = value === opt.value

          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSelect(opt.value)}
              className={`w-full rounded-md border px-4 py-3 text-left transition-colors flex items-start gap-3 ${
                selected
                  ? 'border-primary bg-primary/5'
                  : 'border-warm-border hover:border-warm-text'
              }`}
            >
              <Icon
                className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                  selected ? 'text-primary' : 'text-warm-muted'
                }`}
              />
              <div>
                <span className="font-medium text-warm-text text-sm">
                  {opt.label}
                </span>
                <span className="block text-xs mt-0.5 text-warm-muted">
                  {opt.description}
                </span>
              </div>
            </button>
          )
        })}
      </div>

      <div className="rounded-md border border-calm-amber bg-calm-amber/5 px-4 py-3">
        <p className="text-xs font-medium text-calm-amber leading-relaxed">
          Texas small claims limit: $20,000. If your claim is for more than
          $20,000, you may need to file in County or District Court instead.
        </p>
      </div>
    </div>
  )
}
