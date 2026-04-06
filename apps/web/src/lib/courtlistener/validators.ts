export interface CitationValidationResult {
  ok: boolean
  missing: string[]
}

const CITATION_MARKER = /\[[^\]]+\]/

function splitSentences(text: string): string[] {
  const sentences: string[] = []
  let buffer = ''
  let bracketDepth = 0

  for (const char of text) {
    if (char === '[') bracketDepth += 1
    if (char === ']' && bracketDepth > 0) bracketDepth -= 1
    buffer += char

    if (bracketDepth === 0 && /[.!?]/.test(char)) {
      const trimmed = buffer.trim()
      if (trimmed) sentences.push(trimmed)
      buffer = ''
    }
  }

  const remainder = buffer.trim()
  if (remainder) sentences.push(remainder)

  return sentences
}

export function validateAnswerCitations(answer: string): CitationValidationResult {
  const isCitationOnly = (text: string) =>
    CITATION_MARKER.test(text) && text.replace(CITATION_MARKER, '').trim().length === 0

  const lines = answer
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  const mergedLines: string[] = []
  for (const line of lines) {
    if (isCitationOnly(line) && mergedLines.length > 0) {
      mergedLines[mergedLines.length - 1] += ` ${line}`
    } else {
      mergedLines.push(line)
    }
  }

  const sentences = mergedLines.flatMap((line) => splitSentences(line))
  const missing: string[] = []

  for (let i = 0; i < sentences.length; i += 1) {
    const sentence = sentences[i]
    if (CITATION_MARKER.test(sentence)) continue

    const next = sentences[i + 1]
    if (next && isCitationOnly(next)) {
      i += 1
      continue
    }

    missing.push(sentence)
  }

  return { ok: missing.length === 0, missing }
}

export function sanitizeDirectiveLanguage(text: string): string {
  // Order matters: handle more specific phrases before general ones.
  return text
    .replace(/\byou must file\b/gi, 'you may need to consider filing')
    .replace(/\byou must\b/gi, 'you may need to consider')
    .replace(/\byou should\b/gi, 'it may be helpful to consider')
}
