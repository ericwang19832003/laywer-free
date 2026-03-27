# California Expansion — Phase 1: Foundation

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Add the multi-state foundation (state config system, DB migration, wizard state selector, schema changes, court recommendation engine for CA) so that all subsequent phases can build on it.

**Architecture:** Hybrid approach — `StateConfig` typed objects for data (thresholds, SOL, court types), state-specific modules for complex logic. Phase 1 creates the config system, DB column, wizard step, and CA court recommendation engine. Prompt builder refactoring and CA-specific content are Phase 2+.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind, Supabase, Zod, vitest

---

## Task 1: State Config Type System (TDD)

**Files:**
- Create: `src/lib/states/types.ts`
- Create: `src/lib/states/tx.ts`
- Create: `src/lib/states/ca.ts`
- Create: `src/lib/states/index.ts`
- Create: `tests/unit/states/config.test.ts`

**State config types** (`src/lib/states/types.ts`):
```typescript
export type StateCode = 'TX' | 'CA'

export const STATE_CODES = ['TX', 'CA'] as const

export interface CourtTypeConfig {
  value: string
  label: string
  maxAmount?: number
}

export interface StateConfig {
  code: StateCode
  name: string
  abbreviation: string
  courtTypes: CourtTypeConfig[]
  federalCourtAvailable: boolean
  thresholds: {
    smallClaimsMax: number
  }
  statuteOfLimitations: {
    personalInjury: number
    writtenContract: number
    oralContract: number
    propertyDamage: number
  }
  amountRanges: {
    value: string
    label: string
    maxAmount?: number
  }[]
}
```

**Texas config** (`src/lib/states/tx.ts`):
```typescript
import type { StateConfig } from './types'

export const TX_CONFIG: StateConfig = {
  code: 'TX',
  name: 'Texas',
  abbreviation: 'TX',
  courtTypes: [
    { value: 'jp', label: 'JP Court (Small Claims)', maxAmount: 20_000 },
    { value: 'county', label: 'County Court', maxAmount: 200_000 },
    { value: 'district', label: 'District Court' },
  ],
  federalCourtAvailable: true,
  thresholds: {
    smallClaimsMax: 20_000,
  },
  statuteOfLimitations: {
    personalInjury: 2,
    writtenContract: 4,
    oralContract: 4,
    propertyDamage: 2,
  },
  amountRanges: [
    { value: 'under_20k', label: 'Under $20,000', maxAmount: 20_000 },
    { value: '20k_75k', label: '$20,000 – $75,000', maxAmount: 75_000 },
    { value: '75k_200k', label: '$75,000 – $200,000', maxAmount: 200_000 },
    { value: 'over_200k', label: 'Over $200,000' },
    { value: 'not_money', label: "It's not about money" },
  ],
}
```

**California config** (`src/lib/states/ca.ts`):
```typescript
import type { StateConfig } from './types'

export const CA_CONFIG: StateConfig = {
  code: 'CA',
  name: 'California',
  abbreviation: 'CA',
  courtTypes: [
    { value: 'small_claims', label: 'Small Claims Court', maxAmount: 12_500 },
    { value: 'limited_civil', label: 'Limited Civil Court', maxAmount: 35_000 },
    { value: 'unlimited_civil', label: 'Unlimited Civil Court' },
  ],
  federalCourtAvailable: true,
  thresholds: {
    smallClaimsMax: 12_500,
  },
  statuteOfLimitations: {
    personalInjury: 2,
    writtenContract: 4,
    oralContract: 2,
    propertyDamage: 3,
  },
  amountRanges: [
    { value: 'under_12500', label: 'Under $12,500', maxAmount: 12_500 },
    { value: '12500_35k', label: '$12,500 – $35,000', maxAmount: 35_000 },
    { value: 'over_35k', label: 'Over $35,000' },
    { value: 'not_money', label: "It's not about money" },
  ],
}
```

**Index** (`src/lib/states/index.ts`):
```typescript
import type { StateCode, StateConfig } from './types'
import { TX_CONFIG } from './tx'
import { CA_CONFIG } from './ca'

export type { StateCode, StateConfig, CourtTypeConfig } from './types'
export { STATE_CODES } from './types'

const STATE_CONFIGS: Record<StateCode, StateConfig> = {
  TX: TX_CONFIG,
  CA: CA_CONFIG,
}

export function getStateConfig(state: StateCode): StateConfig {
  return STATE_CONFIGS[state]
}

export function getCourtLabel(state: StateCode, courtType: string): string {
  const config = STATE_CONFIGS[state]
  if (courtType === 'federal') return 'Federal Court'
  const found = config.courtTypes.find((c) => c.value === courtType)
  return found?.label ?? courtType
}

export function getSmallClaimsMax(state: StateCode): number {
  return STATE_CONFIGS[state].thresholds.smallClaimsMax
}
```

