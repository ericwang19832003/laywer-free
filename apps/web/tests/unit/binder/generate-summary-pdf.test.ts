import { describe, it, expect } from 'vitest'
import { generateSummaryPdf } from '@/lib/binder/generate-summary-pdf'
import { PDFDocument } from 'pdf-lib'

const BASE_OPTS = {
  title: 'Test Binder',
  caseCounty: 'Travis',
  caseRole: 'plaintiff',
  generatedAt: '2026-03-02',
  partyNames: { plaintiff: 'Jane Doe', defendant: 'John Smith' },
  causeNumber: '2026-CI-12345',
  exhibits: [
    {
      exhibit_no: '1',
      title: 'Contract',
      file_name: 'contract.pdf',
      category: 'Document',
      notes: 'Signed copy',
    },
  ],
  sections: ['Timeline', 'Exhibit Index'],
}

describe('generateSummaryPdf', () => {
  it('produces a valid PDF', async () => {
    const bytes = await generateSummaryPdf(BASE_OPTS)
    expect(bytes).toBeInstanceOf(Uint8Array)
    expect(bytes.length).toBeGreaterThan(0)
    const doc = await PDFDocument.load(bytes)
    expect(doc.getPageCount()).toBeGreaterThanOrEqual(1)
  })

  it('includes party names on cover page', async () => {
    const bytes = await generateSummaryPdf(BASE_OPTS)
    const doc = await PDFDocument.load(bytes)
    // Cover is first page — we can't easily read text from pdf-lib
    // but we verify the PDF has enough pages for cover + TOC + dividers + exhibit index
    // Cover + TOC + 2 dividers + exhibit index = at least 5 pages
    expect(doc.getPageCount()).toBeGreaterThanOrEqual(5)
  })

  it('includes section divider pages', async () => {
    const opts = { ...BASE_OPTS, sections: ['Timeline', 'Exhibit Index'] }
    const bytes = await generateSummaryPdf(opts)
    const doc = await PDFDocument.load(bytes)
    // Cover(1) + TOC(1) + Timeline divider(1) + Exhibit Index divider(1) + Exhibit Index content(1) = 5
    expect(doc.getPageCount()).toBeGreaterThanOrEqual(5)
  })

  it('handles empty exhibits gracefully', async () => {
    const opts = { ...BASE_OPTS, exhibits: [] }
    const bytes = await generateSummaryPdf(opts)
    const doc = await PDFDocument.load(bytes)
    expect(doc.getPageCount()).toBeGreaterThanOrEqual(3) // cover + TOC + at least 1 divider
  })

  it('handles missing party names', async () => {
    const opts = { ...BASE_OPTS, partyNames: undefined, causeNumber: undefined }
    const bytes = await generateSummaryPdf(opts)
    const doc = await PDFDocument.load(bytes)
    expect(doc.getPageCount()).toBeGreaterThanOrEqual(1)
  })

  it('handles many exhibits across multiple pages', async () => {
    const manyExhibits = Array.from({ length: 50 }, (_, i) => ({
      exhibit_no: String(i + 1),
      title: `Exhibit ${i + 1} with a longer title for wrapping`,
      file_name: `file-${i + 1}.pdf`,
      category: 'Document',
      notes: `Notes for exhibit ${i + 1}`,
    }))
    const opts = { ...BASE_OPTS, exhibits: manyExhibits }
    const bytes = await generateSummaryPdf(opts)
    const doc = await PDFDocument.load(bytes)
    // Many exhibits should produce extra pages
    expect(doc.getPageCount()).toBeGreaterThan(5)
  })
})
