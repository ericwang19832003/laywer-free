/**
 * Milestone Definitions for Mid-Litigation Onboarding
 *
 * Defines the progression milestones for each dispute type.
 * Each milestone specifies:
 *   - Which task to unlock first when a user selects it
 *   - Which prior tasks to bulk-skip (cumulative from prior milestones)
 *
 * Used by the import API to fast-forward a case to the user's
 * current stage of litigation.
 */

import type { DisputeType } from '@/lib/rules/court-recommendation'

// -- Types --------------------------------------------------------------------

export interface Milestone {
  id: string
  label: string
  description: string
  firstUnlockedTask: string
  tasksToSkip: string[]
}

// -- Civil Milestones (generic civil fallback) --------------------------------

const CIVIL_MILESTONES: Milestone[] = [
  {
    id: 'start',
    label: 'Just getting started',
    description: 'I haven\'t filed anything yet.',
    firstUnlockedTask: 'welcome',
    tasksToSkip: [],
  },
  {
    id: 'filed',
    label: 'Filed with court',
    description: 'I\'ve already filed my case with the court.',
    firstUnlockedTask: 'evidence_vault',
    tasksToSkip: [
      'welcome',
      'intake',
      'prepare_filing',
      'file_with_court',
    ],
  },
  {
    id: 'served',
    label: 'Served the other party',
    description: 'I\'ve served the other party with the lawsuit.',
    firstUnlockedTask: 'wait_for_answer',
    tasksToSkip: [
      'welcome',
      'intake',
      'prepare_filing',
      'file_with_court',
      'evidence_vault',
      'preservation_letter',
      'upload_return_of_service',
      'confirm_service_facts',
    ],
  },
  {
    id: 'answer',
    label: 'Received an answer',
    description: 'The other party has filed their answer.',
    firstUnlockedTask: 'upload_answer',
    tasksToSkip: [
      'welcome',
      'intake',
      'prepare_filing',
      'file_with_court',
      'evidence_vault',
      'preservation_letter',
      'upload_return_of_service',
      'confirm_service_facts',
      'wait_for_answer',
      'check_docket_for_answer',
    ],
  },
  {
    id: 'conference_prep',
    label: 'Preparing for conference',
    description: 'I\'m preparing for the Rule 26(f) conference.',
    firstUnlockedTask: 'rule_26f_prep',
    tasksToSkip: [
      'welcome',
      'intake',
      'prepare_filing',
      'file_with_court',
      'evidence_vault',
      'preservation_letter',
      'upload_return_of_service',
      'confirm_service_facts',
      'wait_for_answer',
      'check_docket_for_answer',
      'upload_answer',
      'discovery_starter_pack',
    ],
  },
  {
    id: 'discovery',
    label: 'In discovery',
    description: 'I\'m in the discovery phase of litigation.',
    firstUnlockedTask: 'discovery_starter_pack',
    tasksToSkip: [
      'welcome',
      'intake',
      'prepare_filing',
      'file_with_court',
      'evidence_vault',
      'preservation_letter',
      'upload_return_of_service',
      'confirm_service_facts',
      'wait_for_answer',
      'check_docket_for_answer',
      'upload_answer',
      'rule_26f_prep',
      'mandatory_disclosures',
    ],
  },
  {
    id: 'trial_prep',
    label: 'Preparing for trial',
    description: 'I\'m preparing for trial.',
    firstUnlockedTask: 'trial_prep_checklist',
    tasksToSkip: [
      'welcome',
      'intake',
      'prepare_filing',
      'file_with_court',
      'evidence_vault',
      'preservation_letter',
      'upload_return_of_service',
      'confirm_service_facts',
      'wait_for_answer',
      'check_docket_for_answer',
      'upload_answer',
      'discovery_starter_pack',
      'rule_26f_prep',
      'mandatory_disclosures',
      'default_packet_prep',
    ],
  },
]

