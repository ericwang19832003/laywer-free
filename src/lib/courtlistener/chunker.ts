export interface TextChunk {
  content: string
  char_start: number
  char_end: number
  chunk_index: number
}

const TARGET_CHUNK_TOKENS = 500
const OVERLAP_TOKENS = 50
const CHARS_PER_TOKEN = 4
const TARGET_CHUNK_CHARS = TARGET_CHUNK_TOKENS * CHARS_PER_TOKEN  // 2000
const OVERLAP_CHARS = OVERLAP_TOKENS * CHARS_PER_TOKEN             // 200

export function chunkText(text: string): TextChunk[] {
  if (!text || text.trim().length === 0) return []

  const chunks: TextChunk[] = []
  let start = 0
  let index = 0

  while (start < text.length) {
    let end = Math.min(start + TARGET_CHUNK_CHARS, text.length)

    // Try to break at sentence boundary
    if (end < text.length) {
      const searchStart = Math.max(end - 200, start)
      const window = text.slice(searchStart, end)
      let lastBreak = -1
      const regex = /[.!?]\s/g
      let match
      while ((match = regex.exec(window)) !== null) {
        lastBreak = match.index
      }
      if (lastBreak !== -1) {
        end = searchStart + lastBreak + 2
      }
    }

    const content = text.slice(start, end).trim()
    if (content.length > 0) {
      chunks.push({ content, char_start: start, char_end: end, chunk_index: index })
      index++
    }

    // Advance with overlap
    const nextStart = end - OVERLAP_CHARS
    if (nextStart <= start) {
      start = end
    } else {
      start = nextStart
    }
  }

  return chunks
}
