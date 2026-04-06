# Federal Removal Response Module — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** When a defendant removes a case from state court to federal court, guide the plaintiff through responding — understanding the removal, choosing a strategy (accept/remand/both), preparing and filing an amended complaint and/or motion to remand, and preparing for Rule 26(f) conference and mandatory disclosures.

**Architecture:** Extends the existing gatekeeper branching pattern with a third `check_docket_for_answer` outcome (`case_removed`). Adds 8 new gatekeeper rules, 8 new task keys (seeded for all cases), 9 new step components, a removal-specific prompt builder, and expands the existing filing pipeline for amended complaints and motions to remand. Side effects (court type update, deadline creation) happen in step components, keeping the gatekeeper pure.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, Supabase (Postgres), Anthropic Claude API (claude-sonnet-4-20250514), Zod, vitest

---

## Task 1: Migration — Add Removal Tasks & Doc Types

**Files:**
- Create: `supabase/migrations/20260302000001_federal_removal_tasks.sql`

This migration:
1. Expands `court_documents.doc_type` CHECK to include `amended_complaint` and `motion_to_remand`
2. Updates `seed_case_tasks()` to insert 8 new locked tasks for new cases
3. Backfills 8 new locked tasks for existing cases

**Important:** Do NOT modify `unlock_next_task()`. The removal branch is entirely gatekeeper-managed (same as the existing answer_filed/no_answer branching).

**Step 1: Create the migration file**

```sql
-- ============================================
-- Federal Removal Response: Add removal tasks & doc types
-- ============================================

-- 1) Expand court_documents doc_type CHECK
ALTER TABLE public.court_documents
  DROP CONSTRAINT IF EXISTS court_documents_doc_type_check;

ALTER TABLE public.court_documents
  ADD CONSTRAINT court_documents_doc_type_check
  CHECK (doc_type IN (
    'return_of_service', 'petition', 'answer', 'general_denial',
    'amended_complaint', 'motion_to_remand'
  ));

-- 2) Update seed_case_tasks to include removal tasks
CREATE OR REPLACE FUNCTION public.seed_case_tasks()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Linear chain
  INSERT INTO public.tasks (case_id, task_key, title, status, unlocked_at)
  VALUES (NEW.id, 'welcome', 'Welcome — Get Started', 'todo', now());

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'intake', 'Tell Us About Your Case', 'locked');

  -- Filing tasks
  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'prepare_filing',
    CASE WHEN NEW.role = 'defendant' THEN 'Prepare Your Answer'
         ELSE 'Prepare Your Petition' END,
    'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'file_with_court', 'File With the Court', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'evidence_vault', 'Organize Your Evidence', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'preservation_letter', 'Draft a Preservation Letter', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'upload_return_of_service', 'Upload Return of Service', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'confirm_service_facts', 'Confirm Service Details', 'locked');

  -- Gatekeeper-managed tasks
  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'wait_for_answer', 'Wait for Answer Deadline', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'check_docket_for_answer', 'Check Docket for Answer', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'default_packet_prep', 'Prepare Default Judgment Packet', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'upload_answer', 'Upload the Answer', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'discovery_starter_pack', 'Discovery Starter Pack', 'locked');

  -- Federal removal response tasks (gatekeeper-managed)
  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'understand_removal', 'Understand the Removal', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'choose_removal_strategy', 'Choose Your Response Strategy', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'prepare_amended_complaint', 'Prepare First Amended Complaint', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'file_amended_complaint', 'File Your Amended Complaint', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'prepare_remand_motion', 'Prepare Motion to Remand', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'file_remand_motion', 'File Your Motion to Remand', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'rule_26f_prep', 'Prepare for Rule 26(f) Conference', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'mandatory_disclosures', 'Complete Mandatory Disclosures', 'locked');

  INSERT INTO public.task_events (case_id, kind, payload)
  VALUES (NEW.id, 'case_created', jsonb_build_object(
    'role', NEW.role,
    'county', NEW.county,
    'court_type', NEW.court_type
  ));

  RETURN NEW;
END;
$$;

-- 3) Backfill existing cases with new removal tasks
DO $$
DECLARE
  task_row RECORD;
  task_keys text[] := ARRAY[
    'understand_removal',
    'choose_removal_strategy',
    'prepare_amended_complaint',
    'file_amended_complaint',
    'prepare_remand_motion',
    'file_remand_motion',
    'rule_26f_prep',
    'mandatory_disclosures'
  ];
  task_titles text[] := ARRAY[
    'Understand the Removal',
    'Choose Your Response Strategy',
    'Prepare First Amended Complaint',
    'File Your Amended Complaint',
    'Prepare Motion to Remand',
    'File Your Motion to Remand',
    'Prepare for Rule 26(f) Conference',
    'Complete Mandatory Disclosures'
  ];
  i int;
BEGIN
  FOR i IN 1..array_length(task_keys, 1) LOOP
    INSERT INTO public.tasks (case_id, task_key, title, status)
    SELECT c.id, task_keys[i], task_titles[i], 'locked'
    FROM public.cases c
    WHERE NOT EXISTS (
      SELECT 1 FROM public.tasks t
      WHERE t.case_id = c.id AND t.task_key = task_keys[i]
    );
  END LOOP;
END;
$$;
```

**Step 2: Verify migration syntax**

Run: `cat supabase/migrations/20260302000001_federal_removal_tasks.sql | head -5`
Expected: File exists with correct header

**Step 3: Commit**

