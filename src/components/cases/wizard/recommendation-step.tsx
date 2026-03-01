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

const COURT_LABELS: Record<string, string> = {
  jp: 'JP Court (Small Claims)',
  county: 'County Court',
  district: 'District Court',
  federal: 'Federal Court',
}

interface RecommendationStepProps {
  recommendation: CourtRecommendation
  county: string
  onCountyChange: (county: string) => void
  onAccept: (courtOverride: string | null) => void
  loading: boolean
}

export function RecommendationStep({
  recommendation,
  county,
  onCountyChange,
  onAccept,
  loading,
}: RecommendationStepProps) {
  const [showOverride, setShowOverride] = useState(false)
  const [override, setOverride] = useState('')

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-warm-border bg-white p-4 space-y-2">
        <p className="text-xs font-medium text-warm-muted uppercase tracking-wide">
          Our recommendation
        </p>
        <p className="text-base font-semibold text-warm-text">
          {COURT_LABELS[recommendation.recommended]}
        </p>
        <p className="text-sm text-warm-text leading-relaxed">
          {recommendation.reasoning}
        </p>
        {recommendation.alternativeNote && (
          <p className="text-sm text-warm-muted italic">
            {recommendation.alternativeNote}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="county">Which county will you file in? (optional)</Label>
        <Input
          id="county"
          value={county}
          onChange={(e) => onCountyChange(e.target.value)}
          placeholder="e.g. Travis County"
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
              <SelectItem value="jp">JP Court (Small Claims)</SelectItem>
              <SelectItem value="county">County Court</SelectItem>
              <SelectItem value="district">District Court</SelectItem>
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
