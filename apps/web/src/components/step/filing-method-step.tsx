'use client'

import { useState } from 'react'
import { AlertTriangle, Building2, CheckCircle2, ChevronDown, ChevronUp, ExternalLink, FileCheck2, Globe, Info, ListChecks, Mail } from 'lucide-react'
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
  const [expandedStep, setExpandedStep] = useState<number | null>(null)
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
            <p className="mb-4 text-xs text-warm-muted">Click any step for detailed instructions.</p>
            <ol className="space-y-2 text-sm text-warm-muted">
              {[
                {
                  title: isTexas ? 'Choose your EFSP' : `Open ${eFilingSystem?.name ?? 'the e-filing portal'}`,
                  detail: isTexas
                    ? `On eFileTexas, choose ${recommendedProvider} unless you already use another certified provider.`
                    : `Go to ${eFilingSystem?.name ?? 'the portal'} and create or log into your account.`,
                  caution: isTexas ? 'If you pick a third-party provider, check whether it charges convenience or filing-service fees.' : undefined,
                  expanded: isTexas ? [
                    `Go to eFileTexas.gov and click the option to start filing.`,
                    `You'll see a list of certified EFSPs — these are third-party services that handle document transmission to the court.`,
                    `Select "${recommendedProvider}" — this is the free, state-run option.`,
                    `Avoid providers that show additional "service fees" or "convenience fees" unless you specifically want their extra features.`,
                    `All certified providers submit to the same courts — the difference is price and interface, not who reviews your filing.`,
                  ] : [
                    `Navigate to the ${eFilingSystem?.name ?? 'state e-filing'} portal.`,
                    `If this is your first visit, create an account using your full legal name and a personal email address.`,
                    `Save your login credentials — you'll need them to check filing status and download accepted documents.`,
                  ],
                },
                {
                  title: 'Create or log into your account',
                  detail: 'Use your own name and email. Save your username and password because filing notices usually go to this email address.',
                  expanded: [
                    `Click "Register" for a new account or "Sign In" if you have an existing one.`,
                    `Use your legal name exactly as it appears on your government-issued ID.`,
                    `Use a personal email you check regularly — all acceptance and rejection notices go here.`,
                    `Write down your password; you'll need it every time you check filing status.`,
                    `Verify your email address if prompted before attempting to file.`,
                  ],
                },
                {
                  title: 'Start a new case filing',
                  detail: `Select your court: ${county || 'your county'} — ${courtLabel}. Choose case category "${config.caseCategory}".`,
                  caution: courtType === 'jp' ? 'For JP courts, confirm the precinct and whether that court accepts online filing.' : undefined,
                  expanded: [
                    `After signing in, look for "New Filing," "File & Serve," or "Start a New Case."`,
                    `Under Location or Court, find "${county || 'your county'}" and select "${courtLabel}."`,
                    `Under Case Category, choose "${config.caseCategory}."`,
                    courtType === 'jp'
                      ? `For JP courts, you may also need to select the precinct number — check your court selection from the prior step.`
                      : `Under Case Type, pick the option that most closely matches your dispute.`,
                    `If you see a "Civil Case Information Sheet" requirement, you'll need to attach that as a supporting document after uploading your petition.`,
                  ],
                },
                {
                  title: `Upload your ${config.documentLabel}`,
                  detail: `Use the ${config.documentLabel} PDF you download from Lawyer Free after completing this wizard. It will usually be the lead document.`,
                  expanded: [
                    `Click "Add Document" or "Lead Document" inside the filing envelope.`,
                    `Under Filing Code, look for "Petition," "Original Petition," or "Plaintiff's Original Petition."`,
                    `Click Browse or Choose File and select your ${config.documentLabel} PDF downloaded from Lawyer Free.`,
                    `The file must be a PDF, typically under 25 MB — the portal will warn you if it is too large.`,
                    `If you have exhibits or attachments, add them separately under "Supporting Documents" — do not combine them with the main ${config.documentLabel}.`,
                  ],
                },
                {
                  title: 'Review fees and service',
                  detail: `Expected filing fee: ${feeRange}. If you need citation/service, look for options to request issuance or clerk/constable service.`,
                  caution: 'Some courts calculate service or copy fees separately. If the fee looks wrong, call the clerk before submitting.',
                  expanded: [
                    `Filing fee: ${feeRange} — paid by credit card, debit card, or e-check directly in the portal.`,
                    `If you need the defendant formally served, find the Service section inside the filing envelope.`,
                    `"Issuance Only" means the clerk prints the citation; you arrange delivery through a constable or process server.`,
                    `If "Constable Service" or "Process Server" options appear, those typically add $75–$150 to the total.`,
                    `If you are requesting a fee waiver (inability to pay), look for an option to attach a Statement of Inability to Pay.`,
                    `If the total looks higher than expected, stop and call the clerk before submitting.`,
                  ],
                },
                {
                  title: 'Submit and save proof',
                  detail: 'Submit the envelope, save the envelope number, then watch your email for accepted or rejected status.',
                  expanded: [
                    `Review the full summary page before clicking Submit — verify the court name, case type, and document name.`,
                    `After submitting, the portal assigns an Envelope Number (e.g., ENV-2026-12345) — screenshot or copy it immediately.`,
                    `This envelope number proves you submitted even before the clerk reviews the filing.`,
                    `The clerk typically reviews within 1–3 business days — watch the email address you used to register.`,
                    `If you don't see a confirmation email within 24 hours, check your spam folder or log back in to view envelope status.`,
                  ],
                },
                {
                  title: 'After acceptance',
                  detail: 'Download the file-stamped copy, note the cause number and filing date, then return to Lawyer Free to update your case.',
                  expanded: [
                    `The acceptance email or portal notification will include a file-stamped copy of your petition.`,
                    `Download and save it — this is your official filed document with the court's stamp and cause number.`,
                    `Note the cause number (e.g., 2026-CV-12345) and the official filing date — both appear on the stamped copy.`,
                    `The date on the file stamp is what counts for legal deadlines, not the date you clicked Submit.`,
                    `Return to Lawyer Free and mark this step complete so your workflow advances to serving the defendant.`,
                  ],
                },
              ].map((item, index) => {
                const isOpen = expandedStep === index
                return (
                  <li key={item.title} className="rounded-lg border border-warm-border overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setExpandedStep(isOpen ? null : index)}
                      className="flex w-full items-start gap-3 p-3 text-left hover:bg-warm-bg/60 transition-colors"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-calm-indigo/10 text-xs font-semibold text-calm-indigo mt-0.5">
                        {index + 1}
                      </span>
                      <div className="flex-1 space-y-1 min-w-0">
                        <p className="font-semibold text-warm-text">{item.title}</p>
                        <p className="text-xs leading-relaxed text-warm-muted">{item.detail}</p>
                        {item.caution && (
                          <p className="flex gap-1.5 text-xs leading-relaxed text-amber-800">
                            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                            {item.caution}
                          </p>
                        )}
                      </div>
                      {isOpen
                        ? <ChevronUp className="h-4 w-4 shrink-0 text-warm-muted mt-1" />
                        : <ChevronDown className="h-4 w-4 shrink-0 text-warm-muted mt-1" />
                      }
                    </button>
                    {isOpen && (
                      <div className="border-t border-warm-border bg-warm-bg/40 px-4 py-3 space-y-2">
                        {item.expanded.map((line, i) => (
                          <p key={i} className="text-xs leading-relaxed text-warm-muted flex gap-2">
                            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-calm-indigo/40 shrink-0" />
                            {line}
                          </p>
                        ))}
                      </div>
                    )}
                  </li>
                )
              })}
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
