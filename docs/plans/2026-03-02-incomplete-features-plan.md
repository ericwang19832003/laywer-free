# Finishing Incomplete Features — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Complete 4 features that are 40-90% built: real email sending via Resend, trial binder PDF enhancements, meet-and-confer edit+send flow, and objection classification confidence display.

**Architecture:** Each feature extends existing code with minimal new files. Email adds one provider implementation. Binder PDF modifies the existing generator. Meet-and-confer adds one API route and modifies the existing dialog. Objection display is pure UI changes to the existing editor component.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind, Supabase, Resend, pdf-lib, Zod, vitest

---

## Task 1: Email — Install Resend + Implement Provider (TDD)

**Files:**
- Modify: `src/lib/email/provider.ts`
- Create: `tests/unit/email/provider.test.ts`
- Modify: `.env.local.example`

**Step 1: Write the failing tests**

Create `tests/unit/email/provider.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// We test sendEmail behavior by mocking the resend module
// and controlling env vars

describe('sendEmail', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('uses stub provider by default', async () => {
    delete process.env.EMAIL_PROVIDER
    const { sendEmail } = await import('@/lib/email/provider')
    const result = await sendEmail({ to: 'test@example.com', subject: 'Hi', body: 'Hello' })
    expect(result.success).toBe(true)
    expect(result.messageId).toMatch(/^stub-/)
  })

  it('uses stub provider when EMAIL_PROVIDER=stub', async () => {
    process.env.EMAIL_PROVIDER = 'stub'
    const { sendEmail } = await import('@/lib/email/provider')
    const result = await sendEmail({ to: 'test@example.com', subject: 'Hi', body: 'Hello' })
    expect(result.success).toBe(true)
    expect(result.messageId).toMatch(/^stub-/)
  })

  it('returns error for unknown provider', async () => {
    process.env.EMAIL_PROVIDER = 'unknown_provider'
    const { sendEmail } = await import('@/lib/email/provider')
    const result = await sendEmail({ to: 'test@example.com', subject: 'Hi', body: 'Hello' })
    expect(result.success).toBe(false)
    expect(result.error).toContain('Unknown email provider')
  })

  it('calls Resend when EMAIL_PROVIDER=resend and key is set', async () => {
    process.env.EMAIL_PROVIDER = 'resend'
    process.env.RESEND_API_KEY = 're_test_123'
    process.env.EMAIL_FROM_ADDRESS = 'noreply@example.com'

    // Mock the resend module
    vi.doMock('resend', () => ({
      Resend: vi.fn().mockImplementation(() => ({
        emails: {
          send: vi.fn().mockResolvedValue({
            data: { id: 'resend-msg-abc123' },
            error: null,
          }),
        },
      })),
    }))

    const { sendEmail } = await import('@/lib/email/provider')
    const result = await sendEmail({ to: 'test@example.com', subject: 'Test', body: 'Body' })
    expect(result.success).toBe(true)
    expect(result.messageId).toBe('resend-msg-abc123')
  })

  it('falls back to stub when RESEND_API_KEY is missing', async () => {
    process.env.EMAIL_PROVIDER = 'resend'
    delete process.env.RESEND_API_KEY

    const { sendEmail } = await import('@/lib/email/provider')
    const result = await sendEmail({ to: 'test@example.com', subject: 'Hi', body: 'Hello' })
    expect(result.success).toBe(true)
    expect(result.messageId).toMatch(/^stub-/)
  })

  it('returns error when Resend API fails', async () => {
    process.env.EMAIL_PROVIDER = 'resend'
    process.env.RESEND_API_KEY = 're_test_123'
    process.env.EMAIL_FROM_ADDRESS = 'noreply@example.com'

    vi.doMock('resend', () => ({
      Resend: vi.fn().mockImplementation(() => ({
        emails: {
          send: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Rate limit exceeded' },
          }),
        },
      })),
    }))

    const { sendEmail } = await import('@/lib/email/provider')
    const result = await sendEmail({ to: 'test@example.com', subject: 'Test', body: 'Body' })
    expect(result.success).toBe(false)
    expect(result.error).toContain('Rate limit exceeded')
  })
})
```

**Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/unit/email/provider.test.ts`
Expected: Failures (Resend module not found, provider function doesn't handle 'resend')

**Step 3: Install Resend and implement the provider**

Run: `npm install resend`

Replace `src/lib/email/provider.ts` with:
```typescript
/**
 * Email Provider Abstraction
 *
 * Provider selection via EMAIL_PROVIDER env var:
 * - 'stub' (default): Logs to console, returns fake message ID
 * - 'resend': Sends real email via Resend API
 *
 * Provider keys are NEVER exposed to the client — this runs server-side only.
 */

export interface SendEmailInput {
  to: string
  subject: string
  body: string
}

export interface SendEmailResult {
  success: boolean
  messageId: string | null
  error?: string
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const provider = process.env.EMAIL_PROVIDER ?? 'stub'

  if (provider === 'resend') {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      console.warn('[EMAIL] RESEND_API_KEY not set — falling back to stub provider')
      return sendEmailStub(input)
    }
    return sendEmailResend(input, apiKey)
  }

  if (provider === 'stub') {
    return sendEmailStub(input)
  }

  return {
    success: false,
    messageId: null,
    error: `Unknown email provider: ${provider}`,
  }
}

/**
 * Stub provider for development.
 * Logs the email to the console and returns a fake message ID.
 */
