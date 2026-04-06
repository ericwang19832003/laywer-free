'use client'

import type { PiSubType } from '@lawyer-free/shared/schemas/case'
import { OptionCard } from './option-card'

const INJURY_OPTIONS: { value: PiSubType; label: string; description: string }[] = [
  { value: 'auto_accident', label: 'Minor car accident', description: 'Fender-bender, rear-end collision, parking lot accident' },
  { value: 'pedestrian_cyclist', label: 'Pedestrian or cyclist hit', description: 'Hit while walking, biking, or using e-scooter' },
  { value: 'rideshare', label: 'Rideshare accident', description: 'Uber, Lyft, or other rideshare-related accident' },
  { value: 'uninsured_motorist', label: 'Uninsured/underinsured motorist', description: 'Other driver has no/insufficient insurance' },
  { value: 'slip_and_fall', label: 'Slip and fall', description: 'Injury on someone else\'s property' },
  { value: 'dog_bite', label: 'Dog bite', description: 'Animal attack or bite injury' },
  { value: 'product_liability', label: 'Defective product', description: 'Injury caused by a faulty product' },
  { value: 'other_injury', label: 'Other personal injury', description: 'Another type of injury claim' },
]

const PROPERTY_DAMAGE_OPTIONS: { value: PiSubType; label: string; description: string }[] = [
  { value: 'vehicle_damage', label: 'Vehicle damage (no injury)', description: 'Car, truck, or motorcycle damage without bodily injury' },
  { value: 'property_damage_negligence', label: 'Property damage from negligence', description: 'Damage to home, fence, or belongings caused by another party' },
  { value: 'vandalism', label: 'Vandalism or intentional damage', description: 'Deliberate destruction of your property' },
  { value: 'other_property_damage', label: 'Other property damage', description: 'Another type of property damage claim' },
]

interface PISubTypeStepProps {
  value: PiSubType | ''
  onSelect: (type: PiSubType) => void
}

export function PISubTypeStep({ value, onSelect }: PISubTypeStepProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-warm-text">What type of case is this?</p>

      <div className="space-y-2">
        <p className="text-xs font-medium text-warm-muted uppercase tracking-wide">Personal Injury</p>
        {INJURY_OPTIONS.map((opt) => (
          <OptionCard
            key={opt.value}
            label={opt.label}
            description={opt.description}
            selected={value === opt.value}
            onClick={() => onSelect(opt.value)}
          />
        ))}
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-warm-muted uppercase tracking-wide">Property Damage</p>
        {PROPERTY_DAMAGE_OPTIONS.map((opt) => (
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
