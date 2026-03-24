import type { RosFields } from '@/lib/schemas/document-extraction'

const FIELD_WEIGHTS: Record<keyof RosFields, number> = {
  served_at: 0.30,
  service_method: 0.25,
  served_to: 0.20,
  server_name: 0.15,
  return_filed_at: 0.10,
}

export function computeConfidence(fields: RosFields): number {
  let score = 0
  for (const [field, weight] of Object.entries(FIELD_WEIGHTS)) {
    if (fields[field as keyof RosFields] != null) {
      score += weight
    }
  }
  return Math.round(score * 100) / 100
}

export function deriveStatus(
  confidence: number
): 'succeeded' | 'needs_review' | 'failed' {
  if (confidence >= 0.6) return 'succeeded'
  if (confidence > 0) return 'needs_review'
  return 'failed'
}
