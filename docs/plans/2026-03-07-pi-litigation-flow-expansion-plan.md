# PI Litigation Flow Expansion Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add 7 new TurboTax-style guided steps to the PI task chain between "Serve the Defendant" and "Prepare for Trial", covering the full mid-litigation phase.

**Architecture:** Each step is a `GuidedStepConfig` (questions + summary generator) paired with a thin React wrapper component. A SQL migration inserts 7 new tasks into the seed function and chains them in the unlock trigger. Milestones are updated to allow mid-litigation import.

**Tech Stack:** Next.js 15, TypeScript, Supabase (PostgreSQL), existing `GuidedStep` component

---

### Task 1: Database Migration — Seed 7 New Tasks

**Files:**
- Create: `supabase/migrations/20260307000001_pi_litigation_flow_expansion.sql`

**Step 1: Write the migration**

```sql
-- PI Litigation Flow Expansion
-- Adds 7 new tasks between pi_serve_defendant and pi_trial_prep
-- Updates the unlock chain to include new transitions

-- ============================
-- 1. Update seed_case_tasks()
-- ============================
CREATE OR REPLACE FUNCTION public.seed_case_tasks()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- ========================================
  -- Personal injury cases — early return
  -- ========================================
  IF NEW.dispute_type = 'personal_injury' THEN
    INSERT INTO public.tasks (case_id, task_key, title, status, unlocked_at)
    VALUES (NEW.id, 'welcome', 'Welcome — Get Started', 'todo', now());

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'pi_intake', 'Tell Us About Your Injury', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'pi_medical_records', 'Organize Your Medical Records', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'evidence_vault', 'Collect Your Evidence', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'pi_insurance_communication', 'Communicate With Insurance', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'prepare_pi_demand_letter', 'Draft Your Demand Letter', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'pi_settlement_negotiation', 'Negotiate Your Settlement', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'prepare_pi_petition', 'Prepare Your Court Petition', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'pi_file_with_court', 'File With the Court', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'pi_serve_defendant', 'Serve the Defendant', 'locked');

    -- === 7 NEW MID-LITIGATION TASKS ===
    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'pi_wait_for_answer', 'Wait for the Answer', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'pi_review_answer', 'Review the Opposing Answer', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'pi_discovery_prep', 'Prepare Your Discovery Requests', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'pi_discovery_responses', 'Respond to Opposing Discovery', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'pi_scheduling_conference', 'Scheduling Conference & Court Dates', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'pi_pretrial_motions', 'Pre-Trial Motions', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'pi_mediation', 'Mediation & Settlement Conference', 'locked');
    -- === END NEW TASKS ===

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'pi_trial_prep', 'Prepare for Trial', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'pi_post_resolution', 'After Resolution', 'locked');

    INSERT INTO public.task_events (case_id, kind, payload)
    VALUES (NEW.id, 'case_created', jsonb_build_object(
      'role', NEW.role,
      'county', NEW.county,
      'court_type', NEW.court_type,
      'dispute_type', NEW.dispute_type
    ));

    RETURN NEW;
  END IF;

  -- ========================================
  -- Debt collection defendant cases — early return
  -- ========================================
  IF NEW.dispute_type = 'debt_collection' AND NEW.role = 'defendant' THEN
    INSERT INTO public.tasks (case_id, task_key, title, status, unlocked_at)
    VALUES (NEW.id, 'welcome', 'Welcome — Get Started', 'todo', now());

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'debt_defense_intake', 'Tell Us About the Debt', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'evidence_vault', 'Organize Your Evidence', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'debt_validation_letter', 'Send Debt Validation Letter', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'prepare_debt_answer', 'Prepare Your Answer', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'debt_file_with_court', 'File Your Answer With the Court', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'serve_plaintiff', 'Serve the Plaintiff', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'debt_hearing_prep', 'Prepare for Your Hearing', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'debt_hearing_day', 'Hearing Day', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'debt_post_judgment', 'After the Judgment', 'locked');

    INSERT INTO public.task_events (case_id, kind, payload)
    VALUES (NEW.id, 'case_created', jsonb_build_object(
      'role', NEW.role,
      'county', NEW.county,
      'court_type', NEW.court_type,
      'dispute_type', NEW.dispute_type
    ));

    RETURN NEW;
  END IF;

  -- ========================================
  -- All other dispute types (original logic)
  -- ========================================
  INSERT INTO public.tasks (case_id, task_key, title, status, unlocked_at)
  VALUES (NEW.id, 'welcome', 'Welcome — Get Started', 'todo', now());

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'intake', 'Tell Us About Your Situation', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'evidence_vault', 'Organize Your Evidence', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'draft_demand', 'Draft a Demand Letter', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'prepare_filing', 'Prepare Your Court Filing', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'file_with_court', 'File With the Court', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'serve_other_party', 'Serve the Other Party', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'trial_prep_checklist', 'Prepare for Trial', 'locked');

  INSERT INTO public.task_events (case_id, kind, payload)
  VALUES (NEW.id, 'case_created', jsonb_build_object(
    'role', NEW.role,
    'county', NEW.county,
    'court_type', NEW.court_type,
    'dispute_type', NEW.dispute_type
  ));

  RETURN NEW;
END;
$$;
```

**Important:** The migration must include the FULL `seed_case_tasks()` function body because `CREATE OR REPLACE FUNCTION` replaces the entire function. Read the current migration at `supabase/migrations/20260304000001_personal_injury_tables.sql` (lines 90-300+) to capture ALL dispute type branches (personal_injury, debt_collection defendant, and default). Only the personal_injury branch changes — add the 7 new INSERTs between `pi_serve_defendant` and `pi_trial_prep`.

**Step 2: Update unlock_next_task() in the same migration**

Append to the same migration file. Again, `CREATE OR REPLACE` replaces the whole function, so include ALL existing transitions. The only PI change: replace the single `pi_serve_defendant → pi_trial_prep` transition with 8 new transitions:

