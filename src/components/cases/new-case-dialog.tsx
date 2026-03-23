'use client'

import { useReducer, useState, useRef, useCallback, useEffect } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useSubscription } from '@/hooks/use-subscription'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useUpgradeGateContext } from '@/components/subscription/upgrade-gate-provider'
import {
  recommendCourt,
  type DisputeType,
  type AmountRange,
  type CircumstanceFlags,
} from '@/lib/rules/court-recommendation'
import type { State } from '@/lib/schemas/case'
import { WizardProgress } from './wizard/wizard-progress'
import { StateStep } from './wizard/state-step'
import { RoleStep } from './wizard/role-step'
import { DisputeTypeStep } from './wizard/dispute-type-step'
import { AmountStep } from './wizard/amount-step'
import { CircumstancesStep } from './wizard/circumstances-step'
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
import { BusinessSubTypeStep } from './wizard/business-sub-type-step'
import type { PiSubType, BusinessSubType } from '@/lib/schemas/case'

function getTotalSteps(disputeType: DisputeType | '', landlordTenantSubType?: string, debtSide?: string): number {
  if (disputeType === 'family') return 5
  if (disputeType === 'business') return 5
  if (disputeType === 'small_claims') return 5
  if (disputeType === 'personal_injury') return 6
  if (disputeType === 'landlord_tenant') {
    return landlordTenantSubType === 'eviction' ? 5 : 6
  }
  if (disputeType === 'debt_collection') {
    // Both plaintiff and defendant now get sub-type step
    if (debtSide === 'plaintiff') return 8
    return 7
  }
  return 6
}

interface WizardState {
  step: number
  selectedState: State | ''
  role: 'plaintiff' | 'defendant' | ''
  disputeType: DisputeType | ''
  familySubType: FamilySubType | ''
  businessSubType: BusinessSubType | ''
  smallClaimsSubType: SmallClaimsSubType | ''
  landlordTenantSubType: LandlordTenantSubType | ''
  debtSide: DebtSide | ''
  debtSubType: DebtSubType | ''
  piSubType: PiSubType | ''
  amount: AmountRange | ''
  circumstances: CircumstanceFlags
  county: string
}

type WizardAction =
  | { type: 'SET_STATE'; selectedState: State }
  | { type: 'SET_ROLE'; role: 'plaintiff' | 'defendant' }
  | { type: 'SET_DISPUTE_TYPE'; disputeType: DisputeType }
  | { type: 'SET_FAMILY_SUB_TYPE'; familySubType: FamilySubType }
  | { type: 'SET_BUSINESS_SUB_TYPE'; businessSubType: BusinessSubType }
  | { type: 'SET_SMALL_CLAIMS_SUB_TYPE'; smallClaimsSubType: SmallClaimsSubType }
  | { type: 'SET_LANDLORD_TENANT_SUB_TYPE'; landlordTenantSubType: LandlordTenantSubType }
  | { type: 'SET_DEBT_SIDE'; debtSide: DebtSide }
  | { type: 'SET_DEBT_SUB_TYPE'; debtSubType: DebtSubType }
  | { type: 'SET_PI_SUB_TYPE'; payload: PiSubType }
  | { type: 'SET_AMOUNT'; amount: AmountRange }
  | { type: 'SET_CIRCUMSTANCES'; circumstances: CircumstanceFlags }
  | { type: 'SET_COUNTY'; county: string }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'RESET' }

const initialState: WizardState = {
  step: 1,
  selectedState: '',
  role: '',
  disputeType: '',
  familySubType: '',
  businessSubType: '',
  smallClaimsSubType: '',
  landlordTenantSubType: '',
  debtSide: '',
  debtSubType: '',
  piSubType: '',
  amount: '',
  circumstances: {
    realProperty: false,
    outOfState: false,
    governmentEntity: false,
    federalLaw: false,
  },
  county: '',
}

