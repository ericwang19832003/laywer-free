import { z } from 'zod'
import { SERVICE_METHODS } from './document-extraction'

export const confirmServiceFactsSchema = z.object({
  extraction_id: z.string().uuid(),
  served_at: z.string().nullable(),
  return_filed_at: z.string().nullable(),
  service_method: z.enum(SERVICE_METHODS).nullable(),
  served_to: z.string().nullable(),
  server_name: z.string().nullable(),
})

export type ConfirmServiceFactsInput = z.infer<typeof confirmServiceFactsSchema>

export interface ServiceFacts {
  id: string
  case_id: string
  served_at: string | null
  return_filed_at: string | null
  service_method: string | null
  served_to: string | null
  server_name: string | null
  source_extraction_id: string | null
  user_confirmed_at: string | null
  created_at: string
}
