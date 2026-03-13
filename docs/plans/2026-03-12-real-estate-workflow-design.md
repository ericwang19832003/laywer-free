# Real Estate Workflow Design

**Goal:** Add a top-level `real_estate` dispute type with a dedicated 12-task workflow covering transactions, liens, deed issues, and related disputes — following the same patterns as contract/property workflows.

**Date:** 2026-03-12

---

## 1. Data Model

### New Dispute Type

`real_estate` becomes a top-level `dispute_type` value (alongside `contract`, `property`, `family`, etc.).

The existing wizard option `{ id: 'real_estate', value: 'property' }` changes to `{ id: 'real_estate', value: 'real_estate' }`.

### Sub-types (8 values)

| Sub-type | Label |
|----------|-------|
| `failed_closing` | Failed closing / deal fell through |
| `seller_disclosure` | Seller failed to disclose defects |
| `buyer_breach` | Buyer breached purchase agreement |
| `title_defect` | Title defect or cloud on title |
| `earnest_money` | Earnest money dispute |
| `real_estate_fraud` | Real estate fraud or misrepresentation |
| `construction_defect` | Construction defect (new build) |
| `other_real_estate` | Other real estate issue |

### New Detail Table: `real_estate_details`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | `gen_random_uuid()` |
| `case_id` | uuid FK → cases | UNIQUE |
| `re_sub_type` | text | CHECK constraint on 8 sub-type values |
| `property_address` | text | |
| `property_type` | text | CHECK: residential / commercial / land |
| `transaction_date` | date | Closing or expected closing date |
| `purchase_price` | numeric | |
| `other_party_name` | text | |
| `other_party_role` | text | CHECK: buyer / seller / agent / title_company / builder / other |
| `dispute_description` | text | |
| `damages_sought` | numeric | |
| `has_purchase_agreement` | boolean | DEFAULT false |
| `has_title_insurance` | boolean | DEFAULT false |
| `has_inspection_report` | boolean | DEFAULT false |
| `created_at` | timestamptz | DEFAULT now() |
| `updated_at` | timestamptz | DEFAULT now() |

RLS: Same pattern as other detail tables — users can manage rows where `case_id` belongs to them.

---

## 2. Workflow & Tasks

### 12 Tasks Across 5 Phases

```
Getting Started:     welcome → re_intake
Building Your Case:  re_evidence_vault → re_demand_letter* → re_negotiation*
Filing & Service:    re_prepare_filing → re_file_with_court → re_serve_defendant
Litigation:          re_wait_for_answer → re_review_answer → re_discovery
Resolution:          re_post_resolution
```

`*` = skippable

### Task Titles

| Task Key | Title | Status on Seed |
|----------|-------|----------------|
| `welcome` | Welcome — Get Started | `todo` (unlocked) |
| `re_intake` | Tell Us About Your Real Estate Dispute | `locked` |
| `re_evidence_vault` | Organize Your Evidence | `locked` |
| `re_demand_letter` | Draft Your Demand Letter | `locked` |
| `re_negotiation` | Attempt Negotiation or Mediation | `locked` |
| `re_prepare_filing` | Prepare Your Court Filing | `locked` |
| `re_file_with_court` | File With the Court | `locked` |
| `re_serve_defendant` | Serve the Defendant | `locked` |
| `re_wait_for_answer` | Wait for the Defendant's Answer | `locked` |
| `re_review_answer` | Review the Defendant's Answer | `locked` |
| `re_discovery` | Discovery — Exchange Evidence | `locked` |
| `re_post_resolution` | Post-Resolution Steps | `locked` |

### Conditional Unlock (case_stage branching after re_intake)

| case_stage | Effect |
|------------|--------|
| `start` | Unlock `re_evidence_vault` (full workflow) |
| `demand_sent` | Skip evidence + demand + negotiation → unlock `re_prepare_filing` |
| `filed` | Skip through prepare_filing → unlock `re_file_with_court` |
| `served` | Skip through service → unlock `re_wait_for_answer` |

### Sequential Unlock Chain

```
welcome → re_intake
re_intake → CONDITIONAL (case_stage)
re_evidence_vault → re_demand_letter
re_demand_letter (completed/skipped) → re_negotiation
re_negotiation (completed/skipped) → re_prepare_filing
re_prepare_filing → re_file_with_court
re_file_with_court → re_serve_defendant
re_serve_defendant → re_wait_for_answer
re_wait_for_answer → re_review_answer
re_review_answer → re_discovery
re_discovery → re_post_resolution
```

---

## 3. Guided Step Config

### One New Config: `re-evidence-vault.ts`

Location: `src/lib/guided-steps/real-estate/re-evidence-vault.ts`

| Question ID | Type | Prompt |
|-------------|------|--------|
| `has_purchase_agreement` | yes_no | Do you have the purchase agreement or contract? |
| `agreement_info` | info | The purchase agreement is the most important document. Check your email, realtor's records, or title company files. (showIf: no) |
| `has_title_report` | yes_no | Do you have a title report or title insurance policy? |
| `title_info` | info | Contact your title company or closing attorney to obtain a copy. (showIf: no) |
| `has_inspection_report` | yes_no | Do you have a property inspection report? |
| `has_closing_docs` | yes_no | Do you have closing documents (HUD-1 or settlement statement)? |
| `has_appraisal` | yes_no | Do you have a property appraisal? |
| `has_communications` | yes_no | Do you have emails, texts, or letters with the other party or their agent? |
| `has_photos` | yes_no | Do you have photos or videos of the property or defects? |
| `has_financial_records` | yes_no | Do you have financial records (mortgage docs, payment receipts, earnest money receipt)? |
| `evidence_organized` | yes_no | Have you organized your evidence into categories? |
| `organize_info` | info | Create folders for: Purchase Agreement, Title Documents, Inspection Reports, Closing Documents, Communications, Photos/Videos, Financial Records. Label files with dates. (showIf: no) |

