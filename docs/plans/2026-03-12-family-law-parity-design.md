# Family Law Workflow Parity Design

**Goal:** Give each of the 7 family sub-types (divorce, custody, child_support, visitation, spousal_support, protective_order, modification) its own fully namespaced task chain with enriched intake, case_stage fast-forwarding, and shared guided step configs with sub-type-aware content.

**Architecture:** Fully namespaced task_keys per sub-type (~62 total). Shared guided step config files use factory functions to adapt questions/guidance based on sub_type parameter. Enriched intake collects sub-type-specific info and case_stage for mid-case import. DB migration renames existing family tasks and creates 7 new unlock chains.

---

## Task Chains

### Divorce (12 tasks)
```
welcome → divorce_intake → divorce_safety_screening → divorce_evidence_vault
→ divorce_prepare_filing → divorce_file_with_court → divorce_serve_respondent
→ divorce_waiting_period → divorce_temporary_orders* → divorce_mediation*
→ divorce_property_division → divorce_final_orders
```

### Custody (10 tasks)
```
welcome → custody_intake → custody_safety_screening → custody_evidence_vault
→ custody_prepare_filing → custody_file_with_court → custody_serve_respondent
→ custody_temporary_orders* → custody_mediation → custody_final_orders
```

### Child Support (8 tasks)
```
welcome → child_support_intake → child_support_evidence_vault
→ child_support_prepare_filing → child_support_file_with_court
→ child_support_serve_respondent → child_support_temporary_orders*
→ child_support_final_orders
```

### Visitation (9 tasks)
```
welcome → visitation_intake → visitation_safety_screening
→ visitation_evidence_vault → visitation_prepare_filing
→ visitation_file_with_court → visitation_serve_respondent
→ visitation_mediation → visitation_final_orders
```

### Spousal Support (8 tasks)
```
welcome → spousal_support_intake → spousal_support_evidence_vault
→ spousal_support_prepare_filing → spousal_support_file_with_court
→ spousal_support_serve_respondent → spousal_support_temporary_orders*
→ spousal_support_final_orders
```

### Protective Order (6 tasks)
```
welcome → po_intake → po_safety_screening → po_prepare_filing
→ po_file_with_court → po_hearing
```

### Modification (9 tasks)
```
welcome → mod_intake → mod_evidence_vault → mod_existing_order_review
→ mod_prepare_filing → mod_file_with_court → mod_serve_respondent
→ mod_mediation* → mod_final_orders
```

`*` = skippable from sidebar

---

## Workflow Phases

### Divorce
- Getting Started: `welcome`, `divorce_intake`, `divorce_safety_screening`
- Building Your Case: `divorce_evidence_vault`
- Filing & Service: `divorce_prepare_filing`, `divorce_file_with_court`, `divorce_serve_respondent`
- Pre-Trial: `divorce_waiting_period`, `divorce_temporary_orders`, `divorce_mediation`
- Resolution: `divorce_property_division`, `divorce_final_orders`

### Custody
- Getting Started: `welcome`, `custody_intake`, `custody_safety_screening`
- Building Your Case: `custody_evidence_vault`
- Filing & Service: `custody_prepare_filing`, `custody_file_with_court`, `custody_serve_respondent`
- Pre-Trial: `custody_temporary_orders`, `custody_mediation`
- Resolution: `custody_final_orders`

### Child Support
- Getting Started: `welcome`, `child_support_intake`
- Building Your Case: `child_support_evidence_vault`
- Filing & Service: `child_support_prepare_filing`, `child_support_file_with_court`, `child_support_serve_respondent`
- Resolution: `child_support_temporary_orders`, `child_support_final_orders`

### Visitation
- Getting Started: `welcome`, `visitation_intake`, `visitation_safety_screening`
- Building Your Case: `visitation_evidence_vault`
- Filing & Service: `visitation_prepare_filing`, `visitation_file_with_court`, `visitation_serve_respondent`
- Pre-Trial: `visitation_mediation`
- Resolution: `visitation_final_orders`

### Spousal Support
- Getting Started: `welcome`, `spousal_support_intake`
- Building Your Case: `spousal_support_evidence_vault`
- Filing & Service: `spousal_support_prepare_filing`, `spousal_support_file_with_court`, `spousal_support_serve_respondent`
- Resolution: `spousal_support_temporary_orders`, `spousal_support_final_orders`

### Protective Order
- Getting Started: `welcome`, `po_intake`, `po_safety_screening`
- Filing & Hearing: `po_prepare_filing`, `po_file_with_court`
- Resolution: `po_hearing`

### Modification
- Getting Started: `welcome`, `mod_intake`
- Building Your Case: `mod_evidence_vault`, `mod_existing_order_review`
- Filing & Service: `mod_prepare_filing`, `mod_file_with_court`, `mod_serve_respondent`
- Resolution: `mod_mediation`, `mod_final_orders`

---

## Skippable Tasks

```
divorce_temporary_orders
divorce_mediation
custody_temporary_orders
child_support_temporary_orders
spousal_support_temporary_orders
mod_mediation
```

Not skippable: `custody_mediation` (mandatory §153.0071), `visitation_mediation` (same statute). Protective order has no skippable tasks.

---

## Enriched Intake

Each sub-type intake collects sub-type-specific fields plus a `case_stage` selector.

### Shared Fields (all intakes)
- County
- case_stage selector (options vary by sub-type)
- Contested vs. uncontested (where applicable)

### Sub-Type-Specific Fields

