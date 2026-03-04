'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { HelpTooltip } from '@/components/ui/help-tooltip'

interface DebtPartiesStepProps {
  yourName: string
  yourAddress: string
  yourCity: string
  yourState: string
  yourZip: string
  plaintiffName: string
  plaintiffAttorneyName: string
  plaintiffAttorneyAddress: string
  plaintiffAttorneyCity: string
  plaintiffAttorneyState: string
  plaintiffAttorneyZip: string
  onFieldChange: (field: string, value: string) => void
}

export function DebtPartiesStep({
  yourName,
  yourAddress,
  yourCity,
  yourState,
  yourZip,
  plaintiffName,
  plaintiffAttorneyName,
  plaintiffAttorneyAddress,
  plaintiffAttorneyCity,
  plaintiffAttorneyState,
  plaintiffAttorneyZip,
  onFieldChange,
}: DebtPartiesStepProps) {
  return (
    <div className="space-y-8">
      {/* Explanation */}
      <div className="rounded-lg border border-calm-indigo/20 bg-calm-indigo/5 p-3 text-sm text-warm-text">
        You are the <strong>Defendant</strong> in this case. The company suing you is the{' '}
        <strong>Plaintiff</strong>.
      </div>

      {/* Section 1: Your Information */}
      <div className="space-y-4">
        <p className="text-xs font-semibold text-warm-muted uppercase tracking-wide">
          Your Information
        </p>

        <div>
          <Label htmlFor="your-name" className="text-sm font-medium text-warm-text">
            Your full legal name
          </Label>
          <HelpTooltip label="Why does this matter?">
            <p>
              Use your full legal name exactly as it appears on your driver&apos;s license or
              government ID. The court uses this name on all official documents.
            </p>
          </HelpTooltip>
          <Input
            id="your-name"
            value={yourName}
            onChange={(e) => onFieldChange('yourName', e.target.value)}
            placeholder="e.g. Maria Elena Garcia"
            className="mt-2"
          />
        </div>

        <div>
          <Label className="text-sm font-medium text-warm-text">
            Your mailing address
          </Label>
          <HelpTooltip label="Why does the court need my address?">
            <p>
              The court will send important documents to this address, including hearing
              notices and deadlines. Use the address where you actually receive mail.
            </p>
          </HelpTooltip>
          <div className="space-y-2 mt-2">
            <Input
              id="your-address"
              value={yourAddress}
              onChange={(e) => onFieldChange('yourAddress', e.target.value)}
              placeholder="Street address"
            />
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label htmlFor="your-city" className="text-xs text-warm-muted">
                  City
                </Label>
                <Input
                  id="your-city"
                  value={yourCity}
                  onChange={(e) => onFieldChange('yourCity', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="your-state" className="text-xs text-warm-muted">
                  State
                </Label>
                <Input
                  id="your-state"
                  value={yourState}
                  onChange={(e) => onFieldChange('yourState', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="your-zip" className="text-xs text-warm-muted">
                  Zip
                </Label>
                <Input
                  id="your-zip"
                  value={yourZip}
                  onChange={(e) => onFieldChange('yourZip', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Plaintiff */}
      <div className="space-y-4">
        <p className="text-xs font-semibold text-warm-muted uppercase tracking-wide">
          Plaintiff (Who is suing you)
        </p>

        <div>
          <Label htmlFor="plaintiff-name" className="text-sm font-medium text-warm-text">
            Plaintiff name
          </Label>
          <p className="text-xs text-warm-muted mt-0.5">
            Usually shown on the court papers
          </p>
          <Input
            id="plaintiff-name"
            value={plaintiffName}
            onChange={(e) => onFieldChange('plaintiffName', e.target.value)}
            placeholder="e.g. Midland Credit Management, LLC"
            className="mt-2"
          />
        </div>
      </div>

      {/* Section 3: Plaintiff's Attorney */}
      <div className="space-y-4">
        <p className="text-xs font-semibold text-warm-muted uppercase tracking-wide">
          Plaintiff&apos;s Attorney
        </p>

        <div className="rounded-lg border border-calm-indigo/20 bg-calm-indigo/5 p-3 text-xs text-warm-text">
          The attorney&apos;s information is on the court papers you received. This is
          needed for the certificate of service.
        </div>

        <div>
          <Label
            htmlFor="plaintiff-attorney-name"
            className="text-sm font-medium text-warm-text"
          >
            Attorney name
          </Label>
          <Input
            id="plaintiff-attorney-name"
            value={plaintiffAttorneyName}
            onChange={(e) => onFieldChange('plaintiffAttorneyName', e.target.value)}
            placeholder="e.g. John Smith"
            className="mt-2"
          />
        </div>

        <div>
          <Label className="text-sm font-medium text-warm-text">
            Attorney mailing address
          </Label>
          <div className="space-y-2 mt-2">
            <Input
              id="plaintiff-attorney-address"
              value={plaintiffAttorneyAddress}
              onChange={(e) =>
                onFieldChange('plaintiffAttorneyAddress', e.target.value)
              }
              placeholder="Street address"
            />
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label
                  htmlFor="plaintiff-attorney-city"
                  className="text-xs text-warm-muted"
                >
                  City
                </Label>
                <Input
                  id="plaintiff-attorney-city"
                  value={plaintiffAttorneyCity}
                  onChange={(e) =>
                    onFieldChange('plaintiffAttorneyCity', e.target.value)
                  }
                />
              </div>
              <div>
                <Label
                  htmlFor="plaintiff-attorney-state"
                  className="text-xs text-warm-muted"
                >
                  State
                </Label>
                <Input
                  id="plaintiff-attorney-state"
                  value={plaintiffAttorneyState}
                  onChange={(e) =>
                    onFieldChange('plaintiffAttorneyState', e.target.value)
                  }
                />
              </div>
              <div>
                <Label
                  htmlFor="plaintiff-attorney-zip"
                  className="text-xs text-warm-muted"
                >
                  Zip
                </Label>
                <Input
                  id="plaintiff-attorney-zip"
                  value={plaintiffAttorneyZip}
                  onChange={(e) =>
                    onFieldChange('plaintiffAttorneyZip', e.target.value)
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