**Tests** (`tests/unit/states/config.test.ts`) — 18 tests:
```typescript
import { describe, it, expect } from 'vitest'
import { getStateConfig, getCourtLabel, getSmallClaimsMax, STATE_CODES } from '@/lib/states'

describe('State Config System', () => {
  describe('STATE_CODES', () => {
    it('contains TX and CA', () => {
      expect(STATE_CODES).toContain('TX')
      expect(STATE_CODES).toContain('CA')
    })
    it('has exactly 2 entries', () => {
      expect(STATE_CODES).toHaveLength(2)
    })
  })

  describe('getStateConfig', () => {
    it('returns TX config', () => {
      const config = getStateConfig('TX')
      expect(config.code).toBe('TX')
      expect(config.name).toBe('Texas')
    })
    it('returns CA config', () => {
      const config = getStateConfig('CA')
      expect(config.code).toBe('CA')
      expect(config.name).toBe('California')
    })
    it('TX has jp, county, district court types', () => {
      const config = getStateConfig('TX')
      const values = config.courtTypes.map((c) => c.value)
      expect(values).toEqual(['jp', 'county', 'district'])
    })
    it('CA has small_claims, limited_civil, unlimited_civil court types', () => {
      const config = getStateConfig('CA')
      const values = config.courtTypes.map((c) => c.value)
      expect(values).toEqual(['small_claims', 'limited_civil', 'unlimited_civil'])
    })
    it('TX small claims max is 20000', () => {
      expect(getStateConfig('TX').thresholds.smallClaimsMax).toBe(20_000)
    })
    it('CA small claims max is 12500', () => {
      expect(getStateConfig('CA').thresholds.smallClaimsMax).toBe(12_500)
    })
    it('TX SOL personalInjury is 2', () => {
      expect(getStateConfig('TX').statuteOfLimitations.personalInjury).toBe(2)
    })
    it('CA SOL oralContract is 2', () => {
      expect(getStateConfig('CA').statuteOfLimitations.oralContract).toBe(2)
    })
    it('TX SOL oralContract is 4', () => {
      expect(getStateConfig('TX').statuteOfLimitations.oralContract).toBe(4)
    })
    it('CA SOL propertyDamage is 3', () => {
      expect(getStateConfig('CA').statuteOfLimitations.propertyDamage).toBe(3)
    })
    it('TX has 5 amount ranges', () => {
      expect(getStateConfig('TX').amountRanges).toHaveLength(5)
    })
    it('CA has 4 amount ranges', () => {
      expect(getStateConfig('CA').amountRanges).toHaveLength(4)
    })
  })

  describe('getCourtLabel', () => {
    it('returns JP Court label for TX jp', () => {
      expect(getCourtLabel('TX', 'jp')).toBe('JP Court (Small Claims)')
    })
    it('returns Small Claims Court label for CA small_claims', () => {
      expect(getCourtLabel('CA', 'small_claims')).toBe('Small Claims Court')
    })
    it('returns Federal Court for any state', () => {
      expect(getCourtLabel('TX', 'federal')).toBe('Federal Court')
      expect(getCourtLabel('CA', 'federal')).toBe('Federal Court')
    })
    it('returns raw value for unknown court type', () => {
      expect(getCourtLabel('TX', 'supreme')).toBe('supreme')
    })
  })

  describe('getSmallClaimsMax', () => {
    it('returns 20000 for TX', () => {
      expect(getSmallClaimsMax('TX')).toBe(20_000)
    })
    it('returns 12500 for CA', () => {
      expect(getSmallClaimsMax('CA')).toBe(12_500)
    })
  })
})
```

Run: `npx vitest run tests/unit/states/config.test.ts`
Expected: 18 tests pass.

---

## Task 2: CA Court Recommendation Engine (TDD)

**Files:**
- Modify: `src/lib/rules/court-recommendation.ts`
- Create: `tests/unit/rules/court-recommendation-ca.test.ts`

**Changes to `court-recommendation.ts`:**

1. Add CA court types to `CourtType`:
```typescript
export type CourtType = 'jp' | 'county' | 'district' | 'federal' | 'small_claims' | 'limited_civil' | 'unlimited_civil'
```

2. Add `state` field to `CourtRecommendationInput`:
```typescript
export interface CourtRecommendationInput {
  disputeType: DisputeType
  amount: AmountRange
  circumstances: CircumstanceFlags
  subType?: string
  state?: 'TX' | 'CA'  // defaults to 'TX' for backward compatibility
}
```

