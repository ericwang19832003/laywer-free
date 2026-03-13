export interface WorkflowPhase {
  label: string
  taskKeys: string[]
}

export const WORKFLOW_PHASES: Record<string, WorkflowPhase[]> = {
  personal_injury: [
    {
      label: 'Getting Started',
      taskKeys: ['welcome', 'pi_intake'],
    },
    {
      label: 'Building Your Case',
      taskKeys: ['pi_medical_records', 'evidence_vault', 'preservation_letter', 'pi_insurance_communication'],
    },
    {
      label: 'Pre-Litigation',
      taskKeys: ['prepare_pi_demand_letter', 'pi_settlement_negotiation'],
    },
    {
      label: 'Filing & Service',
      taskKeys: ['prepare_pi_petition', 'pi_file_with_court', 'pi_serve_defendant'],
    },
    {
      label: 'Litigation',
      taskKeys: [
        'pi_wait_for_answer',
        'pi_review_answer',
        'pi_discovery_prep',
        'pi_discovery_responses',
        'pi_scheduling_conference',
        'pi_pretrial_motions',
        'pi_mediation',
        'pi_trial_prep',
      ],
    },
    {
      label: 'Resolution',
      taskKeys: ['pi_post_resolution'],
    },
  ],

  small_claims: [
    {
      label: 'Getting Started',
      taskKeys: ['welcome', 'small_claims_intake'],
    },
    {
      label: 'Building Your Case',
      taskKeys: ['evidence_vault', 'prepare_demand_letter'],
    },
    {
      label: 'Filing & Service',
      taskKeys: ['prepare_small_claims_filing', 'file_with_court', 'serve_defendant'],
    },
    {
      label: 'Hearing',
      taskKeys: ['prepare_for_hearing', 'hearing_day'],
    },
  ],

  landlord_tenant: [
    {
      label: 'Getting Started',
      taskKeys: ['welcome', 'landlord_tenant_intake'],
    },
    {
      label: 'Building Your Case',
      taskKeys: ['evidence_vault', 'prepare_lt_demand_letter', 'lt_negotiation'],
    },
    {
      label: 'Filing & Service',
      taskKeys: ['prepare_landlord_tenant_filing', 'lt_file_with_court', 'serve_other_party'],
    },
    {
      label: 'Pre-Hearing',
      taskKeys: ['lt_wait_for_response', 'lt_review_response', 'lt_discovery', 'lt_prepare_for_hearing', 'lt_mediation'],
    },
    {
      label: 'Hearing',
      taskKeys: ['lt_hearing_day'],
    },
    {
      label: 'Resolution',
      taskKeys: ['lt_post_judgment'],
    },
  ],

  debt_collection: [
    {
      label: 'Getting Started',
      taskKeys: ['welcome', 'debt_defense_intake'],
    },
    {
      label: 'Building Your Case',
      taskKeys: ['evidence_vault', 'prepare_debt_validation_letter'],
    },
    {
      label: 'Filing & Service',
      taskKeys: ['prepare_debt_defense_answer', 'debt_file_with_court', 'serve_plaintiff'],
    },
    {
      label: 'Hearing',
      taskKeys: ['debt_hearing_prep', 'debt_hearing_day'],
    },
    {
      label: 'Resolution',
      taskKeys: ['debt_post_judgment'],
    },
  ],

  divorce: [
    { label: 'Getting Started', taskKeys: ['welcome', 'divorce_intake', 'divorce_safety_screening'] },
    { label: 'Building Your Case', taskKeys: ['divorce_evidence_vault'] },
    { label: 'Filing & Service', taskKeys: ['divorce_prepare_filing', 'divorce_file_with_court', 'divorce_serve_respondent'] },
    { label: 'Pre-Trial', taskKeys: ['divorce_waiting_period', 'divorce_temporary_orders', 'divorce_mediation'] },
    { label: 'Resolution', taskKeys: ['divorce_property_division', 'divorce_final_orders'] },
  ],

  custody: [
    { label: 'Getting Started', taskKeys: ['welcome', 'custody_intake', 'custody_safety_screening'] },
    { label: 'Building Your Case', taskKeys: ['custody_evidence_vault'] },
    { label: 'Filing & Service', taskKeys: ['custody_prepare_filing', 'custody_file_with_court', 'custody_serve_respondent'] },
    { label: 'Pre-Trial', taskKeys: ['custody_temporary_orders', 'custody_mediation'] },
    { label: 'Resolution', taskKeys: ['custody_final_orders'] },
  ],

  child_support: [
    { label: 'Getting Started', taskKeys: ['welcome', 'child_support_intake'] },
    { label: 'Building Your Case', taskKeys: ['child_support_evidence_vault'] },
    { label: 'Filing & Service', taskKeys: ['child_support_prepare_filing', 'child_support_file_with_court', 'child_support_serve_respondent'] },
    { label: 'Resolution', taskKeys: ['child_support_temporary_orders', 'child_support_final_orders'] },
  ],

  visitation: [
    { label: 'Getting Started', taskKeys: ['welcome', 'visitation_intake', 'visitation_safety_screening'] },
    { label: 'Building Your Case', taskKeys: ['visitation_evidence_vault'] },
    { label: 'Filing & Service', taskKeys: ['visitation_prepare_filing', 'visitation_file_with_court', 'visitation_serve_respondent'] },
    { label: 'Pre-Trial', taskKeys: ['visitation_mediation'] },
    { label: 'Resolution', taskKeys: ['visitation_final_orders'] },
  ],

  spousal_support: [
    { label: 'Getting Started', taskKeys: ['welcome', 'spousal_support_intake'] },
    { label: 'Building Your Case', taskKeys: ['spousal_support_evidence_vault'] },
    { label: 'Filing & Service', taskKeys: ['spousal_support_prepare_filing', 'spousal_support_file_with_court', 'spousal_support_serve_respondent'] },
    { label: 'Resolution', taskKeys: ['spousal_support_temporary_orders', 'spousal_support_final_orders'] },
  ],

  protective_order: [
    { label: 'Getting Started', taskKeys: ['welcome', 'po_intake', 'po_safety_screening'] },
    { label: 'Filing & Hearing', taskKeys: ['po_prepare_filing', 'po_file_with_court'] },
    { label: 'Resolution', taskKeys: ['po_hearing'] },
  ],

  modification: [
    { label: 'Getting Started', taskKeys: ['welcome', 'mod_intake'] },
    { label: 'Building Your Case', taskKeys: ['mod_evidence_vault', 'mod_existing_order_review'] },
    { label: 'Filing & Service', taskKeys: ['mod_prepare_filing', 'mod_file_with_court', 'mod_serve_respondent'] },
    { label: 'Resolution', taskKeys: ['mod_mediation', 'mod_final_orders'] },
  ],

  contract: [
    {
      label: 'Getting Started',
      taskKeys: ['welcome', 'contract_intake'],
    },
    {
      label: 'Building Your Case',
      taskKeys: ['evidence_vault', 'contract_demand_letter', 'contract_negotiation'],
    },
    {
      label: 'Filing & Service',
      taskKeys: ['contract_prepare_filing', 'contract_file_with_court', 'contract_serve_defendant'],
    },
    {
      label: 'Litigation',
      taskKeys: ['contract_wait_for_answer', 'contract_review_answer', 'contract_discovery', 'contract_mediation'],
    },
    {
      label: 'Resolution',
      taskKeys: ['contract_post_resolution'],
    },
  ],

  property: [
    {
      label: 'Getting Started',
      taskKeys: ['welcome', 'property_intake'],
    },
    {
      label: 'Building Your Case',
      taskKeys: ['evidence_vault', 'property_demand_letter', 'property_negotiation'],
    },
    {
      label: 'Filing & Service',
      taskKeys: ['property_prepare_filing', 'property_file_with_court', 'property_serve_defendant'],
    },
    {
      label: 'Litigation',
      taskKeys: ['property_wait_for_answer', 'property_review_answer', 'property_discovery'],
    },
    {
      label: 'Resolution',
      taskKeys: ['property_post_resolution'],
    },
  ],

  other: [
    {
      label: 'Getting Started',
      taskKeys: ['welcome', 'other_intake'],
    },
    {
      label: 'Building Your Case',
      taskKeys: ['evidence_vault', 'other_demand_letter'],
    },
    {
      label: 'Filing & Service',
      taskKeys: ['other_prepare_filing', 'other_file_with_court', 'other_serve_defendant'],
    },
    {
      label: 'Litigation',
      taskKeys: ['other_wait_for_answer', 'other_review_answer', 'other_discovery'],
    },
    {
      label: 'Resolution',
      taskKeys: ['other_post_resolution'],
    },
  ],

  civil: [
    {
      label: 'Getting Started',
      taskKeys: ['welcome', 'intake'],
    },
    {
      label: 'Building Your Case',
      taskKeys: ['evidence_vault', 'preservation_letter'],
    },
    {
      label: 'Filing & Service',
      taskKeys: ['prepare_filing', 'file_with_court', 'upload_return_of_service', 'confirm_service_facts'],
    },
    {
      label: 'Post-Filing',
      taskKeys: ['wait_for_answer', 'check_docket_for_answer', 'upload_answer', 'default_packet_prep'],
    },
    {
      label: 'Discovery',
      taskKeys: ['discovery_starter_pack', 'rule_26f_prep', 'mandatory_disclosures'],
    },
  ],
}
