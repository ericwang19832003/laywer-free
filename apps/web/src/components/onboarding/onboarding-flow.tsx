'use client'

import { useState, useEffect } from 'react'
import { ClipboardList, Map, CheckCircle, Gavel, Home, CreditCard, Users, Car, MoreHorizontal, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SituationCard } from '@/components/onboarding/situation-card'

const SITUATIONS = [
  { icon: Gavel, label: 'Being sued', description: 'Someone filed a case against you', disputeType: 'small_claims' },
  { icon: Home, label: 'Facing eviction', description: 'Landlord-tenant dispute', disputeType: 'landlord_tenant' },
  { icon: CreditCard, label: 'Debt collection', description: 'Being contacted by collectors', disputeType: 'debt_collection' },
  { icon: Users, label: 'Family matter', description: 'Divorce, custody, or support', disputeType: 'family' },
  { icon: Car, label: 'Personal injury', description: 'Accident or injury claim', disputeType: 'personal_injury' },
  { icon: MoreHorizontal, label: 'Something else', description: 'Contract, property, or other', disputeType: '' },
] as const

interface OnboardingFlowProps {
  onComplete: (disputeType?: string) => void
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(1)
  const [selectedType, setSelectedType] = useState<string | undefined>()

  function handleSelect(disputeType: string) {
    setSelectedType(disputeType || undefined)
    setStep(3)
  }

  // Screen 3: persist preference then complete
  useEffect(() => {
    if (step !== 3) return
    let cancelled = false

    async function finish() {
      try {
        await fetch('/api/user-preferences', { method: 'POST' })
      } catch {
        // Non-blocking — onboarding still works
      }
      if (!cancelled) {
        onComplete(selectedType)
      }
    }
    finish()

    return () => { cancelled = true }
  }, [step, selectedType, onComplete])

  if (step === 1) {
    return (
      <div className="max-w-lg mx-auto py-12 px-4">
        <h2 className="text-2xl font-bold text-warm-text text-center mb-2">
          Welcome to Lawyer Free
        </h2>
        <p className="text-warm-muted text-center mb-10">
          Here&apos;s how it works
        </p>

        <div className="space-y-6 mb-10">
          {[
            { icon: ClipboardList, step: '1', title: 'Describe your situation', desc: 'Answer a few questions about your legal matter' },
            { icon: Map, step: '2', title: 'Get AI-guided steps', desc: 'Get a personalized step-by-step plan' },
            { icon: CheckCircle, step: '3', title: 'File with confidence', desc: 'Complete tasks at your own pace' },
          ].map(({ icon: Icon, step: num, title, desc }) => (
            <div key={num} className="flex items-start gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-calm-indigo/10 shrink-0">
                <Icon className="h-5 w-5 text-calm-indigo" />
              </div>
              <div>
                <p className="text-sm font-medium text-warm-text">{title}</p>
                <p className="text-xs text-warm-muted">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <Button onClick={() => setStep(2)} className="w-full">
          Let&apos;s get started &rarr;
        </Button>
      </div>
    )
  }

  if (step === 2) {
    return (
      <div className="max-w-lg mx-auto py-12 px-4">
        <h2 className="text-2xl font-bold text-warm-text text-center mb-2">
          What&apos;s your situation?
        </h2>
        <p className="text-warm-muted text-center mb-8">
          We&apos;ll set up your case based on your answer
        </p>

        <div className="grid grid-cols-2 gap-3">
          {SITUATIONS.map(({ icon, label, description, disputeType }) => (
            <SituationCard
              key={label}
              icon={icon}
              label={label}
              description={description}
              onSelect={() => handleSelect(disputeType)}
            />
          ))}
        </div>

        <button
          onClick={() => setStep(1)}
          className="block mx-auto mt-6 text-sm text-warm-muted hover:text-warm-text transition-colors"
        >
          &larr; Back
        </button>
      </div>
    )
  }

  // Screen 3: Loading / transition
  return (
    <div className="max-w-lg mx-auto py-20 px-4 text-center">
      <Loader2 className="h-8 w-8 text-calm-indigo animate-spin mx-auto mb-4" />
      <h2 className="text-xl font-semibold text-warm-text mb-1">
        Setting up your case
      </h2>
      <p className="text-sm text-warm-muted">
        This will just take a moment&hellip;
      </p>
    </div>
  )
}
