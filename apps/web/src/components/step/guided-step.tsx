'use client'

import { useState, useMemo, useCallback } from 'react'

type InfoSegment =
  | { type: 'header'; content: string }
  | { type: 'bullets'; content: string[] }
  | { type: 'text'; content: string }

function parseInfoText(text: string): InfoSegment[] {
  const lines = text.split('\n').filter((l) => l.trim())
  const segments: InfoSegment[] = []
  let pendingBullets: string[] = []

  const flush = () => {
    if (pendingBullets.length) {
      segments.push({ type: 'bullets', content: pendingBullets })
      pendingBullets = []
    }
  }

  for (const line of lines) {
    const trimmed = line.trim()
    if (/^[A-Z][A-Z\s&'(),./—-]{3,}:/.test(trimmed)) {
      flush()
      segments.push({ type: 'header', content: trimmed.replace(/:$/, '') })
    } else if (trimmed.startsWith('•') || trimmed.startsWith('•')) {
      pendingBullets.push(trimmed.replace(/^[••]\s*/, ''))
    } else {
      flush()
      segments.push({ type: 'text', content: trimmed })
    }
  }
  flush()
  return segments
}

function InfoText({ text }: { text: string }) {
  const segments = parseInfoText(text)
  return (
    <div className="space-y-2">
      {segments.map((seg, i) => {
        if (seg.type === 'header') {
          return (
            <p key={i} className="text-xs font-semibold text-calm-indigo uppercase tracking-wide pt-1">
              {seg.content}
            </p>
          )
        }
        if (seg.type === 'bullets') {
          return (
            <ul key={i} className="space-y-1.5">
              {seg.content.map((b, j) => (
                <li key={j} className="flex items-start gap-2 text-sm text-warm-text">
                  <span className="text-calm-indigo mt-0.5 shrink-0 font-bold">•</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          )
        }
        return <p key={i} className="text-sm text-warm-text">{seg.content}</p>
      })}
    </div>
  )
}


import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { SkipForward, CheckSquare, Square } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { GuidedStepConfig, QuestionDef, SummaryItem } from '@lawyer-free/shared/guided-steps/types'

function MultiSelectQuestion({
  question,
  existingAnswer,
  onAnswer,
}: {
  question: QuestionDef
  existingAnswer?: string
  onAnswer: (value: string) => void
}) {
  const initial = existingAnswer && existingAnswer !== 'none'
    ? new Set(existingAnswer.split(','))
    : new Set<string>()
  const [selected, setSelected] = useState<Set<string>>(initial)
  const [noneSelected, setNoneSelected] = useState(existingAnswer === 'none')

  function toggle(value: string) {
    setNoneSelected(false)
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(value)) next.delete(value); else next.add(value)
      return next
    })
  }

  function handleNone() {
    setSelected(new Set())
    setNoneSelected(true)
  }

  function handleContinue() {
    if (noneSelected) { onAnswer('none'); return }
    if (selected.size > 0) { onAnswer(Array.from(selected).join(',')); return }
  }

  const canContinue = noneSelected || selected.size > 0

  return (
    <div>
      <h2 className="text-lg font-medium text-warm-text mb-2">{question.prompt}</h2>
      {question.helpText && (
        <p className="text-sm text-warm-muted mb-4">{question.helpText}</p>
      )}
      <div className="flex flex-col gap-2 mt-4">
        {question.options?.map((opt) => {
          const checked = selected.has(opt.value)
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              className={`flex items-start gap-3 rounded-md border p-3 text-left text-sm transition-colors ${
                checked
                  ? 'border-calm-indigo bg-calm-indigo/5 text-warm-text'
                  : 'border-warm-border text-warm-text hover:border-calm-indigo/50'
              }`}
            >
              {checked
                ? <CheckSquare className="h-4 w-4 shrink-0 text-calm-indigo mt-0.5" />
                : <Square className="h-4 w-4 shrink-0 text-warm-muted mt-0.5" />
              }
              <div>
                <span className="font-medium">{opt.label}</span>
                {opt.description && (
                  <p className="text-xs text-warm-muted mt-0.5 font-normal">{opt.description}</p>
                )}
              </div>
            </button>
          )
        })}
        <button
          type="button"
          onClick={handleNone}
          className={`flex items-center gap-3 rounded-md border p-3 text-left text-sm transition-colors ${
            noneSelected
              ? 'border-calm-amber bg-calm-amber/5 text-warm-text'
              : 'border-warm-border text-warm-muted hover:border-warm-text'
          }`}
        >
          {noneSelected
            ? <CheckSquare className="h-4 w-4 shrink-0 text-calm-amber" />
            : <Square className="h-4 w-4 shrink-0 text-warm-muted" />
          }
          <span>{question.noneLabel ?? 'None of these yet'}</span>
        </button>
      </div>
      <Button
        onClick={handleContinue}
        disabled={!canContinue}
        className="w-full mt-4"
      >
        Continue →
      </Button>
    </div>
  )
}

