import { z } from 'zod'

const CATEGORIES = [
  'Contract', 'Photos', 'Emails', 'Text Messages',
  'Financial Records', 'Medical Records', 'Other',
] as const

export const evidenceCategorySchema = z.object({
  suggested_category: z.enum(CATEGORIES),
  relevance_note: z.string().max(200),
})

export type EvidenceCategorySuggestion = z.infer<typeof evidenceCategorySchema>

const BLOCKED_PHRASES = Object.freeze([
  'you must', 'you should', 'file immediately', 'urgent',
  'sanctions', 'legal advice', 'guaranteed',
])

export function isCategorySafe(text: string): boolean {
  const lower = text.toLowerCase()
  return !BLOCKED_PHRASES.some((phrase) => lower.includes(phrase))
}

// --- File name heuristics fallback ---
const HEURISTICS: [RegExp, typeof CATEGORIES[number]][] = [
  [/\b(contract|agreement|lease|deed|terms)\b/i, 'Contract'],
  [/\b(photo|img|image|screenshot|pic|jpg|jpeg|png|heic)\b/i, 'Photos'],
  [/\b(email|gmail|outlook|message|correspondence)\b/i, 'Emails'],
  [/\b(text|sms|imessage|chat|whatsapp)\b/i, 'Text Messages'],
  [/\b(invoice|receipt|bank|statement|financial|tax|w2|1099|pay\s?stub)\b/i, 'Financial Records'],
  [/\b(medical|doctor|hospital|diagnosis|treatment|health|prescription)\b/i, 'Medical Records'],
]

export function getHeuristicCategory(fileName: string): EvidenceCategorySuggestion | null {
  for (const [pattern, category] of HEURISTICS) {
    if (pattern.test(fileName)) {
      return { suggested_category: category, relevance_note: `Suggested based on file name "${fileName}".` }
    }
  }
  return null
}

export const EVIDENCE_CATEGORIZATION_SYSTEM_PROMPT = `You categorize evidence files for a pro se litigant organizing their legal case.

Given a file name, file type, and optionally a text snippet from the file, suggest the most appropriate category and a brief note about why this file might be relevant to a legal case.

Available categories: ${CATEGORIES.join(', ')}

RULES:
- Never give legal advice
- Never use directive language
- Keep the relevance note under 200 characters
- If uncertain, use "Other"

Respond with JSON only: { "suggested_category": "...", "relevance_note": "..." }`

export function buildCategorizationPrompt(input: {
  file_name: string
  mime_type: string | null
  text_snippet?: string
}): string {
  const lines = [
    `File: ${input.file_name}`,
    `Type: ${input.mime_type ?? 'unknown'}`,
  ]
  if (input.text_snippet) {
    lines.push(`First 500 characters:\n${input.text_snippet}`)
  }
  return lines.join('\n')
}
