# Florida Expansion Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Add Florida as the fourth supported state, with FL court types, recommendation engine, damages calculator, and all wizard/UI wiring.

**Architecture:** Extends the proven hybrid multi-state system (TX/CA/NY). FL config object for data, FL-specific `recommendFloridaCourt()` for court routing. No architectural changes — follows exact prior expansion pattern.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind, Supabase, Anthropic Claude API, Zod, vitest

---

## Task 1: FL State Config + Schema + DB Migration

**Files:**
- Modify: `src/lib/states/types.ts`
- Create: `src/lib/states/fl.ts`
- Modify: `src/lib/states/index.ts`
- Modify: `src/lib/schemas/case.ts`
- Modify: `tests/unit/states/config.test.ts`
- Modify: `tests/unit/schemas/case.test.ts`
- Create: `supabase/migrations/20260304000004_add_fl_state.sql`

### types.ts — Add `'FL'` to StateCode

```typescript
export type StateCode = 'TX' | 'CA' | 'NY' | 'FL'

export const STATE_CODES = ['TX', 'CA', 'NY', 'FL'] as const
```

### fl.ts — FL_CONFIG

```typescript
import type { StateConfig } from './types'

export const FL_CONFIG: StateConfig = {
  code: 'FL',
  name: 'Florida',
  abbreviation: 'FL',
  courtTypes: [
    { value: 'fl_small_claims', label: 'Small Claims Court', maxAmount: 8_000 },
    { value: 'fl_county', label: 'County Court', maxAmount: 50_000 },
    { value: 'fl_circuit', label: 'Circuit Court' },
  ],
  federalCourtAvailable: true,
  thresholds: {
    smallClaimsMax: 8_000,
  },
  statuteOfLimitations: {
    personalInjury: 2,
    writtenContract: 5,
    oralContract: 4,
    propertyDamage: 4,
  },
  amountRanges: [
    { value: 'under_8k', label: 'Under $8,000', maxAmount: 8_000 },
    { value: '8k_50k', label: '$8,000 – $50,000', maxAmount: 50_000 },
    { value: 'over_50k', label: 'Over $50,000' },
    { value: 'not_money', label: "It's not about money" },
  ],
}
```

### index.ts — Register FL_CONFIG

Add import and register:
```typescript
import { FL_CONFIG } from './fl'

const STATE_CONFIGS: Record<StateCode, StateConfig> = {
  TX: TX_CONFIG,
  CA: CA_CONFIG,
  NY: NY_CONFIG,
  FL: FL_CONFIG,
}
```

### case.ts — Add FL to schemas

```typescript
export const STATES = ['TX', 'CA', 'NY', 'FL'] as const

export const ALL_COURT_TYPES = [
  'jp', 'county', 'district',
  'small_claims', 'limited_civil', 'unlimited_civil',
  'ny_small_claims', 'ny_civil', 'ny_supreme',
  'fl_small_claims', 'fl_county', 'fl_circuit',
  'federal', 'unknown',
] as const
```

### case.test.ts — Update + add tests

Change existing `'rejects invalid state'` test: `state: 'FL'` → `state: 'OH'` (since FL is now valid).

Add:
```typescript
it('accepts FL as state', () => {
  const result = createCaseSchema.safeParse({ role: 'plaintiff', state: 'FL' })
  expect(result.success).toBe(true)
  if (result.success) {
    expect(result.data.state).toBe('FL')
  }
})

it('accepts FL court types', () => {
  for (const ct of ['fl_small_claims', 'fl_county', 'fl_circuit']) {
    const result = createCaseSchema.safeParse({ role: 'plaintiff', court_type: ct })
    expect(result.success).toBe(true)
  }
})

it('accepts FL state with FL court type', () => {
  const result = createCaseSchema.safeParse({
    role: 'plaintiff',
    state: 'FL',
    court_type: 'fl_small_claims',
    dispute_type: 'small_claims',
  })
  expect(result.success).toBe(true)
})
```

### config.test.ts — Add FL tests (~15 new)

Update existing: `'has exactly 3 entries'` → `'has exactly 4 entries'` with `toHaveLength(4)`.

Add in `STATE_CODES` describe:
```typescript
it('contains FL', () => {
  expect(STATE_CODES).toContain('FL')
})
```

