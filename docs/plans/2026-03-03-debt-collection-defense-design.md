# Debt Collection Defense Module — Design

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Add a full defendant-side debt collection defense module so users being sued by creditors or debt buyers can generate a debt validation letter and a formal answer (general denial or specific answer) through a guided wizard flow.

**Architecture:** Follows the Landlord-Tenant / Small Claims module pattern — wizard orchestrator with dynamic steps by sub-type, educational task chain steps, AI document generation via MOTION_REGISTRY, Supabase tables with RLS and task-seeding triggers.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind, Supabase, Anthropic Claude API, Zod, vitest

---

## Section 1: Case Creation & Sub-Types

### Rename `debt_collection`

The existing `debt_collection` dispute type (currently labeled "Money owed to me") is renamed to **"Debt dispute"** with updated description **"Debt collection, credit card lawsuit, or money owed"** to cover both plaintiff and defendant sides.

### Side Selection

After choosing "Debt dispute" in the dispute type step, a new **`DebtSideStep`** asks:

- **"I'm being sued for a debt"** (defendant) — enters the new debt defense module
- **"Someone owes me money"** (plaintiff) — continues with existing civil flow (no changes)

### Defendant Sub-Types (7)

When defendant is selected, a **`DebtSubTypeStep`** shows 7 options:

| Value | Label | Description |
|-------|-------|-------------|
| `credit_card` | Credit Card Debt | Sued by a credit card company or debt buyer |
| `medical_bills` | Medical Bills | Sued for unpaid medical or hospital bills |
| `personal_loan` | Personal Loan | Sued for an unpaid personal or installment loan |
| `auto_loan` | Auto Loan / Deficiency | Sued after vehicle repossession for remaining balance |
| `payday_loan` | Payday / Title Loan | Sued by a payday or title loan company |
| `debt_buyer` | Debt Buyer / Junk Debt | Sued by a company that bought old debt (e.g., Portfolio Recovery, Midland Credit) |
| `other` | Other Debt | Another type of debt collection lawsuit |

### Court Routing

Standard amount-based routing (no special overrides):
- Under $20K → JP Court
- $20K–$200K → County Court
- Over $200K → District Court

### Wizard State

New fields in `new-case-dialog.tsx` wizard state:
- `debtSide: 'defendant' | 'plaintiff' | ''`
- `debtSubType: DebtSubType | ''`

New step flow for debt_collection:
1. Role (step 1)
2. Dispute type (step 2) → selects `debt_collection`
3. Side selection (step 3) → `DebtSideStep`
4. Sub-type selection (step 4) → `DebtSubTypeStep` (defendant) or Amount step (plaintiff)
5. Amount (step 5, defendant) or Circumstances (step 5, plaintiff)
6. Court recommendation (step 6, defendant) or step 5 (plaintiff)

---

## Section 2: Database Schema & Migration

### New Table: `debt_defense_details`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `case_id` | uuid FK → cases | unique, RLS via cases join |
| `side` | text | `'defendant'` or `'plaintiff'` |
| `debt_sub_type` | text | credit_card, medical_bills, etc. |
| `creditor_name` | text | Original creditor |
| `debt_buyer_name` | text | nullable — current plaintiff if different |
| `original_amount` | numeric | Original debt amount claimed |
| `current_amount_claimed` | numeric | What they're suing for (with fees/interest) |
| `account_number_last4` | text | Last 4 digits for identification |
| `last_payment_date` | date | nullable — for SOL calculation |
| `account_open_date` | date | nullable |
| `account_default_date` | date | nullable |
| `selected_defenses` | text[] | Array of defense keys from the 8 options |
| `service_date` | date | nullable — when sued |
| `answer_deadline` | date | nullable — calculated or entered |
| `created_at` | timestamptz | default now() |

### Cases Table Changes

- Add `debt_sub_type` column (nullable text) — same pattern as `family_sub_type`, `small_claims_sub_type`, `landlord_tenant_sub_type`
- Add to `createCaseSchema` with optional validation

### Task Chain Seeding (defendant)

New branch in `seed_case_tasks()` trigger:
```
welcome (position 1, unlocked)
→ debt_defense_intake (2)
→ evidence_vault (3)
→ prepare_debt_validation_letter (4)
→ prepare_debt_defense_answer (5)
→ file_with_court (6)
→ serve_plaintiff (7)
→ prepare_for_hearing (8)
→ hearing_day (9)
→ post_judgment (10)
```

New transitions in `unlock_next_task()` for the defense chain.

Plaintiff side: seeds existing civil task chain (no new logic).

---

## Section 3: Wizard Steps & Defense Selection UI