function reducer(state: WizardState, action: WizardAction): WizardState {
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
        businessSubType: action.disputeType === 'business' ? state.businessSubType : '',
        smallClaimsSubType: action.disputeType === 'small_claims' ? state.smallClaimsSubType : '',
        landlordTenantSubType: action.disputeType === 'landlord_tenant' ? state.landlordTenantSubType : '',
        debtSide: action.disputeType === 'debt_collection' ? state.debtSide : '',
        debtSubType: action.disputeType === 'debt_collection' ? state.debtSubType : '',
        piSubType: action.disputeType === 'personal_injury' ? state.piSubType : '',
        step: 4,
      }
    case 'SET_FAMILY_SUB_TYPE':
      return { ...state, familySubType: action.familySubType, step: 5 }
    case 'SET_BUSINESS_SUB_TYPE':
      return { ...state, businessSubType: action.businessSubType, step: 5 }
    case 'SET_SMALL_CLAIMS_SUB_TYPE':
      return { ...state, smallClaimsSubType: action.smallClaimsSubType, step: 5 }
    case 'SET_LANDLORD_TENANT_SUB_TYPE':
      return { ...state, landlordTenantSubType: action.landlordTenantSubType, step: 5 }
    case 'SET_DEBT_SIDE':
      return { ...state, debtSide: action.debtSide, step: state.step + 1 }
    case 'SET_DEBT_SUB_TYPE':
      return { ...state, debtSubType: action.debtSubType, step: state.step + 1 }
    case 'SET_PI_SUB_TYPE':
      return { ...state, piSubType: action.payload, step: state.step + 1 }
    case 'SET_AMOUNT':
      return { ...state, amount: action.amount, step: state.step + 1 }
    case 'SET_CIRCUMSTANCES':
      return { ...state, circumstances: action.circumstances }
    case 'SET_COUNTY':
      return { ...state, county: action.county }
    case 'NEXT_STEP':
      return {
        ...state,
        step: Math.min(state.step + 1, getTotalSteps(state.disputeType, state.landlordTenantSubType, state.debtSide)),
      }
    case 'PREV_STEP':
      return { ...state, step: Math.max(state.step - 1, 1) }
    case 'RESET':
      return initialState
    default:
      return state
  }
}

