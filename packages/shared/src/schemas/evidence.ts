import { z } from 'zod'

export const ALLOWED_EVIDENCE_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
] as const

export const MAX_EVIDENCE_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export const evidenceUploadSchema = z.object({
  file_name: z.string().min(1),
  mime_type: z.enum(ALLOWED_EVIDENCE_MIME_TYPES),
  file_size: z.number().int().positive().max(MAX_EVIDENCE_FILE_SIZE),
  label: z.string().max(200).optional(),
  notes: z.string().max(2000).optional(),
  captured_at: z.string().date().optional(),
})

export type EvidenceUploadInput = z.infer<typeof evidenceUploadSchema>
