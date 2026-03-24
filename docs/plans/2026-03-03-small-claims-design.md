# Small Claims Module — Design

**Date:** 2026-03-03
**Goal:** Add comprehensive small claims support as a top-level case type alongside Civil and Family, with 8 sub-types, interactive damages calculator, AI demand letter generator, and simplified JP Court filing. Make it user-friendly for plaintiffs with zero legal knowledge.

## Problem

Selecting "Civil lawsuit" today routes small claims users through a complex civil litigation workflow — discovery, motion practice, formal pleading formats — none of which apply to Texas JP Court small claims (TRCP 500-507). The existing JP Court filing prompt is buried behind amount-based routing and doesn't provide the guided experience small claims plaintiffs need: demand letter drafting, damages itemization, hearing preparation.

## Architecture

### 9 Components

1. **Small Claims Sub-Type Selection** — New step in case creation dialog for selecting specific claim type
2. **Small Claims Wizard** — Separate `SmallClaimsWizard` component using `WizardShell` with sub-type-specific steps
3. **Damages Calculator** — Interactive itemized calculator with $20,000 cap warning
4. **Demand Letter Generator** — AI-powered demand letter with response deadline and consequence language
5. **Small Claims Filing Prompts** — Sub-type-specific JP Court petition format (TRCP 500-507)
6. **Small Claims Venue Rules** — Update venue-helper for JP Court venue (defendant residence or obligation performance)
7. **Database Migration** — `small_claims_details` table for claim-specific data
8. **Small Claims Task Chain** — Simplified 9-step chain with demand letter, hearing prep
9. **Educational Steps** — Service rules, hearing preparation, hearing day guidance

### Sub-Types (8)

| Sub-Type | Key | Typical Evidence |
|----------|-----|-----------------|
| Security deposit dispute | `security_deposit` | Lease, move-in/out photos, itemized deductions |
| Breach of contract | `breach_of_contract` | Contract, communications, proof of non-performance |
| Consumer refund | `consumer_refund` | Receipt, product info, refund request records |
| Property damage | `property_damage` | Photos, repair estimates, incident documentation |
| Car accident damages | `car_accident` | Police report, photos, repair estimates, insurance |
| Neighbor dispute | `neighbor_dispute` | Photos, communications, HOA records if applicable |
| Unpaid loan | `unpaid_loan` | Loan agreement, payment records, communications |
| Other small claim | `other` | Varies by situation |

### Wizard Steps

| Step | All | Sec. Dep. | Contract | Refund | Property | Car | Neighbor | Loan | Other |
|------|-----|-----------|----------|--------|----------|-----|----------|------|-------|
| Preflight | x | x | x | x | x | x | x | x | x |
| Parties | x | x | x | x | x | x | x | x | x |
| Claim Details | x | x | x | x | x | x | x | x | x |
| Damages Calculator | x | x | x | x | x | x | x | x | x |
| Timeline | | x | x | | | x | | x | |
| Demand Letter Info | x | x | x | x | x | x | x | x | x |
| Venue | x | x | x | x | x | x | x | x | x |
| Review | x | x | x | x | x | x | x | x | x |

### Damages Calculator
- Interactive add/remove line items (category + amount)
- Running total display
- Amber warning at $18,000+ (approaching cap)
- Red warning at $20,000+ (exceeds JP Court jurisdiction)
- $20,000 cap per Texas Government Code § 27.031

### Demand Letter Generator
- AI-generated professional demand letter
- Includes: specific facts, itemized damages, response deadline (default 14 days), consequence of non-response (small claims filing)
- Uses same generate-filing API + MOTION_REGISTRY pattern
- Same AnnotatedDraftViewer for review

### Filing Prompts (JP Court Petition)
- Caption: "In the Justice Court, Precinct ___, [County] County, Texas"
- Title: "PLAINTIFF'S ORIGINAL PETITION (SMALL CLAIMS)"
- Sub-type-specific fact sections in plain language
- Damages itemization table
- Prayer for relief
- Verification (sworn statement)
- Pro Se signature block
- TRCP 500-507 compliance

### Venue Rules
- Defendant's county of residence (TRCP 502.4)
- OR county where obligation was to be performed
- Simpler than civil (no federal) or family (no domicile/SAPCR)

### Task Chain (Small Claims)
```
welcome → small_claims_intake → evidence_vault → prepare_demand_letter
→ prepare_small_claims_filing → file_with_court → serve_defendant
→ prepare_for_hearing → hearing_day
```

### Educational Steps
- **serve_defendant** — Small claims service: certified mail, constable, or process server (TRCP 501.2)
- **prepare_for_hearing** — What to bring, how to present, courtroom etiquette, what judge expects
- **hearing_day** — Day-of checklist, what happens at hearing, possible outcomes

### Database
```
small_claims_details
├── id (uuid PK)
├── case_id (uuid FK → cases, UNIQUE)
├── claim_sub_type (enum: 8 values)
├── claim_amount (numeric 10,2)
├── damages_breakdown (jsonb array of {category, amount})
├── incident_date (date)
├── incident_description (text)
├── demand_letter_sent (boolean default false)
├── demand_letter_date (date)
├── demand_deadline_days (integer default 14)
├── defendant_is_business (boolean default false)
├── defendant_business_name (text)
├── lease_start_date (date) — security deposit
├── lease_end_date (date) — security deposit
├── deposit_amount (numeric) — security deposit
├── contract_date (date) — contract/refund
├── loan_date (date) — unpaid loan
├── loan_amount (numeric) — unpaid loan
├── accident_date (date) — car accident
├── created_at (timestamptz)
├── updated_at (timestamptz)
```

## User Choices
- **Scope:** All 8 sub-types (7 named + Other)
- **Architecture:** Separate SmallClaimsWizard component (top-level case type)
- **Calculator:** Interactive damages calculator with $20,000 cap
- **Demand Letter:** AI-powered generator before filing
- **Task Chain:** 9-step simplified chain
- **Court:** Always JP Court (Justice of the Peace)
