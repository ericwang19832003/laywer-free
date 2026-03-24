# Florida Expansion Design

**Goal:** Add Florida as a fourth supported state, following FL laws and court structures across all case modules.

**Architecture:** Extends the existing hybrid multi-state system (TX/CA/NY). FL config object for data, FL-specific court recommendation function. No architectural changes — proven pattern from prior expansions.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind, Supabase, Anthropic Claude API, Zod, vitest

---

## Section 1: State Config & Court Types

### FL Court Types

| Court Type | Value | Label | Max Amount |
|-----------|-------|-------|-----------|
| Small Claims | `fl_small_claims` | Small Claims Court | $8,000 |
| County Court | `fl_county` | County Court | $50,000 |
| Circuit Court | `fl_circuit` | Circuit Court | unlimited |

### FL Statute of Limitations

- Personal injury: 2 years (Fla. Stat. § 95.11(3)(a)) — reduced from 4 years in 2023
- Written contract: 5 years (Fla. Stat. § 95.11(2)(b))
- Oral contract: 4 years (Fla. Stat. § 95.11(3)(k))
- Property damage: 4 years (Fla. Stat. § 95.11(3)(h))

### FL Amount Ranges

- Under $8,000 → Small Claims
- $8,000 – $50,000 → County Court
- Over $50,000 → Circuit Court
- Not about money → Circuit Court

### Schema/DB Changes

- Add `'FL'` to `STATES`, `StateCode`, DB CHECK
- Add `'fl_small_claims' | 'fl_county' | 'fl_circuit'` to `ALL_COURT_TYPES` and DB CHECK
- State selector becomes 4 cards

---

## Section 2: Court Recommendation Engine

`recommendFloridaCourt()` rules (top-to-bottom):

1. Federal law → `federal`
2. Family → `fl_circuit` (Circuit Court handles all family law in FL)
3. Eviction → `fl_county` (County Court handles evictions in FL)
4. Real property → `fl_circuit`
5. Diversity ($75K+ out-of-state) → `federal`
6. Under $8K → `fl_small_claims` (Fla. Stat. § 34.01)
7. $8K–$50K → `fl_county`
8. Over $50K → `fl_circuit`
9. Default → `fl_circuit`

Key: FL evictions go to County Court (not Circuit), unlike TX (JP) and NY (Civil/Housing). Family law goes to Circuit Court, which is Florida's general jurisdiction trial court.

---

## Section 3: UI Components & Wizard Wiring

### State Selector

Fourth card: "Florida — Small Claims, County, and Circuit courts"

### State-Aware Components (already wired for multi-state)

- `dispute-type-step.tsx` — "under $8,000" for FL
- `small-claims-sub-type-step.tsx` — $8,000 limit warning, "County or Circuit" as alternative courts
- `amount-step.tsx` — FL ranges from `getStateConfig('FL')`
- `recommendation-step.tsx` — FL court labels, "e.g. Miami-Dade County" placeholder

### new-case-dialog.tsx Branching

- Family → `fl_circuit`
- Small claims → `fl_small_claims`
- Eviction → `fl_county`

### No Circuit Court Clarification Needed

Unlike NY's counterintuitive "Supreme Court = trial court" naming, FL's court names are straightforward. No special UI note needed.

---

## Section 4: Database Migration & Testing

### Migration

- Expand `cases_state_check`: `state IN ('TX', 'CA', 'NY', 'FL')`
- Expand `cases_court_type_check`: add `'fl_small_claims', 'fl_county', 'fl_circuit'`
- No backfill needed

### Damages Calculator

- `FL_SMALL_CLAIMS_CAP = 8_000`
- 6 tests following NY/CA pattern

### Testing (~38 new tests)

- FL state config: ~15
- FL court recommendation: ~14
- Schema updates: ~3
- Damages calculator: ~6
- Total: ~1120 tests (existing 1082 + ~38 new)

---

## Section 5: Implementation Strategy — 10-Person Team

### Batch 1 (Foundation, sequential)
1. FL State Config + schema + DB migration
2. FL Court Recommendation Engine + tests

### Batch 2 (parallel tasks)
3. Wizard wiring (state-step fourth card, new-case-dialog FL branching)
4. FL Damages Calculator ($8K cap)

### Batch 3 (Verification)
5. Full test suite (~1120 tests) + `npx next build` — zero errors

### Out of Scope
- FL child support calculator (Income Shares Model requires statutory guideline table — future task)
- Florida Courts E-Filing Portal integration (guidance/links only)
- States beyond TX/CA/NY/FL

---

## Key FL Legal Research

### Court Structure
- Small Claims: up to $8,000 (Fla. Stat. § 34.01)
- County Court: up to $50,000 (Fla. Stat. § 34.01, updated Jan 1, 2023)
- Circuit Court: unlimited civil jurisdiction — general jurisdiction trial court
- Court names are straightforward — no UI clarification needed

### Family Law
- Equitable distribution state (NOT community property)
- Child support: Income Shares Model (statutory guideline table, not flat percentage)
- Divorce in Circuit Court
- Residency requirement: 6 months

### Landlord-Tenant
- 3-day notice for nonpayment (no cure right, excludes weekends/holidays)
- 7-day notice to cure lease violations
- County Court handles evictions
- Email notice delivery permitted as of July 1, 2025

### E-Filing
- Florida Courts E-Filing Portal — mandatory for attorneys, optional for pro se
- Unified statewide system (more unified than CA/NY)