// -- Contract Milestones ------------------------------------------------------

const CONTRACT_MILESTONES: Milestone[] = [
  {
    id: 'start',
    label: 'Just getting started',
    description: 'I haven\'t taken any action yet.',
    firstUnlockedTask: 'welcome',
    tasksToSkip: [],
  },
  {
    id: 'demand_sent',
    label: 'Sent a demand letter',
    description: 'I\'ve already sent a demand letter.',
    firstUnlockedTask: 'contract_prepare_filing',
    tasksToSkip: [
      'welcome',
      'contract_intake',
      'evidence_vault',
      'contract_demand_letter',
      'contract_negotiation',
    ],
  },
  {
    id: 'filed',
    label: 'Filed with court',
    description: 'I\'ve already filed my case with the court.',
    firstUnlockedTask: 'contract_file_with_court',
    tasksToSkip: [
      'welcome',
      'contract_intake',
      'evidence_vault',
      'contract_demand_letter',
      'contract_negotiation',
      'contract_prepare_filing',
    ],
  },
  {
    id: 'served',
    label: 'Served the other party',
    description: 'I\'ve served the other party with the lawsuit.',
    firstUnlockedTask: 'contract_wait_for_answer',
    tasksToSkip: [
      'welcome',
      'contract_intake',
      'evidence_vault',
      'contract_demand_letter',
      'contract_negotiation',
      'contract_prepare_filing',
      'contract_file_with_court',
      'contract_serve_defendant',
    ],
  },
]

// -- Property Milestones ------------------------------------------------------

const PROPERTY_MILESTONES: Milestone[] = [
  {
    id: 'start',
    label: 'Just getting started',
    description: 'I haven\'t taken any action yet.',
    firstUnlockedTask: 'welcome',
    tasksToSkip: [],
  },
  {
    id: 'demand_sent',
    label: 'Sent a demand letter',
    description: 'I\'ve already sent a demand letter.',
    firstUnlockedTask: 'property_prepare_filing',
    tasksToSkip: [
      'welcome',
      'property_intake',
      'evidence_vault',
      'property_demand_letter',
      'property_negotiation',
    ],
  },
  {
    id: 'filed',
    label: 'Filed with court',
    description: 'I\'ve already filed my case with the court.',
    firstUnlockedTask: 'property_file_with_court',
    tasksToSkip: [
      'welcome',
      'property_intake',
      'evidence_vault',
      'property_demand_letter',
      'property_negotiation',
      'property_prepare_filing',
    ],
  },
  {
    id: 'served',
    label: 'Served the other party',
    description: 'I\'ve served the other party with the lawsuit.',
    firstUnlockedTask: 'property_wait_for_answer',
    tasksToSkip: [
      'welcome',
      'property_intake',
      'evidence_vault',
      'property_demand_letter',
      'property_negotiation',
      'property_prepare_filing',
      'property_file_with_court',
      'property_serve_defendant',
    ],
  },
]

// -- Other Dispute Milestones -------------------------------------------------

const OTHER_MILESTONES: Milestone[] = [
  {
    id: 'start',
    label: 'Just getting started',
    description: 'I haven\'t taken any action yet.',
    firstUnlockedTask: 'welcome',
    tasksToSkip: [],
  },
  {
    id: 'demand_sent',
    label: 'Sent a demand letter',
    description: 'I\'ve already sent a demand letter.',
    firstUnlockedTask: 'other_prepare_filing',
    tasksToSkip: [
      'welcome',
      'other_intake',
      'evidence_vault',
      'other_demand_letter',
    ],
  },
  {
    id: 'filed',
    label: 'Filed with court',
    description: 'I\'ve already filed my case with the court.',
    firstUnlockedTask: 'other_file_with_court',
    tasksToSkip: [
      'welcome',
      'other_intake',
      'evidence_vault',
      'other_demand_letter',
      'other_prepare_filing',
    ],
  },
  {
    id: 'served',
    label: 'Served the other party',
    description: 'I\'ve served the other party with the lawsuit.',
    firstUnlockedTask: 'other_wait_for_answer',
    tasksToSkip: [
      'welcome',
      'other_intake',
      'evidence_vault',
      'other_demand_letter',
      'other_prepare_filing',
      'other_file_with_court',
      'other_serve_defendant',
    ],
  },
]