3. Add new `AmountRange` values for CA:
```typescript
export type AmountRange =
  | 'under_20k'
  | '20k_75k'
  | '75k_200k'
  | 'over_200k'
  | 'under_12500'
  | '12500_35k'
  | 'over_35k'
  | 'not_money'
```

4. Add `recommendCaliforniaCourt` function and update `recommendCourt` to dispatch:
```typescript
export function recommendCourt(input: CourtRecommendationInput): CourtRecommendation {
  if (input.state === 'CA') return recommendCaliforniaCourt(input)
  // ... existing TX logic unchanged ...
}

function recommendCaliforniaCourt(input: CourtRecommendationInput): CourtRecommendation {
  const { disputeType, amount, circumstances } = input

  // Rule 1: Federal law
  if (circumstances.federalLaw) {
    return {
      recommended: 'federal',
      reasoning: 'This dispute involves a federal law claim, which falls under exclusive federal jurisdiction.',
      confidence: 'high',
    }
  }

  // Rule 2: Family — Superior Court (Unlimited Civil)
  if (disputeType === 'family') {
    return {
      recommended: 'unlimited_civil',
      reasoning: 'Family law matters are heard in California Superior Court (Unlimited Civil division).',
      confidence: 'high',
    }
  }

  // Rule 3: Eviction — always Unlimited Civil (unlawful detainer)
  if (disputeType === 'landlord_tenant' && input.subType === 'eviction') {
    return {
      recommended: 'unlimited_civil',
      reasoning: 'Unlawful detainer (eviction) cases are heard in California Superior Court regardless of the amount involved.',
      confidence: 'high',
    }
  }

  // Rule 4: Real property — Unlimited Civil
  if (circumstances.realProperty) {
    return {
      recommended: 'unlimited_civil',
      reasoning: 'Disputes involving title to real property are heard in Superior Court (Unlimited Civil division).',
      confidence: 'high',
    }
  }

  // Rule 5: Diversity jurisdiction
  if (circumstances.outOfState && (amount === 'over_35k' || amount === '75k_200k' || amount === 'over_200k')) {
    return {
      recommended: 'federal',
      reasoning: 'Out-of-state parties with an amount in controversy exceeding $75,000 may qualify for federal diversity jurisdiction.',
      alternativeNote: 'You may also file in California Superior Court if you prefer state court.',
      confidence: 'moderate',
    }
  }

  // Rule 6: Small Claims — up to $12,500
  if (amount === 'under_12500') {
    return {
      recommended: 'small_claims',
      reasoning: 'Claims up to $12,500 for individuals can be filed in California Small Claims Court (Code Civ. Proc. § 116.221).',
      confidence: 'high',
    }
  }

  // Rule 7: Limited Civil — $12,501 to $35,000
  if (amount === '12500_35k') {
    return {
      recommended: 'limited_civil',
      reasoning: 'Claims between $12,500 and $35,000 fall within Limited Civil jurisdiction in California Superior Court (Code Civ. Proc. § 85).',
      confidence: 'high',
    }
  }

  // Rule 8: Unlimited Civil — over $35,000
  if (amount === 'over_35k' || amount === 'over_200k' || amount === '75k_200k') {
    return {
      recommended: 'unlimited_civil',
      reasoning: 'Claims exceeding $35,000 are heard in California Superior Court (Unlimited Civil division).',
      confidence: 'high',
    }
  }

  // For TX amount ranges used in CA context, map appropriately
  if (amount === 'under_20k') {
    return {
      recommended: 'limited_civil',
      reasoning: 'Claims in this range fall within Limited Civil jurisdiction in California Superior Court.',
      confidence: 'high',
    }
  }

  if (amount === '20k_75k') {
    return {
      recommended: 'unlimited_civil',
      reasoning: 'Claims exceeding $35,000 are heard in California Superior Court (Unlimited Civil division).',
      confidence: 'high',
    }
  }

  // Default — Unlimited Civil
  return {
    recommended: 'unlimited_civil',
    reasoning: 'Non-monetary disputes are generally heard in California Superior Court (Unlimited Civil division).',
    confidence: 'high',
  }
}
```

