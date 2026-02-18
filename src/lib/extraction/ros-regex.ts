import type { RosFields } from '@/lib/schemas/document-extraction'

const MONTHS =
  'January|February|March|April|May|June|July|August|September|October|November|December'

const DATE_LONG = `(?:${MONTHS})\\s+\\d{1,2},?\\s+\\d{4}`
const DATE_SLASH = '\\d{1,2}/\\d{1,2}/\\d{4}'
const DATE_ORDINAL = `\\d{1,2}(?:st|nd|rd|th)?\\s+day\\s+of\\s+(?:${MONTHS}),?\\s+\\d{4}`
const DATE_ANY = `(?:${DATE_LONG}|${DATE_SLASH}|${DATE_ORDINAL})`

function firstMatch(text: string, patterns: RegExp[]): string | null {
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match?.[1]) return match[1].trim()
  }
  return null
}

function extractServedAt(text: string): string | null {
  return firstMatch(text, [
    new RegExp(`served\\s+on\\s+(${DATE_ANY})`, 'i'),
    new RegExp(`date\\s+of\\s+service:?\\s*(${DATE_ANY})`, 'i'),
    new RegExp(`executed\\s+on\\s+(${DATE_ANY})`, 'i'),
    new RegExp(`on\\s+the\\s+(${DATE_ORDINAL})`, 'i'),
    // Fallback: "served [name/text] on [date]" — common in Texas ROS
    new RegExp(`served\\b[\\s\\S]{1,120}?\\bon\\s+(${DATE_ANY})`, 'i'),
  ])
}

function extractReturnFiledAt(text: string): string | null {
  return firstMatch(text, [
    new RegExp(`return\\s+filed\\s+(${DATE_ANY})`, 'i'),
    new RegExp(`filed\\s+on\\s+(${DATE_ANY})`, 'i'),
    new RegExp(`return\\s+date:?\\s*(${DATE_ANY})`, 'i'),
  ])
}

const METHOD_KEYWORDS: [RegExp, RosFields['service_method']][] = [
  [/personally\s+served/i, 'personal'],
  [/personal\s+service/i, 'personal'],
  [/delivered\s+(?:it\s+)?in\s+person/i, 'personal'],
  [/suitable\s+age/i, 'substituted'],
  [/substituted\s+service/i, 'substituted'],
  [/left\s+(?:it\s+)?with/i, 'substituted'],
  [/affixed\s+to\s+the\s+door/i, 'posting'],
  [/posting/i, 'posting'],
  [/certified\s+mail/i, 'certified_mail'],
  [/registered\s+mail/i, 'certified_mail'],
  [/secretary\s+of\s+state/i, 'secretary_of_state'],
  [/publication/i, 'publication'],
]

function extractServiceMethod(text: string): RosFields['service_method'] {
  for (const [pattern, method] of METHOD_KEYWORDS) {
    if (pattern.test(text)) return method
  }
  return null
}

function extractServedTo(text: string): string | null {
  const patterns = [
    /served\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})\b/,
    /defendant:?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})\b/i,
    /served\s+upon\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})\b/,
  ]
  return firstMatch(text, patterns)
}

function extractServerName(text: string): string | null {
  const patterns = [
    /I,\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3}),?\s+being/,
    /Process\s+Server:?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})\b/i,
    /Officer:?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})\b/i,
    /Server:?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})\b/i,
  ]
  return firstMatch(text, patterns)
}

export function extractRosFields(text: string): RosFields {
  if (!text || text.trim().length === 0) {
    return {
      served_at: null,
      return_filed_at: null,
      service_method: null,
      served_to: null,
      server_name: null,
    }
  }

  return {
    served_at: extractServedAt(text),
    return_filed_at: extractReturnFiledAt(text),
    service_method: extractServiceMethod(text),
    served_to: extractServedTo(text),
    server_name: extractServerName(text),
  }
}
