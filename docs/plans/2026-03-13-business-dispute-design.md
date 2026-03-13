# Business Dispute Workflow Design

**Goal:** Add a `business` dispute type with three branching sub-workflows (partnership/LLC, employment, B2B commercial), following the family law pattern of sub-type-specific task chains.

**Date:** 2026-03-13

---

## Dispute Type & Sub-Types

New top-level dispute type: `business`

### Sub-type categories (12 sub-types)

**Partnership/LLC:**
- `breach_fiduciary` — Breach of fiduciary duty
- `profit_loss` — Profit/loss dispute
- `dissolution_buyout` — Dissolution or buyout
- `management_deadlock` — Management deadlock

**Employment:**
- `wrongful_termination` — Wrongful termination
- `wage_overtime` — Wage or overtime dispute
- `non_compete_nda` — Non-compete or NDA violation
- `discrimination_harassment` — Discrimination or harassment

**B2B Commercial:**
- `vendor_service` — Vendor or service dispute
- `ip_trade_secret` — IP or trade secret misappropriation
- `unfair_competition` — Unfair competition
- `breach_of_contract` — Breach of contract

---

## Sub-Workflows

All task keys use `biz_` prefix. Shared `welcome` task across all three.

### Partnership/LLC (11 tasks)

```
Getting Started:     welcome → biz_partnership_intake
Building Your Case:  biz_partnership_evidence → biz_partnership_demand_letter* → biz_partnership_adr*
Filing & Service:    biz_partnership_prepare_filing → biz_partnership_file_with_court → biz_partnership_serve_defendant
Litigation:          biz_partnership_wait_for_answer → biz_partnership_discovery
Resolution:          biz_partnership_post_resolution
```

- `biz_partnership_adr` — Guided step for mediation/arbitration review. Checks if partnership agreement has mandatory ADR clause. Skippable.

### Employment (12 tasks)

```
Getting Started:     welcome → biz_employment_intake
Building Your Case:  biz_employment_evidence → biz_employment_demand_letter* → biz_employment_eeoc*
Filing & Service:    biz_employment_prepare_filing → biz_employment_file_with_court → biz_employment_serve_defendant
Litigation:          biz_employment_wait_for_answer → biz_employment_discovery
Resolution:          biz_employment_post_resolution
```

- `biz_employment_eeoc` — Guided step for EEOC/TWC complaint filing. Critical for discrimination/harassment claims. Skippable for other sub-types.

### B2B Commercial (11 tasks)

```
Getting Started:     welcome → biz_b2b_intake
Building Your Case:  biz_b2b_evidence → biz_b2b_demand_letter* → biz_b2b_negotiation*
Filing & Service:    biz_b2b_prepare_filing → biz_b2b_file_with_court → biz_b2b_serve_defendant
Litigation:          biz_b2b_wait_for_answer → biz_b2b_discovery
Resolution:          biz_b2b_post_resolution
```

**Skippable tasks** (marked with *): All demand letter, ADR, EEOC, and negotiation steps.

**Total:** 34 unique tasks (33 `biz_*` + shared `welcome`)

---

## Milestones (per sub-workflow)

Each sub-workflow gets 5 milestones for mid-case onboarding:

| Milestone | Partnership | Employment | B2B |
|-----------|------------|------------|-----|
| `start` | Just getting started | Just getting started | Just getting started |
| `demand_sent` | Sent demand / attempted ADR | Sent demand letter | Sent demand letter |
| `filed` | Filed with court | Filed complaint (or EEOC) | Filed with court |
| `served` | Served the other party | Served the other party | Served the other party |
| `in_litigation` | In active litigation | In active litigation | In active litigation |

---

## Intake Components (3 custom components)

### biz-partnership-intake-step.tsx
Fields: county, business name, business type (partnership/LLC/corporation/other), partner names, ownership percentages, formation state, has operating/partnership agreement, dispute description, damages sought, case stage.

### biz-employment-intake-step.tsx
Fields: county, employer name, employer size (small/medium/large), position title, employment start date, employment end date, HR complaint filed (yes/no), has employment contract, has employee handbook, dispute description, damages sought, case stage.

### biz-b2b-intake-step.tsx
Fields: county, other business name, contract type (service/vendor/licensing/distribution/other), contract date, contract amount, has written contract, dispute description, damages sought, case stage.

---

## Guided Step Configs (25 files)

