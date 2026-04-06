# Court Selection Wizard — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the new-case dialog with a 5-step guided wizard that recommends the right court level (JP, County, District, Federal) based on dispute type, amount, and special circumstances.

**Architecture:** Pure deterministic recommendation engine (`court-recommendation.ts`) with no API/AI calls. Wizard UI is a `useReducer`-driven multi-step form inside the existing Dialog component. Steps extracted into `src/components/cases/wizard/` sub-components. One migration adds `'federal'` to the court_type CHECK constraint.

**Tech Stack:** Next.js 15, React 19, TypeScript, Zod, Supabase, Vitest, Testing Library

**Design doc:** `docs/plans/2026-03-01-court-selection-wizard-design.md`

---

### Task 1: Migration — Add `federal` to court_type CHECK

**Files:**
- Create: `supabase/migrations/20260301000001_court_type_federal.sql`

**Step 1: Write the migration**

```sql
-- Add 'federal' as a valid court_type
ALTER TABLE public.cases
  DROP CONSTRAINT IF EXISTS cases_court_type_check;

ALTER TABLE public.cases
  ADD CONSTRAINT cases_court_type_check
  CHECK (court_type IN ('jp', 'county', 'district', 'federal', 'unknown'));
```

**Step 2: Commit**

```bash
git add supabase/migrations/20260301000001_court_type_federal.sql
git commit -m "feat: add federal to court_type CHECK constraint"
```

---

### Task 2: Court Recommendation Engine — Types & Tests

**Files:**
- Create: `src/lib/rules/court-recommendation.ts`
- Create: `tests/unit/rules/court-recommendation.test.ts`

**Step 1: Write the type definitions**

In `src/lib/rules/court-recommendation.ts`:

```typescript
export type DisputeType =
  | 'debt_collection'
  | 'landlord_tenant'
  | 'personal_injury'
  | 'contract'
  | 'property'
  | 'family'
  | 'other'

export type AmountRange =
  | 'under_20k'
  | '20k_75k'
  | '75k_200k'
  | 'over_200k'
  | 'not_money'

export type CourtType = 'jp' | 'county' | 'district' | 'federal'

export interface CircumstanceFlags {
  realProperty: boolean
  outOfState: boolean
  governmentEntity: boolean
  federalLaw: boolean
}

export interface CourtRecommendationInput {
  disputeType: DisputeType
  amount: AmountRange
  circumstances: CircumstanceFlags
}

export interface CourtRecommendation {
  recommended: CourtType
  reasoning: string
  alternativeNote?: string
  confidence: 'high' | 'moderate'
}
```

Export a stub function that throws:

```typescript
export function recommendCourt(_input: CourtRecommendationInput): CourtRecommendation {
  throw new Error('Not implemented')
}
```

**Step 2: Write the failing tests**