```bash
git add supabase/migrations/20260302000001_federal_removal_tasks.sql
git commit -m "feat: add federal removal tasks migration

Seeds 8 new locked tasks (understand_removal through mandatory_disclosures)
and adds amended_complaint + motion_to_remand doc types.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 2: Gatekeeper Rules 7-14 (TDD)

**Files:**
- Modify: `src/lib/rules/gatekeeper.ts`
- Modify: `tests/unit/rules/gatekeeper.test.ts`

Add 8 new rules for the federal removal branch. The gatekeeper is a pure function — zero side effects, trivially testable.

**Step 1: Write failing tests**

Add these tests at the end of the `describe('evaluateGatekeeperRules')` block in `tests/unit/rules/gatekeeper.test.ts`:

```typescript
  // ── Rule 7: case_removed → unlock understand_removal ────
  it('unlocks understand_removal when docket result is case_removed', () => {
    const actions = evaluateGatekeeperRules(
      makeInput({
        tasks: [
          makeTask('check_docket_for_answer', 'completed', { docket_result: 'case_removed' }),
          makeTask('understand_removal', 'locked'),
        ],
      })
    )

    expect(actions).toEqual([
      { type: 'unlock_task', task_key: 'understand_removal' },
    ])
  })

  it('does not unlock understand_removal for other docket results', () => {
    const actions = evaluateGatekeeperRules(
      makeInput({
        tasks: [
          makeTask('check_docket_for_answer', 'completed', { docket_result: 'answer_filed' }),
          makeTask('understand_removal', 'locked'),
          makeTask('upload_answer', 'locked'),
        ],
      })
    )

    expect(actions.some(a => a.type === 'unlock_task' && a.task_key === 'understand_removal')).toBe(false)
  })

  // ── Rule 8: understand_removal → choose_removal_strategy ──
  it('unlocks choose_removal_strategy when understand_removal completed', () => {
    const actions = evaluateGatekeeperRules(
      makeInput({
        tasks: [
          makeTask('understand_removal', 'completed'),
          makeTask('choose_removal_strategy', 'locked'),
        ],
      })
    )

    expect(actions).toEqual([
      { type: 'unlock_task', task_key: 'choose_removal_strategy' },
    ])
  })

  // ── Rule 9: strategy=accept → prepare_amended_complaint ──
  it('unlocks prepare_amended_complaint when strategy includes accept', () => {
    const actions = evaluateGatekeeperRules(
      makeInput({
        tasks: [
          makeTask('choose_removal_strategy', 'completed', { strategy: 'accept' }),
          makeTask('prepare_amended_complaint', 'locked'),
          makeTask('prepare_remand_motion', 'locked'),
        ],
      })
    )

    expect(actions).toEqual([
      { type: 'unlock_task', task_key: 'prepare_amended_complaint' },
    ])
  })

  // ── Rule 10: strategy=remand → prepare_remand_motion ──
  it('unlocks prepare_remand_motion when strategy includes remand', () => {
    const actions = evaluateGatekeeperRules(
      makeInput({
        tasks: [
          makeTask('choose_removal_strategy', 'completed', { strategy: 'remand' }),
          makeTask('prepare_amended_complaint', 'locked'),
          makeTask('prepare_remand_motion', 'locked'),
        ],
      })
    )

    expect(actions).toEqual([
      { type: 'unlock_task', task_key: 'prepare_remand_motion' },
    ])
  })

  // ── Rule 9+10: strategy=both → both branches ──
  it('unlocks both branches when strategy is both', () => {
    const actions = evaluateGatekeeperRules(
      makeInput({
        tasks: [
          makeTask('choose_removal_strategy', 'completed', { strategy: 'both' }),
          makeTask('prepare_amended_complaint', 'locked'),
          makeTask('prepare_remand_motion', 'locked'),
        ],
      })
    )

    const keys = actions.map(a => a.type === 'unlock_task' ? a.task_key : null).filter(Boolean)
    expect(keys).toContain('prepare_amended_complaint')
    expect(keys).toContain('prepare_remand_motion')
  })

  // ── Rule 11: prepare_amended_complaint → file_amended_complaint ──
  it('unlocks file_amended_complaint when prepare_amended_complaint completed', () => {
    const actions = evaluateGatekeeperRules(
      makeInput({
        tasks: [
          makeTask('prepare_amended_complaint', 'completed'),
          makeTask('file_amended_complaint', 'locked'),
        ],
      })
    )

    expect(actions).toEqual([
      { type: 'unlock_task', task_key: 'file_amended_complaint' },
    ])
  })

  // ── Rule 12: file_amended_complaint → rule_26f_prep ──
  it('unlocks rule_26f_prep when file_amended_complaint completed', () => {
    const actions = evaluateGatekeeperRules(
      makeInput({
        tasks: [
          makeTask('file_amended_complaint', 'completed'),
          makeTask('rule_26f_prep', 'locked'),
        ],
      })
    )

    expect(actions).toEqual([
      { type: 'unlock_task', task_key: 'rule_26f_prep' },
    ])
  })

  // ── Rule 13: rule_26f_prep → mandatory_disclosures ──
  it('unlocks mandatory_disclosures when rule_26f_prep completed', () => {
    const actions = evaluateGatekeeperRules(
      makeInput({
        tasks: [
          makeTask('rule_26f_prep', 'completed'),
          makeTask('mandatory_disclosures', 'locked'),
        ],
      })
    )

    expect(actions).toEqual([
      { type: 'unlock_task', task_key: 'mandatory_disclosures' },
    ])
  })

  // ── Rule 14: prepare_remand_motion → file_remand_motion ──
  it('unlocks file_remand_motion when prepare_remand_motion completed', () => {
    const actions = evaluateGatekeeperRules(
      makeInput({
        tasks: [
          makeTask('prepare_remand_motion', 'completed'),
          makeTask('file_remand_motion', 'locked'),
        ],
      })
    )

    expect(actions).toEqual([
      { type: 'unlock_task', task_key: 'file_remand_motion' },
    ])
  })

  // ── Removal mutual exclusivity with other branches ──
  it('only unlocks removal branch for case_removed — not default or answer', () => {
    const actions = evaluateGatekeeperRules(
      makeInput({
        tasks: [
          makeTask('check_docket_for_answer', 'completed', { docket_result: 'case_removed' }),
          makeTask('default_packet_prep', 'locked'),
          makeTask('upload_answer', 'locked'),
          makeTask('understand_removal', 'locked'),
        ],
      })
    )

    const keys = actions.map(a => a.type === 'unlock_task' ? a.task_key : null).filter(Boolean)
    expect(keys).toContain('understand_removal')
    expect(keys).not.toContain('default_packet_prep')
    expect(keys).not.toContain('upload_answer')
  })

  // ── mandatory_disclosures → discovery_starter_pack ──
  it('unlocks discovery_starter_pack when mandatory_disclosures completed', () => {
    const actions = evaluateGatekeeperRules(
      makeInput({
        tasks: [
          makeTask('mandatory_disclosures', 'completed'),
          makeTask('discovery_starter_pack', 'locked'),
        ],
      })
    )

    expect(actions).toEqual([
      { type: 'unlock_task', task_key: 'discovery_starter_pack' },
    ])
  })