### DebtDefenseWizard

Follows `LandlordTenantWizard` / `SmallClaimsWizard` pattern.

**Step flow for defendant path:**

| Step | Component | Purpose |
|------|-----------|---------|
| 1 | `DebtPreflight` | Educational intro — "You've been sued for a debt. Here's what we'll help you do." Links to FDCPA rights, SOL info |
| 2 | `DebtInfoStep` | Creditor name, debt buyer name (if different), original amount, current amount claimed, account last 4 digits |
| 3 | `DebtDatesStep` | Account open date, default date, last payment date (auto-calculates SOL status), service date, answer deadline |
| 4 | `DefenseSelectionStep` | 8 checkboxes with expandable explanations and follow-up questions |
| 5 | `AnswerTypeStep` | General Denial vs Specific Answer choice |
| 6 | `DebtPartiesStep` | Your full name/address; plaintiff name, attorney name/address |
| 7 | `DebtVenueStep` | County, court info, cause number |
| 8 | `DebtReviewStep` | Summary of all entered information before generation |

### 8 Defense Strategies (DefenseSelectionStep)

Each defense is a card with icon, title, description. Clicking expands to show legal basis and follow-up questions. Selected defenses get indigo highlight.

| Defense Key | Label | Follow-up |
|-------------|-------|-----------|
| `statute_of_limitations` | Statute of Limitations | Last payment date → auto-check against 4-year Texas SOL |
| `lack_of_standing` | Lack of Standing | "Is the plaintiff the original creditor?" → "Do they have documentation proving they own the debt?" |
| `insufficient_evidence` | Insufficient Evidence | "Has the plaintiff provided the original signed agreement?" |
| `wrong_amount` | Wrong Amount / Already Paid | "What amount do you believe is correct?" + "Have you made any payments?" |
| `identity_theft` | Identity Theft | "Have you filed a police report?" + "Have you filed an FTC identity theft report?" |
| `fdcpa_violations` | FDCPA Violations | Checklist of common violations (called before 8am/after 9pm, threats, contacted at work, etc.) |
| `improper_service` | Improper Service | "How were you served?" + "Were you personally handed the documents?" |
| `general_denial` | General Denial | No follow-up — always available as baseline |

### SOL Calculator

In `DebtDatesStep`: if `last_payment_date` is > 4 years ago, show green callout "Statute of limitations has likely expired — this is a strong defense." If < 4 years, show amber "Statute of limitations is likely still active." Includes caveat about payments resetting the clock.

### Answer Type Selection

`AnswerTypeStep`: side-by-side comparison cards.
- **General Denial with Affirmative Defenses** — "(Recommended for most cases)" tag. Simpler, denies all allegations, lists affirmative defenses.
- **Specific Answer** — Paragraph-by-paragraph response. More detailed, admits/denies each allegation individually.

---

## Section 4: AI Document Generation (Prompts)

### 1. Debt Validation Letter (`debtValidationLetterPrompts.ts`)

**Schema:** `debtValidationLetterFactsSchema` — your_info, creditor_name, debt_buyer_name, account_last4, original_amount, current_amount_claimed, service_date

**Output:** Formal letter demanding: proof of debt ownership (chain of title), original signed agreement, complete payment history, license to collect in Texas, verification the debt is within SOL. Includes 30-day validation period notice per FDCPA § 1692g.

**Annotations:** Standard `---ANNOTATIONS---` format with numbered legal notes.

### 2. Debt Defense Answer (`debtDefensePrompts.ts`)

**Schema:** `debtDefenseFactsSchema` — your_info, opposing_parties (plaintiff + attorney), court_type, county, cause_number, debt_sub_type, answer_type (`'general_denial'` or `'specific_answer'`), selected_defenses (string[]), defense_details (object with follow-up answers), original_amount, current_amount_claimed, description

**General Denial output:** Caption, general denial paragraph, affirmative defenses section (one numbered defense per selected defense with legal citations), prayer, verification, certificate of service.

**Specific Answer output:** Caption, paragraph-by-paragraph responses (admit/deny/lack knowledge), affirmative defenses, counterclaims section (if FDCPA violations selected — statutory damages up to $1,000 per § 1692k), prayer, verification, certificate of service.

### Legal Citations

- FDCPA: 15 U.S.C. §§ 1692-1692p
- Texas SOL: Tex. Civ. Prac. & Rem. Code § 16.004 (4 years for debt on open account)
- Texas DTPA: Tex. Bus. & Com. Code § 17.46
- TRCP: Rules 92 (general denial), 93 (verified pleas), 94 (affirmative defenses)
- SCRA: 50 U.S.C. § 3931