In `tests/unit/rules/court-recommendation.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import {
  recommendCourt,
  type CourtRecommendationInput,
  type CircumstanceFlags,
} from '@/lib/rules/court-recommendation'

const NO_CIRCUMSTANCES: CircumstanceFlags = {
  realProperty: false,
  outOfState: false,
  governmentEntity: false,
  federalLaw: false,
}

function makeInput(overrides: Partial<CourtRecommendationInput> = {}): CourtRecommendationInput {
  return {
    disputeType: 'contract',
    amount: 'under_20k',
    circumstances: NO_CIRCUMSTANCES,
    ...overrides,
  }
}

describe('recommendCourt', () => {
  // ── Federal law → federal (highest priority) ──────────────
  it('recommends federal when federalLaw is true', () => {
    const result = recommendCourt(
      makeInput({ circumstances: { ...NO_CIRCUMSTANCES, federalLaw: true } })
    )
    expect(result.recommended).toBe('federal')
    expect(result.confidence).toBe('high')
  })

  it('recommends federal even when amount is small and federalLaw is true', () => {
    const result = recommendCourt(
      makeInput({
        amount: 'under_20k',
        circumstances: { ...NO_CIRCUMSTANCES, federalLaw: true },
      })
    )
    expect(result.recommended).toBe('federal')
  })

  // ── Family → district (exclusive jurisdiction) ────────────
  it('recommends district for family disputes', () => {
    const result = recommendCourt(
      makeInput({ disputeType: 'family', amount: 'not_money' })
    )
    expect(result.recommended).toBe('district')
    expect(result.confidence).toBe('high')
  })

  it('recommends district for family even with small amount', () => {
    const result = recommendCourt(
      makeInput({ disputeType: 'family', amount: 'under_20k' })
    )
    expect(result.recommended).toBe('district')
  })

  // ── Real property → district ──────────────────────────────
  it('recommends district when realProperty is true', () => {
    const result = recommendCourt(
      makeInput({
        amount: 'under_20k',
        circumstances: { ...NO_CIRCUMSTANCES, realProperty: true },
      })
    )
    expect(result.recommended).toBe('district')
    expect(result.confidence).toBe('high')
  })

  // ── Out-of-state + >$75K → federal with district note ─────
  it('recommends federal when outOfState and amount over 75k', () => {
    const result = recommendCourt(
      makeInput({
        amount: '75k_200k',
        circumstances: { ...NO_CIRCUMSTANCES, outOfState: true },
      })
    )
    expect(result.recommended).toBe('federal')
    expect(result.alternativeNote).toBeDefined()
    expect(result.confidence).toBe('moderate')
  })

  it('recommends federal when outOfState and amount over 200k', () => {
    const result = recommendCourt(
      makeInput({
        amount: 'over_200k',
        circumstances: { ...NO_CIRCUMSTANCES, outOfState: true },
      })
    )
    expect(result.recommended).toBe('federal')
  })

  it('does NOT recommend federal when outOfState but amount under 75k', () => {
    const result = recommendCourt(
      makeInput({
        amount: 'under_20k',
        circumstances: { ...NO_CIRCUMSTANCES, outOfState: true },
      })
    )
    expect(result.recommended).toBe('jp')
  })

  // ── Amount-based: JP ≤20k ─────────────────────────────────
  it('recommends jp for amount under 20k', () => {
    const result = recommendCourt(makeInput({ amount: 'under_20k' }))
    expect(result.recommended).toBe('jp')
    expect(result.confidence).toBe('high')
  })

  // ── Amount-based: County 20k–200k ─────────────────────────
  it('recommends county for amount 20k-75k', () => {
    const result = recommendCourt(makeInput({ amount: '20k_75k' }))
    expect(result.recommended).toBe('county')
    expect(result.confidence).toBe('high')
  })

  it('recommends county for amount 75k-200k without out-of-state', () => {
    const result = recommendCourt(makeInput({ amount: '75k_200k' }))
    expect(result.recommended).toBe('county')
    expect(result.confidence).toBe('high')
  })

  // ── Amount-based: District >200k ──────────────────────────
  it('recommends district for amount over 200k', () => {
    const result = recommendCourt(makeInput({ amount: 'over_200k' }))
    expect(result.recommended).toBe('district')
    expect(result.confidence).toBe('high')
  })

  // ── Not about money → district ────────────────────────────
  it('recommends district when not about money', () => {
    const result = recommendCourt(makeInput({ amount: 'not_money' }))
    expect(result.recommended).toBe('district')
    expect(result.confidence).toBe('high')
  })

  // ── Priority ordering tests ───────────────────────────────
  it('federal law overrides family dispute type', () => {
    const result = recommendCourt(
      makeInput({
        disputeType: 'family',
        circumstances: { ...NO_CIRCUMSTANCES, federalLaw: true },
      })
    )
    expect(result.recommended).toBe('federal')
  })

  it('family overrides real property', () => {
    const result = recommendCourt(
      makeInput({
        disputeType: 'family',
        amount: 'under_20k',
        circumstances: { ...NO_CIRCUMSTANCES, realProperty: true },
      })
    )
    expect(result.recommended).toBe('district')
    expect(result.reasoning).toContain('family')
  })

  // ── Reasoning contains useful text ────────────────────────
  it('includes reasoning text for every recommendation', () => {
    const result = recommendCourt(makeInput())
    expect(result.reasoning.length).toBeGreaterThan(20)
  })

  // ── Government entity does not change recommendation ──────
  it('government entity alone does not change court recommendation', () => {
    const result = recommendCourt(
      makeInput({
        amount: 'under_20k',
        circumstances: { ...NO_CIRCUMSTANCES, governmentEntity: true },
      })
    )
    expect(result.recommended).toBe('jp')
  })
})
```

