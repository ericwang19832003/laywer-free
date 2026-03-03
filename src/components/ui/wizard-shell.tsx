'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

export interface WizardStep {
  id: string
  title: string
  subtitle?: string
  estimateMinutes?: number
}

interface WizardShellProps {
  caseId: string
  title: string
  steps: WizardStep[]
  currentStep: number
  onStepChange: (step: number) => void
  onSave?: () => Promise<void>
  onComplete?: () => Promise<void>
  children: React.ReactNode
  canAdvance?: boolean
  totalEstimateMinutes?: number
  completeButtonLabel?: string
}

export function WizardShell({
  caseId,
  title,
  steps,
  currentStep,
  onStepChange,
  onSave,
  onComplete,
  children,
  canAdvance = true,
  totalEstimateMinutes,
  completeButtonLabel = 'Complete',
}: WizardShellProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const isInitialMount = useRef(true)

  // Auto-save when step changes (but not on mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    onSave?.()
  }, [currentStep]) // eslint-disable-line react-hooks/exhaustive-deps

  const progress = ((currentStep + 1) / steps.length) * 100
  const isLastStep = currentStep === steps.length - 1
  const step = steps[currentStep]

  const handleBack = useCallback(() => {
    if (currentStep === 0) {
      router.push(`/case/${caseId}`)
    } else {
      onStepChange(currentStep - 1)
    }
  }, [currentStep, caseId, router, onStepChange])

  const handleNext = useCallback(async () => {
    if (isLastStep && onComplete) {
      setLoading(true)
      try {
        await onComplete()
      } finally {
        setLoading(false)
      }
    } else {
      onStepChange(currentStep + 1)
    }
  }, [isLastStep, onComplete, onStepChange, currentStep])

  const handleSave = useCallback(async () => {
    if (!onSave) return
    setLoading(true)
    try {
      await onSave()
    } finally {
      setLoading(false)
    }
  }, [onSave])

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link
        href={`/case/${caseId}`}
        className="inline-flex items-center gap-1 text-sm text-warm-muted hover:text-warm-text mb-4"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to dashboard
      </Link>

      <h1 className="text-2xl font-semibold text-warm-text">{title}</h1>

      {totalEstimateMinutes && (
        <div className="flex items-center gap-1 mt-1">
          <Clock className="h-3.5 w-3.5 text-warm-muted" />
          <span className="text-xs text-warm-muted">
            ~{totalEstimateMinutes} min estimated
          </span>
        </div>
      )}

      <div className="mt-6 mb-6">
        <p className="text-sm text-warm-muted mb-2">
          Step {currentStep + 1} of {steps.length}: {step.title}
        </p>
        <Progress value={progress} className="h-2" />
      </div>

      <Card className="border-warm-border">
        <CardContent className="pt-6">
          <h2 className="text-lg font-medium text-warm-text">{step.title}</h2>
          {step.subtitle && (
            <p className="text-sm text-warm-muted mb-6">{step.subtitle}</p>
          )}

          {children}

          <div className="mt-8 flex justify-between items-center">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>

            <div className="flex items-center gap-3">
              {onSave && (
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={loading}
                  className="text-sm text-warm-muted hover:text-warm-text transition-colors disabled:opacity-50"
                >
                  Save for later
                </button>
              )}
              <Button
                onClick={handleNext}
                disabled={!canAdvance || loading}
                size="sm"
              >
                {loading ? (
                  'Saving...'
                ) : isLastStep ? (
                  completeButtonLabel
                ) : (
                  <>
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
