import { describe, it, expect } from 'vitest'
import {
  buildPiDemandLetterPrompt,
  piDemandLetterFactsSchema,
  type PiDemandLetterFacts,
} from '@/lib/rules/pi-demand-letter-prompts'

function makeFacts(overrides: Partial<PiDemandLetterFacts> = {}): PiDemandLetterFacts {
  return piDemandLetterFactsSchema.parse({
    your_info: { full_name: 'Jane Doe', address: '123 Main St', city: 'Austin', state: 'TX', zip: '78701' },
    defendant_info: { full_name: 'John Smith', address: '456 Oak Ave', city: 'Austin', state: 'TX', zip: '78702' },
    insurance_carrier: 'State Farm Insurance',
    policy_number: 'POL-12345',
    claim_number: 'CLM-67890',
    pi_sub_type: 'auto_accident',
    incident_date: '2025-06-15',
    incident_location: 'I-35 and 51st Street, Austin, TX',
    incident_description: 'Defendant rear-ended plaintiff at a red light causing whiplash and vehicle damage.',
    injuries_description: 'Whiplash, cervical strain, lower back pain, headaches lasting 3 months.',
    injury_severity: 'moderate',
    medical_providers: [
      { name: 'Austin Emergency Center', type: 'Emergency Room', dates: '2025-06-15', amount: 3500 },
      { name: 'Dr. Sarah Johnson', type: 'Orthopedic', dates: '2025-06-20 to 2025-09-15', amount: 4200 },
    ],
    total_medical_expenses: 7700,
    lost_wages: 2400,
    property_damage: 3200,
    pain_suffering_amount: 23100,
    total_demand_amount: 36400,
    county: 'Travis',
    ...overrides,
  })
}

