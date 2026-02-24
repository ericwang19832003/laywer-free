import { z } from 'zod'

// ============================================
// Trial Binder schemas
// ============================================

export const binderOptionsSchema = z.object({
  include_timeline: z.boolean().optional().default(false),
  include_deadlines: z.boolean().optional().default(false),
  include_all_evidence: z.boolean().optional().default(false),
  include_discovery: z.boolean().optional().default(false),
})

export type BinderOptions = z.infer<typeof binderOptionsSchema>

export const createBinderSchema = z.object({
  exhibit_set_id: z.string().uuid(),
  title: z.string().max(500).optional(),
  options: binderOptionsSchema.optional().default({
    include_timeline: false,
    include_deadlines: false,
    include_all_evidence: false,
    include_discovery: false,
  }),
})

export type CreateBinderInput = z.infer<typeof createBinderSchema>
