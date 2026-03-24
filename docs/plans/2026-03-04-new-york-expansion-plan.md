# New York Expansion Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Add New York as the third supported state, with NY court types, recommendation engine, damages calculator, child support calculator (CSSA), and all wizard/UI wiring.

**Architecture:** Extends the proven hybrid multi-state system (TX/CA). NY config object for data, NY-specific `recommendNewYorkCourt()` for court routing. No architectural changes — follows exact CA expansion pattern.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind, Supabase, Anthropic Claude API, Zod, vitest

---

## Task 1: NY State Config

**Files:**
- Modify: `src/lib/states/types.ts`
- Create: `src/lib/states/ny.ts`
- Modify: `src/lib/states/index.ts`
- Modify: `tests/unit/states/config.test.ts`

### types.ts — Add `'NY'` to StateCode

```typescript
export type StateCode = 'TX' | 'CA' | 'NY'

export const STATE_CODES = ['TX', 'CA', 'NY'] as const
```

### ny.ts — NY_CONFIG

```typescript
import type { StateConfig } from './types'

export const NY_CONFIG: StateConfig = {
  code: 'NY',
  name: 'New York',
  abbreviation: 'NY',
  courtTypes: [
    { value: 'ny_small_claims', label: 'Small Claims Court', maxAmount: 10_000 },
    { value: 'ny_civil', label: 'Civil Court', maxAmount: 25_000 },
    { value: 'ny_supreme', label: 'Supreme Court' },
  ],
  federalCourtAvailable: true,
  thresholds: {
    smallClaimsMax: 10_000,
  },
  statuteOfLimitations: {
    personalInjury: 3,
    writtenContract: 6,
    oralContract: 6,
    propertyDamage: 3,
  },
  amountRanges: [
    { value: 'under_10k', label: 'Under $10,000', maxAmount: 10_000 },
    { value: '10k_25k', label: '$10,000 – $25,000', maxAmount: 25_000 },
    { value: 'over_25k', label: 'Over $25,000' },
    { value: 'not_money', label: "It's not about money" },
  ],
}
```

### index.ts — Register NY_CONFIG

```typescript
import { NY_CONFIG } from './ny'

const STATE_CONFIGS: Record<StateCode, StateConfig> = {
  TX: TX_CONFIG,
  CA: CA_CONFIG,
  NY: NY_CONFIG,
}
```

### Tests (~10 new)

Add to `tests/unit/states/config.test.ts`:

```typescript
// STATE_CODES
it('contains NY', () => {
  expect(STATE_CODES).toContain('NY')
})
it('has exactly 3 entries', () => {
  expect(STATE_CODES).toHaveLength(3)  // was 2
})

// getStateConfig
it('returns NY config', () => {
  const config = getStateConfig('NY')
  expect(config.code).toBe('NY')
  expect(config.name).toBe('New York')
})
it('NY has ny_small_claims, ny_civil, ny_supreme court types', () => {
  const config = getStateConfig('NY')
  const values = config.courtTypes.map((c) => c.value)
  expect(values).toEqual(['ny_small_claims', 'ny_civil', 'ny_supreme'])
})
it('NY small claims max is 10000', () => {
  expect(getStateConfig('NY').thresholds.smallClaimsMax).toBe(10_000)
})
it('NY SOL personalInjury is 3', () => {
  expect(getStateConfig('NY').statuteOfLimitations.personalInjury).toBe(3)
})
it('NY SOL writtenContract is 6', () => {
  expect(getStateConfig('NY').statuteOfLimitations.writtenContract).toBe(6)
})
it('NY SOL oralContract is 6', () => {
  expect(getStateConfig('NY').statuteOfLimitations.oralContract).toBe(6)
})
it('NY SOL propertyDamage is 3', () => {
  expect(getStateConfig('NY').statuteOfLimitations.propertyDamage).toBe(3)
})
it('NY has 4 amount ranges', () => {
  expect(getStateConfig('NY').amountRanges).toHaveLength(4)
})

// getCourtLabel
it('returns Small Claims Court label for NY ny_small_claims', () => {
  expect(getCourtLabel('NY', 'ny_small_claims')).toBe('Small Claims Court')
})
it('returns Civil Court label for NY ny_civil', () => {
  expect(getCourtLabel('NY', 'ny_civil')).toBe('Civil Court')
})
it('returns Supreme Court label for NY ny_supreme', () => {
  expect(getCourtLabel('NY', 'ny_supreme')).toBe('Supreme Court')
})
it('returns Federal Court for NY federal', () => {
  expect(getCourtLabel('NY', 'federal')).toBe('Federal Court')
})

// getSmallClaimsMax
it('returns 10000 for NY', () => {
  expect(getSmallClaimsMax('NY')).toBe(10_000)
})
```

