# Pennsylvania Expansion Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Add Pennsylvania as the fifth supported state, with PA court types, recommendation engine, damages calculator, and all wizard/UI wiring.

**Architecture:** Extends the proven hybrid multi-state system (TX/CA/NY/FL). PA config object for data, PA-specific `recommendPennsylvaniaCourt()` for court routing. No architectural changes — follows exact prior expansion pattern.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind, Supabase, Anthropic Claude API, Zod, vitest

---

## Task 1: PA State Config + Schema + DB Migration

**Files:**
- Modify: `src/lib/states/types.ts`
- Create: `src/lib/states/pa.ts`
- Modify: `src/lib/states/index.ts`
- Modify: `src/lib/schemas/case.ts`
- Modify: `tests/unit/states/config.test.ts`
- Modify: `tests/unit/schemas/case.test.ts`
- Create: `supabase/migrations/20260304000005_add_pa_state.sql`

### types.ts — Add `'PA'` to StateCode

```typescript
export type StateCode = 'TX' | 'CA' | 'NY' | 'FL' | 'PA'

export const STATE_CODES = ['TX', 'CA', 'NY', 'FL', 'PA'] as const
```

### pa.ts — PA_CONFIG

```typescript
import type { StateConfig } from './types'

export const PA_CONFIG: StateConfig = {
  code: 'PA',
  name: 'Pennsylvania',
  abbreviation: 'PA',
  courtTypes: [
    { value: 'pa_magisterial', label: 'Magisterial District Court', maxAmount: 12_000 },
    { value: 'pa_common_pleas', label: 'Court of Common Pleas' },
  ],
  federalCourtAvailable: true,
  thresholds: {
    smallClaimsMax: 12_000,
  },
  statuteOfLimitations: {
    personalInjury: 2,
    writtenContract: 4,
    oralContract: 4,
    propertyDamage: 2,
  },
  amountRanges: [
    { value: 'under_12k', label: 'Under $12,000', maxAmount: 12_000 },
    { value: 'over_12k', label: 'Over $12,000' },
    { value: 'not_money', label: "It's not about money" },
  ],
}
```

### index.ts — Register PA_CONFIG

Add import and register:
```typescript
import { PA_CONFIG } from './pa'

const STATE_CONFIGS: Record<StateCode, StateConfig> = {
  TX: TX_CONFIG,
  CA: CA_CONFIG,
  NY: NY_CONFIG,
  FL: FL_CONFIG,
  PA: PA_CONFIG,
}
```

### case.ts — Add PA to schemas

```typescript
export const STATES = ['TX', 'CA', 'NY', 'FL', 'PA'] as const

export const ALL_COURT_TYPES = [
  'jp', 'county', 'district',
  'small_claims', 'limited_civil', 'unlimited_civil',
  'ny_small_claims', 'ny_civil', 'ny_supreme',
  'fl_small_claims', 'fl_county', 'fl_circuit',
  'pa_magisterial', 'pa_common_pleas',
  'federal', 'unknown',
] as const
```

### case.test.ts — Update + add tests

Change existing `'rejects invalid state'` test: `state: 'OH'` stays (already uses OH).

Add after the FL tests:
```typescript
it('accepts PA as state', () => {
  const result = createCaseSchema.safeParse({ role: 'plaintiff', state: 'PA' })
  expect(result.success).toBe(true)
  if (result.success) {
    expect(result.data.state).toBe('PA')
  }
})

it('accepts PA court types', () => {
  for (const ct of ['pa_magisterial', 'pa_common_pleas']) {
    const result = createCaseSchema.safeParse({ role: 'plaintiff', court_type: ct })
    expect(result.success).toBe(true)
  }
})

it('accepts PA state with PA court type', () => {
  const result = createCaseSchema.safeParse({
    role: 'plaintiff',
    state: 'PA',
    court_type: 'pa_magisterial',
    dispute_type: 'small_claims',
  })
  expect(result.success).toBe(true)
})
```

### config.test.ts — Add PA tests (~13 new)

Update existing: `'has exactly 4 entries'` → `'has exactly 5 entries'` with `toHaveLength(5)`.

