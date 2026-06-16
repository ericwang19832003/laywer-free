import { describe, it, expect, vi } from 'vitest'

vi.stubEnv('OPENAI_API_KEY', 'test-key')

vi.mock('openai', () => ({
  default: vi.fn().mockImplementation(function (this: { embeddings: unknown }) {
    this.embeddings = {
      create: vi.fn().mockResolvedValue({
        data: [
          { embedding: new Array(1536).fill(0.1) },
          { embedding: new Array(1536).fill(0.2) },
        ],
      }),
    }
  }),
}))

import { generateDocumentEmbeddings, generateDocumentEmbedding } from '../embeddings'

describe('generateDocumentEmbeddings', () => {
  it('returns empty array for empty input', async () => {
    expect(await generateDocumentEmbeddings([])).toEqual([])
  })

  it('returns 1536-dim embeddings', async () => {
    const result = await generateDocumentEmbeddings(['hello', 'world'])
    expect(result).toHaveLength(2)
    expect(result[0]).toHaveLength(1536)
  })
})

describe('generateDocumentEmbedding', () => {
  it('returns a single 1536-dim embedding', async () => {
    const result = await generateDocumentEmbedding('test text')
    expect(result).toHaveLength(1536)
  })
})