describe('piDemandLetterFactsSchema', () => {
  it('accepts valid facts', () => {
    const result = piDemandLetterFactsSchema.safeParse({
      your_info: { full_name: 'Jane Doe', address: '123 Main St', city: 'Austin', state: 'TX', zip: '78701' },
      defendant_info: { full_name: 'John Smith', address: '456 Oak Ave', city: 'Austin', state: 'TX', zip: '78702' },
      insurance_carrier: 'State Farm Insurance',
      policy_number: 'POL-12345',
      claim_number: 'CLM-67890',
      pi_sub_type: 'auto_accident',
      incident_date: '2025-06-15',
      incident_location: 'I-35 and 51st Street, Austin, TX',
      incident_description: 'Defendant rear-ended plaintiff at a red light causing whiplash and vehicle damage.',
      injuries_description: 'Whiplash, cervical strain, lower back pain, headaches lasting 3 months.',
      injury_severity: 'moderate',
      medical_providers: [
        { name: 'Austin Emergency Center', type: 'Emergency Room', dates: '2025-06-15', amount: 3500 },
      ],
      total_medical_expenses: 3500,
      lost_wages: 0,
      property_damage: 0,
      pain_suffering_amount: 10500,
      total_demand_amount: 14000,
      county: 'Travis',
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing insurance_carrier', () => {
    const result = piDemandLetterFactsSchema.safeParse({
      your_info: { full_name: 'Jane Doe' },
      defendant_info: { full_name: 'John Smith' },
      pi_sub_type: 'auto_accident',
      incident_date: '2025-06-15',
      incident_location: 'I-35 and 51st Street, Austin, TX',
      incident_description: 'Defendant rear-ended plaintiff at a red light causing whiplash and vehicle damage.',
      injuries_description: 'Whiplash, cervical strain, lower back pain, headaches lasting 3 months.',
      injury_severity: 'moderate',
      medical_providers: [
        { name: 'Austin Emergency Center', type: 'Emergency Room', dates: '2025-06-15', amount: 3500 },
      ],
      total_medical_expenses: 3500,
      lost_wages: 0,
      property_damage: 0,
      pain_suffering_amount: 10500,
      total_demand_amount: 14000,
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty medical_providers', () => {
    const result = piDemandLetterFactsSchema.safeParse({
      your_info: { full_name: 'Jane Doe' },
      defendant_info: { full_name: 'John Smith' },
      insurance_carrier: 'State Farm Insurance',
      pi_sub_type: 'auto_accident',
      incident_date: '2025-06-15',
      incident_location: 'I-35 and 51st Street, Austin, TX',
      incident_description: 'Defendant rear-ended plaintiff at a red light causing whiplash and vehicle damage.',
      injuries_description: 'Whiplash, cervical strain, lower back pain, headaches lasting 3 months.',
      injury_severity: 'moderate',
      medical_providers: [],
      total_medical_expenses: 0,
      lost_wages: 0,
      property_damage: 0,
      pain_suffering_amount: 10500,
      total_demand_amount: 10500,
    })
    expect(result.success).toBe(false)
  })

  it('rejects zero total_demand_amount', () => {
    const result = piDemandLetterFactsSchema.safeParse({
      your_info: { full_name: 'Jane Doe' },
      defendant_info: { full_name: 'John Smith' },
      insurance_carrier: 'State Farm Insurance',
      pi_sub_type: 'auto_accident',
      incident_date: '2025-06-15',
      incident_location: 'I-35 and 51st Street, Austin, TX',
      incident_description: 'Defendant rear-ended plaintiff at a red light causing whiplash and vehicle damage.',
      injuries_description: 'Whiplash, cervical strain, lower back pain, headaches lasting 3 months.',
      injury_severity: 'moderate',
      medical_providers: [
        { name: 'Austin Emergency Center', type: 'Emergency Room', dates: '2025-06-15', amount: 3500 },
      ],
      total_medical_expenses: 3500,
      lost_wages: 0,
      property_damage: 0,
      pain_suffering_amount: 0,
      total_demand_amount: 0,
    })
    expect(result.success).toBe(false)
  })

  it('accepts all 8 pi_sub_types', () => {
    const subTypes = [
      'auto_accident', 'pedestrian_cyclist', 'rideshare', 'uninsured_motorist',
      'slip_and_fall', 'dog_bite', 'product_liability', 'other',
    ] as const

    for (const subType of subTypes) {
      const result = piDemandLetterFactsSchema.safeParse({
        your_info: { full_name: 'Jane Doe' },
        defendant_info: { full_name: 'John Smith' },
        insurance_carrier: 'State Farm Insurance',
        pi_sub_type: subType,
        incident_date: '2025-06-15',
        incident_location: 'Some location, TX',
        incident_description: 'Defendant caused injury to plaintiff through negligent conduct.',
        injuries_description: 'Various injuries sustained requiring medical treatment.',
        injury_severity: 'moderate',
        medical_providers: [
          { name: 'Doctor', type: 'General', dates: '2025-06-15', amount: 1000 },
        ],
        total_medical_expenses: 1000,
        lost_wages: 0,
        property_damage: 0,
        pain_suffering_amount: 3000,
        total_demand_amount: 4000,
      })
      expect(result.success, `sub_type "${subType}" should be accepted`).toBe(true)
    }
  })
})

describe('buildPiDemandLetterPrompt', () => {
  it('returns system and user strings', () => {
    const result = buildPiDemandLetterPrompt(makeFacts())
    expect(typeof result.system).toBe('string')
    expect(typeof result.user).toBe('string')
    expect(result.system.length).toBeGreaterThan(0)
    expect(result.user.length).toBeGreaterThan(0)
  })

  it('system includes DRAFT disclaimer', () => {
    const result = buildPiDemandLetterPrompt(makeFacts())
    expect(result.system).toContain('DRAFT')
  })

  it('system includes Tex. Ins. Code § 542', () => {
    const result = buildPiDemandLetterPrompt(makeFacts())
    expect(result.system).toContain('542')
  })

  it('system includes Tex. Civ. Prac. & Rem. Code § 16.003', () => {
    const result = buildPiDemandLetterPrompt(makeFacts())
    expect(result.system).toContain('16.003')
  })

  it('system includes 30-day demand deadline', () => {
    const result = buildPiDemandLetterPrompt(makeFacts())
    expect(result.system).toContain('30')
    expect(result.system.toLowerCase()).toContain('day')
  })

  it('system includes CERTIFIED MAIL', () => {
    const result = buildPiDemandLetterPrompt(makeFacts())
    expect(result.system).toContain('CERTIFIED MAIL')
  })

  it('system includes annotations instructions', () => {
    const result = buildPiDemandLetterPrompt(makeFacts())
    expect(result.system).toContain('ANNOTATIONS')
  })

  it('user includes plaintiff name', () => {
    const result = buildPiDemandLetterPrompt(makeFacts())
    expect(result.user).toContain('Jane Doe')
  })

  it('user includes insurance carrier', () => {
    const result = buildPiDemandLetterPrompt(makeFacts())
    expect(result.user).toContain('State Farm')
  })

  it('user includes incident date', () => {
    const result = buildPiDemandLetterPrompt(makeFacts())
    expect(result.user).toContain('2025-06-15')
  })

  it('user includes incident description', () => {
    const result = buildPiDemandLetterPrompt(makeFacts())
    expect(result.user).toContain('rear-ended')
  })

  it('user includes medical provider names', () => {
    const result = buildPiDemandLetterPrompt(makeFacts())
    expect(result.user).toContain('Austin Emergency Center')
    expect(result.user).toContain('Dr. Sarah Johnson')
  })

  it('user includes total demand amount', () => {
    const result = buildPiDemandLetterPrompt(makeFacts())
    expect(
      result.user.includes('36,400') || result.user.includes('36400'),
    ).toBe(true)
  })

  it('user includes damages categories', () => {
    const result = buildPiDemandLetterPrompt(makeFacts())
    // Check that all four damages categories appear with their amounts
    expect(result.user.includes('7,700') || result.user.includes('7700')).toBe(true)
    expect(result.user.includes('2,400') || result.user.includes('2400')).toBe(true)
    expect(result.user.includes('3,200') || result.user.includes('3200')).toBe(true)
    expect(result.user.includes('23,100') || result.user.includes('23100')).toBe(true)
  })

  it('user includes sub-type context', () => {
    const result = buildPiDemandLetterPrompt(makeFacts())
    const userLower = result.user.toLowerCase()
    expect(
      userLower.includes('auto') || userLower.includes('vehicle') || userLower.includes('accident'),
    ).toBe(true)
  })
})