**Step 3: Run tests to verify they fail**

Run: `cd "/Users/minwang/lawyer free" && npx vitest run tests/unit/rules/court-recommendation.test.ts`
Expected: FAIL — "Not implemented"

**Step 4: Implement the recommendation engine**

Replace the stub in `src/lib/rules/court-recommendation.ts`:

```typescript
export function recommendCourt(input: CourtRecommendationInput): CourtRecommendation {
  const { disputeType, amount, circumstances } = input

  // 1. Federal law → federal (exclusive jurisdiction)
  if (circumstances.federalLaw) {
    return {
      recommended: 'federal',
      reasoning:
        'Federal courts have exclusive jurisdiction over federal law claims such as civil rights, patents, and bankruptcy.',
      confidence: 'high',
    }
  }

  // 2. Family → district (exclusive jurisdiction in Texas)
  if (disputeType === 'family') {
    return {
      recommended: 'district',
      reasoning:
        'Texas District Courts have exclusive jurisdiction over family law matters including divorce, custody, and adoption.',
      confidence: 'high',
    }
  }

  // 3. Real property title → district
  if (circumstances.realProperty) {
    return {
      recommended: 'district',
      reasoning:
        'Disputes involving title to real property (land or buildings) require District Court in Texas.',
      confidence: 'high',
    }
  }

  // 4. Out-of-state opponent + amount > $75K → federal (diversity)
  if (
    circumstances.outOfState &&
    (amount === '75k_200k' || amount === 'over_200k')
  ) {
    return {
      recommended: 'federal',
      reasoning:
        'With an out-of-state opposing party and a claim over $75,000, you may qualify for federal court under diversity jurisdiction.',
      alternativeNote:
        'Texas District Court is also an option if you prefer to stay in state court.',
      confidence: 'moderate',
    }
  }

  // 5. Amount-based rules
  if (amount === 'under_20k') {
    return {
      recommended: 'jp',
      reasoning:
        'JP Court (Justice of the Peace) handles claims up to $20,000. It is the simplest, fastest, and least expensive option.',
      confidence: 'high',
    }
  }

  if (amount === '20k_75k' || amount === '75k_200k') {
    return {
      recommended: 'county',
      reasoning:
        'County Court handles civil claims from $200 to $200,000. It offers more formal procedures than JP Court but is less complex than District Court.',
      confidence: 'high',
    }
  }

  if (amount === 'over_200k') {
    return {
      recommended: 'district',
      reasoning:
        'District Court handles civil claims over $200,000 and has the broadest jurisdiction of any Texas trial court.',
      confidence: 'high',
    }
  }

  // 6. Not about money → district (injunctions, non-monetary relief)
  return {
    recommended: 'district',
    reasoning:
      'Injunctions, declaratory judgments, and other non-monetary relief typically require District Court.',
    confidence: 'high',
  }
}
```

**Step 5: Run tests to verify they pass**

Run: `cd "/Users/minwang/lawyer free" && npx vitest run tests/unit/rules/court-recommendation.test.ts`
Expected: All 16 tests PASS

**Step 6: Commit**

```bash
git add src/lib/rules/court-recommendation.ts tests/unit/rules/court-recommendation.test.ts
git commit -m "feat: add pure court recommendation engine with tests"
```

