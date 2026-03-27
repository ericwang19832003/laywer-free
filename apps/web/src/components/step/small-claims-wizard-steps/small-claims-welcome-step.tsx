'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface SmallClaimsWelcomeStepProps {
  onContinue: () => void
}

export function SmallClaimsWelcomeStep({ onContinue }: SmallClaimsWelcomeStepProps) {
  return (
    <Card className="border-warm-border">
      <CardContent className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-warm-text">Welcome to Texas Small Claims</h2>
          <p className="text-sm text-warm-muted">
            Justice Court is for claims up to $20,000. We&apos;ll help you prepare a
            draft petition and a clear filing checklist.
          </p>
        </div>

        <div className="rounded-lg border border-calm-indigo/20 bg-calm-indigo/5 p-3 text-sm text-warm-text">
          One step at a time. You can save your progress and come back anytime.
        </div>

        <div className="rounded-lg border border-warm-border bg-warm-bg/30 p-3">
          <p className="text-sm font-semibold text-warm-text">What you will do today</p>
          <ul className="mt-2 space-y-1 text-sm text-warm-muted">
            <li>Confirm you qualify for Texas small claims</li>
            <li>Draft petition details</li>
            <li>Filing checklist</li>
          </ul>
        </div>

        <Button className="w-full" onClick={onContinue}>
          I&apos;m ready
        </Button>
      </CardContent>
    </Card>
  )
}
