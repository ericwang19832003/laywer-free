import { describe, it, expect, vi } from 'vitest'
import { loadJurisdictionRules } from '@lawyer-free/shared/jurisdiction-rules'
import { validateStep } from '@lawyer-free/shared/validators'
import { checkPreGeneration } from '@lawyer-free/shared/validators'
import { runTripleReview } from '@lawyer-free/shared/validators/triple-review'

describe('Petition Quality System — Integration', () => {
  it('full pipeline: step validation → pre-gen check → triple review', async () => {
    // 1. Load config
    const config = loadJurisdictionRules('TX', 'debt_collection')
    expect(config).not.toBeNull()

    // 2. Step validation — facts step with partial data
    const stepResult = validateStep(config!, 'facts', {
      debt_origination_date: '2019-06-15',
      description: 'Collection letter for old credit card debt',
    })
    expect(stepResult.blocks).toHaveLength(0)
    expect(stepResult.warnings.length).toBeGreaterThan(0)

    // 3. Pre-generation check
    const preGenResult = checkPreGeneration(config!, {
      yourInfo: { full_name: 'Test User' },
      opposingParties: [{ full_name: 'ABC Collections' }],
      venue: { county: 'Harris' },
      description: 'Collection letter for old credit card debt from 2019',
      claimDetails: 'General denial. SOL expired.',
      reliefRequested: 'Dismiss with prejudice.',
    })
    expect(preGenResult.ready).toBe(true)

    // 4. Triple review (mocked AI)
    const mockCallAI = vi.fn().mockResolvedValue('check_1: YES — ok')
    const reviewResult = await runTripleReview(config!, 'MOCK PETITION DRAFT', mockCallAI)
    expect(reviewResult.allPassed).toBe(true)
    expect(mockCallAI).toHaveBeenCalledTimes(3)
  })

  it('detects incomplete data through the pipeline', () => {
    const config = loadJurisdictionRules('TX', 'debt_collection')
    expect(config).not.toBeNull()

    // Step validation catches missing required field
    const stepResult = validateStep(config!, 'facts', {})
    expect(stepResult.blocks.length).toBeGreaterThan(0)

    // Pre-gen check catches missing sections
    const preGenResult = checkPreGeneration(config!, {})
    expect(preGenResult.ready).toBe(false)
    expect(preGenResult.gaps.length).toBeGreaterThan(0)
  })

  it('returns null for unsupported jurisdiction', () => {
    const config = loadJurisdictionRules('XX', 'debt_collection')
    expect(config).toBeNull()
  })
})
