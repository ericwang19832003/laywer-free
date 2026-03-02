import { createClient } from '@/lib/supabase/server'
import { WelcomeStep } from '@/components/step/welcome-step'
import { IntakeStep } from '@/components/step/intake-step'
import { UploadReturnOfServiceStep } from '@/components/step/upload-return-of-service-step'
import { ConfirmServiceFactsStep } from '@/components/step/confirm-service-facts-step'
import { PreservationLetterStep } from '@/components/step/preservation-letter-step'
import { WaitForAnswerStep } from '@/components/step/wait-for-answer-step'
import { CheckDocketForAnswerStep } from '@/components/step/check-docket-for-answer-step'
import { PrepareFilingStep } from '@/components/step/prepare-filing-step'
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
        <PrepareFilingStep
          caseId={id}
          taskId={taskId}
          existingMetadata={task.metadata}
          caseData={caseRow}
        />
      )
    }

    case 'file_with_court': {
      const { data: caseRow } = await supabase
        .from('cases')
        .select('role, court_type, county')
        .eq('id', id)
        .single()

      return (
        <FileWithCourtStep
          caseId={id}
          taskId={taskId}
          existingMetadata={task.metadata}
          caseData={caseRow ?? { role: 'plaintiff', court_type: 'district', county: null }}
        />
      )
    }

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
    case 'discovery_starter_pack': {
      const { data: caseRow } = await supabase
        .from('cases')
        .select('court_type')
        .eq('id', id)
        .single()

      return (
        <DiscoveryStarterPackStep
          caseId={id}
          taskId={taskId}
          courtType={caseRow?.court_type ?? 'district'}
        />
      )
    }
    case 'understand_removal':
      return (
        <UnderstandRemovalStep
          caseId={id}
          taskId={taskId}
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
        />
      )
    case 'mandatory_disclosures':
      return (
        <MandatoryDisclosuresStep
          caseId={id}
          taskId={taskId}
        />
      )
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