**Tests** (`tests/unit/rules/court-recommendation-ca.test.ts`) — 14 tests:
```typescript
import { describe, it, expect } from 'vitest'
import { recommendCourt } from '@/lib/rules/court-recommendation'

const BASE_FLAGS = { realProperty: false, outOfState: false, governmentEntity: false, federalLaw: false }

describe('recommendCourt — California', () => {
  it('recommends federal for federal law claims', () => {
    const result = recommendCourt({ state: 'CA', disputeType: 'contract', amount: 'under_12500', circumstances: { ...BASE_FLAGS, federalLaw: true } })
    expect(result.recommended).toBe('federal')
  })

  it('recommends unlimited_civil for family', () => {
    const result = recommendCourt({ state: 'CA', disputeType: 'family', amount: 'not_money', circumstances: BASE_FLAGS })
    expect(result.recommended).toBe('unlimited_civil')
  })

  it('recommends unlimited_civil for eviction', () => {
    const result = recommendCourt({ state: 'CA', disputeType: 'landlord_tenant', amount: 'under_12500', circumstances: BASE_FLAGS, subType: 'eviction' })
    expect(result.recommended).toBe('unlimited_civil')
  })

  it('recommends unlimited_civil for real property', () => {
    const result = recommendCourt({ state: 'CA', disputeType: 'contract', amount: 'under_12500', circumstances: { ...BASE_FLAGS, realProperty: true } })
    expect(result.recommended).toBe('unlimited_civil')
  })

  it('recommends small_claims for under $12,500', () => {
    const result = recommendCourt({ state: 'CA', disputeType: 'contract', amount: 'under_12500', circumstances: BASE_FLAGS })
    expect(result.recommended).toBe('small_claims')
  })

  it('recommends limited_civil for $12,500-$35,000', () => {
    const result = recommendCourt({ state: 'CA', disputeType: 'contract', amount: '12500_35k', circumstances: BASE_FLAGS })
    expect(result.recommended).toBe('limited_civil')
  })

  it('recommends unlimited_civil for over $35,000', () => {
    const result = recommendCourt({ state: 'CA', disputeType: 'contract', amount: 'over_35k', circumstances: BASE_FLAGS })
    expect(result.recommended).toBe('unlimited_civil')
  })

  it('recommends federal for out-of-state + high amount', () => {
    const result = recommendCourt({ state: 'CA', disputeType: 'contract', amount: 'over_35k', circumstances: { ...BASE_FLAGS, outOfState: true } })
    expect(result.recommended).toBe('federal')
    expect(result.alternativeNote).toBeTruthy()
  })

  it('recommends unlimited_civil for not_money default', () => {
    const result = recommendCourt({ state: 'CA', disputeType: 'other', amount: 'not_money', circumstances: BASE_FLAGS })
    expect(result.recommended).toBe('unlimited_civil')
  })

  // Backward compatibility: no state defaults to TX behavior
  it('defaults to TX when state is omitted', () => {
    const result = recommendCourt({ disputeType: 'contract', amount: 'under_20k', circumstances: BASE_FLAGS })
    expect(result.recommended).toBe('jp')
  })

  it('CA reasoning mentions California', () => {
    const result = recommendCourt({ state: 'CA', disputeType: 'contract', amount: 'under_12500', circumstances: BASE_FLAGS })
    expect(result.reasoning).toContain('California')
  })

  it('CA small claims mentions Code Civ. Proc.', () => {
    const result = recommendCourt({ state: 'CA', disputeType: 'contract', amount: 'under_12500', circumstances: BASE_FLAGS })
    expect(result.reasoning).toContain('Code Civ. Proc.')
  })

  it('handles TX amount ranges gracefully in CA context', () => {
    const result = recommendCourt({ state: 'CA', disputeType: 'contract', amount: 'under_20k', circumstances: BASE_FLAGS })
    expect(['small_claims', 'limited_civil']).toContain(result.recommended)
  })

  it('does not affect existing TX tests', () => {
    const result = recommendCourt({ disputeType: 'family', amount: 'not_money', circumstances: BASE_FLAGS })
    expect(result.recommended).toBe('district')
  })
})
```

Run: `npx vitest run tests/unit/rules/court-recommendation-ca.test.ts`
Expected: 14 tests pass.

Also run existing tests: `npx vitest run tests/unit/rules/court-recommendation.test.ts`
Expected: All existing TX tests still pass (backward compatible).

---

## Task 3: Schema Changes (TDD)

**Files:**
- Modify: `src/lib/schemas/case.ts`
- Modify: `tests/unit/schemas/case.test.ts`

**Changes to `src/lib/schemas/case.ts`:**

1. Add `STATE_CODES` import and CA court types:
```typescript
export const STATES = ['TX', 'CA'] as const
export type State = (typeof STATES)[number]

export const CA_COURT_TYPES = ['small_claims', 'limited_civil', 'unlimited_civil', 'federal', 'unknown'] as const
export const TX_COURT_TYPES = ['jp', 'county', 'district', 'federal', 'unknown'] as const
export const ALL_COURT_TYPES = ['jp', 'county', 'district', 'small_claims', 'limited_civil', 'unlimited_civil', 'federal', 'unknown'] as const
```