Update existing test: `STATE_CODES has exactly 2 entries` → `has exactly 3 entries`.

---

## Task 2: NY Court Recommendation Engine

**Files:**
- Modify: `src/lib/rules/court-recommendation.ts`
- Create: `tests/unit/rules/court-recommendation-ny.test.ts`

### court-recommendation.ts changes

1. Add NY amount ranges to `AmountRange`:
```typescript
export type AmountRange =
  | 'under_20k'
  | '20k_75k'
  | '75k_200k'
  | 'over_200k'
  | 'under_12500'
  | '12500_35k'
  | 'over_35k'
  | 'under_10k'     // NEW
  | '10k_25k'       // NEW
  | 'over_25k'      // NEW
  | 'not_money'
```

2. Add NY court types to `CourtType`:
```typescript
export type CourtType =
  | 'jp'
  | 'county'
  | 'district'
  | 'federal'
  | 'small_claims'
  | 'limited_civil'
  | 'unlimited_civil'
  | 'ny_small_claims'  // NEW
  | 'ny_civil'         // NEW
  | 'ny_supreme'       // NEW
```

3. Update `state` on `CourtRecommendationInput`:
```typescript
state?: 'TX' | 'CA' | 'NY'
```

4. Update `recommendCourt()` dispatcher:
```typescript
export function recommendCourt(input: CourtRecommendationInput): CourtRecommendation {
  if (input.state === 'NY') return recommendNewYorkCourt(input)
  if (input.state === 'CA') return recommendCaliforniaCourt(input)
  return recommendTexasCourt(input)
}
```

5. Add `recommendNewYorkCourt()` (rules from design doc):
```typescript
function recommendNewYorkCourt(input: CourtRecommendationInput): CourtRecommendation {
  const { disputeType, amount, circumstances } = input

  // Rule 1: Federal law
  if (circumstances.federalLaw) {
    return {
      recommended: 'federal',
      reasoning:
        'This dispute involves a federal law claim, which falls under exclusive federal jurisdiction.',
      confidence: 'high',
    }
  }

  // Rule 2: Family → Supreme Court (or Family Court)
  if (disputeType === 'family') {
    return {
      recommended: 'ny_supreme',
      reasoning:
        'Family law matters such as divorce are heard in New York Supreme Court. Custody and support matters may also be heard in Family Court.',
      confidence: 'high',
    }
  }

  // Rule 3: Eviction → Civil Court (Housing Court)
  if (disputeType === 'landlord_tenant' && input.subType === 'eviction') {
    return {
      recommended: 'ny_civil',
      reasoning:
        'Eviction proceedings are heard in Housing Court, which is part of New York Civil Court.',
      confidence: 'high',
    }
  }

  // Rule 4: Real property → Supreme Court
  if (circumstances.realProperty) {
    return {
      recommended: 'ny_supreme',
      reasoning:
        'Disputes involving title to real property are heard in New York Supreme Court.',
      confidence: 'high',
    }
  }

  // Rule 5: Diversity jurisdiction ($75K+ out-of-state)
  if (
    circumstances.outOfState &&
    (amount === 'over_25k' || amount === 'over_200k' || amount === '75k_200k')
  ) {
    return {
      recommended: 'federal',
      reasoning:
        'Out-of-state parties with an amount in controversy exceeding $75,000 may qualify for federal diversity jurisdiction.',
      alternativeNote:
        'You may also file in New York Supreme Court if you prefer state court.',
      confidence: 'moderate',
    }
  }

  // Rule 6: Under $10K → Small Claims (UCCA § 1801)
  if (amount === 'under_10k') {
    return {
      recommended: 'ny_small_claims',
      reasoning:
        'Claims up to $10,000 can be filed in New York Small Claims Court (UCCA § 1801).',
      confidence: 'high',
    }
  }

  // Rule 7: $10K–$25K → Civil Court
  if (amount === '10k_25k') {
    return {
      recommended: 'ny_civil',
      reasoning:
        'Claims between $10,000 and $25,000 fall within New York Civil Court jurisdiction.',
      confidence: 'high',
    }
  }

  // Rule 8: Over $25K → Supreme Court
  if (amount === 'over_25k' || amount === 'over_200k' || amount === '75k_200k') {
    return {
      recommended: 'ny_supreme',
      reasoning:
        'Claims exceeding $25,000 are heard in New York Supreme Court, which has unlimited civil jurisdiction.',
      confidence: 'high',
    }
  }

  // Handle TX/CA amount ranges used in NY context
  if (amount === 'under_20k' || amount === 'under_12500') {
    return {
      recommended: 'ny_civil',
      reasoning:
        'Claims in this range fall within New York Civil Court jurisdiction.',
      confidence: 'high',
    }
  }

  if (amount === '20k_75k' || amount === '12500_35k' || amount === 'over_35k') {
    return {
      recommended: 'ny_supreme',
      reasoning:
        'Claims exceeding $25,000 are heard in New York Supreme Court.',
      confidence: 'high',
    }
  }

  // Default → Supreme Court
  return {
    recommended: 'ny_supreme',
    reasoning:
      'Non-monetary disputes are generally heard in New York Supreme Court, which has broad general jurisdiction.',
    confidence: 'high',
  }
}
```

