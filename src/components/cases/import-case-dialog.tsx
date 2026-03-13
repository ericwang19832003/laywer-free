'use client'

import { useReducer, useState, useRef, useCallback, useEffect } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { type DisputeType } from '@/lib/rules/court-recommendation'
import type { State, PiSubType } from '@/lib/schemas/case'
import { getMilestones } from '@/lib/rules/milestones'
import { WizardProgress } from './wizard/wizard-progress'
import { StateStep } from './wizard/state-step'
import { RoleStep } from './wizard/role-step'
import { DisputeTypeStep } from './wizard/dispute-type-step'
import { MilestoneStep } from './wizard/milestone-step'
import { CatchUpStep, type CatchUpData } from './wizard/catch-up-step'
import { RecommendationStep } from './wizard/recommendation-step'
import {
  FamilySubTypeStep,
  type FamilySubType,
} from './wizard/family-sub-type-step'
import {
  SmallClaimsSubTypeStep,
  type SmallClaimsSubType,
} from './wizard/small-claims-sub-type-step'
import {
  LandlordTenantSubTypeStep,
  type LandlordTenantSubType,
} from './wizard/landlord-tenant-sub-type-step'
import { DebtSideStep, type DebtSide } from './wizard/debt-side-step'
import { DebtSubTypeStep, type DebtSubType } from './wizard/debt-sub-type-step'
import { PISubTypeStep } from './wizard/pi-sub-type-step'

// -- Helpers ------------------------------------------------------------------

/**
 * Types that have a sub-type selection step between dispute-type and milestone.
 */
const HAS_SUB_TYPE = new Set<DisputeType>([
  'family',
  'small_claims',
  'landlord_tenant',
  'personal_injury',
  'debt_collection',
])

/**
 * Total wizard steps:
 * - Steps 1-3: state, role, dispute type (always)
 * - Step 4: sub-type OR milestone (depends on dispute type)
 * - With sub-type: 4=sub-type, 5=milestone, 6=catch-up, 7=recommendation → 7
 *   - debt_collection: 4=debt-side, 5=debt-sub-type, 6=milestone, 7=catch-up, 8=recommendation → 8
 * - Without sub-type: 4=milestone, 5=catch-up, 6=recommendation → 6
 */
function getTotalSteps(disputeType: DisputeType | ''): number {
  if (!disputeType) return 6
  if (disputeType === 'debt_collection') return 8
  if (HAS_SUB_TYPE.has(disputeType)) return 7
  return 6
}

/**
 * Returns the step number for the milestone picker.
 */
function getMilestoneStepNumber(disputeType: DisputeType | ''): number {
  if (disputeType === 'debt_collection') return 6
  if (disputeType && HAS_SUB_TYPE.has(disputeType)) return 5
  return 4
}

/**
 * Returns the step number for the catch-up form.
 */
function getCatchUpStepNumber(disputeType: DisputeType | ''): number {
  return getMilestoneStepNumber(disputeType) + 1
}

/**
 * Returns the step number for the recommendation step.
 */
function getRecommendationStepNumber(disputeType: DisputeType | ''): number {
  return getCatchUpStepNumber(disputeType) + 1
}

/**
 * Simplified court recommendation for import flow.
 * Mid-litigation users generally know their court already,
 * so we provide a reasonable default with medium confidence.
 */
