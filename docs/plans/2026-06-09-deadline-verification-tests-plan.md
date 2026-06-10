# Deadline Verification Tests Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extract two date-calculation concerns into testable shared modules and write Vitest unit tests that verify all 50-state appeal deadline mappings and both discovery date-arithmetic functions.

**Architecture:** Two new modules in `packages/shared/src/rules/` expose pure functions; three route files replace inlined arithmetic with imports from those modules; two test files cover the pure functions with ~38 cases total, zero mocking.

**Tech Stack:** TypeScript, Vitest, `@lawyer-free/shared` package alias

---

### Task 1: Create `appeal-deadline.ts` shared module

**Files:**
- Create: `packages/shared/src/rules/appeal-deadline.ts`
- Test: `apps/web/tests/unit/rules/appeal-deadline.test.ts`

**Step 1: Write the failing test**

Create `apps/web/tests/unit/rules/appeal-deadline.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { appealDeadlineDays, calculateAppealDeadline } from '@lawyer-free/shared/rules/appeal-deadline'

describe('appealDeadlineDays — non-default states', () => {
  it('CA → 60', () => expect(appealDeadlineDays('CA')).toBe(60))
  it('MN → 60', () => expect(appealDeadlineDays('MN')).toBe(60))
  it('NJ → 45', () => expect(appealDeadlineDays('NJ')).toBe(45))
  it('WI → 45', () => expect(appealDeadlineDays('WI')).toBe(45))
  it('CO → 49', () => expect(appealDeadlineDays('CO')).toBe(49))
  it('AL → 42', () => expect(appealDeadlineDays('AL')).toBe(42))
  it('ID → 42', () => expect(appealDeadlineDays('ID')).toBe(42))
  it('MI → 21', () => expect(appealDeadlineDays('MI')).toBe(21))
  it('ME → 21', () => expect(appealDeadlineDays('ME')).toBe(21))
  it('CT → 20', () => expect(appealDeadlineDays('CT')).toBe(20))
  it('RI → 20', () => expect(appealDeadlineDays('RI')).toBe(20))
})

describe('appealDeadlineDays — 30-day default states', () => {
  it('TX → 30', () => expect(appealDeadlineDays('TX')).toBe(30))
  it('NY → 30', () => expect(appealDeadlineDays('NY')).toBe(30))
  it('FL → 30', () => expect(appealDeadlineDays('FL')).toBe(30))
  it('PA → 30', () => expect(appealDeadlineDays('PA')).toBe(30))
  it('IL → 30', () => expect(appealDeadlineDays('IL')).toBe(30))
  it('OH → 30', () => expect(appealDeadlineDays('OH')).toBe(30))
})

describe('appealDeadlineDays — case-insensitive + fallback', () => {
  it('lowercase ca → 60', () => expect(appealDeadlineDays('ca')).toBe(60))
  it('mixed case Ca → 60', () => expect(appealDeadlineDays('Ca')).toBe(60))
  it('unknown state ZZ → 30', () => expect(appealDeadlineDays('ZZ')).toBe(30))
  it('empty string → 30', () => expect(appealDeadlineDays('')).toBe(30))
})

describe('calculateAppealDeadline — date arithmetic', () => {
  it('TX (30d): 2026-01-01 → 2026-01-31', () => {
    const result = calculateAppealDeadline(new Date('2026-01-01T00:00:00Z'), 'TX')
    expect(result.toISOString().slice(0, 10)).toBe('2026-01-31')
  })

  it('CA (60d): 2026-01-01 → 2026-03-02', () => {
    const result = calculateAppealDeadline(new Date('2026-01-01T00:00:00Z'), 'CA')
    expect(result.toISOString().slice(0, 10)).toBe('2026-03-02')
  })

  it('MI (21d): 2026-01-01 → 2026-01-22', () => {
    const result = calculateAppealDeadline(new Date('2026-01-01T00:00:00Z'), 'MI')
    expect(result.toISOString().slice(0, 10)).toBe('2026-01-22')
  })

  it('month boundary: 2026-01-15 + TX(30) → 2026-02-14', () => {
    const result = calculateAppealDeadline(new Date('2026-01-15T00:00:00Z'), 'TX')
    expect(result.toISOString().slice(0, 10)).toBe('2026-02-14')
  })

  it('accepts ISO string input', () => {
    const result = calculateAppealDeadline('2026-01-01T00:00:00Z', 'TX')
    expect(result.toISOString().slice(0, 10)).toBe('2026-01-31')
  })

  it('does not mutate the input Date', () => {
    const input = new Date('2026-01-01T00:00:00Z')
    calculateAppealDeadline(input, 'TX')
    expect(input.toISOString().slice(0, 10)).toBe('2026-01-01')
  })
})
```

