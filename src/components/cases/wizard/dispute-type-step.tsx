import type { DisputeType } from '@/lib/rules/court-recommendation'
import type { State } from '@/lib/schemas/case'
import { getSmallClaimsMax } from '@/lib/states'
import { OptionCard } from './option-card'

function getDisputeOptions(selectedState: State): { value: DisputeType; label: string; description: string }[] {
  const limit = getSmallClaimsMax(selectedState)
  const limitFormatted = `$${limit.toLocaleString()}`

  return [
    { value: 'debt_collection', label: 'Debt dispute', description: 'Debt collection, credit card lawsuit, or money owed to you' },
    { value: 'landlord_tenant', label: 'Landlord-tenant issue', description: 'Lease, eviction, repairs, or deposit dispute with a landlord or tenant' },
    { value: 'personal_injury', label: 'Property damage or personal injury', description: 'Accident, negligence, vehicle damage, or injury claims' },
    { value: 'contract', label: 'Business or contract dispute', description: 'Breach of agreement, partnership issues' },
    { value: 'property', label: 'Property or real estate', description: 'Land ownership, boundary, or title dispute (not damage claims)' },
    { value: 'family', label: 'Family matter', description: 'Custody, divorce, child support, or protective order' },
    { value: 'small_claims', label: 'Small claim', description: `General dispute under ${limitFormatted} that doesn\u2019t fit above` },
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
      <p className="text-xs text-warm-muted">Choose the category that best describes your situation. We&apos;ll ask follow-up questions to narrow it down.</p>
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
