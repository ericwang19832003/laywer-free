import { z } from 'zod'

export const storyInputSchema = z.object({
  story: z.string().min(50, 'Please describe your situation in at least a few sentences.').max(5000),
})

const addressSchema = z.object({
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().length(2),
  zip: z.string().regex(/^\d{5}(-\d{4})?$/),
})

const opposingPartySchema = z.object({
  name: z.string().min(1),
  type: z.enum(['person', 'business']),
  legalName: z.string().optional(),
  registeredAgent: z.object({
    name: z.string(),
    address: z.string(),
  }).optional(),
  entityType: z.string().optional(),
  entityStatus: z.string().optional(),
})

export const analysisResultSchema = z.object({
  disputeType: z.string(),
  subType: z.string().optional(),
  role: z.enum(['plaintiff', 'defendant']),
  opposingParty: opposingPartySchema,
  approximateAmount: z.number().positive(),
  state: z.string().length(2),
  summary: z.string(),
  confidence: z.enum(['high', 'medium', 'low']),
})

export const entityLookupSchema = z.object({
  name: z.string().min(1),
  state: z.string().length(2),
})

export const sendLetterSchema = z.object({
  caseId: z.string().uuid(),
  recipientName: z.string().min(1),
  recipientAddress: addressSchema,
  senderAddress: addressSchema,
  letterHtml: z.string().min(10),
})

export type StoryInput = z.infer<typeof storyInputSchema>
export type AnalysisResult = z.infer<typeof analysisResultSchema>
export type EntityLookupInput = z.infer<typeof entityLookupSchema>
export type SendLetterInput = z.infer<typeof sendLetterSchema>
