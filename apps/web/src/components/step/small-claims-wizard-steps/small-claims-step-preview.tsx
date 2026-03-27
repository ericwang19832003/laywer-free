'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Clock } from 'lucide-react'
import type { WizardStep } from '@/components/ui/wizard-shell'

interface SmallClaimsStepPreviewProps {
  steps: WizardStep[]
  totalMinutes: number
  onContinue: () => void
}

export function SmallClaimsStepPreview({ steps, totalMinutes, onContinue }: SmallClaimsStepPreviewProps) {
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

        <div className="rounded-lg border border-warm-border bg-warm-bg/30 p-3">
          <p className="text-sm font-semibold text-warm-text">You will finish today</p>
          <ul className="mt-2 space-y-1 text-sm text-warm-muted">
            <li>Draft petition details</li>
            <li>Damages totals</li>
            <li>Filing checklist</li>
          </ul>
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
