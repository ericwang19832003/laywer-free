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

interface PropertyWizardProps {
  caseId: string
  taskId: string
  existingMetadata?: Record<string, unknown> | null
  propertyDetails?: {
    property_address: string | null
    property_type: string | null
    property_value: number | null
    other_party_name: string | null
    other_party_relationship: string | null
    dispute_description: string | null
    damages_sought: number | null
    has_survey: boolean
    has_title_insurance: boolean
  } | null
  caseData?: { county: string | null; court_type: string; state?: string }
}

/* ------------------------------------------------------------------ */
/*  Steps                                                              */
/* ------------------------------------------------------------------ */

const STEPS: WizardStep[] = [
  { id: 'intake', title: 'Property Intake', subtitle: 'Tell us about your property and who is involved.' },
  { id: 'damage_description', title: 'What Happened', subtitle: 'Describe the damage or issue with the property.' },
  { id: 'damages', title: 'Your Losses', subtitle: 'Repair costs, replacement value, and other losses.' },
  { id: 'evidence', title: 'Your Evidence', subtitle: 'Documents and proof that support your case.' },
  { id: 'legal_basis', title: 'Legal Basis', subtitle: 'The legal grounds for your claim.' },
  { id: 'how_to_file', title: 'How to File', subtitle: 'Choose how to submit your document.' },
  { id: 'review', title: 'Review Everything', subtitle: 'Check your information before generating.' },
]

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function PropertyWizard({
  caseId,
  taskId,
  existingMetadata,
  propertyDetails,
  caseData,
}: PropertyWizardProps) {
  const router = useRouter()
  const meta = (existingMetadata ?? {}) as Record<string, unknown>
  const totalEstimateMinutes = 25

  /* ---- Intake fields ---- */
  const [propertyCategory, setPropertyCategory] = useState<string>(
    (meta.property_category as string) ?? 'real'
  )
  const [propertyAddress, setPropertyAddress] = useState<string>(
    (meta.property_address as string) ?? propertyDetails?.property_address ?? ''
  )
  const [propertyType, setPropertyType] = useState<string>(
    (meta.property_type as string) ?? propertyDetails?.property_type ?? 'residential'
  )
  const [county, setCounty] = useState<string>(
    (meta.county as string) ?? caseData?.county ?? ''
  )
  const [otherPartyName, setOtherPartyName] = useState<string>(
    (meta.other_party_name as string) ?? propertyDetails?.other_party_name ?? ''
  )
  const [otherPartyRelationship, setOtherPartyRelationship] = useState<string>(
    (meta.other_party_relationship as string) ?? propertyDetails?.other_party_relationship ?? 'neighbor'
  )
  const [incidentDate, setIncidentDate] = useState<string>(
    (meta.incident_date as string) ?? ''
  )

  /* ---- Damage description ---- */
  const [whatHappened, setWhatHappened] = useState<string>(
    (meta.what_happened as string) ?? propertyDetails?.dispute_description ?? ''
  )
  const [extentOfDamage, setExtentOfDamage] = useState<string>(
    (meta.extent_of_damage as string) ?? ''
  )
  const [whenDiscovered, setWhenDiscovered] = useState<string>(
    (meta.when_discovered as string) ?? ''
  )

  /* ---- Damages ---- */
  const [repairCosts, setRepairCosts] = useState<string>(
    (meta.repair_costs as string) ?? ''
  )
  const [replacementValue, setReplacementValue] = useState<string>(
    (meta.replacement_value as string) ?? ''
  )
  const [diminishedValue, setDiminishedValue] = useState<string>(
    (meta.diminished_value as string) ?? ''
  )
  const [lostUse, setLostUse] = useState<string>(
    (meta.lost_use as string) ?? ''
  )

  /* ---- Evidence ---- */
  const [hasPhotos, setHasPhotos] = useState<boolean>(
    (meta.has_photos as boolean) ?? false
  )
  const [hasEstimates, setHasEstimates] = useState<boolean>(
    (meta.has_estimates as boolean) ?? false
  )
  const [hasReceipts, setHasReceipts] = useState<boolean>(
    (meta.has_receipts as boolean) ?? false
  )
  const [hasExpertReports, setHasExpertReports] = useState<boolean>(
    (meta.has_expert_reports as boolean) ?? false
  )
  const [hasSurvey, setHasSurvey] = useState<boolean>(
    (meta.has_survey as boolean) ?? propertyDetails?.has_survey ?? false
  )
  const [hasTitleInsurance, setHasTitleInsurance] = useState<boolean>(
    (meta.has_title_insurance as boolean) ?? propertyDetails?.has_title_insurance ?? false
  )
  const [evidenceNotes, setEvidenceNotes] = useState<string>(
    (meta.evidence_notes as string) ?? ''
  )

  /* ---- Legal basis ---- */
  const [selectedBases, setSelectedBases] = useState<string[]>(
    (meta.selected_bases as string[]) ?? []
  )

  /* ---- Filing / draft state ---- */
  const [filingMethod, setFilingMethod] = useState<'online' | 'in_person' | ''>(
    (meta.filing_method as 'online' | 'in_person' | '') ?? ''
  )
  const [documentType, setDocumentType] = useState<'demand_letter' | 'petition'>(
    (meta.document_type as 'demand_letter' | 'petition') ?? 'demand_letter'
  )
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

  /* ---- Computed ---- */

  const totalDamages = useMemo(() => {
    return (parseFloat(repairCosts) || 0) +
      (parseFloat(replacementValue) || 0) +
      (parseFloat(diminishedValue) || 0) +
      (parseFloat(lostUse) || 0)
  }, [repairCosts, replacementValue, diminishedValue, lostUse])

  function formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(value)
  }

  const LEGAL_BASES = [
    { value: 'negligence', label: 'Negligence', desc: 'The other party failed to use reasonable care, causing damage to your property.' },
    { value: 'trespass', label: 'Trespass', desc: 'The other party entered or used your property without permission.' },
    { value: 'nuisance', label: 'Nuisance', desc: 'The other party interfered with your use and enjoyment of your property.' },
    { value: 'conversion', label: 'Conversion', desc: 'The other party took or destroyed your personal property.' },
  ]

  /* ---- Build helpers ---- */

  const buildFacts = useCallback(() => {
    const damagesBreakdown: { category: string; amount: number }[] = []
    const rc = parseFloat(repairCosts) || 0
    const rv = parseFloat(replacementValue) || 0
    const dv = parseFloat(diminishedValue) || 0
    const lu = parseFloat(lostUse) || 0
    if (rc > 0) damagesBreakdown.push({ category: 'Repair costs', amount: rc })
    if (rv > 0) damagesBreakdown.push({ category: 'Replacement value', amount: rv })
    if (dv > 0) damagesBreakdown.push({ category: 'Diminished value', amount: dv })
    if (lu > 0) damagesBreakdown.push({ category: 'Lost use', amount: lu })
    if (damagesBreakdown.length === 0) damagesBreakdown.push({ category: 'Property damage', amount: 0.01 })

    const fullDescription = [
      whatHappened,
      extentOfDamage ? `Extent of damage: ${extentOfDamage}` : null,
    ].filter(Boolean).join('\n\n')

    return {
      plaintiff: { full_name: '[Your Name]' },
      defendant: { full_name: otherPartyName || 'Unknown Defendant' },
      defendant_is_business: false,
      property_address: propertyAddress || '(Not provided)',
      property_type: propertyType === 'land' ? 'vacant_land' : propertyType,
      property_category: propertyCategory,
      dispute_type: selectedBases[0] || 'negligence',
      dispute_description: whatHappened || '(Not provided)',
      legal_bases: selectedBases,
      damages_breakdown: damagesBreakdown,
      damages_total: totalDamages > 0 ? totalDamages : 0.01,
      county: county || '(Not provided)',
      court_type: caseData?.court_type || 'district',
      description: fullDescription || '(Not provided)',
      demand_letter_sent: documentType === 'petition',
      seeks_injunctive_relief: selectedBases.includes('trespass') || selectedBases.includes('nuisance'),
      incident_date: incidentDate || undefined,
      when_discovered: whenDiscovered || undefined,
    }
  }, [
    repairCosts, replacementValue, diminishedValue, lostUse,
    whatHappened, extentOfDamage, otherPartyName, propertyAddress,
    propertyType, propertyCategory, selectedBases, totalDamages,
    county, caseData, documentType, incidentDate, whenDiscovered,
  ])

  const buildMetadata = useCallback(() => ({
    property_category: propertyCategory,
    property_address: propertyAddress || null,
    property_type: propertyType,
    county: county || null,
    other_party_name: otherPartyName || null,
    other_party_relationship: otherPartyRelationship,
    incident_date: incidentDate || null,
    what_happened: whatHappened || null,
    extent_of_damage: extentOfDamage || null,
    when_discovered: whenDiscovered || null,
    repair_costs: repairCosts || null,
    replacement_value: replacementValue || null,
    diminished_value: diminishedValue || null,
    lost_use: lostUse || null,
    total_damages: totalDamages,
    has_photos: hasPhotos,
    has_estimates: hasEstimates,
    has_receipts: hasReceipts,
    has_expert_reports: hasExpertReports,
    has_survey: hasSurvey,
    has_title_insurance: hasTitleInsurance,
    evidence_notes: evidenceNotes || null,
    selected_bases: selectedBases,
    document_type: documentType,
    filing_method: filingMethod || null,
    draft_text: draft || null,
    final_text: draft || null,
    annotations,
    _wizard_step: currentStep,
  }), [
    propertyCategory, propertyAddress, propertyType, county,
    otherPartyName, otherPartyRelationship, incidentDate,
    whatHappened, extentOfDamage, whenDiscovered,
    repairCosts, replacementValue, diminishedValue, lostUse, totalDamages,
    hasPhotos, hasEstimates, hasReceipts, hasExpertReports, hasSurvey, hasTitleInsurance,
    evidenceNotes, selectedBases, documentType, filingMethod,
    draft, annotations, currentStep,
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
      const docType = documentType === 'demand_letter' ? 'property_demand_letter' : 'property_petition'
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
      case 'damage_description':
        return whatHappened.trim() !== ''
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
  }, [currentStep, propertyAddress, otherPartyName, whatHappened, selectedBases, filingMethod])

  /* ---- Document title ---- */

  const documentTitle = documentType === 'demand_letter' ? 'Demand Letter' : 'Petition'
  const draftTitle = `Your Property ${documentTitle} Draft`

  /* ---- Step rendering ---- */

  function renderStep() {
    const stepId = STEPS[currentStep]?.id
    switch (stepId) {
      case 'intake':
        return (
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-warm-text">Property category</label>
              <div className="space-y-2">
                {[
                  { value: 'real', label: 'Real property', desc: 'Land, house, building, or anything attached to land.' },
                  { value: 'personal', label: 'Personal property', desc: 'Vehicles, equipment, belongings, or other movable items.' },
                ].map((opt) => (
                  <label key={opt.value} className={`flex items-start gap-3 cursor-pointer rounded-lg border p-3 transition-colors ${propertyCategory === opt.value ? 'border-calm-indigo bg-calm-indigo/5' : 'border-warm-border hover:bg-warm-bg/50'}`}>
                    <input type="radio" name="pw-category" value={opt.value} checked={propertyCategory === opt.value} onChange={() => setPropertyCategory(opt.value)} className="mt-0.5 h-4 w-4 shrink-0 border-warm-border text-calm-indigo focus:ring-calm-indigo" />
                    <div>
                      <span className="text-sm font-medium text-warm-text">{opt.label}</span>
                      <p className="text-xs text-warm-muted mt-0.5">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {propertyCategory === 'real' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-warm-text">Property type</label>
                <div className="space-y-2">
                  {[
                    { value: 'residential', label: 'Residential' },
                    { value: 'commercial', label: 'Commercial' },
                    { value: 'land', label: 'Land / Vacant Lot' },
                  ].map((opt) => (
                    <label key={opt.value} className={`flex items-center gap-3 cursor-pointer rounded-lg border p-3 transition-colors ${propertyType === opt.value ? 'border-calm-indigo bg-calm-indigo/5' : 'border-warm-border hover:bg-warm-bg/50'}`}>
                      <input type="radio" name="pw-type" value={opt.value} checked={propertyType === opt.value} onChange={() => setPropertyType(opt.value)} className="h-4 w-4 shrink-0 border-warm-border text-calm-indigo focus:ring-calm-indigo" />
                      <span className="text-sm text-warm-text">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="pw-address" className="text-sm font-medium text-warm-text">Property location or address</label>
              <input id="pw-address" type="text" placeholder="e.g. 1234 Main St, Austin, TX 78701" value={propertyAddress} onChange={(e) => setPropertyAddress(e.target.value)} className="flex h-9 w-full rounded-md border border-warm-border bg-transparent px-3 py-1 text-sm text-warm-text shadow-xs placeholder:text-warm-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-calm-indigo" />
              <p className="text-xs text-warm-muted">For personal property, describe where the incident happened.</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="pw-county" className="text-sm font-medium text-warm-text">County</label>
              <input id="pw-county" type="text" placeholder="e.g. Travis, Harris, Dallas" value={county} onChange={(e) => setCounty(e.target.value)} className="flex h-9 w-full rounded-md border border-warm-border bg-transparent px-3 py-1 text-sm text-warm-text shadow-xs placeholder:text-warm-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-calm-indigo" />
            </div>

            <div className="space-y-2">
              <label htmlFor="pw-other-party" className="text-sm font-medium text-warm-text">Other party&apos;s name</label>
              <input id="pw-other-party" type="text" placeholder="e.g. John Smith or Oakwood HOA" value={otherPartyName} onChange={(e) => setOtherPartyName(e.target.value)} className="flex h-9 w-full rounded-md border border-warm-border bg-transparent px-3 py-1 text-sm text-warm-text shadow-xs placeholder:text-warm-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-calm-indigo" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-warm-text">Relationship to other party</label>
              <select value={otherPartyRelationship} onChange={(e) => setOtherPartyRelationship(e.target.value)} className="flex h-9 w-full rounded-md border border-warm-border bg-transparent px-3 py-1 text-sm text-warm-text shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-calm-indigo">
                <option value="neighbor">Neighbor</option>
                <option value="contractor">Contractor</option>
                <option value="tenant">Tenant</option>
                <option value="landlord">Landlord</option>
                <option value="hoa">HOA</option>
                <option value="stranger">Stranger</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="pw-incident-date" className="text-sm font-medium text-warm-text">When did this happen?</label>
              <input id="pw-incident-date" type="date" value={incidentDate} onChange={(e) => setIncidentDate(e.target.value)} className="flex h-9 w-full rounded-md border border-warm-border bg-transparent px-3 py-1 text-sm text-warm-text shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-calm-indigo" />
              <p className="text-xs text-warm-muted">An approximate date is fine if you are not sure of the exact day.</p>
            </div>
          </div>
        )

      case 'damage_description':
        return (
          <div className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="pw-what-happened" className="text-sm font-medium text-warm-text">What happened?</label>
              <textarea id="pw-what-happened" placeholder="Describe the incident or situation in your own words. Take your time." value={whatHappened} onChange={(e) => setWhatHappened(e.target.value)} rows={4} className="flex min-h-[60px] w-full rounded-md border border-warm-border bg-transparent px-3 py-2 text-sm text-warm-text shadow-xs placeholder:text-warm-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-calm-indigo" />
            </div>

            <div className="space-y-2">
              <label htmlFor="pw-extent" className="text-sm font-medium text-warm-text">How bad is the damage?</label>
              <textarea id="pw-extent" placeholder="e.g. Fence destroyed, foundation cracked, tree fallen on roof, car scratched..." value={extentOfDamage} onChange={(e) => setExtentOfDamage(e.target.value)} rows={3} className="flex min-h-[60px] w-full rounded-md border border-warm-border bg-transparent px-3 py-2 text-sm text-warm-text shadow-xs placeholder:text-warm-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-calm-indigo" />
              <p className="text-xs text-warm-muted">Include details about what was damaged and how severely.</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="pw-discovered" className="text-sm font-medium text-warm-text">When did you discover the damage?</label>
              <input id="pw-discovered" type="date" value={whenDiscovered} onChange={(e) => setWhenDiscovered(e.target.value)} className="flex h-9 w-full rounded-md border border-warm-border bg-transparent px-3 py-1 text-sm text-warm-text shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-calm-indigo" />
              <p className="text-xs text-warm-muted">This can be different from when the damage actually occurred.</p>
            </div>
          </div>
        )

      case 'damages':
        return (
          <div className="space-y-5">
            <p className="text-sm text-warm-muted">Enter any amounts that apply. Leave fields blank if they don&apos;t apply to your case.</p>

            {[
              { id: 'pw-repair', label: 'Repair costs', value: repairCosts, setter: setRepairCosts, hint: 'Cost to fix or restore the damaged property.' },
              { id: 'pw-replacement', label: 'Replacement value', value: replacementValue, setter: setReplacementValue, hint: 'Cost to replace what was damaged beyond repair.' },
              { id: 'pw-diminished', label: 'Diminished value', value: diminishedValue, setter: setDiminishedValue, hint: 'Reduction in property value caused by the damage.' },
              { id: 'pw-lost-use', label: 'Lost use', value: lostUse, setter: setLostUse, hint: 'Financial loss from not being able to use the property (e.g., rental income, business revenue).' },
            ].map((field) => (
              <div key={field.id} className="space-y-2">
                <label htmlFor={field.id} className="text-sm font-medium text-warm-text">{field.label}</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-warm-muted">$</span>
                  <input id={field.id} type="number" min="0" step="0.01" placeholder="0.00" value={field.value} onChange={(e) => field.setter(e.target.value)} className="flex h-9 w-full rounded-md border border-warm-border bg-transparent pl-7 pr-3 py-1 text-sm text-warm-text shadow-xs placeholder:text-warm-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-calm-indigo" />
                </div>
                <p className="text-xs text-warm-muted">{field.hint}</p>
              </div>
            ))}

            {totalDamages > 0 && (
              <div className="rounded-lg border border-warm-border bg-calm-indigo/5 p-4">
                <p className="text-sm font-medium text-warm-text">Total damages: {formatCurrency(totalDamages)}</p>
              </div>
            )}
          </div>
        )

      case 'evidence':
        return (
          <div className="space-y-5">
            <p className="text-sm text-warm-muted">Check the types of evidence you have. You can always gather more later.</p>

            {[
              { checked: hasPhotos, setter: setHasPhotos, label: 'Photos or videos', desc: 'Images showing the damage or property condition.' },
              { checked: hasEstimates, setter: setHasEstimates, label: 'Repair estimates', desc: 'Written estimates from contractors or repair professionals.' },
              { checked: hasReceipts, setter: setHasReceipts, label: 'Receipts or invoices', desc: 'Proof of costs already paid for repairs or cleanup.' },
              { checked: hasExpertReports, setter: setHasExpertReports, label: 'Expert reports', desc: 'Appraisals, engineering reports, or other professional assessments.' },
              { checked: hasSurvey, setter: setHasSurvey, label: 'Property survey', desc: 'A survey showing boundary lines and property dimensions.' },
              { checked: hasTitleInsurance, setter: setHasTitleInsurance, label: 'Title insurance', desc: 'Title insurance may cover certain property disputes.' },
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
              <label htmlFor="pw-evidence-notes" className="text-sm font-medium text-warm-text">Anything else about your evidence?</label>
              <textarea id="pw-evidence-notes" placeholder="e.g. I have text messages where the neighbor admitted fault..." value={evidenceNotes} onChange={(e) => setEvidenceNotes(e.target.value)} rows={2} className="flex min-h-[60px] w-full rounded-md border border-warm-border bg-transparent px-3 py-2 text-sm text-warm-text shadow-xs placeholder:text-warm-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-calm-indigo" />
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
                    <input type="radio" name="pw-doc-type" value={opt.value} checked={documentType === opt.value} onChange={() => setDocumentType(opt.value)} className="mt-0.5 h-4 w-4 shrink-0 border-warm-border text-calm-indigo focus:ring-calm-indigo" />
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
            config={FILING_CONFIGS.property}
            state={caseData?.state}
          />
        )

      case 'review':
        return (
          <div className="space-y-4">
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-warm-muted">Property</dt>
                <dd className="text-warm-text mt-0.5">{propertyCategory === 'real' ? 'Real property' : 'Personal property'} &mdash; {propertyAddress || 'Not provided'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-warm-muted">Other party</dt>
                <dd className="text-warm-text mt-0.5">{otherPartyName || 'Not provided'} ({otherPartyRelationship})</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-warm-muted">What happened</dt>
                <dd className="text-warm-text mt-0.5">{whatHappened || 'Not provided'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-warm-muted">Total damages</dt>
                <dd className="text-warm-text mt-0.5">{totalDamages > 0 ? formatCurrency(totalDamages) : 'Not provided'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-warm-muted">Legal basis</dt>
                <dd className="text-warm-text mt-0.5">{selectedBases.length > 0 ? selectedBases.map((b) => LEGAL_BASES.find((lb) => lb.value === b)?.label ?? b).join(', ') : 'Not selected'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-warm-muted">Document type</dt>
                <dd className="text-warm-text mt-0.5">{documentTitle}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-warm-muted">Filing county</dt>
                <dd className="text-warm-text mt-0.5">{county || 'Not provided'}</dd>
              </div>
            </dl>
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
      title={`Prepare Your Property ${documentTitle}`}
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
