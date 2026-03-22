'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Clock, CheckCircle2, Circle, BookOpen, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { toast } from '@/lib/toast'

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
  showSidebar?: boolean
  completedSteps?: number[]
  sidebarLearnMore?: { topic: string; content: React.ReactNode }[]
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
  showSidebar = true,
  completedSteps = [],
  sidebarLearnMore = [],
}: WizardShellProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showSidebarMobile, setShowSidebarMobile] = useState(false)
  const isInitialMount = useRef(true)

  const progress = ((currentStep + 1) / steps.length) * 100
  const isLastStep = currentStep === steps.length - 1
  const step = steps[currentStep]
  const overallProgress = completedSteps.length / steps.length * 100

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    if (onSave) {
      handleAutoSave()
    }
  }, [currentStep])

  const handleAutoSave = useCallback(async () => {
    if (!onSave) return
    setSaving(true)
    try {
      await onSave()
      toast.success('Progress saved')
    } catch (error) {
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }, [onSave])

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
        toast.success('Step completed!')
      } catch (error) {
        toast.error('Failed to complete step')
      } finally {
        setLoading(false)
      }
    } else {
      onStepChange(currentStep + 1)
    }
  }, [isLastStep, onComplete, onStepChange, currentStep])

  const handleSave = useCallback(async () => {
    if (!onSave) return
    setSaving(true)
    try {
      await onSave()
      toast.success('Saved for later')
    } catch (error) {
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }, [onSave])

  const stepAnnouncementRef = useRef<HTMLDivElement>(null)

  // Announce step changes to screen readers
  useEffect(() => {
    if (!isInitialMount.current) {
      // The ref update triggers the aria-live announcement
    }
  }, [currentStep])

  const isStepCompleted = (index: number) => completedSteps.includes(index)

  const StepSidebar = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xs font-semibold text-warm-muted uppercase tracking-wider mb-3">
          Filing Progress
        </h3>
        <div className="space-y-2">
          {steps.map((s, index) => {
            const isCompleted = isStepCompleted(index)
            const isCurrent = index === currentStep
            const isClickable = isCompleted || index <= currentStep + 1

            return (
              <button
                key={s.id}
                onClick={() => isClickable && onStepChange(index)}
                disabled={!isClickable}
                aria-current={isCurrent ? 'step' : undefined}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all',
                  isCurrent && 'bg-primary/10 border border-primary/20',
                  isCompleted && 'bg-calm-green/5',
                  !isCurrent && !isCompleted && 'hover:bg-warm-border/30',
                  !isClickable && 'opacity-40 cursor-not-allowed'
                )}
              >
                <div className={cn(
                  'w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0',
                  isCompleted && 'bg-calm-green text-white',
                  isCurrent && 'bg-primary text-white',
                  !isCompleted && !isCurrent && 'bg-warm-border text-warm-muted'
                )}>
                  {isCompleted ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <span className="text-xs font-medium">{index + 1}</span>
                  )}
                </div>
                <span className={cn(
                  'text-sm truncate',
                  isCurrent ? 'font-medium text-warm-text' : 'text-warm-muted'
                )}>
                  {s.title}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="pt-4 border-t border-warm-border">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-warm-muted">Overall Progress</span>
          <span className="font-medium text-warm-text">{Math.round(overallProgress)}%</span>
        </div>
        <div
          className="h-2 bg-warm-border rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={Math.round(overallProgress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Overall filing progress"
        >
          <div
            className="h-full bg-calm-green rounded-full transition-all duration-500"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {sidebarLearnMore.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-warm-muted uppercase tracking-wider mb-3 flex items-center gap-2">
            <BookOpen className="h-3.5 w-3.5" />
            Learn More
          </h3>
          <div className="space-y-2">
            {sidebarLearnMore.map((item) => (
              <details key={item.topic} className="group">
                <summary className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-warm-border/30 cursor-pointer list-none text-sm text-warm-muted">
                  <span className="text-xs">+</span>
                  {item.topic}
                </summary>
                <div className="mt-2 px-3 py-2 bg-primary/5 rounded-lg text-xs text-warm-muted">
                  {item.content}
                </div>
              </details>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  if (showSidebar) {
    return (
      <div className="min-h-screen bg-warm-bg">
        {/* Screen reader announcement for step changes */}
        <div
          ref={stepAnnouncementRef}
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        >
          Step {currentStep + 1} of {steps.length}: {step.title}
        </div>

        {/* Mobile sidebar toggle */}
        <div className="lg:hidden fixed bottom-4 left-4 z-40">
          <Button
            variant="default"
            size="sm"
            onClick={() => setShowSidebarMobile(!showSidebarMobile)}
            className="shadow-lg gap-2"
            aria-expanded={showSidebarMobile}
            aria-controls="mobile-sidebar"
          >
            {showSidebarMobile ? 'Hide' : 'Show'} Progress
          </Button>
        </div>

        {/* Mobile sidebar overlay */}
        {showSidebarMobile && (
          <>
            <div
              className="fixed inset-0 bg-black/30 z-30 lg:hidden"
              onClick={() => setShowSidebarMobile(false)}
              onKeyDown={(e) => { if (e.key === 'Escape') setShowSidebarMobile(false) }}
            />
            <div
              id="mobile-sidebar"
              className="fixed bottom-16 left-4 right-4 z-40 bg-white rounded-xl shadow-xl p-4 max-h-[60vh] overflow-y-auto lg:hidden"
              role="dialog"
              aria-label="Filing progress"
            >
              <StepSidebar />
            </div>
          </>
        )}

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex gap-8">
            {/* Desktop sidebar */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-8">
                <div className="bg-white rounded-xl border border-warm-border p-4">
                  <StepSidebar />
                </div>
              </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 min-w-0">
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
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-warm-muted">
                    Step {currentStep + 1} of {steps.length}: <span className="font-medium text-warm-text">{step.title}</span>
                  </span>
                  <span className="text-warm-muted">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" aria-label="Step progress" />
              </div>

              <Card className="border-warm-border">
                <CardContent className="pt-6">
                  {step.subtitle && (
                    <p className="text-sm text-warm-muted mb-6 italic">
                      &ldquo;{step.subtitle}&rdquo;
                    </p>
                  )}

                  {children}

                  <div className="mt-8 flex justify-between items-center pt-4 border-t border-warm-border">
                    <Button variant="ghost" size="sm" onClick={handleBack}>
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Back
                    </Button>

                    <div className="flex items-center gap-3">
                      {saving && (
                        <span className="text-xs text-warm-muted flex items-center gap-1">
                          <Save className="h-3.5 w-3.5 animate-pulse" />
                          Saving...
                        </span>
                      )}
                      {onSave && (
                        <button
                          type="button"
                          onClick={handleSave}
                          disabled={saving || loading}
                          className="text-sm text-warm-muted hover:text-warm-text transition-colors disabled:opacity-50"
                        >
                          Save for later
                        </button>
                      )}
                      <Button
                        onClick={handleNext}
                        disabled={!canAdvance || loading}
                        size="sm"
                        className="gap-1"
                      >
                        {loading ? (
                          'Saving...'
                        ) : isLastStep ? (
                          completeButtonLabel
                        ) : (
                          <>
                            Continue
                            <ChevronRight className="h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </main>
          </div>
        </div>
      </div>
    )
  }

  // Legacy layout without sidebar
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
        <Progress value={progress} className="h-2" aria-label="Step progress" />
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
