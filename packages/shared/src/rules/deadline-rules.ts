/**
 * Config-Driven Deadline Rules
 *
 * Maps task completions to the deadlines they generate.
 *
 * When a user completes a task (e.g. "file_with_court"), this config tells the
 * deadline generator which deadlines to create, how many days offset from the
 * reference date, whether to apply Texas Rule 4, and what happens if the
 * deadline is missed.
 *
 * Adding a new deadline is as simple as adding a new entry to DEADLINE_RULES —
 * no code changes needed in the generator or UI.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DeadlineRule {
  /** Task key that triggers this deadline when completed */
  trigger_task: string
  /** Key stored in the deadlines table */
  deadline_key: string
  /** Human-readable label shown in the UI */
  deadline_label: string
  /** Calendar days from the reference date */
  offset_days: number
  /** What date to calculate from */
  reference: 'task_completed_at' | 'metadata_field'
  /** If reference = 'metadata_field', which field in task metadata to use */
  metadata_field?: string
  /** Whether to apply Texas Rule 4 (skip weekends + holidays) */
  apply_rule_4: boolean
  /** What happens if this deadline is missed */
  consequence: string
  /** Event key that satisfies/clears this deadline (optional) */
  condition_event?: string
}

// ---------------------------------------------------------------------------
// Constants — consequences & condition events
// ---------------------------------------------------------------------------

const SERVICE_CONSEQUENCE =
  'If you do not serve the other party within 90 days of filing, your case may be dismissed for want of prosecution under TRCP 99.'

const ANSWER_CONSEQUENCE =
  'If the other party does not file an answer by this date, you may be able to request a default judgment.'

const DIVORCE_WAITING_CONSEQUENCE =
  'Texas requires a 60-day waiting period after filing before a divorce can be finalized.'

const PO_HEARING_CONSEQUENCE =
  'The court must set a full hearing within 14 days of issuing a temporary ex parte protective order.'

// ---------------------------------------------------------------------------
// Service deadline trigger tasks
// ---------------------------------------------------------------------------

const SERVICE_TRIGGER_TASKS: string[] = [
  'property_file_with_court',
  'contract_file_with_court',
  'sc_file_with_court',
  'lt_file_with_court',
  'pi_file_with_court',
  're_file_with_court',
  'debt_file_with_court',
  'biz_partnership_file_with_court',
  'biz_b2b_file_with_court',
  'biz_employment_file_with_court',
  'divorce_file_with_court',
  'custody_file_with_court',
  'child_support_file_with_court',
  'spousal_support_file_with_court',
  'visitation_file_with_court',
  'mod_file_with_court',
  'other_file_with_court',
  'file_with_court',
]

// ---------------------------------------------------------------------------
// Answer deadline trigger tasks
// ---------------------------------------------------------------------------

const ANSWER_TRIGGER_TASKS: string[] = [
  'property_serve_defendant',
  'contract_serve_defendant',
  'sc_serve_defendant',
  'serve_other_party',
  'pi_serve_defendant',
  're_serve_defendant',
  'serve_plaintiff',
  'biz_partnership_serve_defendant',
  'biz_b2b_serve_defendant',
  'biz_employment_serve_defendant',
  'divorce_serve_respondent',
  'custody_serve_respondent',
  'child_support_serve_respondent',
  'spousal_support_serve_respondent',
  'visitation_serve_respondent',
  'mod_serve_respondent',
  'other_serve_defendant',
  'upload_return_of_service',
  'confirm_service_facts',
]

// ---------------------------------------------------------------------------
// Build the rules array
// ---------------------------------------------------------------------------

function buildServiceRules(): DeadlineRule[] {
  return SERVICE_TRIGGER_TASKS.map((task) => ({
    trigger_task: task,
    deadline_key: 'service_deadline',
    deadline_label: 'Deadline to Serve',
    offset_days: 90,
    reference: 'task_completed_at' as const,
    apply_rule_4: true,
    consequence: SERVICE_CONSEQUENCE,
    condition_event: 'defendant_served',
  }))
}

function buildAnswerRules(): DeadlineRule[] {
  return ANSWER_TRIGGER_TASKS.map((task) => ({
    trigger_task: task,
    deadline_key: 'answer_deadline_estimated',
    deadline_label: 'Estimated Answer Deadline',
    offset_days: 20,
    reference: 'task_completed_at' as const,
    apply_rule_4: true,
    consequence: ANSWER_CONSEQUENCE,
    condition_event: 'answer_filed',
  }))
}

function buildDisputeSpecificRules(): DeadlineRule[] {
  return [
    // Divorce 60-day waiting period
    {
      trigger_task: 'divorce_file_with_court',
      deadline_key: 'divorce_waiting_period',
      deadline_label: 'Divorce Waiting Period',
      offset_days: 60,
      reference: 'task_completed_at' as const,
      apply_rule_4: false,
      consequence: DIVORCE_WAITING_CONSEQUENCE,
    },
    // Protective order full hearing (14 days)
    {
      trigger_task: 'po_file_with_court',
      deadline_key: 'po_full_hearing',
      deadline_label: 'Protective Order Full Hearing',
      offset_days: 14,
      reference: 'task_completed_at' as const,
      apply_rule_4: true,
      consequence: PO_HEARING_CONSEQUENCE,
    },
  ]
}

// ---------------------------------------------------------------------------
// Exported rules array
// ---------------------------------------------------------------------------

export const DEADLINE_RULES: DeadlineRule[] = [
  ...buildServiceRules(),
  ...buildAnswerRules(),
  ...buildDisputeSpecificRules(),
]

// ---------------------------------------------------------------------------
// Lookup
// ---------------------------------------------------------------------------

/**
 * Return all deadline rules triggered by a given task key.
 *
 * A single task can trigger multiple deadlines (e.g. divorce_file_with_court
 * triggers both a service deadline and a 60-day waiting period).
 */
export function getDeadlineRulesForTask(taskKey: string): DeadlineRule[] {
  return DEADLINE_RULES.filter((r) => r.trigger_task === taskKey)
}
