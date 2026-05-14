'use client'

import { useState } from 'react'
import { AssessmentWizard } from '@/components/assessment/assessment-wizard'
import { AssessmentResultCard } from '@/components/assessment/assessment-result'
import { evaluateAssessment } from '@/lib/assessment/evaluate'
import { ASSESSMENT_QUESTIONS, DEFAULT_QUESTIONS } from '@/lib/assessment/questions'
import type { AssessmentQuestion } from '@/lib/assessment/questions'
import type { AssessmentResult } from '@/lib/assessment/evaluate'
import { Scale, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface Props {
  disputeType: string
  disputeLabel: string
  questions: AssessmentQuestion[]
}

type Step =
  | { name: 'describe' }
  | { name: 'categorizing' }
  | { name: 'confirmed'; disputeType: string; disputeLabel: string; reasoning: string }
  | { name: 'questions'; disputeType: string; questions: AssessmentQuestion[] }

const DISPUTE_LABELS: Record<string, string> = {
  small_claims: 'Small Claims',
  personal_injury: 'Personal Injury',
  landlord_tenant: 'Landlord-Tenant',
  contract: 'Contract Dispute',
  family: 'Family Law',
  debt_defense: 'Debt Defense',
  property: 'Property Dispute',
  other: 'General Legal',
}

export function AssessmentPageClient({ disputeType, disputeLabel, questions }: Props) {
  const isGeneral = disputeType === 'general'
  const [step, setStep] = useState<Step>(isGeneral ? { name: 'describe' } : { name: 'questions', disputeType, questions })
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AssessmentResult | null>(null)

  async function handleDescribeSubmit() {
    if (description.trim().length < 10) {
      setError('Please describe your situation in a bit more detail.')
      return
    }
    setError(null)
    setStep({ name: 'categorizing' })

    try {
      const res = await fetch('/api/assess/categorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.')
        setStep({ name: 'describe' })
        return
      }

      setStep({
        name: 'confirmed',
        disputeType: data.disputeType,
        disputeLabel: data.label,
        reasoning: data.reasoning,
      })
    } catch {
      setError('Something went wrong. Please try again.')
      setStep({ name: 'describe' })
    }
  }

  function handleConfirm(confirmed: { disputeType: string }) {
    const resolvedQuestions = ASSESSMENT_QUESTIONS[confirmed.disputeType] ?? DEFAULT_QUESTIONS
    setStep({ name: 'questions', disputeType: confirmed.disputeType, questions: resolvedQuestions })
  }

  function handleComplete(answers: Record<string, string>) {
    const activeDisputeType = step.name === 'questions' ? step.disputeType : disputeType
    const assessment = evaluateAssessment(activeDisputeType, answers)
    setResult(assessment)
  }

  if (result) {
    const activeDisputeType = step.name === 'questions' ? step.disputeType : disputeType
    return <AssessmentResultCard result={result} disputeType={activeDisputeType} />
  }

  const activeLabel = step.name === 'confirmed' ? step.disputeLabel
    : step.name === 'questions' ? (DISPUTE_LABELS[step.disputeType] ?? disputeLabel)
    : disputeLabel

  return (
    <>
      <div className="text-center mb-8">
        <Scale className="h-10 w-10 text-calm-indigo mx-auto mb-3" />
        <h1 className="text-3xl font-bold text-gray-900">
          Free Case Assessment
        </h1>
        <p className="text-gray-600 mt-2">
          {step.name === 'questions'
            ? `Answering questions for: ${activeLabel}`
            : 'Tell us what happened and we\'ll guide you from there'}
        </p>
      </div>

      {/* Step: describe */}
      {step.name === 'describe' && (
        <div className="max-w-lg mx-auto space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">What happened?</h2>
          <p className="text-sm text-gray-500">
            Describe your situation in plain English. You don&apos;t need to use legal terms — just tell us what happened.
          </p>
          <Textarea
            placeholder="e.g. I rented a truck from Penske and it caught fire on the highway. All my belongings inside were destroyed."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className="resize-none text-sm"
            maxLength={1000}
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">{description.length}/1000</span>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <Button
            onClick={handleDescribeSubmit}
            disabled={description.trim().length < 10}
            className="w-full bg-calm-indigo hover:bg-calm-indigo/90"
          >
            Analyze My Situation
          </Button>
        </div>
      )}

      {/* Step: categorizing (loading) */}
      {step.name === 'categorizing' && (
        <div className="max-w-lg mx-auto flex flex-col items-center gap-4 py-12">
          <Loader2 className="h-8 w-8 text-calm-indigo animate-spin" />
          <p className="text-gray-600 text-sm">Analyzing your situation…</p>
        </div>
      )}

      {/* Step: confirmed — show AI category, let user confirm or change */}
      {step.name === 'confirmed' && (
        <div className="max-w-lg mx-auto space-y-6">
          <div className="rounded-xl border-2 border-calm-indigo/30 bg-calm-indigo/5 p-5 space-y-2">
            <p className="text-xs font-medium text-calm-indigo uppercase tracking-wide">Case Type Identified</p>
            <p className="text-xl font-semibold text-gray-900">{step.disputeLabel}</p>
            <p className="text-sm text-gray-600">{step.reasoning}</p>
          </div>

          <p className="text-sm text-gray-500">Does this sound right? We&apos;ll ask you a few follow-up questions based on this category.</p>

          <div className="space-y-2">
            <Button
              onClick={() => handleConfirm({ disputeType: step.disputeType })}
              className="w-full bg-calm-indigo hover:bg-calm-indigo/90"
            >
              Yes, continue as {step.disputeLabel}
            </Button>
            <Button
              variant="outline"
              onClick={() => setStep({ name: 'describe' })}
              className="w-full"
            >
              No, let me re-describe my situation
            </Button>
          </div>

          <details className="text-sm text-gray-400">
            <summary className="cursor-pointer hover:text-gray-600">Choose category manually</summary>
            <div className="mt-3 grid gap-2">
              {Object.entries(DISPUTE_LABELS).map(([type, label]) => (
                <button
                  key={type}
                  onClick={() => handleConfirm({ disputeType: type })}
                  className="p-3 rounded-lg border border-gray-200 text-left text-sm text-gray-700 hover:border-calm-indigo hover:bg-calm-indigo/5 transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
          </details>
        </div>
      )}

      {/* Step: questions */}
      {step.name === 'questions' && (
        <AssessmentWizard questions={step.questions} onComplete={handleComplete} />
      )}
    </>
  )
}
