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

// Import all family wizard steps
import { FamilyPreflight } from './family-wizard-steps/family-preflight'
import { FamilyWelcomeStep } from './family-wizard-steps/family-welcome-step'
import { FamilyStepPreview } from './family-wizard-steps/family-step-preview'
import { FamilyPartiesStep } from './family-wizard-steps/family-parties-step'
import { MarriageStep } from './family-wizard-steps/marriage-step'
import { ChildrenStep } from './family-wizard-steps/children-step'
import { CustodyStep } from './family-wizard-steps/custody-step'
import { PropertyStep } from './family-wizard-steps/property-step'
import { ChildSupportStep } from './family-wizard-steps/child-support-step'
import { SpousalSupportStep } from './family-wizard-steps/spousal-support-step'
import { ExistingOrdersStep } from './family-wizard-steps/existing-orders-step'
import { FamilyGroundsStep } from './family-wizard-steps/family-grounds-step'
import { FamilyVenueStep } from './family-wizard-steps/family-venue-step'
import { FamilyReviewStep } from './family-wizard-steps/family-review-step'

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

interface ChildInfo {
  name: string
  date_of_birth: string
  relationship: 'biological' | 'adopted' | 'step'
}

interface FamilyLawWizardProps {
  caseId: string
  taskId: string
  existingMetadata?: Record<string, unknown>
  familyDetails: {
    family_sub_type: string
    children: unknown[]
    marriage_date: string | null
    separation_date: string | null
    community_property_exists: boolean
    domestic_violence_flag: boolean
    military_involvement: boolean
    custody_arrangement_sought: string | null
    existing_court_orders: boolean
    petitioner_county_months: number | null
    petitioner_state_months: number | null
  } | null
  caseData: { county: string | null }
}

/* ------------------------------------------------------------------ */
/*  Dynamic step generation based on family sub-type                   */
/* ------------------------------------------------------------------ */

function getStepsForSubType(subType: string): WizardStep[] {
  const welcome: WizardStep = {
    id: 'welcome',
    title: 'Welcome',
    subtitle: 'Here is what to expect in this process.',
  }
  const preview: WizardStep = {
    id: 'preview',
    title: 'Step Preview',
    subtitle: 'A quick overview before we begin.',
  }
  // Common steps present for all sub-types
  const preflight: WizardStep = {
    id: 'preflight',
    title: 'Before You Start',
    subtitle: "Let's make sure you have what you need.",
  }
  const parties: WizardStep = {
    id: 'parties',
    title: 'Who Is Involved?',
    subtitle: 'Tell us about yourself and the other person.',
  }
  const venue: WizardStep = {
    id: 'venue',
    title: 'Where Should You File?',
    subtitle: "We'll help you pick the right court location.",
  }
  const grounds: WizardStep = {
    id: 'grounds',
    title: 'Tell Us About Your Situation',
    subtitle: 'Describe the facts and reasons for your case.',
  }
  const review: WizardStep = {
    id: 'review',
    title: 'Review Everything',
    subtitle: 'Check your information before generating your document.',
  }

  // Optional steps
  const marriage: WizardStep = {
    id: 'marriage',
    title: 'Marriage Information',
    subtitle: 'Details about your marriage and residency.',
  }
  const children: WizardStep = {
    id: 'children',
    title: 'Children',
    subtitle: 'Tell us about the children involved.',
  }
  const custody: WizardStep = {
    id: 'custody',
    title: 'Custody Arrangement',
    subtitle: 'What arrangement are you seeking?',
  }
  const support: WizardStep = {
    id: 'support',
    title: 'Child Support',
    subtitle: "Let's calculate the guideline amount.",
  }
  const spousal: WizardStep = {
    id: 'spousal',
    title: 'Spousal Support',
    subtitle: 'Requesting spousal maintenance?',
  }
  const property: WizardStep = {
    id: 'property',
    title: 'Property Division',
    subtitle: 'Community property to divide.',
  }
  const existingOrders: WizardStep = {
    id: 'existing_orders',
    title: 'Existing Orders',
    subtitle: 'Tell us about the order you want to modify.',
  }

  switch (subType) {
    case 'divorce':
      return [welcome, preview, preflight, parties, marriage, children, venue, grounds, custody, support, spousal, property, review]
    case 'custody':
      return [welcome, preview, preflight, parties, children, venue, grounds, custody, support, review]
    case 'child_support':
      return [welcome, preview, preflight, parties, children, venue, grounds, support, review]
    case 'visitation':
      return [welcome, preview, preflight, parties, children, venue, grounds, custody, review]
    case 'spousal_support':
      return [welcome, preview, preflight, parties, marriage, venue, grounds, spousal, review]
    case 'protective_order':
      return [welcome, preview, preflight, parties, venue, grounds, review]
    case 'modification':
      return [welcome, preview, preflight, parties, children, venue, grounds, custody, support, spousal, existingOrders, review]
    default:
      return [welcome, preview, preflight, parties, venue, grounds, review]
  }
}

