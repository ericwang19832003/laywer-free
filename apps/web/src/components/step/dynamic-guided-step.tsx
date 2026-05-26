'use client'

/**
 * DynamicGuidedStep — client-side wrapper for all GuidedStep usages.
 *
 * Configs contain functions (showIf, generateSummary) that cannot be serialized
 * across the RSC boundary. This component lives on the client and looks up the
 * correct config by taskKey, keeping all config imports out of the server page.
 */

import { GuidedStep } from './guided-step'
import type { GuidedStepConfig } from '@lawyer-free/shared/guided-steps/types'

// ── Family: factory-based configs ──────────────────────────────────────────
import { createFamilyIntakeConfig } from '@lawyer-free/shared/guided-steps/family/family-intake-factory'
import { createEvidenceVaultConfig } from '@lawyer-free/shared/guided-steps/family/family-evidence-vault'
import { createFileWithCourtConfig as createFamilyFileWithCourtConfig } from '@lawyer-free/shared/guided-steps/family/family-file-with-court'
import { createServeRespondentConfig } from '@lawyer-free/shared/guided-steps/family/family-serve-respondent'
import { createWaitingPeriodConfig } from '@lawyer-free/shared/guided-steps/family/waiting-period'
import { createTemporaryOrdersConfig } from '@lawyer-free/shared/guided-steps/family/temporary-orders'
import { createMediationConfig } from '@lawyer-free/shared/guided-steps/family/mediation'
import { createFinalOrdersConfig } from '@lawyer-free/shared/guided-steps/family/final-orders'
import { createResponseCheckpointConfig } from '@lawyer-free/shared/guided-steps/family/family-response-checkpoint'
import { createPostDecreeConfig } from '@lawyer-free/shared/guided-steps/family/family-post-decree'

// ── Family: static configs ──────────────────────────────────────────────────
import { propertyDivisionConfig as familyPropertyDivisionConfig } from '@lawyer-free/shared/guided-steps/family/family-property-division'
import { existingOrderReviewConfig } from '@lawyer-free/shared/guided-steps/family/family-existing-order-review'
import { poHearingConfig } from '@lawyer-free/shared/guided-steps/family/po-hearing'
import { familyFilingGuideConfig } from '@lawyer-free/shared/guided-steps/family/family-filing-guide'
import { familyServiceGuideConfig } from '@lawyer-free/shared/guided-steps/family/family-service-guide'
import { familyCourtroomGuideConfig } from '@lawyer-free/shared/guided-steps/family/family-courtroom-guide'
import { familyMediationPrepConfig } from '@lawyer-free/shared/guided-steps/family/family-mediation-prep'
import { familyPostJudgmentGuideConfig } from '@lawyer-free/shared/guided-steps/family/family-post-judgment-guide'
import { familyDiscoveryGuideConfig } from '@lawyer-free/shared/guided-steps/family/family-discovery-guide'
import { familyTempOrdersPrepConfig } from '@lawyer-free/shared/guided-steps/family/family-temp-orders-prep'
import { familyPropertyDivisionGuideConfig } from '@lawyer-free/shared/guided-steps/family/family-property-division-guide'
import { familyCustodyFactorsConfig } from '@lawyer-free/shared/guided-steps/family/family-custody-factors'
import { familyUncontestedPathConfig } from '@lawyer-free/shared/guided-steps/family/family-uncontested-path'
import { uccjeaAffidavitConfig } from '@lawyer-free/shared/guided-steps/family/family-uccjea-affidavit'
import { agOptionConfig } from '@lawyer-free/shared/guided-steps/family/family-ag-option'
import { spousalEligibilityConfig } from '@lawyer-free/shared/guided-steps/family/family-spousal-eligibility'
import { paternityConfig } from '@lawyer-free/shared/guided-steps/family/family-paternity'
import { standingOrdersConfig } from '@lawyer-free/shared/guided-steps/family/family-standing-orders'

// ── Small Claims ────────────────────────────────────────────────────────────
import { scEvidenceVaultConfig } from '@lawyer-free/shared/guided-steps/small-claims/sc-evidence-vault'
import { createScFileWithCourtConfig } from '@lawyer-free/shared/guided-steps/small-claims/sc-file-with-court'
import { createScCourtGuideConfig } from '@lawyer-free/shared/guided-steps/small-claims/sc-jp-court-guide'
import { createScFilingGuideConfig } from '@lawyer-free/shared/guided-steps/small-claims/sc-filing-guide'
import { createScServiceGuideConfig } from '@lawyer-free/shared/guided-steps/small-claims/sc-service-guide'
import { scCourtroomGuideConfig } from '@lawyer-free/shared/guided-steps/small-claims/sc-courtroom-guide'
import { createScEvidenceRulesConfig } from '@lawyer-free/shared/guided-steps/small-claims/sc-evidence-rules'
import { createScDamagesByTypeConfig } from '@lawyer-free/shared/guided-steps/small-claims/sc-damages-by-type'
import { scSettlementGuideConfig } from '@lawyer-free/shared/guided-steps/small-claims/sc-settlement-guide'
import { scDefaultJudgmentConfig } from '@lawyer-free/shared/guided-steps/small-claims/sc-default-judgment'
import { createScPostJudgmentGuideConfig } from '@lawyer-free/shared/guided-steps/small-claims/sc-post-judgment-guide'
import { createScAppealGuideConfig } from '@lawyer-free/shared/guided-steps/small-claims/sc-appeal-guide'
import { scCounterclaimDefenseConfig } from '@lawyer-free/shared/guided-steps/small-claims/sc-counterclaim-defense'

// ── Landlord-Tenant: chain ──────────────────────────────────────────────────
import { ltNegotiationConfig } from '@lawyer-free/shared/guided-steps/landlord-tenant/lt-negotiation'
import { ltFileWithCourtConfig } from '@lawyer-free/shared/guided-steps/landlord-tenant/lt-file-with-court'
import { ltWaitForResponseConfig } from '@lawyer-free/shared/guided-steps/landlord-tenant/lt-wait-for-response'
import { ltReviewResponseConfig } from '@lawyer-free/shared/guided-steps/landlord-tenant/lt-review-response'
import { ltDiscoveryConfig } from '@lawyer-free/shared/guided-steps/landlord-tenant/lt-discovery'
import { ltMediationConfig } from '@lawyer-free/shared/guided-steps/landlord-tenant/lt-mediation'
import { ltHearingPrepConfig } from '@lawyer-free/shared/guided-steps/landlord-tenant/lt-hearing-prep'
import { ltHearingDayConfig } from '@lawyer-free/shared/guided-steps/landlord-tenant/lt-hearing-day'
import { postJudgmentConfig } from '@lawyer-free/shared/guided-steps/landlord-tenant/post-judgment'

