'use client'

import { Globe, Building2, ExternalLink, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { type FilingConfig, getEFileTexasUrl, getFeeRange } from '@/lib/filing-configs'

interface FilingMethodStepProps {
  filingMethod: 'online' | 'in_person' | ''
  onFilingMethodChange: (method: 'online' | 'in_person') => void
  county: string
  courtType: string
  config: FilingConfig
}

function CourtLabel({ courtType }: { courtType: string }) {
  switch (courtType) {
    case 'jp': return <>Justice of the Peace</>
    case 'county': return <>County Court</>
    case 'district': return <>District Court</>
    case 'federal': return <>Federal District Court</>
    default: return <>{courtType}</>
  }
}

export function FilingMethodStep({
  filingMethod,
  onFilingMethodChange,
  county,
  courtType,
  config,
}: FilingMethodStepProps) {
  const feeRange = getFeeRange(courtType)
  const eFileUrl = getEFileTexasUrl(config)
  const isJP = courtType === 'jp'

  return (
    <div className="space-y-6">
      <p className="text-sm text-warm-muted">
        Your {config.documentLabel} will be ready after completing this wizard. Choose how you want to file it with the court.
      </p>

      {/* Filing Method Cards */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onFilingMethodChange('online')}
          className={cn(
            'flex flex-col items-center gap-2 rounded-xl border-2 p-5 transition-all',
            filingMethod === 'online'
              ? 'border-calm-indigo bg-calm-indigo/5 ring-1 ring-calm-indigo/20'
              : 'border-warm-border hover:border-calm-indigo/40'
          )}
        >
          <Globe className="h-7 w-7 text-calm-indigo" />
          <span className="font-semibold text-warm-text text-sm">File Online</span>
          <span className="text-xs text-warm-muted text-center">(e-filing)</span>
        </button>

        <button
          type="button"
          onClick={() => onFilingMethodChange('in_person')}
          className={cn(
            'flex flex-col items-center gap-2 rounded-xl border-2 p-5 transition-all',
            filingMethod === 'in_person'
              ? 'border-calm-indigo bg-calm-indigo/5 ring-1 ring-calm-indigo/20'
              : 'border-warm-border hover:border-calm-indigo/40'
          )}
        >
          <Building2 className="h-7 w-7 text-calm-indigo" />
          <span className="font-semibold text-warm-text text-sm">File In Person</span>
          <span className="text-xs text-warm-muted text-center">at courthouse</span>
        </button>
      </div>

      {/* JP Court Caveat */}
      {isJP && filingMethod === 'online' && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <Info className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-800">
            Some Justice of the Peace courts don&apos;t accept e-filing yet. Check with your local court before filing online.
          </p>
        </div>
      )}

      {/* Online Filing Guidance */}
      {filingMethod === 'online' && (
        <div className="space-y-4 rounded-lg border border-warm-border bg-warm-bg/50 p-4">
          <h4 className="font-semibold text-warm-text text-sm">Step-by-step e-filing guide</h4>
          <ol className="space-y-3 text-sm text-warm-muted">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-calm-indigo/10 text-xs font-semibold text-calm-indigo">1</span>
              <span>Go to <strong>eFileTexas.gov</strong> and create a free account</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-calm-indigo/10 text-xs font-semibold text-calm-indigo">2</span>
              <span>Select your court: <strong>{county || 'your county'}</strong> — <strong><CourtLabel courtType={courtType} /></strong></span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-calm-indigo/10 text-xs font-semibold text-calm-indigo">3</span>
              <span>Select case category &quot;<strong>{config.caseCategory}</strong>&quot;</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-calm-indigo/10 text-xs font-semibold text-calm-indigo">4</span>
              <span>Upload your {config.documentLabel} PDF (download it from your case dashboard after completing this wizard)</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-calm-indigo/10 text-xs font-semibold text-calm-indigo">5</span>
              <span>Pay filing fee online (<strong>{feeRange}</strong>)</span>
            </li>
          </ol>

          <div className="pt-2">
            <Button variant="outline" size="sm" asChild className="w-full">
              <a href={eFileUrl} target="_blank" rel="noopener noreferrer">
                Open eFileTexas
                <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
              </a>
            </Button>
          </div>
        </div>
      )}

      {/* In-Person Filing Guidance */}
      {filingMethod === 'in_person' && (
        <div className="space-y-4 rounded-lg border border-warm-border bg-warm-bg/50 p-4">
          <h4 className="font-semibold text-warm-text text-sm">What to bring to the courthouse</h4>
          <ol className="space-y-3 text-sm text-warm-muted">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-calm-indigo/10 text-xs font-semibold text-calm-indigo">1</span>
              <span>Print your {config.documentLabel} — bring the <strong>original plus 2 copies</strong></span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-calm-indigo/10 text-xs font-semibold text-calm-indigo">2</span>
              <span>Bring a <strong>valid photo ID</strong></span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-calm-indigo/10 text-xs font-semibold text-calm-indigo">3</span>
              <span>Bring filing fee payment (<strong>{feeRange}</strong>) — cash, check, or money order</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-calm-indigo/10 text-xs font-semibold text-calm-indigo">4</span>
              <span>Go to <strong>{county || 'your county'} County Courthouse</strong> clerk&apos;s office</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-calm-indigo/10 text-xs font-semibold text-calm-indigo">5</span>
              <span>File at the clerk&apos;s window — they&apos;ll stamp your copies and assign a cause number</span>
            </li>
          </ol>

          {county && (
            <div className="pt-2">
              <Button variant="outline" size="sm" asChild className="w-full">
                <a
                  href={`https://www.google.com/maps/search/${encodeURIComponent(`${county} County Courthouse Texas`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Find Courthouse
                  <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
                </a>
              </Button>
            </div>
          )}

          <p className="text-xs text-warm-muted">
            Tip: Check courthouse hours before going. Most courts close at 4:30 PM and may require appointments.
          </p>
        </div>
      )}
    </div>
  )
}
