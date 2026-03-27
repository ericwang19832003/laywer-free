# Trial Binder UI — Design

**Date:** 2026-02-24
**Status:** Approved

## Components

### BinderCta (exhibits page enhancement)
Card below exhibits manager with warm tone. Includes GenerateBinderDialog modal with:
- Exhibit set auto-selected (one per case in v1)
- Toggles: include timeline, include deadlines, include all evidence
- "Generate" button → POST create + POST build (fire-and-forget) → navigate to binders page

### BindersList (binders page)
Client component with 3-second polling while any binder is queued/building.
- Status badges: queued (amber), building (indigo + spinner), ready (green), failed (red)
- Download button when ready (signed URL)
- Empty state with icon

### Binders Page (`/case/[id]/binders`)
Standard layout: warm-bg, max-w-2xl, SupportiveHeader, back button, LegalDisclaimer.
Custom disclaimer: "This export is for organization only and not legal advice."

### Download Endpoint (`GET /api/binders/[binderId]/download`)
Returns signed URL (60s TTL) for the binder ZIP.

## Files
1. `src/components/binders/binder-cta.tsx`
2. `src/components/binders/binders-list.tsx`
3. `src/app/case/[id]/binders/page.tsx`
4. `src/app/case/[id]/exhibits/page.tsx` (modified)
5. `src/app/api/binders/[binderId]/download/route.ts`
