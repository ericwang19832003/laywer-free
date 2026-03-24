import { useState } from 'react'
import type { DisputeType } from '@/lib/rules/court-recommendation'
import type { State } from '@lawyer-free/shared/schemas/case'
import { getSmallClaimsMax } from '@/lib/states'
import { isFeatureEnabled } from '@/lib/feature-flags'
import { OptionCard } from './option-card'

interface DisputeOption {
  id: string
  value: DisputeType
  label: string
  description: string
  comingSoon?: boolean
}

/** Maps dispute option ids to their feature flags (only gated types) */
const GATED_TYPES: Record<string, Parameters<typeof isFeatureEnabled>[0]> = {
  contract: 'wizard_contract',
  property: 'wizard_property',
  real_estate: 'wizard_real_estate',
  business: 'wizard_business',
  other: 'wizard_other',
}

function getDisputeOptions(selectedState: State): DisputeOption[] {
  const limit = getSmallClaimsMax(selectedState)
  const limitFormatted = `$${limit.toLocaleString()}`

  const options: DisputeOption[] = [
    { id: 'debt_collection', value: 'debt_collection', label: 'Debt dispute', description: 'Debt collection, credit card lawsuit, or money owed to you' },
    { id: 'landlord_tenant', value: 'landlord_tenant', label: 'Landlord-tenant issue', description: 'Lease, eviction, repairs, or deposit dispute' },
    { id: 'personal_injury', value: 'personal_injury', label: 'Personal injury', description: 'Accident, negligence, or injury claims' },
    { id: 'property_damage', value: 'personal_injury', label: 'Property damage', description: 'Vehicle damage, property damage from negligence, or vandalism' },
    { id: 'contract', value: 'contract', label: 'Contract dispute', description: 'Breach of agreement, broken contract' },
    { id: 'business', value: 'business', label: 'Business dispute', description: 'Partnership, employment, or commercial dispute' },
    { id: 'property', value: 'property', label: 'Property dispute', description: 'Land ownership, boundary, or title dispute' },
    { id: 'real_estate', value: 'real_estate', label: 'Real estate', description: 'Real estate transactions, liens, or deed issues' },
    { id: 'family', value: 'family', label: 'Family matter', description: 'Custody, divorce, child support, or protective order' },
    { id: 'small_claims', value: 'small_claims', label: 'Small claim', description: `General dispute under ${limitFormatted} that doesn\u2019t fit above` },
    { id: 'other', value: 'other', label: 'Something else', description: "Doesn't fit the categories above" },
  ]
  return options.map((opt) => {
    const flag = GATED_TYPES[opt.id]
    return {
      ...opt,
      comingSoon: flag ? !isFeatureEnabled(flag) : false,
    }
  })
}

interface DisputeTypeStepProps {
  value: DisputeType | ''
  selectedState?: State
  onSelect: (type: DisputeType) => void
}

export function DisputeTypeStep({ value, selectedState = 'TX', onSelect }: DisputeTypeStepProps) {
  const options = getDisputeOptions(selectedState)
  const [selectedId, setSelectedId] = useState<string>(() => {
    if (!value) return ''
    const match = options.find((opt) => opt.value === value)
    return match?.id ?? ''
  })

  function handleSelect(opt: DisputeOption) {
    setSelectedId(opt.id)
    onSelect(opt.value)
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-warm-text">What is this dispute about?</p>
      <p className="text-xs text-warm-muted">Choose the category that best describes your situation. We&apos;ll ask follow-up questions to narrow it down.</p>
      <div className="space-y-2">
        {options.map((opt) => (
          <div key={opt.id} className="relative">
            <OptionCard
              label={opt.label}
              description={opt.description}
              selected={selectedId === opt.id}
              onClick={() => !opt.comingSoon && handleSelect(opt)}
              disabled={opt.comingSoon}
            />
            {opt.comingSoon && (
              <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
                <span className="text-[11px] font-medium text-calm-indigo bg-calm-indigo/10 px-2 py-0.5 rounded-full">
                  Coming soon
                </span>
                <span className="text-[10px] text-warm-muted max-w-[200px] text-right">
                  Full wizard coming soon — you can still use guided steps for this type.
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
