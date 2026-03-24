'use client'

import {
  Building2,
  DollarSign,
  Home,
  Hammer,
  FileText,
  Shield,
  HelpCircle,
  type LucideIcon,
} from 'lucide-react'

export type LandlordTenantSubType =
  | 'eviction'
  | 'nonpayment'
  | 'security_deposit'
  | 'property_damage'
  | 'repair_maintenance'
  | 'lease_termination'
  | 'habitability'
  | 'other'

interface LandlordTenantSubTypeOption {
  value: LandlordTenantSubType
  label: string
  description: string
  icon: LucideIcon
}

const LANDLORD_TENANT_OPTIONS: LandlordTenantSubTypeOption[] = [
  {
    value: 'eviction',
    label: 'Eviction (Unlawful Detainer)',
    description: 'Landlord seeking to remove a tenant, or tenant defending against eviction',
    icon: Building2,
  },
  {
    value: 'nonpayment',
    label: 'Nonpayment of Rent',
    description: 'Landlord seeking unpaid rent or tenant disputing rent owed',
    icon: DollarSign,
  },
  {
    value: 'security_deposit',
    label: 'Security Deposit Dispute',
    description: 'Dispute over return or deductions from a security deposit',
    icon: Home,
  },
  {
    value: 'property_damage',
    label: 'Property Damage',
    description: 'Claims for damage to rental property by either party',
    icon: Hammer,
  },
  {
    value: 'repair_maintenance',
    label: 'Repair & Maintenance',
    description: 'Tenant requesting repairs the landlord won\'t make',
    icon: Hammer,
  },
  {
    value: 'lease_termination',
    label: 'Lease Termination',
    description: 'Dispute over early termination or lease renewal',
    icon: FileText,
  },
  {
    value: 'habitability',
    label: 'Habitability Claim',
    description: 'Unsafe or unlivable conditions in the rental property',
    icon: Shield,
  },
  {
    value: 'other',
    label: 'Other Landlord-Tenant Issue',
    description: 'Another type of rental housing dispute',
    icon: HelpCircle,
  },
]

interface LandlordTenantSubTypeStepProps {
  value: LandlordTenantSubType | ''
  onSelect: (subType: LandlordTenantSubType) => void
}

export function LandlordTenantSubTypeStep({ value, onSelect }: LandlordTenantSubTypeStepProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-warm-text">
        What type of landlord-tenant issue?
      </p>
      <div className="space-y-2">
        {LANDLORD_TENANT_OPTIONS.map((opt) => {
          const Icon = opt.icon
          const isSelected = value === opt.value

          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSelect(opt.value)}
              className={`w-full rounded-md border px-4 py-3 text-left transition-colors flex items-start gap-3 ${
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-warm-border hover:border-warm-text'
              }`}
            >
              <Icon
                className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                  isSelected ? 'text-primary' : 'text-warm-muted'
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
          Eviction cases are always filed in Justice of the Peace (JP) Court.
          Other landlord-tenant disputes depend on the amount in question.
        </p>
      </div>
    </div>
  )
}