### Tests (~14 new) — `tests/unit/rules/court-recommendation-ny.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import { recommendCourt } from '@/lib/rules/court-recommendation'

const BASE_FLAGS = { realProperty: false, outOfState: false, governmentEntity: false, federalLaw: false }

describe('recommendCourt — New York', () => {
  it('recommends federal for federal law claims', () => {
    const result = recommendCourt({ state: 'NY', disputeType: 'contract', amount: 'under_10k', circumstances: { ...BASE_FLAGS, federalLaw: true } })
    expect(result.recommended).toBe('federal')
  })

  it('recommends ny_supreme for family', () => {
    const result = recommendCourt({ state: 'NY', disputeType: 'family', amount: 'not_money', circumstances: BASE_FLAGS })
    expect(result.recommended).toBe('ny_supreme')
  })

  it('recommends ny_civil for eviction', () => {
    const result = recommendCourt({ state: 'NY', disputeType: 'landlord_tenant', amount: 'under_10k', circumstances: BASE_FLAGS, subType: 'eviction' })
    expect(result.recommended).toBe('ny_civil')
  })

  it('recommends ny_supreme for real property', () => {
    const result = recommendCourt({ state: 'NY', disputeType: 'contract', amount: 'under_10k', circumstances: { ...BASE_FLAGS, realProperty: true } })
    expect(result.recommended).toBe('ny_supreme')
  })

  it('recommends ny_small_claims for under $10,000', () => {
    const result = recommendCourt({ state: 'NY', disputeType: 'contract', amount: 'under_10k', circumstances: BASE_FLAGS })
    expect(result.recommended).toBe('ny_small_claims')
  })

  it('recommends ny_civil for $10,000-$25,000', () => {
    const result = recommendCourt({ state: 'NY', disputeType: 'contract', amount: '10k_25k', circumstances: BASE_FLAGS })
    expect(result.recommended).toBe('ny_civil')
  })

  it('recommends ny_supreme for over $25,000', () => {
    const result = recommendCourt({ state: 'NY', disputeType: 'contract', amount: 'over_25k', circumstances: BASE_FLAGS })
    expect(result.recommended).toBe('ny_supreme')
  })

  it('recommends federal for out-of-state + high amount', () => {
    const result = recommendCourt({ state: 'NY', disputeType: 'contract', amount: 'over_25k', circumstances: { ...BASE_FLAGS, outOfState: true } })
    expect(result.recommended).toBe('federal')
    expect(result.alternativeNote).toBeTruthy()
  })

  it('recommends ny_supreme for not_money default', () => {
    const result = recommendCourt({ state: 'NY', disputeType: 'other', amount: 'not_money', circumstances: BASE_FLAGS })
    expect(result.recommended).toBe('ny_supreme')
  })

  it('NY reasoning mentions New York', () => {
    const result = recommendCourt({ state: 'NY', disputeType: 'contract', amount: 'under_10k', circumstances: BASE_FLAGS })
    expect(result.reasoning).toContain('New York')
  })

  it('NY small claims mentions UCCA', () => {
    const result = recommendCourt({ state: 'NY', disputeType: 'contract', amount: 'under_10k', circumstances: BASE_FLAGS })
    expect(result.reasoning).toContain('UCCA')
  })

  it('NY eviction mentions Housing Court', () => {
    const result = recommendCourt({ state: 'NY', disputeType: 'landlord_tenant', amount: 'under_10k', circumstances: BASE_FLAGS, subType: 'eviction' })
    expect(result.reasoning).toContain('Housing Court')
  })

  it('handles TX amount ranges gracefully in NY context', () => {
    const result = recommendCourt({ state: 'NY', disputeType: 'contract', amount: 'under_20k', circumstances: BASE_FLAGS })
    expect(['ny_small_claims', 'ny_civil']).toContain(result.recommended)
  })

  it('does not affect existing TX tests', () => {
    const result = recommendCourt({ disputeType: 'family', amount: 'not_money', circumstances: BASE_FLAGS })
    expect(result.recommended).toBe('district')
  })
})
```

---

## Task 3: Schema + DB Migration

**Files:**
- Modify: `src/lib/schemas/case.ts`
- Modify: `tests/unit/schemas/case.test.ts`
- Create: `supabase/migrations/20260304000003_add_ny_state.sql`

### case.ts — Add NY

```typescript
export const STATES = ['TX', 'CA', 'NY'] as const