```sql
  -- PI: pi_serve_defendant -> pi_wait_for_answer (was -> pi_trial_prep)
  IF NEW.task_key = 'pi_serve_defendant' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'pi_wait_for_answer' AND status = 'locked';
  END IF;

  -- PI: pi_wait_for_answer -> pi_review_answer
  IF NEW.task_key = 'pi_wait_for_answer' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'pi_review_answer' AND status = 'locked';
  END IF;

  -- PI: pi_review_answer -> pi_discovery_prep
  IF NEW.task_key = 'pi_review_answer' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'pi_discovery_prep' AND status = 'locked';
  END IF;

  -- PI: pi_discovery_prep -> pi_discovery_responses
  IF NEW.task_key = 'pi_discovery_prep' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'pi_discovery_responses' AND status = 'locked';
  END IF;

  -- PI: pi_discovery_responses -> pi_scheduling_conference
  IF NEW.task_key = 'pi_discovery_responses' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'pi_scheduling_conference' AND status = 'locked';
  END IF;

  -- PI: pi_scheduling_conference -> pi_pretrial_motions
  IF NEW.task_key = 'pi_scheduling_conference' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'pi_pretrial_motions' AND status = 'locked';
  END IF;

  -- PI: pi_pretrial_motions -> pi_mediation
  IF NEW.task_key = 'pi_pretrial_motions' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'pi_mediation' AND status = 'locked';
  END IF;

  -- PI: pi_mediation -> pi_trial_prep
  IF NEW.task_key = 'pi_mediation' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'pi_trial_prep' AND status = 'locked';
  END IF;
```

**Step 3: Backfill existing PI cases**

At the end of the migration, add tasks for existing PI cases that don't have the new tasks yet:

```sql
-- Backfill: Insert new tasks for existing PI cases
INSERT INTO public.tasks (case_id, task_key, title, status)
SELECT c.id, 'pi_wait_for_answer', 'Wait for the Answer', 'locked'
FROM public.cases c
WHERE c.dispute_type = 'personal_injury'
AND NOT EXISTS (SELECT 1 FROM public.tasks t WHERE t.case_id = c.id AND t.task_key = 'pi_wait_for_answer');

INSERT INTO public.tasks (case_id, task_key, title, status)
SELECT c.id, 'pi_review_answer', 'Review the Opposing Answer', 'locked'
FROM public.cases c
WHERE c.dispute_type = 'personal_injury'
AND NOT EXISTS (SELECT 1 FROM public.tasks t WHERE t.case_id = c.id AND t.task_key = 'pi_review_answer');

INSERT INTO public.tasks (case_id, task_key, title, status)
SELECT c.id, 'pi_discovery_prep', 'Prepare Your Discovery Requests', 'locked'
FROM public.cases c
WHERE c.dispute_type = 'personal_injury'
AND NOT EXISTS (SELECT 1 FROM public.tasks t WHERE t.case_id = c.id AND t.task_key = 'pi_discovery_prep');

INSERT INTO public.tasks (case_id, task_key, title, status)
SELECT c.id, 'pi_discovery_responses', 'Respond to Opposing Discovery', 'locked'
FROM public.cases c
WHERE c.dispute_type = 'personal_injury'
AND NOT EXISTS (SELECT 1 FROM public.tasks t WHERE t.case_id = c.id AND t.task_key = 'pi_discovery_responses');

INSERT INTO public.tasks (case_id, task_key, title, status)
SELECT c.id, 'pi_scheduling_conference', 'Scheduling Conference & Court Dates', 'locked'
FROM public.cases c
WHERE c.dispute_type = 'personal_injury'
AND NOT EXISTS (SELECT 1 FROM public.tasks t WHERE t.case_id = c.id AND t.task_key = 'pi_scheduling_conference');

INSERT INTO public.tasks (case_id, task_key, title, status)
SELECT c.id, 'pi_pretrial_motions', 'Pre-Trial Motions', 'locked'
FROM public.cases c
WHERE c.dispute_type = 'personal_injury'
AND NOT EXISTS (SELECT 1 FROM public.tasks t WHERE t.case_id = c.id AND t.task_key = 'pi_pretrial_motions');

INSERT INTO public.tasks (case_id, task_key, title, status)
SELECT c.id, 'pi_mediation', 'Mediation & Settlement Conference', 'locked'
FROM public.cases c
WHERE c.dispute_type = 'personal_injury'
AND NOT EXISTS (SELECT 1 FROM public.tasks t WHERE t.case_id = c.id AND t.task_key = 'pi_mediation');
```

**Step 4: Run migration**

Run: `npx supabase db push`
Expected: Migration applied successfully

**Step 5: Commit**

```bash
git add supabase/migrations/20260307000001_pi_litigation_flow_expansion.sql
git commit -m "feat: add 7 mid-litigation PI tasks to seed and unlock chain"
```

---

### Task 2: Guided Step Config — pi_wait_for_answer

**Files:**
- Create: `src/lib/guided-steps/personal-injury/pi-wait-for-answer.ts`

**Step 1: Write the config file**

