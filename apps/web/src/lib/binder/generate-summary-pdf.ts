import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb } from 'pdf-lib'

// ── Layout constants ────────────────────────
const PAGE_W = 612  // US Letter width (points)
const PAGE_H = 792  // US Letter height
const MARGIN = 72   // 1 inch
const CONTENT_W = PAGE_W - MARGIN * 2  // 468pt usable

const BODY_SIZE = 9
const HEADER_SIZE = 10
const LINE_HEIGHT = 14
const ROW_PAD = 4

// 5-column layout — widths sum to CONTENT_W (468)
const COL = {
  no:       { x: MARGIN,       w: 32  },
  title:    { x: MARGIN + 32,  w: 138 },
  file:     { x: MARGIN + 170, w: 118 },
  category: { x: MARGIN + 288, w: 65  },
  notes:    { x: MARGIN + 353, w: 115 },
} as const

const DARK  = rgb(0.1, 0.1, 0.1)
const MID   = rgb(0.25, 0.25, 0.25)
const LIGHT = rgb(0.45, 0.45, 0.45)
const RULE  = rgb(0.82, 0.82, 0.82)

// ── Text wrapping ───────────────────────────
function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  if (!text) return ['']
  const words = text.split(/\s+/)
  const lines: string[] = []
  let current = ''

  for (const word of words) {
    const test = current ? `${current} ${word}` : word
    const testWidth = font.widthOfTextAtSize(test, size)

    if (testWidth <= maxWidth) {
      current = test
    } else {
      if (current) lines.push(current)
      current = word
    }
  }
  if (current) lines.push(current)
  return lines.length ? lines : ['']
}

// ── Types ───────────────────────────────────
export interface ExhibitEntry {
  exhibit_no: string
  title: string
  file_name: string
  category: string
  notes: string
}

export interface SummaryPdfOptions {
  title: string
  caseCounty: string | null
  caseRole: string
  generatedAt: string
  partyNames?: { plaintiff: string; defendant: string }
  causeNumber?: string
  exhibits: ExhibitEntry[]
  sections: string[]
}

// ── Section Divider ─────────────────────────
function addDividerPage(doc: PDFDocument, sectionTitle: string, bold: PDFFont): void {
  const page = doc.addPage([PAGE_W, PAGE_H])
  const titleWidth = bold.widthOfTextAtSize(sectionTitle.toUpperCase(), 24)
  page.drawText(sectionTitle.toUpperCase(), {
    x: (PAGE_W - titleWidth) / 2,
    y: PAGE_H / 2 + 12,
    size: 24,
    font: bold,
    color: DARK,
  })
  // Centered rule below title
  const ruleW = Math.min(titleWidth + 60, CONTENT_W)
  page.drawLine({
    start: { x: (PAGE_W - ruleW) / 2, y: PAGE_H / 2 - 4 },
    end: { x: (PAGE_W + ruleW) / 2, y: PAGE_H / 2 - 4 },
    thickness: 0.75,
    color: RULE,
  })
}

// ── PDF Builder ─────────────────────────────
export async function generateSummaryPdf(opts: SummaryPdfOptions): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  const regular = await doc.embedFont(StandardFonts.Helvetica)
  const bold = await doc.embedFont(StandardFonts.HelveticaBold)

  // We build: cover → TOC placeholder → (divider + content) per section
  // Then go back and fill in TOC with real page numbers

  // ── Cover page ──
  const cover = doc.addPage([PAGE_W, PAGE_H])
  let y = PAGE_H - 200

  // Title
  const titleLines = wrapText(opts.title, bold, 26, CONTENT_W)
  for (const line of titleLines) {
    cover.drawText(line, { x: MARGIN, y, size: 26, font: bold, color: DARK })
    y -= 34
  }
  y -= 12

  // Horizontal rule
  cover.drawLine({
    start: { x: MARGIN, y: y + 10 },
    end: { x: PAGE_W - MARGIN, y: y + 10 },
    thickness: 0.75,
    color: RULE,
  })
  y -= 16

  // Metadata lines
  const metaLines: string[] = []
  if (opts.causeNumber) metaLines.push(`Cause No. ${opts.causeNumber}`)
  if (opts.partyNames) {
    metaLines.push(`Plaintiff: ${opts.partyNames.plaintiff}`)
    metaLines.push(`Defendant: ${opts.partyNames.defendant}`)
  }
  if (opts.caseCounty) metaLines.push(`County: ${opts.caseCounty}`)
  metaLines.push(`Role: ${opts.caseRole.charAt(0).toUpperCase() + opts.caseRole.slice(1)}`)
  metaLines.push(`Generated: ${opts.generatedAt}`)
  metaLines.push(`Exhibits: ${opts.exhibits.length}`)

  for (const line of metaLines) {
    cover.drawText(line, { x: MARGIN, y, size: 12, font: regular, color: MID })
    y -= 22
  }

  // ── TOC page (placeholder — we'll fill page numbers after building all sections) ──
  const tocPage = doc.addPage([PAGE_W, PAGE_H])
  // TOC is page index 1 (0-based)

  // Track section → page number mapping
  const sectionPageNumbers: number[] = []

  // ── Build sections with dividers ──
  for (const section of opts.sections) {
    // Divider page for this section
    addDividerPage(doc, section, bold)
    // Record the page number of the divider (1-based for display)
    sectionPageNumbers.push(doc.getPageCount())

    // If this section is "Exhibit Index", render the exhibit content after the divider
    if (section.toLowerCase() === 'exhibit index') {
      buildExhibitIndex(doc, opts.exhibits, regular, bold)
    }
  }

  // ── Fill in TOC with real page numbers ──
  y = PAGE_H - MARGIN
  tocPage.drawText('Table of Contents', { x: MARGIN, y, size: 18, font: bold, color: DARK })
  y -= 36

  for (let i = 0; i < opts.sections.length; i++) {
    const label = opts.sections[i]
    const pageNum = sectionPageNumbers[i]

    // Section name on the left
    tocPage.drawText(label, { x: MARGIN + 8, y, size: 11, font: regular, color: MID })

    // Page number on the right
    const numStr = String(pageNum)
    const numWidth = regular.widthOfTextAtSize(numStr, 11)
    tocPage.drawText(numStr, {
      x: PAGE_W - MARGIN - numWidth,
      y,
      size: 11,
      font: regular,
      color: MID,
    })

    // Dot leader between name and number
    const nameWidth = regular.widthOfTextAtSize(label, 11)
    const dotStart = MARGIN + 8 + nameWidth + 8
    const dotEnd = PAGE_W - MARGIN - numWidth - 8
    if (dotEnd > dotStart) {
      const dot = '.'
      const dotWidth = regular.widthOfTextAtSize('. ', 11)
      let dx = dotStart
      while (dx < dotEnd) {
        tocPage.drawText(dot, { x: dx, y, size: 11, font: regular, color: RULE })
        dx += dotWidth
      }
    }

    y -= 22
  }

  return doc.save()
}