```

**Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/unit/rules/gatekeeper.test.ts 2>&1 | tail -20`
Expected: 12 new tests FAIL

**Step 3: Implement gatekeeper rules 7-14**

Add after Rule 6 (line 100) in `src/lib/rules/gatekeeper.ts`:

```typescript
  // ── Federal Removal Branch ──────────────────────────────

  const understandRemovalTask = findTask(tasks, 'understand_removal')
  const chooseStrategyTask = findTask(tasks, 'choose_removal_strategy')
  const prepAmendedTask = findTask(tasks, 'prepare_amended_complaint')
  const fileAmendedTask = findTask(tasks, 'file_amended_complaint')
  const prepRemandTask = findTask(tasks, 'prepare_remand_motion')
  const fileRemandTask = findTask(tasks, 'file_remand_motion')
  const rule26fTask = findTask(tasks, 'rule_26f_prep')
  const mandatoryDisclosuresTask = findTask(tasks, 'mandatory_disclosures')

  // Rule 7: Branch — case_removed → unlock understand_removal
  if (
    checkDocketTask?.status === 'completed' &&
    checkDocketTask.metadata?.docket_result === 'case_removed' &&
    understandRemovalTask?.status === 'locked'
  ) {
    actions.push({ type: 'unlock_task', task_key: 'understand_removal' })
  }

  // Rule 8: understand_removal → choose_removal_strategy
  if (understandRemovalTask?.status === 'completed' && chooseStrategyTask?.status === 'locked') {
    actions.push({ type: 'unlock_task', task_key: 'choose_removal_strategy' })
  }

  // Rule 9: strategy includes accept → prepare_amended_complaint
  const strategy = chooseStrategyTask?.metadata?.strategy as string | undefined
  if (
    chooseStrategyTask?.status === 'completed' &&
    (strategy === 'accept' || strategy === 'both') &&
    prepAmendedTask?.status === 'locked'
  ) {
    actions.push({ type: 'unlock_task', task_key: 'prepare_amended_complaint' })
  }

  // Rule 10: strategy includes remand → prepare_remand_motion
  if (
    chooseStrategyTask?.status === 'completed' &&
    (strategy === 'remand' || strategy === 'both') &&
    prepRemandTask?.status === 'locked'
  ) {
    actions.push({ type: 'unlock_task', task_key: 'prepare_remand_motion' })
  }

  // Rule 11: prepare_amended_complaint → file_amended_complaint
  if (prepAmendedTask?.status === 'completed' && fileAmendedTask?.status === 'locked') {
    actions.push({ type: 'unlock_task', task_key: 'file_amended_complaint' })
  }

  // Rule 12: file_amended_complaint → rule_26f_prep
  if (fileAmendedTask?.status === 'completed' && rule26fTask?.status === 'locked') {
    actions.push({ type: 'unlock_task', task_key: 'rule_26f_prep' })
  }

  // Rule 13: rule_26f_prep → mandatory_disclosures
  if (rule26fTask?.status === 'completed' && mandatoryDisclosuresTask?.status === 'locked') {
    actions.push({ type: 'unlock_task', task_key: 'mandatory_disclosures' })
  }

  // Rule 14: prepare_remand_motion → file_remand_motion
  if (prepRemandTask?.status === 'completed' && fileRemandTask?.status === 'locked') {
    actions.push({ type: 'unlock_task', task_key: 'file_remand_motion' })
  }

  // Rule 15: mandatory_disclosures → discovery_starter_pack (removal path)
  if (mandatoryDisclosuresTask?.status === 'completed' && discoveryTask?.status === 'locked') {
    actions.push({ type: 'unlock_task', task_key: 'discovery_starter_pack' })
  }
```

**Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/unit/rules/gatekeeper.test.ts 2>&1 | tail -20`
Expected: All tests PASS (11 old + 12 new = 23 tests)

**Step 5: Commit**

```bash
git add src/lib/rules/gatekeeper.ts tests/unit/rules/gatekeeper.test.ts
git commit -m "feat: add gatekeeper rules 7-15 for federal removal branch

case_removed → understand_removal → choose_strategy →
(accept: amended complaint → file → rule 26f → disclosures)
(remand: remand motion → file)
(both: all of the above)

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 3: Update Check Docket Step — Third Radio Option

**Files:**
- Modify: `src/components/step/check-docket-for-answer-step.tsx`

Add `case_removed` as a third option in the docket check step.

**Step 1: Update the type and add the third radio button**

In `src/components/step/check-docket-for-answer-step.tsx`:

Change line 11:
```typescript
type DocketResult = 'no_answer' | 'answer_filed' | 'case_removed' | null
```

Update the `reviewContent` (around line 46-63) to handle the third option:
```tsx
  const reviewContent = (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-warm-muted">Your selection</p>
        <p className="text-warm-text mt-0.5">
          {result === 'no_answer'
            ? 'No answer was filed'
            : result === 'answer_filed'
              ? 'An answer was filed'
              : 'The case was removed to federal court'}
        </p>
      </div>
      <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3">
        <p className="text-sm text-amber-800">
          {result === 'no_answer'
            ? 'This will start the default judgment process. You\'ll prepare a default judgment packet to submit to the court.'
            : result === 'answer_filed'
              ? 'This means the case is contested. You\'ll upload the answer and move into the discovery phase.'
              : 'The defendant has moved your case to federal court. We\'ll guide you through your response options.'}
        </p>
      </div>
    </div>
  )
```

Add the third radio button after the `answer_filed` button (after line 113):
```tsx
        <button
          type="button"
          onClick={() => setResult('case_removed')}
          className={`w-full rounded-md border px-4 py-4 text-left transition-colors ${
            result === 'case_removed'
              ? 'border-primary bg-primary/5'
              : 'border-warm-border hover:border-warm-text'
          }`}
        >
          <p className={`text-sm font-medium ${
            result === 'case_removed' ? 'text-primary' : 'text-warm-text'
          }`}>
            The case was removed to federal court
          </p>
          <p className="text-xs text-warm-muted mt-1">
            The defendant filed a Notice of Removal. Your case has been transferred to a federal district court.
          </p>
        </button>
```

**Step 2: Verify the build**

Run: `npx next build 2>&1 | tail -20`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/components/step/check-docket-for-answer-step.tsx
git commit -m "feat: add 'case removed' option to docket check step