```typescript
import type { GuidedStepConfig } from '../types'

export const piWaitForAnswerConfig: GuidedStepConfig = {
  title: 'Wait for the Answer',
  reassurance:
    'After the defendant is served, they have a limited time to file an answer with the court. This step helps you track that deadline.',

  questions: [
    {
      id: 'petition_filed_date',
      type: 'single_choice',
      prompt: 'When did you file your petition with the court?',
      options: [
        { value: 'less_than_week', label: 'Less than a week ago' },
        { value: 'one_to_two_weeks', label: '1–2 weeks ago' },
        { value: 'two_to_four_weeks', label: '2–4 weeks ago' },
        { value: 'over_a_month', label: 'Over a month ago' },
      ],
    },
    {
      id: 'defendant_served',
      type: 'yes_no',
      prompt: 'Has the defendant been officially served?',
    },
    {
      id: 'serve_first_info',
      type: 'info',
      prompt:
        'The defendant must be served before the answer deadline starts. Go back to the "Serve the Defendant" step if service has not been completed.',
      showIf: (answers) => answers.defendant_served === 'no',
    },
    {
      id: 'service_date',
      type: 'single_choice',
      prompt: 'Approximately when was the defendant served?',
      showIf: (answers) => answers.defendant_served === 'yes',
      options: [
        { value: 'less_than_week', label: 'Less than a week ago' },
        { value: 'one_to_two_weeks', label: '1–2 weeks ago' },
        { value: 'two_to_three_weeks', label: '2–3 weeks ago' },
        { value: 'over_three_weeks', label: 'Over 3 weeks ago' },
      ],
    },
    {
      id: 'deadline_info',
      type: 'info',
      prompt:
        'In Texas, the defendant generally has until the first Monday after 20 days from the date of service to file an answer. If the 20th day falls on a weekend, the deadline extends to the following Monday.',
      showIf: (answers) => answers.defendant_served === 'yes',
    },
    {
      id: 'answer_received',
      type: 'single_choice',
      prompt: 'Have you received the defendant\'s answer?',
      showIf: (answers) => answers.defendant_served === 'yes',
      options: [
        { value: 'yes', label: 'Yes, I have their answer' },
        { value: 'no', label: 'No, still waiting' },
        { value: 'not_sure', label: 'I\'m not sure how to check' },
      ],
    },
    {
      id: 'check_answer_info',
      type: 'info',
      prompt:
        'You can check if an answer has been filed by looking up your case on the county court\'s online docket, or by calling the clerk\'s office. You may also receive a copy by mail from the defendant\'s attorney.',
      showIf: (answers) => answers.answer_received === 'not_sure',
    },
    {
      id: 'no_answer_info',
      type: 'info',
      prompt:
        'If the defendant does not file an answer by the deadline, you may be eligible to request a default judgment. This means the court could rule in your favor without a trial.',
      showIf: (answers) => answers.answer_received === 'no' && answers.service_date === 'over_three_weeks',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.defendant_served === 'yes') {
      items.push({ status: 'done', text: 'Defendant has been served.' })
    } else {
      items.push({ status: 'needed', text: 'Defendant must be served before the answer deadline begins.' })
    }

    if (answers.answer_received === 'yes') {
      items.push({ status: 'done', text: 'Answer received from defendant. Ready to review.' })
    } else if (answers.answer_received === 'no') {
      if (answers.service_date === 'over_three_weeks') {
        items.push({ status: 'info', text: 'Deadline may have passed. Consider requesting a default judgment if no answer was filed.' })
      } else {
        items.push({ status: 'needed', text: 'Still waiting for the defendant\'s answer. Monitor the court docket.' })
      }
    } else if (answers.answer_received === 'not_sure') {
      items.push({ status: 'needed', text: 'Check the court docket or call the clerk to see if an answer was filed.' })
    }

    items.push({
      status: 'info',
      text: 'In Texas, the defendant has until the first Monday after 20 days from service to file an answer.',
    })

    return items
  },
}
```

**Step 2: Verify it compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

**Step 3: Commit**

```bash
git add src/lib/guided-steps/personal-injury/pi-wait-for-answer.ts
git commit -m "feat: add pi_wait_for_answer guided step config"
```

---

### Task 3: Guided Step Config — pi_review_answer

**Files:**
- Create: `src/lib/guided-steps/personal-injury/pi-review-answer.ts`

**Step 1: Write the config file**

```typescript
import type { GuidedStepConfig } from '../types'

export const piReviewAnswerConfig: GuidedStepConfig = {
  title: 'Review the Opposing Answer',
  reassurance:
    'Understanding the defendant\'s answer helps you prepare your case strategy. We\'ll walk through what to look for.',

  questions: [
    {
      id: 'denial_type',
      type: 'single_choice',
      prompt: 'Did opposing counsel file a general denial or specific denials?',
      options: [
        { value: 'general', label: 'General denial' },
        { value: 'specific', label: 'Specific denials' },
        { value: 'not_sure', label: 'I\'m not sure' },
      ],
    },
    {
      id: 'general_denial_info',
      type: 'info',
      prompt:
        'A general denial means the defendant denies everything in your petition. This is common and means you\'ll need to prove each element of your claim at trial.',
      showIf: (answers) => answers.denial_type === 'general',
    },
    {
      id: 'specific_denial_info',
      type: 'info',
      prompt:
        'Specific denials mean the defendant only disputes certain facts. Look carefully at what they admit vs. deny — admissions can simplify your case.',
      showIf: (answers) => answers.denial_type === 'specific',
    },
    {
      id: 'denial_help_info',
      type: 'info',
      prompt:
        'Look at the first page of the answer document. If it says "Defendant generally denies each and every allegation," that\'s a general denial. If it addresses specific paragraphs of your petition, those are specific denials.',
      showIf: (answers) => answers.denial_type === 'not_sure',
    },
    {
      id: 'affirmative_defenses',
      type: 'single_choice',
      prompt: 'Did they raise any affirmative defenses?',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
        { value: 'not_sure', label: 'I\'m not sure' },
      ],
    },
    {
      id: 'which_defenses',
      type: 'single_choice',
      prompt: 'Which affirmative defenses did they raise? (select the primary one)',
      showIf: (answers) => answers.affirmative_defenses === 'yes',
      options: [
        { value: 'contributory_negligence', label: 'Contributory/comparative negligence' },
        { value: 'assumption_of_risk', label: 'Assumption of risk' },
        { value: 'statute_of_limitations', label: 'Statute of limitations' },
        { value: 'other', label: 'Other defense' },
      ],
    },
    {
      id: 'contributory_info',
      type: 'info',
      prompt:
        'Contributory negligence means they claim you were partly at fault. In Texas, you can still recover damages as long as you\'re less than 51% at fault, but your award is reduced by your percentage of fault.',
      showIf: (answers) => answers.which_defenses === 'contributory_negligence',
    },
    {
      id: 'counterclaim',
      type: 'yes_no',
      prompt: 'Did they file a counterclaim against you?',
    },
    {
      id: 'counterclaim_info',
      type: 'info',
      prompt:
        'A counterclaim means the defendant is suing you back. You generally have 30 days to respond to the counterclaim. Consider consulting an attorney if the counterclaim involves significant damages.',
      showIf: (answers) => answers.counterclaim === 'yes',
    },
    {
      id: 'special_exceptions',
      type: 'single_choice',
      prompt: 'Did they file special exceptions (challenges to your petition\'s form)?',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
        { value: 'not_sure', label: 'I\'m not sure' },
      ],
    },
    {
      id: 'special_exceptions_info',
      type: 'info',
      prompt:
        'Special exceptions challenge the form of your petition — they\'re saying your petition isn\'t specific enough. You may need to amend your petition to address these. The court will typically give you a chance to fix any issues.',
      showIf: (answers) => answers.special_exceptions === 'yes',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.denial_type === 'general') {
      items.push({ status: 'info', text: 'Defendant filed a general denial. You must prove all elements of your claim.' })
    } else if (answers.denial_type === 'specific') {
      items.push({ status: 'info', text: 'Defendant filed specific denials. Focus discovery on the disputed facts.' })
    } else {
      items.push({ status: 'needed', text: 'Review the answer to determine the type of denial filed.' })
    }

    if (answers.affirmative_defenses === 'yes') {
      items.push({ status: 'info', text: `Affirmative defense raised: ${answers.which_defenses?.replace(/_/g, ' ') ?? 'see answer document'}.` })
    }

    if (answers.counterclaim === 'yes') {
      items.push({ status: 'needed', text: 'Respond to the counterclaim within 30 days.' })
    }

    if (answers.special_exceptions === 'yes') {
      items.push({ status: 'needed', text: 'Address special exceptions by amending your petition.' })
    }

    items.push({ status: 'done', text: 'Answer reviewed. Proceed to discovery.' })

    return items
  },
}
```

