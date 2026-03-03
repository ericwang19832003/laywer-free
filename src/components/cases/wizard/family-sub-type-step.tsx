'use client'

import {
  Heart,
  Users,
  DollarSign,
  Calendar,
  Shield,
  RefreshCw,
  Unlink,
  type LucideIcon,
} from 'lucide-react'

export type FamilySubType =
  | 'divorce'
  | 'custody'
  | 'child_support'
  | 'visitation'
  | 'spousal_support'
  | 'protective_order'
  | 'modification'

interface FamilySubTypeOption {
  value: FamilySubType
  label: string
  description: string
  icon: LucideIcon
}

const FAMILY_OPTIONS: FamilySubTypeOption[] = [
  {
    value: 'divorce',
    label: 'Divorce',
    description: 'I want to end my marriage',
    icon: Unlink,
  },
  {
    value: 'custody',
    label: 'Child Custody',
    description: 'I need a custody arrangement for my children',
    icon: Users,
  },
  {
    value: 'child_support',
    label: 'Child Support',
    description: 'I need child support established or enforced',
    icon: DollarSign,
  },
  {
    value: 'visitation',
    label: 'Visitation',
    description: 'I need a visitation/possession schedule',
    icon: Calendar,
  },
  {
    value: 'spousal_support',
    label: 'Spousal Support',
    description: 'I need spousal maintenance (alimony)',
    icon: Heart,
  },
  {
    value: 'protective_order',
    label: 'Protective Order',
    description: 'I need protection from domestic violence or abuse',
    icon: Shield,
  },
  {
    value: 'modification',
    label: 'Modification',
    description: 'I need to change an existing court order',
    icon: RefreshCw,
  },
]

interface FamilySubTypeStepProps {
  value: FamilySubType | ''
  onSelect: (subType: FamilySubType) => void
}

export function FamilySubTypeStep({ value, onSelect }: FamilySubTypeStepProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-warm-text">
        What type of family matter?
      </p>
      <div className="space-y-2">
        {FAMILY_OPTIONS.map((opt) => {
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

              {opt.value === 'protective_order' && (
                <div className="mt-2 rounded-md border border-calm-amber bg-calm-amber/5 px-4 py-3">
                  <p className="text-xs font-medium text-calm-amber leading-relaxed">
                    If you are in immediate danger, call 911.
                    <br />
                    National DV Hotline:{' '}
                    <a
                      href="tel:1-800-799-7233"
                      className="underline font-semibold"
                    >
                      1-800-799-7233
                    </a>
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