---

### Task 3: Update Zod Schema — Add `federal` and `dispute_type` enum

**Files:**
- Modify: `src/lib/schemas/case.ts`
- Modify: `tests/unit/schemas/case.test.ts`

**Step 1: Write failing tests**

Add to `tests/unit/schemas/case.test.ts`:

```typescript
it('accepts federal as court_type', () => {
  const result = createCaseSchema.safeParse({ role: 'plaintiff', court_type: 'federal' })
  expect(result.success).toBe(true)
})

it('accepts known dispute_type values', () => {
  for (const dt of ['debt_collection', 'landlord_tenant', 'personal_injury', 'contract', 'property', 'family', 'other']) {
    const result = createCaseSchema.safeParse({ role: 'plaintiff', dispute_type: dt })
    expect(result.success).toBe(true)
  }
})

it('rejects unknown dispute_type values', () => {
  const result = createCaseSchema.safeParse({ role: 'plaintiff', dispute_type: 'invalid_type' })
  expect(result.success).toBe(false)
})
```

**Step 2: Run tests to verify they fail**

Run: `cd "/Users/minwang/lawyer free" && npx vitest run tests/unit/schemas/case.test.ts`
Expected: FAIL — `federal` not in enum, `dispute_type` is `z.string()` so it accepts anything

**Step 3: Update the schema**

In `src/lib/schemas/case.ts`:

```typescript
import { z } from 'zod'

export const DISPUTE_TYPES = [
  'debt_collection',
  'landlord_tenant',
  'personal_injury',
  'contract',
  'property',
  'family',
  'other',
] as const

export const createCaseSchema = z.object({
  role: z.enum(['plaintiff', 'defendant']),
  county: z.string().optional(),
  court_type: z.enum(['jp', 'county', 'district', 'federal', 'unknown']).optional().default('unknown'),
  dispute_type: z.enum(DISPUTE_TYPES).optional(),
})

export type CreateCaseInput = z.infer<typeof createCaseSchema>
```

**Step 4: Run tests to verify they pass**

Run: `cd "/Users/minwang/lawyer free" && npx vitest run tests/unit/schemas/case.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/schemas/case.ts tests/unit/schemas/case.test.ts
git commit -m "feat: add federal court_type and dispute_type enum to case schema"
```

---

### Task 4: Wizard Progress Component

**Files:**
- Create: `src/components/cases/wizard/wizard-progress.tsx`

**Step 1: Create the component**

```typescript
interface WizardProgressProps {
  currentStep: number
  totalSteps: number
  onBack: () => void
}

export function WizardProgress({ currentStep, totalSteps, onBack }: WizardProgressProps) {
  return (
    <div className="flex items-center gap-3 mb-4">
      {currentStep > 1 && (
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-warm-muted hover:text-warm-text transition-colors"
          aria-label="Go back"
        >
          &larr; Back
        </button>
      )}
      <div className="flex-1" />
      <span className="text-xs text-warm-muted">
        Step {currentStep} of {totalSteps}
      </span>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/cases/wizard/wizard-progress.tsx
git commit -m "feat: add wizard progress indicator component"
```

---

### Task 5: Wizard Step Components

**Files:**
- Create: `src/components/cases/wizard/role-step.tsx`
- Create: `src/components/cases/wizard/dispute-type-step.tsx`
- Create: `src/components/cases/wizard/amount-step.tsx`
- Create: `src/components/cases/wizard/circumstances-step.tsx`
- Create: `src/components/cases/wizard/recommendation-step.tsx`

All step components follow the same pattern: receive current value + `onSelect` callback. They render option cards using the same two-button styling from the existing role selector.

**Step 1: Create shared option card pattern**

Create `src/components/cases/wizard/option-card.tsx`:

