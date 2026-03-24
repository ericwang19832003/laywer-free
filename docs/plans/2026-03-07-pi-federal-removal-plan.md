# PI Federal Removal Support Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** When a PI case is removed to federal court during the wait-for-answer phase, dynamically inject the existing 6-step removal flow and resume the PI chain afterward.

**Architecture:** Add a removal detection question to `pi_wait_for_answer`. A new `inject_tasks` gatekeeper action dynamically creates 8 removal tasks. The SQL trigger is made conditional so it doesn't unlock `pi_review_answer` when removal is detected. The existing civil removal components handle the entire removal flow — no new UI needed. Three new gatekeeper rules handle: PI entry into removal, and PI chain resume after removal completes.

**Tech Stack:** Next.js 15, TypeScript, Supabase (PostgreSQL), Vitest, existing GuidedStep + removal components

---

### Task 1: Add removal detection question to pi_wait_for_answer

**Files:**
- Modify: `src/lib/guided-steps/personal-injury/pi-wait-for-answer.ts`

**Step 1: Add the removal question and info blocks**

After the existing `no_answer_info` question (the last question in the array), add 3 new questions before the closing `]`:

```typescript
    {
      id: 'case_removed',
      type: 'single_choice',
      prompt: 'Was your case removed to federal court by the defendant?',
      showIf: (answers) => answers.defendant_served === 'yes',
      options: [
        { value: 'yes', label: 'Yes, my case was removed to federal court' },
        { value: 'no', label: 'No' },
        { value: 'not_sure', label: 'I\'m not sure' },
      ],
    },
    {
      id: 'removal_check_info',
      type: 'info',
      prompt:
        'Check your court docket or look for a "Notice of Removal" from the defendant\'s attorney. If the case was removed, it will be transferred to the federal district court. You can also call the county clerk\'s office to confirm.',
      showIf: (answers) => answers.case_removed === 'not_sure',
    },
    {
      id: 'removal_detected_info',
      type: 'info',
      prompt:
        'When a case is removed to federal court, you have 30 days from the date of removal to file a motion to remand (send it back to state court). After completing this step, we\'ll guide you through your options: filing a motion to remand, preparing an amended complaint for federal court, or both.',
      showIf: (answers) => answers.case_removed === 'yes',
    },
```

Also update `generateSummary` to include removal status. Add before the final `return items`:

```typescript
    if (answers.case_removed === 'yes') {
      items.push({
        status: 'needed',
        text: 'Case removed to federal court. You have 30 days to file a motion to remand.',
      })
    }
```

**Step 2: Verify it compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

**Step 3: Commit**

```bash
git add src/lib/guided-steps/personal-injury/pi-wait-for-answer.ts
git commit -m "feat: add removal detection question to pi_wait_for_answer"
```

---

### Task 2: Make SQL trigger conditional for removal

**Files:**
- Create: `supabase/migrations/20260307000002_pi_removal_support.sql`

**Step 1: Write the migration**

This migration updates `unlock_next_task()` to make the `pi_wait_for_answer → pi_review_answer` transition conditional — it should NOT fire when the user reports the case was removed to federal court.

Read the FULL current `unlock_next_task()` function from `supabase/migrations/20260307000001_pi_litigation_flow_expansion.sql`. The function contains transitions for ALL dispute types. You must include ALL of them.

The ONLY change: find the PI transition:

```sql
  -- PI: pi_wait_for_answer -> pi_review_answer
  IF NEW.task_key = 'pi_wait_for_answer' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'pi_review_answer' AND status = 'locked';
  END IF;
```

Replace with:

```sql
  -- PI: pi_wait_for_answer -> pi_review_answer (ONLY if case NOT removed to federal)
  IF NEW.task_key = 'pi_wait_for_answer' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    IF COALESCE(NEW.metadata->'guided_answers'->>'case_removed', '') != 'yes' THEN
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'pi_review_answer' AND status = 'locked';
    END IF;
  END IF;
```

**CRITICAL:** Include the ENTIRE function body (all dispute type chains), not just the PI section. `CREATE OR REPLACE FUNCTION` replaces the whole function.

**Step 2: Run migration**

Run: `npx supabase db push`
Expected: Migration applied successfully

**Step 3: Commit**

```bash
git add supabase/migrations/20260307000002_pi_removal_support.sql
git commit -m "feat: make pi_wait_for_answer unlock conditional on removal"
```

---

### Task 3: Add inject_tasks action type to gatekeeper

