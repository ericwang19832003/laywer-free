import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb } from 'pdf-lib'

// ── Layout constants ────────────────────────

const PAGE_W = 612  // US Letter width (points)
const PAGE_H = 792  // US Letter height
const MARGIN = 72   // 1 inch

const CONTENT_W = PAGE_W - MARGIN * 2  // 468pt usable

const BODY_SIZE = 9
const HEADER_SIZE = 10
const LINE_HEIGHT = 14  // row line-height for body text
const ROW_PAD = 4       // vertical padding between rows

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

/** Break text into lines that fit within maxWidth at the given font/size */
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
      // If a single word is wider than the column, force it on its own line
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
  exhibits: ExhibitEntry[]
  sections: string[]
}

// ── PDF Builder ─────────────────────────────

export async function generateSummaryPdf(opts: SummaryPdfOptions): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  const regular = await doc.embedFont(StandardFonts.Helvetica)
  const bold = await doc.embedFont(StandardFonts.HelveticaBold)

  // ── Cover page ──

  const cover = doc.addPage([PAGE_W, PAGE_H])
  let y = PAGE_H - 220

  // Title (wrap if very long)
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

  const metaLines = [
    opts.caseCounty ? `County: ${opts.caseCounty}` : null,
    `Role: ${opts.caseRole.charAt(0).toUpperCase() + opts.caseRole.slice(1)}`,
    `Generated: ${opts.generatedAt}`,
    `Exhibits: ${opts.exhibits.length}`,
  ].filter(Boolean) as string[]

  for (const line of metaLines) {
    cover.drawText(line, { x: MARGIN, y, size: 12, font: regular, color: MID })
    y -= 22
  }

  // ── Table of Contents ──

  const tocPage = doc.addPage([PAGE_W, PAGE_H])
  y = PAGE_H - MARGIN

  tocPage.drawText('Table of Contents', { x: MARGIN, y, size: 18, font: bold, color: DARK })
  y -= 36

  for (const section of opts.sections) {
    tocPage.drawText(`•  ${section}`, { x: MARGIN + 8, y, size: 11, font: regular, color: MID })
    y -= 22
  }

  // ── Exhibit Index (multi-page) ──

  let page: PDFPage = doc.addPage([PAGE_W, PAGE_H])
  y = PAGE_H - MARGIN

  /** Start a new index page with header row */
  function newIndexPage(): void {
    page = doc.addPage([PAGE_W, PAGE_H])
    y = PAGE_H - MARGIN
    drawIndexHeader()
  }

  /** Draw the column headers + rule */
  function drawIndexHeader(): void {
    page.drawText('Exhibit Index', { x: MARGIN, y, size: 16, font: bold, color: DARK })
    y -= 28

    // Column headers
    page.drawText('No.',      { x: COL.no.x,       y, size: HEADER_SIZE, font: bold, color: DARK })
    page.drawText('Title',    { x: COL.title.x,    y, size: HEADER_SIZE, font: bold, color: DARK })
    page.drawText('File',     { x: COL.file.x,     y, size: HEADER_SIZE, font: bold, color: DARK })
    page.drawText('Category', { x: COL.category.x, y, size: HEADER_SIZE, font: bold, color: DARK })
    page.drawText('Notes',    { x: COL.notes.x,    y, size: HEADER_SIZE, font: bold, color: DARK })
    y -= 4

    // Header underline
    page.drawLine({
      start: { x: MARGIN, y },
      end: { x: PAGE_W - MARGIN, y },
      thickness: 0.5,
      color: RULE,
    })
    y -= LINE_HEIGHT
  }

  drawIndexHeader()

  for (const ex of opts.exhibits) {
    // Pre-compute wrapped lines for each column
    const titleLines = wrapText(ex.title || '—', regular, BODY_SIZE, COL.title.w - 4)
    const fileLines = wrapText(ex.file_name || '—', regular, BODY_SIZE, COL.file.w - 4)
    const notesLines = wrapText(ex.notes || '', regular, BODY_SIZE, COL.notes.w - 4)
    const categoryText = ex.category || '—'

    // Row height = tallest column
    const maxLines = Math.max(titleLines.length, fileLines.length, notesLines.length, 1)
    const rowHeight = maxLines * LINE_HEIGHT + ROW_PAD

    // Page break if needed
    if (y - rowHeight < MARGIN) {
      newIndexPage()
    }

    const rowTop = y

    // No. (single line, top-aligned)
    page.drawText(ex.exhibit_no, { x: COL.no.x, y: rowTop, size: BODY_SIZE, font: bold, color: MID })

    // Title (wrapped)
    for (let i = 0; i < titleLines.length; i++) {
      page.drawText(titleLines[i], {
        x: COL.title.x,
        y: rowTop - i * LINE_HEIGHT,
        size: BODY_SIZE,
        font: regular,
        color: MID,
      })
    }

    // File (wrapped)
    for (let i = 0; i < fileLines.length; i++) {
      page.drawText(fileLines[i], {
        x: COL.file.x,
        y: rowTop - i * LINE_HEIGHT,
        size: BODY_SIZE,
        font: regular,
        color: LIGHT,
      })
    }

    // Category (single line)
    page.drawText(categoryText, { x: COL.category.x, y: rowTop, size: BODY_SIZE, font: regular, color: MID })

    // Notes (wrapped)
    for (let i = 0; i < notesLines.length; i++) {
      page.drawText(notesLines[i], {
        x: COL.notes.x,
        y: rowTop - i * LINE_HEIGHT,
        size: BODY_SIZE,
        font: regular,
        color: LIGHT,
      })
    }

    y -= rowHeight

    // Row separator
    page.drawLine({
      start: { x: MARGIN, y: y + ROW_PAD / 2 },
      end: { x: PAGE_W - MARGIN, y: y + ROW_PAD / 2 },
      thickness: 0.25,
      color: RULE,
    })
  }

  return doc.save()
}