function getRecommendation(
  disputeType: DisputeType | '',
  selectedState: State
) {
  const isCA = selectedState === 'CA'
  const isNY = selectedState === 'NY'
  const isFL = selectedState === 'FL'
  const isPA = selectedState === 'PA'

  if (disputeType === 'family') {
    return {
      recommended: isPA
        ? ('pa_common_pleas' as const)
        : isFL
          ? ('fl_circuit' as const)
          : isNY
            ? ('ny_supreme' as const)
            : isCA
              ? ('unlimited_civil' as const)
              : ('district' as const),
      reasoning: 'Family law cases are typically heard in the state\'s primary trial court.',
      confidence: 'high' as const,
    }
  }

  if (disputeType === 'small_claims') {
    return {
      recommended: isPA
        ? ('pa_magisterial' as const)
        : isFL
          ? ('fl_small_claims' as const)
          : isNY
            ? ('ny_small_claims' as const)
            : isCA
              ? ('small_claims' as const)
              : ('jp' as const),
      reasoning: 'Small claims cases are filed in the dedicated small claims court.',
      confidence: 'high' as const,
    }
  }

  // Default: district / primary trial court
  return {
    recommended: isPA
      ? ('pa_common_pleas' as const)
      : isFL
        ? ('fl_circuit' as const)
        : isNY
          ? ('ny_supreme' as const)
          : isCA
            ? ('unlimited_civil' as const)
            : ('district' as const),
    reasoning: 'Most civil cases are heard in the state\'s primary trial court. You can override this if your case is in a different court.',
    confidence: 'moderate' as const,
  }
}

// -- State / Reducer ----------------------------------------------------------

interface ImportWizardState {
  step: number
  selectedState: State | ''
  role: 'plaintiff' | 'defendant' | ''
  disputeType: DisputeType | ''
  familySubType: FamilySubType | ''
  smallClaimsSubType: SmallClaimsSubType | ''
  landlordTenantSubType: LandlordTenantSubType | ''
  debtSide: DebtSide | ''
  debtSubType: DebtSubType | ''
  piSubType: PiSubType | ''
  milestone: string
  catchUp: CatchUpData
  county: string
}

type ImportWizardAction =
  | { type: 'SET_STATE'; selectedState: State }
  | { type: 'SET_ROLE'; role: 'plaintiff' | 'defendant' }
  | { type: 'SET_DISPUTE_TYPE'; disputeType: DisputeType }
  | { type: 'SET_FAMILY_SUB_TYPE'; familySubType: FamilySubType }
  | { type: 'SET_SMALL_CLAIMS_SUB_TYPE'; smallClaimsSubType: SmallClaimsSubType }
  | { type: 'SET_LANDLORD_TENANT_SUB_TYPE'; landlordTenantSubType: LandlordTenantSubType }
  | { type: 'SET_DEBT_SIDE'; debtSide: DebtSide }
  | { type: 'SET_DEBT_SUB_TYPE'; debtSubType: DebtSubType }
  | { type: 'SET_PI_SUB_TYPE'; payload: PiSubType }
  | { type: 'SET_MILESTONE'; milestone: string }
  | { type: 'SET_CATCH_UP'; catchUp: CatchUpData }
  | { type: 'SET_COUNTY'; county: string }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'RESET' }

const initialCatchUp: CatchUpData = {
  caseNumber: '',
  opposingParty: '',
  filingDate: '',
  serviceDate: '',
  upcomingDeadlineLabel: '',
  upcomingDeadlineDate: '',
}

const initialState: ImportWizardState = {
  step: 1,
  selectedState: '',
  role: '',
  disputeType: '',
  familySubType: '',
  smallClaimsSubType: '',
  landlordTenantSubType: '',
  debtSide: '',
  debtSubType: '',
  piSubType: '',
  milestone: '',
  catchUp: initialCatchUp,
  county: '',
}

