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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { AlertTriangle, FileText, Loader2, Plus, Trash2 } from 'lucide-react'
import { FilingMethodStep } from '@/components/step/filing-method-step'
import { FILING_CONFIGS } from '@/lib/filing-configs'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface DamageLineItem {
  description: string
  amount: string
}

interface ContractWizardProps {
  caseId: string
  taskId: string
  existingMetadata?: Record<string, unknown>
  contractDetails?: {
    contract_date?: string
    contract_amount?: string
    has_written_contract?: boolean
    breach_description?: string
    damages_sought?: string
    other_party_name?: string
    other_party_type?: string
  } | null
  caseData?: { county: string | null; court_type: string }
}

/* ------------------------------------------------------------------ */
/*  Wizard steps                                                       */
/* ------------------------------------------------------------------ */

const WIZARD_STEPS: WizardStep[] = [
  { id: 'preflight', title: 'Before You Start', subtitle: 'Make sure you have what you need.' },
  { id: 'contract_details', title: 'Contract Details', subtitle: 'Tell us about the contract.' },
  { id: 'breach', title: 'The Breach', subtitle: 'What went wrong?' },
  { id: 'damages', title: 'Your Damages', subtitle: 'Calculate what you are owed.' },
  { id: 'venue', title: 'Where to File', subtitle: 'We\'ll help you pick the right court.' },
  { id: 'how_to_file', title: 'How to File', subtitle: 'Choose how to submit your petition.' },
  { id: 'review', title: 'Review Everything', subtitle: 'Check your information before generating.' },
  { id: 'generate', title: 'Generate Petition', subtitle: 'We\'ll draft your contract petition.' },
]

/* ------------------------------------------------------------------ */
/*  Court type helpers                                                 */
/* ------------------------------------------------------------------ */

function suggestCourtType(totalDamages: number): string {
  if (totalDamages <= 20000) return 'jp'
  if (totalDamages <= 200000) return 'county'
  return 'district'
}

function courtTypeLabel(ct: string): string {
  switch (ct) {
    case 'jp': return 'Justice of the Peace (under $20K)'
    case 'county': return 'County Court ($20K-$200K)'
    case 'district': return 'District Court (over $200K)'
    default: return ct
  }
}

/* ------------------------------------------------------------------ */
/*  Review section helper                                              */
/* ------------------------------------------------------------------ */

