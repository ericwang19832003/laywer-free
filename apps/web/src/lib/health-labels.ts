/**
 * Human-readable labels for case health scores.
 *
 * Ranges:
 *   0-39  "Needs attention"  (destructive)
 *  40-69  "On track"         (amber)
 *  70-100 "Strong position"  (green)
 *   null  "Pending"          (muted)
 */

export interface HealthLabel {
  label: string
  colorClass: string
}

export function getHealthLabel(score: number | null): HealthLabel {
  if (score === null) {
    return { label: 'Pending', colorClass: 'text-warm-muted' }
  }
  if (score >= 70) {
    return { label: 'Strong position', colorClass: 'text-calm-green' }
  }
  if (score >= 40) {
    return { label: 'On track', colorClass: 'text-calm-amber' }
  }
  return { label: 'Needs attention', colorClass: 'text-destructive' }
}