function reducer(state: ImportWizardState, action: ImportWizardAction): ImportWizardState {
  switch (action.type) {
    case 'SET_STATE':
      return { ...state, selectedState: action.selectedState, step: 2 }
    case 'SET_ROLE':
      return { ...state, role: action.role, step: 3 }
    case 'SET_DISPUTE_TYPE':
      return {
        ...state,
        disputeType: action.disputeType,
        role: action.disputeType === 'personal_injury' ? 'plaintiff' : state.role,
        familySubType: action.disputeType === 'family' ? state.familySubType : '',
        smallClaimsSubType: action.disputeType === 'small_claims' ? state.smallClaimsSubType : '',
        landlordTenantSubType: action.disputeType === 'landlord_tenant' ? state.landlordTenantSubType : '',
        debtSide: action.disputeType === 'debt_collection' ? state.debtSide : '',
        debtSubType: action.disputeType === 'debt_collection' ? state.debtSubType : '',
        piSubType: action.disputeType === 'personal_injury' ? state.piSubType : '',
        milestone: '',
        step: 4,
      }
    case 'SET_FAMILY_SUB_TYPE':
      return { ...state, familySubType: action.familySubType, step: state.step + 1 }
    case 'SET_SMALL_CLAIMS_SUB_TYPE':
      return { ...state, smallClaimsSubType: action.smallClaimsSubType, step: state.step + 1 }
    case 'SET_LANDLORD_TENANT_SUB_TYPE':
      return { ...state, landlordTenantSubType: action.landlordTenantSubType, step: state.step + 1 }
    case 'SET_DEBT_SIDE':
      return { ...state, debtSide: action.debtSide, step: state.step + 1 }
    case 'SET_DEBT_SUB_TYPE':
      return { ...state, debtSubType: action.debtSubType, step: state.step + 1 }
    case 'SET_PI_SUB_TYPE':
      return { ...state, piSubType: action.payload, step: state.step + 1 }
    case 'SET_MILESTONE':
      return { ...state, milestone: action.milestone, step: state.step + 1 }
    case 'SET_CATCH_UP':
      return { ...state, catchUp: action.catchUp }
    case 'SET_COUNTY':
      return { ...state, county: action.county }
    case 'NEXT_STEP':
      return {
        ...state,
        step: Math.min(state.step + 1, getTotalSteps(state.disputeType)),
      }
    case 'PREV_STEP':
      return { ...state, step: Math.max(state.step - 1, 1) }
    case 'RESET':
      return initialState
    default:
      return state
  }
}

// -- Component ----------------------------------------------------------------

