'use client'

import { useState, useEffect } from 'react'
import { ClipboardList, Map, CheckCircle, Gavel, Home, CreditCard, Users, Car, MoreHorizontal, Loader2, Shield, Scale, FileText, Building2, Landmark, Handshake } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SituationCard } from '@/components/onboarding/situation-card'

const PLAINTIFF_SITUATIONS = [
  { icon: Gavel, label: 'Small claims', description: 'Owed money, broken contract, deposit not returned', disputeType: 'small_claims' },
  { icon: Users, label: 'Family matter', description: 'Divorce, custody, child support, or guardianship', disputeType: 'family' },
  { icon: Car, label: 'Personal injury', description: 'Accident, medical malpractice, or injury claim', disputeType: 'personal_injury' },
  { icon: Home, label: 'Landlord-tenant', description: 'Repairs, deposit, or lease dispute', disputeType: 'landlord_tenant' },
  { icon: Landmark, label: 'Property dispute', description: 'Boundary, easement, or real estate issue', disputeType: 'property' },
  { icon: Handshake, label: 'Contract dispute', description: 'Breach of contract or agreement', disputeType: 'contract' },
  { icon: Building2, label: 'Business dispute', description: 'Partnership, fraud, or commercial claim', disputeType: 'business' },
  { icon: MoreHorizontal, label: 'Something else', description: 'Other civil matter', disputeType: '' },
] as const

const DEFENDANT_SITUATIONS = [
  { icon: Gavel, label: 'Being sued', description: 'Someone filed a case against you', disputeType: 'small_claims' },
  { icon: Home, label: 'Facing eviction', description: 'Landlord is trying to remove you', disputeType: 'landlord_tenant' },
  { icon: CreditCard, label: 'Debt collection', description: 'Collector or creditor demanding payment', disputeType: 'debt_collection' },
  { icon: Users, label: 'Family matter', description: 'Responding to divorce, custody, or support filing', disputeType: 'family' },
  { icon: FileText, label: 'Contract claim against me', description: 'Accused of breaching a contract', disputeType: 'contract' },
  { icon: Building2, label: 'Business claim against me', description: 'Commercial dispute or lawsuit', disputeType: 'business' },
  { icon: MoreHorizontal, label: 'Something else', description: 'Other civil matter', disputeType: '' },
] as const

const SUPPORTED_STATES = [
  { code: 'TX', name: 'Texas' },
  { code: 'CA', name: 'California' },
  { code: 'NY', name: 'New York' },
  { code: 'FL', name: 'Florida' },
  { code: 'PA', name: 'Pennsylvania' },
] as const

interface OnboardingFlowProps {
  onComplete: (disputeType?: string) => void
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(1)
  const [role, setRole] = useState<'plaintiff' | 'defendant' | ''>('')
  const [selectedState, setSelectedState] = useState('')
  const [selectedType, setSelectedType] = useState<string | undefined>()

  function handleRoleContinue() {
    if (role && selectedState) {
      sessionStorage.setItem('onboarding_role', role)
      sessionStorage.setItem('onboarding_state', selectedState)
      setStep(3)
    }
  }

  function handleSelect(disputeType: string) {
    setSelectedType(disputeType || undefined)
    setStep(4)
  }

  // Screen 4: persist preference then complete
  useEffect(() => {
    if (step !== 4) return
    let cancelled = false

    async function finish() {
      let retries = 0
      const maxRetries = 2
      while (retries <= maxRetries) {
        try {
          const res = await fetch('/api/user-preferences', { method: 'POST' })
          if (res.ok) break
          retries++
        } catch {
          retries++
        }
        if (retries <= maxRetries) {
          await new Promise(r => setTimeout(r, 500 * retries))
        }
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
          Tell us about your role
        </h2>
        <p className="text-warm-muted text-center mb-8">
          This helps us tailor your experience
        </p>

        <div className="grid grid-cols-2 gap-3 mb-8">
          <button
            onClick={() => setRole('plaintiff')}
            className={`flex flex-col items-center gap-3 rounded-xl border-2 p-6 transition-all ${
              role === 'plaintiff'
                ? 'border-calm-indigo bg-calm-indigo/5'
                : 'border-warm-border hover:border-calm-indigo/50'
            }`}
          >
            <Scale className={`h-8 w-8 ${role === 'plaintiff' ? 'text-calm-indigo' : 'text-warm-muted'}`} />
            <div className="text-center">
              <p className="text-sm font-semibold text-warm-text">I&apos;m filing a case</p>
              <p className="text-xs text-warm-muted mt-1">Plaintiff / Petitioner</p>
            </div>
          </button>
          <button
            onClick={() => setRole('defendant')}
            className={`flex flex-col items-center gap-3 rounded-xl border-2 p-6 transition-all ${
              role === 'defendant'
                ? 'border-calm-indigo bg-calm-indigo/5'
                : 'border-warm-border hover:border-calm-indigo/50'
            }`}
          >
            <Shield className={`h-8 w-8 ${role === 'defendant' ? 'text-calm-indigo' : 'text-warm-muted'}`} />
            <div className="text-center">
              <p className="text-sm font-semibold text-warm-text">Someone filed against me</p>
              <p className="text-xs text-warm-muted mt-1">Defendant / Respondent</p>
            </div>
          </button>
        </div>

        <div className="mb-8">
          <label htmlFor="state-select" className="block text-sm font-medium text-warm-text mb-2">
            What state is your case in?
          </label>
          <select
            id="state-select"
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="w-full rounded-lg border border-warm-border bg-white px-3 py-2.5 text-sm text-warm-text focus:border-calm-indigo focus:ring-1 focus:ring-calm-indigo outline-none"
          >
            <option value="">Select your state</option>
            {SUPPORTED_STATES.map((s) => (
              <option key={s.code} value={s.code}>{s.name}</option>
            ))}
          </select>
          <p className="text-xs text-warm-muted mt-1">
            Currently available in TX, CA, NY, FL, and PA. More states coming soon.
          </p>
        </div>

        <Button
          onClick={handleRoleContinue}
          className="w-full"
          disabled={!role || !selectedState}
        >
          Continue &rarr;
        </Button>

        <button
          onClick={() => setStep(1)}
          className="block mx-auto mt-6 text-sm text-warm-muted hover:text-warm-text transition-colors"
        >
          &larr; Back
        </button>
      </div>
    )
  }

  if (step === 3) {
    const situations = role === 'plaintiff' ? PLAINTIFF_SITUATIONS : DEFENDANT_SITUATIONS
    const heading = role === 'plaintiff'
      ? 'What type of case are you filing?'
      : 'What type of case is against you?'

    return (
      <div className="max-w-lg mx-auto py-12 px-4">
        <h2 className="text-2xl font-bold text-warm-text text-center mb-2">
          {heading}
        </h2>
        <p className="text-warm-muted text-center mb-8">
          We&apos;ll set up your case based on your answer
        </p>

        <div className="grid grid-cols-2 gap-3">
          {situations.map(({ icon, label, description, disputeType }) => (
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
          onClick={() => setStep(2)}
          className="block mx-auto mt-6 text-sm text-warm-muted hover:text-warm-text transition-colors"
        >
          &larr; Back
        </button>
      </div>
    )
  }

  // Screen 4: Loading / transition
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