// ── Exhibit Index Builder (extracted from inline) ──
function buildExhibitIndex(
  doc: PDFDocument,
  exhibits: ExhibitEntry[],
  regular: PDFFont,
  bold: PDFFont
): void {
  let page: PDFPage = doc.addPage([PAGE_W, PAGE_H])
  let y = PAGE_H - MARGIN

  function newIndexPage(): void {
    page = doc.addPage([PAGE_W, PAGE_H])
    y = PAGE_H - MARGIN
    drawIndexHeader()
  }

  function drawIndexHeader(): void {
    page.drawText('Exhibit Index', { x: MARGIN, y, size: 16, font: bold, color: DARK })
    y -= 28

    page.drawText('No.',      { x: COL.no.x,       y, size: HEADER_SIZE, font: bold, color: DARK })
    page.drawText('Title',    { x: COL.title.x,    y, size: HEADER_SIZE, font: bold, color: DARK })
    page.drawText('File',     { x: COL.file.x,     y, size: HEADER_SIZE, font: bold, color: DARK })
    page.drawText('Category', { x: COL.category.x, y, size: HEADER_SIZE, font: bold, color: DARK })
    page.drawText('Notes',    { x: COL.notes.x,    y, size: HEADER_SIZE, font: bold, color: DARK })
    y -= 4

    page.drawLine({
      start: { x: MARGIN, y },
      end: { x: PAGE_W - MARGIN, y },
      thickness: 0.5,
      color: RULE,
    })
    y -= LINE_HEIGHT
  }

  if (exhibits.length === 0) {
    drawIndexHeader()
    y -= 12
    page.drawText('No exhibits', { x: MARGIN + 8, y, size: BODY_SIZE, font: regular, color: LIGHT })
    return
  }

  drawIndexHeader()

  for (const ex of exhibits) {
    const titleLines = wrapText(ex.title || '—', regular, BODY_SIZE, COL.title.w - 4)
    const fileLines = wrapText(ex.file_name || '—', regular, BODY_SIZE, COL.file.w - 4)
    const notesLines = wrapText(ex.notes || '', regular, BODY_SIZE, COL.notes.w - 4)
    const categoryText = ex.category || '—'

    const maxLines = Math.max(titleLines.length, fileLines.length, notesLines.length, 1)
    const rowHeight = maxLines * LINE_HEIGHT + ROW_PAD

    if (y - rowHeight < MARGIN) {
      newIndexPage()
    }

    const rowTop = y

    page.drawText(ex.exhibit_no, { x: COL.no.x, y: rowTop, size: BODY_SIZE, font: bold, color: MID })

    for (let i = 0; i < titleLines.length; i++) {
      page.drawText(titleLines[i], {
        x: COL.title.x, y: rowTop - i * LINE_HEIGHT,
        size: BODY_SIZE, font: regular, color: MID,
      })
    }

    for (let i = 0; i < fileLines.length; i++) {
      page.drawText(fileLines[i], {
        x: COL.file.x, y: rowTop - i * LINE_HEIGHT,
        size: BODY_SIZE, font: regular, color: LIGHT,
      })
    }

    page.drawText(categoryText, { x: COL.category.x, y: rowTop, size: BODY_SIZE, font: regular, color: MID })

    for (let i = 0; i < notesLines.length; i++) {
      page.drawText(notesLines[i], {
        x: COL.notes.x, y: rowTop - i * LINE_HEIGHT,
        size: BODY_SIZE, font: regular, color: LIGHT,
      })
    }

    y -= rowHeight

    page.drawLine({
      start: { x: MARGIN, y: y + ROW_PAD / 2 },
      end: { x: PAGE_W - MARGIN, y: y + ROW_PAD / 2 },
      thickness: 0.25,
      color: RULE,
    })
  }
}
