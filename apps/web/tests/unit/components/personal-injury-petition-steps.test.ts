import { describe, expect, it } from 'vitest'
import { getStepsForSubType } from '@/components/step/personal-injury-wizard'

describe('getStepsForSubType', () => {
  it('uses the 8-step petition worksheet for vehicle property damage cases', () => {
    const steps = getStepsForSubType('vehicle_damage', false)

    expect(steps.map((step) => step.title)).toEqual([
      'Before You Start',
      'What Happened',
      'Damage Details',
      'Your Damages',
      'Insurance Information',
      'Where to File',
      'How to File',
      'Review Everything',
    ])
  })

  it('uses the same 8-step petition worksheet for non-vehicle property damage cases', () => {
    const steps = getStepsForSubType('property_damage_negligence', false)

    expect(steps).toHaveLength(8)
    expect(steps.map((step) => step.id)).toEqual([
      'preflight',
      'incident',
      'damage_details',
      'damages',
      'insurance',
      'venue',
      'how_to_file',
      'review',
    ])
  })
})
