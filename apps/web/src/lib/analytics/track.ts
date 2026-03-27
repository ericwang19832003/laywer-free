import type { SupabaseClient } from '@supabase/supabase-js'

export type AnalyticsEvent =
  | 'wizard_step_completed'
  | 'wizard_step_skipped'
  | 'wizard_abandoned'
  | 'ai_generation_used'
  | 'ai_generation_edited'
  | 'feature_accessed'
  | 'case_outcome_recorded'
  | 'deadline_met'
  | 'deadline_missed'
  | 'evidence_uploaded'
  | 'discovery_created'
  | 'research_query'

export async function trackEvent(
  supabase: SupabaseClient,
  caseId: string,
  eventType: AnalyticsEvent,
  payload: Record<string, unknown> = {}
): Promise<void> {
  await supabase.from('case_analytics').insert({
    case_id: caseId,
    event_type: eventType,
    payload,
  }).then(() => {}) // fire and forget
}