| Intake | Extra Fields |
|--------|-------------|
| divorce_intake | Marriage date, separation date, children (yes/no), community property (yes/no) |
| custody_intake | Number of children, current living arrangement, existing orders (yes/no) |
| child_support_intake | Number of children, employment status, existing support order (yes/no) |
| visitation_intake | Number of children, current custody arrangement, relationship to children |
| spousal_support_intake | Marriage date, marriage duration, employment status |
| po_intake | Relationship to respondent, type of abuse, immediate danger (yes/no) |
| mod_intake | Existing order court & cause number, what to modify, change in circumstances |

### Case Stage Options

| Sub-type | Stages |
|----------|--------|
| Divorce | start, filed, served, waiting_period, temporary_orders, mediation |
| Custody | start, filed, served, temporary_orders, mediation |
| Child Support | start, filed, served |
| Visitation | start, filed, served, mediation |
| Spousal Support | start, filed, served |
| Protective Order | start, filed |
| Modification | start, filed, served, mediation |

---

## Shared Guided Step Configs

One config file per step type, adapts via sub_type parameter.

| File | Used By | Key Adaptations |
|------|---------|----------------|
| `family-intake-factory.ts` | All 7 intakes | Different questions per sub-type |
| `family-safety-screening.ts` | divorce, custody, visitation, po | Shared DV screening. PO gets stronger "file immediately" guidance |
| `family-evidence-vault.ts` | divorce, custody, child_support, visitation, spousal_support, mod | Checklist varies: divorce adds property docs, custody adds school records, child_support adds income/tax docs |
| `family-file-with-court.ts` | All 7 | Filing method, fee, court type. PO mentions fee waiver. Modification mentions original court |
| `family-serve-respondent.ts` | All except PO | Service method, timeline. PO skips this (court handles service) |
| `family-waiting-period.ts` | divorce only | Existing config, adapted. 60-day TX requirement |
| `family-temporary-orders.ts` | divorce, custody, child_support, spousal_support | Existing config, adapted per sub-type |
| `family-mediation.ts` | divorce, custody, visitation, mod | Existing config, adapted. Custody/visitation notes mandatory mediation (§153.0071) |
| `family-final-orders.ts` | All except PO | Existing config, adapted. Divorce: decree. Custody: SAPCR order. Child support: support order with wage withholding |
| `family-prepare-filing.ts` | All 7 | Pre-filing checklist, routes to existing FamilyLawWizard |
| `family-property-division.ts` | divorce only | New — community vs separate property, inventory, valuation |
| `family-existing-order-review.ts` | mod only | New — upload existing order, identify provisions to modify, change-in-circumstances |
| `po-hearing.ts` | PO only | New — 14-day hearing timeline, evidence of abuse, safety plan |

---

## Milestones

7 milestone arrays, one per sub-type. `getMilestones()` gains optional `familySubType` parameter.

| Sub-type | Milestones |
|----------|-----------|
| Divorce | start, filed, served, waiting_period, temporary_orders, mediation, final |
| Custody | start, filed, served, temporary_orders, mediation, final |
| Child Support | start, filed, served, final |
| Visitation | start, filed, served, mediation, final |
| Spousal Support | start, filed, served, final |
| Protective Order | start, filed |
| Modification | start, filed, served, mediation, final |

---

## DB Migration

1. Rename existing family tasks for existing cases (read `family_sub_type` from `family_case_details`)
2. Insert sub-type-specific tasks that didn't exist (property_division, existing_order_review, po_hearing)
3. Remove tasks that don't apply per sub-type
4. Update `seed_case_tasks()` — 7 new family branches replacing single `family` branch
5. Update `unlock_next_task()` — 7 new chains with case_stage branching on each intake

---

## Files to Modify

| File | Change |
|------|--------|
| `src/lib/workflow-phases.ts` | 7 new family sub-type entries, remove old `family` entry |
| `src/lib/step-guidance.ts` | ~62 new entries, remove old family entries |
| `src/lib/rules/milestones.ts` | 7 new milestone arrays, update dispatch, add familySubType param |
| `src/components/case/workflow-sidebar.tsx` | 6 new skippable tasks, remove old family ones |
| `src/app/(authenticated)/case/[id]/step/[taskId]/page.tsx` | ~62 new cases, remove old family cases |
| DB migration (new file) | Full migration |

## Files to Create

| File | Content |
|------|---------|
| `src/lib/guided-steps/family/family-intake-factory.ts` | Factory for all 7 intake configs |
| `src/lib/guided-steps/family/family-safety-screening.ts` | Shared DV screening config |
| `src/lib/guided-steps/family/family-evidence-vault.ts` | Sub-type-aware evidence checklist |
| `src/lib/guided-steps/family/family-file-with-court.ts` | Shared filing guidance |
| `src/lib/guided-steps/family/family-serve-respondent.ts` | Shared service guidance |
| `src/lib/guided-steps/family/family-prepare-filing.ts` | Pre-filing checklist |
| `src/lib/guided-steps/family/family-property-division.ts` | Divorce-only property division |
| `src/lib/guided-steps/family/family-existing-order-review.ts` | Modification-only existing order |
| `src/lib/guided-steps/family/po-hearing.ts` | PO-only hearing prep |

## Files to Refactor

| File | Change |
|------|--------|
| `src/lib/guided-steps/family/waiting-period.ts` | Add sub-type parameter support |
| `src/lib/guided-steps/family/temporary-orders.ts` | Add sub-type parameter support |
| `src/lib/guided-steps/family/mediation.ts` | Add sub-type parameter support |
| `src/lib/guided-steps/family/final-orders.ts` | Add sub-type parameter support |

---

## What Stays the Same

- `FamilyLawWizard` — already branches by sub-type, just gets different task_keys routing to it
- `SafetyScreeningStep` component — reused, mapped to new task_keys
- Case creation flow — already collects `family_sub_type`
- `family_case_details` table — no schema changes
- Child support calculator — unchanged
