import { createClient } from '@/lib/supabase/server'
import { WelcomeStep } from '@/components/step/welcome-step'
import { IntakeStep } from '@/components/step/intake-step'
import { UploadReturnOfServiceStep } from '@/components/step/upload-return-of-service-step'
import { ConfirmServiceFactsStep } from '@/components/step/confirm-service-facts-step'
import { PreservationLetterStep } from '@/components/step/preservation-letter-step'
import { WaitForAnswerStep } from '@/components/step/wait-for-answer-step'
import { CheckDocketForAnswerStep } from '@/components/step/check-docket-for-answer-step'
import { PrepareFilingStep } from '@/components/step/prepare-filing-step'
import { PetitionWizard } from '@/components/step/petition-wizard'
import { PetitionWizardEnhanced } from '@/components/step/petition-wizard-enhanced'
import { FileWithCourtStep } from '@/components/step/file-with-court-step'
import { DiscoveryStarterPackStep } from '@/components/step/discovery-starter-pack-step'
import { UnderstandRemovalStep } from '@/components/step/understand-removal-step'
import { ChooseRemovalStrategyStep } from '@/components/step/choose-removal-strategy-step'
import { PrepareAmendedComplaintStep } from '@/components/step/prepare-amended-complaint-step'
import { FileAmendedComplaintStep } from '@/components/step/file-amended-complaint-step'
import { PrepareRemandMotionStep } from '@/components/step/prepare-remand-motion-step'
import { FileRemandMotionStep } from '@/components/step/file-remand-motion-step'
import { Rule26fPrepStep } from '@/components/step/rule-26f-prep-step'
import { MandatoryDisclosuresStep } from '@/components/step/mandatory-disclosures-step'
import { UploadAnswerStep } from '@/components/step/upload-answer-step'
import { EvidenceVaultStep } from '@/components/step/evidence-vault-step'
import { DefaultPacketPrepStep } from '@/components/step/default-packet-prep-step'
import { MotionBuilder } from '@/components/step/motion-builder'
import { TrialPrepChecklistStep } from '@/components/step/trial-prep-checklist-step'
import { SafetyScreeningStep } from '@/components/step/family/safety-screening-step'
import { FamilyLawWizard } from '@/components/step/family-law-wizard'
import { createFamilyIntakeConfig } from '@/lib/guided-steps/family/family-intake-factory'
import { createEvidenceVaultConfig } from '@/lib/guided-steps/family/family-evidence-vault'
import { createFileWithCourtConfig as createFamilyFileWithCourtConfig } from '@/lib/guided-steps/family/family-file-with-court'
import { createServeRespondentConfig } from '@/lib/guided-steps/family/family-serve-respondent'
import { createWaitingPeriodConfig } from '@/lib/guided-steps/family/waiting-period'
import { createTemporaryOrdersConfig } from '@/lib/guided-steps/family/temporary-orders'
import { createMediationConfig } from '@/lib/guided-steps/family/mediation'
import { createFinalOrdersConfig } from '@/lib/guided-steps/family/final-orders'
import { propertyDivisionConfig as familyPropertyDivisionConfig } from '@/lib/guided-steps/family/family-property-division'
import { existingOrderReviewConfig } from '@/lib/guided-steps/family/family-existing-order-review'
import { poHearingConfig } from '@/lib/guided-steps/family/po-hearing'
import { SmallClaimsIntakeStep } from '@/components/step/small-claims/small-claims-intake-step'
import { DemandLetterStep } from '@/components/step/small-claims/demand-letter-step'
import { SmallClaimsWizard } from '@/components/step/small-claims-wizard'
import { ServeDefendantStep } from '@/components/step/small-claims/serve-defendant-step'
import { PrepareForHearingStep } from '@/components/step/small-claims/prepare-for-hearing-step'
import { HearingDayStep } from '@/components/step/small-claims/hearing-day-step'
import { scEvidenceVaultConfig } from '@/lib/guided-steps/small-claims/sc-evidence-vault'
import { scFileWithCourtConfig } from '@/lib/guided-steps/small-claims/sc-file-with-court'
import { LtIntakeStep } from '@/components/step/landlord-tenant/lt-intake-step'
import { LtDemandLetterStep } from '@/components/step/landlord-tenant/lt-demand-letter-step'
import { LandlordTenantWizard } from '@/components/step/landlord-tenant-wizard'
import { ServeOtherPartyStep } from '@/components/step/landlord-tenant/serve-other-party-step'
import { ltNegotiationConfig } from '@/lib/guided-steps/landlord-tenant/lt-negotiation'
import { ltFileWithCourtConfig } from '@/lib/guided-steps/landlord-tenant/lt-file-with-court'
import { ltWaitForResponseConfig } from '@/lib/guided-steps/landlord-tenant/lt-wait-for-response'
import { ltReviewResponseConfig } from '@/lib/guided-steps/landlord-tenant/lt-review-response'
import { ltDiscoveryConfig } from '@/lib/guided-steps/landlord-tenant/lt-discovery'
import { ltMediationConfig } from '@/lib/guided-steps/landlord-tenant/lt-mediation'
import { ltHearingPrepConfig } from '@/lib/guided-steps/landlord-tenant/lt-hearing-prep'
import { ltHearingDayConfig } from '@/lib/guided-steps/landlord-tenant/lt-hearing-day'
import { postJudgmentConfig } from '@/lib/guided-steps/landlord-tenant/post-judgment'
import { DebtDefenseIntakeStep } from '@/components/step/debt-defense/debt-defense-intake-step'
import { DebtValidationLetterStep } from '@/components/step/debt-defense/debt-validation-letter-step'
import { DebtDefenseWizard } from '@/components/step/debt-defense-wizard'
import { DebtFileWithCourtStep } from '@/components/step/debt-defense/debt-file-with-court-step'
import { ServePlaintiffStep } from '@/components/step/debt-defense/serve-plaintiff-step'
import { DebtHearingPrepStep } from '@/components/step/debt-defense/debt-hearing-prep-step'
import { DebtHearingDayStep } from '@/components/step/debt-defense/debt-hearing-day-step'
import { DebtPostJudgmentStep } from '@/components/step/debt-defense/debt-post-judgment-step'
// Debt defense depth guided-step configs
import { fdcpaCheckConfig } from '@/lib/guided-steps/debt-defense/fdcpa-check'
import { debtSolCheckConfig } from '@/lib/guided-steps/debt-defense/debt-sol-check'
import { debtAnswerPrepConfig } from '@/lib/guided-steps/debt-defense/debt-answer-prep'
import { debtHearingPrepDeepConfig } from '@/lib/guided-steps/debt-defense/debt-hearing-prep-deep'
import { debtFilingGuideConfig } from '@/lib/guided-steps/debt-defense/debt-filing-guide'
import { debtServiceGuideConfig } from '@/lib/guided-steps/debt-defense/debt-service-guide'
import { debtCourtroomGuideConfig } from '@/lib/guided-steps/debt-defense/debt-courtroom-guide'
import { debtPostJudgmentGuideConfig } from '@/lib/guided-steps/debt-defense/debt-post-judgment-guide'
import { fdcpaCounterclaimGuideConfig } from '@/lib/guided-steps/debt-defense/fdcpa-counterclaim-guide'
import { debtMotionToDismissConfig } from '@/lib/guided-steps/debt-defense/debt-motion-to-dismiss'
import { debtDefaultJudgmentRecoveryConfig } from '@/lib/guided-steps/debt-defense/debt-default-judgment-recovery'
import { debtSettlementGuideConfig } from '@/lib/guided-steps/debt-defense/debt-settlement-guide'
import { debtValidationResponseGuideConfig } from '@/lib/guided-steps/debt-defense/debt-validation-response-guide'
import { debtEvidenceRulesConfig } from '@/lib/guided-steps/debt-defense/debt-evidence-rules'
import { debtContinuanceRequestConfig } from '@/lib/guided-steps/debt-defense/debt-continuance-request'
import { debtWitnessPrepConfig } from '@/lib/guided-steps/debt-defense/debt-witness-prep'
import { debtCreditDisputeGuideConfig } from '@/lib/guided-steps/debt-defense/debt-credit-dispute-guide'
// Landlord-tenant depth guided-step configs
// Family law depth guided-step configs
import { familyFilingGuideConfig } from '@/lib/guided-steps/family/family-filing-guide'
import { familyServiceGuideConfig } from '@/lib/guided-steps/family/family-service-guide'
import { familyCourtroomGuideConfig } from '@/lib/guided-steps/family/family-courtroom-guide'
import { familyMediationPrepConfig } from '@/lib/guided-steps/family/family-mediation-prep'
import { familyPostJudgmentGuideConfig } from '@/lib/guided-steps/family/family-post-judgment-guide'
import { familyDiscoveryGuideConfig } from '@/lib/guided-steps/family/family-discovery-guide'
import { familyTempOrdersPrepConfig } from '@/lib/guided-steps/family/family-temp-orders-prep'
import { familyPropertyDivisionGuideConfig } from '@/lib/guided-steps/family/family-property-division-guide'
import { familyCustodyFactorsConfig } from '@/lib/guided-steps/family/family-custody-factors'
import { familyUncontestedPathConfig } from '@/lib/guided-steps/family/family-uncontested-path'
// Personal injury depth guided-step configs
import { piDamagesCalculationConfig } from '@/lib/guided-steps/personal-injury/pi-damages-calculation'
import { piPipClaimConfig } from '@/lib/guided-steps/personal-injury/pi-pip-claim'
import { piMedicalImprovementConfig } from '@/lib/guided-steps/personal-injury/pi-medical-improvement'
import { piFilingGuideConfig } from '@/lib/guided-steps/personal-injury/pi-filing-guide'
import { piServiceGuideConfig } from '@/lib/guided-steps/personal-injury/pi-service-guide'
import { piCourtroomGuideConfig } from '@/lib/guided-steps/personal-injury/pi-courtroom-guide'
import { piComparativeFaultConfig } from '@/lib/guided-steps/personal-injury/pi-comparative-fault'
import { piLienResolutionConfig } from '@/lib/guided-steps/personal-injury/pi-lien-resolution'
import { piExpertWitnessGuideConfig } from '@/lib/guided-steps/personal-injury/pi-expert-witness-guide'
// Contract dispute depth guided-step configs
import { contractBreachAnalysisConfig } from '@/lib/guided-steps/contract/contract-breach-analysis'
import { contractStatuteOfFraudsConfig } from '@/lib/guided-steps/contract/contract-statute-of-frauds'
import { contractDamagesMethodsConfig } from '@/lib/guided-steps/contract/contract-damages-methods'
import { contractProvisionsCheckConfig } from '@/lib/guided-steps/contract/contract-provisions-check'
import { contractDefensesGuideConfig } from '@/lib/guided-steps/contract/contract-defenses-guide'
import { contractFilingGuideConfig } from '@/lib/guided-steps/contract/contract-filing-guide'
import { contractServiceGuideConfig } from '@/lib/guided-steps/contract/contract-service-guide'
import { contractCourtroomGuideConfig } from '@/lib/guided-steps/contract/contract-courtroom-guide'
import { contractSettlementGuideConfig } from '@/lib/guided-steps/contract/contract-settlement-guide'
import { contractPostJudgmentGuideConfig } from '@/lib/guided-steps/contract/contract-post-judgment-guide'
// Property damage depth guided-step configs
import { propertyDamageAssessmentConfig } from '@/lib/guided-steps/property/property-damage-assessment'
import { propertyInsuranceGuideConfig } from '@/lib/guided-steps/property/property-insurance-guide'
import { propertyFilingGuideConfig } from '@/lib/guided-steps/property/property-filing-guide'
import { propertyServiceGuideConfig } from '@/lib/guided-steps/property/property-service-guide'
import { propertyCourtroomGuideConfig } from '@/lib/guided-steps/property/property-courtroom-guide'
import { propertyMediationGuideConfig } from '@/lib/guided-steps/property/property-mediation-guide'
import { propertyPretrialMotionsConfig } from '@/lib/guided-steps/property/property-pretrial-motions'
import { propertyDamagesGuideConfig } from '@/lib/guided-steps/property/property-damages-guide'
import { propertyPostJudgmentGuideConfig } from '@/lib/guided-steps/property/property-post-judgment-guide'
// Landlord-tenant depth guided-step configs (new)
import { ltSecurityDepositDemandConfig } from '@/lib/guided-steps/landlord-tenant/lt-security-deposit-demand'
import { ltRepairAndDeductConfig } from '@/lib/guided-steps/landlord-tenant/lt-repair-and-deduct'
import { ltIllegalLockoutDefenseConfig } from '@/lib/guided-steps/landlord-tenant/lt-illegal-lockout-defense'
import { ltEvictionNoticeAnalysisConfig } from '@/lib/guided-steps/landlord-tenant/lt-eviction-notice-analysis'
import { ltJpCourtProceduresConfig } from '@/lib/guided-steps/landlord-tenant/lt-jp-court-procedures'
import { ltAppealGuideConfig } from '@/lib/guided-steps/landlord-tenant/lt-appeal-guide'
import { ltCourtroomGuideConfig as ltCourtroomGuideDeepConfig } from '@/lib/guided-steps/landlord-tenant/lt-courtroom-guide'
import { ltLeaseTerminationGuideConfig } from '@/lib/guided-steps/landlord-tenant/lt-lease-termination-guide'
import { ltWritOfPossessionConfig } from '@/lib/guided-steps/landlord-tenant/lt-writ-of-possession'
import { ltRepairRequestConfig } from '@/lib/guided-steps/landlord-tenant/lt-repair-request'
import { ltEvictionResponseConfig } from '@/lib/guided-steps/landlord-tenant/lt-eviction-response'
import { ltHabitabilityChecklistConfig } from '@/lib/guided-steps/landlord-tenant/lt-habitability-checklist'
import { PIIntakeStep } from '@/components/step/personal-injury/pi-intake-step'
import { PIDemandLetterStep } from '@/components/step/personal-injury/pi-demand-letter-step'
import { PersonalInjuryWizard } from '@/components/step/personal-injury-wizard'
import { PIMedicalRecordsStep } from '@/components/step/personal-injury/pi-medical-records-step'
import { PIInsuranceCommunicationStep } from '@/components/step/personal-injury/pi-insurance-communication-step'
import { PISettlementNegotiationStep } from '@/components/step/personal-injury/pi-settlement-negotiation-step'
import { PIFileWithCourtStep } from '@/components/step/personal-injury/pi-file-with-court-step'
import { PIServeDefendantStep } from '@/components/step/personal-injury/pi-serve-defendant-step'
import { PITrialPrepStep } from '@/components/step/personal-injury/pi-trial-prep-step'
import { PIPostResolutionStep } from '@/components/step/personal-injury/pi-post-resolution-step'
import { PIWaitForAnswerStep } from '@/components/step/personal-injury/pi-wait-for-answer-step'
import { PIReviewAnswerStep } from '@/components/step/personal-injury/pi-review-answer-step'
import { PIDiscoveryPrepStep } from '@/components/step/personal-injury/pi-discovery-prep-step'
import { PIDiscoveryResponsesStep } from '@/components/step/personal-injury/pi-discovery-responses-step'
import { PISchedulingConferenceStep } from '@/components/step/personal-injury/pi-scheduling-conference-step'
import { PIPretrialMotionsStep } from '@/components/step/personal-injury/pi-pretrial-motions-step'
import { PIMediationStep } from '@/components/step/personal-injury/pi-mediation-step'
import { ContractIntakeStep } from '@/components/step/contract/contract-intake-step'
import { ContractWizard } from '@/components/step/contract/contract-wizard'
import { PropertyIntakeStep } from '@/components/step/property/property-intake-step'
import { PropertyWizard } from '@/components/step/property/property-wizard'
import { OtherIntakeStep } from '@/components/step/other/other-intake-step'
import { OtherWizard } from '@/components/step/other/other-wizard'
import { GuidedStep } from '@/components/step/guided-step'
import { contractDemandLetterConfig } from '@/lib/guided-steps/contract/contract-demand-letter'
import { contractNegotiationConfig } from '@/lib/guided-steps/contract/contract-negotiation'
import { contractFileWithCourtConfig } from '@/lib/guided-steps/contract/contract-file-with-court'
import { contractServeDefendantConfig } from '@/lib/guided-steps/contract/contract-serve-defendant'
import { contractWaitForAnswerConfig } from '@/lib/guided-steps/contract/contract-wait-for-answer'
import { contractReviewAnswerConfig } from '@/lib/guided-steps/contract/contract-review-answer'
import { contractDiscoveryConfig } from '@/lib/guided-steps/contract/contract-discovery'
import { contractMediationConfig } from '@/lib/guided-steps/contract/contract-mediation'
import { contractPostResolutionConfig } from '@/lib/guided-steps/contract/contract-post-resolution'
import { propertyDemandLetterConfig } from '@/lib/guided-steps/property/property-demand-letter'
import { propertyNegotiationConfig } from '@/lib/guided-steps/property/property-negotiation'
import { propertyFileWithCourtConfig } from '@/lib/guided-steps/property/property-file-with-court'
import { propertyServeDefendantConfig } from '@/lib/guided-steps/property/property-serve-defendant'
import { propertyWaitForAnswerConfig } from '@/lib/guided-steps/property/property-wait-for-answer'
import { propertyReviewAnswerConfig } from '@/lib/guided-steps/property/property-review-answer'
import { propertyDiscoveryConfig } from '@/lib/guided-steps/property/property-discovery'
import { propertyPostResolutionConfig } from '@/lib/guided-steps/property/property-post-resolution'
import { REIntakeStep } from '@/components/step/real-estate/re-intake-step'
import { RealEstateWizard } from '@/components/step/real-estate/real-estate-wizard'
import { reEvidenceVaultConfig } from '@/lib/guided-steps/real-estate/re-evidence-vault'
import { reDemandLetterConfig } from '@/lib/guided-steps/real-estate/re-demand-letter'
import { reNegotiationConfig } from '@/lib/guided-steps/real-estate/re-negotiation'
import { reFileWithCourtConfig } from '@/lib/guided-steps/real-estate/re-file-with-court'
import { reServeDefendantConfig } from '@/lib/guided-steps/real-estate/re-serve-defendant'
import { reWaitForAnswerConfig } from '@/lib/guided-steps/real-estate/re-wait-for-answer'
import { reReviewAnswerConfig } from '@/lib/guided-steps/real-estate/re-review-answer'
import { reDiscoveryConfig } from '@/lib/guided-steps/real-estate/re-discovery'
import { rePostResolutionConfig } from '@/lib/guided-steps/real-estate/re-post-resolution'

