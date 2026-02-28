/**
 * Case Health Computation & Persistence
 *
 * Loads case data from Supabase, computes risk via the deterministic engine,
 * builds an inputs_snapshot for observability, and persists with
 * one-row-per-case-per-day idempotency.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { calculateCaseRisk, type RiskResult } from './case-risk-engine'
import { daysUntil } from './escalation-engine'

// ── Types ────────────────────────────────────────────────────────

export interface InputsSnapshot {
  overdue_deadlines: number
  due_within_3_days: number
  due_within_7_days: number
  evidence_count: number
  exhibit_count: number
  days_since_last_activity: number // -1 when no events exist
  discovery_due_within_3_days: number
}

// ── Pure snapshot builder (exported for testing) ─────────────────

export function buildInputsSnapshot(input: {
  deadlines: { key: string; due_at: string }[]
  taskEvents: { created_at: string }[]
  evidenceCount: number
  exhibitCount: number
  discoveryResponseDeadlines: { due_at: string; hasResponse: boolean }[]
  now: Date
}): InputsSnapshot {
  const { deadlines, taskEvents, evidenceCount, exhibitCount, discoveryResponseDeadlines, now } =
    input

  // Non-discovery deadlines only
  const nonDiscovery = deadlines.filter((d) => !d.key.startsWith('discovery_response_due'))

  let overdue_deadlines = 0
  let due_within_3_days = 0
  let due_within_7_days = 0

  for (const dl of nonDiscovery) {
    const days = daysUntil(now, new Date(dl.due_at))
    if (days < 0) {
      overdue_deadlines++
    } else if (days <= 3) {
      due_within_3_days++
      due_within_7_days++
    } else if (days <= 7) {
      due_within_7_days++
    }
  }

  // Days since last activity
  let days_since_last_activity = -1
  if (taskEvents.length > 0) {
    const mostRecent = taskEvents.reduce((latest, ev) =>
      new Date(ev.created_at) > new Date(latest.created_at) ? ev : latest
    )
    days_since_last_activity = daysUntil(new Date(mostRecent.created_at), now)
  }

  // Discovery deadlines due within 3 days with no response
  let discovery_due_within_3_days = 0
  for (const dd of discoveryResponseDeadlines) {
    if (dd.hasResponse) continue
    const days = daysUntil(now, new Date(dd.due_at))
    if (days >= 0 && days <= 3) {
      discovery_due_within_3_days++
    }
  }

  return {
    overdue_deadlines,
    due_within_3_days,
    due_within_7_days,
    evidence_count: evidenceCount,
    exhibit_count: exhibitCount,
    days_since_last_activity,
    discovery_due_within_3_days,
  }
}

// ── Main orchestrator ────────────────────────────────────────────

export async function computeAndStoreCaseHealth(
  supabase: SupabaseClient,
  caseId: string,
  now?: Date
): Promise<RiskResult> {
  const effectiveNow = now ?? new Date()

  // ── Load data (same queries as run-case-risk.ts) ───────────────

  const { data: deadlines, error: dlError } = await supabase
    .from('deadlines')
    .select('key, due_at')
    .eq('case_id', caseId)

  if (dlError) throw new Error(`Failed to load deadlines: ${dlError.message}`)

  const { data: taskEvents, error: teError } = await supabase
    .from('task_events')
    .select('created_at')
    .eq('case_id', caseId)

  if (teError) throw new Error(`Failed to load task events: ${teError.message}`)

  const { count: evidenceCount, error: evError } = await supabase
    .from('evidence_items')
    .select('id', { count: 'exact', head: true })
    .eq('case_id', caseId)

  if (evError) throw new Error(`Failed to count evidence: ${evError.message}`)

  const { data: exhibitSets, error: esError } = await supabase
    .from('exhibit_sets')
    .select('id')
    .eq('case_id', caseId)

  if (esError) throw new Error(`Failed to load exhibit sets: ${esError.message}`)

  const setIds = (exhibitSets ?? []).map((s) => s.id)
  let exhibitCount = 0
  if (setIds.length > 0) {
    const { count, error: exError } = await supabase
      .from('exhibits')
      .select('id', { count: 'exact', head: true })
      .in('exhibit_set_id', setIds)

    if (exError) throw new Error(`Failed to count exhibits: ${exError.message}`)
    exhibitCount = count ?? 0
  }

  const { data: trialBinders, error: tbError } = await supabase
    .from('trial_binders')
    .select('id')
    .eq('case_id', caseId)

  if (tbError) throw new Error(`Failed to load trial binders: ${tbError.message}`)

  // Discovery response deadlines with response status
  const discoveryDeadlines = (deadlines ?? []).filter((d) =>
    d.key.startsWith('discovery_response_due')
  )

  const discoveryResponseDeadlines: { due_at: string; hasResponse: boolean }[] = []
  for (const dd of discoveryDeadlines) {
    const { count: responseCount, error: drError } = await supabase
      .from('task_events')
      .select('id', { count: 'exact', head: true })
      .eq('case_id', caseId)
      .eq('kind', 'discovery_response_received')

    if (drError) throw new Error(`Failed to check discovery responses: ${drError.message}`)
    discoveryResponseDeadlines.push({
      due_at: dd.due_at,
      hasResponse: (responseCount ?? 0) > 0,
    })
  }

  const nonDiscoveryDeadlines = (deadlines ?? []).filter(
    (d) => !d.key.startsWith('discovery_response_due')
  )

  // ── Compute risk ───────────────────────────────────────────────

  const result = calculateCaseRisk(
    {
      deadlines: nonDiscoveryDeadlines,
      taskEvents: taskEvents ?? [],
      evidenceCount: evidenceCount ?? 0,
      exhibitSets: exhibitSets ?? [],
      exhibitCount,
      trialBinders: trialBinders ?? [],
      discoveryResponseDeadlines,
    },
    effectiveNow
  )

  // ── Build inputs snapshot ──────────────────────────────────────

  const inputs_snapshot = buildInputsSnapshot({
    deadlines: deadlines ?? [],
    taskEvents: taskEvents ?? [],
    evidenceCount: evidenceCount ?? 0,
    exhibitCount,
    discoveryResponseDeadlines,
    now: effectiveNow,
  })

  // ── Idempotent persistence (one row per case per day) ──────────

  const todayStart = new Date(
    Date.UTC(effectiveNow.getUTCFullYear(), effectiveNow.getUTCMonth(), effectiveNow.getUTCDate())
  )
  const todayEnd = new Date(todayStart.getTime() + 86_400_000)

  const { data: existing } = await supabase
    .from('case_risk_scores')
    .select('id')
    .eq('case_id', caseId)
    .gte('computed_at', todayStart.toISOString())
    .lt('computed_at', todayEnd.toISOString())
    .limit(1)
    .maybeSingle()

  const row = {
    case_id: caseId,
    overall_score: result.overall_score,
    health_score: result.overall_score,
    deadline_risk: result.deadline_risk,
    response_risk: result.response_risk,
    evidence_risk: result.evidence_risk,
    activity_risk: result.activity_risk,
    risk_level: result.risk_level,
    breakdown: result.breakdown,
    model: 'deterministic-v1',
    computed_at: effectiveNow.toISOString(),
    inputs_snapshot,
  }

  if (existing) {
    const { error: updateError } = await supabase
      .from('case_risk_scores')
      .update(row)
      .eq('id', existing.id)

    if (updateError) throw new Error(`Failed to update risk score: ${updateError.message}`)
  } else {
    const { error: insertError } = await supabase.from('case_risk_scores').insert(row)

    // Handle race condition: another request may have inserted first (unique index guard)
    if (insertError && insertError.code === '23505') {
      const { data: raced } = await supabase
        .from('case_risk_scores')
        .select('id')
        .eq('case_id', caseId)
        .gte('computed_at', todayStart.toISOString())
        .lt('computed_at', todayEnd.toISOString())
        .limit(1)
        .maybeSingle()

      if (raced) {
        const { error: updateError } = await supabase
          .from('case_risk_scores')
          .update(row)
          .eq('id', raced.id)

        if (updateError) throw new Error(`Failed to update risk score: ${updateError.message}`)
      }
    } else if (insertError) {
      throw new Error(`Failed to persist risk score: ${insertError.message}`)
    }
  }

  return result
}
