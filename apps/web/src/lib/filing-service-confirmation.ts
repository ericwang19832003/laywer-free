export interface FilingServiceFacts {
  petition_filed_date: string
  court_case_number: string
  service_completed_date: string
  service_method: string
  defendant_name_served: string
}

export type FilingServiceFactErrors = Partial<Record<keyof FilingServiceFacts, string>>

export interface FilingServiceValidationResult {
  valid: boolean
  errors: FilingServiceFactErrors
}

export type FilingServiceMetadata = FilingServiceFacts & {
  filing_service_confirmed: 'yes'
  guided_answers: FilingServiceFacts & { filing_service_confirmed: 'yes' }
  filing_service_facts: FilingServiceFacts & { filing_service_confirmed: 'yes' }
}

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T12:00:00`)
  return !Number.isNaN(date.getTime()) && value === date.toISOString().slice(0, 10)
}

export function normalizeFilingServiceFacts(facts: FilingServiceFacts): FilingServiceFacts {
  return {
    petition_filed_date: facts.petition_filed_date.trim(),
    court_case_number: facts.court_case_number.trim(),
    service_completed_date: facts.service_completed_date.trim(),
    service_method: facts.service_method.trim(),
    defendant_name_served: facts.defendant_name_served.trim(),
  }
}

export function validateFilingServiceFacts(facts: FilingServiceFacts): FilingServiceValidationResult {
  const normalized = normalizeFilingServiceFacts(facts)
  const errors: FilingServiceFactErrors = {}

  if (!normalized.petition_filed_date) {
    errors.petition_filed_date = 'Enter the petition filed date.'
  } else if (!isValidDate(normalized.petition_filed_date)) {
    errors.petition_filed_date = 'Enter a valid petition filed date.'
  }

  if (!normalized.court_case_number) {
    errors.court_case_number = 'Enter the court case number.'
  }

  if (!normalized.service_completed_date) {
    errors.service_completed_date = 'Enter the service completed date.'
  } else if (!isValidDate(normalized.service_completed_date)) {
    errors.service_completed_date = 'Enter a valid service completed date.'
  }

  if (
    normalized.petition_filed_date &&
    normalized.service_completed_date &&
    isValidDate(normalized.petition_filed_date) &&
    isValidDate(normalized.service_completed_date) &&
    normalized.service_completed_date < normalized.petition_filed_date
  ) {
    errors.service_completed_date = 'Service date cannot be before petition filed date.'
  }

  if (!normalized.service_method) {
    errors.service_method = 'Select the service method.'
  }

  if (!normalized.defendant_name_served) {
    errors.defendant_name_served = 'Enter the defendant name shown on the return of service.'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

export function buildFilingServiceMetadata(facts: FilingServiceFacts): FilingServiceMetadata {
  const normalized = normalizeFilingServiceFacts(facts)
  const confirmed = {
    ...normalized,
    filing_service_confirmed: 'yes' as const,
  }

  return {
    ...confirmed,
    guided_answers: confirmed,
    filing_service_facts: confirmed,
  }
}