Add in `getStateConfig` describe:
```typescript
it('returns FL config', () => {
  const config = getStateConfig('FL')
  expect(config.code).toBe('FL')
  expect(config.name).toBe('Florida')
})
it('FL has fl_small_claims, fl_county, fl_circuit court types', () => {
  const config = getStateConfig('FL')
  const values = config.courtTypes.map((c) => c.value)
  expect(values).toEqual(['fl_small_claims', 'fl_county', 'fl_circuit'])
})
it('FL small claims max is 8000', () => {
  expect(getStateConfig('FL').thresholds.smallClaimsMax).toBe(8_000)
})
it('FL SOL personalInjury is 2', () => {
  expect(getStateConfig('FL').statuteOfLimitations.personalInjury).toBe(2)
})
it('FL SOL writtenContract is 5', () => {
  expect(getStateConfig('FL').statuteOfLimitations.writtenContract).toBe(5)
})
it('FL SOL oralContract is 4', () => {
  expect(getStateConfig('FL').statuteOfLimitations.oralContract).toBe(4)
})
it('FL SOL propertyDamage is 4', () => {
  expect(getStateConfig('FL').statuteOfLimitations.propertyDamage).toBe(4)
})
it('FL has 4 amount ranges', () => {
  expect(getStateConfig('FL').amountRanges).toHaveLength(4)
})
```

Add in `getCourtLabel` describe:
```typescript
it('returns Small Claims Court label for FL fl_small_claims', () => {
  expect(getCourtLabel('FL', 'fl_small_claims')).toBe('Small Claims Court')
})
it('returns County Court label for FL fl_county', () => {
  expect(getCourtLabel('FL', 'fl_county')).toBe('County Court')
})
it('returns Circuit Court label for FL fl_circuit', () => {
  expect(getCourtLabel('FL', 'fl_circuit')).toBe('Circuit Court')
})
it('returns Federal Court for FL federal', () => {
  expect(getCourtLabel('FL', 'federal')).toBe('Federal Court')
})
```

Add in `getSmallClaimsMax` describe:
```typescript
it('returns 8000 for FL', () => {
  expect(getSmallClaimsMax('FL')).toBe(8_000)
})
```

### DB Migration — `20260304000004_add_fl_state.sql`

```sql
-- Add FL to the state CHECK constraint
ALTER TABLE public.cases
  DROP CONSTRAINT IF EXISTS cases_state_check;

ALTER TABLE public.cases
  ADD CONSTRAINT cases_state_check
  CHECK (state IN ('TX', 'CA', 'NY', 'FL'));

-- Add FL court types to the court_type CHECK constraint
ALTER TABLE public.cases
  DROP CONSTRAINT IF EXISTS cases_court_type_check;

ALTER TABLE public.cases
  ADD CONSTRAINT cases_court_type_check
  CHECK (court_type IN (
    'jp', 'county', 'district', 'federal', 'unknown',
    'small_claims', 'limited_civil', 'unlimited_civil',
    'ny_small_claims', 'ny_civil', 'ny_supreme',
    'fl_small_claims', 'fl_county', 'fl_circuit'
  ));
```

---

## Task 2: FL Court Recommendation Engine

**Files:**
- Modify: `src/lib/rules/court-recommendation.ts`
- Create: `tests/unit/rules/court-recommendation-fl.test.ts`

### court-recommendation.ts changes

**a) Add FL amount ranges to `AmountRange`:**
```typescript
  | 'under_8k'
  | '8k_50k'
  | 'over_50k'
```

**b) Add FL court types to `CourtType`:**
```typescript
  | 'fl_small_claims'
  | 'fl_county'
  | 'fl_circuit'
```

**c) Update `state` on `CourtRecommendationInput`:**
```typescript
state?: 'TX' | 'CA' | 'NY' | 'FL'
```

**d) Update `recommendCourt()` dispatcher:**
```typescript
export function recommendCourt(input: CourtRecommendationInput): CourtRecommendation {
  if (input.state === 'FL') return recommendFloridaCourt(input)
  if (input.state === 'NY') return recommendNewYorkCourt(input)
  if (input.state === 'CA') return recommendCaliforniaCourt(input)
  return recommendTexasCourt(input)
}
```

**e) Add `recommendFloridaCourt()` function:**

