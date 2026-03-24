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

// -- Real Estate Milestones ---------------------------------------------------

const REAL_ESTATE_MILESTONES: Milestone[] = [
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
    firstUnlockedTask: 're_prepare_filing',
    tasksToSkip: [
      'welcome',
      're_intake',
      're_evidence_vault',
      're_demand_letter',
      're_negotiation',
    ],
  },
  {
    id: 'filed',
    label: 'Filed with court',
    description: 'I\'ve already filed my case with the court.',
    firstUnlockedTask: 're_file_with_court',
    tasksToSkip: [
      'welcome',
      're_intake',
      're_evidence_vault',
      're_demand_letter',
      're_negotiation',
      're_prepare_filing',
    ],
  },
  {
    id: 'served',
    label: 'Served the other party',
    description: 'I\'ve served the other party with the lawsuit.',
    firstUnlockedTask: 're_wait_for_answer',
    tasksToSkip: [
      'welcome',
      're_intake',
      're_evidence_vault',
      're_demand_letter',
      're_negotiation',
      're_prepare_filing',
      're_file_with_court',
      're_serve_defendant',
    ],
  },
  {
    id: 'in_litigation',
    label: 'In litigation',
    description: 'I\'m in the litigation phase (discovery, motions, etc.).',
    firstUnlockedTask: 're_discovery',
    tasksToSkip: [
      'welcome',
      're_intake',
      're_evidence_vault',
      're_demand_letter',
      're_negotiation',
      're_prepare_filing',
      're_file_with_court',
      're_serve_defendant',
      're_wait_for_answer',
      're_review_answer',
    ],
  },
]

// -- Partnership Milestones ---------------------------------------------------

const PARTNERSHIP_MILESTONES: Milestone[] = [
  {
    id: 'start',
    label: 'Just getting started',
    description: 'I haven\'t taken any action yet.',
    firstUnlockedTask: 'welcome',
    tasksToSkip: [],
  },
  {
    id: 'demand_sent',
    label: 'Sent a demand or attempted ADR',
    description: 'I\'ve already sent a demand letter or attempted mediation/arbitration.',
    firstUnlockedTask: 'biz_partnership_prepare_filing',
    tasksToSkip: [
      'welcome',
      'biz_partnership_intake',
      'biz_partnership_evidence',
      'biz_partnership_demand_letter',
      'biz_partnership_adr',
    ],
  },
  {
    id: 'filed',
    label: 'Filed with court',
    description: 'I\'ve already filed my case with the court.',
    firstUnlockedTask: 'biz_partnership_file_with_court',
    tasksToSkip: [
      'welcome',
      'biz_partnership_intake',
      'biz_partnership_evidence',
      'biz_partnership_demand_letter',
      'biz_partnership_adr',
      'biz_partnership_prepare_filing',
    ],
  },
  {
    id: 'served',
    label: 'Served the other party',
    description: 'I\'ve served the other party with the lawsuit.',
    firstUnlockedTask: 'biz_partnership_wait_for_answer',
    tasksToSkip: [
      'welcome',
      'biz_partnership_intake',
      'biz_partnership_evidence',
      'biz_partnership_demand_letter',
      'biz_partnership_adr',
      'biz_partnership_prepare_filing',
      'biz_partnership_file_with_court',
      'biz_partnership_serve_defendant',
    ],
  },
  {
    id: 'in_litigation',
    label: 'In litigation',
    description: 'I\'m in the litigation phase (discovery, motions, etc.).',
    firstUnlockedTask: 'biz_partnership_discovery',
    tasksToSkip: [
      'welcome',
      'biz_partnership_intake',
      'biz_partnership_evidence',
      'biz_partnership_demand_letter',
      'biz_partnership_adr',
      'biz_partnership_prepare_filing',
      'biz_partnership_file_with_court',
      'biz_partnership_serve_defendant',
      'biz_partnership_wait_for_answer',
    ],
  },
]

// -- Employment Milestones ----------------------------------------------------