export const ALL_COURT_TYPES = [
  'jp', 'county', 'district',
  'small_claims', 'limited_civil', 'unlimited_civil',
  'ny_small_claims', 'ny_civil', 'ny_supreme',
  'federal', 'unknown',
] as const
```

### case.test.ts — Update + add tests (~5)

Update existing test:
- `'rejects invalid state'` test body: change `state: 'NY'` → `state: 'FL'` (since NY is now valid)

Add new tests:
```typescript
it('accepts NY as state', () => {
  const result = createCaseSchema.safeParse({ role: 'plaintiff', state: 'NY' })
  expect(result.success).toBe(true)
  if (result.success) {
    expect(result.data.state).toBe('NY')
  }
})

it('accepts NY court types', () => {
  for (const ct of ['ny_small_claims', 'ny_civil', 'ny_supreme']) {
    const result = createCaseSchema.safeParse({ role: 'plaintiff', court_type: ct })
    expect(result.success).toBe(true)
  }
})

it('accepts NY state with NY court type', () => {
  const result = createCaseSchema.safeParse({
    role: 'plaintiff',
    state: 'NY',
    court_type: 'ny_small_claims',
    dispute_type: 'small_claims',
  })
  expect(result.success).toBe(true)
})
```

### DB Migration — `20260304000003_add_ny_state.sql`

```sql
-- Add NY to the state CHECK constraint
ALTER TABLE public.cases
  DROP CONSTRAINT IF EXISTS cases_state_check;

ALTER TABLE public.cases
  ADD CONSTRAINT cases_state_check
  CHECK (state IN ('TX', 'CA', 'NY'));

-- Add NY court types to the court_type CHECK constraint
ALTER TABLE public.cases
  DROP CONSTRAINT IF EXISTS cases_court_type_check;

ALTER TABLE public.cases
  ADD CONSTRAINT cases_court_type_check
  CHECK (court_type IN (
    'jp', 'county', 'district', 'federal', 'unknown',
    'small_claims', 'limited_civil', 'unlimited_civil',
    'ny_small_claims', 'ny_civil', 'ny_supreme'
  ));
```

---

## Task 4: Wizard UI Wiring

**Files:**
- Modify: `src/components/cases/wizard/state-step.tsx`
- Modify: `src/components/cases/wizard/recommendation-step.tsx`
- Modify: `src/components/cases/wizard/small-claims-sub-type-step.tsx`
- Modify: `src/components/cases/new-case-dialog.tsx`

### state-step.tsx — Add NY card

```typescript
const STATE_OPTIONS: { value: State; label: string; description: string }[] = [
  { value: 'TX', label: 'Texas', description: 'JP, County, and District courts' },
  { value: 'CA', label: 'California', description: 'Small Claims, Limited Civil, and Unlimited Civil courts' },
  { value: 'NY', label: 'New York', description: 'Small Claims, Civil, and Supreme courts' },
]
```

### recommendation-step.tsx — Add NY court labels + county placeholder + Supreme Court note

Add `NY_COURT_LABELS`:
```typescript
const NY_COURT_LABELS: Record<string, string> = {
  ny_small_claims: 'Small Claims Court',
  ny_civil: 'Civil Court',
  ny_supreme: 'Supreme Court',
  federal: 'Federal Court',
}
```

Update `getCourtLabels`:
```typescript
function getCourtLabels(selectedState: State): Record<string, string> {
  if (selectedState === 'NY') return NY_COURT_LABELS
  return selectedState === 'CA' ? CA_COURT_LABELS : TX_COURT_LABELS
}
```

Update county placeholder:
```typescript
const countyPlaceholder = selectedState === 'NY'
  ? 'e.g. Kings County'
  : selectedState === 'CA'
    ? 'e.g. Los Angeles County'
    : 'e.g. Travis County'
