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
      <div className="rounded-lg border border-calm-amber/30 bg-calm-amber/10 p-4 mb-4 space-y-2">
        <div className="flex items-start gap-2">
          <svg className="h-5 w-5 text-calm-amber shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-warm-text">Attorney Consultation Strongly Recommended</p>
            <p className="text-xs text-warm-muted leading-relaxed">
              Family law cases — especially those involving child custody, divorce, or domestic violence —
              are among the most legally complex matters. Mistakes can have serious long-term consequences.
              Lawyer Free can help you organize your materials, but we strongly recommend consulting a
              licensed family law attorney before proceeding.
            </p>
          </div>
        </div>
      </div>
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
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 mt-4 space-y-2">
        <p className="text-sm font-semibold text-red-900">Safety First</p>
        <p className="text-xs text-red-800 leading-relaxed">
          If you are in a situation involving domestic violence or feel unsafe, please reach out for help.
        </p>
        <a
          href="tel:18007997233"
          className="inline-block text-xs font-semibold text-red-900 underline"
        >
          National DV Hotline: 1-800-799-7233 (available 24/7)
        </a>
        <p className="text-xs text-red-700">
          Text START to 88788 · Chat at thehotline.org
        </p>
      </div>
    </div>
  )
}
