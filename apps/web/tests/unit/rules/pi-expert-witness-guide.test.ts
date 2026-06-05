import { describe, expect, it } from 'vitest'
import { createPiExpertWitnessGuideConfig } from '@lawyer-free/shared/guided-steps/personal-injury/pi-expert-witness-guide'

function allPromptText(piSubType: string): string {
  const config = createPiExpertWitnessGuideConfig(piSubType)
  return [
    config.title,
    config.reassurance,
    ...config.questions.map((q) => `${q.prompt} ${q.helpText ?? ''}`),
  ].join('\n')
}

describe('createPiExpertWitnessGuideConfig', () => {
  it('uses injury-specific expert questions for bodily injury cases', () => {
    const text = allPromptText('auto_accident')

    expect(text).toContain('pre-existing')
    expect(text).toContain('medical expert')
    expect(text).toContain('lost earning capacity')
  })

  it('uses property-damage-specific expert questions for property damage cases', () => {
    const text = allPromptText('vehicle_damage')

    expect(text).toContain('repair estimate')
    expect(text).toContain('diminished value')
    expect(text).toContain('appraiser')
    expect(text).not.toContain('pre-existing')
    expect(text).not.toContain('lost earning capacity')
  })
})
