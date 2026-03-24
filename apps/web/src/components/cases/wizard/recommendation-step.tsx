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
import { ChevronRight, Scale, HelpCircle } from 'lucide-react'
import type { CourtRecommendation } from '@/lib/rules/court-recommendation'
import type { State } from '@/lib/schemas/case'
import { getStateConfig } from '@/lib/states'
import { CourtSelector } from '@/components/courts/court-selector'

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

const FL_COURT_LABELS: Record<string, string> = {
  fl_small_claims: 'Small Claims Court',
  fl_county: 'County Court',
  fl_circuit: 'Circuit Court',
  federal: 'Federal Court',
}

const PA_COURT_LABELS: Record<string, string> = {
  pa_magisterial: 'Magisterial District Court',
  pa_common_pleas: 'Court of Common Pleas',
  federal: 'Federal Court',
}

function getCourtLabels(selectedState: State): Record<string, string> {
  if (selectedState === 'PA') return PA_COURT_LABELS
  if (selectedState === 'FL') return FL_COURT_LABELS
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
  const [showCourtBrowser, setShowCourtBrowser] = useState(false)

  const courtLabels = getCourtLabels(selectedState)
  const config = getStateConfig(selectedState)
  const countyPlaceholder = selectedState === 'PA'
    ? 'e.g. Allegheny County'
    : selectedState === 'FL'
      ? 'e.g. Miami-Dade County'
      : selectedState === 'NY'
        ? 'e.g. Kings County'
        : selectedState === 'CA'
          ? 'e.g. Los Angeles County'
          : 'e.g. Travis County'

  const recommendedLabel = courtLabels[recommendation.recommended] ?? recommendation.recommended

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-warm-border bg-white p-4 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-warm-muted uppercase tracking-wide">
            Our recommendation
          </p>
          {recommendation.confidence === 'high' ? (
            <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">
              High confidence
            </span>
          ) : (
            <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded">
              Review suggested
            </span>
          )}
        </div>
        <p className="text-base font-semibold text-warm-text">
          {recommendedLabel}
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
          <div className="flex items-start gap-2 p-2 bg-blue-50 rounded text-xs text-blue-700 mt-2">
            <HelpCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>In New York, Supreme Court is the main trial court — not the highest court.</span>
          </div>
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

      {!showOverride && !showCourtBrowser ? (
        <div className="space-y-2">
          <Button
            type="button"
            className="w-full"
            onClick={() => onAccept(null)}
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Get Started'}
          </Button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowCourtBrowser(true)}
              className="flex-1 text-center text-xs text-warm-muted hover:text-warm-text transition-colors py-1 flex items-center justify-center gap-1"
            >
              <Scale className="h-3 w-3" />
              Browse Courts
            </button>
            <button
              type="button"
              onClick={() => setShowOverride(true)}
              className="flex-1 text-center text-xs text-warm-muted hover:text-warm-text transition-colors py-1 flex items-center justify-center gap-1"
            >
              Choose Different Court
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      ) : showCourtBrowser ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-warm-text">Browse all {selectedState} courts</p>
            <button
              type="button"
              onClick={() => setShowCourtBrowser(false)}
              className="text-xs text-calm-indigo hover:underline"
            >
              Back to recommendation
            </button>
          </div>
          <CourtSelector state={selectedState} compact={true} showHeader={false} />
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
