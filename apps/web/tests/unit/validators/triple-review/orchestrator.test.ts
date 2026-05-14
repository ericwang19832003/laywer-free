import { describe, it, expect, vi, beforeEach } from 'vitest'
import { runTripleReview } from '@lawyer-free/shared/validators/triple-review'
import { txDebtCollection } from '@lawyer-free/shared/jurisdiction-rules/tx'

const mockCallAI = vi.fn()

describe('runTripleReview', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCallAI.mockResolvedValue('check_1: YES — ok\ncheck_2: YES — ok')
  })

  it('calls AI 3 times (one per agent)', async () => {
    await runTripleReview(txDebtCollection, 'draft text', mockCallAI)
    expect(mockCallAI).toHaveBeenCalledTimes(3)
  })

  it('runs all 3 agents in parallel', async () => {
    let concurrentCalls = 0
    let maxConcurrent = 0
    mockCallAI.mockImplementation(async () => {
      concurrentCalls++
      maxConcurrent = Math.max(maxConcurrent, concurrentCalls)
      await new Promise(r => setTimeout(r, 10))
      concurrentCalls--
      return 'check_1: YES — ok'
    })

    await runTripleReview(txDebtCollection, 'draft', mockCallAI)
    expect(maxConcurrent).toBe(3)
  })

  it('returns structured TripleReviewResult', async () => {
    const result = await runTripleReview(txDebtCollection, 'draft', mockCallAI)
    expect(result.legalCorrectness).toBeDefined()
    expect(result.jurisdictionCompliance).toBeDefined()
    expect(result.plainLanguage).toBeDefined()
    expect(typeof result.allPassed).toBe('boolean')
  })

  it('allPassed is true when all checks pass', async () => {
    mockCallAI.mockResolvedValue('check_1: YES — ok')
    const result = await runTripleReview(txDebtCollection, 'draft', mockCallAI)
    expect(result.allPassed).toBe(true)
  })

  it('allPassed is false when any check fails', async () => {
    mockCallAI.mockResolvedValue('check_1: NO — missing element')
    const result = await runTripleReview(txDebtCollection, 'draft', mockCallAI)
    expect(result.allPassed).toBe(false)
  })
})