```typescript
interface OptionCardProps {
  label: string
  description?: string
  selected: boolean
  onClick: () => void
}

export function OptionCard({ label, description, selected, onClick }: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-md border px-4 py-3 text-left transition-colors ${
        selected
          ? 'border-primary bg-primary/5 text-primary'
          : 'border-warm-border text-warm-muted hover:border-warm-text hover:text-warm-text'
      }`}
    >
      <span className="text-sm font-medium">{label}</span>
      {description && (
        <span className="block text-xs mt-0.5 opacity-75">{description}</span>
      )}
    </button>
  )
}
```

**Step 2: Create RoleStep**

Create `src/components/cases/wizard/role-step.tsx`:

```typescript
import { OptionCard } from './option-card'

interface RoleStepProps {
  value: 'plaintiff' | 'defendant' | ''
  onSelect: (role: 'plaintiff' | 'defendant') => void
}

export function RoleStep({ value, onSelect }: RoleStepProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-warm-text">I am the...</p>
      <div className="flex gap-3">
        <div className="flex-1">
          <OptionCard
            label="Plaintiff"
            description="I'm bringing the case"
            selected={value === 'plaintiff'}
            onClick={() => onSelect('plaintiff')}
          />
        </div>
        <div className="flex-1">
          <OptionCard
            label="Defendant"
            description="I was served or sued"
            selected={value === 'defendant'}
            onClick={() => onSelect('defendant')}
          />
        </div>
      </div>
    </div>
  )
}
```

**Step 3: Create DisputeTypeStep**

Create `src/components/cases/wizard/dispute-type-step.tsx`:

```typescript
import type { DisputeType } from '@/lib/rules/court-recommendation'
import { OptionCard } from './option-card'

const DISPUTE_OPTIONS: { value: DisputeType; label: string; description: string }[] = [
  { value: 'debt_collection', label: 'Money owed to me', description: 'Debt or unpaid contract' },
  { value: 'landlord_tenant', label: 'Landlord-tenant issue', description: 'Lease, eviction, or deposit dispute' },
  { value: 'personal_injury', label: 'Property damage or personal injury', description: 'Accident, negligence, or damage claims' },
  { value: 'contract', label: 'Business or contract dispute', description: 'Breach of agreement, partnership issues' },
  { value: 'property', label: 'Property or real estate', description: 'Land ownership, boundary, or title dispute' },
  { value: 'family', label: 'Family matter', description: 'Custody, divorce, or child support' },
  { value: 'other', label: 'Something else', description: 'Doesn\'t fit the categories above' },
]

interface DisputeTypeStepProps {
  value: DisputeType | ''
  onSelect: (type: DisputeType) => void
}

export function DisputeTypeStep({ value, onSelect }: DisputeTypeStepProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-warm-text">What is this dispute about?</p>
      <div className="space-y-2">
        {DISPUTE_OPTIONS.map((opt) => (
          <OptionCard
            key={opt.value}
            label={opt.label}
            description={opt.description}
            selected={value === opt.value}
            onClick={() => onSelect(opt.value)}
          />
        ))}
      </div>
    </div>
  )
}
```

**Step 4: Create AmountStep**

Create `src/components/cases/wizard/amount-step.tsx`:

```typescript
import type { AmountRange } from '@/lib/rules/court-recommendation'
import { OptionCard } from './option-card'

const AMOUNT_OPTIONS: { value: AmountRange; label: string }[] = [
  { value: 'under_20k', label: 'Under $20,000' },
  { value: '20k_75k', label: '$20,000 \u2013 $75,000' },
  { value: '75k_200k', label: '$75,000 \u2013 $200,000' },
  { value: 'over_200k', label: 'Over $200,000' },
  { value: 'not_money', label: 'It\u2019s not about money' },
]

interface AmountStepProps {
  value: AmountRange | ''
  onSelect: (amount: AmountRange) => void
}