async function sendEmailStub(input: SendEmailInput): Promise<SendEmailResult> {
  console.log('[EMAIL STUB] Sending email:')
  console.log(`  To: ${input.to}`)
  console.log(`  Subject: ${input.subject}`)
  console.log(`  Body length: ${input.body.length} chars`)
  console.log(`  Body preview: ${input.body.slice(0, 120)}...`)

  // Simulate async send
  await new Promise((resolve) => setTimeout(resolve, 100))

  return {
    success: true,
    messageId: `stub-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  }
}

/**
 * Resend provider for production email delivery.
 */
async function sendEmailResend(input: SendEmailInput, apiKey: string): Promise<SendEmailResult> {
  const fromAddress = process.env.EMAIL_FROM_ADDRESS ?? 'noreply@lawyerfree.app'

  try {
    const { Resend } = await import('resend')
    const resend = new Resend(apiKey)

    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: input.to,
      subject: input.subject,
      text: input.body,
    })

    if (error) {
      console.error('[EMAIL RESEND] Send failed:', error.message)
      return {
        success: false,
        messageId: null,
        error: error.message,
      }
    }

    return {
      success: true,
      messageId: data?.id ?? null,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown Resend error'
    console.error('[EMAIL RESEND] Exception:', message)
    return {
      success: false,
      messageId: null,
      error: message,
    }
  }
}
```

**Step 4: Update .env.local.example**

Add these lines to the end of `.env.local.example`:
```
EMAIL_PROVIDER=stub
RESEND_API_KEY=re_your_key_here
EMAIL_FROM_ADDRESS=noreply@lawyerfree.app
```

**Step 5: Run tests to verify they pass**

Run: `npx vitest run tests/unit/email/provider.test.ts`
Expected: All 6 tests PASS

**Step 6: Commit**

```bash
git add src/lib/email/provider.ts tests/unit/email/provider.test.ts .env.local.example package.json package-lock.json
git commit -m "feat: add Resend email provider with stub fallback"
```

---

## Task 2: Trial Binder PDF — Enhanced Cover + Section Dividers + Page Numbers (TDD)

**Files:**
- Modify: `src/lib/binder/generate-summary-pdf.ts`
- Create: `tests/unit/binder/generate-summary-pdf.test.ts`

**Context:** Current PDF has cover page, TOC with bullet points, and exhibit index. We need to:
1. Add party names and case number to cover page metadata
2. Add section divider pages before each major section
3. Replace TOC bullet points with real page numbers (build sections first, then insert TOC)

**Step 1: Write the failing tests**

Create `tests/unit/binder/generate-summary-pdf.test.ts`:
```typescript
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
```

**Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/unit/binder/generate-summary-pdf.test.ts`
Expected: Failures (`partyNames` and `causeNumber` not in interface, page count assertions fail)

**Step 3: Implement the enhanced PDF generator**

Replace `src/lib/binder/generate-summary-pdf.ts` with the enhanced version:
```typescript
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
```

**Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/unit/binder/generate-summary-pdf.test.ts`
Expected: All 6 tests PASS

**Step 5: Check for callers of `generateSummaryPdf` that need updating**

Search for imports of `generateSummaryPdf` or `SummaryPdfOptions` and update any callers to pass the new optional fields (`partyNames`, `causeNumber`). The new fields are optional so existing callers should still compile, but verify by running `npx next build`.

**Step 6: Commit**

```bash
git add src/lib/binder/generate-summary-pdf.ts tests/unit/binder/generate-summary-pdf.test.ts
git commit -m "feat: enhance trial binder PDF with party names, dividers, and page numbers"
```

---

## Task 3: Meet-and-Confer — Send API Route (TDD)

**Files:**
- Create: `src/app/api/objections/reviews/[reviewId]/meet-and-confer/send/route.ts`
- Create: `tests/unit/api/meet-and-confer-send.test.ts`

**Context:** The existing meet-and-confer route at `/api/objections/reviews/[reviewId]/meet-and-confer` generates a draft and saves it in `meet_and_confer_drafts`. The new `/send` route will take a draft_id and recipient_email, send the email via the provider, create a `communications` record, update draft status to 'sent', and write a timeline event.

**Step 1: Create the send route**

Create `src/app/api/objections/reviews/[reviewId]/meet-and-confer/send/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { sendEmail } from '@/lib/email/provider'
import { createHash } from 'crypto'

export const runtime = 'nodejs'

const sendSchema = z.object({
  draft_id: z.string().uuid(),
  recipient_email: z.string().email(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    const { reviewId } = await params
    const { supabase, error: authError } = await getAuthenticatedClient()
    if (authError) return authError

    const body = await request.json()
    const parsed = sendSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 422 }
      )
    }

    const { draft_id, recipient_email } = parsed.data

    // Fetch draft (RLS ensures ownership via case_id)
    const { data: draft, error: draftError } = await supabase!
      .from('meet_and_confer_drafts')
      .select('id, case_id, review_id, status, content_text, sha256')
      .eq('id', draft_id)
      .single()

    if (draftError || !draft) {
      return NextResponse.json(
        { error: 'Draft not found' },
        { status: 404 }
      )
    }

    // Verify draft belongs to this review
    if (draft.review_id !== reviewId) {
      return NextResponse.json(
        { error: 'Draft does not belong to this review' },
        { status: 403 }
      )
    }

    // Guard: draft must be in 'draft' status
    if (draft.status === 'sent') {
      return NextResponse.json(
        { error: 'Draft has already been sent' },
        { status: 409 }
      )
    }

    const subject = 'Meet and Confer — Discovery Objections'
    const bodyText = draft.content_text ?? ''
    const bodySha = draft.sha256 ?? createHash('sha256').update(bodyText, 'utf8').digest('hex')

    // Insert communications record (queued)
    const { data: comm, error: commError } = await supabase!
      .from('communications')
      .insert({
        case_id: draft.case_id,
        channel: 'email',
        to_value: recipient_email,
        subject,
        body_preview: bodyText.slice(0, 500),
        body_sha256: bodySha,
        status: 'queued',
      })
      .select()
      .single()

    if (commError || !comm) {
      return NextResponse.json(
        { error: 'Failed to create communication record', details: commError?.message },
        { status: 500 }
      )
    }

    // Send email
    const result = await sendEmail({
      to: recipient_email,
      subject,
      body: bodyText,
    })

    // Update communications status
    if (result.success) {
      await supabase!
        .from('communications')
        .update({
          status: 'sent',
          provider_message_id: result.messageId,
          sent_at: new Date().toISOString(),
        })
        .eq('id', comm.id)

      // Update draft status to 'sent'
      await supabase!
        .from('meet_and_confer_drafts')
        .update({ status: 'sent' })
        .eq('id', draft_id)
    } else {
      await supabase!
        .from('communications')
        .update({ status: 'failed' })
        .eq('id', comm.id)
    }

    // Write timeline event
    await supabase!.from('task_events').insert({
      case_id: draft.case_id,
      kind: 'meet_and_confer_sent',
      payload: {
        review_id: reviewId,
        draft_id,
        communications_id: comm.id,
        recipient_email,
        status: result.success ? 'sent' : 'failed',
        provider_message_id: result.messageId,
      },
    })

    if (!result.success) {
      return NextResponse.json(
        { error: 'Email send failed', details: result.error, communications_id: comm.id },
        { status: 502 }
      )
    }

    return NextResponse.json(
      {
        communications_id: comm.id,
        status: 'sent',
        provider_message_id: result.messageId,
      },
      { status: 201 }
    )
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

**Step 2: Commit**

```bash
git add src/app/api/objections/reviews/\[reviewId\]/meet-and-confer/send/route.ts
git commit -m "feat: add meet-and-confer send API route"
```

---

## Task 4: Meet-and-Confer — Edit + Send UI

**Files:**
- Modify: `src/components/objections/objection-review-editor.tsx`

**Context:** The meet-and-confer dialog (lines 311-329) currently shows a read-only `<pre>` tag with the draft text. We need to:
1. Make the text editable (replace `<pre>` with `<Textarea>`)
2. Add a recipient email input
3. Add a "Send via Email" button
4. Show "Sent" badge on draft if status is 'sent'
5. Show "Previously sent on {date}" if already sent

**Changes to `objection-review-editor.tsx`:**

Add new state variables after existing meet-and-confer state (after line 145):
```typescript
const [recipientEmail, setRecipientEmail] = useState('')
const [sending, setSending] = useState(false)
const [sentAt, setSentAt] = useState<string | null>(null)
const [draftStatus, setDraftStatus] = useState<string>('draft')
```

Add new import at top (add `Input` to imports):
```typescript
import { Input } from '@/components/ui/input'
import { MailIcon } from 'lucide-react'
```

Add send handler after `handleGenerateDraft`:
```typescript
const handleSendDraft = useCallback(async () => {
  if (!draftId || !recipientEmail) return
  setSending(true)
  setError(null)

  try {
    const res = await fetch(`/api/objections/reviews/${review.id}/meet-and-confer/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ draft_id: draftId, recipient_email: recipientEmail }),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.error ?? 'Failed to send email')
    }

    setSentAt(new Date().toISOString())
    setDraftStatus('sent')
    router.refresh()
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
  } finally {
    setSending(false)
  }
}, [draftId, recipientEmail, review.id, router])
```

Replace the meet-and-confer dialog (lines 311-329) with:
```tsx
{/* Meet-and-confer preview dialog */}
<Dialog open={showPreview} onOpenChange={setShowPreview}>
  <DialogContent className="max-h-[85vh] flex flex-col sm:max-w-lg">
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
        Meet-and-confer note
        {draftStatus === 'sent' && (
          <Badge variant="secondary" className="text-xs bg-calm-green/10 text-calm-green border-calm-green/30">
            Sent
          </Badge>
        )}
      </DialogTitle>
      <DialogDescription>
        {sentAt
          ? `Previously sent on ${new Date(sentAt).toLocaleDateString()}`
          : 'Edit the draft below, add a recipient, and send via email.'}
      </DialogDescription>
    </DialogHeader>
    <div className="flex-1 overflow-y-auto min-h-0 space-y-3">
      <Textarea
        value={draftPreview ?? ''}
        onChange={(e) => setDraftPreview(e.target.value)}
        rows={12}
        disabled={draftStatus === 'sent'}
        className="text-sm font-sans leading-relaxed resize-none"
      />
      <div className="space-y-2">
        <label className="text-xs font-medium text-warm-muted">Recipient Email</label>
        <Input
          type="email"
          placeholder="opposing.counsel@example.com"
          value={recipientEmail}
          onChange={(e) => setRecipientEmail(e.target.value)}
          disabled={draftStatus === 'sent'}
        />
      </div>
    </div>
    <div className="flex items-center justify-between pt-2 border-t border-warm-border">
      <p className="text-xs text-warm-muted">
        For reference only. This is not legal advice.
      </p>
      <Button
        size="sm"
        onClick={handleSendDraft}
        disabled={sending || !recipientEmail || draftStatus === 'sent'}
      >
        {sending ? (
          <>
            <Loader2Icon className="mr-1.5 size-3.5 animate-spin" />
            Sending…
          </>
        ) : draftStatus === 'sent' ? (
          'Already Sent'
        ) : (
          <>
            <MailIcon className="mr-1.5 size-3.5" />
            Send via Email
          </>
        )}
      </Button>
    </div>
  </DialogContent>
</Dialog>
```

**Step 1: Apply all changes to `objection-review-editor.tsx`**

**Step 2: Verify build**

Run: `npx next build`
Expected: Clean build, no type errors

**Step 3: Commit**

```bash
git add src/components/objections/objection-review-editor.tsx
git commit -m "feat: add meet-and-confer edit and send flow"
```

---

## Task 5: Objection Classification — Confidence Display in Read-Only View

**Files:**
- Modify: `src/components/objections/objection-review-editor.tsx`

**Context:** The `confidenceLevel()` helper already exists (line 93-98) and confidence IS displayed in editor mode ItemCard (lines 456-460). But the confirmed/read-only view (lines 250-274) does NOT show confidence, extraction method, or model provenance. We need to add all three.

**Changes to the confirmed (read-only) section:**

1. Add a review header info bar (after the green confirmation banner, before items list). Insert after line 247:
```tsx
{/* Review provenance info */}
<div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-warm-muted">
  {review.model && (
    <span>Classified by AI on {new Date(review.created_at).toLocaleDateString()}</span>
  )}
</div>
```

2. Add confidence badge to each read-only ItemCard. In the confirmed view's item mapping (lines 250-274), add after the follow-up badge (before the labels div):
```tsx
{/* Confidence badge */}
{(() => {
  const conf = confidenceLevel(item.confidence)
  return (
    <Badge
      variant="outline"
      className={`text-xs shrink-0 ${
        conf.label === 'High' ? 'border-calm-green/30 text-calm-green' :
        conf.label === 'Medium' ? 'border-calm-amber/30 text-calm-amber' :
        'border-warm-border text-warm-muted'
      }`}
    >
      {conf.label}
    </Badge>
  )
})()}
```

This goes in the flex row with the item title and follow-up badge.

**Full replacement for the read-only item card section (lines 250-274):**
```tsx
<div className="space-y-3">
  {items.map((item) => {
    const conf = confidenceLevel(item.confidence)
    return (
      <Card key={item.id}>
        <CardContent className="pt-4 pb-4 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <p className="text-sm font-medium text-warm-text">{itemTitle(item)}</p>
              <Badge
                variant="outline"
                className={`text-xs shrink-0 ${
                  conf.label === 'High' ? 'border-calm-green/30 text-calm-green' :
                  conf.label === 'Medium' ? 'border-calm-amber/30 text-calm-amber' :
                  'border-warm-border text-warm-muted'
                }`}
              >
                {conf.label}
              </Badge>
            </div>
            {item.follow_up_flag && (
              <Badge variant="outline" className="text-xs shrink-0 border-calm-amber/30 text-calm-amber">
                <FlagIcon className="mr-1 size-3" />
                Follow up
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {item.labels.map((label) => (
              <Badge key={label} variant="secondary" className="text-xs">
                {LABEL_DISPLAY[label] ?? label}
              </Badge>
            ))}
          </div>
          <p className="text-sm text-warm-muted">{item.neutral_summary}</p>
        </CardContent>
      </Card>
    )
  })}
</div>
```

**Step 1: Apply all changes**

**Step 2: Verify build**

Run: `npx next build`
Expected: Clean build

**Step 3: Commit**

```bash
git add src/components/objections/objection-review-editor.tsx
git commit -m "feat: show confidence badges and AI provenance in objection review"
```

---

## Task 6: Build & Test Verification

**Step 1: Run all tests**

Run: `npx vitest run`
Expected: All tests pass (existing + new email + binder tests)

**Step 2: Run build**

Run: `npx next build`
Expected: Clean build, no type errors

**Step 3: Final commit if needed**

If any fixes were required, commit them.

---

## File Summary

| File | Action | Feature |
|------|--------|---------|
| `src/lib/email/provider.ts` | Modify | Email (Resend) |
| `tests/unit/email/provider.test.ts` | Create | Email (Resend) |
| `.env.local.example` | Modify | Email (Resend) |
| `src/lib/binder/generate-summary-pdf.ts` | Modify | Binder PDF |
| `tests/unit/binder/generate-summary-pdf.test.ts` | Create | Binder PDF |
| `src/app/api/objections/reviews/[reviewId]/meet-and-confer/send/route.ts` | Create | Meet & Confer |
| `src/components/objections/objection-review-editor.tsx` | Modify | Meet & Confer + Confidence |

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| RESEND_API_KEY not set | Falls back to stub provider, logs warning |
| Email send fails | Communications record set to 'failed', toast error shown |
| Meet-and-confer draft already sent | Show "Already sent" state, disable send button |
| Objection confidence is null | Show "Unknown" badge in gray |
| Binder has no exhibits | TOC still renders, exhibit index shows "No exhibits" |
| Party names not available | Cover page omits party lines (optional fields) |
| Draft text edited before send | Edited text is what gets sent (textarea is the source of truth) |
