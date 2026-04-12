import { z } from 'zod'

const SUPPORTED_STATES = ['TX', 'CA', 'PA', 'NY', 'FL'] as const

const requiredSectionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  description: z.string().min(1),
  legalElements: z.array(z.string()).optional(),
  minParagraphs: z.number().int().positive().optional(),
})

const filingRulesSchema = z.object({
  courtName: z.string().min(1),
  maxPages: z.number().int().positive().optional(),
  fontRequirements: z.string().optional(),
  marginRequirements: z.string().optional(),
  serviceRequirements: z.string().min(1),
  filingFee: z.string().optional(),
  copies: z.number().int().positive().optional(),
  localFormUrl: z.string().url().optional(),
})

const rejectionReasonSchema = z.object({
  reason: z.string().min(1),
  howToAvoid: z.string().min(1),
  wizardStep: z.string().min(1),
})

const stepWarningSchema = z.object({
  condition: z.string().min(1),
  message: z.string().min(1),
})

const stepValidationSchema = z.object({
  required: z.array(z.string()),
  warnings: z.array(stepWarningSchema),
})

const glossaryEntrySchema = z.object({
  term: z.string().min(1),
  plainEnglish: z.string().min(1),
})

export const jurisdictionRuleConfigSchema = z.object({
  state: z.enum(SUPPORTED_STATES),
  disputeType: z.string().min(1),
  subType: z.string().optional(),
  requiredSections: z.array(requiredSectionSchema).min(1),
  filingRules: filingRulesSchema,
  rejectionReasons: z.array(rejectionReasonSchema),
  stepValidations: z.record(z.string(), stepValidationSchema),
  glossary: z.array(glossaryEntrySchema),
})

export type JurisdictionRuleConfig = z.infer<typeof jurisdictionRuleConfigSchema>
export type RequiredSection = z.infer<typeof requiredSectionSchema>
export type FilingRules = z.infer<typeof filingRulesSchema>
export type RejectionReason = z.infer<typeof rejectionReasonSchema>
export type StepValidation = z.infer<typeof stepValidationSchema>
export type GlossaryEntry = z.infer<typeof glossaryEntrySchema>
export { SUPPORTED_STATES }