// -- Personal Injury Milestones -----------------------------------------------

const PERSONAL_INJURY_MILESTONES: Milestone[] = [
  {
    id: 'start',
    label: 'Just getting started',
    description: 'I haven\'t done anything yet.',
    firstUnlockedTask: 'welcome',
    tasksToSkip: [],
  },
  {
    id: 'medical',
    label: 'Documenting damages',
    description: 'I\'m collecting records, estimates, and documentation.',
    firstUnlockedTask: 'pi_medical_records',
    tasksToSkip: [
      'welcome',
      'pi_intake',
    ],
  },
  {
    id: 'insurance',
    label: 'Dealing with insurance',
    description: 'I\'m communicating with the insurance company.',
    firstUnlockedTask: 'pi_insurance_communication',
    tasksToSkip: [
      'welcome',
      'pi_intake',
      'pi_medical_records',
      'evidence_vault',
    ],
  },
  {
    id: 'demand',
    label: 'Preparing demand letter',
    description: 'I\'m ready to send a demand letter.',
    firstUnlockedTask: 'prepare_pi_demand_letter',
    tasksToSkip: [
      'welcome',
      'pi_intake',
      'pi_medical_records',
      'evidence_vault',
      'pi_insurance_communication',
    ],
  },
  {
    id: 'negotiation',
    label: 'Negotiating settlement',
    description: 'I\'m in settlement negotiations.',
    firstUnlockedTask: 'pi_settlement_negotiation',
    tasksToSkip: [
      'welcome',
      'pi_intake',
      'pi_medical_records',
      'evidence_vault',
      'pi_insurance_communication',
      'prepare_pi_demand_letter',
    ],
  },
  {
    id: 'filing',
    label: 'Filing a lawsuit',
    description: 'Negotiations failed and I\'m filing suit.',
    firstUnlockedTask: 'prepare_pi_petition',
    tasksToSkip: [
      'welcome',
      'pi_intake',
      'pi_medical_records',
      'evidence_vault',
      'pi_insurance_communication',
      'prepare_pi_demand_letter',
      'pi_settlement_negotiation',
    ],
  },
  {
    id: 'waiting_for_answer',
    label: 'Waiting for the answer',
    description: 'I\'ve served the defendant and I\'m waiting for their response.',
    firstUnlockedTask: 'pi_wait_for_answer',
    tasksToSkip: [
      'welcome',
      'pi_intake',
      'pi_medical_records',
      'evidence_vault',
      'pi_insurance_communication',
      'prepare_pi_demand_letter',
      'pi_settlement_negotiation',
      'prepare_pi_petition',
      'pi_file_with_court',
      'pi_serve_defendant',
    ],
  },
  {
    id: 'discovery',
    label: 'In discovery',
    description: 'We\'re exchanging evidence and taking depositions.',
    firstUnlockedTask: 'pi_discovery_prep',
    tasksToSkip: [
      'welcome',
      'pi_intake',
      'pi_medical_records',
      'evidence_vault',
      'pi_insurance_communication',
      'prepare_pi_demand_letter',
      'pi_settlement_negotiation',
      'prepare_pi_petition',
      'pi_file_with_court',
      'pi_serve_defendant',
      'pi_wait_for_answer',
      'pi_review_answer',
    ],
  },
  {
    id: 'trial_prep',
    label: 'Preparing for trial',
    description: 'Discovery is done and I\'m getting ready for trial.',
    firstUnlockedTask: 'pi_trial_prep',
    tasksToSkip: [
      'welcome',
      'pi_intake',
      'pi_medical_records',
      'evidence_vault',
      'pi_insurance_communication',
      'prepare_pi_demand_letter',
      'pi_settlement_negotiation',
      'prepare_pi_petition',
      'pi_file_with_court',
      'pi_serve_defendant',
      'pi_wait_for_answer',
      'pi_review_answer',
      'pi_discovery_prep',
      'pi_discovery_responses',
      'pi_scheduling_conference',
      'pi_pretrial_motions',
      'pi_mediation',
    ],
  },
]

