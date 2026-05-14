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
  /**
   * Dot-notation path in task metadata to check before creating this deadline.
   * When set, the deadline is only created if the resolved value is in
   * `condition_metadata_values`.
   */
  condition_metadata_field?: string
  /** Allowed values — deadline created only when the field's value is in this array */
  condition_metadata_values?: string[]
  /** Only create deadline if case state matches */
  condition_state?: string
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

const UM_UIM_NOTICE_CONSEQUENCE =
  'Most UM/UIM policies require notification within 30 days. Failure to notify your insurer in time may jeopardize your UM/UIM claim.'

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
    // UM/UIM 30-day insurer notification (only when at-fault has no/unknown insurance)
    {
      trigger_task: 'pi_insurance_communication',
      deadline_key: 'um_uim_notice_30day',
      deadline_label: 'UM/UIM Insurer Notification Deadline',
      offset_days: 30,
      reference: 'task_completed_at' as const,
      apply_rule_4: false,
      consequence: UM_UIM_NOTICE_CONSEQUENCE,
      condition_metadata_field: 'guided_answers.at_fault_has_insurance',
      condition_metadata_values: ['no', 'unknown'],
    },
    // CA: Service deadline (60 days)
    {
      trigger_task: 'pi_file_with_court',
      deadline_key: 'ca_service_deadline',
      deadline_label: 'Deadline to Serve (California)',
      offset_days: 60,
      reference: 'task_completed_at' as const,
      apply_rule_4: false,
      consequence: 'If you do not serve the defendant within 60 days, the court may dismiss or sanction (CRC 3.110(b)).',
      condition_state: 'California',
    },
    // CA: Answer deadline (30 days)
    {
      trigger_task: 'pi_serve_defendant',
      deadline_key: 'ca_answer_deadline',
      deadline_label: 'Defendant Answer Deadline (California)',
      offset_days: 30,
      reference: 'task_completed_at' as const,
      apply_rule_4: false,
      consequence: 'If the defendant does not respond within 30 days, you may request entry of default (CCP §412.20).',
      condition_state: 'California',
    },
    // CA: Jury fee deadline (~180 days)
    {
      trigger_task: 'pi_file_with_court',
      deadline_key: 'ca_jury_fee_deadline',
      deadline_label: 'Jury Fee Posting Deadline',
      offset_days: 180,
      reference: 'task_completed_at' as const,
      apply_rule_4: false,
      consequence: 'You must post the $150 jury fee at or before your initial CMC. Missing this permanently waives your right to a jury trial.',
      condition_state: 'California',
      condition_metadata_field: 'guided_answers.jury_demand',
      condition_metadata_values: ['yes'],
    },
    // CA: UM/UIM arbitration deadline (2 years)
    {
      trigger_task: 'pi_insurance_communication',
      deadline_key: 'ca_um_uim_arbitration_deadline',
      deadline_label: 'UM/UIM Arbitration Deadline',
      offset_days: 730,
      reference: 'task_completed_at' as const,
      apply_rule_4: false,
      consequence: 'You have 2 years to initiate UM/UIM arbitration (Insurance Code §11580.2(i)(1)).',
      condition_state: 'California',
      condition_metadata_field: 'guided_answers.at_fault_has_insurance',
      condition_metadata_values: ['no', 'unknown'],
    },
    // PA: Service deadline (30 days — must reissue if not served)
    {
      trigger_task: 'pi_file_with_court',
      deadline_key: 'pa_service_deadline',
      deadline_label: 'Deadline to Serve (Pennsylvania)',
      offset_days: 30,
      reference: 'task_completed_at' as const,
      apply_rule_4: false,
      consequence: 'If not served within 30 days, you must file a praecipe to reissue/reinstate (Pa.R.C.P. 401). Failure to reissue may bar refiling if SOL expires.',
      condition_state: 'Pennsylvania',
    },
    // PA: Answer deadline (20 days)
    {
      trigger_task: 'pi_serve_defendant',
      deadline_key: 'pa_answer_deadline',
      deadline_label: 'Defendant Answer Deadline (Pennsylvania)',
      offset_days: 20,
      reference: 'task_completed_at' as const,
      apply_rule_4: false,
      consequence: 'If defendant does not respond within 20 days, you may seek default judgment after 10-day notice (Pa.R.C.P. 237.1).',
      condition_state: 'Pennsylvania',
    },
    // PA: Political subdivision notice (6 months)
    {
      trigger_task: 'pi_intake',
      deadline_key: 'pa_govt_notice_deadline',
      deadline_label: 'Political Subdivision Notice Deadline',
      offset_days: 180,
      reference: 'metadata_field' as const,
      metadata_field: 'incident_date',
      apply_rule_4: false,
      consequence: 'Written notice to political subdivision must be given within 6 months of injury (42 Pa.C.S. §8528). Failure is fatal to the claim.',
      condition_state: 'Pennsylvania',
      condition_metadata_field: 'government_entity_detected',
      condition_metadata_values: ['true'],
    },

    // ── New York ──────────────────────────────────────────────────

    // NY: Service deadline (120 days — CPLR §306-b)
    {
      trigger_task: 'pi_file_with_court',
      deadline_key: 'ny_service_deadline',
      deadline_label: 'Deadline to Serve (New York)',
      offset_days: 120,
      reference: 'task_completed_at' as const,
      apply_rule_4: false,
      consequence: 'If not served within 120 days, the court may dismiss under CPLR §306-b. Extensions available for good cause or interest of justice.',
      condition_state: 'New York',
    },
    // NY: Answer deadline (20 days personal service in-state, 30 days other methods)
    {
      trigger_task: 'pi_serve_defendant',
      deadline_key: 'ny_answer_deadline',
      deadline_label: 'Defendant Answer Deadline (New York)',
      offset_days: 20,
      reference: 'task_completed_at' as const,
      apply_rule_4: false,
      consequence: 'If defendant does not answer within 20 days (personal service in NY) or 30 days (other service), you may seek default judgment (CPLR §3215).',
      condition_state: 'New York',
    },
    // NY: Notice of Claim deadline (90 days — GML §50-e)
    {
      trigger_task: 'pi_intake',
      deadline_key: 'ny_notice_of_claim_deadline',
      deadline_label: 'Notice of Claim Deadline (90 days)',
      offset_days: 90,
      reference: 'metadata_field' as const,
      metadata_field: 'incident_date',
      apply_rule_4: false,
      consequence: 'Notice of Claim must be served on the municipality within 90 days of injury (GML §50-e). This is one of the strictest deadlines in any state. Late notice petitions available but not guaranteed.',
      condition_state: 'New York',
      condition_metadata_field: 'government_entity_detected',
      condition_metadata_values: ['true'],
    },
    // NY: Municipal SOL (1 year + 90 days — GML §50-i)
    {
      trigger_task: 'pi_intake',
      deadline_key: 'ny_municipal_sol',
      deadline_label: 'Municipal Lawsuit Filing Deadline (1yr + 90d)',
      offset_days: 455,
      reference: 'metadata_field' as const,
      metadata_field: 'incident_date',
      apply_rule_4: false,
      consequence: 'Lawsuit against municipality must be filed within 1 year and 90 days of the incident (GML §50-i). This is shorter than the general 3-year PI SOL.',
      condition_state: 'New York',
      condition_metadata_field: 'government_entity_detected',
      condition_metadata_values: ['true'],
    },

    // ── Florida ───────────────────────────────────────────────────

    // FL: Service deadline (120 days — Fla. R. Civ. P. 1.070(j))
    {
      trigger_task: 'pi_file_with_court',
      deadline_key: 'fl_service_deadline',
      deadline_label: 'Deadline to Serve (Florida)',
      offset_days: 120,
      reference: 'task_completed_at' as const,
      apply_rule_4: false,
      consequence: 'If not served within 120 days, the court must dismiss without prejudice unless good cause is shown (Fla. R. Civ. P. 1.070(j)).',
      condition_state: 'Florida',
    },
    // FL: Answer deadline (20 days)
    {
      trigger_task: 'pi_serve_defendant',
      deadline_key: 'fl_answer_deadline',
      deadline_label: 'Defendant Answer Deadline (Florida)',
      offset_days: 20,
      reference: 'task_completed_at' as const,
      apply_rule_4: false,
      consequence: 'If defendant does not respond within 20 days, you may seek default judgment (Fla. R. Civ. P. 1.500).',
      condition_state: 'Florida',
    },
    // FL: Government pre-suit notice (180 days before filing — §768.28(6))
    {
      trigger_task: 'pi_intake',
      deadline_key: 'fl_govt_notice_deadline',
      deadline_label: 'Government Pre-Suit Notice Deadline',
      offset_days: 1095,
      reference: 'metadata_field' as const,
      metadata_field: 'incident_date',
      apply_rule_4: false,
      consequence: 'Pre-suit notice to government agency AND Department of Financial Services must be filed within 3 years of incident (§768.28(6)(a)). Must then wait 180 days before filing suit.',
      condition_state: 'Florida',
      condition_metadata_field: 'government_entity_detected',
      condition_metadata_values: ['true'],
    },

    // ── Debt Defense: California ─────────────────────────────────

    // CA: Debt answer deadline (30 days — CCP §412.20)
    {
      trigger_task: 'debt_defense_intake',
      deadline_key: 'ca_debt_answer_deadline',
      deadline_label: 'Answer Deadline (California)',
      offset_days: 30,
      reference: 'metadata_field' as const,
      metadata_field: 'service_date',
      apply_rule_4: false,
      consequence: 'You must file your Answer within 30 days of service (CCP §412.20). Failure results in default judgment — the collector can then garnish wages and levy bank accounts.',
      condition_state: 'California',
    },

    // ── Debt Defense: Pennsylvania ───────────────────────────────

    // PA: Debt answer deadline (20 days — Pa.R.C.P. 1007.1)
    {
      trigger_task: 'debt_defense_intake',
      deadline_key: 'pa_debt_answer_deadline',
      deadline_label: 'Answer Deadline (Pennsylvania)',
      offset_days: 20,
      reference: 'metadata_field' as const,
      metadata_field: 'service_date',
      apply_rule_4: false,
      consequence: 'You must file your Answer or Preliminary Objections within 20 days of service. After that, the plaintiff can send a 10-Day Notice (Pa.R.C.P. 237.1) and then enter default judgment.',
      condition_state: 'Pennsylvania',
    },
    // NY: Debt answer deadline (20 days personal service, 30 days other — CPLR §320)
    {
      trigger_task: 'debt_defense_intake',
      deadline_key: 'ny_debt_answer_deadline',
      deadline_label: 'Answer Deadline (New York)',
      offset_days: 20,
      reference: 'metadata_field' as const,
      metadata_field: 'service_date',
      apply_rule_4: false,
      consequence: 'You must file your Answer within 20 days of personal service in NY (30 days for other methods). Failure results in default judgment (CPLR §3215). Consumer Credit Fairness Act requires SOL affidavit for default judgments.',
      condition_state: 'New York',
    },
    // FL: Debt answer deadline (20 days — Fla. R. Civ. P. 1.140)
    {
      trigger_task: 'debt_defense_intake',
      deadline_key: 'fl_debt_answer_deadline',
      deadline_label: 'Answer Deadline (Florida)',
      offset_days: 20,
      reference: 'metadata_field' as const,
      metadata_field: 'service_date',
      apply_rule_4: false,
      consequence: 'You must file your Answer within 20 days of service (Fla. R. Civ. P. 1.140). Failure results in default judgment. No filing fee for defendants in county court.',
      condition_state: 'Florida',
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
