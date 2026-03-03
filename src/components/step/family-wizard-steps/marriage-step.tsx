'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { HelpTooltip } from '@/components/ui/help-tooltip'
import { AlertTriangle } from 'lucide-react'

interface MarriageStepProps {
  marriageDate: string
  separationDate: string
  marriageCounty: string
  marriageState: string
  countyMonths: number | ''
  stateMonths: number | ''
  onMarriageDateChange: (v: string) => void
  onSeparationDateChange: (v: string) => void
  onMarriageCountyChange: (v: string) => void
  onMarriageStateChange: (v: string) => void
  onCountyMonthsChange: (v: number | '') => void
  onStateMonthsChange: (v: number | '') => void
}

export function MarriageStep({
  marriageDate,
  separationDate,
  marriageCounty,
  marriageState,
  countyMonths,
  stateMonths,
  onMarriageDateChange,
  onSeparationDateChange,
  onMarriageCountyChange,
  onMarriageStateChange,
  onCountyMonthsChange,
  onStateMonthsChange,
}: MarriageStepProps) {
  const countyNum = typeof countyMonths === 'number' ? countyMonths : null
  const stateNum = typeof stateMonths === 'number' ? stateMonths : null

  const showResidencyWarning =
    (countyNum !== null && countyNum < 3) || (stateNum !== null && stateNum < 6)

  return (
    <div className="space-y-6">
      {/* Marriage date */}
      <div>
        <Label htmlFor="marriage-date" className="text-sm font-medium text-warm-text">
          When did you get married?
        </Label>
        <HelpTooltip label="Not sure of the exact date?">
          <p>
            Check your marriage certificate if you don&apos;t remember the exact date.
            You can request a copy from the county clerk where you were married.
          </p>
        </HelpTooltip>
        <Input
          id="marriage-date"
          type="date"
          value={marriageDate}
          onChange={(e) => onMarriageDateChange(e.target.value)}
          className="mt-2"
        />
      </div>

      {/* Separation date */}
      <div>
        <Label htmlFor="separation-date" className="text-sm font-medium text-warm-text">
          When did you separate?
        </Label>
        <p className="text-xs text-warm-muted mt-0.5">Optional</p>
        <HelpTooltip label="What counts as separation?">
          <p>
            Separation usually means when you and your spouse stopped living together
            as a married couple. This can be the date one of you moved out, or the date
            you decided the marriage was over, even if still under the same roof.
          </p>
        </HelpTooltip>
        <Input
          id="separation-date"
          type="date"
          value={separationDate}
          onChange={(e) => onSeparationDateChange(e.target.value)}
          className="mt-2"
        />
      </div>

      {/* Marriage county */}
      <div>
        <Label htmlFor="marriage-county" className="text-sm font-medium text-warm-text">
          What county did you get married in?
        </Label>
        <Input
          id="marriage-county"
          value={marriageCounty}
          onChange={(e) => onMarriageCountyChange(e.target.value)}
          placeholder="e.g. Harris"
          className="mt-2"
        />
      </div>

      {/* Marriage state */}
      <div>
        <Label htmlFor="marriage-state" className="text-sm font-medium text-warm-text">
          What state?
        </Label>
        <Input
          id="marriage-state"
          value={marriageState}
          onChange={(e) => onMarriageStateChange(e.target.value)}
          placeholder="e.g. Texas"
          className="mt-2"
        />
      </div>

      {/* Residency questions */}
      <div className="rounded-lg border border-warm-border p-4 space-y-4">
        <p className="text-sm font-medium text-warm-text">Residency Requirements</p>

        <div>
          <Label htmlFor="county-months" className="text-sm font-medium text-warm-text">
            How many months have you lived in your current county?
          </Label>
          <Input
            id="county-months"
            type="number"
            min={0}
            value={countyMonths === '' ? '' : countyMonths}
            onChange={(e) => {
              const val = e.target.value
              onCountyMonthsChange(val === '' ? '' : parseInt(val, 10))
            }}
            placeholder="e.g. 6"
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="state-months" className="text-sm font-medium text-warm-text">
            How many months have you lived in Texas?
          </Label>
          <Input
            id="state-months"
            type="number"
            min={0}
            value={stateMonths === '' ? '' : stateMonths}
            onChange={(e) => {
              const val = e.target.value
              onStateMonthsChange(val === '' ? '' : parseInt(val, 10))
            }}
            placeholder="e.g. 12"
            className="mt-2"
          />
        </div>
      </div>

      {/* Residency warning */}
      {showResidencyWarning && (
        <div className="rounded-lg border border-calm-amber/40 bg-calm-amber/5 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-calm-amber shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-warm-text">Residency Requirement Not Met</p>
              <p className="text-sm text-warm-muted mt-1">
                Texas requires at least 90 days in the county and 6 months in Texas to file
                for divorce here. If you haven&apos;t met these requirements yet, you may need
                to wait or file in a different county.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
