import { createClient } from '@/lib/supabase/server'
import { SolBanner } from '@/components/dashboard/sol-banner'
import { FilingInstructionsCard } from '@/components/dashboard/filing-instructions-card'
import { calculateSol } from '@lawyer-free/shared/rules/statute-of-limitations'
import { getPriorityCards } from '@/lib/dashboard-card-priority'

const INTAKE_KEYS = [
  'pi_intake', 'small_claims_intake', 'lt_intake', 'family_intake',
  'contract_intake', 'property_dispute_intake', 'other_dispute_intake',
  're_intake', 'business_intake', 'intake', 'debt_defense_intake',
] as const

interface PriorityBannersProps {
  caseId: string
  disputeType: string
  jurisdiction: string
  courtType: string
  county: string | null
  /**
   * 'focus' — render banners that ARE in the priority list (promoted).
   * 'overview' — render banners that are NOT in the priority list (secondary).
   */
  placement: 'focus' | 'overview'
}

export async function PriorityBanners({
  caseId,
  disputeType,
  jurisdiction,
  courtType,
  county,
  placement,
}: PriorityBannersProps) {
  const priorityCards = getPriorityCards(disputeType)

  const showSol =
    placement === 'focus'
      ? priorityCards.includes('sol_banner')
      : !priorityCards.includes('sol_banner')

  const showFiling =
    placement === 'focus'
      ? priorityCards.includes('filing_instructions')
      : !priorityCards.includes('filing_instructions')

  if (!showSol && !showFiling) return null

  // Fetch intake data for SOL calculation only when needed
  let solResult: {
    years: number | null
    expiresAt: string | null
    daysRemaining: number | null
    level: 'critical' | 'warning' | 'expired' | 'caution' | 'safe' | 'not_applicable'
    notes: string | null
  } | null = null

  if (showSol) {
    const supabase = await createClient()
    const { data: intakeTask } = await supabase
      .from('tasks')
      .select('metadata')
      .eq('case_id', caseId)
      .in('task_key', [...INTAKE_KEYS])
      .eq('status', 'completed')
      .limit(1)
      .maybeSingle()

    const intakeMeta = intakeTask?.metadata as Record<string, unknown> | null
    const incidentDate =
      (intakeMeta?.incident_date as string) ??
      (intakeMeta?.contract_date as string) ??
      (intakeMeta?.lease_start_date as string) ??
      (intakeMeta?.separation_date as string) ??
      null

    const rawSol = calculateSol(jurisdiction, disputeType, null, incidentDate)
    const level = rawSol.level as NonNullable<typeof solResult>['level']
    solResult = { ...rawSol, level, expiresAt: rawSol.expiresAt?.toISOString() ?? null }
  }

  return (
    <>
      {showSol && solResult && (
        <SolBanner caseId={caseId} sol={solResult} disputeType={disputeType} state={jurisdiction} />
      )}
      {showFiling && (
        <FilingInstructionsCard state={jurisdiction} courtType={courtType} county={county} disputeType={disputeType} />
      )}
    </>
  )
}
