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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChevronLeft, Loader2, Plus, Trash2, AlertTriangle, Camera, FileText, Shield, Receipt } from 'lucide-react'
import Link from 'next/link'
import { StepAuthoritySidebar } from './step-authority-sidebar'
import { isPropertyDamageSubType } from '@/lib/guided-steps/personal-injury/constants'
import { FilingMethodStep } from '@/components/step/filing-method-step'
import { FILING_CONFIGS } from '@/lib/filing-configs'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface MedicalProvider {
  name: string
  type: string
  dates: string
  amount: string
}

interface PersonalInjuryWizardProps {
  caseId: string
  taskId: string
  existingMetadata?: Record<string, unknown>
  personalInjuryDetails: {
    pi_sub_type?: string
    incident_date?: string
    incident_location?: string
    incident_description?: string
    police_report_filed?: boolean
    police_report_number?: string
    other_driver_name?: string
    other_driver_insurance?: string
    other_driver_policy_number?: string
    your_insurance_carrier?: string
    your_policy_number?: string
    injury_description?: string
    injury_severity?: string
    medical_providers?: unknown[]
    medical_expenses?: number
    lost_wages?: number
    property_damage_amount?: number
    pain_suffering_multiplier?: number
    premises_owner?: string
    product_name?: string
  } | null
  caseData: { county: string | null; court_type: string }
}

/* ------------------------------------------------------------------ */
/*  Sub-type helpers                                                    */
/* ------------------------------------------------------------------ */

const MOTOR_VEHICLE_TYPES = ['auto_accident', 'pedestrian_cyclist', 'rideshare', 'uninsured_motorist']

function getSubTypeLabel(subType: string): string {
  switch (subType) {
    case 'auto_accident': return 'Auto Accident'
    case 'pedestrian_cyclist': return 'Pedestrian/Cyclist'
    case 'rideshare': return 'Rideshare Accident'
    case 'uninsured_motorist': return 'Uninsured/Underinsured Motorist'
    case 'slip_and_fall': return 'Slip and Fall'
    case 'dog_bite': return 'Dog Bite'
    case 'product_liability': return 'Product Liability'
    case 'vehicle_damage': return 'Vehicle Damage'
    case 'property_damage_negligence': return 'Property Damage'
    case 'vandalism': return 'Vandalism'
    case 'other_property_damage': return 'Property Damage'
    case 'other': return 'Other Personal Injury'
    default: return 'Personal Injury'
  }
}

function getPreflightTip(subType: string): string {
  switch (subType) {
    case 'auto_accident':
    case 'pedestrian_cyclist':
    case 'rideshare':
    case 'uninsured_motorist':
      return 'For motor vehicle cases, the police crash report (CR-3) is especially helpful. You can request a copy from the responding agency or TxDOT.'
    case 'slip_and_fall':
      return 'For premises liability cases, photos of the exact hazard that caused your injury are critical. Try to document the condition as soon as possible.'
    case 'dog_bite':
      return 'For dog bite cases, document the animal, the owner, and any prior incidents you know of. Report to local animal control if you have not already.'
    case 'product_liability':
      return 'For product liability cases, preserve the defective product if possible. Do not discard packaging, manuals, or receipts.'
    case 'vehicle_damage':
      return 'For vehicle damage cases, get at least three repair estimates and document the damage with timestamped photos from multiple angles.'
    case 'property_damage_negligence':
      return 'For property damage cases, document the damage thoroughly with photos, get professional repair estimates, and preserve any evidence of what caused the damage.'
    case 'vandalism':
      return 'For vandalism cases, file a police report if you have not already. Preserve any surveillance footage and document the damage with photos before making repairs.'
    case 'other_property_damage':
      return 'Document all property damage with photos and written descriptions. Get professional repair estimates and keep all receipts.'
    default:
      return 'Gather all evidence related to how the injury happened and who was responsible.'
  }
}

/* ------------------------------------------------------------------ */
/*  Dynamic steps                                                      */
/* ------------------------------------------------------------------ */

function getStepsForSubType(subType: string): WizardStep[] {
  const preflight: WizardStep = { id: 'preflight', title: 'Before You Start', subtitle: "Let's make sure you have what you need." }
  const incident: WizardStep = { id: 'incident', title: 'What Happened', subtitle: 'Tell us about the incident.' }
  const otherDriver: WizardStep = { id: 'other_driver', title: 'Other Driver Info', subtitle: 'Information about the other driver.' }
  const premises: WizardStep = { id: 'premises', title: 'Property/Location Info', subtitle: 'Details about where it happened.' }
  const product: WizardStep = { id: 'product', title: 'Product Information', subtitle: 'Details about the defective product.' }
  const damageDetails: WizardStep = { id: 'damage_details', title: 'Damage Details', subtitle: 'Describe the property damage.' }
  const injuries: WizardStep = { id: 'injuries', title: 'Your Injuries', subtitle: 'Describe your injuries.' }
  const medical: WizardStep = { id: 'medical', title: 'Medical Treatment', subtitle: 'Your medical providers and costs.' }
  const damages: WizardStep = { id: 'damages', title: 'Your Damages', subtitle: 'Calculate your total damages.' }
  const insurance: WizardStep = { id: 'insurance', title: 'Insurance Information', subtitle: 'Your insurance details.' }
  const venue: WizardStep = { id: 'venue', title: 'Where to File', subtitle: "We'll help you pick the right court." }
  const howToFile: WizardStep = { id: 'how_to_file', title: 'How to File', subtitle: 'Choose how to submit your petition.' }
  const review: WizardStep = { id: 'review', title: 'Review Everything', subtitle: 'Check your information before generating.' }

  const common = [preflight, incident]

  // Property damage cases: no injuries/medical steps
  if (isPropertyDamageSubType(subType)) {
    if (subType === 'vehicle_damage') {
      return [...common, otherDriver, damageDetails, damages, insurance, venue, howToFile, review]
    }
    return [...common, damageDetails, damages, insurance, venue, howToFile, review]
  }

  const tail = [injuries, medical, damages, insurance, venue, howToFile, review]

  if (MOTOR_VEHICLE_TYPES.includes(subType)) {
    return [...common, otherDriver, ...tail]
  }
  if (subType === 'slip_and_fall') {
    return [...common, premises, ...tail]
  }
  if (subType === 'product_liability') {
    return [...common, product, ...tail]
  }
  return [...common, ...tail]
}

function getDocumentTitle(subType: string): string {
  const docType = isPropertyDamageSubType(subType) ? 'Property Damage Petition' : 'Personal Injury Petition'
  return `${docType} - ${getSubTypeLabel(subType)}`
}