**Step 2: Verify it compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

**Step 3: Commit**

```bash
git add src/lib/guided-steps/personal-injury/pi-review-answer.ts
git commit -m "feat: add pi_review_answer guided step config"
```

---

### Task 4: Guided Step Config — pi_discovery_prep

**Files:**
- Create: `src/lib/guided-steps/personal-injury/pi-discovery-prep.ts`

**Step 1: Write the config file**

```typescript
import type { GuidedStepConfig } from '../types'

export const piDiscoveryPrepConfig: GuidedStepConfig = {
  title: 'Prepare Your Discovery Requests',
  reassurance:
    'Discovery is how both sides gather evidence before trial. We\'ll help you understand the tools available and plan what to request.',

  questions: [
    {
      id: 'discovery_overview',
      type: 'info',
      prompt:
        'Discovery is the formal process for gathering evidence. In Texas, you can use: interrogatories (written questions), requests for production (documents), requests for admission (confirm/deny facts), and depositions (sworn testimony).',
    },
    {
      id: 'sent_interrogatories',
      type: 'single_choice',
      prompt: 'Have you sent interrogatories (written questions) to the defendant?',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
        { value: 'not_familiar', label: 'I\'m not familiar with these' },
      ],
    },
    {
      id: 'interrogatories_info',
      type: 'info',
      prompt:
        'Interrogatories are written questions the defendant must answer under oath. In a PI case, you\'d typically ask about: the defendant\'s version of events, their insurance coverage, witnesses they know of, and any prior incidents. Texas limits you to 25 interrogatories (including subparts).',
      showIf: (answers) => answers.sent_interrogatories === 'not_familiar',
    },
    {
      id: 'sent_rfps',
      type: 'single_choice',
      prompt: 'Have you sent requests for production (document requests)?',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
        { value: 'not_familiar', label: 'I\'m not familiar with these' },
      ],
    },
    {
      id: 'rfps_info',
      type: 'info',
      prompt:
        'Requests for production ask the other side to provide documents. In a PI case, you\'d request: the defendant\'s insurance policy, incident reports, photos, surveillance footage, maintenance records, cell phone records from the time of the incident, and any internal communications about the incident.',
      showIf: (answers) => answers.sent_rfps === 'not_familiar',
    },
    {
      id: 'planning_depositions',
      type: 'single_choice',
      prompt: 'Are you planning to take any depositions?',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
        { value: 'not_sure', label: 'Not sure yet' },
      ],
    },
    {
      id: 'depositions_info',
      type: 'info',
      prompt:
        'Depositions are live, sworn testimony recorded by a court reporter. In PI cases, you might depose: the defendant, the defendant\'s insurance adjuster, eyewitnesses, and the defendant\'s medical expert (if they have one). Depositions can be expensive due to court reporter fees.',
      showIf: (answers) => answers.planning_depositions !== 'yes',
    },
    {
      id: 'subpoena_medical',
      type: 'single_choice',
      prompt: 'Have you subpoenaed medical records from the defendant\'s insurance company?',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
        { value: 'not_applicable', label: 'Not applicable to my case' },
      ],
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.sent_interrogatories === 'yes') {
      items.push({ status: 'done', text: 'Interrogatories sent to defendant.' })
    } else {
      items.push({ status: 'needed', text: 'Consider sending interrogatories to the defendant (limit: 25 in Texas).' })
    }

    if (answers.sent_rfps === 'yes') {
      items.push({ status: 'done', text: 'Requests for production sent.' })
    } else {
      items.push({ status: 'needed', text: 'Consider sending requests for production (insurance policy, incident reports, photos, etc.).' })
    }

    if (answers.planning_depositions === 'yes') {
      items.push({ status: 'done', text: 'Depositions are being planned.' })
    } else if (answers.planning_depositions === 'not_sure') {
      items.push({ status: 'info', text: 'Consider whether depositions would strengthen your case. They\'re especially useful for locking in witness testimony.' })
    }

    if (answers.subpoena_medical === 'yes') {
      items.push({ status: 'done', text: 'Medical records subpoenaed from defendant\'s insurance.' })
    } else if (answers.subpoena_medical === 'no') {
      items.push({ status: 'needed', text: 'Consider subpoenaing medical records from the defendant\'s insurance company.' })
    }

    return items
  },
}
```

**Step 2: Verify it compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

**Step 3: Commit**

```bash
git add src/lib/guided-steps/personal-injury/pi-discovery-prep.ts
git commit -m "feat: add pi_discovery_prep guided step config"
```

---

### Task 5: Guided Step Config — pi_discovery_responses

**Files:**
- Create: `src/lib/guided-steps/personal-injury/pi-discovery-responses.ts`

**Step 1: Write the config file**

