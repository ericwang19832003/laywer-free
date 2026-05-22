import { describe, it, expect, vi } from 'vitest'
import { createDraftDocumentTool } from '../draft-document'

vi.mock('@langchain/openai', () => ({
  ChatOpenAI: vi.fn().mockImplementation(function () {
    return {
      invoke: vi.fn().mockResolvedValue({ content: 'Dear [Defendant], I am writing to demand return of the security deposit...' }),
    }
  }),
}))

describe('createDraftDocumentTool', () => {
  it('returns a tool named draft_document', () => {
    const tool = createDraftDocumentTool({
      caseId: 'case-abc',
      disputeType: 'landlord_tenant',
      role: 'plaintiff',
      saveDraft: vi.fn().mockResolvedValue('draft-id-1'),
    })
    expect(tool.name).toBe('draft_document')
  })

  it('calls saveDraft and returns content', async () => {
    const mockSave = vi.fn().mockResolvedValue('draft-uuid-123')
    const tool = createDraftDocumentTool({
      caseId: 'case-abc',
      disputeType: 'landlord_tenant',
      role: 'plaintiff',
      saveDraft: mockSave,
    })
    const result = await tool.invoke({ documentType: 'demand_letter', instructions: 'Request return of $800 deposit' })
    expect(mockSave).toHaveBeenCalledOnce()
    expect(mockSave).toHaveBeenCalledWith(expect.objectContaining({ caseId: 'case-abc', documentType: 'demand_letter' }))
    expect(result).toContain('demand_letter')
  })
})