// ── Landlord-Tenant: depth steps ────────────────────────────────────────────
import { ltSecurityDepositDemandConfig } from '@lawyer-free/shared/guided-steps/landlord-tenant/lt-security-deposit-demand'
import { ltRepairAndDeductConfig } from '@lawyer-free/shared/guided-steps/landlord-tenant/lt-repair-and-deduct'
import { ltIllegalLockoutDefenseConfig } from '@lawyer-free/shared/guided-steps/landlord-tenant/lt-illegal-lockout-defense'
import { ltEvictionNoticeAnalysisConfig } from '@lawyer-free/shared/guided-steps/landlord-tenant/lt-eviction-notice-analysis'
import { ltJpCourtProceduresConfig } from '@lawyer-free/shared/guided-steps/landlord-tenant/lt-jp-court-procedures'
import { ltAppealGuideConfig } from '@lawyer-free/shared/guided-steps/landlord-tenant/lt-appeal-guide'
import { ltCourtroomGuideConfig as ltCourtroomGuideDeepConfig } from '@lawyer-free/shared/guided-steps/landlord-tenant/lt-courtroom-guide'
import { ltLeaseTerminationGuideConfig } from '@lawyer-free/shared/guided-steps/landlord-tenant/lt-lease-termination-guide'
import { ltWritOfPossessionConfig } from '@lawyer-free/shared/guided-steps/landlord-tenant/lt-writ-of-possession'
import { createLtRepairRequestConfig } from '@lawyer-free/shared/guided-steps/landlord-tenant/lt-repair-request'
import { createLtEvictionResponseConfig } from '@lawyer-free/shared/guided-steps/landlord-tenant/lt-eviction-response'
import { ltHabitabilityChecklistConfig } from '@lawyer-free/shared/guided-steps/landlord-tenant/lt-habitability-checklist'
import { ltSb38AwarenessConfig } from '@lawyer-free/shared/guided-steps/landlord-tenant/lt-sb38-awareness'
import { ltFederalPropertyCheckConfig } from '@lawyer-free/shared/guided-steps/landlord-tenant/lt-federal-property-check'
import { ltRetaliationDefenseConfig } from '@lawyer-free/shared/guided-steps/landlord-tenant/lt-retaliation-defense'
import { ltRentIntoRegistryConfig } from '@lawyer-free/shared/guided-steps/landlord-tenant/lt-rent-into-registry'
import { ltPostEvictionRightsConfig } from '@lawyer-free/shared/guided-steps/landlord-tenant/lt-post-eviction-rights'
import { ltConstructiveEvictionConfig } from '@lawyer-free/shared/guided-steps/landlord-tenant/lt-constructive-eviction'
import { ltCodeEnforcementConfig } from '@lawyer-free/shared/guided-steps/landlord-tenant/lt-code-enforcement'

// ── Debt Defense: depth steps ───────────────────────────────────────────────
import { fdcpaCheckConfig } from '@lawyer-free/shared/guided-steps/debt-defense/fdcpa-check'
import { debtSolCheckConfig } from '@lawyer-free/shared/guided-steps/debt-defense/debt-sol-check'
import { debtAnswerPrepConfig } from '@lawyer-free/shared/guided-steps/debt-defense/debt-answer-prep'
import { debtFilingGuideConfig } from '@lawyer-free/shared/guided-steps/debt-defense/debt-filing-guide'
import { debtServiceGuideConfig } from '@lawyer-free/shared/guided-steps/debt-defense/debt-service-guide'
import { debtCourtroomGuideConfig } from '@lawyer-free/shared/guided-steps/debt-defense/debt-courtroom-guide'
import { debtPostJudgmentGuideConfig } from '@lawyer-free/shared/guided-steps/debt-defense/debt-post-judgment-guide'
import { fdcpaCounterclaimGuideConfig } from '@lawyer-free/shared/guided-steps/debt-defense/fdcpa-counterclaim-guide'
import { debtMotionToDismissConfig } from '@lawyer-free/shared/guided-steps/debt-defense/debt-motion-to-dismiss'
import { debtDefaultJudgmentRecoveryConfig } from '@lawyer-free/shared/guided-steps/debt-defense/debt-default-judgment-recovery'
import { debtSettlementGuideConfig } from '@lawyer-free/shared/guided-steps/debt-defense/debt-settlement-guide'
import { debtValidationResponseGuideConfig } from '@lawyer-free/shared/guided-steps/debt-defense/debt-validation-response-guide'
import { debtEvidenceRulesConfig } from '@lawyer-free/shared/guided-steps/debt-defense/debt-evidence-rules'
import { debtContinuanceRequestConfig } from '@lawyer-free/shared/guided-steps/debt-defense/debt-continuance-request'
import { debtWitnessPrepConfig } from '@lawyer-free/shared/guided-steps/debt-defense/debt-witness-prep'
import { debtCreditDisputeGuideConfig } from '@lawyer-free/shared/guided-steps/debt-defense/debt-credit-dispute-guide'
import { debtDiscoveryResponseConfig } from '@lawyer-free/shared/guided-steps/debt-defense/debt-discovery-response'
import { debtExemptionClaimConfig } from '@lawyer-free/shared/guided-steps/debt-defense/debt-exemption-claim'
import { debtCourtTypeGuideConfig } from '@lawyer-free/shared/guided-steps/debt-defense/debt-court-type-guide'
import { debtStandingChallengeConfig } from '@lawyer-free/shared/guided-steps/debt-defense/debt-standing-challenge'
import { debtBusinessRecordsChallengeConfig } from '@lawyer-free/shared/guided-steps/debt-defense/debt-business-records-challenge'
import { debtPreAnswerSettlementConfig } from '@lawyer-free/shared/guided-steps/debt-defense/debt-pre-answer-settlement'
import { debtAppealProcessConfig } from '@lawyer-free/shared/guided-steps/debt-defense/debt-appeal-process'