```typescript
import type { GuidedStepConfig } from '../types'

export const piDiscoveryResponsesConfig: GuidedStepConfig = {
  title: 'Respond to Opposing Discovery',
  reassurance:
    'The defendant will likely send you discovery requests too. We\'ll help you understand what\'s required and how to respond properly.',

  questions: [
    {
      id: 'received_discovery',
      type: 'single_choice',
      prompt: 'Has opposing counsel sent you discovery requests?',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
        { value: 'not_yet', label: 'Not yet, but I expect them' },
      ],
    },
    {
      id: 'discovery_type',
      type: 'single_choice',
      prompt: 'What type of discovery requests did you receive? (select primary type)',
      showIf: (answers) => answers.received_discovery === 'yes',
      options: [
        { value: 'interrogatories', label: 'Interrogatories (written questions)' },
        { value: 'rfps', label: 'Requests for production (documents)' },
        { value: 'rfas', label: 'Requests for admission (confirm/deny)' },
        { value: 'deposition', label: 'Deposition notice' },
      ],
    },
    {
      id: 'know_deadline',
      type: 'yes_no',
      prompt: 'Do you know your response deadline?',
      showIf: (answers) => answers.received_discovery === 'yes',
    },
    {
      id: 'deadline_info',
      type: 'info',
      prompt:
        'In Texas, you generally have 30 days from the date you receive discovery requests to respond. For requests for admission, if you don\'t respond within 30 days, they are automatically deemed admitted — this can be devastating to your case.',
      showIf: (answers) => answers.know_deadline === 'no',
    },
    {
      id: 'objectionable_questions',
      type: 'single_choice',
      prompt: 'Are there any questions or requests that seem objectionable or overly broad?',
      showIf: (answers) => answers.received_discovery === 'yes',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
        { value: 'not_sure', label: 'I\'m not sure what\'s objectionable' },
      ],
    },
    {
      id: 'objections_info',
      type: 'info',
      prompt:
        'Common objections include: overly broad (asks for too much), not relevant to the case, privileged (attorney-client or medical), unduly burdensome, or vague. You can object to specific requests while still answering the rest.',
      showIf: (answers) => answers.objectionable_questions === 'yes' || answers.objectionable_questions === 'not_sure',
    },
    {
      id: 'ime_requested',
      type: 'yes_no',
      prompt: 'Has the defendant requested an independent medical examination (IME)?',
      showIf: (answers) => answers.received_discovery === 'yes',
    },
    {
      id: 'ime_info',
      type: 'info',
      prompt:
        'An IME is an examination by a doctor chosen by the defendant. You have the right to: know the doctor\'s name and specialty in advance, have the exam recorded, receive a copy of the report, and object if the exam is unreasonable. The exam should be limited to the injuries in your case.',
      showIf: (answers) => answers.ime_requested === 'yes',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.received_discovery === 'yes') {
      items.push({ status: 'info', text: `Received discovery requests: ${answers.discovery_type?.replace(/_/g, ' ') ?? 'type noted'}.` })

      if (answers.know_deadline === 'no') {
        items.push({ status: 'needed', text: 'Determine your 30-day response deadline. Missing it can have serious consequences.' })
      } else {
        items.push({ status: 'done', text: 'Response deadline is known.' })
      }

      if (answers.objectionable_questions === 'yes') {
        items.push({ status: 'info', text: 'Some requests may be objectionable. Prepare written objections for those specific items.' })
      }
    } else if (answers.received_discovery === 'not_yet') {
      items.push({ status: 'info', text: 'Expect to receive discovery requests from opposing counsel. You\'ll have 30 days to respond.' })
    } else {
      items.push({ status: 'info', text: 'No discovery requests received yet.' })
    }

    if (answers.ime_requested === 'yes') {
      items.push({ status: 'needed', text: 'Prepare for the independent medical examination. You may request it be recorded.' })
    }

    return items
  },
}
```

**Step 2: Verify it compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

**Step 3: Commit**

```bash
git add src/lib/guided-steps/personal-injury/pi-discovery-responses.ts
git commit -m "feat: add pi_discovery_responses guided step config"
```

---

### Task 6: Guided Step Config — pi_scheduling_conference

**Files:**
- Create: `src/lib/guided-steps/personal-injury/pi-scheduling-conference.ts`

**Step 1: Write the config file**

```typescript
import type { GuidedStepConfig } from '../types'

export const piSchedulingConferenceConfig: GuidedStepConfig = {
  title: 'Scheduling Conference & Court Dates',
  reassurance:
    'Courts set key deadlines through scheduling orders. This step helps you track and prepare for important court dates.',

  questions: [
    {
      id: 'scheduling_order',
      type: 'single_choice',
      prompt: 'Has the court issued a scheduling order?',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
        { value: 'not_sure', label: 'I\'m not sure' },
      ],
    },
    {
      id: 'scheduling_order_info',
      type: 'info',
      prompt:
        'A scheduling order sets deadlines for discovery, expert designations, and trial. Check with the court clerk or look at your court\'s online docket to see if one has been issued.',
      showIf: (answers) => answers.scheduling_order === 'not_sure',
    },
    {
      id: 'know_discovery_cutoff',
      type: 'yes_no',
      prompt: 'Do you know the discovery cutoff date?',
      showIf: (answers) => answers.scheduling_order === 'yes',
    },
    {
      id: 'know_trial_date',
      type: 'yes_no',
      prompt: 'Has a trial date been set?',
      showIf: (answers) => answers.scheduling_order === 'yes',
    },
    {
      id: 'pretrial_conference',
      type: 'single_choice',
      prompt: 'Has a pretrial conference been scheduled?',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
        { value: 'not_sure', label: 'I\'m not sure' },
      ],
    },
    {
      id: 'pretrial_conference_info',
      type: 'info',
      prompt:
        'A pretrial conference is a meeting with the judge to discuss the status of the case, resolve disputes, and prepare for trial. Be prepared to discuss: the status of discovery, any pending motions, settlement prospects, and estimated trial length.',
      showIf: (answers) => answers.pretrial_conference === 'yes' || answers.pretrial_conference === 'not_sure',
    },
    {
      id: 'expert_designations',
      type: 'single_choice',
      prompt: 'Have you exchanged expert witness designations?',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
        { value: 'not_applicable', label: 'Not applicable' },
      ],
    },
    {
      id: 'expert_info',
      type: 'info',
      prompt:
        'In a personal injury case, you\'ll typically need a medical expert to testify about your injuries, treatment, and prognosis. Expert designations must be served by the deadline in the scheduling order, or the expert may be excluded from trial.',
      showIf: (answers) => answers.expert_designations === 'no',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.scheduling_order === 'yes') {
      items.push({ status: 'done', text: 'Scheduling order issued by the court.' })

      if (answers.know_discovery_cutoff === 'yes') {
        items.push({ status: 'done', text: 'Discovery cutoff date is known.' })
      } else {
        items.push({ status: 'needed', text: 'Identify the discovery cutoff date from the scheduling order.' })
      }

      if (answers.know_trial_date === 'yes') {
        items.push({ status: 'done', text: 'Trial date has been set.' })
      } else {
        items.push({ status: 'info', text: 'Trial date not yet set. The court will schedule this later.' })
      }
    } else {
      items.push({ status: 'info', text: 'Scheduling order not yet issued. The court will typically issue one after the answer is filed.' })
    }

    if (answers.expert_designations === 'yes') {
      items.push({ status: 'done', text: 'Expert witness designations exchanged.' })
    } else if (answers.expert_designations === 'no') {
      items.push({ status: 'needed', text: 'Arrange for a medical expert and prepare expert designation before the deadline.' })
    }

    return items
  },
}
```