2. Update `createCaseSchema`:
```typescript
export const createCaseSchema = z.object({
  state: z.enum(STATES).optional().default('TX'),
  role: z.enum(['plaintiff', 'defendant']),
  county: z.string().optional(),
  court_type: z.enum(ALL_COURT_TYPES).optional().default('unknown'),
  dispute_type: z.enum(DISPUTE_TYPES).optional(),
  family_sub_type: z.enum(FAMILY_SUB_TYPES).optional(),
  small_claims_sub_type: z.enum(SMALL_CLAIMS_SUB_TYPES).optional(),
  landlord_tenant_sub_type: z.enum(LANDLORD_TENANT_SUB_TYPES).optional(),
  debt_sub_type: z.enum(DEBT_SUB_TYPES).optional(),
  pi_sub_type: z.enum(PI_SUB_TYPES).optional(),
})
```

**New tests in `tests/unit/schemas/case.test.ts`:**
```typescript
// Add after existing tests:

it('defaults state to TX', () => {
  const result = createCaseSchema.safeParse({ role: 'plaintiff' })
  if (result.success) {
    expect(result.data.state).toBe('TX')
  }
})

it('accepts CA as state', () => {
  const result = createCaseSchema.safeParse({ role: 'plaintiff', state: 'CA' })
  expect(result.success).toBe(true)
  if (result.success) {
    expect(result.data.state).toBe('CA')
  }
})

it('rejects invalid state', () => {
  const result = createCaseSchema.safeParse({ role: 'plaintiff', state: 'NY' })
  expect(result.success).toBe(false)
})

it('accepts CA court types', () => {
  for (const ct of ['small_claims', 'limited_civil', 'unlimited_civil']) {
    const result = createCaseSchema.safeParse({ role: 'plaintiff', court_type: ct })
    expect(result.success).toBe(true)
  }
})

it('accepts CA state with CA court type', () => {
  const result = createCaseSchema.safeParse({
    role: 'plaintiff',
    state: 'CA',
    court_type: 'small_claims',
    dispute_type: 'small_claims',
  })
  expect(result.success).toBe(true)
})
```

Run: `npx vitest run tests/unit/schemas/case.test.ts`
Expected: All 15 existing + 5 new = 20 tests pass.

---

## Task 4: Database Migration

**Files:**
- Create: `supabase/migrations/20260304000002_add_state_column.sql`

```sql
-- Add state column to cases table
-- Defaults to 'TX' so all existing cases are automatically Texas
ALTER TABLE public.cases
  ADD COLUMN IF NOT EXISTS state text NOT NULL DEFAULT 'TX';

-- Add CHECK constraint for valid states
ALTER TABLE public.cases
  ADD CONSTRAINT cases_state_check
  CHECK (state IN ('TX', 'CA'));

-- Expand court_type to include CA court types
ALTER TABLE public.cases
  DROP CONSTRAINT IF EXISTS cases_court_type_check;

ALTER TABLE public.cases
  ADD CONSTRAINT cases_court_type_check
  CHECK (court_type IN (
    'jp', 'county', 'district', 'federal', 'unknown',
    'small_claims', 'limited_civil', 'unlimited_civil'
  ));

-- Index for state-filtered queries
CREATE INDEX IF NOT EXISTS idx_cases_state ON public.cases(state);

-- Backfill existing rows (safety measure, default handles it)
UPDATE public.cases SET state = 'TX' WHERE state IS NULL;
```

Run: `npx supabase db push` to apply.
Expected: Migration applies cleanly.

---

## Task 5: API Route — Accept State Field

**Files:**
- Modify: `src/app/api/cases/route.ts`

**Changes to POST handler:**

1. Add `state` to destructuring on line 20:
```typescript
const { role, county, court_type, dispute_type, family_sub_type, small_claims_sub_type, landlord_tenant_sub_type, debt_sub_type, pi_sub_type, state } = parsed.data
```

2. Add `state` to the insert on line 25-31:
```typescript
const { data: newCase, error: caseError } = await supabase!
  .from('cases')
  .insert({
    user_id: user!.id,
    role,
    county,
    court_type,
    dispute_type,
    state,
  })
  .select()
  .single()
```

No other changes needed — the schema already validates `state` (Task 3), and `state` has a default so no existing API callers break.

---

## Task 6: State Selection Wizard Step

**Files:**
- Create: `src/components/cases/wizard/state-step.tsx`
- Modify: `src/components/cases/new-case-dialog.tsx`