export function ImportCaseDialog() {
  const [open, setOpen] = useState(false)
  const [state, dispatch] = useReducer(reducer, initialState)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const totalSteps = getTotalSteps(state.disputeType)
  const milestoneStep = getMilestoneStepNumber(state.disputeType)
  const catchUpStep = getCatchUpStepNumber(state.disputeType)
  const recommendationStep = getRecommendationStepNumber(state.disputeType)

  const selectedState: State = state.selectedState || 'TX'
  const recommendation = getRecommendation(state.disputeType, selectedState)

  const isFamily = state.disputeType === 'family'
  const isSmallClaims = state.disputeType === 'small_claims'
  const isPersonalInjury = state.disputeType === 'personal_injury'
  const isLandlordTenant = state.disputeType === 'landlord_tenant'
  const isDebtCollection = state.disputeType === 'debt_collection'

  async function handleAccept(courtOverride: string | null) {
    if (!state.role) return

    setLoading(true)
    setError(null)

    const stateCode = state.selectedState || 'TX'
    const courtType = courtOverride ?? recommendation.recommended

    const debtSubTypePayload = isDebtCollection && state.debtSubType
      ? { debt_sub_type: state.debtSubType }
      : {}

    try {
      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      // Step 1: Create the case
      const res = await fetch('/api/cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token
            ? { Authorization: `Bearer ${session.access_token}` }
            : {}),
        },
        body: JSON.stringify({
          state: stateCode,
          role: state.role,
          court_type: courtType,
          ...(state.disputeType ? { dispute_type: state.disputeType } : {}),
          ...(state.county.trim() ? { county: state.county.trim() } : {}),
          ...(isFamily && state.familySubType
            ? { family_sub_type: state.familySubType }
            : {}),
          ...(isSmallClaims && state.smallClaimsSubType
            ? { small_claims_sub_type: state.smallClaimsSubType }
            : {}),
          ...(isLandlordTenant && state.landlordTenantSubType
            ? { landlord_tenant_sub_type: state.landlordTenantSubType }
            : {}),
          ...debtSubTypePayload,
          ...(isPersonalInjury && state.piSubType
            ? { pi_sub_type: state.piSubType }
            : {}),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Something went wrong. Please try again.')
        setLoading(false)
        return
      }

      const data = await res.json()

      // Step 2: If not starting fresh, call the import endpoint
      if (state.milestone && state.milestone !== 'start') {
        const importRes = await fetch(`/api/cases/${data.case.id}/import`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(session?.access_token
              ? { Authorization: `Bearer ${session.access_token}` }
              : {}),
          },
          body: JSON.stringify({
            milestone: state.milestone,
            disputeType: state.disputeType,
            catchUp: state.catchUp,
          }),
        })

        if (!importRes.ok) {
          // Non-fatal: case was created, import just adds metadata
          // Navigate anyway so user isn't stuck
          console.error('Import endpoint failed, continuing to case')
        }
      }

      setOpen(false)
      router.push(`/case/${data.case.id}`)
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    if (!nextOpen) {
      dispatch({ type: 'RESET' })
      setError(null)
      setLoading(false)
    }
  }

  // -- Milestones for the current dispute type --------------------------------

  const milestones = state.disputeType
    ? getMilestones(state.disputeType, state.familySubType || undefined)
    : []

  // -- Scroll handling (same pattern as new-case-dialog) ----------------------

  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollUp, setCanScrollUp] = useState(false)
  const [canScrollDown, setCanScrollDown] = useState(false)

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollUp(el.scrollTop > 0)
    setCanScrollDown(el.scrollTop + el.clientHeight < el.scrollHeight - 1)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTop = 0
    requestAnimationFrame(updateScrollState)
  }, [state.step, updateScrollState])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const ro = new ResizeObserver(updateScrollState)
    ro.observe(el)
    return () => ro.disconnect()
  }, [updateScrollState])

  function scrollBy(delta: number) {
    scrollRef.current?.scrollBy({ top: delta, behavior: 'smooth' })
  }

  // -- Render -----------------------------------------------------------------

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Import Existing Case
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Import an existing case</DialogTitle>
          <DialogDescription>
            Already have a case in progress? We&apos;ll pick up where you left off.
          </DialogDescription>
        </DialogHeader>

        <WizardProgress
          currentStep={state.step}
          totalSteps={totalSteps}
          onBack={() => dispatch({ type: 'PREV_STEP' })}
        />

        <div className="relative min-h-0 flex-1">
          {canScrollUp && (
            <div className="pointer-events-none absolute top-0 left-0 right-0 z-10 h-6 bg-gradient-to-b from-background to-transparent" />
          )}

          <div
            ref={scrollRef}
            onScroll={updateScrollState}
            className="overflow-y-auto max-h-full pr-1"
            style={{ maxHeight: 'calc(85vh - 180px)' }}
          >

        {/* Step 1: State selection */}
        {state.step === 1 && (
          <StateStep
            value={state.selectedState}
            onSelect={(s) => dispatch({ type: 'SET_STATE', selectedState: s })}
          />
        )}

        {/* Step 2: Role selection */}
        {state.step === 2 && (
          <RoleStep
            value={state.role}
            disputeType={state.disputeType || undefined}
            onSelect={(role) => dispatch({ type: 'SET_ROLE', role })}
          />
        )}

        {/* Step 3: Dispute type */}
        {state.step === 3 && (
          <DisputeTypeStep
            value={state.disputeType}
            selectedState={selectedState}
            onSelect={(disputeType) =>
              dispatch({ type: 'SET_DISPUTE_TYPE', disputeType })
            }
          />
        )}

        {/* Step 4: Sub-type steps (for types that have them) */}
        {state.step === 4 && isFamily && (
          <FamilySubTypeStep
            value={state.familySubType}
            onSelect={(familySubType) =>
              dispatch({ type: 'SET_FAMILY_SUB_TYPE', familySubType })
            }
          />
        )}

        {state.step === 4 && isSmallClaims && (
          <SmallClaimsSubTypeStep
            value={state.smallClaimsSubType}
            selectedState={selectedState}
            onSelect={(smallClaimsSubType) =>
              dispatch({ type: 'SET_SMALL_CLAIMS_SUB_TYPE', smallClaimsSubType })
            }
          />
        )}

        {state.step === 4 && isLandlordTenant && (
          <LandlordTenantSubTypeStep
            value={state.landlordTenantSubType}
            onSelect={(landlordTenantSubType) =>
              dispatch({ type: 'SET_LANDLORD_TENANT_SUB_TYPE', landlordTenantSubType })
            }
          />
        )}

        {state.step === 4 && isPersonalInjury && (
          <PISubTypeStep
            value={state.piSubType}
            onSelect={(t) => dispatch({ type: 'SET_PI_SUB_TYPE', payload: t })}
          />
        )}

        {state.step === 4 && isDebtCollection && (
          <DebtSideStep
            value={state.debtSide}
            onSelect={(debtSide) =>
              dispatch({ type: 'SET_DEBT_SIDE', debtSide })
            }
          />
        )}

        {/* Debt collection step 5: debt sub-type */}
        {state.step === 5 && isDebtCollection && (
          <DebtSubTypeStep
            value={state.debtSubType}
            side={state.debtSide || 'defendant'}
            onSelect={(debtSubType) =>
              dispatch({ type: 'SET_DEBT_SUB_TYPE', debtSubType })
            }
          />
        )}

        {/* Milestone step (step number varies by dispute type) */}
        {state.step === milestoneStep && !isFamily && !isSmallClaims && !isPersonalInjury && !isLandlordTenant && !isDebtCollection && (
          <MilestoneStep
            milestones={milestones}
            value={state.milestone}
            onSelect={(milestone) =>
              dispatch({ type: 'SET_MILESTONE', milestone })
            }
          />
        )}

        {state.step === milestoneStep && isFamily && (
          <MilestoneStep
            milestones={milestones}
            value={state.milestone}
            onSelect={(milestone) =>
              dispatch({ type: 'SET_MILESTONE', milestone })
            }
          />
        )}

        {state.step === milestoneStep && isSmallClaims && (
          <MilestoneStep
            milestones={milestones}
            value={state.milestone}
            onSelect={(milestone) =>
              dispatch({ type: 'SET_MILESTONE', milestone })
            }
          />
        )}

        {state.step === milestoneStep && isLandlordTenant && (
          <MilestoneStep
            milestones={milestones}
            value={state.milestone}
            onSelect={(milestone) =>
              dispatch({ type: 'SET_MILESTONE', milestone })
            }
          />
        )}

        {state.step === milestoneStep && isPersonalInjury && (
          <MilestoneStep
            milestones={milestones}
            value={state.milestone}
            onSelect={(milestone) =>
              dispatch({ type: 'SET_MILESTONE', milestone })
            }
          />
        )}

        {state.step === milestoneStep && isDebtCollection && (
          <MilestoneStep
            milestones={milestones}
            value={state.milestone}
            onSelect={(milestone) =>
              dispatch({ type: 'SET_MILESTONE', milestone })
            }
          />
        )}

        {/* Catch-up step */}
        {state.step === catchUpStep && (
          <CatchUpStep
            value={state.catchUp}
            onChange={(catchUp) => dispatch({ type: 'SET_CATCH_UP', catchUp })}
            onContinue={() => dispatch({ type: 'NEXT_STEP' })}
          />
        )}

        {/* Recommendation step (final) */}
        {state.step === recommendationStep && (
          <RecommendationStep
            recommendation={recommendation}
            selectedState={selectedState}
            county={state.county}
            onCountyChange={(county) => dispatch({ type: 'SET_COUNTY', county })}
            onAccept={handleAccept}
            loading={loading}
          />
        )}

          </div>

          {canScrollDown && (
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-6 bg-gradient-to-t from-background to-transparent" />
          )}

          {canScrollUp && (
            <button
              type="button"
              onClick={() => scrollBy(-200)}
              className="absolute top-1 right-3 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-background/80 border border-warm-border shadow-sm hover:bg-background transition-colors"
              aria-label="Scroll up"
            >
              <ChevronUp className="h-4 w-4 text-warm-muted" />
            </button>
          )}

          {canScrollDown && (
            <button
              type="button"
              onClick={() => scrollBy(200)}
              className="absolute bottom-1 right-3 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-background/80 border border-warm-border shadow-sm hover:bg-background transition-colors"
              aria-label="Scroll down"
            >
              <ChevronDown className="h-4 w-4 text-warm-muted" />
            </button>
          )}
        </div>

        {error && <p className="text-sm text-calm-amber">{error}</p>}
      </DialogContent>
    </Dialog>
  )
}