**Files:**
- Modify: `src/lib/rules/gatekeeper.ts`
- Test: `tests/unit/rules/gatekeeper.test.ts`

**Step 1: Write the failing tests**

Add these tests at the end of the `describe('evaluateGatekeeperRules')` block in `tests/unit/rules/gatekeeper.test.ts`:

```typescript
  // ── PI Removal Rules ───────────────────────────────────

  describe('PI Removal — inject_tasks', () => {
    it('returns inject_tasks when pi_wait_for_answer completed with case_removed=yes and no removal tasks exist', () => {
      const actions = evaluateGatekeeperRules(
        makeInput({
          tasks: [
            makeTask('pi_wait_for_answer', 'completed', {
              guided_answers: { case_removed: 'yes' },
            }),
            // No understand_removal task exists
          ],
        })
      )

      const injectAction = actions.find((a) => a.type === 'inject_tasks')
      expect(injectAction).toBeDefined()
      expect(injectAction).toMatchObject({
        type: 'inject_tasks',
        task_definitions: expect.arrayContaining([
          expect.objectContaining({ task_key: 'understand_removal' }),
          expect.objectContaining({ task_key: 'choose_removal_strategy' }),
          expect.objectContaining({ task_key: 'prepare_amended_complaint' }),
          expect.objectContaining({ task_key: 'file_amended_complaint' }),
          expect.objectContaining({ task_key: 'prepare_remand_motion' }),
          expect.objectContaining({ task_key: 'file_remand_motion' }),
          expect.objectContaining({ task_key: 'rule_26f_prep' }),
          expect.objectContaining({ task_key: 'mandatory_disclosures' }),
        ]),
      })

      // Should also unlock understand_removal
      const unlockAction = actions.find(
        (a) => a.type === 'unlock_task' && a.task_key === 'understand_removal'
      )
      expect(unlockAction).toBeDefined()
    })

    it('does NOT inject when removal tasks already exist', () => {
      const actions = evaluateGatekeeperRules(
        makeInput({
          tasks: [
            makeTask('pi_wait_for_answer', 'completed', {
              guided_answers: { case_removed: 'yes' },
            }),
            makeTask('understand_removal', 'locked'), // Already exists
          ],
        })
      )

      const injectAction = actions.find((a) => a.type === 'inject_tasks')
      expect(injectAction).toBeUndefined()
    })

    it('does NOT inject when case_removed is not yes', () => {
      const actions = evaluateGatekeeperRules(
        makeInput({
          tasks: [
            makeTask('pi_wait_for_answer', 'completed', {
              guided_answers: { case_removed: 'no' },
            }),
          ],
        })
      )

      const injectAction = actions.find((a) => a.type === 'inject_tasks')
      expect(injectAction).toBeUndefined()
    })
  })

  describe('PI Removal — resume PI chain', () => {
    it('unlocks pi_review_answer when file_remand_motion completed and pi_review_answer is locked', () => {
      const actions = evaluateGatekeeperRules(
        makeInput({
          tasks: [
            makeTask('pi_wait_for_answer', 'completed', {
              guided_answers: { case_removed: 'yes' },
            }),
            makeTask('file_remand_motion', 'completed'),
            makeTask('pi_review_answer', 'locked'),
            makeTask('understand_removal', 'completed'),
          ],
        })
      )

      expect(actions).toContainEqual({
        type: 'unlock_task',
        task_key: 'pi_review_answer',
      })
    })

    it('unlocks pi_discovery_prep when mandatory_disclosures completed and pi_discovery_prep is locked', () => {
      const actions = evaluateGatekeeperRules(
        makeInput({
          tasks: [
            makeTask('pi_wait_for_answer', 'completed', {
              guided_answers: { case_removed: 'yes' },
            }),
            makeTask('mandatory_disclosures', 'completed'),
            makeTask('pi_discovery_prep', 'locked'),
            makeTask('understand_removal', 'completed'),
          ],
        })
      )

      expect(actions).toContainEqual({
        type: 'unlock_task',
        task_key: 'pi_discovery_prep',
      })
    })
  })
```

**Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/unit/rules/gatekeeper.test.ts 2>&1 | tail -20`
Expected: FAIL — `inject_tasks` type not recognized, new tests fail

**Step 3: Update the GatekeeperAction type and add rules**

In `src/lib/rules/gatekeeper.ts`, update the `GatekeeperAction` type:

```typescript
export type GatekeeperAction =
  | { type: 'unlock_task'; task_key: string; due_at?: string }
  | { type: 'complete_task'; task_key: string }
  | { type: 'inject_tasks'; task_definitions: { task_key: string; title: string }[]; then_unlock: string }
