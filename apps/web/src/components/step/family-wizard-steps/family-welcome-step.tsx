'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface FamilyWelcomeStepProps {
  onContinue: () => void
}

export function FamilyWelcomeStep({ onContinue }: FamilyWelcomeStepProps) {
  return (
    <Card className="border-warm-border">
      <CardContent className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-warm-text">Welcome to Family Cases</h2>
          <p className="text-sm text-warm-muted">
            One step at a time. We&apos;ll help you prepare a draft filing and a
            clear checklist for what comes next.
          </p>
        </div>

        <div className="rounded-lg border border-calm-indigo/20 bg-calm-indigo/5 p-3 text-sm text-warm-text">
          You&apos;re in control. You can save your progress and come back anytime.
        </div>

        <Button className="w-full" onClick={onContinue}>
          I&apos;m ready
        </Button>
      </CardContent>
    </Card>
  )
}