const EMPLOYMENT_MILESTONES: Milestone[] = [
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
    description: 'I\'ve already sent a demand letter to my employer.',
    firstUnlockedTask: 'biz_employment_eeoc',
    tasksToSkip: [
      'welcome',
      'biz_employment_intake',
      'biz_employment_evidence',
      'biz_employment_demand_letter',
    ],
  },
  {
    id: 'filed',
    label: 'Filed complaint or EEOC charge',
    description: 'I\'ve filed with the EEOC/TWC or filed a lawsuit.',
    firstUnlockedTask: 'biz_employment_file_with_court',
    tasksToSkip: [
      'welcome',
      'biz_employment_intake',
      'biz_employment_evidence',
      'biz_employment_demand_letter',
      'biz_employment_eeoc',
      'biz_employment_prepare_filing',
    ],
  },
  {
    id: 'served',
    label: 'Served the employer',
    description: 'I\'ve served my employer with the lawsuit.',
    firstUnlockedTask: 'biz_employment_wait_for_answer',
    tasksToSkip: [
      'welcome',
      'biz_employment_intake',
      'biz_employment_evidence',
      'biz_employment_demand_letter',
      'biz_employment_eeoc',
      'biz_employment_prepare_filing',
      'biz_employment_file_with_court',
      'biz_employment_serve_defendant',
    ],
  },
  {
    id: 'in_litigation',
    label: 'In litigation',
    description: 'I\'m in the litigation phase (discovery, motions, etc.).',
    firstUnlockedTask: 'biz_employment_discovery',
    tasksToSkip: [
      'welcome',
      'biz_employment_intake',
      'biz_employment_evidence',
      'biz_employment_demand_letter',
      'biz_employment_eeoc',
      'biz_employment_prepare_filing',
      'biz_employment_file_with_court',
      'biz_employment_serve_defendant',
      'biz_employment_wait_for_answer',
    ],
  },
]

// -- B2B / Commercial Milestones ----------------------------------------------

const B2B_COMMERCIAL_MILESTONES: Milestone[] = [
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
    firstUnlockedTask: 'biz_b2b_prepare_filing',
    tasksToSkip: [
      'welcome',
      'biz_b2b_intake',
      'biz_b2b_evidence',
      'biz_b2b_demand_letter',
      'biz_b2b_negotiation',
    ],
  },
  {
    id: 'filed',
    label: 'Filed with court',
    description: 'I\'ve already filed my case with the court.',
    firstUnlockedTask: 'biz_b2b_file_with_court',
    tasksToSkip: [
      'welcome',
      'biz_b2b_intake',
      'biz_b2b_evidence',
      'biz_b2b_demand_letter',
      'biz_b2b_negotiation',
      'biz_b2b_prepare_filing',
    ],
  },
  {
    id: 'served',
    label: 'Served the other party',
    description: 'I\'ve served the other business with the lawsuit.',
    firstUnlockedTask: 'biz_b2b_wait_for_answer',
    tasksToSkip: [
      'welcome',
      'biz_b2b_intake',
      'biz_b2b_evidence',
      'biz_b2b_demand_letter',
      'biz_b2b_negotiation',
      'biz_b2b_prepare_filing',
      'biz_b2b_file_with_court',
      'biz_b2b_serve_defendant',
    ],
  },
  {
    id: 'in_litigation',
    label: 'In litigation',
    description: 'I\'m in the litigation phase (discovery, motions, etc.).',
    firstUnlockedTask: 'biz_b2b_discovery',
    tasksToSkip: [
      'welcome',
      'biz_b2b_intake',
      'biz_b2b_evidence',
      'biz_b2b_demand_letter',
      'biz_b2b_negotiation',
      'biz_b2b_prepare_filing',
      'biz_b2b_file_with_court',
      'biz_b2b_serve_defendant',
      'biz_b2b_wait_for_answer',
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
      'sc_evidence_vault',
      'sc_demand_letter',
    ],
  },
  {
    id: 'filed',
    label: 'Filed with court',
    description: 'I\'ve filed my small claims case.',
    firstUnlockedTask: 'sc_file_with_court',
    tasksToSkip: [
      'welcome',
      'small_claims_intake',
      'sc_evidence_vault',
      'sc_demand_letter',
      'prepare_small_claims_filing',
    ],
  },
  {
    id: 'served',
    label: 'Served the other party',
    description: 'I\'ve served the defendant.',
    firstUnlockedTask: 'sc_prepare_for_hearing',
    tasksToSkip: [
      'welcome',
      'small_claims_intake',
      'sc_evidence_vault',
      'sc_demand_letter',
      'prepare_small_claims_filing',
      'sc_file_with_court',
      'sc_serve_defendant',
    ],
  },
  {
    id: 'hearing',
    label: 'Preparing for hearing',
    description: 'My hearing is coming up.',
    firstUnlockedTask: 'sc_hearing_day',
    tasksToSkip: [
      'welcome',
      'small_claims_intake',
      'sc_evidence_vault',
      'sc_demand_letter',
      'prepare_small_claims_filing',
      'sc_file_with_court',
      'sc_serve_defendant',
      'sc_prepare_for_hearing',
    ],
  },
]

// -- Divorce Milestones -------------------------------------------------------