Add in `STATE_CODES` describe:
```typescript
it('contains PA', () => {
  expect(STATE_CODES).toContain('PA')
})
```

Add in `getStateConfig` describe:
```typescript
it('returns PA config', () => {
  const config = getStateConfig('PA')
  expect(config.code).toBe('PA')
  expect(config.name).toBe('Pennsylvania')
})
it('PA has pa_magisterial, pa_common_pleas court types', () => {
  const config = getStateConfig('PA')
  const values = config.courtTypes.map((c) => c.value)
  expect(values).toEqual(['pa_magisterial', 'pa_common_pleas'])
})
it('PA small claims max is 12000', () => {
  expect(getStateConfig('PA').thresholds.smallClaimsMax).toBe(12_000)
})
it('PA SOL personalInjury is 2', () => {
  expect(getStateConfig('PA').statuteOfLimitations.personalInjury).toBe(2)
})
it('PA SOL writtenContract is 4', () => {
  expect(getStateConfig('PA').statuteOfLimitations.writtenContract).toBe(4)
})
it('PA SOL oralContract is 4', () => {
  expect(getStateConfig('PA').statuteOfLimitations.oralContract).toBe(4)
})
it('PA SOL propertyDamage is 2', () => {
  expect(getStateConfig('PA').statuteOfLimitations.propertyDamage).toBe(2)
})
it('PA has 3 amount ranges', () => {
  expect(getStateConfig('PA').amountRanges).toHaveLength(3)
})
```

Add in `getCourtLabel` describe:
```typescript
it('returns Magisterial District Court label for PA pa_magisterial', () => {
  expect(getCourtLabel('PA', 'pa_magisterial')).toBe('Magisterial District Court')
})
it('returns Court of Common Pleas label for PA pa_common_pleas', () => {
  expect(getCourtLabel('PA', 'pa_common_pleas')).toBe('Court of Common Pleas')
})
it('returns Federal Court for PA federal', () => {
  expect(getCourtLabel('PA', 'federal')).toBe('Federal Court')
})
```

Add in `getSmallClaimsMax` describe:
```typescript
it('returns 12000 for PA', () => {
  expect(getSmallClaimsMax('PA')).toBe(12_000)
})
```

### DB Migration — `20260304000005_add_pa_state.sql`

```sql
-- Add PA to the state CHECK constraint
ALTER TABLE public.cases
  DROP CONSTRAINT IF EXISTS cases_state_check;

ALTER TABLE public.cases
  ADD CONSTRAINT cases_state_check
  CHECK (state IN ('TX', 'CA', 'NY', 'FL', 'PA'));

-- Add PA court types to the court_type CHECK constraint
ALTER TABLE public.cases
  DROP CONSTRAINT IF EXISTS cases_court_type_check;

ALTER TABLE public.cases
  ADD CONSTRAINT cases_court_type_check
  CHECK (court_type IN (
    'jp', 'county', 'district', 'federal', 'unknown',
    'small_claims', 'limited_civil', 'unlimited_civil',
    'ny_small_claims', 'ny_civil', 'ny_supreme',
    'fl_small_claims', 'fl_county', 'fl_circuit',
    'pa_magisterial', 'pa_common_pleas'
  ));
```

---

## Task 2: PA Court Recommendation Engine

**Files:**
- Modify: `src/lib/rules/court-recommendation.ts`
- Create: `tests/unit/rules/court-recommendation-pa.test.ts`

### court-recommendation.ts changes

**a) Add PA amount ranges to `AmountRange`:**
```typescript
  | 'under_12k'
  | 'over_12k'
```

**b) Add PA court types to `CourtType`:**
```typescript
  | 'pa_magisterial'
  | 'pa_common_pleas'
```

**c) Update `state` on `CourtRecommendationInput`:**
```typescript
state?: 'TX' | 'CA' | 'NY' | 'FL' | 'PA'
```

**d) Update `recommendCourt()` dispatcher:**
```typescript
export function recommendCourt(input: CourtRecommendationInput): CourtRecommendation {
  if (input.state === 'PA') return recommendPennsylvaniaCourt(input)
  if (input.state === 'FL') return recommendFloridaCourt(input)
  if (input.state === 'NY') return recommendNewYorkCourt(input)
  if (input.state === 'CA') return recommendCaliforniaCourt(input)
  return recommendTexasCourt(input)
}
```

