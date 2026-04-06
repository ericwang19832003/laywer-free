import { describe, it, expect } from 'vitest'
import {
  buildPiPetitionPrompt,
  piPetitionFactsSchema,
  type PiPetitionFacts,
} from '@lawyer-free/shared/rules/pi-petition-prompts'

function makeFacts(overrides: Partial<PiPetitionFacts> = {}): PiPetitionFacts {
  return piPetitionFactsSchema.parse({
    your_info: { full_name: 'Jane Doe', address: '123 Main St', city: 'Austin', state: 'TX', zip: '78701' },
    opposing_parties: [{ full_name: 'John Smith', address: '456 Oak Ave', city: 'Austin', state: 'TX', zip: '78702' }],
    court_type: 'county',
    county: 'Travis',
    cause_number: 'C-2025-1234',
    pi_sub_type: 'auto_accident',
    incident_date: '2025-06-15',
    incident_location: 'I-35 and 51st Street, Austin, TX',
    incident_description: 'Defendant rear-ended plaintiff at a red light causing whiplash and vehicle damage.',
    injuries_description: 'Whiplash, cervical strain, lower back pain, headaches lasting 3 months.',
    injury_severity: 'moderate',
    damages: { medical: 7700, lost_wages: 2400, property_damage: 3200, pain_suffering: 23100, total: 36400 },
    negligence_theory: 'Defendant failed to maintain a proper lookout and rear-ended plaintiff while plaintiff was stopped at a red light.',
    prior_demand_sent: true,
    demand_date: '2025-11-01',
    ...overrides,
  })
}

// ---------------------------------------------------------------------------
// Schema validation tests
// ---------------------------------------------------------------------------

