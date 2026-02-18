import { z } from 'zod'

export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
] as const

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export const DOC_TYPES = [
  'return_of_service',
] as const

export const courtDocumentSchema = z.object({
  doc_type: z.enum(DOC_TYPES),
  file_name: z.string().min(1),
  mime_type: z.enum(ALLOWED_MIME_TYPES),
  sha256: z.string().regex(/^[a-f0-9]{64}$/, 'Invalid SHA-256 hash'),
  file_size: z.number().int().positive().max(MAX_FILE_SIZE),
})

export type CourtDocumentInput = z.infer<typeof courtDocumentSchema>
