import { z } from 'zod'

// ============================================
// Discovery Pack schemas
// ============================================

export const DISCOVERY_PACK_STATUSES = [
  'draft',
  'ready',
  'served',
  'responses_pending',
  'complete',
] as const

export type DiscoveryPackStatus = (typeof DISCOVERY_PACK_STATUSES)[number]

export const VALID_STATUS_TRANSITIONS: Record<DiscoveryPackStatus, DiscoveryPackStatus[]> = {
  draft: ['ready'],
  ready: ['served'],
  served: ['responses_pending'],
  responses_pending: ['complete'],
  complete: [],
}

export const ITEM_TYPES = ['rfp', 'rog', 'rfa'] as const
export type DiscoveryItemType = (typeof ITEM_TYPES)[number]

// ---- Create pack ----

export const createPackSchema = z.object({
  title: z.string().max(500).optional(),
})

export type CreatePackInput = z.infer<typeof createPackSchema>

// ---- Add item ----

export const addItemSchema = z.object({
  item_type: z.enum(ITEM_TYPES),
  prompt_text: z.string().min(1).max(5000),
})

export type AddItemInput = z.infer<typeof addItemSchema>

// ---- Update status ----

export const updatePackStatusSchema = z.object({
  status: z.enum(DISCOVERY_PACK_STATUSES),
})

export type UpdatePackStatusInput = z.infer<typeof updatePackStatusSchema>

// ---- Serve pack ----

export const servePackSchema = z.object({
  served_at: z.string().datetime(),
  service_method: z.string().min(1).max(200),
  served_to_name: z.string().max(500).optional(),
  served_to_email: z.string().email().optional(),
  served_to_address: z.string().max(2000).optional(),
  notes: z.string().max(5000).optional(),
})

export type ServePackInput = z.infer<typeof servePackSchema>

// ---- Upload response ----

export const ALLOWED_RESPONSE_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/tiff',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const

export const MAX_RESPONSE_FILE_SIZE = 25 * 1024 * 1024 // 25MB

export const uploadResponseSchema = z.object({
  file_name: z.string().min(1),
  mime_type: z.enum(ALLOWED_RESPONSE_MIME_TYPES),
  file_size: z.number().int().positive().max(MAX_RESPONSE_FILE_SIZE),
  response_type: z.string().min(1).max(200),
  received_at: z.string().datetime().optional(),
  notes: z.string().max(5000).optional(),
})

export type UploadResponseInput = z.infer<typeof uploadResponseSchema>

// ---- Confirm discovery response deadline ----

export const confirmDiscoveryDeadlineSchema = z.object({
  due_at: z.string().datetime(),
})

export type ConfirmDiscoveryDeadlineInput = z.infer<typeof confirmDiscoveryDeadlineSchema>