**State step component** (`src/components/cases/wizard/state-step.tsx`):
```typescript
'use client'

import { MapPin } from 'lucide-react'
import type { State } from '@/lib/schemas/case'

const STATE_OPTIONS: { value: State; label: string; description: string }[] = [
  {
    value: 'TX',
    label: 'Texas',
    description: 'All Texas state courts — JP, County, and District',
  },
  {
    value: 'CA',
    label: 'California',
    description: 'All California courts — Small Claims, Limited Civil, and Unlimited Civil',
  },
]

interface StateStepProps {
  value: State | ''
  onSelect: (state: State) => void
}

export function StateStep({ value, onSelect }: StateStepProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-warm-text">
        Which state is your case in?
      </p>
      <div className="space-y-2">
        {STATE_OPTIONS.map((opt) => {
          const selected = value === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSelect(opt.value)}
              className={`w-full rounded-md border px-4 py-3 text-left transition-colors flex items-start gap-3 ${
                selected
                  ? 'border-primary bg-primary/5'
                  : 'border-warm-border hover:border-warm-text'
              }`}
            >
              <MapPin
                className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                  selected ? 'text-primary' : 'text-warm-muted'
                }`}
              />
              <div>
                <span className="font-medium text-warm-text text-sm">
                  {opt.label}
                </span>
                <span className="block text-xs mt-0.5 text-warm-muted">
                  {opt.description}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
```

**Changes to `new-case-dialog.tsx`:**

1. Add imports:
```typescript
import { StateStep } from './wizard/state-step'
import type { State } from '@/lib/schemas/case'
import { getStateConfig } from '@/lib/states'
```

2. Add `state` to `WizardState` (after line 60):
```typescript
interface WizardState {
  step: number
  selectedState: State | ''
  role: 'plaintiff' | 'defendant' | ''
  // ... rest unchanged
}
```

3. Add `SET_STATE` action (after line 73):
```typescript
type WizardAction =
  | { type: 'SET_STATE'; state: State }
  | { type: 'SET_ROLE'; role: 'plaintiff' | 'defendant' }
  // ... rest unchanged
```

4. Add `selectedState: ''` to `initialState` (after line 89).

5. Add reducer case for `SET_STATE`:
```typescript
case 'SET_STATE':
  return { ...state, selectedState: action.state, step: 2 }
```

6. Shift all existing step numbers up by 1 (state is step 1, role becomes step 2, dispute type becomes step 3, etc.).

7. Update `getTotalSteps` to add 1 to all return values.

8. Update `handleAccept` to use state-aware court routing:
   - CA family → `'unlimited_civil'` (not `'district'`)
   - CA small claims → `'small_claims'` (not `'jp'`)
   - CA eviction → `'unlimited_civil'` (not `'jp'`)
   - Pass `state` to `recommendCourt()` calls

9. Add `state` to the POST body:
```typescript
body: JSON.stringify({
  state: state.selectedState || 'TX',
  role: state.role,
  court_type: courtType,
  // ... rest unchanged
})
```

10. Render state step at step 1:
```typescript
{state.step === 1 && (
  <StateStep
    value={state.selectedState}
    onSelect={(s) => dispatch({ type: 'SET_STATE', state: s })}
  />
)}
```

11. Update hardcoded recommendations to be state-aware:
```typescript
const familyRecommendation = {
  recommended: (state.selectedState === 'CA' ? 'unlimited_civil' : 'district') as CourtType,
  reasoning: state.selectedState === 'CA'
    ? 'Family law cases are heard in California Superior Court.'
    : 'Family law cases are filed in District Court.',
  confidence: 'high' as const,
}

const smallClaimsRecommendation = {
  recommended: (state.selectedState === 'CA' ? 'small_claims' : 'jp') as CourtType,
  reasoning: state.selectedState === 'CA'
    ? 'Small claims cases are filed in California Small Claims Court.'
    : 'Small claims cases are filed in Justice of the Peace (JP) Court.',
  confidence: 'high' as const,
}

const evictionRecommendation = {
  recommended: (state.selectedState === 'CA' ? 'unlimited_civil' : 'jp') as CourtType,
  reasoning: state.selectedState === 'CA'
    ? 'Unlawful detainer (eviction) cases are heard in California Superior Court.'
    : 'Eviction cases are filed in Justice of the Peace (JP) Court.',
  confidence: 'high' as const,
}
```

---

## Task 7: State-Aware Recommendation Step

**Files:**
- Modify: `src/components/cases/wizard/recommendation-step.tsx`

**Changes:**

1. Add props for state-aware court labels and override options:
```typescript
import type { State } from '@/lib/schemas/case'
import { getStateConfig } from '@/lib/states'

