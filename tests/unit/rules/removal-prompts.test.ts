import { describe, it, expect } from 'vitest'
import {
  buildAmendedComplaintPrompt,
  buildRemandMotionPrompt,
} from '@/lib/rules/removal-prompts'

describe('buildAmendedComplaintPrompt', () => {
  const baseFacts = {
    your_info: { full_name: 'Jane Smith', address: '100 Main St', city: 'Houston', state: 'TX', zip: '77001' },
    opposing_parties: [{ full_name: 'ACME Corp', address: '200 Corp Ave' }],
    description: 'Breach of contract dispute over construction services.',
    federal_case_number: '4:26-cv-01234',
    jurisdiction_basis: 'diversity' as const,
    amount_sought: 150000,
    claim_details: 'Defendant failed to complete contracted work.',
    request_jury_trial: true,
  }

  it('returns system and user prompts', () => {
    const result = buildAmendedComplaintPrompt(baseFacts)
    expect(result).toHaveProperty('system')
    expect(result).toHaveProperty('user')
  })

  it('system prompt includes FRCP formatting instructions', () => {
    const result = buildAmendedComplaintPrompt(baseFacts)
    expect(result.system).toContain('FIRST AMENDED COMPLAINT')
    expect(result.system).toContain('DRAFT')
  })

  it('user prompt includes federal case number', () => {
    const result = buildAmendedComplaintPrompt(baseFacts)
    expect(result.user).toContain('4:26-cv-01234')
  })

  it('user prompt includes jurisdiction basis', () => {
    const result = buildAmendedComplaintPrompt(baseFacts)
    expect(result.user).toContain('diversity')
  })

  it('includes jury demand when requested', () => {
    const result = buildAmendedComplaintPrompt(baseFacts)
    expect(result.system).toContain('Jury demand')
  })

  it('omits jury demand when not requested', () => {
    const result = buildAmendedComplaintPrompt({ ...baseFacts, request_jury_trial: false })
    expect(result.system).not.toContain('Jury demand')
  })
})

describe('buildRemandMotionPrompt', () => {
  const baseFacts = {
    your_info: { full_name: 'Jane Smith' },
    opposing_parties: [{ full_name: 'ACME Corp' }],
    federal_case_number: '4:26-cv-01234',
    original_court: 'District Court of Harris County, Texas',
    removal_date: '2026-02-15',
    remand_grounds: ['no_diversity', 'untimely_removal'] as const,
    additional_arguments: 'Defendant is a Texas corporation with principal place of business in Houston.',
  }

  it('returns system and user prompts', () => {
    const result = buildRemandMotionPrompt(baseFacts)
    expect(result).toHaveProperty('system')
    expect(result).toHaveProperty('user')
  })

  it('system prompt includes motion to remand format', () => {
    const result = buildRemandMotionPrompt(baseFacts)
    expect(result.system).toContain('MOTION TO REMAND')
    expect(result.system).toContain('28 U.S.C.')
  })

  it('user prompt includes remand grounds', () => {
    const result = buildRemandMotionPrompt(baseFacts)
    expect(result.user).toContain('no_diversity')
    expect(result.user).toContain('untimely_removal')
  })

  it('user prompt includes original court', () => {
    const result = buildRemandMotionPrompt(baseFacts)
    expect(result.user).toContain('District Court of Harris County')
  })

  it('user prompt includes removal date', () => {
    const result = buildRemandMotionPrompt(baseFacts)
    expect(result.user).toContain('2026-02-15')
  })
})
