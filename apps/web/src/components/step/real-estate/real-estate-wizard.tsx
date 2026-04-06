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
import { ChevronLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { FilingMethodStep } from '@/components/step/filing-method-step'
import { FILING_CONFIGS } from '@/lib/filing-configs'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface RealEstateWizardProps {
  caseId: string
  taskId: string
  existingMetadata?: Record<string, unknown> | null
  reDetails?: {
    property_address: string | null
    property_type: string | null
    purchase_price: number | null
    other_party_name: string | null
    other_party_role: string | null
    dispute_description: string | null
    damages_sought: number | null
    transaction_date: string | null
    has_purchase_agreement: boolean
    has_title_insurance: boolean
    has_inspection_report: boolean
  } | null
  caseData?: { county: string | null; court_type: string; state?: string }
}

/* ------------------------------------------------------------------ */
/*  Steps                                                              */
/* ------------------------------------------------------------------ */

const STEPS: WizardStep[] = [
  { id: 'intake', title: 'Property & Parties', subtitle: 'Tell us about the property and who is involved.' },
  { id: 'transaction', title: 'Transaction Details', subtitle: 'Purchase price, closing date, and inspection findings.' },
  { id: 'dispute', title: 'What Went Wrong', subtitle: 'Describe the issues with the transaction or property.' },
  { id: 'damages', title: 'Your Losses', subtitle: 'Financial losses, repair costs, and diminished value.' },
  { id: 'evidence', title: 'Your Evidence', subtitle: 'Contracts, reports, and other proof.' },
  { id: 'legal_basis', title: 'Legal Basis', subtitle: 'The legal grounds for your claim.' },
  { id: 'how_to_file', title: 'How to File', subtitle: 'Choose how to submit your document.' },
  { id: 'review', title: 'Review Everything', subtitle: 'Check your information before generating.' },
]

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function RealEstateWizard({
  caseId,
  taskId,
  existingMetadata,
  reDetails,
  caseData,
}: RealEstateWizardProps) {
  const router = useRouter()
  const meta = (existingMetadata ?? {}) as Record<string, unknown>
  const totalEstimateMinutes = 30

  /* ---- Intake ---- */
  const [propertyAddress, setPropertyAddress] = useState((meta.property_address as string) ?? reDetails?.property_address ?? '')
  const [transactionType, setTransactionType] = useState((meta.transaction_type as string) ?? 'sale')
  const [county, setCounty] = useState((meta.county as string) ?? caseData?.county ?? '')
  const [otherPartyName, setOtherPartyName] = useState((meta.other_party_name as string) ?? reDetails?.other_party_name ?? '')
  const [otherPartyRole, setOtherPartyRole] = useState((meta.other_party_role as string) ?? reDetails?.other_party_role ?? 'seller')
  const [contractDate, setContractDate] = useState((meta.contract_date as string) ?? '')
  const [closingDate, setClosingDate] = useState((meta.closing_date as string) ?? reDetails?.transaction_date ?? '')
  /* ---- Transaction ---- */
  const [purchasePrice, setPurchasePrice] = useState((meta.purchase_price as string) ?? (reDetails?.purchase_price != null ? String(reDetails.purchase_price) : ''))
  const [inspectionFindings, setInspectionFindings] = useState((meta.inspection_findings as string) ?? '')
  const [titleIssues, setTitleIssues] = useState((meta.title_issues as string) ?? '')
  const [earnestMoney, setEarnestMoney] = useState((meta.earnest_money as string) ?? '')
  /* ---- Dispute ---- */
  const [disputeCategory, setDisputeCategory] = useState((meta.dispute_category as string) ?? 'defects')
  const [disputeDescription, setDisputeDescription] = useState((meta.dispute_description as string) ?? reDetails?.dispute_description ?? '')
  const [priorAttempts, setPriorAttempts] = useState((meta.prior_attempts as string) ?? '')
  /* ---- Damages ---- */
  const [financialLosses, setFinancialLosses] = useState((meta.financial_losses as string) ?? '')
  const [repairCosts, setRepairCosts] = useState((meta.repair_costs as string) ?? '')
  const [diminishedValue, setDiminishedValue] = useState((meta.diminished_value as string) ?? '')
  const [otherDamages, setOtherDamages] = useState((meta.other_damages as string) ?? '')
  /* ---- Evidence ---- */
  const [hasContract, setHasContract] = useState((meta.has_contract as boolean) ?? reDetails?.has_purchase_agreement ?? false)
  const [hasInspectionReport, setHasInspectionReport] = useState((meta.has_inspection_report as boolean) ?? reDetails?.has_inspection_report ?? false)
  const [hasTitleDocs, setHasTitleDocs] = useState((meta.has_title_docs as boolean) ?? false)
  const [hasTitleInsurance, setHasTitleInsurance] = useState((meta.has_title_insurance as boolean) ?? reDetails?.has_title_insurance ?? false)
  const [hasCommunications, setHasCommunications] = useState((meta.has_communications as boolean) ?? false)
  const [hasDisclosures, setHasDisclosures] = useState((meta.has_disclosures as boolean) ?? false)
  const [evidenceNotes, setEvidenceNotes] = useState((meta.evidence_notes as string) ?? '')
  /* ---- Legal / Filing / Draft ---- */
  const [selectedBases, setSelectedBases] = useState<string[]>((meta.selected_bases as string[]) ?? [])
  const [filingMethod, setFilingMethod] = useState<'online' | 'in_person' | ''>((meta.filing_method as 'online' | 'in_person' | '') ?? '')
  const [documentType, setDocumentType] = useState<'demand_letter' | 'petition'>((meta.document_type as 'demand_letter' | 'petition') ?? 'demand_letter')
  const [currentStep, setCurrentStep] = useState(typeof meta._wizard_step === 'number' ? meta._wizard_step : 0)
  const [draft, setDraft] = useState<string>((meta.draft_text as string) ?? '')
  const [annotations, setAnnotations] = useState<DraftAnnotation[]>((meta.annotations as DraftAnnotation[]) ?? [])
  const [acknowledged, setAcknowledged] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState<string | null>(null)
  const [draftPhase, setDraftPhase] = useState(false)
  const [confirming, setConfirming] = useState(false)

  /* ---- Computed ---- */
  const inputCls = 'flex h-9 w-full rounded-md border border-warm-border bg-transparent px-3 py-1 text-sm text-warm-text shadow-xs placeholder:text-warm-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-calm-indigo'
  const moneyInputCls = 'flex h-9 w-full rounded-md border border-warm-border bg-transparent pl-7 pr-3 py-1 text-sm text-warm-text shadow-xs placeholder:text-warm-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-calm-indigo'
  const textareaCls = 'flex min-h-[60px] w-full rounded-md border border-warm-border bg-transparent px-3 py-2 text-sm text-warm-text shadow-xs placeholder:text-warm-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-calm-indigo'
  const radioActive = 'border-calm-indigo bg-calm-indigo/5'
  const radioInactive = 'border-warm-border hover:bg-warm-bg/50'

  const totalDamages = useMemo(() => (parseFloat(financialLosses) || 0) + (parseFloat(repairCosts) || 0) + (parseFloat(diminishedValue) || 0) + (parseFloat(otherDamages) || 0), [financialLosses, repairCosts, diminishedValue, otherDamages])
  const fmt = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(v)

  const DISPUTE_CATEGORIES: { value: string; label: string; desc: string }[] = [
    { value: 'defects', label: 'Property defects', desc: 'Hidden or undisclosed defects.' },
    { value: 'non_disclosure', label: 'Non-disclosure', desc: 'Seller failed to disclose known issues.' },
    { value: 'title_cloud', label: 'Title cloud or defect', desc: 'Liens, encumbrances, or ownership disputes.' },
    { value: 'hoa_violation', label: 'HOA violation', desc: 'Homeowners association dispute.' },
    { value: 'failed_closing', label: 'Failed closing', desc: 'Transaction failed to close as agreed.' },
    { value: 'earnest_money', label: 'Earnest money dispute', desc: 'Disagreement over earnest money.' },
    { value: 'other', label: 'Other', desc: 'Another type of dispute.' },
  ]
  const LEGAL_BASES: { value: string; label: string; desc: string }[] = [
    { value: 'breach_of_contract', label: 'Breach of contract', desc: 'The other party broke the agreement terms.' },
    { value: 'fraud_non_disclosure', label: 'Fraud / Non-disclosure', desc: 'Material facts were concealed or misrepresented.' },
    { value: 'dtpa_violation', label: 'DTPA violation', desc: 'Deceptive Trade Practices Act violation (Texas).' },
    { value: 'specific_performance', label: 'Specific performance', desc: 'Court order to complete the transaction.' },
    { value: 'negligence', label: 'Negligence', desc: 'Failure to meet duty of care.' },
    { value: 'unjust_enrichment', label: 'Unjust enrichment', desc: 'Unfairly enriched at your expense.' },
  ]

  /* ---- Build helpers ---- */

  const buildFacts = useCallback(() => {
    const damagesBreakdown: { category: string; amount: number }[] = []
    const fl = parseFloat(financialLosses) || 0
    const rc = parseFloat(repairCosts) || 0
    const dv = parseFloat(diminishedValue) || 0
    const od = parseFloat(otherDamages) || 0
    if (fl > 0) damagesBreakdown.push({ category: 'Financial losses', amount: fl })
    if (rc > 0) damagesBreakdown.push({ category: 'Repair costs', amount: rc })
    if (dv > 0) damagesBreakdown.push({ category: 'Diminished value', amount: dv })
    if (od > 0) damagesBreakdown.push({ category: 'Other damages', amount: od })
    if (damagesBreakdown.length === 0) damagesBreakdown.push({ category: 'Real estate damages', amount: 0.01 })

    const fullDescription = [
      disputeDescription,
      inspectionFindings ? `Inspection findings: ${inspectionFindings}` : null,
      titleIssues ? `Title issues: ${titleIssues}` : null,
      priorAttempts ? `Prior resolution attempts: ${priorAttempts}` : null,
    ].filter(Boolean).join('\n\n')

    return {
      plaintiff: { full_name: '[Your Name]' },
      defendant: { full_name: otherPartyName || 'Unknown Defendant' },
      defendant_is_business: otherPartyRole === 'title_company' || otherPartyRole === 'builder' || otherPartyRole === 'agent',
      property_address: propertyAddress || '(Not provided)',
      transaction_type: transactionType,
      dispute_category: disputeCategory,
      dispute_description: disputeDescription || '(Not provided)',
      legal_bases: selectedBases,
      damages_breakdown: damagesBreakdown,
      damages_total: totalDamages > 0 ? totalDamages : 0.01,
      purchase_price: parseFloat(purchasePrice) || undefined,
      earnest_money: parseFloat(earnestMoney) || undefined,
      county: county || '(Not provided)',
      court_type: caseData?.court_type || 'district',
      description: fullDescription || '(Not provided)',
      demand_letter_sent: documentType === 'petition',
      seeks_injunctive_relief: selectedBases.includes('specific_performance'),
      contract_date: contractDate || undefined,
      closing_date: closingDate || undefined,
    }
  }, [
    financialLosses, repairCosts, diminishedValue, otherDamages,
    disputeDescription, inspectionFindings, titleIssues, priorAttempts,
    otherPartyName, otherPartyRole, propertyAddress, transactionType,
    disputeCategory, selectedBases, totalDamages, purchasePrice,
    earnestMoney, county, caseData, documentType, contractDate, closingDate,
  ])

  const buildMetadata = useCallback(() => ({
    property_address: propertyAddress || null,
    transaction_type: transactionType,
    county: county || null,
    other_party_name: otherPartyName || null,
    other_party_role: otherPartyRole,
    contract_date: contractDate || null,
    closing_date: closingDate || null,
    purchase_price: purchasePrice || null,
    inspection_findings: inspectionFindings || null,
    title_issues: titleIssues || null,
    earnest_money: earnestMoney || null,
    dispute_category: disputeCategory,
    dispute_description: disputeDescription || null,
    prior_attempts: priorAttempts || null,
    financial_losses: financialLosses || null,
    repair_costs: repairCosts || null,
    diminished_value: diminishedValue || null,
    other_damages: otherDamages || null,
    total_damages: totalDamages,
    has_contract: hasContract,
    has_inspection_report: hasInspectionReport,
    has_title_docs: hasTitleDocs,
    has_title_insurance: hasTitleInsurance,
    has_communications: hasCommunications,
    has_disclosures: hasDisclosures,
    evidence_notes: evidenceNotes || null,
    selected_bases: selectedBases,
    document_type: documentType,
    filing_method: filingMethod || null,
    draft_text: draft || null,
    final_text: draft || null,
    annotations,
    _wizard_step: currentStep,
  }), [
    propertyAddress, transactionType, county, otherPartyName, otherPartyRole,
    contractDate, closingDate, purchasePrice, inspectionFindings, titleIssues,
    earnestMoney, disputeCategory, disputeDescription, priorAttempts,
    financialLosses, repairCosts, diminishedValue, otherDamages, totalDamages,
    hasContract, hasInspectionReport, hasTitleDocs, hasTitleInsurance,
    hasCommunications, hasDisclosures, evidenceNotes, selectedBases,
    documentType, filingMethod, draft, annotations, currentStep,
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
      const docType = documentType === 'demand_letter' ? 'real_estate_demand_letter' : 'real_estate_petition'
      const res = await fetch(`/api/cases/${caseId}/generate-filing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ document_type: docType, facts: buildFacts() }),
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
        return propertyAddress.trim() !== '' && otherPartyName.trim() !== ''
      case 'transaction':
        return true
      case 'dispute':
        return disputeDescription.trim() !== ''
      case 'damages':
        return true
      case 'evidence':
        return true
      case 'legal_basis':
        return selectedBases.length > 0
      case 'how_to_file':
        return filingMethod !== ''
      case 'review':
        return true
      default:
        return true
    }
  }, [currentStep, propertyAddress, otherPartyName, disputeDescription, selectedBases, filingMethod])

  /* ---- Document title ---- */

  const documentTitle = documentType === 'demand_letter' ? 'Demand Letter' : 'Petition'
  const draftTitle = `Your Real Estate ${documentTitle} Draft`

  /* ---- Step rendering ---- */

  function renderStep() {
    const stepId = STEPS[currentStep]?.id
    switch (stepId) {
      case 'intake':
        return (
          <div className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="re-address" className="text-sm font-medium text-warm-text">Property address</label>
              <input id="re-address" type="text" placeholder="e.g. 1234 Main St, Austin, TX 78701" value={propertyAddress} onChange={(e) => setPropertyAddress(e.target.value)} className={inputCls} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-warm-text">Transaction type</label>
              <div className="space-y-2">
                {[
                  { value: 'sale', label: 'Sale / Purchase', desc: 'Buying or selling real property.' },
                  { value: 'lease', label: 'Lease / Rental', desc: 'Commercial or residential lease agreement.' },
                  { value: 'hoa', label: 'HOA matter', desc: 'Homeowners association issue.' },
                ].map((opt) => (
                  <label key={opt.value} className={`flex items-start gap-3 cursor-pointer rounded-lg border p-3 transition-colors ${transactionType === opt.value ? 'border-calm-indigo bg-calm-indigo/5' : 'border-warm-border hover:bg-warm-bg/50'}`}>
                    <input type="radio" name="re-tx-type" value={opt.value} checked={transactionType === opt.value} onChange={() => setTransactionType(opt.value)} className="mt-0.5 h-4 w-4 shrink-0 border-warm-border text-calm-indigo focus:ring-calm-indigo" />
                    <div>
                      <span className="text-sm font-medium text-warm-text">{opt.label}</span>
                      <p className="text-xs text-warm-muted mt-0.5">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="re-county" className="text-sm font-medium text-warm-text">County</label>
              <input id="re-county" type="text" placeholder="e.g. Travis, Harris, Dallas" value={county} onChange={(e) => setCounty(e.target.value)} className={inputCls} />
            </div>

            <div className="space-y-2">
              <label htmlFor="re-other-party" className="text-sm font-medium text-warm-text">Other party&apos;s name</label>
              <input id="re-other-party" type="text" placeholder="e.g. John Smith or ABC Realty" value={otherPartyName} onChange={(e) => setOtherPartyName(e.target.value)} className={inputCls} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-warm-text">The other party&apos;s role</label>
              <select value={otherPartyRole} onChange={(e) => setOtherPartyRole(e.target.value)} className="flex h-9 w-full rounded-md border border-warm-border bg-transparent px-3 py-1 text-sm text-warm-text shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-calm-indigo">
                <option value="seller">Seller</option>
                <option value="buyer">Buyer</option>
                <option value="agent">Agent / Broker</option>
                <option value="title_company">Title Company</option>
                <option value="builder">Builder / Developer</option>
                <option value="hoa">HOA</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="re-contract-date" className="text-sm font-medium text-warm-text">Contract date</label>
                <input id="re-contract-date" type="date" value={contractDate} onChange={(e) => setContractDate(e.target.value)} className="flex h-9 w-full rounded-md border border-warm-border bg-transparent px-3 py-1 text-sm text-warm-text shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-calm-indigo" />
              </div>
              <div className="space-y-2">
                <label htmlFor="re-closing-date" className="text-sm font-medium text-warm-text">Closing date</label>
                <input id="re-closing-date" type="date" value={closingDate} onChange={(e) => setClosingDate(e.target.value)} className="flex h-9 w-full rounded-md border border-warm-border bg-transparent px-3 py-1 text-sm text-warm-text shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-calm-indigo" />
              </div>
            </div>
          </div>
        )

      case 'transaction':
        return (
          <div className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="re-price" className="text-sm font-medium text-warm-text">Purchase price</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-warm-muted">$</span>
                <input id="re-price" type="number" min="0" step="0.01" placeholder="0.00" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} className={moneyInputCls} />
              </div>
              <p className="text-xs text-warm-muted">The agreed-upon price for the property.</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="re-earnest" className="text-sm font-medium text-warm-text">Earnest money deposit</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-warm-muted">$</span>
                <input id="re-earnest" type="number" min="0" step="0.01" placeholder="0.00" value={earnestMoney} onChange={(e) => setEarnestMoney(e.target.value)} className={moneyInputCls} />
              </div>
              <p className="text-xs text-warm-muted">The deposit paid to show good faith. Leave blank if not applicable.</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="re-inspection" className="text-sm font-medium text-warm-text">Inspection findings</label>
              <textarea id="re-inspection" placeholder="Describe any issues found during inspection, or note if no inspection was done." value={inspectionFindings} onChange={(e) => setInspectionFindings(e.target.value)} rows={3} className={textareaCls} />
            </div>

            <div className="space-y-2">
              <label htmlFor="re-title-issues" className="text-sm font-medium text-warm-text">Title issues</label>
              <textarea id="re-title-issues" placeholder="Any liens, encumbrances, survey discrepancies, or ownership questions. Leave blank if none." value={titleIssues} onChange={(e) => setTitleIssues(e.target.value)} rows={3} className={textareaCls} />
            </div>
          </div>
        )

      case 'dispute':
        return (
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-warm-text">What best describes the issue?</label>
              <div className="space-y-2">
                {DISPUTE_CATEGORIES.map((cat) => (
                  <label key={cat.value} className={`flex items-start gap-3 cursor-pointer rounded-lg border p-3 transition-colors ${disputeCategory === cat.value ? 'border-calm-indigo bg-calm-indigo/5' : 'border-warm-border hover:bg-warm-bg/50'}`}>
                    <input type="radio" name="re-dispute-cat" value={cat.value} checked={disputeCategory === cat.value} onChange={() => setDisputeCategory(cat.value)} className="mt-0.5 h-4 w-4 shrink-0 border-warm-border text-calm-indigo focus:ring-calm-indigo" />
                    <div>
                      <span className="text-sm font-medium text-warm-text">{cat.label}</span>
                      <p className="text-xs text-warm-muted mt-0.5">{cat.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="re-description" className="text-sm font-medium text-warm-text">Describe what went wrong</label>
              <textarea id="re-description" placeholder="Tell us what happened in your own words. Take your time." value={disputeDescription} onChange={(e) => setDisputeDescription(e.target.value)} rows={4} className={textareaCls} />
            </div>

            <div className="space-y-2">
              <label htmlFor="re-prior" className="text-sm font-medium text-warm-text">Have you tried to resolve this already?</label>
              <textarea id="re-prior" placeholder="e.g. I asked the seller to fix the issue, contacted a real estate attorney, filed a complaint with TREC..." value={priorAttempts} onChange={(e) => setPriorAttempts(e.target.value)} rows={2} className={textareaCls} />
              <p className="text-xs text-warm-muted">This is optional, but it strengthens your case.</p>
            </div>
          </div>
        )

      case 'damages':
        return (
          <div className="space-y-5">
            <p className="text-sm text-warm-muted">Enter any amounts that apply. Leave fields blank if they don&apos;t apply to your case.</p>

            {[
              { id: 're-financial', label: 'Financial losses', value: financialLosses, setter: setFinancialLosses, hint: 'Lost deposits, closing costs, or other out-of-pocket expenses.' },
              { id: 're-repair', label: 'Repair costs', value: repairCosts, setter: setRepairCosts, hint: 'Cost to fix undisclosed defects or damage.' },
              { id: 're-diminished', label: 'Diminished value', value: diminishedValue, setter: setDiminishedValue, hint: 'Reduction in property value due to the issue.' },
              { id: 're-other', label: 'Other damages', value: otherDamages, setter: setOtherDamages, hint: 'Temporary housing, storage, moving costs, or other expenses.' },
            ].map((field) => (
              <div key={field.id} className="space-y-2">
                <label htmlFor={field.id} className="text-sm font-medium text-warm-text">{field.label}</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-warm-muted">$</span>
                  <input id={field.id} type="number" min="0" step="0.01" placeholder="0.00" value={field.value} onChange={(e) => field.setter(e.target.value)} className={moneyInputCls} />
                </div>
                <p className="text-xs text-warm-muted">{field.hint}</p>
              </div>
            ))}

            {totalDamages > 0 && (
              <div className="rounded-lg border border-warm-border bg-calm-indigo/5 p-4">
                <p className="text-sm font-medium text-warm-text">Total damages: {fmt(totalDamages)}</p>
              </div>
            )}
          </div>
        )

      case 'evidence':
        return (
          <div className="space-y-5">
            <p className="text-sm text-warm-muted">Check the types of evidence you have. You can always gather more later.</p>

            {[
              { checked: hasContract, setter: setHasContract, label: 'Purchase agreement or contract', desc: 'The signed real estate contract or lease.' },
              { checked: hasInspectionReport, setter: setHasInspectionReport, label: 'Inspection report', desc: 'A professional home inspection report.' },
              { checked: hasTitleDocs, setter: setHasTitleDocs, label: 'Title documents', desc: 'Title search, deed, or title commitment.' },
              { checked: hasTitleInsurance, setter: setHasTitleInsurance, label: 'Title insurance policy', desc: 'Your title insurance policy and any claims.' },
              { checked: hasDisclosures, setter: setHasDisclosures, label: 'Seller disclosures', desc: 'The seller\'s property condition disclosure form.' },
              { checked: hasCommunications, setter: setHasCommunications, label: 'Communications', desc: 'Emails, texts, or letters between parties.' },
            ].map((item, i) => (
              <label key={i} className="flex items-start gap-3 cursor-pointer rounded-lg border border-warm-border p-3 transition-colors hover:bg-warm-bg/50">
                <input type="checkbox" checked={item.checked} onChange={(e) => item.setter(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 rounded border-warm-border text-calm-indigo focus:ring-calm-indigo" />
                <div>
                  <span className="text-sm text-warm-text">{item.label}</span>
                  <p className="text-xs text-warm-muted mt-0.5">{item.desc}</p>
                </div>
              </label>
            ))}

            <div className="space-y-2">
              <label htmlFor="re-evidence-notes" className="text-sm font-medium text-warm-text">Anything else about your evidence?</label>
              <textarea id="re-evidence-notes" placeholder="e.g. I have a recording of the seller admitting they knew about the foundation issue..." value={evidenceNotes} onChange={(e) => setEvidenceNotes(e.target.value)} rows={2} className={textareaCls} />
            </div>
          </div>
        )

      case 'legal_basis':
        return (
          <div className="space-y-5">
            <p className="text-sm text-warm-muted">Select the legal grounds that apply. You can choose more than one.</p>

            {LEGAL_BASES.map((basis) => (
              <label key={basis.value} className={`flex items-start gap-3 cursor-pointer rounded-lg border p-3 transition-colors ${selectedBases.includes(basis.value) ? 'border-calm-indigo bg-calm-indigo/5' : 'border-warm-border hover:bg-warm-bg/50'}`}>
                <input type="checkbox" checked={selectedBases.includes(basis.value)} onChange={(e) => {
                  if (e.target.checked) setSelectedBases([...selectedBases, basis.value])
                  else setSelectedBases(selectedBases.filter((b) => b !== basis.value))
                }} className="mt-0.5 h-4 w-4 shrink-0 rounded border-warm-border text-calm-indigo focus:ring-calm-indigo" />
                <div>
                  <span className="text-sm font-medium text-warm-text">{basis.label}</span>
                  <p className="text-xs text-warm-muted mt-0.5">{basis.desc}</p>
                </div>
              </label>
            ))}

            <div className="space-y-2 pt-2">
              <label className="text-sm font-medium text-warm-text">What document do you want to generate?</label>
              <div className="space-y-2">
                {[
                  { value: 'demand_letter' as const, label: 'Demand letter', desc: 'A formal letter requesting the other party take action or pay damages. A good first step.' },
                  { value: 'petition' as const, label: 'Court petition', desc: 'A formal filing with the court to start a lawsuit.' },
                ].map((opt) => (
                  <label key={opt.value} className={`flex items-start gap-3 cursor-pointer rounded-lg border p-3 transition-colors ${documentType === opt.value ? 'border-calm-indigo bg-calm-indigo/5' : 'border-warm-border hover:bg-warm-bg/50'}`}>
                    <input type="radio" name="re-doc-type" value={opt.value} checked={documentType === opt.value} onChange={() => setDocumentType(opt.value)} className="mt-0.5 h-4 w-4 shrink-0 border-warm-border text-calm-indigo focus:ring-calm-indigo" />
                    <div>
                      <span className="text-sm font-medium text-warm-text">{opt.label}</span>
                      <p className="text-xs text-warm-muted mt-0.5">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )

      case 'how_to_file':
        return (
          <FilingMethodStep
            filingMethod={filingMethod}
            onFilingMethodChange={setFilingMethod}
            county={county}
            courtType={caseData?.court_type || 'district'}
            config={FILING_CONFIGS.real_estate}
            state={caseData?.state}
          />
        )

      case 'review': {
        const rl = { seller: 'Seller', buyer: 'Buyer', agent: 'Agent', title_company: 'Title Company', builder: 'Builder', hoa: 'HOA', other: 'Other' }[otherPartyRole] || otherPartyRole
        const items: [string, string][] = [
          ['Property', propertyAddress || 'Not provided'],
          ['Transaction', { sale: 'Sale / Purchase', lease: 'Lease / Rental', hoa: 'HOA matter' }[transactionType] || transactionType],
          ['Other party', `${otherPartyName || 'Not provided'} (${rl})`],
          ...((parseFloat(purchasePrice) || 0) > 0 ? [['Purchase price', fmt(parseFloat(purchasePrice) || 0)] as [string, string]] : []),
          ['Dispute', `${DISPUTE_CATEGORIES.find((c) => c.value === disputeCategory)?.label ?? disputeCategory} — ${disputeDescription || 'Not provided'}`],
          ['Total damages', totalDamages > 0 ? fmt(totalDamages) : 'Not provided'],
          ['Legal basis', selectedBases.length > 0 ? selectedBases.map((b) => LEGAL_BASES.find((lb) => lb.value === b)?.label ?? b).join(', ') : 'Not selected'],
          ['Document type', documentTitle],
          ['Filing county', county || 'Not provided'],
        ]
        return (
          <dl className="space-y-4">
            {items.map(([label, val]) => (
              <div key={label}><dt className="text-sm font-medium text-warm-muted">{label}</dt><dd className="text-warm-text mt-0.5">{val}</dd></div>
            ))}
          </dl>
        )
      }

      default:
        return null
    }
  }

  /* ---- Draft phase layout ---- */

  if (draftPhase) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link href={`/case/${caseId}`} className="inline-flex items-center gap-1 text-sm text-warm-muted hover:text-warm-text mb-4">
          <ChevronLeft className="h-4 w-4" />
          Back to dashboard
        </Link>

        <h1 className="text-2xl font-semibold text-warm-text">{draftTitle}</h1>
        <p className="text-sm text-warm-muted mt-1 mb-6">Review your draft below. You can edit it directly, regenerate it, or download a PDF.</p>

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
              onRegenerate={async () => { setDraftPhase(false); await generateDraft() }}
              regenerating={generating}
              acknowledged={acknowledged}
              onAcknowledgeChange={setAcknowledged}
              documentTitle={documentTitle}
            />

            {acknowledged && (
              <div className="mt-6">
                <Button onClick={handleFinalConfirm} disabled={confirming} className="w-full" size="lg">
                  {confirming ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</>) : 'Confirm & Submit'}
                </Button>
                <p className="text-xs text-warm-muted text-center mt-2">This saves your document and marks this step as complete.</p>
              </div>
            )}

            <div className="mt-4">
              <button type="button" onClick={() => setDraftPhase(false)} className="text-sm text-warm-muted hover:text-warm-text transition-colors">
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
      title={`Prepare Your Real Estate ${documentTitle}`}
      steps={STEPS}
      currentStep={currentStep}
      onStepChange={setCurrentStep}
      onSave={handleSave}
      onComplete={handleComplete}
      canAdvance={canAdvance}
      totalEstimateMinutes={totalEstimateMinutes}
      completeButtonLabel={generating ? 'Generating...' : `Generate My ${documentTitle}`}
    >
      {generating ? (
        <div className="flex items-center gap-3 py-12 justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-warm-muted" />
          <p className="text-sm text-warm-muted">Generating your {documentTitle.toLowerCase()}... This may take a moment.</p>
        </div>
      ) : (
        renderStep()
      )}
    </WizardShell>
  )
}
