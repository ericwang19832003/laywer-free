import { describe, it, expect } from 'vitest'
import {
  buildNoticeOfAppealPrompt,
  noticeOfAppealFactsSchema,
  noticeOfAppealConfig,
  type NoticeOfAppealFacts,
} from '@lawyer-free/shared/motions/configs/notice-of-appeal'

describe('buildNoticeOfAppealPrompt', () => {
  const baseFacts: NoticeOfAppealFacts = {
    your_info: {
      full_name: 'Jane Smith',
      address: '100 Main St',
      city: 'Houston',
      state: 'TX',
      zip: '77001',
    },
    opposing_parties: [{ full_name: 'ACME Corp', address: '200 Corp Ave' }],
    court_type: 'district',
    county: 'Harris',
    cause_number: '2026-CI-01234',
    judgment_date: '2026-02-01',
    judgment_description:
      'The court granted summary judgment in favor of ACME Corp on all claims.',
    appeal_grounds: ['legal_error', 'insufficient_evidence'],
    appellate_court: 'Fifth Circuit Court of Appeals',
  }

  it('returns { system, user } object', () => {
    const result = buildNoticeOfAppealPrompt(baseFacts)
    expect(result).toHaveProperty('system')
    expect(result).toHaveProperty('user')
  })

  it('system includes DRAFT disclaimer', () => {
    const result = buildNoticeOfAppealPrompt(baseFacts)
    expect(result.system).toContain('DRAFT')
    expect(result.system).toContain('NOT LEGAL ADVICE')
  })

  it('user includes judgment date', () => {
    const result = buildNoticeOfAppealPrompt(baseFacts)
    expect(result.user).toContain('2026-02-01')
  })

  it('user includes judgment description', () => {
    const result = buildNoticeOfAppealPrompt(baseFacts)
    expect(result.user).toContain(
      'granted summary judgment in favor of ACME Corp'
    )
  })

  it('user includes appeal grounds listed', () => {
    const result = buildNoticeOfAppealPrompt(baseFacts)
    expect(result.user).toContain('legal_error')
    expect(result.user).toContain('insufficient_evidence')
  })

  it('user includes appellate court', () => {
    const result = buildNoticeOfAppealPrompt(baseFacts)
    expect(result.user).toContain('Fifth Circuit Court of Appeals')
  })

  it('system mentions Notice of Appeal format', () => {
    const result = buildNoticeOfAppealPrompt(baseFacts)
    expect(result.system).toContain('Notice of Appeal')
  })

  it('system mentions Pro Se signature block', () => {
    const result = buildNoticeOfAppealPrompt(baseFacts)
    expect(result.system).toContain('Pro Se')
  })
})

describe('noticeOfAppealFactsSchema', () => {
  const validFacts = {
    your_info: { full_name: 'Jane Smith' },
    opposing_parties: [{ full_name: 'ACME Corp' }],
    court_type: 'district',
    county: 'Harris',
    judgment_date: '2026-02-01',
    judgment_description:
      'The court granted summary judgment in favor of ACME Corp.',
    appeal_grounds: ['legal_error'],
    appellate_court: 'Fifth Circuit Court of Appeals',
  }

  it('accepts valid facts', () => {
    const result = noticeOfAppealFactsSchema.safeParse(validFacts)
    expect(result.success).toBe(true)
  })

  it('rejects empty appeal_grounds', () => {
    const result = noticeOfAppealFactsSchema.safeParse({
      ...validFacts,
      appeal_grounds: [],
    })
    expect(result.success).toBe(false)
  })
})

describe('noticeOfAppealConfig', () => {
  it('has correct key', () => {
    expect(noticeOfAppealConfig.key).toBe('notice_of_appeal')
  })

  it('has correct category', () => {
    expect(noticeOfAppealConfig.category).toBe('post_trial')
  })

  it('has title and description', () => {
    expect(noticeOfAppealConfig.title).toBe('Notice of Appeal')
    expect(noticeOfAppealConfig.description).toBeTruthy()
  })

  it('has reassurance text', () => {
    expect(noticeOfAppealConfig.reassurance).toBeTruthy()
  })

  it('has fields array', () => {
    expect(Array.isArray(noticeOfAppealConfig.fields)).toBe(true)
    expect(noticeOfAppealConfig.fields.length).toBeGreaterThan(0)
  })

  it('has buildPrompt function', () => {
    expect(typeof noticeOfAppealConfig.buildPrompt).toBe('function')
  })
})
