import { describe, it, expect } from 'vitest'
import {
  buildRAGPrompt, isRAGAnswerSafe, ragQuestionSchema, RAG_SYSTEM_PROMPT,
  type RAGChunkContext, type RAGCaseContext,
} from '@/lib/courtlistener/rag-prompts'

const mockChunks: RAGChunkContext[] = [{
  case_name: 'Smith v. Jones', court_name: '5th Circuit', date_filed: '2021-03-15',
  opinion_type: 'majority', content: 'The landlord must return the deposit within 30 days.', similarity: 0.92,
}]

const mockContext: RAGCaseContext = {
  dispute_type: 'landlord_tenant', jurisdiction: 'TX', role: 'plaintiff', county: 'Harris',
}

describe('buildRAGPrompt', () => {
  it('returns system and user prompts', () => {
    const result = buildRAGPrompt('What are my rights as a tenant in this situation?', mockChunks, mockContext)
    expect(result.system).toBe(RAG_SYSTEM_PROMPT)
    expect(typeof result.user).toBe('string')
    expect(result.user.length).toBeGreaterThan(0)
  })

  it('includes case context in user prompt', () => {
    const result = buildRAGPrompt('What are my rights as a tenant in this situation?', mockChunks, mockContext)
    expect(result.user).toContain('Dispute type: landlord_tenant')
    expect(result.user).toContain('Jurisdiction: TX')
    expect(result.user).toContain('Role: plaintiff')
    expect(result.user).toContain('County: Harris')
  })

  it('includes chunk citations with year', () => {
    const result = buildRAGPrompt('What are my rights as a tenant in this situation?', mockChunks, mockContext)
    expect(result.user).toContain('Smith v. Jones, 5th Circuit (2021)')
    expect(result.user).toContain('Opinion type: majority')
    expect(result.user).toContain('"The landlord must return the deposit within 30 days."')
  })

  it('numbers chunks sequentially', () => {
    const twoChunks: RAGChunkContext[] = [
      { ...mockChunks[0] },
      {
        case_name: 'Doe v. Roe', court_name: '9th Circuit', date_filed: '2022-07-01',
        opinion_type: 'concurring', content: 'Security deposits are regulated by state law.', similarity: 0.85,
      },
    ]
    const result = buildRAGPrompt('What are my rights as a tenant in this situation?', twoChunks, mockContext)
    expect(result.user).toContain('[1] Smith v. Jones')
    expect(result.user).toContain('[2] Doe v. Roe')
  })

  it('handles missing county gracefully', () => {
    const noCountyContext: RAGCaseContext = { ...mockContext, county: null }
    const result = buildRAGPrompt('What are my rights as a tenant in this situation?', mockChunks, noCountyContext)
    expect(result.user).not.toContain('County:')
  })
})

describe('isRAGAnswerSafe', () => {
  it('returns true for safe text', () => {
    expect(isRAGAnswerSafe('Based on the provided case law, courts have generally held that landlords must return deposits within 30 days.')).toBe(true)
  })

  it('returns false for unsafe text', () => {
    expect(isRAGAnswerSafe('As your attorney, I advise you to file immediately.')).toBe(false)
    expect(isRAGAnswerSafe('This outcome is guaranteed if you follow these steps.')).toBe(false)
  })
})

describe('ragQuestionSchema', () => {
  it('accepts valid question', () => {
    const result = ragQuestionSchema.safeParse({ question: 'What are my rights as a tenant in this case?' })
    expect(result.success).toBe(true)
  })

  it('rejects too-short question', () => {
    const result = ragQuestionSchema.safeParse({ question: 'hi' })
    expect(result.success).toBe(false)
  })
})
