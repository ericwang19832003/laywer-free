import type { AmountRange } from '@lawyer-free/shared/rules/court-recommendation'
import type { State } from '@lawyer-free/shared/schemas/case'
import { getStateConfig } from '@/lib/states'
import { OptionCard } from './option-card'

interface AmountStepProps {
  value: AmountRange | ''
  selectedState?: State
  onSelect: (amount: AmountRange) => void
}

export function AmountStep({ value, selectedState = 'TX', onSelect }: AmountStepProps) {
  const config = getStateConfig(selectedState)

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-warm-text">
        Roughly how much money is involved?
      </p>
      <div className="space-y-2">
        {config.amountRanges.map((opt) => (
          <OptionCard
            key={opt.value}
            label={opt.label}
            selected={value === opt.value}
            onClick={() => onSelect(opt.value as AmountRange)}
          />
        ))}
      </div>
    </div>
  )
}