### Partnership (8 configs)
- `biz-partnership-evidence.ts` — Business records, financial statements, communications, agreements
- `biz-partnership-demand-letter.ts` — Partner-specific demand addressing fiduciary duties, profit disputes
- `biz-partnership-adr.ts` — Check for mandatory ADR, mediation/arbitration guidance
- `biz-partnership-file-with-court.ts` — Court filing guidance for business litigation
- `biz-partnership-serve-defendant.ts` — Service on business entities (registered agent, etc.)
- `biz-partnership-wait-for-answer.ts` — Waiting period, what to expect from opposing counsel
- `biz-partnership-discovery.ts` — Business document requests, depositions, interrogatories
- `biz-partnership-post-resolution.ts` — Judgment enforcement, business restructuring, dissolution steps

### Employment (9 configs)
- `biz-employment-evidence.ts` — Pay stubs, emails, HR records, performance reviews, witness statements
- `biz-employment-demand-letter.ts` — Employment-specific demand (wrongful termination, wages owed, etc.)
- `biz-employment-eeoc.ts` — EEOC/TWC complaint filing (required for discrimination/harassment before lawsuit)
- `biz-employment-file-with-court.ts` — Employment lawsuit filing guidance
- `biz-employment-serve-defendant.ts` — Service on employer (registered agent, HR department)
- `biz-employment-wait-for-answer.ts` — Employer response timeline, what to expect
- `biz-employment-discovery.ts` — Personnel file requests, company policy discovery
- `biz-employment-post-resolution.ts` — Settlement enforcement, reinstatement, reference letters

### B2B Commercial (8 configs)
- `biz-b2b-evidence.ts` — Contracts, invoices, communications, deliverables, financial records
- `biz-b2b-demand-letter.ts` — Commercial demand for breach, payment, or performance
- `biz-b2b-negotiation.ts` — Business negotiation strategies, settlement considerations
- `biz-b2b-file-with-court.ts` — Commercial litigation filing guidance
- `biz-b2b-serve-defendant.ts` — Service on business entities
- `biz-b2b-wait-for-answer.ts` — Response timeline, counterclaim possibilities
- `biz-b2b-discovery.ts` — Document requests, interrogatories for commercial disputes
- `biz-b2b-post-resolution.ts` — Judgment collection, business relationship decisions

---

## DB Migration

### business_details table
Shared table with sub-type-specific nullable columns:

```sql
CREATE TABLE public.business_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL UNIQUE,
  business_sub_type text NOT NULL,
  -- Partnership fields
  business_name text,
  business_type text, -- partnership, llc, corporation, other
  partner_names text,
  ownership_percentages text,
  formation_state text,
  has_operating_agreement boolean,
  -- Employment fields
  employer_name text,
  employer_size text, -- small, medium, large
  position_title text,
  employment_start_date date,
  employment_end_date date,
  hr_complaint_filed boolean,
  has_employment_contract boolean,
  has_employee_handbook boolean,
  -- B2B fields
  other_business_name text,
  contract_type text, -- service, vendor, licensing, distribution, other
  contract_date date,
  contract_amount numeric,
  has_written_contract boolean,
  -- Shared fields
  dispute_description text,
  damages_sought numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### seed_case_tasks() update
Three `IF` branches keyed on `business_sub_type` from case metadata, similar to family law's sub-type branching.

### unlock_next_task() update
Three task chains with case_stage conditional branching per sub-workflow.

---

## Files Summary

| Category | Files | Count |
|----------|-------|-------|
| Guided step configs | `src/lib/guided-steps/business/` | 25 |
| Intake components | `src/components/step/business/` | 3 |
| Schema | `src/lib/schemas/case.ts` | 1 (modify) |
| Workflow phases | `src/lib/workflow-phases.ts` | 1 (modify) |
| Step guidance | `src/lib/step-guidance.ts` | 1 (modify) |
| Milestones | `src/lib/rules/milestones.ts` | 1 (modify) |
| Sidebar skippable | `workflow-sidebar.tsx` | 1 (modify) |
| Dashboard skippable | `next-step-card.tsx` | 1 (modify) |
| Page routing | `page.tsx` | 1 (modify) |
| Dispute type wizard | `dispute-type-step.tsx` | 1 (modify) |
| Court recommendation | `court-recommendation.ts` | 1 (modify) |
| DB migration | `supabase/migrations/` | 1 (create) |
| **Total** | | **~38** |

---

## Pattern Reference

Follows the same patterns as:
- **Family law** — Sub-type branching via `businessSubType` parameter (like `familySubType`)
- **Real estate** — Guided step config structure, intake component, milestone system
- **All workflows** — `biz_` prefix convention, PetitionWizard for filing steps
