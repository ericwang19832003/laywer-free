import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { getCourtLabel, getStateName } from '@/lib/filing-configs'

const PAGE_W = 612
const PAGE_H = 792
const MARGIN = 72
const CONTENT_W = PAGE_W - MARGIN * 2

const SIZES = {
  courtHeader: 11,
  caseCaption: 12,
  sectionTitle: 12,
  body: 12,
  small: 10,
  footer: 8,
} as const

const LINE_H = 16
const DARK = rgb(0.1, 0.1, 0.1)
const LIGHT = rgb(0.5, 0.5, 0.5)
const RULE_COLOR = rgb(0.3, 0.3, 0.3)

export interface CourtFormData {
  // Court
  state: string
  county: string
  courtType: string
  causeNumber?: string

  // Parties
  plaintiffName: string
  plaintiffAddress?: string
  plaintiffCityStateZip?: string
  defendants: Array<{
    name: string
    address?: string
    cityStateZip?: string
  }>

  // Document
  documentTitle: string
  documentBody: string

  // Metadata
  role: 'plaintiff' | 'defendant'
  proSe: boolean
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

function centerText(
  text: string,
  font: { widthOfTextAtSize: (t: string, s: number) => number },
  size: number,
): number {
  const w = font.widthOfTextAtSize(text, size)
  return (PAGE_W - w) / 2
}

export async function generateCourtFormPdf(data: CourtFormData): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  const regular = await doc.embedFont(StandardFonts.TimesRoman)
  const bold = await doc.embedFont(StandardFonts.TimesRomanBold)

  let page = doc.addPage([PAGE_W, PAGE_H])
  let y = PAGE_H - MARGIN
  let pageNum = 1

  const courtLabel = getCourtLabel(data.state, data.courtType).toUpperCase()
  const stateName = getStateName(data.state).toUpperCase()