// ── Personal Injury: depth steps ────────────────────────────────────────────
import { piDamagesCalculationConfig } from '@lawyer-free/shared/guided-steps/personal-injury/pi-damages-calculation'
import { piPipClaimConfig } from '@lawyer-free/shared/guided-steps/personal-injury/pi-pip-claim'
import { piFilingGuideConfig } from '@lawyer-free/shared/guided-steps/personal-injury/pi-filing-guide'
import { piServiceGuideConfig } from '@lawyer-free/shared/guided-steps/personal-injury/pi-service-guide'
import { piCourtroomGuideConfig } from '@lawyer-free/shared/guided-steps/personal-injury/pi-courtroom-guide'
import { piComparativeFaultConfig } from '@lawyer-free/shared/guided-steps/personal-injury/pi-comparative-fault'
import { piLienResolutionConfig } from '@lawyer-free/shared/guided-steps/personal-injury/pi-lien-resolution'
import { piExpertWitnessGuideConfig } from '@lawyer-free/shared/guided-steps/personal-injury/pi-expert-witness-guide'

// ── Real Estate ─────────────────────────────────────────────────────────────
import { reEvidenceVaultConfig } from '@lawyer-free/shared/guided-steps/real-estate/re-evidence-vault'
import { reDemandLetterConfig } from '@lawyer-free/shared/guided-steps/real-estate/re-demand-letter'
import { reNegotiationConfig } from '@lawyer-free/shared/guided-steps/real-estate/re-negotiation'
import { reFileWithCourtConfig } from '@lawyer-free/shared/guided-steps/real-estate/re-file-with-court'
import { reServeDefendantConfig } from '@lawyer-free/shared/guided-steps/real-estate/re-serve-defendant'
import { reWaitForAnswerConfig } from '@lawyer-free/shared/guided-steps/real-estate/re-wait-for-answer'
import { reReviewAnswerConfig } from '@lawyer-free/shared/guided-steps/real-estate/re-review-answer'
import { reDiscoveryConfig } from '@lawyer-free/shared/guided-steps/real-estate/re-discovery'
import { rePostResolutionConfig } from '@lawyer-free/shared/guided-steps/real-estate/re-post-resolution'
import { reFilingGuideConfig } from '@lawyer-free/shared/guided-steps/real-estate/re-filing-guide'
import { reServiceGuideConfig } from '@lawyer-free/shared/guided-steps/real-estate/re-service-guide'
import { reCourtroomGuideConfig } from '@lawyer-free/shared/guided-steps/real-estate/re-courtroom-guide'
import { reTitleDefectAnalysisConfig } from '@lawyer-free/shared/guided-steps/real-estate/re-title-defect-analysis'
import { reSellerDisclosureGuideConfig } from '@lawyer-free/shared/guided-steps/real-estate/re-seller-disclosure-guide'
import { reEarnestMoneyGuideConfig } from '@lawyer-free/shared/guided-steps/real-estate/re-earnest-money-guide'
import { reConstructionDefectGuideConfig } from '@lawyer-free/shared/guided-steps/real-estate/re-construction-defect-guide'
import { reFailedClosingGuideConfig } from '@lawyer-free/shared/guided-steps/real-estate/re-failed-closing-guide'
import { reAdversePossessionGuideConfig } from '@lawyer-free/shared/guided-steps/real-estate/re-adverse-possession-guide'
import { reDiscoveryGuideConfig } from '@lawyer-free/shared/guided-steps/real-estate/re-discovery-guide'
import { rePostJudgmentGuideConfig } from '@lawyer-free/shared/guided-steps/real-estate/re-post-judgment-guide'

// ── Contract ────────────────────────────────────────────────────────────────
import { contractDemandLetterConfig } from '@lawyer-free/shared/guided-steps/contract/contract-demand-letter'
import { contractNegotiationConfig } from '@lawyer-free/shared/guided-steps/contract/contract-negotiation'
import { contractFileWithCourtConfig } from '@lawyer-free/shared/guided-steps/contract/contract-file-with-court'
import { contractServeDefendantConfig } from '@lawyer-free/shared/guided-steps/contract/contract-serve-defendant'
import { createContractWaitForAnswerConfig } from '@lawyer-free/shared/guided-steps/contract/contract-wait-for-answer'
import { contractReviewAnswerConfig } from '@lawyer-free/shared/guided-steps/contract/contract-review-answer'
import { contractDiscoveryConfig } from '@lawyer-free/shared/guided-steps/contract/contract-discovery'
import { contractMediationConfig } from '@lawyer-free/shared/guided-steps/contract/contract-mediation'
import { contractPostResolutionConfig } from '@lawyer-free/shared/guided-steps/contract/contract-post-resolution'
import { contractBreachAnalysisConfig } from '@lawyer-free/shared/guided-steps/contract/contract-breach-analysis'
import { contractStatuteOfFraudsConfig } from '@lawyer-free/shared/guided-steps/contract/contract-statute-of-frauds'
import { contractDamagesMethodsConfig } from '@lawyer-free/shared/guided-steps/contract/contract-damages-methods'
import { contractProvisionsCheckConfig } from '@lawyer-free/shared/guided-steps/contract/contract-provisions-check'
import { createContractDefensesGuideConfig } from '@lawyer-free/shared/guided-steps/contract/contract-defenses-guide'
import { createContractFilingGuideConfig } from '@lawyer-free/shared/guided-steps/contract/contract-filing-guide'
import { createContractServiceGuideConfig } from '@lawyer-free/shared/guided-steps/contract/contract-service-guide'
import { contractCourtroomGuideConfig } from '@lawyer-free/shared/guided-steps/contract/contract-courtroom-guide'
import { contractSettlementGuideConfig } from '@lawyer-free/shared/guided-steps/contract/contract-settlement-guide'
import { contractPostJudgmentGuideConfig } from '@lawyer-free/shared/guided-steps/contract/contract-post-judgment-guide'

