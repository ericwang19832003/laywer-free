# Already Filed Petition Branching — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add an "already filed petition" question to the settlement negotiation step so users who've already filed can skip petition prep and filing, jumping straight to serving the defendant.

**Architecture:** Add `text` input type to the GuidedStep system, then add 4 new conditional questions to both PI settlement negotiation configs (injury + property damage). Extend the DB trigger's branching logic to handle 3 paths.

**Tech Stack:** TypeScript, React, PostgreSQL (Supabase migrations)

---

### Task 1: Add `text` Type to GuidedStep System

**Files:**
- Modify: `src/lib/guided-steps/types.ts`
- Modify: `src/components/step/guided-step.tsx`

**Step 1: Add `text` to QuestionDef type**

In `src/lib/guided-steps/types.ts`, change line 10:

```typescript
type: 'yes_no' | 'single_choice' | 'info'
```

to:

```typescript
type: 'yes_no' | 'single_choice' | 'info' | 'text'
```

Also add an optional `placeholder` field to QuestionDef:

```typescript
export interface QuestionDef {
  id: string
  prompt: string
  helpText?: string
  type: 'yes_no' | 'single_choice' | 'info' | 'text'
  options?: QuestionOption[]
  placeholder?: string
  showIf?: (answers: Record<string, string>) => boolean
}
```

**Step 2: Render `text` type in GuidedStep component**

In `src/components/step/guided-step.tsx`, find the question rendering block inside the `phase === 'questions'` section. Currently there's an `if/else` for `info` vs `yes_no/single_choice`. Add a third branch for `text` type.

After the `info` block and before the `yes_no/single_choice` block, add:

```tsx
) : currentQuestion.type === 'text' ? (
  <div>
    <h2 className="text-lg font-medium text-warm-text mb-2">
      {currentQuestion.prompt}
    </h2>
    {currentQuestion.helpText && (
      <p className="text-sm text-warm-muted mb-4">
        {currentQuestion.helpText}
      </p>
    )}
    <form
      onSubmit={(e) => {
        e.preventDefault()
        const input = e.currentTarget.elements.namedItem('text-input') as HTMLInputElement
        if (input.value.trim()) handleAnswer(input.value.trim())
      }}
      className="mt-4 space-y-3"
    >
      <input
        name="text-input"
        type="text"
        defaultValue={answers[currentQuestion.id] ?? ''}
        placeholder={currentQuestion.placeholder ?? ''}
        className="flex w-full rounded-md border border-warm-border bg-transparent px-3 py-2 text-sm text-warm-text shadow-xs placeholder:text-warm-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-calm-indigo"
        autoFocus
      />
      <Button type="submit" className="w-full">
        Continue &rarr;
      </Button>
    </form>
  </div>
```

Also update the `allAnswered` check in the initial phase calculation (line 36) and the `nextUnanswered` check (line 112-116) — `text` type should be treated like `yes_no`/`single_choice` (not like `info`), so the existing logic already handles it correctly since it only special-cases `info`.

**Step 3: Build and verify**

Run: `npm run build 2>&1 | tail -20`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/lib/guided-steps/types.ts src/components/step/guided-step.tsx
git commit -m "feat: add text input type to GuidedStep question system"
```

---

### Task 2: Add "Already Filed" Questions to PI Settlement Negotiation Config

**Files:**
- Modify: `src/lib/guided-steps/personal-injury/pi-settlement-negotiation.ts`

**Step 1: Add 4 new questions after `filing_suit_info`**

In the `questions` array, after the `filing_suit_info` question (line 80) and before `settled_info` (line 82), insert these 4 questions:

```typescript
    {
      id: 'already_filed_petition',
      type: 'yes_no',
      prompt: 'Have you already filed a petition (lawsuit) with the court?',
      helpText:
        'If you have already filed your petition independently or with help from another service, select Yes.',
      showIf: (answers) =>
        answers.settlement_reached === 'no' && answers.want_to_file_suit === 'yes',
    },
    {
      id: 'cause_number',
      type: 'text',
      prompt: 'What is your cause number (case number)?',
      helpText:
        'You can find this on your filed petition or the court receipt. Example: 2024-CI-12345.',
      placeholder: 'e.g. 2024-CI-12345',
      showIf: (answers) =>
        answers.settlement_reached === 'no' &&
        answers.want_to_file_suit === 'yes' &&
        answers.already_filed_petition === 'yes',
    },
    {
      id: 'petition_filing_date',
      type: 'text',
      prompt: 'When did you file your petition?',
      helpText: 'An approximate date is fine.',
      placeholder: 'e.g. January 2024',
      showIf: (answers) =>
        answers.settlement_reached === 'no' &&
        answers.want_to_file_suit === 'yes' &&
        answers.already_filed_petition === 'yes',
    },
    {
      id: 'already_filed_info',
      type: 'info',
      prompt:
        "Got it. Since you've already filed your petition, we'll skip the petition preparation and court filing steps and move straight to serving the defendant.",
      showIf: (answers) =>
        answers.settlement_reached === 'no' &&
        answers.want_to_file_suit === 'yes' &&
        answers.already_filed_petition === 'yes',
    },