```typescript
// -- Florida Rules ------------------------------------------------------------

function recommendFloridaCourt(input: CourtRecommendationInput): CourtRecommendation {
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

  // Rule 2: Family → Circuit Court
  if (disputeType === 'family') {
    return {
      recommended: 'fl_circuit',
      reasoning:
        'Family law matters are heard in Florida Circuit Court, which has exclusive jurisdiction over family cases.',
      confidence: 'high',
    }
  }

  // Rule 3: Eviction → County Court
  if (disputeType === 'landlord_tenant' && input.subType === 'eviction') {
    return {
      recommended: 'fl_county',
      reasoning:
        'Eviction proceedings are filed in Florida County Court (Fla. Stat. § 83.59).',
      confidence: 'high',
    }
  }

  // Rule 4: Real property → Circuit Court
  if (circumstances.realProperty) {
    return {
      recommended: 'fl_circuit',
      reasoning:
        'Disputes involving title to real property are heard in Florida Circuit Court.',
      confidence: 'high',
    }
  }

  // Rule 5: Diversity jurisdiction ($75K+ out-of-state)
  if (
    circumstances.outOfState &&
    (amount === 'over_50k' || amount === 'over_200k' || amount === '75k_200k')
  ) {
    return {
      recommended: 'federal',
      reasoning:
        'Out-of-state parties with an amount in controversy exceeding $75,000 may qualify for federal diversity jurisdiction.',
      alternativeNote:
        'You may also file in Florida Circuit Court if you prefer state court.',
      confidence: 'moderate',
    }
  }

  // Rule 6: Under $8K → Small Claims (Fla. Stat. § 34.01)
  if (amount === 'under_8k') {
    return {
      recommended: 'fl_small_claims',
      reasoning:
        'Claims up to $8,000 can be filed in Florida Small Claims Court (Fla. Stat. § 34.01).',
      confidence: 'high',
    }
  }

  // Rule 7: $8K–$50K → County Court
  if (amount === '8k_50k') {
    return {
      recommended: 'fl_county',
      reasoning:
        'Claims between $8,000 and $50,000 fall within Florida County Court jurisdiction (Fla. Stat. § 34.01).',
      confidence: 'high',
    }
  }

  // Rule 8: Over $50K → Circuit Court
  if (amount === 'over_50k' || amount === 'over_200k' || amount === '75k_200k') {
    return {
      recommended: 'fl_circuit',
      reasoning:
        'Claims exceeding $50,000 are heard in Florida Circuit Court, which has unlimited civil jurisdiction.',
      confidence: 'high',
    }
  }

  // Handle TX/CA/NY amount ranges used in FL context
  if (amount === 'under_20k' || amount === 'under_12500' || amount === 'under_10k') {
    return {
      recommended: 'fl_county',
      reasoning:
        'Claims in this range fall within Florida County Court jurisdiction.',
      confidence: 'high',
    }
  }

  if (amount === '20k_75k' || amount === '12500_35k' || amount === 'over_35k' || amount === '10k_25k' || amount === 'over_25k') {
    return {
      recommended: 'fl_circuit',
      reasoning:
        'Claims in this range are heard in Florida Circuit Court.',
      confidence: 'high',
    }
  }

  // Default → Circuit Court
  return {
    recommended: 'fl_circuit',
    reasoning:
      'Non-monetary disputes are generally heard in Florida Circuit Court, which has broad general jurisdiction.',
    confidence: 'high',
  }
}
```

### Tests (~14) — `tests/unit/rules/court-recommendation-fl.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import { recommendCourt } from '@/lib/rules/court-recommendation'

const BASE_FLAGS = { realProperty: false, outOfState: false, governmentEntity: false, federalLaw: false }

