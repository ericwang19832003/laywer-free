import { describe, it, expect } from 'vitest'
import { checkPreGeneration } from '@lawyer-free/shared/validators'
import { txDebtCollection } from '@lawyer-free/shared/jurisdiction-rules/tx'

describe('checkPreGeneration', () => {
  const fullWizardData = {
    yourInfo: { full_name: 'Min Wang', address: '123 Main St', city: 'Houston', state: 'TX', zip: '77001' },
    opposingParties: [{ full_name: 'ABC Collections LLC', address: '456 Corp Ave', city: 'Dallas', state: 'TX', zip: '75201' }],
    venue: { county: 'Harris', courtType: 'jp' },
    description: 'I received a collection letter for a debt from 2019. I never received validation within 30 days.',
    claimDetails: 'General denial. Statute of limitations has expired.',
    reliefRequested: 'Dismiss the case with prejudice.',
  }

  it('returns ready=true when all sections covered', () => {
    const result = checkPreGeneration(txDebtCollection, fullWizardData)
    expect(result.ready).toBe(true)
    expect(result.gaps).toHaveLength(0)
  })

  it('returns ready=false with gaps when parties missing', () => {
    const { yourInfo, ...noParties } = fullWizardData
    const result = checkPreGeneration(txDebtCollection, noParties)
    expect(result.ready).toBe(false)
    expect(result.gaps.some(g => g.sectionId === 'caption')).toBe(true)
  })

  it('returns gap with wizardStep for navigation', () => {
    const { claimDetails, ...noClaims } = fullWizardData
    const result = checkPreGeneration(txDebtCollection, noClaims)
    const claimGap = result.gaps.find(g => g.wizardStep === 'claims')
    expect(claimGap).toBeDefined()
    expect(claimGap!.wizardStep).toBe('claims')
  })

  it('each gap has a user-friendly message', () => {
    const result = checkPreGeneration(txDebtCollection, {})
    for (const gap of result.gaps) {
      expect(gap.message.length).toBeGreaterThan(10)
    }
  })
})
