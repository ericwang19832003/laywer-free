/**
 * Health Alert Evaluation & Persistence
 *
 * Creates priority alerts when a case health score is concerning.
 * Alerts surface in the same Priority Alerts card as deadline-based
 * escalations, with deadline_id = null.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { isMessageSafe } from './escalation-engine'

// ── Types ────────────────────────────────────────────────────────

export interface HealthAlertAction {
  case_id: string
  deadline_id: null
  escalation_level: number
  message: string
  triggered_at: string
}

// ── Pure evaluation ──────────────────────────────────────────────

const LEVEL_3_MESSAGE =
  'Your case health is low right now. Review deadlines and recent activity.'
const LEVEL_2_MESSAGE =
  'Your case health needs attention. Check upcoming deadlines and pending tasks.'

export function evaluateHealthAlert(
  caseId: string,
  overallScore: number,
  now?: Date
): HealthAlertAction | null {
  const effectiveNow = now ?? new Date()

  let level: number
  let message: string

  if (overallScore <= 49) {
    level = 3
    message = LEVEL_3_MESSAGE
  } else if (overallScore <= 69) {
    level = 2
    message = LEVEL_2_MESSAGE
  } else {
    return null
  }

  if (!isMessageSafe(message)) {
    console.warn(
      `[health-alert] Blocked unsafe health alert message for case ${caseId}`
    )
    return null
  }

  return {
    case_id: caseId,
    deadline_id: null,
    escalation_level: level,
    message,
    triggered_at: effectiveNow.toISOString(),
  }
}

// ── DB helper with two-layer dedup ───────────────────────────────

export async function insertHealthAlertIfNeeded(
  supabase: SupabaseClient,
  action: HealthAlertAction
): Promise<boolean> {
  const triggeredAt = new Date(action.triggered_at)
  const dayStart = new Date(
    Date.UTC(
      triggeredAt.getUTCFullYear(),
      triggeredAt.getUTCMonth(),
      triggeredAt.getUTCDate()
    )
  )
  const dayEnd = new Date(dayStart.getTime() + 86_400_000)

  // Application-level dedup: check for existing health alert same case + same UTC day
  const { data: existing } = await supabase
    .from('reminder_escalations')
    .select('id')
    .eq('case_id', action.case_id)
    .is('deadline_id', null)
    .gte('triggered_at', dayStart.toISOString())
    .lt('triggered_at', dayEnd.toISOString())
    .limit(1)
    .maybeSingle()

  if (existing) return false

  // Insert — partial unique index catches any race condition
  const { error } = await supabase.from('reminder_escalations').insert({
    case_id: action.case_id,
    deadline_id: null,
    escalation_level: action.escalation_level,
    message: action.message,
    triggered_at: action.triggered_at,
    acknowledged: false,
  })

  if (error) {
    if (error.code === '23505') return false // duplicate, already inserted
    throw error
  }

  return true
}