```

Then add 3 new rules at the end of `evaluateGatekeeperRules`, before `return actions`:

```typescript
  // ── PI Federal Removal Branch ─────────────────────────

  const piWaitTask = findTask(tasks, 'pi_wait_for_answer')
  const piWaitAnswers = piWaitTask?.metadata?.guided_answers as Record<string, string> | undefined
  const piReviewAnswerTask = findTask(tasks, 'pi_review_answer')
  const piDiscoveryPrepTask = findTask(tasks, 'pi_discovery_prep')

  // Rule 19: PI removal detected → inject removal tasks
  if (
    piWaitTask?.status === 'completed' &&
    piWaitAnswers?.case_removed === 'yes' &&
    !findTask(tasks, 'understand_removal') // Tasks don't exist yet
  ) {
    actions.push({
      type: 'inject_tasks',
      task_definitions: [
        { task_key: 'understand_removal', title: 'Understand the Removal' },
        { task_key: 'choose_removal_strategy', title: 'Choose Your Response Strategy' },
        { task_key: 'prepare_amended_complaint', title: 'Prepare First Amended Complaint' },
        { task_key: 'file_amended_complaint', title: 'File Your Amended Complaint' },
        { task_key: 'prepare_remand_motion', title: 'Prepare Motion to Remand' },
        { task_key: 'file_remand_motion', title: 'File Your Motion to Remand' },
        { task_key: 'rule_26f_prep', title: 'Prepare for Rule 26(f) Conference' },
        { task_key: 'mandatory_disclosures', title: 'Complete Mandatory Disclosures' },
      ],
      then_unlock: 'understand_removal',
    })
    actions.push({ type: 'unlock_task', task_key: 'understand_removal' })
  }

  // Rule 20: PI remand filed → resume PI chain at pi_review_answer
  if (
    piWaitAnswers?.case_removed === 'yes' &&
    fileRemandTask?.status === 'completed' &&
    piReviewAnswerTask?.status === 'locked'
  ) {
    actions.push({ type: 'unlock_task', task_key: 'pi_review_answer' })
  }

  // Rule 21: PI accepted federal → resume PI chain at pi_discovery_prep
  if (
    piWaitAnswers?.case_removed === 'yes' &&
    mandatoryDisclosuresTask?.status === 'completed' &&
    piDiscoveryPrepTask?.status === 'locked'
  ) {
    actions.push({ type: 'unlock_task', task_key: 'pi_discovery_prep' })
  }
```

**Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/unit/rules/gatekeeper.test.ts 2>&1 | tail -20`
Expected: ALL PASS

**Step 5: Commit**

```bash
git add src/lib/rules/gatekeeper.ts tests/unit/rules/gatekeeper.test.ts
git commit -m "feat: add PI removal gatekeeper rules with inject_tasks action"
```

---

### Task 4: Handle inject_tasks in apply-gatekeeper

**Files:**
- Modify: `src/lib/rules/apply-gatekeeper.ts`

**Step 1: Add inject_tasks handler**

In `apply-gatekeeper.ts`, after the existing action loop (find the `for (const action of actions)` loop), add handling for the new action type. Replace the loop:

Find the existing loop (`for (const action of actions) { ... }`). It currently handles `unlock_task` and `complete_task`. Add a new branch for `inject_tasks`:

```typescript
    if (action.type === 'inject_tasks') {
      // Dynamically create tasks that don't exist yet
      for (const def of action.task_definitions) {
        // Check if task already exists (idempotent)
        const exists = tasks.find((t) => t.task_key === def.task_key)
        if (exists) continue

        await supabase.from('tasks').insert({
          case_id: caseId,
          task_key: def.task_key,
          title: def.title,
          status: 'locked',
        })
      }

      // Update court_type to federal
      await supabase
        .from('cases')
        .update({ court_type: 'federal' })
        .eq('id', caseId)

      // Re-fetch tasks so subsequent actions (like unlock) find the new tasks
      const { data: refreshedTasks } = await supabase
        .from('tasks')
        .select('id, task_key, status, due_at, metadata')
        .eq('case_id', caseId)

      if (refreshedTasks) {
        tasks.splice(0, tasks.length, ...refreshedTasks)
      }

      actionsApplied.push(`inject_tasks:${action.task_definitions.map(d => d.task_key).join(',')}`)
    }
```

