'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FilingMethodStep } from '@/components/step/filing-method-step'
import { FILING_CONFIGS } from '@/lib/filing-configs'

function suggestCourtType(totalDamages: number): string {
  if (totalDamages <= 20000) return 'jp'
  if (totalDamages <= 200000) return 'county'
  return 'district'
}

function courtTypeLabel(ct: string): string {
  switch (ct) {
    case 'jp': return 'Justice of the Peace (under $20K)'
    case 'county': return 'County Court ($20K\u2013$200K)'
    case 'district': return 'District Court (over $200K)'
    default: return ct
  }
}

export { courtTypeLabel }

function fmt$(n: number): string {
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

interface FilingStepProps {
  yourName: string
  onYourNameChange: (v: string) => void
  yourAddress: string
  onYourAddressChange: (v: string) => void
  yourCity: string
  onYourCityChange: (v: string) => void
  yourState: string
  onYourStateChange: (v: string) => void
  yourZip: string
  onYourZipChange: (v: string) => void
  county: string
  onCountyChange: (v: string) => void
  courtType: string
  onCourtTypeChange: (v: string) => void
  causeNumber: string
  onCauseNumberChange: (v: string) => void
  filingMethod: 'online' | 'in_person' | ''
  onFilingMethodChange: (v: 'online' | 'in_person') => void
  grandTotal: number
  state?: string
}

export function FilingStep({
  yourName, onYourNameChange,
  yourAddress, onYourAddressChange,
  yourCity, onYourCityChange,
  yourState, onYourStateChange,
  yourZip, onYourZipChange,
  county, onCountyChange,
  courtType, onCourtTypeChange,
  causeNumber, onCauseNumberChange,
  filingMethod, onFilingMethodChange,
  grandTotal, state,
}: FilingStepProps) {
  const suggested = suggestCourtType(grandTotal)

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-warm-text">Your Information</h3>

        <div className="space-y-2">
          <Label htmlFor="venue-your-name">Your Full Legal Name</Label>
          <Input
            id="venue-your-name"
            placeholder="As it would appear on court documents"
            value={yourName}
            onChange={(e) => onYourNameChange(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 space-y-1">
            <Label htmlFor="venue-address" className="text-xs">Address</Label>
            <Input id="venue-address" placeholder="Street address" value={yourAddress} onChange={(e) => onYourAddressChange(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="venue-city" className="text-xs">City</Label>
            <Input id="venue-city" value={yourCity} onChange={(e) => onYourCityChange(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="venue-state" className="text-xs">State</Label>
            <Input id="venue-state" value={yourState} onChange={(e) => onYourStateChange(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="venue-zip" className="text-xs">ZIP</Label>
            <Input id="venue-zip" value={yourZip} onChange={(e) => onYourZipChange(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-warm-text">Court Information</h3>

        <div className="space-y-2">
          <Label htmlFor="county">County</Label>
          <Input id="county" placeholder="e.g. Travis" value={county} onChange={(e) => onCountyChange(e.target.value)} />
          <p className="text-xs text-warm-muted">
            You typically file where the defendant resides, where the contract was performed, or where the contract was signed.
          </p>
        </div>

        <div className="space-y-2">
          <Label>Court Type</Label>
          <div className="flex flex-col gap-2">
            {(['jp', 'county', 'district'] as const).map((ct) => (
              <Button
                key={ct}
                type="button"
                variant={courtType === ct ? 'default' : 'outline'}
                size="sm"
                onClick={() => onCourtTypeChange(ct)}
                className="justify-start text-left"
              >
                {courtTypeLabel(ct)}
                {ct === suggested && courtType !== ct && (
                  <span className="ml-2 text-xs opacity-60">(suggested)</span>
                )}
              </Button>
            ))}
          </div>
          {grandTotal > 0 && (
            <p className="text-xs text-warm-muted">
              Based on your total of {fmt$(grandTotal)}, we suggest {courtTypeLabel(suggested).toLowerCase()}.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="cause-number">Cause Number (optional)</Label>
          <Input id="cause-number" placeholder="Leave blank if not yet assigned" value={causeNumber} onChange={(e) => onCauseNumberChange(e.target.value)} />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-warm-text">Filing Method</h3>
        <FilingMethodStep
          filingMethod={filingMethod}
          onFilingMethodChange={onFilingMethodChange}
          county={county}
          courtType={courtType}
          config={FILING_CONFIGS.contract}
          state={state}
        />
      </div>
    </div>
  )
}
