# Family Law Module — Design

**Date:** 2026-03-03
**Goal:** Add comprehensive family law support for 7 sub-types: divorce, child custody, child support, visitation, spousal support, protective orders, and modification of existing orders. Make it user-friendly for plaintiffs with zero legal knowledge.

## Problem

Selecting "Family matter" today produces a completely wrong workflow — civil litigation forms, wrong terminology (plaintiff/defendant instead of petitioner/respondent), no family-specific questions, wrong venue rules, wrong document formats, and no required provisions. The generated petition would be a generic "Original Petition" instead of the correct family law document.

## Architecture

### 9 Components

1. **Family Sub-Type Selection** — New step in case creation dialog for selecting specific family matter type
2. **Family Law Wizard** — Separate `FamilyLawWizard` component using `WizardShell` with sub-type-specific steps
3. **Texas Child Support Calculator** — Interactive calculator using Family Code Ch. 154 guidelines
4. **Safety Module** — Screening, resources, and safety planning for protective orders / DV cases
5. **Family Law Filing Prompts** — Sub-type-specific document format templates referencing Texas Family Code
6. **Family Law Venue Rules** — Update venue-helper for family-specific venue (domicile, child's home county)
7. **Database Migration** — `family_case_details` table for family-specific data (marriage, children, property)
8. **Family Law Task Chain** — Family-specific task seeding with 60-day waiting period, mediation, temporary orders
9. **Family Law Motions** — Temporary orders, protective order, modification, enforcement, mediation motions

### Sub-Type Wizard Steps

| Step | Divorce | Custody | Support | Visitation | Spousal | Protective | Modification |
|------|---------|---------|---------|------------|---------|------------|-------------|
| Preflight | x | x | x | x | x | x | x |
| Parties | x | x | x | x | x | x | x |
| Marriage | x | | | | x | | |
| Children | x | x | x | x | | | x |
| Residency/Venue | x | x | x | x | x | x | x |
| Property | x | | | | | | |
| Custody | x | x | | x | | | x |
| Support Calculator | x | x | x | | | | x |
| Spousal Support | x | | | | x | | x |
| Safety | x | x | | | | x | |
| Existing Orders | | | | | | | x |
| Grounds/Facts | x | x | x | x | x | x | x |
| Review | x | x | x | x | x | x | x |

### Child Support Calculator
- Texas Family Code Ch. 154 formula: 20% (1 child), 25% (2), 30% (3), 35% (4), 40% (5+)
- Applied to net resources (gross minus taxes, SS, health insurance, union dues)
- Cap on first $9,200/month of net resources

### Safety Module
- Safety screening at case creation when protective order selected
- Emergency resources: National DV Hotline (1-800-799-7233), Texas Council on Family Violence
- Safety planning checklist (safe devices, exit plan, document storage)
- Digital safety warning (shared devices, browser history)
- Expedited filing guidance (ex parte protective orders)

### Filing Prompts
- Divorce: Original Petition for Divorce (Family Code Ch. 6)
- Custody: SAPCR (Family Code Ch. 102)
- Child Support: Petition for Child Support
- Visitation: Petition for Access and Possession
- Spousal Support: Petition for Spousal Maintenance (Ch. 8)
- Protective Order: Application for Protective Order (Ch. 85)
- Modification: Petition to Modify (Ch. 156)

### Venue Rules
- Divorce: county of domicile (Family Code § 6.301), 90-day county / 6-month state residency
- SAPCR: child's home county (§ 103.001)
- Modification: court of continuing jurisdiction
- Protective Order: county of applicant or respondent residence

### Task Chain (Family)
welcome → family_intake → safety_screening (if DV) → evidence_vault → prepare_family_filing → file_with_court → service → waiting_period (divorce: 60 days) → temporary_orders → mediation → final_orders

## User Choices
- **Scope:** All 7 sub-types
- **Architecture:** Separate FamilyLawWizard component
- **Calculator:** Interactive child support calculator
- **Safety:** Full safety module with screening, resources, and planning