export function AmountStep({ value, onSelect }: AmountStepProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-warm-text">
        Roughly how much money is involved?
      </p>
      <div className="space-y-2">
        {AMOUNT_OPTIONS.map((opt) => (
          <OptionCard
            key={opt.value}
            label={opt.label}
            selected={value === opt.value}
            onClick={() => onSelect(opt.value)}
          />
        ))}
      </div>
    </div>
  )
}
```

**Step 5: Create CircumstancesStep**

Create `src/components/cases/wizard/circumstances-step.tsx`:

```typescript
import type { CircumstanceFlags } from '@/lib/rules/court-recommendation'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

const CIRCUMSTANCE_OPTIONS: { key: keyof CircumstanceFlags; label: string }[] = [
  { key: 'realProperty', label: 'The dispute involves ownership of real property (land/house)' },
  { key: 'outOfState', label: 'The opposing party is in a different state' },
  { key: 'governmentEntity', label: 'The opposing party is a government entity' },
  { key: 'federalLaw', label: 'This involves a federal law (civil rights, patent, bankruptcy)' },
]

interface CircumstancesStepProps {
  value: CircumstanceFlags
  onChange: (flags: CircumstanceFlags) => void
  onContinue: () => void
}

export function CircumstancesStep({ value, onChange, onContinue }: CircumstancesStepProps) {
  function handleToggle(key: keyof CircumstanceFlags) {
    onChange({ ...value, [key]: !value[key] })
  }

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-warm-text">Do any of these apply?</p>
      <div className="space-y-3">
        {CIRCUMSTANCE_OPTIONS.map((opt) => (
          <div key={opt.key} className="flex items-start gap-3">
            <Checkbox
              id={opt.key}
              checked={value[opt.key]}
              onCheckedChange={() => handleToggle(opt.key)}
            />
            <Label htmlFor={opt.key} className="text-sm text-warm-text leading-tight cursor-pointer">
              {opt.label}
            </Label>
          </div>
        ))}
      </div>
      <p className="text-xs text-warm-muted">
        If none apply, just continue.
      </p>
      <Button type="button" className="w-full" onClick={onContinue}>
        Continue
      </Button>
    </div>
  )
}
```

**Step 6: Create RecommendationStep**

Create `src/components/cases/wizard/recommendation-step.tsx`:

```typescript
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { CourtRecommendation } from '@/lib/rules/court-recommendation'

const COURT_LABELS: Record<string, string> = {
  jp: 'JP Court (Small Claims)',
  county: 'County Court',
  district: 'District Court',
  federal: 'Federal Court',
}

interface RecommendationStepProps {
  recommendation: CourtRecommendation
  county: string
  onCountyChange: (county: string) => void
  onAccept: (courtOverride: string | null) => void
  loading: boolean
}

