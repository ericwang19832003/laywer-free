import { describe, it, expect } from 'vitest'
import {
  buildAppellateBriefPrompt,
  appellateBriefFactsSchema,
  appellateBriefConfig,
  type AppellateBriefFacts,
} from '@lawyer-free/shared/motions/configs/appellate-brief'

describe('buildAppellateBriefPrompt', () => {
  const baseFacts: AppellateBriefFacts = {
    your_info: {
      full_name: 'Jane Smith',
      address: '100 Main St',
      city: 'Houston',
      state: 'TX',
      zip: '77001',
    },
    opposing_parties: [{ full_name: 'ACME Corp', address: '200 Corp Ave' }],
    appellate_court: 'Third Court of Appeals',
    trial_court: 'District Court of Harris County, Texas',
    cause_number: '2026-CI-01234',
    appellate_case_number: '03-26-00123-CV',
    statement_of_case:
      'This case arises from a breach of contract dispute over construction services. The trial court granted summary judgment for the defendant.',
    issues_presented: [
      'Whether the trial court erred in granting summary judgment when genuine issues of material fact existed.',
      'Whether the trial court abused its discretion in excluding key evidence.',
    ],
    standard_of_review: 'de_novo',
    argument_sections: [
      {
        heading: 'The Trial Court Erred in Granting Summary Judgment',
        argument:
          'The trial court failed to view the evidence in the light most favorable to the nonmovant. Material fact issues existed regarding the performance of the contract.',
      },
      {
        heading: 'The Trial Court Abused Its Discretion in Excluding Evidence',
        argument:
          'The trial court excluded critical documents that were properly authenticated and relevant to the breach of contract claim.',
      },
    ],
    prayer:
      'Appellant respectfully requests that this Court reverse the trial court judgment and remand for a new trial.',
  }

  it('returns { system, user } object', () => {
    const result = buildAppellateBriefPrompt(baseFacts)
    expect(result).toHaveProperty('system')
    expect(result).toHaveProperty('user')
  })

  it('system includes DRAFT disclaimer', () => {
    const result = buildAppellateBriefPrompt(baseFacts)
    expect(result.system).toContain('DRAFT')
    expect(result.system).toContain('NOT LEGAL ADVICE')
  })

  it('user includes appellate court', () => {
    const result = buildAppellateBriefPrompt(baseFacts)
    expect(result.user).toContain('Third Court of Appeals')
  })

  it('user includes issues presented numbered', () => {
    const result = buildAppellateBriefPrompt(baseFacts)
    expect(result.user).toContain('1.')
    expect(result.user).toContain(
      'Whether the trial court erred in granting summary judgment'
    )
    expect(result.user).toContain('2.')
    expect(result.user).toContain(
      'Whether the trial court abused its discretion'
    )
  })

  it('user includes standard of review', () => {
    const result = buildAppellateBriefPrompt(baseFacts)
    expect(result.user).toContain('de_novo')
  })

  it('user includes argument sections with headings', () => {
    const result = buildAppellateBriefPrompt(baseFacts)
    expect(result.user).toContain(
      'The Trial Court Erred in Granting Summary Judgment'
    )
    expect(result.user).toContain(
      'evidence in the light most favorable to the nonmovant'
    )
    expect(result.user).toContain(
      'The Trial Court Abused Its Discretion in Excluding Evidence'
    )
    expect(result.user).toContain(
      'critical documents that were properly authenticated'
    )
  })

  it('user includes prayer', () => {
    const result = buildAppellateBriefPrompt(baseFacts)
    expect(result.user).toContain(
      'reverse the trial court judgment and remand for a new trial'
    )
  })

  it('system mentions Appellant\'s Brief format', () => {
    const result = buildAppellateBriefPrompt(baseFacts)
    expect(result.system).toContain("Appellant's Brief")
  })

  it('system mentions Pro Se signature block', () => {
    const result = buildAppellateBriefPrompt(baseFacts)
    expect(result.system).toContain('Pro Se')
  })

  it('system mentions Table of Contents', () => {
    const result = buildAppellateBriefPrompt(baseFacts)
    expect(result.system).toContain('Table of Contents')
  })
})

describe('appellateBriefFactsSchema', () => {
  const validFacts = {
    your_info: { full_name: 'Jane Smith' },
    opposing_parties: [{ full_name: 'ACME Corp' }],
    appellate_court: 'Third Court of Appeals',
    trial_court: 'District Court of Harris County, Texas',
    statement_of_case:
      'This case arises from a breach of contract dispute over construction services.',
    issues_presented: [
      'Whether the trial court erred in granting summary judgment.',
    ],
    standard_of_review: 'de_novo',
    argument_sections: [
      {
        heading: 'Summary Judgment Error',
        argument:
          'The trial court failed to view evidence in the light most favorable to the nonmovant.',
      },
    ],
    prayer:
      'Appellant respectfully requests reversal and remand for a new trial.',
  }

  it('accepts valid facts', () => {
    const result = appellateBriefFactsSchema.safeParse(validFacts)
    expect(result.success).toBe(true)
  })

  it('rejects empty issues_presented', () => {
    const result = appellateBriefFactsSchema.safeParse({
      ...validFacts,
      issues_presented: [],
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty argument_sections', () => {
    const result = appellateBriefFactsSchema.safeParse({
      ...validFacts,
      argument_sections: [],
    })
    expect(result.success).toBe(false)
  })
})

describe('appellateBriefConfig', () => {
  it('has correct key', () => {
    expect(appellateBriefConfig.key).toBe('appellate_brief')
  })

  it('has correct category', () => {
    expect(appellateBriefConfig.category).toBe('post_trial')
  })

  it('has taskKey for gatekeeper', () => {
    expect(appellateBriefConfig.taskKey).toBe('appellate_brief')
  })

  it('has title and description', () => {
    expect(appellateBriefConfig.title).toBe('Appellate Brief')
    expect(appellateBriefConfig.description).toBeTruthy()
  })

  it('has reassurance text', () => {
    expect(appellateBriefConfig.reassurance).toBeTruthy()
  })

  it('has fields array', () => {
    expect(Array.isArray(appellateBriefConfig.fields)).toBe(true)
    expect(appellateBriefConfig.fields.length).toBeGreaterThan(0)
  })

  it('has buildPrompt function', () => {
    expect(typeof appellateBriefConfig.buildPrompt).toBe('function')
  })
})
