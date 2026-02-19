import { describe, it, expect } from 'vitest'
import {
  documentMetadataSchema,
  createDocumentSchema,
} from '@/lib/schemas/document'

describe('documentMetadataSchema', () => {
  it('accepts template generator', () => {
    const result = documentMetadataSchema.safeParse({ generator: 'template' })
    expect(result.success).toBe(true)
  })

  it('accepts openai generator with model and prompt_version', () => {
    const result = documentMetadataSchema.safeParse({
      generator: 'openai',
      model: 'gpt-4o-mini',
      prompt_version: '1.0.0',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid generator', () => {
    const result = documentMetadataSchema.safeParse({ generator: 'claude' })
    expect(result.success).toBe(false)
  })

  it('rejects empty object (generator is required)', () => {
    const result = documentMetadataSchema.safeParse({})
    expect(result.success).toBe(false)
  })
})

describe('createDocumentSchema with metadata', () => {
  const baseDoc = {
    doc_type: 'preservation_letter' as const,
    content_text: 'Letter content here.',
    sha256: 'abc123def456',
  }

  it('accepts document without metadata', () => {
    const result = createDocumentSchema.safeParse(baseDoc)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.metadata).toBeUndefined()
    }
  })

  it('accepts document with template metadata', () => {
    const result = createDocumentSchema.safeParse({
      ...baseDoc,
      metadata: { generator: 'template' },
    })
    expect(result.success).toBe(true)
  })

  it('accepts document with openai metadata', () => {
    const result = createDocumentSchema.safeParse({
      ...baseDoc,
      metadata: {
        generator: 'openai',
        model: 'gpt-4o-mini',
        prompt_version: '1.0.0',
      },
    })
    expect(result.success).toBe(true)
  })

  it('rejects document with invalid generator in metadata', () => {
    const result = createDocumentSchema.safeParse({
      ...baseDoc,
      metadata: { generator: 'invalid' },
    })
    expect(result.success).toBe(false)
  })

  it('accepts document with task_id and metadata', () => {
    const result = createDocumentSchema.safeParse({
      ...baseDoc,
      task_id: '550e8400-e29b-41d4-a716-446655440000',
      metadata: { generator: 'template' },
    })
    expect(result.success).toBe(true)
  })
})
