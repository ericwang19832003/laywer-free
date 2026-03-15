'use client'

import { useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { WizardShell } from '@/components/ui/wizard-shell'
import type { WizardStep } from '@/components/ui/wizard-shell'
import {
  AnnotatedDraftViewer,
  type DraftAnnotation,
} from '@/components/step/filing/annotated-draft-viewer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChevronLeft, Loader2, CheckCircle2, AlertCircle, FileText } from 'lucide-react'
import { FilingMethodStep } from '@/components/step/filing-method-step'
import { FILING_CONFIGS } from '@/lib/filing-configs'
import Link from 'next/link'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface OtherWizardProps {
  caseId: string
  taskId: string
  existingMetadata?: Record<string, unknown>
  otherDetails?: {
    other_sub_type?: string
    other_party_name?: string
    other_party_type?: string
    dispute_description?: string
    damages_sought?: number
  } | null
  caseData?: {
    county: string | null
    court_type?: string | null
    state?: string
  } | null
}

/* ------------------------------------------------------------------ */
/*  Steps                                                              */
/* ------------------------------------------------------------------ */

const STEPS: WizardStep[] = [
  {
    id: 'preflight',
    title: 'Before You Start',
    subtitle: "Let's make sure you have what you need.",
  },
  {
    id: 'situation',
    title: 'Your Situation',
    subtitle: 'Describe what happened.',
  },
  {
    id: 'damages',
    title: 'Your Damages',
    subtitle: 'What did you lose?',
  },
  {
    id: 'venue',
    title: 'Where to File',
    subtitle: "We'll help you pick the right court.",
  },
  {
    id: 'how_to_file',
    title: 'How to File',
    subtitle: 'Choose how you want to submit your petition.',
  },
  {
    id: 'review',
    title: 'Review Everything',
    subtitle: 'Check your information before generating.',
  },
  {
    id: 'generate',
    title: 'Generate Draft',
    subtitle: 'We will create your petition.',
  },
]

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function OtherWizard({
  caseId,
  taskId,
  existingMetadata,
  otherDetails,
  caseData,
}: OtherWizardProps) {
  const router = useRouter()
  const meta = (existingMetadata ?? {}) as Record<string, unknown>
  const totalEstimateMinutes = 15

  /* ---- Situation ---- */
  const [otherPartyName, setOtherPartyName] = useState<string>(
    (meta.other_party_name as string) ?? otherDetails?.other_party_name ?? ''
  )
  const [otherPartyType, setOtherPartyType] = useState<string>(
    (meta.other_party_type as string) ?? otherDetails?.other_party_type ?? ''
  )
  const [disputeDescription, setDisputeDescription] = useState<string>(
    (meta.dispute_description as string) ?? otherDetails?.dispute_description ?? ''
  )
  const [whatHappened, setWhatHappened] = useState<string>(
    (meta.what_happened as string) ?? ''
  )
  const [whenHappened, setWhenHappened] = useState<string>(
    (meta.when_happened as string) ?? ''
  )

  /* ---- Damages ---- */
  const [damagesSought, setDamagesSought] = useState<string>(
    (meta.damages_sought as string) ??
      (otherDetails?.damages_sought != null ? String(otherDetails.damages_sought) : '')
  )
  const [damagesDescription, setDamagesDescription] = useState<string>(
    (meta.damages_description as string) ?? ''
  )
  const [hasDocumentation, setHasDocumentation] = useState<string>(
    (meta.has_documentation as string) ?? ''
  )

  /* ---- Venue ---- */
  const [county, setCounty] = useState<string>(
    (meta.county as string) ?? caseData?.county ?? ''
  )
  const [courtType, setCourtType] = useState<string>(
    (meta.court_type as string) ?? caseData?.court_type ?? ''
  )

  /* ---- Your info ---- */
  const [yourName, setYourName] = useState<string>((meta.your_name as string) ?? '')
  const [yourAddress, setYourAddress] = useState<string>((meta.your_address as string) ?? '')

  /* ---- Wizard / draft state ---- */
  const [currentStep, setCurrentStep] = useState(
    typeof meta._wizard_step === 'number' ? meta._wizard_step : 0
  )
  const [draft, setDraft] = useState<string>((meta.draft_text as string) ?? '')
  const [annotations, setAnnotations] = useState<DraftAnnotation[]>(
    (meta.annotations as DraftAnnotation[]) ?? []
  )
  const [acknowledged, setAcknowledged] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState<string | null>(null)
  const [draftPhase, setDraftPhase] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [filingMethod, setFilingMethod] = useState<'online' | 'in_person' | ''>(
    (meta.filing_method as 'online' | 'in_person' | '') ?? ''
  )

  /* ---- Build helpers ---- */

  const buildFacts = useCallback(() => {
    const parsedDamages = parseFloat(damagesSought) || 0

    return {
      your_info: {
        full_name: yourName,
        address: yourAddress || undefined,
      },
      opposing_party: {
        full_name: otherPartyName,
        party_type: otherPartyType || undefined,
      },
      court_type: courtType || undefined,
      county: county || '',
      dispute_description: disputeDescription,
      what_happened: whatHappened,
      when_happened: whenHappened || undefined,
      damages_sought: parsedDamages,
      damages_description: damagesDescription || undefined,
      has_documentation: hasDocumentation || undefined,
      description:
        `Civil petition — ${otherPartyType || 'opposing party'}: ${otherPartyName}. ` +
        (whatHappened ? `What happened: ${whatHappened}. ` : '') +
        `Damages sought: $${parsedDamages.toFixed(2)}.`,
    }
  }, [
    yourName,
    yourAddress,
    otherPartyName,
    otherPartyType,
    courtType,
    county,
    disputeDescription,
    whatHappened,
    whenHappened,
    damagesSought,
    damagesDescription,
    hasDocumentation,
  ])

  const buildMetadata = useCallback(
    () => ({
      // Situation
      other_party_name: otherPartyName,
      other_party_type: otherPartyType || null,
      dispute_description: disputeDescription || null,
      what_happened: whatHappened || null,
      when_happened: whenHappened || null,
      // Damages
      damages_sought: damagesSought || null,
      damages_description: damagesDescription || null,
      has_documentation: hasDocumentation || null,
      // Venue
      county: county || null,
      court_type: courtType || null,
      // Your info
      your_name: yourName || null,
      your_address: yourAddress || null,
      // Draft
      draft_text: draft || null,
      final_text: draft || null,
      annotations,
      // Filing method
      filing_method: filingMethod || null,
      // Wizard position
      _wizard_step: currentStep,
    }),
    [
      otherPartyName,
      otherPartyType,
      disputeDescription,
      whatHappened,
      whenHappened,
      damagesSought,
      damagesDescription,
      hasDocumentation,
      county,
      courtType,
      yourName,
      yourAddress,
      draft,
      annotations,
      filingMethod,
      currentStep,
    ]
  )

  /* ---- API helpers ---- */

  async function patchTask(status: string, metadata?: Record<string, unknown>) {
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, ...(metadata ? { metadata } : {}) }),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Failed to update task')
    }
  }

  async function generateDraft() {
    setGenerating(true)
    setGenError(null)
    try {
      const res = await fetch(`/api/cases/${caseId}/generate-filing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document_type: 'other_petition',
          facts: buildFacts(),
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to generate document')
      }
      const data = await res.json()
      setDraft(data.draft)
      setAnnotations(data.annotations ?? [])
      setDraftPhase(true)
    } catch (err) {
      setGenError(err instanceof Error ? err.message : 'Failed to generate document')
    } finally {
      setGenerating(false)
    }
  }

  /* ---- Wizard handlers ---- */

  const handleSave = useCallback(async () => {
    await patchTask('in_progress', buildMetadata())
  }, [buildMetadata]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleComplete = useCallback(async () => {
    await patchTask('in_progress', buildMetadata())
    await generateDraft()
  }, [buildMetadata, buildFacts]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleFinalConfirm = useCallback(async () => {
    setConfirming(true)
    try {
      const metadata = buildMetadata()
      await patchTask('in_progress', metadata)
      await patchTask('completed')
      router.push(`/case/${caseId}`)
    } catch (err) {
      setGenError(err instanceof Error ? err.message : 'Failed to complete task')
    } finally {
      setConfirming(false)
    }
  }, [buildMetadata, caseId, router]) // eslint-disable-line react-hooks/exhaustive-deps

  /* ---- canAdvance per step ---- */

  const canAdvance = useMemo(() => {
    const stepId = STEPS[currentStep]?.id
    switch (stepId) {
      case 'preflight':
        return true
      case 'situation':
        return otherPartyName.trim() !== '' && disputeDescription.trim().length >= 10
      case 'damages':
        return true // damages are helpful but not strictly required
      case 'venue':
        return true
      case 'how_to_file':
        return filingMethod !== ''
      case 'review':
        return true
      case 'generate':
        return true
      default:
        return true
    }
  }, [currentStep, otherPartyName, disputeDescription, filingMethod])

  /* ---- Formatting helpers ---- */

  function formatPartyType(value: string): string {
    const labels: Record<string, string> = {
      individual: 'Individual',
      business: 'Business',
      government: 'Government entity',
    }
    return labels[value] ?? value
  }

  function formatCourtType(value: string): string {
    const labels: Record<string, string> = {
      jp: 'Justice of the Peace',
      county: 'County Court',
      district: 'District Court',
      federal: 'Federal Court',
    }
    return labels[value] ?? value
  }

  /* ---- Step rendering ---- */

  function renderStep() {
    const stepId = STEPS[currentStep]?.id
    switch (stepId) {
      case 'preflight':
        return (
          <div className="space-y-4">
            <p className="text-sm text-warm-text leading-relaxed">
              Before we begin, gather what you can. You do not need everything right now,
              but having these ready will make the process smoother:
            </p>
            <ul className="space-y-3">
              {[
                'The name and address of the person or organization involved',
                'A summary of what happened and when',
                'Any documents, receipts, or correspondence related to your situation',
                'An estimate of your financial losses (if applicable)',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-calm-indigo shrink-0 mt-0.5" />
                  <span className="text-sm text-warm-text">{item}</span>
                </li>
              ))}
            </ul>
            <div className="rounded-lg bg-calm-indigo/5 border border-calm-indigo/10 px-4 py-3 mt-4">
              <p className="text-sm text-warm-muted">
                It is okay if you do not have everything. We will work with what you have and
                guide you through filling in the gaps.
              </p>
            </div>
          </div>
        )

      case 'situation':
        return (
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="your-name">Your full name</Label>
              <Input
                id="your-name"
                placeholder="Your legal name"
                value={yourName}
                onChange={(e) => setYourName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="your-address">
                Your address{' '}
                <span className="font-normal text-warm-muted">(optional)</span>
              </Label>
              <Input
                id="your-address"
                placeholder="Street address, city, state, ZIP"
                value={yourAddress}
                onChange={(e) => setYourAddress(e.target.value)}
              />
            </div>

            <div className="border-t border-warm-border pt-5 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="other-party-name">Other party&apos;s name</Label>
                <Input
                  id="other-party-name"
                  placeholder="Person, company, or organization name"
                  value={otherPartyName}
                  onChange={(e) => setOtherPartyName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="other-party-type">Other party type</Label>
                <Select value={otherPartyType} onValueChange={setOtherPartyType}>
                  <SelectTrigger id="other-party-type" className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="government">Government entity</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border-t border-warm-border pt-5 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="dispute-description">
                  Describe your situation
                </Label>
                <Textarea
                  id="dispute-description"
                  placeholder="What is the dispute about? What are you seeking?"
                  value={disputeDescription}
                  onChange={(e) => setDisputeDescription(e.target.value)}
                  rows={4}
                />
                <p className="text-xs text-warm-muted">
                  A brief overview of the dispute and what outcome you are looking for.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="what-happened">
                  What happened?
                </Label>
                <Textarea
                  id="what-happened"
                  placeholder="Describe the key events in order..."
                  value={whatHappened}
                  onChange={(e) => setWhatHappened(e.target.value)}
                  rows={4}
                />
                <p className="text-xs text-warm-muted">
                  Focus on facts: who did what, when, and what resulted.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="when-happened">
                  When did this happen?{' '}
                  <span className="font-normal text-warm-muted">(optional)</span>
                </Label>
                <Input
                  id="when-happened"
                  type="date"
                  value={whenHappened}
                  onChange={(e) => setWhenHappened(e.target.value)}
                />
              </div>
            </div>
          </div>
        )

      case 'damages':
        return (
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="damages-amount">
                Approximate damages ($){' '}
                <span className="font-normal text-warm-muted">(optional)</span>
              </Label>
              <Input
                id="damages-amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={damagesSought}
                onChange={(e) => setDamagesSought(e.target.value)}
              />
              <p className="text-xs text-warm-muted">
                An estimate is fine. Include financial losses, repair costs, medical bills, or
                other measurable harm.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="damages-description">
                Describe your losses{' '}
                <span className="font-normal text-warm-muted">(optional)</span>
              </Label>
              <Textarea
                id="damages-description"
                placeholder="What did you lose? How did this affect you financially or otherwise?"
                value={damagesDescription}
                onChange={(e) => setDamagesDescription(e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="has-documentation">Do you have documentation of your losses?</Label>
              <Select value={hasDocumentation} onValueChange={setHasDocumentation}>
                <SelectTrigger id="has-documentation" className="w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes, I have receipts/records</SelectItem>
                  <SelectItem value="partial">I have some documentation</SelectItem>
                  <SelectItem value="no">No documentation yet</SelectItem>
                </SelectContent>
              </Select>
              {hasDocumentation === 'no' && (
                <div className="rounded-lg bg-calm-indigo/5 border border-calm-indigo/10 px-4 py-3 mt-2">
                  <p className="text-sm text-warm-muted">
                    Start gathering receipts, invoices, photos, or any records that show your losses.
                    Documentation strengthens your case significantly.
                  </p>
                </div>
              )}
            </div>
          </div>
        )

      case 'venue':
        return (
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="county">County</Label>
              <Input
                id="county"
                placeholder="e.g. Travis, Harris, Dallas"
                value={county}
                onChange={(e) => setCounty(e.target.value)}
              />
              <p className="text-xs text-warm-muted">
                Generally, you file in the county where the other party lives, where
                the events occurred, or where a contract was to be performed.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="court-type">Court type</Label>
              <Select value={courtType} onValueChange={setCourtType}>
                <SelectTrigger id="court-type" className="w-full">
                  <SelectValue placeholder="Select court type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jp">Justice of the Peace (JP)</SelectItem>
                  <SelectItem value="county">County Court</SelectItem>
                  <SelectItem value="district">District Court</SelectItem>
                  <SelectItem value="federal">Federal Court</SelectItem>
                  <SelectItem value="unsure">I&apos;m not sure</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-warm-muted">
                The right court depends on the amount in dispute and the type of case.
                JP courts handle claims up to $20,000. County courts handle up to $200,000.
                District courts handle larger amounts and specific case types.
              </p>
            </div>

            {courtType === 'unsure' && (
              <div className="rounded-lg bg-calm-indigo/5 border border-calm-indigo/10 px-4 py-3">
                <p className="text-sm text-warm-muted">
                  Not sure which court? That is okay. Based on your damages amount,
                  we can suggest the right court.
                  {damagesSought && parseFloat(damagesSought) <= 20000
                    ? ' For claims under $20,000, a Justice of the Peace court is usually the right fit.'
                    : damagesSought && parseFloat(damagesSought) <= 200000
                      ? ' For claims between $20,000 and $200,000, County Court is typically appropriate.'
                      : damagesSought && parseFloat(damagesSought) > 200000
                        ? ' For claims over $200,000, District Court is the right venue.'
                        : ''}
                </p>
              </div>
            )}
          </div>
        )

      case 'how_to_file':
        return (
          <FilingMethodStep
            filingMethod={filingMethod}
            onFilingMethodChange={setFilingMethod}
            county={county}
            courtType={courtType}
            config={FILING_CONFIGS.other}
            state={caseData?.state}
          />
        )
      case 'review':
        return (
          <div className="space-y-6">
            <p className="text-sm text-warm-muted">
              Please review the information below. You can go back to any step to make changes.
            </p>

            {/* Your info */}
            <div className="rounded-lg border border-warm-border p-4 space-y-3">
              <h3 className="text-sm font-medium text-warm-text flex items-center gap-2">
                <FileText className="h-4 w-4 text-calm-indigo" />
                Your Information
              </h3>
              <dl className="space-y-2">
                <div className="flex gap-2">
                  <dt className="text-sm text-warm-muted min-w-[100px]">Name:</dt>
                  <dd className="text-sm text-warm-text">{yourName || 'Not provided'}</dd>
                </div>
                {yourAddress && (
                  <div className="flex gap-2">
                    <dt className="text-sm text-warm-muted min-w-[100px]">Address:</dt>
                    <dd className="text-sm text-warm-text">{yourAddress}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Other party */}
            <div className="rounded-lg border border-warm-border p-4 space-y-3">
              <h3 className="text-sm font-medium text-warm-text">Other Party</h3>
              <dl className="space-y-2">
                <div className="flex gap-2">
                  <dt className="text-sm text-warm-muted min-w-[100px]">Name:</dt>
                  <dd className="text-sm text-warm-text">{otherPartyName || 'Not provided'}</dd>
                </div>
                {otherPartyType && (
                  <div className="flex gap-2">
                    <dt className="text-sm text-warm-muted min-w-[100px]">Type:</dt>
                    <dd className="text-sm text-warm-text">{formatPartyType(otherPartyType)}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Situation */}
            <div className="rounded-lg border border-warm-border p-4 space-y-3">
              <h3 className="text-sm font-medium text-warm-text">Situation</h3>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm text-warm-muted">Overview:</dt>
                  <dd className="text-sm text-warm-text mt-0.5">
                    {disputeDescription || 'Not provided'}
                  </dd>
                </div>
                {whatHappened && (
                  <div>
                    <dt className="text-sm text-warm-muted">What happened:</dt>
                    <dd className="text-sm text-warm-text mt-0.5">{whatHappened}</dd>
                  </div>
                )}
                {whenHappened && (
                  <div className="flex gap-2">
                    <dt className="text-sm text-warm-muted min-w-[100px]">Date:</dt>
                    <dd className="text-sm text-warm-text">{whenHappened}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Damages */}
            <div className="rounded-lg border border-warm-border p-4 space-y-3">
              <h3 className="text-sm font-medium text-warm-text">Damages</h3>
              <dl className="space-y-2">
                <div className="flex gap-2">
                  <dt className="text-sm text-warm-muted min-w-[100px]">Amount:</dt>
                  <dd className="text-sm text-warm-text">
                    {damagesSought
                      ? `$${parseFloat(damagesSought).toLocaleString()}`
                      : 'Not specified'}
                  </dd>
                </div>
                {damagesDescription && (
                  <div>
                    <dt className="text-sm text-warm-muted">Details:</dt>
                    <dd className="text-sm text-warm-text mt-0.5">{damagesDescription}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Venue */}
            <div className="rounded-lg border border-warm-border p-4 space-y-3">
              <h3 className="text-sm font-medium text-warm-text">Filing Location</h3>
              <dl className="space-y-2">
                <div className="flex gap-2">
                  <dt className="text-sm text-warm-muted min-w-[100px]">County:</dt>
                  <dd className="text-sm text-warm-text">{county || 'Not specified'}</dd>
                </div>
                {courtType && courtType !== 'unsure' && (
                  <div className="flex gap-2">
                    <dt className="text-sm text-warm-muted min-w-[100px]">Court:</dt>
                    <dd className="text-sm text-warm-text">{formatCourtType(courtType)}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Warnings */}
            {(!yourName || !otherPartyName || !disputeDescription) && (
              <div className="rounded-lg border border-calm-amber bg-calm-amber/5 px-4 py-3 flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 text-calm-amber shrink-0 mt-0.5" />
                <p className="text-sm text-warm-muted">
                  Some fields are incomplete. You can still generate a draft, but filling in
                  missing information will produce a stronger document.
                </p>
              </div>
            )}
          </div>
        )

      case 'generate':
        return (
          <div className="space-y-4 text-center py-4">
            <FileText className="h-10 w-10 text-calm-indigo mx-auto" />
            <h3 className="text-lg font-medium text-warm-text">
              Ready to Generate Your Petition
            </h3>
            <p className="text-sm text-warm-muted max-w-md mx-auto">
              We will create a draft petition based on the information you provided.
              You will be able to review and edit it before finalizing.
            </p>
          </div>
        )

      default:
        return null
    }
  }

  /* ---- Draft phase layout ---- */

  if (draftPhase) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link
          href={`/case/${caseId}`}
          className="inline-flex items-center gap-1 text-sm text-warm-muted hover:text-warm-text mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to dashboard
        </Link>

        <h1 className="text-2xl font-semibold text-warm-text">Your Petition Draft</h1>
        <p className="text-sm text-warm-muted mt-1 mb-6">
          Review your draft below. You can edit it directly, regenerate it, or download a PDF.
        </p>

        {genError && (
          <div className="rounded-lg border border-calm-amber bg-calm-amber/5 p-3 mb-4">
            <p className="text-sm text-warm-text">{genError}</p>
          </div>
        )}

        {draft ? (
          <>
            <AnnotatedDraftViewer
              draft={draft}
              annotations={annotations}
              onDraftChange={setDraft}
              onRegenerate={async () => {
                setDraftPhase(false)
                await generateDraft()
              }}
              regenerating={generating}
              acknowledged={acknowledged}
              onAcknowledgeChange={setAcknowledged}
              documentTitle="Civil Petition"
            />

            {acknowledged && (
              <div className="mt-6">
                <Button
                  onClick={handleFinalConfirm}
                  disabled={confirming}
                  className="w-full"
                  size="lg"
                >
                  {confirming ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Confirm & Submit'
                  )}
                </Button>
                <p className="text-xs text-warm-muted text-center mt-2">
                  This saves your document and marks this step as complete.
                </p>
              </div>
            )}

            <div className="mt-4">
              <button
                type="button"
                onClick={() => setDraftPhase(false)}
                className="text-sm text-warm-muted hover:text-warm-text transition-colors"
              >
                Go back and edit my information
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3 py-12 justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-warm-muted" />
            <p className="text-sm text-warm-muted">Generating your draft...</p>
          </div>
        )}
      </div>
    )
  }

  /* ---- Wizard phase layout ---- */

  return (
    <WizardShell
      caseId={caseId}
      title="Prepare Your Petition"
      steps={STEPS}
      currentStep={currentStep}
      onStepChange={setCurrentStep}
      onSave={handleSave}
      onComplete={handleComplete}
      canAdvance={canAdvance}
      totalEstimateMinutes={totalEstimateMinutes}
      completeButtonLabel={generating ? 'Generating...' : 'Generate My Petition'}
    >
      {generating ? (
        <div className="flex items-center gap-3 py-12 justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-warm-muted" />
          <p className="text-sm text-warm-muted">
            Generating your petition... This may take a moment.
          </p>
        </div>
      ) : (
        renderStep()
      )}
    </WizardShell>
  )
}
