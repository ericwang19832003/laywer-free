import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { CourtRecommendation } from '@/lib/rules/court-recommendation'
import type { State } from '@/lib/schemas/case'
import { getStateConfig } from '@/lib/states'

const TX_COURT_LABELS: Record<string, string> = {
  jp: 'JP Court (Small Claims)',
  county: 'County Court',
  district: 'District Court',
  federal: 'Federal Court',
}

const CA_COURT_LABELS: Record<string, string> = {
  small_claims: 'Small Claims Court',
  limited_civil: 'Limited Civil Court',
  unlimited_civil: 'Unlimited Civil Court',
  federal: 'Federal Court',
}

const NY_COURT_LABELS: Record<string, string> = {
  ny_small_claims: 'Small Claims Court',
  ny_civil: 'Civil Court',
  ny_supreme: 'Supreme Court',
  federal: 'Federal Court',
}

function getCourtLabels(selectedState: State): Record<string, string> {
  if (selectedState === 'NY') return NY_COURT_LABELS
  return selectedState === 'CA' ? CA_COURT_LABELS : TX_COURT_LABELS
}

interface RecommendationStepProps {
  recommendation: CourtRecommendation
  selectedState?: State
  county: string
  onCountyChange: (county: string) => void
  onAccept: (courtOverride: string | null) => void
  loading: boolean
}

export function RecommendationStep({
  recommendation,
  selectedState = 'TX',
  county,
  onCountyChange,
  onAccept,
  loading,
}: RecommendationStepProps) {
  const [showOverride, setShowOverride] = useState(false)
  const [override, setOverride] = useState('')

  const courtLabels = getCourtLabels(selectedState)
  const config = getStateConfig(selectedState)
  const countyPlaceholder = selectedState === 'NY'
    ? 'e.g. Kings County'
    : selectedState === 'CA'
      ? 'e.g. Los Angeles County'
      : 'e.g. Travis County'

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-warm-border bg-white p-4 space-y-2">
        <p className="text-xs font-medium text-warm-muted uppercase tracking-wide">
          Our recommendation
        </p>
        <p className="text-base font-semibold text-warm-text">
          {courtLabels[recommendation.recommended] ?? recommendation.recommended}
        </p>
        <p className="text-sm text-warm-text leading-relaxed">
          {recommendation.reasoning}
        </p>
        {recommendation.alternativeNote && (
          <p className="text-sm text-warm-muted italic">
            {recommendation.alternativeNote}
          </p>
        )}
        {selectedState === 'NY' && recommendation.recommended === 'ny_supreme' && (
          <p className="text-xs text-warm-muted mt-1">
            In New York, Supreme Court is the main trial court — not the highest court.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="county">Which county will you file in? (optional)</Label>
        <Input
          id="county"
          value={county}
          onChange={(e) => onCountyChange(e.target.value)}
          placeholder={countyPlaceholder}
        />
      </div>

      {!showOverride ? (
        <div className="space-y-2">
          <Button
            type="button"
            className="w-full"
            onClick={() => onAccept(null)}
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Accept & Get Started'}
          </Button>
          <button
            type="button"
            onClick={() => setShowOverride(true)}
            className="w-full text-center text-xs text-warm-muted hover:text-warm-text transition-colors py-1"
          >
            Choose a different court
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <Label htmlFor="court-override">Select your preferred court</Label>
          <Select value={override} onValueChange={setOverride}>
            <SelectTrigger className="w-full" id="court-override">
              <SelectValue placeholder="Select a court" />
            </SelectTrigger>
            <SelectContent>
              {config.courtTypes.map((ct) => (
                <SelectItem key={ct.value} value={ct.value}>
                  {ct.label}
                </SelectItem>
              ))}
              <SelectItem value="federal">Federal Court</SelectItem>
            </SelectContent>
          </Select>
          <Button
            type="button"
            className="w-full"
            onClick={() => onAccept(override || null)}
            disabled={loading || !override}
          >
            {loading ? 'Creating...' : 'Get Started'}
          </Button>
          <button
            type="button"
            onClick={() => setShowOverride(false)}
            className="w-full text-center text-xs text-warm-muted hover:text-warm-text transition-colors py-1"
          >
            Use recommended court
          </button>
        </div>
      )}
    </div>
  )
}
