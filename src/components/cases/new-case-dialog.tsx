'use client'

import { useReducer, useState } from 'react'
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
import {
  recommendCourt,
  type DisputeType,
  type AmountRange,
  type CircumstanceFlags,
} from '@/lib/rules/court-recommendation'
import { WizardProgress } from './wizard/wizard-progress'
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
import type { PiSubType } from '@/lib/schemas/case'

function getTotalSteps(disputeType: DisputeType | '', landlordTenantSubType?: string, debtSide?: string): number {
  if (disputeType === 'family') return 4
  if (disputeType === 'small_claims') return 4
  if (disputeType === 'personal_injury') return 5 // role, dispute, pi-subtype, amount, recommendation
  if (disputeType === 'landlord_tenant') {
    return landlordTenantSubType === 'eviction' ? 4 : 5
  }
  if (disputeType === 'debt_collection') {
    if (debtSide === 'plaintiff') return 6 // role, dispute, side, amount, circumstances, recommendation
    return 6 // role, dispute, side, subtype, amount, recommendation
  }
  return 5
}

interface WizardState {
  step: number
  role: 'plaintiff' | 'defendant' | ''
  disputeType: DisputeType | ''
  familySubType: FamilySubType | ''
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
  | { type: 'SET_ROLE'; role: 'plaintiff' | 'defendant' }
  | { type: 'SET_DISPUTE_TYPE'; disputeType: DisputeType }
  | { type: 'SET_FAMILY_SUB_TYPE'; familySubType: FamilySubType }
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
  role: '',
  disputeType: '',
  familySubType: '',
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
    case 'SET_ROLE':
      return { ...state, role: action.role, step: 2 }
    case 'SET_DISPUTE_TYPE':
      // When switching away from family/small_claims/landlord_tenant/debt/pi, clear respective sub-type
      // For personal_injury, auto-set role to plaintiff
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
        step: 3,
      }
    case 'SET_FAMILY_SUB_TYPE':
      return { ...state, familySubType: action.familySubType, step: 4 }
    case 'SET_SMALL_CLAIMS_SUB_TYPE':
      return { ...state, smallClaimsSubType: action.smallClaimsSubType, step: 4 }
    case 'SET_LANDLORD_TENANT_SUB_TYPE':
      return { ...state, landlordTenantSubType: action.landlordTenantSubType, step: 4 }
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

  const isFamily = state.disputeType === 'family'
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

    const courtType =
      courtOverride ??
      (isFamily
        ? 'district'
        : isSmallClaims
          ? 'jp'
          : isEviction
            ? 'jp'
            : state.disputeType && state.amount
              ? recommendCourt({
                  disputeType: state.disputeType,
                  amount: state.amount,
                  circumstances: state.circumstances,
                  subType: isLandlordTenant ? state.landlordTenantSubType : undefined,
                }).recommended
              : 'unknown')

    const debtSubTypePayload = isDebtDefendant && state.debtSubType
      ? { debt_sub_type: state.debtSubType }
      : {}

    try {
      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      const res = await fetch('/api/cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token
            ? { Authorization: `Bearer ${session.access_token}` }
            : {}),
        },
        body: JSON.stringify({
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

  // Compute recommendation for civil (non-family, non-small-claims, non-pi, non-landlord-tenant, non-debt) flow
  const civilRecommendation =
    !isFamily && !isSmallClaims && !isPersonalInjury && !isLandlordTenant && !isDebtCollection && state.disputeType && state.amount
      ? recommendCourt({
          disputeType: state.disputeType,
          amount: state.amount,
          circumstances: state.circumstances,
        })
      : null

  // Computed recommendation for debt defendant flow (amount-based)
  const debtRecommendation =
    isDebtDefendant && state.disputeType && state.amount
      ? recommendCourt({
          disputeType: state.disputeType,
          amount: state.amount,
          circumstances: state.circumstances,
        })
      : null

  // Computed recommendation for debt plaintiff flow (amount-based with circumstances)
  const debtPlaintiffRecommendation =
    isDebtPlaintiff && state.disputeType && state.amount
      ? recommendCourt({
          disputeType: state.disputeType,
          amount: state.amount,
          circumstances: state.circumstances,
        })
      : null

  // Hardcoded recommendation for family flow
  const familyRecommendation = {
    recommended: 'district' as const,
    reasoning: 'Family law cases are filed in District Court.',
    confidence: 'high' as const,
  }

  // Hardcoded recommendation for small claims flow
  const smallClaimsRecommendation = {
    recommended: 'jp' as const,
    reasoning: 'Small claims cases are filed in Justice of the Peace (JP) Court.',
    confidence: 'high' as const,
  }

  // Hardcoded recommendation for eviction flow
  const evictionRecommendation = {
    recommended: 'jp' as const,
    reasoning: 'Eviction cases are filed in Justice of the Peace (JP) Court.',
    confidence: 'high' as const,
  }

  // Computed recommendation for non-eviction landlord-tenant flow
  const landlordTenantRecommendation =
    isLandlordTenant && !isEviction && state.disputeType && state.amount
      ? recommendCourt({
          disputeType: state.disputeType,
          amount: state.amount,
          circumstances: state.circumstances,
          subType: state.landlordTenantSubType,
        })
      : null

  // Computed recommendation for personal injury flow (amount-based)
  const piRecommendation =
    isPersonalInjury && state.disputeType && state.amount
      ? recommendCourt({
          disputeType: state.disputeType,
          amount: state.amount,
          circumstances: state.circumstances,
        })
      : null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="w-full" size="lg">
          Start a New Case
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start a new case</DialogTitle>
          <DialogDescription>
            We&apos;ll help you figure out the right court.
          </DialogDescription>
        </DialogHeader>

        <WizardProgress
          currentStep={state.step}
          totalSteps={totalSteps}
          onBack={() => dispatch({ type: 'PREV_STEP' })}
        />

        {state.step === 1 && (
          <RoleStep
            value={state.role}
            onSelect={(role) => dispatch({ type: 'SET_ROLE', role })}
          />
        )}

        {state.step === 2 && (
          <DisputeTypeStep
            value={state.disputeType}
            onSelect={(disputeType) =>
              dispatch({ type: 'SET_DISPUTE_TYPE', disputeType })
            }
          />
        )}

        {state.step === 3 && isFamily && (
          <FamilySubTypeStep
            value={state.familySubType}
            onSelect={(familySubType) =>
              dispatch({ type: 'SET_FAMILY_SUB_TYPE', familySubType })
            }
          />
        )}

        {state.step === 3 && isSmallClaims && (
          <SmallClaimsSubTypeStep
            value={state.smallClaimsSubType}
            onSelect={(smallClaimsSubType) =>
              dispatch({ type: 'SET_SMALL_CLAIMS_SUB_TYPE', smallClaimsSubType })
            }
          />
        )}

        {state.step === 3 && isLandlordTenant && (
          <LandlordTenantSubTypeStep
            value={state.landlordTenantSubType}
            onSelect={(landlordTenantSubType) =>
              dispatch({ type: 'SET_LANDLORD_TENANT_SUB_TYPE', landlordTenantSubType })
            }
          />
        )}

        {state.step === 3 && isPersonalInjury && (
          <PISubTypeStep
            value={state.piSubType}
            onSelect={(t) => dispatch({ type: 'SET_PI_SUB_TYPE', payload: t })}
          />
        )}

        {state.step === 3 && isDebtCollection && (
          <DebtSideStep
            value={state.debtSide}
            onSelect={(debtSide) =>
              dispatch({ type: 'SET_DEBT_SIDE', debtSide })
            }
          />
        )}

        {state.step === 3 && !isFamily && !isSmallClaims && !isPersonalInjury && !isLandlordTenant && !isDebtCollection && (
          <AmountStep
            value={state.amount}
            onSelect={(amount) => dispatch({ type: 'SET_AMOUNT', amount })}
          />
        )}

        {state.step === 4 && isFamily && (
          <RecommendationStep
            recommendation={familyRecommendation}
            county={state.county}
            onCountyChange={(county) => dispatch({ type: 'SET_COUNTY', county })}
            onAccept={handleAccept}
            loading={loading}
          />
        )}

        {state.step === 4 && isSmallClaims && (
          <RecommendationStep
            recommendation={smallClaimsRecommendation}
            county={state.county}
            onCountyChange={(county) => dispatch({ type: 'SET_COUNTY', county })}
            onAccept={handleAccept}
            loading={loading}
          />
        )}

        {state.step === 4 && isEviction && (
          <RecommendationStep
            recommendation={evictionRecommendation}
            county={state.county}
            onCountyChange={(county) => dispatch({ type: 'SET_COUNTY', county })}
            onAccept={handleAccept}
            loading={loading}
          />
        )}

        {state.step === 4 && isLandlordTenant && !isEviction && (
          <AmountStep
            value={state.amount}
            onSelect={(amount) => dispatch({ type: 'SET_AMOUNT', amount })}
          />
        )}

        {state.step === 4 && isDebtDefendant && (
          <DebtSubTypeStep
            value={state.debtSubType}
            onSelect={(debtSubType) =>
              dispatch({ type: 'SET_DEBT_SUB_TYPE', debtSubType })
            }
          />
        )}

        {state.step === 4 && isPersonalInjury && (
          <AmountStep
            value={state.amount}
            onSelect={(amount) => dispatch({ type: 'SET_AMOUNT', amount })}
          />
        )}

        {state.step === 4 && isDebtPlaintiff && (
          <AmountStep
            value={state.amount}
            onSelect={(amount) => dispatch({ type: 'SET_AMOUNT', amount })}
          />
        )}

        {state.step === 4 && !isFamily && !isSmallClaims && !isPersonalInjury && !isLandlordTenant && !isDebtCollection && (
          <CircumstancesStep
            value={state.circumstances}
            onChange={(circumstances) =>
              dispatch({ type: 'SET_CIRCUMSTANCES', circumstances })
            }
            onContinue={() => dispatch({ type: 'NEXT_STEP' })}
          />
        )}

        {state.step === 5 && isLandlordTenant && !isEviction && landlordTenantRecommendation && (
          <RecommendationStep
            recommendation={landlordTenantRecommendation}
            county={state.county}
            onCountyChange={(county) => dispatch({ type: 'SET_COUNTY', county })}
            onAccept={handleAccept}
            loading={loading}
          />
        )}

        {state.step === 5 && isDebtDefendant && (
          <AmountStep
            value={state.amount}
            onSelect={(amount) => dispatch({ type: 'SET_AMOUNT', amount })}
          />
        )}

        {state.step === 5 && isDebtPlaintiff && (
          <CircumstancesStep
            value={state.circumstances}
            onChange={(circumstances) =>
              dispatch({ type: 'SET_CIRCUMSTANCES', circumstances })
            }
            onContinue={() => dispatch({ type: 'NEXT_STEP' })}
          />
        )}

        {state.step === 5 && isPersonalInjury && piRecommendation && (
          <RecommendationStep
            recommendation={piRecommendation}
            county={state.county}
            onCountyChange={(county) => dispatch({ type: 'SET_COUNTY', county })}
            onAccept={handleAccept}
            loading={loading}
          />
        )}

        {state.step === 5 && !isFamily && !isSmallClaims && !isPersonalInjury && !isLandlordTenant && !isDebtCollection && civilRecommendation && (
          <RecommendationStep
            recommendation={civilRecommendation}
            county={state.county}
            onCountyChange={(county) => dispatch({ type: 'SET_COUNTY', county })}
            onAccept={handleAccept}
            loading={loading}
          />
        )}

        {state.step === 6 && isDebtDefendant && debtRecommendation && (
          <RecommendationStep
            recommendation={debtRecommendation}
            county={state.county}
            onCountyChange={(county) => dispatch({ type: 'SET_COUNTY', county })}
            onAccept={handleAccept}
            loading={loading}
          />
        )}

        {state.step === 6 && isDebtPlaintiff && debtPlaintiffRecommendation && (
          <RecommendationStep
            recommendation={debtPlaintiffRecommendation}
            county={state.county}
            onCountyChange={(county) => dispatch({ type: 'SET_COUNTY', county })}
            onAccept={handleAccept}
            loading={loading}
          />
        )}

        {error && <p className="text-sm text-calm-amber">{error}</p>}
      </DialogContent>
    </Dialog>
  )
}