// Business: shared wizard
import { BusinessWizard } from '@/components/step/business/business-wizard'

// Business: Partnership
import { BizPartnershipIntakeStep } from '@/components/step/business/biz-partnership-intake-step'
import { bizPartnershipEvidenceConfig } from '@/lib/guided-steps/business/biz-partnership-evidence'
import { bizPartnershipDemandLetterConfig } from '@/lib/guided-steps/business/biz-partnership-demand-letter'
import { bizPartnershipAdrConfig } from '@/lib/guided-steps/business/biz-partnership-adr'
import { bizPartnershipFileWithCourtConfig } from '@/lib/guided-steps/business/biz-partnership-file-with-court'
import { bizPartnershipServeDefendantConfig } from '@/lib/guided-steps/business/biz-partnership-serve-defendant'
import { bizPartnershipWaitForAnswerConfig } from '@/lib/guided-steps/business/biz-partnership-wait-for-answer'
import { bizPartnershipDiscoveryConfig } from '@/lib/guided-steps/business/biz-partnership-discovery'
import { bizPartnershipPostResolutionConfig } from '@/lib/guided-steps/business/biz-partnership-post-resolution'

// Business: Employment
import { BizEmploymentIntakeStep } from '@/components/step/business/biz-employment-intake-step'
import { bizEmploymentEvidenceConfig } from '@/lib/guided-steps/business/biz-employment-evidence'
import { bizEmploymentDemandLetterConfig } from '@/lib/guided-steps/business/biz-employment-demand-letter'
import { bizEmploymentEeocConfig } from '@/lib/guided-steps/business/biz-employment-eeoc'
import { bizEmploymentFileWithCourtConfig } from '@/lib/guided-steps/business/biz-employment-file-with-court'
import { bizEmploymentServeDefendantConfig } from '@/lib/guided-steps/business/biz-employment-serve-defendant'
import { bizEmploymentWaitForAnswerConfig } from '@/lib/guided-steps/business/biz-employment-wait-for-answer'
import { bizEmploymentDiscoveryConfig } from '@/lib/guided-steps/business/biz-employment-discovery'
import { bizEmploymentPostResolutionConfig } from '@/lib/guided-steps/business/biz-employment-post-resolution'

// Business: B2B Commercial
import { BizB2bIntakeStep } from '@/components/step/business/biz-b2b-intake-step'
import { bizB2bEvidenceConfig } from '@/lib/guided-steps/business/biz-b2b-evidence'
import { bizB2bDemandLetterConfig } from '@/lib/guided-steps/business/biz-b2b-demand-letter'
import { bizB2bNegotiationConfig } from '@/lib/guided-steps/business/biz-b2b-negotiation'
import { bizB2bFileWithCourtConfig } from '@/lib/guided-steps/business/biz-b2b-file-with-court'
import { bizB2bServeDefendantConfig } from '@/lib/guided-steps/business/biz-b2b-serve-defendant'
import { bizB2bWaitForAnswerConfig } from '@/lib/guided-steps/business/biz-b2b-wait-for-answer'
import { bizB2bDiscoveryConfig } from '@/lib/guided-steps/business/biz-b2b-discovery'
import { bizB2bPostResolutionConfig } from '@/lib/guided-steps/business/biz-b2b-post-resolution'

import { otherDemandLetterConfig } from '@/lib/guided-steps/other/other-demand-letter'
import { otherFileWithCourtConfig } from '@/lib/guided-steps/other/other-file-with-court'
import { otherServeDefendantConfig } from '@/lib/guided-steps/other/other-serve-defendant'
import { otherWaitForAnswerConfig } from '@/lib/guided-steps/other/other-wait-for-answer'
import { otherReviewAnswerConfig } from '@/lib/guided-steps/other/other-review-answer'
import { otherDiscoveryConfig } from '@/lib/guided-steps/other/other-discovery'
import { otherPostResolutionConfig } from '@/lib/guided-steps/other/other-post-resolution'
import { MOTION_CONFIGS } from '@/lib/motions/registry'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'

