'use client'

import { useState } from 'react'
import { StoryInput } from './story-input'
import { AnalysisReview } from './analysis-review'
import { DeliveryOptions } from './delivery-options'
import { CheckCircle } from 'lucide-react'
import type { AnalysisResult } from '@/lib/schemas/quick-resolve'

type Step = 'story' | 'review' | 'letter' | 'deliver'

const STEPS: { key: Step; label: string }[] = [
  { key: 'story', label: 'Describe' },
  { key: 'review', label: 'Review' },
  { key: 'letter', label: 'Letter' },
  { key: 'deliver', label: 'Send' },
]

export function QuickResolveFlow() {
  const [step, setStep] = useState<Step>('story')
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [letterHtml, setLetterHtml] = useState<string | null>(null)
  const [caseId, setCaseId] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [sendingMail, setSendingMail] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const stepIndex = STEPS.findIndex(s => s.key === step)

  function handleAnalysisComplete(result: AnalysisResult) {
    setAnalysis(result)
    setStep('review')
  }

  async function handleConfirmAnalysis(edited: AnalysisResult) {
    setAnalysis(edited)
    setGenerating(true)
    setError(null)
    setStep('letter')

    try {
      // 1. Create the case
      const caseRes = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dispute_type: edited.disputeType,
          role: edited.role,
          state: edited.state,
          description: edited.summary,
          entry_point: 'quick_resolve',
        }),
      })

      if (!caseRes.ok) {
        throw new Error('Could not create case. Please try again.')
      }

      const caseData = await caseRes.json()
      setCaseId(caseData.id)

      // 2. Generate the demand letter
      const letterRes = await fetch('/api/document-generation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: caseData.id,
          documentType: 'demand_letter',
          disputeType: edited.disputeType,
          role: edited.role,
          opposingParty: edited.opposingParty,
          approximateAmount: edited.approximateAmount,
          state: edited.state,
          summary: edited.summary,
        }),
      })

      if (!letterRes.ok) {
        throw new Error('Could not generate your letter. Please try again.')
      }

      const letterData = await letterRes.json()
      setLetterHtml(letterData.html || letterData.content || '')
      setStep('deliver')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  async function handleSendCertified() {
    if (!caseId || !letterHtml) return
    setSendingMail(true)
    setError(null)

    try {
      const res = await fetch('/api/quick-resolve/send-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId,
          letterHtml,
        }),
      })

      if (!res.ok) {
        throw new Error('Could not send the letter. Please try again.')
      }

      // Could redirect to a success/tracking page here
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSendingMail(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      {/* Progress indicator */}
      <nav className="mb-10" aria-label="Progress">
        <ol className="flex items-center justify-center gap-2">
          {STEPS.map((s, i) => {
            const isCompleted = i < stepIndex
            const isCurrent = i === stepIndex

            return (
              <li key={s.key} className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium transition-colors ${
                      isCompleted
                        ? 'bg-calm-green text-white'
                        : isCurrent
                          ? 'bg-calm-indigo text-white'
                          : 'bg-warm-bg text-warm-muted border border-warm-border'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      i + 1
                    )}
                  </div>
                  <span
                    className={`text-xs font-medium hidden sm:inline ${
                      isCurrent ? 'text-warm-text' : 'text-warm-muted'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`w-8 h-px ${
                      i < stepIndex ? 'bg-calm-green' : 'bg-warm-border'
                    }`}
                  />
                )}
              </li>
            )
          })}
        </ol>
      </nav>

      {/* Error banner */}
      {error && (
        <div className="mb-6 rounded-lg bg-calm-amber/5 border border-calm-amber/20 px-4 py-3 text-center">
          <p className="text-sm text-calm-amber">{error}</p>
          <button
            type="button"
            onClick={() => setError(null)}
            className="mt-1 text-xs text-warm-muted hover:text-warm-text transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Step content */}
      {step === 'story' && (
        <StoryInput onAnalysisComplete={handleAnalysisComplete} />
      )}

      {step === 'review' && analysis && (
        <AnalysisReview analysis={analysis} onConfirm={handleConfirmAnalysis} />
      )}

      {step === 'letter' && generating && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-10 h-10 rounded-full border-2 border-calm-indigo border-t-transparent animate-spin mb-4" />
          <p className="text-sm text-warm-text font-medium">Drafting your demand letter...</p>
          <p className="text-xs text-warm-muted mt-1">This usually takes 10-15 seconds</p>
        </div>
      )}

      {step === 'letter' && !generating && letterHtml && (
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-warm-text mb-2">
              Your demand letter
            </h2>
            <p className="text-warm-muted">
              Review the letter below, then choose how to send it.
            </p>
          </div>
          <div
            className="rounded-lg border border-warm-border bg-white p-8 prose prose-sm max-w-none mb-6"
            dangerouslySetInnerHTML={{ __html: letterHtml }}
          />
          <button
            type="button"
            onClick={() => setStep('deliver')}
            className="w-full rounded-lg bg-calm-indigo px-4 py-2.5 text-sm font-medium text-white hover:bg-calm-indigo/90 transition-colors"
          >
            Choose delivery method &rarr;
          </button>
        </div>
      )}

      {step === 'deliver' && letterHtml && (
        <DeliveryOptions
          letterHtml={letterHtml}
          onSendCertified={handleSendCertified}
          sending={sendingMail}
        />
      )}
    </div>
  )
}
