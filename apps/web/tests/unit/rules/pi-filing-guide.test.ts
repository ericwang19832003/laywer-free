import { describe, expect, it } from 'vitest'
import { createPiFilingGuideConfig } from '@lawyer-free/shared/guided-steps/personal-injury/pi-filing-guide'

function allText(piSubType: string): string {
  const config = createPiFilingGuideConfig(piSubType)
  return [
    config.title,
    config.reassurance,
    ...config.questions.map((question) => `${question.prompt} ${question.helpText ?? ''}`),
  ].join('\n')
}

describe('createPiFilingGuideConfig', () => {
  it('keeps personal-injury filing language for bodily injury cases', () => {
    const text = allText('auto_accident')

    expect(text).toContain('How to File Your Personal Injury Lawsuit')
    expect(text).toContain('date of injury')
    expect(text).toContain('medical records')
  })

  it('uses property-damage filing language for vehicle damage cases', () => {
    const text = allText('vehicle_damage')

    expect(text).toContain('How to File Your Property Damage Lawsuit')
    expect(text).toContain('date your property was damaged')
    expect(text).toContain('repair estimate')
    expect(text).not.toContain('date of injury')
    expect(text).not.toContain('medical records')
    expect(text).not.toContain('most personal injury cases')
  })
})