Third radio button for when defendant files Notice of Removal.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 4: Update DOC_TYPES Schema + Tests

**Files:**
- Modify: `src/lib/schemas/court-document.ts`
- Modify: `tests/unit/schemas/court-document.test.ts`

**Step 1: Add new doc types**

In `src/lib/schemas/court-document.ts`, update `DOC_TYPES` (line 11-16):

```typescript
export const DOC_TYPES = [
  'return_of_service',
  'petition',
  'answer',
  'general_denial',
  'amended_complaint',
  'motion_to_remand',
] as const
```

**Step 2: Update tests**

In `tests/unit/schemas/court-document.test.ts`, update the `DOC_TYPES` test (around line 152-158):

```typescript
  it('DOC_TYPES contains all doc types', () => {
    expect(DOC_TYPES).toContain('return_of_service')
    expect(DOC_TYPES).toContain('petition')
    expect(DOC_TYPES).toContain('answer')
    expect(DOC_TYPES).toContain('general_denial')
    expect(DOC_TYPES).toContain('amended_complaint')
    expect(DOC_TYPES).toContain('motion_to_remand')
    expect(DOC_TYPES).toHaveLength(6)
  })
```

Add tests for the new doc types:

```typescript
  it('accepts amended_complaint doc type', () => {
    const result = courtDocumentSchema.safeParse({
      ...validInput,
      doc_type: 'amended_complaint',
    })
    expect(result.success).toBe(true)
  })

  it('accepts motion_to_remand doc type', () => {
    const result = courtDocumentSchema.safeParse({
      ...validInput,
      doc_type: 'motion_to_remand',
    })
    expect(result.success).toBe(true)
  })
```

**Step 3: Run tests**

Run: `npx vitest run tests/unit/schemas/court-document.test.ts 2>&1 | tail -20`
Expected: All tests pass

**Step 4: Commit**

```bash
git add src/lib/schemas/court-document.ts tests/unit/schemas/court-document.test.ts
git commit -m "feat: add amended_complaint and motion_to_remand doc types

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 5: Removal Prompt Builder (TDD)

**Files:**
- Create: `src/lib/rules/removal-prompts.ts`
- Create: `tests/unit/rules/removal-prompts.test.ts`

Builds prompts for the AI to generate amended complaints and motions to remand. Follows the same pattern as `src/lib/rules/filing-prompts.ts`.

**Step 1: Write failing tests**

Create `tests/unit/rules/removal-prompts.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import {
  buildAmendedComplaintPrompt,
  buildRemandMotionPrompt,
} from '@/lib/rules/removal-prompts'

describe('buildAmendedComplaintPrompt', () => {
  const baseFacts = {
    your_info: { full_name: 'Jane Smith', address: '100 Main St', city: 'Houston', state: 'TX', zip: '77001' },
    opposing_parties: [{ full_name: 'ACME Corp', address: '200 Corp Ave' }],
    description: 'Breach of contract dispute over construction services.',
    federal_case_number: '4:26-cv-01234',
    jurisdiction_basis: 'diversity' as const,
    amount_sought: 150000,
    claim_details: 'Defendant failed to complete contracted work.',
    request_jury_trial: true,
  }

  it('returns system and user prompts', () => {
    const result = buildAmendedComplaintPrompt(baseFacts)
    expect(result).toHaveProperty('system')
    expect(result).toHaveProperty('user')
  })

  it('system prompt includes FRCP formatting instructions', () => {
    const result = buildAmendedComplaintPrompt(baseFacts)
    expect(result.system).toContain('FIRST AMENDED COMPLAINT')
    expect(result.system).toContain('DRAFT')
  })

  it('user prompt includes federal case number', () => {
    const result = buildAmendedComplaintPrompt(baseFacts)
    expect(result.user).toContain('4:26-cv-01234')
  })

  it('user prompt includes jurisdiction basis', () => {
    const result = buildAmendedComplaintPrompt(baseFacts)
    expect(result.user).toContain('diversity')
  })

  it('includes jury demand when requested', () => {
    const result = buildAmendedComplaintPrompt(baseFacts)
    expect(result.system).toContain('Jury demand')
  })

  it('omits jury demand when not requested', () => {
    const result = buildAmendedComplaintPrompt({ ...baseFacts, request_jury_trial: false })
    expect(result.system).not.toContain('Jury demand')
  })
})

describe('buildRemandMotionPrompt', () => {
  const baseFacts = {
    your_info: { full_name: 'Jane Smith' },
    opposing_parties: [{ full_name: 'ACME Corp' }],
    federal_case_number: '4:26-cv-01234',
    original_court: 'District Court of Harris County, Texas',
    removal_date: '2026-02-15',
    remand_grounds: ['no_diversity', 'untimely_removal'] as const,
    additional_arguments: 'Defendant is a Texas corporation with principal place of business in Houston.',
  }

  it('returns system and user prompts', () => {
    const result = buildRemandMotionPrompt(baseFacts)
    expect(result).toHaveProperty('system')
    expect(result).toHaveProperty('user')
  })

  it('system prompt includes motion to remand format', () => {
    const result = buildRemandMotionPrompt(baseFacts)
    expect(result.system).toContain('MOTION TO REMAND')
    expect(result.system).toContain('28 U.S.C.')
  })

  it('user prompt includes remand grounds', () => {
    const result = buildRemandMotionPrompt(baseFacts)
    expect(result.user).toContain('no_diversity')
    expect(result.user).toContain('untimely_removal')
  })

  it('user prompt includes original court', () => {
    const result = buildRemandMotionPrompt(baseFacts)
    expect(result.user).toContain('District Court of Harris County')
  })

  it('user prompt includes removal date', () => {
    const result = buildRemandMotionPrompt(baseFacts)
    expect(result.user).toContain('2026-02-15')
  })
})
```

**Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/unit/rules/removal-prompts.test.ts 2>&1 | tail -20`
Expected: FAIL (module not found)

**Step 3: Implement removal prompt builder**

Create `src/lib/rules/removal-prompts.ts`:

