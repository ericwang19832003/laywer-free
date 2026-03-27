import { z } from 'zod'
import { evidenceUploadSchema } from '../schemas/evidence'

// Re-export the Zod-inferred input type for convenience
export type EvidenceUploadInput = z.infer<typeof evidenceUploadSchema>

/** Row shape returned by Supabase for the evidence table */
export interface EvidenceRow {
  id: string
  case_id: string
  file_name: string
  mime_type: string
  file_size: number
  storage_path: string
  label?: string | null
  notes?: string | null
  captured_at?: string | null
  created_at: string
}