// -- Debt Defense Milestones --------------------------------------------------

const DEBT_DEFENSE_MILESTONES: Milestone[] = [
  {
    id: 'start',
    label: 'Just getting started',
    description: 'I just received a debt collection notice or lawsuit.',
    firstUnlockedTask: 'welcome',
    tasksToSkip: [],
  },
  {
    id: 'validation',
    label: 'Sent validation / preparing answer',
    description: 'I\'ve sent a validation letter and need to prepare my answer.',
    firstUnlockedTask: 'prepare_debt_defense_answer',
    tasksToSkip: [
      'welcome',
      'debt_defense_intake',
      'evidence_vault',
      'prepare_debt_validation_letter',
    ],
  },
  {
    id: 'answered',
    label: 'Filed my answer',
    description: 'I\'ve prepared my answer and need to file it.',
    firstUnlockedTask: 'debt_file_with_court',
    tasksToSkip: [
      'welcome',
      'debt_defense_intake',
      'evidence_vault',
      'prepare_debt_validation_letter',
      'prepare_debt_defense_answer',
    ],
  },
  {
    id: 'hearing',
    label: 'Preparing for hearing',
    description: 'My hearing is coming up.',
    firstUnlockedTask: 'debt_hearing_prep',
    tasksToSkip: [
      'welcome',
      'debt_defense_intake',
      'evidence_vault',
      'prepare_debt_validation_letter',
      'prepare_debt_defense_answer',
      'debt_file_with_court',
      'serve_plaintiff',
    ],
  },
]

// -- Small Claims Milestones --------------------------------------------------

const SMALL_CLAIMS_MILESTONES: Milestone[] = [
  {
    id: 'start',
    label: 'Just getting started',
    description: 'I haven\'t done anything yet.',
    firstUnlockedTask: 'welcome',
    tasksToSkip: [],
  },
  {
    id: 'demand_sent',
    label: 'Sent demand letter',
    description: 'I\'ve sent a demand letter and need to file.',
    firstUnlockedTask: 'prepare_small_claims_filing',
    tasksToSkip: [
      'welcome',
      'small_claims_intake',
      'evidence_vault',
      'prepare_demand_letter',
    ],
  },
  {
    id: 'filed',
    label: 'Filed with court',
    description: 'I\'ve filed my small claims case.',
    firstUnlockedTask: 'file_with_court',
    tasksToSkip: [
      'welcome',
      'small_claims_intake',
      'evidence_vault',
      'prepare_demand_letter',
      'prepare_small_claims_filing',
    ],
  },
  {
    id: 'served',
    label: 'Served the other party',
    description: 'I\'ve served the defendant.',
    firstUnlockedTask: 'prepare_for_hearing',
    tasksToSkip: [
      'welcome',
      'small_claims_intake',
      'evidence_vault',
      'prepare_demand_letter',
      'prepare_small_claims_filing',
      'file_with_court',
      'serve_defendant',
    ],
  },
  {
    id: 'hearing',
    label: 'Preparing for hearing',
    description: 'My hearing is coming up.',
    firstUnlockedTask: 'hearing_day',
    tasksToSkip: [
      'welcome',
      'small_claims_intake',
      'evidence_vault',
      'prepare_demand_letter',
      'prepare_small_claims_filing',
      'file_with_court',
      'serve_defendant',
      'prepare_for_hearing',
    ],
  },
]

