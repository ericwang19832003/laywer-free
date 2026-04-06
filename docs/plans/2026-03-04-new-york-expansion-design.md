# New York Expansion Design

**Goal:** Add New York as a third supported state, following NY laws and court structures across all 6 case modules.

**Architecture:** Extends the existing hybrid multi-state system (TX/CA). NY config object for data, NY-specific modules for complex logic (family law CSSA, rent stabilization, debt defense). No architectural changes — proven pattern from CA expansion.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind, Supabase, Anthropic Claude API, Zod, vitest

---

## Section 1: State Config & Court Types

### NY Court Types

| Court Type | Value | Label | Max Amount |
|-----------|-------|-------|-----------|
| Small Claims | `ny_small_claims` | Small Claims Court | $10,000 (NYC) |
| Civil Court | `ny_civil` | Civil Court | $25,000 |
| Supreme Court | `ny_supreme` | Supreme Court | unlimited |

Note: NY small claims limits vary by location ($10K NYC, $5K city courts, $3K town/village). MVP uses NYC $10,000 as default.

### NY Statute of Limitations

- Personal injury: 3 years (CPLR § 214)
- Written contract: 6 years (CPLR § 213)
- Oral contract: 6 years (CPLR § 213)
- Property damage: 3 years (CPLR § 214)

### NY Amount Ranges

- Under $10,000 → Small Claims
- $10,000 – $25,000 → Civil Court
- Over $25,000 → Supreme Court
- Not about money → Supreme Court

### Schema/DB Changes

- Add `'NY'` to `STATES`, `StateCode`, DB CHECK
- Add `'ny_small_claims' | 'ny_civil' | 'ny_supreme'` to `ALL_COURT_TYPES` and DB CHECK
- State selector becomes 3 cards

---

## Section 2: Court Recommendation Engine

`recommendNewYorkCourt()` rules (top-to-bottom):

1. Federal law → `federal`
2. Family → `ny_supreme` (Supreme Court or Family Court)
3. Eviction → `ny_civil` (Housing Court, part of Civil Court)
4. Real property → `ny_supreme`
5. Diversity ($75K+ out-of-state) → `federal`
6. Under $10K → `ny_small_claims` (UCCA § 1801)
7. $10K–$25K → `ny_civil`
8. Over $25K → `ny_supreme`
9. Default → `ny_supreme`

Key: NY "Supreme Court" is the trial court, not the highest court. UI includes a clarifying note.

---

## Section 3: Prompt Builder Refactoring

### Simple Prompts (Parameterize)

- Demand letters: NY General Business Law, CPLR citations
- PI demand letter: NY Insurance Law § 3420, 3-year SOL
- PI petition: NY Supreme Court caption format
- Small claims: UCCA § 1801, $10,000 limit

### Complex Prompts (New NY Modules)

| Module | File |
|--------|------|
| Family law (CSSA, equitable distribution) | `src/lib/states/ny/prompts/ny-family-filing-prompts.ts` |
| Landlord-tenant (rent stabilization, Good Cause Eviction) | `src/lib/states/ny/prompts/ny-landlord-tenant-prompts.ts` |
| Debt defense (CPLR § 3213, 6-year SOL) | `src/lib/states/ny/prompts/ny-debt-defense-prompts.ts` |
| Child support calculator (CSSA formula) | `src/lib/states/ny/calculators/ny-child-support-calculator.ts` |

### CSSA Child Support Formula

- 17% of combined income for 1 child
- 25% for 2 children
- 29% for 3 children
- 31% for 4 children
- Combined income cap: $193,000 (as of March 2026)
- Add-ons: childcare, medical, education expenses

---

## Section 4: UI Components & Educational Content

### State Selector

Third card: "New York — Small Claims, Civil, and Supreme courts"

### State-Aware Components (already wired)

- `dispute-type-step.tsx` — "under $10,000" for NY
- `small-claims-sub-type-step.tsx` — $10,000 limit warning
- `amount-step.tsx` — NY ranges
- `recommendation-step.tsx` — NY court labels, "e.g. Kings County" placeholder

### Supreme Court Clarification

Recommendation step note for NY: "In New York, Supreme Court is the main trial court — not the highest court."

### Educational Content

- Simple steps: parameterize with NY statutes
- Complex steps: state-specific modules via `getEducationalContent('NY', stepKey)`
- NY topics: rent stabilization, CSSA breakdown, Housing Court procedures

---

## Section 5: Database Migration & Testing

### Migration

- Expand `cases_state_check`: `state IN ('TX', 'CA', 'NY')`
- Expand `cases_court_type_check`: add `'ny_small_claims', 'ny_civil', 'ny_supreme'`
- No backfill needed

### Triggers

No changes — task chains are state-agnostic.

### Testing (~78 new tests)

- NY state config: ~10
- NY court recommendation: ~14
- Schema updates: ~3
- Damages calculator: ~6
- Child support calculator: ~15
- NY prompt builders: ~30
- Total: ~1107 tests (existing 1029 + 78 new)

---

## Section 6: Implementation Strategy — 10-Person Team

### Batch 1 (Foundation, sequential)
1. NY State Config + schema + DB migration
2. NY Court Recommendation Engine + tests

### Batch 2 (8 parallel tasks)
3. Wizard wiring (state-step third card, enums)
4. NY Damages Calculator ($10K cap)
5. NY Child Support Calculator (CSSA)
6. NY Family Filing Prompts
7. NY Landlord-Tenant Prompts
8. NY Debt Defense Prompts
9. NY Simple Prompt Parameterization
10. NY Educational Content

### Batch 3 (Verification)
- Full test suite (~1107 tests)
- `npx next build` — zero errors

### Out of Scope
- Sub-county small claims limits
- NYSCEF e-filing integration (guidance/links only)
- States beyond TX/CA/NY

---

## Key NY Legal Research

### Court Structure
- Small Claims: up to $10,000 (NYC), $5,000 (city courts), $3,000 (town/village)
- Civil Court: up to $25,000 (NYC) / County Court: up to $25,000 (outside NYC)
- Supreme Court: unlimited civil jurisdiction (this is the TRIAL court)
- "Supreme Court" naming is counterintuitive — needs UI clarification

### Family Law
- Equitable distribution state (NOT community property)
- Child support: CSSA formula (17%/25%/29%/31% of combined income up to $193K)
- Divorce in Supreme Court; custody/support can be Supreme or Family Court
- Residency requirement: 1 year (or 2 years for certain grounds)
- New venue rule (CPLR 515, eff. 2/19/25): case heard where party or child resides

### Landlord-Tenant
- Rent Stabilization: applies to ~1M NYC apartments
- Good Cause Eviction Act (eff. 4/20/24): protects market-rate tenants
- Non-payment: 14-day notice to pay or quit
- Lease violation: 10-day notice to cure
- Housing Court (part of Civil Court) handles eviction proceedings

### Debt Collection
- CPLR § 3213: motion for summary judgment in lieu of complaint (instruments for money)
- SOL: 6 years for written contracts, 6 years for oral
- NY General Business Law § 349: deceptive consumer practices

### E-Filing
- NYSCEF (New York State Courts Electronic Filing) — mandatory in many courts
- More unified than CA, less unified than TX