Summary: Checklist of what's ready vs. what's needed.

---

## 4. Step Guidance Entries

11 entries in `src/lib/step-guidance.ts` for all `re_*` task keys:

| Task Key | Why | Checklist |
|----------|-----|-----------|
| `re_intake` | Property details, transaction timeline, and the nature of the dispute form the foundation of your real estate claim. | Purchase agreement or contract, Property address and description, Other party's name and role, Timeline of key events, Amount of damages |
| `re_evidence_vault` | Real estate disputes are document-heavy — organized evidence strengthens your position significantly. | Purchase agreement, Title report/insurance, Inspection report, Closing documents, Communications with other party |
| `re_demand_letter` | A formal demand letter puts the other party on notice and often resolves real estate disputes without court. | Clear description of the breach or issue, Specific dollar amount of damages, Deadline to respond (typically 30 days), Copies of key supporting documents |
| `re_negotiation` | Many real estate disputes settle through negotiation, saving time and court costs. | Your minimum acceptable outcome, Key evidence to reference, Written record of all offers, Timeline for resolution |
| `re_prepare_filing` | Filing requires specific forms and accurate information about the property and dispute. | Completed petition with property details, Filing fee or fee waiver application, Legal description of the property, Correct court jurisdiction |
| `re_file_with_court` | Filing officially starts your lawsuit and establishes your claim timeline. | Completed petition and copies, Filing fee payment, Proposed service method, Note the cause number after filing |
| `re_serve_defendant` | The defendant must be properly served for the court to have jurisdiction. | Certified copy of the petition, Process server or constable contact, Defendant's address for service, Proof of service form |
| `re_wait_for_answer` | The defendant typically has 20 days (Texas) to file an answer after being served. | Service date and deadline calculation, Monitor for filed answer, Note any counterclaims, Consider default judgment if no answer |
| `re_review_answer` | Understanding the defendant's response helps you prepare your strategy. | Read all claims and defenses, Identify disputed vs. admitted facts, Note any counterclaims against you, Research unfamiliar legal terms |
| `re_discovery` | Discovery lets you request documents and information from the other party. | Written interrogatories (questions), Requests for production of documents, Requests for admissions, Responses to their discovery requests |
| `re_post_resolution` | After resolution, there may be steps to enforce a judgment or complete a transaction. | Record any judgment with the county, Follow up on payment deadlines, Update title records if needed, Keep copies of all final documents |

---

## 5. Integration Points

### Files to Modify

| File | Change |
|------|--------|
| `src/lib/schemas/case.ts` | Add `'real_estate'` to disputeType enum, add reSubType enum with 8 values, add sub-type mapping |
| `src/components/cases/wizard/dispute-type-step.tsx` | Change real_estate option value from `'property'` to `'real_estate'` |
| `src/lib/workflow-phases.ts` | Add `real_estate` entry with 5 phases |
| `src/lib/step-guidance.ts` | Add 11 `re_*` step guidance entries |
| `src/lib/rules/milestones.ts` | Add `REAL_ESTATE_MILESTONES` for mid-litigation onboarding |
| `src/components/case/workflow-sidebar.tsx` | Add `'re_demand_letter'`, `'re_negotiation'` to SKIPPABLE_TASKS |
| `src/components/dashboard/next-step-card.tsx` | Add `'re_demand_letter'`, `'re_negotiation'` to SKIPPABLE_TASKS |
| `src/app/(authenticated)/case/[id]/step/[taskId]/page.tsx` | Add switch cases for all 11 `re_*` task keys, import `reEvidenceVaultConfig` |

### Files to Create

| File | Content |
|------|---------|
| `src/lib/guided-steps/real-estate/re-evidence-vault.ts` | RE-specific evidence vault guided step config |
| `supabase/migrations/20260312000005_real_estate_workflow.sql` | Detail table, seed function update, unlock function update |

### Milestone Structure (for mid-litigation onboarding)

5 milestones matching contract/property pattern:
- **Just starting** → first task: `re_evidence_vault`, skip: none
- **Demand sent** → first task: `re_prepare_filing`, skip: `re_evidence_vault`, `re_demand_letter`, `re_negotiation`
- **Already filed** → first task: `re_file_with_court`, skip: above + `re_prepare_filing`
- **Defendant served** → first task: `re_wait_for_answer`, skip: above + `re_file_with_court`, `re_serve_defendant`
- **In litigation** → first task: `re_discovery`, skip: above + `re_wait_for_answer`, `re_review_answer`

---

## 6. What's NOT Changing

- The `property` dispute type and its workflow remain unchanged
- The `property_dispute_details` table keeps `real_estate_transaction` as a sub-type (for users who already selected it)
- Generic shared tasks (`evidence_vault`, `file_with_court`) remain for civil workflow
- No changes to other dispute type workflows
