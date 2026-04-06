# Pennsylvania Expansion Design

**Goal:** Add Pennsylvania as a fifth supported state, following PA laws and court structures across all case modules.

**Architecture:** Extends the existing hybrid multi-state system (TX/CA/NY/FL). PA config object for data, PA-specific court recommendation function. No architectural changes — proven pattern from prior expansions.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind, Supabase, Anthropic Claude API, Zod, vitest

---

## Section 1: State Config & Court Types

### PA Court Types

| Court Type | Value | Label | Max Amount |
|-----------|-------|-------|-----------|
| Magisterial District | `pa_magisterial` | Magisterial District Court | $12,000 |
| Common Pleas | `pa_common_pleas` | Court of Common Pleas | unlimited |

### PA Statute of Limitations

- Personal injury: 2 years (42 Pa.C.S. § 5524)
- Written contract: 4 years (42 Pa.C.S. § 5525)
- Oral contract: 4 years (42 Pa.C.S. § 5525)
- Property damage: 2 years (42 Pa.C.S. § 5524)

### PA Amount Ranges

- Under $12,000 → Magisterial District Court
- Over $12,000 → Court of Common Pleas
- Not about money → Court of Common Pleas

### Schema/DB Changes

- Add `'PA'` to `STATES`, `StateCode`, DB CHECK
- Add `'pa_magisterial' | 'pa_common_pleas'` to `ALL_COURT_TYPES` and DB CHECK
- State selector becomes 5 cards

---

## Section 2: Court Recommendation Engine

`recommendPennsylvaniaCourt()` rules (top-to-bottom):

1. Federal law → `federal`
2. Family → `pa_common_pleas` (Family Division handles all family law)
3. Eviction → `pa_magisterial` (MDJ handles evictions)
4. Real property → `pa_common_pleas`
5. Diversity ($75K+ out-of-state) → `federal`
6. Under $12K → `pa_magisterial` (42 Pa.C.S. § 1515)
7. Over $12K → `pa_common_pleas`
8. Default → `pa_common_pleas`

Key: PA is a simpler 2-tier system (MDJ vs Common Pleas) compared to FL's 3-tier. Evictions go to MDJ (similar to TX JP), family goes to Common Pleas Family Division. Philadelphia Municipal Court is functionally equivalent to MDJ for routing purposes — no special handling needed.

---

## Section 3: UI Components & Wizard Wiring

### State Selector

Fifth card: "Pennsylvania — Magisterial District and Common Pleas courts"

### State-Aware Components (already wired for multi-state)

- `dispute-type-step.tsx` — "under $12,000" for PA
- `small-claims-sub-type-step.tsx` — $12,000 limit warning, "Common Pleas" as alternative court
- `amount-step.tsx` — PA ranges from `getStateConfig('PA')`
- `recommendation-step.tsx` — PA court labels, "e.g. Allegheny County" placeholder

### new-case-dialog.tsx Branching

- Family → `pa_common_pleas`
- Small claims → `pa_magisterial`
- Eviction → `pa_magisterial`

### No Court Name Clarification Needed

PA court names are straightforward (unlike NY's "Supreme Court = trial court"). No special UI note needed.

---

## Section 4: Database Migration & Testing

### Migration

- Expand `cases_state_check`: `state IN ('TX', 'CA', 'NY', 'FL', 'PA')`
- Expand `cases_court_type_check`: add `'pa_magisterial', 'pa_common_pleas'`
- No backfill needed

### Damages Calculator

- `PA_SMALL_CLAIMS_CAP = 12_000`
- 6 tests following FL/NY/CA pattern

### Testing (~35 new tests)

- PA state config: ~13
- PA court recommendation: ~12
- Schema updates: ~4
- Damages calculator: ~6
- Total: ~1154 tests (existing 1119 + ~35 new)

---

## Section 5: Implementation Strategy — 10-Person Team

### Batch 1 (Foundation, sequential)
1. PA State Config + schema + DB migration
2. PA Court Recommendation Engine + tests

### Batch 2 (parallel tasks)
3. Wizard wiring (state-step fifth card, new-case-dialog PA branching)
4. PA Damages Calculator ($12K cap)

### Batch 3 (Verification)
5. Full test suite (~1154 tests) + `npx next build` — zero errors

### Out of Scope
- PA child support calculator (Income Shares Model requires both parents' income data + statutory guideline table — future task)
- PACFile e-filing integration (guidance/links only)
- Philadelphia Municipal Court special routing (functionally equivalent to MDJ)
- States beyond TX/CA/NY/FL/PA

---

## Key PA Legal Research

### Court Structure
- Magisterial District Court: up to $12,000 (42 Pa.C.S. § 1515)
- Court of Common Pleas: unlimited civil jurisdiction — general jurisdiction trial court
- Philadelphia Municipal Court: functionally equivalent to MDJ for claims up to $12,000
- Court names are straightforward — no UI clarification needed

### Family Law
- Equitable distribution state (NOT community property)
- Child support: Income Shares Model (requires both parents' income, not flat percentage)
- Divorce in Court of Common Pleas, Family Division
- Residency requirement: 6 months

### Landlord-Tenant
- 10-day notice for nonpayment (68 P.S. § 250.501(b))
- 15-day notice for lease violations (lease ≤ 1 year)
- 30-day notice for lease violations (lease > 1 year)
- MDJ handles evictions (Philadelphia: Municipal Court)
- Security deposit: max 2 months' rent (year 1), 1 month's rent (year 2+)

### E-Filing
- PACFile on UJS Portal — varies by judicial district
- Not available at MDJ level
- Pro se litigants generally exempt from mandatory e-filing
