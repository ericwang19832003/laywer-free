'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import type { AssessmentQuestion } from '@/lib/assessment/questions'

interface AssessmentWizardProps {
  questions: AssessmentQuestion[]
  onComplete: (answers: Record<string, string>) => void
}

export function AssessmentWizard({ questions, onComplete }: AssessmentWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})

  const question = questions[currentStep]
  const isLast = currentStep === questions.length - 1
  const hasAnswer = !!answers[question.id]

  function selectAnswer(value: string) {
    setAnswers(prev => ({ ...prev, [question.id]: value }))
  }

  function next() {
    if (isLast) {
      onComplete(answers)
    } else {
      setCurrentStep(prev => prev + 1)
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Progress */}
      <div className="flex gap-1">
        {questions.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i <= currentStep ? 'bg-calm-indigo' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      <p className="text-xs text-gray-500">
        Question {currentStep + 1} of {questions.length}
      </p>

      <h2 className="text-xl font-semibold text-gray-900">{question.prompt}</h2>

      {question.type === 'single_choice' && question.options && (
        <div className="grid gap-2">
          {question.options.map((option) => (
            <button
              key={option.value}
              onClick={() => selectAnswer(option.value)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                answers[question.id] === option.value
                  ? 'border-calm-indigo bg-calm-indigo/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="font-medium text-gray-900">{option.label}</span>
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-3">
        {currentStep > 0 && (
          <Button
            variant="outline"
            onClick={() => setCurrentStep(prev => prev - 1)}
          >
            Back
          </Button>
        )}
        <Button
          onClick={next}
          disabled={!hasAnswer}
          className="flex-1 bg-calm-indigo hover:bg-calm-indigo/90"
        >
          {isLast ? 'See My Assessment' : 'Next'}
        </Button>
      </div>
    </div>
  )
}
