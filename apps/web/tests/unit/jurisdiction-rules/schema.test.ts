import { describe, it, expect } from 'vitest'
import { jurisdictionRuleConfigSchema } from '@lawyer-free/shared/jurisdiction-rules/schema'

const validConfig = {
  state: 'TX',
  disputeType: 'debt_collection',
  requiredSections: [
    {
      id: 'caption',
      label: 'Caption',
      description: 'Case caption with court name, parties, and cause number',
      legalElements: ['court name', 'plaintiff name', 'defendant name', 'cause number placeholder'],
      minParagraphs: 1,
    },
  ],
  filingRules: {
    courtName: 'Justice of the Peace Court',
    serviceRequirements: 'Must serve via certified mail or personal service per TRCP Rule 21a',
    filingFee: '$54 (fee waiver available via Statement of Inability to Afford Payment)',
  },
  rejectionReasons: [
    {
      reason: 'Missing verification paragraph',
      howToAvoid: 'Include a signed verification under penalty of perjury',
      wizardStep: 'review',
    },
  ],
  stepValidations: {
    facts: {
      required: ['debt_origination_date'],
      warnings: [
        {
          condition: 'no_validation_notice_mentioned',
          message: 'Consider mentioning whether you received a written validation notice within 30 days. This strengthens an FDCPA defense.',
        },
      ],
    },
  },
  glossary: [
    {
      term: 'statute of limitations',
      plainEnglish: 'A deadline for the creditor to sue you. In Texas, it\'s usually 4 years for debt.',
    },
  ],
}

describe('jurisdictionRuleConfigSchema', () => {
  it('accepts a valid config', () => {
    const result = jurisdictionRuleConfigSchema.safeParse(validConfig)
    expect(result.success).toBe(true)
  })

  it('rejects missing state', () => {
    const { state, ...noState } = validConfig
    const result = jurisdictionRuleConfigSchema.safeParse(noState)
    expect(result.success).toBe(false)
  })

  it('rejects invalid state code', () => {
    const result = jurisdictionRuleConfigSchema.safeParse({ ...validConfig, state: 'XX' })
    expect(result.success).toBe(false)
  })

  it('rejects empty requiredSections', () => {
    const result = jurisdictionRuleConfigSchema.safeParse({ ...validConfig, requiredSections: [] })
    expect(result.success).toBe(false)
  })

  it('rejects rejectionReason without wizardStep', () => {
    const result = jurisdictionRuleConfigSchema.safeParse({
      ...validConfig,
      rejectionReasons: [{ reason: 'Missing caption', howToAvoid: 'Add it' }],
    })
    expect(result.success).toBe(false)
  })

  it('accepts config with optional subType', () => {
    const result = jurisdictionRuleConfigSchema.safeParse({ ...validConfig, subType: 'credit_card' })
    expect(result.success).toBe(true)
  })

  it('accepts config with optional filingRules fields', () => {
    const result = jurisdictionRuleConfigSchema.safeParse({
      ...validConfig,
      filingRules: {
        ...validConfig.filingRules,
        maxPages: 25,
        fontRequirements: '14pt minimum',
        marginRequirements: '1 inch all sides',
        copies: 3,
        localFormUrl: 'https://www.txcourts.gov/forms',
      },
    })
    expect(result.success).toBe(true)
  })
})
