import { describe, it, expect } from 'vitest'
import { generateDocumentPdf } from '@/lib/pdf/generate-document-pdf'

describe('generateDocumentPdf', () => {
  it('generates a valid PDF buffer', async () => {
    const result = await generateDocumentPdf({
      title: 'Test Document',
      content: 'This is the body of the document.',
    })
    expect(result).toBeInstanceOf(Uint8Array)
    expect(result.length).toBeGreaterThan(100)
    const header = new TextDecoder().decode(result.slice(0, 5))
    expect(header).toBe('%PDF-')
  })

  it('includes court info when provided', async () => {
    const result = await generateDocumentPdf({
      title: 'Motion for Continuance',
      content: 'Body text here.',
      courtInfo: 'District Court of Harris County, Texas',
    })
    expect(result).toBeInstanceOf(Uint8Array)
    expect(result.length).toBeGreaterThan(100)
  })

  it('handles long content with page breaks', async () => {
    const longContent = Array(200).fill('This is a paragraph of text that should cause page breaks in the generated PDF document.').join('\n')
    const result = await generateDocumentPdf({
      title: 'Long Document',
      content: longContent,
    })
    expect(result).toBeInstanceOf(Uint8Array)
    expect(result.length).toBeGreaterThan(1000)
  })

  it('handles empty content', async () => {
    const result = await generateDocumentPdf({
      title: 'Empty',
      content: '',
    })
    expect(result).toBeInstanceOf(Uint8Array)
  })
})
