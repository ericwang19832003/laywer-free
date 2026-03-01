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

const TOTAL_STEPS = 5

interface WizardState {
  step: number
  role: 'plaintiff' | 'defendant' | ''
  disputeType: DisputeType | ''
  amount: AmountRange | ''
  circumstances: CircumstanceFlags
  county: string
}

type WizardAction =
  | { type: 'SET_ROLE'; role: 'plaintiff' | 'defendant' }
  | { type: 'SET_DISPUTE_TYPE'; disputeType: DisputeType }
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
      return { ...state, disputeType: action.disputeType, step: 3 }
    case 'SET_AMOUNT':
      return { ...state, amount: action.amount, step: 4 }
    case 'SET_CIRCUMSTANCES':
      return { ...state, circumstances: action.circumstances }
    case 'SET_COUNTY':
      return { ...state, county: action.county }
    case 'NEXT_STEP':
      return { ...state, step: Math.min(state.step + 1, TOTAL_STEPS) }
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

  async function handleAccept(courtOverride: string | null) {
    if (!state.role) return

    setLoading(true)
    setError(null)

    const courtType =
      courtOverride ??
      (state.disputeType && state.amount
        ? recommendCourt({
            disputeType: state.disputeType,
            amount: state.amount,
            circumstances: state.circumstances,
          }).recommended
        : 'unknown')

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

  const recommendation =
    state.disputeType && state.amount
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
          totalSteps={TOTAL_STEPS}
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

        {state.step === 3 && (
          <AmountStep
            value={state.amount}
            onSelect={(amount) => dispatch({ type: 'SET_AMOUNT', amount })}
          />
        )}

        {state.step === 4 && (
          <CircumstancesStep
            value={state.circumstances}
            onChange={(circumstances) =>
              dispatch({ type: 'SET_CIRCUMSTANCES', circumstances })
            }
            onContinue={() => dispatch({ type: 'NEXT_STEP' })}
          />
        )}

        {state.step === 5 && recommendation && (
          <RecommendationStep
            recommendation={recommendation}
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
