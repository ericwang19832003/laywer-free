'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  ChevronLeft,
  Trophy,
  RotateCcw,
  Lightbulb,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Confetti, Celebration } from '@/components/ui/celebration'

interface QuizQuestion {
  id: string
  question: string
  options: {
    id: string
    text: string
    explanation?: string
  }[]
  correctOptionId: string
  explanation: string
  category?: string
}

interface Quiz {
  id: string
  title: string
  description: string
  questions: QuizQuestion[]
  passingScore?: number
}

interface QuizPlayerProps {
  quiz: Quiz
  onComplete?: (score: number, passed: boolean) => void
  onQuestionAnswer?: (questionId: string, selectedId: string, correct: boolean) => void
  className?: string
}

export function QuizPlayer({ quiz, onComplete, onQuestionAnswer, className }: QuizPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [showConfetti, setShowConfetti] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const currentQuestion = quiz.questions[currentIndex]
  const totalQuestions = quiz.questions.length
  const progress = ((currentIndex + 1) / totalQuestions) * 100
  const isLastQuestion = currentIndex === totalQuestions - 1

  const correctAnswers = Object.entries(answers).filter(([questionId, optionId]) => {
    const question = quiz.questions.find(q => q.id === questionId)
    return question?.correctOptionId === optionId
  }).length

  const score = Math.round((correctAnswers / totalQuestions) * 100)
  const passingScore = quiz.passingScore || 70
  const passed = score >= passingScore

  const handleSelectOption = (optionId: string) => {
    if (showResult) return
    setSelectedOption(optionId)
  }

  const handleSubmit = () => {
    if (!selectedOption) return
    
    setShowResult(true)
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: selectedOption }))
    
    const isCorrect = selectedOption === currentQuestion.correctOptionId
    onQuestionAnswer?.(currentQuestion.id, selectedOption, isCorrect)
  }

  const handleNext = () => {
    if (isLastQuestion) {
      setIsComplete(true)
      if (passed) {
        setShowConfetti(true)
        setShowCelebration(true)
        setTimeout(() => setShowConfetti(false), 5000)
      }
      onComplete?.(score, passed)
    } else {
      setCurrentIndex(prev => prev + 1)
      setSelectedOption(null)
      setShowResult(false)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
      setSelectedOption(answers[quiz.questions[currentIndex - 1].id] || null)
      setShowResult(!!answers[quiz.questions[currentIndex - 1].id])
    }
  }

  const handleRestart = () => {
    setCurrentIndex(0)
    setSelectedOption(null)
    setShowResult(false)
    setAnswers({})
    setIsComplete(false)
    setShowConfetti(false)
    setShowCelebration(false)
  }

  if (isComplete) {
    return (
      <>
        <Card className={cn('text-center', className)}>
          <CardContent className="py-12">
            <div className={cn(
              'w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6',
              passed ? 'bg-calm-green/10' : 'bg-red-50'
            )}>
              {passed ? (
                <Trophy className="h-10 w-10 text-calm-green" />
              ) : (
                <XCircle className="h-10 w-10 text-red-500" />
              )}
            </div>
            
            <h2 className="text-2xl font-bold text-warm-text mb-2">
              {passed ? 'Congratulations!' : 'Keep Learning!'}
            </h2>
            
            <p className="text-warm-muted mb-6">
              {passed 
                ? "You've passed the quiz and demonstrated your knowledge!"
                : `You need ${passingScore}% to pass. Review the material and try again!`
              }
            </p>

            <div className="flex justify-center gap-8 mb-8">
              <div>
                <div className="text-3xl font-bold text-warm-text">{score}%</div>
                <div className="text-sm text-warm-muted">Your Score</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-calm-green">{correctAnswers}/{totalQuestions}</div>
                <div className="text-sm text-warm-muted">Correct</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-warm-muted">{passingScore}%</div>
                <div className="text-sm text-warm-muted">Passing</div>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={handleRestart} className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Try Again
              </Button>
              <Button onClick={handleRestart} className="gap-2">
                Continue Learning
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Confetti show={showConfetti} />
        <Celebration
          show={showCelebration}
          type="milestone"
          title="Quiz Passed!"
          message={`You scored ${score}% on "${quiz.title}"`}
          onDismiss={() => setShowCelebration(false)}
          autoDismiss={5000}
        />
      </>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between mb-4">
          <Badge variant="outline">
            Question {currentIndex + 1} of {totalQuestions}
          </Badge>
          {currentQuestion.category && (
            <Badge>{currentQuestion.category}</Badge>
          )}
        </div>
        <Progress value={progress} className="h-2 mb-4" />
        <CardTitle className="text-lg">{currentQuestion.question}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-3">
          {currentQuestion.options.map((option) => {
            const isSelected = selectedOption === option.id
            const isCorrect = option.id === currentQuestion.correctOptionId
            const showCorrect = showResult && isCorrect
            const showIncorrect = showResult && isSelected && !isCorrect

            return (
              <button
                key={option.id}
                onClick={() => handleSelectOption(option.id)}
                disabled={showResult}
                className={cn(
                  'w-full flex items-start gap-3 p-4 rounded-lg border text-left transition-all',
                  isSelected && !showResult && 'border-primary bg-primary/5',
                  showCorrect && 'border-calm-green bg-calm-green/5',
                  showIncorrect && 'border-red-500 bg-red-50',
                  !showResult && !isSelected && 'hover:border-warm-border hover:bg-warm-border/30'
                )}
              >
                <div className={cn(
                  'w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5',
                  isSelected && !showResult && 'border-primary bg-primary',
                  showCorrect && 'border-calm-green bg-calm-green',
                  showIncorrect && 'border-red-500 bg-red-500',
                  !isSelected && !showResult && 'border-warm-border'
                )}>
                  {isSelected && !showResult && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                  {showCorrect && (
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  )}
                  {showIncorrect && (
                    <XCircle className="h-4 w-4 text-white" />
                  )}
                </div>
                <span className={cn(
                  'flex-1',
                  showCorrect && 'text-calm-green font-medium',
                  showIncorrect && 'text-red-500'
                )}>
                  {option.text}
                </span>
              </button>
            )
          })}
        </div>

        {showResult && (
          <div className={cn(
            'p-4 rounded-lg border',
            selectedOption === currentQuestion.correctOptionId 
              ? 'bg-calm-green/5 border-calm-green/20'
              : 'bg-red-50 border-red-200'
          )}>
            <div className="flex items-start gap-3">
              {selectedOption === currentQuestion.correctOptionId ? (
                <CheckCircle2 className="h-5 w-5 text-calm-green flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className={cn(
                  'font-medium',
                  selectedOption === currentQuestion.correctOptionId 
                    ? 'text-calm-green'
                    : 'text-red-500'
                )}>
                  {selectedOption === currentQuestion.correctOptionId 
                    ? 'Correct!' 
                    : 'Incorrect'}
                </p>
                <p className="text-sm text-warm-muted mt-1">
                  {currentQuestion.explanation}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between pt-4 border-t border-warm-border">
          <Button
            variant="ghost"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          {!showResult ? (
            <Button
              onClick={handleSubmit}
              disabled={!selectedOption}
            >
              Check Answer
            </Button>
          ) : (
            <Button onClick={handleNext} className="gap-1">
              {isLastQuestion ? 'See Results' : 'Next Question'}
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface QuizListProps {
  quizzes: Quiz[]
  onSelectQuiz?: (quiz: Quiz) => void
  className?: string
}

export function QuizList({ quizzes, onSelectQuiz, className }: QuizListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {quizzes.map((quiz) => (
        <Card 
          key={quiz.id} 
          className="hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onSelectQuiz?.(quiz)}
        >
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <Badge variant="outline">{quiz.questions.length} questions</Badge>
              <Badge variant="secondary">
                {quiz.passingScore || 70}% to pass
              </Badge>
            </div>
            <h3 className="font-semibold text-warm-text mb-1">{quiz.title}</h3>
            <p className="text-sm text-warm-muted">{quiz.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Pre-built quizzes
export const LEGAL_BASICS_QUIZ: Quiz = {
  id: 'legal-basics-101',
  title: 'Legal Basics 101',
  description: 'Test your knowledge of fundamental legal concepts.',
  passingScore: 70,
  questions: [
    {
      id: 'q1',
      question: 'What is a "Petition" in a civil lawsuit?',
      options: [
        { id: 'a', text: 'A request to the court asking for something' },
        { id: 'b', text: 'A response from the defendant' },
        { id: 'c', text: 'Evidence submitted to the court' },
        { id: 'd', text: 'A motion to dismiss the case' },
      ],
      correctOptionId: 'a',
      explanation: 'A petition (or complaint) is the initial document filed with the court that starts a lawsuit. It explains who you are, who you are suing, and what you want the court to do.',
      category: 'Filing',
    },
    {
      id: 'q2',
      question: 'What is "venue" in a legal case?',
      options: [
        { id: 'a', text: 'The type of court (state vs. federal)' },
        { id: 'b', text: 'The specific courthouse where your case will be heard' },
        { id: 'c', text: 'The judge assigned to your case' },
        { id: 'd', text: 'The amount of money being requested' },
      ],
      correctOptionId: 'b',
      explanation: 'Venue refers to the specific location (county/court) where your case will be heard. Typically, you can file in the county where the incident happened or where the defendant lives.',
      category: 'Jurisdiction',
    },
    {
      id: 'q3',
      question: 'What is "service of process"?',
      options: [
        { id: 'a', text: 'Delivering legal documents to the other party' },
        { id: 'b', text: 'Filing documents with the court' },
        { id: 'c', text: 'Presenting evidence at trial' },
        { id: 'd', text: 'Sending an email to your lawyer' },
      ],
      correctOptionId: 'a',
      explanation: 'Service of process is the formal method of delivering legal documents (like a petition) to the defendant so they are officially notified about the lawsuit.',
      category: 'Procedure',
    },
    {
      id: 'q4',
      question: 'What is a "default judgment"?',
      options: [
        { id: 'a', text: 'A judgment that is automatically applied to all cases' },
        { id: 'b', text: 'A judgment entered when the defendant fails to respond' },
        { id: 'c', text: 'The first judgment in a case' },
        { id: 'd', text: 'A temporary ruling while waiting for trial' },
      ],
      correctOptionId: 'b',
      explanation: 'A default judgment is entered when the defendant fails to respond to a lawsuit within the required time period. This usually means the plaintiff wins by default.',
      category: 'Judgment',
    },
    {
      id: 'q5',
      question: 'What does "burden of proof" mean?',
      options: [
        { id: 'a', text: 'The defendant must prove their innocence' },
        { id: 'b', text: 'The responsibility to prove your case' },
        { id: 'c', text: 'The cost of filing a lawsuit' },
        { id: 'd', text: 'The amount of evidence required' },
      ],
      correctOptionId: 'b',
      explanation: 'The burden of proof is the responsibility to prove your claims. In most civil cases, the plaintiff (you) has the burden to prove your case by "preponderance of evidence" (more likely than not).',
      category: 'Evidence',
    },
  ],
}

export const COURT_SYSTEM_QUIZ: Quiz = {
  id: 'court-system',
  title: 'Understanding the Court System',
  description: 'Learn about different types of courts and their jurisdictions.',
  passingScore: 70,
  questions: [
    {
      id: 'q1',
      question: 'Which court handles small claims typically?',
      options: [
        { id: 'a', text: 'Federal District Court' },
        { id: 'b', text: 'Justice of the Peace or Small Claims Court' },
        { id: 'c', text: 'Court of Appeals' },
        { id: 'd', text: 'Supreme Court' },
      ],
      correctOptionId: 'b',
      explanation: 'Justice of the Peace (JP) courts and Small Claims courts handle disputes up to a certain dollar amount (typically $10,000-$20,000) with simpler procedures.',
      category: 'Jurisdiction',
    },
    {
      id: 'q2',
      question: 'What is "jurisdiction"?',
      options: [
        { id: 'a', text: 'The court building location' },
        { id: 'b', text: 'The court\'s authority to hear a case' },
        { id: 'c', text: 'The judge\'s name' },
        { id: 'd', text: 'The filing fee amount' },
      ],
      correctOptionId: 'b',
      explanation: 'Jurisdiction is a court\'s legal authority to hear and decide a case. A court must have both subject matter jurisdiction (over the type of case) and personal jurisdiction (over the parties).',
      category: 'Jurisdiction',
    },
  ],
}
