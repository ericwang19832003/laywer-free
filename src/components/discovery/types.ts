export interface DiscoveryPack {
  id: string
  case_id: string
  title: string
  status: 'draft' | 'ready' | 'served' | 'responses_pending' | 'complete'
  created_by: string
  created_at: string
}

export interface DiscoveryItem {
  id: string
  pack_id: string
  item_type: 'rfp' | 'rog' | 'rfa'
  item_no: number
  prompt_text: string | null
  generated_text: string | null
  status: string
  created_at: string
}

export interface ServiceLog {
  id: string
  pack_id: string
  served_at: string
  service_method: string
  served_to_name: string | null
  served_to_email: string | null
  served_to_address: string | null
  notes: string | null
  created_at: string
}

export interface DiscoveryResponse {
  id: string
  pack_id: string
  received_at: string
  response_type: string
  storage_path: string
  file_name: string
  mime_type: string | null
  sha256: string | null
  notes: string | null
  created_at: string
}

export const STATUS_STEPS = [
  { key: 'draft', label: 'Draft' },
  { key: 'ready', label: 'Ready' },
  { key: 'served', label: 'Served' },
  { key: 'responses_pending', label: 'Waiting' },
  { key: 'complete', label: 'Complete' },
] as const

export const ITEM_TYPE_LABELS: Record<string, string> = {
  rfp: 'Request for Production',
  rog: 'Interrogatory',
  rfa: 'Request for Admission',
}

export const ITEM_TYPE_SHORT: Record<string, string> = {
  rfp: 'RFP',
  rog: 'ROG',
  rfa: 'RFA',
}
