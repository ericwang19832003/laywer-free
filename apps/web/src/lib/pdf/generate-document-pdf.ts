import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

const PAGE_W = 612
const PAGE_H = 792
const MARGIN = 72
const CONTENT_W = PAGE_W - MARGIN * 2

const BODY_SIZE = 11
const HEADING_SIZE = 11
const TITLE_SIZE = 12
const LINE_HEIGHT = 15
const FOOTER_SIZE = 8

const DARK = rgb(0.1, 0.1, 0.1)
const LIGHT = rgb(0.5, 0.5, 0.5)

// Fixed x position for the § column in the federal two-column caption
const CAPTION_SEP_X = MARGIN + Math.round(CONTENT_W * 0.62)

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*([^*\n]+)\*\*/g, '$1')
    .replace(/\*([^*\n]+)\*/g, '$1')
    .replace(/__([^_\n]+)__/g, '$1')
    .replace(/_([^_\n]+)_/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/`([^`\n]+)`/g, '$1')
}

type LineClass =
  | 'watermark'
  | 'court_name'
  | 'caption'
  | 'doc_title'
  | 'roman_heading'
  | 'count_heading'
  | 'subsection'
  | 'empty'
  | 'body'

const STANDALONE_HEADINGS = new Set([
  'PRELIMINARY STATEMENT',
  'PRAYER FOR RELIEF',
  'CERTIFICATE OF SERVICE',
  'SIGNATURE BLOCK',
  'SIGNATURE BLOCK:',
  'JURY DEMAND',
  'CERTIFICATE OF CONFERENCE',
  'WHEREFORE',
])

function classifyLine(raw: string): LineClass {
  const t = raw.trim()
  if (!t) return 'empty'
  if (t === 'DRAFT -- NOT FOR FILING') return 'watermark'
  if (
    t === 'UNITED STATES DISTRICT COURT' ||
    /^(NORTHERN|SOUTHERN|EASTERN|WESTERN) DISTRICT OF TEXAS$/.test(t) ||
    /^[A-Z][A-Z ]* DIVISION$/.test(t)
  ) return 'court_name'
  // Caption rows have § preceded by 5+ spaces (two-column alignment).
  // Body text citations like "28 U.S.C. § 1332(a)" have at most one space before §.
  if (/ {5,}§/.test(raw) || /^ *§/.test(raw)) return 'caption'
  if (/^PLAINTIFF'S (ORIGINAL|FIRST AMENDED|AMENDED) (COMPLAINT|PETITION)$/.test(t)) return 'doc_title'
  if (/^[IVX]+\. [A-Z][A-Z ,.'\-\/]+$/.test(t)) return 'roman_heading'
  if (/^COUNT [IVX]+ --/.test(t)) return 'count_heading'
  if (STANDALONE_HEADINGS.has(t)) return 'roman_heading'
  if (/^[A-Z]\. [A-Z][A-Z ,.\-\/]+$/.test(t)) return 'subsection'
  return 'body'
}

function wrapText(
  text: string,
  font: { widthOfTextAtSize: (t: string, s: number) => number },
  size: number,
  maxWidth: number,
): string[] {
  if (!text) return ['']
  const words = text.split(/\s+/)
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    const test = current ? `${current} ${word}` : word
    if (font.widthOfTextAtSize(test, size) <= maxWidth) {
      current = test
    } else {
      if (current) lines.push(current)
      current = word
    }
  }
  if (current) lines.push(current)
  return lines.length ? lines : ['']
}

export interface DocumentPdfOptions {
  title: string
  content: string
  courtInfo?: string
}

export async function generateDocumentPdf(opts: DocumentPdfOptions): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  const regular = await pdfDoc.embedFont(StandardFonts.TimesRoman)
  const bold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold)

  // Strip annotations — shown in the UI sidebar, not needed in the PDF
  const annIdx = opts.content.indexOf('\n---ANNOTATIONS---')
  const rawContent = annIdx >= 0 ? opts.content.slice(0, annIdx).trimEnd() : opts.content

  // Court documents embed their own header structure; skip the legacy title block
  const trimmedContent = rawContent.trimStart()
  const isCourtDoc =
    trimmedContent.startsWith('DRAFT -- NOT FOR FILING') ||
    trimmedContent.startsWith('UNITED STATES DISTRICT COURT')

  const paragraphs = rawContent.split('\n')

  let page = pdfDoc.addPage([PAGE_W, PAGE_H])
  let y = PAGE_H - MARGIN
  let pageNum = 1

  function addFooter() {
    page.drawText('DRAFT — NOT LEGAL ADVICE', {
      x: MARGIN,
      y: MARGIN / 2,
      size: FOOTER_SIZE,
      font: regular,
      color: LIGHT,
    })
    page.drawText(`Page ${pageNum}`, {
      x: PAGE_W - MARGIN - regular.widthOfTextAtSize(`Page ${pageNum}`, FOOTER_SIZE),
      y: MARGIN / 2,
      size: FOOTER_SIZE,
      font: regular,
      color: LIGHT,
    })
  }

  function newPage() {
    addFooter()
    pageNum++
    page = pdfDoc.addPage([PAGE_W, PAGE_H])
    y = PAGE_H - MARGIN
  }

  function ensureSpace(needed: number) {
    if (y < MARGIN + needed) newPage()
  }

  function drawCentered(
    text: string,
    f: typeof regular | typeof bold,
    size: number,
    color: ReturnType<typeof rgb> = DARK,
  ) {
    const w = f.widthOfTextAtSize(text, size)
    ensureSpace(LINE_HEIGHT)
    page.drawText(text, { x: Math.max(MARGIN, (PAGE_W - w) / 2), y, size, font: f, color })
    y -= LINE_HEIGHT
  }

  function drawWrapped(
    text: string,
    f: typeof regular | typeof bold,
    size: number,
    indent = 0,
    color: ReturnType<typeof rgb> = DARK,
  ) {
    const lines = wrapText(text, f, size, CONTENT_W - indent)
    for (const line of lines) {
      ensureSpace(LINE_HEIGHT)
      page.drawText(line, { x: MARGIN + indent, y, size, font: f, color })
      y -= LINE_HEIGHT
    }
  }

  // Renders a caption line that contains § — left column is party text, right column is case number
  function drawCaptionLine(raw: string) {
    const sepIdx = raw.indexOf('§')
    if (sepIdx < 0) {
      const t = raw.trim()
      if (t) drawWrapped(t, regular, BODY_SIZE)
      return
    }
    const leftRaw = raw.slice(0, sepIdx)
    const leftTrimmed = leftRaw.trim()
    const rightPart = raw.slice(sepIdx + 1).trim()
    // "Plaintiff" and "Defendant" labels are indented in the source text
    const isIndented = leftRaw.startsWith('     ') || leftRaw.startsWith('\t')
    const leftIndent = isIndented ? 18 : 0

    ensureSpace(LINE_HEIGHT)
    if (leftTrimmed) {
      page.drawText(leftTrimmed, {
        x: MARGIN + leftIndent,
        y,
        size: BODY_SIZE,
        font: regular,
        color: DARK,
      })
    }
    page.drawText('§', { x: CAPTION_SEP_X, y, size: BODY_SIZE, font: regular, color: DARK })
    if (rightPart) {
      page.drawText(rightPart, {
        x: CAPTION_SEP_X + regular.widthOfTextAtSize('§  ', BODY_SIZE),
        y,
        size: BODY_SIZE,
        font: regular,
        color: DARK,
      })
    }
    y -= LINE_HEIGHT
  }

  // Legacy header block for non-court documents (motions, letters, etc.)
  if (!isCourtDoc) {
    const titleLines = wrapText(opts.title, bold, TITLE_SIZE, CONTENT_W)
    for (const line of titleLines) {
      ensureSpace(LINE_HEIGHT + 4)
      page.drawText(line, { x: MARGIN, y, size: TITLE_SIZE, font: bold, color: DARK })
      y -= LINE_HEIGHT + 4
    }
    y -= 8

    if (opts.courtInfo) {
      const infoLines = wrapText(opts.courtInfo, regular, BODY_SIZE - 2, CONTENT_W)
      for (const line of infoLines) {
        ensureSpace(LINE_HEIGHT)
        page.drawText(line, { x: MARGIN, y, size: BODY_SIZE - 2, font: regular, color: LIGHT })
        y -= LINE_HEIGHT
      }
      y -= 8
    }

    page.drawLine({
      start: { x: MARGIN, y },
      end: { x: PAGE_W - MARGIN, y },
      thickness: 0.5,
      color: rgb(0.82, 0.82, 0.82),
    })
    y -= LINE_HEIGHT
  }

  // Render the document body line by line
  for (const para of paragraphs) {
    const cls = classifyLine(para)
    const t = para.trim()

    if (cls === 'empty') {
      y -= LINE_HEIGHT * 0.4
      continue
    }

    if (cls === 'watermark') {
      drawCentered(t, bold, BODY_SIZE, LIGHT)
      y -= 6
      continue
    }

    if (cls === 'court_name') {
      drawCentered(t, regular, BODY_SIZE)
      continue
    }

    if (cls === 'caption') {
      drawCaptionLine(para)
      continue
    }

    if (cls === 'doc_title') {
      y -= 6
      drawCentered(t, bold, TITLE_SIZE)
      y -= 10
      continue
    }

    if (cls === 'roman_heading' || cls === 'count_heading') {
      y -= 8
      drawCentered(t, bold, HEADING_SIZE)
      y -= 4
      continue
    }

    if (cls === 'subsection') {
      y -= 4
      drawWrapped(t, bold, BODY_SIZE)
      y -= 2
      continue
    }

    // Body paragraph
    const cleaned = stripMarkdown(t)
    if (!cleaned) {
      y -= LINE_HEIGHT * 0.4
      continue
    }
    drawWrapped(cleaned, regular, BODY_SIZE)
  }

  addFooter()
  return pdfDoc.save()
}