/* ------------------------------------------------------------------ */
/*  Document title per sub-type                                        */
/* ------------------------------------------------------------------ */

function getDocumentTitle(subType: string): string {
  switch (subType) {
    case 'divorce':
      return 'Original Petition for Divorce'
    case 'custody':
      return 'Suit Affecting Parent-Child Relationship'
    case 'child_support':
      return 'Petition for Child Support'
    case 'visitation':
      return 'Petition for Possession and Access'
    case 'spousal_support':
      return 'Petition for Spousal Maintenance'
    case 'protective_order':
      return 'Application for Protective Order'
    case 'modification':
      return 'Petition to Modify'
    default:
      return 'Family Law Petition'
  }
}

function getDraftTitle(subType: string): string {
  switch (subType) {
    case 'divorce':
      return 'Your Divorce Petition Draft'
    case 'custody':
      return 'Your Custody Petition Draft'
    case 'child_support':
      return 'Your Child Support Petition Draft'
    case 'visitation':
      return 'Your Visitation Petition Draft'
    case 'spousal_support':
      return 'Your Spousal Support Petition Draft'
    case 'protective_order':
      return 'Your Protective Order Draft'
    case 'modification':
      return 'Your Modification Petition Draft'
    default:
      return 'Your Family Law Document Draft'
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function FamilyLawWizard({
  caseId,
  taskId,
  existingMetadata,
  familyDetails,
  caseData,
}: FamilyLawWizardProps) {
  const router = useRouter()
  const meta = (existingMetadata ?? {}) as Record<string, unknown>
  const familySubType = familyDetails?.family_sub_type ?? 'divorce'

  const steps = useMemo(() => getStepsForSubType(familySubType), [familySubType])
  const totalEstimateMinutes = 25

  /* ---- Party info ---- */
  const [petitioner, setPetitioner] = useState<PartyInfo>(
    (meta.petitioner as PartyInfo) ?? { full_name: '' }
  )
  const [respondent, setRespondent] = useState<PartyInfo>(
    (meta.respondent as PartyInfo) ?? { full_name: '' }
  )

  /* ---- Marriage (divorce, spousal_support) ---- */
  const [marriageDate, setMarriageDate] = useState<string>(
    (meta.marriage_date as string) ?? familyDetails?.marriage_date ?? ''
  )
  const [separationDate, setSeparationDate] = useState<string>(
    (meta.separation_date as string) ?? familyDetails?.separation_date ?? ''
  )
  const [marriageCounty, setMarriageCounty] = useState<string>(
    (meta.marriage_county as string) ?? ''
  )
  const [marriageState, setMarriageState] = useState<string>(
    (meta.marriage_state as string) ?? 'Texas'
  )
  const [countyMonths, setCountyMonths] = useState<number | ''>(
    (meta.county_months as number | '') ?? familyDetails?.petitioner_county_months ?? ''
  )
  const [stateMonths, setStateMonths] = useState<number | ''>(
    (meta.state_months as number | '') ?? familyDetails?.petitioner_state_months ?? ''
  )

  /* ---- Children ---- */
  const [children, setChildren] = useState<ChildInfo[]>(
    (meta.children as ChildInfo[]) ?? (familyDetails?.children as ChildInfo[]) ?? []
  )
  const [childrenResidence, setChildrenResidence] = useState<string>(
    (meta.children_residence as string) ?? ''
  )

  /* ---- Custody ---- */
  const [custodyArrangement, setCustodyArrangement] = useState<string>(
    (meta.custody_arrangement as string) ?? familyDetails?.custody_arrangement_sought ?? ''
  )
  const [custodyReasoning, setCustodyReasoning] = useState<string>(
    (meta.custody_reasoning as string) ?? ''
  )

  /* ---- Property (divorce) ---- */
  const [communityProperty, setCommunityProperty] = useState<boolean>(
    (meta.community_property as boolean) ?? familyDetails?.community_property_exists ?? false
  )
  const [propertyDescription, setPropertyDescription] = useState<string>(
    (meta.property_description as string) ?? ''
  )

  /* ---- Child support ---- */
  const [grossIncome, setGrossIncome] = useState<string>(
    (meta.gross_income as string) ?? ''
  )
  const [federalTax, setFederalTax] = useState<string>(
    (meta.federal_tax as string) ?? ''
  )
  const [stateTax, setStateTax] = useState<string>(
    (meta.state_tax as string) ?? ''
  )
  const [socialSecurity, setSocialSecurity] = useState<string>(
    (meta.social_security as string) ?? ''
  )
  const [healthInsurance, setHealthInsurance] = useState<string>(
    (meta.health_insurance as string) ?? ''
  )
  const [unionDues, setUnionDues] = useState<string>(
    (meta.union_dues as string) ?? ''
  )
  const [numberOfChildren, setNumberOfChildren] = useState<number>(
    (meta.number_of_children as number) ?? (children.length || 1)
  )
  const [otherChildrenCount, setOtherChildrenCount] = useState<number>(
    (meta.other_children as number) ?? 0
  )
  const [useGuidelineAmount, setUseGuidelineAmount] = useState<boolean>(
    (meta.use_guideline as boolean) ?? true
  )
  const [incomeUnknown, setIncomeUnknown] = useState<boolean>(
    (meta.income_unknown as boolean) ?? false
  )
  const [customSupportAmount, setCustomSupportAmount] = useState<string>(
    (meta.custom_support_amount as string) ?? ''
  )
  const [customSupportReasoning, setCustomSupportReasoning] = useState<string>(
    (meta.custom_support_reasoning as string) ?? ''
  )

  /* ---- Spousal support ---- */
  const [requestingSpousal, setRequestingSpousal] = useState<boolean>(
    (meta.requesting_spousal as boolean) ?? false
  )
  const [spousalAmount, setSpousalAmount] = useState<string>(
    (meta.spousal_amount as string) ?? ''
  )
  const [spousalDuration, setSpousalDuration] = useState<string>(
    (meta.spousal_duration as string) ?? ''
  )

  /* ---- Existing orders (modification) ---- */
  const [existingOrderCourt, setExistingOrderCourt] = useState<string>(
    (meta.existing_order_court as string) ?? ''
  )
  const [existingOrderCauseNumber, setExistingOrderCauseNumber] = useState<string>(
    (meta.existing_order_cause_number as string) ?? ''
  )
  const [whatToModify, setWhatToModify] = useState<string[]>(
    (meta.what_to_modify as string[]) ?? []
  )
  const [changeDescription, setChangeDescription] = useState<string>(
    (meta.change_description as string) ?? ''
  )

  /* ---- Grounds ---- */
  const [grounds, setGrounds] = useState<string>(
    (meta.grounds as string) ?? ''
  )
  const [additionalFacts, setAdditionalFacts] = useState<string>(
    (meta.additional_facts as string) ?? ''
  )
  const [divorceGroundsType, setDivorceGroundsType] = useState<string>(
    (meta.divorce_grounds_type as string) ?? 'insupportability'
  )

  /* ---- Venue ---- */
  const [petitionerCounty, setPetitionerCounty] = useState<string>(
    (meta.petitioner_county as string) ?? caseData.county ?? ''
  )
  const [childrenCounty, setChildrenCounty] = useState<string>(
    (meta.children_county as string) ?? ''
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

  /* ---- Child support field change handler ---- */

  const handleSupportFieldChange = useCallback(
    (field: string, value: string | number | boolean) => {
      switch (field) {
        case 'grossIncome':
          setGrossIncome(value as string)
          break
        case 'federalTax':
          setFederalTax(value as string)
          break
        case 'stateTax':
          setStateTax(value as string)
          break
        case 'socialSecurity':
          setSocialSecurity(value as string)
          break
        case 'healthInsurance':
          setHealthInsurance(value as string)
          break
        case 'unionDues':
          setUnionDues(value as string)
          break
        case 'numberOfChildren':
          setNumberOfChildren(value as number)
          break
        case 'otherChildrenCount':
          setOtherChildrenCount(value as number)
          break
        case 'useGuidelineAmount':
          setUseGuidelineAmount(value as boolean)
          break
        case 'customAmount':
          setCustomSupportAmount(value as string)
          break
        case 'customReasoning':
          setCustomSupportReasoning(value as string)
          break
        case 'incomeUnknown':
          setIncomeUnknown(value as boolean)
          break
      }
    },
    []
  )

  /* ---- Build helpers ---- */

  const buildFacts = useCallback(() => {
    // Determine the child support amount to send
    let childSupportAmount: number | undefined
    if (useGuidelineAmount) {
      // The API / prompt builder will calculate from income data
      childSupportAmount = undefined
    } else {
      childSupportAmount = customSupportAmount ? parseFloat(customSupportAmount) : undefined
    }

    return {
      petitioner,
      respondent,
      court_type: 'district' as const,
      county: petitionerCounty || caseData.county || '',
      family_sub_type: familySubType,
      marriage_date: marriageDate || undefined,
      separation_date: separationDate || undefined,
      children: children.length > 0 ? children : [],
      grounds,
      additional_facts: additionalFacts || undefined,
      custody_arrangement_sought: custodyArrangement || undefined,
      custody_reasoning: custodyReasoning || undefined,
      child_support_amount: childSupportAmount,
      spousal_support_amount: requestingSpousal
        ? parseFloat(spousalAmount) || undefined
        : undefined,
      spousal_support_duration_months: requestingSpousal
        ? parseInt(spousalDuration) || undefined
        : undefined,
      community_property_exists: communityProperty,
      property_description: propertyDescription || undefined,
      domestic_violence_description: familySubType === 'protective_order' ? grounds : undefined,
      protective_order_requests: undefined,
      existing_order_court: existingOrderCourt || undefined,
      existing_order_cause_number: existingOrderCauseNumber || undefined,
      modification_reason: changeDescription || undefined,
      petitioner_county_months: countyMonths ? Number(countyMonths) : undefined,
      petitioner_state_months: stateMonths ? Number(stateMonths) : undefined,
      military_involvement: familyDetails?.military_involvement ?? false,
    }
  }, [
    petitioner,
    respondent,
    petitionerCounty,
    caseData.county,
    familySubType,
    marriageDate,
    separationDate,
    children,
    grounds,
    additionalFacts,
    custodyArrangement,
    custodyReasoning,
    useGuidelineAmount,
    customSupportAmount,
    requestingSpousal,
    spousalAmount,
    spousalDuration,
    communityProperty,
    propertyDescription,
    existingOrderCourt,
    existingOrderCauseNumber,
    changeDescription,
    countyMonths,
    stateMonths,
    familyDetails?.military_involvement,
  ])

  const buildMetadata = useCallback(() => {
    return {
      // Parties
      petitioner,
      respondent,
      // Marriage
      marriage_date: marriageDate || null,
      separation_date: separationDate || null,
      marriage_county: marriageCounty || null,
      marriage_state: marriageState || null,
      county_months: countyMonths === '' ? null : countyMonths,
      state_months: stateMonths === '' ? null : stateMonths,
      // Children
      children,
      children_residence: childrenResidence || null,
      // Custody
      custody_arrangement: custodyArrangement || null,
      custody_reasoning: custodyReasoning || null,
      // Property
      community_property: communityProperty,
      property_description: propertyDescription || null,
      // Child support
      gross_income: grossIncome || null,
      federal_tax: federalTax || null,
      state_tax: stateTax || null,
      social_security: socialSecurity || null,
      health_insurance: healthInsurance || null,
      union_dues: unionDues || null,
      number_of_children: numberOfChildren,
      other_children: otherChildrenCount,
      use_guideline: useGuidelineAmount,
      custom_support_amount: customSupportAmount || null,
      custom_support_reasoning: customSupportReasoning || null,
      income_unknown: incomeUnknown,
      // Spousal support
      requesting_spousal: requestingSpousal,
      spousal_amount: spousalAmount || null,
      spousal_duration: spousalDuration || null,
      // Existing orders
      existing_order_court: existingOrderCourt || null,
      existing_order_cause_number: existingOrderCauseNumber || null,
      what_to_modify: whatToModify,
      change_description: changeDescription || null,
      // Grounds
      grounds: grounds || null,
      additional_facts: additionalFacts || null,
      divorce_grounds_type: divorceGroundsType || null,
      // Venue
      petitioner_county: petitionerCounty || null,
      children_county: childrenCounty || null,
      // Draft
      draft_text: draft || null,
      final_text: draft || null,
      annotations,
      // Wizard position
      _wizard_step: currentStep,
    }
  }, [
    petitioner,
    respondent,
    marriageDate,
    separationDate,
    marriageCounty,
    marriageState,
    countyMonths,
    stateMonths,
    children,
    childrenResidence,
    custodyArrangement,
    custodyReasoning,
    communityProperty,
    propertyDescription,
    grossIncome,
    federalTax,
    stateTax,
    socialSecurity,
    healthInsurance,
    unionDues,
    numberOfChildren,
    otherChildrenCount,
    useGuidelineAmount,
    customSupportAmount,
    customSupportReasoning,
    incomeUnknown,
    requestingSpousal,
    spousalAmount,
    spousalDuration,
    existingOrderCourt,
    existingOrderCauseNumber,
    whatToModify,
    changeDescription,
    grounds,
    additionalFacts,
    divorceGroundsType,
    petitionerCounty,
    childrenCounty,
    draft,
    annotations,
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
          document_type: `family_${familySubType}`,
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
          petitioner.full_name.trim() !== '' &&
          respondent.full_name.trim() !== ''
        )
      case 'marriage':
        return marriageDate.trim() !== ''
      case 'children': {
        const requiresChildren = ['custody', 'child_support', 'visitation'].includes(familySubType)
        if (requiresChildren) {
          return children.length > 0 && children.every((c) => c.name.trim() !== '')
        }
        return true
      }
      case 'venue':
        return true
      case 'grounds':
        if (familySubType === 'divorce') {
          // For insupportability, grounds are auto-filled; for fault-based, require text
          if (divorceGroundsType === 'insupportability') return true
          return grounds.trim().length >= 10
        }
        return grounds.trim().length >= 10
      case 'custody':
        return custodyArrangement !== ''
      case 'support':
        return true
      case 'spousal':
        return true
      case 'property':
        return true
      case 'existing_orders':
        return existingOrderCourt.trim() !== ''
      case 'review':
        return true
      default:
        return true
    }
  }, [
    currentStep,
    steps,
    petitioner,
    respondent,
    marriageDate,
    children,
    familySubType,
    grounds,
    divorceGroundsType,
    custodyArrangement,
    existingOrderCourt,
  ])

  /* ---- Form data for review step ---- */

  const formDataForReview = useMemo(
    () => ({
      petitioner,
      respondent,
      marriageDate,
      separationDate,
      marriageCounty,
      marriageState,
      countyMonths,
      stateMonths,
      children,
      childrenResidence,
      petitionerCounty,
      childrenCounty,
      grounds,
      additionalFacts,
      divorceGroundsType,
      arrangement: custodyArrangement,
      reasoning: custodyReasoning,
      grossIncome,
      numberOfChildren,
      useGuidelineAmount,
      customAmount: customSupportAmount,
      customReasoning: customSupportReasoning,
      incomeUnknown,
      requestingSpousalSupport: requestingSpousal,
      spousalAmount,
      spousalDurationMonths: spousalDuration,
      communityPropertyExists: communityProperty,
      propertyDescription,
      existingCourt: existingOrderCourt,
      causeNumber: existingOrderCauseNumber,
      whatToModify,
      changeDescription,
      dvFlag: familyDetails?.domestic_violence_flag ?? false,
    }),
    [
      petitioner,
      respondent,
      marriageDate,
      separationDate,
      marriageCounty,
      marriageState,
      countyMonths,
      stateMonths,
      children,
      childrenResidence,
      petitionerCounty,
      childrenCounty,
      grounds,
      additionalFacts,
      divorceGroundsType,
      custodyArrangement,
      custodyReasoning,
      grossIncome,
      numberOfChildren,
      useGuidelineAmount,
      customSupportAmount,
      customSupportReasoning,
      requestingSpousal,
      spousalAmount,
      spousalDuration,
      communityProperty,
      propertyDescription,
      existingOrderCourt,
      existingOrderCauseNumber,
      whatToModify,
      changeDescription,
      familyDetails?.domestic_violence_flag,
    ]
  )

  /* ---- Step rendering ---- */

  function renderStep() {
    const stepId = steps[currentStep]?.id
    switch (stepId) {
      case 'welcome':
        return (
          <FamilyWelcomeStep
            onContinue={() => setCurrentStep(currentStep + 1)}
          />
        )
      case 'preview':
        return (
          <FamilyStepPreview
            steps={steps.filter((step) => !['welcome', 'preview'].includes(step.id))}
            totalMinutes={totalEstimateMinutes}
            onContinue={() => setCurrentStep(currentStep + 1)}
          />
        )
      case 'preflight':
        return (
          <FamilyPreflight
            familySubType={familySubType}
            onReady={() => setCurrentStep(currentStep + 1)}
          />
        )
      case 'parties':
        return (
          <FamilyPartiesStep
            petitioner={petitioner}
            respondent={respondent}
            onPetitionerChange={setPetitioner}
            onRespondentChange={setRespondent}
          />
        )
      case 'marriage':
        return (
          <MarriageStep
            marriageDate={marriageDate}
            separationDate={separationDate}
            marriageCounty={marriageCounty}
            marriageState={marriageState}
            countyMonths={countyMonths}
            stateMonths={stateMonths}
            onMarriageDateChange={setMarriageDate}
            onSeparationDateChange={setSeparationDate}
            onMarriageCountyChange={setMarriageCounty}
            onMarriageStateChange={setMarriageState}
            onCountyMonthsChange={setCountyMonths}
            onStateMonthsChange={setStateMonths}
          />
        )
      case 'children':
        return (
          <ChildrenStep
            children={children}
            onChildrenChange={setChildren}
            familySubType={familySubType}
            residenceSummary={childrenResidence}
            onResidenceSummaryChange={setChildrenResidence}
          />
        )
      case 'venue':
        return (
          <FamilyVenueStep
            familySubType={familySubType}
            county={caseData.county}
            petitionerCounty={petitionerCounty}
            childrenCounty={childrenCounty}
            onPetitionerCountyChange={setPetitionerCounty}
            onChildrenCountyChange={setChildrenCounty}
          />
        )
      case 'grounds':
        return (
          <FamilyGroundsStep
            familySubType={familySubType}
            grounds={grounds}
            additionalFacts={additionalFacts}
            divorceGroundsType={divorceGroundsType}
            onGroundsChange={setGrounds}
            onAdditionalFactsChange={setAdditionalFacts}
            onDivorceGroundsTypeChange={setDivorceGroundsType}
          />
        )
      case 'custody':
        return (
          <CustodyStep
            arrangement={custodyArrangement}
            reasoning={custodyReasoning}
            onArrangementChange={setCustodyArrangement}
            onReasoningChange={setCustodyReasoning}
          />
        )
      case 'support':
        return (
          <ChildSupportStep
            grossIncome={grossIncome}
            federalTax={federalTax}
            stateTax={stateTax}
            socialSecurity={socialSecurity}
            healthInsurance={healthInsurance}
            unionDues={unionDues}
            numberOfChildren={numberOfChildren}
            otherChildrenCount={otherChildrenCount}
            useGuidelineAmount={useGuidelineAmount}
            customAmount={customSupportAmount}
            customReasoning={customSupportReasoning}
            incomeUnknown={incomeUnknown}
            onFieldChange={handleSupportFieldChange}
          />
        )
      case 'spousal':
        return (
          <SpousalSupportStep
            requestingSpousalSupport={requestingSpousal}
            amount={spousalAmount}
            durationMonths={spousalDuration}
            onRequestingChange={setRequestingSpousal}
            onAmountChange={setSpousalAmount}
            onDurationChange={setSpousalDuration}
          />
        )
      case 'property':
        return (
          <PropertyStep
            communityPropertyExists={communityProperty}
            propertyDescription={propertyDescription}
            onCommunityPropertyChange={setCommunityProperty}
            onPropertyDescriptionChange={setPropertyDescription}
          />
        )
      case 'existing_orders':
        return (
          <ExistingOrdersStep
            court={existingOrderCourt}
            causeNumber={existingOrderCauseNumber}
            whatToModify={whatToModify}
            changeDescription={changeDescription}
            onCourtChange={setExistingOrderCourt}
            onCauseNumberChange={setExistingOrderCauseNumber}
            onWhatToModifyChange={setWhatToModify}
            onChangeDescriptionChange={setChangeDescription}
          />
        )
      case 'review':
        return (
          <FamilyReviewStep
            familySubType={familySubType}
            formData={formDataForReview}
            onEditStep={(i) => setCurrentStep(i)}
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
          {getDraftTitle(familySubType)}
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
              documentTitle={getDocumentTitle(familySubType)}
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
      title={`Prepare Your ${getDocumentTitle(familySubType)}`}
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
            Generating your {getDocumentTitle(familySubType).toLowerCase()}... This may take a moment.
          </p>
        </div>
      ) : (
        renderStep()
      )}
    </WizardShell>
  )
}