const DIVORCE_MILESTONES: Milestone[] = [
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
    description: 'I\'ve filed my divorce case.',
    firstUnlockedTask: 'divorce_file_with_court',
    tasksToSkip: ['welcome', 'divorce_intake', 'divorce_safety_screening', 'divorce_evidence_vault', 'divorce_prepare_filing'],
  },
  {
    id: 'served',
    label: 'Served the other party',
    description: 'I\'ve served my spouse.',
    firstUnlockedTask: 'divorce_waiting_period',
    tasksToSkip: ['welcome', 'divorce_intake', 'divorce_safety_screening', 'divorce_evidence_vault', 'divorce_prepare_filing', 'divorce_file_with_court', 'divorce_serve_respondent'],
  },
  {
    id: 'waiting_period',
    label: 'In waiting period',
    description: 'I\'m in the 60-day waiting period.',
    firstUnlockedTask: 'divorce_temporary_orders',
    tasksToSkip: ['welcome', 'divorce_intake', 'divorce_safety_screening', 'divorce_evidence_vault', 'divorce_prepare_filing', 'divorce_file_with_court', 'divorce_serve_respondent', 'divorce_waiting_period'],
  },
  {
    id: 'temporary_orders',
    label: 'Temporary orders',
    description: 'I\'m dealing with temporary orders.',
    firstUnlockedTask: 'divorce_mediation',
    tasksToSkip: ['welcome', 'divorce_intake', 'divorce_safety_screening', 'divorce_evidence_vault', 'divorce_prepare_filing', 'divorce_file_with_court', 'divorce_serve_respondent', 'divorce_waiting_period', 'divorce_temporary_orders'],
  },
  {
    id: 'mediation',
    label: 'In mediation',
    description: 'I\'m in mediation.',
    firstUnlockedTask: 'divorce_property_division',
    tasksToSkip: ['welcome', 'divorce_intake', 'divorce_safety_screening', 'divorce_evidence_vault', 'divorce_prepare_filing', 'divorce_file_with_court', 'divorce_serve_respondent', 'divorce_waiting_period', 'divorce_temporary_orders', 'divorce_mediation'],
  },
  {
    id: 'final',
    label: 'Final orders',
    description: 'I\'m working on final orders.',
    firstUnlockedTask: 'divorce_final_orders',
    tasksToSkip: ['welcome', 'divorce_intake', 'divorce_safety_screening', 'divorce_evidence_vault', 'divorce_prepare_filing', 'divorce_file_with_court', 'divorce_serve_respondent', 'divorce_waiting_period', 'divorce_temporary_orders', 'divorce_mediation', 'divorce_property_division'],
  },
]

// -- Custody Milestones -------------------------------------------------------

const CUSTODY_MILESTONES: Milestone[] = [
  { id: 'start', label: 'Just getting started', description: 'I haven\'t filed anything yet.', firstUnlockedTask: 'welcome', tasksToSkip: [] },
  { id: 'filed', label: 'Filed with court', description: 'I\'ve filed my custody case.', firstUnlockedTask: 'custody_file_with_court', tasksToSkip: ['welcome', 'custody_intake', 'custody_safety_screening', 'custody_evidence_vault', 'custody_prepare_filing'] },
  { id: 'served', label: 'Served the other party', description: 'I\'ve served the other parent.', firstUnlockedTask: 'custody_temporary_orders', tasksToSkip: ['welcome', 'custody_intake', 'custody_safety_screening', 'custody_evidence_vault', 'custody_prepare_filing', 'custody_file_with_court', 'custody_serve_respondent'] },
  { id: 'temporary_orders', label: 'Temporary orders', description: 'I\'m dealing with temporary orders.', firstUnlockedTask: 'custody_mediation', tasksToSkip: ['welcome', 'custody_intake', 'custody_safety_screening', 'custody_evidence_vault', 'custody_prepare_filing', 'custody_file_with_court', 'custody_serve_respondent', 'custody_temporary_orders'] },
  { id: 'mediation', label: 'In mediation', description: 'I\'m in mediation.', firstUnlockedTask: 'custody_final_orders', tasksToSkip: ['welcome', 'custody_intake', 'custody_safety_screening', 'custody_evidence_vault', 'custody_prepare_filing', 'custody_file_with_court', 'custody_serve_respondent', 'custody_temporary_orders', 'custody_mediation'] },
  { id: 'final', label: 'Final orders', description: 'I\'m working on final orders.', firstUnlockedTask: 'custody_final_orders', tasksToSkip: ['welcome', 'custody_intake', 'custody_safety_screening', 'custody_evidence_vault', 'custody_prepare_filing', 'custody_file_with_court', 'custody_serve_respondent', 'custody_temporary_orders', 'custody_mediation'] },
]

