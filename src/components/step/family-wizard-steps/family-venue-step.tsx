'use client'

import { useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { HelpTooltip } from '@/components/ui/help-tooltip'
import { recommendVenue } from '@/lib/rules/venue-helper'
import { CheckCircle2 } from 'lucide-react'

interface FamilyVenueStepProps {
  familySubType: string
  county: string | null
  petitionerCounty: string
  childrenCounty: string
  onPetitionerCountyChange: (v: string) => void
  onChildrenCountyChange: (v: string) => void
}

function getVenueQuestion(familySubType: string): {
  label: string
  helpText: string
  field: 'petitioner' | 'children'
} {
  switch (familySubType) {
    case 'divorce':
      return {
        label: 'What county have you been living in?',
        helpText:
          'For divorce, you must have lived in this county for at least 90 days and in Texas for at least 6 months. File in the county where you currently reside.',
        field: 'petitioner',
      }
    case 'custody':
    case 'child_support':
    case 'visitation':
      return {
        label: 'What county have the children been living in for the past 6 months?',
        helpText:
          'For custody and support cases (SAPCR), Texas law requires you to file in the county where the children have lived for the past 6 months. This is called the "home state" or "home county" of the child.',
        field: 'children',
      }
    case 'protective_order':
      return {
        label: 'What county do you live in?',
        helpText:
          'For protective orders, you can file in the county where you live, where the respondent lives, or where the violence occurred.',
        field: 'petitioner',
      }
    case 'modification':
      return {
        label: 'What county issued the original order?',
        helpText:
          'Modifications are generally filed in the court that issued the original order (continuing jurisdiction). If the child has moved, venue may transfer to the child\'s new county.',
        field: 'petitioner',
      }
    default:
      return {
        label: 'What county do you live in?',
        helpText: 'File in the county most connected to your case.',
        field: 'petitioner',
      }
  }
}

export function FamilyVenueStep({
  familySubType,
  county,
  petitionerCounty,
  childrenCounty,
  onPetitionerCountyChange,
  onChildrenCountyChange,
}: FamilyVenueStepProps) {
  const question = getVenueQuestion(familySubType)

  const venue = useMemo(
    () =>
      recommendVenue({
        disputeType: 'family',
        defendantCounty: petitionerCounty.trim() || null,
        incidentCounty: childrenCounty.trim() || null,
        propertyCounty: null,
        contractCounty: null,
      }),
    [petitionerCounty, childrenCounty]
  )

  const showChildrenCounty = ['custody', 'child_support', 'visitation'].includes(familySubType)
  const hasInput = petitionerCounty.trim() || childrenCounty.trim()

  return (
    <div className="space-y-6">
      {/* Current county display */}
      {county && (
        <div className="rounded-lg border border-calm-indigo/20 bg-calm-indigo/5 p-4">
          <p className="text-sm text-warm-muted">
            Current county on file: <span className="font-medium text-warm-text">{county}</span>
          </p>
        </div>
      )}

      {/* Primary venue question */}
      <div>
        <Label htmlFor="venue-primary" className="text-sm font-medium text-warm-text">
          {question.label}
        </Label>
        <HelpTooltip label="Why does this matter?">
          <p>{question.helpText}</p>
        </HelpTooltip>
        <Input
          id="venue-primary"
          value={question.field === 'children' ? childrenCounty : petitionerCounty}
          onChange={(e) =>
            question.field === 'children'
              ? onChildrenCountyChange(e.target.value)
              : onPetitionerCountyChange(e.target.value)
          }
          placeholder="e.g. Harris"
          className="mt-2"
        />
      </div>

      {/* Secondary county for cases with children (if primary question was about children) */}
      {showChildrenCounty && (
        <div>
          <Label htmlFor="venue-petitioner" className="text-sm font-medium text-warm-text">
            What county do you currently live in?
          </Label>
          <Input
            id="venue-petitioner"
            value={petitionerCounty}
            onChange={(e) => onPetitionerCountyChange(e.target.value)}
            placeholder="e.g. Travis"
            className="mt-2"
          />
        </div>
      )}

      {/* Venue recommendation */}
      {hasInput && venue.recommended_county && (
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
    </div>
  )
}
