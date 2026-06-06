'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const SKIPPABLE_TASKS = new Set([
  'prepare_pi_demand_letter',
  'pi_settlement_negotiation',
  'sc_demand_letter',
  're_demand_letter',
  're_negotiation',
  'biz_partnership_demand_letter',
  'biz_partnership_adr',
  'biz_employment_demand_letter',
  'biz_employment_eeoc',
  'biz_b2b_demand_letter',
  'biz_b2b_negotiation',
  'prepare_lt_demand_letter',
  'preservation_letter',
  'contract_demand_letter',
  'contract_negotiation',
  'contract_mediation',
  'fdcpa_check',
  'debt_sol_check',
  'debt_answer_prep',
  'lt_repair_request',
  'lt_eviction_response',
  'lt_habitability_checklist',
  'lt_repair_and_deduct',
  'lt_illegal_lockout',
  'lt_lease_termination',
  'lt_appeal_guide',
  'lt_writ_of_possession',
  'fdcpa_counterclaim_guide',
  'debt_motion_to_dismiss',
  'debt_default_recovery',
  'debt_settlement_guide',
  'debt_validation_response',
  'debt_evidence_rules',
  'debt_continuance_request',
  'debt_witness_prep',
  'debt_credit_dispute',
  'sc_settlement_guide',
  'sc_default_judgment',
  'sc_counterclaim_defense',
  'sc_appeal_guide',
  're_title_defect_analysis',
  're_seller_disclosure',
  're_earnest_money',
  're_construction_defect',
  're_failed_closing',
  're_adverse_possession',
  'biz_wrongful_termination',
  'biz_wage_theft',
  'biz_non_compete',
  'biz_b2b_contract_breach',
  'biz_b2b_trade_secrets',
  'biz_partnership_fiduciary',
  'biz_partnership_accounting',
  'contract_defenses_guide',
  'contract_settlement_guide',
  'property_insurance_guide',
  'property_mediation_guide',
  'property_pretrial_motions',
  'pi_court_selection',
  'pi_pip_claim',
  'pi_comparative_fault',
  'pi_expert_witness_guide',
  'pi_lien_resolution',
  'family_discovery_guide',
  'family_temp_orders_prep',
  'family_property_division_guide',
  'family_custody_factors',
  'family_uncontested_path',
])

interface NextStepCardProps {
  caseId: string
  nextTask: {
    id: string
    task_key: string
    title: string
    status: string
  } | null
  taskDescription?: { description: string; importance: 'critical' | 'important' | 'helpful' } | null
  daysUntilDue?: number | null
}

export function NextStepCard({ caseId, nextTask, taskDescription, daysUntilDue }: NextStepCardProps) {
  const router = useRouter()
  const [skipping, setSkipping] = useState(false)

  async function handleSkip() {
    if (!nextTask || skipping) return
    setSkipping(true)
    try {
      const res = await fetch(`/api/tasks/${nextTask.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'skipped',
          metadata: { skip_reason: 'already_filed_petition' },
        }),
      })
      if (!res.ok) throw new Error('Failed to skip')
      router.refresh()
    } catch {
      setSkipping(false)
    }
  }

  if (!nextTask) {
    return (
      <div className="rounded-xl border border-calm-green/30 bg-calm-green/5 p-6 text-center">
        <p className="text-warm-muted">You&apos;re all caught up. Nice work!</p>
      </div>
    )
  }

  const importanceColor = taskDescription?.importance === 'critical' || taskDescription?.importance === 'important'
    ? 'text-calm-amber'
    : 'text-white/60'
  const importanceLabel = taskDescription?.importance === 'critical'
    ? 'CRITICAL'
    : taskDescription?.importance === 'important'
    ? 'IMPORTANT'
    : 'TODAY\'S NEXT STEP'

  return (
    <div className="rounded-xl bg-calm-indigo text-white overflow-hidden">
      <div className="p-6 flex items-center gap-6">
        {/* Countdown number */}
        {daysUntilDue !== null && daysUntilDue !== undefined && (
          <>
            <div className="shrink-0 text-center w-16">
              <p className="text-5xl font-bold tabular-nums leading-none text-white">
                {daysUntilDue}
              </p>
              <p className="text-xs font-medium text-white/60 uppercase tracking-wider mt-1">
                days{'\n'}left
              </p>
            </div>
            <div className="w-px h-16 bg-white/20 shrink-0" />
          </>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-medium uppercase tracking-wider mb-1 ${importanceColor}`}>
            {importanceLabel}
          </p>
          <h3 className="text-lg font-semibold text-white leading-snug mb-1">
            {nextTask.title}
          </h3>
          {taskDescription?.description && (
            <p className="text-sm text-white/70 line-clamp-2">
              {taskDescription.description}
            </p>
          )}
        </div>

        {/* CTA */}
        <div className="shrink-0">
          <Link
            href={`/case/${caseId}/step/${nextTask.id}`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 hover:bg-white/25 transition-colors px-4 py-2.5 text-sm font-medium text-white"
          >
            Review &amp; continue
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>

      {SKIPPABLE_TASKS.has(nextTask.task_key) && (
        <div className="px-6 pb-4">
          <button
            onClick={handleSkip}
            disabled={skipping}
            className="text-xs text-white/50 hover:text-white/80 transition-colors"
          >
            {skipping ? 'Skipping...' : 'Already done this? Skip this step'}
          </button>
        </div>
      )}
    </div>
  )
}