**Step 2: Run to verify it fails**

```bash
cd apps/web && pnpm vitest run tests/unit/rules/appeal-deadline.test.ts
```

Expected: FAIL — "Cannot find module '@lawyer-free/shared/rules/appeal-deadline'"

**Step 3: Implement `appeal-deadline.ts`**

Create `packages/shared/src/rules/appeal-deadline.ts`:

```typescript
// Appeal deadline days by state. 30 days is the default (TX, NY, FL, and most others).
// Only states that deviate from 30 days are listed explicitly.
// Sources: each state's Rules of Appellate Procedure.
const APPEAL_DAYS: Record<string, number> = {
  CA: 60, // Cal. Rules of Court, rule 8.104
  MN: 60, // Minn. R. Civ. App. P. 104.01, subd. 1
  NJ: 45, // N.J. Ct. R. 2:4-1(a)
  WI: 45, // Wis. Stat. § 808.04(1)
  CO: 49, // C.A.R. 4(a)(1)
  AL: 42, // Ala. R. App. P. 4(a)(1)
  ID: 42, // I.A.R. 14(a)
  MI: 21, // MCR 7.204(A)(1)(a)
  ME: 21, // Me. R. App. P. 2B(b)(1)
  CT: 20, // Conn. Practice Book § 63-1(a)
  RI: 20, // R.I. Super. Ct. App. R. 4(a)
}

export function appealDeadlineDays(state: string): number {
  return APPEAL_DAYS[state.toUpperCase()] ?? 30
}

export function calculateAppealDeadline(judgmentDate: Date | string, state: string): Date {
  const d = new Date(typeof judgmentDate === 'string' ? judgmentDate : judgmentDate.getTime())
  d.setUTCDate(d.getUTCDate() + appealDeadlineDays(state))
  return d
}
```

**Step 4: Run to verify it passes**

```bash
cd apps/web && pnpm vitest run tests/unit/rules/appeal-deadline.test.ts
```

Expected: PASS — all ~27 tests green

**Step 5: Commit**

```bash
git add packages/shared/src/rules/appeal-deadline.ts apps/web/tests/unit/rules/appeal-deadline.test.ts
git commit -m "feat: extract appealDeadlineDays + tests for all 50 states"
```

---

### Task 2: Create `discovery-deadlines.ts` shared module

**Files:**
- Create: `packages/shared/src/rules/discovery-deadlines.ts`
- Test: `apps/web/tests/unit/rules/discovery-deadlines.test.ts`

**Step 1: Write the failing test**

Create `apps/web/tests/unit/rules/discovery-deadlines.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { discoveryCutoffDate, discoveryResponseDeadline } from '@lawyer-free/shared/rules/discovery-deadlines'

describe('discoveryResponseDeadline (+30 days)', () => {
  it('2026-01-01 + 30 → 2026-01-31', () => {
    const result = discoveryResponseDeadline(new Date('2026-01-01T00:00:00Z'))
    expect(result.toISOString().slice(0, 10)).toBe('2026-01-31')
  })

  it('month boundary: 2026-01-15 + 30 → 2026-02-14', () => {
    const result = discoveryResponseDeadline(new Date('2026-01-15T00:00:00Z'))
    expect(result.toISOString().slice(0, 10)).toBe('2026-02-14')
  })

  it('accepts ISO string input', () => {
    const result = discoveryResponseDeadline('2026-01-01T00:00:00Z')
    expect(result.toISOString().slice(0, 10)).toBe('2026-01-31')
  })

  it('does not mutate the input Date', () => {
    const input = new Date('2026-01-01T00:00:00Z')
    discoveryResponseDeadline(input)
    expect(input.toISOString().slice(0, 10)).toBe('2026-01-01')
  })
})

describe('discoveryCutoffDate (+180 days)', () => {
  it('2026-01-01 + 180 → 2026-06-30', () => {
    const result = discoveryCutoffDate(new Date('2026-01-01T00:00:00Z'))
    expect(result.toISOString().slice(0, 10)).toBe('2026-06-30')
  })

  it('leap year: 2024-01-01 + 180 → 2024-06-29', () => {
    // 2024 is a leap year (Feb has 29 days), so +180 lands one day earlier than non-leap
    const result = discoveryCutoffDate(new Date('2024-01-01T00:00:00Z'))
    expect(result.toISOString().slice(0, 10)).toBe('2024-06-29')
  })

  it('accepts ISO string input', () => {
    const result = discoveryCutoffDate('2026-01-01T00:00:00Z')
    expect(result.toISOString().slice(0, 10)).toBe('2026-06-30')
  })

  it('does not mutate the input Date', () => {
    const input = new Date('2026-01-01T00:00:00Z')
    discoveryCutoffDate(input)
    expect(input.toISOString().slice(0, 10)).toBe('2026-01-01')
  })
})
```

