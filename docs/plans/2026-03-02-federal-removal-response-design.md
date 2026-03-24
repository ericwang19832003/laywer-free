# Federal Removal Response Module — Design Document

## Goal

When a defendant removes a case from state court to federal court, guide the plaintiff through responding: understanding the removal, choosing a strategy (accept/remand/both), preparing and filing an amended complaint and/or motion to remand, and preparing for Rule 26(f) conference and mandatory disclosures.

## Architecture

Extends the existing gatekeeper branching pattern. The `check_docket_for_answer` step gains a third outcome (`case_removed`) that triggers a new task chain of 8 tasks. Reuses the filing pipeline (AI draft generation, filing checklist) for both the amended complaint and motion to remand. Court type auto-updates to `federal` during the removal education step.

## Decisions

| Question | Decision |
|----------|----------|
| Trigger | Third docket outcome (`case_removed`) in `check_docket_for_answer` |
| Scope | Full chain + motion to remand |
| Remand depth | AI-drafted motion + PACER filing checklist |
| Court type update | Auto-update with confirmation during `understand_removal` step |
| Approach | Gatekeeper Branch + New Task Chain (Approach A) |

---

## Section 1: Task Flow & Gatekeeper Rules

### Trigger: Third Docket Outcome

The existing `check_docket_for_answer` step gains a third radio option:
- `no_answer` → unlock `default_packet_prep` (existing)
- `answer_filed` → unlock `upload_answer` (existing)
- `case_removed` → unlock `understand_removal` (new)

### New Task Chain (8 new task keys)

```
check_docket_for_answer
├── (no_answer)      → default_packet_prep
├── (answer_filed)   → upload_answer → discovery_starter_pack
└── (case_removed)   → understand_removal
                       ↓
                     choose_removal_strategy
                       ├── (accept)  → prepare_amended_complaint → file_amended_complaint → rule_26f_prep → mandatory_disclosures
                       ├── (remand)  → prepare_remand_motion → file_remand_motion
                       └── (both)    → ALL of the above (remand tasks + amended complaint tasks)
```

### Gatekeeper Rules (new)

| Rule | Condition | Action |
|------|-----------|--------|
| 7 | `check_docket_for_answer` completed + `docket_result === 'case_removed'` | Unlock `understand_removal` |
| 8 | `understand_removal` completed | Unlock `choose_removal_strategy` |
| 9 | `choose_removal_strategy` completed + strategy includes `accept` | Unlock `prepare_amended_complaint` |
| 10 | `choose_removal_strategy` completed + strategy includes `remand` | Unlock `prepare_remand_motion` |
| 11 | `prepare_amended_complaint` completed | Unlock `file_amended_complaint` |
| 12 | `file_amended_complaint` completed | Unlock `rule_26f_prep` |
| 13 | `rule_26f_prep` completed | Unlock `mandatory_disclosures` |
| 14 | `prepare_remand_motion` completed | Unlock `file_remand_motion` |

### Auto-Created Deadlines

- `understand_removal` completes → creates `remand_motion_deadline` (30 days from user-entered removal date, per 28 U.S.C. 1447(c))
- `rule_26f_prep` completes → user enters scheduled conference date → creates `rule_26f_conference` deadline + `mandatory_disclosures_deadline` (14 days after conference)

### Court Type Mutation

The `understand_removal` step:
1. Collects removal date and federal case number
2. Updates `cases.court_type` to `'federal'`
3. Logs `court_type_changed` audit event
4. All downstream components adapt automatically (filing prompts, discovery content, health score)

---

## Section 2: Step Components

### 1. `understand_removal` — Educational + Data Collection

**Pattern:** StepRunner with `skipReview` (like discovery starter pack)

**Content:**
- Calm explanation of removal (28 U.S.C. 1441)
- Expandable sections: "What is Removal?", "What Happens to My Case?", "Your Options"
- Data collection: removal date (date picker), federal case number (text input)
- On confirm: updates court_type to federal, creates remand_motion_deadline, logs event

### 2. `choose_removal_strategy` — Strategy Selection

**Pattern:** StepRunner with `skipReview`

**Content:**
- Three options with pros/cons: accept removal, motion to remand, both
- Radio button selection
- Saves choice to `task.metadata.strategy` (values: `accept`, `remand`, `both`)
- Gatekeeper reads strategy to unlock appropriate branches

### 3. `prepare_amended_complaint` — AI Draft Generation

