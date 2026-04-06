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
  const isPA = jurisdiction === 'PA'
  const isSettlementPhase = !!nextTaskKey && SETTLEMENT_PHASE_TASKS.has(nextTaskKey)

  // Non-CA/PA cases only show warnings during settlement phase
  if (!isCA && !isPA && !isSettlementPhase) return null

  const supabase = await createClient()

  // Fetch pi_medical_records, pi_intake, and prepare_pi_petition metadata in parallel
  const [medicalResult, intakeResult, petitionResult] = await Promise.all([
    supabase
      .from('tasks')
      .select('metadata')
      .eq('case_id', caseId)
      .eq('task_key', 'pi_medical_records')
      .limit(1)
      .maybeSingle(),
    isCA || isPA
      ? supabase
          .from('tasks')
          .select('metadata')
          .eq('case_id', caseId)
          .eq('task_key', 'pi_intake')
          .limit(1)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    isPA
      ? supabase
          .from('tasks')
          .select('metadata')
          .eq('case_id', caseId)
          .eq('task_key', 'prepare_pi_petition')
          .limit(1)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ])

  const medMetadata = medicalResult.data?.metadata as Record<string, unknown> | null
  const medGuidedAnswers = medMetadata?.guided_answers as Record<string, unknown> | null

  const intakeMetadata = intakeResult.data?.metadata as Record<string, unknown> | null
  const petitionMetadata = petitionResult.data?.metadata as Record<string, unknown> | null

  // Existing hospital lien check (all states, settlement phase only)
  const hasHospitalLien = isSettlementPhase && medGuidedAnswers?.lien_filed === 'yes'
  const hospitalName = (medGuidedAnswers?.lien_hospital_name as string) || 'Unknown Provider'
  const lienAmount = medGuidedAnswers?.lien_amount as string | undefined

  // CA-specific checks
  const prop213Applies = isCA && intakeMetadata?.prop_213_applies === true
  const hasMediCalLien = isCA && medGuidedAnswers?.medi_cal_paid === 'yes'
  const hasMedicareLien = isCA && medGuidedAnswers?.medicare_paid === 'yes'
  const hasGovHealthLien = hasMediCalLien || hasMedicareLien

  // PA-specific checks
  const limitedTortApplies = isPA && intakeMetadata?.limited_tort_applies === true
  const firstPartyNotFiled = isPA && (medGuidedAnswers?.first_party_filed === 'no' || !medGuidedAnswers?.first_party_filed)
  const govImmunityScheme = isPA ? (intakeMetadata?.govt_immunity_scheme as string | undefined) : undefined
  const petitionGuidedAnswers = petitionMetadata?.guided_answers as Record<string, unknown> | null
  const isUnderArbitrationThreshold = isPA && petitionGuidedAnswers?.claim_amount_check === 'no_under'

  // If nothing to show, bail out
  const hasPAWarnings = limitedTortApplies || (isPA && firstPartyNotFiled) || !!govImmunityScheme || isUnderArbitrationThreshold
  if (!hasHospitalLien && !prop213Applies && !(isCA && isSettlementPhase) && !hasGovHealthLien && !hasPAWarnings) return null

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

  // 5. Limited Tort warning (PA, all phases)
  if (limitedTortApplies) {
    warnings.push(
      <div key="limited-tort" className="rounded-lg border-l-4 border-l-amber-500 bg-amber-50 px-4 py-3">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0 text-calm-amber" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-700">Limited Tort</p>
            <p className="text-sm text-warm-text mt-1">
              Your recovery is limited to economic damages only (medical bills, lost wages).
              Non-economic damages (pain &amp; suffering) are only available if your injuries
              meet Pennsylvania&apos;s &ldquo;serious injury&rdquo; threshold &mdash; death, serious impairment
              of body function, or permanent serious disfigurement (75 Pa.C.S. &sect;1705).
            </p>
          </div>
        </div>
      </div>
    )
  }

  // 6. First-Party Benefits reminder (PA, until filed)
  if (isPA && firstPartyNotFiled) {
    warnings.push(
      <div key="first-party-benefits" className="rounded-lg border-l-4 border-l-blue-400 bg-blue-50 px-4 py-3">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 mt-0.5 shrink-0 text-blue-500" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-blue-700">PA First-Party Benefits</p>
            <p className="text-sm text-warm-text mt-1">
              File a first-party benefits claim with your own auto insurer immediately.
              These benefits cover medical expenses regardless of fault, and your insurer
              cannot seek reimbursement from your settlement (75 Pa.C.S. &sect;1720).
            </p>
          </div>
        </div>
      </div>
    )
  }

  // 7. Government Damages Cap warning (PA, all phases)
  if (govImmunityScheme) {
    const isCommonwealth = govImmunityScheme === 'commonwealth'
    const entityLabel = isCommonwealth ? 'the Commonwealth' : 'a political subdivision'
    const capAmount = isCommonwealth ? '$250,000 per person' : '$500,000 per occurrence'
    const statuteSection = isCommonwealth ? '8528' : '8553'

    warnings.push(
      <div key="govt-damages-cap" className="rounded-lg border-l-4 border-l-amber-500 bg-amber-50 px-4 py-3">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0 text-calm-amber" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-700">Government Damages Cap</p>
            <p className="text-sm text-warm-text mt-1">
              Your recovery against {entityLabel} is capped at {capAmount} (42
              Pa.C.S. &sect;{statuteSection}).
            </p>
          </div>
        </div>
      </div>
    )
  }

  // 8. Compulsory Arbitration notice (PA, approaching filing)
  if (isUnderArbitrationThreshold) {
    warnings.push(
      <div key="compulsory-arbitration" className="rounded-lg border-l-4 border-l-blue-400 bg-blue-50 px-4 py-3">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 mt-0.5 shrink-0 text-blue-500" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-blue-700">Compulsory Arbitration</p>
            <p className="text-sm text-warm-text mt-1">
              Your claim is under $50,000. It will be routed to arbitration first.
              Either party can appeal for a full trial within 30 days of the arbitration award.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (warnings.length === 0) return null

  return <div className="space-y-3">{warnings}</div>
}
