import { describe, it, expect } from 'vitest'
import { buildFamilyFilingPrompt } from '@lawyer-free/shared/rules/family-filing-prompts'
import { familyFilingFactsSchema } from '@lawyer-free/shared/schemas/family-filing'
import type { FamilyFilingFacts } from '@lawyer-free/shared/schemas/family-filing'

const baseFacts: FamilyFilingFacts = {
  petitioner: { full_name: 'Jane Smith' },
  respondent: { full_name: 'John Smith' },
  court_type: 'district',
  county: 'Travis',
  family_sub_type: 'divorce',
  grounds: 'The marriage has become insupportable due to discord or conflict.',
  children: [],
  community_property_exists: false,
  military_involvement: false,
}

describe('buildFamilyFilingPrompt', () => {
  it('returns system and user strings', () => {
    const result = buildFamilyFilingPrompt({ ...baseFacts })
    expect(result.system).toBeDefined()
    expect(result.user).toBeDefined()
    expect(result.system.length).toBeGreaterThan(50)
    expect(result.user.length).toBeGreaterThan(50)
  })

  it('includes DRAFT disclaimer', () => {
    const result = buildFamilyFilingPrompt({ ...baseFacts })
    expect(result.system).toContain('DRAFT')
  })

  it('uses Petitioner/Respondent not Plaintiff/Defendant', () => {
    const result = buildFamilyFilingPrompt({ ...baseFacts })
    expect(result.system).toContain('Petitioner')
    expect(result.system).toContain('Respondent')
    expect(result.system).not.toContain('Plaintiff')
    expect(result.user).toContain('Jane Smith')
    expect(result.user).toContain('John Smith')
  })

  // Sub-type document title tests
  it('generates divorce petition title', () => {
    const result = buildFamilyFilingPrompt({ ...baseFacts, family_sub_type: 'divorce' })
    expect(result.system).toContain('ORIGINAL PETITION FOR DIVORCE')
  })

  it('generates SAPCR title for custody', () => {
    const result = buildFamilyFilingPrompt({ ...baseFacts, family_sub_type: 'custody' })
    expect(result.system).toContain('SUIT AFFECTING THE PARENT-CHILD RELATIONSHIP')
  })

  it('generates protective order title', () => {
    const result = buildFamilyFilingPrompt({
      ...baseFacts,
      family_sub_type: 'protective_order',
      domestic_violence_description: 'Physical violence',
    })
    expect(result.system).toContain('APPLICATION FOR PROTECTIVE ORDER')
  })

  it('generates modification title', () => {
    const result = buildFamilyFilingPrompt({
      ...baseFacts,
      family_sub_type: 'modification',
      existing_order_court: 'Travis County',
      existing_order_cause_number: '2024-FM-001',
      modification_reason: 'Job loss',
    })
    expect(result.system).toContain('PETITION TO MODIFY')
  })

  // Content tests
  it('includes residency requirements for divorce', () => {
    const result = buildFamilyFilingPrompt({
      ...baseFacts,
      petitioner_county_months: 4,
      petitioner_state_months: 8,
    })
    expect(result.system).toContain('6.301')
  })

  it('includes UCCJEA affidavit for custody', () => {
    const result = buildFamilyFilingPrompt({
      ...baseFacts,
      family_sub_type: 'custody',
      children: [{ name: 'Child 1', date_of_birth: '2020-01-01', relationship: 'biological' }],
    })
    expect(result.system).toContain('UCCJEA')
  })

  it('includes child support guidelines', () => {
    const result = buildFamilyFilingPrompt({
      ...baseFacts,
      family_sub_type: 'child_support',
      child_support_amount: 1200,
    })
    expect(result.system).toContain('154')
  })

  it('includes spousal support eligibility', () => {
    const result = buildFamilyFilingPrompt({
      ...baseFacts,
      family_sub_type: 'spousal_support',
      spousal_support_amount: 2000,
      spousal_support_duration_months: 60,
    })
    expect(result.system).toContain('8.051')
  })

  it('includes violence description for protective order', () => {
    const result = buildFamilyFilingPrompt({
      ...baseFacts,
      family_sub_type: 'protective_order',
      domestic_violence_description: 'Physical violence on multiple occasions',
    })
    expect(result.user).toContain('Physical violence on multiple occasions')
  })

  it('includes existing order details for modification', () => {
    const result = buildFamilyFilingPrompt({
      ...baseFacts,
      family_sub_type: 'modification',
      existing_order_court: 'Travis County District Court',
      existing_order_cause_number: '2024-FM-001',
    })
    expect(result.user).toContain('Travis County District Court')
    expect(result.user).toContain('2024-FM-001')
  })

  // Schema validation
  it('schema accepts valid divorce facts', () => {
    const result = familyFilingFactsSchema.safeParse({
      petitioner: { full_name: 'Jane Smith' },
      respondent: { full_name: 'John Smith' },
      court_type: 'district',
      county: 'Travis',
      family_sub_type: 'divorce',
      grounds: 'The marriage has become insupportable due to discord or conflict.',
    })
    expect(result.success).toBe(true)
  })
})