**Pattern:** Reuses PrepareFilingStep pattern (parties, facts, claims, relief → AI draft)

**Key differences:**
- Title: "Prepare Your First Amended Complaint"
- FRCP-compliant format with jurisdiction statement, jury demand
- Pre-populates from original `prepare_filing` metadata if available
- New doc_type: `amended_complaint`

### 4. `file_amended_complaint` — PACER Filing Checklist

**Pattern:** Reuses FileWithCourtStep pattern

**Key differences:**
- Always PACER/CM-ECF (federal court)
- Filing fee: $405
- Title: "File Your Amended Complaint"

### 5. `prepare_remand_motion` — AI Draft for Remand

**Pattern:** Similar to PrepareFilingStep with remand-specific fields

**Content:**
- Remand grounds via checkboxes: no federal question, no diversity, untimely removal, forum defendant rule, procedural defect
- Free-text for additional arguments
- AI generates motion citing 28 U.S.C. 1447(c)
- New doc_type: `motion_to_remand`

### 6. `file_remand_motion` — PACER Filing Checklist

**Pattern:** Same as file_amended_complaint
- Title: "File Your Motion to Remand"
- No filing fee for motions
- Shows 30-day deadline countdown

### 7. `rule_26f_prep` — Conference Preparation

**Pattern:** StepRunner with `skipReview`

**Content:**
- Explains Rule 26(f) conference purpose and process
- Expandable sections: "What to Prepare", "What to Expect", "Discovery Plan Topics"
- Date picker for scheduled conference → creates deadline
- Auto-creates mandatory_disclosures_deadline (14 days after conference)

### 8. `mandatory_disclosures` — FRCP Rule 26(a)(1) Checklist

**Pattern:** StepRunner with `skipReview`

**Content:**
- Explains Rule 26(a)(1) requirements
- Checklist: witnesses, documents/ESI, damages computation, insurance agreements
- Each item with expandable explanation
- On complete: unlocks `discovery_starter_pack` (which already handles federal FRCP)

---

## Section 3: Migration & File Layout

### Migration: `20260302000001_federal_removal_tasks.sql`

1. Expand `court_documents.doc_type` CHECK to include `amended_complaint`, `motion_to_remand`
2. Update `seed_case_tasks()` to insert 8 new locked tasks for all new cases
3. Backfill: insert 8 new locked tasks for existing cases
4. Do NOT modify `unlock_next_task()` — removal branching is gatekeeper-managed

### New Files

| File | Type | ~Size |
|------|------|-------|
| `supabase/migrations/20260302000001_federal_removal_tasks.sql` | Migration | ~80 lines |
| `src/components/step/understand-removal-step.tsx` | Step | ~180 lines |
| `src/components/step/choose-removal-strategy-step.tsx` | Step | ~100 lines |
| `src/components/step/prepare-amended-complaint-step.tsx` | Step | ~150 lines |
| `src/components/step/file-amended-complaint-step.tsx` | Step | ~80 lines |
| `src/components/step/prepare-remand-motion-step.tsx` | Step | ~160 lines |
| `src/components/step/file-remand-motion-step.tsx` | Step | ~80 lines |
| `src/components/step/rule-26f-prep-step.tsx` | Step | ~150 lines |
| `src/components/step/mandatory-disclosures-step.tsx` | Step | ~140 lines |
| `src/lib/rules/removal-prompts.ts` | Prompt builder | ~120 lines |

### Modified Files

| File | Change |
|------|--------|
| `src/lib/rules/gatekeeper.ts` | Add rules 7-14 for removal branch |
| `src/components/step/check-docket-for-answer-step.tsx` | Add third radio: "Case was removed" |
| `src/app/case/[id]/step/[taskId]/page.tsx` | Add 8 new switch cases |
| `src/lib/schemas/court-document.ts` | Add `amended_complaint`, `motion_to_remand` to DOC_TYPES |
| `src/app/api/cases/[id]/generate-filing/route.ts` | Support new document types |
| `tests/unit/schemas/court-document.test.ts` | Update DOC_TYPES length + new type assertions |
| `tests/unit/rules/gatekeeper.test.ts` | Add tests for rules 7-14 |

### What We're NOT Building

- No remand hearing prep
- No automatic docket monitoring
- No notification/email system
- No changes to the discovery hub (already handles federal FRCP)
- No motion to remand hearing calendar
