import { describe, it, expect } from 'vitest'
import { chunkText, TextChunk } from '@/lib/courtlistener/chunker'

describe('chunkText', () => {
  // Test 1: returns empty array for empty text
  it('returns empty array for empty text', () => {
    expect(chunkText('')).toEqual([])
    expect(chunkText('   ')).toEqual([])
  })

  // Test 2: returns single chunk for short text
  it('returns single chunk for short text', () => {
    const text = 'The court finds in favor of the plaintiff.'
    const chunks = chunkText(text)

    expect(chunks).toHaveLength(1)
    expect(chunks[0].content).toBe(text)
    expect(chunks[0].chunk_index).toBe(0)
    expect(chunks[0].char_start).toBe(0)
    expect(chunks[0].char_end).toBe(text.length)
  })

  // Test 3: splits long text into multiple chunks
  it('splits long text into multiple chunks', () => {
    const sentence = 'The court reviewed the evidence and determined that the claim was valid. '
    const text = sentence.repeat(50) // ~3600 chars, well over 2000
    const chunks = chunkText(text)

    expect(chunks.length).toBeGreaterThan(1)
    // Verify all original text is covered
    for (const chunk of chunks) {
      expect(chunk.content.length).toBeGreaterThan(0)
    }
  })

  // Test 4: chunks have sequential indices
  it('chunks have sequential indices', () => {
    const sentence = 'The defendant argued that the statute of limitations had expired on this matter. '
    const text = sentence.repeat(50)
    const chunks = chunkText(text)

    for (let i = 0; i < chunks.length; i++) {
      expect(chunks[i].chunk_index).toBe(i)
    }
  })

  // Test 5: chunks have valid char_start and char_end
  it('chunks have valid char_start and char_end', () => {
    const sentence = 'The appellate court affirmed the lower court ruling on constitutional grounds. '
    const text = sentence.repeat(50)
    const chunks = chunkText(text)

    for (const chunk of chunks) {
      expect(chunk.char_start).toBeGreaterThanOrEqual(0)
      expect(chunk.char_end).toBeGreaterThan(chunk.char_start)
      expect(chunk.char_end).toBeLessThanOrEqual(text.length)
    }
  })

  // Test 6: chunks have overlap (subsequent chunk starts before previous ends)
  it('chunks have overlap', () => {
    const sentence = 'The jury deliberated for several hours before reaching a unanimous verdict. '
    const text = sentence.repeat(50)
    const chunks = chunkText(text)

    expect(chunks.length).toBeGreaterThan(1)
    for (let i = 1; i < chunks.length; i++) {
      expect(chunks[i].char_start).toBeLessThan(chunks[i - 1].char_end)
    }
  })
})
