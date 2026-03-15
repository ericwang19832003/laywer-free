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

// Import all landlord-tenant wizard steps
import { LtPreflight } from './landlord-tenant-wizard-steps/lt-preflight'
import { LtPartiesStep } from './landlord-tenant-wizard-steps/lt-parties-step'
import { LtPropertyStep } from './landlord-tenant-wizard-steps/lt-property-step'
import { LtLeaseStep } from './landlord-tenant-wizard-steps/lt-lease-step'
import { LtFinancialStep } from './landlord-tenant-wizard-steps/lt-financial-step'
import { EvictionNoticeStep } from './landlord-tenant-wizard-steps/eviction-notice-step'
import { RepairHistoryStep } from './landlord-tenant-wizard-steps/repair-history-step'
import { DepositDeductionsStep } from './landlord-tenant-wizard-steps/deposit-deductions-step'
import { LtTimelineStep } from './landlord-tenant-wizard-steps/lt-timeline-step'
import { LtDemandInfoStep } from './landlord-tenant-wizard-steps/lt-demand-info-step'
import { LtVenueStep } from './landlord-tenant-wizard-steps/lt-venue-step'
import { LtReviewStep } from './landlord-tenant-wizard-steps/lt-review-step'

import { calculateDamages, type DamageItem } from '@/lib/small-claims/damages-calculator'
import { FilingMethodStep } from '@/components/step/filing-method-step'
import { FILING_CONFIGS } from '@/lib/filing-configs'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface PartyInfo {
  full_name: string
  address?: string
  city?: string
  state?: string
  zip?: string
}

interface LandlordTenantWizardProps {
  caseId: string
  taskId: string
  existingMetadata?: Record<string, unknown>
  landlordTenantDetails: {
    landlord_tenant_sub_type: string
    party_role: string
    property_address: string | null
    lease_start_date: string | null
    lease_end_date: string | null
    lease_type: string | null
    monthly_rent: number | null
    deposit_amount: number | null
    amount_claimed: number | null
    eviction_notice_date: string | null
    eviction_notice_type: string | null
    demand_letter_sent: boolean
  } | null
  caseData: { county: string | null; court_type: string }
}

/* ------------------------------------------------------------------ */
/*  Dynamic step generation based on sub-type                          */
/* ------------------------------------------------------------------ */

function getStepsForSubType(subType: string): WizardStep[] {
  const preflight: WizardStep = {
    id: 'preflight',
    title: 'Before You Start',
    subtitle: "Let's make sure you have what you need.",
  }
  const parties: WizardStep = {
    id: 'parties',
    title: 'Who Is Involved?',
    subtitle: 'Tell us about yourself and the other party.',
  }
  const property: WizardStep = {
    id: 'property',
    title: 'Property Details',
    subtitle: 'Where is the rental property?',
  }
  const lease: WizardStep = {
    id: 'lease',
    title: 'Lease Information',
    subtitle: 'Details about your lease agreement.',
  }
  const financial: WizardStep = {
    id: 'financial',
    title: 'Damages',
    subtitle: 'How much are you claiming?',
  }
  const evictionNotice: WizardStep = {
    id: 'eviction_notice',
    title: 'Eviction Notice',
    subtitle: 'Notice details.',
  }
  const repairs: WizardStep = {
    id: 'repairs',
    title: 'Repair History',
    subtitle: 'Document your repair requests.',
  }
  const deductions: WizardStep = {
    id: 'deductions',
    title: 'Deposit Deductions',
    subtitle: 'Claimed deductions from your deposit.',
  }
  const timeline: WizardStep = {
    id: 'timeline',
    title: 'Timeline',
    subtitle: 'Key events in your case.',
  }
  const demandInfo: WizardStep = {
    id: 'demand_info',
    title: 'Demand Letter',
    subtitle: 'Have you sent a demand letter?',
  }
  const venue: WizardStep = {
    id: 'venue',
    title: 'Where to File',
    subtitle: "We'll help you pick the right court.",
  }
  const howToFile: WizardStep = {
    id: 'how_to_file',
    title: 'How to File',
    subtitle: 'Choose how you want to submit your petition.',
  }
  const review: WizardStep = {
    id: 'review',
    title: 'Review Everything',
    subtitle: 'Check your information before generating your document.',
  }

  switch (subType) {
    case 'eviction':
      return [preflight, parties, property, lease, financial, evictionNotice, timeline, demandInfo, venue, howToFile, review]
    case 'nonpayment':
      return [preflight, parties, property, lease, financial, evictionNotice, demandInfo, venue, howToFile, review]
    case 'security_deposit':
      return [preflight, parties, property, lease, financial, deductions, timeline, demandInfo, venue, howToFile, review]
    case 'property_damage':
      return [preflight, parties, property, financial, timeline, demandInfo, venue, howToFile, review]
    case 'repair_maintenance':
      return [preflight, parties, property, lease, financial, repairs, demandInfo, venue, howToFile, review]
    case 'lease_termination':
      return [preflight, parties, property, lease, financial, demandInfo, venue, howToFile, review]
    case 'habitability':
      return [preflight, parties, property, lease, financial, repairs, timeline, demandInfo, venue, howToFile, review]
    case 'other':
    default:
      return [preflight, parties, property, financial, demandInfo, venue, howToFile, review]
  }
}

