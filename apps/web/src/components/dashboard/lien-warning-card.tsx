import { createClient } from '@/lib/supabase/server'
import { AlertTriangle } from 'lucide-react'

interface LienWarningCardProps {
  caseId: string
  disputeType: string
  nextTaskKey: string | null
}

const LIEN_RELEVANT_TASKS = new Set([
  'pi_settlement_negotiation',
  'prepare_pi_demand_letter',
  'pi_post_resolution',
])

function formatCurrency(amount: string): string {
  const num = parseFloat(amount.replace(/[^0-9.]/g, ''))
  if (isNaN(num)) return amount
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num)
}

export async function LienWarningCard({ caseId, disputeType, nextTaskKey }: LienWarningCardProps) {
  if (disputeType !== 'personal_injury') return null
  if (!nextTaskKey || !LIEN_RELEVANT_TASKS.has(nextTaskKey)) return null

  const supabase = await createClient()
  const { data: task } = await supabase
    .from('tasks')
    .select('metadata')
    .eq('case_id', caseId)
    .eq('task_key', 'pi_medical_records')
    .limit(1)
    .maybeSingle()

  const metadata = task?.metadata as Record<string, unknown> | null
  const guidedAnswers = metadata?.guided_answers as Record<string, unknown> | null
  if (!guidedAnswers || guidedAnswers.lien_filed !== 'yes') return null

  const hospitalName = (guidedAnswers.lien_hospital_name as string) || 'Unknown Provider'
  const lienAmount = guidedAnswers.lien_amount as string | undefined

  return (
    <div className="rounded-lg border-l-4 border-l-amber-500 bg-amber-50 px-4 py-3">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0 text-calm-amber" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-amber-700">Hospital Lien Alert</p>
          <p className="text-sm text-warm-text mt-1">
            You have a recorded lien
            {lienAmount ? ` of ${formatCurrency(lienAmount)}` : ''}
            {' '}from <span className="font-medium">{hospitalName}</span>.
            You must satisfy this lien before distributing any settlement funds.
            Settling without paying the lien creates personal liability.
          </p>
        </div>
      </div>
    </div>
  )
}
