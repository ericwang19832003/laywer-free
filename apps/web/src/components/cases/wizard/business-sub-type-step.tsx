'use client'

import {
  Building2,
  Briefcase,
  Handshake,
  type LucideIcon,
} from 'lucide-react'
import type { BusinessSubType } from '@lawyer-free/shared/schemas/case'

interface BusinessSubTypeOption {
  value: BusinessSubType
  label: string
  description: string
  icon: LucideIcon
}

const BUSINESS_OPTIONS: BusinessSubTypeOption[] = [
  {
    value: 'partnership',
    label: 'Partnership / LLC',
    description:
      'Partner disagreements, profit sharing, dissolution, buyouts, or fiduciary duty breaches',
    icon: Handshake,
  },
  {
    value: 'employment',
    label: 'Employment',
    description:
      'Wrongful termination, wage disputes, non-compete violations, or discrimination',
    icon: Briefcase,
  },
  {
    value: 'b2b_commercial',
    label: 'Business-to-Business',
    description:
      'Vendor disputes, service agreements, IP/trade secrets, or unfair competition',
    icon: Building2,
  },
]

interface BusinessSubTypeStepProps {
  value: BusinessSubType | '' | null
  onSelect: (subType: BusinessSubType) => void
}

export function BusinessSubTypeStep({ value, onSelect }: BusinessSubTypeStepProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-warm-text">
        What type of business dispute?
      </p>
      <div className="space-y-2">
        {BUSINESS_OPTIONS.map((opt) => {
          const Icon = opt.icon
          const selected = value === opt.value

          return (
            <div key={opt.value}>
              <button
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
            </div>
          )
        })}
      </div>
    </div>
  )
}
