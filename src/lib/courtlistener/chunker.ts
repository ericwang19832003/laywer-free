export interface TextChunk {
  content: string
  char_start: number
  char_end: number
  chunk_index: number
  section_title: string | null
  paragraph_start: number
  paragraph_end: number
  citation_count: number
  contains_holding: boolean
}

const TARGET_CHUNK_TOKENS = 500
const CHARS_PER_TOKEN = 4
const TARGET_CHUNK_CHARS = TARGET_CHUNK_TOKENS * CHARS_PER_TOKEN  // 2000
const OVERLAP_PARAGRAPHS = 1

interface ParagraphBlock {
  text: string
  char_start: number
  char_end: number
  index: number
  section_title: string | null
}

const HEADING_REGEX = /^(FACTS?|BACKGROUND|PROCEDURAL HISTORY|ANALYSIS|DISCUSSION|HOLDING|CONCLUSION)\b/i
const ROMAN_HEADING_REGEX = /^[IVXLC]+\.\s+/i
const HOLDING_REGEX = /\b(we hold|the court holds|holding that|we conclude|the court concludes)\b/i
const CITATION_REGEX = /\b\d{1,4}\s+[A-Z][A-Za-z.\d]*\s+\d{1,4}\b/g

function isHeading(text: string): boolean {
  const trimmed = text.trim()
  if (!trimmed) return false
  if (HEADING_REGEX.test(trimmed) || ROMAN_HEADING_REGEX.test(trimmed)) return true
  if (trimmed.length <= 80 && /[A-Z]/.test(trimmed) && trimmed === trimmed.toUpperCase()) return true
  return false
}

function countCitations(text: string): number {
  const matches = text.match(CITATION_REGEX)
  return matches ? matches.length : 0
}

function parseParagraphs(text: string): ParagraphBlock[] {
  const paragraphs: ParagraphBlock[] = []
  if (!text || text.trim().length === 0) return paragraphs

  let cursor = 0
  let index = 0
  let currentSection: string | null = null

  while (cursor < text.length) {
    const remaining = text.slice(cursor)
    const blankMatch = remaining.match(/\n\s*\n/)
    const end = blankMatch ? cursor + blankMatch.index! : text.length
    const raw = text.slice(cursor, end)
    const trimmed = raw.trim()

    if (trimmed.length > 0) {
      if (isHeading(trimmed)) {
        currentSection = trimmed.replace(/[:\s]+$/, '')
      } else {
        const leading = raw.match(/^\s*/)?.[0].length ?? 0
        const trailing = raw.match(/\s*$/)?.[0].length ?? 0
        const rawOffset = cursor + leading
        const rawEnd = end - trailing

        if (trimmed.length > TARGET_CHUNK_CHARS) {
          const sentenceRegex = /[^.!?]+[.!?]\s*|[^.!?]+$/g
          const sentences = Array.from(trimmed.matchAll(sentenceRegex)).map((match) => ({
            text: match[0],
            start: match.index ?? 0,
            end: (match.index ?? 0) + match[0].length,
          }))

          let segmentStart = sentences[0]?.start ?? 0
          let buffer = ''
          let lastSentence = sentences[0]

          for (const sentence of sentences) {
            if (buffer.length + sentence.text.length > TARGET_CHUNK_CHARS && buffer.length > 0) {
              const leadingSeg = buffer.match(/^\s*/)?.[0].length ?? 0
              const trailingSeg = buffer.match(/\s*$/)?.[0].length ?? 0
              const segmentText = buffer.trim()
              const segmentEnd = sentence.start

              paragraphs.push({
                text: segmentText,
                char_start: rawOffset + segmentStart + leadingSeg,
                char_end: rawOffset + segmentEnd - trailingSeg,
                index,
                section_title: currentSection,
              })
              index += 1

              buffer = lastSentence?.text ?? ''
              segmentStart = lastSentence?.start ?? sentence.start
            }

            buffer += sentence.text
            lastSentence = sentence
          }

          if (buffer.trim().length > 0) {
            const leadingSeg = buffer.match(/^\s*/)?.[0].length ?? 0
            const trailingSeg = buffer.match(/\s*$/)?.[0].length ?? 0
            const segmentText = buffer.trim()

            paragraphs.push({
              text: segmentText,
              char_start: rawOffset + segmentStart + leadingSeg,
              char_end: rawOffset + (rawEnd - rawOffset) - trailingSeg,
              index,
              section_title: currentSection,
            })
            index += 1
          }
        } else {
          paragraphs.push({
            text: trimmed,
            char_start: rawOffset,
            char_end: rawEnd,
            index,
            section_title: currentSection,
          })
          index += 1
        }
      }
    }

    if (!blankMatch) break
    cursor = end + blankMatch[0].length
  }

  return paragraphs
}

export function chunkText(text: string): TextChunk[] {
  const paragraphs = parseParagraphs(text)
  if (paragraphs.length === 0) return []

  const chunks: TextChunk[] = []
  let index = 0
  let cursor = 0

  while (cursor < paragraphs.length) {
    const startIndex = cursor
    let endIndex = cursor
    let currentLength = 0
    let contentParts: string[] = []

    while (endIndex < paragraphs.length) {
      const nextText = paragraphs[endIndex].text
      const projected = currentLength + (contentParts.length ? 2 : 0) + nextText.length
      if (projected > TARGET_CHUNK_CHARS && contentParts.length > 0) break

      contentParts.push(nextText)
      currentLength = projected
      endIndex += 1
    }

    const paragraphStart = startIndex
    const paragraphEnd = Math.max(startIndex, endIndex - 1)
    const content = contentParts.join('\n\n').trim()

    if (content.length > 0) {
      const startPara = paragraphs[paragraphStart]
      const endPara = paragraphs[paragraphEnd]
      const sectionTitle = startPara.section_title ?? null
      chunks.push({
        content,
        char_start: startPara.char_start,
        char_end: endPara.char_end,
        chunk_index: index,
        section_title: sectionTitle,
        paragraph_start: paragraphStart,
        paragraph_end: paragraphEnd,
        citation_count: countCitations(content),
        contains_holding: HOLDING_REGEX.test(content),
      })
      index += 1
    }

    const nextCursor = paragraphEnd - OVERLAP_PARAGRAPHS + 1
    cursor = nextCursor > startIndex ? nextCursor : paragraphEnd + 1
  }

  return chunks
}