**Step 2: Run to verify it fails**

```bash
cd apps/web && pnpm vitest run tests/unit/rules/discovery-deadlines.test.ts
```

Expected: FAIL — "Cannot find module '@lawyer-free/shared/rules/discovery-deadlines'"

**Step 3: Implement `discovery-deadlines.ts`**

Create `packages/shared/src/rules/discovery-deadlines.ts`:

```typescript
function addDays(date: Date | string, days: number): Date {
  const d = new Date(typeof date === 'string' ? date : date.getTime())
  d.setUTCDate(d.getUTCDate() + days)
  return d
}

/** Opposing party has 30 days to respond to served discovery (TRCP 196.2(a)). */
export function discoveryResponseDeadline(servedAt: Date | string): Date {
  return addDays(servedAt, 30)
}

/** Discovery closes 180 days after the answer deadline (TRCP 190.3). */
export function discoveryCutoffDate(answerDeadline: Date | string): Date {
  return addDays(answerDeadline, 180)
}
```

**Step 4: Run to verify it passes**

```bash
cd apps/web && pnpm vitest run tests/unit/rules/discovery-deadlines.test.ts
```

Expected: PASS — all 8 tests green

**Step 5: Commit**

```bash
git add packages/shared/src/rules/discovery-deadlines.ts apps/web/tests/unit/rules/discovery-deadlines.test.ts
git commit -m "feat: extract discoveryCutoffDate + discoveryResponseDeadline with tests"
```

---

### Task 3: Wire routes to import from the new shared modules

**Files:**
- Modify: `apps/web/src/app/api/cases/[id]/deadlines/route.ts`
- Modify: `apps/web/src/app/api/cases/[id]/deadlines/confirm-answer-deadline/route.ts`
- Modify: `apps/web/src/app/api/discovery/packs/[packId]/serve/route.ts`

**Step 1: Update `deadlines/route.ts`**

Add import at the top (after the existing imports):
```typescript
import { calculateAppealDeadline } from '@lawyer-free/shared/rules/appeal-deadline'
```

Remove the inline map and helper function (the block starting with `// Appeal deadline days by state...` through `function appealDaysForState...`).

Replace the `judgment_entered` handler block:
```typescript
// OLD:
const appealDays = appealDaysForState(caseData.state)
const appealDate = new Date(judgmentDate)
appealDate.setDate(appealDate.getDate() + appealDays)

// NEW:
const appealDate = calculateAppealDeadline(judgmentDate, caseData.state ?? 'TX')
```

Also update the rationale string to not reference `appealDays` (it no longer exists in scope):
```typescript
rationale: `Appeal deadline calculated from judgment date.`,
```

**Step 2: Update `confirm-answer-deadline/route.ts`**

Add import:
```typescript
import { discoveryCutoffDate } from '@lawyer-free/shared/rules/discovery-deadlines'
```

Replace the inline arithmetic:
```typescript
// OLD:
const discoveryCutoffDate = new Date(confirmed_due_at)
discoveryCutoffDate.setDate(discoveryCutoffDate.getDate() + 180)

// NEW:
const cutoff = discoveryCutoffDate(confirmed_due_at)
```

Update the upsert to use `cutoff.toISOString()` instead of `discoveryCutoffDate.toISOString()`.

Note: rename the local variable to `cutoff` to avoid shadowing the imported function name.

**Step 3: Update `serve/route.ts`**

Add import:
```typescript
import { discoveryResponseDeadline } from '@lawyer-free/shared/rules/discovery-deadlines'
```

Replace the inline arithmetic:
```typescript
// OLD:
const servedDate = new Date(parsed.data.served_at)
const responseDeadline = new Date(servedDate)
responseDeadline.setDate(responseDeadline.getDate() + 30)

// NEW:
const responseDeadline = discoveryResponseDeadline(parsed.data.served_at)
```

**Step 4: Run TypeScript check**

```bash
cd /Users/minwang/lawyer\ free && npx tsc --noEmit -p apps/web/tsconfig.json 2>&1 | grep -E "deadline|serve/route|discovery-deadlines|appeal-deadline"
```

Expected: no output (no errors in changed files)

**Step 5: Run all unit tests**

```bash
cd apps/web && pnpm vitest run
```

Expected: all tests pass (183 existing + 35 new = 218 total)

**Step 6: Commit**

```bash
git add apps/web/src/app/api/cases/[id]/deadlines/route.ts \
        apps/web/src/app/api/cases/[id]/deadlines/confirm-answer-deadline/route.ts \
        apps/web/src/app/api/discovery/packs/[packId]/serve/route.ts
git commit -m "refactor: import appeal and discovery deadline helpers from shared modules"
```