```

Add Supreme Court clarification note after reasoning text (only for NY `ny_supreme`):
```typescript
{selectedState === 'NY' && recommendation.recommended === 'ny_supreme' && (
  <p className="text-xs text-warm-muted mt-1">
    In New York, Supreme Court is the main trial court — not the highest court.
  </p>
)}
```

### small-claims-sub-type-step.tsx — Add NY to stateName

```typescript
const stateName = selectedState === 'NY'
  ? 'New York'
  : selectedState === 'CA'
    ? 'California'
    : 'Texas'
```

Update the limit warning text for NY:
```typescript
you may need to file in {selectedState === 'NY' ? 'Civil or Supreme' : selectedState === 'CA' ? 'Limited Civil or Unlimited Civil' : 'County or District'} Court instead.
```

### new-case-dialog.tsx — Add NY branching

Update `isCA` pattern to also handle `isNY`:
```typescript
const isNY = selectedState === 'NY'
```

Update `handleAccept` court type mapping:
```typescript
const courtType =
  courtOverride ??
  (isFamily
    ? (isNY ? 'ny_supreme' : isCA ? 'unlimited_civil' : 'district')
    : isSmallClaims
      ? (isNY ? 'ny_small_claims' : isCA ? 'small_claims' : 'jp')
      : isEviction
        ? (isNY ? 'ny_civil' : isCA ? 'unlimited_civil' : 'jp')
        : state.disputeType && state.amount
          ? recommendCourt({
              disputeType: state.disputeType,
              amount: state.amount,
              circumstances: state.circumstances,
              subType: isLandlordTenant ? state.landlordTenantSubType : undefined,
              state: stateCode,
            }).recommended
          : 'unknown')
```

Update `familyRecommendation`:
```typescript
const familyRecommendation = isNY
  ? {
      recommended: 'ny_supreme' as const,
      reasoning: 'Family law matters such as divorce are heard in New York Supreme Court.',
      confidence: 'high' as const,
    }
  : isCA
    ? {
        recommended: 'unlimited_civil' as const,
        reasoning: 'Family law matters are heard in California Superior Court (Unlimited Civil division).',
        confidence: 'high' as const,
      }
    : {
        recommended: 'district' as const,
        reasoning: 'Family law cases are filed in District Court.',
        confidence: 'high' as const,
      }
```

Update `smallClaimsRecommendation`:
```typescript
const smallClaimsRecommendation = isNY
  ? {
      recommended: 'ny_small_claims' as const,
      reasoning: 'Small claims cases up to $10,000 are filed in New York Small Claims Court.',
      confidence: 'high' as const,
    }
  : isCA
    ? {
        recommended: 'small_claims' as const,
        reasoning: 'Small claims cases are filed in California Small Claims Court.',
        confidence: 'high' as const,
      }
    : {
        recommended: 'jp' as const,
        reasoning: 'Small claims cases are filed in Justice of the Peace (JP) Court.',
        confidence: 'high' as const,
      }
```

Update `evictionRecommendation`:
```typescript
const evictionRecommendation = isNY
  ? {
      recommended: 'ny_civil' as const,
      reasoning: 'Eviction proceedings are heard in Housing Court, which is part of New York Civil Court.',
      confidence: 'high' as const,
    }
  : isCA
    ? {
        recommended: 'unlimited_civil' as const,
        reasoning: 'Unlawful detainer (eviction) cases are heard in California Superior Court regardless of the amount involved.',
        confidence: 'high' as const,
      }
    : {
        recommended: 'jp' as const,
        reasoning: 'Eviction cases are filed in Justice of the Peace (JP) Court.',
        confidence: 'high' as const,
      }
```

---

## Task 5: NY Damages Calculator

**Files:**
- Modify: `src/lib/small-claims/damages-calculator.ts`
- Create: `tests/unit/small-claims/damages-calculator-ny.test.ts`

### damages-calculator.ts — Add NY cap

```typescript
/**
 * UCCA § 1801: New York Small Claims Court has
 * jurisdiction over civil matters where the amount does not exceed
 * $10,000 (NYC).
 */