**Step 2: Verify it compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

**Step 3: Commit**

```bash
git add src/lib/guided-steps/personal-injury/pi-scheduling-conference.ts
git commit -m "feat: add pi_scheduling_conference guided step config"
```

---

### Task 7: Guided Step Config — pi_pretrial_motions

**Files:**
- Create: `src/lib/guided-steps/personal-injury/pi-pretrial-motions.ts`

**Step 1: Write the config file**

```typescript
import type { GuidedStepConfig } from '../types'

export const piPretrialMotionsConfig: GuidedStepConfig = {
  title: 'Pre-Trial Motions',
  reassurance:
    'Before trial, either side may file motions that can shape or even resolve the case. We\'ll help you understand what to watch for.',

  questions: [
    {
      id: 'msj_filed',
      type: 'single_choice',
      prompt: 'Has the defendant filed a motion for summary judgment?',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
        { value: 'not_sure', label: 'I\'m not sure' },
      ],
    },
    {
      id: 'msj_info',
      type: 'info',
      prompt:
        'A motion for summary judgment is serious — the defendant is asking the court to rule in their favor without a trial. You must respond with evidence (affidavits, depositions, documents) showing there are genuine disputes about the facts. Missing the response deadline could mean losing your case.',
      showIf: (answers) => answers.msj_filed === 'yes',
    },
    {
      id: 'msj_response_status',
      type: 'single_choice',
      prompt: 'Have you filed or do you need to file a response to the motion?',
      showIf: (answers) => answers.msj_filed === 'yes',
      options: [
        { value: 'filed', label: 'Already filed my response' },
        { value: 'working', label: 'Working on it' },
        { value: 'need_help', label: 'I need help understanding this' },
      ],
    },
    {
      id: 'msj_help_info',
      type: 'info',
      prompt:
        'Your response must include evidence that contradicts the defendant\'s claims. Attach affidavits (sworn statements), relevant deposition excerpts, medical records, and other documents. You typically have 21 days to respond in Texas. Consider consulting an attorney for this critical motion.',
      showIf: (answers) => answers.msj_response_status === 'need_help',
    },
    {
      id: 'motions_in_limine',
      type: 'single_choice',
      prompt: 'Are you considering filing motions in limine (to exclude certain evidence)?',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
        { value: 'not_familiar', label: 'I\'m not familiar with these' },
      ],
    },
    {
      id: 'limine_info',
      type: 'info',
      prompt:
        'Motions in limine ask the judge to exclude certain evidence before trial. In PI cases, you might request excluding: evidence of prior unrelated injuries, mention of insurance coverage (to prevent jury bias), speculative testimony, or evidence obtained improperly.',
      showIf: (answers) => answers.motions_in_limine === 'not_familiar' || answers.motions_in_limine === 'yes',
    },
    {
      id: 'daubert_challenge',
      type: 'single_choice',
      prompt: 'Has the defendant challenged your expert witnesses (Daubert challenge)?',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
        { value: 'not_sure', label: 'I\'m not sure' },
      ],
    },
    {
      id: 'daubert_info',
      type: 'info',
      prompt:
        'A Daubert challenge tries to exclude your expert\'s testimony by arguing it\'s not scientifically reliable. If your medical expert is challenged, you\'ll need to show their opinions are based on accepted medical methodology. This is a serious motion — consider consulting an attorney.',
      showIf: (answers) => answers.daubert_challenge === 'yes',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.msj_filed === 'yes') {
      if (answers.msj_response_status === 'filed') {
        items.push({ status: 'done', text: 'Response to motion for summary judgment filed.' })
      } else {
        items.push({ status: 'needed', text: 'Respond to the motion for summary judgment with supporting evidence. This is critical.' })
      }
    } else {
      items.push({ status: 'info', text: 'No motion for summary judgment filed by defendant.' })
    }

    if (answers.motions_in_limine === 'yes') {
      items.push({ status: 'info', text: 'Consider filing motions in limine to exclude prejudicial evidence before trial.' })
    }

    if (answers.daubert_challenge === 'yes') {
      items.push({ status: 'needed', text: 'Defend your expert witness against the Daubert challenge. Ensure expert\'s methodology is documented.' })
    }

    return items
  },
}
```

**Step 2: Verify it compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

**Step 3: Commit**

```bash
git add src/lib/guided-steps/personal-injury/pi-pretrial-motions.ts
git commit -m "feat: add pi_pretrial_motions guided step config"
```

---

### Task 8: Guided Step Config — pi_mediation

**Files:**
- Create: `src/lib/guided-steps/personal-injury/pi-mediation.ts`

**Step 1: Write the config file**