```typescript
interface PartyInfo {
  full_name: string
  address?: string
  city?: string
  state?: string
  zip?: string
}

export interface AmendedComplaintFacts {
  your_info: PartyInfo
  opposing_parties: PartyInfo[]
  description: string
  federal_case_number: string
  jurisdiction_basis: 'diversity' | 'federal_question' | 'both'
  amount_sought?: number
  claim_details?: string
  other_relief?: string
  request_jury_trial: boolean
}

export interface RemandMotionFacts {
  your_info: PartyInfo
  opposing_parties: PartyInfo[]
  federal_case_number: string
  original_court: string
  removal_date: string
  remand_grounds: string[]
  additional_arguments?: string
}

interface Prompt {
  system: string
  user: string
}

export function buildAmendedComplaintPrompt(facts: AmendedComplaintFacts): Prompt {
  const jurySection = facts.request_jury_trial
    ? '\n- Jury demand paragraph'
    : ''

  const system = `You are a legal document formatting assistant. You help self-represented (pro se) litigants format their court filings.

IMPORTANT RULES:
- You format documents. You do NOT provide legal advice.
- Mark the output clearly as "DRAFT — NOT LEGAL ADVICE" at the top.
- Use only the facts provided. Do not invent or assume additional facts.
- Do not predict outcomes or make strategic recommendations.
- Use plain, clear language appropriate for a pro se filer.

DOCUMENT FORMAT:
Generate a FIRST AMENDED COMPLAINT under the Federal Rules of Civil Procedure. Include:
- Caption: "In the United States District Court for the [District] District of Texas"
- Title: "PLAINTIFF'S FIRST AMENDED COMPLAINT"
- Statement of jurisdiction (${facts.jurisdiction_basis === 'diversity' ? 'diversity under 28 U.S.C. § 1332' : facts.jurisdiction_basis === 'federal_question' ? 'federal question under 28 U.S.C. § 1331' : 'diversity under 28 U.S.C. § 1332 and/or federal question under 28 U.S.C. § 1331'})
- Parties section with numbered paragraphs
- Factual allegations with numbered paragraphs
- Causes of action (each as a separate "COUNT")
- Prayer for relief${jurySection}
- Signature block with "Pro Se"
- Verification if required

Format the document professionally with proper legal formatting.`

  const parties = [
    `Filing party: ${facts.your_info.full_name}`,
    facts.your_info.address ? `Address: ${facts.your_info.address}, ${facts.your_info.city ?? ''}, ${facts.your_info.state ?? ''} ${facts.your_info.zip ?? ''}` : null,
    ...facts.opposing_parties.map((p, i) =>
      `Opposing party ${i + 1}: ${p.full_name}${p.address ? `, ${p.address}` : ''}`
    ),
  ].filter(Boolean).join('\n')

  const user = [
    'Role: plaintiff (filing amended complaint after removal to federal court)',
    '',
    '--- PARTIES ---',
    parties,
    '',
    '--- COURT ---',
    `Federal case number: ${facts.federal_case_number}`,
    `Jurisdiction basis: ${facts.jurisdiction_basis}`,
    '',
    '--- FACTS ---',
    `Description of dispute:\n${facts.description}`,
    facts.claim_details ? `Claim details:\n${facts.claim_details}` : null,
    '',
    '--- RELIEF ---',
    facts.amount_sought ? `Amount sought: $${facts.amount_sought.toLocaleString()}` : null,
    facts.other_relief ? `Other relief: ${facts.other_relief}` : null,
    facts.request_jury_trial ? 'Requesting jury trial' : null,
  ].filter((s) => s !== null).join('\n')

  return { system, user }
}

export function buildRemandMotionPrompt(facts: RemandMotionFacts): Prompt {
  const system = `You are a legal document formatting assistant. You help self-represented (pro se) litigants format their court filings.

IMPORTANT RULES:
- You format documents. You do NOT provide legal advice.
- Mark the output clearly as "DRAFT — NOT LEGAL ADVICE" at the top.
- Use only the facts provided. Do not invent or assume additional facts.
- Do not predict outcomes or make strategic recommendations.
- Use plain, clear language appropriate for a pro se filer.

DOCUMENT FORMAT:
Generate a MOTION TO REMAND under 28 U.S.C. § 1447(c). Include:
- Caption: "In the United States District Court for the [District] District of Texas"
- Title: "PLAINTIFF'S MOTION TO REMAND"
- Introduction paragraph identifying the motion and relief sought
- Background section (case history, original filing, removal)
- Legal standard for remand (28 U.S.C. § 1447(c), burden on removing party)
- Arguments for remand based on the grounds provided
- Request for costs and expenses if applicable (28 U.S.C. § 1447(c))
- Prayer (asking the court to remand to the original state court)
- Signature block with "Pro Se"

Format the document professionally with proper legal formatting.`

  const parties = [
    `Moving party: ${facts.your_info.full_name}`,
    ...facts.opposing_parties.map((p, i) =>
      `Opposing party ${i + 1}: ${p.full_name}`
    ),
  ].join('\n')

  const user = [
    '--- PARTIES ---',
    parties,
    '',
    '--- CASE INFO ---',
    `Federal case number: ${facts.federal_case_number}`,
    `Original state court: ${facts.original_court}`,
    `Date of removal: ${facts.removal_date}`,
    '',
    '--- GROUNDS FOR REMAND ---',
    `Grounds: ${facts.remand_grounds.join(', ')}`,
    facts.additional_arguments ? `\nAdditional arguments:\n${facts.additional_arguments}` : null,
  ].filter((s) => s !== null).join('\n')

  return { system, user }
}
```

**Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/unit/rules/removal-prompts.test.ts 2>&1 | tail -20`
Expected: All 11 tests PASS

**Step 5: Commit**

```bash
git add src/lib/rules/removal-prompts.ts tests/unit/rules/removal-prompts.test.ts
git commit -m "feat: add removal prompt builders for amended complaint and remand motion

TDD: 11 tests covering both prompt builders.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 6: Understand Removal Step Component

**Files:**
- Create: `src/components/step/understand-removal-step.tsx`

Educational step with data collection (removal date, federal case number). On confirm, updates court_type to federal, creates remand deadline, and logs audit event. Uses the expandable section pattern from `discovery-starter-pack-step.tsx`.

**Step 1: Create the component**

```tsx
// src/components/step/understand-removal-step.tsx
'use client'

import { useState } from 'react'
import { StepRunner } from './step-runner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface UnderstandRemovalStepProps {
  caseId: string
  taskId: string
}

function ExpandableSection({
  title,
  isOpen,
  onToggle,
  children,
}: {
  title: string
  isOpen: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="rounded-lg border border-warm-border">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-sm font-medium text-warm-text">{title}</span>
        <span
          className={`text-warm-muted transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        >
          ▾
        </span>
      </button>
      {isOpen && (
        <div className="border-t border-warm-border px-4 py-3">
          {children}
        </div>
      )}
    </div>
  )
}

