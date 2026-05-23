'use client'

import { useState } from 'react'
import { ClipboardCheck, ChevronRight, AlertTriangle, CheckCircle2, XCircle, RotateCcw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getStrengthProfile, getVerdict, type StrengthQuestion } from '@/lib/case-strength/questions'

interface CaseStrengthCheckProps {
  disputeType: string
}

type Phase = 'intro' | 'questions' | 'results'

const VERDICT_CONFIG = {
  strong: {
    icon: CheckCircle2,
    color: 'text-calm-green',
    bg: 'bg-calm-green/10',
    border: 'border-calm-green/20',
    label: 'Strong foundation',
    description: "You have the key evidence your case needs. Keep everything organized and follow the workflow steps.",
  },
  gaps: {
    icon: AlertTriangle,
    color: 'text-calm-amber',
    bg: 'bg-calm-amber/10',
    border: 'border-calm-amber/20',
    label: 'Gaps to address',
    description: "Your case has a foundation, but missing evidence could hurt your position. Address the items below before filing.",
  },
  needs_work: {
    icon: XCircle,
    color: 'text-destructive',
    bg: 'bg-destructive/10',
    border: 'border-destructive/20',
    label: 'Needs more preparation',
    description: "Collecting the missing evidence below before you file will significantly improve your chances.",
  },
}

export function CaseStrengthCheck({ disputeType }: CaseStrengthCheckProps) {
  const profile = getStrengthProfile(disputeType)
  const [phase, setPhase] = useState<Phase>('intro')
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, boolean>>({})

  function handleAnswer(question: StrengthQuestion, yes: boolean) {
    const next = { ...answers, [question.id]: yes }
    setAnswers(next)
    if (currentIdx < profile.questions.length - 1) {
      setCurrentIdx(currentIdx + 1)
    } else {
      setPhase('results')
    }
  }

  function reset() {
    setPhase('intro')
    setCurrentIdx(0)
    setAnswers({})
  }

  const score = Object.values(answers).filter(Boolean).length
  const total = profile.questions.length
  const verdict = getVerdict(score, total)
  const config = VERDICT_CONFIG[verdict]
  const VerdictIcon = config.icon

  const gaps = profile.questions.filter(q => answers[q.id] === false)

  if (phase === 'intro') {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-warm-text flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-calm-indigo" />
            Is Your Case Ready?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-warm-muted leading-relaxed mb-4">
            Answer {total} quick questions about your evidence. We'll identify any gaps before you invest more time filing.
          </p>
          <div className="space-y-2 mb-5">
            {profile.questions.map((q, i) => (
              <div key={q.id} className="flex items-start gap-2">
                <span className="shrink-0 flex items-center justify-center h-5 w-5 rounded-full bg-calm-indigo/10 text-calm-indigo text-xs font-medium mt-0.5">
                  {i + 1}
                </span>
                <p className="text-xs text-warm-muted leading-snug">{q.question}</p>
              </div>
            ))}
          </div>
          <Button
            onClick={() => setPhase('questions')}
            className="w-full"
            size="sm"
          >
            Start check
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (phase === 'questions') {
    const question = profile.questions[currentIdx]
    const progress = ((currentIdx) / total) * 100

    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-warm-text flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-calm-indigo" />
              Is Your Case Ready?
            </CardTitle>
            <span className="text-xs text-warm-muted tabular-nums">{currentIdx + 1} / {total}</span>
          </div>
          <div className="h-1.5 bg-warm-border/40 rounded-full overflow-hidden mt-2">
            <div
              className="h-full bg-calm-indigo rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-warm-text leading-relaxed font-medium mb-6">
            {question.question}
          </p>
          <div className="flex gap-3">
            <Button
              onClick={() => handleAnswer(question, true)}
              variant="outline"
              className="flex-1 border-calm-green/30 text-calm-green hover:bg-calm-green/10 hover:border-calm-green/50"
              size="sm"
            >
              <CheckCircle2 className="h-4 w-4 mr-1.5" />
              Yes
            </Button>
            <Button
              onClick={() => handleAnswer(question, false)}
              variant="outline"
              className="flex-1 border-warm-border text-warm-muted hover:bg-warm-border/30"
              size="sm"
            >
              Not yet
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Results phase
  return (
    <Card className={`border ${config.border}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-warm-text flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-calm-indigo" />
          Is Your Case Ready?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Score + verdict */}
        <div className={`rounded-xl ${config.bg} px-4 py-3 flex items-start gap-3`}>
          <VerdictIcon className={`h-5 w-5 ${config.color} shrink-0 mt-0.5`} />
          <div>
            <p className={`text-sm font-semibold ${config.color}`}>
              {score}/{total} — {config.label}
            </p>
            <p className="text-xs text-warm-muted leading-snug mt-0.5">
              {config.description}
            </p>
          </div>
        </div>

        {/* Gap action items */}
        {gaps.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-warm-text">What to collect next:</p>
            {gaps.map((q) => (
              <div key={q.id} className="flex items-start gap-2 rounded-lg bg-warm-bg/80 px-3 py-2">
                <AlertTriangle className="h-3.5 w-3.5 text-calm-amber shrink-0 mt-0.5" />
                <p className="text-xs text-warm-muted leading-snug">{q.actionIfNo}</p>
              </div>
            ))}
          </div>
        )}

        {/* All good message */}
        {gaps.length === 0 && (
          <p className="text-xs text-calm-green/80 leading-relaxed">
            You answered yes to every question. Your evidence foundation is solid — focus on completing the workflow steps.
          </p>
        )}

        <button
          onClick={reset}
          className="flex items-center gap-1.5 text-xs text-warm-muted hover:text-warm-text transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Retake check
        </button>
      </CardContent>
    </Card>
  )
}
