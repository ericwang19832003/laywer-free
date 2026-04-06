import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

const PAGE_W = 612
const PAGE_H = 792
const MARGIN = 72
const CONTENT_W = PAGE_W - MARGIN * 2

const BODY_SIZE = 12
const TITLE_SIZE = 14
const LINE_HEIGHT = 16
const FOOTER_SIZE = 8

const DARK = rgb(0.1, 0.1, 0.1)
const LIGHT = rgb(0.5, 0.5, 0.5)

function wrapText(text: string, font: { widthOfTextAtSize: (t: string, s: number) => number }, size: number, maxWidth: number): string[] {
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

export interface DocumentPdfOptions {
  title: string
  content: string
  courtInfo?: string
}

export async function generateDocumentPdf(opts: DocumentPdfOptions): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  const regular = await doc.embedFont(StandardFonts.TimesRoman)
  const bold = await doc.embedFont(StandardFonts.TimesRomanBold)

  const paragraphs = opts.content.split('\n')

  let page = doc.addPage([PAGE_W, PAGE_H])
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
    page = doc.addPage([PAGE_W, PAGE_H])
    y = PAGE_H - MARGIN
  }

  // Title
  const titleLines = wrapText(opts.title, bold, TITLE_SIZE, CONTENT_W)
  for (const line of titleLines) {
    if (y < MARGIN + LINE_HEIGHT) newPage()
    page.drawText(line, { x: MARGIN, y, size: TITLE_SIZE, font: bold, color: DARK })
    y -= LINE_HEIGHT + 4
  }
  y -= 8

  // Court info
  if (opts.courtInfo) {
    const infoLines = wrapText(opts.courtInfo, regular, BODY_SIZE - 2, CONTENT_W)
    for (const line of infoLines) {
      if (y < MARGIN + LINE_HEIGHT) newPage()
      page.drawText(line, { x: MARGIN, y, size: BODY_SIZE - 2, font: regular, color: LIGHT })
      y -= LINE_HEIGHT
    }
    y -= 8
  }

  // Horizontal rule
  page.drawLine({
    start: { x: MARGIN, y },
    end: { x: PAGE_W - MARGIN, y },
    thickness: 0.5,
    color: rgb(0.82, 0.82, 0.82),
  })
  y -= LINE_HEIGHT

  // Body content
  for (const para of paragraphs) {
    if (para.trim() === '') {
      y -= LINE_HEIGHT / 2
      continue
    }

    const lines = wrapText(para, regular, BODY_SIZE, CONTENT_W)
    for (const line of lines) {
      if (y < MARGIN + LINE_HEIGHT) newPage()
      page.drawText(line, { x: MARGIN, y, size: BODY_SIZE, font: regular, color: DARK })
      y -= LINE_HEIGHT
    }
  }

  addFooter()

  return doc.save()
}
