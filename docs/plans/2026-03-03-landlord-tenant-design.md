# Landlord-Tenant Module — Design

**Date:** 2026-03-03
**Goal:** Add comprehensive landlord-tenant support as a top-level case type alongside Civil, Family, and Small Claims, with 8 sub-types, both landlord and tenant perspectives, demand letter generator, sub-type-specific filing prompts with Texas Property Code citations, and educational hearing/post-judgment steps. Amount-based court routing (JP/County/District) with eviction always JP.

## Problem

Landlord-tenant disputes are one of the highest-volume pro se case types in Texas courts. The existing `landlord_tenant` dispute type routes users through a generic civil litigation workflow — discovery, motion practice, formal pleading formats — that doesn't match how these cases actually proceed. Tenants facing eviction need guidance on notice periods and cure rights; landlords need forcible entry and detainer petitions; both sides need demand letters and hearing preparation specific to Texas Property Code.

## Architecture

### 10 Components

1. **Landlord-Tenant Sub-Type Selection** — New step in case creation dialog for selecting specific dispute type
2. **LandlordTenantWizard** — Separate wizard component using `WizardShell` with sub-type-specific steps
3. **Role-Adaptive Forms** — Wizard adapts labels and fields based on whether user is landlord or tenant
4. **Demand Letter Generator** — LT-specific demand letter with Texas Property Code citations
5. **LT Filing Prompts** — Sub-type-specific petition formats for JP/County/District courts
6. **Court Recommendation Override** — Eviction always routes to JP Court regardless of amount
7. **Database Migration** — `landlord_tenant_details` table for case-specific data
8. **Landlord-Tenant Task Chain** — 10-step chain with demand letter, hearing prep, post-judgment
9. **Educational Steps** — Service rules (door posting for eviction), hearing prep, hearing day, post-judgment enforcement
10. **Venue Rules** — Already implemented (property county primary, CPRC § 15.0115)

### Sub-Types (8)

| Sub-Type | Key | Typical Role | Typical Court |
|----------|-----|-------------|---------------|
| Eviction (Unlawful Detainer) | `eviction` | Landlord | JP Court (always) |
| Nonpayment of Rent | `nonpayment` | Landlord | JP Court |
| Security Deposit Dispute | `security_deposit` | Tenant | JP/County |
| Property Damage | `property_damage` | Either | JP/County |
| Repair & Maintenance | `repair_maintenance` | Tenant | JP/County |
| Lease Termination | `lease_termination` | Either | JP/County |
| Habitability Claim | `habitability` | Tenant | County/District |
| Other | `other` | Either | Amount-based |

### Wizard Steps

| Step | ID | All | Eviction | Nonpay | Sec.Dep | Prop.Dmg | Repair | Lease Term | Habit. | Other |
|------|----|-----|----------|--------|---------|----------|--------|------------|--------|-------|
| Preflight | preflight | x | x | x | x | x | x | x | x | x |
| Parties | parties | x | x | x | x | x | x | x | x | x |
| Property Details | property | x | x | x | x | x | x | x | x | x |
| Lease Details | lease | x | x | x | x | | | x | x | |
| Financial Details | financial | x | x | x | x | x | x | x | | x |
| Eviction Notice | eviction_notice | | x | x | | | | | | |
| Repair History | repairs | | | | | | x | | x | |
| Deposit Deductions | deductions | | | | x | | | | | |
| Timeline | timeline | | x | | x | x | x | | x | |
| Demand Letter Info | demand_info | x | x | x | x | x | x | x | x | x |
| Venue | venue | x | x | x | x | x | x | x | x | x |
| Review | review | x | x | x | x | x | x | x | x | x |

### Demand Letter Generator
- LT-specific demand letter type `landlord_tenant_demand_letter` in MOTION_REGISTRY
- Sub-type-specific templates:
  - Tenant: deposit return (Tex. Prop. Code § 92.104, 30-day return deadline)
  - Tenant: repair demand (warranty of habitability, Tex. Prop. Code § 92.052)
  - Landlord: rent payment demand (with notice-to-vacate language)
  - Landlord: lease violation cure demand
