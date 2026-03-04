import type { DisputeType } from '@/lib/rules/court-recommendation'
import type { State } from '@/lib/schemas/case'
import { getSmallClaimsMax } from '@/lib/states'
import { OptionCard } from './option-card'

function getDisputeOptions(selectedState: State): { value: DisputeType; label: string; description: string }[] {
  const limit = getSmallClaimsMax(selectedState)
  const limitFormatted = `$${limit.toLocaleString()}`

  return [
    { value: 'debt_collection', label: 'Debt dispute', description: 'Debt collection, credit card lawsuit, or money owed' },
    { value: 'landlord_tenant', label: 'Landlord-tenant issue', description: 'Lease, eviction, or deposit dispute' },
    { value: 'personal_injury', label: 'Property damage or personal injury', description: 'Accident, negligence, or damage claims' },
    { value: 'contract', label: 'Business or contract dispute', description: 'Breach of agreement, partnership issues' },
    { value: 'property', label: 'Property or real estate', description: 'Land ownership, boundary, or title dispute' },
    { value: 'family', label: 'Family matter', description: 'Custody, divorce, or child support' },
    { value: 'small_claims', label: 'Small claim', description: `Dispute under ${limitFormatted} \u2014 deposit, refund, loan, etc.` },
    { value: 'other', label: 'Something else', description: "Doesn't fit the categories above" },
  ]
}

interface DisputeTypeStepProps {
  value: DisputeType | ''
  selectedState?: State
  onSelect: (type: DisputeType) => void
}

export function DisputeTypeStep({ value, selectedState = 'TX', onSelect }: DisputeTypeStepProps) {
  const options = getDisputeOptions(selectedState)

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-warm-text">What is this dispute about?</p>
      <div className="space-y-2">
        {options.map((opt) => (
          <OptionCard
            key={opt.value}
            label={opt.label}
            description={opt.description}
            selected={value === opt.value}
            onClick={() => onSelect(opt.value)}
          />
        ))}
      </div>
    </div>
  )
}
