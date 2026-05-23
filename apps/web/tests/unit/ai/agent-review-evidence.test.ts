import { describe, expect, it } from 'vitest'
import { createReviewEvidenceTool } from '@/lib/ai/agent/tools/review-evidence'

describe('review evidence agent tool', () => {
  it('uses completeness language instead of case-strength language', async () => {
    const tool = createReviewEvidenceTool({
      evidenceCount: 5,
      disputeType: 'personal_injury',
    })

    const result = String(await tool.invoke({}))
    const lower = result.toLowerCase()

    expect(lower).toContain('evidence file')
    expect(lower).toContain('more complete')
    expect(lower).not.toContain('strong')
    expect(lower).not.toContain('case strength')
    expect(lower).not.toContain('win')
  })
})