/* ------------------------------------------------------------------ */
/*  Document title per sub-type                                        */
/* ------------------------------------------------------------------ */

function getDocumentTitle(subType: string): string {
  switch (subType) {
    case 'eviction':
      return 'Eviction Petition'
    case 'nonpayment':
      return 'Nonpayment of Rent Petition'
    case 'security_deposit':
      return 'Security Deposit Petition'
    case 'property_damage':
      return 'Property Damage Petition'
    case 'repair_maintenance':
      return 'Repair & Remedy Petition'
    case 'lease_termination':
      return 'Lease Termination Petition'
    case 'habitability':
      return 'Habitability Petition'
    default:
      return 'Landlord-Tenant Petition'
  }
}

function getDraftTitle(subType: string): string {
  switch (subType) {
    case 'eviction':
      return 'Your Eviction Petition Draft'
    case 'nonpayment':
      return 'Your Nonpayment of Rent Petition Draft'
    case 'security_deposit':
      return 'Your Security Deposit Petition Draft'
    case 'property_damage':
      return 'Your Property Damage Petition Draft'
    case 'repair_maintenance':
      return 'Your Repair & Remedy Petition Draft'
    case 'lease_termination':
      return 'Your Lease Termination Petition Draft'
    case 'habitability':
      return 'Your Habitability Petition Draft'
    default:
      return 'Your Landlord-Tenant Petition Draft'
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function LandlordTenantWizard({
  caseId,
  taskId,
  existingMetadata,
  landlordTenantDetails,
  caseData,
}: LandlordTenantWizardProps) {
  const router = useRouter()
  const meta = (existingMetadata ?? {}) as Record<string, unknown>
  const subType = landlordTenantDetails?.landlord_tenant_sub_type ?? 'other'
  const partyRole = landlordTenantDetails?.party_role ?? 'tenant'
  const isLandlord = partyRole === 'landlord'

  const steps = useMemo(() => getStepsForSubType(subType), [subType])
  const totalEstimateMinutes = 25

  /* ---- Party info ---- */
  const [landlordInfo, setLandlordInfo] = useState<PartyInfo>(
    (meta.landlord_info as PartyInfo) ?? { full_name: '' }
  )
  const [tenantInfo, setTenantInfo] = useState<PartyInfo>(
    (meta.tenant_info as PartyInfo) ?? { full_name: '' }
  )

  /* ---- Property details ---- */
  const [propertyAddress, setPropertyAddress] = useState<string>(
    (meta.property_address as string) ?? landlordTenantDetails?.property_address ?? ''
  )
  const [propertyType, setPropertyType] = useState<string>(
    (meta.property_type as string) ?? ''
  )
  const [unitNumber, setUnitNumber] = useState<string>(
    (meta.unit_number as string) ?? ''
  )

  /* ---- Lease details ---- */
  const [leaseStartDate, setLeaseStartDate] = useState<string>(
    (meta.lease_start_date as string) ?? landlordTenantDetails?.lease_start_date ?? ''
  )
  const [leaseEndDate, setLeaseEndDate] = useState<string>(
    (meta.lease_end_date as string) ?? landlordTenantDetails?.lease_end_date ?? ''
  )
  const [leaseType, setLeaseType] = useState<string>(
    (meta.lease_type as string) ?? landlordTenantDetails?.lease_type ?? ''
  )
  const [monthlyRent, setMonthlyRent] = useState<string>(
    (meta.monthly_rent as string) ?? (landlordTenantDetails?.monthly_rent != null ? String(landlordTenantDetails.monthly_rent) : '')
  )

  /* ---- Damages ---- */
  const [damageItems, setDamageItems] = useState<DamageItem[]>(
    (meta.damage_items as DamageItem[]) ?? []
  )
  const [depositAmount, setDepositAmount] = useState<string>(
    (meta.deposit_amount as string) ?? (landlordTenantDetails?.deposit_amount != null ? String(landlordTenantDetails.deposit_amount) : '')
  )

  /* ---- Eviction notice ---- */
  const [noticeDate, setNoticeDate] = useState<string>(
    (meta.notice_date as string) ?? landlordTenantDetails?.eviction_notice_date ?? ''
  )
  const [noticeType, setNoticeType] = useState<string>(
    (meta.notice_type as string) ?? landlordTenantDetails?.eviction_notice_type ?? ''
  )
  const [evictionReason, setEvictionReason] = useState<string>(
    (meta.eviction_reason as string) ?? ''
  )
  const [tenantCured, setTenantCured] = useState<string>(
    (meta.tenant_cured as string) ?? ''
  )

  /* ---- Repair history ---- */
  const [repairRequests, setRepairRequests] = useState<
    { date: string; issue: string; response: string; status: string }[]
  >((meta.repair_requests as { date: string; issue: string; response: string; status: string }[]) ?? [])

  /* ---- Deposit deductions ---- */
  const [depositDeductions, setDepositDeductions] = useState<
    { amount: number; reason: string }[]
  >((meta.deposit_deductions as { amount: number; reason: string }[]) ?? [])

  /* ---- Timeline ---- */
  const [timelineEvents, setTimelineEvents] = useState<
    { date: string; description: string }[]
  >((meta.timeline_events as { date: string; description: string }[]) ?? [])

  /* ---- Demand letter info ---- */
  const [demandLetterSent, setDemandLetterSent] = useState<boolean>(
    (meta.demand_letter_sent as boolean) ?? landlordTenantDetails?.demand_letter_sent ?? false
  )
  const [demandLetterDate, setDemandLetterDate] = useState<string>(
    (meta.demand_letter_date as string) ?? ''
  )
  const [deadlineDays, setDeadlineDays] = useState<string>(
    (meta.deadline_days as string) ?? '14'
  )
  const [preferredResolution, setPreferredResolution] = useState<string>(
    (meta.preferred_resolution as string) ?? ''
  )

  /* ---- Venue ---- */
  const [propertyCounty, setPropertyCounty] = useState<string>(
    (meta.property_county as string) ?? caseData.county ?? ''
  )
  const [defendantCounty, setDefendantCounty] = useState<string>(
    (meta.defendant_county as string) ?? ''
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

  /* ---- Property field change handler ---- */

  const handlePropertyFieldChange = useCallback(
    (field: string, value: string) => {
      switch (field) {
        case 'propertyAddress':
          setPropertyAddress(value)
          break
        case 'propertyType':
          setPropertyType(value)
          break
        case 'unitNumber':
          setUnitNumber(value)
          break
      }
    },
    []
  )

  /* ---- Lease field change handler ---- */

  const handleLeaseFieldChange = useCallback(
    (field: string, value: string) => {
      switch (field) {
        case 'leaseStartDate':
          setLeaseStartDate(value)
          break
        case 'leaseEndDate':
          setLeaseEndDate(value)
          break
        case 'leaseType':
          setLeaseType(value)
          break
        case 'monthlyRent':
          setMonthlyRent(value)
          break
      }
    },
    []
  )

  /* ---- Eviction notice field change handler ---- */

  const handleEvictionFieldChange = useCallback(
    (field: string, value: string) => {
      switch (field) {
        case 'noticeDate':
          setNoticeDate(value)
          break
        case 'noticeType':
          setNoticeType(value)
          break
        case 'reason':
          setEvictionReason(value)
          break
        case 'tenantCured':
          setTenantCured(value)
          break
      }
    },
    []
  )

  /* ---- Demand letter field change handler ---- */

  const handleDemandFieldChange = useCallback(
    (field: string, value: string | boolean) => {
      switch (field) {
        case 'demandLetterSent':
          setDemandLetterSent(value as boolean)
          break
        case 'demandLetterDate':
          setDemandLetterDate(value as string)
          break
        case 'deadlineDays':
          setDeadlineDays(value as string)
          break
        case 'preferredResolution':
          setPreferredResolution(value as string)
          break
      }
    },
    []
  )

  /* ---- Venue field change handler ---- */

  const handleVenueFieldChange = useCallback(
    (field: string, value: string) => {
      switch (field) {
        case 'propertyCounty':
          setPropertyCounty(value)
          break
        case 'defendantCounty':
          setDefendantCounty(value)
          break
      }
    },
    []
  )

  /* ---- Computed total damages ---- */

  const totalDamages = useMemo(() => {
    const result = calculateDamages({ items: damageItems })
    return result.totalDamages
  }, [damageItems])

  const validItems = useMemo(() => {
    const result = calculateDamages({ items: damageItems })
    return result.items
  }, [damageItems])

  /* ---- Build helpers ---- */

  const buildFacts = useCallback(() => {
    return {
      party_role: partyRole as 'landlord' | 'tenant',
      your_info: isLandlord ? landlordInfo : tenantInfo,
      other_party: isLandlord ? tenantInfo : landlordInfo,
      court_type: caseData.court_type as 'jp' | 'county' | 'district',
      county: propertyCounty || caseData.county || '',
      landlord_tenant_sub_type: subType,
      property_address: propertyAddress,
      claim_amount: totalDamages,
      damages_breakdown: validItems,
      description: '', // generated from context
      demand_letter_sent: demandLetterSent,
      demand_letter_date: demandLetterDate || undefined,
      // Conditional fields
      ...(leaseStartDate ? { lease_start_date: leaseStartDate } : {}),
      ...(leaseEndDate ? { lease_end_date: leaseEndDate } : {}),
      ...(leaseType ? { lease_type: leaseType } : {}),
      ...(monthlyRent ? { monthly_rent: parseFloat(monthlyRent) || undefined } : {}),
      ...(depositAmount ? { deposit_amount: parseFloat(depositAmount) || undefined } : {}),
      ...(noticeDate ? { eviction_notice_date: noticeDate } : {}),
      ...(noticeType ? { eviction_notice_type: noticeType } : {}),
      ...(evictionReason ? { eviction_reason: evictionReason } : {}),
      ...(repairRequests.length > 0 ? { repair_requests: repairRequests } : {}),
      ...(depositDeductions.length > 0 ? { deposit_deductions: depositDeductions } : {}),
    }
  }, [
    partyRole,
    isLandlord,
    landlordInfo,
    tenantInfo,
    caseData.court_type,
    caseData.county,
    propertyCounty,
    subType,
    propertyAddress,
    totalDamages,
    validItems,
    demandLetterSent,
    demandLetterDate,
    leaseStartDate,
    leaseEndDate,
    leaseType,
    monthlyRent,
    depositAmount,
    noticeDate,
    noticeType,
    evictionReason,
    repairRequests,
    depositDeductions,
  ])

  const buildMetadata = useCallback(() => {
    return {
      // Parties
      landlord_info: landlordInfo,
      tenant_info: tenantInfo,
      // Property
      property_address: propertyAddress,
      property_type: propertyType,
      unit_number: unitNumber,
      // Lease
      lease_start_date: leaseStartDate || null,
      lease_end_date: leaseEndDate || null,
      lease_type: leaseType || null,
      monthly_rent: monthlyRent || null,
      // Damages
      damage_items: damageItems,
      deposit_amount: depositAmount || null,
      // Eviction notice
      notice_date: noticeDate || null,
      notice_type: noticeType || null,
      eviction_reason: evictionReason || null,
      tenant_cured: tenantCured || null,
      // Repairs
      repair_requests: repairRequests,
      // Deposit deductions
      deposit_deductions: depositDeductions,
      // Timeline
      timeline_events: timelineEvents,
      // Demand letter
      demand_letter_sent: demandLetterSent,
      demand_letter_date: demandLetterDate || null,
      deadline_days: deadlineDays,
      preferred_resolution: preferredResolution || null,
      // Venue
      property_county: propertyCounty || null,
      defendant_county: defendantCounty || null,
      // Draft
      draft_text: draft || null,
      final_text: draft || null,
      annotations,
      // Filing method
      filing_method: filingMethod || null,
      // Wizard position
      _wizard_step: currentStep,
    }
  }, [
    landlordInfo,
    tenantInfo,
    propertyAddress,
    propertyType,
    unitNumber,
    leaseStartDate,
    leaseEndDate,
    leaseType,
    monthlyRent,
    damageItems,
    depositAmount,
    noticeDate,
    noticeType,
    evictionReason,
    tenantCured,
    repairRequests,
    depositDeductions,
    timelineEvents,
    demandLetterSent,
    demandLetterDate,
    deadlineDays,
    preferredResolution,
    propertyCounty,
    defendantCounty,
    draft,
    annotations,
    filingMethod,
    currentStep,
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
        body: JSON.stringify({
          document_type: `landlord_tenant_${subType}`,
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
    const stepId = steps[currentStep]?.id
    switch (stepId) {
      case 'preflight':
        return true
      case 'parties':
        return (
          landlordInfo.full_name.trim() !== '' &&
          tenantInfo.full_name.trim() !== ''
        )
      case 'property':
        return propertyAddress.trim() !== ''
      case 'lease':
        return true
      case 'financial':
        return damageItems.some((item) => item.amount > 0)
      case 'eviction_notice':
        return true
      case 'repairs':
        return true
      case 'deductions':
        return true
      case 'timeline':
        return true
      case 'demand_info':
        return true
      case 'venue':
        return true
      case 'how_to_file':
        return filingMethod !== ''
      case 'review':
        return true
      default:
        return true
    }
  }, [
    currentStep,
    steps,
    landlordInfo,
    tenantInfo,
    propertyAddress,
    damageItems,
    filingMethod,
  ])

  /* ---- Review step onEdit ---- */

  const handleReviewEdit = useCallback(
    (stepId: string) => {
      // Map review section stepIds to wizard step ids
      const mappedId =
        stepId === 'eviction-notice'
          ? 'eviction_notice'
          : stepId === 'demand-letter'
            ? 'demand_info'
            : stepId
      const idx = steps.findIndex((s) => s.id === mappedId)
      if (idx >= 0) setCurrentStep(idx)
    },
    [steps]
  )

  /* ---- Step rendering ---- */

  function renderStep() {
    const stepId = steps[currentStep]?.id
    switch (stepId) {
      case 'preflight':
        return (
          <LtPreflight
            subType={subType}
            partyRole={partyRole}
            onReady={() => setCurrentStep(currentStep + 1)}
          />
        )
      case 'parties':
        return (
          <LtPartiesStep
            partyRole={partyRole}
            landlordInfo={landlordInfo}
            tenantInfo={tenantInfo}
            onLandlordChange={setLandlordInfo}
            onTenantChange={setTenantInfo}
          />
        )
      case 'property':
        return (
          <LtPropertyStep
            propertyAddress={propertyAddress}
            propertyType={propertyType}
            unitNumber={unitNumber}
            onFieldChange={handlePropertyFieldChange}
          />
        )
      case 'lease':
        return (
          <LtLeaseStep
            leaseStartDate={leaseStartDate}
            leaseEndDate={leaseEndDate}
            leaseType={leaseType}
            monthlyRent={monthlyRent}
            onFieldChange={handleLeaseFieldChange}
          />
        )
      case 'financial':
        return (
          <LtFinancialStep
            items={damageItems}
            onItemsChange={setDamageItems}
            subType={subType}
            depositAmount={depositAmount}
            onDepositAmountChange={setDepositAmount}
          />
        )
      case 'eviction_notice':
        return (
          <EvictionNoticeStep
            noticeDate={noticeDate}
            noticeType={noticeType}
            reason={evictionReason}
            tenantCured={tenantCured}
            onFieldChange={handleEvictionFieldChange}
          />
        )
      case 'repairs':
        return (
          <RepairHistoryStep
            requests={repairRequests}
            onRequestsChange={setRepairRequests}
          />
        )
      case 'deductions':
        return (
          <DepositDeductionsStep
            deductions={depositDeductions}
            onDeductionsChange={setDepositDeductions}
            depositAmount={depositAmount}
          />
        )
      case 'timeline':
        return (
          <LtTimelineStep
            events={timelineEvents}
            onEventsChange={setTimelineEvents}
          />
        )
      case 'demand_info':
        return (
          <LtDemandInfoStep
            demandLetterSent={demandLetterSent}
            demandLetterDate={demandLetterDate}
            deadlineDays={deadlineDays}
            preferredResolution={preferredResolution}
            onFieldChange={handleDemandFieldChange}
          />
        )
      case 'venue':
        return (
          <LtVenueStep
            propertyCounty={propertyCounty}
            defendantCounty={defendantCounty}
            onFieldChange={handleVenueFieldChange}
          />
        )
      case 'how_to_file':
        return (
          <FilingMethodStep
            filingMethod={filingMethod}
            onFilingMethodChange={setFilingMethod}
            county={propertyCounty || caseData.county || ''}
            courtType={caseData.court_type}
            config={subType === 'eviction' || subType === 'nonpayment' ? FILING_CONFIGS.eviction : FILING_CONFIGS.landlord_tenant}
          />
        )
      case 'review':
        return (
          <LtReviewStep
            subType={subType}
            partyRole={partyRole}
            landlordInfo={landlordInfo}
            tenantInfo={tenantInfo}
            propertyAddress={propertyAddress}
            propertyType={propertyType}
            unitNumber={unitNumber}
            leaseStartDate={leaseStartDate}
            leaseEndDate={leaseEndDate}
            leaseType={leaseType}
            monthlyRent={monthlyRent}
            damageItems={damageItems}
            totalDamages={totalDamages}
            depositAmount={depositAmount}
            noticeDate={noticeDate}
            noticeType={noticeType}
            evictionReason={evictionReason}
            tenantCured={tenantCured}
            repairRequests={repairRequests}
            deductions={depositDeductions}
            timelineEvents={timelineEvents}
            demandLetterSent={demandLetterSent}
            demandLetterDate={demandLetterDate}
            deadlineDays={deadlineDays}
            preferredResolution={preferredResolution}
            propertyCounty={propertyCounty}
            defendantCounty={defendantCounty}
            onEdit={handleReviewEdit}
          />
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

        <h1 className="text-2xl font-semibold text-warm-text">
          {getDraftTitle(subType)}
        </h1>
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
              documentTitle={getDocumentTitle(subType)}
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
      title={`Prepare Your ${getDocumentTitle(subType)}`}
      steps={steps}
      currentStep={currentStep}
      onStepChange={setCurrentStep}
      onSave={handleSave}
      onComplete={handleComplete}
      canAdvance={canAdvance}
      totalEstimateMinutes={totalEstimateMinutes}
      completeButtonLabel={generating ? 'Generating...' : 'Generate My Document'}
    >
      {generating ? (
        <div className="flex items-center gap-3 py-12 justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-warm-muted" />
          <p className="text-sm text-warm-muted">
            Generating your {getDocumentTitle(subType).toLowerCase()}... This may take a moment.
          </p>
        </div>
      ) : (
        renderStep()
      )}
    </WizardShell>
  )
}
