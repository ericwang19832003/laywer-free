/**
 * Case Risk Scoring Orchestrator
 *
 * Loads case data from Supabase, calls the pure calculateCaseRisk function,
 * and persists the result to case_risk_scores.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { calculateCaseRisk, type RiskResult } from './case-risk-engine'

export async function runCaseRiskScoring(
  supabase: SupabaseClient,
  caseId: string,
  now?: Date
): Promise<RiskResult> {
  // Load deadlines
  const { data: deadlines, error: dlError } = await supabase
    .from('deadlines')
    .select('key, due_at')
    .eq('case_id', caseId)

  if (dlError) throw new Error(`Failed to load deadlines: ${dlError.message}`)

  // Load task events
  const { data: taskEvents, error: teError } = await supabase
    .from('task_events')
    .select('created_at')
    .eq('case_id', caseId)

  if (teError) throw new Error(`Failed to load task events: ${teError.message}`)

  // Load evidence count
  const { count: evidenceCount, error: evError } = await supabase
    .from('evidence_items')
    .select('id', { count: 'exact', head: true })
    .eq('case_id', caseId)

  if (evError) throw new Error(`Failed to count evidence: ${evError.message}`)

  // Load exhibit sets
  const { data: exhibitSets, error: esError } = await supabase
    .from('exhibit_sets')
    .select('id')
    .eq('case_id', caseId)

  if (esError) throw new Error(`Failed to load exhibit sets: ${esError.message}`)

  // Load exhibit count (across all sets for this case)
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

  // Load trial binders
  const { data: trialBinders, error: tbError } = await supabase
    .from('trial_binders')
    .select('id')
    .eq('case_id', caseId)

  if (tbError) throw new Error(`Failed to load trial binders: ${tbError.message}`)

  // Load discovery response deadlines with response status
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

  // Non-discovery deadlines for deadline risk
  const nonDiscoveryDeadlines = (deadlines ?? []).filter(
    (d) => !d.key.startsWith('discovery_response_due')
  )

  // Calculate risk
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
    now
  )

  // Persist
  const { error: insertError } = await supabase.from('case_risk_scores').insert({
    case_id: caseId,
    overall_score: result.overall_score,
    deadline_risk: result.deadline_risk,
    response_risk: result.response_risk,
    evidence_risk: result.evidence_risk,
    activity_risk: result.activity_risk,
    risk_level: result.risk_level,
    breakdown: result.breakdown,
    model: 'deterministic-v1',
  })

  if (insertError) throw new Error(`Failed to persist risk score: ${insertError.message}`)

  return result
}
