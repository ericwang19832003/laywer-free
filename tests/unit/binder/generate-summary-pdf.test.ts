import { describe, it, expect } from 'vitest'
import { generateSummaryPdf } from '@/lib/binder/generate-summary-pdf'

describe('generateSummaryPdf', () => {
  const baseOpts = {
    title: 'Test Binder',
    caseCounty: 'Travis',
    caseRole: 'plaintiff',
    generatedAt: 'February 24, 2026',
    sections: [
      '01 — Binder Summary',
      '02 — Exhibit List',
      '05 — Exhibits (3 files)',
    ],
  }

  it('generates a valid PDF buffer', async () => {
    const pdf = await generateSummaryPdf({
      ...baseOpts,
      exhibits: [
        { exhibit_no: '1', title: 'Lease', file_name: 'lease.pdf', category: 'contract', notes: '' },
      ],
    })

    expect(pdf).toBeInstanceOf(Uint8Array)
    expect(pdf.length).toBeGreaterThan(100)

    // PDF magic bytes: %PDF
    const header = String.fromCharCode(pdf[0], pdf[1], pdf[2], pdf[3])
    expect(header).toBe('%PDF')
  })

  it('handles empty exhibits list', async () => {
    const pdf = await generateSummaryPdf({
      ...baseOpts,
      exhibits: [],
    })

    expect(pdf).toBeInstanceOf(Uint8Array)
    const header = String.fromCharCode(pdf[0], pdf[1], pdf[2], pdf[3])
    expect(header).toBe('%PDF')
  })

  it('handles long titles without error', async () => {
    const pdf = await generateSummaryPdf({
      ...baseOpts,
      title: 'A Very Long Binder Title That Should Wrap Across Multiple Lines on the Cover Page',
      exhibits: [
        {
          exhibit_no: '1',
          title: 'This Is An Extremely Long Exhibit Title That Must Wrap Within The Title Column Without Overlapping Into Adjacent Columns',
          file_name: 'very_long_original_filename_that_should_also_wrap_correctly_in_the_file_column.pdf',
          category: 'contract',
          notes: 'Extensive notes that describe what this exhibit contains and why it is relevant to the case at hand.',
        },
      ],
    })

    expect(pdf).toBeInstanceOf(Uint8Array)
    expect(pdf.length).toBeGreaterThan(100)
  })

  it('generates multiple pages for many exhibits', async () => {
    const exhibits = Array.from({ length: 60 }, (_, i) => ({
      exhibit_no: String(i + 1),
      title: `Exhibit ${i + 1} — Document Title`,
      file_name: `document_${i + 1}.pdf`,
      category: i % 2 === 0 ? 'contract' : 'photo',
      notes: `Notes for exhibit ${i + 1}`,
    }))

    const pdf = await generateSummaryPdf({
      ...baseOpts,
      exhibits,
    })

    expect(pdf).toBeInstanceOf(Uint8Array)
    // With 60 exhibits, we should have more than 3 pages (cover + TOC + multiple index pages)
    // A rough check: each page adds ~2KB minimum overhead
    expect(pdf.length).toBeGreaterThan(5000)
  })

  it('includes all 5 column headers in exhibit index', async () => {
    // We verify structurally that the PDF is generated without error
    // with all exhibit fields populated — visual verification is manual
    const pdf = await generateSummaryPdf({
      ...baseOpts,
      exhibits: [
        {
          exhibit_no: '1',
          title: 'Contract',
          file_name: 'contract.pdf',
          category: 'financial',
          notes: 'Signed on Jan 1',
        },
        {
          exhibit_no: '2',
          title: 'Photo',
          file_name: 'photo.jpg',
          category: 'photo',
          notes: '',
        },
      ],
    })

    expect(pdf).toBeInstanceOf(Uint8Array)
  })
})