**Important:** The `tasks` variable is currently `const`. Change it to `let` at the top:

Find: `const { data: tasks, error: tasksError } = await supabase`
Note: We need `tasks` to be mutable for the re-fetch. Change the variable to be reassignable, or use `tasks.splice()` as shown above (works since arrays are reference types).

**Step 2: Update the action type guard**

The loop currently uses `action.type === 'unlock_task'` and `action.type === 'complete_task'`. The `inject_tasks` block needs to be processed BEFORE other actions (so newly injected tasks can be unlocked). Move the `inject_tasks` handling to run first:

Restructure the loop:

```typescript
  // Apply inject_tasks FIRST (creates tasks for subsequent unlock actions)
  for (const action of actions) {
    if (action.type === 'inject_tasks') {
      // ... inject handler above
    }
  }

  // Then apply unlock/complete actions
  for (const action of actions) {
    // Re-lookup task from potentially refreshed list
    const task = tasks.find((t) => t.task_key === action.task_key)
    if (!task) continue

    if (action.type === 'unlock_task') {
      // ... existing unlock handler
    }

    if (action.type === 'complete_task') {
      // ... existing complete handler
    }
  }
```

**Step 3: Verify it compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

**Step 4: Commit**

```bash
git add src/lib/rules/apply-gatekeeper.ts
git commit -m "feat: handle inject_tasks action in gatekeeper applier"
```

---

### Task 5: Call gatekeeper after pi_wait_for_answer completion

**Files:**
- Modify: `src/components/step/personal-injury/pi-wait-for-answer-step.tsx`

**Step 1: Convert thin wrapper to custom component with gatekeeper call**

The current thin wrapper just delegates to `<GuidedStep>`. We need to add a gatekeeper call after the task completes. However, `GuidedStep` doesn't have an `onAfterComplete` callback.

The simplest approach: modify the `GuidedStep` component to accept an optional `onAfterComplete` prop. But that affects all guided steps.

**Simpler approach:** Override the completion in the wrapper by not using `GuidedStep` directly — instead, use `GuidedStep`'s existing pattern but add the gatekeeper call inline.

**Actually simplest:** Add an `onAfterComplete` prop to `GuidedStep`:

Modify `src/components/step/guided-step.tsx` — add to the props interface:

```typescript
  onAfterComplete?: () => Promise<void>
```

In `handleComplete`, after the successful PATCH call and before `router.push`:

```typescript
      if (onAfterComplete) {
        await onAfterComplete()
      }
```

Then in `pi-wait-for-answer-step.tsx`:

```tsx
'use client'

import { GuidedStep } from '../guided-step'
import { piWaitForAnswerConfig } from '@/lib/guided-steps/personal-injury/pi-wait-for-answer'

interface Props {
  caseId: string
  taskId: string
  existingAnswers?: Record<string, string>
}

export function PIWaitForAnswerStep({ caseId, taskId, existingAnswers }: Props) {
  const handleAfterComplete = async () => {
    await fetch(`/api/cases/${caseId}/rules/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
  }

  return (
    <GuidedStep
      caseId={caseId}
      taskId={taskId}
      config={piWaitForAnswerConfig}
      existingAnswers={existingAnswers}
      onAfterComplete={handleAfterComplete}
    />
  )
}
```

**Step 2: Verify it compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/step/guided-step.tsx src/components/step/personal-injury/pi-wait-for-answer-step.tsx
git commit -m "feat: call gatekeeper after pi_wait_for_answer completion"
```

---

### Task 6: Build verification and integration test

**Step 1: Full build check**

Run: `npm run build 2>&1 | tail -30`
Expected: Build succeeds

**Step 2: Run all gatekeeper tests**

Run: `npx vitest run tests/unit/rules/gatekeeper.test.ts 2>&1`
Expected: ALL PASS

**Step 3: Push migration**

Run: `npx supabase db push`
Expected: Migration applied

**Step 4: Manual verification**

1. Open an existing PI case that's at the `pi_wait_for_answer` step
2. Answer the questions, select "Yes, my case was removed to federal court"
3. Complete the step
4. Verify: `pi_review_answer` should NOT be unlocked
5. Verify: `understand_removal` should appear as the next available step
6. Proceed through the removal flow (understand → choose strategy → etc.)
7. After completing remand or federal path, verify the PI chain resumes

**Step 5: Commit any fixes**

```bash
git add -A
git commit -m "chore: finalize PI federal removal support"
```
