'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { HelpTooltip } from '@/components/ui/help-tooltip'

interface DebtVenueStepProps {
  county: string
  courtType: string
  causeNumber: string
  onFieldChange: (field: string, value: string) => void
}

function formatCourtType(courtType: string): string {
  switch (courtType) {
    case 'jp':
      return 'Justice Court'
    case 'county':
      return 'County Court'
    case 'district':
      return 'District Court'
    default:
      return courtType || 'Not specified'
  }
}

export function DebtVenueStep({
  county,
  courtType,
  causeNumber,
  onFieldChange,
}: DebtVenueStepProps) {
  return (
    <div className="space-y-6">
      {/* Venue explanation */}
      <div className="rounded-lg border border-calm-indigo/20 bg-calm-indigo/5 p-4">
        <p className="text-sm text-warm-text">
          <strong>Court information:</strong> This information is on the court papers
          (summons/citation) you received. It identifies which court your case is in and
          is needed for your answer.
        </p>
      </div>

      {/* County */}
      <div>
        <Label htmlFor="county" className="text-sm font-medium text-warm-text">
          County
        </Label>
        <HelpTooltip label="Where do I find this?">
          <p>
            The county is listed on the court papers, usually near the top. It identifies
            the county where the lawsuit was filed.
          </p>
        </HelpTooltip>
        <Input
          id="county"
          value={county}
          onChange={(e) => onFieldChange('county', e.target.value)}
          placeholder="e.g. Harris"
          className="mt-2"
        />
      </div>

      {/* Court type (read-only display) */}
      <div>
        <Label className="text-sm font-medium text-warm-text">Court type</Label>
        <div className="mt-2 rounded-md border border-warm-border bg-warm-bg/30 px-3 py-2 text-sm text-warm-text">
          {formatCourtType(courtType)}
        </div>
      </div>

      {/* Cause number */}
      <div>
        <Label htmlFor="cause-number" className="text-sm font-medium text-warm-text">
          Cause number
        </Label>
        <HelpTooltip label="Where do I find this?">
          <p>
            The cause number is the case identifier assigned by the court. It&apos;s
            usually on the top of the court papers. It may also be called the &quot;case
            number&quot; or &quot;docket number.&quot;
          </p>
        </HelpTooltip>
        <Input
          id="cause-number"
          value={causeNumber}
          onChange={(e) => onFieldChange('causeNumber', e.target.value)}
          placeholder="Enter the cause number from your court papers (if available)"
          className="mt-2"
        />
        <p className="text-xs text-warm-muted mt-1">
          Optional &mdash; but strongly recommended if you have it
        </p>
      </div>

      {/* Tip */}
      <div className="rounded-lg bg-calm-indigo/5 border border-calm-indigo/20 p-3 text-xs text-warm-text">
        <strong>Tip:</strong> All of this information should be on the court papers
        (citation or summons) you were served. Look near the top of the first page.
      </div>
    </div>
  )
}
