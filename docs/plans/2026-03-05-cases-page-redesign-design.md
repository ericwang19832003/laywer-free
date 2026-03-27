# Cases Page Redesign Design

**Date:** 2026-03-05
**Status:** Approved
**Vibe:** Clean & authoritative (Linear/Notion-inspired)

## Goal

Redesign the /cases page to look professional and authoritative, giving self-represented litigants confidence in the tool.

## Root Problem

The current page uses `max-w-2xl` (672px), leaving massive blank margins. Components are flat, visually disconnected, and lack hierarchy. The onboarding checklist dominates the page.

---

## Section 1: Layout Width + Header

**Layout:** Widen from `max-w-2xl` to `max-w-5xl` (1024px). Also update the authenticated layout wrapper.

**Header redesign:**
- Time-of-day greeting with user's name: "Good morning, Min"
- Contextual subtitle: "1 active case · 0 upcoming deadlines"
- **"+ New Case" button** moves to header top-right (removed from page bottom)
- Subtle bottom border separator

**Files:** `cases/page.tsx`, `(authenticated)/layout.tsx`, `supportive-header.tsx` (replace or remove)

---

## Section 2: Stats Cards

**Current:** Tiny cards, small text, icon + number side-by-side.

**Redesign:**
- Number on top: `text-2xl font-bold`
- Label below: `text-xs text-warm-muted`
- Icon in top-right corner, small and subtle
- Subtle colored top border (2px accent line per card: indigo, green, amber, red/green)
- Very light background tint per card
- More vertical padding

**Files:** `stats-cards.tsx`

---

## Section 3: Case Cards

**Current:** Flat card with badge soup, small text, tiny progress bar.

**Redesign — structured 3-row layout:**

Row 1: Health score circle (left) + case identity (county, court, role, dispute as structured text with dot separators — no badges)

Row 2: Metadata line (started date + last activity)

Row 3: Progress bar (wider, h-2) with task count and deadline inline. "Open" button (right-aligned) with arrow icon.

**Hover state:** Subtle left indigo border accent + shadow lift.

**Files:** `case-card.tsx`

---

## Section 4: Onboarding Checklist

**Current:** Large purple-tinted card dominating the page.

**Redesign — compact banner:**
- White background with subtle left border accent (2px indigo)
- Header row: "Getting Started" + progress bar + dismiss button
- Items in 2-column grid (uses wider layout)
- Completed items: muted gray with checkmark (no strikethrough)
- Significantly more compact

**Files:** `onboarding-checklist.tsx`

---

## Files Summary

| File | Action |
|------|--------|
| `src/app/(authenticated)/layout.tsx` | Modify: widen max-w |
| `src/app/(authenticated)/cases/page.tsx` | Modify: new header, move new-case button, layout changes |
| `src/components/cases/stats-cards.tsx` | Modify: full redesign |
| `src/components/cases/case-card.tsx` | Modify: full redesign |
| `src/components/dashboard/onboarding-checklist.tsx` | Modify: compact redesign |
| `src/components/layout/supportive-header.tsx` | May remove or repurpose |

## Non-Goals

- No new data fetching or API changes
- No new components beyond what's being redesigned
- No changes to the new-case dialog wizard
- No mobile-specific layout overhaul (just ensure responsive)