// -- Family Milestones --------------------------------------------------------

const FAMILY_MILESTONES: Milestone[] = [
  {
    id: 'start',
    label: 'Just getting started',
    description: 'I haven\'t filed anything yet.',
    firstUnlockedTask: 'welcome',
    tasksToSkip: [],
  },
  {
    id: 'filed',
    label: 'Filed with court',
    description: 'I\'ve filed my family law case.',
    firstUnlockedTask: 'file_with_court',
    tasksToSkip: [
      'welcome',
      'family_intake',
      'safety_screening',
      'evidence_vault',
      'prepare_family_filing',
    ],
  },
  {
    id: 'served',
    label: 'Served the other party',
    description: 'I\'ve served the other party.',
    firstUnlockedTask: 'waiting_period',
    tasksToSkip: [
      'welcome',
      'family_intake',
      'safety_screening',
      'evidence_vault',
      'prepare_family_filing',
      'file_with_court',
      'upload_return_of_service',
      'confirm_service_facts',
    ],
  },
  {
    id: 'temporary',
    label: 'Temporary orders',
    description: 'I\'m dealing with temporary orders.',
    firstUnlockedTask: 'temporary_orders',
    tasksToSkip: [
      'welcome',
      'family_intake',
      'safety_screening',
      'evidence_vault',
      'prepare_family_filing',
      'file_with_court',
      'upload_return_of_service',
      'confirm_service_facts',
      'waiting_period',
    ],
  },
  {
    id: 'mediation',
    label: 'In mediation',
    description: 'I\'m in mediation.',
    firstUnlockedTask: 'mediation',
    tasksToSkip: [
      'welcome',
      'family_intake',
      'safety_screening',
      'evidence_vault',
      'prepare_family_filing',
      'file_with_court',
      'upload_return_of_service',
      'confirm_service_facts',
      'waiting_period',
      'temporary_orders',
    ],
  },
  {
    id: 'final',
    label: 'Final orders',
    description: 'I\'m working on final orders.',
    firstUnlockedTask: 'final_orders',
    tasksToSkip: [
      'welcome',
      'family_intake',
      'safety_screening',
      'evidence_vault',
      'prepare_family_filing',
      'file_with_court',
      'upload_return_of_service',
      'confirm_service_facts',
      'waiting_period',
      'temporary_orders',
      'mediation',
    ],
  },
]

// -- Landlord-Tenant Milestones -----------------------------------------------