export function RecommendationStep({
  recommendation,
  county,
  onCountyChange,
  onAccept,
  loading,
}: RecommendationStepProps) {
  const [showOverride, setShowOverride] = useState(false)
  const [override, setOverride] = useState('')

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-warm-border bg-white p-4 space-y-2">
        <p className="text-xs font-medium text-warm-muted uppercase tracking-wide">
          Our recommendation
        </p>
        <p className="text-base font-semibold text-warm-text">
          {COURT_LABELS[recommendation.recommended]}
        </p>
        <p className="text-sm text-warm-text leading-relaxed">
          {recommendation.reasoning}
        </p>
        {recommendation.alternativeNote && (
          <p className="text-sm text-warm-muted italic">
            {recommendation.alternativeNote}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="county">Which county will you file in? (optional)</Label>
        <Input
          id="county"
          value={county}
          onChange={(e) => onCountyChange(e.target.value)}
          placeholder="e.g. Travis County"
        />
      </div>

      {!showOverride ? (
        <div className="space-y-2">
          <Button
            type="button"
            className="w-full"
            onClick={() => onAccept(null)}
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Accept & Get Started'}
          </Button>
          <button
            type="button"
            onClick={() => setShowOverride(true)}
            className="w-full text-center text-xs text-warm-muted hover:text-warm-text transition-colors py-1"
          >
            Choose a different court
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <Label htmlFor="court-override">Select your preferred court</Label>
          <Select value={override} onValueChange={setOverride}>
            <SelectTrigger className="w-full" id="court-override">
              <SelectValue placeholder="Select a court" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="jp">JP Court (Small Claims)</SelectItem>
              <SelectItem value="county">County Court</SelectItem>
              <SelectItem value="district">District Court</SelectItem>
              <SelectItem value="federal">Federal Court</SelectItem>
            </SelectContent>
          </Select>
          <Button
            type="button"
            className="w-full"
            onClick={() => onAccept(override || null)}
            disabled={loading || !override}
          >
            {loading ? 'Creating...' : 'Get Started'}
          </Button>
          <button
            type="button"
            onClick={() => setShowOverride(false)}
            className="w-full text-center text-xs text-warm-muted hover:text-warm-text transition-colors py-1"
          >
            Use recommended court
          </button>
        </div>
      )}
    </div>
  )
}
```

**Step 7: Commit**

```bash
git add src/components/cases/wizard/
git commit -m "feat: add wizard step components for court selection"
```

---

### Task 6: Rewrite NewCaseDialog as Wizard Orchestrator

**Files:**
- Modify: `src/components/cases/new-case-dialog.tsx`

**Step 1: Rewrite the component**

Replace the entire file with the wizard orchestrator:

```typescript
'use client'

import { useReducer, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  recommendCourt,
  type DisputeType,
  type AmountRange,
  type CircumstanceFlags,
} from '@/lib/rules/court-recommendation'
import { WizardProgress } from './wizard/wizard-progress'
import { RoleStep } from './wizard/role-step'
import { DisputeTypeStep } from './wizard/dispute-type-step'
import { AmountStep } from './wizard/amount-step'
import { CircumstancesStep } from './wizard/circumstances-step'
import { RecommendationStep } from './wizard/recommendation-step'

const TOTAL_STEPS = 5

interface WizardState {
  step: number
  role: 'plaintiff' | 'defendant' | ''
  disputeType: DisputeType | ''
  amount: AmountRange | ''
  circumstances: CircumstanceFlags
  county: string
}

type WizardAction =
  | { type: 'SET_ROLE'; role: 'plaintiff' | 'defendant' }
  | { type: 'SET_DISPUTE_TYPE'; disputeType: DisputeType }
  | { type: 'SET_AMOUNT'; amount: AmountRange }
  | { type: 'SET_CIRCUMSTANCES'; circumstances: CircumstanceFlags }
  | { type: 'SET_COUNTY'; county: string }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'RESET' }

const initialState: WizardState = {
  step: 1,
  role: '',
  disputeType: '',
  amount: '',
  circumstances: {
    realProperty: false,
    outOfState: false,
    governmentEntity: false,
    federalLaw: false,
  },
  county: '',
}

function reducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case 'SET_ROLE':
      return { ...state, role: action.role, step: 2 }
    case 'SET_DISPUTE_TYPE':
      return { ...state, disputeType: action.disputeType, step: 3 }
    case 'SET_AMOUNT':
      return { ...state, amount: action.amount, step: 4 }
    case 'SET_CIRCUMSTANCES':
      return { ...state, circumstances: action.circumstances }
    case 'SET_COUNTY':
      return { ...state, county: action.county }
    case 'NEXT_STEP':
      return { ...state, step: Math.min(state.step + 1, TOTAL_STEPS) }
    case 'PREV_STEP':
      return { ...state, step: Math.max(state.step - 1, 1) }
    case 'RESET':
      return initialState
    default:
      return state
  }
}

