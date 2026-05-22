import { describe, it, expect } from 'vitest'
import { createReviewEvidenceTool } from '../review-evidence'

describe('createReviewEvidenceTool', () => {
  it('reports strong case when evidence count is high', async () => {
    const tool = createReviewEvidenceTool({ evidenceCount: 8, disputeType: 'landlord_tenant' })
    const result = await tool.invoke({})
    expect(result).toContain('8 items')
    expect(result).toContain('strong')
  })

  it('flags weak evidence when count is low', async () => {
    const tool = createReviewEvidenceTool({ evidenceCount: 1, disputeType: 'landlord_tenant' })
    const result = await tool.invoke({})
    expect(result).toContain('thin')
  })

  it('includes dispute-type guidance', async () => {
    const tool = createReviewEvidenceTool({ evidenceCount: 3, disputeType: 'landlord_tenant' })
    const result = await tool.invoke({})
    expect(result).toContain('lease')
  })
})