const LANDLORD_TENANT_MILESTONES: Milestone[] = [
  {
    id: 'start',
    label: 'Just getting started',
    description: 'I haven\'t done anything yet.',
    firstUnlockedTask: 'welcome',
    tasksToSkip: [],
  },
  {
    id: 'demand_sent',
    label: 'Sent demand letter',
    description: 'I\'ve sent a demand letter.',
    firstUnlockedTask: 'lt_negotiation',
    tasksToSkip: [
      'welcome',
      'landlord_tenant_intake',
      'evidence_vault',
      'prepare_lt_demand_letter',
    ],
  },
  {
    id: 'negotiating',
    label: 'Negotiating',
    description: 'I\'m trying to settle before filing.',
    firstUnlockedTask: 'prepare_landlord_tenant_filing',
    tasksToSkip: [
      'welcome',
      'landlord_tenant_intake',
      'evidence_vault',
      'prepare_lt_demand_letter',
      'lt_negotiation',
    ],
  },
  {
    id: 'filed',
    label: 'Filed with court',
    description: 'I\'ve filed my case.',
    firstUnlockedTask: 'lt_file_with_court',
    tasksToSkip: [
      'welcome',
      'landlord_tenant_intake',
      'evidence_vault',
      'prepare_lt_demand_letter',
      'lt_negotiation',
      'prepare_landlord_tenant_filing',
    ],
  },
  {
    id: 'served',
    label: 'Served the other party',
    description: 'I\'ve served the other party.',
    firstUnlockedTask: 'lt_wait_for_response',
    tasksToSkip: [
      'welcome',
      'landlord_tenant_intake',
      'evidence_vault',
      'prepare_lt_demand_letter',
      'lt_negotiation',
      'prepare_landlord_tenant_filing',
      'lt_file_with_court',
      'serve_other_party',
    ],
  },
  {
    id: 'waiting_for_response',
    label: 'Waiting for response',
    description: 'I\'m waiting for the other party to respond.',
    firstUnlockedTask: 'lt_review_response',
    tasksToSkip: [
      'welcome',
      'landlord_tenant_intake',
      'evidence_vault',
      'prepare_lt_demand_letter',
      'lt_negotiation',
      'prepare_landlord_tenant_filing',
      'lt_file_with_court',
      'serve_other_party',
      'lt_wait_for_response',
    ],
  },
  {
    id: 'hearing',
    label: 'Preparing for hearing',
    description: 'My hearing is coming up.',
    firstUnlockedTask: 'lt_prepare_for_hearing',
    tasksToSkip: [
      'welcome',
      'landlord_tenant_intake',
      'evidence_vault',
      'prepare_lt_demand_letter',
      'lt_negotiation',
      'prepare_landlord_tenant_filing',
      'lt_file_with_court',
      'serve_other_party',
      'lt_wait_for_response',
      'lt_review_response',
      'lt_discovery',
    ],
  },
  {
    id: 'post',
    label: 'Post-judgment',
    description: 'My hearing is done and I need to handle post-judgment matters.',
    firstUnlockedTask: 'lt_post_judgment',
    tasksToSkip: [
      'welcome',
      'landlord_tenant_intake',
      'evidence_vault',
      'prepare_lt_demand_letter',
      'lt_negotiation',
      'prepare_landlord_tenant_filing',
      'lt_file_with_court',
      'serve_other_party',
      'lt_wait_for_response',
      'lt_review_response',
      'lt_discovery',
      'lt_prepare_for_hearing',
      'lt_mediation',
      'lt_hearing_day',
    ],
  },
]

// -- Dispatch Map -------------------------------------------------------------

const MILESTONES_BY_TYPE: Record<string, Milestone[]> = {
  contract: CONTRACT_MILESTONES,
  property: PROPERTY_MILESTONES,
  other: OTHER_MILESTONES,
  personal_injury: PERSONAL_INJURY_MILESTONES,
  debt_collection: DEBT_DEFENSE_MILESTONES,
  small_claims: SMALL_CLAIMS_MILESTONES,
  family: FAMILY_MILESTONES,
  landlord_tenant: LANDLORD_TENANT_MILESTONES,
}

// -- Public API ---------------------------------------------------------------

/**
 * Returns the ordered list of milestones for a given dispute type.
 * Falls back to civil milestones for unknown types.
 */
export function getMilestones(disputeType: DisputeType): Milestone[] {
  return MILESTONES_BY_TYPE[disputeType] ?? CIVIL_MILESTONES
}

/**
 * Returns the task_keys that should be bulk-skipped when importing
 * a case at the given milestone.
 * Returns an empty array for unknown milestones.
 */
export function getTasksToSkip(
  disputeType: DisputeType,
  milestoneId: string
): string[] {
  const milestones = getMilestones(disputeType)
  const milestone = milestones.find((m) => m.id === milestoneId)
  return milestone?.tasksToSkip ?? []
}

/**
 * Returns the milestone definition for a given dispute type and milestone ID.
 * Returns undefined if the milestone is not found.
 */
export function getMilestoneByID(
  disputeType: DisputeType,
  milestoneId: string
): Milestone | undefined {
  const milestones = getMilestones(disputeType)
  return milestones.find((m) => m.id === milestoneId)
}
