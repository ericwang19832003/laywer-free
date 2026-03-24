export const INPUT_LIMITS = {
  CASE_DESCRIPTION: 5000,
  NOTE_CONTENT: 10000,
  TEXT_SNIPPET: 50000,    // evidence categorization
  DOCUMENT_FACTS: 10000,
  DOCUMENT_CLAIMS: 10000,
  GENERAL_TEXT: 5000,
} as const

export function truncateIfNeeded(text: string, limit: number): string {
  return text.length > limit ? text.slice(0, limit) : text
}

export function validateTextLength(text: string, limit: number, fieldName: string): string | null {
  if (text.length > limit) {
    return `${fieldName} exceeds maximum length of ${limit} characters`
  }
  return null
}
