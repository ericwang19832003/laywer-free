'use client'

import { Check } from 'lucide-react'
import type { Milestone } from '@lawyer-free/shared/rules/milestones'

interface MilestoneStepProps {
  milestones: Milestone[]
  value: string
  onSelect: (milestoneId: string) => void
}

export function MilestoneStep({ milestones, value, onSelect }: MilestoneStepProps) {
  const selectedIndex = milestones.findIndex((m) => m.id === value)

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium text-warm-text">
          Where are you in your case?
        </p>
        <p className="text-xs text-warm-muted mt-1">
          Select the stage that best describes where you are right now. We&apos;ll
          skip the steps you&apos;ve already completed.
        </p>
      </div>

      <div className="relative">
        {milestones.map((milestone, index) => {
          const isSelected = milestone.id === value
          const isPast = selectedIndex !== -1 && index < selectedIndex
          const isFuture = selectedIndex !== -1 && index > selectedIndex

          return (
            <div key={milestone.id} className="relative flex items-start pb-6">
              {/* Vertical connector line */}
              {index < milestones.length - 1 && (
                <div
                  className={`absolute left-[15px] top-[30px] w-[2px] h-[calc(100%-24px)] ${
                    isPast || isSelected
                      ? 'bg-primary/30'
                      : 'bg-warm-border'
                  }`}
                />
              )}

              {/* Node circle */}
              <button
                type="button"
                onClick={() => onSelect(milestone.id)}
                className="relative flex items-start gap-3 w-full text-left group"
              >
                <div
                  className={`relative flex-shrink-0 flex items-center justify-center w-[30px] h-[30px] rounded-full border-2 transition-colors ${
                    isSelected
                      ? 'border-primary bg-primary'
                      : isPast
                        ? 'border-primary/40 bg-primary/10'
                        : 'border-warm-border bg-background'
                  } ${isFuture ? 'opacity-50' : ''}`}
                >
                  {isSelected && (
                    <div className="w-2.5 h-2.5 rounded-full bg-white" />
                  )}
                  {isPast && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>

                {/* Label and description */}
                <div className={`pt-0.5 ${isFuture ? 'opacity-50' : ''}`}>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-medium ${
                        isSelected
                          ? 'text-primary'
                          : 'text-warm-text'
                      }`}
                    >
                      {milestone.label}
                    </span>
                    {isSelected && (
                      <span className="bg-primary/10 text-primary text-[10px] font-medium rounded-full px-2 py-0.5">
                        You are here
                      </span>
                    )}
                  </div>
                  <span className="block text-xs mt-0.5 text-warm-muted">
                    {milestone.description}
                  </span>
                </div>
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