interface RecommendationStepProps {
  recommendation: CourtRecommendation
  county: string
  onCountyChange: (county: string) => void
  onAccept: (courtOverride: string | null) => void
  loading: boolean
  selectedState?: State  // new optional prop
}
```

2. Make `COURT_LABELS` dynamic:
```typescript
function getCourtLabels(selectedState?: State): Record<string, string> {
  if (selectedState === 'CA') {
    return {
      small_claims: 'Small Claims Court',
      limited_civil: 'Limited Civil Court',
      unlimited_civil: 'Unlimited Civil Court',
      federal: 'Federal Court',
    }
  }
  return {
    jp: 'JP Court (Small Claims)',
    county: 'County Court',
    district: 'District Court',
    federal: 'Federal Court',
  }
}
```

3. Use dynamic labels and override options in the component:
```typescript
const courtLabels = getCourtLabels(selectedState)
// In override select, render options from courtLabels
<SelectContent>
  {Object.entries(courtLabels).map(([value, label]) => (
    <SelectItem key={value} value={value}>{label}</SelectItem>
  ))}
</SelectContent>
```

4. Update county placeholder based on state:
```typescript
placeholder={selectedState === 'CA' ? 'e.g. Los Angeles County' : 'e.g. Travis County'}
```

---

## Task 8: State-Aware Small Claims Sub-Type Step

**Files:**
- Modify: `src/components/cases/wizard/small-claims-sub-type-step.tsx`

**Changes:**

1. Add `selectedState` prop:
```typescript
import type { State } from '@/lib/schemas/case'
import { getSmallClaimsMax } from '@/lib/states'

interface SmallClaimsSubTypeStepProps {
  value: SmallClaimsSubType | ''
  onSelect: (subType: SmallClaimsSubType) => void
  selectedState?: State
}
```

2. Update the warning callout at the bottom:
```typescript
const limit = getSmallClaimsMax(selectedState ?? 'TX')
const limitFormatted = `$${limit.toLocaleString()}`

// In JSX:
<div className="rounded-md border border-calm-amber bg-calm-amber/5 px-4 py-3">
  <p className="text-xs font-medium text-calm-amber leading-relaxed">
    {selectedState === 'CA'
      ? `California small claims limit: ${limitFormatted}. If your claim is for more than ${limitFormatted}, you may need to file in Limited Civil or Unlimited Civil Court instead.`
      : `Texas small claims limit: ${limitFormatted}. If your claim is for more than ${limitFormatted}, you may need to file in County or District Court instead.`}
  </p>
</div>
```

3. Update the "other" option description dynamically:
```typescript
{
  value: 'other',
  label: 'Other Small Claim',
  description: `Another type of claim under ${limitFormatted}`,
  icon: HelpCircle,
}
```

Note: Since the options array references `limitFormatted`, move it inside the component or make it a function.

---

## Task 9: State-Aware Dispute Type Step

**Files:**
- Modify: `src/components/cases/wizard/dispute-type-step.tsx`

**Changes:**

1. Add `selectedState` prop:
```typescript
import type { State } from '@/lib/schemas/case'
import { getSmallClaimsMax } from '@/lib/states'

interface DisputeTypeStepProps {
  value: DisputeType | ''
  onSelect: (type: DisputeType) => void
  selectedState?: State
}
```

2. Make the small claims description state-aware:
```typescript
const limit = getSmallClaimsMax(selectedState ?? 'TX')
const limitFormatted = `$${limit.toLocaleString()}`

// Update the small_claims option:
{ value: 'small_claims', label: 'Small claim', description: `Dispute under ${limitFormatted} — deposit, refund, loan, etc.` },
```

3. Pass `selectedState` in parent `new-case-dialog.tsx`:
```typescript
<DisputeTypeStep
  value={state.disputeType}
  selectedState={state.selectedState || undefined}
  onSelect={(disputeType) => dispatch({ type: 'SET_DISPUTE_TYPE', disputeType })}
/>
```

---

## Task 10: State-Aware Amount Step

**Files:**
- Modify: `src/components/cases/wizard/amount-step.tsx`

Read the current file first to understand the structure. The amount options are currently hardcoded with TX-specific labels ($20K, $75K, $200K). Add state-awareness:

1. Add `selectedState` prop and import `getStateConfig`
2. Use `stateConfig.amountRanges` to render options dynamically
3. For TX, show existing ranges. For CA, show `under_12500`, `12500_35k`, `over_35k`, `not_money`

---

## Task 11: Pass `selectedState` Through All Wizard Steps

**Files:**
- Modify: `src/components/cases/new-case-dialog.tsx`

Wire the `selectedState` prop into all child components that need it:
- `DisputeTypeStep` — for small claims description
- `SmallClaimsSubTypeStep` — for limit warning
- `AmountStep` — for state-specific ranges
- `RecommendationStep` — for court labels and override options
- All `recommendCourt()` calls — pass `state: state.selectedState || 'TX'`

This is mostly threading props that were added in Tasks 6-10.

---

## Task 12: Damages Calculator — State-Aware Cap

**Files:**
- Modify: `src/lib/small-claims/damages-calculator.ts`
- Create: `tests/unit/small-claims/damages-calculator-ca.test.ts`

**Changes to `damages-calculator.ts`:**

1. Add CA constant:
```typescript
export const CA_SMALL_CLAIMS_CAP = 12_500
```

2. No other changes needed — the calculator already accepts `jurisdictionCap` as an optional parameter. Components just need to pass the right cap based on state.

**Tests** (`tests/unit/small-claims/damages-calculator-ca.test.ts`) — 6 tests:
```typescript
import { describe, it, expect } from 'vitest'
import { calculateDamages, CA_SMALL_CLAIMS_CAP } from '@/lib/small-claims/damages-calculator'

