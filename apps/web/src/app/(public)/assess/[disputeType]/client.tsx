'use client'

import { useState } from 'react'
import { AssessmentWizard } from '@/components/assessment/assessment-wizard'
import { AssessmentResultCard } from '@/components/assessment/assessment-result'
import { evaluateAssessment } from '@/lib/assessment/evaluate'
import type { AssessmentQuestion } from '@/lib/assessment/questions'
import type { AssessmentResult } from '@/lib/assessment/evaluate'
import { Scale } from 'lucide-react'

interface Props {
  disputeType: string
  disputeLabel: string
  questions: AssessmentQuestion[]
}

export function AssessmentPageClient({ disputeType, disputeLabel, questions }: Props) {
  const [result, setResult] = useState<AssessmentResult | null>(null)

  function handleComplete(answers: Record<string, string>) {
    const assessment = evaluateAssessment(disputeType, answers)
    setResult(assessment)
  }

  if (result) {
    return <AssessmentResultCard result={result} disputeType={disputeType} />
  }

  return (
    <>
      <div className="text-center mb-8">
        <Scale className="h-10 w-10 text-calm-indigo mx-auto mb-3" />
        <h1 className="text-3xl font-bold text-gray-900">
          Free {disputeLabel} Case Assessment
        </h1>
        <p className="text-gray-600 mt-2">
          Answer {questions.length} quick questions to evaluate your case
        </p>
      </div>
      <AssessmentWizard questions={questions} onComplete={handleComplete} />
    </>
  )
}