export function NewCaseDialog() {
  const [open, setOpen] = useState(false)
  const [state, dispatch] = useReducer(reducer, initialState)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { gatedFetch } = useUpgradeGateContext()
  const { casesRemaining, tier, loading: subLoading } = useSubscription()

  const isFamily = state.disputeType === 'family'
  const isBusiness = state.disputeType === 'business'
  const isSmallClaims = state.disputeType === 'small_claims'
  const isPersonalInjury = state.disputeType === 'personal_injury'
  const isLandlordTenant = state.disputeType === 'landlord_tenant'
  const isEviction = isLandlordTenant && state.landlordTenantSubType === 'eviction'
  const isDebtCollection = state.disputeType === 'debt_collection'
  const isDebtDefendant = isDebtCollection && state.debtSide === 'defendant'
  const isDebtPlaintiff = isDebtCollection && state.debtSide === 'plaintiff'
  const totalSteps = getTotalSteps(state.disputeType, state.landlordTenantSubType, state.debtSide)

  async function handleAccept(courtOverride: string | null) {
    if (!state.role) return

    setLoading(true)
    setError(null)

    const stateCode = state.selectedState || 'TX'
    const isCA = stateCode === 'CA'
    const isNY = stateCode === 'NY'
    const isFL = stateCode === 'FL'
    const isPA = stateCode === 'PA'

    const courtType =
      courtOverride ??
      (isFamily
        ? (isPA ? 'pa_common_pleas' : isFL ? 'fl_circuit' : isNY ? 'ny_supreme' : isCA ? 'unlimited_civil' : 'district')
        : isBusiness
          ? (isPA ? 'pa_common_pleas' : isFL ? 'fl_circuit' : isNY ? 'ny_supreme' : isCA ? 'unlimited_civil' : 'district')
          : isSmallClaims
          ? (isPA ? 'pa_magisterial' : isFL ? 'fl_small_claims' : isNY ? 'ny_small_claims' : isCA ? 'small_claims' : 'jp')
          : isEviction
            ? (isPA ? 'pa_magisterial' : isFL ? 'fl_county' : isNY ? 'ny_civil' : isCA ? 'unlimited_civil' : 'jp')
            : state.disputeType && state.amount
              ? recommendCourt({
                  disputeType: state.disputeType,
                  amount: state.amount,
                  circumstances: state.circumstances,
                  subType: isLandlordTenant ? state.landlordTenantSubType : undefined,
                  state: stateCode,
                }).recommended
              : 'unknown')

    const debtSubTypePayload = isDebtCollection && state.debtSubType
      ? { debt_sub_type: state.debtSubType }
      : {}

    try {
      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      const res = await gatedFetch('/api/cases', {
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
          ...(isBusiness && state.businessSubType
            ? { business_sub_type: state.businessSubType }
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

      if (!res) {
        // Upgrade gate was hit — modal is showing
        setLoading(false)
        return
      }

      if (!res.ok) {
        if (res.status === 403) {
          const body = await res.json()
          if (body.error === 'upgrade_required') {
            setError('You\'ve reached the case limit on your free plan. Upgrade to create more cases.')
            setLoading(false)
            return
          }
        }
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Something went wrong. Please try again.')
        setLoading(false)
        return
      }

      const data = await res.json()
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

  const selectedState = state.selectedState || 'TX'
  const isCA = selectedState === 'CA'
  const isNY = selectedState === 'NY'
  const isFL = selectedState === 'FL'
  const isPA = selectedState === 'PA'

  const civilRecommendation =
    !isFamily && !isBusiness && !isSmallClaims && !isPersonalInjury && !isLandlordTenant && !isDebtCollection && state.disputeType && state.amount
      ? recommendCourt({
          disputeType: state.disputeType,
          amount: state.amount,
          circumstances: state.circumstances,
          state: selectedState,
        })
      : null

  const debtRecommendation =
    isDebtDefendant && state.disputeType && state.amount
      ? recommendCourt({
          disputeType: state.disputeType,
          amount: state.amount,
          circumstances: state.circumstances,
          state: selectedState,
        })
      : null

  const debtPlaintiffRecommendation =
    isDebtPlaintiff && state.disputeType && state.amount
      ? recommendCourt({
          disputeType: state.disputeType,
          amount: state.amount,
          circumstances: state.circumstances,
          state: selectedState,
        })
      : null

  const familyRecommendation = isPA
    ? {
        recommended: 'pa_common_pleas' as const,
        reasoning: 'Family law matters are heard in the Family Division of Pennsylvania Court of Common Pleas.',
        confidence: 'high' as const,
      }
    : isFL
      ? {
          recommended: 'fl_circuit' as const,
          reasoning: 'Family law matters are heard in Florida Circuit Court.',
          confidence: 'high' as const,
        }
      : isNY
        ? {
            recommended: 'ny_supreme' as const,
            reasoning: 'Family law matters such as divorce are heard in New York Supreme Court.',
            confidence: 'high' as const,
          }
        : isCA
          ? {
              recommended: 'unlimited_civil' as const,
              reasoning: 'Family law matters are heard in California Superior Court (Unlimited Civil division).',
              confidence: 'high' as const,
            }
          : {
              recommended: 'district' as const,
              reasoning: 'Family law cases are filed in District Court.',
              confidence: 'high' as const,
            }

  const businessRecommendation = isPA
    ? {
        recommended: 'pa_common_pleas' as const,
        reasoning: 'Business disputes are heard in Pennsylvania Court of Common Pleas.',
        confidence: 'high' as const,
      }
    : isFL
      ? {
          recommended: 'fl_circuit' as const,
          reasoning: 'Business disputes are heard in Florida Circuit Court.',
          confidence: 'high' as const,
        }
      : isNY
        ? {
            recommended: 'ny_supreme' as const,
            reasoning: 'Business disputes are heard in New York Supreme Court.',
            confidence: 'high' as const,
          }
        : isCA
          ? {
              recommended: 'unlimited_civil' as const,
              reasoning: 'Business disputes are heard in California Superior Court (Unlimited Civil division).',
              confidence: 'high' as const,
            }
          : {
              recommended: 'district' as const,
              reasoning: 'Business disputes are filed in District Court.',
              confidence: 'high' as const,
            }

  const smallClaimsRecommendation = isPA
    ? {
        recommended: 'pa_magisterial' as const,
        reasoning: 'Small claims cases up to $12,000 are filed in Pennsylvania Magisterial District Court.',
        confidence: 'high' as const,
      }
    : isFL
      ? {
          recommended: 'fl_small_claims' as const,
          reasoning: 'Small claims cases up to $8,000 are filed in Florida Small Claims Court.',
          confidence: 'high' as const,
        }
      : isNY
        ? {
            recommended: 'ny_small_claims' as const,
            reasoning: 'Small claims cases up to $10,000 are filed in New York Small Claims Court.',
            confidence: 'high' as const,
          }
        : isCA
          ? {
              recommended: 'small_claims' as const,
              reasoning: 'Small claims cases are filed in California Small Claims Court.',
              confidence: 'high' as const,
            }
          : {
              recommended: 'jp' as const,
              reasoning: 'Small claims cases are filed in Justice of the Peace (JP) Court.',
              confidence: 'high' as const,
            }

  const evictionRecommendation = isPA
    ? {
        recommended: 'pa_magisterial' as const,
        reasoning: 'Eviction proceedings are filed in Pennsylvania Magisterial District Court.',
        confidence: 'high' as const,
      }
    : isFL
      ? {
          recommended: 'fl_county' as const,
          reasoning: 'Eviction proceedings are filed in Florida County Court.',
          confidence: 'high' as const,
        }
      : isNY
        ? {
            recommended: 'ny_civil' as const,
            reasoning: 'Eviction proceedings are heard in Housing Court, which is part of New York Civil Court.',
            confidence: 'high' as const,
          }
        : isCA
          ? {
              recommended: 'unlimited_civil' as const,
              reasoning: 'Unlawful detainer (eviction) cases are heard in California Superior Court regardless of the amount involved.',
              confidence: 'high' as const,
            }
          : {
              recommended: 'jp' as const,
              reasoning: 'Eviction cases are filed in Justice of the Peace (JP) Court.',
              confidence: 'high' as const,
            }

  const landlordTenantRecommendation =
    isLandlordTenant && !isEviction && state.disputeType && state.amount
      ? recommendCourt({
          disputeType: state.disputeType,
          amount: state.amount,
          circumstances: state.circumstances,
          subType: state.landlordTenantSubType,
          state: selectedState,
        })
      : null

  const piRecommendation =
    isPersonalInjury && state.disputeType && state.amount
      ? recommendCourt({
          disputeType: state.disputeType,
          amount: state.amount,
          circumstances: state.circumstances,
          state: selectedState,
        })
      : null

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
    // Use rAF to check after content renders
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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          + New Case
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[95vh] sm:max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Start a new case</DialogTitle>
          <DialogDescription>
            We&apos;ll help you figure out the right court.
          </DialogDescription>
        </DialogHeader>

        {!subLoading && casesRemaining <= 0 && tier === 'free' && (
          <div className="p-3 rounded-lg bg-calm-amber/10 text-sm text-warm-text">
            You&apos;ve used your free case.{' '}
            <a href="/settings#billing" className="text-calm-indigo underline">
              Upgrade
            </a>{' '}
            to create more.
          </div>
        )}

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
            style={{ maxHeight: 'calc(95vh - 180px)' }}
          >

        {state.step === 1 && (
          <StateStep
            value={state.selectedState}
            onSelect={(s) => dispatch({ type: 'SET_STATE', selectedState: s })}
          />
        )}

        {state.step === 2 && (
          <RoleStep
            value={state.role}
            disputeType={state.disputeType || undefined}
            onSelect={(role) => dispatch({ type: 'SET_ROLE', role })}
          />
        )}

        {state.step === 3 && (
          <DisputeTypeStep
            value={state.disputeType}
            selectedState={selectedState}
            onSelect={(disputeType) =>
              dispatch({ type: 'SET_DISPUTE_TYPE', disputeType })
            }
          />
        )}

        {state.step === 4 && isFamily && (
          <FamilySubTypeStep
            value={state.familySubType}
            onSelect={(familySubType) =>
              dispatch({ type: 'SET_FAMILY_SUB_TYPE', familySubType })
            }
          />
        )}

        {state.step === 4 && isBusiness && (
          <BusinessSubTypeStep
            value={state.businessSubType || null}
            onSelect={(businessSubType) =>
              dispatch({ type: 'SET_BUSINESS_SUB_TYPE', businessSubType })
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

        {state.step === 4 && !isFamily && !isBusiness && !isSmallClaims && !isPersonalInjury && !isLandlordTenant && !isDebtCollection && (
          <AmountStep
            value={state.amount}
            selectedState={selectedState}
            onSelect={(amount) => dispatch({ type: 'SET_AMOUNT', amount })}
          />
        )}

        {state.step === 5 && isFamily && (
          <RecommendationStep
            recommendation={familyRecommendation}
            selectedState={selectedState}
            county={state.county}
            onCountyChange={(county) => dispatch({ type: 'SET_COUNTY', county })}
            onAccept={handleAccept}
            loading={loading}
          />
        )}

        {state.step === 5 && isBusiness && (
          <RecommendationStep
            recommendation={businessRecommendation}
            selectedState={selectedState}
            county={state.county}
            onCountyChange={(county) => dispatch({ type: 'SET_COUNTY', county })}
            onAccept={handleAccept}
            loading={loading}
          />
        )}

        {state.step === 5 && isSmallClaims && (
          <RecommendationStep
            recommendation={smallClaimsRecommendation}
            selectedState={selectedState}
            county={state.county}
            onCountyChange={(county) => dispatch({ type: 'SET_COUNTY', county })}
            onAccept={handleAccept}
            loading={loading}
          />
        )}

        {state.step === 5 && isEviction && (
          <RecommendationStep
            recommendation={evictionRecommendation}
            selectedState={selectedState}
            county={state.county}
            onCountyChange={(county) => dispatch({ type: 'SET_COUNTY', county })}
            onAccept={handleAccept}
            loading={loading}
          />
        )}

        {state.step === 5 && isLandlordTenant && !isEviction && (
          <AmountStep
            value={state.amount}
            selectedState={selectedState}
            onSelect={(amount) => dispatch({ type: 'SET_AMOUNT', amount })}
          />
        )}

        {state.step === 5 && isDebtDefendant && (
          <DebtSubTypeStep
            value={state.debtSubType}
            side="defendant"
            onSelect={(debtSubType) =>
              dispatch({ type: 'SET_DEBT_SUB_TYPE', debtSubType })
            }
          />
        )}

        {state.step === 5 && isDebtPlaintiff && (
          <DebtSubTypeStep
            value={state.debtSubType}
            side="plaintiff"
            onSelect={(debtSubType) =>
              dispatch({ type: 'SET_DEBT_SUB_TYPE', debtSubType })
            }
          />
        )}

        {state.step === 5 && isPersonalInjury && (
          <AmountStep
            value={state.amount}
            selectedState={selectedState}
            onSelect={(amount) => dispatch({ type: 'SET_AMOUNT', amount })}
          />
        )}

        {state.step === 6 && isDebtPlaintiff && (
          <AmountStep
            value={state.amount}
            selectedState={selectedState}
            onSelect={(amount) => dispatch({ type: 'SET_AMOUNT', amount })}
          />
        )}

        {state.step === 5 && !isFamily && !isBusiness && !isSmallClaims && !isPersonalInjury && !isLandlordTenant && !isDebtCollection && (
          <CircumstancesStep
            value={state.circumstances}
            onChange={(circumstances) =>
              dispatch({ type: 'SET_CIRCUMSTANCES', circumstances })
            }
            onContinue={() => dispatch({ type: 'NEXT_STEP' })}
          />
        )}

        {state.step === 6 && isLandlordTenant && !isEviction && landlordTenantRecommendation && (
          <RecommendationStep
            recommendation={landlordTenantRecommendation}
            selectedState={selectedState}
            county={state.county}
            onCountyChange={(county) => dispatch({ type: 'SET_COUNTY', county })}
            onAccept={handleAccept}
            loading={loading}
          />
        )}

        {state.step === 6 && isDebtDefendant && (
          <AmountStep
            value={state.amount}
            selectedState={selectedState}
            onSelect={(amount) => dispatch({ type: 'SET_AMOUNT', amount })}
          />
        )}

        {state.step === 7 && isDebtPlaintiff && (
          <CircumstancesStep
            value={state.circumstances}
            onChange={(circumstances) =>
              dispatch({ type: 'SET_CIRCUMSTANCES', circumstances })
            }
            onContinue={() => dispatch({ type: 'NEXT_STEP' })}
          />
        )}

        {state.step === 6 && isPersonalInjury && piRecommendation && (
          <RecommendationStep
            recommendation={piRecommendation}
            selectedState={selectedState}
            county={state.county}
            onCountyChange={(county) => dispatch({ type: 'SET_COUNTY', county })}
            onAccept={handleAccept}
            loading={loading}
          />
        )}

        {state.step === 6 && !isFamily && !isBusiness && !isSmallClaims && !isPersonalInjury && !isLandlordTenant && !isDebtCollection && civilRecommendation && (
          <RecommendationStep
            recommendation={civilRecommendation}
            selectedState={selectedState}
            county={state.county}
            onCountyChange={(county) => dispatch({ type: 'SET_COUNTY', county })}
            onAccept={handleAccept}
            loading={loading}
          />
        )}

        {state.step === 7 && isDebtDefendant && debtRecommendation && (
          <RecommendationStep
            recommendation={debtRecommendation}
            selectedState={selectedState}
            county={state.county}
            onCountyChange={(county) => dispatch({ type: 'SET_COUNTY', county })}
            onAccept={handleAccept}
            loading={loading}
          />
        )}

        {state.step === 8 && isDebtPlaintiff && debtPlaintiffRecommendation && (
          <RecommendationStep
            recommendation={debtPlaintiffRecommendation}
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
              className="absolute top-1 right-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-background/80 border border-warm-border shadow-sm hover:bg-background transition-colors"
              aria-label="Scroll up"
            >
              <ChevronUp className="h-4 w-4 text-warm-muted" />
            </button>
          )}

          {canScrollDown && (
            <button
              type="button"
              onClick={() => scrollBy(200)}
              className="absolute bottom-1 right-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-background/80 border border-warm-border shadow-sm hover:bg-background transition-colors"
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
