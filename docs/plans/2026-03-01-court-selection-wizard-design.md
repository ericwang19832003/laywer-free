# Court Selection Wizard — Design Document

**Date**: 2026-03-01
**Status**: Approved

## Problem

Users must choose the right court level (JP, County, District, or Federal) before filing. This is a confusing decision for self-represented litigants. The current case creation dialog collects court type as an optional dropdown with no guidance — most users pick "I'm not sure."

## Solution

Replace the new-case dialog with a **5-step guided wizard** that asks simple questions and recommends the appropriate court with plain-English reasoning. The wizard also captures dispute type, enabling tailored content downstream.

## Wizard Flow

### Step 1 — Role
> "I am the..."
- Plaintiff — "I'm bringing the case"
- Defendant — "I was served or sued"

### Step 2 — Dispute Type
> "What is this dispute about?"
- Money owed to me (debt/contract) → `debt_collection`
- Landlord-tenant issue → `landlord_tenant`
- Property damage or personal injury → `personal_injury`
- Business or contract dispute → `contract`
- Property or real estate → `property`
- Family matter (custody, divorce) → `family`
- Something else → `other`

### Step 3 — Dispute Amount
> "Roughly how much money is involved?"
- Under $20,000
- $20,000 – $75,000
- $75,000 – $200,000
- Over $200,000
- It's not about money (injunction, custody, property title)

### Step 4 — Special Circumstances (multi-select checkboxes)
> "Do any of these apply?"
- The dispute involves ownership of real property (land/house)
- The opposing party is in a different state
- The opposing party is a government entity
- This involves a federal law (civil rights, patent, bankruptcy)

### Step 5 — Recommendation
Shows the recommended court with reasoning. User can accept, override (dropdown), or go back. County is collected here as an optional text input.

## Court Recommendation Engine

Pure function in `src/lib/rules/court-recommendation.ts`. No API calls, no AI. Deterministic, unit-testable.

### Decision Table (evaluated top-to-bottom, first match wins)

| Condition | Court | Reasoning |
|-----------|-------|-----------|
| `federalLaw === true` | `federal` | Federal courts have exclusive jurisdiction over federal law claims |
| `disputeType === 'family'` | `district` | Texas District Courts have exclusive jurisdiction over family law |
| `realProperty === true` | `district` | Disputes involving title to real property require District Court |
| `outOfState && amount > $75K` | `federal` + `district` note | Diversity jurisdiction qualifies for federal; District also works |
| `amount <= $20K` | `jp` | JP Court handles claims up to $20,000. Simplest and fastest |
| `amount <= $200K` | `county` | County Court handles claims $200 to $200,000 |
| `amount > $200K` | `district` | District Court handles claims over $200,000 |
| `notAboutMoney` | `district` | Injunctions and non-monetary relief typically require District Court |

### Types

```typescript
type DisputeType = 'debt_collection' | 'landlord_tenant' | 'personal_injury' | 'contract' | 'property' | 'family' | 'other'
type AmountRange = 'under_20k' | '20k_75k' | '75k_200k' | 'over_200k' | 'not_money'
type CourtType = 'jp' | 'county' | 'district' | 'federal'

interface CourtRecommendationInput {
  disputeType: DisputeType
  amount: AmountRange
  circumstances: {
    realProperty: boolean
    outOfState: boolean
    governmentEntity: boolean
    federalLaw: boolean
  }
}

interface CourtRecommendation {
  recommended: CourtType
  reasoning: string
  alternativeNote?: string
  confidence: 'high' | 'moderate'
}
```

## Component Architecture

```
NewCaseDialog (orchestrator — useReducer for wizard state)
├── WizardProgress        (Step X of 5 + back button)
├── RoleStep              (two-button selector)
├── DisputeTypeStep       (option cards)
├── AmountStep            (option cards)
├── CircumstancesStep     (checkboxes)
└── RecommendationStep    (result card + accept/override + county input)
```

All steps render inside the same Dialog — no routing changes, no new pages.

### Wizard State

```typescript
interface WizardState {
  step: 1 | 2 | 3 | 4 | 5
  role: 'plaintiff' | 'defendant' | ''
  disputeType: DisputeType | ''
  amount: AmountRange | ''
  circumstances: {
    realProperty: boolean
    outOfState: boolean
    governmentEntity: boolean
    federalLaw: boolean
  }
  courtOverride: CourtType | null
  county: string
}
```

## File Layout

| File | Action |
|------|--------|
| `src/lib/rules/court-recommendation.ts` | **Create** — Pure engine + types |
| `src/components/cases/new-case-dialog.tsx` | **Rewrite** — Wizard orchestrator |
| `src/components/cases/wizard/wizard-progress.tsx` | **Create** — Step indicator |
| `src/components/cases/wizard/role-step.tsx` | **Create** — Step 1 |
| `src/components/cases/wizard/dispute-type-step.tsx` | **Create** — Step 2 |
| `src/components/cases/wizard/amount-step.tsx` | **Create** — Step 3 |
| `src/components/cases/wizard/circumstances-step.tsx` | **Create** — Step 4 |
| `src/components/cases/wizard/recommendation-step.tsx` | **Create** — Step 5 |
| `src/lib/schemas/case.ts` | **Modify** — Add dispute_type enum, 'federal' court type |
| `supabase/migrations/..._court_type_federal.sql` | **Create** — Add 'federal' to CHECK |

## Data Flow

1. User progresses through Steps 1–4, wizard state accumulates in `useReducer`
2. Step 5 calls `recommendCourt(wizardState)` (pure, synchronous)
3. User accepts or overrides → wizard submits `POST /api/cases` with `{ role, dispute_type, court_type, county }`
4. API route already accepts all these fields — no changes needed
5. Case created, user redirected to `/case/[id]` dashboard

## Schema Changes

- Migration: add `'federal'` to `court_type` CHECK constraint on `cases` table
- `dispute_type` column already exists, no schema change needed for it

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| User picks "I'm not sure" on amount | Show all court options with explanations, no single recommendation |
| Family + amount > $200K | District Court (family takes priority — exclusive jurisdiction) |
| Federal law + small amount | Federal Court (exclusive jurisdiction overrides amount) |
| User overrides recommendation | Store their chosen court, no warning — they may know better |
| Back button on step 1 | Hidden (nothing to go back to) |
| Dialog closed mid-wizard | State resets on reopen |