### MOTION_REGISTRY Entries

- `debt_validation_letter` → debtValidationLetterFactsSchema + buildDebtValidationLetterPrompt
- `debt_defense_general_denial` → debtDefenseFactsSchema + buildDebtDefensePrompt
- `debt_defense_specific_answer` → debtDefenseFactsSchema + buildDebtDefensePrompt
- 7 sub-type filing entries (`debt_collection_credit_card` through `debt_collection_other`) for plaintiff-side filings using existing civil filing pattern

---

## Section 5: Task Chain Steps

| Step | Component | Type | Pattern |
|------|-----------|------|---------|
| `welcome` | Existing `WelcomeStep` | Educational | Already exists — no changes |
| `debt_defense_intake` | `DebtDefenseIntakeStep` | Form + review | Collects debt info, dates, saves to `debt_defense_details`. Shows SOL calculator. |
| `evidence_vault` | Existing `EvidenceVaultStep` | Educational | Already exists — reuse |
| `prepare_debt_validation_letter` | `DebtValidationLetterStep` | Filing | Pre-fills from `debt_defense_details`, generates validation letter via AI, `AnnotatedDraftViewer` in review |
| `prepare_debt_defense_answer` | `DebtDefenseAnswerStep` | Filing | Shows `DebtDefenseWizard`, generates answer via AI, `AnnotatedDraftViewer` in review |
| `file_with_court` | `DebtFileWithCourtStep` | Educational | Filing instructions for debt defense answers: where to file, fees, e-filing, deadline emphasis |
| `serve_plaintiff` | `ServePlaintiffStep` | Educational | How to serve answer on plaintiff's attorney (mail/e-service) |
| `prepare_for_hearing` | `DebtHearingPrepStep` | Educational | What to bring, how to present defenses, what to expect |
| `hearing_day` | `DebtHearingDayStep` | Educational | Day-of checklist, courtroom etiquette, common creditor attorney tactics |
| `post_judgment` | `DebtPostJudgmentStep` | Educational | Debt-specific outcomes: dismissed, payment plan, appeal rights (30 days), exemptions from garnishment (Tex. Prop. Code § 42.001) |

### Task Transitions

- `debt_defense_intake` → on complete, unlocks `evidence_vault` via DB trigger
- `prepare_debt_validation_letter` → on complete, unlocks `prepare_debt_defense_answer` via DB trigger
- `prepare_debt_defense_answer` → on complete, unlocks `file_with_court` via DB trigger
- `file_with_court` through `post_judgment` → linear chain via `unlock_next_task()` trigger

### Step Router Additions

- 6+ new switch cases in `page.tsx`
- Reuse existing `welcome` and `evidence_vault` cases
- `prepare_for_hearing` and `hearing_day` need `dispute_type` check to render debt-specific versions

---

## Section 6: Testing Strategy

### Unit Tests (~28 new tests)

| Test File | Tests | Count |
|-----------|-------|-------|
| `debt-validation-letter-prompts.test.ts` | Schema validation, prompt builder, FDCPA § 1692g inclusion, 30-day validation period, creditor/debt buyer names | ~8 |
| `debt-defense-prompts.test.ts` | Schema validation, general denial with TRCP Rule 92, specific answer format, selected defenses as affirmative defenses, counterclaim inclusion based on FDCPA violations, court labels (3 types), SOL citation | ~14 |
| `debt-defense.test.ts` | `DEBT_SUB_TYPES` array length, schema accepts valid data, rejects invalid side, validates defense keys | ~6 |

### Build Verification

- `npx next build` — no type errors
- All existing 888+ tests continue to pass
- ~28 new tests pass

### Manual Smoke Test

1. Create new case → "Debt dispute" → "I'm being sued" → "Credit card debt" → court recommendation
2. Walk through 10-step task chain → verify each step renders
3. Debt validation letter: fill fields → generate → verify draft with annotations
4. Debt defense answer: wizard → select defenses → general denial → generate → verify
5. Repeat with specific answer type
6. Verify SOL calculator for dates > 4 years vs < 4 years

---

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| Plaintiff side selected | Existing civil flow, no new components |
| SOL unclear (no last payment date) | Show amber "Cannot determine — enter last payment date for SOL check" |
| No defenses selected | General denial is always available; minimum 1 defense required |
| FDCPA violations selected | Counterclaim section auto-included in specific answer |
| Federal court (shouldn't happen) | Schema rejects — debt cases filed in state court |
| Debt buyer vs original creditor | Wizard captures both names; prompts reference chain of title |
| User resumes partially completed wizard | State hydrates from `existingMetadata` |