**e) Add `recommendPennsylvaniaCourt()` function:**

```typescript
// -- Pennsylvania Rules -------------------------------------------------------

function recommendPennsylvaniaCourt(input: CourtRecommendationInput): CourtRecommendation {
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

  // Rule 2: Family → Court of Common Pleas (Family Division)
  if (disputeType === 'family') {
    return {
      recommended: 'pa_common_pleas',
      reasoning:
        'Family law matters are heard in the Family Division of Pennsylvania Court of Common Pleas.',
      confidence: 'high',
    }
  }

  // Rule 3: Eviction → Magisterial District Court
  if (disputeType === 'landlord_tenant' && input.subType === 'eviction') {
    return {
      recommended: 'pa_magisterial',
      reasoning:
        'Eviction proceedings are filed in Pennsylvania Magisterial District Court (68 P.S. § 250.501).',
      confidence: 'high',
    }
  }

  // Rule 4: Real property → Court of Common Pleas
  if (circumstances.realProperty) {
    return {
      recommended: 'pa_common_pleas',
      reasoning:
        'Disputes involving title to real property are heard in Pennsylvania Court of Common Pleas.',
      confidence: 'high',
    }
  }

  // Rule 5: Diversity jurisdiction ($75K+ out-of-state)
  if (
    circumstances.outOfState &&
    (amount === 'over_12k' || amount === 'over_200k' || amount === '75k_200k')
  ) {
    return {
      recommended: 'federal',
      reasoning:
        'Out-of-state parties with an amount in controversy exceeding $75,000 may qualify for federal diversity jurisdiction.',
      alternativeNote:
        'You may also file in Pennsylvania Court of Common Pleas if you prefer state court.',
      confidence: 'moderate',
    }
  }

  // Rule 6: Under $12K → Magisterial District Court (42 Pa.C.S. § 1515)
  if (amount === 'under_12k') {
    return {
      recommended: 'pa_magisterial',
      reasoning:
        'Claims up to $12,000 can be filed in Pennsylvania Magisterial District Court (42 Pa.C.S. § 1515).',
      confidence: 'high',
    }
  }

  // Rule 7: Over $12K → Court of Common Pleas
  if (amount === 'over_12k' || amount === 'over_200k' || amount === '75k_200k') {
    return {
      recommended: 'pa_common_pleas',
      reasoning:
        'Claims exceeding $12,000 are heard in Pennsylvania Court of Common Pleas, which has unlimited civil jurisdiction.',
      confidence: 'high',
    }
  }

  // Handle TX/CA/NY/FL amount ranges used in PA context
  if (amount === 'under_20k' || amount === 'under_12500' || amount === 'under_10k' || amount === 'under_8k') {
    return {
      recommended: 'pa_common_pleas',
      reasoning:
        'Claims in this range fall within Pennsylvania Court of Common Pleas jurisdiction.',
      confidence: 'high',
    }
  }

  if (amount === '20k_75k' || amount === '12500_35k' || amount === 'over_35k' || amount === '10k_25k' || amount === 'over_25k' || amount === '8k_50k' || amount === 'over_50k') {
    return {
      recommended: 'pa_common_pleas',
      reasoning:
        'Claims in this range are heard in Pennsylvania Court of Common Pleas.',
      confidence: 'high',
    }
  }

  // Default → Court of Common Pleas
  return {
    recommended: 'pa_common_pleas',
    reasoning:
      'Non-monetary disputes are generally heard in Pennsylvania Court of Common Pleas, which has broad general jurisdiction.',
    confidence: 'high',
  }
}
```

### Tests (~12) — `tests/unit/rules/court-recommendation-pa.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import { recommendCourt } from '@/lib/rules/court-recommendation'

const BASE_FLAGS = { realProperty: false, outOfState: false, governmentEntity: false, federalLaw: false }