export function NewCaseDialog() {
  const [open, setOpen] = useState(false)
  const [state, dispatch] = useReducer(reducer, initialState)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleAccept(courtOverride: string | null) {
    if (!state.role) return

    setLoading(true)
    setError(null)

    const courtType =
      courtOverride ??
      (state.disputeType && state.amount
        ? recommendCourt({
            disputeType: state.disputeType,
            amount: state.amount,
            circumstances: state.circumstances,
          }).recommended
        : 'unknown')

    try {
      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      const res = await fetch('/api/cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token
            ? { Authorization: `Bearer ${session.access_token}` }
            : {}),
        },
        body: JSON.stringify({
          role: state.role,
          court_type: courtType,
          ...(state.disputeType ? { dispute_type: state.disputeType } : {}),
          ...(state.county.trim() ? { county: state.county.trim() } : {}),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Something went wrong. Please try again.')
        setLoading(false)
        return
      }

      const data = await res.json()
      setOpen(false)
      router.push(`/case/${data.case.id}`)
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    if (!nextOpen) {
      dispatch({ type: 'RESET' })
      setError(null)
      setLoading(false)
    }
  }

  const recommendation =
    state.disputeType && state.amount
      ? recommendCourt({
          disputeType: state.disputeType,
          amount: state.amount,
          circumstances: state.circumstances,
        })
      : null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="w-full" size="lg">
          Start a New Case
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start a new case</DialogTitle>
          <DialogDescription>
            We&apos;ll help you figure out the right court.
          </DialogDescription>
        </DialogHeader>

        <WizardProgress
          currentStep={state.step}
          totalSteps={TOTAL_STEPS}
          onBack={() => dispatch({ type: 'PREV_STEP' })}
        />

        {state.step === 1 && (
          <RoleStep
            value={state.role}
            onSelect={(role) => dispatch({ type: 'SET_ROLE', role })}
          />
        )}

        {state.step === 2 && (
          <DisputeTypeStep
            value={state.disputeType}
            onSelect={(disputeType) =>
              dispatch({ type: 'SET_DISPUTE_TYPE', disputeType })
            }
          />
        )}

        {state.step === 3 && (
          <AmountStep
            value={state.amount}
            onSelect={(amount) => dispatch({ type: 'SET_AMOUNT', amount })}
          />
        )}

        {state.step === 4 && (
          <CircumstancesStep
            value={state.circumstances}
            onChange={(circumstances) =>
              dispatch({ type: 'SET_CIRCUMSTANCES', circumstances })
            }
            onContinue={() => dispatch({ type: 'NEXT_STEP' })}
          />
        )}

        {state.step === 5 && recommendation && (
          <RecommendationStep
            recommendation={recommendation}
            county={state.county}
            onCountyChange={(county) => dispatch({ type: 'SET_COUNTY', county })}
            onAccept={handleAccept}
            loading={loading}
          />
        )}

        {error && <p className="text-sm text-calm-amber">{error}</p>}
      </DialogContent>
    </Dialog>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/cases/new-case-dialog.tsx
git commit -m "feat: rewrite new-case dialog as 5-step court selection wizard"
```

---

### Task 7: Build Verification

**Step 1: Run the build**

```bash
cd "/Users/minwang/lawyer free" && npx next build 2>&1 | tail -30
```

Expected: Clean build, no type errors.

**Step 2: Run all unit tests**

```bash
cd "/Users/minwang/lawyer free" && npx vitest run
```

Expected: All tests pass, including new court-recommendation tests and updated schema tests.

**Step 3: Final commit (if any fixes needed)**

Fix any issues, then:

```bash
git add -A && git commit -m "fix: address build/test issues from court selection wizard"
```

---

## Summary

| Task | Description | New Files | Modified Files |
|------|-------------|-----------|----------------|
| 1 | Migration for federal court_type | 1 | 0 |
| 2 | Court recommendation engine + tests | 2 | 0 |
| 3 | Zod schema update + tests | 0 | 2 |
| 4 | Wizard progress component | 1 | 0 |
| 5 | Wizard step components (6 files) | 6 | 0 |
| 6 | Rewrite NewCaseDialog orchestrator | 0 | 1 |
| 7 | Build + test verification | 0 | 0 |

**Total: 10 new files, 3 modified files, 7 commits**
