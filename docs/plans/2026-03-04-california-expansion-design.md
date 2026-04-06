# California Expansion Design

**Goal:** Expand the application from Texas-only to support California, following CA laws and court structures across all 6 case modules (small claims, contract/property, family law, landlord-tenant, debt collection, personal injury).

**Architecture:** Hybrid approach — typed state config objects for simple data (thresholds, SOL, court types, statutes), separate state-specific modules for complex logic (child support calculator, family law prompts, landlord-tenant prompts).

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind, Supabase, Anthropic Claude API, Zod, vitest

---

## Section 1: State Config System & Data Model

### StateConfig Type

```typescript
// src/lib/states/types.ts
type StateCode = 'TX' | 'CA'

interface CourtType {
  value: string        // e.g., 'small_claims', 'jp'
  label: string        // e.g., 'Small Claims Court'
  maxAmount?: number   // jurisdictional limit
}

interface StateConfig {
  code: StateCode
  name: string         // 'Texas' | 'California'
  courtTypes: CourtType[]
  thresholds: {
    smallClaimsMax: number
    // other limits
  }
  statuteOfLimitations: {
    personalInjury: number  // years
    writtenContract: number
    oralContract: number
    propertyDamage: number
  }
  statutes: Record<string, string>  // key → citation string
  filingFees: Record<string, { min: number; max: number }>
}
```

### Court Type Mapping

| Texas | California |
|-------|-----------|
| JP Court (up to $20K) | Small Claims (up to $12,500) |
| County Court ($200-$200K) | Limited Civil ($12,501-$35K) |
| District Court (>$200K or equity) | Unlimited Civil (>$35K) |
| Federal | Federal |

CA court types: `'small_claims' | 'limited_civil' | 'unlimited_civil' | 'federal'`

### Database Changes

- `cases` table: add `state VARCHAR(2) NOT NULL DEFAULT 'TX'`
- CHECK constraint: `state IN ('TX', 'CA')`
- Index: `idx_cases_state`
- Backfill: all existing rows get `'TX'`

---

## Section 2: Prompt Builder Refactoring

### Simple Prompts (Parameterized)

Prompt builders that currently hardcode Texas statutes/thresholds get refactored to accept `stateConfig`:

- `buildDemandLetterPrompt` — swap Tex. Bus. & Com. Code citations for CA Civil Code
- `buildPiDemandLetterPrompt` — swap Tex. Ins. Code § 542 for CA Insurance Code § 790.03
- `buildPiPetitionPrompt` — swap TX court captions for CA court captions
- `buildSmallClaimsFilingPrompt` — swap TX JP rules for CA Small Claims rules

Pattern: `buildXPrompt(facts, stateConfig)` — prompt builder reads statutes/thresholds from config.

### Complex Prompts (State Modules)

Prompts with fundamentally different legal logic get separate state modules:

**Family Law:**
- `src/lib/states/tx/prompts/tx-family-filing-prompts.ts` (existing logic, extracted)
- `src/lib/states/ca/prompts/ca-family-filing-prompts.ts` (community property, CA Family Code)
- `src/lib/states/ca/calculators/ca-child-support-calculator.ts` (formula: CS = K × (HN - H% × TN))
- Router: `getFamilyFilingPromptBuilder(state)` returns the right module

**Landlord-Tenant:**
- `src/lib/states/tx/prompts/tx-landlord-tenant-prompts.ts` (existing logic, extracted)
- `src/lib/states/ca/prompts/ca-landlord-tenant-prompts.ts` (Tenant Protection Act, just-cause eviction, rent control, 30/60-day notices)
- Router: `getLandlordTenantPromptBuilder(state)` returns the right module

**Debt Defense:**
- `src/lib/states/ca/prompts/ca-debt-defense-prompts.ts` (Rosenthal Act supplements FDCPA, CA SOL differences)
- Router: `getDebtDefensePromptBuilder(state)`

---

## Section 3: Case Creation Wizard & Court Routing

### State Selection Step
- New first step in `new-case-dialog.tsx` wizard
- Two-card selector: Texas / California (extensible later)
- Selected state propagates to all downstream steps and API

### Court Type Routing
- `court-type-step.tsx` becomes state-aware — renders options from `stateConfig.courtTypes`
- Auto-routing logic uses `stateConfig.thresholds`
- County selector works for both states (CA 58 counties, TX 254)

