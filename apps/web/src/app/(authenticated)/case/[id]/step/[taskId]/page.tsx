import { createClient } from '@/lib/supabase/server'
import { transformDemandLetterToFiling } from '@/lib/demand-letter-prefill'
import { WelcomeStep } from '@/components/step/welcome-step'
import { IntakeStep } from '@/components/step/intake-step'
import { UploadReturnOfServiceStep } from '@/components/step/upload-return-of-service-step'
import { ConfirmServiceFactsStep } from '@/components/step/confirm-service-facts-step'
import { PreservationLetterStep } from '@/components/step/preservation-letter-step'
import { WaitForAnswerStep } from '@/components/step/wait-for-answer-step'
import { CheckDocketForAnswerStep } from '@/components/step/check-docket-for-answer-step'
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
import { DynamicGuidedStep } from '@/components/step/dynamic-guided-step'
import { SmallClaimsIntakeStep } from '@/components/step/small-claims/small-claims-intake-step'
import { DemandLetterStep } from '@/components/step/small-claims/demand-letter-step'
import { SmallClaimsWizard } from '@/components/step/small-claims-wizard'
import { ServeDefendantStep } from '@/components/step/small-claims/serve-defendant-step'
import { PrepareForHearingStep } from '@/components/step/small-claims/prepare-for-hearing-step'
import { HearingDayStep } from '@/components/step/small-claims/hearing-day-step'
import { LtIntakeStep } from '@/components/step/landlord-tenant/lt-intake-step'
import { LtDemandLetterStep } from '@/components/step/landlord-tenant/lt-demand-letter-step'
import { LandlordTenantWizard } from '@/components/step/landlord-tenant-wizard'
import { ServeOtherPartyStep } from '@/components/step/landlord-tenant/serve-other-party-step'
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
import { PiCourtSelectionStep } from '@/components/step/personal-injury/pi-court-selection-step'
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
import { REIntakeStep } from '@/components/step/real-estate/re-intake-step'
import { RealEstateWizard } from '@/components/step/real-estate/real-estate-wizard'

// Business: shared wizard
import { BusinessWizard } from '@/components/step/business/business-wizard'

// Business: Partnership
import { BizPartnershipIntakeStep } from '@/components/step/business/biz-partnership-intake-step'

// Business: Employment
import { BizEmploymentIntakeStep } from '@/components/step/business/biz-employment-intake-step'

// Business: B2B Commercial
import { BizB2bIntakeStep } from '@/components/step/business/biz-b2b-intake-step'