- Includes response deadline (default 14 days), consequence language
- Uses same `AnnotatedDraftViewer` for review

### Filing Prompts (Sub-Type-Specific Petitions)
- Caption adapts by court type: JP / County Court at Law / District Court
- Titles by sub-type and role:
  - Eviction: "PETITION FOR FORCIBLE ENTRY AND DETAINER" (landlord)
  - Nonpayment: "PETITION FOR NONPAYMENT OF RENT AND EVICTION" (landlord)
  - Security deposit: "PETITION FOR RETURN OF SECURITY DEPOSIT" (tenant)
  - Property damage: "PETITION FOR PROPERTY DAMAGES" (either)
  - Repair: "PETITION FOR REPAIR AND REMEDY" (tenant, Tex. Prop. Code § 92.0563)
  - Lease termination: "PETITION FOR BREACH OF LEASE AND TERMINATION" (either)
  - Habitability: "PETITION FOR BREACH OF WARRANTY OF HABITABILITY" (tenant)
- Texas Property Code citations: § 92 (deposits), § 92.052 (habitability), § 92.0563 (repair remedy)
- TRCP 500-507 for JP Court filings, standard TRCP for County/District
- DRAFT disclaimer and ANNOTATIONS section

### Task Chain (Landlord-Tenant)
```
welcome → landlord_tenant_intake → evidence_vault → prepare_demand_letter
→ prepare_landlord_tenant_filing → file_with_court → serve_other_party
→ prepare_for_hearing → hearing_day → post_judgment
```

### Educational Steps
- **serve_other_party** — Service methods for LT cases: certified mail, constable, posting on door for eviction (TRCP 510.4)
- **prepare_for_hearing** — What to bring (lease, photos, repair records), how to present, courtroom etiquette
- **hearing_day** — What happens at hearing, possible outcomes (judgment for possession, money judgment, dismissal)
- **post_judgment** — After ruling: enforcement (writ of possession for eviction), appeal rights (5 days for FED per TRCP 510.9), collection of money judgments

### Database
```
landlord_tenant_details
├── id (uuid PK)
├── case_id (uuid FK → cases, UNIQUE)
├── landlord_tenant_sub_type (enum: 8 values)
├── party_role (text: 'landlord' | 'tenant')
├── property_address (text)
├── property_type (text: 'house' | 'apartment' | 'condo' | 'commercial' | 'other')
├── unit_number (text)
├── lease_start_date (date)
├── lease_end_date (date)
├── lease_type (text: 'fixed_term' | 'month_to_month' | 'oral')
├── monthly_rent (numeric 10,2)
├── deposit_amount (numeric 10,2)
├── amount_claimed (numeric 10,2)
├── damages_breakdown (jsonb — array of {category, amount})
├── eviction_notice_date (date)
├── eviction_notice_type (text)
├── eviction_reason (text)
├── repair_requests (jsonb — array of {date, issue, response, status})
├── deposit_deductions (jsonb — array of {amount, reason})
├── habitability_issues (text)
├── demand_letter_sent (boolean default false)
├── demand_letter_date (date)
├── demand_deadline_days (integer default 14)
├── created_at (timestamptz)
├── updated_at (timestamptz)
```

### Venue Rules
- Already implemented in `venue-helper.ts`
- Property county is primary, defendant county is alternative
- Cites Tex. Civ. Prac. & Rem. Code § 15.0115
- No changes needed

### Court Recommendation
- Already handles `landlord_tenant` in `court-recommendation.ts`
- Add special case: eviction sub-type always returns JP Court
- All other sub-types use amount-based routing (< $20K JP, $20K-$200K County, > $200K District)

## User Choices
- **Scope:** Both landlord and tenant perspectives
- **Sub-types:** All 8 (7 named + Other)
- **Architecture:** Separate LandlordTenantWizard component (top-level case type)
- **Demand Letter:** LT-specific generator with Texas Property Code citations
- **Task Chain:** 10-step chain with post-judgment step
- **Court:** Amount-based routing, eviction always JP
- **Overlap:** Coexists with small claims security deposit (separate paths for simple vs. complex)