export function UnderstandRemovalStep({
  caseId,
  taskId,
}: UnderstandRemovalStepProps) {
  const [openSection, setOpenSection] = useState<string | null>(null)
  const [removalDate, setRemovalDate] = useState('')
  const [federalCaseNumber, setFederalCaseNumber] = useState('')
  const [error, setError] = useState<string | null>(null)

  function toggleSection(key: string) {
    setOpenSection((prev) => (prev === key ? null : key))
  }

  async function handleConfirm() {
    if (!removalDate) {
      setError('Please enter the date the case was removed.')
      throw new Error('Missing removal date')
    }
    setError(null)

    // Save metadata and transition task
    await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'in_progress',
        metadata: {
          removal_date: removalDate,
          federal_case_number: federalCaseNumber || null,
        },
      }),
    })

    // Update court type to federal
    const supabaseRes = await fetch(`/api/cases/${caseId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ court_type: 'federal' }),
    })

    if (supabaseRes.ok) {
      // Log audit event
      await fetch(`/api/cases/${caseId}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'court_type_changed',
          payload: { from: 'state', to: 'federal', removal_date: removalDate },
        }),
      })
    }

    // Create remand motion deadline (30 days from removal)
    const removalDateObj = new Date(removalDate)
    const remandDeadline = new Date(removalDateObj.getTime() + 30 * 24 * 60 * 60 * 1000)
    await fetch(`/api/cases/${caseId}/deadlines`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key: 'remand_motion_deadline',
        due_at: remandDeadline.toISOString(),
        source: 'system',
        rationale: 'Motion to remand must be filed within 30 days of removal (28 U.S.C. § 1447(c)).',
      }),
    })

    // Complete task
    await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'completed' }),
    })

    // Run gatekeeper
    await fetch(`/api/cases/${caseId}/rules/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
  }

  return (
    <StepRunner
      caseId={caseId}
      taskId={taskId}
      title="Understand the Removal"
      reassurance="The defendant has moved your case to federal court. This is a common procedural move — here's what it means and what you can do."
      onConfirm={handleConfirm}
      skipReview
    >
      <div className="space-y-4">
        <ExpandableSection
          title="What is Removal?"
          isOpen={openSection === 'what'}
          onToggle={() => toggleSection('what')}
        >
          <div className="space-y-2 text-sm text-warm-muted">
            <p>
              Under 28 U.S.C. &sect; 1441, a defendant can &quot;remove&quot; a case
              from state court to federal court if the federal court would have
              had jurisdiction over the case originally.
            </p>
            <p>
              Common reasons for removal include diversity of citizenship (the
              parties are from different states and the amount exceeds $75,000)
              or the case involves a federal question (federal law).
            </p>
          </div>
        </ExpandableSection>

        <ExpandableSection
          title="What Happens to My Case?"
          isOpen={openSection === 'happens'}
          onToggle={() => toggleSection('happens')}
        >
          <div className="space-y-2 text-sm text-warm-muted">
            <p>
              Your case now proceeds in federal court under the Federal Rules
              of Civil Procedure (FRCP) instead of Texas state rules. Your
              claims stay the same, but the procedures are different.
            </p>
            <p>
              Key changes: You&apos;ll file through PACER/CM-ECF (federal electronic
              filing), discovery follows FRCP Rules 26-37, and you&apos;ll need to
              participate in a Rule 26(f) conference before formal discovery begins.
            </p>
          </div>
        </ExpandableSection>

        <ExpandableSection
          title="Your Options"
          isOpen={openSection === 'options'}
          onToggle={() => toggleSection('options')}
        >
          <div className="space-y-2 text-sm text-warm-muted">
            <p>You have three main options:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Accept the removal</strong> — File a First Amended
                Complaint in federal court and proceed with the case there.
              </li>
              <li>
                <strong>Motion to remand</strong> — Ask the federal judge to
                send the case back to state court (must be filed within 30 days).
              </li>
              <li>
                <strong>Both</strong> — File the motion to remand and prepare
                your amended complaint as a backup.
              </li>
            </ul>
            <p>
              In the next step, you&apos;ll choose which path to take.
            </p>
          </div>
        </ExpandableSection>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="removal-date">Date of removal *</Label>
            <Input
              id="removal-date"
              type="date"
              value={removalDate}
              onChange={(e) => setRemovalDate(e.target.value)}
            />
            <p className="text-xs text-warm-muted">
              The date the Notice of Removal was filed. Check the court docket.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="federal-case-number">Federal case number (optional)</Label>
            <Input
              id="federal-case-number"
              value={federalCaseNumber}
              onChange={(e) => setFederalCaseNumber(e.target.value)}
              placeholder="e.g. 4:26-cv-01234"
            />
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-calm-amber bg-calm-amber/5 p-3">
            <p className="text-sm text-warm-text">{error}</p>
          </div>
        )}
      </div>
    </StepRunner>
  )
}
```

**Important note:** This step calls several API endpoints. Some may not exist yet:
- `PATCH /api/cases/[id]` — May need to be created to update court_type
- `POST /api/cases/[id]/events` — May need to be created for audit events
If these don't exist, create minimal API routes for them (or handle the updates inline in the task PATCH endpoint). Check existing routes before creating new ones.

**Step 2: Verify the build**

Run: `npx next build 2>&1 | tail -20`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/components/step/understand-removal-step.tsx
git commit -m "feat: add understand-removal step component

Educational content + collects removal date and federal case number.
Updates court_type to federal, creates remand deadline.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 7: Choose Removal Strategy Step

**Files:**
- Create: `src/components/step/choose-removal-strategy-step.tsx`

Radio selection between accept, remand, or both. Saves to task metadata for gatekeeper to read.

**Step 1: Create the component**

```tsx
// src/components/step/choose-removal-strategy-step.tsx
'use client'

import { useState } from 'react'
import { StepRunner } from './step-runner'

interface ChooseRemovalStrategyStepProps {
  caseId: string
  taskId: string
  remandDeadline?: string | null
}

type Strategy = 'accept' | 'remand' | 'both' | null

const STRATEGIES = [
  {
    value: 'both' as const,
    title: 'File motion to remand AND prepare amended complaint',
    description: 'Recommended if you\'re unsure. File a motion asking the judge to send the case back to state court, and prepare your amended complaint as a backup in case the motion is denied.',
  },
  {
    value: 'remand' as const,
    title: 'File a motion to remand only',
    description: 'Ask the federal judge to send your case back to state court. Grounds include: no federal jurisdiction, untimely removal, or procedural defects. Must be filed within 30 days of removal.',
  },
  {
    value: 'accept' as const,
    title: 'Accept the removal and proceed in federal court',
    description: 'File a First Amended Complaint in federal court, then prepare for the Rule 26(f) conference and mandatory initial disclosures.',
  },
]

export function ChooseRemovalStrategyStep({
  caseId,
  taskId,
  remandDeadline,
}: ChooseRemovalStrategyStepProps) {
  const [strategy, setStrategy] = useState<Strategy>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleConfirm() {
    if (!strategy) {
      setError('Please select a response strategy.')
      throw new Error('No strategy selected')
    }
    setError(null)

    await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'in_progress',
        metadata: { strategy },
      }),
    })

    await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'completed' }),
    })

    await fetch(`/api/cases/${caseId}/rules/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
  }

  return (
    <StepRunner
      caseId={caseId}
      taskId={taskId}
      title="Choose Your Response Strategy"
      reassurance="Decide how you want to respond to the removal. You can always change course later."
      onConfirm={handleConfirm}
      skipReview
    >
      <div className="space-y-4">
        {remandDeadline && (
          <div className="rounded-lg border border-calm-amber/30 bg-calm-amber/5 p-3">
            <p className="text-sm text-warm-text">
              <strong>Remand deadline:</strong>{' '}
              {new Date(remandDeadline).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
            <p className="text-xs text-warm-muted mt-1">
              A motion to remand must be filed within 30 days of the removal date.
            </p>
          </div>
        )}

        <div className="space-y-3">
          {STRATEGIES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setStrategy(s.value)}
              className={`w-full rounded-md border px-4 py-4 text-left transition-colors ${
                strategy === s.value
                  ? 'border-primary bg-primary/5'
                  : 'border-warm-border hover:border-warm-text'
              }`}
            >
              <p className={`text-sm font-medium ${
                strategy === s.value ? 'text-primary' : 'text-warm-text'
              }`}>
                {s.title}
              </p>
              <p className="text-xs text-warm-muted mt-1">{s.description}</p>
            </button>
          ))}
        </div>

        {error && (
          <div className="rounded-lg border border-calm-amber bg-calm-amber/5 p-3">
            <p className="text-sm text-warm-text">{error}</p>
          </div>
        )}
      </div>
    </StepRunner>
  )
}
```

**Step 2: Verify the build**

Run: `npx next build 2>&1 | tail -20`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/components/step/choose-removal-strategy-step.tsx
git commit -m "feat: add choose-removal-strategy step component

Three options: accept removal, motion to remand, or both.
Saves strategy to task metadata for gatekeeper branching.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 8: Prepare Amended Complaint Step

**Files:**
- Create: `src/components/step/prepare-amended-complaint-step.tsx`

Reuses the filing sub-components (PartiesSection, FactsSection, ClaimsSection, ReliefSection, DraftViewer) with amended-complaint-specific fields (jurisdiction basis, jury demand, federal case number).

**Step 1: Create the component**

This follows the exact same pattern as `src/components/step/prepare-filing-step.tsx` with these differences:
- Title: "Prepare Your First Amended Complaint"
- Adds jurisdiction basis selector (diversity / federal question / both)
- Adds jury demand checkbox
- Includes federal case number field
- Calls `/api/cases/${caseId}/generate-filing` with `document_type: 'amended_complaint'`
- Pre-populates from original prepare_filing metadata if available

The component is ~200 lines. It imports `PartiesSection`, `FactsSection`, `ClaimsSection`, `ReliefSection`, `DraftViewer` from `./filing/`. The AI generation call sends `AmendedComplaintFacts` to a new endpoint or reuses the existing one with a `document_type` discriminator.

**Important:** The existing `/api/cases/[id]/generate-filing` route calls `buildFilingPrompt()`. For amended complaints, it should call `buildAmendedComplaintPrompt()` from `removal-prompts.ts`. The simplest approach: add a `document_type` field to the request body and branch in the route handler.

**Step 2: Verify the build**

Run: `npx next build 2>&1 | tail -20`

**Step 3: Commit**

```bash
git add src/components/step/prepare-amended-complaint-step.tsx
git commit -m "feat: add prepare-amended-complaint step component

