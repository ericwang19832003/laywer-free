import type { SupabaseClient } from '@supabase/supabase-js'
import type { ConfidenceResult, ConfidenceBreakdown } from './types'

export async function computeConfidenceScore(
  supabase: SupabaseClient,
  caseId: string
): Promise<ConfidenceResult> {
  // Fetch all data in parallel
  const [
    { data: tasks },
    { data: evidence },
    { data: deadlines },
    { data: discoveryPacks },
    { data: authorities },
    { data: notes },
    { data: binders },
  ] = await Promise.all([
    supabase.from('tasks').select('task_key, status').eq('case_id', caseId),
    supabase.from('evidence_items').select('id').eq('case_id', caseId),
    supabase.from('deadlines').select('key, due_at').eq('case_id', caseId).lt('due_at', new Date().toISOString()),
    supabase.from('discovery_packs').select('id').eq('case_id', caseId),
    supabase.from('case_authorities').select('id').eq('case_id', caseId),
    supabase.from('case_notes').select('id').eq('case_id', caseId),
    supabase.from('trial_binders').select('id').eq('case_id', caseId),
  ])

  const completedKeys = new Set(
    (tasks ?? []).filter(t => t.status === 'completed').map(t => t.task_key)
  )

  // Filing-related keys (any workflow)
  const filingKeys = ['prepare_filing', 'prepare_small_claims_filing', 'prepare_pi_petition',
    'contract_prepare_filing', 'property_prepare_filing', 'prepare_landlord_tenant_filing',
    'prepare_debt_defense_answer', 'other_prepare_filing',
    'divorce_prepare_filing', 'custody_prepare_filing', 'child_support_prepare_filing',
    'visitation_prepare_filing', 'spousal_support_prepare_filing', 'po_prepare_filing', 'mod_prepare_filing',
    'biz_partnership_prepare_filing', 'biz_employment_prepare_filing', 'biz_b2b_prepare_filing',
    're_prepare_filing']
  const fileWithCourtKeys = ['file_with_court', 'sc_file_with_court', 'pi_file_with_court',
    'contract_file_with_court', 'property_file_with_court', 'lt_file_with_court',
    'debt_file_with_court', 'other_file_with_court',
    'divorce_file_with_court', 'custody_file_with_court', 'child_support_file_with_court',
    'visitation_file_with_court', 'spousal_support_file_with_court', 'po_file_with_court', 'mod_file_with_court']
  const serveKeys = ['serve_defendant', 'sc_serve_defendant', 'pi_serve_defendant',
    'contract_serve_defendant', 'property_serve_defendant', 'lt_serve_defendant',
    'debt_serve_defendant', 'other_serve_defendant',
    'divorce_serve_respondent', 'custody_serve_respondent', 'visitation_serve_respondent',
    'spousal_support_serve_respondent']
  const intakeKeys = ['intake', 'small_claims_intake', 'pi_intake', 'contract_intake',
    'property_intake', 'lt_intake', 'debt_defense_intake', 'other_intake',
    'divorce_intake', 'custody_intake', 'child_support_intake', 'visitation_intake',
    'spousal_support_intake', 'po_intake', 'mod_intake']

  const hasAnyCompleted = (keys: string[]) => keys.some(k => completedKeys.has(k))

  // Check for missed deadlines — only count as missed if the associated
  // task (matching the deadline key) is still not completed
  const missedDeadlines = (deadlines ?? []).filter(d => {
    const matchingTask = (tasks ?? []).find(t => t.task_key === d.key)
    // Only penalize if the task exists and is not completed/skipped
    return matchingTask && matchingTask.status !== 'completed' && matchingTask.status !== 'skipped'
  })

  // Count tasks not completed/skipped that are unlocked
  const pendingTasks = (tasks ?? []).filter(t =>
    t.status !== 'completed' && t.status !== 'skipped' && t.status !== 'locked'
  )

  const breakdown: ConfidenceBreakdown = {
    case_created: 20,
    intake_completed: hasAnyCompleted(intakeKeys) ? 10 : 0,
    evidence_uploaded: (evidence?.length ?? 0) > 0 ? 10 : 0,
    filing_prep_done: hasAnyCompleted(filingKeys) ? 10 : 0,
    filed_with_court: hasAnyCompleted(fileWithCourtKeys) ? 5 : 0,
    served_defendant: hasAnyCompleted(serveKeys) ? 5 : 0,
    no_missed_deadlines: missedDeadlines.length === 0 ? 5 : 0,
    evidence_3plus: (evidence?.length ?? 0) >= 3 ? 5 : 0,
    discovery_created: (discoveryPacks?.length ?? 0) > 0 ? 5 : 0,
    tasks_current: pendingTasks.length === 0 ? 5 : 0,
    research_saved: (authorities?.length ?? 0) > 0 ? 5 : 0,
    notes_added: (notes?.length ?? 0) > 0 ? 5 : 0,
    trial_binder: (binders?.length ?? 0) > 0 ? 5 : 0,
    courtroom_prep: completedKeys.has('courtroom_prep') ? 5 : 0,
  }

  const score = Object.values(breakdown).reduce((sum, v) => sum + v, 0)

  return { score: Math.min(score, 100), breakdown }
}

export async function computeAndStoreConfidence(
  supabase: SupabaseClient,
  caseId: string
): Promise<ConfidenceResult> {
  const result = await computeConfidenceScore(supabase, caseId)

  await supabase.from('case_confidence_scores').insert({
    case_id: caseId,
    score: result.score,
    breakdown: result.breakdown,
  })

  return result
}
