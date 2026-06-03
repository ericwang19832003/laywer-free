import { z } from 'zod'

export const aiPreservationLetterAnalyzeRequestSchema = z.object({
  summary: z.string().min(1, 'Summary is required'),
  opponent_name: z.string().optional(),
  defendant_description: z.string().optional(),
})

export type AiPreservationLetterAnalyzeRequest = z.infer<typeof aiPreservationLetterAnalyzeRequestSchema>

export const aiPreservationLetterAnalyzeResponseSchema = z.object({
  defendant_type: z.string().min(1),
  defendant_systems: z.array(z.string()),
  deletion_risks: z.array(z.string()),
  suggested_claims: z.array(z.string()),
  case_context: z.string(),
})

export type AiPreservationLetterAnalyzeResponse = z.infer<typeof aiPreservationLetterAnalyzeResponseSchema>