function getDraftTitle(subType: string): string {
  return `Your ${getSubTypeLabel(subType)} Petition Draft`
}

/* ------------------------------------------------------------------ */
/*  Default severity multiplier                                        */
/* ------------------------------------------------------------------ */

function defaultMultiplier(severity: string): number {
  switch (severity) {
    case 'minor': return 1.5
    case 'moderate': return 3
    case 'severe': return 5
    default: return 1.5
  }
}

/* ------------------------------------------------------------------ */
/*  Suggest court type from total damages                              */
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
/*  Body part options                                                  */
/* ------------------------------------------------------------------ */

const BODY_PARTS = [
  'Head/Neck',
  'Shoulder',
  'Back',
  'Arm/Hand',
  'Hip/Leg',
  'Knee/Foot',
  'Other',
]

/* ------------------------------------------------------------------ */
/*  Provider type options                                              */
/* ------------------------------------------------------------------ */

const PROVIDER_TYPES = [
  { value: 'er', label: 'ER' },
  { value: 'orthopedic', label: 'Orthopedic' },
  { value: 'chiropractor', label: 'Chiropractor' },
  { value: 'physical_therapy', label: 'Physical Therapy' },
  { value: 'primary_care', label: 'Primary Care' },
  { value: 'imaging', label: 'Imaging' },
  { value: 'other', label: 'Other' },
]

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function PersonalInjuryWizard({
  caseId,
  taskId,
  existingMetadata,
  personalInjuryDetails,
  caseData,
}: PersonalInjuryWizardProps) {
  const router = useRouter()
  const meta = (existingMetadata ?? {}) as Record<string, unknown>
  const piSubType = personalInjuryDetails?.pi_sub_type ?? 'other_injury'
  const isPropertyDamage = isPropertyDamageSubType(piSubType)
  const totalEstimateMinutes = 35

  const steps = useMemo(() => getStepsForSubType(piSubType), [piSubType])

  /* ---- Incident ---- */
  const [incidentDate, setIncidentDate] = useState<string>(
    (meta.incident_date as string) ?? personalInjuryDetails?.incident_date ?? ''
  )
  const [incidentLocation, setIncidentLocation] = useState<string>(
    (meta.incident_location as string) ?? personalInjuryDetails?.incident_location ?? ''
  )
  const [incidentDescription, setIncidentDescription] = useState<string>(
    (meta.incident_description as string) ?? personalInjuryDetails?.incident_description ?? ''
  )
  const [policeReportFiled, setPoliceReportFiled] = useState<boolean | null>(
    (meta.police_report_filed as boolean | null) ?? personalInjuryDetails?.police_report_filed ?? null
  )
  const [policeReportNumber, setPoliceReportNumber] = useState<string>(
    (meta.police_report_number as string) ?? personalInjuryDetails?.police_report_number ?? ''
  )

  /* ---- Other driver (motor vehicle sub-types) ---- */
  const [otherDriverName, setOtherDriverName] = useState<string>(
    (meta.other_driver_name as string) ?? personalInjuryDetails?.other_driver_name ?? ''
  )
  const [otherDriverInsurance, setOtherDriverInsurance] = useState<string>(
    (meta.other_driver_insurance as string) ?? personalInjuryDetails?.other_driver_insurance ?? ''
  )
  const [otherDriverPolicyNumber, setOtherDriverPolicyNumber] = useState<string>(
    (meta.other_driver_policy_number as string) ?? personalInjuryDetails?.other_driver_policy_number ?? ''
  )
  const [licensePlate, setLicensePlate] = useState<string>(
    (meta.license_plate as string) ?? ''
  )

  /* ---- Premises (slip_and_fall) ---- */
  const [premisesOwnerName, setPremisesOwnerName] = useState<string>(
    (meta.premises_owner_name as string) ?? personalInjuryDetails?.premises_owner ?? ''
  )
  const [premisesAddress, setPremisesAddress] = useState<string>(
    (meta.premises_address as string) ?? ''
  )
  const [hazardDescription, setHazardDescription] = useState<string>(
    (meta.hazard_description as string) ?? ''
  )

  /* ---- Product (product_liability) ---- */
  const [productName, setProductName] = useState<string>(
    (meta.product_name as string) ?? personalInjuryDetails?.product_name ?? ''
  )
  const [manufacturer, setManufacturer] = useState<string>(
    (meta.manufacturer as string) ?? ''
  )
  const [purchaseDate, setPurchaseDate] = useState<string>(
    (meta.purchase_date as string) ?? ''
  )
  const [defectDescription, setDefectDescription] = useState<string>(
    (meta.defect_description as string) ?? ''
  )

  /* ---- Injuries ---- */
  const [injuryDescription, setInjuryDescription] = useState<string>(
    (meta.injury_description as string) ?? personalInjuryDetails?.injury_description ?? ''
  )
  const [injurySeverity, setInjurySeverity] = useState<string>(
    (meta.injury_severity as string) ?? personalInjuryDetails?.injury_severity ?? ''
  )
  const [bodyPartsAffected, setBodyPartsAffected] = useState<string[]>(
    (meta.body_parts_affected as string[]) ?? []
  )

  /* ---- Medical providers ---- */
  const [medicalProviders, setMedicalProviders] = useState<MedicalProvider[]>(
    (meta.medical_providers as MedicalProvider[]) ??
      (personalInjuryDetails?.medical_providers as MedicalProvider[] | undefined) ??
      []
  )

  /* ---- Damages ---- */
  const [lostWages, setLostWages] = useState<string>(
    (meta.lost_wages as string) ??
      (personalInjuryDetails?.lost_wages != null ? String(personalInjuryDetails.lost_wages) : '')
  )
  const [propertyDamage, setPropertyDamage] = useState<string>(
    (meta.property_damage as string) ??
      (personalInjuryDetails?.property_damage_amount != null
        ? String(personalInjuryDetails.property_damage_amount)
        : '')
  )
  const [painSufferingMultiplier, setPainSufferingMultiplier] = useState<number>(
    (meta.pain_suffering_multiplier as number) ??
      personalInjuryDetails?.pain_suffering_multiplier ??
      defaultMultiplier(personalInjuryDetails?.injury_severity ?? '')
  )

  /* ---- Property damage details (property damage sub-types) ---- */
  const [propertyDamageDescription, setPropertyDamageDescription] = useState<string>(
    (meta.property_damage_description as string) ?? ''
  )
  const [damageSeverity, setDamageSeverity] = useState<string>(
    (meta.damage_severity as string) ?? ''
  )
  const [repairEstimate, setRepairEstimate] = useState<string>(
    (meta.repair_estimate as string) ?? ''
  )
  const [hasRepairReceipts, setHasRepairReceipts] = useState<boolean>(
    (meta.has_repair_receipts as boolean) ?? false
  )
  const [lossOfUse, setLossOfUse] = useState<string>(
    (meta.loss_of_use as string) ?? ''
  )
  const [additionalCosts, setAdditionalCosts] = useState<string>(
    (meta.additional_costs as string) ?? ''
  )

  /* ---- Insurance ---- */
  const [yourInsuranceCarrier, setYourInsuranceCarrier] = useState<string>(
    (meta.your_insurance_carrier as string) ?? personalInjuryDetails?.your_insurance_carrier ?? ''
  )
  const [yourPolicyNumber, setYourPolicyNumber] = useState<string>(
    (meta.your_policy_number as string) ?? personalInjuryDetails?.your_policy_number ?? ''
  )
  const [umUimCoverage, setUmUimCoverage] = useState<boolean>(
    (meta.um_uim_coverage as boolean) ?? false
  )

  /* ---- Your info ---- */
  const [yourName, setYourName] = useState<string>((meta.your_name as string) ?? '')
  const [yourAddress, setYourAddress] = useState<string>((meta.your_address as string) ?? '')
  const [yourCity, setYourCity] = useState<string>((meta.your_city as string) ?? '')
  const [yourState, setYourState] = useState<string>((meta.your_state as string) ?? 'TX')
  const [yourZip, setYourZip] = useState<string>((meta.your_zip as string) ?? '')

  /* ---- Venue ---- */
  const [county, setCounty] = useState<string>(
    (meta.county as string) ?? caseData.county ?? ''
  )
  const [courtType, setCourtType] = useState<string>(
    (meta.court_type as string) ?? caseData.court_type ?? 'jp'
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
  const [selectedAuthorityIds, setSelectedAuthorityIds] = useState<number[]>([])

  /* ---- Computed: total medical from providers ---- */

  const totalMedical = useMemo(() => {
    return medicalProviders.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)
  }, [medicalProviders])

  /* ---- Computed: pain & suffering ---- */

  const painSufferingAmount = useMemo(() => {
    return totalMedical * painSufferingMultiplier
  }, [totalMedical, painSufferingMultiplier])

  /* ---- Computed: grand total damages ---- */

  const grandTotal = useMemo(() => {
    const lost = parseFloat(lostWages) || 0
    const prop = parseFloat(propertyDamage) || 0
    return totalMedical + lost + prop + painSufferingAmount
  }, [totalMedical, lostWages, propertyDamage, painSufferingAmount])

  const propertyGrandTotal = useMemo(() => {
    return (parseFloat(repairEstimate) || 0) +
      (parseFloat(lossOfUse) || 0) +
      (parseFloat(additionalCosts) || 0)
  }, [repairEstimate, lossOfUse, additionalCosts])

  const effectiveGrandTotal = isPropertyDamage ? propertyGrandTotal : grandTotal

  /* ---- Medical provider handlers ---- */

  const addProvider = useCallback(() => {
    setMedicalProviders((prev) => [
      ...prev,
      { name: '', type: 'er', dates: '', amount: '' },
    ])
  }, [])

  const removeProvider = useCallback((index: number) => {
    setMedicalProviders((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const updateProvider = useCallback(
    (index: number, field: keyof MedicalProvider, value: string) => {
      setMedicalProviders((prev) =>
        prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
      )
    },
    []
  )

  /* ---- Body parts toggle ---- */

  const toggleBodyPart = useCallback((part: string) => {
    setBodyPartsAffected((prev) =>
      prev.includes(part) ? prev.filter((p) => p !== part) : [...prev, part]
    )
  }, [])

  /* ---- Build negligence theory from sub-type context ---- */

  const buildNegligenceTheory = useCallback(() => {
    switch (piSubType) {
      case 'auto_accident':
      case 'pedestrian_cyclist':
      case 'rideshare':
      case 'uninsured_motorist':
        return `${otherDriverName || 'The defendant'} negligently operated a motor vehicle, including but not limited to: failing to maintain a proper lookout, failing to control speed, failing to yield the right of way, and other acts of negligence, proximately causing the incident on ${incidentDate} at ${incidentLocation}.`
      case 'slip_and_fall':
        return `${premisesOwnerName || 'The property owner'} negligently maintained the premises at ${premisesAddress || incidentLocation}, knew or should have known of the dangerous condition described as: ${hazardDescription || incidentDescription}, and failed to warn or make safe, proximately causing injury.`
      case 'dog_bite':
        return `The defendant owned or harbored an animal with known dangerous propensities, and negligently failed to restrain or control the animal, proximately causing the bite/attack on ${incidentDate} at ${incidentLocation}.`
      case 'product_liability':
        return `${manufacturer || 'The manufacturer'} designed, manufactured, and/or sold a defective product (${productName || 'the product'}), which was unreasonably dangerous due to: ${defectDescription || 'a defect'}, proximately causing injury.`
      case 'vehicle_damage':
        return `The defendant negligently operated their vehicle on ${incidentDate} at ${incidentLocation}, causing damage to Plaintiff's property. ${incidentDescription}`
      case 'property_damage_negligence':
        return `The defendant's negligent actions on ${incidentDate} at ${incidentLocation} proximately caused damage to Plaintiff's property. ${incidentDescription}`
      case 'vandalism':
        return `The defendant intentionally or recklessly damaged Plaintiff's property on ${incidentDate} at ${incidentLocation}. ${incidentDescription}`
      case 'other_property_damage':
        return `The defendant's negligent or wrongful conduct on ${incidentDate} at ${incidentLocation} caused damage to Plaintiff's property. ${incidentDescription}`
      default:
        return `The defendant acted negligently, proximately causing the incident on ${incidentDate} at ${incidentLocation}. ${incidentDescription}`
    }
  }, [piSubType, otherDriverName, incidentDate, incidentLocation, premisesOwnerName, premisesAddress, hazardDescription, incidentDescription, manufacturer, productName, defectDescription])

  /* ---- Build helpers ---- */

  const buildFacts = useCallback(() => {
    const lost = parseFloat(lostWages) || 0
    const prop = parseFloat(propertyDamage) || 0

    const opposingParties = []

    // Add opposing party based on sub-type
    if (MOTOR_VEHICLE_TYPES.includes(piSubType) && otherDriverName) {
      opposingParties.push({ full_name: otherDriverName })
    } else if (piSubType === 'slip_and_fall' && premisesOwnerName) {
      opposingParties.push({ full_name: premisesOwnerName })
    } else if (piSubType === 'product_liability' && manufacturer) {
      opposingParties.push({ full_name: manufacturer })
    } else {
      opposingParties.push({ full_name: 'Unknown Defendant' })
    }

    return {
      your_info: {
        full_name: yourName,
        address: yourAddress || undefined,
        city: yourCity || undefined,
        state: yourState || undefined,
        zip: yourZip || undefined,
      },
      opposing_parties: opposingParties,
      court_type: courtType as 'jp' | 'county' | 'district',
      county: county || '',
      cause_number: causeNumber || undefined,
      pi_sub_type: piSubType,
      incident_date: incidentDate,
      incident_location: incidentLocation,
      incident_description: incidentDescription,
      ...(isPropertyDamage
        ? {
            property_damage_description: propertyDamageDescription,
            damage_severity: damageSeverity,
          }
        : {
            injuries_description: injuryDescription,
            injury_severity: injurySeverity as 'minor' | 'moderate' | 'severe',
          }),
      damages: isPropertyDamage
        ? {
            repair_estimate: parseFloat(repairEstimate) || 0,
            loss_of_use: parseFloat(lossOfUse) || 0,
            additional_costs: parseFloat(additionalCosts) || 0,
            total: propertyGrandTotal,
          }
        : {
            medical: totalMedical,
            lost_wages: lost,
            property_damage: prop,
            pain_suffering: painSufferingAmount,
            total: grandTotal,
          },
      negligence_theory: buildNegligenceTheory(),
      prior_demand_sent: false,
    }
  }, [
    lostWages,
    propertyDamage,
    piSubType,
    otherDriverName,
    premisesOwnerName,
    manufacturer,
    yourName,
    yourAddress,
    yourCity,
    yourState,
    yourZip,
    courtType,
    county,
    causeNumber,
    incidentDate,
    incidentLocation,
    incidentDescription,
    isPropertyDamage,
    injuryDescription,
    injurySeverity,
    propertyDamageDescription,
    damageSeverity,
    repairEstimate,
    lossOfUse,
    additionalCosts,
    propertyGrandTotal,
    totalMedical,
    painSufferingAmount,
    grandTotal,
    buildNegligenceTheory,
  ])

  const buildMetadata = useCallback(
    () => ({
      // Incident
      incident_date: incidentDate || null,
      incident_location: incidentLocation || null,
      incident_description: incidentDescription || null,
      police_report_filed: policeReportFiled,
      police_report_number: policeReportNumber || null,
      // Other driver
      other_driver_name: otherDriverName || null,
      other_driver_insurance: otherDriverInsurance || null,
      other_driver_policy_number: otherDriverPolicyNumber || null,
      license_plate: licensePlate || null,
      // Premises
      premises_owner_name: premisesOwnerName || null,
      premises_address: premisesAddress || null,
      hazard_description: hazardDescription || null,
      // Product
      product_name: productName || null,
      manufacturer: manufacturer || null,
      purchase_date: purchaseDate || null,
      defect_description: defectDescription || null,
      // Injuries
      injury_description: injuryDescription || null,
      injury_severity: injurySeverity || null,
      body_parts_affected: bodyPartsAffected,
      // Medical
      medical_providers: medicalProviders,
      // Damages
      lost_wages: lostWages || null,
      property_damage: propertyDamage || null,
      pain_suffering_multiplier: painSufferingMultiplier,
      // Property damage details (property damage sub-types)
      ...(isPropertyDamage ? {
        property_damage_description: propertyDamageDescription,
        damage_severity: damageSeverity,
        repair_estimate: repairEstimate,
        has_repair_receipts: hasRepairReceipts,
        loss_of_use: lossOfUse,
        additional_costs: additionalCosts,
      } : {}),
      // Insurance
      your_insurance_carrier: yourInsuranceCarrier || null,
      your_policy_number: yourPolicyNumber || null,
      um_uim_coverage: umUimCoverage,
      // Your info
      your_name: yourName || null,
      your_address: yourAddress || null,
      your_city: yourCity || null,
      your_state: yourState || null,
      your_zip: yourZip || null,
      // Venue
      county: county || null,
      court_type: courtType || null,
      cause_number: causeNumber || null,
      // Filing method
      filing_method: filingMethod || null,
      // Draft
      draft_text: draft || null,
      final_text: draft || null,
      annotations,
      // Wizard position
      _wizard_step: currentStep,
    }),
    [
      incidentDate,
      incidentLocation,
      incidentDescription,
      policeReportFiled,
      policeReportNumber,
      otherDriverName,
      otherDriverInsurance,
      otherDriverPolicyNumber,
      licensePlate,
      premisesOwnerName,
      premisesAddress,
      hazardDescription,
      productName,
      manufacturer,
      purchaseDate,
      defectDescription,
      injuryDescription,
      injurySeverity,
      bodyPartsAffected,
      medicalProviders,
      lostWages,
      propertyDamage,
      painSufferingMultiplier,
      isPropertyDamage,
      propertyDamageDescription,
      damageSeverity,
      repairEstimate,
      hasRepairReceipts,
      lossOfUse,
      additionalCosts,
      yourInsuranceCarrier,
      yourPolicyNumber,
      umUimCoverage,
      yourName,
      yourAddress,
      yourCity,
      yourState,
      yourZip,
      county,
      courtType,
      causeNumber,
      filingMethod,
      draft,
      annotations,
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
          document_type: 'pi_petition',
          facts: buildFacts(),
          authority_cluster_ids: selectedAuthorityIds.length > 0 ? selectedAuthorityIds : undefined,
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
      case 'incident':
        return (
          incidentDate.trim() !== '' &&
          incidentLocation.trim() !== '' &&
          incidentDescription.trim().length >= 10
        )
      case 'other_driver':
        return otherDriverName.trim() !== ''
      case 'premises':
        return premisesOwnerName.trim() !== ''
      case 'product':
        return productName.trim() !== ''
      case 'damage_details':
        return propertyDamageDescription.trim().length >= 10
      case 'injuries':
        return (
          injuryDescription.trim().length >= 10 &&
          injurySeverity !== ''
        )
      case 'medical':
        return true // medical providers are helpful but not strictly required
      case 'damages':
        return effectiveGrandTotal > 0
      case 'insurance':
        return true
      case 'venue':
        return county.trim() !== '' && courtType !== ''
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
    incidentDate,
    incidentLocation,
    incidentDescription,
    otherDriverName,
    premisesOwnerName,
    productName,
    propertyDamageDescription,
    injuryDescription,
    injurySeverity,
    effectiveGrandTotal,
    county,
    courtType,
    filingMethod,
  ])

  /* ---- Review step onEdit ---- */

  const handleReviewEdit = useCallback(
    (stepId: string) => {
      const idx = steps.findIndex((s) => s.id === stepId)
      if (idx >= 0) setCurrentStep(idx)
    },
    [steps]
  )

  /* ---- Step rendering ---- */

  function renderStep() {
    const stepId = steps[currentStep]?.id

    switch (stepId) {
      /* ============================================================ */
      /*  PREFLIGHT                                                    */
      /* ============================================================ */
      case 'preflight':
        return (
          <div className="space-y-4">
            <p className="text-sm text-warm-muted">
              Before we begin preparing your {getSubTypeLabel(piSubType).toLowerCase()} petition,
              gather these items if you have them:
            </p>

            <div className="space-y-3">
              {(isPropertyDamage
                ? [
                    { icon: Camera, label: 'Photos of the damage (multiple angles)' },
                    { icon: FileText, label: 'Repair estimates or invoices' },
                    { icon: Shield, label: 'Police report (if filed)' },
                    { icon: Shield, label: 'Insurance information (yours and theirs)' },
                    { icon: Receipt, label: 'Receipts for damaged property or repairs' },
                  ]
                : [
                    { icon: Camera, label: 'Photos of injuries and scene' },
                    { icon: FileText, label: 'Medical records and bills' },
                    { icon: Shield, label: 'Police report (if filed)' },
                    { icon: Shield, label: 'Insurance information (yours and theirs)' },
                    { icon: Receipt, label: 'Bills and receipts for expenses' },
                  ]
              ).map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-calm-indigo/10 flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-calm-indigo" />
                  </div>
                  <span className="text-sm text-warm-text">{label}</span>
                </div>
              ))}
            </div>

            <div className="rounded-lg border border-calm-amber bg-calm-amber/5 p-3 mt-4">
              <div className="flex gap-2">
                <AlertTriangle className="h-4 w-4 text-calm-amber shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-warm-text">Tip for {getSubTypeLabel(piSubType)} cases</p>
                  <p className="text-xs text-warm-muted mt-1">{getPreflightTip(piSubType)}</p>
                </div>
              </div>
            </div>

            <p className="text-xs text-warm-muted">
              Don&apos;t have everything? That&apos;s okay. You can always come back and update later.
            </p>
          </div>
        )

      /* ============================================================ */
      /*  INCIDENT                                                     */
      /* ============================================================ */
      case 'incident':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="incident-date">Incident Date</Label>
              <Input
                id="incident-date"
                type="date"
                value={incidentDate}
                onChange={(e) => setIncidentDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="incident-location">Incident Location</Label>
              <Input
                id="incident-location"
                placeholder="e.g. Intersection of Main St and 5th Ave, Austin, TX"
                value={incidentLocation}
                onChange={(e) => setIncidentLocation(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="incident-description">What happened?</Label>
              <Textarea
                id="incident-description"
                placeholder={isPropertyDamage
                  ? "Describe the incident in detail. Include who was involved, what happened, and how your property was damaged."
                  : "Describe the incident in detail. Include who was involved, what happened, and how it led to your injuries."}
                value={incidentDescription}
                onChange={(e) => setIncidentDescription(e.target.value)}
                rows={5}
              />
              <p className="text-xs text-warm-muted">Minimum 10 characters</p>
            </div>

            <div className="space-y-2">
              <Label>Was a police report filed?</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={policeReportFiled === true ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPoliceReportFiled(true)}
                >
                  Yes
                </Button>
                <Button
                  type="button"
                  variant={policeReportFiled === false ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPoliceReportFiled(false)}
                >
                  No
                </Button>
              </div>
            </div>

            {policeReportFiled && (
              <div className="space-y-2">
                <Label htmlFor="police-report-number">Police Report Number</Label>
                <Input
                  id="police-report-number"
                  placeholder="e.g. APD-2024-001234"
                  value={policeReportNumber}
                  onChange={(e) => setPoliceReportNumber(e.target.value)}
                />
              </div>
            )}
          </div>
        )

      /* ============================================================ */
      /*  OTHER DRIVER                                                 */
      /* ============================================================ */
      case 'other_driver':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="other-driver-name">Other Driver&apos;s Name</Label>
              <Input
                id="other-driver-name"
                placeholder="Full name"
                value={otherDriverName}
                onChange={(e) => setOtherDriverName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="other-driver-insurance">Other Driver&apos;s Insurance Carrier</Label>
              <Input
                id="other-driver-insurance"
                placeholder="e.g. State Farm, Geico, Progressive"
                value={otherDriverInsurance}
                onChange={(e) => setOtherDriverInsurance(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="other-driver-policy">Other Driver&apos;s Policy Number</Label>
              <Input
                id="other-driver-policy"
                placeholder="Policy number"
                value={otherDriverPolicyNumber}
                onChange={(e) => setOtherDriverPolicyNumber(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="license-plate">License Plate</Label>
              <Input
                id="license-plate"
                placeholder="e.g. ABC-1234"
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value)}
              />
            </div>
          </div>
        )

      /* ============================================================ */
      /*  PREMISES                                                     */
      /* ============================================================ */
      case 'premises':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="premises-owner">Property Owner Name</Label>
              <Input
                id="premises-owner"
                placeholder="Full name or business name"
                value={premisesOwnerName}
                onChange={(e) => setPremisesOwnerName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="premises-address">Property Address</Label>
              <Input
                id="premises-address"
                placeholder="Full address of the property"
                value={premisesAddress}
                onChange={(e) => setPremisesAddress(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hazard-description">Hazard Description</Label>
              <Textarea
                id="hazard-description"
                placeholder="Describe the dangerous condition that caused your injury (e.g. wet floor with no warning sign, broken handrail, uneven sidewalk)"
                value={hazardDescription}
                onChange={(e) => setHazardDescription(e.target.value)}
                rows={4}
              />
            </div>
          </div>
        )

      /* ============================================================ */
      /*  PRODUCT                                                      */
      /* ============================================================ */
      case 'product':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="product-name">Product Name</Label>
              <Input
                id="product-name"
                placeholder="Name or model of the product"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="manufacturer">Manufacturer</Label>
              <Input
                id="manufacturer"
                placeholder="Who made the product?"
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchase-date">Purchase Date</Label>
              <Input
                id="purchase-date"
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="defect-description">Defect Description</Label>
              <Textarea
                id="defect-description"
                placeholder="Describe the defect in the product and how it caused your injury"
                value={defectDescription}
                onChange={(e) => setDefectDescription(e.target.value)}
                rows={4}
              />
            </div>
          </div>
        )

      /* ============================================================ */
      /*  DAMAGE DETAILS (property damage sub-types)                   */
      /* ============================================================ */
      case 'damage_details':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="damage-description">Describe the Damage</Label>
              <Textarea
                id="damage-description"
                placeholder="Describe all property damage in detail (e.g. front bumper crushed, hood dented, fence destroyed, water damage to living room)"
                value={propertyDamageDescription}
                onChange={(e) => setPropertyDamageDescription(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-warm-muted">Be as specific as possible about what was damaged and how.</p>
            </div>

            <div className="space-y-2">
              <Label>Damage Severity</Label>
              <div className="flex gap-2">
                {(['minor', 'moderate', 'severe', 'total_loss'] as const).map((s) => (
                  <Button
                    key={s}
                    type="button"
                    variant={damageSeverity === s ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDamageSeverity(s)}
                  >
                    {s === 'total_loss' ? 'Total Loss' : s.charAt(0).toUpperCase() + s.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="repair-estimate">Repair/Replacement Estimate ($)</Label>
              <Input
                id="repair-estimate"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={repairEstimate}
                onChange={(e) => setRepairEstimate(e.target.value)}
              />
              <p className="text-xs text-warm-muted">
                Professional estimate from a contractor, mechanic, or appraiser.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Checkbox
                id="has-repair-receipts"
                checked={hasRepairReceipts}
                onCheckedChange={(c) => setHasRepairReceipts(c === true)}
              />
              <Label htmlFor="has-repair-receipts" className="text-sm cursor-pointer">
                I have repair estimates or receipts to upload
              </Label>
            </div>
          </div>
        )

      /* ============================================================ */
      /*  INJURIES                                                     */
      /* ============================================================ */
      case 'injuries':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="injury-description">Describe Your Injuries</Label>
              <Textarea
                id="injury-description"
                placeholder="Describe all injuries you sustained (e.g. herniated disc at L4-L5, concussion, laceration to left forearm)"
                value={injuryDescription}
                onChange={(e) => setInjuryDescription(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-warm-muted">Minimum 10 characters</p>
            </div>

            <div className="space-y-2">
              <Label>Injury Severity</Label>
              <div className="flex gap-2">
                {(['minor', 'moderate', 'severe'] as const).map((s) => (
                  <Button
                    key={s}
                    type="button"
                    variant={injurySeverity === s ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setInjurySeverity(s)
                      // Auto-adjust multiplier when severity changes
                      setPainSufferingMultiplier(defaultMultiplier(s))
                    }}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Body Parts Affected</Label>
              <div className="grid grid-cols-2 gap-2">
                {BODY_PARTS.map((part) => (
                  <div key={part} className="flex items-center gap-2">
                    <Checkbox
                      id={`body-part-${part}`}
                      checked={bodyPartsAffected.includes(part)}
                      onCheckedChange={() => toggleBodyPart(part)}
                    />
                    <Label htmlFor={`body-part-${part}`} className="text-sm cursor-pointer">
                      {part}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      /* ============================================================ */
      /*  MEDICAL                                                      */
      /* ============================================================ */
      case 'medical':
        return (
          <div className="space-y-4">
            <p className="text-sm text-warm-muted">
              Add each medical provider who treated you. This helps calculate your medical damages.
            </p>

            {medicalProviders.map((provider, index) => (
              <div
                key={index}
                className="rounded-lg border border-warm-border p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-warm-text">
                    Provider {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeProvider(index)}
                    className="text-warm-muted hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 space-y-1">
                    <Label htmlFor={`provider-name-${index}`} className="text-xs">
                      Provider Name
                    </Label>
                    <Input
                      id={`provider-name-${index}`}
                      placeholder="e.g. Austin Regional Clinic"
                      value={provider.name}
                      onChange={(e) => updateProvider(index, 'name', e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor={`provider-type-${index}`} className="text-xs">
                      Type
                    </Label>
                    <Select
                      value={provider.type}
                      onValueChange={(v) => updateProvider(index, 'type', v)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {PROVIDER_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor={`provider-dates-${index}`} className="text-xs">
                      Treatment Dates
                    </Label>
                    <Input
                      id={`provider-dates-${index}`}
                      placeholder="e.g. Jan-Mar 2024"
                      value={provider.dates}
                      onChange={(e) => updateProvider(index, 'dates', e.target.value)}
                    />
                  </div>

                  <div className="col-span-2 space-y-1">
                    <Label htmlFor={`provider-amount-${index}`} className="text-xs">
                      Amount Billed ($)
                    </Label>
                    <Input
                      id={`provider-amount-${index}`}
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={provider.amount}
                      onChange={(e) => updateProvider(index, 'amount', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addProvider}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Provider
            </Button>

            {medicalProviders.length > 0 && (
              <div className="rounded-lg bg-warm-surface p-3 text-right">
                <span className="text-sm text-warm-muted">Total Medical: </span>
                <span className="text-sm font-semibold text-warm-text">
                  ${totalMedical.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            )}
          </div>
        )

      /* ============================================================ */
      /*  DAMAGES                                                      */
      /* ============================================================ */
      case 'damages':
        return (
          <div className="space-y-4">
            {isPropertyDamage ? (
              <>
                {/* Repair/replacement cost (from damage details) */}
                <div className="space-y-2">
                  <Label>Repair/Replacement Cost</Label>
                  <div className="rounded-lg border border-warm-border p-3 bg-warm-surface/50">
                    <p className="text-sm font-medium text-warm-text">
                      ${(parseFloat(repairEstimate) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-warm-muted">From the Damage Details step</p>
                  </div>
                </div>

                {/* Loss of use */}
                <div className="space-y-2">
                  <Label htmlFor="loss-of-use">Loss of Use ($)</Label>
                  <Input
                    id="loss-of-use"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={lossOfUse}
                    onChange={(e) => setLossOfUse(e.target.value)}
                  />
                  <p className="text-xs text-warm-muted">
                    Rental car costs, temporary housing, or other costs from not having your property.
                  </p>
                </div>

                {/* Additional out-of-pocket */}
                <div className="space-y-2">
                  <Label htmlFor="additional-costs">Additional Out-of-Pocket Costs ($)</Label>
                  <Input
                    id="additional-costs"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={additionalCosts}
                    onChange={(e) => setAdditionalCosts(e.target.value)}
                  />
                  <p className="text-xs text-warm-muted">
                    Towing, storage, temporary fixes, or other related expenses.
                  </p>
                </div>

                {/* Grand total for property damage */}
                <div className="rounded-lg bg-warm-surface p-4 border border-warm-border">
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between text-warm-muted">
                      <span>Repair/replacement</span>
                      <span>${(parseFloat(repairEstimate) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-warm-muted">
                      <span>Loss of use</span>
                      <span>${(parseFloat(lossOfUse) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-warm-muted">
                      <span>Additional costs</span>
                      <span>${(parseFloat(additionalCosts) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="border-t border-warm-border pt-2 mt-2 flex justify-between font-semibold text-warm-text">
                      <span>Grand Total</span>
                      <span>${propertyGrandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Medical expenses (read-only, auto-summed) */}
                <div className="space-y-2">
                  <Label>Medical Expenses</Label>
                  <div className="rounded-lg border border-warm-border p-3 bg-warm-surface/50">
                    <p className="text-sm font-medium text-warm-text">
                      ${totalMedical.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-warm-muted">Auto-calculated from medical providers</p>
                  </div>
                </div>

                {/* Lost wages */}
                <div className="space-y-2">
                  <Label htmlFor="lost-wages">Lost Wages ($)</Label>
                  <Input
                    id="lost-wages"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={lostWages}
                    onChange={(e) => setLostWages(e.target.value)}
                  />
                  <p className="text-xs text-warm-muted">
                    Total lost income from missed work due to your injuries.
                  </p>
                </div>

                {/* Property damage */}
                <div className="space-y-2">
                  <Label htmlFor="property-damage">Property Damage ($)</Label>
                  <Input
                    id="property-damage"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={propertyDamage}
                    onChange={(e) => setPropertyDamage(e.target.value)}
                  />
                  <p className="text-xs text-warm-muted">
                    Vehicle repair, personal property, etc.
                  </p>
                </div>

                {/* Pain & suffering multiplier */}
                <div className="space-y-2">
                  <Label>Pain & Suffering Multiplier</Label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="1.5"
                      max="5"
                      step="0.5"
                      value={painSufferingMultiplier}
                      onChange={(e) => setPainSufferingMultiplier(parseFloat(e.target.value))}
                      className="w-full accent-calm-indigo"
                    />
                    <div className="flex justify-between text-xs text-warm-muted">
                      <span>1.5x</span>
                      <span>3x</span>
                      <span>5x</span>
                    </div>
                  </div>
                  <div className="rounded-lg border border-calm-indigo/20 bg-calm-indigo/5 p-3">
                    <p className="text-sm text-warm-text">
                      Pain & suffering = {painSufferingMultiplier}x x ${totalMedical.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ={' '}
                      <span className="font-semibold">
                        ${painSufferingAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Grand total */}
                <div className="rounded-lg bg-warm-surface p-4 border border-warm-border">
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between text-warm-muted">
                      <span>Medical expenses</span>
                      <span>${totalMedical.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-warm-muted">
                      <span>Lost wages</span>
                      <span>${(parseFloat(lostWages) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-warm-muted">
                      <span>Property damage</span>
                      <span>${(parseFloat(propertyDamage) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-warm-muted">
                      <span>Pain & suffering ({painSufferingMultiplier}x)</span>
                      <span>${painSufferingAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="border-t border-warm-border pt-2 mt-2 flex justify-between font-semibold text-warm-text">
                      <span>Grand Total</span>
                      <span>${grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )

      /* ============================================================ */
      /*  INSURANCE                                                    */
      /* ============================================================ */
      case 'insurance':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="your-insurance">Your Insurance Carrier</Label>
              <Input
                id="your-insurance"
                placeholder="e.g. State Farm, USAA"
                value={yourInsuranceCarrier}
                onChange={(e) => setYourInsuranceCarrier(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="your-policy">Your Policy Number</Label>
              <Input
                id="your-policy"
                placeholder="Policy number"
                value={yourPolicyNumber}
                onChange={(e) => setYourPolicyNumber(e.target.value)}
              />
            </div>

            {MOTOR_VEHICLE_TYPES.includes(piSubType) && (
              <>
                <div className="space-y-2">
                  <Label>Other Party&apos;s Insurance</Label>
                  <div className="rounded-lg border border-warm-border p-3 bg-warm-surface/50">
                    <p className="text-sm text-warm-text">
                      {otherDriverInsurance || 'Not provided'}
                    </p>
                    <p className="text-xs text-warm-muted">From the Other Driver Info step</p>
                  </div>
                </div>
              </>
            )}

            <div className="flex items-center gap-2 pt-2">
              <Checkbox
                id="um-uim"
                checked={umUimCoverage}
                onCheckedChange={(c) => setUmUimCoverage(c === true)}
              />
              <Label htmlFor="um-uim" className="text-sm cursor-pointer">
                I have UM/UIM (Uninsured/Underinsured Motorist) coverage
              </Label>
            </div>
          </div>
        )

      /* ============================================================ */
      /*  VENUE                                                        */
      /* ============================================================ */
      case 'venue': {
        const suggested = suggestCourtType(effectiveGrandTotal)
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
              {effectiveGrandTotal > 0 && (
                <p className="text-xs text-warm-muted">
                  Based on your total damages of ${effectiveGrandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })},
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
            config={FILING_CONFIGS.personal_injury}
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

            {/* Incident */}
            <ReviewSection
              title="Incident"
              stepId="incident"
              onEdit={handleReviewEdit}
            >
              <ReviewRow label="Date" value={incidentDate || 'Not provided'} />
              <ReviewRow label="Location" value={incidentLocation || 'Not provided'} />
              <ReviewRow label="Description" value={incidentDescription || 'Not provided'} />
              <ReviewRow label="Police report" value={policeReportFiled === true ? `Yes${policeReportNumber ? ` (#${policeReportNumber})` : ''}` : policeReportFiled === false ? 'No' : 'Not answered'} />
            </ReviewSection>

            {/* Sub-type-specific section */}
            {(MOTOR_VEHICLE_TYPES.includes(piSubType) || piSubType === 'vehicle_damage') && (
              <ReviewSection
                title="Other Driver"
                stepId="other_driver"
                onEdit={handleReviewEdit}
              >
                <ReviewRow label="Name" value={otherDriverName || 'Not provided'} />
                <ReviewRow label="Insurance" value={otherDriverInsurance || 'Not provided'} />
                <ReviewRow label="Policy #" value={otherDriverPolicyNumber || 'Not provided'} />
                <ReviewRow label="License plate" value={licensePlate || 'Not provided'} />
              </ReviewSection>
            )}

            {piSubType === 'slip_and_fall' && (
              <ReviewSection
                title="Premises"
                stepId="premises"
                onEdit={handleReviewEdit}
              >
                <ReviewRow label="Owner" value={premisesOwnerName || 'Not provided'} />
                <ReviewRow label="Address" value={premisesAddress || 'Not provided'} />
                <ReviewRow label="Hazard" value={hazardDescription || 'Not provided'} />
              </ReviewSection>
            )}

            {piSubType === 'product_liability' && (
              <ReviewSection
                title="Product"
                stepId="product"
                onEdit={handleReviewEdit}
              >
                <ReviewRow label="Product" value={productName || 'Not provided'} />
                <ReviewRow label="Manufacturer" value={manufacturer || 'Not provided'} />
                <ReviewRow label="Purchase date" value={purchaseDate || 'Not provided'} />
                <ReviewRow label="Defect" value={defectDescription || 'Not provided'} />
              </ReviewSection>
            )}

            {isPropertyDamage ? (
              <>
                {/* Damage Details */}
                <ReviewSection
                  title="Damage Details"
                  stepId="damage_details"
                  onEdit={handleReviewEdit}
                >
                  <ReviewRow label="Description" value={propertyDamageDescription || 'Not provided'} />
                  <ReviewRow label="Severity" value={damageSeverity ? (damageSeverity === 'total_loss' ? 'Total Loss' : damageSeverity.charAt(0).toUpperCase() + damageSeverity.slice(1)) : 'Not selected'} />
                  <ReviewRow label="Repair estimate" value={`$${(parseFloat(repairEstimate) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
                  <ReviewRow label="Has receipts" value={hasRepairReceipts ? 'Yes' : 'No'} />
                </ReviewSection>

                {/* Property Damages */}
                <ReviewSection
                  title="Damages"
                  stepId="damages"
                  onEdit={handleReviewEdit}
                >
                  <ReviewRow label="Repair/replacement" value={`$${(parseFloat(repairEstimate) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
                  <ReviewRow label="Loss of use" value={`$${(parseFloat(lossOfUse) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
                  <ReviewRow label="Additional costs" value={`$${(parseFloat(additionalCosts) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
                  <ReviewRow label="Grand total" value={`$${propertyGrandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} bold />
                </ReviewSection>
              </>
            ) : (
              <>
                {/* Injuries */}
                <ReviewSection
                  title="Injuries"
                  stepId="injuries"
                  onEdit={handleReviewEdit}
                >
                  <ReviewRow label="Description" value={injuryDescription || 'Not provided'} />
                  <ReviewRow label="Severity" value={injurySeverity ? injurySeverity.charAt(0).toUpperCase() + injurySeverity.slice(1) : 'Not selected'} />
                  <ReviewRow label="Body parts" value={bodyPartsAffected.length > 0 ? bodyPartsAffected.join(', ') : 'None selected'} />
                </ReviewSection>

                {/* Medical */}
                <ReviewSection
                  title="Medical Treatment"
                  stepId="medical"
                  onEdit={handleReviewEdit}
                >
                  {medicalProviders.length > 0 ? (
                    <>
                      {medicalProviders.map((p, i) => (
                        <ReviewRow
                          key={i}
                          label={p.name || `Provider ${i + 1}`}
                          value={`${PROVIDER_TYPES.find((t) => t.value === p.type)?.label ?? p.type} - $${(parseFloat(p.amount) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        />
                      ))}
                      <ReviewRow
                        label="Total medical"
                        value={`$${totalMedical.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        bold
                      />
                    </>
                  ) : (
                    <p className="text-sm text-warm-muted">No providers added</p>
                  )}
                </ReviewSection>

                {/* Damages */}
                <ReviewSection
                  title="Damages"
                  stepId="damages"
                  onEdit={handleReviewEdit}
                >
                  <ReviewRow label="Medical" value={`$${totalMedical.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
                  <ReviewRow label="Lost wages" value={`$${(parseFloat(lostWages) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
                  <ReviewRow label="Property damage" value={`$${(parseFloat(propertyDamage) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
                  <ReviewRow label={`Pain & suffering (${painSufferingMultiplier}x)`} value={`$${painSufferingAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
                  <ReviewRow label="Grand total" value={`$${grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} bold />
                </ReviewSection>
              </>
            )}

            {/* Insurance */}
            <ReviewSection
              title="Insurance"
              stepId="insurance"
              onEdit={handleReviewEdit}
            >
              <ReviewRow label="Your carrier" value={yourInsuranceCarrier || 'Not provided'} />
              <ReviewRow label="Your policy #" value={yourPolicyNumber || 'Not provided'} />
              <ReviewRow label="UM/UIM coverage" value={umUimCoverage ? 'Yes' : 'No'} />
            </ReviewSection>

            {/* Venue */}
            <ReviewSection
              title="Venue"
              stepId="venue"
              onEdit={handleReviewEdit}
            >
              <ReviewRow label="Your name" value={yourName || 'Not provided'} />
              <ReviewRow label="County" value={county || 'Not provided'} />
              <ReviewRow label="Court type" value={courtType ? courtTypeLabel(courtType) : 'Not selected'} />
              {causeNumber && <ReviewRow label="Cause #" value={causeNumber} />}
            </ReviewSection>
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

        <h1 className="text-2xl font-semibold text-warm-text">
          {getDraftTitle(piSubType)}
        </h1>
        <p className="text-sm text-warm-muted mt-1 mb-6">
          Review your draft below. You can edit it directly, regenerate it, or download a PDF.
        </p>

        {genError && (
          <div className="rounded-lg border border-calm-amber bg-calm-amber/5 p-3 mb-4">
            <p className="text-sm text-warm-text">{genError}</p>
          </div>
        )}

        <StepAuthoritySidebar
          caseId={caseId}
          mode="select"
          selectedClusterIds={selectedAuthorityIds}
          onSelectionChange={setSelectedAuthorityIds}
        />

        {draft ? (
          <>
            <div className="mt-6">
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
                documentTitle={getDocumentTitle(piSubType)}
              />
            </div>

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
    <div className="max-w-2xl mx-auto px-4 py-8">
      <StepAuthoritySidebar
        caseId={caseId}
        mode="select"
        selectedClusterIds={selectedAuthorityIds}
        onSelectionChange={setSelectedAuthorityIds}
      />
      <div className="mt-6">
        <WizardShell
          caseId={caseId}
          title={`Prepare Your ${getDocumentTitle(piSubType)}`}
          steps={steps}
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
                Generating your {getSubTypeLabel(piSubType).toLowerCase()} petition... This may take a moment.
              </p>
            </div>
          ) : (
            renderStep()
          )}
        </WizardShell>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Review helper components                                           */
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
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-warm-text">{title}</h3>
        <button
          type="button"
          onClick={() => onEdit(stepId)}
          className="text-xs text-calm-indigo hover:underline"
        >
          Edit
        </button>
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  )
}

function ReviewRow({
  label,
  value,
  bold = false,
}: {
  label: string
  value: string
  bold?: boolean
}) {
  return (
    <div className="flex justify-between text-sm">
      <span className={`text-warm-muted ${bold ? 'font-medium' : ''}`}>{label}</span>
      <span
        className={`text-warm-text text-right max-w-[60%] ${bold ? 'font-semibold' : ''}`}
      >
        {value}
      </span>
    </div>
  )
}