import { MOTION_CONFIGS } from '@lawyer-free/shared/motions/registry'
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

  // Smart pre-fill: carry demand letter data forward into petition wizards
  // so users don't re-enter parties, facts, and damages they already provided.
  const FILING_TO_DEMAND_LETTER: Record<string, string> = {
    prepare_filing: 'demand_letter',
    prepare_small_claims_filing: 'sc_demand_letter',
    prepare_landlord_tenant_filing: 'prepare_lt_demand_letter',
    prepare_pi_petition: 'prepare_pi_demand_letter',
    contract_prepare_filing: 'contract_demand_letter',
    property_prepare_filing: 'property_demand_letter',
    re_prepare_filing: 're_demand_letter',
    biz_partnership_prepare_filing: 'biz_partnership_demand_letter',
    biz_employment_prepare_filing: 'biz_employment_demand_letter',
    biz_b2b_prepare_filing: 'biz_b2b_demand_letter',
    other_prepare_filing: 'other_demand_letter',
  }
  const demandLetterKey = FILING_TO_DEMAND_LETTER[task.task_key]
  if (demandLetterKey) {
    const { data: dlRow } = await supabase
      .from('tasks').select('metadata')
      .eq('case_id', id).eq('task_key', demandLetterKey)
      .eq('status', 'completed').maybeSingle()
    const dlMeta = (dlRow?.metadata as Record<string, unknown>) ?? {}
    // Only pre-fill if demand letter was completed and has data
    if (Object.keys(dlMeta).length > 0) {
      const currentMeta = (task.metadata ?? {}) as Record<string, unknown>
      const prefilled = transformDemandLetterToFiling(dlMeta, task.task_key)
      // Merge: demand letter provides base, existing wizard values take precedence
      for (const [key, value] of Object.entries(prefilled)) {
        if (
          value !== null &&
          value !== undefined &&
          currentMeta[key] === undefined
        ) {
          currentMeta[key] = value
        }
      }
      task.metadata = currentMeta
    }
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
      return <DynamicGuidedStep taskKey="divorce_intake" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'divorce_safety_screening':
      return <SafetyScreeningStep caseId={id} taskId={taskId} />
    case 'divorce_evidence_vault':
      return <DynamicGuidedStep taskKey="divorce_evidence_vault" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'divorce_prepare_filing': {
      const { data: caseRow } = await supabase.from('cases').select('county, state').eq('id', id).single()
      const { data: familyDetails } = await supabase.from('family_case_details').select('*').eq('case_id', id).maybeSingle()
      return <FamilyLawWizard caseId={id} taskId={taskId} existingMetadata={task.metadata} familyDetails={familyDetails} caseData={{ county: caseRow?.county ?? null, state: caseRow?.state ?? undefined }} />
    }
    case 'divorce_file_with_court':
      return <DynamicGuidedStep taskKey="divorce_file_with_court" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'divorce_serve_respondent':
      return <DynamicGuidedStep taskKey="divorce_serve_respondent" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'divorce_waiting_period':
      return <DynamicGuidedStep taskKey="divorce_waiting_period" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'divorce_temporary_orders':
      return <DynamicGuidedStep taskKey="divorce_temporary_orders" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'divorce_mediation':
      return <DynamicGuidedStep taskKey="divorce_mediation" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'divorce_property_division':
      return <DynamicGuidedStep taskKey="divorce_property_division" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'divorce_final_orders':
      return <DynamicGuidedStep taskKey="divorce_final_orders" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />

    // Family law — Custody (10 tasks)
    case 'custody_intake':
      return <DynamicGuidedStep taskKey="custody_intake" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'custody_safety_screening':
      return <SafetyScreeningStep caseId={id} taskId={taskId} />
    case 'custody_evidence_vault':
      return <DynamicGuidedStep taskKey="custody_evidence_vault" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'custody_prepare_filing': {
      const { data: caseRow } = await supabase.from('cases').select('county, state').eq('id', id).single()
      const { data: familyDetails } = await supabase.from('family_case_details').select('*').eq('case_id', id).maybeSingle()
      return <FamilyLawWizard caseId={id} taskId={taskId} existingMetadata={task.metadata} familyDetails={familyDetails} caseData={{ county: caseRow?.county ?? null, state: caseRow?.state ?? undefined }} />
    }
    case 'custody_file_with_court':
      return <DynamicGuidedStep taskKey="custody_file_with_court" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'custody_serve_respondent':
      return <DynamicGuidedStep taskKey="custody_serve_respondent" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'custody_temporary_orders':
      return <DynamicGuidedStep taskKey="custody_temporary_orders" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'custody_mediation':
      return <DynamicGuidedStep taskKey="custody_mediation" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'custody_final_orders':
      return <DynamicGuidedStep taskKey="custody_final_orders" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />

    // Family law — Child Support (8 tasks)
    case 'child_support_intake':
      return <DynamicGuidedStep taskKey="child_support_intake" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'child_support_evidence_vault':
      return <DynamicGuidedStep taskKey="child_support_evidence_vault" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'child_support_prepare_filing': {
      const { data: caseRow } = await supabase.from('cases').select('county, state').eq('id', id).single()
      const { data: familyDetails } = await supabase.from('family_case_details').select('*').eq('case_id', id).maybeSingle()
      return <FamilyLawWizard caseId={id} taskId={taskId} existingMetadata={task.metadata} familyDetails={familyDetails} caseData={{ county: caseRow?.county ?? null, state: caseRow?.state ?? undefined }} />
    }
    case 'child_support_file_with_court':
      return <DynamicGuidedStep taskKey="child_support_file_with_court" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'child_support_serve_respondent':
      return <DynamicGuidedStep taskKey="child_support_serve_respondent" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'child_support_temporary_orders':
      return <DynamicGuidedStep taskKey="child_support_temporary_orders" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'child_support_final_orders':
      return <DynamicGuidedStep taskKey="child_support_final_orders" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />

    // Family law — Visitation (9 tasks)
    case 'visitation_intake':
      return <DynamicGuidedStep taskKey="visitation_intake" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'visitation_safety_screening':
      return <SafetyScreeningStep caseId={id} taskId={taskId} />
    case 'visitation_evidence_vault':
      return <DynamicGuidedStep taskKey="visitation_evidence_vault" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'visitation_prepare_filing': {
      const { data: caseRow } = await supabase.from('cases').select('county, state').eq('id', id).single()
      const { data: familyDetails } = await supabase.from('family_case_details').select('*').eq('case_id', id).maybeSingle()
      return <FamilyLawWizard caseId={id} taskId={taskId} existingMetadata={task.metadata} familyDetails={familyDetails} caseData={{ county: caseRow?.county ?? null, state: caseRow?.state ?? undefined }} />
    }
    case 'visitation_file_with_court':
      return <DynamicGuidedStep taskKey="visitation_file_with_court" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'visitation_serve_respondent':
      return <DynamicGuidedStep taskKey="visitation_serve_respondent" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'visitation_mediation':
      return <DynamicGuidedStep taskKey="visitation_mediation" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'visitation_final_orders':
      return <DynamicGuidedStep taskKey="visitation_final_orders" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />

    // Family law — Spousal Support (8 tasks)
    case 'spousal_support_intake':
      return <DynamicGuidedStep taskKey="spousal_support_intake" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'spousal_support_evidence_vault':
      return <DynamicGuidedStep taskKey="spousal_support_evidence_vault" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'spousal_support_prepare_filing': {
      const { data: caseRow } = await supabase.from('cases').select('county, state').eq('id', id).single()
      const { data: familyDetails } = await supabase.from('family_case_details').select('*').eq('case_id', id).maybeSingle()
      return <FamilyLawWizard caseId={id} taskId={taskId} existingMetadata={task.metadata} familyDetails={familyDetails} caseData={{ county: caseRow?.county ?? null, state: caseRow?.state ?? undefined }} />
    }
    case 'spousal_support_file_with_court':
      return <DynamicGuidedStep taskKey="spousal_support_file_with_court" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'spousal_support_serve_respondent':
      return <DynamicGuidedStep taskKey="spousal_support_serve_respondent" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'spousal_support_temporary_orders':
      return <DynamicGuidedStep taskKey="spousal_support_temporary_orders" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'spousal_support_final_orders':
      return <DynamicGuidedStep taskKey="spousal_support_final_orders" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />

    // Family law — Protective Order (6 tasks)
    case 'po_intake':
      return <DynamicGuidedStep taskKey="po_intake" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'po_safety_screening':
      return <SafetyScreeningStep caseId={id} taskId={taskId} isProtectiveOrder />
    case 'po_prepare_filing': {
      const { data: caseRow } = await supabase.from('cases').select('county, state').eq('id', id).single()
      const { data: familyDetails } = await supabase.from('family_case_details').select('*').eq('case_id', id).maybeSingle()
      return <FamilyLawWizard caseId={id} taskId={taskId} existingMetadata={task.metadata} familyDetails={familyDetails} caseData={{ county: caseRow?.county ?? null, state: caseRow?.state ?? undefined }} />
    }
    case 'po_file_with_court':
      return <DynamicGuidedStep taskKey="po_file_with_court" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'po_hearing':
      return <DynamicGuidedStep taskKey="po_hearing" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />

    // Family law — Modification (9 tasks)
    case 'mod_intake':
      return <DynamicGuidedStep taskKey="mod_intake" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'mod_evidence_vault':
      return <DynamicGuidedStep taskKey="mod_evidence_vault" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'mod_existing_order_review':
      return <DynamicGuidedStep taskKey="mod_existing_order_review" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'mod_prepare_filing': {
      const { data: caseRow } = await supabase.from('cases').select('county, state').eq('id', id).single()
      const { data: familyDetails } = await supabase.from('family_case_details').select('*').eq('case_id', id).maybeSingle()
      return <FamilyLawWizard caseId={id} taskId={taskId} existingMetadata={task.metadata} familyDetails={familyDetails} caseData={{ county: caseRow?.county ?? null, state: caseRow?.state ?? undefined }} />
    }
    case 'mod_file_with_court':
      return <DynamicGuidedStep taskKey="mod_file_with_court" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'mod_serve_respondent':
      return <DynamicGuidedStep taskKey="mod_serve_respondent" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'mod_mediation':
      return <DynamicGuidedStep taskKey="mod_mediation" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'mod_final_orders':
      return <DynamicGuidedStep taskKey="mod_final_orders" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />

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
      return <DynamicGuidedStep taskKey="sc_evidence_vault" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'sc_file_with_court':
      return <DynamicGuidedStep taskKey="sc_file_with_court" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
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
      return <DynamicGuidedStep taskKey="lt_negotiation" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
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
      return <DynamicGuidedStep taskKey="lt_file_with_court" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'serve_other_party':
      return <ServeOtherPartyStep caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'lt_wait_for_response':
      return <DynamicGuidedStep taskKey="lt_wait_for_response" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'lt_review_response':
      return <DynamicGuidedStep taskKey="lt_review_response" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'lt_discovery':
      return <DynamicGuidedStep taskKey="lt_discovery" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'lt_prepare_for_hearing':
      return <DynamicGuidedStep taskKey="lt_prepare_for_hearing" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'lt_mediation':
      return <DynamicGuidedStep taskKey="lt_mediation" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'lt_hearing_day':
      return <DynamicGuidedStep taskKey="lt_hearing_day" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'lt_post_judgment':
      return <DynamicGuidedStep taskKey="lt_post_judgment" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    // Small claims depth steps
    case 'sc_jp_court_guide':
      return <DynamicGuidedStep taskKey="sc_jp_court_guide" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'sc_filing_guide':
      return <DynamicGuidedStep taskKey="sc_filing_guide" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'sc_service_guide':
      return <DynamicGuidedStep taskKey="sc_service_guide" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'sc_courtroom_guide':
      return <DynamicGuidedStep taskKey="sc_courtroom_guide" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'sc_evidence_rules':
      return <DynamicGuidedStep taskKey="sc_evidence_rules" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'sc_damages_by_type':
      return <DynamicGuidedStep taskKey="sc_damages_by_type" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'sc_settlement_guide':
      return <DynamicGuidedStep taskKey="sc_settlement_guide" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'sc_default_judgment':
      return <DynamicGuidedStep taskKey="sc_default_judgment" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'sc_post_judgment_guide':
      return <DynamicGuidedStep taskKey="sc_post_judgment_guide" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'sc_appeal_guide':
      return <DynamicGuidedStep taskKey="sc_appeal_guide" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'sc_counterclaim_defense':
      return <DynamicGuidedStep taskKey="sc_counterclaim_defense" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />

    // Real estate depth steps
    case 're_filing_guide':
      return <DynamicGuidedStep taskKey="re_filing_guide" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 're_service_guide':
      return <DynamicGuidedStep taskKey="re_service_guide" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 're_courtroom_guide':
      return <DynamicGuidedStep taskKey="re_courtroom_guide" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 're_title_defect_analysis':
      return <DynamicGuidedStep taskKey="re_title_defect_analysis" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 're_seller_disclosure':
      return <DynamicGuidedStep taskKey="re_seller_disclosure" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 're_earnest_money':
      return <DynamicGuidedStep taskKey="re_earnest_money" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 're_construction_defect':
      return <DynamicGuidedStep taskKey="re_construction_defect" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 're_failed_closing':
      return <DynamicGuidedStep taskKey="re_failed_closing" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 're_adverse_possession':
      return <DynamicGuidedStep taskKey="re_adverse_possession" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 're_discovery_guide':
      return <DynamicGuidedStep taskKey="re_discovery_guide" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 're_post_judgment_guide':
      return <DynamicGuidedStep taskKey="re_post_judgment_guide" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />

    // Business dispute depth steps
    case 'biz_courtroom_guide':
      return <DynamicGuidedStep taskKey="biz_courtroom_guide" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'biz_service_guide':
      return <DynamicGuidedStep taskKey="biz_service_guide" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'biz_discovery_guide':
      return <DynamicGuidedStep taskKey="biz_discovery_guide" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'biz_wrongful_termination':
      return <DynamicGuidedStep taskKey="biz_wrongful_termination" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'biz_wage_theft':
      return <DynamicGuidedStep taskKey="biz_wage_theft" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'biz_non_compete':
      return <DynamicGuidedStep taskKey="biz_non_compete" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'biz_b2b_contract_breach':
      return <DynamicGuidedStep taskKey="biz_b2b_contract_breach" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'biz_b2b_trade_secrets':
      return <DynamicGuidedStep taskKey="biz_b2b_trade_secrets" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'biz_partnership_fiduciary':
      return <DynamicGuidedStep taskKey="biz_partnership_fiduciary" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'biz_partnership_accounting':
      return <DynamicGuidedStep taskKey="biz_partnership_accounting" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />

    // Contract dispute depth steps
    case 'contract_breach_analysis':
      return <DynamicGuidedStep taskKey="contract_breach_analysis" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'contract_statute_of_frauds':
      return <DynamicGuidedStep taskKey="contract_statute_of_frauds" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'contract_damages_methods':
      return <DynamicGuidedStep taskKey="contract_damages_methods" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'contract_provisions_check':
      return <DynamicGuidedStep taskKey="contract_provisions_check" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'contract_defenses_guide':
      return <DynamicGuidedStep taskKey="contract_defenses_guide" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'contract_filing_guide':
      return <DynamicGuidedStep taskKey="contract_filing_guide" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'contract_service_guide':
      return <DynamicGuidedStep taskKey="contract_service_guide" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'contract_courtroom_guide':
      return <DynamicGuidedStep taskKey="contract_courtroom_guide" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'contract_settlement_guide':
      return <DynamicGuidedStep taskKey="contract_settlement_guide" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'contract_post_judgment_guide':
      return <DynamicGuidedStep taskKey="contract_post_judgment_guide" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />

    // Property damage depth steps
    case 'property_damage_assessment':
      return <DynamicGuidedStep taskKey="property_damage_assessment" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'property_insurance_guide':
      return <DynamicGuidedStep taskKey="property_insurance_guide" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'property_filing_guide':
      return <DynamicGuidedStep taskKey="property_filing_guide" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'property_service_guide':
      return <DynamicGuidedStep taskKey="property_service_guide" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'property_courtroom_guide':
      return <DynamicGuidedStep taskKey="property_courtroom_guide" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'property_mediation_guide':
      return <DynamicGuidedStep taskKey="property_mediation_guide" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'property_pretrial_motions':
      return <DynamicGuidedStep taskKey="property_pretrial_motions" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'property_damages_guide':
      return <DynamicGuidedStep taskKey="property_damages_guide" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'property_post_judgment_guide':
      return <DynamicGuidedStep taskKey="property_post_judgment_guide" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />

    // Personal injury depth steps
    case 'pi_damages_calculation':
      return <DynamicGuidedStep taskKey="pi_damages_calculation" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'pi_pip_claim':
      return <DynamicGuidedStep taskKey="pi_pip_claim" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'pi_medical_improvement':
      return <DynamicGuidedStep taskKey="pi_medical_improvement" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'pi_filing_guide':
      return <DynamicGuidedStep taskKey="pi_filing_guide" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'pi_service_guide':
      return <DynamicGuidedStep taskKey="pi_service_guide" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'pi_courtroom_guide':
      return <DynamicGuidedStep taskKey="pi_courtroom_guide" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'pi_comparative_fault':
      return <DynamicGuidedStep taskKey="pi_comparative_fault" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'pi_lien_resolution':
      return <DynamicGuidedStep taskKey="pi_lien_resolution" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'pi_expert_witness_guide':
      return <DynamicGuidedStep taskKey="pi_expert_witness_guide" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />

    // Landlord-tenant depth steps
    case 'lt_repair_request':
      return <DynamicGuidedStep taskKey="lt_repair_request" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'lt_eviction_response':
      return <DynamicGuidedStep taskKey="lt_eviction_response" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'lt_habitability_checklist':
      return <DynamicGuidedStep taskKey="lt_habitability_checklist" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'lt_security_deposit_demand':
      return <DynamicGuidedStep taskKey="lt_security_deposit_demand" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'lt_repair_and_deduct':
      return <DynamicGuidedStep taskKey="lt_repair_and_deduct" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'lt_illegal_lockout':
      return <DynamicGuidedStep taskKey="lt_illegal_lockout" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'lt_eviction_notice_analysis':
      return <DynamicGuidedStep taskKey="lt_eviction_notice_analysis" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'lt_jp_court_procedures':
      return <DynamicGuidedStep taskKey="lt_jp_court_procedures" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'lt_appeal_guide':
      return <DynamicGuidedStep taskKey="lt_appeal_guide" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'lt_courtroom_guide':
      return <DynamicGuidedStep taskKey="lt_courtroom_guide" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'lt_lease_termination':
      return <DynamicGuidedStep taskKey="lt_lease_termination" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'lt_writ_of_possession':
      return <DynamicGuidedStep taskKey="lt_writ_of_possession" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'lt_sb38_awareness':
      return <DynamicGuidedStep taskKey="lt_sb38_awareness" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'lt_federal_property_check':
      return <DynamicGuidedStep taskKey="lt_federal_property_check" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'lt_retaliation_defense':
      return <DynamicGuidedStep taskKey="lt_retaliation_defense" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'lt_rent_into_registry':
      return <DynamicGuidedStep taskKey="lt_rent_into_registry" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'lt_post_eviction_rights':
      return <DynamicGuidedStep taskKey="lt_post_eviction_rights" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'lt_constructive_eviction':
      return <DynamicGuidedStep taskKey="lt_constructive_eviction" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'lt_code_enforcement':
      return <DynamicGuidedStep taskKey="lt_code_enforcement" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />

    // Family law depth steps
    case 'family_filing_guide':
      return <DynamicGuidedStep taskKey="family_filing_guide" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'family_service_guide':
      return <DynamicGuidedStep taskKey="family_service_guide" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'family_courtroom_guide':
      return <DynamicGuidedStep taskKey="family_courtroom_guide" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'family_mediation_prep':
      return <DynamicGuidedStep taskKey="family_mediation_prep" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'family_post_judgment_guide':
      return <DynamicGuidedStep taskKey="family_post_judgment_guide" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'family_discovery_guide':
      return <DynamicGuidedStep taskKey="family_discovery_guide" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'family_temp_orders_prep':
      return <DynamicGuidedStep taskKey="family_temp_orders_prep" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'family_property_division_guide':
      return <DynamicGuidedStep taskKey="family_property_division_guide" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'family_custody_factors':
      return <DynamicGuidedStep taskKey="family_custody_factors" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'family_uncontested_path':
      return <DynamicGuidedStep taskKey="family_uncontested_path" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />

    // Family law — Response checkpoint (6 sub-types)
    case 'divorce_response_checkpoint':
      return <DynamicGuidedStep taskKey="divorce_response_checkpoint" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'custody_response_checkpoint':
      return <DynamicGuidedStep taskKey="custody_response_checkpoint" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'child_support_response_checkpoint':
      return <DynamicGuidedStep taskKey="child_support_response_checkpoint" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'visitation_response_checkpoint':
      return <DynamicGuidedStep taskKey="visitation_response_checkpoint" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'spousal_support_response_checkpoint':
      return <DynamicGuidedStep taskKey="spousal_support_response_checkpoint" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'mod_response_checkpoint':
      return <DynamicGuidedStep taskKey="mod_response_checkpoint" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />

    // Family law — Post-decree (6 sub-types)
    case 'divorce_post_decree':
      return <DynamicGuidedStep taskKey="divorce_post_decree" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'custody_post_decree':
      return <DynamicGuidedStep taskKey="custody_post_decree" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'child_support_post_decree':
      return <DynamicGuidedStep taskKey="child_support_post_decree" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'visitation_post_decree':
      return <DynamicGuidedStep taskKey="visitation_post_decree" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'spousal_support_post_decree':
      return <DynamicGuidedStep taskKey="spousal_support_post_decree" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'mod_post_decree':
      return <DynamicGuidedStep taskKey="mod_post_decree" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />

    // Family law — Sub-type specific steps
    case 'custody_uccjea_affidavit':
      return <DynamicGuidedStep taskKey="custody_uccjea_affidavit" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'child_support_ag_option':
      return <DynamicGuidedStep taskKey="child_support_ag_option" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'spousal_support_eligibility':
      return <DynamicGuidedStep taskKey="spousal_support_eligibility" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'custody_paternity':
    case 'child_support_paternity':
      return <DynamicGuidedStep taskKey="child_support_paternity" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'divorce_standing_orders':
      return <DynamicGuidedStep taskKey="divorce_standing_orders" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />

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
      return <DynamicGuidedStep taskKey="fdcpa_check" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'debt_sol_check':
      return <DynamicGuidedStep taskKey="debt_sol_check" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'debt_answer_prep':
      return <DynamicGuidedStep taskKey="debt_answer_prep" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'debt_filing_guide':
      return <DynamicGuidedStep taskKey="debt_filing_guide" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'debt_service_guide':
      return <DynamicGuidedStep taskKey="debt_service_guide" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'debt_courtroom_guide':
      return <DynamicGuidedStep taskKey="debt_courtroom_guide" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'debt_post_judgment_guide':
      return <DynamicGuidedStep taskKey="debt_post_judgment_guide" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'fdcpa_counterclaim_guide':
      return <DynamicGuidedStep taskKey="fdcpa_counterclaim_guide" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'debt_motion_to_dismiss':
      return <DynamicGuidedStep taskKey="debt_motion_to_dismiss" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'debt_default_recovery':
      return <DynamicGuidedStep taskKey="debt_default_recovery" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'debt_settlement_guide':
      return <DynamicGuidedStep taskKey="debt_settlement_guide" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'debt_validation_response':
      return <DynamicGuidedStep taskKey="debt_validation_response" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'debt_evidence_rules':
      return <DynamicGuidedStep taskKey="debt_evidence_rules" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'debt_continuance_request':
      return <DynamicGuidedStep taskKey="debt_continuance_request" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'debt_witness_prep':
      return <DynamicGuidedStep taskKey="debt_witness_prep" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'debt_credit_dispute':
      return <DynamicGuidedStep taskKey="debt_credit_dispute" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'debt_court_type_guide':
      return <DynamicGuidedStep taskKey="debt_court_type_guide" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'debt_pre_answer_settlement':
      return <DynamicGuidedStep taskKey="debt_pre_answer_settlement" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'debt_standing_challenge':
      return <DynamicGuidedStep taskKey="debt_standing_challenge" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'debt_discovery_response':
      return <DynamicGuidedStep taskKey="debt_discovery_response" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'debt_business_records_challenge':
      return <DynamicGuidedStep taskKey="debt_business_records_challenge" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'debt_exemption_claim':
      return <DynamicGuidedStep taskKey="debt_exemption_claim" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'debt_appeal_process':
      return <DynamicGuidedStep taskKey="debt_appeal_process" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
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
    case 'pi_court_selection': {
      const { data: piDetails } = await supabase
        .from('personal_injury_details').select('pi_sub_type').eq('case_id', id).maybeSingle()
      return <PiCourtSelectionStep caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} piSubType={piDetails?.pi_sub_type ?? undefined} />
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
          initialTaskStatus={task.status}
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
      return <DynamicGuidedStep taskKey="contract_demand_letter" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'contract_negotiation':
      return <DynamicGuidedStep taskKey="contract_negotiation" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
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
      return <DynamicGuidedStep taskKey="contract_file_with_court" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'contract_serve_defendant':
      return <DynamicGuidedStep taskKey="contract_serve_defendant" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'contract_wait_for_answer':
      return <DynamicGuidedStep taskKey="contract_wait_for_answer" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'contract_review_answer':
      return <DynamicGuidedStep taskKey="contract_review_answer" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'contract_discovery':
      return <DynamicGuidedStep taskKey="contract_discovery" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'contract_mediation':
      return <DynamicGuidedStep taskKey="contract_mediation" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'contract_post_resolution':
      return <DynamicGuidedStep taskKey="contract_post_resolution" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />

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
      return <DynamicGuidedStep taskKey="property_demand_letter" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'property_negotiation':
      return <DynamicGuidedStep taskKey="property_negotiation" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
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
      return <DynamicGuidedStep taskKey="property_file_with_court" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'property_serve_defendant':
      return <DynamicGuidedStep taskKey="property_serve_defendant" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'property_wait_for_answer':
      return <DynamicGuidedStep taskKey="property_wait_for_answer" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'property_review_answer':
      return <DynamicGuidedStep taskKey="property_review_answer" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'property_discovery':
      return <DynamicGuidedStep taskKey="property_discovery" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'property_post_resolution':
      return <DynamicGuidedStep taskKey="property_post_resolution" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />

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
      return <DynamicGuidedStep taskKey="re_evidence_vault" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 're_demand_letter':
      return <DynamicGuidedStep taskKey="re_demand_letter" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 're_negotiation':
      return <DynamicGuidedStep taskKey="re_negotiation" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
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
      return <DynamicGuidedStep taskKey="re_file_with_court" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 're_serve_defendant':
      return <DynamicGuidedStep taskKey="re_serve_defendant" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 're_wait_for_answer':
      return <DynamicGuidedStep taskKey="re_wait_for_answer" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 're_review_answer':
      return <DynamicGuidedStep taskKey="re_review_answer" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 're_discovery':
      return <DynamicGuidedStep taskKey="re_discovery" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 're_post_resolution':
      return <DynamicGuidedStep taskKey="re_post_resolution" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />

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
      return <DynamicGuidedStep taskKey="biz_partnership_evidence" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'biz_partnership_demand_letter':
      return <DynamicGuidedStep taskKey="biz_partnership_demand_letter" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'biz_partnership_adr':
      return <DynamicGuidedStep taskKey="biz_partnership_adr" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
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
      return <DynamicGuidedStep taskKey="biz_partnership_file_with_court" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'biz_partnership_serve_defendant':
      return <DynamicGuidedStep taskKey="biz_partnership_serve_defendant" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'biz_partnership_wait_for_answer':
      return <DynamicGuidedStep taskKey="biz_partnership_wait_for_answer" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'biz_partnership_discovery':
      return <DynamicGuidedStep taskKey="biz_partnership_discovery" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'biz_partnership_post_resolution':
      return <DynamicGuidedStep taskKey="biz_partnership_post_resolution" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />

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
      return <DynamicGuidedStep taskKey="biz_employment_evidence" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'biz_employment_demand_letter':
      return <DynamicGuidedStep taskKey="biz_employment_demand_letter" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'biz_employment_eeoc': {
      const { data: empIntakeTask } = await supabase
        .from('tasks').select('metadata').eq('case_id', id).eq('task_key', 'biz_employment_intake').maybeSingle()
      const empIntakeMeta = empIntakeTask?.metadata as Record<string, unknown> | null
      const isDiscrimination = empIntakeMeta?.specific_dispute_type === 'discrimination_harassment'
      return <DynamicGuidedStep taskKey="biz_employment_eeoc" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} skippable={!isDiscrimination} />
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
      return <DynamicGuidedStep taskKey="biz_employment_file_with_court" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'biz_employment_serve_defendant':
      return <DynamicGuidedStep taskKey="biz_employment_serve_defendant" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'biz_employment_wait_for_answer':
      return <DynamicGuidedStep taskKey="biz_employment_wait_for_answer" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'biz_employment_discovery':
      return <DynamicGuidedStep taskKey="biz_employment_discovery" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'biz_employment_post_resolution':
      return <DynamicGuidedStep taskKey="biz_employment_post_resolution" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />

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
      return <DynamicGuidedStep taskKey="biz_b2b_evidence" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'biz_b2b_demand_letter':
      return <DynamicGuidedStep taskKey="biz_b2b_demand_letter" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'biz_b2b_negotiation':
      return <DynamicGuidedStep taskKey="biz_b2b_negotiation" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
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
      return <DynamicGuidedStep taskKey="biz_b2b_file_with_court" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'biz_b2b_serve_defendant':
      return <DynamicGuidedStep taskKey="biz_b2b_serve_defendant" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'biz_b2b_wait_for_answer':
      return <DynamicGuidedStep taskKey="biz_b2b_wait_for_answer" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'biz_b2b_discovery':
      return <DynamicGuidedStep taskKey="biz_b2b_discovery" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'biz_b2b_post_resolution':
      return <DynamicGuidedStep taskKey="biz_b2b_post_resolution" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />

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
      return <DynamicGuidedStep taskKey="other_demand_letter" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
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
      return <DynamicGuidedStep taskKey="other_file_with_court" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'other_serve_defendant':
      return <DynamicGuidedStep taskKey="other_serve_defendant" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'other_wait_for_answer':
      return <DynamicGuidedStep taskKey="other_wait_for_answer" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'other_review_answer':
      return <DynamicGuidedStep taskKey="other_review_answer" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'other_discovery':
      return <DynamicGuidedStep taskKey="other_discovery" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'other_post_resolution':
      return <DynamicGuidedStep taskKey="other_post_resolution" caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />

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
