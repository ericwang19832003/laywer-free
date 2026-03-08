'use client'

import { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { GuidedStepConfig, SummaryItem } from '@/lib/guided-steps/types'

interface GuidedStepProps {
  caseId: string
  taskId: string
  config: GuidedStepConfig
  existingAnswers?: Record<string, string>
  onAfterComplete?: () => Promise<void>
  wrapperClassName?: string
}

export function GuidedStep({
  caseId,
  taskId,
  config,
  existingAnswers,
  onAfterComplete,
  wrapperClassName,
}: GuidedStepProps) {
  const router = useRouter()
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
      } catch {
        // Non-fatal: continue even if save fails
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

    if (nextUnanswered !== -1) {
      setCurrentIndex(nextUnanswered)
    } else {
      // All questions answered -- show summary
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
      // Ensure task is in_progress before completing (guards against skipped auto-save)
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'in_progress',
          metadata: { guided_answers: answers },
        }),
      })

      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'completed',
          metadata: { guided_answers: answers },
        }),
      })
      if (!res.ok) throw new Error('Failed to complete task')
      if (onAfterComplete) {
        await onAfterComplete()
      }
      router.push(`/case/${caseId}`)
      router.refresh()
    } catch {
      setLoading(false)
    }
  }

  const summaryItems: SummaryItem[] = useMemo(
    () => (phase === 'summary' ? config.generateSummary(answers) : []),
    [phase, config, answers]
  )

  const statusIcon: Record<SummaryItem['status'], { icon: string; color: string }> = {
    done: { icon: '\u2713', color: 'text-green-600' },
    needed: { icon: '\u26A0', color: 'text-amber-500' },
    info: { icon: '\u2139', color: 'text-indigo-500' },
  }

  return (
    <div className={wrapperClassName ?? "max-w-2xl mx-auto px-4 py-8"}>
      <Link
        href={`/case/${caseId}`}
        className="text-sm text-warm-muted hover:text-warm-text mb-6 inline-block"
      >
        &larr; Back to dashboard
      </Link>

      <h1 className="text-2xl font-semibold text-warm-text mb-1">
        {config.title}
      </h1>
      <p className="text-warm-muted mb-8">{config.reassurance}</p>

      {phase === 'questions' && currentQuestion ? (
        <>
          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm text-warm-muted mb-2">
              <span>
                Question {currentIndex + 1} of {totalQuestions}
              </span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 rounded-full bg-warm-border">
              <div
                className="h-2 rounded-full bg-calm-indigo transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <Card>
            <CardContent className="pt-6">
              {currentQuestion.type === 'info' ? (
                /* Info type: styled info box */
                <div>
                  <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4 mb-4">
                    <p className="text-sm text-warm-text">
                      {currentQuestion.prompt}
                    </p>
                    {currentQuestion.helpText && (
                      <p className="text-sm text-warm-muted mt-2">
                        {currentQuestion.helpText}
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={() => handleAnswer('acknowledged')}
                    className="w-full"
                  >
                    Got it &rarr;
                  </Button>
                </div>
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
                          className="rounded-lg border border-warm-border p-4 text-left text-sm font-medium text-warm-text hover:border-calm-indigo hover:bg-calm-indigo/5 transition-colors"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => handleAnswer('no')}
                          className="rounded-lg border border-warm-border p-4 text-left text-sm font-medium text-warm-text hover:border-calm-indigo hover:bg-calm-indigo/5 transition-colors"
                        >
                          No
                        </button>
                      </>
                    ) : (
                      currentQuestion.options?.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => handleAnswer(opt.value)}
                          className="rounded-lg border border-warm-border p-4 text-left text-sm font-medium text-warm-text hover:border-calm-indigo hover:bg-calm-indigo/5 transition-colors"
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
                  setCurrentIndex(0)
                }}
                className="mt-4 block w-full text-center text-sm text-warm-muted hover:text-warm-text"
              >
                &larr; Review my answers
              </button>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  )
}