// ── Property Damage ─────────────────────────────────────────────────────────
import { propertyDemandLetterConfig } from '@lawyer-free/shared/guided-steps/property/property-demand-letter'
import { propertyNegotiationConfig } from '@lawyer-free/shared/guided-steps/property/property-negotiation'
import { propertyFileWithCourtConfig } from '@lawyer-free/shared/guided-steps/property/property-file-with-court'
import { propertyServeDefendantConfig } from '@lawyer-free/shared/guided-steps/property/property-serve-defendant'
import { propertyWaitForAnswerConfig } from '@lawyer-free/shared/guided-steps/property/property-wait-for-answer'
import { propertyReviewAnswerConfig } from '@lawyer-free/shared/guided-steps/property/property-review-answer'
import { propertyDiscoveryConfig } from '@lawyer-free/shared/guided-steps/property/property-discovery'
import { propertyPostResolutionConfig } from '@lawyer-free/shared/guided-steps/property/property-post-resolution'
import { propertyDamageAssessmentConfig } from '@lawyer-free/shared/guided-steps/property/property-damage-assessment'
import { propertyInsuranceGuideConfig } from '@lawyer-free/shared/guided-steps/property/property-insurance-guide'
import { propertyFilingGuideConfig } from '@lawyer-free/shared/guided-steps/property/property-filing-guide'
import { propertyServiceGuideConfig } from '@lawyer-free/shared/guided-steps/property/property-service-guide'
import { propertyCourtroomGuideConfig } from '@lawyer-free/shared/guided-steps/property/property-courtroom-guide'
import { propertyMediationGuideConfig } from '@lawyer-free/shared/guided-steps/property/property-mediation-guide'
import { propertyPretrialMotionsConfig } from '@lawyer-free/shared/guided-steps/property/property-pretrial-motions'
import { propertyDamagesGuideConfig } from '@lawyer-free/shared/guided-steps/property/property-damages-guide'
import { propertyPostJudgmentGuideConfig } from '@lawyer-free/shared/guided-steps/property/property-post-judgment-guide'

// ── Business ─────────────────────────────────────────────────────────────────
import { bizCourtroomGuideConfig } from '@lawyer-free/shared/guided-steps/business/biz-courtroom-guide'
import { bizServiceGuideConfig } from '@lawyer-free/shared/guided-steps/business/biz-service-guide'
import { bizDiscoveryGuideConfig } from '@lawyer-free/shared/guided-steps/business/biz-discovery-guide'
import { bizEmploymentWrongfulTerminationConfig } from '@lawyer-free/shared/guided-steps/business/biz-employment-wrongful-termination'
import { bizEmploymentWageTheftConfig } from '@lawyer-free/shared/guided-steps/business/biz-employment-wage-theft'
import { bizEmploymentNonCompeteConfig } from '@lawyer-free/shared/guided-steps/business/biz-employment-non-compete'
import { bizB2bContractBreachConfig } from '@lawyer-free/shared/guided-steps/business/biz-b2b-contract-breach'
import { bizB2bTradeSecretsConfig } from '@lawyer-free/shared/guided-steps/business/biz-b2b-trade-secrets'
import { bizPartnershipFiduciaryDutyConfig } from '@lawyer-free/shared/guided-steps/business/biz-partnership-fiduciary-duty'
import { bizPartnershipAccountingConfig } from '@lawyer-free/shared/guided-steps/business/biz-partnership-accounting'
import { bizPartnershipEvidenceConfig } from '@lawyer-free/shared/guided-steps/business/biz-partnership-evidence'
import { bizPartnershipDemandLetterConfig } from '@lawyer-free/shared/guided-steps/business/biz-partnership-demand-letter'
import { bizPartnershipAdrConfig } from '@lawyer-free/shared/guided-steps/business/biz-partnership-adr'
import { bizPartnershipFileWithCourtConfig } from '@lawyer-free/shared/guided-steps/business/biz-partnership-file-with-court'
import { bizPartnershipServeDefendantConfig } from '@lawyer-free/shared/guided-steps/business/biz-partnership-serve-defendant'
import { bizPartnershipWaitForAnswerConfig } from '@lawyer-free/shared/guided-steps/business/biz-partnership-wait-for-answer'
import { bizPartnershipDiscoveryConfig } from '@lawyer-free/shared/guided-steps/business/biz-partnership-discovery'
import { bizPartnershipPostResolutionConfig } from '@lawyer-free/shared/guided-steps/business/biz-partnership-post-resolution'
import { bizEmploymentEvidenceConfig } from '@lawyer-free/shared/guided-steps/business/biz-employment-evidence'
import { bizEmploymentDemandLetterConfig } from '@lawyer-free/shared/guided-steps/business/biz-employment-demand-letter'
import { bizEmploymentEeocConfig } from '@lawyer-free/shared/guided-steps/business/biz-employment-eeoc'
import { bizEmploymentFileWithCourtConfig } from '@lawyer-free/shared/guided-steps/business/biz-employment-file-with-court'
import { bizEmploymentServeDefendantConfig } from '@lawyer-free/shared/guided-steps/business/biz-employment-serve-defendant'
import { bizEmploymentWaitForAnswerConfig } from '@lawyer-free/shared/guided-steps/business/biz-employment-wait-for-answer'
import { bizEmploymentDiscoveryConfig } from '@lawyer-free/shared/guided-steps/business/biz-employment-discovery'
import { bizEmploymentPostResolutionConfig } from '@lawyer-free/shared/guided-steps/business/biz-employment-post-resolution'
import { bizB2bEvidenceConfig } from '@lawyer-free/shared/guided-steps/business/biz-b2b-evidence'
import { bizB2bDemandLetterConfig } from '@lawyer-free/shared/guided-steps/business/biz-b2b-demand-letter'
import { bizB2bNegotiationConfig } from '@lawyer-free/shared/guided-steps/business/biz-b2b-negotiation'
import { bizB2bFileWithCourtConfig } from '@lawyer-free/shared/guided-steps/business/biz-b2b-file-with-court'
import { bizB2bServeDefendantConfig } from '@lawyer-free/shared/guided-steps/business/biz-b2b-serve-defendant'
import { bizB2bWaitForAnswerConfig } from '@lawyer-free/shared/guided-steps/business/biz-b2b-wait-for-answer'
import { bizB2bDiscoveryConfig } from '@lawyer-free/shared/guided-steps/business/biz-b2b-discovery'
import { bizB2bPostResolutionConfig } from '@lawyer-free/shared/guided-steps/business/biz-b2b-post-resolution'