function ReviewSection({
  title,
  stepId,
  onEdit,
  children,
}: {
  title: string
  stepId: string
  onEdit: (stepId: string) => void
  children: React.ReactNode
}) {
  return (
    <div className="rounded-lg border border-warm-border p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-warm-text">{title}</h3>
        <button
          type="button"
          onClick={() => onEdit(stepId)}
          className="text-xs text-calm-indigo hover:text-calm-indigo/80 transition-colors"
        >
          Edit
        </button>
      </div>
      <div className="space-y-1 text-sm">{children}</div>
    </div>
  )
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-warm-muted">{label}</span>
      <span className="text-warm-text text-right max-w-[60%]">{value}</span>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function ContractWizard({
  caseId,
  taskId,
  existingMetadata,
  contractDetails,
  caseData,
}: ContractWizardProps) {
  const router = useRouter()
  const meta = (existingMetadata ?? {}) as Record<string, unknown>
  const totalEstimateMinutes = 25

  /* ---- Contract details ---- */
  const [contractDate, setContractDate] = useState<string>(
    (meta.contract_date as string) ?? contractDetails?.contract_date ?? ''
  )
  const [contractType, setContractType] = useState<string>(
    (meta.contract_type as string) ?? ''
  )
  const [contractAmount, setContractAmount] = useState<string>(
    (meta.contract_amount as string) ?? contractDetails?.contract_amount ?? ''
  )
  const [hasWrittenContract, setHasWrittenContract] = useState<boolean>(
    (meta.has_written_contract as boolean) ?? contractDetails?.has_written_contract ?? false
  )
  const [contractTermsSummary, setContractTermsSummary] = useState<string>(
    (meta.contract_terms_summary as string) ?? ''
  )

  /* ---- Parties ---- */
  const [otherPartyName, setOtherPartyName] = useState<string>(
    (meta.other_party_name as string) ?? contractDetails?.other_party_name ?? ''
  )
  const [otherPartyType, setOtherPartyType] = useState<string>(
    (meta.other_party_type as string) ?? contractDetails?.other_party_type ?? 'individual'
  )
  const [yourName, setYourName] = useState<string>((meta.your_name as string) ?? '')
  const [yourAddress, setYourAddress] = useState<string>((meta.your_address as string) ?? '')
  const [yourCity, setYourCity] = useState<string>((meta.your_city as string) ?? '')
  const [yourState, setYourState] = useState<string>((meta.your_state as string) ?? 'TX')
  const [yourZip, setYourZip] = useState<string>((meta.your_zip as string) ?? '')

  /* ---- Breach ---- */
  const [breachDate, setBreachDate] = useState<string>(
    (meta.breach_date as string) ?? ''
  )
  const [breachDescription, setBreachDescription] = useState<string>(
    (meta.breach_description as string) ?? contractDetails?.breach_description ?? ''
  )
  const [performedObligations, setPerformedObligations] = useState<string>(
    (meta.performed_obligations as string) ?? ''
  )
  const [priorDemandSent, setPriorDemandSent] = useState<boolean>(
    (meta.prior_demand_sent as boolean) ?? false
  )

  /* ---- Damages ---- */
  const [damageLineItems, setDamageLineItems] = useState<DamageLineItem[]>(
    (meta.damage_line_items as DamageLineItem[]) ?? [
      { description: '', amount: '' },
    ]
  )
  const [lostProfits, setLostProfits] = useState<string>(
    (meta.lost_profits as string) ?? ''
  )
  const [costToCure, setCostToCure] = useState<string>(
    (meta.cost_to_cure as string) ?? ''
  )

  /* ---- Venue ---- */
  const [county, setCounty] = useState<string>(
    (meta.county as string) ?? caseData?.county ?? ''
  )
  const [courtType, setCourtType] = useState<string>(
    (meta.court_type as string) ?? caseData?.court_type ?? 'county'
  )
  const [causeNumber, setCauseNumber] = useState<string>(
    (meta.cause_number as string) ?? ''
  )

  /* ---- Filing method ---- */
  const [filingMethod, setFilingMethod] = useState<'online' | 'in_person' | ''>(
    (meta.filing_method as 'online' | 'in_person') ?? ''
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

  /* ---- Computed totals ---- */

  const lineItemTotal = useMemo(() => {
    return damageLineItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0)
  }, [damageLineItems])

  const grandTotal = useMemo(() => {
    return lineItemTotal + (parseFloat(lostProfits) || 0) + (parseFloat(costToCure) || 0)
  }, [lineItemTotal, lostProfits, costToCure])

  /* ---- Damage line item handlers ---- */

  const addLineItem = useCallback(() => {
    setDamageLineItems((prev) => [...prev, { description: '', amount: '' }])
  }, [])

  const removeLineItem = useCallback((index: number) => {
    setDamageLineItems((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const updateLineItem = useCallback(
    (index: number, field: keyof DamageLineItem, value: string) => {
      setDamageLineItems((prev) =>
        prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
      )
    },
    []
  )

  /* ---- Build helpers ---- */

  const buildFacts = useCallback(() => {
    return {
      your_info: {
        full_name: yourName,
        address: yourAddress || undefined,
        city: yourCity || undefined,
        state: yourState || undefined,
        zip: yourZip || undefined,
      },
      opposing_parties: [
        {
          full_name: otherPartyName || 'Unknown Defendant',
          party_type: otherPartyType,
        },
      ],
      court_type: courtType as 'jp' | 'county' | 'district',
      county: county || '',
      cause_number: causeNumber || undefined,
      contract_date: contractDate,
      contract_type: contractType || undefined,
      contract_amount: parseFloat(contractAmount) || 0,
      has_written_contract: hasWrittenContract,
      contract_terms_summary: contractTermsSummary || undefined,
      breach_date: breachDate || undefined,
      breach_description: breachDescription,
      performed_obligations: performedObligations || undefined,
      prior_demand_sent: priorDemandSent,
      damages: {
        line_items: damageLineItems.filter((i) => i.description || i.amount),
        lost_profits: parseFloat(lostProfits) || 0,
        cost_to_cure: parseFloat(costToCure) || 0,
        total: grandTotal,
      },
    }
  }, [
    yourName, yourAddress, yourCity, yourState, yourZip,
    otherPartyName, otherPartyType, courtType, county, causeNumber,
    contractDate, contractType, contractAmount, hasWrittenContract,
    contractTermsSummary, breachDate, breachDescription,
    performedObligations, priorDemandSent,
    damageLineItems, lostProfits, costToCure, grandTotal,
  ])

  const buildMetadata = useCallback(
    () => ({
      contract_date: contractDate || null,
      contract_type: contractType || null,
      contract_amount: contractAmount || null,
      has_written_contract: hasWrittenContract,
      contract_terms_summary: contractTermsSummary || null,
      other_party_name: otherPartyName || null,
      other_party_type: otherPartyType,
      your_name: yourName || null,
      your_address: yourAddress || null,
      your_city: yourCity || null,
      your_state: yourState || null,
      your_zip: yourZip || null,
      breach_date: breachDate || null,
      breach_description: breachDescription || null,
      performed_obligations: performedObligations || null,
      prior_demand_sent: priorDemandSent,
      damage_line_items: damageLineItems,
      lost_profits: lostProfits || null,
      cost_to_cure: costToCure || null,
      county: county || null,
      court_type: courtType || null,
      cause_number: causeNumber || null,
      filing_method: filingMethod || null,
      draft_text: draft || null,
      final_text: draft || null,
      annotations,
      _wizard_step: currentStep,
    }),
    [
      contractDate, contractType, contractAmount, hasWrittenContract,
      contractTermsSummary, otherPartyName, otherPartyType,
      yourName, yourAddress, yourCity, yourState, yourZip,
      breachDate, breachDescription, performedObligations, priorDemandSent,
      damageLineItems, lostProfits, costToCure,
      county, courtType, causeNumber, filingMethod, draft, annotations, currentStep,
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
          document_type: 'contract_petition',
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
    const stepId = WIZARD_STEPS[currentStep]?.id
    switch (stepId) {
      case 'preflight':
        return true
      case 'contract_details':
        return otherPartyName.trim() !== ''
      case 'breach':
        return breachDescription.trim().length >= 10
      case 'damages':
        return grandTotal > 0
      case 'venue':
        return county.trim() !== '' && courtType !== ''
      case 'how_to_file':
        return filingMethod !== ''
      case 'review':
        return true
      case 'generate':
        return true
      default:
        return true
    }
  }, [currentStep, otherPartyName, breachDescription, grandTotal, county, courtType, filingMethod])

  /* ---- Review step onEdit ---- */

  const handleReviewEdit = useCallback(
    (stepId: string) => {
      const idx = WIZARD_STEPS.findIndex((s) => s.id === stepId)
      if (idx >= 0) setCurrentStep(idx)
    },
    []
  )

  /* ---- Step rendering ---- */

  function renderStep() {
    const stepId = WIZARD_STEPS[currentStep]?.id

    switch (stepId) {
      /* ============================================================ */
      /*  PREFLIGHT                                                    */
      /* ============================================================ */
      case 'preflight':
        return (
          <div className="space-y-4">
            <p className="text-sm text-warm-muted">
              Before we begin preparing your contract petition, gather these items if you have them:
            </p>

            <div className="space-y-3">
              {[
                { label: 'A copy of the contract (written, email, or text)' },
                { label: 'Invoices, receipts, or proof of payments made' },
                { label: 'Emails or messages about the breach' },
                { label: 'Records of any demand letters sent' },
                { label: 'Estimates or invoices for the cost to fix the problem' },
              ].map(({ label }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-calm-indigo/10 flex items-center justify-center shrink-0">
                    <FileText className="h-4 w-4 text-calm-indigo" />
                  </div>
                  <span className="text-sm text-warm-text">{label}</span>
                </div>
              ))}
            </div>

            <div className="rounded-lg border border-calm-amber bg-calm-amber/5 p-3 mt-4">
              <div className="flex gap-2">
                <AlertTriangle className="h-4 w-4 text-calm-amber shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-warm-text">Tip for contract cases</p>
                  <p className="text-xs text-warm-muted mt-1">
                    Even oral contracts can be enforceable in Texas. If you don&apos;t have a written contract,
                    gather any evidence of the agreement: texts, emails, invoices, witnesses, or partial performance.
                  </p>
                </div>
              </div>
            </div>

            <p className="text-xs text-warm-muted">
              Don&apos;t have everything? That&apos;s okay. You can always come back and update later.
            </p>
          </div>
        )

      /* ============================================================ */
      /*  CONTRACT DETAILS                                             */
      /* ============================================================ */
      case 'contract_details':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="other-party-name">Other Party&apos;s Name</Label>
              <Input
                id="other-party-name"
                placeholder="Full legal name or business name"
                value={otherPartyName}
                onChange={(e) => setOtherPartyName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Other Party Type</Label>
              <div className="flex gap-3">
                {(['individual', 'business'] as const).map((t) => (
                  <Button
                    key={t}
                    type="button"
                    variant={otherPartyType === t ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setOtherPartyType(t)}
                    className="flex-1"
                  >
                    {t === 'individual' ? 'Individual' : 'Business'}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="contract-date" className="text-xs">Contract Date</Label>
                <Input
                  id="contract-date"
                  type="date"
                  value={contractDate}
                  onChange={(e) => setContractDate(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="contract-amount" className="text-xs">Contract Amount ($)</Label>
                <Input
                  id="contract-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={contractAmount}
                  onChange={(e) => setContractAmount(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contract-type">Type of Contract</Label>
              <Input
                id="contract-type"
                placeholder="e.g., Service agreement, Construction, Lease, Sale of goods"
                value={contractType}
                onChange={(e) => setContractType(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Checkbox
                id="written-contract"
                checked={hasWrittenContract}
                onCheckedChange={(c) => setHasWrittenContract(c === true)}
              />
              <Label htmlFor="written-contract" className="text-sm cursor-pointer">
                I have a written contract
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contract-terms">Key Contract Terms (optional)</Label>
              <Textarea
                id="contract-terms"
                placeholder="Summarize the main obligations of each party..."
                rows={3}
                value={contractTermsSummary}
                onChange={(e) => setContractTermsSummary(e.target.value)}
              />
              <p className="text-xs text-warm-muted">
                What was each side supposed to do? Include deadlines, deliverables, and payment terms.
              </p>
            </div>
          </div>
        )

      /* ============================================================ */
      /*  BREACH                                                       */
      /* ============================================================ */
      case 'breach':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="breach-date">When did the breach occur?</Label>
              <Input
                id="breach-date"
                type="date"
                value={breachDate}
                onChange={(e) => setBreachDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="breach-description">Describe the breach</Label>
              <Textarea
                id="breach-description"
                placeholder="What specific obligations did the other party fail to perform? Be as detailed as possible..."
                rows={4}
                value={breachDescription}
                onChange={(e) => setBreachDescription(e.target.value)}
              />
              <p className="text-xs text-warm-muted">
                Reference specific contract terms, dates, and deliverables if possible.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="performed-obligations">Your performance (optional)</Label>
              <Textarea
                id="performed-obligations"
                placeholder="Describe what you did to fulfill your obligations under the contract..."
                rows={3}
                value={performedObligations}
                onChange={(e) => setPerformedObligations(e.target.value)}
              />
              <p className="text-xs text-warm-muted">
                Proving you performed your obligations is a key element of a breach of contract claim.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Checkbox
                id="demand-sent"
                checked={priorDemandSent}
                onCheckedChange={(c) => setPriorDemandSent(c === true)}
              />
              <Label htmlFor="demand-sent" className="text-sm cursor-pointer">
                I already sent a demand letter to the other party
              </Label>
            </div>
          </div>
        )

      /* ============================================================ */
      /*  DAMAGES                                                      */
      /* ============================================================ */
      case 'damages':
        return (
          <div className="space-y-4">
            <p className="text-sm text-warm-muted">
              List each category of damages you are claiming. This helps calculate the total amount for your petition.
            </p>

            {damageLineItems.map((item, index) => (
              <div
                key={index}
                className="rounded-lg border border-warm-border p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-warm-text">
                    Item {index + 1}
                  </span>
                  {damageLineItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLineItem(index)}
                      className="text-warm-muted hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 space-y-1">
                    <Label htmlFor={`item-desc-${index}`} className="text-xs">
                      Description
                    </Label>
                    <Input
                      id={`item-desc-${index}`}
                      placeholder="e.g., Unpaid invoice #1234"
                      value={item.description}
                      onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`item-amount-${index}`} className="text-xs">
                      Amount ($)
                    </Label>
                    <Input
                      id={`item-amount-${index}`}
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={item.amount}
                      onChange={(e) => updateLineItem(index, 'amount', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addLineItem}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Damage Item
            </Button>

            <div className="space-y-2">
              <Label htmlFor="cost-to-cure">Cost to Cure / Complete ($)</Label>
              <Input
                id="cost-to-cure"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={costToCure}
                onChange={(e) => setCostToCure(e.target.value)}
              />
              <p className="text-xs text-warm-muted">
                The cost to hire someone else to finish the work or fix what was done wrong.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lost-profits">Lost Profits ($)</Label>
              <Input
                id="lost-profits"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={lostProfits}
                onChange={(e) => setLostProfits(e.target.value)}
              />
              <p className="text-xs text-warm-muted">
                Profits you lost as a direct result of the breach. Must be reasonably foreseeable and provable.
              </p>
            </div>

            {/* Grand total */}
            <div className="rounded-lg bg-warm-surface p-4 border border-warm-border">
              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-warm-muted">
                  <span>Direct damages</span>
                  <span>
                    ${lineItemTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-warm-muted">
                  <span>Cost to cure</span>
                  <span>
                    ${(parseFloat(costToCure) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-warm-muted">
                  <span>Lost profits</span>
                  <span>
                    ${(parseFloat(lostProfits) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="border-t border-warm-border pt-2 mt-2 flex justify-between font-semibold text-warm-text">
                  <span>Grand Total</span>
                  <span>
                    ${grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )

      /* ============================================================ */
      /*  VENUE                                                        */
      /* ============================================================ */
      case 'venue': {
        const suggested = suggestCourtType(grandTotal)
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="venue-your-name">Your Full Legal Name</Label>
              <Input
                id="venue-your-name"
                placeholder="As it would appear on court documents"
                value={yourName}
                onChange={(e) => setYourName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1">
                <Label htmlFor="venue-address" className="text-xs">Address</Label>
                <Input
                  id="venue-address"
                  placeholder="Street address"
                  value={yourAddress}
                  onChange={(e) => setYourAddress(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="venue-city" className="text-xs">City</Label>
                <Input
                  id="venue-city"
                  value={yourCity}
                  onChange={(e) => setYourCity(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="venue-state" className="text-xs">State</Label>
                <Input
                  id="venue-state"
                  value={yourState}
                  onChange={(e) => setYourState(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="venue-zip" className="text-xs">ZIP</Label>
                <Input
                  id="venue-zip"
                  value={yourZip}
                  onChange={(e) => setYourZip(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="county">County</Label>
              <Input
                id="county"
                placeholder="e.g. Travis"
                value={county}
                onChange={(e) => setCounty(e.target.value)}
              />
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
                    onClick={() => setCourtType(ct)}
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
                  Based on your total damages of ${grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })},
                  we suggest {courtTypeLabel(suggested).toLowerCase()}.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cause-number">Cause Number (optional)</Label>
              <Input
                id="cause-number"
                placeholder="Leave blank if not yet assigned"
                value={causeNumber}
                onChange={(e) => setCauseNumber(e.target.value)}
              />
            </div>
          </div>
        )
      }

      /* ============================================================ */
      /*  HOW TO FILE                                                  */
      /* ============================================================ */
      case 'how_to_file':
        return (
          <FilingMethodStep
            filingMethod={filingMethod}
            onFilingMethodChange={setFilingMethod}
            county={county}
            courtType={courtType}
            config={FILING_CONFIGS.contract}
          />
        )

      /* ============================================================ */
      /*  REVIEW                                                       */
      /* ============================================================ */
      case 'review':
        return (
          <div className="space-y-4">
            <p className="text-sm text-warm-muted">
              Please review all your information below. Click any section to edit.
            </p>

            <ReviewSection title="Contract Details" stepId="contract_details" onEdit={handleReviewEdit}>
              <ReviewRow label="Other party" value={otherPartyName || 'Not provided'} />
              <ReviewRow label="Party type" value={otherPartyType === 'business' ? 'Business' : 'Individual'} />
              <ReviewRow label="Contract date" value={contractDate || 'Not provided'} />
              <ReviewRow label="Contract amount" value={contractAmount ? `$${parseFloat(contractAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'Not provided'} />
              <ReviewRow label="Written contract" value={hasWrittenContract ? 'Yes' : 'No'} />
              <ReviewRow label="Contract type" value={contractType || 'Not provided'} />
            </ReviewSection>

            <ReviewSection title="The Breach" stepId="breach" onEdit={handleReviewEdit}>
              <ReviewRow label="Breach date" value={breachDate || 'Not provided'} />
              <ReviewRow label="Description" value={breachDescription || 'Not provided'} />
              <ReviewRow label="Demand letter sent" value={priorDemandSent ? 'Yes' : 'No'} />
            </ReviewSection>

            <ReviewSection title="Damages" stepId="damages" onEdit={handleReviewEdit}>
              {damageLineItems.filter((i) => i.description || i.amount).map((item, idx) => (
                <ReviewRow key={idx} label={item.description || `Item ${idx + 1}`} value={`$${(parseFloat(item.amount) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
              ))}
              {(parseFloat(costToCure) || 0) > 0 && (
                <ReviewRow label="Cost to cure" value={`$${(parseFloat(costToCure) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
              )}
              {(parseFloat(lostProfits) || 0) > 0 && (
                <ReviewRow label="Lost profits" value={`$${(parseFloat(lostProfits) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
              )}
              <div className="border-t border-warm-border pt-1 mt-1">
                <ReviewRow label="Grand total" value={`$${grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
              </div>
            </ReviewSection>

            <ReviewSection title="Filing Details" stepId="venue" onEdit={handleReviewEdit}>
              <ReviewRow label="Your name" value={yourName || 'Not provided'} />
              <ReviewRow label="County" value={county || 'Not provided'} />
              <ReviewRow label="Court type" value={courtTypeLabel(courtType)} />
              {causeNumber && <ReviewRow label="Cause number" value={causeNumber} />}
            </ReviewSection>
          </div>
        )

      /* ============================================================ */
      /*  GENERATE                                                     */
      /* ============================================================ */
      case 'generate':
        if (draftPhase && draft) {
          return (
            <div className="space-y-4">
              <AnnotatedDraftViewer
                draft={draft}
                annotations={annotations}
                onDraftChange={setDraft}
                onRegenerate={generateDraft}
                regenerating={generating}
                acknowledged={acknowledged}
                onAcknowledgeChange={setAcknowledged}
                documentTitle="Your Contract Petition Draft"
              />

              {acknowledged && (
                <Button
                  className="w-full h-11 text-base"
                  onClick={handleFinalConfirm}
                  disabled={confirming}
                >
                  {confirming ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    'Confirm & Complete'
                  )}
                </Button>
              )}
            </div>
          )
        }

        return (
          <div className="space-y-4 text-center py-8">
            {generating ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-calm-indigo mx-auto" />
                <p className="text-sm text-warm-muted">
                  Generating your contract petition...
                </p>
                <p className="text-xs text-warm-muted">
                  This may take 30-60 seconds.
                </p>
              </>
            ) : genError ? (
              <>
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <p className="text-sm text-red-800">{genError}</p>
                </div>
                <Button onClick={generateDraft} variant="outline" size="sm">
                  Try Again
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm text-warm-muted">
                  Ready to generate your contract petition. Click the button below to proceed.
                </p>
                <Button onClick={generateDraft} className="h-11 px-6 text-base">
                  Generate Petition
                </Button>
              </>
            )}
          </div>
        )

      default:
        return null
    }
  }

  /* ---- Render ---- */

  return (
    <WizardShell
      caseId={caseId}
      title="Prepare Your Contract Petition"
      steps={WIZARD_STEPS}
      currentStep={currentStep}
      onStepChange={setCurrentStep}
      onSave={handleSave}
      onComplete={currentStep === WIZARD_STEPS.length - 1 ? undefined : handleComplete}
      canAdvance={canAdvance}
      totalEstimateMinutes={totalEstimateMinutes}
      completeButtonLabel="Generate Petition"
    >
      {renderStep()}
    </WizardShell>
  )
}
