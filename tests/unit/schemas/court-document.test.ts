import { describe, it, expect } from 'vitest'
import {
  courtDocumentSchema,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE,
  DOC_TYPES,
} from '@/lib/schemas/court-document'

const validInput = {
  doc_type: 'return_of_service',
  file_name: 'return-of-service.pdf',
  mime_type: 'application/pdf',
  sha256: 'a'.repeat(64),
  file_size: 1024,
}

describe('courtDocumentSchema', () => {
  it('accepts valid PDF input', () => {
    const result = courtDocumentSchema.safeParse(validInput)
    expect(result.success).toBe(true)
  })

  it('accepts valid JPEG input', () => {
    const result = courtDocumentSchema.safeParse({
      ...validInput,
      file_name: 'scan.jpg',
      mime_type: 'image/jpeg',
    })
    expect(result.success).toBe(true)
  })

  it('accepts valid PNG input', () => {
    const result = courtDocumentSchema.safeParse({
      ...validInput,
      file_name: 'scan.png',
      mime_type: 'image/png',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid MIME type', () => {
    const result = courtDocumentSchema.safeParse({
      ...validInput,
      mime_type: 'text/plain',
    })
    expect(result.success).toBe(false)
  })

  it('rejects files over 10MB', () => {
    const result = courtDocumentSchema.safeParse({
      ...validInput,
      file_size: MAX_FILE_SIZE + 1,
    })
    expect(result.success).toBe(false)
  })

  it('accepts file exactly at 10MB limit', () => {
    const result = courtDocumentSchema.safeParse({
      ...validInput,
      file_size: MAX_FILE_SIZE,
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid SHA-256 (too short)', () => {
    const result = courtDocumentSchema.safeParse({
      ...validInput,
      sha256: 'abc123',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid SHA-256 (uppercase)', () => {
    const result = courtDocumentSchema.safeParse({
      ...validInput,
      sha256: 'A'.repeat(64),
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid SHA-256 (non-hex)', () => {
    const result = courtDocumentSchema.safeParse({
      ...validInput,
      sha256: 'g'.repeat(64),
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid doc_type', () => {
    const result = courtDocumentSchema.safeParse({
      ...validInput,
      doc_type: 'unknown_type',
    })
    expect(result.success).toBe(false)
  })

  it('rejects missing file_name', () => {
    const { file_name, ...rest } = validInput
    const result = courtDocumentSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })

  it('rejects empty file_name', () => {
    const result = courtDocumentSchema.safeParse({
      ...validInput,
      file_name: '',
    })
    expect(result.success).toBe(false)
  })

  it('rejects missing sha256', () => {
    const { sha256, ...rest } = validInput
    const result = courtDocumentSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })

  it('rejects missing doc_type', () => {
    const { doc_type, ...rest } = validInput
    const result = courtDocumentSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })

  it('rejects zero file_size', () => {
    const result = courtDocumentSchema.safeParse({
      ...validInput,
      file_size: 0,
    })
    expect(result.success).toBe(false)
  })

  it('rejects negative file_size', () => {
    const result = courtDocumentSchema.safeParse({
      ...validInput,
      file_size: -100,
    })
    expect(result.success).toBe(false)
  })
})

describe('constants', () => {
  it('ALLOWED_MIME_TYPES contains expected types', () => {
    expect(ALLOWED_MIME_TYPES).toContain('application/pdf')
    expect(ALLOWED_MIME_TYPES).toContain('image/jpeg')
    expect(ALLOWED_MIME_TYPES).toContain('image/png')
    expect(ALLOWED_MIME_TYPES).toHaveLength(3)
  })

  it('MAX_FILE_SIZE is 10MB', () => {
    expect(MAX_FILE_SIZE).toBe(10 * 1024 * 1024)
  })

  it('DOC_TYPES contains all doc types', () => {
    expect(DOC_TYPES).toContain('return_of_service')
    expect(DOC_TYPES).toContain('petition')
    expect(DOC_TYPES).toContain('answer')
    expect(DOC_TYPES).toContain('general_denial')
    expect(DOC_TYPES).toHaveLength(4)
  })
})
