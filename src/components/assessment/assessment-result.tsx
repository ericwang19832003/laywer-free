'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import type { AssessmentResult } from '@/lib/assessment/evaluate'

interface AssessmentResultProps {
  result: AssessmentResult
  disputeType: string
}

export function AssessmentResultCard({ result, disputeType }: AssessmentResultProps) {
  const scoreColor = result.viabilityScore >= 70
    ? 'text-green-600'
    : result.viabilityScore >= 40
    ? 'text-amber-600'
    : 'text-red-600'

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Your Case Assessment</h2>
        <div className={`text-5xl font-bold ${scoreColor}`}>
          {result.viabilityScore}%
        </div>
        <p className="text-lg text-gray-600">
          Case Viability: <span className="font-semibold">{result.viabilityLabel}</span>
        </p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Recommended Court</p>
              <p className="font-medium">{result.courtType}</p>
            </div>
            <div>
              <p className="text-gray-500">Est. Filing Fee</p>
              <p className="font-medium">{result.estimatedFilingFee}</p>
            </div>
            <div>
              <p className="text-gray-500">Est. Timeline</p>
              <p className="font-medium">{result.timeEstimate}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {result.keyInsights.length > 0 && (
        <Card>
          <CardContent className="pt-6 space-y-3">
            <h3 className="font-semibold text-gray-900">Key Insights</h3>
            {result.keyInsights.map((insight, i) => (
              <div key={i} className="flex gap-2 text-sm">
                {result.viabilityScore >= 70 ? (
                  <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                )}
                <span className="text-gray-600">{insight}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        <Button asChild className="w-full bg-calm-indigo hover:bg-calm-indigo/90" size="lg">
          <Link href={`/signup?disputeType=${disputeType}`}>
            Start Your Case Free <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
        <p className="text-xs text-center text-gray-400">
          Free to start. No credit card required.
        </p>
      </div>
    </div>
  )
}
