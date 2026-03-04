'use client'

import type { PiSubType } from '@/lib/schemas/case'
import { OptionCard } from './option-card'

const PI_OPTIONS: { value: PiSubType; label: string; description: string }[] = [
  { value: 'auto_accident', label: 'Minor car accident', description: 'Fender-bender, rear-end collision, parking lot accident' },
  { value: 'pedestrian_cyclist', label: 'Pedestrian or cyclist hit', description: 'Hit while walking, biking, or using e-scooter' },
  { value: 'rideshare', label: 'Rideshare accident', description: 'Uber, Lyft, or other rideshare-related accident' },
  { value: 'uninsured_motorist', label: 'Uninsured/underinsured motorist', description: 'Other driver has no/insufficient insurance' },
  { value: 'slip_and_fall', label: 'Slip and fall', description: 'Injury on someone else\'s property' },
  { value: 'dog_bite', label: 'Dog bite', description: 'Animal attack or bite injury' },
  { value: 'product_liability', label: 'Defective product', description: 'Injury caused by a faulty product' },
  { value: 'other', label: 'Other personal injury', description: 'General PI claim not covered above' },
]

interface PISubTypeStepProps {
  value: PiSubType | ''
  onSelect: (type: PiSubType) => void
}

export function PISubTypeStep({ value, onSelect }: PISubTypeStepProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-warm-text">What type of injury case is this?</p>
      <div className="space-y-2">
        {PI_OPTIONS.map((opt) => (
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