export default async function StepPage({
  params,
}: {
  params: Promise<{ id: string; taskId: string }>
}) {
  const { id, taskId } = await params
  const supabase = await createClient()

  const { data: task, error } = await supabase
    .from('tasks')
    .select()
    .eq('id', taskId)
    .single()

  if (error || !task) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link
          href={`/case/${id}`}
          className="text-sm text-warm-muted hover:text-warm-text mb-6 inline-block"
        >
          &larr; Back to dashboard
        </Link>
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <h2 className="text-lg font-semibold text-warm-text mb-2">
              Step not found
            </h2>
            <p className="text-sm text-warm-muted">
              We couldn&apos;t find this step. It may have been removed or
              you may not have access.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (task.status === 'locked') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link
          href={`/case/${id}`}
          className="text-sm text-warm-muted hover:text-warm-text mb-6 inline-block"
        >
          &larr; Back to dashboard
        </Link>
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <h2 className="text-lg font-semibold text-warm-text mb-2">
              This step isn&apos;t available yet
            </h2>
            <p className="text-sm text-warm-muted">
              Complete the earlier steps first, and this one will unlock
              automatically.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Pre-populate filing/wizard tasks with intake metadata so users
  // don't re-enter information they already provided during intake.
  const FILING_TO_INTAKE: Record<string, string> = {
    prepare_filing: 'intake',
    divorce_prepare_filing: 'divorce_intake',
    custody_prepare_filing: 'custody_intake',
    child_support_prepare_filing: 'child_support_intake',
    visitation_prepare_filing: 'visitation_intake',
    spousal_support_prepare_filing: 'spousal_support_intake',
    po_prepare_filing: 'po_intake',
    mod_prepare_filing: 'mod_intake',
    prepare_small_claims_filing: 'small_claims_intake',
    prepare_landlord_tenant_filing: 'lt_intake',
    prepare_debt_validation_letter: 'debt_defense_intake',
    prepare_debt_defense_answer: 'debt_defense_intake',
    prepare_pi_petition: 'pi_intake',
    contract_prepare_filing: 'contract_intake',
    property_prepare_filing: 'property_intake',
    re_prepare_filing: 're_intake',
    biz_partnership_prepare_filing: 'biz_partnership_intake',
    biz_employment_prepare_filing: 'biz_employment_intake',
    biz_b2b_prepare_filing: 'biz_b2b_intake',
    other_prepare_filing: 'other_intake',
  }
  const intakeTaskKey = FILING_TO_INTAKE[task.task_key]
  if (intakeTaskKey) {
    const { data: intakeRow, error: intakeErr } = await supabase
      .from('tasks').select('metadata')
      .eq('case_id', id).eq('task_key', intakeTaskKey).maybeSingle()
    const intakeMeta = (intakeRow?.metadata as Record<string, unknown>) ?? {}
    // Merge: start with intake data, then overlay filing task values that
    // aren't null/undefined (so null wizard defaults don't stomp real intake values)
    const merged: Record<string, unknown> = { ...intakeMeta }
    const filingMeta = (task.metadata ?? {}) as Record<string, unknown>
    for (const [key, value] of Object.entries(filingMeta)) {
      if (value !== null && value !== undefined) {
        merged[key] = value
      }
    }
    task.metadata = merged
  }

  switch (task.task_key) {
    case 'welcome':
      return <WelcomeStep caseId={id} taskId={taskId} />
    case 'intake': {
      const { data: caseRow } = await supabase
        .from('cases')
        .select('county, court_type, dispute_type')
        .eq('id', id)
        .single()

      return (
        <IntakeStep
          caseId={id}
          taskId={taskId}
          existingMetadata={task.metadata}
          caseData={caseRow ?? undefined}
        />
      )
    }
    case 'prepare_filing': {
      const { data: caseRow } = await supabase
        .from('cases')
        .select('role, court_type, county, dispute_type, state')
        .eq('id', id)
        .single()

      // Check if government_entity flag exists from case creation
      const { data: intakeTask } = await supabase
        .from('tasks')
        .select('metadata')
        .eq('case_id', id)
        .eq('task_key', 'intake')
        .maybeSingle()

      const intakeMeta = intakeTask?.metadata as Record<string, unknown> | null
      const governmentEntity = (intakeMeta?.government_entity as boolean) ?? false

      if (!caseRow || caseRow.court_type === 'unknown') {
        return (
          <div className="max-w-2xl mx-auto px-4 py-8">
            <Link href={`/case/${id}`} className="text-sm text-warm-muted hover:text-warm-text mb-6 inline-block">&larr; Back to dashboard</Link>
            <Card><CardContent className="pt-6 text-center py-12">
              <h2 className="text-lg font-semibold text-warm-text mb-2">Court type needed</h2>
              <p className="text-sm text-warm-muted">Complete the intake step first so we know which court you are filing in.</p>
            </CardContent></Card>
          </div>
        )
      }

      return (
        <PetitionWizardEnhanced
          caseId={id}
          taskId={taskId}
          existingMetadata={task.metadata}
          caseData={{
            ...caseRow,
            government_entity: governmentEntity,
          }}
        />
      )
    }

    case 'file_with_court':
      return (
        <FileWithCourtStep
          caseId={id}
          taskId={taskId}
          existingAnswers={task.metadata?.guided_answers}
        />
      )

    case 'preservation_letter':
      return (
        <PreservationLetterStep
          caseId={id}
          taskId={taskId}
          skippable
        />
      )
    case 'upload_return_of_service':
      return (
        <UploadReturnOfServiceStep
          caseId={id}
          taskId={taskId}
        />
      )
    case 'confirm_service_facts':
      return (
        <ConfirmServiceFactsStep
          caseId={id}
          taskId={taskId}
        />
      )
    case 'wait_for_answer':
      return (
        <WaitForAnswerStep
          caseId={id}
          taskId={taskId}
          dueAt={task.due_at}
        />
      )
    case 'check_docket_for_answer':
      return (
        <CheckDocketForAnswerStep
          caseId={id}
          taskId={taskId}
        />
      )
    case 'upload_answer':
      return (
        <UploadAnswerStep
          caseId={id}
          taskId={taskId}
        />
      )
    case 'discovery_starter_pack':
      return (
        <DiscoveryStarterPackStep
          caseId={id}
          taskId={taskId}
          existingAnswers={task.metadata?.guided_answers}
        />
      )
    case 'understand_removal':
      return (
        <UnderstandRemovalStep
          caseId={id}
          taskId={taskId}
          existingAnswers={task.metadata?.guided_answers}
        />
      )
    case 'choose_removal_strategy': {
      const { data: remandDeadline } = await supabase
        .from('deadlines')
        .select('due_at')
        .eq('case_id', id)
        .eq('key', 'remand_motion_deadline')
        .single()

      return (
        <ChooseRemovalStrategyStep
          caseId={id}
          taskId={taskId}
          remandDeadline={remandDeadline?.due_at ?? null}
        />
      )
    }
    case 'prepare_amended_complaint': {
      const { data: caseRow } = await supabase
        .from('cases')
        .select('court_type, county, dispute_type')
        .eq('id', id)
        .single()

      // Try to get federal case number from understand_removal metadata
      const { data: removalTask } = await supabase
        .from('tasks')
        .select('metadata')
        .eq('case_id', id)
        .eq('task_key', 'understand_removal')
        .single()

      return (
        <PrepareAmendedComplaintStep
          caseId={id}
          taskId={taskId}
          existingMetadata={task.metadata}
          caseData={{
            court_type: caseRow?.court_type ?? 'federal',
            county: caseRow?.county ?? null,
            dispute_type: caseRow?.dispute_type ?? null,
            federal_case_number: (removalTask?.metadata as Record<string, unknown>)?.federal_case_number as string | null ?? null,
          }}
        />
      )
    }
    case 'file_amended_complaint':
      return (
        <FileAmendedComplaintStep
          caseId={id}
          taskId={taskId}
          existingMetadata={task.metadata}
        />
      )
    case 'prepare_remand_motion': {
      // Get removal date + federal case number from understand_removal metadata
      const { data: removalTask } = await supabase
        .from('tasks')
        .select('metadata')
        .eq('case_id', id)
        .eq('task_key', 'understand_removal')
        .single()

      const removalMeta = removalTask?.metadata as Record<string, unknown> | null

      return (
        <PrepareRemandMotionStep
          caseId={id}
          taskId={taskId}
          existingMetadata={task.metadata}
          removalDate={(removalMeta?.removal_date as string) ?? null}
          federalCaseNumber={(removalMeta?.federal_case_number as string) ?? null}
        />
      )
    }
    case 'file_remand_motion': {
      const { data: remandDeadline } = await supabase
        .from('deadlines')
        .select('due_at')
        .eq('case_id', id)
        .eq('key', 'remand_motion_deadline')
        .single()

      return (
        <FileRemandMotionStep
          caseId={id}
          taskId={taskId}
          existingMetadata={task.metadata}
          remandDeadline={remandDeadline?.due_at ?? null}
        />
      )
    }
    case 'rule_26f_prep':
      return (
        <Rule26fPrepStep
          caseId={id}
          taskId={taskId}
          existingAnswers={task.metadata?.guided_answers}
        />
      )
    case 'mandatory_disclosures':
      return (
        <MandatoryDisclosuresStep
          caseId={id}
          taskId={taskId}
        />
      )
    case 'evidence_vault':
      return <EvidenceVaultStep caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'default_packet_prep': {
      const { data: caseRow } = await supabase
        .from('cases').select('court_type, county').eq('id', id).single()

      const { data: serviceFacts } = await supabase
        .from('service_facts').select('served_at').eq('case_id', id).maybeSingle()

      const { data: answerDeadline } = await supabase
        .from('deadlines').select('due_at')
        .eq('case_id', id).eq('key', 'answer_deadline_confirmed').maybeSingle()

      const { data: filingTask } = await supabase
        .from('tasks').select('metadata')
        .eq('case_id', id).eq('task_key', 'prepare_filing').maybeSingle()

      const filingMeta = filingTask?.metadata as Record<string, unknown> | null

      return (
        <DefaultPacketPrepStep
          caseId={id} taskId={taskId}
          existingMetadata={task.metadata}
          caseData={{ court_type: caseRow?.court_type ?? 'district', county: caseRow?.county ?? null }}
          serviceData={serviceFacts ? {
            service_date: serviceFacts.served_at,
            answer_deadline: answerDeadline?.due_at ?? null,
          } : null}
          partyData={filingMeta?.your_info ? {
            your_info: filingMeta.your_info as { full_name: string; address?: string },
            opposing_parties: (filingMeta.opposing_parties as { full_name: string; address?: string }[]) ?? [],
          } : null}
        />
      )
    }
    case 'motion_to_compel': {
      const config = MOTION_CONFIGS['motion_to_compel']
      const { data: caseRow } = await supabase
        .from('cases')
        .select('court_type, county, role')
        .eq('id', id)
        .single()

      return (
        <MotionBuilder
          config={config}
          caseId={id}
          taskId={taskId}
          existingMetadata={task.metadata}
          caseData={caseRow ?? undefined}
        />
      )
    }
    case 'trial_prep_checklist':
      return <TrialPrepChecklistStep caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'appellate_brief': {
      const config = MOTION_CONFIGS['appellate_brief']
      const { data: caseRow } = await supabase
        .from('cases')
        .select('court_type, county, role')
        .eq('id', id)
        .single()

      return (
        <MotionBuilder
          config={config}
          caseId={id}
          taskId={taskId}
          existingMetadata={task.metadata}
          caseData={caseRow ?? undefined}
        />
      )
    }
    // Family law — Divorce (12 tasks)
    case 'divorce_intake':
      return <GuidedStep caseId={id} taskId={taskId} config={createFamilyIntakeConfig('divorce')} existingAnswers={task.metadata?.guided_answers} />
    case 'divorce_safety_screening':
      return <SafetyScreeningStep caseId={id} taskId={taskId} />
    case 'divorce_evidence_vault':
      return <GuidedStep caseId={id} taskId={taskId} config={createEvidenceVaultConfig('divorce')} existingAnswers={task.metadata?.guided_answers} />
    case 'divorce_prepare_filing': {
      const { data: caseRow } = await supabase.from('cases').select('county, state').eq('id', id).single()
      const { data: familyDetails } = await supabase.from('family_case_details').select('*').eq('case_id', id).maybeSingle()
      return <FamilyLawWizard caseId={id} taskId={taskId} existingMetadata={task.metadata} familyDetails={familyDetails} caseData={{ county: caseRow?.county ?? null, state: caseRow?.state ?? undefined }} />
    }
    case 'divorce_file_with_court':
      return <GuidedStep caseId={id} taskId={taskId} config={createFamilyFileWithCourtConfig('divorce')} existingAnswers={task.metadata?.guided_answers} />
    case 'divorce_serve_respondent':
      return <GuidedStep caseId={id} taskId={taskId} config={createServeRespondentConfig('divorce')} existingAnswers={task.metadata?.guided_answers} />
    case 'divorce_waiting_period':
      return <GuidedStep caseId={id} taskId={taskId} config={createWaitingPeriodConfig()} existingAnswers={task.metadata?.guided_answers} />
    case 'divorce_temporary_orders':
      return <GuidedStep caseId={id} taskId={taskId} config={createTemporaryOrdersConfig('divorce')} existingAnswers={task.metadata?.guided_answers} skippable />
    case 'divorce_mediation':
      return <GuidedStep caseId={id} taskId={taskId} config={createMediationConfig('divorce')} existingAnswers={task.metadata?.guided_answers} skippable />
    case 'divorce_property_division':
      return <GuidedStep caseId={id} taskId={taskId} config={familyPropertyDivisionConfig} existingAnswers={task.metadata?.guided_answers} />
    case 'divorce_final_orders':
      return <GuidedStep caseId={id} taskId={taskId} config={createFinalOrdersConfig('divorce')} existingAnswers={task.metadata?.guided_answers} />

    // Family law — Custody (10 tasks)
    case 'custody_intake':
      return <GuidedStep caseId={id} taskId={taskId} config={createFamilyIntakeConfig('custody')} existingAnswers={task.metadata?.guided_answers} />
    case 'custody_safety_screening':
      return <SafetyScreeningStep caseId={id} taskId={taskId} />
    case 'custody_evidence_vault':
      return <GuidedStep caseId={id} taskId={taskId} config={createEvidenceVaultConfig('custody')} existingAnswers={task.metadata?.guided_answers} />
    case 'custody_prepare_filing': {
      const { data: caseRow } = await supabase.from('cases').select('county, state').eq('id', id).single()
      const { data: familyDetails } = await supabase.from('family_case_details').select('*').eq('case_id', id).maybeSingle()
      return <FamilyLawWizard caseId={id} taskId={taskId} existingMetadata={task.metadata} familyDetails={familyDetails} caseData={{ county: caseRow?.county ?? null, state: caseRow?.state ?? undefined }} />
    }
    case 'custody_file_with_court':
      return <GuidedStep caseId={id} taskId={taskId} config={createFamilyFileWithCourtConfig('custody')} existingAnswers={task.metadata?.guided_answers} />
    case 'custody_serve_respondent':
      return <GuidedStep caseId={id} taskId={taskId} config={createServeRespondentConfig('custody')} existingAnswers={task.metadata?.guided_answers} />
    case 'custody_temporary_orders':
      return <GuidedStep caseId={id} taskId={taskId} config={createTemporaryOrdersConfig('custody')} existingAnswers={task.metadata?.guided_answers} skippable />
    case 'custody_mediation':
      return <GuidedStep caseId={id} taskId={taskId} config={createMediationConfig('custody')} existingAnswers={task.metadata?.guided_answers} />
    case 'custody_final_orders':
      return <GuidedStep caseId={id} taskId={taskId} config={createFinalOrdersConfig('custody')} existingAnswers={task.metadata?.guided_answers} />

    // Family law — Child Support (8 tasks)
    case 'child_support_intake':
      return <GuidedStep caseId={id} taskId={taskId} config={createFamilyIntakeConfig('child_support')} existingAnswers={task.metadata?.guided_answers} />
    case 'child_support_evidence_vault':
      return <GuidedStep caseId={id} taskId={taskId} config={createEvidenceVaultConfig('child_support')} existingAnswers={task.metadata?.guided_answers} />
    case 'child_support_prepare_filing': {
      const { data: caseRow } = await supabase.from('cases').select('county, state').eq('id', id).single()
      const { data: familyDetails } = await supabase.from('family_case_details').select('*').eq('case_id', id).maybeSingle()
      return <FamilyLawWizard caseId={id} taskId={taskId} existingMetadata={task.metadata} familyDetails={familyDetails} caseData={{ county: caseRow?.county ?? null, state: caseRow?.state ?? undefined }} />
    }
    case 'child_support_file_with_court':
      return <GuidedStep caseId={id} taskId={taskId} config={createFamilyFileWithCourtConfig('child_support')} existingAnswers={task.metadata?.guided_answers} />
    case 'child_support_serve_respondent':
      return <GuidedStep caseId={id} taskId={taskId} config={createServeRespondentConfig('child_support')} existingAnswers={task.metadata?.guided_answers} />
    case 'child_support_temporary_orders':
      return <GuidedStep caseId={id} taskId={taskId} config={createTemporaryOrdersConfig('child_support')} existingAnswers={task.metadata?.guided_answers} skippable />
    case 'child_support_final_orders':
      return <GuidedStep caseId={id} taskId={taskId} config={createFinalOrdersConfig('child_support')} existingAnswers={task.metadata?.guided_answers} />

    // Family law — Visitation (9 tasks)
    case 'visitation_intake':
      return <GuidedStep caseId={id} taskId={taskId} config={createFamilyIntakeConfig('visitation')} existingAnswers={task.metadata?.guided_answers} />
    case 'visitation_safety_screening':
      return <SafetyScreeningStep caseId={id} taskId={taskId} />
    case 'visitation_evidence_vault':
      return <GuidedStep caseId={id} taskId={taskId} config={createEvidenceVaultConfig('visitation')} existingAnswers={task.metadata?.guided_answers} />
    case 'visitation_prepare_filing': {
      const { data: caseRow } = await supabase.from('cases').select('county, state').eq('id', id).single()
      const { data: familyDetails } = await supabase.from('family_case_details').select('*').eq('case_id', id).maybeSingle()
      return <FamilyLawWizard caseId={id} taskId={taskId} existingMetadata={task.metadata} familyDetails={familyDetails} caseData={{ county: caseRow?.county ?? null, state: caseRow?.state ?? undefined }} />
    }
    case 'visitation_file_with_court':
      return <GuidedStep caseId={id} taskId={taskId} config={createFamilyFileWithCourtConfig('visitation')} existingAnswers={task.metadata?.guided_answers} />
    case 'visitation_serve_respondent':
      return <GuidedStep caseId={id} taskId={taskId} config={createServeRespondentConfig('visitation')} existingAnswers={task.metadata?.guided_answers} />
    case 'visitation_mediation':
      return <GuidedStep caseId={id} taskId={taskId} config={createMediationConfig('visitation')} existingAnswers={task.metadata?.guided_answers} />
    case 'visitation_final_orders':
      return <GuidedStep caseId={id} taskId={taskId} config={createFinalOrdersConfig('visitation')} existingAnswers={task.metadata?.guided_answers} />

    // Family law — Spousal Support (8 tasks)
    case 'spousal_support_intake':
      return <GuidedStep caseId={id} taskId={taskId} config={createFamilyIntakeConfig('spousal_support')} existingAnswers={task.metadata?.guided_answers} />
    case 'spousal_support_evidence_vault':
      return <GuidedStep caseId={id} taskId={taskId} config={createEvidenceVaultConfig('spousal_support')} existingAnswers={task.metadata?.guided_answers} />
    case 'spousal_support_prepare_filing': {
      const { data: caseRow } = await supabase.from('cases').select('county, state').eq('id', id).single()
      const { data: familyDetails } = await supabase.from('family_case_details').select('*').eq('case_id', id).maybeSingle()
      return <FamilyLawWizard caseId={id} taskId={taskId} existingMetadata={task.metadata} familyDetails={familyDetails} caseData={{ county: caseRow?.county ?? null, state: caseRow?.state ?? undefined }} />
    }
    case 'spousal_support_file_with_court':
      return <GuidedStep caseId={id} taskId={taskId} config={createFamilyFileWithCourtConfig('spousal_support')} existingAnswers={task.metadata?.guided_answers} />
    case 'spousal_support_serve_respondent':
      return <GuidedStep caseId={id} taskId={taskId} config={createServeRespondentConfig('spousal_support')} existingAnswers={task.metadata?.guided_answers} />
    case 'spousal_support_temporary_orders':
      return <GuidedStep caseId={id} taskId={taskId} config={createTemporaryOrdersConfig('spousal_support')} existingAnswers={task.metadata?.guided_answers} skippable />
    case 'spousal_support_final_orders':
      return <GuidedStep caseId={id} taskId={taskId} config={createFinalOrdersConfig('spousal_support')} existingAnswers={task.metadata?.guided_answers} />

    // Family law — Protective Order (6 tasks)
    case 'po_intake':
      return <GuidedStep caseId={id} taskId={taskId} config={createFamilyIntakeConfig('protective_order')} existingAnswers={task.metadata?.guided_answers} />
    case 'po_safety_screening':
      return <SafetyScreeningStep caseId={id} taskId={taskId} isProtectiveOrder />
    case 'po_prepare_filing': {
      const { data: caseRow } = await supabase.from('cases').select('county, state').eq('id', id).single()
      const { data: familyDetails } = await supabase.from('family_case_details').select('*').eq('case_id', id).maybeSingle()
      return <FamilyLawWizard caseId={id} taskId={taskId} existingMetadata={task.metadata} familyDetails={familyDetails} caseData={{ county: caseRow?.county ?? null, state: caseRow?.state ?? undefined }} />
    }
    case 'po_file_with_court':
      return <GuidedStep caseId={id} taskId={taskId} config={createFamilyFileWithCourtConfig('protective_order')} existingAnswers={task.metadata?.guided_answers} />
    case 'po_hearing':
      return <GuidedStep caseId={id} taskId={taskId} config={poHearingConfig} existingAnswers={task.metadata?.guided_answers} />

    // Family law — Modification (9 tasks)
    case 'mod_intake':
      return <GuidedStep caseId={id} taskId={taskId} config={createFamilyIntakeConfig('modification')} existingAnswers={task.metadata?.guided_answers} />
    case 'mod_evidence_vault':
      return <GuidedStep caseId={id} taskId={taskId} config={createEvidenceVaultConfig('modification')} existingAnswers={task.metadata?.guided_answers} />
    case 'mod_existing_order_review':
      return <GuidedStep caseId={id} taskId={taskId} config={existingOrderReviewConfig} existingAnswers={task.metadata?.guided_answers} />
    case 'mod_prepare_filing': {
      const { data: caseRow } = await supabase.from('cases').select('county, state').eq('id', id).single()
      const { data: familyDetails } = await supabase.from('family_case_details').select('*').eq('case_id', id).maybeSingle()
      return <FamilyLawWizard caseId={id} taskId={taskId} existingMetadata={task.metadata} familyDetails={familyDetails} caseData={{ county: caseRow?.county ?? null, state: caseRow?.state ?? undefined }} />
    }
    case 'mod_file_with_court':
      return <GuidedStep caseId={id} taskId={taskId} config={createFamilyFileWithCourtConfig('modification')} existingAnswers={task.metadata?.guided_answers} />
    case 'mod_serve_respondent':
      return <GuidedStep caseId={id} taskId={taskId} config={createServeRespondentConfig('modification')} existingAnswers={task.metadata?.guided_answers} />
    case 'mod_mediation':
      return <GuidedStep caseId={id} taskId={taskId} config={createMediationConfig('modification')} existingAnswers={task.metadata?.guided_answers} skippable />
    case 'mod_final_orders':
      return <GuidedStep caseId={id} taskId={taskId} config={createFinalOrdersConfig('modification')} existingAnswers={task.metadata?.guided_answers} />

    // Family motions (filed from Motions page)
    case 'protective_order': {
      const config = MOTION_CONFIGS['protective_order']
      const { data: caseRow } = await supabase
        .from('cases')
        .select('court_type, county, role')
        .eq('id', id)
        .single()

      return (
        <MotionBuilder
          config={config}
          caseId={id}
          taskId={taskId}
          existingMetadata={task.metadata}
          caseData={caseRow ?? undefined}
        />
      )
    }
    case 'motion_to_modify': {
      const config = MOTION_CONFIGS['motion_to_modify']
      const { data: caseRow } = await supabase
        .from('cases')
        .select('court_type, county, role')
        .eq('id', id)
        .single()

      return (
        <MotionBuilder
          config={config}
          caseId={id}
          taskId={taskId}
          existingMetadata={task.metadata}
          caseData={caseRow ?? undefined}
        />
      )
    }
    case 'motion_for_enforcement': {
      const config = MOTION_CONFIGS['motion_for_enforcement']
      const { data: caseRow } = await supabase
        .from('cases')
        .select('court_type, county, role')
        .eq('id', id)
        .single()

      return (
        <MotionBuilder
          config={config}
          caseId={id}
          taskId={taskId}
          existingMetadata={task.metadata}
          caseData={caseRow ?? undefined}
        />
      )
    }
    case 'motion_for_mediation': {
      const config = MOTION_CONFIGS['motion_for_mediation']
      const { data: caseRow } = await supabase
        .from('cases')
        .select('court_type, county, role')
        .eq('id', id)
        .single()

      return (
        <MotionBuilder
          config={config}
          caseId={id}
          taskId={taskId}
          existingMetadata={task.metadata}
          caseData={caseRow ?? undefined}
        />
      )
    }
    // Small claims task chain steps
    case 'small_claims_intake':
      return (
        <SmallClaimsIntakeStep
          caseId={id}
          taskId={taskId}
          existingMetadata={task.metadata}
        />
      )
    case 'sc_demand_letter': {
      const { data: caseRow } = await supabase
        .from('cases').select('county').eq('id', id).single()
      const { data: claimDetails } = await supabase
        .from('small_claims_details').select('*').eq('case_id', id).maybeSingle()
      return (
        <DemandLetterStep
          caseId={id}
          taskId={taskId}
          existingMetadata={task.metadata}
          claimDetails={claimDetails}
          caseData={{ county: caseRow?.county ?? null }}
          skippable
        />
      )
    }
    case 'prepare_small_claims_filing': {
      const { data: caseRow } = await supabase
        .from('cases').select('county, state').eq('id', id).single()
      const { data: claimDetails } = await supabase
        .from('small_claims_details').select('*').eq('case_id', id).maybeSingle()
      return (
        <SmallClaimsWizard
          caseId={id}
          taskId={taskId}
          existingMetadata={task.metadata}
          claimDetails={claimDetails}
          caseData={{ county: caseRow?.county ?? null, state: caseRow?.state ?? undefined }}
        />
      )
    }
    case 'sc_evidence_vault':
      return <GuidedStep caseId={id} taskId={taskId} config={scEvidenceVaultConfig} existingAnswers={task.metadata?.guided_answers} />
    case 'sc_file_with_court':
      return <GuidedStep caseId={id} taskId={taskId} config={scFileWithCourtConfig} existingAnswers={task.metadata?.guided_answers} />
    case 'sc_serve_defendant':
      return <ServeDefendantStep caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'sc_prepare_for_hearing':
      return <PrepareForHearingStep caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'sc_hearing_day':
      return <HearingDayStep caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />

    // Landlord-tenant task chain steps
    case 'landlord_tenant_intake':
      return (
        <LtIntakeStep
          caseId={id}
          taskId={taskId}
          existingMetadata={task.metadata}
        />
      )
    case 'prepare_lt_demand_letter': {
      const { data: caseRow } = await supabase
        .from('cases').select('county').eq('id', id).single()
      const { data: ltDetails } = await supabase
        .from('landlord_tenant_details').select('*').eq('case_id', id).maybeSingle()
      return (
        <LtDemandLetterStep
          caseId={id}
          taskId={taskId}
          existingMetadata={task.metadata}
          landlordTenantDetails={ltDetails}
          caseData={{ county: caseRow?.county ?? null }}
          skippable
        />
      )
    }
    case 'lt_negotiation':
      return <GuidedStep caseId={id} taskId={taskId} config={ltNegotiationConfig} existingAnswers={task.metadata?.guided_answers} skippable />
    case 'prepare_landlord_tenant_filing': {
      const { data: caseRow } = await supabase
        .from('cases').select('county, court_type, state').eq('id', id).single()
      const { data: ltDetails } = await supabase
        .from('landlord_tenant_details').select('*').eq('case_id', id).maybeSingle()
      return (
        <LandlordTenantWizard
          caseId={id}
          taskId={taskId}
          existingMetadata={task.metadata}
          landlordTenantDetails={ltDetails}
          caseData={{ county: caseRow?.county ?? null, court_type: caseRow?.court_type ?? 'jp', state: caseRow?.state ?? undefined }}
        />
      )
    }
    case 'lt_file_with_court':
      return <GuidedStep caseId={id} taskId={taskId} config={ltFileWithCourtConfig} existingAnswers={task.metadata?.guided_answers} />
    case 'serve_other_party':
      return <ServeOtherPartyStep caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'lt_wait_for_response':
      return <GuidedStep caseId={id} taskId={taskId} config={ltWaitForResponseConfig} existingAnswers={task.metadata?.guided_answers} />
    case 'lt_review_response':
      return <GuidedStep caseId={id} taskId={taskId} config={ltReviewResponseConfig} existingAnswers={task.metadata?.guided_answers} />
    case 'lt_discovery':
      return <GuidedStep caseId={id} taskId={taskId} config={ltDiscoveryConfig} existingAnswers={task.metadata?.guided_answers} />
    case 'lt_prepare_for_hearing':
      return <GuidedStep caseId={id} taskId={taskId} config={ltHearingPrepConfig} existingAnswers={task.metadata?.guided_answers} />
    case 'lt_mediation':
      return <GuidedStep caseId={id} taskId={taskId} config={ltMediationConfig} existingAnswers={task.metadata?.guided_answers} skippable />
    case 'lt_hearing_day':
      return <GuidedStep caseId={id} taskId={taskId} config={ltHearingDayConfig} existingAnswers={task.metadata?.guided_answers} />
    case 'lt_post_judgment':
      return <GuidedStep caseId={id} taskId={taskId} config={postJudgmentConfig} existingAnswers={task.metadata?.guided_answers} />
    // Contract dispute depth steps
    case 'contract_breach_analysis':
      return <GuidedStep caseId={id} taskId={taskId} config={contractBreachAnalysisConfig} existingAnswers={task.metadata?.guided_answers} />
    case 'contract_statute_of_frauds':
      return <GuidedStep caseId={id} taskId={taskId} config={contractStatuteOfFraudsConfig} existingAnswers={task.metadata?.guided_answers} />
    case 'contract_damages_methods':
      return <GuidedStep caseId={id} taskId={taskId} config={contractDamagesMethodsConfig} existingAnswers={task.metadata?.guided_answers} />
    case 'contract_provisions_check':
      return <GuidedStep caseId={id} taskId={taskId} config={contractProvisionsCheckConfig} existingAnswers={task.metadata?.guided_answers} />
    case 'contract_defenses_guide':
      return <GuidedStep caseId={id} taskId={taskId} config={contractDefensesGuideConfig} existingAnswers={task.metadata?.guided_answers} skippable />
    case 'contract_filing_guide':
      return <GuidedStep caseId={id} taskId={taskId} config={contractFilingGuideConfig} existingAnswers={task.metadata?.guided_answers} />
    case 'contract_service_guide':
      return <GuidedStep caseId={id} taskId={taskId} config={contractServiceGuideConfig} existingAnswers={task.metadata?.guided_answers} />
    case 'contract_courtroom_guide':
      return <GuidedStep caseId={id} taskId={taskId} config={contractCourtroomGuideConfig} existingAnswers={task.metadata?.guided_answers} />
    case 'contract_settlement_guide':
      return <GuidedStep caseId={id} taskId={taskId} config={contractSettlementGuideConfig} existingAnswers={task.metadata?.guided_answers} skippable />
    case 'contract_post_judgment_guide':
      return <GuidedStep caseId={id} taskId={taskId} config={contractPostJudgmentGuideConfig} existingAnswers={task.metadata?.guided_answers} />

    // Property damage depth steps
    case 'property_damage_assessment':
      return <GuidedStep caseId={id} taskId={taskId} config={propertyDamageAssessmentConfig} existingAnswers={task.metadata?.guided_answers} />
    case 'property_insurance_guide':
      return <GuidedStep caseId={id} taskId={taskId} config={propertyInsuranceGuideConfig} existingAnswers={task.metadata?.guided_answers} skippable />
    case 'property_filing_guide':
      return <GuidedStep caseId={id} taskId={taskId} config={propertyFilingGuideConfig} existingAnswers={task.metadata?.guided_answers} />
    case 'property_service_guide':
      return <GuidedStep caseId={id} taskId={taskId} config={propertyServiceGuideConfig} existingAnswers={task.metadata?.guided_answers} />
    case 'property_courtroom_guide':
      return <GuidedStep caseId={id} taskId={taskId} config={propertyCourtroomGuideConfig} existingAnswers={task.metadata?.guided_answers} />
    case 'property_mediation_guide':
      return <GuidedStep caseId={id} taskId={taskId} config={propertyMediationGuideConfig} existingAnswers={task.metadata?.guided_answers} skippable />
    case 'property_pretrial_motions':
      return <GuidedStep caseId={id} taskId={taskId} config={propertyPretrialMotionsConfig} existingAnswers={task.metadata?.guided_answers} skippable />
    case 'property_damages_guide':
      return <GuidedStep caseId={id} taskId={taskId} config={propertyDamagesGuideConfig} existingAnswers={task.metadata?.guided_answers} />
    case 'property_post_judgment_guide':
      return <GuidedStep caseId={id} taskId={taskId} config={propertyPostJudgmentGuideConfig} existingAnswers={task.metadata?.guided_answers} />

    // Personal injury depth steps
    case 'pi_damages_calculation':
      return <GuidedStep caseId={id} taskId={taskId} config={piDamagesCalculationConfig} existingAnswers={task.metadata?.guided_answers} />
    case 'pi_pip_claim':
      return <GuidedStep caseId={id} taskId={taskId} config={piPipClaimConfig} existingAnswers={task.metadata?.guided_answers} skippable />
    case 'pi_medical_improvement':
      return <GuidedStep caseId={id} taskId={taskId} config={piMedicalImprovementConfig} existingAnswers={task.metadata?.guided_answers} />
    case 'pi_filing_guide':
      return <GuidedStep caseId={id} taskId={taskId} config={piFilingGuideConfig} existingAnswers={task.metadata?.guided_answers} />
    case 'pi_service_guide':
      return <GuidedStep caseId={id} taskId={taskId} config={piServiceGuideConfig} existingAnswers={task.metadata?.guided_answers} />
    case 'pi_courtroom_guide':
      return <GuidedStep caseId={id} taskId={taskId} config={piCourtroomGuideConfig} existingAnswers={task.metadata?.guided_answers} />
    case 'pi_comparative_fault':
      return <GuidedStep caseId={id} taskId={taskId} config={piComparativeFaultConfig} existingAnswers={task.metadata?.guided_answers} skippable />
    case 'pi_lien_resolution':
      return <GuidedStep caseId={id} taskId={taskId} config={piLienResolutionConfig} existingAnswers={task.metadata?.guided_answers} skippable />
    case 'pi_expert_witness_guide':
      return <GuidedStep caseId={id} taskId={taskId} config={piExpertWitnessGuideConfig} existingAnswers={task.metadata?.guided_answers} skippable />

    // Landlord-tenant depth steps
    case 'lt_repair_request':
      return <GuidedStep caseId={id} taskId={taskId} config={ltRepairRequestConfig} existingAnswers={task.metadata?.guided_answers} skippable />
    case 'lt_eviction_response':
      return <GuidedStep caseId={id} taskId={taskId} config={ltEvictionResponseConfig} existingAnswers={task.metadata?.guided_answers} skippable />
    case 'lt_habitability_checklist':
      return <GuidedStep caseId={id} taskId={taskId} config={ltHabitabilityChecklistConfig} existingAnswers={task.metadata?.guided_answers} skippable />
    case 'lt_security_deposit_demand':
      return <GuidedStep caseId={id} taskId={taskId} config={ltSecurityDepositDemandConfig} existingAnswers={task.metadata?.guided_answers} />
    case 'lt_repair_and_deduct':
      return <GuidedStep caseId={id} taskId={taskId} config={ltRepairAndDeductConfig} existingAnswers={task.metadata?.guided_answers} skippable />
    case 'lt_illegal_lockout':
      return <GuidedStep caseId={id} taskId={taskId} config={ltIllegalLockoutDefenseConfig} existingAnswers={task.metadata?.guided_answers} skippable />
    case 'lt_eviction_notice_analysis':
      return <GuidedStep caseId={id} taskId={taskId} config={ltEvictionNoticeAnalysisConfig} existingAnswers={task.metadata?.guided_answers} />
    case 'lt_jp_court_procedures':
      return <GuidedStep caseId={id} taskId={taskId} config={ltJpCourtProceduresConfig} existingAnswers={task.metadata?.guided_answers} />
    case 'lt_appeal_guide':
      return <GuidedStep caseId={id} taskId={taskId} config={ltAppealGuideConfig} existingAnswers={task.metadata?.guided_answers} skippable />
    case 'lt_courtroom_guide':
      return <GuidedStep caseId={id} taskId={taskId} config={ltCourtroomGuideDeepConfig} existingAnswers={task.metadata?.guided_answers} />
    case 'lt_lease_termination':
      return <GuidedStep caseId={id} taskId={taskId} config={ltLeaseTerminationGuideConfig} existingAnswers={task.metadata?.guided_answers} skippable />
    case 'lt_writ_of_possession':
      return <GuidedStep caseId={id} taskId={taskId} config={ltWritOfPossessionConfig} existingAnswers={task.metadata?.guided_answers} skippable />

    // Family law depth steps
    case 'family_filing_guide':
      return <GuidedStep caseId={id} taskId={taskId} config={familyFilingGuideConfig} existingAnswers={task.metadata?.guided_answers} />
    case 'family_service_guide':
      return <GuidedStep caseId={id} taskId={taskId} config={familyServiceGuideConfig} existingAnswers={task.metadata?.guided_answers} />
    case 'family_courtroom_guide':
      return <GuidedStep caseId={id} taskId={taskId} config={familyCourtroomGuideConfig} existingAnswers={task.metadata?.guided_answers} />
    case 'family_mediation_prep':
      return <GuidedStep caseId={id} taskId={taskId} config={familyMediationPrepConfig} existingAnswers={task.metadata?.guided_answers} />
    case 'family_post_judgment_guide':
      return <GuidedStep caseId={id} taskId={taskId} config={familyPostJudgmentGuideConfig} existingAnswers={task.metadata?.guided_answers} />
    case 'family_discovery_guide':
      return <GuidedStep caseId={id} taskId={taskId} config={familyDiscoveryGuideConfig} existingAnswers={task.metadata?.guided_answers} skippable />
    case 'family_temp_orders_prep':
      return <GuidedStep caseId={id} taskId={taskId} config={familyTempOrdersPrepConfig} existingAnswers={task.metadata?.guided_answers} skippable />
    case 'family_property_division_guide':
      return <GuidedStep caseId={id} taskId={taskId} config={familyPropertyDivisionGuideConfig} existingAnswers={task.metadata?.guided_answers} skippable />
    case 'family_custody_factors':
      return <GuidedStep caseId={id} taskId={taskId} config={familyCustodyFactorsConfig} existingAnswers={task.metadata?.guided_answers} skippable />
    case 'family_uncontested_path':
      return <GuidedStep caseId={id} taskId={taskId} config={familyUncontestedPathConfig} existingAnswers={task.metadata?.guided_answers} skippable />

    // Debt defense task chain steps
    case 'debt_defense_intake':
      return (
        <DebtDefenseIntakeStep
          caseId={id}
          taskId={taskId}
          existingMetadata={task.metadata}
        />
      )
    case 'prepare_debt_validation_letter': {
      const { data: caseRow } = await supabase
        .from('cases').select('county').eq('id', id).single()
      const { data: debtDetails } = await supabase
        .from('debt_defense_details').select('*').eq('case_id', id).maybeSingle()
      return (
        <DebtValidationLetterStep
          caseId={id}
          taskId={taskId}
          existingMetadata={task.metadata}
          debtDefenseDetails={debtDetails}
          caseData={{ county: caseRow?.county ?? null }}
        />
      )
    }
    case 'prepare_debt_defense_answer': {
      const { data: caseRow } = await supabase
        .from('cases').select('county, court_type, state').eq('id', id).single()
      const { data: debtDetails } = await supabase
        .from('debt_defense_details').select('*').eq('case_id', id).maybeSingle()
      return (
        <DebtDefenseWizard
          caseId={id}
          taskId={taskId}
          existingMetadata={task.metadata}
          debtDefenseDetails={debtDetails}
          caseData={{ county: caseRow?.county ?? null, court_type: caseRow?.court_type ?? 'jp', state: caseRow?.state ?? undefined }}
        />
      )
    }
    case 'debt_file_with_court':
      return <DebtFileWithCourtStep caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'serve_plaintiff':
      return <ServePlaintiffStep caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    // Debt defense depth steps
    case 'fdcpa_check':
      return <GuidedStep caseId={id} taskId={taskId} config={fdcpaCheckConfig} existingAnswers={task.metadata?.guided_answers} skippable />
    case 'debt_sol_check':
      return <GuidedStep caseId={id} taskId={taskId} config={debtSolCheckConfig} existingAnswers={task.metadata?.guided_answers} skippable />
    case 'debt_answer_prep':
      return <GuidedStep caseId={id} taskId={taskId} config={debtAnswerPrepConfig} existingAnswers={task.metadata?.guided_answers} skippable />
    case 'debt_filing_guide':
      return <GuidedStep caseId={id} taskId={taskId} config={debtFilingGuideConfig} existingAnswers={task.metadata?.guided_answers} />
    case 'debt_service_guide':
      return <GuidedStep caseId={id} taskId={taskId} config={debtServiceGuideConfig} existingAnswers={task.metadata?.guided_answers} />
    case 'debt_courtroom_guide':
      return <GuidedStep caseId={id} taskId={taskId} config={debtCourtroomGuideConfig} existingAnswers={task.metadata?.guided_answers} />
    case 'debt_post_judgment_guide':
      return <GuidedStep caseId={id} taskId={taskId} config={debtPostJudgmentGuideConfig} existingAnswers={task.metadata?.guided_answers} />
    case 'fdcpa_counterclaim_guide':
      return <GuidedStep caseId={id} taskId={taskId} config={fdcpaCounterclaimGuideConfig} existingAnswers={task.metadata?.guided_answers} skippable />
    case 'debt_motion_to_dismiss':
      return <GuidedStep caseId={id} taskId={taskId} config={debtMotionToDismissConfig} existingAnswers={task.metadata?.guided_answers} skippable />
    case 'debt_default_recovery':
      return <GuidedStep caseId={id} taskId={taskId} config={debtDefaultJudgmentRecoveryConfig} existingAnswers={task.metadata?.guided_answers} skippable />
    case 'debt_settlement_guide':
      return <GuidedStep caseId={id} taskId={taskId} config={debtSettlementGuideConfig} existingAnswers={task.metadata?.guided_answers} skippable />
    case 'debt_validation_response':
      return <GuidedStep caseId={id} taskId={taskId} config={debtValidationResponseGuideConfig} existingAnswers={task.metadata?.guided_answers} skippable />
    case 'debt_evidence_rules':
      return <GuidedStep caseId={id} taskId={taskId} config={debtEvidenceRulesConfig} existingAnswers={task.metadata?.guided_answers} skippable />
    case 'debt_continuance_request':
      return <GuidedStep caseId={id} taskId={taskId} config={debtContinuanceRequestConfig} existingAnswers={task.metadata?.guided_answers} skippable />
    case 'debt_witness_prep':
      return <GuidedStep caseId={id} taskId={taskId} config={debtWitnessPrepConfig} existingAnswers={task.metadata?.guided_answers} skippable />
    case 'debt_credit_dispute':
      return <GuidedStep caseId={id} taskId={taskId} config={debtCreditDisputeGuideConfig} existingAnswers={task.metadata?.guided_answers} skippable />
    case 'debt_hearing_prep':
      return <DebtHearingPrepStep caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'debt_hearing_day':
      return <DebtHearingDayStep caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'debt_post_judgment':
      return <DebtPostJudgmentStep caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />

    // Personal injury task chain steps
    case 'pi_intake': {
      const { data: piDetails } = await supabase
        .from('personal_injury_details').select('pi_sub_type').eq('case_id', id).maybeSingle()
      return (
        <PIIntakeStep
          caseId={id}
          taskId={taskId}
          existingMetadata={task.metadata}
          piSubType={piDetails?.pi_sub_type ?? undefined}
        />
      )
    }
    case 'pi_medical_records': {
      const { data: piDetails } = await supabase
        .from('personal_injury_details').select('pi_sub_type').eq('case_id', id).maybeSingle()
      return <PIMedicalRecordsStep caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} piSubType={piDetails?.pi_sub_type ?? undefined} />
    }
    case 'pi_insurance_communication': {
      const { data: piDetails } = await supabase
        .from('personal_injury_details').select('pi_sub_type').eq('case_id', id).maybeSingle()
      return <PIInsuranceCommunicationStep caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} piSubType={piDetails?.pi_sub_type ?? undefined} />
    }
    case 'prepare_pi_demand_letter': {
      const { data: caseRow } = await supabase
        .from('cases').select('county').eq('id', id).single()
      const { data: piDetails } = await supabase
        .from('personal_injury_details').select('*').eq('case_id', id).maybeSingle()
      return (
        <PIDemandLetterStep
          caseId={id}
          taskId={taskId}
          existingMetadata={task.metadata}
          personalInjuryDetails={piDetails}
          caseData={{ county: caseRow?.county ?? null }}
          skippable
        />
      )
    }
    case 'pi_settlement_negotiation': {
      const { data: piDetails } = await supabase
        .from('personal_injury_details').select('pi_sub_type').eq('case_id', id).maybeSingle()
      return <PISettlementNegotiationStep caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} piSubType={piDetails?.pi_sub_type ?? undefined} skippable />
    }
    case 'prepare_pi_petition': {
      const { data: caseRow } = await supabase
        .from('cases').select('county, court_type, state').eq('id', id).single()
      const { data: piDetails } = await supabase
        .from('personal_injury_details').select('*').eq('case_id', id).maybeSingle()
      return (
        <PersonalInjuryWizard
          caseId={id}
          taskId={taskId}
          existingMetadata={task.metadata}
          personalInjuryDetails={piDetails}
          caseData={{ county: caseRow?.county ?? null, court_type: caseRow?.court_type ?? 'county', state: caseRow?.state ?? undefined }}
        />
      )
    }
    case 'pi_file_with_court': {
      const { data: caseRow } = await supabase
        .from('cases')
        .select('state, court_type, county')
        .eq('id', id)
        .single()
      return (
        <PIFileWithCourtStep
          caseId={id}
          taskId={taskId}
          existingAnswers={task.metadata?.guided_answers}
          caseData={caseRow ?? undefined}
        />
      )
    }
    case 'pi_serve_defendant':
      return <PIServeDefendantStep caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'pi_wait_for_answer':
      return <PIWaitForAnswerStep caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'pi_review_answer':
      return <PIReviewAnswerStep caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'pi_discovery_prep':
      return <PIDiscoveryPrepStep caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'pi_discovery_responses':
      return <PIDiscoveryResponsesStep caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'pi_scheduling_conference':
      return <PISchedulingConferenceStep caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'pi_pretrial_motions':
      return <PIPretrialMotionsStep caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'pi_mediation':
      return <PIMediationStep caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'pi_trial_prep':
      return <PITrialPrepStep caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'pi_post_resolution': {
      const { data: piDetails } = await supabase
        .from('personal_injury_details').select('pi_sub_type').eq('case_id', id).maybeSingle()
      return <PIPostResolutionStep caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} piSubType={piDetails?.pi_sub_type ?? undefined} />
    }

    // Contract dispute task chain steps
    case 'contract_intake':
      return (
        <ContractIntakeStep
          caseId={id}
          taskId={taskId}
          existingMetadata={task.metadata}
        />
      )
    case 'contract_demand_letter':
      return <GuidedStep caseId={id} taskId={taskId} config={contractDemandLetterConfig} existingAnswers={task.metadata?.guided_answers} skippable />
    case 'contract_negotiation':
      return <GuidedStep caseId={id} taskId={taskId} config={contractNegotiationConfig} existingAnswers={task.metadata?.guided_answers} skippable />
    case 'contract_prepare_filing': {
      const { data: caseRow } = await supabase
        .from('cases').select('county, court_type, state').eq('id', id).single()
      const { data: contractDetails } = await supabase
        .from('contract_details').select('*').eq('case_id', id).maybeSingle()
      return (
        <ContractWizard
          caseId={id}
          taskId={taskId}
          existingMetadata={task.metadata}
          contractDetails={contractDetails}
          caseData={{ county: caseRow?.county ?? null, court_type: caseRow?.court_type ?? 'county', state: caseRow?.state ?? undefined }}
        />
      )
    }
    case 'contract_file_with_court':
      return <GuidedStep caseId={id} taskId={taskId} config={contractFileWithCourtConfig} existingAnswers={task.metadata?.guided_answers} />
    case 'contract_serve_defendant':
      return <GuidedStep caseId={id} taskId={taskId} config={contractServeDefendantConfig} existingAnswers={task.metadata?.guided_answers} />
    case 'contract_wait_for_answer':
      return <GuidedStep caseId={id} taskId={taskId} config={contractWaitForAnswerConfig} existingAnswers={task.metadata?.guided_answers} />
    case 'contract_review_answer':
      return <GuidedStep caseId={id} taskId={taskId} config={contractReviewAnswerConfig} existingAnswers={task.metadata?.guided_answers} />
    case 'contract_discovery':
      return <GuidedStep caseId={id} taskId={taskId} config={contractDiscoveryConfig} existingAnswers={task.metadata?.guided_answers} />
    case 'contract_mediation':
      return <GuidedStep caseId={id} taskId={taskId} config={contractMediationConfig} existingAnswers={task.metadata?.guided_answers} skippable />
    case 'contract_post_resolution':
      return <GuidedStep caseId={id} taskId={taskId} config={contractPostResolutionConfig} existingAnswers={task.metadata?.guided_answers} />

    // Property dispute task chain steps
    case 'property_intake':
      return (
        <PropertyIntakeStep
          caseId={id}
          taskId={taskId}
          existingMetadata={task.metadata}
        />
      )
    case 'property_demand_letter':
      return <GuidedStep caseId={id} taskId={taskId} config={propertyDemandLetterConfig} existingAnswers={task.metadata?.guided_answers} skippable />
    case 'property_negotiation':
      return <GuidedStep caseId={id} taskId={taskId} config={propertyNegotiationConfig} existingAnswers={task.metadata?.guided_answers} skippable />
    case 'property_prepare_filing': {
      const { data: caseRow } = await supabase
        .from('cases').select('county, court_type, state').eq('id', id).single()
      const { data: propertyDetails } = await supabase
        .from('property_dispute_details').select('*').eq('case_id', id).maybeSingle()
      return (
        <PropertyWizard
          caseId={id}
          taskId={taskId}
          existingMetadata={task.metadata}
          propertyDetails={propertyDetails}
          caseData={{ county: caseRow?.county ?? null, court_type: caseRow?.court_type ?? 'county', state: caseRow?.state ?? undefined }}
        />
      )
    }
    case 'property_file_with_court':
      return <GuidedStep caseId={id} taskId={taskId} config={propertyFileWithCourtConfig} existingAnswers={task.metadata?.guided_answers} />
    case 'property_serve_defendant':
      return <GuidedStep caseId={id} taskId={taskId} config={propertyServeDefendantConfig} existingAnswers={task.metadata?.guided_answers} />
    case 'property_wait_for_answer':
      return <GuidedStep caseId={id} taskId={taskId} config={propertyWaitForAnswerConfig} existingAnswers={task.metadata?.guided_answers} />
    case 'property_review_answer':
      return <GuidedStep caseId={id} taskId={taskId} config={propertyReviewAnswerConfig} existingAnswers={task.metadata?.guided_answers} />
    case 'property_discovery':
      return <GuidedStep caseId={id} taskId={taskId} config={propertyDiscoveryConfig} existingAnswers={task.metadata?.guided_answers} />
    case 'property_post_resolution':
      return <GuidedStep caseId={id} taskId={taskId} config={propertyPostResolutionConfig} existingAnswers={task.metadata?.guided_answers} />

    // Real estate dispute task chain steps
    case 're_intake':
      return (
        <REIntakeStep
          caseId={id}
          taskId={taskId}
          existingMetadata={task.metadata}
        />
      )
    case 're_evidence_vault':
      return <GuidedStep caseId={id} taskId={taskId} config={reEvidenceVaultConfig} existingAnswers={task.metadata?.guided_answers} />
    case 're_demand_letter':
      return <GuidedStep caseId={id} taskId={taskId} config={reDemandLetterConfig} existingAnswers={task.metadata?.guided_answers} skippable />
    case 're_negotiation':
      return <GuidedStep caseId={id} taskId={taskId} config={reNegotiationConfig} existingAnswers={task.metadata?.guided_answers} skippable />
    case 're_prepare_filing': {
      const { data: caseRow } = await supabase
        .from('cases').select('court_type, county, state').eq('id', id).single()
      const { data: reIntakeTask } = await supabase
        .from('tasks').select('metadata').eq('case_id', id).eq('task_key', 're_intake').maybeSingle()
      const reIntakeMeta = reIntakeTask?.metadata as Record<string, unknown> | null

      return (
        <RealEstateWizard
          caseId={id}
          taskId={taskId}
          existingMetadata={task.metadata}
          reDetails={reIntakeMeta ? {
            property_address: (reIntakeMeta.property_address as string) ?? null,
            property_type: (reIntakeMeta.property_type as string) ?? null,
            purchase_price: (reIntakeMeta.purchase_price as number) ?? null,
            other_party_name: (reIntakeMeta.other_party_name as string) ?? null,
            other_party_role: (reIntakeMeta.other_party_role as string) ?? null,
            dispute_description: (reIntakeMeta.dispute_description as string) ?? null,
            damages_sought: (reIntakeMeta.damages_sought as number) ?? null,
            transaction_date: (reIntakeMeta.transaction_date as string) ?? null,
            has_purchase_agreement: (reIntakeMeta.has_purchase_agreement as boolean) ?? false,
            has_title_insurance: (reIntakeMeta.has_title_insurance as boolean) ?? false,
            has_inspection_report: (reIntakeMeta.has_inspection_report as boolean) ?? false,
          } : null}
          caseData={{ county: caseRow?.county ?? null, court_type: caseRow?.court_type ?? 'district', state: caseRow?.state ?? undefined }}
        />
      )
    }
    case 're_file_with_court':
      return <GuidedStep caseId={id} taskId={taskId} config={reFileWithCourtConfig} existingAnswers={task.metadata?.guided_answers} />
    case 're_serve_defendant':
      return <GuidedStep caseId={id} taskId={taskId} config={reServeDefendantConfig} existingAnswers={task.metadata?.guided_answers} />
    case 're_wait_for_answer':
      return <GuidedStep caseId={id} taskId={taskId} config={reWaitForAnswerConfig} existingAnswers={task.metadata?.guided_answers} />
    case 're_review_answer':
      return <GuidedStep caseId={id} taskId={taskId} config={reReviewAnswerConfig} existingAnswers={task.metadata?.guided_answers} />
    case 're_discovery':
      return <GuidedStep caseId={id} taskId={taskId} config={reDiscoveryConfig} existingAnswers={task.metadata?.guided_answers} />
    case 're_post_resolution':
      return <GuidedStep caseId={id} taskId={taskId} config={rePostResolutionConfig} existingAnswers={task.metadata?.guided_answers} />

    // Business: Partnership dispute task chain steps
    case 'biz_partnership_intake':
      return (
        <BizPartnershipIntakeStep
          caseId={id}
          taskId={taskId}
          existingMetadata={task.metadata}
        />
      )
    case 'biz_partnership_evidence':
      return <GuidedStep caseId={id} taskId={taskId} config={bizPartnershipEvidenceConfig} existingAnswers={task.metadata?.guided_answers} />
    case 'biz_partnership_demand_letter':
      return <GuidedStep caseId={id} taskId={taskId} config={bizPartnershipDemandLetterConfig} existingAnswers={task.metadata?.guided_answers} skippable />
    case 'biz_partnership_adr':
      return <GuidedStep caseId={id} taskId={taskId} config={bizPartnershipAdrConfig} existingAnswers={task.metadata?.guided_answers} skippable />
    case 'biz_partnership_prepare_filing': {
      const { data: caseRow } = await supabase
        .from('cases').select('county, court_type, state').eq('id', id).single()
      const { data: bizIntakeTask } = await supabase
        .from('tasks').select('metadata').eq('case_id', id).eq('task_key', 'biz_partnership_intake').maybeSingle()
      const bizIntakeMeta = bizIntakeTask?.metadata as Record<string, unknown> | null
      return (
        <BusinessWizard
          caseId={id}
          taskId={taskId}
          existingMetadata={task.metadata}
          businessDetails={{
            business_sub_type: 'partnership',
            specific_dispute_type: bizIntakeMeta?.specific_dispute_type as string | undefined,
            business_name: bizIntakeMeta?.business_name as string | undefined,
            other_party_name: bizIntakeMeta?.partner_names as string | undefined,
            dispute_description: bizIntakeMeta?.dispute_description as string | undefined,
            damages_sought: bizIntakeMeta?.damages_sought as number | undefined,
          }}
          caseData={{ county: caseRow?.county ?? null, court_type: caseRow?.court_type ?? null, state: caseRow?.state ?? undefined }}
        />
      )
    }
    case 'biz_partnership_file_with_court':
      return <GuidedStep caseId={id} taskId={taskId} config={bizPartnershipFileWithCourtConfig} existingAnswers={task.metadata?.guided_answers} />
    case 'biz_partnership_serve_defendant':
      return <GuidedStep caseId={id} taskId={taskId} config={bizPartnershipServeDefendantConfig} existingAnswers={task.metadata?.guided_answers} />
    case 'biz_partnership_wait_for_answer':
      return <GuidedStep caseId={id} taskId={taskId} config={bizPartnershipWaitForAnswerConfig} existingAnswers={task.metadata?.guided_answers} />
    case 'biz_partnership_discovery':
      return <GuidedStep caseId={id} taskId={taskId} config={bizPartnershipDiscoveryConfig} existingAnswers={task.metadata?.guided_answers} />
    case 'biz_partnership_post_resolution':
      return <GuidedStep caseId={id} taskId={taskId} config={bizPartnershipPostResolutionConfig} existingAnswers={task.metadata?.guided_answers} />

    // Business: Employment dispute task chain steps
    case 'biz_employment_intake':
      return (
        <BizEmploymentIntakeStep
          caseId={id}
          taskId={taskId}
          existingMetadata={task.metadata}
        />
      )
    case 'biz_employment_evidence':
      return <GuidedStep caseId={id} taskId={taskId} config={bizEmploymentEvidenceConfig} existingAnswers={task.metadata?.guided_answers} />
    case 'biz_employment_demand_letter':
      return <GuidedStep caseId={id} taskId={taskId} config={bizEmploymentDemandLetterConfig} existingAnswers={task.metadata?.guided_answers} skippable />
    case 'biz_employment_eeoc': {
      const { data: empIntakeTask } = await supabase
        .from('tasks').select('metadata').eq('case_id', id).eq('task_key', 'biz_employment_intake').maybeSingle()
      const empIntakeMeta = empIntakeTask?.metadata as Record<string, unknown> | null
      const isDiscrimination = empIntakeMeta?.specific_dispute_type === 'discrimination_harassment'
      return <GuidedStep caseId={id} taskId={taskId} config={bizEmploymentEeocConfig} existingAnswers={task.metadata?.guided_answers} skippable={!isDiscrimination} />
    }
    case 'biz_employment_prepare_filing': {
      const { data: caseRow } = await supabase
        .from('cases').select('county, court_type, state').eq('id', id).single()
      const { data: bizIntakeTask } = await supabase
        .from('tasks').select('metadata').eq('case_id', id).eq('task_key', 'biz_employment_intake').maybeSingle()
      const bizIntakeMeta = bizIntakeTask?.metadata as Record<string, unknown> | null
      return (
        <BusinessWizard
          caseId={id}
          taskId={taskId}
          existingMetadata={task.metadata}
          businessDetails={{
            business_sub_type: 'employment',
            specific_dispute_type: bizIntakeMeta?.specific_dispute_type as string | undefined,
            other_party_name: bizIntakeMeta?.employer_name as string | undefined,
            dispute_description: bizIntakeMeta?.dispute_description as string | undefined,
            damages_sought: bizIntakeMeta?.damages_sought as number | undefined,
          }}
          caseData={{ county: caseRow?.county ?? null, court_type: caseRow?.court_type ?? null, state: caseRow?.state ?? undefined }}
        />
      )
    }
    case 'biz_employment_file_with_court':
      return <GuidedStep caseId={id} taskId={taskId} config={bizEmploymentFileWithCourtConfig} existingAnswers={task.metadata?.guided_answers} />
    case 'biz_employment_serve_defendant':
      return <GuidedStep caseId={id} taskId={taskId} config={bizEmploymentServeDefendantConfig} existingAnswers={task.metadata?.guided_answers} />
    case 'biz_employment_wait_for_answer':
      return <GuidedStep caseId={id} taskId={taskId} config={bizEmploymentWaitForAnswerConfig} existingAnswers={task.metadata?.guided_answers} />
    case 'biz_employment_discovery':
      return <GuidedStep caseId={id} taskId={taskId} config={bizEmploymentDiscoveryConfig} existingAnswers={task.metadata?.guided_answers} />
    case 'biz_employment_post_resolution':
      return <GuidedStep caseId={id} taskId={taskId} config={bizEmploymentPostResolutionConfig} existingAnswers={task.metadata?.guided_answers} />

    // Business: B2B Commercial dispute task chain steps
    case 'biz_b2b_intake':
      return (
        <BizB2bIntakeStep
          caseId={id}
          taskId={taskId}
          existingMetadata={task.metadata}
        />
      )
    case 'biz_b2b_evidence':
      return <GuidedStep caseId={id} taskId={taskId} config={bizB2bEvidenceConfig} existingAnswers={task.metadata?.guided_answers} />
    case 'biz_b2b_demand_letter':
      return <GuidedStep caseId={id} taskId={taskId} config={bizB2bDemandLetterConfig} existingAnswers={task.metadata?.guided_answers} skippable />
    case 'biz_b2b_negotiation':
      return <GuidedStep caseId={id} taskId={taskId} config={bizB2bNegotiationConfig} existingAnswers={task.metadata?.guided_answers} skippable />
    case 'biz_b2b_prepare_filing': {
      const { data: caseRow } = await supabase
        .from('cases').select('county, court_type, state').eq('id', id).single()
      const { data: bizIntakeTask } = await supabase
        .from('tasks').select('metadata').eq('case_id', id).eq('task_key', 'biz_b2b_intake').maybeSingle()
      const bizIntakeMeta = bizIntakeTask?.metadata as Record<string, unknown> | null
      return (
        <BusinessWizard
          caseId={id}
          taskId={taskId}
          existingMetadata={task.metadata}
          businessDetails={{
            business_sub_type: 'b2b_commercial',
            specific_dispute_type: bizIntakeMeta?.specific_dispute_type as string | undefined,
            other_party_name: bizIntakeMeta?.other_business_name as string | undefined,
            business_name: bizIntakeMeta?.other_business_name as string | undefined,
            dispute_description: bizIntakeMeta?.dispute_description as string | undefined,
            damages_sought: bizIntakeMeta?.damages_sought as number | undefined,
          }}
          caseData={{ county: caseRow?.county ?? null, court_type: caseRow?.court_type ?? null, state: caseRow?.state ?? undefined }}
        />
      )
    }
    case 'biz_b2b_file_with_court':
      return <GuidedStep caseId={id} taskId={taskId} config={bizB2bFileWithCourtConfig} existingAnswers={task.metadata?.guided_answers} />
    case 'biz_b2b_serve_defendant':
      return <GuidedStep caseId={id} taskId={taskId} config={bizB2bServeDefendantConfig} existingAnswers={task.metadata?.guided_answers} />
    case 'biz_b2b_wait_for_answer':
      return <GuidedStep caseId={id} taskId={taskId} config={bizB2bWaitForAnswerConfig} existingAnswers={task.metadata?.guided_answers} />
    case 'biz_b2b_discovery':
      return <GuidedStep caseId={id} taskId={taskId} config={bizB2bDiscoveryConfig} existingAnswers={task.metadata?.guided_answers} />
    case 'biz_b2b_post_resolution':
      return <GuidedStep caseId={id} taskId={taskId} config={bizB2bPostResolutionConfig} existingAnswers={task.metadata?.guided_answers} />

    // Other dispute task chain steps
    case 'other_intake':
      return (
        <OtherIntakeStep
          caseId={id}
          taskId={taskId}
          existingMetadata={task.metadata}
        />
      )
    case 'other_demand_letter':
      return <GuidedStep caseId={id} taskId={taskId} config={otherDemandLetterConfig} existingAnswers={task.metadata?.guided_answers} skippable />
    case 'other_prepare_filing': {
      const { data: caseRow } = await supabase
        .from('cases').select('county, court_type, state').eq('id', id).single()
      const { data: otherDetails } = await supabase
        .from('other_case_details').select('*').eq('case_id', id).maybeSingle()
      return (
        <OtherWizard
          caseId={id}
          taskId={taskId}
          existingMetadata={task.metadata}
          otherDetails={otherDetails}
          caseData={{ county: caseRow?.county ?? null, court_type: caseRow?.court_type ?? 'county', state: caseRow?.state ?? undefined }}
        />
      )
    }
    case 'other_file_with_court':
      return <GuidedStep caseId={id} taskId={taskId} config={otherFileWithCourtConfig} existingAnswers={task.metadata?.guided_answers} />
    case 'other_serve_defendant':
      return <GuidedStep caseId={id} taskId={taskId} config={otherServeDefendantConfig} existingAnswers={task.metadata?.guided_answers} />
    case 'other_wait_for_answer':
      return <GuidedStep caseId={id} taskId={taskId} config={otherWaitForAnswerConfig} existingAnswers={task.metadata?.guided_answers} />
    case 'other_review_answer':
      return <GuidedStep caseId={id} taskId={taskId} config={otherReviewAnswerConfig} existingAnswers={task.metadata?.guided_answers} />
    case 'other_discovery':
      return <GuidedStep caseId={id} taskId={taskId} config={otherDiscoveryConfig} existingAnswers={task.metadata?.guided_answers} />
    case 'other_post_resolution':
      return <GuidedStep caseId={id} taskId={taskId} config={otherPostResolutionConfig} existingAnswers={task.metadata?.guided_answers} />

    default:
      return (
        <div className="max-w-2xl mx-auto px-4 py-8">
          <Link
            href={`/case/${id}`}
            className="text-sm text-warm-muted hover:text-warm-text mb-6 inline-block"
          >
            &larr; Back to dashboard
          </Link>
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <h2 className="text-lg font-semibold text-warm-text mb-2">
                This step is coming soon
              </h2>
              <p className="text-sm text-warm-muted">
                We&apos;re still building this part. Check back soon.
              </p>
            </CardContent>
          </Card>
        </div>
      )
  }
}
