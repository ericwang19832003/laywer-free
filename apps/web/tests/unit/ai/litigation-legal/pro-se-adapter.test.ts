import { describe, it, expect } from 'vitest'
import {
  buildCaseContext,
  applyProSeGuardrails,
  PRO_SE_DISCLAIMER,
  type CaseContextInput,
} from '@/lib/ai/litigation-legal/pro-se-adapter'

const BASE_CASE: CaseContextInput = {
  caseId: 'case-1',
  disputeType: 'contract',
  state: 'TX',
  role: 'plaintiff',
  caseName: 'Smith v. Jones',
  opposingParty: 'Jones Corp',
  court: 'Travis County District Court',
  caseNumber: '2024-CI-12345',
  keyFacts: ['Contract signed 2024-01-15', 'Payment not received by due date'],
  evidenceSummary: '3 documents: contract, invoice, payment demand',
  upcomingDeadlines: ['Answer due 2024-03-01'],
  completedSteps: ['Filed petition', 'Served defendant'],
}

describe('buildCaseContext', () => {
  it('returns a string containing all case fields', () => {
    const ctx = buildCaseContext(BASE_CASE)
    expect(ctx).toContain('Smith v. Jones')
    expect(ctx).toContain('TX')
    expect(ctx).toContain('plaintiff')
    expect(ctx).toContain('Travis County District Court')
    expect(ctx).toContain('Contract signed 2024-01-15')
    expect(ctx).toContain('3 documents')
  })

  it('handles null court and caseNumber gracefully', () => {
    const ctx = buildCaseContext({ ...BASE_CASE, court: null, caseNumber: null })
    expect(ctx).toContain('Not yet filed')
  })
})

describe('applyProSeGuardrails', () => {
  it('blocks directive legal-advice phrases', () => {
    const unsafe = 'You must file this motion immediately. I recommend doing so.'
    const result = applyProSeGuardrails(unsafe)
    expect(result).not.toContain('you must')
    expect(result).not.toContain('I recommend')
  })

  it('appends disclaimer to output', () => {
    const result = applyProSeGuardrails('Some legal document text.')
    expect(result).toContain(PRO_SE_DISCLAIMER)
  })

  it('preserves safe content', () => {
    const safe = 'This is a template for your review. Consider the following options.'
    const result = applyProSeGuardrails(safe)
    expect(result).toContain('Consider the following options')
  })
})