describe('recommendCourt — Pennsylvania', () => {
  it('recommends federal for federal law claims', () => {
    const result = recommendCourt({ state: 'PA', disputeType: 'contract', amount: 'under_12k', circumstances: { ...BASE_FLAGS, federalLaw: true } })
    expect(result.recommended).toBe('federal')
  })

  it('recommends pa_common_pleas for family', () => {
    const result = recommendCourt({ state: 'PA', disputeType: 'family', amount: 'not_money', circumstances: BASE_FLAGS })
    expect(result.recommended).toBe('pa_common_pleas')
  })

  it('recommends pa_magisterial for eviction', () => {
    const result = recommendCourt({ state: 'PA', disputeType: 'landlord_tenant', amount: 'under_12k', circumstances: BASE_FLAGS, subType: 'eviction' })
    expect(result.recommended).toBe('pa_magisterial')
  })

  it('recommends pa_common_pleas for real property', () => {
    const result = recommendCourt({ state: 'PA', disputeType: 'contract', amount: 'under_12k', circumstances: { ...BASE_FLAGS, realProperty: true } })
    expect(result.recommended).toBe('pa_common_pleas')
  })

  it('recommends pa_magisterial for under $12,000', () => {
    const result = recommendCourt({ state: 'PA', disputeType: 'contract', amount: 'under_12k', circumstances: BASE_FLAGS })
    expect(result.recommended).toBe('pa_magisterial')
  })

  it('recommends pa_common_pleas for over $12,000', () => {
    const result = recommendCourt({ state: 'PA', disputeType: 'contract', amount: 'over_12k', circumstances: BASE_FLAGS })
    expect(result.recommended).toBe('pa_common_pleas')
  })

  it('recommends federal for out-of-state + high amount', () => {
    const result = recommendCourt({ state: 'PA', disputeType: 'contract', amount: 'over_12k', circumstances: { ...BASE_FLAGS, outOfState: true } })
    expect(result.recommended).toBe('federal')
    expect(result.alternativeNote).toBeTruthy()
  })

  it('recommends pa_common_pleas for not_money default', () => {
    const result = recommendCourt({ state: 'PA', disputeType: 'other', amount: 'not_money', circumstances: BASE_FLAGS })
    expect(result.recommended).toBe('pa_common_pleas')
  })

  it('PA reasoning mentions Pennsylvania', () => {
    const result = recommendCourt({ state: 'PA', disputeType: 'contract', amount: 'under_12k', circumstances: BASE_FLAGS })
    expect(result.reasoning).toContain('Pennsylvania')
  })

  it('PA small claims mentions 42 Pa.C.S.', () => {
    const result = recommendCourt({ state: 'PA', disputeType: 'contract', amount: 'under_12k', circumstances: BASE_FLAGS })
    expect(result.reasoning).toContain('42 Pa.C.S.')
  })

  it('handles TX amount ranges gracefully in PA context', () => {
    const result = recommendCourt({ state: 'PA', disputeType: 'contract', amount: 'under_20k', circumstances: BASE_FLAGS })
    expect(['pa_magisterial', 'pa_common_pleas']).toContain(result.recommended)
  })

  it('does not affect existing TX tests', () => {
    const result = recommendCourt({ disputeType: 'family', amount: 'not_money', circumstances: BASE_FLAGS })
    expect(result.recommended).toBe('district')
  })
})
```

---

## Task 3: Wizard UI Wiring

**Files:**
- Modify: `src/components/cases/wizard/state-step.tsx`
- Modify: `src/components/cases/wizard/recommendation-step.tsx`
- Modify: `src/components/cases/wizard/small-claims-sub-type-step.tsx`
- Modify: `src/components/cases/new-case-dialog.tsx`

### state-step.tsx — Add PA card

```typescript
const STATE_OPTIONS: { value: State; label: string; description: string }[] = [
  { value: 'TX', label: 'Texas', description: 'JP, County, and District courts' },
  { value: 'CA', label: 'California', description: 'Small Claims, Limited Civil, and Unlimited Civil courts' },
  { value: 'NY', label: 'New York', description: 'Small Claims, Civil, and Supreme courts' },
  { value: 'FL', label: 'Florida', description: 'Small Claims, County, and Circuit courts' },
  { value: 'PA', label: 'Pennsylvania', description: 'Magisterial District and Common Pleas courts' },
]
```

### recommendation-step.tsx — Add PA court labels + county placeholder

Add `PA_COURT_LABELS` after `FL_COURT_LABELS`:
```typescript
const PA_COURT_LABELS: Record<string, string> = {
  pa_magisterial: 'Magisterial District Court',
  pa_common_pleas: 'Court of Common Pleas',
  federal: 'Federal Court',
}
```

Update `getCourtLabels`:
```typescript
function getCourtLabels(selectedState: State): Record<string, string> {
  if (selectedState === 'PA') return PA_COURT_LABELS
  if (selectedState === 'FL') return FL_COURT_LABELS
  if (selectedState === 'NY') return NY_COURT_LABELS
  return selectedState === 'CA' ? CA_COURT_LABELS : TX_COURT_LABELS
}
```

Update county placeholder:
```typescript
const countyPlaceholder = selectedState === 'PA'
  ? 'e.g. Allegheny County'
  : selectedState === 'FL'
    ? 'e.g. Miami-Dade County'
    : selectedState === 'NY'
      ? 'e.g. Kings County'
      : selectedState === 'CA'
        ? 'e.g. Los Angeles County'
        : 'e.g. Travis County'