export const NY_SMALL_CLAIMS_CAP = 10_000
```

### Tests (~6) — `tests/unit/small-claims/damages-calculator-ny.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import { calculateDamages, NY_SMALL_CLAIMS_CAP } from '@/lib/small-claims/damages-calculator'

describe('calculateDamages — New York', () => {
  it('NY_SMALL_CLAIMS_CAP is 10000', () => {
    expect(NY_SMALL_CLAIMS_CAP).toBe(10_000)
  })

  it('uses NY cap when passed as jurisdictionCap', () => {
    const result = calculateDamages({
      items: [{ category: 'Damage', amount: 8_000 }],
      jurisdictionCap: NY_SMALL_CLAIMS_CAP,
    })
    expect(result.capAmount).toBe(10_000)
    expect(result.exceedsCap).toBe(false)
  })

  it('exceeds NY cap at 11000', () => {
    const result = calculateDamages({
      items: [{ category: 'Damage', amount: 11_000 }],
      jurisdictionCap: NY_SMALL_CLAIMS_CAP,
    })
    expect(result.exceedsCap).toBe(true)
    expect(result.overCapBy).toBe(1_000)
  })

  it('nearing NY cap at 9500', () => {
    const result = calculateDamages({
      items: [{ category: 'Damage', amount: 9_500 }],
      jurisdictionCap: NY_SMALL_CLAIMS_CAP,
    })
    expect(result.nearingCap).toBe(true)
  })

  it('not nearing NY cap at 5000', () => {
    const result = calculateDamages({
      items: [{ category: 'Damage', amount: 5_000 }],
      jurisdictionCap: NY_SMALL_CLAIMS_CAP,
    })
    expect(result.nearingCap).toBe(false)
  })

  it('still defaults to TX cap when no jurisdictionCap', () => {
    const result = calculateDamages({
      items: [{ category: 'Damage', amount: 15_000 }],
    })
    expect(result.capAmount).toBe(20_000)
    expect(result.exceedsCap).toBe(false)
  })
})
```

---

## Task 6: NY Child Support Calculator (CSSA)

**Files:**
- Create: `src/lib/states/ny/calculators/ny-child-support-calculator.ts`
- Create: `tests/unit/states/ny/calculators/ny-child-support-calculator.test.ts`

### ny-child-support-calculator.ts

```typescript
/**
 * New York Child Support Standards Act (CSSA) Calculator
 *
 * Calculates child support obligations based on the CSSA formula.
 * Pure computation module — no side effects.
 *
 * References:
 *   - NY Domestic Relations Law § 240(1-b)
 *   - CSSA income cap: $193,000 (as of March 2026)
 */

import { z } from 'zod'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Combined parental income cap for CSSA calculation (2026) */
export const CSSA_INCOME_CAP = 193_000