// ── Other ────────────────────────────────────────────────────────────────────
import { otherDemandLetterConfig } from '@lawyer-free/shared/guided-steps/other/other-demand-letter'
import { otherFileWithCourtConfig } from '@lawyer-free/shared/guided-steps/other/other-file-with-court'
import { otherServeDefendantConfig } from '@lawyer-free/shared/guided-steps/other/other-serve-defendant'
import { otherWaitForAnswerConfig } from '@lawyer-free/shared/guided-steps/other/other-wait-for-answer'
import { otherReviewAnswerConfig } from '@lawyer-free/shared/guided-steps/other/other-review-answer'
import { otherDiscoveryConfig } from '@lawyer-free/shared/guided-steps/other/other-discovery'
import { otherPostResolutionConfig } from '@lawyer-free/shared/guided-steps/other/other-post-resolution'

// ── Personal Injury: medical improvement (already had a wrapper) ─────────────
import { piMedicalImprovementConfig } from '@lawyer-free/shared/guided-steps/personal-injury/pi-medical-improvement'

// ── Config registry ──────────────────────────────────────────────────────────

/**
 * Returns the GuidedStepConfig for a given task key, or null if unrecognised.
 * Factory-based configs accept a sub-type encoded in the task key itself.
 * Pass `state` (e.g. 'CA', 'NY') for state-aware configs; defaults to 'TX'.
 */