Reuses filing sub-components with FRCP-specific fields
(jurisdiction basis, jury demand, federal case number).

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 9: File Amended Complaint Step

**Files:**
- Create: `src/components/step/file-amended-complaint-step.tsx`

Reuses the filing checklist pattern from `file-with-court-step.tsx`, always showing PACER/CM-ECF instructions since the case is now in federal court.

**Step 1: Create the component**

Same pattern as `FileWithCourtStep` but:
- Title: "File Your Amended Complaint"
- Always PACER/CM-ECF (no eFileTexas branch)
- Filing fee: $405
- Checklist items: PACER account created, case located in CM-ECF, amended complaint uploaded, filing fee paid, submitted

**Step 2: Verify build, Step 3: Commit**

---

## Task 10: Prepare Remand Motion Step

**Files:**
- Create: `src/components/step/prepare-remand-motion-step.tsx`

Collects remand grounds via checkboxes, free-text for additional arguments, then generates AI draft via `buildRemandMotionPrompt()`.

**Step 1: Create the component**

Key content:
- Remand grounds checkboxes:
  - `no_federal_question` — "No federal question — the case involves only state law claims"
  - `no_diversity` — "No diversity of citizenship — parties are from the same state or amount is under $75,000"
  - `untimely_removal` — "Untimely removal — the Notice of Removal was filed more than 30 days after service"
  - `forum_defendant` — "Forum defendant rule — the defendant is a citizen of the state where the case was filed"
  - `procedural_defect` — "Other procedural defect"
- Additional arguments textarea
- Original state court name input
- AI draft generation via modified generate-filing route
- DraftViewer for review/edit

**Step 2: Verify build, Step 3: Commit**