interface GuidedStepProps {
  caseId: string
  taskId: string
  config: GuidedStepConfig
  existingAnswers?: Record<string, string>
  onAfterComplete?: () => Promise<void>
  wrapperClassName?: string
  skippable?: boolean
}

export function GuidedStep({
  caseId,
  taskId,
  config,
  existingAnswers,
  onAfterComplete,
  wrapperClassName,
  skippable = false,
}: GuidedStepProps) {
  const router = useRouter()
  const [skipping, setSkipping] = useState(false)

  async function handleSkip() {
    if (skipping) return
    const confirmed = window.confirm('Skip this step? You can come back to it later from your dashboard.')
    if (!confirmed) return
    setSkipping(true)
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'skipped',
          metadata: { skip_reason: 'user_skipped_from_step_page' },
        }),
      })
      if (!res.ok) throw new Error('skip failed')
      router.push(`/case/${caseId}`)
      router.refresh()
    } catch {
      toast.error('Something went wrong. Please try again.')
      setSkipping(false)
    }
  }

  const [answers, setAnswers] = useState<Record<string, string>>(
    existingAnswers ?? {}
  )
  const [phase, setPhase] = useState<'questions' | 'summary'>(
    () => {
      // If we have existing answers, check whether all visible questions are answered
      if (existingAnswers) {
        const visible = config.questions.filter(
          (q) => !q.showIf || q.showIf(existingAnswers)
        )
        const allAnswered = visible.every((q) => q.type === 'info' ? existingAnswers[q.id] === 'acknowledged' : q.id in existingAnswers)
        if (allAnswered && visible.length > 0) return 'summary'
      }
      return 'questions'
    }
  )
  const [loading, setLoading] = useState(false)
  const [reviewMode, setReviewMode] = useState(false)

  // Compute visible questions based on current answers
  const visibleQuestions = useMemo(
    () => config.questions.filter((q) => !q.showIf || q.showIf(answers)),
    [config.questions, answers]
  )

  // Find starting index: first unanswered question in visible list
  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    if (existingAnswers) {
      const visible = config.questions.filter(
        (q) => !q.showIf || q.showIf(existingAnswers)
      )
      const firstUnanswered = visible.findIndex((q) =>
        q.type === 'info' ? existingAnswers[q.id] !== 'acknowledged' : !(q.id in existingAnswers)
      )
      // If all answered, start at 0 (we'll be in summary phase anyway)
      return firstUnanswered === -1 ? 0 : firstUnanswered
    }
    return 0
  })

  const currentQuestion = visibleQuestions[currentIndex]
  const totalQuestions = visibleQuestions.length
  const progress = totalQuestions > 0
    ? Math.round(((currentIndex + (phase === 'summary' ? 1 : 0)) / totalQuestions) * 100)
    : 100

  // Auto-save answers to task metadata (non-fatal)
  const autoSave = useCallback(
    async (updatedAnswers: Record<string, string>) => {
      try {
        await fetch(`/api/tasks/${taskId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'in_progress',
            metadata: { guided_answers: updatedAnswers },
          }),
        })
      } catch (err) {
        // Non-fatal: continue even if save fails
        console.warn('Auto-save failed:', err)
      }
    },
    [taskId]
  )

  async function handleAnswer(value: string) {
    const updated = { ...answers, [currentQuestion.id]: value }

    // Recompute visible questions with updated answers
    const nextVisible = config.questions.filter(
      (q) => !q.showIf || q.showIf(updated)
    )

    // Prune answers for questions that are no longer visible
    const visibleIds = new Set(nextVisible.map((q) => q.id))
    const pruned = Object.fromEntries(
      Object.entries(updated).filter(([key]) => visibleIds.has(key))
    )

    setAnswers(pruned)

    // Auto-save in background
    autoSave(pruned)

    // Find the next unanswered question after the current one
    const currentQuestionId = currentQuestion.id
    const currentPosInNext = nextVisible.findIndex((q) => q.id === currentQuestionId)
    const nextUnanswered = nextVisible.findIndex((q, i) => {
      if (i <= currentPosInNext) return false
      return q.type === 'info'
        ? pruned[q.id] !== 'acknowledged'
        : !(q.id in pruned)
    })

    if (reviewMode) {
      const nextIndex = currentIndex + 1
      if (nextIndex < nextVisible.length) {
        setCurrentIndex(nextIndex)
      } else {
        setReviewMode(false)
        setPhase('summary')
      }
    } else if (nextUnanswered !== -1) {
      setCurrentIndex(nextUnanswered)
    } else {
      setReviewMode(false)
      setPhase('summary')
    }
  }

  function handleBack() {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  async function handleComplete() {
    setLoading(true)
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'completed',
          metadata: { guided_answers: answers },
        }),
      })
      if (!res.ok) throw new Error('complete failed')
      if (onAfterComplete) {
        await onAfterComplete()
      }
      toast.success('Step completed! Check your dashboard for what\'s next.')
      router.push(`/case/${caseId}`)
      router.refresh()
    } catch {
      toast.error('We couldn\'t save your progress. Please try again.')
      setLoading(false)
    }
  }

  const summaryItems: SummaryItem[] = useMemo(
    () => (phase === 'summary' ? config.generateSummary(answers) : []),
    [phase, config, answers]
  )

  const statusIcon: Record<SummaryItem['status'], { icon: string; color: string }> = {
    done: { icon: '\u2713', color: 'text-calm-green' },
    needed: { icon: '\u26A0', color: 'text-amber-500' },
    info: { icon: '\u2139', color: 'text-calm-indigo' },
  }

  return (
    <div className={wrapperClassName ?? "max-w-2xl mx-auto px-4 py-8"}>
      <Link
        href={`/case/${caseId}`}
        className="text-sm text-warm-muted hover:text-warm-text mb-6 inline-block"
      >
        &larr; Back to dashboard
      </Link>

      <h1 className="text-2xl font-bold text-warm-text mb-1">
        {config.title}
      </h1>
      <p className="text-sm text-warm-muted mb-8 leading-relaxed">{config.reassurance}</p>

      {phase === 'questions' && currentQuestion ? (
        <>
          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm text-warm-muted mb-2">
              <span>{`Question ${currentIndex + 1} of ${totalQuestions}`}</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 rounded-full bg-warm-border">
              <div
                className="h-2 rounded-full bg-calm-indigo transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            {currentIndex > 0 && (
              <button
                onClick={() => {
                  setReviewMode(true)
                  const firstInput = visibleQuestions.findIndex((q) => q.type !== 'info')
                  setCurrentIndex(firstInput >= 0 ? firstInput : 0)
                }}
                className="mt-2 text-xs text-warm-muted hover:text-warm-text underline underline-offset-2"
              >
                ↩ Review from step 1
              </button>
            )}
          </div>

          <Card>
            <CardContent className="pt-6">
              {currentQuestion.type === 'info' ? (
                /* Info type: styled info box */
                <div>
                  <div className="rounded-md border border-warm-border bg-warm-border/30 p-4 mb-4">
                    <InfoText text={currentQuestion.promptFn ? currentQuestion.promptFn(answers) : currentQuestion.prompt} />
                    {currentQuestion.helpText && (
                      <p className="text-sm text-warm-muted mt-3">
                        {currentQuestion.helpText}
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={() => handleAnswer('acknowledged')}
                    className="w-full"
                  >
                    {currentQuestion.acknowledgeLabel ?? 'Got it'} &rarr;
                  </Button>
                </div>
              ) : currentQuestion.type === 'multi_select' ? (
                /* Multi-select checklist */
                <MultiSelectQuestion
                  key={currentQuestion.id}
                  question={currentQuestion}
                  existingAnswer={answers[currentQuestion.id]}
                  onAnswer={handleAnswer}
                />
              ) : currentQuestion.type === 'text' ? (
                /* Text input */
                <div>
                  <h2 className="text-lg font-medium text-warm-text mb-2">
                    {currentQuestion.prompt}
                  </h2>
                  {currentQuestion.helpText && (
                    <p className="text-sm text-warm-muted mb-4">
                      {currentQuestion.helpText}
                    </p>
                  )}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      const input = e.currentTarget.elements.namedItem('text-input') as HTMLInputElement
                      if (input.value.trim()) handleAnswer(input.value.trim())
                    }}
                    className="mt-4 space-y-3"
                  >
                    <input
                      name="text-input"
                      type="text"
                      defaultValue={answers[currentQuestion.id] ?? ''}
                      placeholder={currentQuestion.placeholder ?? ''}
                      className="flex w-full rounded-md border border-warm-border bg-transparent px-3 py-2 text-sm text-warm-text shadow-xs placeholder:text-warm-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-calm-indigo"
                      autoFocus
                    />
                    <Button type="submit" className="w-full">
                      Continue &rarr;
                    </Button>
                  </form>
                </div>
              ) : (
                /* yes_no or single_choice */
                <div>
                  <h2 className="text-lg font-medium text-warm-text mb-2">
                    {currentQuestion.prompt}
                  </h2>
                  {currentQuestion.helpText && (
                    <p className="text-sm text-warm-muted mb-4">
                      {currentQuestion.helpText}
                    </p>
                  )}

                  <div className="flex flex-col gap-3 mt-4">
                    {currentQuestion.type === 'yes_no' ? (
                      <>
                        <button
                          onClick={() => handleAnswer('yes')}
                          className="rounded-md border border-warm-border p-4 text-left text-sm font-medium text-warm-text hover:border-calm-indigo hover:bg-calm-indigo/5 transition-colors"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => handleAnswer('no')}
                          className="rounded-md border border-warm-border p-4 text-left text-sm font-medium text-warm-text hover:border-calm-indigo hover:bg-calm-indigo/5 transition-colors"
                        >
                          No
                        </button>
                        {currentQuestion.notApplicable && (
                          <button
                            onClick={() => handleAnswer('na')}
                            className="rounded-lg border border-warm-border p-4 text-left text-sm font-medium text-warm-muted hover:border-warm-text hover:text-warm-text transition-colors"
                          >
                            {currentQuestion.notApplicable}
                          </button>
                        )}
                      </>
                    ) : (
                      currentQuestion.options?.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => handleAnswer(opt.value)}
                          className="rounded-md border border-warm-border p-4 text-left text-sm font-medium text-warm-text hover:border-calm-indigo hover:bg-calm-indigo/5 transition-colors"
                        >
                          {opt.label}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}

              {currentIndex > 0 && (
                <button
                  onClick={handleBack}
                  className="mt-4 text-sm text-warm-muted hover:text-warm-text"
                >
                  &larr; Previous question
                </button>
              )}
              {skippable && (
                <button
                  onClick={handleSkip}
                  disabled={skipping}
                  className="mt-4 inline-flex items-center justify-center gap-1.5 w-full text-sm text-warm-muted/70 hover:text-warm-muted transition-colors duration-150"
                >
                  <SkipForward className="size-3" />
                  {skipping ? 'Skipping...' : 'Already done this? Skip'}
                </button>
              )}
            </CardContent>
          </Card>
        </>
      ) : phase === 'summary' ? (
        <>
          {/* Full progress bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm text-warm-muted mb-2">
              <span>All questions answered</span>
              <span>100%</span>
            </div>
            <div className="h-2 rounded-full bg-warm-border">
              <div
                className="h-2 rounded-full bg-calm-indigo transition-all duration-500"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <Card>
            <CardContent className="pt-6">
              <h2 className="text-lg font-medium text-warm-text mb-4">
                Your personalized summary
              </h2>
              <ul className="space-y-3 mb-6">
                {summaryItems.map((item, i) => {
                  const { icon, color } = statusIcon[item.status]
                  return (
                    <li key={i} className="flex items-start gap-3">
                      <span className={`text-base font-bold ${color} mt-0.5 shrink-0`}>
                        {icon}
                      </span>
                      <span className="text-sm text-warm-text">{item.text}</span>
                    </li>
                  )
                })}
              </ul>

              <Button
                onClick={handleComplete}
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Saving...' : "I'm ready \u2192"}
              </Button>

              <button
                onClick={() => {
                  setPhase('questions')
                  setReviewMode(true)
                  // Skip leading info cards — go to the first actual input question
                  const firstInput = visibleQuestions.findIndex((q) => q.type !== 'info')
                  setCurrentIndex(firstInput >= 0 ? firstInput : 0)
                }}
                className="mt-4 block w-full text-center text-sm text-warm-muted hover:text-warm-text"
              >
                &larr; Review my answers
              </button>
              {skippable && (
                <button
                  onClick={handleSkip}
                  disabled={skipping}
                  className="mt-3 inline-flex items-center justify-center gap-1.5 w-full text-sm text-warm-muted/70 hover:text-warm-muted transition-colors duration-150"
                >
                  <SkipForward className="size-3" />
                  {skipping ? 'Skipping...' : 'Already done this? Skip'}
                </button>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}

      {config.references && config.references.length > 0 && (
        <div className="mt-6 pt-5 border-t border-warm-border">
          <p className="text-xs font-medium text-warm-muted uppercase tracking-wide mb-2">References</p>
          <ul className="space-y-1.5">
            {config.references.map((ref, i) => (
              <li key={i}>
                <a
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-calm-indigo hover:underline"
                >
                  {ref.label} ↗
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
