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
      taskKeys: ['evidence_vault', 'prepare_lt_demand_letter'],
    },
    {
      label: 'Filing & Service',
      taskKeys: ['prepare_landlord_tenant_filing', 'file_with_court', 'serve_other_party'],
    },
    {
      label: 'Hearing',
      taskKeys: ['prepare_for_hearing', 'hearing_day'],
    },
    {
      label: 'Resolution',
      taskKeys: ['post_judgment'],
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

  family: [
    {
      label: 'Getting Started',
      taskKeys: ['welcome', 'family_intake', 'safety_screening'],
    },
    {
      label: 'Building Your Case',
      taskKeys: ['evidence_vault'],
    },
    {
      label: 'Filing & Service',
      taskKeys: ['prepare_family_filing', 'file_with_court', 'upload_return_of_service', 'confirm_service_facts'],
    },
    {
      label: 'Process',
      taskKeys: ['waiting_period', 'temporary_orders', 'mediation'],
    },
    {
      label: 'Resolution',
      taskKeys: ['final_orders'],
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