/** CSSA percentage per number of children */
export const CSSA_PERCENTAGES: Record<number, number> = {
  1: 0.17,
  2: 0.25,
  3: 0.29,
  4: 0.31,
  5: 0.35,
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

export const cssaInputSchema = z.object({
  /** Non-custodial parent's annual gross income */
  nonCustodialIncome: z.number().nonnegative(),
  /** Custodial parent's annual gross income */
  custodialIncome: z.number().nonnegative(),
  /** Number of children (1-5) */
  numberOfChildren: z.number().int().min(1).max(5),
  /** Annual childcare expenses */
  childcareExpenses: z.number().nonnegative().optional().default(0),
  /** Annual health insurance premium for children */
  healthInsurance: z.number().nonnegative().optional().default(0),
  /** Annual education expenses */
  educationExpenses: z.number().nonnegative().optional().default(0),
})

export type CSSAInput = z.infer<typeof cssaInputSchema>

// ---------------------------------------------------------------------------
// Result
// ---------------------------------------------------------------------------

export interface CSSAResult {
  /** Combined parental income */
  combinedIncome: number
  /** Income used for calculation (capped at $193K) */
  cappedIncome: number
  /** Whether combined income exceeds the cap */
  exceedsCap: boolean
  /** CSSA percentage applied */
  percentage: number
  /** Non-custodial parent's pro-rata share (fraction) */
  nonCustodialShare: number
  /** Basic child support obligation (before add-ons) */
  basicObligation: number
  /** Total add-on expenses (childcare + health + education) */
  addOnExpenses: number
  /** Non-custodial parent's share of add-ons */
  addOnObligation: number
  /** Total estimated monthly obligation */
  monthlyObligation: number
  /** Total estimated annual obligation */
  annualObligation: number
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

// ---------------------------------------------------------------------------
// Calculator
// ---------------------------------------------------------------------------

export function calculateCSSA(input: CSSAInput): CSSAResult {
  const combinedIncome = input.nonCustodialIncome + input.custodialIncome
  const exceedsCap = combinedIncome > CSSA_INCOME_CAP
  const cappedIncome = Math.min(combinedIncome, CSSA_INCOME_CAP)

  const percentage = CSSA_PERCENTAGES[input.numberOfChildren] ?? 0.35
  const nonCustodialShare = combinedIncome > 0
    ? input.nonCustodialIncome / combinedIncome
    : 0.5

  const basicObligation = round2(cappedIncome * percentage * nonCustodialShare)

  const addOnExpenses = (input.childcareExpenses ?? 0) +
    (input.healthInsurance ?? 0) +
    (input.educationExpenses ?? 0)
  const addOnObligation = round2(addOnExpenses * nonCustodialShare)

  const annualObligation = round2(basicObligation + addOnObligation)
  const monthlyObligation = round2(annualObligation / 12)

  return {
    combinedIncome,
    cappedIncome,
    exceedsCap,
    percentage,
    nonCustodialShare: round2(nonCustodialShare),
    basicObligation,
    addOnExpenses,
    addOnObligation,
    monthlyObligation,
    annualObligation,
  }
}
```

### Tests (~15) — `tests/unit/states/ny/calculators/ny-child-support-calculator.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import {
  calculateCSSA,
  cssaInputSchema,
  CSSA_INCOME_CAP,
  CSSA_PERCENTAGES,
} from '@/lib/states/ny/calculators/ny-child-support-calculator'

describe('NY CSSA Child Support Calculator', () => {
  describe('constants', () => {
    it('CSSA_INCOME_CAP is 193000', () => {
      expect(CSSA_INCOME_CAP).toBe(193_000)
    })

    it('1 child = 17%', () => {
      expect(CSSA_PERCENTAGES[1]).toBe(0.17)
    })

    it('2 children = 25%', () => {
      expect(CSSA_PERCENTAGES[2]).toBe(0.25)
    })

    it('3 children = 29%', () => {
      expect(CSSA_PERCENTAGES[3]).toBe(0.29)
    })

    it('4 children = 31%', () => {
      expect(CSSA_PERCENTAGES[4]).toBe(0.31)
    })
  })

  describe('schema', () => {
    it('accepts valid input', () => {
      const result = cssaInputSchema.safeParse({
        nonCustodialIncome: 80_000,
        custodialIncome: 40_000,
        numberOfChildren: 2,
      })
      expect(result.success).toBe(true)
    })

    it('rejects 0 children', () => {
      const result = cssaInputSchema.safeParse({
        nonCustodialIncome: 80_000,
        custodialIncome: 40_000,
        numberOfChildren: 0,
      })
      expect(result.success).toBe(false)
    })

    it('rejects 6 children', () => {
      const result = cssaInputSchema.safeParse({
        nonCustodialIncome: 80_000,
        custodialIncome: 40_000,
        numberOfChildren: 6,
      })
      expect(result.success).toBe(false)
    })

    it('rejects negative income', () => {
      const result = cssaInputSchema.safeParse({
        nonCustodialIncome: -10_000,
        custodialIncome: 40_000,
        numberOfChildren: 1,
      })
      expect(result.success).toBe(false)
    })
  })

  describe('calculateCSSA', () => {
    it('calculates basic obligation for 1 child', () => {
      const result = calculateCSSA({
        nonCustodialIncome: 60_000,
        custodialIncome: 40_000,
        numberOfChildren: 1,
      })
      // combined = 100K, capped = 100K, 17% = 17K, NC share = 60%, obligation = 10,200
      expect(result.combinedIncome).toBe(100_000)
      expect(result.cappedIncome).toBe(100_000)
      expect(result.exceedsCap).toBe(false)
      expect(result.percentage).toBe(0.17)
      expect(result.nonCustodialShare).toBe(0.6)
      expect(result.basicObligation).toBe(10_200)
      expect(result.monthlyObligation).toBe(850)
    })

    it('caps income at $193,000', () => {
      const result = calculateCSSA({
        nonCustodialIncome: 150_000,
        custodialIncome: 100_000,
        numberOfChildren: 1,
      })
      expect(result.combinedIncome).toBe(250_000)
      expect(result.cappedIncome).toBe(193_000)
      expect(result.exceedsCap).toBe(true)
    })

    it('includes add-on expenses', () => {
      const result = calculateCSSA({
        nonCustodialIncome: 60_000,
        custodialIncome: 40_000,
        numberOfChildren: 1,
        childcareExpenses: 12_000,
        healthInsurance: 3_000,
        educationExpenses: 5_000,
      })
      expect(result.addOnExpenses).toBe(20_000)
      // NC share = 60%, add-on obligation = 12,000
      expect(result.addOnObligation).toBe(12_000)
      expect(result.annualObligation).toBe(22_200)
    })

    it('handles equal incomes', () => {
      const result = calculateCSSA({
        nonCustodialIncome: 50_000,
        custodialIncome: 50_000,
        numberOfChildren: 2,
      })
      expect(result.nonCustodialShare).toBe(0.5)
      // combined=100K, 25% = 25K, NC share 50% = 12,500
      expect(result.basicObligation).toBe(12_500)
    })

    it('handles zero custodial income', () => {
      const result = calculateCSSA({
        nonCustodialIncome: 80_000,
        custodialIncome: 0,
        numberOfChildren: 1,
      })
      expect(result.nonCustodialShare).toBe(1)
      // 80K * 17% * 1.0 = 13,600
      expect(result.basicObligation).toBe(13_600)
    })

    it('handles zero combined income', () => {
      const result = calculateCSSA({
        nonCustodialIncome: 0,
        custodialIncome: 0,
        numberOfChildren: 1,
      })
      expect(result.nonCustodialShare).toBe(0.5)
      expect(result.basicObligation).toBe(0)
    })

    it('calculates correctly for 3 children at 29%', () => {
      const result = calculateCSSA({
        nonCustodialIncome: 100_000,
        custodialIncome: 0,
        numberOfChildren: 3,
      })
      // 100K * 29% * 1.0 = 29,000
      expect(result.basicObligation).toBe(29_000)
      expect(result.percentage).toBe(0.29)
    })
  })
})
```

---

## Task 7: Verification

1. Run full test suite — all existing + new tests pass
2. `npx next build` — zero type errors, compiles clean
3. State selector shows 3 cards (TX, CA, NY)
4. NY court recommendation returns correct courts
5. NY damages calculator uses $10,000 cap
6. CSSA calculator returns correct child support values

**Run:** `npx vitest run`
**Expected:** All tests pass (existing 1029 + ~50 new ≈ 1079+)

**Run:** `npx next build`
**Expected:** Build succeeds with zero errors

---

## File Summary

| File | Action | Task |
|------|--------|------|
| `src/lib/states/types.ts` | Modify | T1 |
| `src/lib/states/ny.ts` | Create | T1 |
| `src/lib/states/index.ts` | Modify | T1 |
| `tests/unit/states/config.test.ts` | Modify | T1 |
| `src/lib/rules/court-recommendation.ts` | Modify | T2 |
| `tests/unit/rules/court-recommendation-ny.test.ts` | Create | T2 |
| `src/lib/schemas/case.ts` | Modify | T3 |
| `tests/unit/schemas/case.test.ts` | Modify | T3 |
| `supabase/migrations/20260304000003_add_ny_state.sql` | Create | T3 |
| `src/components/cases/wizard/state-step.tsx` | Modify | T4 |
| `src/components/cases/wizard/recommendation-step.tsx` | Modify | T4 |
| `src/components/cases/wizard/small-claims-sub-type-step.tsx` | Modify | T4 |
| `src/components/cases/new-case-dialog.tsx` | Modify | T4 |
| `src/lib/small-claims/damages-calculator.ts` | Modify | T5 |
| `tests/unit/small-claims/damages-calculator-ny.test.ts` | Create | T5 |
| `src/lib/states/ny/calculators/ny-child-support-calculator.ts` | Create | T6 |
| `tests/unit/states/ny/calculators/ny-child-support-calculator.test.ts` | Create | T6 |

## Dependencies

```
T1 (State Config) → T2 (Court Rec) → T3 (Schema + DB) ← sequential foundation
                                        ↓
                              T4, T5, T6 can run in parallel after T3
                                        ↓
                                   T7 (Verify)
```

Tasks 4, 5, and 6 are independent and can be parallelized after Tasks 1-3 complete.
