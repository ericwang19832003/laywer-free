# Missing Dispute Type Workflows — Design

## Problem

Three dispute types defined in the schema — `contract`, `property`, and `other` — have no workflow phases in `WORKFLOW_PHASES`. They silently fall back to the generic civil workflow, giving users a generic experience instead of a tailored one.

## Approach

Fully specialized workflows for each type, matching the pattern used by personal_injury, family, debt_collection, landlord_tenant, and small_claims. Each type gets: sub-types in schema, detail table in DB, custom intake step, demand letter, petition wizard, tailored task chain with unlock logic, workflow phases, and step guidance entries.

---

## Contract Dispute

### Sub-types
| Value | Label |
|-------|-------|
| `breach_of_contract` | Breach of Contract |
| `non_payment` | Non-Payment |
| `fraud_misrepresentation` | Fraud/Misrepresentation |
| `warranty` | Warranty Dispute |
| `employment` | Employment Contract |
| `construction` | Construction Contract |
| `other_contract` | Other Contract Dispute |

### Detail Table: `contract_details`
- `contract_sub_type text NOT NULL`
- `contract_date date`
- `contract_amount numeric`
- `other_party_name text`
- `other_party_type text` (individual/business)
- `breach_description text`
- `damages_sought numeric`
- `has_written_contract boolean DEFAULT false`
- `contract_document_id uuid REFERENCES evidence_files(id)`

### Task Chain (13 tasks)
1. `welcome`
2. `contract_intake`
3. `evidence_vault`
4. `contract_demand_letter`
5. `contract_negotiation` (skippable)
6. `contract_prepare_filing`
7. `contract_file_with_court`
8. `contract_serve_defendant`
9. `contract_wait_for_answer`
10. `contract_review_answer`
11. `contract_discovery`
12. `contract_mediation` (skippable)
13. `contract_post_resolution`

### Phases
- **Getting Started**: welcome, contract_intake
- **Building Your Case**: evidence_vault, contract_demand_letter, contract_negotiation
- **Filing & Service**: contract_prepare_filing, contract_file_with_court, contract_serve_defendant
- **Litigation**: contract_wait_for_answer, contract_review_answer, contract_discovery, contract_mediation
- **Resolution**: contract_post_resolution

---

## Property Dispute

### Sub-types
| Value | Label |
|-------|-------|
| `boundary_dispute` | Boundary/Encroachment |
| `easement` | Easement Dispute |
| `title_defect` | Title Defect/Quiet Title |
| `trespass` | Trespass |
| `nuisance` | Nuisance |
| `hoa_dispute` | HOA Dispute |
| `real_estate_transaction` | Real Estate Transaction |
| `other_property` | Other Property Dispute |

### Detail Table: `property_dispute_details`
- `property_sub_type text NOT NULL`
- `property_address text`
- `property_type text` (residential/commercial/land)
- `other_party_name text`
- `other_party_relationship text` (neighbor/seller/buyer/hoa/other)
- `dispute_description text`
- `property_value numeric`
- `damages_sought numeric`
- `has_survey boolean DEFAULT false`
- `has_title_insurance boolean DEFAULT false`

### Task Chain (12 tasks)
1. `welcome`
2. `property_intake`
3. `evidence_vault`
4. `property_demand_letter`
5. `property_negotiation` (skippable)
6. `property_prepare_filing`
7. `property_file_with_court`
8. `property_serve_defendant`
9. `property_wait_for_answer`
10. `property_review_answer`
11. `property_discovery`
12. `property_post_resolution`

### Phases
- **Getting Started**: welcome, property_intake
- **Building Your Case**: evidence_vault, property_demand_letter, property_negotiation
- **Filing & Service**: property_prepare_filing, property_file_with_court, property_serve_defendant
- **Litigation**: property_wait_for_answer, property_review_answer, property_discovery
- **Resolution**: property_post_resolution

---

## Other Dispute

### Sub-types
| Value | Label |
|-------|-------|
| `consumer_protection` | Consumer Protection |
| `civil_rights` | Civil Rights Violation |
| `defamation` | Defamation/Libel/Slander |
| `harassment` | Harassment/Restraining Order |
| `insurance_dispute` | Insurance Dispute |
| `government_action` | Government Action |
| `general_civil` | General Civil Matter |

### Detail Table: `other_case_details`
- `other_sub_type text NOT NULL`
- `other_party_name text`
- `other_party_type text` (individual/business/government)
- `dispute_description text`
- `damages_sought numeric`
- `urgency text` (routine/time_sensitive/urgent)
- `has_prior_demand boolean DEFAULT false`

### Task Chain (11 tasks)
1. `welcome`
2. `other_intake`
3. `evidence_vault`
4. `other_demand_letter` (skippable)
5. `other_prepare_filing`
6. `other_file_with_court`
7. `other_serve_defendant`
8. `other_wait_for_answer`
9. `other_review_answer`
10. `other_discovery`
11. `other_post_resolution`

### Phases
- **Getting Started**: welcome, other_intake
- **Building Your Case**: evidence_vault, other_demand_letter
- **Filing & Service**: other_prepare_filing, other_file_with_court, other_serve_defendant
- **Litigation**: other_wait_for_answer, other_review_answer, other_discovery
- **Resolution**: other_post_resolution

---

## Files to Create/Modify

### Per Dispute Type (~30 files each)

**Schema & DB:**
- Modify: `src/lib/schemas/case.ts` — add sub-type enums
- Create: `supabase/migrations/YYYYMMDD_*_tables.sql` — detail table, seed_case_tasks branch, unlock_next_task branch

**Workflow:**
- Modify: `src/lib/workflow-phases.ts` — add phase definitions

**API:**
- Modify: `src/app/api/cases/route.ts` — handle sub-type, insert into details table

**Step Components:**
- Create: `src/components/step/{type}/{type}-intake-step.tsx`
- Create: `src/components/step/{type}/{type}-demand-letter-step.tsx`
- Create: `src/components/step/{type}/{type}-wizard.tsx` (petition builder)
- Create: `src/components/step/{type}/{type}-file-with-court-step.tsx`
- Create: `src/components/step/{type}/{type}-serve-defendant-step.tsx`
- Create: `src/components/step/{type}/{type}-wait-for-answer-step.tsx`
- Create: `src/components/step/{type}/{type}-review-answer-step.tsx`
- Create: `src/components/step/{type}/{type}-discovery-step.tsx`
- Create: `src/components/step/{type}/{type}-post-resolution-step.tsx`
- Create: `src/components/step/{type}/{type}-negotiation-step.tsx` (contract/property only)
- Create: `src/components/step/{type}/{type}-mediation-step.tsx` (contract only)

**Guided Step Configs:**
- Create: `src/lib/guided-steps/{type}/*.ts` — questionnaire configs for guided steps

**Step Router:**
- Modify: `src/app/(authenticated)/case/[id]/step/[taskId]/page.tsx` — add switch cases

**Step Guidance:**
- Modify: `src/lib/step-guidance.ts` — add entries for each custom task_key

**AI Prompts:**
- Create: `src/lib/rules/{type}-filing-prompts.ts` — petition generation prompts
- Create: `src/lib/rules/{type}-demand-letter-prompts.ts` — demand letter prompts

## Verification

For each dispute type:
1. Create a test case with each sub-type
2. Verify task chain is seeded correctly
3. Walk through every step — confirm content is contextually correct
4. Verify unlock chain progresses correctly
5. Verify sidebar phases and progress tracking
6. Verify right sidebar guidance for each task
7. Build passes with no errors
