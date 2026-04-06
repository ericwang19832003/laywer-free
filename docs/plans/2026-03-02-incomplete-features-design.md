# Finishing Incomplete Features Design

**Date:** 2026-03-02
**Status:** Approved

## Goal

Complete 4 features that are 40-90% built: real email sending via Resend, trial binder PDF enhancements, meet-and-confer edit+send flow, and objection classification confidence display.

## Feature 1: Email Sending via Resend

**Current state:** Stub provider logs to console. Preservation letter send route already calls `sendEmail()` and tracks communications.

**Changes:**
- Install `resend` npm package
- Implement `ResendProvider` in `src/lib/email/provider.ts` alongside existing stub
- Provider selection via `EMAIL_PROVIDER` env var (`stub` | `resend`), defaulting to `stub`
- Add `RESEND_API_KEY`, `EMAIL_FROM_ADDRESS` to `.env.local.example`
- No UI changes — existing preservation letter "Send" button already works

**Architecture:** The provider abstraction (`SendEmailInput` → `SendEmailResult`) is already built. We add one more implementation behind it. Zero changes to calling code.

## Feature 2: Trial Binder PDF Enhancements

**Current state:** PDF has cover page, TOC with section bullet points, exhibit index. ZIP packaging works with optional sections.

**Changes:**
- Add party names and case number to cover page (fetch from case/task metadata)
- Track actual page numbers as sections are built, update TOC with real page numbers
- Add section divider pages (full-page titles like "EXHIBIT INDEX", "TIMELINE") before each section

**Architecture:** Modify `generate-summary-pdf.ts` to do a two-pass approach: first pass collects page counts, second pass renders TOC with accurate numbers. Or simpler: build sections first, insert TOC page after.

## Feature 3: Meet-and-Confer Edit + Send

**Current state:** Draft generates from flagged objection items, preview dialog shows read-only text, draft persists in `meet_and_confer_drafts` table.

**Changes:**
- Make preview dialog textarea editable (currently read-only)
- Add "Recipient Email" input field
- Add "Send via Email" button
- Create `/api/objections/reviews/[reviewId]/meet-and-confer/send` route:
  1. Validate `{ draft_id, recipient_email }` via Zod
  2. Fetch draft, verify it belongs to review, status is 'draft'
  3. Call `sendEmail({ to, subject, body })` via provider
  4. Create `communications` record with status tracking
  5. Update draft status: 'draft' → 'sent'
  6. Write timeline event `meet_and_confer_sent`
- Show "Sent" badge on draft if status is 'sent'
- Show "Previously sent on {date}" in dialog if draft was already sent

## Feature 4: Objection Classification Display

**Current state:** AI classifies objections with confidence scores (0-1.0), extraction method, model info. Review editor shows labels and summaries but hides confidence, extraction method, and model provenance.

**Changes to `objection-review-editor.tsx`:**
- Add confidence badge on each ItemCard: green "High" (>0.8), amber "Medium" (0.5-0.8), red "Low" (<0.5)
- Add extraction method indicator at top of review: "Text extracted via PDF parser" or "Extracted via OCR (image scan)"
- Add model provenance line in review header: "Classified by AI on {date}"
- All pure UI — no API changes needed

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| RESEND_API_KEY not set | Falls back to stub provider, logs warning |
| Email send fails | Communications record set to 'failed', toast error shown |
| Meet-and-confer draft already sent | Show "Already sent" state, disable send button |
| Objection confidence is null | Show "Unknown" badge in gray |
| Binder has no exhibits | TOC still renders, exhibit index shows "No exhibits" |