```

### small-claims-sub-type-step.tsx — Add PA to stateName + warning

Update `stateName`:
```typescript
const stateName = selectedState === 'PA'
  ? 'Pennsylvania'
  : selectedState === 'FL'
    ? 'Florida'
    : selectedState === 'NY'
      ? 'New York'
      : selectedState === 'CA'
        ? 'California'
        : 'Texas'
```

Update the limit warning text — the court alternatives part:
```typescript
{selectedState === 'PA' ? 'Common Pleas' : selectedState === 'FL' ? 'County or Circuit' : selectedState === 'NY' ? 'Civil or Supreme' : selectedState === 'CA' ? 'Limited Civil or Unlimited Civil' : 'County or District'}
```

### new-case-dialog.tsx — Add PA branching

Add `isPA` after `isFL` (at component level and inside handleAccept):
```typescript
const isPA = stateCode === 'PA'
// and at component level:
const isPA = selectedState === 'PA'
```

Update `handleAccept` court type mapping:
```typescript
const courtType =
  courtOverride ??
  (isFamily
    ? (isPA ? 'pa_common_pleas' : isFL ? 'fl_circuit' : isNY ? 'ny_supreme' : isCA ? 'unlimited_civil' : 'district')
    : isSmallClaims
      ? (isPA ? 'pa_magisterial' : isFL ? 'fl_small_claims' : isNY ? 'ny_small_claims' : isCA ? 'small_claims' : 'jp')
      : isEviction
        ? (isPA ? 'pa_magisterial' : isFL ? 'fl_county' : isNY ? 'ny_civil' : isCA ? 'unlimited_civil' : 'jp')
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
const familyRecommendation = isPA
  ? {
      recommended: 'pa_common_pleas' as const,
      reasoning: 'Family law matters are heard in the Family Division of Pennsylvania Court of Common Pleas.',
      confidence: 'high' as const,
    }
  : isFL
    ? {
        recommended: 'fl_circuit' as const,
        reasoning: 'Family law matters are heard in Florida Circuit Court.',
        confidence: 'high' as const,
      }
    : isNY
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
const smallClaimsRecommendation = isPA
  ? {
      recommended: 'pa_magisterial' as const,
      reasoning: 'Small claims cases up to $12,000 are filed in Pennsylvania Magisterial District Court.',
      confidence: 'high' as const,
    }
  : isFL
    ? {
        recommended: 'fl_small_claims' as const,
        reasoning: 'Small claims cases up to $8,000 are filed in Florida Small Claims Court.',
        confidence: 'high' as const,
      }
    : isNY
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
const evictionRecommendation = isPA
  ? {
      recommended: 'pa_magisterial' as const,
      reasoning: 'Eviction proceedings are filed in Pennsylvania Magisterial District Court.',
      confidence: 'high' as const,
    }
  : isFL
    ? {
        recommended: 'fl_county' as const,
        reasoning: 'Eviction proceedings are filed in Florida County Court.',
        confidence: 'high' as const,
      }
    : isNY
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

## Task 4: PA Damages Calculator

**Files:**
- Modify: `src/lib/small-claims/damages-calculator.ts`
- Create: `tests/unit/small-claims/damages-calculator-pa.test.ts`

### damages-calculator.ts — Add PA cap

After `FL_SMALL_CLAIMS_CAP`:
```typescript
/**
 * 42 Pa.C.S. § 1515: Pennsylvania Magisterial District Courts have
 * jurisdiction over civil matters where the amount does not exceed
 * $12,000, exclusive of interest and costs.
 */
export const PA_SMALL_CLAIMS_CAP = 12_000
```

### Tests (~6) — `tests/unit/small-claims/damages-calculator-pa.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import { calculateDamages, PA_SMALL_CLAIMS_CAP } from '@/lib/small-claims/damages-calculator'

describe('calculateDamages — Pennsylvania', () => {
  it('PA_SMALL_CLAIMS_CAP is 12000', () => {
    expect(PA_SMALL_CLAIMS_CAP).toBe(12_000)
  })

  it('uses PA cap when passed as jurisdictionCap', () => {
    const result = calculateDamages({
      items: [{ category: 'Damage', amount: 10_000 }],
      jurisdictionCap: PA_SMALL_CLAIMS_CAP,
    })
    expect(result.capAmount).toBe(12_000)
    expect(result.exceedsCap).toBe(false)
  })

  it('exceeds PA cap at 13000', () => {
    const result = calculateDamages({
      items: [{ category: 'Damage', amount: 13_000 }],
      jurisdictionCap: PA_SMALL_CLAIMS_CAP,
    })
    expect(result.exceedsCap).toBe(true)
    expect(result.overCapBy).toBe(1_000)
  })

  it('nearing PA cap at 11000', () => {
    const result = calculateDamages({
      items: [{ category: 'Damage', amount: 11_000 }],
      jurisdictionCap: PA_SMALL_CLAIMS_CAP,
    })
    expect(result.nearingCap).toBe(true)
  })

  it('not nearing PA cap at 6000', () => {
    const result = calculateDamages({
      items: [{ category: 'Damage', amount: 6_000 }],
      jurisdictionCap: PA_SMALL_CLAIMS_CAP,
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

## Task 5: Verification

1. Run full test suite — all existing + new tests pass
2. `npx next build` — zero type errors, compiles clean
3. State selector shows 5 cards (TX, CA, NY, FL, PA)
4. PA court recommendation returns correct courts
5. PA damages calculator uses $12,000 cap

**Run:** `npx vitest run`
**Expected:** All tests pass (existing 1119 + ~35 new ≈ 1154)

**Run:** `npx next build`
**Expected:** Build succeeds with zero errors

---

## File Summary

| File | Action | Task |
|------|--------|------|
| `src/lib/states/types.ts` | Modify | T1 |
| `src/lib/states/pa.ts` | Create | T1 |
| `src/lib/states/index.ts` | Modify | T1 |
| `src/lib/schemas/case.ts` | Modify | T1 |
| `tests/unit/states/config.test.ts` | Modify | T1 |
| `tests/unit/schemas/case.test.ts` | Modify | T1 |
| `supabase/migrations/20260304000005_add_pa_state.sql` | Create | T1 |
| `src/lib/rules/court-recommendation.ts` | Modify | T2 |
| `tests/unit/rules/court-recommendation-pa.test.ts` | Create | T2 |
| `src/components/cases/wizard/state-step.tsx` | Modify | T3 |
| `src/components/cases/wizard/recommendation-step.tsx` | Modify | T3 |
| `src/components/cases/wizard/small-claims-sub-type-step.tsx` | Modify | T3 |
| `src/components/cases/new-case-dialog.tsx` | Modify | T3 |
| `src/lib/small-claims/damages-calculator.ts` | Modify | T4 |
| `tests/unit/small-claims/damages-calculator-pa.test.ts` | Create | T4 |

## Dependencies

```
T1 (Config + Schema + DB) → T2 (Court Rec) ← sequential foundation
                                ↓
                        T3, T4 can run in parallel
                                ↓
                           T5 (Verify)
```
