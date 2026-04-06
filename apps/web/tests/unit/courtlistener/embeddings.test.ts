import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateEmbeddings, generateSingleEmbedding, EMBEDDING_DIMENSIONS } from '@/lib/courtlistener/embeddings'

vi.mock('openai', () => {
  const MockOpenAI = function () {
    return {
      embeddings: {
        create: vi.fn().mockResolvedValue({
          data: [{ embedding: new Array(3072).fill(0.1), index: 0 }],
        }),
      },
    }
  }
  return { default: MockOpenAI }
})

describe('generateEmbeddings', () => {
  beforeEach(() => {
    vi.stubEnv('OPENAI_API_KEY', 'test-key')
  })

  it('returns embeddings for input texts', async () => {
    const result = await generateEmbeddings(['test text'])
    expect(result).toHaveLength(1)
    expect(result[0]).toHaveLength(EMBEDDING_DIMENSIONS)
  })

  it('returns empty array for empty input', async () => {
    const result = await generateEmbeddings([])
    expect(result).toEqual([])
  })

  it('throws when OPENAI_API_KEY is not set', async () => {
    vi.stubEnv('OPENAI_API_KEY', '')
    await expect(generateEmbeddings(['test'])).rejects.toThrow('OPENAI_API_KEY is not set')
  })
})

describe('generateSingleEmbedding', () => {
  beforeEach(() => {
    vi.stubEnv('OPENAI_API_KEY', 'test-key')
  })

  it('returns a single embedding vector', async () => {
    const result = await generateSingleEmbedding('test text')
    expect(result).toHaveLength(EMBEDDING_DIMENSIONS)
  })
})
