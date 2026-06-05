import { describe, expect, it } from 'vitest'
import type { GuidedStepConfig } from '@lawyer-free/shared/guided-steps/types'
import { bizB2bFileWithCourtConfig } from '@lawyer-free/shared/guided-steps/business/biz-b2b-file-with-court'
import { bizEmploymentFileWithCourtConfig } from '@lawyer-free/shared/guided-steps/business/biz-employment-file-with-court'
import { bizPartnershipFileWithCourtConfig } from '@lawyer-free/shared/guided-steps/business/biz-partnership-file-with-court'
import { debtFilingGuideConfig } from '@lawyer-free/shared/guided-steps/debt-defense/debt-filing-guide'
import { createFamilyFilingGuideConfig } from '@lawyer-free/shared/guided-steps/family/family-filing-guide'
import { ltFileWithCourtConfig } from '@lawyer-free/shared/guided-steps/landlord-tenant/lt-file-with-court'
import { propertyFilingGuideConfig } from '@lawyer-free/shared/guided-steps/property/property-filing-guide'

function allText(config: GuidedStepConfig): string {
  return [
    config.title,
    config.reassurance,
    ...config.questions.flatMap((question) => [
      question.prompt,
      question.helpText ?? '',
      ...(question.options?.map((option) => option.label) ?? []),
    ]),
    ...config.generateSummary({}).map((item) => item.text),
  ].join('\n')
}

describe('category filing guides', () => {
  it('keeps property damage venue separate from real-property venue', () => {
    const text = allText(propertyFilingGuideConfig)

    expect(text).toContain('For vehicle or personal property damage')
    expect(text).toContain('where the damage happened')
    expect(text).toContain('where the defendant lives or does business')
    expect(text).toContain('Only use the real-property venue rule')
    expect(text).not.toContain('File in the county where the property is located')
  })

  it('does not tell debt defendants to pay a filing fee just to file an answer', () => {
    const text = allText(debtFilingGuideConfig)

    expect(text).toContain('no filing fee to file an Answer')
    expect(text).toContain('counterclaim')
    expect(text).not.toContain('Can you afford the filing fee?')
    expect(text).not.toContain('JP Court fees are typically')
  })

  it('tailors family filing instructions by subtype', () => {
    const custodyText = allText(createFamilyFilingGuideConfig('custody'))
    const protectiveOrderText = allText(
      createFamilyFilingGuideConfig('protective_order')
    )
    const divorceText = allText(createFamilyFilingGuideConfig('divorce'))

    expect(custodyText).toContain('custody or SAPCR')
    expect(custodyText).toContain("child's home county")
    expect(custodyText).not.toContain('spouse have lived')
    expect(custodyText).not.toContain('divorce filing fees')

    expect(protectiveOrderText).toContain('protective order')
    expect(protectiveOrderText).toContain('no filing fee')
    expect(protectiveOrderText).not.toContain('divorce filing fees')

    expect(divorceText).toContain('divorce')
    expect(divorceText).toContain('spouse')
  })

  it('asks landlord-tenant users for lease or proof of tenancy', () => {
    const text = allText(ltFileWithCourtConfig)

    expect(text).toContain('lease or proof of tenancy')
    expect(text).not.toContain('Did you attach a copy of the lease to your filing?')
  })

  it('gives commercial filing users concrete court, e-filing, service, and document checklists', () => {
    const b2bText = allText(bizB2bFileWithCourtConfig)
    const employmentText = allText(bizEmploymentFileWithCourtConfig)
    const partnershipText = allText(bizPartnershipFileWithCourtConfig)

    expect(b2bText).toContain('service provider')
    expect(b2bText).toContain('civil cover sheet')
    expect(b2bText).toContain('copies for service')
    expect(b2bText).toContain('contract, invoices, purchase orders')
    expect(b2bText).toContain('registered agent')

    expect(employmentText).toContain('service provider')
    expect(employmentText).toContain('civil cover sheet')
    expect(employmentText).toContain('right-to-sue letter')
    expect(employmentText).toContain('pay records')
    expect(employmentText).toContain('termination letter')

    expect(partnershipText).toContain('service provider')
    expect(partnershipText).toContain('partnership agreement')
    expect(partnershipText).toContain('accounting records')
    expect(partnershipText).toContain('ownership records')
  })
})