describe('calculateDamages — California', () => {
  it('CA_SMALL_CLAIMS_CAP is 12500', () => {
    expect(CA_SMALL_CLAIMS_CAP).toBe(12_500)
  })

  it('uses CA cap when passed as jurisdictionCap', () => {
    const result = calculateDamages({
      items: [{ category: 'Damage', amount: 10_000 }],
      jurisdictionCap: CA_SMALL_CLAIMS_CAP,
    })
    expect(result.capAmount).toBe(12_500)
    expect(result.exceedsCap).toBe(false)
  })

  it('exceeds CA cap at 13000', () => {
    const result = calculateDamages({
      items: [{ category: 'Damage', amount: 13_000 }],
      jurisdictionCap: CA_SMALL_CLAIMS_CAP,
    })
    expect(result.exceedsCap).toBe(true)
    expect(result.overCapBy).toBe(500)
  })

  it('nearing CA cap at 11500', () => {
    const result = calculateDamages({
      items: [{ category: 'Damage', amount: 11_500 }],
      jurisdictionCap: CA_SMALL_CLAIMS_CAP,
    })
    expect(result.nearingCap).toBe(true)
  })

  it('not nearing CA cap at 8000', () => {
    const result = calculateDamages({
      items: [{ category: 'Damage', amount: 8_000 }],
      jurisdictionCap: CA_SMALL_CLAIMS_CAP,
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

Run: `npx vitest run tests/unit/small-claims/damages-calculator-ca.test.ts`
Expected: 6 tests pass.

---

## Task 13: Build & Full Test Verification

1. Run all tests:
```bash
npx vitest run
```
Expected: All existing tests + ~43 new tests pass.

2. Run build:
```bash
npx next build
```
Expected: Zero type errors, clean build.

3. Verify:
   - State step appears as first wizard step
   - Selecting TX shows existing TX court types in recommendation
   - Selecting CA shows CA court types (small_claims, limited_civil, unlimited_civil)
   - Small claims limit shows $12,500 for CA, $20,000 for TX
   - Amount ranges differ by state
   - `state` column saved to DB correctly
   - Existing TX cases unaffected (default 'TX')

---

## File Summary

| File | Action | Task |
|------|--------|------|
| `src/lib/states/types.ts` | Create | 1 |
| `src/lib/states/tx.ts` | Create | 1 |
| `src/lib/states/ca.ts` | Create | 1 |
| `src/lib/states/index.ts` | Create | 1 |
| `tests/unit/states/config.test.ts` | Create | 1 |
| `src/lib/rules/court-recommendation.ts` | Modify | 2 |
| `tests/unit/rules/court-recommendation-ca.test.ts` | Create | 2 |
| `src/lib/schemas/case.ts` | Modify | 3 |
| `tests/unit/schemas/case.test.ts` | Modify | 3 |
| `supabase/migrations/20260304000002_add_state_column.sql` | Create | 4 |
| `src/app/api/cases/route.ts` | Modify | 5 |
| `src/components/cases/wizard/state-step.tsx` | Create | 6 |
| `src/components/cases/new-case-dialog.tsx` | Modify | 6, 11 |
| `src/components/cases/wizard/recommendation-step.tsx` | Modify | 7 |
| `src/components/cases/wizard/small-claims-sub-type-step.tsx` | Modify | 8 |
| `src/components/cases/wizard/dispute-type-step.tsx` | Modify | 9 |
| `src/components/cases/wizard/amount-step.tsx` | Modify | 10 |
| `src/lib/small-claims/damages-calculator.ts` | Modify | 12 |
| `tests/unit/small-claims/damages-calculator-ca.test.ts` | Create | 12 |

## What Phase 1 Enables

After Phase 1, the foundation is in place:
- Users can select Texas or California when creating a case
- Court routing works correctly for both states
- The `state` column exists in the DB for all downstream queries
- `StateConfig` system is available for prompt builders to consume in Phase 2
- Amount ranges, thresholds, and court labels are state-aware

Phase 2 will refactor prompt builders to accept `stateConfig` and create CA-specific prompt modules for family law, landlord-tenant, and debt defense.