describe('recommendCourt — Florida', () => {
  it('recommends federal for federal law claims', () => {
    const result = recommendCourt({ state: 'FL', disputeType: 'contract', amount: 'under_8k', circumstances: { ...BASE_FLAGS, federalLaw: true } })
    expect(result.recommended).toBe('federal')
  })

  it('recommends fl_circuit for family', () => {
    const result = recommendCourt({ state: 'FL', disputeType: 'family', amount: 'not_money', circumstances: BASE_FLAGS })
    expect(result.recommended).toBe('fl_circuit')
  })

  it('recommends fl_county for eviction', () => {
    const result = recommendCourt({ state: 'FL', disputeType: 'landlord_tenant', amount: 'under_8k', circumstances: BASE_FLAGS, subType: 'eviction' })
    expect(result.recommended).toBe('fl_county')
  })

  it('recommends fl_circuit for real property', () => {
    const result = recommendCourt({ state: 'FL', disputeType: 'contract', amount: 'under_8k', circumstances: { ...BASE_FLAGS, realProperty: true } })
    expect(result.recommended).toBe('fl_circuit')
  })

  it('recommends fl_small_claims for under $8,000', () => {
    const result = recommendCourt({ state: 'FL', disputeType: 'contract', amount: 'under_8k', circumstances: BASE_FLAGS })
    expect(result.recommended).toBe('fl_small_claims')
  })

  it('recommends fl_county for $8,000-$50,000', () => {
    const result = recommendCourt({ state: 'FL', disputeType: 'contract', amount: '8k_50k', circumstances: BASE_FLAGS })
    expect(result.recommended).toBe('fl_county')
  })

  it('recommends fl_circuit for over $50,000', () => {
    const result = recommendCourt({ state: 'FL', disputeType: 'contract', amount: 'over_50k', circumstances: BASE_FLAGS })
    expect(result.recommended).toBe('fl_circuit')
  })

  it('recommends federal for out-of-state + high amount', () => {
    const result = recommendCourt({ state: 'FL', disputeType: 'contract', amount: 'over_50k', circumstances: { ...BASE_FLAGS, outOfState: true } })
    expect(result.recommended).toBe('federal')
    expect(result.alternativeNote).toBeTruthy()
  })

  it('recommends fl_circuit for not_money default', () => {
    const result = recommendCourt({ state: 'FL', disputeType: 'other', amount: 'not_money', circumstances: BASE_FLAGS })
    expect(result.recommended).toBe('fl_circuit')
  })

  it('FL reasoning mentions Florida', () => {
    const result = recommendCourt({ state: 'FL', disputeType: 'contract', amount: 'under_8k', circumstances: BASE_FLAGS })
    expect(result.reasoning).toContain('Florida')
  })

  it('FL small claims mentions Fla. Stat.', () => {
    const result = recommendCourt({ state: 'FL', disputeType: 'contract', amount: 'under_8k', circumstances: BASE_FLAGS })
    expect(result.reasoning).toContain('Fla. Stat.')
  })

  it('FL eviction mentions Fla. Stat.', () => {
    const result = recommendCourt({ state: 'FL', disputeType: 'landlord_tenant', amount: 'under_8k', circumstances: BASE_FLAGS, subType: 'eviction' })
    expect(result.reasoning).toContain('Fla. Stat.')
  })

  it('handles TX amount ranges gracefully in FL context', () => {
    const result = recommendCourt({ state: 'FL', disputeType: 'contract', amount: 'under_20k', circumstances: BASE_FLAGS })
    expect(['fl_small_claims', 'fl_county']).toContain(result.recommended)
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

### state-step.tsx — Add FL card

```typescript
const STATE_OPTIONS: { value: State; label: string; description: string }[] = [
  { value: 'TX', label: 'Texas', description: 'JP, County, and District courts' },
  { value: 'CA', label: 'California', description: 'Small Claims, Limited Civil, and Unlimited Civil courts' },
  { value: 'NY', label: 'New York', description: 'Small Claims, Civil, and Supreme courts' },
  { value: 'FL', label: 'Florida', description: 'Small Claims, County, and Circuit courts' },
]
```

### recommendation-step.tsx — Add FL court labels + county placeholder

Add `FL_COURT_LABELS` after `NY_COURT_LABELS`:
```typescript
const FL_COURT_LABELS: Record<string, string> = {
  fl_small_claims: 'Small Claims Court',
  fl_county: 'County Court',
  fl_circuit: 'Circuit Court',
  federal: 'Federal Court',
}
```

Update `getCourtLabels`:
```typescript
function getCourtLabels(selectedState: State): Record<string, string> {
  if (selectedState === 'FL') return FL_COURT_LABELS
  if (selectedState === 'NY') return NY_COURT_LABELS
  return selectedState === 'CA' ? CA_COURT_LABELS : TX_COURT_LABELS
}
```

Update county placeholder:
```typescript
const countyPlaceholder = selectedState === 'FL'
  ? 'e.g. Miami-Dade County'
  : selectedState === 'NY'
    ? 'e.g. Kings County'
    : selectedState === 'CA'
      ? 'e.g. Los Angeles County'
      : 'e.g. Travis County'
```

### small-claims-sub-type-step.tsx — Add FL to stateName + warning

Update `stateName`:
```typescript
const stateName = selectedState === 'FL'
  ? 'Florida'
  : selectedState === 'NY'
    ? 'New York'
    : selectedState === 'CA'
      ? 'California'
      : 'Texas'
```

Update the limit warning text — the court alternatives part:
```typescript
{selectedState === 'FL' ? 'County or Circuit' : selectedState === 'NY' ? 'Civil or Supreme' : selectedState === 'CA' ? 'Limited Civil or Unlimited Civil' : 'County or District'}
```

### new-case-dialog.tsx — Add FL branching

Add `isFL` after `isNY` (at component level ~line 278 and inside handleAccept ~line 190):
```typescript
const isFL = selectedState === 'FL'
// and inside handleAccept:
const isFL = stateCode === 'FL'
```

Update `handleAccept` court type mapping:
```typescript
const courtType =
  courtOverride ??
  (isFamily
    ? (isFL ? 'fl_circuit' : isNY ? 'ny_supreme' : isCA ? 'unlimited_civil' : 'district')
    : isSmallClaims
      ? (isFL ? 'fl_small_claims' : isNY ? 'ny_small_claims' : isCA ? 'small_claims' : 'jp')
      : isEviction
        ? (isFL ? 'fl_county' : isNY ? 'ny_civil' : isCA ? 'unlimited_civil' : 'jp')
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
const familyRecommendation = isFL
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
const smallClaimsRecommendation = isFL
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
const evictionRecommendation = isFL
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

## Task 4: FL Damages Calculator

**Files:**
- Modify: `src/lib/small-claims/damages-calculator.ts`
- Create: `tests/unit/small-claims/damages-calculator-fl.test.ts`

### damages-calculator.ts — Add FL cap

After `NY_SMALL_CLAIMS_CAP`:
```typescript
/**
 * Fla. Stat. § 34.01: Florida Small Claims Court has
 * jurisdiction over civil matters where the amount does not exceed
 * $8,000.
 */
export const FL_SMALL_CLAIMS_CAP = 8_000
```

### Tests (~6) — `tests/unit/small-claims/damages-calculator-fl.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import { calculateDamages, FL_SMALL_CLAIMS_CAP } from '@/lib/small-claims/damages-calculator'

describe('calculateDamages — Florida', () => {
  it('FL_SMALL_CLAIMS_CAP is 8000', () => {
    expect(FL_SMALL_CLAIMS_CAP).toBe(8_000)
  })

  it('uses FL cap when passed as jurisdictionCap', () => {
    const result = calculateDamages({
      items: [{ category: 'Damage', amount: 6_000 }],
      jurisdictionCap: FL_SMALL_CLAIMS_CAP,
    })
    expect(result.capAmount).toBe(8_000)
    expect(result.exceedsCap).toBe(false)
  })

  it('exceeds FL cap at 9000', () => {
    const result = calculateDamages({
      items: [{ category: 'Damage', amount: 9_000 }],
      jurisdictionCap: FL_SMALL_CLAIMS_CAP,
    })
    expect(result.exceedsCap).toBe(true)
    expect(result.overCapBy).toBe(1_000)
  })

  it('nearing FL cap at 7500', () => {
    const result = calculateDamages({
      items: [{ category: 'Damage', amount: 7_500 }],
      jurisdictionCap: FL_SMALL_CLAIMS_CAP,
    })
    expect(result.nearingCap).toBe(true)
  })

  it('not nearing FL cap at 4000', () => {
    const result = calculateDamages({
      items: [{ category: 'Damage', amount: 4_000 }],
      jurisdictionCap: FL_SMALL_CLAIMS_CAP,
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
3. State selector shows 4 cards (TX, CA, NY, FL)
4. FL court recommendation returns correct courts
5. FL damages calculator uses $8,000 cap

**Run:** `npx vitest run`
**Expected:** All tests pass (existing 1082 + ~38 new ≈ 1120)

**Run:** `npx next build`
**Expected:** Build succeeds with zero errors

---

## File Summary

| File | Action | Task |
|------|--------|------|
| `src/lib/states/types.ts` | Modify | T1 |
| `src/lib/states/fl.ts` | Create | T1 |
| `src/lib/states/index.ts` | Modify | T1 |
| `src/lib/schemas/case.ts` | Modify | T1 |
| `tests/unit/states/config.test.ts` | Modify | T1 |
| `tests/unit/schemas/case.test.ts` | Modify | T1 |
| `supabase/migrations/20260304000004_add_fl_state.sql` | Create | T1 |
| `src/lib/rules/court-recommendation.ts` | Modify | T2 |
| `tests/unit/rules/court-recommendation-fl.test.ts` | Create | T2 |
| `src/components/cases/wizard/state-step.tsx` | Modify | T3 |
| `src/components/cases/wizard/recommendation-step.tsx` | Modify | T3 |
| `src/components/cases/wizard/small-claims-sub-type-step.tsx` | Modify | T3 |
| `src/components/cases/new-case-dialog.tsx` | Modify | T3 |
| `src/lib/small-claims/damages-calculator.ts` | Modify | T4 |
| `tests/unit/small-claims/damages-calculator-fl.test.ts` | Create | T4 |

## Dependencies

```
T1 (Config + Schema + DB) → T2 (Court Rec) ← sequential foundation
                                ↓
                        T3, T4 can run in parallel
                                ↓
                           T5 (Verify)
```