function resolveConfig(taskKey: string, state?: string): GuidedStepConfig | null {
  switch (taskKey) {
    // ── Family: Divorce ─────────────────────────────────────────────────────
    case 'divorce_intake': return createFamilyIntakeConfig('divorce')
    case 'divorce_evidence_vault': return createEvidenceVaultConfig('divorce')
    case 'divorce_file_with_court': return createFamilyFileWithCourtConfig('divorce')
    case 'divorce_serve_respondent': return createServeRespondentConfig('divorce')
    case 'divorce_waiting_period': return createWaitingPeriodConfig()
    case 'divorce_temporary_orders': return createTemporaryOrdersConfig('divorce')
    case 'divorce_mediation': return createMediationConfig('divorce')
    case 'divorce_property_division': return familyPropertyDivisionConfig
    case 'divorce_final_orders': return createFinalOrdersConfig('divorce')
    case 'divorce_response_checkpoint': return createResponseCheckpointConfig('divorce')
    case 'divorce_post_decree': return createPostDecreeConfig('divorce')
    case 'divorce_standing_orders': return standingOrdersConfig

    // ── Family: Custody ─────────────────────────────────────────────────────
    case 'custody_intake': return createFamilyIntakeConfig('custody')
    case 'custody_evidence_vault': return createEvidenceVaultConfig('custody')
    case 'custody_file_with_court': return createFamilyFileWithCourtConfig('custody')
    case 'custody_serve_respondent': return createServeRespondentConfig('custody')
    case 'custody_temporary_orders': return createTemporaryOrdersConfig('custody')
    case 'custody_mediation': return createMediationConfig('custody')
    case 'custody_final_orders': return createFinalOrdersConfig('custody')
    case 'custody_response_checkpoint': return createResponseCheckpointConfig('custody')
    case 'custody_post_decree': return createPostDecreeConfig('custody')
    case 'custody_uccjea_affidavit': return uccjeaAffidavitConfig
    case 'custody_paternity': return paternityConfig

    // ── Family: Child Support ───────────────────────────────────────────────
    case 'child_support_intake': return createFamilyIntakeConfig('child_support')
    case 'child_support_evidence_vault': return createEvidenceVaultConfig('child_support')
    case 'child_support_file_with_court': return createFamilyFileWithCourtConfig('child_support')
    case 'child_support_serve_respondent': return createServeRespondentConfig('child_support')
    case 'child_support_temporary_orders': return createTemporaryOrdersConfig('child_support')
    case 'child_support_final_orders': return createFinalOrdersConfig('child_support')
    case 'child_support_response_checkpoint': return createResponseCheckpointConfig('child_support')
    case 'child_support_post_decree': return createPostDecreeConfig('child_support')
    case 'child_support_ag_option': return agOptionConfig
    case 'child_support_paternity': return paternityConfig

    // ── Family: Visitation ──────────────────────────────────────────────────
    case 'visitation_intake': return createFamilyIntakeConfig('visitation')
    case 'visitation_evidence_vault': return createEvidenceVaultConfig('visitation')
    case 'visitation_file_with_court': return createFamilyFileWithCourtConfig('visitation')
    case 'visitation_serve_respondent': return createServeRespondentConfig('visitation')
    case 'visitation_mediation': return createMediationConfig('visitation')
    case 'visitation_final_orders': return createFinalOrdersConfig('visitation')
    case 'visitation_response_checkpoint': return createResponseCheckpointConfig('visitation')
    case 'visitation_post_decree': return createPostDecreeConfig('visitation')

    // ── Family: Spousal Support ─────────────────────────────────────────────
    case 'spousal_support_intake': return createFamilyIntakeConfig('spousal_support')
    case 'spousal_support_evidence_vault': return createEvidenceVaultConfig('spousal_support')
    case 'spousal_support_file_with_court': return createFamilyFileWithCourtConfig('spousal_support')
    case 'spousal_support_serve_respondent': return createServeRespondentConfig('spousal_support')
    case 'spousal_support_temporary_orders': return createTemporaryOrdersConfig('spousal_support')
    case 'spousal_support_final_orders': return createFinalOrdersConfig('spousal_support')
    case 'spousal_support_response_checkpoint': return createResponseCheckpointConfig('spousal_support')
    case 'spousal_support_post_decree': return createPostDecreeConfig('spousal_support')
    case 'spousal_support_eligibility': return spousalEligibilityConfig

    // ── Family: Protective Order ────────────────────────────────────────────
    case 'po_intake': return createFamilyIntakeConfig('protective_order')
    case 'po_file_with_court': return createFamilyFileWithCourtConfig('protective_order')
    case 'po_hearing': return poHearingConfig

    // ── Family: Modification ────────────────────────────────────────────────
    case 'mod_intake': return createFamilyIntakeConfig('modification')
    case 'mod_evidence_vault': return createEvidenceVaultConfig('modification')
    case 'mod_existing_order_review': return existingOrderReviewConfig
    case 'mod_file_with_court': return createFamilyFileWithCourtConfig('modification')
    case 'mod_serve_respondent': return createServeRespondentConfig('modification')
    case 'mod_mediation': return createMediationConfig('modification')
    case 'mod_final_orders': return createFinalOrdersConfig('modification')
    case 'mod_response_checkpoint': return createResponseCheckpointConfig('modification')
    case 'mod_post_decree': return createPostDecreeConfig('modification')

    // ── Family: depth steps ─────────────────────────────────────────────────
    case 'family_filing_guide': return familyFilingGuideConfig
    case 'family_service_guide': return familyServiceGuideConfig
    case 'family_courtroom_guide': return familyCourtroomGuideConfig
    case 'family_mediation_prep': return familyMediationPrepConfig
    case 'family_post_judgment_guide': return familyPostJudgmentGuideConfig
    case 'family_discovery_guide': return familyDiscoveryGuideConfig
    case 'family_temp_orders_prep': return familyTempOrdersPrepConfig
    case 'family_property_division_guide': return familyPropertyDivisionGuideConfig
    case 'family_custody_factors': return familyCustodyFactorsConfig
    case 'family_uncontested_path': return familyUncontestedPathConfig

    // ── Small Claims ────────────────────────────────────────────────────────
    case 'sc_evidence_vault': return scEvidenceVaultConfig
    case 'sc_file_with_court': return createScFileWithCourtConfig(state)
    case 'sc_jp_court_guide': return createScCourtGuideConfig(state)
    case 'sc_filing_guide': return createScFilingGuideConfig(state)
    case 'sc_service_guide': return createScServiceGuideConfig(state)
    case 'sc_courtroom_guide': return scCourtroomGuideConfig
    case 'sc_evidence_rules': return createScEvidenceRulesConfig(state)
    case 'sc_damages_by_type': return createScDamagesByTypeConfig(state)
    case 'sc_settlement_guide': return scSettlementGuideConfig
    case 'sc_default_judgment': return scDefaultJudgmentConfig
    case 'sc_post_judgment_guide': return createScPostJudgmentGuideConfig(state)
    case 'sc_appeal_guide': return createScAppealGuideConfig(state)
    case 'sc_counterclaim_defense': return scCounterclaimDefenseConfig

    // ── Landlord-Tenant: chain ──────────────────────────────────────────────
    case 'lt_negotiation': return ltNegotiationConfig
    case 'lt_file_with_court': return ltFileWithCourtConfig
    case 'lt_wait_for_response': return ltWaitForResponseConfig
    case 'lt_review_response': return ltReviewResponseConfig
    case 'lt_discovery': return ltDiscoveryConfig
    case 'lt_mediation': return ltMediationConfig
    case 'lt_prepare_for_hearing': return ltHearingPrepConfig
    case 'lt_hearing_day': return ltHearingDayConfig
    case 'lt_post_judgment': return postJudgmentConfig

    // ── Landlord-Tenant: depth steps ────────────────────────────────────────
    case 'lt_repair_request': return createLtRepairRequestConfig(state)
    case 'lt_eviction_response': return createLtEvictionResponseConfig(state)
    case 'lt_habitability_checklist': return ltHabitabilityChecklistConfig
    case 'lt_security_deposit_demand': return ltSecurityDepositDemandConfig
    case 'lt_repair_and_deduct': return ltRepairAndDeductConfig
    case 'lt_illegal_lockout': return ltIllegalLockoutDefenseConfig
    case 'lt_eviction_notice_analysis': return ltEvictionNoticeAnalysisConfig
    case 'lt_jp_court_procedures': return ltJpCourtProceduresConfig
    case 'lt_appeal_guide': return ltAppealGuideConfig
    case 'lt_courtroom_guide': return ltCourtroomGuideDeepConfig
    case 'lt_lease_termination': return ltLeaseTerminationGuideConfig
    case 'lt_writ_of_possession': return ltWritOfPossessionConfig
    case 'lt_sb38_awareness': return ltSb38AwarenessConfig
    case 'lt_federal_property_check': return ltFederalPropertyCheckConfig
    case 'lt_retaliation_defense': return ltRetaliationDefenseConfig
    case 'lt_rent_into_registry': return ltRentIntoRegistryConfig
    case 'lt_post_eviction_rights': return ltPostEvictionRightsConfig
    case 'lt_constructive_eviction': return ltConstructiveEvictionConfig
    case 'lt_code_enforcement': return ltCodeEnforcementConfig

    // ── Debt Defense: depth steps ───────────────────────────────────────────
    case 'fdcpa_check': return fdcpaCheckConfig
    case 'debt_sol_check': return debtSolCheckConfig
    case 'debt_answer_prep': return debtAnswerPrepConfig
    case 'debt_filing_guide': return debtFilingGuideConfig
    case 'debt_service_guide': return debtServiceGuideConfig
    case 'debt_courtroom_guide': return debtCourtroomGuideConfig
    case 'debt_post_judgment_guide': return debtPostJudgmentGuideConfig
    case 'fdcpa_counterclaim_guide': return fdcpaCounterclaimGuideConfig
    case 'debt_motion_to_dismiss': return debtMotionToDismissConfig
    case 'debt_default_recovery': return debtDefaultJudgmentRecoveryConfig
    case 'debt_settlement_guide': return debtSettlementGuideConfig
    case 'debt_validation_response': return debtValidationResponseGuideConfig
    case 'debt_evidence_rules': return debtEvidenceRulesConfig
    case 'debt_continuance_request': return debtContinuanceRequestConfig
    case 'debt_witness_prep': return debtWitnessPrepConfig
    case 'debt_credit_dispute': return debtCreditDisputeGuideConfig
    case 'debt_court_type_guide': return debtCourtTypeGuideConfig
    case 'debt_pre_answer_settlement': return debtPreAnswerSettlementConfig
    case 'debt_standing_challenge': return debtStandingChallengeConfig
    case 'debt_discovery_response': return debtDiscoveryResponseConfig
    case 'debt_business_records_challenge': return debtBusinessRecordsChallengeConfig
    case 'debt_exemption_claim': return debtExemptionClaimConfig
    case 'debt_appeal_process': return debtAppealProcessConfig

    // ── Personal Injury: depth steps ────────────────────────────────────────
    case 'pi_damages_calculation': return piDamagesCalculationConfig
    case 'pi_pip_claim': return piPipClaimConfig
    case 'pi_medical_improvement': return piMedicalImprovementConfig
    case 'pi_filing_guide': return piFilingGuideConfig
    case 'pi_service_guide': return piServiceGuideConfig
    case 'pi_courtroom_guide': return piCourtroomGuideConfig
    case 'pi_comparative_fault': return piComparativeFaultConfig
    case 'pi_lien_resolution': return piLienResolutionConfig
    case 'pi_expert_witness_guide': return piExpertWitnessGuideConfig

    // ── Real Estate: chain ──────────────────────────────────────────────────
    case 're_evidence_vault': return reEvidenceVaultConfig
    case 're_demand_letter': return reDemandLetterConfig
    case 're_negotiation': return reNegotiationConfig
    case 're_file_with_court': return reFileWithCourtConfig
    case 're_serve_defendant': return reServeDefendantConfig
    case 're_wait_for_answer': return reWaitForAnswerConfig
    case 're_review_answer': return reReviewAnswerConfig
    case 're_discovery': return reDiscoveryConfig
    case 're_post_resolution': return rePostResolutionConfig

    // ── Real Estate: depth steps ────────────────────────────────────────────
    case 're_filing_guide': return reFilingGuideConfig
    case 're_service_guide': return reServiceGuideConfig
    case 're_courtroom_guide': return reCourtroomGuideConfig
    case 're_title_defect_analysis': return reTitleDefectAnalysisConfig
    case 're_seller_disclosure': return reSellerDisclosureGuideConfig
    case 're_earnest_money': return reEarnestMoneyGuideConfig
    case 're_construction_defect': return reConstructionDefectGuideConfig
    case 're_failed_closing': return reFailedClosingGuideConfig
    case 're_adverse_possession': return reAdversePossessionGuideConfig
    case 're_discovery_guide': return reDiscoveryGuideConfig
    case 're_post_judgment_guide': return rePostJudgmentGuideConfig

    // ── Contract: chain ─────────────────────────────────────────────────────
    case 'contract_demand_letter': return contractDemandLetterConfig
    case 'contract_negotiation': return contractNegotiationConfig
    case 'contract_file_with_court': return contractFileWithCourtConfig
    case 'contract_serve_defendant': return contractServeDefendantConfig
    case 'contract_wait_for_answer': return createContractWaitForAnswerConfig(state)
    case 'contract_review_answer': return contractReviewAnswerConfig
    case 'contract_discovery': return contractDiscoveryConfig
    case 'contract_mediation': return contractMediationConfig
    case 'contract_post_resolution': return contractPostResolutionConfig

    // ── Contract: depth steps ───────────────────────────────────────────────
    case 'contract_breach_analysis': return contractBreachAnalysisConfig
    case 'contract_statute_of_frauds': return contractStatuteOfFraudsConfig
    case 'contract_damages_methods': return contractDamagesMethodsConfig
    case 'contract_provisions_check': return contractProvisionsCheckConfig
    case 'contract_defenses_guide': return createContractDefensesGuideConfig(state)
    case 'contract_filing_guide': return createContractFilingGuideConfig(state)
    case 'contract_service_guide': return createContractServiceGuideConfig(state)
    case 'contract_courtroom_guide': return contractCourtroomGuideConfig
    case 'contract_settlement_guide': return contractSettlementGuideConfig
    case 'contract_post_judgment_guide': return contractPostJudgmentGuideConfig

    // ── Property Damage: chain ──────────────────────────────────────────────
    case 'property_demand_letter': return propertyDemandLetterConfig
    case 'property_negotiation': return propertyNegotiationConfig
    case 'property_file_with_court': return propertyFileWithCourtConfig
    case 'property_serve_defendant': return propertyServeDefendantConfig
    case 'property_wait_for_answer': return propertyWaitForAnswerConfig
    case 'property_review_answer': return propertyReviewAnswerConfig
    case 'property_discovery': return propertyDiscoveryConfig
    case 'property_post_resolution': return propertyPostResolutionConfig

    // ── Property Damage: depth steps ────────────────────────────────────────
    case 'property_damage_assessment': return propertyDamageAssessmentConfig
    case 'property_insurance_guide': return propertyInsuranceGuideConfig
    case 'property_filing_guide': return propertyFilingGuideConfig
    case 'property_service_guide': return propertyServiceGuideConfig
    case 'property_courtroom_guide': return propertyCourtroomGuideConfig
    case 'property_mediation_guide': return propertyMediationGuideConfig
    case 'property_pretrial_motions': return propertyPretrialMotionsConfig
    case 'property_damages_guide': return propertyDamagesGuideConfig
    case 'property_post_judgment_guide': return propertyPostJudgmentGuideConfig

    // ── Business: Partnership ───────────────────────────────────────────────
    case 'biz_partnership_evidence': return bizPartnershipEvidenceConfig
    case 'biz_partnership_demand_letter': return bizPartnershipDemandLetterConfig
    case 'biz_partnership_adr': return bizPartnershipAdrConfig
    case 'biz_partnership_file_with_court': return bizPartnershipFileWithCourtConfig
    case 'biz_partnership_serve_defendant': return bizPartnershipServeDefendantConfig
    case 'biz_partnership_wait_for_answer': return bizPartnershipWaitForAnswerConfig
    case 'biz_partnership_discovery': return bizPartnershipDiscoveryConfig
    case 'biz_partnership_post_resolution': return bizPartnershipPostResolutionConfig

    // ── Business: Employment ────────────────────────────────────────────────
    case 'biz_employment_evidence': return bizEmploymentEvidenceConfig
    case 'biz_employment_demand_letter': return bizEmploymentDemandLetterConfig
    case 'biz_employment_eeoc': return bizEmploymentEeocConfig
    case 'biz_employment_file_with_court': return bizEmploymentFileWithCourtConfig
    case 'biz_employment_serve_defendant': return bizEmploymentServeDefendantConfig
    case 'biz_employment_wait_for_answer': return bizEmploymentWaitForAnswerConfig
    case 'biz_employment_discovery': return bizEmploymentDiscoveryConfig
    case 'biz_employment_post_resolution': return bizEmploymentPostResolutionConfig

    // ── Business: B2B ───────────────────────────────────────────────────────
    case 'biz_b2b_evidence': return bizB2bEvidenceConfig
    case 'biz_b2b_demand_letter': return bizB2bDemandLetterConfig
    case 'biz_b2b_negotiation': return bizB2bNegotiationConfig
    case 'biz_b2b_file_with_court': return bizB2bFileWithCourtConfig
    case 'biz_b2b_serve_defendant': return bizB2bServeDefendantConfig
    case 'biz_b2b_wait_for_answer': return bizB2bWaitForAnswerConfig
    case 'biz_b2b_discovery': return bizB2bDiscoveryConfig
    case 'biz_b2b_post_resolution': return bizB2bPostResolutionConfig

    // ── Business: depth steps ───────────────────────────────────────────────
    case 'biz_courtroom_guide': return bizCourtroomGuideConfig
    case 'biz_service_guide': return bizServiceGuideConfig
    case 'biz_discovery_guide': return bizDiscoveryGuideConfig
    case 'biz_wrongful_termination': return bizEmploymentWrongfulTerminationConfig
    case 'biz_wage_theft': return bizEmploymentWageTheftConfig
    case 'biz_non_compete': return bizEmploymentNonCompeteConfig
    case 'biz_b2b_contract_breach': return bizB2bContractBreachConfig
    case 'biz_b2b_trade_secrets': return bizB2bTradeSecretsConfig
    case 'biz_partnership_fiduciary': return bizPartnershipFiduciaryDutyConfig
    case 'biz_partnership_accounting': return bizPartnershipAccountingConfig

    // ── Other ────────────────────────────────────────────────────────────────
    case 'other_demand_letter': return otherDemandLetterConfig
    case 'other_file_with_court': return otherFileWithCourtConfig
    case 'other_serve_defendant': return otherServeDefendantConfig
    case 'other_wait_for_answer': return otherWaitForAnswerConfig
    case 'other_review_answer': return otherReviewAnswerConfig
    case 'other_discovery': return otherDiscoveryConfig
    case 'other_post_resolution': return otherPostResolutionConfig

    default:
      return null
  }
}

