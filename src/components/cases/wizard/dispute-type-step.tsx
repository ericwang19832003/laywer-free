import type { DisputeType } from '@/lib/rules/court-recommendation'
import { OptionCard } from './option-card'

const DISPUTE_OPTIONS: { value: DisputeType; label: string; description: string }[] = [
  { value: 'debt_collection', label: 'Money owed to me', description: 'Debt or unpaid contract' },
  { value: 'landlord_tenant', label: 'Landlord-tenant issue', description: 'Lease, eviction, or deposit dispute' },
  { value: 'personal_injury', label: 'Property damage or personal injury', description: 'Accident, negligence, or damage claims' },
  { value: 'contract', label: 'Business or contract dispute', description: 'Breach of agreement, partnership issues' },
  { value: 'property', label: 'Property or real estate', description: 'Land ownership, boundary, or title dispute' },
  { value: 'family', label: 'Family matter', description: 'Custody, divorce, or child support' },
  { value: 'other', label: 'Something else', description: "Doesn't fit the categories above" },
]

interface DisputeTypeStepProps {
  value: DisputeType | ''
  onSelect: (type: DisputeType) => void
}

export function DisputeTypeStep({ value, onSelect }: DisputeTypeStepProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-warm-text">What is this dispute about?</p>
      <div className="space-y-2">
        {DISPUTE_OPTIONS.map((opt) => (
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
