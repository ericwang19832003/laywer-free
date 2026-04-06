/**
 * Unit tests for the document quality evaluation scoring logic.
 *
 * These tests verify the scoring math — they do NOT make AI calls.
 * They use synthetic document strings to test each scoring dimension.
 */

import { describe, it, expect } from 'vitest'
import {
  checksToScore,
  averageDimensions,
  scoreDocument,
  type CheckResult,
  type DimensionScore,
} from '../../../scripts/eval-document-quality'
import type { EvalScenario } from '../../../scripts/eval-scenarios'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Minimal scenario for scoring tests. */
function makeScenario(overrides?: Partial<EvalScenario>): EvalScenario {
  return {
    id: 'test-1',
    name: 'Test Scenario',
    disputeType: 'small_claims',
    documentType: 'demand_letter',
    caseDetails: {
      caseName: 'Smith v. Jones',
      court: 'Los Angeles County Small Claims Court',
      yourName: 'John Smith',
      opposingParty: 'Bob Jones',
      disputeType: 'Breach of Contract',
      state: 'California',
      role: 'plaintiff',
    },
    documentDetails: {
      recipientName: 'Bob Jones',
      subject: 'Demand for Refund',
      facts: 'On January 1, 2026, Jones failed to deliver goods.',
      claims: 'Breach of contract under California Civil Code.',
      damages: '$5,000 for undelivered goods.',
    },
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// checksToScore
// ---------------------------------------------------------------------------

describe('checksToScore', () => {
  it('returns score 5 when all checks pass', () => {
    const checks: CheckResult[] = [
      { name: 'A', passed: true, weight: 1 },
      { name: 'B', passed: true, weight: 1 },
      { name: 'C', passed: true, weight: 1 },
    ]
    const result = checksToScore(checks)
    expect(result.score).toBe(5)
    expect(result.maxScore).toBe(5)
  })

  it('returns score 1 when no checks pass', () => {
    const checks: CheckResult[] = [
      { name: 'A', passed: false, weight: 1 },
      { name: 'B', passed: false, weight: 1 },
    ]
    const result = checksToScore(checks)
    expect(result.score).toBe(1)
  })

  it('returns intermediate score for partial pass', () => {
    const checks: CheckResult[] = [
      { name: 'A', passed: true, weight: 1 },
      { name: 'B', passed: false, weight: 1 },
    ]
    const result = checksToScore(checks)
    // 50% pass rate => 1 + 0.5 * 4 = 3
    expect(result.score).toBe(3)
  })

  it('respects weights — high-weight pass outweighs low-weight fail', () => {
    const checks: CheckResult[] = [
      { name: 'Heavy pass', passed: true, weight: 3 },
      { name: 'Light fail', passed: false, weight: 1 },
    ]
    const result = checksToScore(checks)
    // 3/4 = 0.75 => 1 + 0.75 * 4 = 4
    expect(result.score).toBe(4)
  })

  it('clamps score to range 1-5', () => {
    const allPass = checksToScore([{ name: 'X', passed: true, weight: 100 }])
    expect(allPass.score).toBeGreaterThanOrEqual(1)
    expect(allPass.score).toBeLessThanOrEqual(5)

    const allFail = checksToScore([{ name: 'X', passed: false, weight: 100 }])
    expect(allFail.score).toBeGreaterThanOrEqual(1)
    expect(allFail.score).toBeLessThanOrEqual(5)
  })

  it('returns score 1 for empty checks (total weight 0)', () => {
    const result = checksToScore([])
    expect(result.score).toBe(1)
  })

  it('preserves check results in output', () => {
    const checks: CheckResult[] = [
      { name: 'Check1', passed: true, weight: 1 },
      { name: 'Check2', passed: false, weight: 0.5 },
    ]
    const result = checksToScore(checks)
    expect(result.checks).toHaveLength(2)
    expect(result.checks[0].name).toBe('Check1')
    expect(result.checks[1].passed).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// averageDimensions
// ---------------------------------------------------------------------------

describe('averageDimensions', () => {
  it('returns null for empty input', () => {
    expect(averageDimensions({})).toBeNull()
  })

  it('returns the single score for one dimension', () => {
    const dims: Record<string, DimensionScore> = {
      legal: { score: 4, maxScore: 5, checks: [] },
    }
    expect(averageDimensions(dims)).toBe(4)
  })

  it('averages multiple dimensions correctly', () => {
    const dims: Record<string, DimensionScore> = {
      legal: { score: 4, maxScore: 5, checks: [] },
      format: { score: 3, maxScore: 5, checks: [] },
      complete: { score: 5, maxScore: 5, checks: [] },
      filing: { score: 2, maxScore: 5, checks: [] },
    }
    // (4+3+5+2) / 4 = 3.5
    expect(averageDimensions(dims)).toBe(3.5)
  })

  it('rounds to 2 decimal places', () => {
    const dims: Record<string, DimensionScore> = {
      a: { score: 3, maxScore: 5, checks: [] },
      b: { score: 4, maxScore: 5, checks: [] },
      c: { score: 4, maxScore: 5, checks: [] },
    }
    // (3+4+4) / 3 = 3.666...
    expect(averageDimensions(dims)).toBe(3.67)
  })
})

// ---------------------------------------------------------------------------
// scoreDocument — integration of all 4 dimension scorers
// ---------------------------------------------------------------------------

describe('scoreDocument', () => {
  it('returns all 4 dimension scores', () => {
    const doc = 'Short doc'
    const scenario = makeScenario()
    const scores = scoreDocument(doc, scenario)

    expect(scores).toHaveProperty('legalAccuracy')
    expect(scores).toHaveProperty('formatting')
    expect(scores).toHaveProperty('completeness')
    expect(scores).toHaveProperty('filingReadiness')
  })

  it('scores a well-formed demand letter highly', () => {
    const scenario = makeScenario()
    const doc = `
March 24, 2026

Bob Jones
123 Main Street
Los Angeles, CA 90001

Re: Demand for Refund — Smith v. Jones

Dear Bob Jones,

I, John Smith, am writing to demand the return of $5,000 pursuant to our agreement
dated January 1, 2026. This letter concerns the breach of contract that occurred when
you failed to deliver the goods as agreed.

FACTS:

On January 1, 2026, I entered into a written contract with you for the delivery of
custom furniture. I paid $5,000 upfront. The delivery deadline was February 1, 2026.
As of today, no goods have been delivered and you have not responded to my
communications. I have receipts and records of all payments made.

LEGAL BASIS:

Your failure to perform constitutes a breach of contract under California Civil Code.
I am entitled to a full refund of the $5,000 deposit plus any consequential damages.

DEMAND:

I hereby demand that you refund the full amount of $5,000 within 14 days of receipt
of this letter. Failure to comply may result in my filing a claim in the
Los Angeles County Small Claims Court.

I look forward to resolving this matter promptly.

Sincerely,

____________________
John Smith
456 Oak Avenue
Los Angeles, CA 90002
Phone: (310) 555-0100
Email: john.smith@email.com
`
    const scores = scoreDocument(doc, scenario)

    // A well-formed letter should score at least 4 on every dimension
    expect(scores.legalAccuracy.score).toBeGreaterThanOrEqual(4)
    expect(scores.formatting.score).toBeGreaterThanOrEqual(4)
    expect(scores.completeness.score).toBeGreaterThanOrEqual(4)
    expect(scores.filingReadiness.score).toBeGreaterThanOrEqual(4)
  })

  it('scores a garbage document poorly', () => {
    const scenario = makeScenario()
    const doc = 'lol hey dude give me my money back or else gonna sue u bruh'

    const scores = scoreDocument(doc, scenario)

    // Should fail on most checks
    expect(scores.formatting.score).toBeLessThanOrEqual(2)
    expect(scores.filingReadiness.score).toBeLessThanOrEqual(3)
  })

  it('detects missing party names', () => {
    const scenario = makeScenario()
    const doc = `
March 24, 2026

Dear Sir or Madam,

I am writing to demand relief pursuant to California Civil Code for breach of
contract. The defendant failed to deliver goods as agreed. I demand $5,000 in damages.

Sincerely,
A Concerned Person
`
    const scores = scoreDocument(doc, scenario)
    const nameChecks = scores.legalAccuracy.checks.filter(
      (c) => c.name.includes('Names')
    )
    // At least one name check should fail since "John Smith" and "Bob Jones" are not in the doc
    const anyFailed = nameChecks.some((c) => !c.passed)
    expect(anyFailed).toBe(true)
  })

  it('penalizes unfilled placeholders in filing readiness', () => {
    const scenario = makeScenario()
    const doc = `
March 24, 2026

Dear Bob Jones,

I, John Smith, demand $5,000 for breach of contract under California law.
The defendant is located at [insert address here]. This matter pertains to
[your case details]. Please respond within [insert number] days.

Sincerely,
John Smith
`
    const scores = scoreDocument(doc, scenario)
    const placeholderCheck = scores.filingReadiness.checks.find(
      (c) => c.name.includes('placeholder')
    )
    expect(placeholderCheck).toBeDefined()
    expect(placeholderCheck!.passed).toBe(false)
  })

  it('handles scenario without optional fields gracefully', () => {
    const scenario = makeScenario({
      caseDetails: {
        caseName: 'Doe v. Roe',
        yourName: 'Jane Doe',
      },
      documentDetails: {},
    })
    const doc = 'Jane Doe writes this short note.'

    // Should not throw
    const scores = scoreDocument(doc, scenario)
    expect(scores.legalAccuracy.score).toBeGreaterThanOrEqual(1)
    expect(scores.legalAccuracy.score).toBeLessThanOrEqual(5)
  })
})

// ---------------------------------------------------------------------------
// Threshold math
// ---------------------------------------------------------------------------

describe('passing threshold logic', () => {
  const THRESHOLD = 3.5

  it('average of 3.5 meets threshold', () => {
    const dims: Record<string, DimensionScore> = {
      a: { score: 3, maxScore: 5, checks: [] },
      b: { score: 4, maxScore: 5, checks: [] },
      c: { score: 3, maxScore: 5, checks: [] },
      d: { score: 4, maxScore: 5, checks: [] },
    }
    const avg = averageDimensions(dims)!
    expect(avg).toBe(3.5)
    expect(avg >= THRESHOLD).toBe(true)
  })

  it('average of 3.25 fails threshold', () => {
    const dims: Record<string, DimensionScore> = {
      a: { score: 3, maxScore: 5, checks: [] },
      b: { score: 3, maxScore: 5, checks: [] },
      c: { score: 4, maxScore: 5, checks: [] },
      d: { score: 3, maxScore: 5, checks: [] },
    }
    const avg = averageDimensions(dims)!
    expect(avg).toBe(3.25)
    expect(avg >= THRESHOLD).toBe(false)
  })

  it('perfect score (5.0) exceeds threshold', () => {
    const dims: Record<string, DimensionScore> = {
      a: { score: 5, maxScore: 5, checks: [] },
      b: { score: 5, maxScore: 5, checks: [] },
      c: { score: 5, maxScore: 5, checks: [] },
      d: { score: 5, maxScore: 5, checks: [] },
    }
    const avg = averageDimensions(dims)!
    expect(avg).toBe(5)
    expect(avg >= THRESHOLD).toBe(true)
  })

  it('minimum score (1.0) fails threshold', () => {
    const dims: Record<string, DimensionScore> = {
      a: { score: 1, maxScore: 5, checks: [] },
      b: { score: 1, maxScore: 5, checks: [] },
      c: { score: 1, maxScore: 5, checks: [] },
      d: { score: 1, maxScore: 5, checks: [] },
    }
    const avg = averageDimensions(dims)!
    expect(avg).toBe(1)
    expect(avg >= THRESHOLD).toBe(false)
  })
})