describe('piPetitionFactsSchema', () => {
  it('accepts valid facts', () => {
    const result = piPetitionFactsSchema.safeParse({
      your_info: { full_name: 'Jane Doe', address: '123 Main St', city: 'Austin', state: 'TX', zip: '78701' },
      opposing_parties: [{ full_name: 'John Smith', address: '456 Oak Ave', city: 'Austin', state: 'TX', zip: '78702' }],
      court_type: 'county',
      county: 'Travis',
      cause_number: 'C-2025-1234',
      pi_sub_type: 'auto_accident',
      incident_date: '2025-06-15',
      incident_location: 'I-35 and 51st Street, Austin, TX',
      incident_description: 'Defendant rear-ended plaintiff at a red light causing whiplash and vehicle damage.',
      injuries_description: 'Whiplash, cervical strain, lower back pain, headaches lasting 3 months.',
      injury_severity: 'moderate',
      damages: { medical: 7700, lost_wages: 2400, property_damage: 3200, pain_suffering: 23100, total: 36400 },
      negligence_theory: 'Defendant failed to maintain a proper lookout and rear-ended plaintiff while plaintiff was stopped at a red light.',
      prior_demand_sent: true,
      demand_date: '2025-11-01',
    })
    expect(result.success).toBe(true)
  })

  it('accepts federal court_type', () => {
    const result = piPetitionFactsSchema.safeParse({
      your_info: { full_name: 'Jane Doe' },
      opposing_parties: [{ full_name: 'John Smith' }],
      court_type: 'federal',
      county: 'Travis',
      pi_sub_type: 'auto_accident',
      incident_date: '2025-06-15',
      incident_location: 'I-35 and 51st Street, Austin, TX',
      incident_description: 'Defendant rear-ended plaintiff at a red light causing whiplash and vehicle damage.',
      injuries_description: 'Whiplash, cervical strain, lower back pain, headaches lasting 3 months.',
      injury_severity: 'moderate',
      damages: { medical: 7700, lost_wages: 2400, property_damage: 3200, pain_suffering: 23100, total: 36400 },
      negligence_theory: 'Defendant failed to maintain a proper lookout and rear-ended plaintiff.',
      prior_demand_sent: false,
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty opposing_parties', () => {
    const result = piPetitionFactsSchema.safeParse({
      your_info: { full_name: 'Jane Doe' },
      opposing_parties: [],
      court_type: 'county',
      county: 'Travis',
      pi_sub_type: 'auto_accident',
      incident_date: '2025-06-15',
      incident_location: 'I-35 and 51st Street, Austin, TX',
      incident_description: 'Defendant rear-ended plaintiff at a red light causing whiplash and vehicle damage.',
      injuries_description: 'Whiplash, cervical strain, lower back pain, headaches lasting 3 months.',
      injury_severity: 'moderate',
      damages: { medical: 7700, lost_wages: 2400, property_damage: 3200, pain_suffering: 23100, total: 36400 },
      negligence_theory: 'Defendant failed to maintain a proper lookout and rear-ended plaintiff.',
      prior_demand_sent: false,
    })
    expect(result.success).toBe(false)
  })

  it('rejects missing county', () => {
    const result = piPetitionFactsSchema.safeParse({
      your_info: { full_name: 'Jane Doe' },
      opposing_parties: [{ full_name: 'John Smith' }],
      court_type: 'county',
      pi_sub_type: 'auto_accident',
      incident_date: '2025-06-15',
      incident_location: 'I-35 and 51st Street, Austin, TX',
      incident_description: 'Defendant rear-ended plaintiff at a red light causing whiplash and vehicle damage.',
      injuries_description: 'Whiplash, cervical strain, lower back pain, headaches lasting 3 months.',
      injury_severity: 'moderate',
      damages: { medical: 7700, lost_wages: 2400, property_damage: 3200, pain_suffering: 23100, total: 36400 },
      negligence_theory: 'Defendant failed to maintain a proper lookout and rear-ended plaintiff.',
      prior_demand_sent: false,
    })
    expect(result.success).toBe(false)
  })

  it('rejects zero total damages', () => {
    const result = piPetitionFactsSchema.safeParse({
      your_info: { full_name: 'Jane Doe' },
      opposing_parties: [{ full_name: 'John Smith' }],
      court_type: 'county',
      county: 'Travis',
      pi_sub_type: 'auto_accident',
      incident_date: '2025-06-15',
      incident_location: 'I-35 and 51st Street, Austin, TX',
      incident_description: 'Defendant rear-ended plaintiff at a red light causing whiplash and vehicle damage.',
      injuries_description: 'Whiplash, cervical strain, lower back pain, headaches lasting 3 months.',
      injury_severity: 'moderate',
      damages: { medical: 0, lost_wages: 0, property_damage: 0, pain_suffering: 0, total: 0 },
      negligence_theory: 'Defendant failed to maintain a proper lookout and rear-ended plaintiff.',
      prior_demand_sent: false,
    })
    expect(result.success).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Prompt builder tests
// ---------------------------------------------------------------------------

describe('buildPiPetitionPrompt', () => {
  it('returns system and user strings', () => {
    const result = buildPiPetitionPrompt(makeFacts())
    expect(typeof result.system).toBe('string')
    expect(typeof result.user).toBe('string')
    expect(result.system.length).toBeGreaterThan(0)
    expect(result.user.length).toBeGreaterThan(0)
  })

  it('system includes DRAFT disclaimer', () => {
    const result = buildPiPetitionPrompt(makeFacts())
    expect(result.system).toContain('DRAFT')
  })

  it('system includes court caption instructions', () => {
    const result = buildPiPetitionPrompt(makeFacts())
    expect(result.system).toContain('COURT CAPTION')
  })

  it('system includes NEGLIGENCE section', () => {
    const result = buildPiPetitionPrompt(makeFacts())
    expect(result.system).toContain('NEGLIGENCE')
  })

  it('system includes PRAYER FOR RELIEF', () => {
    const result = buildPiPetitionPrompt(makeFacts())
    expect(result.system).toContain('PRAYER FOR RELIEF')
  })

  it('system includes jury demand', () => {
    const result = buildPiPetitionPrompt(makeFacts())
    const systemLower = result.system.toLowerCase()
    expect(systemLower).toContain('jury')
  })

  it('system includes annotations instructions', () => {
    const result = buildPiPetitionPrompt(makeFacts())
    expect(result.system).toContain('---ANNOTATIONS---')
  })

  it('user includes plaintiff name', () => {
    const result = buildPiPetitionPrompt(makeFacts())
    expect(result.user).toContain('Jane Doe')
  })

  it('user includes defendant name', () => {
    const result = buildPiPetitionPrompt(makeFacts())
    expect(result.user).toContain('John Smith')
  })

  it('user includes incident date and location', () => {
    const result = buildPiPetitionPrompt(makeFacts())
    expect(result.user).toContain('2025-06-15')
    expect(result.user).toContain('I-35 and 51st Street, Austin, TX')
  })

  it('user includes damages total', () => {
    const result = buildPiPetitionPrompt(makeFacts())
    expect(result.user).toContain('36,400')
  })

  it('user includes negligence theory', () => {
    const result = buildPiPetitionPrompt(makeFacts())
    expect(result.user).toContain('failed to maintain a proper lookout')
  })

  it('includes prior demand reference when prior_demand_sent is true', () => {
    const result = buildPiPetitionPrompt(makeFacts({ prior_demand_sent: true, demand_date: '2025-11-01' }))
    const hasDemand = result.user.includes('demand') || result.user.includes('2025-11-01')
    expect(hasDemand).toBe(true)
  })

  // Sub-type negligence theory tests

  it('system includes motor vehicle negligence for auto_accident', () => {
    const result = buildPiPetitionPrompt(makeFacts({ pi_sub_type: 'auto_accident' }))
    expect(result.system).toContain('failure to maintain a proper lookout')
    expect(result.system).toContain('failure to control speed')
    expect(result.system).toContain('failure to yield')
  })

  it('system includes premises liability for slip_and_fall', () => {
    const result = buildPiPetitionPrompt(makeFacts({ pi_sub_type: 'slip_and_fall' }))
    expect(result.system).toContain('Tex. Civ. Prac. & Rem. Code')
    expect(result.system).toContain('knew or should have known of the dangerous condition')
  })

  it('system includes strict product liability for product_liability', () => {
    const result = buildPiPetitionPrompt(makeFacts({ pi_sub_type: 'product_liability' }))
    expect(result.system).toContain('Tex. Civ. Prac. & Rem. Code')
    expect(result.system).toContain('defective design')
    expect(result.system).toContain('failure to warn')
  })

  it('system includes animal liability for dog_bite', () => {
    const result = buildPiPetitionPrompt(makeFacts({ pi_sub_type: 'dog_bite' }))
    expect(result.system).toContain('knew or should have known of the animal')
    expect(result.system).toContain('failed to restrain or control')
  })

  // Federal court tests

  it('system uses federal format for federal court_type', () => {
    const result = buildPiPetitionPrompt(makeFacts({ court_type: 'federal' }))
    expect(result.system).toContain('UNITED STATES DISTRICT COURT')
    expect(result.system).toContain('COMPLAINT')
    expect(result.system).toContain('PRELIMINARY STATEMENT')
    expect(result.system).toContain('Federal Rule of Civil Procedure 38')
  })

  it('user labels document as COMPLAINT for federal court', () => {
    const result = buildPiPetitionPrompt(makeFacts({ court_type: 'federal' }))
    expect(result.user).toContain('COMPLAINT')
  })
})
