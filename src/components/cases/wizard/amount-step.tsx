import type { AmountRange } from '@/lib/rules/court-recommendation'
import { OptionCard } from './option-card'

const AMOUNT_OPTIONS: { value: AmountRange; label: string }[] = [
  { value: 'under_20k', label: 'Under $20,000' },
  { value: '20k_75k', label: '$20,000 – $75,000' },
  { value: '75k_200k', label: '$75,000 – $200,000' },
  { value: 'over_200k', label: 'Over $200,000' },
  { value: 'not_money', label: 'It\u2019s not about money' },
]

interface AmountStepProps {
  value: AmountRange | ''
  onSelect: (amount: AmountRange) => void
}

export function AmountStep({ value, onSelect }: AmountStepProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-warm-text">
        Roughly how much money is involved?
      </p>
      <div className="space-y-2">
        {AMOUNT_OPTIONS.map((opt) => (
          <OptionCard
            key={opt.value}
            label={opt.label}
            selected={value === opt.value}
            onClick={() => onSelect(opt.value)}
          />
        ))}
      </div>
    </div>
  )
}
