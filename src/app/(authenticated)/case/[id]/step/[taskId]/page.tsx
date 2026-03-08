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
import { FamilyIntakeStep } from '@/components/step/family/family-intake-step'
import { SafetyScreeningStep } from '@/components/step/family/safety-screening-step'
import { FamilyLawWizard } from '@/components/step/family-law-wizard'
import { WaitingPeriodStep } from '@/components/step/family/waiting-period-step'
import { TemporaryOrdersStep } from '@/components/step/family/temporary-orders-step'
import { MediationStep } from '@/components/step/family/mediation-step'
import { FinalOrdersStep } from '@/components/step/family/final-orders-step'
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
import { LtHearingPrepStep } from '@/components/step/landlord-tenant/lt-hearing-prep-step'
import { LtHearingDayStep } from '@/components/step/landlord-tenant/lt-hearing-day-step'
import { PostJudgmentStep } from '@/components/step/landlord-tenant/post-judgment-step'
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
    // Family law task chain steps
    case 'family_intake':
      return (
        <FamilyIntakeStep
          caseId={id}
          taskId={taskId}
          existingMetadata={task.metadata}
        />
      )
    case 'safety_screening':
      return <SafetyScreeningStep caseId={id} taskId={taskId} />
    case 'prepare_family_filing': {
      const { data: caseRow } = await supabase
        .from('cases')
        .select('county')
        .eq('id', id)
        .single()

      const { data: familyDetails } = await supabase
        .from('family_case_details')
        .select('*')
        .eq('case_id', id)
        .maybeSingle()

      return (
        <FamilyLawWizard
          caseId={id}
          taskId={taskId}
          existingMetadata={task.metadata}
          familyDetails={familyDetails}
          caseData={{ county: caseRow?.county ?? null }}
        />
      )
    }
    case 'waiting_period':
      return <WaitingPeriodStep caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'temporary_orders':
      return <TemporaryOrdersStep caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'mediation':
      return <MediationStep caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'final_orders':
      return <FinalOrdersStep caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />

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
    case 'prepare_demand_letter': {
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
    case 'serve_defendant':
      return <ServeDefendantStep caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'prepare_for_hearing': {
      // Check if this is a landlord-tenant case
      const { data: caseCheck } = await supabase
        .from('cases').select('dispute_type').eq('id', id).single()
      if (caseCheck?.dispute_type === 'landlord_tenant') {
        return <LtHearingPrepStep caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
      }
      return <PrepareForHearingStep caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    }
    case 'hearing_day': {
      // Check if this is a landlord-tenant case
      const { data: caseCheck } = await supabase
        .from('cases').select('dispute_type').eq('id', id).single()
      if (caseCheck?.dispute_type === 'landlord_tenant') {
        return <LtHearingDayStep caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
      }
      return <HearingDayStep caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    }

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
        />
      )
    }
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
    case 'serve_other_party':
      return <ServeOtherPartyStep caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'post_judgment':
      return <PostJudgmentStep caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />

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
        />
      )
    }
    case 'pi_settlement_negotiation':
      return <PISettlementNegotiationStep caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
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
    case 'pi_file_with_court':
      return <PIFileWithCourtStep caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
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
    case 'pi_post_resolution':
      return <PIPostResolutionStep caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />

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