```

**Step 2: Update the summary generator**

In the `generateSummary` function, replace the block at line 157-161:

```typescript
      if (answers.want_to_file_suit === 'yes') {
        items.push({
          status: 'needed',
          text: 'Filing a lawsuit. Next step: prepare your petition.',
        })
```

with:

```typescript
      if (answers.want_to_file_suit === 'yes') {
        if (answers.already_filed_petition === 'yes') {
          const causeInfo = answers.cause_number ? ` (Cause No. ${answers.cause_number})` : ''
          items.push({
            status: 'done',
            text: `Petition already filed${causeInfo}. Next step: serve the defendant.`,
          })
        } else {
          items.push({
            status: 'needed',
            text: 'Filing a lawsuit. Next step: prepare your petition.',
          })
        }
```

**Step 3: Build and verify**

Run: `npm run build 2>&1 | tail -20`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/lib/guided-steps/personal-injury/pi-settlement-negotiation.ts
git commit -m "feat: add already-filed-petition questions to PI settlement negotiation"
```

---

### Task 3: Add "Already Filed" Questions to Property Damage Variant

**Files:**
- Modify: `src/lib/guided-steps/personal-injury/pi-settlement-negotiation-property.ts`

**Step 1: Add the same 4 questions**

Insert the same 4 questions (`already_filed_petition`, `cause_number`, `petition_filing_date`, `already_filed_info`) after `filing_suit_info` and before `settled_info`, with identical `showIf` conditions.

**Step 2: Update the summary generator**

Same change as Task 2 — add the `already_filed_petition === 'yes'` branch.

Replace:

```typescript
      if (answers.want_to_file_suit === 'yes') {
        items.push({
          status: 'needed',
          text: 'Filing a lawsuit. Next step: prepare your petition.',
        })
```

with:

```typescript
      if (answers.want_to_file_suit === 'yes') {
        if (answers.already_filed_petition === 'yes') {
          const causeInfo = answers.cause_number ? ` (Cause No. ${answers.cause_number})` : ''
          items.push({
            status: 'done',
            text: `Petition already filed${causeInfo}. Next step: serve the defendant.`,
          })
        } else {
          items.push({
            status: 'needed',
            text: 'Filing a lawsuit. Next step: prepare your petition.',
          })
        }
```

**Step 3: Build and verify**

Run: `npm run build 2>&1 | tail -20`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/lib/guided-steps/personal-injury/pi-settlement-negotiation-property.ts
git commit -m "feat: add already-filed-petition questions to property damage settlement negotiation"
```

---

### Task 4: Extend DB Trigger for 3-Way Branching

**Files:**
- Create: `supabase/migrations/20260308000003_already_filed_branching.sql`

**Step 1: Create the migration**

This migration replaces the `unlock_next_task()` function with an updated version that handles 3 paths at `pi_settlement_negotiation`:

The ONLY change from the current trigger is in the `pi_settlement_negotiation` branching block (lines 66-90 of the current migration). Replace:

```sql
IF v_settlement_reached = 'no' AND v_want_to_file_suit = 'yes' THEN
  -- Filing suit: unlock prepare_pi_petition (normal litigation path)
  UPDATE public.tasks SET status = 'todo', unlocked_at = now()
  WHERE case_id = NEW.case_id AND task_key = 'prepare_pi_petition' AND status = 'locked';
```

with:

```sql
IF v_settlement_reached = 'no' AND v_want_to_file_suit = 'yes' THEN
  v_already_filed := COALESCE(NEW.metadata->'guided_answers'->>'already_filed_petition', '');

  IF v_already_filed = 'yes' THEN
    -- Already filed: skip petition + filing, unlock serve defendant
    UPDATE public.tasks SET status = 'skipped'
    WHERE case_id = NEW.case_id
      AND task_key IN ('prepare_pi_petition', 'pi_file_with_court')
      AND status = 'locked';

    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'pi_serve_defendant' AND status = 'locked';
  ELSE
    -- Not filed yet: unlock petition prep (current behavior)
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'prepare_pi_petition' AND status = 'locked';
  END IF;
```

Also add `v_already_filed TEXT;` to the DECLARE block.

**Full migration file:**

```sql
-- ============================================
-- Already Filed Petition Branching
-- ============================================
--
-- Extends the pi_settlement_negotiation branching to handle 3 paths:
--
--   Path A: settlement_reached = 'yes' OR want_to_file_suit = 'no'
--     -> skip all litigation tasks, unlock pi_post_resolution
--
--   Path B: want_to_file_suit = 'yes' AND already_filed_petition = 'yes'
--     -> skip prepare_pi_petition + pi_file_with_court, unlock pi_serve_defendant
--
--   Path C: want_to_file_suit = 'yes' AND already_filed_petition != 'yes'
--     -> unlock prepare_pi_petition (original behavior)
--
-- All other transitions remain exactly the same.
-- ============================================

CREATE OR REPLACE FUNCTION public.unlock_next_task()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_settlement_reached  TEXT;
  v_want_to_file_suit   TEXT;
  v_already_filed       TEXT;
BEGIN
```

Then copy the ENTIRE body of the current `unlock_next_task()` function from the previous migration, with ONLY the `pi_settlement_negotiation` block changed as described above. All other chains (debt, landlord-tenant, small claims, family, civil) remain identical.

**Step 2: Push migration**

Run: `npx supabase db push`
Expected: Migration applies successfully

**Step 3: Commit**

```bash
git add supabase/migrations/20260308000003_already_filed_branching.sql
git commit -m "feat: extend unlock_next_task trigger for already-filed-petition branching"
```

---

### Task 5: Build Verification

**Step 1: Full build**

Run: `npm run build 2>&1 | tail -20`
Expected: Build succeeds

**Step 2: Verify migration was pushed**

Run: `npx supabase db push --dry-run`
Expected: No pending migrations