// ── Skippable task keys ───────────────────────────────────────────────────────
const SKIPPABLE_TASK_KEYS = new Set([
  'divorce_temporary_orders',
  'divorce_mediation',
  'custody_temporary_orders',
  'child_support_temporary_orders',
  'visitation_mediation',
  'spousal_support_temporary_orders',
  'mod_mediation',
  'sc_settlement_guide',
  'sc_default_judgment',
  'sc_appeal_guide',
  'sc_counterclaim_defense',
  're_demand_letter',
  're_negotiation',
  're_title_defect_analysis',
  're_seller_disclosure',
  're_earnest_money',
  're_construction_defect',
  're_failed_closing',
  're_adverse_possession',
  'lt_negotiation',
  'lt_mediation',
  'lt_repair_request',
  'lt_eviction_response',
  'lt_habitability_checklist',
  'lt_repair_and_deduct',
  'lt_illegal_lockout',
  'lt_appeal_guide',
  'lt_lease_termination',
  'lt_writ_of_possession',
  'fdcpa_check',
  'debt_sol_check',
  'debt_answer_prep',
  'fdcpa_counterclaim_guide',
  'debt_motion_to_dismiss',
  'debt_default_recovery',
  'debt_settlement_guide',
  'debt_validation_response',
  'debt_evidence_rules',
  'debt_continuance_request',
  'debt_witness_prep',
  'debt_credit_dispute',
  'pi_pip_claim',
  'pi_comparative_fault',
  'pi_lien_resolution',
  'pi_expert_witness_guide',
  'contract_demand_letter',
  'contract_negotiation',
  'contract_mediation',
  'contract_defenses_guide',
  'contract_settlement_guide',
  'property_demand_letter',
  'property_negotiation',
  'property_insurance_guide',
  'property_mediation_guide',
  'property_pretrial_motions',
  'biz_partnership_demand_letter',
  'biz_partnership_adr',
  'biz_employment_demand_letter',
  'biz_b2b_demand_letter',
  'biz_b2b_negotiation',
  'biz_wrongful_termination',
  'biz_wage_theft',
  'biz_non_compete',
  'biz_b2b_contract_breach',
  'biz_b2b_trade_secrets',
  'biz_partnership_fiduciary',
  'biz_partnership_accounting',
  'family_discovery_guide',
  'family_temp_orders_prep',
  'family_property_division_guide',
  'family_custody_factors',
  'family_uncontested_path',
  'other_demand_letter',
])

interface DynamicGuidedStepProps {
  taskKey: string
  caseId: string
  taskId: string
  existingAnswers?: Record<string, string>
  /**
   * Two-letter state code (e.g. 'CA', 'NY') for state-aware configs.
   * Defaults to 'TX' when omitted.
   */
  state?: string
  /**
   * Optional override for skippable. When provided, takes precedence over the
   * built-in SKIPPABLE_TASK_KEYS set. Useful for task keys whose skippable
   * state depends on runtime data (e.g. biz_employment_eeoc).
   */
  skippable?: boolean
}

export function DynamicGuidedStep({ taskKey, caseId, taskId, existingAnswers, state, skippable }: DynamicGuidedStepProps) {
  const config = resolveConfig(taskKey, state)

  if (!config) {
    // Unrecognised task key — should not happen in practice
    return null
  }

  const isSkippable = skippable !== undefined ? skippable : SKIPPABLE_TASK_KEYS.has(taskKey)

  return (
    <GuidedStep
      caseId={caseId}
      taskId={taskId}
      config={config}
      existingAnswers={existingAnswers}
      skippable={isSkippable}
    />
  )
}
