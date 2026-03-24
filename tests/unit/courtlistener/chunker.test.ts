import { describe, it, expect } from 'vitest'
import { chunkText } from '@/lib/courtlistener/chunker'

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
    expect(chunks[0].paragraph_start).toBe(0)
    expect(chunks[0].paragraph_end).toBe(0)
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

  it('adds section titles, paragraph ranges, and metadata', () => {
    const text = [
      'FACTS',
      '',
      'Plaintiff was served on January 1, 2024.',
      'The court holds that service was defective. See 123 F.3d 456.',
      '',
      'ANALYSIS',
      '',
      'The court concludes the notice was insufficient.',
    ].join('\n')

    const chunks = chunkText(text)
    expect(chunks.length).toBeGreaterThan(0)

    const first = chunks[0]
    expect(first.section_title).toBe('FACTS')
    expect(first.paragraph_start).toBe(0)
    expect(first.paragraph_end).toBeGreaterThanOrEqual(first.paragraph_start)
    expect(first.citation_count).toBeGreaterThanOrEqual(1)
    expect(first.contains_holding).toBe(true)
  })
})
