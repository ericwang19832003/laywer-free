import { useState } from 'react'
import { CITY_COUNTY_MAP } from '@/lib/courts/city-county-map'
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
import { ChevronRight, Scale, HelpCircle, X } from 'lucide-react'
import type { CourtRecommendation } from '@lawyer-free/shared/rules/court-recommendation'
import type { State } from '@lawyer-free/shared/schemas/case'
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
  ny_family_court: 'Family Court',
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
  caseName: string
  onCaseNameChange: (name: string) => void
  onAccept: (courtOverride: string | null) => void
  loading: boolean
}

export function RecommendationStep({
  recommendation,
  selectedState = 'TX',
  county,
  onCountyChange,
  caseName,
  onCaseNameChange,
  onAccept,
  loading,
}: RecommendationStepProps) {
  const [showOverride, setShowOverride] = useState(false)
  const [override, setOverride] = useState('')
  const [showCourtBrowser, setShowCourtBrowser] = useState(false)
  const [showCityLookup, setShowCityLookup] = useState(false)
  const [cityQuery, setCityQuery] = useState('')

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

  const cityResults = cityQuery.length >= 2
    ? Object.entries(CITY_COUNTY_MAP[selectedState] ?? {})
        .filter(([city]) => city.includes(cityQuery.toLowerCase()))
        .map(([city, county]) => ({
          city: city.replace(/(^|[\s-])(.)/g, (_, sep, ch) => sep + ch.toUpperCase()),
          county,
        }))
        .filter((result, idx, arr) => arr.findIndex(r => r.county === result.county) === idx)
        .slice(0, 5)
    : []

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="case-name">Name your case</Label>
        <div className="relative">
          <Input
            id="case-name"
            value={caseName}
            onChange={(e) => onCaseNameChange(e.target.value.slice(0, 80))}
            placeholder="e.g. Auto Accident — May 2026"
            className="pr-8"
            autoFocus
            onFocus={(e) => e.target.select()}
          />
          {caseName && (
            <button
              type="button"
              onClick={() => onCaseNameChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-warm-muted hover:text-warm-text transition-colors"
              aria-label="Clear name"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <p className="text-xs text-warm-muted">{80 - caseName.length} characters remaining</p>
      </div>
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
        <Label htmlFor="county">Which county will you file in? <span className="font-normal text-warm-muted">(optional)</span></Label>
        <p className="text-xs text-warm-muted -mt-1">
          Usually where the defendant lives or the incident occurred.
        </p>
        <Input
          id="county"
          value={county}
          onChange={(e) => {
            onCountyChange(e.target.value)
            setCityQuery('')
            setShowCityLookup(false)
          }}
          placeholder={countyPlaceholder}
        />
        {!showCityLookup ? (
          <button
            type="button"
            className="text-xs text-calm-indigo hover:underline"
            onClick={() => setShowCityLookup(true)}
          >
            Not sure? Find by city →
          </button>
        ) : (
          <div className="space-y-2 rounded-md border border-warm-border bg-warm-bg p-3">
            <p className="text-xs font-medium text-warm-text">Enter the city where the defendant lives or the incident occurred:</p>
            <Input
              autoFocus
              placeholder="e.g. Houston"
              value={cityQuery}
              onChange={(e) => setCityQuery(e.target.value)}
              className="text-sm"
            />
            {cityResults.length > 0 && (
              <ul className="space-y-1">
                {cityResults.map(({ city, county: c }) => (
                  <li key={city}>
                    <button
                      type="button"
                      className="w-full text-left text-xs px-2 py-1.5 rounded hover:bg-warm-border transition-colors"
                      onClick={() => {
                        onCountyChange(c)
                        setShowCityLookup(false)
                        setCityQuery('')
                      }}
                    >
                      <span className="font-medium">{city}</span>
                      <span className="text-warm-muted"> → {c} County</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {cityQuery.length >= 2 && cityResults.length === 0 && (
              <p className="text-xs text-warm-muted">No match found. Try a nearby city or enter the county manually above.</p>
            )}
            <button
              type="button"
              className="text-xs text-warm-muted hover:text-warm-text"
              onClick={() => { setShowCityLookup(false); setCityQuery('') }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {!showOverride && !showCourtBrowser ? (
        <div className="space-y-2">
          <Button
            type="button"
            className="w-full"
            onClick={() => onAccept(null)}
            disabled={loading || !caseName.trim()}
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
            disabled={loading || !override || !caseName.trim()}
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