```typescript
import type { GuidedStepConfig } from '../types'

export const piMediationConfig: GuidedStepConfig = {
  title: 'Mediation & Settlement Conference',
  reassurance:
    'Most PI cases settle before trial. Mediation is a structured negotiation with a neutral mediator to help both sides reach an agreement.',

  questions: [
    {
      id: 'mediation_status',
      type: 'single_choice',
      prompt: 'Is mediation ordered by the court or voluntary?',
      options: [
        { value: 'ordered', label: 'Court-ordered' },
        { value: 'voluntary', label: 'Voluntary' },
        { value: 'no_mediation', label: 'No mediation planned' },
      ],
    },
    {
      id: 'no_mediation_info',
      type: 'info',
      prompt:
        'Even without formal mediation, you can still negotiate a settlement directly with the defendant\'s attorney or insurance company at any time. Many cases settle through informal negotiations.',
      showIf: (answers) => answers.mediation_status === 'no_mediation',
    },
    {
      id: 'settlement_demand_prepared',
      type: 'single_choice',
      prompt: 'Have you prepared your settlement demand for mediation?',
      showIf: (answers) => answers.mediation_status !== 'no_mediation',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
        { value: 'working_on_it', label: 'Working on it' },
      ],
    },
    {
      id: 'demand_prep_info',
      type: 'info',
      prompt:
        'Your settlement demand should include: total medical expenses (past and future), lost wages and earning capacity, pain and suffering, property damage, and any other damages. Organize these into a clear demand package with supporting documentation.',
      showIf: (answers) => answers.settlement_demand_prepared === 'no' || answers.settlement_demand_prepared === 'working_on_it',
    },
    {
      id: 'minimum_settlement',
      type: 'single_choice',
      prompt: 'Have you thought about your minimum acceptable settlement amount?',
      showIf: (answers) => answers.mediation_status !== 'no_mediation',
      options: [
        { value: 'yes', label: 'Yes, I have a number in mind' },
        { value: 'no', label: 'No, I need to think about this' },
      ],
    },
    {
      id: 'minimum_info',
      type: 'info',
      prompt:
        'Before mediation, know your bottom line. Consider: your total out-of-pocket expenses, future medical costs, the strength of your evidence, the risk of losing at trial, and how long trial would take. The mediator is neutral and will try to find middle ground.',
      showIf: (answers) => answers.minimum_settlement === 'no',
    },
    {
      id: 'mediation_tips',
      type: 'info',
      prompt:
        'Mediation tips: Be prepared to compromise — your first offer won\'t be accepted. The mediator will go back and forth between rooms. Stay patient, stay calm, and don\'t take it personally. Most mediations last a full day. Bring all relevant documents.',
      showIf: (answers) => answers.mediation_status !== 'no_mediation',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.mediation_status === 'ordered') {
      items.push({ status: 'info', text: 'Court-ordered mediation. Attendance is required.' })
    } else if (answers.mediation_status === 'voluntary') {
      items.push({ status: 'info', text: 'Voluntary mediation planned.' })
    } else {
      items.push({ status: 'info', text: 'No formal mediation. You can still negotiate a settlement at any time.' })
    }

    if (answers.settlement_demand_prepared === 'yes') {
      items.push({ status: 'done', text: 'Settlement demand prepared for mediation.' })
    } else if (answers.mediation_status !== 'no_mediation') {
      items.push({ status: 'needed', text: 'Prepare your settlement demand: medical expenses, lost wages, pain and suffering.' })
    }

    if (answers.minimum_settlement === 'yes') {
      items.push({ status: 'done', text: 'Minimum acceptable settlement amount determined.' })
    } else if (answers.mediation_status !== 'no_mediation') {
      items.push({ status: 'needed', text: 'Determine your minimum acceptable settlement before mediation.' })
    }

    return items
  },
}
```

**Step 2: Verify it compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

**Step 3: Commit**

```bash
git add src/lib/guided-steps/personal-injury/pi-mediation.ts
git commit -m "feat: add pi_mediation guided step config"
```

---

### Task 9: Step Components — 7 Thin Wrappers

**Files:**
- Create: `src/components/step/personal-injury/pi-wait-for-answer-step.tsx`
- Create: `src/components/step/personal-injury/pi-review-answer-step.tsx`
- Create: `src/components/step/personal-injury/pi-discovery-prep-step.tsx`
- Create: `src/components/step/personal-injury/pi-discovery-responses-step.tsx`
- Create: `src/components/step/personal-injury/pi-scheduling-conference-step.tsx`
- Create: `src/components/step/personal-injury/pi-pretrial-motions-step.tsx`
- Create: `src/components/step/personal-injury/pi-mediation-step.tsx`

**Step 1: Create all 7 component files**

Each follows the same pattern (from `pi-serve-defendant-step.tsx`):

**pi-wait-for-answer-step.tsx:**
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
  return (
    <GuidedStep
      caseId={caseId}
      taskId={taskId}
      config={piWaitForAnswerConfig}
      existingAnswers={existingAnswers}
    />
  )
}
```

**pi-review-answer-step.tsx:**
```tsx
'use client'

import { GuidedStep } from '../guided-step'
import { piReviewAnswerConfig } from '@/lib/guided-steps/personal-injury/pi-review-answer'

interface Props {
  caseId: string
  taskId: string
  existingAnswers?: Record<string, string>
}

export function PIReviewAnswerStep({ caseId, taskId, existingAnswers }: Props) {
  return (
    <GuidedStep
      caseId={caseId}
      taskId={taskId}
      config={piReviewAnswerConfig}
      existingAnswers={existingAnswers}
    />
  )
}
```

**pi-discovery-prep-step.tsx:**
```tsx
'use client'

import { GuidedStep } from '../guided-step'
import { piDiscoveryPrepConfig } from '@/lib/guided-steps/personal-injury/pi-discovery-prep'

interface Props {
  caseId: string
  taskId: string
  existingAnswers?: Record<string, string>
}

export function PIDiscoveryPrepStep({ caseId, taskId, existingAnswers }: Props) {
  return (
    <GuidedStep
      caseId={caseId}
      taskId={taskId}
      config={piDiscoveryPrepConfig}
      existingAnswers={existingAnswers}
    />
  )
}
```

**pi-discovery-responses-step.tsx:**
```tsx
'use client'

import { GuidedStep } from '../guided-step'
import { piDiscoveryResponsesConfig } from '@/lib/guided-steps/personal-injury/pi-discovery-responses'

interface Props {
  caseId: string
  taskId: string
  existingAnswers?: Record<string, string>
}

export function PIDiscoveryResponsesStep({ caseId, taskId, existingAnswers }: Props) {
  return (
    <GuidedStep
      caseId={caseId}
      taskId={taskId}
      config={piDiscoveryResponsesConfig}
      existingAnswers={existingAnswers}
    />
  )
}
```

**pi-scheduling-conference-step.tsx:**
```tsx
'use client'

import { GuidedStep } from '../guided-step'
import { piSchedulingConferenceConfig } from '@/lib/guided-steps/personal-injury/pi-scheduling-conference'

interface Props {
  caseId: string
  taskId: string
  existingAnswers?: Record<string, string>
}

export function PISchedulingConferenceStep({ caseId, taskId, existingAnswers }: Props) {
  return (
    <GuidedStep
      caseId={caseId}
      taskId={taskId}
      config={piSchedulingConferenceConfig}
      existingAnswers={existingAnswers}
    />
  )
}
```

**pi-pretrial-motions-step.tsx:**
```tsx
'use client'

import { GuidedStep } from '../guided-step'
import { piPretrialMotionsConfig } from '@/lib/guided-steps/personal-injury/pi-pretrial-motions'

interface Props {
  caseId: string
  taskId: string
  existingAnswers?: Record<string, string>
}

export function PIPretrialMotionsStep({ caseId, taskId, existingAnswers }: Props) {
  return (
    <GuidedStep
      caseId={caseId}
      taskId={taskId}
      config={piPretrialMotionsConfig}
      existingAnswers={existingAnswers}
    />
  )
}
```

**pi-mediation-step.tsx:**
```tsx
'use client'

import { GuidedStep } from '../guided-step'
import { piMediationConfig } from '@/lib/guided-steps/personal-injury/pi-mediation'

