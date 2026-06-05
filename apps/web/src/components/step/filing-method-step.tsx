'use client'

import { AlertTriangle, Building2, CheckCircle2, ExternalLink, FileCheck2, Globe, Info, ListChecks, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  type FilingConfig,
  getEFilingSystem,
  getEFilingUrl,
  getStateFeeRange,
  getStateName,
  getCourtLabel,
} from '@/lib/filing-configs'

interface FilingMethodStepProps {
  filingMethod: 'online' | 'in_person' | 'mail' | ''
  onFilingMethodChange: (method: 'online' | 'in_person' | 'mail') => void
  county: string
  courtType: string
  config: FilingConfig
  state?: string
}

export function FilingMethodStep({
  filingMethod,
  onFilingMethodChange,
  county,
  courtType,
  config,
  state = 'TX',
}: FilingMethodStepProps) {
  const feeRange = getStateFeeRange(state, courtType)
  const eFilingSystem = getEFilingSystem(state)
  const eFileUrl = getEFilingUrl(state, config)
  const stateName = getStateName(state)
  const courtLabel = getCourtLabel(state, courtType)
  const hasEFiling = !!eFilingSystem
  const isTexas = state === 'TX'
  const recommendedProvider = isTexas ? 'State Provided EFSP / eFile.TXCourts.gov' : eFilingSystem?.name
  const providerComparisonUrl = isTexas ? 'https://www.efiletexas.gov/service-providers.htm' : eFileUrl
  const filingPortalLabel = isTexas ? 'eFileTexas' : eFilingSystem?.name

  return (
    <div className="space-y-6">
      <p className="text-sm text-warm-muted">
        Your {config.documentLabel} will be ready after completing this wizard. Choose how you want to file it with the court.
      </p>

      {/* Filing Method Cards */}
      <div className={cn('grid gap-3', hasEFiling ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2')}>
        {hasEFiling && (
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
        )}

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

        <button
          type="button"
          onClick={() => onFilingMethodChange('mail')}
          className={cn(
            'flex flex-col items-center gap-2 rounded-xl border-2 p-5 transition-all',
            filingMethod === 'mail'
              ? 'border-calm-indigo bg-calm-indigo/5 ring-1 ring-calm-indigo/20'
              : 'border-warm-border hover:border-calm-indigo/40'
          )}
        >
          <Mail className="h-7 w-7 text-calm-indigo" />
          <span className="font-semibold text-warm-text text-sm">File by Mail</span>
          <span className="text-xs text-warm-muted text-center">allow extra time</span>
        </button>
      </div>

      {/* No e-filing available notice */}
      {!hasEFiling && filingMethod === '' && (
        <div className="flex items-start gap-2 rounded-lg border border-warm-border bg-warm-bg/50 p-3">
          <Info className="h-4 w-4 text-warm-muted mt-0.5 shrink-0" />
          <p className="text-xs text-warm-muted">
            {stateName} courts may offer e-filing — check with your local court clerk for availability.
          </p>
        </div>
      )}

      {/* JP Court Caveat (TX-specific) */}
      {state === 'TX' && courtType === 'jp' && filingMethod === 'online' && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <Info className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-800">
            Some Justice of the Peace courts don&apos;t accept e-filing yet. Check with your local court before filing online.
          </p>
        </div>
      )}

      {/* PA Magisterial caveat */}
      {state === 'PA' && courtType === 'pa_magisterial' && filingMethod === 'online' && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <Info className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-800">
            PACFile does not cover Magisterial District Courts. You&apos;ll need to file in person or by mail.
          </p>
        </div>
      )}

      {/* E-filing mandatory notice */}
      {eFilingSystem?.mandatory && filingMethod === 'in_person' && eFilingSystem.mandatoryNote && (
        <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3">
          <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
          <p className="text-xs text-blue-800">
            {eFilingSystem.mandatoryNote}. You may still be able to file in person as a self-represented litigant.
          </p>
        </div>
      )}

      {/* Online Filing Guidance */}
      {filingMethod === 'online' && hasEFiling && (
        <div className="space-y-5 rounded-lg border border-warm-border bg-warm-bg/50 p-4">
          <div className="space-y-1">
            <h4 className="font-semibold text-warm-text text-sm">Online filing roadmap</h4>
            <p className="text-xs leading-relaxed text-warm-muted">
              {filingPortalLabel} will ask you to choose a filing service, create or log into an account, then submit your document as a filing envelope.
            </p>
          </div>

          {isTexas && (
            <div className="rounded-lg border border-calm-indigo/20 bg-white p-4">
              <div className="flex items-start gap-3">
                <Globe className="mt-0.5 h-5 w-5 shrink-0 text-calm-indigo" />
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-semibold text-warm-text">First screen: choose an e-filing service provider</p>
                    <p className="mt-1 text-xs leading-relaxed text-warm-muted">
                      eFileTexas routes filings through certified Electronic Filing Service Providers, often called EFSPs. For most self-represented users, start with <strong>{recommendedProvider}</strong>. Other providers may offer extra services, but may also charge added service fees.
                    </p>
                  </div>
                  {providerComparisonUrl && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={providerComparisonUrl} target="_blank" rel="noopener noreferrer">
                        Compare official EFSP options
                        <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-warm-border bg-white p-4">
              <div className="mb-3 flex items-center gap-2">
                <ListChecks className="h-4 w-4 text-calm-indigo" />
                <h5 className="text-sm font-semibold text-warm-text">Before you open the portal</h5>
              </div>
              <ul className="space-y-2 text-xs leading-relaxed text-warm-muted">
                <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-calm-green" />Your {config.documentLabel} PDF is ready to upload.</li>
                <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-calm-green" />You know the court: <strong>{county || 'your county'} — {courtLabel}</strong>.</li>
                <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-calm-green" />You have payment ready, or a fee-waiver form if asking the court to waive fees.</li>
                <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-calm-green" />You have the defendant&apos;s service address if requesting citation/service.</li>
              </ul>
            </div>

            <div className="rounded-lg border border-warm-border bg-white p-4">
              <div className="mb-3 flex items-center gap-2">
                <Info className="h-4 w-4 text-calm-indigo" />
                <h5 className="text-sm font-semibold text-warm-text">Portal terms you may see</h5>
              </div>
              <dl className="space-y-2 text-xs leading-relaxed text-warm-muted">
                <div><dt className="font-semibold text-warm-text">Envelope</dt><dd>Your filing package before the clerk accepts it.</dd></div>
                <div><dt className="font-semibold text-warm-text">Lead document</dt><dd>Usually your {config.documentLabel} PDF.</dd></div>
                <div><dt className="font-semibold text-warm-text">Filing code</dt><dd>The clerk&apos;s category for the document you are submitting.</dd></div>
                <div><dt className="font-semibold text-warm-text">Service contact</dt><dd>Not the same as formally serving the defendant.</dd></div>
              </dl>
            </div>
          </div>

          <div className="rounded-lg border border-warm-border bg-white p-4">
            <h5 className="mb-4 text-sm font-semibold text-warm-text">Step-by-step e-filing guide</h5>
            <ol className="space-y-4 text-sm text-warm-muted">
              {[
                {
                  title: isTexas ? 'Choose your EFSP' : `Open ${eFilingSystem.name}`,
                  detail: isTexas
                    ? `On eFileTexas, choose ${recommendedProvider} unless you already use another certified provider.`
                    : `Go to ${eFilingSystem.name} and create or log into your account.`,
                  caution: isTexas ? 'If you pick a third-party provider, check whether it charges convenience or filing-service fees.' : undefined,
                },
                {
                  title: 'Create or log into your account',
                  detail: 'Use your own name and email. Save your username and password because filing notices usually go to this email address.',
                },
                {
                  title: 'Start a new case filing',
                  detail: `Select your court: ${county || 'your county'} — ${courtLabel}. Choose case category "${config.caseCategory}".`,
                  caution: courtType === 'jp' ? 'For JP courts, confirm the precinct and whether that court accepts online filing.' : undefined,
                },
                {
                  title: `Upload your ${config.documentLabel}`,
                  detail: `Use the ${config.documentLabel} PDF you download from Lawyer Free after completing this wizard. It will usually be the lead document.`,
                },
                {
                  title: 'Review fees and service',
                  detail: `Expected filing fee: ${feeRange}. If you need citation/service, look for options to request issuance or clerk/constable service.`,
                  caution: 'Some courts calculate service or copy fees separately. If the fee looks wrong, call the clerk before submitting.',
                },
                {
                  title: 'Submit and save proof',
                  detail: 'Submit the envelope, save the envelope number, then watch your email for accepted or rejected status.',
                },
                {
                  title: 'After acceptance',
                  detail: 'Download the file-stamped copy, note the cause number and filing date, then return to Lawyer Free to update your case.',
                },
              ].map((item, index) => (
                <li key={item.title} className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-calm-indigo/10 text-xs font-semibold text-calm-indigo">
                    {index + 1}
                  </span>
                  <div className="space-y-1">
                    <p className="font-semibold text-warm-text">{item.title}</p>
                    <p className="text-sm leading-relaxed text-warm-muted">{item.detail}</p>
                    {item.caution && (
                      <p className="flex gap-1.5 text-xs leading-relaxed text-amber-800">
                        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        {item.caution}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-lg border border-calm-amber/40 bg-calm-amber/[0.08] p-4">
            <div className="flex items-start gap-3">
              <FileCheck2 className="mt-0.5 h-4 w-4 shrink-0 text-[#8a5012]" />
              <div>
                <p className="text-sm font-semibold text-warm-text">If the clerk rejects the filing</p>
                <p className="mt-1 text-xs leading-relaxed text-warm-muted">
                  A rejection usually means the clerk needs a correction, not that your case is over. Read the rejection note, fix the document or filing selection, and resubmit as soon as possible.
                </p>
              </div>
            </div>
          </div>

          {eFileUrl && (
            <div className="pt-1">
              <Button variant="outline" size="sm" asChild className="w-full">
                <a href={eFileUrl} target="_blank" rel="noopener noreferrer">
                  Open {eFilingSystem.name}
                  <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
                </a>
              </Button>
            </div>
          )}
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
              <span>Go to <strong>{county ? `${county} County Courthouse` : `your local ${courtLabel}`}</strong> clerk&apos;s office</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-calm-indigo/10 text-xs font-semibold text-calm-indigo">5</span>
              <span>File at the clerk&apos;s window — they&apos;ll stamp your copies and assign a case number</span>
            </li>
          </ol>

          {county && (
            <div className="pt-2">
              <Button variant="outline" size="sm" asChild className="w-full">
                <a
                  href={`https://www.google.com/maps/search/${encodeURIComponent(`${county} County Courthouse ${stateName}`)}`}
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

      {filingMethod === 'mail' && (
        <div className="space-y-4 rounded-lg border border-warm-border bg-warm-bg/50 p-4">
          <h4 className="font-semibold text-warm-text text-sm">Mail filing checklist</h4>
          <ol className="space-y-3 text-sm text-warm-muted">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-calm-indigo/10 text-xs font-semibold text-calm-indigo">1</span>
              <span>Print your {config.documentLabel} and keep one copy for your records.</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-calm-indigo/10 text-xs font-semibold text-calm-indigo">2</span>
              <span>Include filing fee payment or a completed fee-waiver request if you are asking the court to waive fees.</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-calm-indigo/10 text-xs font-semibold text-calm-indigo">3</span>
              <span>Mail the packet to the clerk for <strong>{county ? `${county} County` : 'your court'}</strong>.</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-calm-indigo/10 text-xs font-semibold text-calm-indigo">4</span>
              <span>Use tracking and watch for a file-stamped copy, cause number, or clerk correction notice.</span>
            </li>
          </ol>
          <p className="text-xs text-warm-muted">
            Call the clerk before mailing if you are unsure about copies, payment type, or service/citation fees.
          </p>
        </div>
      )}
    </div>
  )
}
