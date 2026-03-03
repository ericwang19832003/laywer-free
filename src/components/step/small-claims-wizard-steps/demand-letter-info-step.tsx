'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { HelpTooltip } from '@/components/ui/help-tooltip'

interface DemandLetterInfoStepProps {
  demandLetterSent: boolean
  demandLetterDate: string
  deadlineDays: string
  preferredResolution: string
  onFieldChange: (field: string, value: string | boolean) => void
}

export function DemandLetterInfoStep({
  demandLetterSent,
  demandLetterDate,
  deadlineDays,
  preferredResolution,
  onFieldChange,
}: DemandLetterInfoStepProps) {
  return (
    <div className="space-y-6">
      {/* Demand letter explanation */}
      <div className="rounded-lg border border-calm-indigo/20 bg-calm-indigo/5 p-4">
        <p className="text-sm text-warm-text">
          <strong>Why a demand letter matters:</strong> A demand letter often resolves disputes
          without going to court. It shows the judge you tried to resolve things first, which
          Texas courts look upon favorably.
        </p>
      </div>

      <HelpTooltip label="Tips for an effective demand letter">
        <div className="space-y-2">
          <p>A good demand letter should include:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>A clear description of the problem</li>
            <li>The specific amount you are owed</li>
            <li>A reasonable deadline for payment (typically 14-30 days)</li>
            <li>A statement that you will file a lawsuit if not resolved</li>
            <li>Send it by certified mail so you have proof of delivery</li>
          </ul>
        </div>
      </HelpTooltip>

      {/* Already sent checkbox */}
      <label className="flex items-start gap-3 cursor-pointer rounded-lg border border-warm-border p-3 transition-colors hover:bg-warm-bg/50">
        <input
          type="checkbox"
          checked={demandLetterSent}
          onChange={(e) => onFieldChange('demandLetterSent', e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-warm-border text-calm-indigo focus:ring-calm-indigo"
        />
        <span className="text-sm text-warm-text">I already sent a demand letter</span>
      </label>

      {demandLetterSent ? (
        /* Already sent — collect date and response info */
        <div className="space-y-4">
          <div>
            <Label htmlFor="demand-letter-date" className="text-sm font-medium text-warm-text">
              When did you send it?
            </Label>
            <Input
              id="demand-letter-date"
              type="date"
              value={demandLetterDate}
              onChange={(e) => onFieldChange('demandLetterDate', e.target.value)}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="demand-response" className="text-sm font-medium text-warm-text">
              Did you receive a response?
            </Label>
            <textarea
              id="demand-response"
              value={preferredResolution}
              onChange={(e) => onFieldChange('preferredResolution', e.target.value)}
              placeholder="Describe any response you received, or note if you received no response..."
              className="mt-2 w-full rounded-md border border-warm-border bg-white px-3 py-2 text-sm text-warm-text placeholder:text-warm-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
              style={{ minHeight: '96px' }}
              rows={4}
            />
          </div>
        </div>
      ) : (
        /* Not sent yet — collect deadline and resolution preference */
        <div className="space-y-4">
          <div>
            <Label htmlFor="deadline-days" className="text-sm font-medium text-warm-text">
              How many days should you give them to respond?
            </Label>
            <HelpTooltip label="What deadline is typical?">
              <p>
                14 to 30 days is standard. Shorter deadlines (7 days) may be appropriate for
                urgent situations. Longer deadlines (30 days) show the court you were
                reasonable.
              </p>
            </HelpTooltip>
            <select
              id="deadline-days"
              value={deadlineDays}
              onChange={(e) => onFieldChange('deadlineDays', e.target.value)}
              className="mt-2 w-full rounded-md border border-warm-border bg-white px-3 py-2 text-sm text-warm-text focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Select a deadline...</option>
              <option value="7">7 days</option>
              <option value="14">14 days</option>
              <option value="21">21 days</option>
              <option value="30">30 days</option>
            </select>
          </div>
          <div>
            <Label htmlFor="preferred-resolution" className="text-sm font-medium text-warm-text">
              What resolution would you accept?
            </Label>
            <HelpTooltip label="Why does this matter?">
              <p>
                Stating your preferred resolution shows you are willing to settle. Courts
                encourage parties to resolve disputes before trial. This could be a specific
                dollar amount, a repair, or another action.
              </p>
            </HelpTooltip>
            <textarea
              id="preferred-resolution"
              value={preferredResolution}
              onChange={(e) => onFieldChange('preferredResolution', e.target.value)}
              placeholder="e.g. I would accept full refund of $1,500 within 14 days to avoid going to court..."
              className="mt-2 w-full rounded-md border border-warm-border bg-white px-3 py-2 text-sm text-warm-text placeholder:text-warm-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
              style={{ minHeight: '96px' }}
              rows={4}
            />
          </div>
        </div>
      )}
    </div>
  )
}