interface Props {
  caseId: string
  taskId: string
  existingAnswers?: Record<string, string>
}

export function PIMediationStep({ caseId, taskId, existingAnswers }: Props) {
  return (
    <GuidedStep
      caseId={caseId}
      taskId={taskId}
      config={piMediationConfig}
      existingAnswers={existingAnswers}
    />
  )
}
```

**Step 2: Verify all compile**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/step/personal-injury/pi-wait-for-answer-step.tsx \
        src/components/step/personal-injury/pi-review-answer-step.tsx \
        src/components/step/personal-injury/pi-discovery-prep-step.tsx \
        src/components/step/personal-injury/pi-discovery-responses-step.tsx \
        src/components/step/personal-injury/pi-scheduling-conference-step.tsx \
        src/components/step/personal-injury/pi-pretrial-motions-step.tsx \
        src/components/step/personal-injury/pi-mediation-step.tsx
git commit -m "feat: add 7 PI mid-litigation step components"
```

---

### Task 10: Update Step Page Routing

**Files:**
- Modify: `src/app/(authenticated)/case/[id]/step/[taskId]/page.tsx`

**Step 1: Add 7 imports**

After the existing PI imports (line ~63 in the file, after `PIPostResolutionStep`), add:

```typescript
import { PIWaitForAnswerStep } from '@/components/step/personal-injury/pi-wait-for-answer-step'
import { PIReviewAnswerStep } from '@/components/step/personal-injury/pi-review-answer-step'
import { PIDiscoveryPrepStep } from '@/components/step/personal-injury/pi-discovery-prep-step'
import { PIDiscoveryResponsesStep } from '@/components/step/personal-injury/pi-discovery-responses-step'
import { PISchedulingConferenceStep } from '@/components/step/personal-injury/pi-scheduling-conference-step'
import { PIPretrialMotionsStep } from '@/components/step/personal-injury/pi-pretrial-motions-step'
import { PIMediationStep } from '@/components/step/personal-injury/pi-mediation-step'
```

**Step 2: Add 7 case statements**

In the switch statement, between `case 'pi_serve_defendant'` (line ~757) and `case 'pi_trial_prep'` (line ~758), add:

```typescript
    case 'pi_wait_for_answer':
      return <PIWaitForAnswerStep caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'pi_review_answer':
      return <PIReviewAnswerStep caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'pi_discovery_prep':
      return <PIDiscoveryPrepStep caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'pi_discovery_responses':
      return <PIDiscoveryResponsesStep caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'pi_scheduling_conference':
      return <PISchedulingConferenceStep caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'pi_pretrial_motions':
      return <PIPretrialMotionsStep caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'pi_mediation':
      return <PIMediationStep caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
```

**Step 3: Verify it compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

**Step 4: Commit**

```bash
git add src/app/\(authenticated\)/case/\[id\]/step/\[taskId\]/page.tsx
git commit -m "feat: add 7 PI mid-litigation step routes"
```

---

### Task 11: Update PI Milestones

**Files:**
- Modify: `src/lib/rules/milestones.ts` (lines 221-238)

**Step 1: Replace the `litigation` milestone**

Replace the single `litigation` milestone with 3 milestones that cover the new steps:

Find (lines 221-238):
```typescript
  {
    id: 'litigation',
    label: 'In litigation',
    description: 'My case is filed and I\'m in active litigation.',
    firstUnlockedTask: 'pi_trial_prep',
    tasksToSkip: [
      'welcome',
      'pi_intake',
      'pi_medical_records',
      'evidence_vault',
      'pi_insurance_communication',
      'prepare_pi_demand_letter',
      'pi_settlement_negotiation',
      'prepare_pi_petition',
      'pi_file_with_court',
      'pi_serve_defendant',
    ],
  },
```

Replace with:
```typescript
  {
    id: 'waiting_for_answer',
    label: 'Waiting for the answer',
    description: 'I\'ve served the defendant and I\'m waiting for their response.',
    firstUnlockedTask: 'pi_wait_for_answer',
    tasksToSkip: [
      'welcome',
      'pi_intake',
      'pi_medical_records',
      'evidence_vault',
      'pi_insurance_communication',
      'prepare_pi_demand_letter',
      'pi_settlement_negotiation',
      'prepare_pi_petition',
      'pi_file_with_court',
      'pi_serve_defendant',
    ],
  },
  {
    id: 'discovery',
    label: 'In discovery',
    description: 'We\'re exchanging evidence and taking depositions.',
    firstUnlockedTask: 'pi_discovery_prep',
    tasksToSkip: [
      'welcome',
      'pi_intake',
      'pi_medical_records',
      'evidence_vault',
      'pi_insurance_communication',
      'prepare_pi_demand_letter',
      'pi_settlement_negotiation',
      'prepare_pi_petition',
      'pi_file_with_court',
      'pi_serve_defendant',
      'pi_wait_for_answer',
      'pi_review_answer',
    ],
  },
  {
    id: 'trial_prep',
    label: 'Preparing for trial',
    description: 'Discovery is done and I\'m getting ready for trial.',
    firstUnlockedTask: 'pi_trial_prep',
    tasksToSkip: [
      'welcome',
      'pi_intake',
      'pi_medical_records',
      'evidence_vault',
      'pi_insurance_communication',
      'prepare_pi_demand_letter',
      'pi_settlement_negotiation',
      'prepare_pi_petition',
      'pi_file_with_court',
      'pi_serve_defendant',
      'pi_wait_for_answer',
      'pi_review_answer',
      'pi_discovery_prep',
      'pi_discovery_responses',
      'pi_scheduling_conference',
      'pi_pretrial_motions',
      'pi_mediation',
    ],
  },
```

**Step 2: Verify it compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

**Step 3: Commit**

```bash
git add src/lib/rules/milestones.ts
git commit -m "feat: expand PI milestones for mid-litigation phases"
```

---

### Task 12: Build Verification & Push Migration

**Step 1: Full build check**

Run: `npm run build 2>&1 | tail -30`
Expected: Build succeeds

**Step 2: Push migration to Supabase**

Run: `npx supabase db push`
Expected: Migration applied

**Step 3: Restart dev server and test**

Run: `npm run dev`
Navigate to an existing PI case to verify the new steps appear in the task chain.

**Step 4: Final commit (if any adjustments needed)**

```bash
git add -A
git commit -m "chore: finalize PI litigation flow expansion"
```
