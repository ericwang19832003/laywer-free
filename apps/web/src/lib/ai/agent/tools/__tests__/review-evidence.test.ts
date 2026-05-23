import { describe, it, expect } from 'vitest'
import { createReviewEvidenceTool } from '../review-evidence'

describe('createReviewEvidenceTool', () => {
  it('reports a more complete organization record when evidence count is high', async () => {
    const tool = createReviewEvidenceTool({ evidenceCount: 8, disputeType: 'landlord_tenant' })
    const result = await tool.invoke({})
    expect(result).toContain('8 item(s)')
    expect(result).toContain('more complete')
    expect(result).not.toContain('strong')
  })

  it('reports a limited organization record when count is low', async () => {
    const tool = createReviewEvidenceTool({ evidenceCount: 1, disputeType: 'landlord_tenant' })
    const result = await tool.invoke({})
    expect(result).toContain('limited')
    expect(result).not.toContain('thin')
  })

  it('includes dispute-type guidance', async () => {
    const tool = createReviewEvidenceTool({ evidenceCount: 3, disputeType: 'landlord_tenant' })
    const result = await tool.invoke({})
    expect(result).toContain('lease')
  })

  it('suggests adding documents when evidence file is limited', async () => {
    const tool = createReviewEvidenceTool({ evidenceCount: 1, disputeType: 'landlord_tenant' })
    const result = await tool.invoke({})
    expect(result).toContain('Consider adding more supporting documents')
  })

  it('uses fallback guidance for unknown dispute type', async () => {
    const tool = createReviewEvidenceTool({ evidenceCount: 2, disputeType: 'unknown_type' })
    const result = await tool.invoke({})
    expect(result).toContain('communications')
  })

  it('reports developing organization record for 3-4 items', async () => {
    const tool = createReviewEvidenceTool({ evidenceCount: 4, disputeType: 'debt_defense' })
    const result = await tool.invoke({})
    expect(result).toContain('developing')
    expect(result).not.toContain('moderate')
  })
})
