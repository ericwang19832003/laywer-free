'use client'

import {
  CreditCard,
  Stethoscope,
  Wallet,
  Car,
  Banknote,
  FileStack,
  HelpCircle,
  type LucideIcon,
} from 'lucide-react'

export type DebtSubType =
  | 'credit_card'
  | 'medical_bills'
  | 'personal_loan'
  | 'auto_loan'
  | 'payday_loan'
  | 'debt_buyer'
  | 'other'

interface DebtSubTypeOption {
  value: DebtSubType
  label: string
  defendantDesc: string
  plaintiffDesc: string
  icon: LucideIcon
}

const DEBT_OPTIONS: DebtSubTypeOption[] = [
  {
    value: 'credit_card',
    label: 'Credit Card Debt',
    defendantDesc: 'Sued by a credit card company or debt buyer',
    plaintiffDesc: 'Collecting on an unpaid credit card balance',
    icon: CreditCard,
  },
  {
    value: 'medical_bills',
    label: 'Medical Bills',
    defendantDesc: 'Sued for unpaid medical or hospital bills',
    plaintiffDesc: 'Collecting on unpaid medical or hospital bills',
    icon: Stethoscope,
  },
  {
    value: 'personal_loan',
    label: 'Personal Loan',
    defendantDesc: 'Sued for an unpaid personal or installment loan',
    plaintiffDesc: 'Collecting on an unpaid personal loan',
    icon: Wallet,
  },
  {
    value: 'auto_loan',
    label: 'Auto Loan / Deficiency',
    defendantDesc: 'Sued after vehicle repossession for remaining balance',
    plaintiffDesc: 'Collecting remaining balance after repossession',
    icon: Car,
  },
  {
    value: 'payday_loan',
    label: 'Payday / Title Loan',
    defendantDesc: 'Sued by a payday or title loan company',
    plaintiffDesc: 'Collecting on a payday or title loan',
    icon: Banknote,
  },
  {
    value: 'debt_buyer',
    label: 'Debt Buyer / Purchased Debt',
    defendantDesc: 'Sued by a company that bought old debt (e.g., Portfolio Recovery, Midland Credit)',
    plaintiffDesc: 'Purchased debt and seeking to collect',
    icon: FileStack,
  },
  {
    value: 'other',
    label: 'Other Debt',
    defendantDesc: 'Another type of debt collection lawsuit',
    plaintiffDesc: 'Another type of debt you are owed',
    icon: HelpCircle,
  },
]

interface DebtSubTypeStepProps {
  value: DebtSubType | ''
  side?: 'defendant' | 'plaintiff'
  onSelect: (subType: DebtSubType) => void
}

export function DebtSubTypeStep({ value, side = 'defendant', onSelect }: DebtSubTypeStepProps) {
  const isPlaintiff = side === 'plaintiff'

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-warm-text">
        What type of debt is involved?
      </p>
      <div className="space-y-2">
        {DEBT_OPTIONS.map((opt) => {
          const Icon = opt.icon
          const isSelected = value === opt.value
          const description = isPlaintiff ? opt.plaintiffDesc : opt.defendantDesc

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
                  {description}
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {!isPlaintiff && (
        <div className="rounded-md border border-calm-amber bg-calm-amber/5 px-4 py-3">
          <p className="text-xs font-medium text-calm-amber leading-relaxed">
            Debt buyers purchase old debts for pennies on the dollar, then sue to
            collect the full amount. They often lack proper documentation — which
            can be a strong defense.
          </p>
        </div>
      )}
    </div>
  )
}
