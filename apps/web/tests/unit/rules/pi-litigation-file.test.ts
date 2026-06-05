import { describe, expect, it } from 'vitest'
import {
  getPiLitigationStages,
  getPropertyDamageDiscoveryRequests,
  isPiPropertyDamageSubtype,
} from '@lawyer-free/shared/guided-steps/personal-injury/pi-litigation-file'
import { piWaitForAnswerConfig } from '@lawyer-free/shared/guided-steps/personal-injury/pi-wait-for-answer'
import { createPiDiscoveryPrepConfig } from '@lawyer-free/shared/guided-steps/personal-injury/pi-discovery-prep'
import { piDiscoveryResponsesConfig } from '@lawyer-free/shared/guided-steps/personal-injury/pi-discovery-responses'
import { piPretrialMotionsConfig } from '@lawyer-free/shared/guided-steps/personal-injury/pi-pretrial-motions'

function configText(config: { title: string; reassurance: string; questions: Array<{ prompt: string; helpText?: string }> }) {
  return [
    config.title,
    config.reassurance,
    ...config.questions.map((question) => `${question.prompt} ${question.helpText ?? ''}`),
  ].join('\n')
}

describe('personal injury litigation file', () => {
  it('models the PDF-inspired post-filing stages for property damage litigation', () => {
    const stages = getPiLitigationStages('vehicle_damage', 'state')

    expect(stages).toHaveLength(6)
    expect(stages.map((stage) => stage.title)).toEqual([
      'Await the Defendant Answer',
      'Review the Defendant Answer',
      'Plan Disclosures and Discovery',
      'Draft Discovery Requests',
      'Review Discovery Responses',
      'Prepare Motion to Compel',
    ])
    expect(stages[0].requiredFacts).toEqual([
      'file-stamped petition date',
      'court case number',
      'service completion date',
      'service method',
      'defendant served',
    ])
    expect(stages[2].jurisdictionNote).toContain('Texas state-court')
  })

  it('keeps property damage litigation discovery focused on repair evidence rather than injury evidence', () => {
    expect(isPiPropertyDamageSubtype('vehicle_damage')).toBe(true)
    expect(isPiPropertyDamageSubtype('auto_accident')).toBe(false)

    const requests = getPropertyDamageDiscoveryRequests()
    const joined = requests.join('\n')

    expect(joined).toContain('repair')
    expect(joined).toContain('insurer')
    expect(joined).toContain('traffic signal')
    expect(joined).not.toContain('medical')
    expect(joined).not.toContain('IME')
  })

  it('updates the guided steps to behave like a litigation file after filing and service', () => {
    expect(configText(piWaitForAnswerConfig)).toContain('file-stamped petition')
    expect(configText(piWaitForAnswerConfig)).toContain('service completion date')
    const propertyDamageDiscovery = createPiDiscoveryPrepConfig('vehicle_damage')
    const injuryDiscovery = createPiDiscoveryPrepConfig('auto_accident')

    expect(configText(propertyDamageDiscovery)).toContain('repair costs')
    expect(configText(propertyDamageDiscovery)).not.toContain('cell phone records from the time of the incident')
    expect(configText(injuryDiscovery)).toContain('medical records')
    expect(configText(piDiscoveryResponsesConfig)).toContain('motion to compel')
    expect(configText(piPretrialMotionsConfig)).toContain('meet-and-confer')
  })
})
