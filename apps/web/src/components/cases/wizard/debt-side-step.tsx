'use client'

import { OptionCard } from './option-card'

export type DebtSide = 'defendant' | 'plaintiff'

interface DebtSideStepProps {
  value: DebtSide | ''
  onSelect: (side: DebtSide) => void
}

export function DebtSideStep({ value, onSelect }: DebtSideStepProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-warm-text">
        Which side are you on?
      </p>
      <div className="space-y-2">
        <OptionCard
          label="I'm being sued for a debt"
          description="I received court papers about a debt and need to respond"
          selected={value === 'defendant'}
          onClick={() => onSelect('defendant')}
        />
        <OptionCard
          label="Someone owes me money"
          description="I want to collect a debt or file a lawsuit for money owed"
          selected={value === 'plaintiff'}
          onClick={() => onSelect('plaintiff')}
        />
      </div>

      <div className="rounded-md border border-calm-amber bg-calm-amber/5 px-4 py-3">
        <p className="text-xs font-medium text-calm-amber leading-relaxed">
          If you&apos;ve received court papers about a debt, choose &quot;I&apos;m being sued.&quot;
          We&apos;ll help you respond step by step.
        </p>
      </div>
    </div>
  )
}
