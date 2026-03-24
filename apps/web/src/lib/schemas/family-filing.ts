import { z } from 'zod'
import { partySchema } from './filing'

export const childSchema = z.object({
  name: z.string().min(1),
  date_of_birth: z.string().min(1),
  age: z.number().optional(),
  relationship: z.enum(['biological', 'adopted', 'step']).default('biological'),
})

export const familyFilingFactsSchema = z.object({
  petitioner: partySchema,
  respondent: partySchema,
  court_type: z.literal('district'),
  county: z.string().min(1),
  cause_number: z.string().optional(),
  family_sub_type: z.enum([
    'divorce',
    'custody',
    'child_support',
    'visitation',
    'spousal_support',
    'protective_order',
    'modification',
  ]),
  marriage_date: z.string().optional(),
  separation_date: z.string().optional(),
  children: z.array(childSchema).default([]),
  grounds: z.string().min(10),
  additional_facts: z.string().optional(),
  custody_arrangement_sought: z
    .enum(['joint_managing', 'sole_managing', 'possessory'])
    .optional(),
  custody_reasoning: z.string().optional(),
  child_support_amount: z.number().optional(),
  spousal_support_amount: z.number().optional(),
  spousal_support_duration_months: z.number().optional(),
  community_property_exists: z.boolean().default(false),
  property_description: z.string().optional(),
  domestic_violence_description: z.string().optional(),
  protective_order_requests: z.array(z.string()).optional(),
  existing_order_court: z.string().optional(),
  existing_order_cause_number: z.string().optional(),
  modification_reason: z.string().optional(),
  petitioner_county_months: z.number().optional(),
  petitioner_state_months: z.number().optional(),
  military_involvement: z.boolean().default(false),
})

export type FamilyFilingFacts = z.infer<typeof familyFilingFactsSchema>
