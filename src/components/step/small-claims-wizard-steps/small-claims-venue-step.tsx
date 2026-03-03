'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { HelpTooltip } from '@/components/ui/help-tooltip'

interface SmallClaimsVenueStepProps {
  defendantCounty: string
  incidentCounty: string
  precinct: string
  onFieldChange: (field: string, value: string) => void
}

export function SmallClaimsVenueStep({
  defendantCounty,
  incidentCounty,
  precinct,
  onFieldChange,
}: SmallClaimsVenueStepProps) {
  return (
    <div className="space-y-6">
      {/* Venue explanation */}
      <div className="rounded-lg border border-calm-indigo/20 bg-calm-indigo/5 p-4">
        <p className="text-sm text-warm-text">
          <strong>Where to file:</strong> Under Texas Rule of Civil Procedure 502.4, small claims
          cases are generally filed in the Justice of the Peace (JP) court in the precinct where
          the defendant lives or where the events giving rise to the claim occurred.
        </p>
      </div>

      {/* Defendant county (required) */}
      <div>
        <Label htmlFor="defendant-county" className="text-sm font-medium text-warm-text">
          What county does the defendant live or do business in?
        </Label>
        <HelpTooltip label="Why does this matter?">
          <p>
            The default venue for a small claims case is the county (and precinct) where the
            defendant resides. If the defendant is a business, this is the county where the
            business is located or has a registered agent.
          </p>
        </HelpTooltip>
        <Input
          id="defendant-county"
          value={defendantCounty}
          onChange={(e) => onFieldChange('defendantCounty', e.target.value)}
          placeholder="e.g. Harris"
          className="mt-2"
        />
      </div>

      {/* Incident county (optional) */}
      <div>
        <Label htmlFor="incident-county" className="text-sm font-medium text-warm-text">
          Where did the events occur? (optional)
        </Label>
        <HelpTooltip label="When can I file where the events happened?">
          <p>
            If the events giving rise to the claim occurred in a different county than where the
            defendant lives, you may be able to file in either county. For example, if a car
            accident happened in Travis County but the other driver lives in Williamson County,
            you may file in either.
          </p>
        </HelpTooltip>
        <Input
          id="incident-county"
          value={incidentCounty}
          onChange={(e) => onFieldChange('incidentCounty', e.target.value)}
          placeholder="e.g. Travis"
          className="mt-2"
        />
      </div>

      {/* JP Court precinct (optional) */}
      <div>
        <Label htmlFor="precinct" className="text-sm font-medium text-warm-text">
          JP Court precinct number (optional)
        </Label>
        <HelpTooltip label="How do I find the precinct?">
          <p>
            Each county is divided into precincts, and each precinct has its own JP court. You
            can find the correct precinct by searching your county&apos;s website or calling
            the county clerk&apos;s office. If you don&apos;t know it yet, you can leave this
            blank and look it up before filing.
          </p>
        </HelpTooltip>
        <Input
          id="precinct"
          value={precinct}
          onChange={(e) => onFieldChange('precinct', e.target.value)}
          placeholder="e.g. Precinct 3"
          className="mt-2"
        />
      </div>

      {/* Venue tip */}
      <div className="rounded-lg bg-calm-indigo/5 border border-calm-indigo/20 p-3 text-xs text-warm-text">
        <strong>Tip:</strong> If you are unsure about the correct venue, file in the precinct
        where the defendant lives. The court can transfer the case to the correct venue if needed.
      </div>
    </div>
  )
}
