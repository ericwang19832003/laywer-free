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
import { reEvidenceVaultConfig } from '@/lib/guided-steps/real-estate/re-evidence-vault'
import { reDemandLetterConfig } from '@/lib/guided-steps/real-estate/re-demand-letter'
import { reNegotiationConfig } from '@/lib/guided-steps/real-estate/re-negotiation'
import { reFileWithCourtConfig } from '@/lib/guided-steps/real-estate/re-file-with-court'
import { reServeDefendantConfig } from '@/lib/guided-steps/real-estate/re-serve-defendant'
import { reWaitForAnswerConfig } from '@/lib/guided-steps/real-estate/re-wait-for-answer'
import { reReviewAnswerConfig } from '@/lib/guided-steps/real-estate/re-review-answer'
import { reDiscoveryConfig } from '@/lib/guided-steps/real-estate/re-discovery'
import { rePostResolutionConfig } from '@/lib/guided-steps/real-estate/re-post-resolution'

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
        .select('role, court_type, county, dispute_type')
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
        <PetitionWizard
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
      const { data: caseRow } = await supabase.from('cases').select('county').eq('id', id).single()
      const { data: familyDetails } = await supabase.from('family_case_details').select('*').eq('case_id', id).maybeSingle()
      return <FamilyLawWizard caseId={id} taskId={taskId} existingMetadata={task.metadata} familyDetails={familyDetails} caseData={{ county: caseRow?.county ?? null }} />
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
      const { data: caseRow } = await supabase.from('cases').select('county').eq('id', id).single()
      const { data: familyDetails } = await supabase.from('family_case_details').select('*').eq('case_id', id).maybeSingle()
      return <FamilyLawWizard caseId={id} taskId={taskId} existingMetadata={task.metadata} familyDetails={familyDetails} caseData={{ county: caseRow?.county ?? null }} />
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
      const { data: caseRow } = await supabase.from('cases').select('county').eq('id', id).single()
      const { data: familyDetails } = await supabase.from('family_case_details').select('*').eq('case_id', id).maybeSingle()
      return <FamilyLawWizard caseId={id} taskId={taskId} existingMetadata={task.metadata} familyDetails={familyDetails} caseData={{ county: caseRow?.county ?? null }} />
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
      const { data: caseRow } = await supabase.from('cases').select('county').eq('id', id).single()
      const { data: familyDetails } = await supabase.from('family_case_details').select('*').eq('case_id', id).maybeSingle()
      return <FamilyLawWizard caseId={id} taskId={taskId} existingMetadata={task.metadata} familyDetails={familyDetails} caseData={{ county: caseRow?.county ?? null }} />
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
      const { data: caseRow } = await supabase.from('cases').select('county').eq('id', id).single()
      const { data: familyDetails } = await supabase.from('family_case_details').select('*').eq('case_id', id).maybeSingle()
      return <FamilyLawWizard caseId={id} taskId={taskId} existingMetadata={task.metadata} familyDetails={familyDetails} caseData={{ county: caseRow?.county ?? null }} />
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
      const { data: caseRow } = await supabase.from('cases').select('county').eq('id', id).single()
      const { data: familyDetails } = await supabase.from('family_case_details').select('*').eq('case_id', id).maybeSingle()
      return <FamilyLawWizard caseId={id} taskId={taskId} existingMetadata={task.metadata} familyDetails={familyDetails} caseData={{ county: caseRow?.county ?? null }} />
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
      const { data: caseRow } = await supabase.from('cases').select('county').eq('id', id).single()
      const { data: familyDetails } = await supabase.from('family_case_details').select('*').eq('case_id', id).maybeSingle()
      return <FamilyLawWizard caseId={id} taskId={taskId} existingMetadata={task.metadata} familyDetails={familyDetails} caseData={{ county: caseRow?.county ?? null }} />
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
        .from('cases').select('county').eq('id', id).single()
      const { data: claimDetails } = await supabase
        .from('small_claims_details').select('*').eq('case_id', id).maybeSingle()
      return (
        <SmallClaimsWizard
          caseId={id}
          taskId={taskId}
          existingMetadata={task.metadata}
          claimDetails={claimDetails}
          caseData={{ county: caseRow?.county ?? null }}
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
        .from('cases').select('county, court_type').eq('id', id).single()
      const { data: ltDetails } = await supabase
        .from('landlord_tenant_details').select('*').eq('case_id', id).maybeSingle()
      return (
        <LandlordTenantWizard
          caseId={id}
          taskId={taskId}
          existingMetadata={task.metadata}
          landlordTenantDetails={ltDetails}
          caseData={{ county: caseRow?.county ?? null, court_type: caseRow?.court_type ?? 'jp' }}
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
        .from('cases').select('county, court_type').eq('id', id).single()
      const { data: debtDetails } = await supabase
        .from('debt_defense_details').select('*').eq('case_id', id).maybeSingle()
      return (
        <DebtDefenseWizard
          caseId={id}
          taskId={taskId}
          existingMetadata={task.metadata}
          debtDefenseDetails={debtDetails}
          caseData={{ county: caseRow?.county ?? null, court_type: caseRow?.court_type ?? 'jp' }}
        />
      )
    }
    case 'debt_file_with_court':
      return <DebtFileWithCourtStep caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'serve_plaintiff':
      return <ServePlaintiffStep caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
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
        .from('cases').select('county, court_type').eq('id', id).single()
      const { data: piDetails } = await supabase
        .from('personal_injury_details').select('*').eq('case_id', id).maybeSingle()
      return (
        <PersonalInjuryWizard
          caseId={id}
          taskId={taskId}
          existingMetadata={task.metadata}
          personalInjuryDetails={piDetails}
          caseData={{ county: caseRow?.county ?? null, court_type: caseRow?.court_type ?? 'county' }}
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
        .from('cases').select('county, court_type').eq('id', id).single()
      const { data: contractDetails } = await supabase
        .from('contract_details').select('*').eq('case_id', id).maybeSingle()
      return (
        <ContractWizard
          caseId={id}
          taskId={taskId}
          existingMetadata={task.metadata}
          contractDetails={contractDetails}
          caseData={{ county: caseRow?.county ?? null, court_type: caseRow?.court_type ?? 'county' }}
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
        .from('cases').select('county, court_type').eq('id', id).single()
      const { data: propertyDetails } = await supabase
        .from('property_dispute_details').select('*').eq('case_id', id).maybeSingle()
      return (
        <PropertyWizard
          caseId={id}
          taskId={taskId}
          existingMetadata={task.metadata}
          propertyDetails={propertyDetails}
          caseData={{ county: caseRow?.county ?? null, court_type: caseRow?.court_type ?? 'county' }}
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
        .from('cases').select('role, court_type, county, dispute_type').eq('id', id).single()
      const { data: reIntakeTask } = await supabase
        .from('tasks').select('metadata').eq('case_id', id).eq('task_key', 're_intake').maybeSingle()
      const reIntakeMeta = reIntakeTask?.metadata as Record<string, unknown> | null
      const governmentEntity = (reIntakeMeta?.government_entity as boolean) ?? false

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
        <PetitionWizard
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
        .from('cases').select('role, court_type, county, dispute_type').eq('id', id).single()
      const { data: bizIntakeTask } = await supabase
        .from('tasks').select('metadata').eq('case_id', id).eq('task_key', 'biz_partnership_intake').maybeSingle()
      const bizIntakeMeta = bizIntakeTask?.metadata as Record<string, unknown> | null
      const governmentEntity = (bizIntakeMeta?.government_entity as boolean) ?? false

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
        <PetitionWizard
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
        .from('cases').select('role, court_type, county, dispute_type').eq('id', id).single()
      const { data: bizIntakeTask } = await supabase
        .from('tasks').select('metadata').eq('case_id', id).eq('task_key', 'biz_employment_intake').maybeSingle()
      const bizIntakeMeta = bizIntakeTask?.metadata as Record<string, unknown> | null
      const governmentEntity = (bizIntakeMeta?.government_entity as boolean) ?? false

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
        <PetitionWizard
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
        .from('cases').select('role, court_type, county, dispute_type').eq('id', id).single()
      const { data: bizIntakeTask } = await supabase
        .from('tasks').select('metadata').eq('case_id', id).eq('task_key', 'biz_b2b_intake').maybeSingle()
      const bizIntakeMeta = bizIntakeTask?.metadata as Record<string, unknown> | null
      const governmentEntity = (bizIntakeMeta?.government_entity as boolean) ?? false

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
        <PetitionWizard
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
        .from('cases').select('county, court_type').eq('id', id).single()
      const { data: otherDetails } = await supabase
        .from('other_case_details').select('*').eq('case_id', id).maybeSingle()
      return (
        <OtherWizard
          caseId={id}
          taskId={taskId}
          existingMetadata={task.metadata}
          otherDetails={otherDetails}
          caseData={{ county: caseRow?.county ?? null, court_type: caseRow?.court_type ?? 'county' }}
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
