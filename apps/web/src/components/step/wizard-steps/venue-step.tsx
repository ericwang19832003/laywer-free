'use client'

import { useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { HelpTooltip } from '@/components/ui/help-tooltip'
import { recommendVenue, validateJurisdiction } from '@lawyer-free/shared/rules/venue-helper'
import { MapPin, AlertTriangle, CheckCircle2 } from 'lucide-react'

interface VenueStepProps {
  courtType: string
  county: string | null
  disputeType: string | null
  defendantCounty: string
  onDefendantCountyChange: (v: string) => void
  incidentCounty: string
  onIncidentCountyChange: (v: string) => void
  propertyCounty: string
  onPropertyCountyChange: (v: string) => void
  contractCounty: string
  onContractCountyChange: (v: string) => void
}

function courtTypeLabel(courtType: string): string {
  switch (courtType) {
    case 'jp': return 'Justice of the Peace (JP) Court'
    case 'JP': return 'Justice of the Peace (JP) Court'
    case 'county': return 'County Court'
    case 'County': return 'County Court'
    case 'district': return 'District Court'
    case 'District': return 'District Court'
    case 'federal': return 'Federal Court'
    case 'Federal': return 'Federal Court'
    default: return courtType
  }
}

export function VenueStep({
  courtType,
  county,
  disputeType,
  defendantCounty,
  onDefendantCountyChange,
  incidentCounty,
  onIncidentCountyChange,
  propertyCounty,
  onPropertyCountyChange,
  contractCounty,
  onContractCountyChange,
}: VenueStepProps) {
  const venue = useMemo(
    () =>
      recommendVenue({
        disputeType: disputeType ?? 'other',
        defendantCounty: defendantCounty.trim() || null,
        incidentCounty: incidentCounty.trim() || null,
        propertyCounty: propertyCounty.trim() || null,
        contractCounty: contractCounty.trim() || null,
      }),
    [disputeType, defendantCounty, incidentCounty, propertyCounty, contractCounty]
  )

  const jurisdiction = useMemo(
    () => validateJurisdiction({ courtType, amountSought: 0 }),
    [courtType]
  )

  const hasAnyCountyInput = defendantCounty.trim() || incidentCounty.trim() || propertyCounty.trim() || contractCounty.trim()

  return (
    <div className="space-y-6">
      {/* Current court info */}
      <div className="rounded-lg border border-calm-indigo/20 bg-calm-indigo/5 p-4">
        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 text-calm-indigo shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-warm-text">Your current court type</p>
            <p className="text-sm text-warm-muted mt-0.5">
              {courtTypeLabel(courtType)}
              {county ? ` in ${county} County` : ''}
            </p>
            <HelpTooltip label="Can I change this?">
              <p>
                Your court type was selected during intake based on your claim. If this
                doesn&apos;t look right, you can go back to your case dashboard and start over.
              </p>
            </HelpTooltip>
          </div>
        </div>
      </div>

      {/* Defendant county — always shown */}
      <div>
        <Label htmlFor="defendant-county" className="text-sm font-medium text-warm-text">
          What county does the person you&apos;re suing live in?
        </Label>
        <HelpTooltip label="How do I find this out?">
          <p>
            If the defendant is an individual, this is the county where they live. If the
            defendant is a business, use the county where their main office is located.
            You can look up Texas counties at the Secretary of State website.
          </p>
        </HelpTooltip>
        <Input
          id="defendant-county"
          value={defendantCounty}
          onChange={(e) => onDefendantCountyChange(e.target.value)}
          placeholder="e.g. Harris"
          className="mt-2"
        />
      </div>

      {/* Conditional county questions based on dispute type */}
      {disputeType === 'personal_injury' && (
        <div>
          <Label htmlFor="incident-county" className="text-sm font-medium text-warm-text">
            What county did this happen in?
          </Label>
          <HelpTooltip label="Why does this matter?">
            <p>
              For personal injury cases, Texas law often lets you file in the county where
              the incident occurred. This can be more convenient if it&apos;s closer to you.
            </p>
          </HelpTooltip>
          <Input
            id="incident-county"
            value={incidentCounty}
            onChange={(e) => onIncidentCountyChange(e.target.value)}
            placeholder="e.g. Travis"
            className="mt-2"
          />
        </div>
      )}

      {(disputeType === 'property' || disputeType === 'landlord_tenant') && (
        <div>
          <Label htmlFor="property-county" className="text-sm font-medium text-warm-text">
            What county is the property in?
          </Label>
          <HelpTooltip label="Why does this matter?">
            <p>
              For property and landlord-tenant disputes, Texas law requires you to file in the
              county where the property is located.
            </p>
          </HelpTooltip>
          <Input
            id="property-county"
            value={propertyCounty}
            onChange={(e) => onPropertyCountyChange(e.target.value)}
            placeholder="e.g. Dallas"
            className="mt-2"
          />
        </div>
      )}

      {disputeType === 'contract' && (
        <div>
          <Label htmlFor="contract-county" className="text-sm font-medium text-warm-text">
            What county was the contract supposed to be performed in?
          </Label>
          <HelpTooltip label="What does this mean?">
            <p>
              This is the county where the work, delivery, or payment under the contract
              was supposed to happen. If the contract says where disputes should be handled,
              use that county.
            </p>
          </HelpTooltip>
          <Input
            id="contract-county"
            value={contractCounty}
            onChange={(e) => onContractCountyChange(e.target.value)}
            placeholder="e.g. Bexar"
            className="mt-2"
          />
        </div>
      )}

      {/* Venue recommendation */}
      {hasAnyCountyInput && venue.recommended_county && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-warm-text">
                Recommended: {venue.recommended_county} County
              </p>
              <p className="text-sm text-warm-muted">{venue.explanation}</p>
              {venue.alternativeNote && (
                <p className="text-xs text-warm-muted italic">{venue.alternativeNote}</p>
              )}
              <p className="text-xs text-warm-muted mt-2">
                Source: {venue.rule_citation}
              </p>
            </div>
          </div>
        </div>
      )}

      {hasAnyCountyInput && !venue.recommended_county && (
        <div className="rounded-lg border border-calm-amber/40 bg-calm-amber/5 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-calm-amber shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-warm-text">{venue.explanation}</p>
            </div>
          </div>
        </div>
      )}

      {/* Jurisdiction warning */}
      {!jurisdiction.valid && jurisdiction.warning && (
        <div className="rounded-lg border border-calm-amber/40 bg-calm-amber/5 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-calm-amber shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-warm-text">{jurisdiction.warning}</p>
              {jurisdiction.suggestion && (
                <p className="text-sm text-warm-muted mt-1">{jurisdiction.suggestion}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
