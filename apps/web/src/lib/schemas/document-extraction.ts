import { z } from 'zod'

export const SERVICE_METHODS = [
  'personal',
  'substituted',
  'posting',
  'certified_mail',
  'secretary_of_state',
  'publication',
  'other',
] as const

export const rosFieldsSchema = z.object({
  served_at: z.string().nullable(),
  return_filed_at: z.string().nullable(),
  service_method: z.enum(SERVICE_METHODS).nullable(),
  served_to: z.string().nullable(),
  server_name: z.string().nullable(),
})

export const extractRequestSchema = z.object({
  court_document_id: z.string().uuid(),
})

export type RosFields = z.infer<typeof rosFieldsSchema>
export type ExtractRequestInput = z.infer<typeof extractRequestSchema>

export interface DocumentExtraction {
  id: string
  case_id: string
  court_document_id: string
  extractor: 'regex' | 'ocr' | 'openai' | 'manual'
  status: 'pending' | 'succeeded' | 'needs_review' | 'failed'
  confidence: number | null
  fields: RosFields
  confirmed_by_user: boolean
  confirmed_fields: RosFields | null
  created_at: string
}
