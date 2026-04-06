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
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
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
  existingMetadata?: Record<string, unknown> | null
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
  { id: 'intake', title: 'Who Is Involved', subtitle: 'Tell us about the parties and what happened.' },
  { id: 'dispute', title: 'Your Situation', subtitle: 'Describe the dispute in detail.' },
  { id: 'damages', title: 'Your Losses', subtitle: 'Financial and other harm.' },
  { id: 'evidence', title: 'Your Evidence', subtitle: 'Any supporting documents you have.' },
  { id: 'how_to_file', title: 'How to File', subtitle: 'Choose how you want to submit your petition.' },
  { id: 'review', title: 'Review Everything', subtitle: 'Check your information before generating.' },
]

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function OtherWizard({ caseId, taskId, existingMetadata, otherDetails, caseData }: OtherWizardProps) {
  const router = useRouter()
  const meta = (existingMetadata ?? {}) as Record<string, unknown>

  /* ---- Intake ---- */
  const [yourName, setYourName] = useState<string>((meta.your_name as string) ?? '')
  const [yourAddress, setYourAddress] = useState<string>((meta.your_address as string) ?? '')
  const [otherPartyName, setOtherPartyName] = useState<string>((meta.other_party_name as string) ?? otherDetails?.other_party_name ?? '')
  const [otherPartyType, setOtherPartyType] = useState<string>((meta.other_party_type as string) ?? otherDetails?.other_party_type ?? '')
  const [whenHappened, setWhenHappened] = useState<string>((meta.when_happened as string) ?? '')
  const [briefDescription, setBriefDescription] = useState<string>((meta.brief_description as string) ?? '')

  /* ---- Dispute ---- */
  const [disputeDescription, setDisputeDescription] = useState<string>((meta.dispute_description as string) ?? otherDetails?.dispute_description ?? '')

  /* ---- Damages ---- */
  const [damagesSought, setDamagesSought] = useState<string>((meta.damages_sought as string) ?? (otherDetails?.damages_sought != null ? String(otherDetails.damages_sought) : ''))
  const [damagesDescription, setDamagesDescription] = useState<string>((meta.damages_description as string) ?? '')

  /* ---- Evidence ---- */
  const [hasDocumentation, setHasDocumentation] = useState<string>((meta.has_documentation as string) ?? '')
  const [evidenceNotes, setEvidenceNotes] = useState<string>((meta.evidence_notes as string) ?? '')

  /* ---- Venue ---- */
  const [county, setCounty] = useState<string>((meta.county as string) ?? caseData?.county ?? '')
  const [courtType, setCourtType] = useState<string>((meta.court_type as string) ?? caseData?.court_type ?? '')

  /* ---- Wizard / draft state ---- */
  const [currentStep, setCurrentStep] = useState(typeof meta._wizard_step === 'number' ? meta._wizard_step : 0)
  const [draft, setDraft] = useState<string>((meta.draft_text as string) ?? '')
  const [annotations, setAnnotations] = useState<DraftAnnotation[]>((meta.annotations as DraftAnnotation[]) ?? [])
  const [acknowledged, setAcknowledged] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState<string | null>(null)
  const [draftPhase, setDraftPhase] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [filingMethod, setFilingMethod] = useState<'online' | 'in_person' | ''>((meta.filing_method as 'online' | 'in_person' | '') ?? '')

  /* ---- Build helpers ---- */

  const buildFacts = useCallback(() => ({
    your_info: { full_name: yourName, address: yourAddress || undefined },
    opposing_party: { full_name: otherPartyName, party_type: otherPartyType || undefined },
    court_type: courtType || undefined,
    county: county || '',
    brief_description: briefDescription || undefined,
    dispute_description: disputeDescription,
    when_happened: whenHappened || undefined,
    damages_sought: parseFloat(damagesSought) || 0,
    damages_description: damagesDescription || undefined,
    has_documentation: hasDocumentation || undefined,
    evidence_notes: evidenceNotes || undefined,
    description: `Civil petition — ${otherPartyType || 'opposing party'}: ${otherPartyName}. Damages sought: $${(parseFloat(damagesSought) || 0).toFixed(2)}.`,
  }), [yourName, yourAddress, otherPartyName, otherPartyType, courtType, county, briefDescription, disputeDescription, whenHappened, damagesSought, damagesDescription, hasDocumentation, evidenceNotes])

  const buildMetadata = useCallback(() => ({
    your_name: yourName || null, your_address: yourAddress || null,
    other_party_name: otherPartyName || null, other_party_type: otherPartyType || null,
    when_happened: whenHappened || null, brief_description: briefDescription || null,
    dispute_description: disputeDescription || null,
    damages_sought: damagesSought || null, damages_description: damagesDescription || null,
    has_documentation: hasDocumentation || null, evidence_notes: evidenceNotes || null,
    county: county || null, court_type: courtType || null,
    draft_text: draft || null, final_text: draft || null, annotations,
    filing_method: filingMethod || null, _wizard_step: currentStep,
  }), [yourName, yourAddress, otherPartyName, otherPartyType, whenHappened, briefDescription, disputeDescription, damagesSought, damagesDescription, hasDocumentation, evidenceNotes, county, courtType, draft, annotations, filingMethod, currentStep])

  /* ---- API helpers ---- */

  async function patchTask(status: string, metadata?: Record<string, unknown>) {
    const res = await fetch(`/api/tasks/${taskId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status, ...(metadata ? { metadata } : {}) }) })
    if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Failed to update task') }
  }

  async function generateDraft() {
    setGenerating(true); setGenError(null)
    try {
      const res = await fetch(`/api/cases/${caseId}/generate-filing`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ document_type: 'other_petition', facts: buildFacts() }) })
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || 'Failed to generate document') }
      const data = await res.json()
      setDraft(data.draft); setAnnotations(data.annotations ?? []); setDraftPhase(true)
    } catch (err) { setGenError(err instanceof Error ? err.message : 'Failed to generate document') }
    finally { setGenerating(false) }
  }

  const handleSave = useCallback(async () => { await patchTask('in_progress', buildMetadata()) }, [buildMetadata]) // eslint-disable-line react-hooks/exhaustive-deps
  const handleComplete = useCallback(async () => { await patchTask('in_progress', buildMetadata()); await generateDraft() }, [buildMetadata, buildFacts]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleFinalConfirm = useCallback(async () => {
    setConfirming(true)
    try { await patchTask('in_progress', buildMetadata()); await patchTask('completed'); router.push(`/case/${caseId}`) }
    catch (err) { setGenError(err instanceof Error ? err.message : 'Failed to complete task') }
    finally { setConfirming(false) }
  }, [buildMetadata, caseId, router]) // eslint-disable-line react-hooks/exhaustive-deps

  const canAdvance = useMemo(() => {
    const stepId = STEPS[currentStep]?.id
    switch (stepId) {
      case 'intake': return otherPartyName.trim() !== '' && yourName.trim() !== ''
      case 'dispute': return disputeDescription.trim().length >= 10
      case 'damages': return true
      case 'evidence': return true
      case 'how_to_file': return filingMethod !== ''
      case 'review': return true
      default: return true
    }
  }, [currentStep, otherPartyName, yourName, disputeDescription, filingMethod])

  const PARTY_LABELS: Record<string, string> = { individual: 'Individual', business: 'Business', government: 'Government entity' }

  /* ---- Step rendering ---- */

  function renderStep() {
    const stepId = STEPS[currentStep]?.id
    switch (stepId) {
      case 'intake':
        return (
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="ow-your-name">Your full name</Label>
              <Input id="ow-your-name" placeholder="Your legal name" value={yourName} onChange={e => setYourName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ow-your-address">Your address <span className="font-normal text-warm-muted">(optional)</span></Label>
              <Input id="ow-your-address" placeholder="Street, city, state, ZIP" value={yourAddress} onChange={e => setYourAddress(e.target.value)} />
            </div>
            <div className="border-t border-warm-border pt-5 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="ow-other-party">Other party&apos;s name</Label>
                <Input id="ow-other-party" placeholder="Person, company, or organization" value={otherPartyName} onChange={e => setOtherPartyName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Other party type <span className="font-normal text-warm-muted">(optional)</span></Label>
                <Select value={otherPartyType} onValueChange={setOtherPartyType}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="government">Government entity</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ow-when">When did this happen? <span className="font-normal text-warm-muted">(optional)</span></Label>
                <Input id="ow-when" type="date" value={whenHappened} onChange={e => setWhenHappened(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ow-brief">Brief description</Label>
                <Input id="ow-brief" placeholder="One-sentence summary of your dispute" value={briefDescription} onChange={e => setBriefDescription(e.target.value)} />
              </div>
            </div>
          </div>
        )

      case 'dispute':
        return (
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="ow-dispute">Tell us what happened</Label>
              <Textarea id="ow-dispute" placeholder="Describe the dispute in your own words. Focus on facts: who did what, when, and what resulted." value={disputeDescription} onChange={e => setDisputeDescription(e.target.value)} rows={6} />
              <p className="text-xs text-warm-muted">Take your time. The more detail you provide, the stronger your petition.</p>
            </div>
          </div>
        )

      case 'damages':
        return (
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="ow-damages">Approximate financial losses ($) <span className="font-normal text-warm-muted">(optional)</span></Label>
              <Input id="ow-damages" type="number" min="0" step="0.01" placeholder="0.00" value={damagesSought} onChange={e => setDamagesSought(e.target.value)} />
              <p className="text-xs text-warm-muted">An estimate is fine. Include repair costs, medical bills, lost wages, or other measurable harm.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ow-damages-desc">Describe your losses <span className="font-normal text-warm-muted">(optional)</span></Label>
              <Textarea id="ow-damages-desc" placeholder="What did you lose? How did this affect you?" value={damagesDescription} onChange={e => setDamagesDescription(e.target.value)} rows={4} />
            </div>
          </div>
        )

      case 'evidence':
        return (
          <div className="space-y-5">
            <div className="space-y-2">
              <Label>Do you have documentation of your situation?</Label>
              <Select value={hasDocumentation} onValueChange={setHasDocumentation}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes, I have receipts/records</SelectItem>
                  <SelectItem value="partial">I have some documentation</SelectItem>
                  <SelectItem value="no">No documentation yet</SelectItem>
                </SelectContent>
              </Select>
              {hasDocumentation === 'no' && (
                <div className="rounded-lg bg-calm-indigo/5 border border-calm-indigo/10 px-4 py-3 mt-2">
                  <p className="text-sm text-warm-muted">Start gathering receipts, invoices, photos, or records that show your losses. Documentation strengthens your case significantly.</p>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="ow-evidence-notes">Describe your evidence <span className="font-normal text-warm-muted">(optional)</span></Label>
              <Textarea id="ow-evidence-notes" placeholder="What documents, photos, or records do you have?" value={evidenceNotes} onChange={e => setEvidenceNotes(e.target.value)} rows={3} />
            </div>
          </div>
        )

      case 'how_to_file':
        return (
          <FilingMethodStep filingMethod={filingMethod} onFilingMethodChange={setFilingMethod} county={county} courtType={courtType} config={FILING_CONFIGS.other} state={caseData?.state} />
        )

      case 'review':
        return (
          <div className="space-y-6">
            <p className="text-sm text-warm-muted">Please review the information below. You can go back to any step to make changes.</p>
            <div className="rounded-lg border border-warm-border p-4 space-y-3">
              <h3 className="text-sm font-medium text-warm-text flex items-center gap-2"><FileText className="h-4 w-4 text-calm-indigo" />Your Information</h3>
              <dl className="space-y-2">
                <RR label="Name" value={yourName} />
                <RR label="Address" value={yourAddress} />
              </dl>
            </div>
            <div className="rounded-lg border border-warm-border p-4 space-y-3">
              <h3 className="text-sm font-medium text-warm-text">Other Party</h3>
              <dl className="space-y-2">
                <RR label="Name" value={otherPartyName} />
                <RR label="Type" value={PARTY_LABELS[otherPartyType]} />
              </dl>
            </div>
            <div className="rounded-lg border border-warm-border p-4 space-y-3">
              <h3 className="text-sm font-medium text-warm-text">Situation</h3>
              {briefDescription && <p className="text-sm text-warm-text font-medium">{briefDescription}</p>}
              <p className="text-sm text-warm-text">{disputeDescription || 'Not provided'}</p>
              {whenHappened && <RR label="Date" value={whenHappened} />}
            </div>
            <div className="rounded-lg border border-warm-border p-4 space-y-3">
              <h3 className="text-sm font-medium text-warm-text">Damages</h3>
              <dl className="space-y-2">
                <RR label="Amount" value={damagesSought ? `$${parseFloat(damagesSought).toLocaleString()}` : undefined} />
                {damagesDescription && <div><dt className="text-sm text-warm-muted">Details:</dt><dd className="text-sm text-warm-text mt-0.5">{damagesDescription}</dd></div>}
              </dl>
            </div>
            {(!yourName || !otherPartyName || !disputeDescription) && (
              <div className="rounded-lg border border-calm-amber bg-calm-amber/5 px-4 py-3 flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 text-calm-amber shrink-0 mt-0.5" />
                <p className="text-sm text-warm-muted">Some fields are incomplete. You can still generate a draft, but filling in the gaps will produce a stronger document.</p>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  /* ---- Draft phase ---- */

  if (draftPhase) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link href={`/case/${caseId}`} className="inline-flex items-center gap-1 text-sm text-warm-muted hover:text-warm-text mb-4"><ChevronLeft className="h-4 w-4" />Back to dashboard</Link>
        <h1 className="text-2xl font-semibold text-warm-text">Your Petition Draft</h1>
        <p className="text-sm text-warm-muted mt-1 mb-6">Review your draft below. You can edit it directly, regenerate it, or download a PDF.</p>
        {genError && <div className="rounded-lg border border-calm-amber bg-calm-amber/5 p-3 mb-4"><p className="text-sm text-warm-text">{genError}</p></div>}
        {draft ? (
          <>
            <AnnotatedDraftViewer draft={draft} annotations={annotations} onDraftChange={setDraft} onRegenerate={async () => { setDraftPhase(false); await generateDraft() }} regenerating={generating} acknowledged={acknowledged} onAcknowledgeChange={setAcknowledged} documentTitle="Civil Petition" />
            {acknowledged && (
              <div className="mt-6">
                <Button onClick={handleFinalConfirm} disabled={confirming} className="w-full" size="lg">
                  {confirming ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</>) : 'Confirm & Submit'}
                </Button>
                <p className="text-xs text-warm-muted text-center mt-2">This saves your document and marks this step as complete.</p>
              </div>
            )}
            <div className="mt-4">
              <button type="button" onClick={() => setDraftPhase(false)} className="text-sm text-warm-muted hover:text-warm-text transition-colors">Go back and edit my information</button>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3 py-12 justify-center"><Loader2 className="h-5 w-5 animate-spin text-warm-muted" /><p className="text-sm text-warm-muted">Generating your draft...</p></div>
        )}
      </div>
    )
  }

  /* ---- Wizard phase ---- */

  return (
    <WizardShell caseId={caseId} title="Prepare Your Petition" steps={STEPS} currentStep={currentStep} onStepChange={setCurrentStep} onSave={handleSave} onComplete={handleComplete} canAdvance={canAdvance} totalEstimateMinutes={15} completeButtonLabel={generating ? 'Generating...' : 'Generate My Petition'}>
      {generating ? (
        <div className="flex items-center gap-3 py-12 justify-center"><Loader2 className="h-5 w-5 animate-spin text-warm-muted" /><p className="text-sm text-warm-muted">Generating your petition... This may take a moment.</p></div>
      ) : renderStep()}
    </WizardShell>
  )
}

function RR({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex gap-2">
      <dt className="text-sm text-warm-muted min-w-[100px]">{label}:</dt>
      <dd className="text-sm text-warm-text">{value || 'Not provided'}</dd>
    </div>
  )
}
