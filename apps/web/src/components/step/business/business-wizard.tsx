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
import {
  BUSINESS_SUB_TYPES,
  BUSINESS_PARTNERSHIP_TYPES,
  BUSINESS_EMPLOYMENT_TYPES,
  BUSINESS_B2B_TYPES,
} from '@lawyer-free/shared/schemas/case'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface BusinessWizardProps {
  caseId: string
  taskId: string
  existingMetadata?: Record<string, unknown> | null
  businessDetails?: {
    business_sub_type?: string
    specific_dispute_type?: string
    business_name?: string
    other_party_name?: string
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
  { id: 'intake', title: 'About Your Dispute', subtitle: 'Tell us the basics about your business dispute.' },
  { id: 'details', title: 'Business Details', subtitle: 'Help us understand the business relationship.' },
  { id: 'dispute', title: 'What Happened', subtitle: 'Describe the dispute in your own words.' },
  { id: 'damages', title: 'Your Losses', subtitle: 'Financial impact and other harm.' },
  { id: 'evidence', title: 'Your Evidence', subtitle: 'What documents do you have?' },
  { id: 'legal_basis', title: 'Legal Basis', subtitle: 'What claims apply to your situation.' },
  { id: 'how_to_file', title: 'How to File', subtitle: 'Choose how you want to submit your petition.' },
  { id: 'review', title: 'Review Everything', subtitle: 'Check your information before generating.' },
]

/* ------------------------------------------------------------------ */
/*  Labels                                                             */
/* ------------------------------------------------------------------ */

const SUB_TYPE_LABELS: Record<string, string> = {
  partnership: 'Partnership / LLC dispute',
  employment: 'Employment dispute',
  b2b_commercial: 'Business-to-business (B2B) dispute',
}

const SPECIFIC_TYPE_LABELS: Record<string, string> = {
  breach_fiduciary: 'Breach of fiduciary duty',
  profit_loss: 'Profit / loss dispute',
  dissolution_buyout: 'Dissolution or buyout',
  management_deadlock: 'Management deadlock',
  wrongful_termination: 'Wrongful termination',
  wage_overtime: 'Wage and overtime',
  non_compete_nda: 'Non-compete / NDA violation',
  discrimination_harassment: 'Discrimination or harassment',
  vendor_service: 'Vendor or service dispute',
  ip_trade_secret: 'IP or trade secret',
  unfair_competition: 'Unfair competition',
  breach_of_contract: 'Breach of contract',
}

const LEGAL_BASIS_OPTIONS = [
  { value: 'breach_of_contract', label: 'Breach of Contract', desc: 'The other party failed to fulfill their obligations under an agreement.' },
  { value: 'breach_fiduciary', label: 'Breach of Fiduciary Duty', desc: 'A partner, officer, or director violated their duty of loyalty or care.' },
  { value: 'fraud', label: 'Fraud or Misrepresentation', desc: 'You were deceived or misled in a business transaction.' },
  { value: 'partnership_dispute', label: 'Partnership Dispute', desc: 'Disagreements over management, profits, or dissolution.' },
  { value: 'employment_claim', label: 'Employment Claim', desc: 'Wrongful termination, wage disputes, discrimination, or harassment.' },
  { value: 'unfair_competition', label: 'Unfair Business Practices', desc: 'Anti-competitive behavior, trade secret theft, or tortious interference.' },
]

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function BusinessWizard({
  caseId,
  taskId,
  existingMetadata,
  businessDetails,
  caseData,
}: BusinessWizardProps) {
  const router = useRouter()
  const meta = (existingMetadata ?? {}) as Record<string, unknown>
  const totalEstimateMinutes = 25

  /* ---- Intake ---- */
  const [businessSubType, setBusinessSubType] = useState<string>(
    (meta.business_sub_type as string) ?? businessDetails?.business_sub_type ?? ''
  )
  const [specificDisputeType, setSpecificDisputeType] = useState<string>(
    (meta.specific_dispute_type as string) ?? businessDetails?.specific_dispute_type ?? ''
  )
  const [yourName, setYourName] = useState<string>((meta.your_name as string) ?? '')
  const [yourAddress, setYourAddress] = useState<string>((meta.your_address as string) ?? '')
  const [otherPartyName, setOtherPartyName] = useState<string>(
    (meta.other_party_name as string) ?? businessDetails?.other_party_name ?? ''
  )
  const [businessName, setBusinessName] = useState<string>(
    (meta.business_name as string) ?? businessDetails?.business_name ?? ''
  )
  const [entityType, setEntityType] = useState<string>((meta.entity_type as string) ?? '')

  /* ---- Business Details ---- */
  const [relationshipDescription, setRelationshipDescription] = useState<string>(
    (meta.relationship_description as string) ?? ''
  )
  const [hasWrittenAgreement, setHasWrittenAgreement] = useState<boolean>(
    (meta.has_written_agreement as boolean) ?? false
  )
  const [agreementDate, setAgreementDate] = useState<string>((meta.agreement_date as string) ?? '')
  const [relationshipStartDate, setRelationshipStartDate] = useState<string>(
    (meta.relationship_start_date as string) ?? ''
  )
  const [breachDate, setBreachDate] = useState<string>((meta.breach_date as string) ?? '')

  /* ---- Dispute Description ---- */
  const [disputeDescription, setDisputeDescription] = useState<string>(
    (meta.dispute_description as string) ?? businessDetails?.dispute_description ?? ''
  )
  const [whatWasBreached, setWhatWasBreached] = useState<string>(
    (meta.what_was_breached as string) ?? ''
  )

  /* ---- Damages ---- */
  const [damagesSought, setDamagesSought] = useState<string>(
    (meta.damages_sought as string) ??
      (businessDetails?.damages_sought != null ? String(businessDetails.damages_sought) : '')
  )
  const [lostProfits, setLostProfits] = useState<string>((meta.lost_profits as string) ?? '')
  const [otherHarm, setOtherHarm] = useState<string>((meta.other_harm as string) ?? '')

  /* ---- Evidence ---- */
  const [hasContracts, setHasContracts] = useState<boolean>((meta.has_contracts as boolean) ?? false)
  const [hasFinancialRecords, setHasFinancialRecords] = useState<boolean>((meta.has_financial_records as boolean) ?? false)
  const [hasCommunications, setHasCommunications] = useState<boolean>((meta.has_communications as boolean) ?? false)
  const [hasCorporateDocs, setHasCorporateDocs] = useState<boolean>((meta.has_corporate_docs as boolean) ?? false)
  const [evidenceNotes, setEvidenceNotes] = useState<string>((meta.evidence_notes as string) ?? '')

  /* ---- Legal Basis ---- */
  const [selectedClaims, setSelectedClaims] = useState<string[]>(
    (meta.selected_claims as string[]) ?? []
  )

  /* ---- Venue ---- */
  const [county, setCounty] = useState<string>((meta.county as string) ?? caseData?.county ?? '')
  const [courtType, setCourtType] = useState<string>(
    (meta.court_type as string) ?? caseData?.court_type ?? ''
  )

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

  /* ---- Helpers ---- */

  function specificTypesForSubType(): { value: string; label: string }[] {
    switch (businessSubType) {
      case 'partnership':
        return BUSINESS_PARTNERSHIP_TYPES.map(v => ({ value: v, label: SPECIFIC_TYPE_LABELS[v] ?? v }))
      case 'employment':
        return BUSINESS_EMPLOYMENT_TYPES.map(v => ({ value: v, label: SPECIFIC_TYPE_LABELS[v] ?? v }))
      case 'b2b_commercial':
        return BUSINESS_B2B_TYPES.map(v => ({ value: v, label: SPECIFIC_TYPE_LABELS[v] ?? v }))
      default:
        return []
    }
  }

  function filingConfigKey(): string {
    if (businessSubType === 'partnership') return 'partnership'
    if (businessSubType === 'employment') return 'employment'
    return 'b2b_commercial'
  }

  const toggleClaim = (v: string) => {
    setSelectedClaims(prev =>
      prev.includes(v) ? prev.filter(c => c !== v) : [...prev, v]
    )
  }

  /* ---- Build helpers ---- */

  const buildFacts = useCallback(() => {
    const parsedDamages = parseFloat(damagesSought) || 0
    const parsedLostProfits = parseFloat(lostProfits) || 0

    return {
      your_info: { full_name: yourName, address: yourAddress || undefined },
      opposing_party: { full_name: otherPartyName },
      business_name: businessName || undefined,
      entity_type: entityType || undefined,
      business_sub_type: businessSubType,
      specific_dispute_type: specificDisputeType || undefined,
      court_type: courtType || undefined,
      county: county || '',
      relationship_description: relationshipDescription || undefined,
      has_written_agreement: hasWrittenAgreement,
      agreement_date: agreementDate || undefined,
      relationship_start_date: relationshipStartDate || undefined,
      breach_date: breachDate || undefined,
      dispute_description: disputeDescription,
      what_was_breached: whatWasBreached || undefined,
      damages_sought: parsedDamages,
      lost_profits: parsedLostProfits || undefined,
      other_harm: otherHarm || undefined,
      selected_claims: selectedClaims,
      evidence: {
        contracts: hasContracts,
        financial_records: hasFinancialRecords,
        communications: hasCommunications,
        corporate_docs: hasCorporateDocs,
        notes: evidenceNotes || undefined,
      },
      description:
        `Business dispute (${SUB_TYPE_LABELS[businessSubType] || businessSubType}). ` +
        `Other party: ${otherPartyName}. ` +
        `Damages sought: $${parsedDamages.toFixed(2)}.`,
    }
  }, [
    yourName, yourAddress, otherPartyName, businessName, entityType,
    businessSubType, specificDisputeType, courtType, county,
    relationshipDescription, hasWrittenAgreement, agreementDate,
    relationshipStartDate, breachDate, disputeDescription, whatWasBreached,
    damagesSought, lostProfits, otherHarm, selectedClaims,
    hasContracts, hasFinancialRecords, hasCommunications, hasCorporateDocs, evidenceNotes,
  ])

  const buildMetadata = useCallback(() => ({
    business_sub_type: businessSubType || null,
    specific_dispute_type: specificDisputeType || null,
    your_name: yourName || null,
    your_address: yourAddress || null,
    other_party_name: otherPartyName || null,
    business_name: businessName || null,
    entity_type: entityType || null,
    relationship_description: relationshipDescription || null,
    has_written_agreement: hasWrittenAgreement,
    agreement_date: agreementDate || null,
    relationship_start_date: relationshipStartDate || null,
    breach_date: breachDate || null,
    dispute_description: disputeDescription || null,
    what_was_breached: whatWasBreached || null,
    damages_sought: damagesSought || null,
    lost_profits: lostProfits || null,
    other_harm: otherHarm || null,
    has_contracts: hasContracts,
    has_financial_records: hasFinancialRecords,
    has_communications: hasCommunications,
    has_corporate_docs: hasCorporateDocs,
    evidence_notes: evidenceNotes || null,
    selected_claims: selectedClaims,
    county: county || null,
    court_type: courtType || null,
    draft_text: draft || null,
    final_text: draft || null,
    annotations,
    filing_method: filingMethod || null,
    _wizard_step: currentStep,
  }), [
    businessSubType, specificDisputeType, yourName, yourAddress,
    otherPartyName, businessName, entityType,
    relationshipDescription, hasWrittenAgreement, agreementDate,
    relationshipStartDate, breachDate, disputeDescription, whatWasBreached,
    damagesSought, lostProfits, otherHarm,
    hasContracts, hasFinancialRecords, hasCommunications, hasCorporateDocs, evidenceNotes,
    selectedClaims, county, courtType, draft, annotations, filingMethod, currentStep,
  ])

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
        body: JSON.stringify({ document_type: 'business_petition', facts: buildFacts() }),
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
      case 'intake':
        return businessSubType !== '' && yourName.trim() !== '' && otherPartyName.trim() !== ''
      case 'details':
        return true
      case 'dispute':
        return disputeDescription.trim().length >= 10
      case 'damages':
        return true
      case 'evidence':
        return true
      case 'legal_basis':
        return selectedClaims.length > 0
      case 'how_to_file':
        return filingMethod !== ''
      case 'review':
        return true
      default:
        return true
    }
  }, [currentStep, businessSubType, yourName, otherPartyName, disputeDescription, selectedClaims, filingMethod])

  /* ---- Step rendering ---- */

  function renderStep() {
    const stepId = STEPS[currentStep]?.id
    switch (stepId) {
      case 'intake':
        return (
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="bw-your-name">Your full name</Label>
              <Input id="bw-your-name" placeholder="Your legal name" value={yourName} onChange={e => setYourName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bw-your-address">Your address <span className="font-normal text-warm-muted">(optional)</span></Label>
              <Input id="bw-your-address" placeholder="Street, city, state, ZIP" value={yourAddress} onChange={e => setYourAddress(e.target.value)} />
            </div>

            <div className="border-t border-warm-border pt-5 space-y-5">
              <div className="space-y-2">
                <Label>Type of business dispute</Label>
                <Select value={businessSubType} onValueChange={v => { setBusinessSubType(v); setSpecificDisputeType('') }}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Select dispute type" /></SelectTrigger>
                  <SelectContent>
                    {BUSINESS_SUB_TYPES.map(t => (
                      <SelectItem key={t} value={t}>{SUB_TYPE_LABELS[t] ?? t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {businessSubType && specificTypesForSubType().length > 0 && (
                <div className="space-y-2">
                  <Label>Specific issue</Label>
                  <Select value={specificDisputeType} onValueChange={setSpecificDisputeType}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="Select specific issue" /></SelectTrigger>
                    <SelectContent>
                      {specificTypesForSubType().map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="bw-other-party">Other party&apos;s name</Label>
                <Input id="bw-other-party" placeholder="Person, company, or organization" value={otherPartyName} onChange={e => setOtherPartyName(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bw-biz-name">Business or entity name <span className="font-normal text-warm-muted">(if applicable)</span></Label>
                <Input id="bw-biz-name" placeholder="e.g. Smith & Jones Partners, LLC" value={businessName} onChange={e => setBusinessName(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Entity type <span className="font-normal text-warm-muted">(optional)</span></Label>
                <Select value={entityType} onValueChange={setEntityType}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Select entity type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="partnership">Partnership</SelectItem>
                    <SelectItem value="llc">LLC</SelectItem>
                    <SelectItem value="corporation">Corporation</SelectItem>
                    <SelectItem value="sole_proprietorship">Sole proprietorship</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )

      case 'details':
        return (
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="bw-relationship">Nature of the business relationship</Label>
              <Textarea id="bw-relationship" placeholder="How do you know the other party? What was the arrangement?" value={relationshipDescription} onChange={e => setRelationshipDescription(e.target.value)} rows={3} />
              <p className="text-xs text-warm-muted">For example: business partners, employer-employee, vendor-client.</p>
            </div>

            <div className="space-y-2">
              <label className="flex items-start gap-3 cursor-pointer rounded-lg border border-warm-border p-3 hover:bg-warm-bg/50 transition-colors">
                <input type="checkbox" checked={hasWrittenAgreement} onChange={e => setHasWrittenAgreement(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 rounded border-warm-border text-calm-indigo focus:ring-calm-indigo" />
                <div>
                  <span className="text-sm text-warm-text">There is a written agreement or contract</span>
                  <p className="text-xs text-warm-muted mt-0.5">Partnership agreement, employment contract, service agreement, etc.</p>
                </div>
              </label>
            </div>

            {hasWrittenAgreement && (
              <div className="space-y-2">
                <Label htmlFor="bw-agree-date">Agreement date <span className="font-normal text-warm-muted">(optional)</span></Label>
                <Input id="bw-agree-date" type="date" value={agreementDate} onChange={e => setAgreementDate(e.target.value)} />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="bw-rel-start">When did the relationship begin? <span className="font-normal text-warm-muted">(optional)</span></Label>
              <Input id="bw-rel-start" type="date" value={relationshipStartDate} onChange={e => setRelationshipStartDate(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bw-breach-date">When did the problem start? <span className="font-normal text-warm-muted">(optional)</span></Label>
              <Input id="bw-breach-date" type="date" value={breachDate} onChange={e => setBreachDate(e.target.value)} />
            </div>
          </div>
        )

      case 'dispute':
        return (
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="bw-dispute-desc">What happened?</Label>
              <Textarea id="bw-dispute-desc" placeholder="Describe the dispute in your own words. Focus on facts: who did what, when, and what resulted." value={disputeDescription} onChange={e => setDisputeDescription(e.target.value)} rows={5} />
              <p className="text-xs text-warm-muted">Take your time. The more detail, the stronger your petition.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bw-breached">What was violated or breached? <span className="font-normal text-warm-muted">(optional)</span></Label>
              <Textarea id="bw-breached" placeholder="Which terms, duties, or obligations were not honored?" value={whatWasBreached} onChange={e => setWhatWasBreached(e.target.value)} rows={3} />
            </div>
          </div>
        )

      case 'damages':
        return (
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="bw-damages">Total financial losses ($)</Label>
              <Input id="bw-damages" type="number" min="0" step="0.01" placeholder="0.00" value={damagesSought} onChange={e => setDamagesSought(e.target.value)} />
              <p className="text-xs text-warm-muted">Include direct losses, unpaid amounts, and other monetary damages.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bw-lost-profits">Lost profits ($) <span className="font-normal text-warm-muted">(optional)</span></Label>
              <Input id="bw-lost-profits" type="number" min="0" step="0.01" placeholder="0.00" value={lostProfits} onChange={e => setLostProfits(e.target.value)} />
              <p className="text-xs text-warm-muted">Revenue you would have earned but for the other party&apos;s actions.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bw-other-harm">Other harm <span className="font-normal text-warm-muted">(optional)</span></Label>
              <Textarea id="bw-other-harm" placeholder="Reputational damage, loss of business opportunities, emotional distress..." value={otherHarm} onChange={e => setOtherHarm(e.target.value)} rows={3} />
            </div>
          </div>
        )

      case 'evidence':
        return (
          <div className="space-y-5">
            <p className="text-sm text-warm-muted">Check all documents you have available. This helps us reference the right evidence in your petition.</p>
            {[
              { key: 'contracts', label: 'Contracts or agreements', desc: 'Written contracts, partnership agreements, employment agreements, NDAs.', checked: hasContracts, set: setHasContracts },
              { key: 'financial', label: 'Financial records', desc: 'Invoices, bank statements, profit/loss reports, tax returns.', checked: hasFinancialRecords, set: setHasFinancialRecords },
              { key: 'comms', label: 'Communications', desc: 'Emails, texts, letters, or meeting notes about the dispute.', checked: hasCommunications, set: setHasCommunications },
              { key: 'corporate', label: 'Corporate documents', desc: 'Articles of incorporation, operating agreements, board minutes.', checked: hasCorporateDocs, set: setHasCorporateDocs },
            ].map(item => (
              <label key={item.key} className="flex items-start gap-3 cursor-pointer rounded-lg border border-warm-border p-3 hover:bg-warm-bg/50 transition-colors">
                <input type="checkbox" checked={item.checked} onChange={e => item.set(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 rounded border-warm-border text-calm-indigo focus:ring-calm-indigo" />
                <div>
                  <span className="text-sm text-warm-text">{item.label}</span>
                  <p className="text-xs text-warm-muted mt-0.5">{item.desc}</p>
                </div>
              </label>
            ))}
            <div className="space-y-2">
              <Label htmlFor="bw-evidence-notes">Additional notes about evidence <span className="font-normal text-warm-muted">(optional)</span></Label>
              <Textarea id="bw-evidence-notes" placeholder="Anything else about your evidence that might be relevant..." value={evidenceNotes} onChange={e => setEvidenceNotes(e.target.value)} rows={2} />
            </div>
          </div>
        )

      case 'legal_basis':
        return (
          <div className="space-y-5">
            <p className="text-sm text-warm-muted">Select all claims that apply to your situation. It is okay to choose more than one.</p>
            {LEGAL_BASIS_OPTIONS.map(o => (
              <label key={o.value} className={`flex items-start gap-3 cursor-pointer rounded-lg border p-3 transition-colors ${selectedClaims.includes(o.value) ? 'border-calm-indigo bg-calm-indigo/5' : 'border-warm-border hover:bg-warm-bg/50'}`}>
                <input type="checkbox" checked={selectedClaims.includes(o.value)} onChange={() => toggleClaim(o.value)} className="mt-0.5 h-4 w-4 shrink-0 rounded border-warm-border text-calm-indigo focus:ring-calm-indigo" />
                <div><span className="text-sm font-medium text-warm-text">{o.label}</span><p className="text-xs text-warm-muted mt-0.5">{o.desc}</p></div>
              </label>
            ))}
          </div>
        )

      case 'how_to_file':
        return (
          <FilingMethodStep
            filingMethod={filingMethod}
            onFilingMethodChange={setFilingMethod}
            county={county}
            courtType={courtType}
            config={FILING_CONFIGS[filingConfigKey()] ?? FILING_CONFIGS.civil}
            state={caseData?.state}
          />
        )

      case 'review': {
        const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
          <div className="rounded-lg border border-warm-border p-4 space-y-3">
            <h3 className="text-sm font-medium text-warm-text">{title}</h3>{children}
          </div>
        )
        return (
          <div className="space-y-5">
            <p className="text-sm text-warm-muted">Please review the information below. You can go back to any step to make changes.</p>
            <Section title="Your Information"><dl className="space-y-2"><ReviewRow label="Name" value={yourName} /><ReviewRow label="Address" value={yourAddress} /></dl></Section>
            <Section title="Business Dispute"><dl className="space-y-2">
              <ReviewRow label="Type" value={SUB_TYPE_LABELS[businessSubType]} />
              <ReviewRow label="Specific issue" value={SPECIFIC_TYPE_LABELS[specificDisputeType]} />
              <ReviewRow label="Other party" value={otherPartyName} />
              <ReviewRow label="Business name" value={businessName} />
              {hasWrittenAgreement && <ReviewRow label="Agreement date" value={agreementDate} />}
              <ReviewRow label="Breach date" value={breachDate} />
            </dl></Section>
            <Section title="Description"><p className="text-sm text-warm-text">{disputeDescription || 'Not provided'}</p></Section>
            <Section title="Damages"><dl className="space-y-2">
              <ReviewRow label="Financial losses" value={damagesSought ? `$${parseFloat(damagesSought).toLocaleString()}` : undefined} />
              <ReviewRow label="Lost profits" value={lostProfits ? `$${parseFloat(lostProfits).toLocaleString()}` : undefined} />
              <ReviewRow label="Other harm" value={otherHarm} />
            </dl></Section>
            <Section title="Legal Claims">
              {selectedClaims.length > 0
                ? <ul className="space-y-1">{selectedClaims.map(c => (<li key={c} className="text-sm text-warm-text flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-calm-green shrink-0" />{LEGAL_BASIS_OPTIONS.find(o => o.value === c)?.label ?? c}</li>))}</ul>
                : <p className="text-sm text-warm-muted">None selected</p>}
            </Section>
            {(!yourName || !otherPartyName || !disputeDescription) && (
              <div className="rounded-lg border border-calm-amber bg-calm-amber/5 px-4 py-3 flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 text-calm-amber shrink-0 mt-0.5" />
                <p className="text-sm text-warm-muted">Some fields are incomplete. You can still generate a draft, but filling in the gaps will produce a stronger document.</p>
              </div>
            )}
          </div>
        )
      }

      default:
        return null
    }
  }

  /* ---- Draft phase ---- */

  if (draftPhase) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link href={`/case/${caseId}`} className="inline-flex items-center gap-1 text-sm text-warm-muted hover:text-warm-text mb-4"><ChevronLeft className="h-4 w-4" />Back to dashboard</Link>
        <h1 className="text-2xl font-semibold text-warm-text">Your Business Petition Draft</h1>
        <p className="text-sm text-warm-muted mt-1 mb-6">Review your draft below. You can edit it directly, regenerate it, or download a PDF.</p>
        {genError && <div className="rounded-lg border border-calm-amber bg-calm-amber/5 p-3 mb-4"><p className="text-sm text-warm-text">{genError}</p></div>}
        {draft ? (
          <>
            <AnnotatedDraftViewer draft={draft} annotations={annotations} onDraftChange={setDraft} onRegenerate={async () => { setDraftPhase(false); await generateDraft() }} regenerating={generating} acknowledged={acknowledged} onAcknowledgeChange={setAcknowledged} documentTitle="Business Petition" />
            {acknowledged && (
              <div className="mt-6">
                <Button onClick={handleFinalConfirm} disabled={confirming} className="w-full" size="lg">
                  {confirming ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</>) : 'Confirm & Submit'}
                </Button>
                <p className="text-xs text-warm-muted text-center mt-2">This saves your document and marks this step as complete.</p>
              </div>
            )}
            <div className="mt-4"><button type="button" onClick={() => setDraftPhase(false)} className="text-sm text-warm-muted hover:text-warm-text transition-colors">Go back and edit my information</button></div>
          </>
        ) : (
          <div className="flex items-center gap-3 py-12 justify-center"><Loader2 className="h-5 w-5 animate-spin text-warm-muted" /><p className="text-sm text-warm-muted">Generating your draft...</p></div>
        )}
      </div>
    )
  }

  /* ---- Wizard phase ---- */

  return (
    <WizardShell caseId={caseId} title="Prepare Your Business Petition" steps={STEPS} currentStep={currentStep} onStepChange={setCurrentStep} onSave={handleSave} onComplete={handleComplete} canAdvance={canAdvance} totalEstimateMinutes={totalEstimateMinutes} completeButtonLabel={generating ? 'Generating...' : 'Generate My Petition'}>
      {generating ? (
        <div className="flex items-center gap-3 py-12 justify-center"><Loader2 className="h-5 w-5 animate-spin text-warm-muted" /><p className="text-sm text-warm-muted">Generating your petition... This may take a moment.</p></div>
      ) : renderStep()}
    </WizardShell>
  )
}

/* ---- Review row helper ---- */

function ReviewRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex gap-2">
      <dt className="text-sm text-warm-muted min-w-[120px]">{label}:</dt>
      <dd className="text-sm text-warm-text">{value || 'Not provided'}</dd>
    </div>
  )
}
