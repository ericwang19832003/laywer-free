import { createClient } from '@/lib/supabase/server'
import { AlertTriangle, Info } from 'lucide-react'

interface LienWarningCardProps {
  caseId: string
  disputeType: string
  jurisdiction: string
  nextTaskKey: string | null
}

const SETTLEMENT_PHASE_TASKS = new Set([
  'pi_settlement_negotiation',
  'prepare_pi_demand_letter',
  'pi_post_resolution',
])

function formatCurrency(amount: string): string {
  const num = parseFloat(amount.replace(/[^0-9.]/g, ''))
  if (isNaN(num)) return amount
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num)
}

export async function LienWarningCard({ caseId, disputeType, jurisdiction, nextTaskKey }: LienWarningCardProps) {
  if (disputeType !== 'personal_injury') return null

  const isCA = jurisdiction === 'CA'
  const isSettlementPhase = !!nextTaskKey && SETTLEMENT_PHASE_TASKS.has(nextTaskKey)

  // Non-CA cases only show warnings during settlement phase
  if (!isCA && !isSettlementPhase) return null

  const supabase = await createClient()

  // Fetch both pi_medical_records and pi_intake metadata in parallel
  const [medicalResult, intakeResult] = await Promise.all([
    supabase
      .from('tasks')
      .select('metadata')
      .eq('case_id', caseId)
      .eq('task_key', 'pi_medical_records')
      .limit(1)
      .maybeSingle(),
    isCA
      ? supabase
          .from('tasks')
          .select('metadata')
          .eq('case_id', caseId)
          .eq('task_key', 'pi_intake')
          .limit(1)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ])

  const medMetadata = medicalResult.data?.metadata as Record<string, unknown> | null
  const medGuidedAnswers = medMetadata?.guided_answers as Record<string, unknown> | null

  const intakeMetadata = intakeResult.data?.metadata as Record<string, unknown> | null

  // Existing hospital lien check (all states, settlement phase only)
  const hasHospitalLien = isSettlementPhase && medGuidedAnswers?.lien_filed === 'yes'
  const hospitalName = (medGuidedAnswers?.lien_hospital_name as string) || 'Unknown Provider'
  const lienAmount = medGuidedAnswers?.lien_amount as string | undefined

  // CA-specific checks
  const prop213Applies = isCA && intakeMetadata?.prop_213_applies === true
  const hasMediCalLien = isCA && medGuidedAnswers?.medi_cal_paid === 'yes'
  const hasMedicareLien = isCA && medGuidedAnswers?.medicare_paid === 'yes'
  const hasGovHealthLien = hasMediCalLien || hasMedicareLien

  // If nothing to show, bail out
  if (!hasHospitalLien && !prop213Applies && !(isCA && isSettlementPhase) && !hasGovHealthLien) return null

  const warnings: React.ReactNode[] = []

  // 1. Prop 213 warning (CA, all phases)
  if (prop213Applies) {
    warnings.push(
      <div key="prop213" className="rounded-lg border-l-4 border-l-amber-500 bg-amber-50 px-4 py-3">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0 text-calm-amber" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-700">Proposition 213</p>
            <p className="text-sm text-warm-text mt-1">
              Your recovery is limited to economic damages only (medical bills, lost wages,
              property damage). Non-economic damages (pain &amp; suffering) are not available
              because you did not have valid insurance at the time of the accident.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // 2. Hospital lien warning (all states, settlement phase)
  if (hasHospitalLien) {
    warnings.push(
      <div key="hospital-lien" className="rounded-lg border-l-4 border-l-amber-500 bg-amber-50 px-4 py-3">
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

  // 3. Medi-Cal/Medicare lien warning (CA only)
  if (hasGovHealthLien) {
    const programs: string[] = []
    if (hasMediCalLien) programs.push('Medi-Cal')
    if (hasMedicareLien) programs.push('Medicare')
    const programLabel = programs.join('/')

    warnings.push(
      <div key="gov-health-lien" className="rounded-lg border-l-4 border-l-amber-500 bg-amber-50 px-4 py-3">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0 text-calm-amber" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-700">Government Health Lien</p>
            <p className="text-sm text-warm-text mt-1">
              {programLabel} liens must be satisfied from your settlement before you receive
              any funds. Contact {hasMediCalLien ? 'DHCS (Medi-Cal)' : ''}{hasMediCalLien && hasMedicareLien ? ' or ' : ''}{hasMedicareLien ? 'BCRC (Medicare)' : ''} to
              determine your lien amount.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // 4. Howell reminder (CA, settlement phase only)
  if (isCA && isSettlementPhase) {
    warnings.push(
      <div key="howell" className="rounded-lg border-l-4 border-l-blue-400 bg-blue-50 px-4 py-3">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 mt-0.5 shrink-0 text-blue-500" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-blue-700">California Rule (Howell v. Hamilton Meats)</p>
            <p className="text-sm text-warm-text mt-1">
              Your recoverable medical damages are limited to amounts actually paid or incurred,
              not full billed amounts. Make sure your settlement calculations use paid amounts,
              not billed amounts.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (warnings.length === 0) return null

  return <div className="space-y-3">{warnings}</div>
}