// -- Child Support Milestones -------------------------------------------------

const CHILD_SUPPORT_MILESTONES: Milestone[] = [
  { id: 'start', label: 'Just getting started', description: 'I haven\'t filed anything yet.', firstUnlockedTask: 'welcome', tasksToSkip: [] },
  { id: 'filed', label: 'Filed with court', description: 'I\'ve filed my child support case.', firstUnlockedTask: 'child_support_file_with_court', tasksToSkip: ['welcome', 'child_support_intake', 'child_support_evidence_vault', 'child_support_prepare_filing'] },
  { id: 'served', label: 'Served the other party', description: 'I\'ve served the other parent.', firstUnlockedTask: 'child_support_temporary_orders', tasksToSkip: ['welcome', 'child_support_intake', 'child_support_evidence_vault', 'child_support_prepare_filing', 'child_support_file_with_court', 'child_support_serve_respondent'] },
  { id: 'final', label: 'Final orders', description: 'I\'m working on final orders.', firstUnlockedTask: 'child_support_final_orders', tasksToSkip: ['welcome', 'child_support_intake', 'child_support_evidence_vault', 'child_support_prepare_filing', 'child_support_file_with_court', 'child_support_serve_respondent', 'child_support_temporary_orders'] },
]

// -- Visitation Milestones ----------------------------------------------------

const VISITATION_MILESTONES: Milestone[] = [
  { id: 'start', label: 'Just getting started', description: 'I haven\'t filed anything yet.', firstUnlockedTask: 'welcome', tasksToSkip: [] },
  { id: 'filed', label: 'Filed with court', description: 'I\'ve filed my visitation case.', firstUnlockedTask: 'visitation_file_with_court', tasksToSkip: ['welcome', 'visitation_intake', 'visitation_safety_screening', 'visitation_evidence_vault', 'visitation_prepare_filing'] },
  { id: 'served', label: 'Served the other party', description: 'I\'ve served the other party.', firstUnlockedTask: 'visitation_mediation', tasksToSkip: ['welcome', 'visitation_intake', 'visitation_safety_screening', 'visitation_evidence_vault', 'visitation_prepare_filing', 'visitation_file_with_court', 'visitation_serve_respondent'] },
  { id: 'mediation', label: 'In mediation', description: 'I\'m in mediation.', firstUnlockedTask: 'visitation_final_orders', tasksToSkip: ['welcome', 'visitation_intake', 'visitation_safety_screening', 'visitation_evidence_vault', 'visitation_prepare_filing', 'visitation_file_with_court', 'visitation_serve_respondent', 'visitation_mediation'] },
  { id: 'final', label: 'Final orders', description: 'I\'m working on final orders.', firstUnlockedTask: 'visitation_final_orders', tasksToSkip: ['welcome', 'visitation_intake', 'visitation_safety_screening', 'visitation_evidence_vault', 'visitation_prepare_filing', 'visitation_file_with_court', 'visitation_serve_respondent', 'visitation_mediation'] },
]

// -- Spousal Support Milestones -----------------------------------------------

const SPOUSAL_SUPPORT_MILESTONES: Milestone[] = [
  { id: 'start', label: 'Just getting started', description: 'I haven\'t filed anything yet.', firstUnlockedTask: 'welcome', tasksToSkip: [] },
  { id: 'filed', label: 'Filed with court', description: 'I\'ve filed my spousal support case.', firstUnlockedTask: 'spousal_support_file_with_court', tasksToSkip: ['welcome', 'spousal_support_intake', 'spousal_support_evidence_vault', 'spousal_support_prepare_filing'] },
  { id: 'served', label: 'Served the other party', description: 'I\'ve served my spouse.', firstUnlockedTask: 'spousal_support_temporary_orders', tasksToSkip: ['welcome', 'spousal_support_intake', 'spousal_support_evidence_vault', 'spousal_support_prepare_filing', 'spousal_support_file_with_court', 'spousal_support_serve_respondent'] },
  { id: 'final', label: 'Final orders', description: 'I\'m working on final orders.', firstUnlockedTask: 'spousal_support_final_orders', tasksToSkip: ['welcome', 'spousal_support_intake', 'spousal_support_evidence_vault', 'spousal_support_prepare_filing', 'spousal_support_file_with_court', 'spousal_support_serve_respondent', 'spousal_support_temporary_orders'] },
]

// -- Protective Order Milestones ----------------------------------------------

