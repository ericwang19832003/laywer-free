'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { HelpTooltip } from '@/components/ui/help-tooltip'
import { useState } from 'react'

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
  const hasDefendantCounty = defendantCounty.trim().length > 0
  const hasIncidentCounty = incidentCounty.trim().length > 0
  const showDualVenue =
    hasDefendantCounty &&
    hasIncidentCounty &&
    defendantCounty.trim().toLowerCase() !== incidentCounty.trim().toLowerCase()
  const [precinctUnknown, setPrecinctUnknown] = useState(false)

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

      {hasDefendantCounty && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="text-sm font-medium text-warm-text">
            Recommended: {defendantCounty} County
          </p>
          <p className="text-xs text-warm-muted mt-1">
            Does this look right? You can edit the county above.
          </p>
        </div>
      )}

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
        {hasDefendantCounty && (
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onFieldChange('incidentCounty', defendantCounty)}
              className="rounded-full bg-white px-2.5 py-0.5 text-xs text-warm-text border border-warm-border transition hover:border-calm-indigo/40 hover:bg-calm-indigo/10"
            >
              Use defendant county
            </button>
            <button
              type="button"
              onClick={() => onFieldChange('incidentCounty', '')}
              className="rounded-full bg-white px-2.5 py-0.5 text-xs text-warm-text border border-warm-border transition hover:border-calm-indigo/40 hover:bg-calm-indigo/10"
            >
              Leave blank
            </button>
          </div>
        )}
        <Input
          id="incident-county"
          value={incidentCounty}
          onChange={(e) => onFieldChange('incidentCounty', e.target.value)}
          placeholder="e.g. Travis"
          className="mt-2"
        />
      </div>

      {showDualVenue && (
        <div className="rounded-lg border border-calm-indigo/20 bg-calm-indigo/5 p-4">
          <p className="text-sm font-semibold text-warm-text">Possible venues</p>
          <p className="text-xs text-warm-muted mt-1">
            Because the defendant&apos;s county and incident county differ, you can typically file
            in either.
          </p>
          <ul className="mt-2 space-y-1 text-sm text-warm-text">
            <li>{defendantCounty} County (defendant)</li>
            <li>{incidentCounty} County (incident)</li>
          </ul>
        </div>
      )}

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
        <label className="mt-2 flex items-start gap-3 cursor-pointer rounded-lg border border-warm-border p-3 transition-colors hover:bg-warm-bg/50">
          <input
            type="checkbox"
            checked={precinctUnknown}
            onChange={(e) => {
              setPrecinctUnknown(e.target.checked)
              if (e.target.checked) onFieldChange('precinct', '')
            }}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-warm-border text-calm-indigo focus:ring-calm-indigo"
          />
          <span className="text-sm text-warm-text">I don&apos;t know the precinct yet</span>
        </label>
        {!precinctUnknown && (
          <Input
            id="precinct"
            value={precinct}
            onChange={(e) => onFieldChange('precinct', e.target.value)}
            placeholder="e.g. Precinct 3"
            className="mt-2"
          />
        )}
        {precinctUnknown && (
          <p className="text-xs text-warm-muted mt-2">
            That&apos;s okay. We&apos;ll remind you to look it up before filing.
          </p>
        )}
      </div>

      {/* Venue tip */}
      <div className="rounded-lg bg-calm-indigo/5 border border-calm-indigo/20 p-3 text-xs text-warm-text">
        <strong>Tip:</strong> If you are unsure about the correct venue, file in the precinct
        where the defendant lives. The court can transfer the case to the correct venue if needed.
      </div>
    </div>
  )
}
