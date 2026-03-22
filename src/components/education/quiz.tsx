'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { CheckCircle2, XCircle, ChevronRight, Lightbulb, RotateCcw } from 'lucide-react'

export interface QuizOption {
  value: string
  label: string
  explanation?: string
  isCorrect?: boolean
}

export interface QuizQuestion {
  id: string
  question: string
  options: QuizOption[]
  explanation?: string
  tip?: string
}

export interface QuizProps {
  title: string
  description?: string
  questions: QuizQuestion[]
  onComplete?: (score: number, total: number) => void
  onQuestionAnswer?: (questionId: string, selectedValue: string, isCorrect: boolean) => void
  showExplanations?: boolean
  allowRetry?: boolean
  className?: string
}

export function Quiz({
  title,
  description,
  questions,
  onComplete,
  onQuestionAnswer,
  showExplanations = true,
  allowRetry = true,
  className,
}: QuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [showResult, setShowResult] = useState(false)
  const [selectedValue, setSelectedValue] = useState<string>('')

  const currentQuestion = questions[currentIndex]
  const progress = ((currentIndex + (showResult ? 1 : 0)) / questions.length) * 100
  const isLastQuestion = currentIndex === questions.length - 1
  const hasAnswered = !!answers[currentQuestion.id]

  const handleAnswer = (value: string) => {
    if (hasAnswered) return
    setSelectedValue(value)
  }

  const handleSubmit = () => {
    const isCorrect = currentQuestion.options.find(o => o.value === selectedValue)?.isCorrect ?? false
    
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: selectedValue
    }))

    onQuestionAnswer?.(currentQuestion.id, selectedValue, isCorrect)
    setShowResult(true)
  }

  const handleNext = () => {
    setShowResult(false)
    setSelectedValue('')
    
    if (isLastQuestion) {
      const correctCount = questions.filter(q => {
        const correctOption = q.options.find(o => o.isCorrect)
        return answers[q.id] === correctOption?.value
      }).length
      onComplete?.(correctCount, questions.length)
    } else {
      setCurrentIndex(prev => prev + 1)
    }
  }

  const handleRetry = () => {
    setAnswers({})
    setCurrentIndex(0)
    setShowResult(false)
    setSelectedValue('')
  }

  const selectedOption = currentQuestion.options.find(o => o.value === selectedValue)
  const isCorrectAnswer = selectedOption?.isCorrect

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-lg">{title}</CardTitle>
          <span className="text-sm text-warm-muted">
            {currentIndex + 1} of {questions.length}
          </span>
        </div>
        {description && (
          <p className="text-sm text-warm-muted">{description}</p>
        )}
        <Progress value={progress} className="h-2 mt-4" />
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Question */}
        <div>
          <h3 className="font-semibold text-warm-text mb-4">
            {currentQuestion.question}
          </h3>

          <div className="space-y-3">
            {currentQuestion.options.map((option) => {
              const isSelected = selectedValue === option.value
              const showCorrect = hasAnswered && option.isCorrect
              const showIncorrect = hasAnswered && isSelected && !option.isCorrect

              return (
                <button
                  key={option.value}
                  onClick={() => handleAnswer(option.value)}
                  disabled={hasAnswered}
                  className={cn(
                    'w-full flex items-start gap-3 p-4 rounded-lg border text-left transition-all',
                    isSelected && !hasAnswered && 'border-calm-indigo bg-calm-indigo/5',
                    showCorrect && 'border-calm-green bg-calm-green/10',
                    showIncorrect && 'border-red-300 bg-red-50',
                    !isSelected && !showCorrect && 'border-warm-border hover:border-calm-indigo/50',
                    hasAnswered && 'cursor-default'
                  )}
                >
                  <div className={cn(
                    'w-5 h-5 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center',
                    isSelected && !hasAnswered && 'border-calm-indigo bg-calm-indigo',
                    showCorrect && 'border-calm-green bg-calm-green',
                    showIncorrect && 'border-red-500 bg-red-500',
                    !isSelected && !showCorrect && 'border-warm-muted'
                  )}>
                    {(isSelected || showCorrect) && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <span className="flex-1 text-sm">{option.label}</span>
                  {showCorrect && (
                    <CheckCircle2 className="h-5 w-5 text-calm-green shrink-0" />
                  )}
                  {showIncorrect && (
                    <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Explanation */}
        {showResult && showExplanations && (
          <div className={cn(
            'p-4 rounded-lg',
            isCorrectAnswer ? 'bg-calm-green/10 border border-calm-green/30' : 'bg-warm-bg border border-warm-border'
          )}>
            <div className="flex items-start gap-3">
              {isCorrectAnswer ? (
                <CheckCircle2 className="h-5 w-5 text-calm-green shrink-0 mt-0.5" />
              ) : (
                <XCircle className={cn('h-5 w-5 shrink-0 mt-0.5', hasAnswered && selectedOption ? 'text-red-500' : 'text-calm-amber')} />
              )}
              <div className="flex-1">
                <p className={cn(
                  'font-medium mb-1',
                  isCorrectAnswer ? 'text-calm-green' : 'text-warm-text'
                )}>
                  {isCorrectAnswer ? 'Correct!' : selectedValue ? 'Not quite.' : 'Here\'s the answer:'}
                </p>
                {selectedOption?.explanation && (
                  <p className="text-sm text-warm-muted">{selectedOption.explanation}</p>
                )}
                {currentQuestion.explanation && (
                  <p className="text-sm text-warm-muted mt-2">{currentQuestion.explanation}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tip */}
        {showResult && currentQuestion.tip && (
          <div className="flex items-start gap-3 p-3 bg-calm-indigo/5 rounded-lg">
            <Lightbulb className="h-4 w-4 text-calm-indigo shrink-0 mt-0.5" />
            <p className="text-sm text-warm-muted">{currentQuestion.tip}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          {allowRetry && hasAnswered && (
            <Button variant="ghost" onClick={handleRetry} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Retry Quiz
            </Button>
          )}
          <div className="ml-auto">
            {!hasAnswered ? (
              <Button onClick={handleSubmit} disabled={!selectedValue} className="gap-2">
                Submit Answer
              </Button>
            ) : (
              <Button onClick={handleNext} className="gap-2">
                {isLastQuestion ? 'See Results' : 'Next Question'}
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Pre-built quizzes
export const COURT_SELECTOR_QUIZ: QuizQuestion[] = [
  {
    id: 'amount',
    question: 'How much money are you seeking?',
    options: [
      { value: 'under_10k', label: 'Under $10,000', isCorrect: true },
      { value: '10k_75k', label: '$10,000 - $75,000' },
      { value: '75k_200k', label: '$75,000 - $200,000' },
      { value: 'over_200k', label: 'Over $200,000' },
      { value: 'not_money', label: 'I\'m not seeking money (equity case)' },
    ],
    explanation: 'Justice Courts can handle claims up to $10,000. County Courts handle up to $200,000. District Courts handle larger amounts.',
  },
  {
    id: 'type',
    question: 'What type of case is this?',
    options: [
      { value: 'money', label: 'Money owed (debt, breach of contract)', isCorrect: true },
      { value: 'property', label: 'Property dispute (landlord-tenant, real estate)' },
      { value: 'injury', label: 'Personal injury (car accident, slip and fall)' },
      { value: 'family', label: 'Family matter (divorce, custody, child support)' },
    ],
    explanation: 'Different courts handle different types of cases. The type helps narrow down which court is appropriate.',
  },
  {
    id: 'location',
    question: 'Where should this case be filed?',
    options: [
      { value: 'incident', label: 'Where the incident/problem happened', isCorrect: true },
      { value: 'defendant', label: 'Where the defendant lives or does business' },
      { value: 'contract', label: 'Where the contract was signed or performed' },
      { value: 'not_sure', label: 'I\'m not sure' },
    ],
    tip: 'Usually, you can file in the county where the incident happened OR where the defendant lives. We can help you figure this out.',
  },
]

export const FILING_BASICS_QUIZ: QuizQuestion[] = [
  {
    id: 'service',
    question: 'After you file your petition, what must happen within 30 days?',
    options: [
      { value: 'trial', label: 'The trial must be completed' },
      { value: 'serve', label: 'The defendant must be served', isCorrect: true },
      { value: 'pay', label: 'You must pay additional fees' },
      { value: 'nothing', label: 'Nothing - you can wait as long as you want' },
    ],
    explanation: 'Service of process must occur within 30 days of filing, or the court may dismiss your case.',
  },
  {
    id: 'plaintiff',
    question: 'In a lawsuit, who is the plaintiff?',
    options: [
      { value: 'suing', label: 'The person filing the lawsuit', isCorrect: true },
      { value: 'being_sued', label: 'The person being sued' },
      { value: 'judge', label: 'The judge presiding over the case' },
      { value: 'lawyer', label: 'The lawyer representing someone' },
    ],
    explanation: 'The plaintiff is the person who initiates the lawsuit by filing a petition.',
  },
  {
    id: 'answer',
    question: 'If you\'re sued (you\'re the defendant), what should you file?',
    options: [
      { value: 'petition', label: 'Another petition' },
      { value: 'answer', label: 'An Answer', isCorrect: true },
      { value: 'appeal', label: 'An Appeal' },
      { value: 'nothing', label: 'Nothing - the case will go away' },
    ],
    explanation: 'If you\'re sued, you must file a written Answer to respond to the claims against you. Ignoring the lawsuit can result in a default judgment against you.',
    tip: 'Filing an Answer doesn\'t mean you\'re admitting anything - it\'s just your formal response.',
  },
]