const PROTECTIVE_ORDER_MILESTONES: Milestone[] = [
  { id: 'start', label: 'Just getting started', description: 'I haven\'t filed anything yet.', firstUnlockedTask: 'welcome', tasksToSkip: [] },
  { id: 'filed', label: 'Filed with court', description: 'I\'ve filed my protective order application.', firstUnlockedTask: 'po_hearing', tasksToSkip: ['welcome', 'po_intake', 'po_safety_screening', 'po_prepare_filing', 'po_file_with_court'] },
]

// -- Modification Milestones --------------------------------------------------

const MODIFICATION_MILESTONES: Milestone[] = [
  { id: 'start', label: 'Just getting started', description: 'I haven\'t filed anything yet.', firstUnlockedTask: 'welcome', tasksToSkip: [] },
  { id: 'filed', label: 'Filed with court', description: 'I\'ve filed my modification.', firstUnlockedTask: 'mod_file_with_court', tasksToSkip: ['welcome', 'mod_intake', 'mod_evidence_vault', 'mod_existing_order_review', 'mod_prepare_filing'] },
  { id: 'served', label: 'Served the other party', description: 'I\'ve served the other party.', firstUnlockedTask: 'mod_mediation', tasksToSkip: ['welcome', 'mod_intake', 'mod_evidence_vault', 'mod_existing_order_review', 'mod_prepare_filing', 'mod_file_with_court', 'mod_serve_respondent'] },
  { id: 'mediation', label: 'In mediation', description: 'I\'m in mediation.', firstUnlockedTask: 'mod_final_orders', tasksToSkip: ['welcome', 'mod_intake', 'mod_evidence_vault', 'mod_existing_order_review', 'mod_prepare_filing', 'mod_file_with_court', 'mod_serve_respondent', 'mod_mediation'] },
  { id: 'final', label: 'Final orders', description: 'I\'m working on the modified order.', firstUnlockedTask: 'mod_final_orders', tasksToSkip: ['welcome', 'mod_intake', 'mod_evidence_vault', 'mod_existing_order_review', 'mod_prepare_filing', 'mod_file_with_court', 'mod_serve_respondent', 'mod_mediation'] },
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
  real_estate: REAL_ESTATE_MILESTONES,
  partnership: PARTNERSHIP_MILESTONES,
  employment: EMPLOYMENT_MILESTONES,
  b2b_commercial: B2B_COMMERCIAL_MILESTONES,
  other: OTHER_MILESTONES,
  personal_injury: PERSONAL_INJURY_MILESTONES,
  debt_collection: DEBT_DEFENSE_MILESTONES,
  small_claims: SMALL_CLAIMS_MILESTONES,
  divorce: DIVORCE_MILESTONES,
  custody: CUSTODY_MILESTONES,
  child_support: CHILD_SUPPORT_MILESTONES,
  visitation: VISITATION_MILESTONES,
  spousal_support: SPOUSAL_SUPPORT_MILESTONES,
  protective_order: PROTECTIVE_ORDER_MILESTONES,
  modification: MODIFICATION_MILESTONES,
  landlord_tenant: LANDLORD_TENANT_MILESTONES,
}

// -- Public API ---------------------------------------------------------------

/**
 * Returns the ordered list of milestones for a given dispute type.
 * Falls back to civil milestones for unknown types.
 */
export function getMilestones(disputeType: DisputeType, familySubType?: string, businessSubType?: string): Milestone[] {
  if (disputeType === 'family' && familySubType) {
    return MILESTONES_BY_TYPE[familySubType] ?? DIVORCE_MILESTONES
  }
  if (disputeType === 'business' && businessSubType) {
    return MILESTONES_BY_TYPE[businessSubType] ?? PARTNERSHIP_MILESTONES
  }
  return MILESTONES_BY_TYPE[disputeType] ?? CIVIL_MILESTONES
}

/**
 * Returns the task_keys that should be bulk-skipped when importing
 * a case at the given milestone.
 * Returns an empty array for unknown milestones.
 */
export function getTasksToSkip(
  disputeType: DisputeType,
  milestoneId: string,
  familySubType?: string,
  businessSubType?: string
): string[] {
  const milestones = getMilestones(disputeType, familySubType, businessSubType)
  const milestone = milestones.find((m) => m.id === milestoneId)
  return milestone?.tasksToSkip ?? []
}

/**
 * Returns the milestone definition for a given dispute type and milestone ID.
 * Returns undefined if the milestone is not found.
 */
export function getMilestoneByID(
  disputeType: DisputeType,
  milestoneId: string,
  familySubType?: string,
  businessSubType?: string
): Milestone | undefined {
  const milestones = getMilestones(disputeType, familySubType, businessSubType)
  return milestones.find((m) => m.id === milestoneId)
}
