'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Clock } from 'lucide-react'
import type { WizardStep } from '@/components/ui/wizard-shell'

interface FamilyStepPreviewProps {
  steps: WizardStep[]
  totalMinutes: number
  onContinue: () => void
}

export function FamilyStepPreview({ steps, totalMinutes, onContinue }: FamilyStepPreviewProps) {
  return (
    <Card className="border-warm-border">
      <CardContent className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-warm-text">What to expect</h2>
          <p className="text-sm text-warm-muted">
            We&apos;ll guide you through a few short steps to gather the right
            information.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-warm-muted">
          <Clock className="h-3.5 w-3.5" />
          <span>About {totalMinutes} minutes</span>
        </div>

        <div className="space-y-2">
          {steps.map((step) => (
            <div
              key={step.id}
              className="rounded-lg border border-warm-border p-3"
            >
              <p className="text-sm font-medium text-warm-text">{step.title}</p>
              {step.subtitle && (
                <p className="text-xs text-warm-muted mt-0.5">{step.subtitle}</p>
              )}
            </div>
          ))}
        </div>

        <div className="rounded-lg bg-calm-indigo/5 border border-calm-indigo/20 p-3 text-xs text-warm-text">
          You can save and come back later. You don&apos;t need everything to start.
        </div>

        <Button className="w-full" onClick={onContinue}>
          Continue
        </Button>
      </CardContent>
    </Card>
  )
}