  // --- Footer ---
  function addFooter() {
    page.drawText('DRAFT — NOT LEGAL ADVICE', {
      x: MARGIN,
      y: MARGIN / 2,
      size: SIZES.footer,
      font: regular,
      color: LIGHT,
    })
    page.drawText(`Page ${pageNum}`, {
      x: PAGE_W - MARGIN - regular.widthOfTextAtSize(`Page ${pageNum}`, SIZES.footer),
      y: MARGIN / 2,
      size: SIZES.footer,
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

  function ensureSpace(needed: number) {
    if (y < MARGIN + needed) newPage()
  }

  function drawCentered(text: string, size: number, font: typeof regular | typeof bold, color = DARK) {
    ensureSpace(LINE_H)
    page.drawText(text, { x: centerText(text, font, size), y, size, font, color })
    y -= LINE_H
  }

  function drawLeft(text: string, size: number, font: typeof regular | typeof bold, indent = 0, color = DARK) {
    ensureSpace(LINE_H)
    page.drawText(text, { x: MARGIN + indent, y, size, font, color })
    y -= LINE_H
  }

  function drawWrapped(text: string, size: number, font: typeof regular | typeof bold, indent = 0) {
    const maxW = CONTENT_W - indent
    const lines = wrapText(text, font, size, maxW)
    for (const line of lines) {
      ensureSpace(LINE_H)
      page.drawText(line, { x: MARGIN + indent, y, size, font, color: DARK })
      y -= LINE_H
    }
  }

  function drawHRule() {
    ensureSpace(LINE_H)
    page.drawLine({
      start: { x: MARGIN, y },
      end: { x: PAGE_W - MARGIN, y },
      thickness: 1,
      color: RULE_COLOR,
    })
    y -= 4
  }

  // ==========================================
  // COURT HEADER
  // ==========================================
  if (data.courtType === 'federal') {
    drawCentered('UNITED STATES DISTRICT COURT', SIZES.courtHeader, bold)
    const districtLine = `${stateName} DISTRICT`
    drawCentered(districtLine, SIZES.courtHeader, bold)
    if (data.county) {
      drawCentered(`${data.county.toUpperCase()} DIVISION`, SIZES.courtHeader, bold)
    }
  } else {
    const causeNoLine = data.causeNumber ? `  No. ${data.causeNumber}` : ''
    drawCentered(`IN THE ${courtLabel}${causeNoLine}`, SIZES.courtHeader, bold)
    drawCentered(`${data.county?.toUpperCase() ?? '________'} COUNTY, ${stateName}`, SIZES.courtHeader, bold)
  }
  y -= 8
  drawHRule()
  y -= 4

  // ==========================================
  // CASE CAPTION
  // ==========================================
  const captionX = MARGIN
  const captionMid = PAGE_W / 2
  const vBarX = captionMid - 10

  // Plaintiff
  ensureSpace(LINE_H * 6)
  page.drawText(data.plaintiffName.toUpperCase() + ',', {
    x: captionX,
    y,
    size: SIZES.caseCaption,
    font: bold,
    color: DARK,
  })
  y -= LINE_H
  page.drawText(data.role === 'plaintiff' ? 'Plaintiff,' : 'Defendant,', {
    x: captionX + 20,
    y,
    size: SIZES.caseCaption,
    font: regular,
    color: DARK,
  })

  // "vs." centered vertically
  y -= LINE_H
  page.drawText('vs.', {
    x: captionX + 20,
    y,
    size: SIZES.caseCaption,
    font: regular,
    color: DARK,
  })

  // Cause number on right side
  if (data.causeNumber) {
    page.drawText(`Cause No. ${data.causeNumber}`, {
      x: vBarX + 20,
      y: y + LINE_H,
      size: SIZES.caseCaption,
      font: bold,
      color: DARK,
    })
  }

  // Defendant(s)
  y -= LINE_H
  for (const def of data.defendants) {
    page.drawText(def.name.toUpperCase() + ',', {
      x: captionX,
      y,
      size: SIZES.caseCaption,
      font: bold,
      color: DARK,
    })
    y -= LINE_H
  }
  page.drawText(data.role === 'plaintiff' ? 'Defendant(s).' : 'Plaintiff(s).', {
    x: captionX + 20,
    y,
    size: SIZES.caseCaption,
    font: regular,
    color: DARK,
  })

  // Vertical bar
  const barTop = y + LINE_H * (data.defendants.length + 4)
  const barBottom = y
  page.drawLine({
    start: { x: vBarX, y: barTop },
    end: { x: vBarX, y: barBottom },
    thickness: 1,
    color: RULE_COLOR,
  })

  y -= LINE_H
  drawHRule()
  y -= 8

  // ==========================================
  // DOCUMENT TITLE
  // ==========================================
  drawCentered(data.documentTitle.toUpperCase(), SIZES.sectionTitle, bold)
  y -= 8

  // ==========================================
  // PRO SE NOTICE
  // ==========================================
  if (data.proSe) {
    drawCentered('(Filed Pro Se)', SIZES.small, regular, LIGHT)
    y -= 4
  }

  // ==========================================
  // DOCUMENT BODY
  // ==========================================
  const paragraphs = data.documentBody.split('\n')
  for (const para of paragraphs) {
    const trimmed = para.trim()
    if (trimmed === '') {
      y -= LINE_H / 2
      continue
    }

    // Detect section headings (ALL CAPS lines or Roman numeral headings)
    const isHeading = /^[IVX]+\.\s+/.test(trimmed) ||
      (trimmed === trimmed.toUpperCase() && trimmed.length < 80 && !trimmed.startsWith('-'))

    if (isHeading) {
      y -= 4
      drawWrapped(trimmed, SIZES.sectionTitle, bold)
      y -= 2
    } else {
      drawWrapped(trimmed, SIZES.body, regular, 36)
    }
  }

  // ==========================================
  // SIGNATURE BLOCK
  // ==========================================
  y -= LINE_H * 2
  ensureSpace(LINE_H * 8)

  drawLeft('Respectfully submitted,', SIZES.body, regular)
  y -= LINE_H * 2

  // Signature line
  const sigX = MARGIN + CONTENT_W / 2
  page.drawLine({
    start: { x: sigX, y },
    end: { x: sigX + CONTENT_W / 2, y },
    thickness: 0.5,
    color: DARK,
  })
  y -= LINE_H

  page.drawText(data.plaintiffName, {
    x: sigX,
    y,
    size: SIZES.body,
    font: bold,
    color: DARK,
  })
  y -= LINE_H

  if (data.proSe) {
    page.drawText('Pro Se', {
      x: sigX,
      y,
      size: SIZES.small,
      font: regular,
      color: DARK,
    })
    y -= LINE_H
  }

  if (data.plaintiffAddress) {
    page.drawText(data.plaintiffAddress, {
      x: sigX,
      y,
      size: SIZES.small,
      font: regular,
      color: DARK,
    })
    y -= LINE_H
  }
  if (data.plaintiffCityStateZip) {
    page.drawText(data.plaintiffCityStateZip, {
      x: sigX,
      y,
      size: SIZES.small,
      font: regular,
      color: DARK,
    })
    y -= LINE_H
  }

  addFooter()
  return doc.save()
}
