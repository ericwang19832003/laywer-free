# Design: Self-Verification Tests for Deadline Changes

**Date:** 2026-06-09
**Status:** Approved, ready for implementation

---

## Problem

Six files were changed to add deadline auto-calculation logic (appeal deadlines for all 50 states, discovery cutoff, discovery response deadline, SOL auto-creation). The pure logic is currently inlined inside route handlers and an Edge Function, making it untestable without mocking Supabase. There are no tests verifying correctness.

---

## Approach

Extract the two date-arithmetic concerns into small shared modules, then test them directly with Vitest — zero mocking, following the existing pattern used by `calculateSol`, `buildDiscoverySuggestionPrompt`, etc.

---

## Architecture

### New shared module: `packages/shared/src/rules/appeal-deadline.ts`

Exports:
- `appealDeadlineDays(state: string): number` — returns the number of days to file a notice of appeal for the given state (case-insensitive; defaults to 30 for unknown states)
- `calculateAppealDeadline(judgmentDate: Date | string, state: string): Date` — returns the appeal filing deadline

The `APPEAL_DAYS_BY_STATE` map moves here from `apps/web/src/app/api/cases/[id]/deadlines/route.ts`. The route imports `calculateAppealDeadline` instead of inlining the logic.

### New shared module: `packages/shared/src/rules/discovery-deadlines.ts`

Exports:
- `discoveryCutoffDate(answerDeadline: Date | string): Date` — answer deadline + 180 days (TRCP 190.3)
- `discoveryResponseDeadline(servedAt: Date | string): Date` — served date + 30 days (TRCP 196.2(a))

Three route files replace their inlined arithmetic with imports from this module:
- `apps/web/src/app/api/cases/[id]/deadlines/confirm-answer-deadline/route.ts`
- `apps/web/src/app/api/discovery/packs/[packId]/serve/route.ts`

---

## Test Files

### `apps/web/tests/unit/rules/appeal-deadline.test.ts` (~30 cases)

**`appealDeadlineDays` — state lookup:**
- All 11 non-default states return correct values: CA=60, MN=60, NJ=45, WI=45, CO=49, AL=42, ID=42, MI=21, ME=21, CT=20, RI=20
- 6 representative 30-day states: TX, NY, FL, PA, IL, OH
- Case-insensitive: `'ca'` → 60, `'Ca'` → 60
- Null/undefined/unknown → 30

**`calculateAppealDeadline` — date arithmetic:**
- `2026-01-01` + TX (30d) → `2026-01-31`
- `2026-01-01` + CA (60d) → `2026-03-02`
- `2026-01-01` + MI (21d) → `2026-01-22`
- `2026-01-15` + TX (30d) → `2026-02-14` (month boundary)
- String input works same as Date object
- Returns a new Date, does not mutate the input

### `apps/web/tests/unit/rules/discovery-deadlines.test.ts` (~8 cases)

**`discoveryResponseDeadline` (+30 days):**
- `2026-01-01` → `2026-01-31`
- `2026-01-15` → `2026-02-14` (month boundary)
- String input works

**`discoveryCutoffDate` (+180 days):**
- `2026-01-01` → `2026-07-01`
- `2024-01-01` → `2024-06-29` (leap year: +180 days lands in June)
- String input works
- Does not mutate the input Date

---

## File Scope

| File | Change |
|---|---|
| `packages/shared/src/rules/appeal-deadline.ts` | Create |
| `packages/shared/src/rules/discovery-deadlines.ts` | Create |
| `apps/web/src/app/api/cases/[id]/deadlines/route.ts` | Import `calculateAppealDeadline`, remove inline map |
| `apps/web/src/app/api/cases/[id]/deadlines/confirm-answer-deadline/route.ts` | Import `discoveryCutoffDate` |
| `apps/web/src/app/api/discovery/packs/[packId]/serve/route.ts` | Import `discoveryResponseDeadline` |
| `apps/web/tests/unit/rules/appeal-deadline.test.ts` | Create |
| `apps/web/tests/unit/rules/discovery-deadlines.test.ts` | Create |
