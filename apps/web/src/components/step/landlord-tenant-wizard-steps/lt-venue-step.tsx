'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { HelpTooltip } from '@/components/ui/help-tooltip'

interface LtVenueStepProps {
  propertyCounty: string
  defendantCounty: string
  onFieldChange: (field: string, value: string) => void
}

export function LtVenueStep({
  propertyCounty,
  defendantCounty,
  onFieldChange,
}: LtVenueStepProps) {
  const hasPropertyCounty = propertyCounty.trim().length > 0

  return (
    <div className="space-y-6">
      {/* Venue explanation */}
      <div className="rounded-lg border border-calm-indigo/20 bg-calm-indigo/5 p-4">
        <p className="text-sm text-warm-text">
          <strong>Where to file:</strong> Under Tex. Civ. Prac. &amp; Rem. Code &sect; 15.0115,
          landlord-tenant cases must generally be filed in the justice court precinct where the
          rental property is located. This ensures the case is heard by the court with
          jurisdiction over the property.
        </p>
      </div>

      {/* Property county (primary for LT) */}
      <div>
        <Label htmlFor="property-county" className="text-sm font-medium text-warm-text">
          What county is the rental property in?
        </Label>
        <HelpTooltip label="Why does this matter?">
          <p>
            For landlord-tenant cases, the primary venue is the county (and precinct) where
            the rental property is located. This is different from general small claims cases,
            where venue is based on where the defendant lives.
          </p>
        </HelpTooltip>
        <Input
          id="property-county"
          value={propertyCounty}
          onChange={(e) => onFieldChange('propertyCounty', e.target.value)}
          placeholder="e.g. Harris"
          className="mt-2"
        />
      </div>

      {hasPropertyCounty && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="text-sm font-medium text-warm-text">
            Primary venue: {propertyCounty} County
          </p>
          <p className="text-xs text-warm-muted mt-1">
            Your case should be filed in the justice court precinct where the property is located
            within {propertyCounty} County.
          </p>
        </div>
      )}

      {/* Defendant county (alternative) */}
      <div>
        <Label htmlFor="defendant-county" className="text-sm font-medium text-warm-text">
          What county does the other party live or do business in? (optional)
        </Label>
        <HelpTooltip label="When might this be relevant?">
          <p>
            In some cases, if the other party has moved out of the county where the property
            is located, you may need to serve them at their current address. Knowing their
            county can help with service of process.
          </p>
        </HelpTooltip>
        {hasPropertyCounty && (
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onFieldChange('defendantCounty', propertyCounty)}
              className="rounded-full bg-white px-2.5 py-0.5 text-xs text-warm-text border border-warm-border transition hover:border-calm-indigo/40 hover:bg-calm-indigo/10"
            >
              Same as property county
            </button>
            <button
              type="button"
              onClick={() => onFieldChange('defendantCounty', '')}
              className="rounded-full bg-white px-2.5 py-0.5 text-xs text-warm-text border border-warm-border transition hover:border-calm-indigo/40 hover:bg-calm-indigo/10"
            >
              Leave blank
            </button>
          </div>
        )}
        <Input
          id="defendant-county"
          value={defendantCounty}
          onChange={(e) => onFieldChange('defendantCounty', e.target.value)}
          placeholder="e.g. Travis"
          className="mt-2"
        />
      </div>

      {/* Venue tip */}
      <div className="rounded-lg bg-calm-indigo/5 border border-calm-indigo/20 p-3 text-xs text-warm-text">
        <strong>Tip:</strong> For eviction cases, venue is always in the precinct where the
        property is located. For other landlord-tenant disputes (like security deposit claims),
        you may also be able to file where the defendant resides.
      </div>
    </div>
  )
}
