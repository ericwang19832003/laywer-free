import { z } from 'zod'

// ============================================
// Exhibit Set schemas
// ============================================

export const NUMBERING_STYLES = ['numeric', 'alpha'] as const
export type NumberingStyle = (typeof NUMBERING_STYLES)[number]

export const createExhibitSetSchema = z.object({
  name: z.string().max(500).optional(),
  numbering_style: z.enum(NUMBERING_STYLES).optional(),
})

export type CreateExhibitSetInput = z.infer<typeof createExhibitSetSchema>

// ============================================
// Exhibit schemas
// ============================================

export const addExhibitSchema = z.object({
  evidence_item_id: z.string().uuid(),
  title: z.string().max(500).optional(),
  description: z.string().max(5000).optional(),
})

export type AddExhibitInput = z.infer<typeof addExhibitSchema>

export const updateExhibitSchema = z.object({
  title: z.string().max(500).optional(),
  description: z.string().max(5000).optional(),
})

export type UpdateExhibitInput = z.infer<typeof updateExhibitSchema>

export const reorderExhibitsSchema = z.object({
  ordered_exhibit_ids: z.array(z.string().uuid()).min(1),
})

export type ReorderExhibitsInput = z.infer<typeof reorderExhibitsSchema>
