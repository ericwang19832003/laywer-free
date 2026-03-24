import { describe, it, expect } from 'vitest'
import {
  createPackSchema,
  addItemSchema,
  updatePackStatusSchema,
  servePackSchema,
  uploadResponseSchema,
  VALID_STATUS_TRANSITIONS,
  type DiscoveryPackStatus,
} from '@/lib/schemas/discovery'

describe('createPackSchema', () => {
  it('accepts empty object (title optional)', () => {
    const result = createPackSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('accepts a title', () => {
    const result = createPackSchema.safeParse({ title: 'First Set of Interrogatories' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.title).toBe('First Set of Interrogatories')
    }
  })

  it('rejects title over 500 chars', () => {
    const result = createPackSchema.safeParse({ title: 'x'.repeat(501) })
    expect(result.success).toBe(false)
  })
})

describe('addItemSchema', () => {
  it('accepts valid rfp item', () => {
    const result = addItemSchema.safeParse({
      item_type: 'rfp',
      prompt_text: 'Produce all contracts between the parties.',
    })
    expect(result.success).toBe(true)
  })

  it('accepts valid rog item', () => {
    const result = addItemSchema.safeParse({
      item_type: 'rog',
      prompt_text: 'State your full legal name.',
    })
    expect(result.success).toBe(true)
  })

  it('accepts valid rfa item', () => {
    const result = addItemSchema.safeParse({
      item_type: 'rfa',
      prompt_text: 'Admit that you received the notice on January 1, 2025.',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid item_type', () => {
    const result = addItemSchema.safeParse({
      item_type: 'subpoena',
      prompt_text: 'Some text',
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty prompt_text', () => {
    const result = addItemSchema.safeParse({
      item_type: 'rfp',
      prompt_text: '',
    })
    expect(result.success).toBe(false)
  })

  it('rejects missing item_type', () => {
    const result = addItemSchema.safeParse({
      prompt_text: 'Some text',
    })
    expect(result.success).toBe(false)
  })

  it('rejects prompt_text over 5000 chars', () => {
    const result = addItemSchema.safeParse({
      item_type: 'rog',
      prompt_text: 'x'.repeat(5001),
    })
    expect(result.success).toBe(false)
  })
})

describe('updatePackStatusSchema', () => {
  it('accepts valid status', () => {
    const result = updatePackStatusSchema.safeParse({ status: 'ready' })
    expect(result.success).toBe(true)
  })

  it('rejects invalid status', () => {
    const result = updatePackStatusSchema.safeParse({ status: 'archived' })
    expect(result.success).toBe(false)
  })
})

describe('VALID_STATUS_TRANSITIONS', () => {
  it('draft can only go to ready', () => {
    expect(VALID_STATUS_TRANSITIONS.draft).toEqual(['ready'])
  })

  it('ready can only go to served', () => {
    expect(VALID_STATUS_TRANSITIONS.ready).toEqual(['served'])
  })

  it('served can only go to responses_pending', () => {
    expect(VALID_STATUS_TRANSITIONS.served).toEqual(['responses_pending'])
  })

  it('responses_pending can only go to complete', () => {
    expect(VALID_STATUS_TRANSITIONS.responses_pending).toEqual(['complete'])
  })

  it('complete is terminal', () => {
    expect(VALID_STATUS_TRANSITIONS.complete).toEqual([])
  })

  it('covers all statuses', () => {
    const allStatuses: DiscoveryPackStatus[] = [
      'draft', 'ready', 'served', 'responses_pending', 'complete',
    ]
    expect(Object.keys(VALID_STATUS_TRANSITIONS).sort()).toEqual(allStatuses.sort())
  })
})

describe('servePackSchema', () => {
  it('accepts minimal valid input', () => {
    const result = servePackSchema.safeParse({
      served_at: '2025-06-15T10:00:00Z',
      service_method: 'email',
    })
    expect(result.success).toBe(true)
  })

  it('accepts full input with all optional fields', () => {
    const result = servePackSchema.safeParse({
      served_at: '2025-06-15T10:00:00Z',
      service_method: 'certified_mail',
      served_to_name: 'Jane Doe',
      served_to_email: 'jane@example.com',
      served_to_address: '123 Main St, Austin, TX 78701',
      notes: 'Sent via certified mail with return receipt',
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing served_at', () => {
    const result = servePackSchema.safeParse({
      service_method: 'email',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid served_at format', () => {
    const result = servePackSchema.safeParse({
      served_at: 'not-a-date',
      service_method: 'email',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid email', () => {
    const result = servePackSchema.safeParse({
      served_at: '2025-06-15T10:00:00Z',
      service_method: 'email',
      served_to_email: 'not-an-email',
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty service_method', () => {
    const result = servePackSchema.safeParse({
      served_at: '2025-06-15T10:00:00Z',
      service_method: '',
    })
    expect(result.success).toBe(false)
  })
})

describe('uploadResponseSchema', () => {
  it('accepts valid PDF upload', () => {
    const result = uploadResponseSchema.safeParse({
      file_name: 'response.pdf',
      mime_type: 'application/pdf',
      file_size: 1024 * 1024,
      response_type: 'answer',
    })
    expect(result.success).toBe(true)
  })

  it('accepts JPEG with all optional fields', () => {
    const result = uploadResponseSchema.safeParse({
      file_name: 'scan.jpg',
      mime_type: 'image/jpeg',
      file_size: 500_000,
      response_type: 'objection',
      received_at: '2025-07-01T09:00:00Z',
      notes: 'Partial response with objections noted',
    })
    expect(result.success).toBe(true)
  })

  it('accepts DOCX upload', () => {
    const result = uploadResponseSchema.safeParse({
      file_name: 'response.docx',
      mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      file_size: 2_000_000,
      response_type: 'answer',
    })
    expect(result.success).toBe(true)
  })

  it('rejects unsupported mime type', () => {
    const result = uploadResponseSchema.safeParse({
      file_name: 'data.csv',
      mime_type: 'text/csv',
      file_size: 1024,
      response_type: 'answer',
    })
    expect(result.success).toBe(false)
  })

  it('rejects file over 25MB', () => {
    const result = uploadResponseSchema.safeParse({
      file_name: 'large.pdf',
      mime_type: 'application/pdf',
      file_size: 26 * 1024 * 1024,
      response_type: 'answer',
    })
    expect(result.success).toBe(false)
  })

  it('rejects missing response_type', () => {
    const result = uploadResponseSchema.safeParse({
      file_name: 'response.pdf',
      mime_type: 'application/pdf',
      file_size: 1024,
    })
    expect(result.success).toBe(false)
  })
})
