import { z } from 'zod'

export const DOC_TYPES = ['preservation_letter'] as const

export const createDocumentSchema = z.object({
  task_id: z.string().uuid().optional(),
  doc_type: z.enum(DOC_TYPES),
  content_text: z.string().min(1),
  sha256: z.string().min(1),
})