### API Changes
- `createCaseSchema`: add `state: z.enum(['TX', 'CA']).default('TX')`
- `POST /api/cases`: inserts `state` into `cases` table
- Downstream APIs read `state` from case row, pass to prompt builders

### Backward Compatibility
- Default `'TX'` — existing cases unaffected
- No breaking changes

---

## Section 4: Component & UI Refactoring

### State-Aware Components

| Component | Change |
|-----------|--------|
| `court-type-step.tsx` | Reads `state` → renders court options from `stateConfig.courtTypes` |
| `county-step.tsx` | CA county data source |
| SOL warnings | Read `stateConfig.statuteOfLimitations[type]` |
| Threshold displays | Read `stateConfig.thresholds` |
| Filing fee references | Read `stateConfig.filingFees` |

### Educational Content
- Simple steps: parameterize with `stateConfig` for statutes/deadlines
- Complex steps: state-specific content modules in `src/lib/states/{tx,ca}/educational/`
- Pattern: `getEducationalContent(state, stepKey)` returns section titles + body

### DraftViewer / Filing Output
- No changes — AI output is state-aware via prompt builders

---

## Section 5: Database Migration & Triggers

### Schema
- `cases.state VARCHAR(2) NOT NULL DEFAULT 'TX'` with CHECK constraint
- Backfill existing rows to `'TX'`
- Index on `state` column

### Triggers
- `seed_case_tasks()`: reads `NEW.state` but task chains are identical between states (content differs via prompts, not structure)
- `unlock_next_task()`: same transitions for both states, no state-specific branching
- RLS: no changes (user-scoped, not state-scoped)

**Key insight:** Database layer is state-agnostic for task management. State-specific behavior lives in the application layer.

---

## Section 6: Testing Strategy

### Unit Tests
- State config module tests (~10)
- CA prompt builder tests mirroring TX (~30-40)
- CA child support calculator tests (~15-20)
- Schema/wizard tests (~5-10)
- Total: ~60-75 new tests

### Parameterized Tests
- TX tests stay as-is (no regression)
- CA tests verify CA-specific statutes, court labels, thresholds
- `getStateConfig()` tested for both states

### What We Don't Test
- AI output content (non-deterministic)
- County lists (static data)

---

## Section 7: Migration & Rollout Strategy

### Phased Approach
1. **Phase 1 — Foundation:** State config, DB migration, wizard state step, schema
2. **Phase 2 — Simple Modules:** Small claims, contract/property, debt collection (threshold/statute parameterization)
3. **Phase 3 — Complex Modules:** Family law, landlord-tenant, personal injury (CA-specific logic)
4. **Phase 4 — Polish:** CA county data, filing fees, e-filing guidance, educational content

### Risk Mitigation
- TX default = zero disruption
- Each phase independently deployable
- State selection IS the feature gate (no feature flags needed)

### Out of Scope
- States beyond TX and CA
- CA e-filing API integration (guidance/links only)
- CA court-specific local rules (general CA law only)
- Spanish language support

---

## Key CA Legal Research

### Court Structure
- Small Claims: up to $12,500 (individuals), $5,000 (businesses)
- Limited Civil: $12,501-$35,000
- Unlimited Civil: over $35,000
- All housed in Superior Court (no separate JP/County courts)

### Statute of Limitations
- Personal injury: 2 years (CCP § 335.1)
- Written contract: 4 years (CCP § 337)
- Oral contract: 2 years (CCP § 339)
- Property damage: 3 years (CCP § 338)

### Family Law
- Community property state (50/50 presumption)
- Child support: formula-based CS = K × (HN - H% × TN)
- No-fault divorce (irreconcilable differences)
- 6-month residency requirement

### Landlord-Tenant
- Tenant Protection Act (AB 1482): just-cause eviction, rent caps
- 30-day notice (<1 year tenancy), 60-day notice (>1 year)
- Rent control: max 5% + CPI increase
- Habitability: Green v. Superior Court standard

### Debt Collection
- Rosenthal Fair Debt Collection Practices Act (supplements FDCPA)
- Applies to original creditors (broader than federal FDCPA)
- CA SOL: written 4 years, oral 2 years, credit card 4 years

### E-Filing
- eFileCA (Odyssey), TrueFiling — county-specific portals
- Not unified like eFileTexas