---

## Task 11: File Remand Motion Step

**Files:**
- Create: `src/components/step/file-remand-motion-step.tsx`

Same pattern as `file-amended-complaint-step.tsx` but:
- Title: "File Your Motion to Remand"
- No filing fee for motions
- Shows 30-day deadline countdown if `remand_motion_deadline` exists

**Step 1: Create, Step 2: Verify, Step 3: Commit**

---

## Task 12: Rule 26(f) Prep Step

**Files:**
- Create: `src/components/step/rule-26f-prep-step.tsx`

Educational step with expandable sections + date picker for conference date. On confirm, creates two deadlines.

**Step 1: Create the component**

Key content:
- Expandable sections:
  - "What to Prepare" — claims/defenses list, initial disclosures preview, discovery plan topics
  - "What to Expect" — informal meeting, cooperative tone, no judge present
  - "Discovery Plan Topics" — timing, scope, ESI, privilege log, trial date preferences
- Date picker for scheduled Rule 26(f) conference date
- On confirm:
  - Creates `rule_26f_conference` deadline at selected date
  - Creates `mandatory_disclosures_deadline` at 14 days after conference date
  - Completes task + runs gatekeeper

**Step 2: Verify build, Step 3: Commit**

---

## Task 13: Mandatory Disclosures Step

**Files:**
- Create: `src/components/step/mandatory-disclosures-step.tsx`

Checklist step for FRCP Rule 26(a)(1) mandatory initial disclosures.

**Step 1: Create the component**

Key content:
- Expandable items (each with checkbox):
  - "Individuals with discoverable information" — names + contact info of people likely to have relevant info
  - "Documents and ESI" — copies or descriptions of relevant documents, electronically stored information
  - "Damages computation" — computation of each category of damages claimed
  - "Insurance agreements" — any insurance agreement relevant to satisfying a judgment
- Each item has a checkbox + expandable explanation
- On confirm: completes task → gatekeeper unlocks `discovery_starter_pack`

**Step 2: Verify build, Step 3: Commit**

---

## Task 14: Wire All Steps into Step Page + Update Generate Filing Route

**Files:**
- Modify: `src/app/case/[id]/step/[taskId]/page.tsx`
- Modify: `src/app/api/cases/[id]/generate-filing/route.ts`

**Step 1: Add imports and switch cases**

Add imports for all 8 new step components. Add 8 new switch cases in the step page:

```tsx
import { UnderstandRemovalStep } from '@/components/step/understand-removal-step'
import { ChooseRemovalStrategyStep } from '@/components/step/choose-removal-strategy-step'
import { PrepareAmendedComplaintStep } from '@/components/step/prepare-amended-complaint-step'
import { FileAmendedComplaintStep } from '@/components/step/file-amended-complaint-step'
import { PrepareRemandMotionStep } from '@/components/step/prepare-remand-motion-step'
import { FileRemandMotionStep } from '@/components/step/file-remand-motion-step'
import { Rule26fPrepStep } from '@/components/step/rule-26f-prep-step'
import { MandatoryDisclosuresStep } from '@/components/step/mandatory-disclosures-step'
```

Each case fetches relevant data from the cases table and passes it to the component. Some steps need deadline data (e.g., `choose_removal_strategy` needs the remand deadline date).

**Step 2: Update generate-filing route**

Add a `document_type` field to the request schema. Branch on it:
- `document_type === 'amended_complaint'` → call `buildAmendedComplaintPrompt()`
- `document_type === 'motion_to_remand'` → call `buildRemandMotionPrompt()`
- Default (no document_type or `document_type === 'original'`) → call `buildFilingPrompt()` (existing behavior)

**Step 3: Verify build + run tests**

Run: `npx next build 2>&1 | tail -20`
Run: `npx vitest run 2>&1 | tail -20`
Expected: Build succeeds, all tests pass

**Step 4: Commit**

```bash
git add "src/app/case/[id]/step/[taskId]/page.tsx" "src/app/api/cases/[id]/generate-filing/route.ts"
git commit -m "feat: wire all removal steps into step page + support new doc types in generate-filing

8 new switch cases for removal steps. Generate filing route
now supports amended_complaint and motion_to_remand document types.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 15: API Routes for Court Type Update + Events

**Files:**
- Create or Modify: `src/app/api/cases/[id]/route.ts` (PATCH handler for court_type)
- Create or Modify: `src/app/api/cases/[id]/events/route.ts` (POST handler for audit events)

Check if these routes exist. If `PATCH /api/cases/[id]` doesn't exist, create it with court_type update support. If `POST /api/cases/[id]/events` doesn't exist, create it.

**Step 1: Check existing routes**

Look for `src/app/api/cases/[id]/route.ts`. If it exists, add PATCH support for `court_type`. If not, create a minimal route.

**Step 2: Create events route if needed**

```typescript
// src/app/api/cases/[id]/events/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: caseId } = await params
  const { supabase, error: authError } = await getAuthenticatedClient()
  if (authError) return authError

  const body = await request.json()
  const { kind, payload } = body

  if (!kind) {
    return NextResponse.json({ error: 'kind is required' }, { status: 400 })
  }

  const { error } = await supabase!.from('task_events').insert({
    case_id: caseId,
    kind,
    payload: payload ?? {},
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
```

**Step 3: Verify build, Step 4: Commit**

---

## Task 16: Build & Test Verification

**Files:** (none — verification only)

**Step 1: Run the full test suite**

Run: `npx vitest run 2>&1 | tail -30`
Expected: All tests pass (should be ~515+ tests with new gatekeeper + prompt tests)

**Step 2: Run the build**

Run: `npx next build 2>&1 | tail -20`
Expected: Build succeeds with no type errors

**Step 3: Manual smoke test checklist**

Run: `npm run dev`

Verify:
1. Existing docket check shows three radio options (no answer, answer filed, case removed)
2. Selecting "case removed" → gatekeeper unlocks `understand_removal`
3. Understand removal step shows educational content + date picker
4. Completing understand_removal → court_type changes to federal, remand deadline created
5. Choose strategy step shows three options with remand deadline countdown
6. Accept path: amended complaint → file → rule 26(f) → disclosures
7. Remand path: remand motion → file
8. Both path: all tasks unlock

**Step 4: Commit if any fixes needed**

```bash
git add -A
git commit -m "fix: address issues found during verification

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```
