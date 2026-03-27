import { useMemo } from 'react'

export interface FieldDef {
  id: string
  label: string
  required: boolean
  sectionId: string
  validation?: {
    minLength?: number
    maxLength?: number
    pattern?: RegExp
  }
  guidance?: string
}

export interface FieldStatus {
  id: string
  label: string
  filled: boolean
  value: unknown
  required: boolean
  sectionId: string
  guidance?: string
}

export interface SectionStatus {
  id: string
  title: string
  fields: FieldStatus[]
  completedFields: number
  totalFields: number
  completionPercent: number
  isComplete: boolean
  isInProgress: boolean
}

export interface CompletenessResult {
  score: number
  sections: SectionStatus[]
  criticalMissing: FieldStatus[]
  recommendedMissing: FieldStatus[]
  allRequiredFilled: boolean
  canFile: boolean
}

export function usePetitionCompleteness(
  fields: FieldDef[],
  answers: Record<string, unknown>
): CompletenessResult {
  return useMemo(() => {
    const sections: Map<string, SectionStatus> = new Map()
    const criticalMissing: FieldStatus[] = []
    const recommendedMissing: FieldStatus[] = []

    for (const field of fields) {
      const value = answers[field.id]
      const isFilled = isFieldFilled(value, field.validation)

      const fieldStatus: FieldStatus = {
        id: field.id,
        label: field.label,
        filled: isFilled,
        value,
        required: field.required,
        sectionId: field.sectionId,
        guidance: field.guidance,
      }

      if (isFilled) {
        // Field is filled, no issue
      } else if (field.required) {
        criticalMissing.push(fieldStatus)
      } else {
        recommendedMissing.push(fieldStatus)
      }

      const section = sections.get(field.sectionId) || {
        id: field.sectionId,
        title: field.sectionId.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        fields: [] as FieldStatus[],
        completedFields: 0,
        totalFields: 0,
        completionPercent: 0,
        isComplete: false,
        isInProgress: false,
      }

      section.fields.push(fieldStatus)
      section.totalFields++
      if (isFilled) section.completedFields++

      sections.set(field.sectionId, section)
    }

    const sectionArray = Array.from(sections.values()).map((section) => ({
      ...section,
      completionPercent:
        section.totalFields > 0
          ? Math.round((section.completedFields / section.totalFields) * 100)
          : 0,
      isComplete: section.completedFields === section.totalFields,
      isInProgress:
        section.completedFields > 0 && section.completedFields < section.totalFields,
    }))

    const totalFields = fields.length
    const filledFields = fields.filter((f) => isFieldFilled(answers[f.id], f.validation)).length
    const score = totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0

    return {
      score,
      sections: sectionArray,
      criticalMissing,
      recommendedMissing,
      allRequiredFilled: criticalMissing.length === 0,
      canFile: criticalMissing.length === 0 && score >= 50,
    }
  }, [fields, answers])
}

function isFieldFilled(
  value: unknown,
  validation?: FieldDef['validation']
): boolean {
  if (value === undefined || value === null || value === '') return false

  if (typeof value === 'string') {
    if (validation?.minLength && value.length < validation.minLength) return false
    if (validation?.maxLength && value.length > validation.maxLength) return false
    if (validation?.pattern && !validation.pattern.test(value)) return false
    return true
  }

  if (typeof value === 'number' && value > 0) return true

  if (Array.isArray(value) && value.length > 0) return true

  if (typeof value === 'object' && Object.keys(value).length > 0) return true

  return true
}

export const PETITION_FIELDS: FieldDef[] = [
  // Parties Section
  { id: 'your_info.full_name', label: 'Your full name', required: true, sectionId: 'parties', guidance: 'Enter your full legal name as it appears on your ID.' },
  { id: 'your_info.address', label: 'Your address', required: true, sectionId: 'parties', guidance: 'This is where the court will send official notices.' },
  { id: 'opposing_parties.0.full_name', label: 'Defendant\'s name', required: true, sectionId: 'parties', guidance: 'The person or business you\'re suing.' },
  { id: 'opposing_parties.0.address', label: 'Defendant\'s address', required: false, sectionId: 'parties', guidance: 'The court needs this to serve the defendant. Include what you know.' },

  // Venue Section
  { id: 'court_type', label: 'Court type', required: true, sectionId: 'venue' },
  { id: 'county', label: 'County', required: true, sectionId: 'venue', guidance: 'The county where you\'re filing.' },

  // Facts Section
  { id: 'description', label: 'Statement of facts', required: true, sectionId: 'facts', validation: { minLength: 50 }, guidance: 'Tell your story in your own words. Include: what happened, when, where, and why the defendant is responsible.' },
  { id: 'incident_date', label: 'Incident date', required: false, sectionId: 'facts', guidance: 'Approximate dates work fine. Use "on or about" if uncertain.' },
  { id: 'incident_location', label: 'Incident location', required: false, sectionId: 'facts' },

  // Claims Section
  { id: 'dispute_type', label: 'Dispute type', required: true, sectionId: 'claims' },
  { id: 'claim_details', label: 'Claim details', required: false, sectionId: 'claims', guidance: 'Explain the legal basis for your claim.' },

  // Relief Section
  { id: 'amount_sought', label: 'Amount sought', required: true, sectionId: 'relief', guidance: 'The total amount you\'re requesting.' },
  { id: 'other_relief', label: 'Other relief requested', required: false, sectionId: 'relief' },
  { id: 'request_court_costs', label: 'Request court costs', required: false, sectionId: 'relief' },
  { id: 'request_attorney_fees', label: 'Request attorney fees', required: false, sectionId: 'relief' },

  // Filing Section
  { id: 'filing_method', label: 'Filing method', required: true, sectionId: 'how_to_file' },
]
