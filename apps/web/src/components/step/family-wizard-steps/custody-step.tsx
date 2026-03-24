'use client'

import { Label } from '@/components/ui/label'
import { HelpTooltip } from '@/components/ui/help-tooltip'
import { Scale } from 'lucide-react'

interface CustodyStepProps {
  arrangement: string
  reasoning: string
  onArrangementChange: (v: string) => void
  onReasoningChange: (v: string) => void
}

const custodyOptions = [
  {
    value: 'joint_managing',
    label: 'Joint Managing Conservators',
    description:
      'Both parents share rights and duties. Most common in Texas.',
    recommended: true,
  },
  {
    value: 'sole_managing',
    label: 'Sole Managing Conservator',
    description:
      'One parent has primary decision-making authority. Usually when the other parent is unfit or there is family violence.',
    recommended: false,
  },
  {
    value: 'possessory',
    label: 'Possessory Conservator',
    description:
      'Limited visitation rights for the other parent.',
    recommended: false,
  },
]

export function CustodyStep({
  arrangement,
  reasoning,
  onArrangementChange,
  onReasoningChange,
}: CustodyStepProps) {
  return (
    <div className="space-y-6">
      {/* Arrangement selection */}
      <div>
        <Label className="text-sm font-medium text-warm-text">
          What custody arrangement are you seeking?
        </Label>
        <HelpTooltip label="Which arrangement is right for me?">
          <p>
            Texas law presumes Joint Managing Conservators is in the child&apos;s best
            interest, unless there&apos;s evidence of family violence or abuse. The court
            will consider the child&apos;s emotional and physical needs, parental abilities,
            and any history of domestic violence.
          </p>
        </HelpTooltip>

        <div className="space-y-3 mt-3">
          {custodyOptions.map((option) => (
            <label
              key={option.value}
              className={`flex items-start gap-3 cursor-pointer rounded-lg border p-4 transition-colors ${
                arrangement === option.value
                  ? 'border-calm-indigo bg-calm-indigo/5'
                  : 'border-warm-border hover:bg-warm-bg/50'
              }`}
            >
              <input
                type="radio"
                name="custody-arrangement"
                value={option.value}
                checked={arrangement === option.value}
                onChange={(e) => onArrangementChange(e.target.value)}
                className="mt-1 h-4 w-4 shrink-0 text-calm-indigo focus:ring-calm-indigo"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-warm-text">
                    {option.label}
                  </span>
                  {option.recommended && (
                    <span className="rounded-full bg-calm-indigo/10 px-2 py-0.5 text-xs font-medium text-calm-indigo">
                      Recommended
                    </span>
                  )}
                </div>
                <p className="text-sm text-warm-muted mt-0.5">
                  {option.description}
                </p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Reasoning */}
      {arrangement && arrangement !== 'joint_managing' && (
        <div>
          <Label htmlFor="custody-reasoning" className="text-sm font-medium text-warm-text">
            Why do you believe this arrangement is best?
          </Label>
          <HelpTooltip label="What should I include?">
            <p>
              Focus on the children&apos;s best interest. Mention your involvement in their
              daily care, their routine, school, healthcare needs, and your living situation.
              If there are safety concerns, include those too.
            </p>
          </HelpTooltip>
          <textarea
            id="custody-reasoning"
            value={reasoning}
            onChange={(e) => onReasoningChange(e.target.value)}
            placeholder="Explain why this arrangement is in the best interest of the children..."
            className="mt-2 w-full rounded-md border border-warm-border bg-white px-3 py-2 text-sm text-warm-text placeholder:text-warm-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
            style={{ minHeight: '120px' }}
            rows={5}
          />
        </div>
      )}

      {/* Standard Possession Order info */}
      <div className="rounded-lg border border-calm-indigo/20 bg-calm-indigo/5 p-4">
        <div className="flex items-start gap-3">
          <Scale className="h-5 w-5 text-calm-indigo shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-warm-text">
              Standard Possession Order
            </p>
            <p className="text-sm text-warm-muted mt-1">
              Texas has a default visitation schedule under &sect; 153.312 that gives the
              non-custodial parent access on the 1st, 3rd, and 5th weekends, Thursday
              evenings, and alternating holidays. The court will use this schedule unless
              the parties agree to something different or there&apos;s a reason to deviate.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
