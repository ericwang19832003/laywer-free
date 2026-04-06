# Intake Case Stage Auto-Skip Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a "Where are you in your case?" question to each intake step so users who are already mid-litigation can auto-skip irrelevant earlier tasks (like demand letters).

**Architecture:** Each intake step component gets a new radio group that stores the user's case stage in `metadata.guided_answers.case_stage`. On intake completion, the `unlock_next_task` PL/pgSQL trigger reads this value and conditionally bulk-skips tasks + unlocks the correct next task — identical to the existing settlement decision branching pattern.

**Tech Stack:** Next.js 16, React 19, Supabase PostgreSQL (PL/pgSQL triggers), TypeScript

---

## Task 1: Add Case Stage Radio to Small Claims Intake

**Files:**
- Modify: `src/components/step/small-claims/small-claims-intake-step.tsx`

**Step 1: Add state for case_stage**

Add after the `defendantIsBusiness` state (line 27):

```tsx
const [caseStage, setCaseStage] = useState(
  (existingMetadata?.guided_answers as Record<string, string>)?.case_stage || 'start'
)
```

**Step 2: Include case_stage in buildMetadata**

Replace the `buildMetadata` function (line 41-48) with:

```tsx
function buildMetadata() {
  return {
    county: county.trim() || null,
    claim_amount: parsedAmount || null,
    description: description.trim() || null,
    defendant_is_business: defendantIsBusiness,
    guided_answers: { case_stage: caseStage },
  }
}
```

**Step 3: Add the radio group UI**

Add this new section BEFORE the county field (before line 119 `{/* County */}`), inside the `<div className="space-y-5">`:

```tsx
{/* Where are you in your case? */}
<div className="space-y-2">
  <label className="text-sm font-medium text-warm-text">
    Where are you in this case?
  </label>
  <p className="text-xs text-warm-muted">
    This helps us skip steps you&apos;ve already completed.
  </p>
  <div className="space-y-2">
    {[
      { value: 'start', label: 'Just getting started', desc: 'I haven\'t taken any action yet.' },
      { value: 'demand_sent', label: 'Already sent a demand letter', desc: 'I\'ve sent a demand letter and need to file.' },
      { value: 'filed', label: 'Already filed with the court', desc: 'I\'ve filed my small claims case.' },
      { value: 'served', label: 'Already served the defendant', desc: 'I\'ve served the defendant and am waiting for a hearing.' },
      { value: 'hearing', label: 'Hearing is scheduled', desc: 'My hearing date is coming up.' },
    ].map((option) => (
      <label
        key={option.value}
        className={`flex items-start gap-3 cursor-pointer rounded-lg border p-3 transition-colors ${
          caseStage === option.value
            ? 'border-calm-indigo bg-calm-indigo/5'
            : 'border-warm-border hover:bg-warm-bg/50'
        }`}
      >
        <input
          type="radio"
          name="sc-case-stage"
          value={option.value}
          checked={caseStage === option.value}
          onChange={() => setCaseStage(option.value)}
          className="mt-0.5 h-4 w-4 shrink-0 border-warm-border text-calm-indigo focus:ring-calm-indigo"
        />
        <div>
          <span className="text-sm font-medium text-warm-text">{option.label}</span>
          <p className="text-xs text-warm-muted mt-0.5">{option.desc}</p>
        </div>
      </label>
    ))}
  </div>
</div>
```

**Step 4: Add case_stage to reviewContent**

Add a new `<div>` block at the TOP of the `<dl>` in `reviewContent` (after line 77):

```tsx
<div>
  <dt className="text-sm font-medium text-warm-muted">Case stage</dt>
  <dd className="text-warm-text mt-0.5">
    {caseStage === 'start' && 'Just getting started'}
    {caseStage === 'demand_sent' && 'Already sent a demand letter'}
    {caseStage === 'filed' && 'Already filed with the court'}
    {caseStage === 'served' && 'Already served the defendant'}
    {caseStage === 'hearing' && 'Hearing is scheduled'}
  </dd>
</div>
```

**Step 5: Build and verify**

Run: `cd "/Users/minwang/lawyer free" && npx next build 2>&1 | tail -20`
Expected: Build succeeds with no errors.

**Step 6: Commit**

```bash
cd "/Users/minwang/lawyer free"
git add src/components/step/small-claims/small-claims-intake-step.tsx
git commit -m "feat(small-claims): add 'where are you?' case stage question to intake"
```

---

## Task 2: Add Case Stage Radio to Personal Injury Intake

**Files:**
- Modify: `src/components/step/personal-injury/pi-intake-step.tsx`

**Step 1: Add state for case_stage**

Add after the `policeReportNumber` state (line 41):

```tsx
const [caseStage, setCaseStage] = useState(
  (meta.guided_answers as Record<string, string>)?.case_stage || 'start'
)
```

**Step 2: Include case_stage in buildMetadata**

In the `buildMetadata` function (line 93-113), add `guided_answers` to the returned object:

```tsx
function buildMetadata() {
  return {
    incident_date: incidentDate || null,
    incident_location: incidentLocation.trim() || null,
    incident_description: incidentDescription.trim() || null,
    police_report_filed: policeReportFiled,
    police_report_number: policeReportNumber.trim() || null,
    ...(isPropertyDamage
      ? {
          damage_description: damageDescription.trim() || null,
          estimated_damage_amount: estimatedDamageAmount.trim() || null,
        }
      : {
          injury_description: injuryDescription.trim() || null,
          injury_severity: injurySeverity || null,
        }),
    incident_files: incidentFiles,
    detail_files: detailFiles,
    police_report_files: policeReportFiles,
    guided_answers: { case_stage: caseStage },
  }
}
```

**Step 3: Add the radio group UI**

Add this section at the TOP of the `<div className="space-y-5">` (before the incident date field at line 289):

```tsx
{/* Where are you in your case? */}
<div className="space-y-2">
  <label className="text-sm font-medium text-warm-text">
    Where are you in this case?
  </label>
  <p className="text-xs text-warm-muted">
    This helps us skip steps you&apos;ve already completed.
  </p>
  <div className="space-y-2">
    {[
      { value: 'start', label: 'Just getting started', desc: 'I haven\'t taken any action yet.' },
      { value: 'medical', label: 'Collecting medical records / estimates', desc: 'I\'m gathering documentation of my damages.' },
      { value: 'insurance', label: 'Dealing with insurance', desc: 'I\'m communicating with the insurance company.' },
      { value: 'demand', label: 'Ready to send a demand letter', desc: 'I\'m ready to make a formal demand.' },
      { value: 'negotiation', label: 'Negotiating settlement', desc: 'I\'m in settlement negotiations.' },
      { value: 'filing', label: 'Filing a lawsuit', desc: 'Negotiations failed and I\'m filing suit.' },
    ].map((option) => (
      <label
        key={option.value}
        className={`flex items-start gap-3 cursor-pointer rounded-lg border p-3 transition-colors ${
          caseStage === option.value
            ? 'border-calm-indigo bg-calm-indigo/5'
            : 'border-warm-border hover:bg-warm-bg/50'
        }`}
      >
        <input
          type="radio"
          name="pi-case-stage"
          value={option.value}
          checked={caseStage === option.value}
          onChange={() => setCaseStage(option.value)}
          className="mt-0.5 h-4 w-4 shrink-0 border-warm-border text-calm-indigo focus:ring-calm-indigo"
        />
        <div>
          <span className="text-sm font-medium text-warm-text">{option.label}</span>
          <p className="text-xs text-warm-muted mt-0.5">{option.desc}</p>
        </div>
      </label>
    ))}
  </div>
</div>
```

**Step 4: Add case_stage to reviewContent**

Add a new `<div>` block at the TOP of the `<dl>` in `reviewContent` (after line 177):

```tsx
<div>
  <dt className="text-sm font-medium text-warm-muted">Case stage</dt>
  <dd className="text-warm-text mt-0.5">
    {caseStage === 'start' && 'Just getting started'}
    {caseStage === 'medical' && 'Collecting medical records / estimates'}
    {caseStage === 'insurance' && 'Dealing with insurance'}
    {caseStage === 'demand' && 'Ready to send a demand letter'}
    {caseStage === 'negotiation' && 'Negotiating settlement'}
    {caseStage === 'filing' && 'Filing a lawsuit'}
  </dd>
</div>
```

**Step 5: Build and verify**

Run: `cd "/Users/minwang/lawyer free" && npx next build 2>&1 | tail -20`
Expected: Build succeeds with no errors.

**Step 6: Commit**

```bash
cd "/Users/minwang/lawyer free"
git add src/components/step/personal-injury/pi-intake-step.tsx
git commit -m "feat(personal-injury): add 'where are you?' case stage question to intake"
```

---

## Task 3: SQL Migration — Intake Case Stage Branching

**Files:**
- Create: `supabase/migrations/20260310000002_intake_case_stage_branching.sql`

This replaces the `unlock_next_task` function. The ONLY change is adding conditional branching inside the `small_claims_intake` and `pi_intake` completion handlers. All other transitions remain identical.

**Step 1: Write the migration**

Create `supabase/migrations/20260310000002_intake_case_stage_branching.sql`:

```sql
-- ============================================
-- Intake Case Stage Branching
-- ============================================
--
-- When a user completes an intake step and has selected a case stage
-- other than 'start', bulk-skip the tasks they've already completed
-- and unlock the correct next task.
--
-- Mirrors the milestone definitions in src/lib/rules/milestones.ts.
-- Uses the same pattern as the settlement decision branching.
--
-- Affected intake tasks:
--   - small_claims_intake (5 stages)
--   - pi_intake (6 stages)
--
-- All other transitions remain unchanged.
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
  v_case_stage          TEXT;
BEGIN
  -- ========================================
  -- Personal injury chain (18 transitions)
  -- ========================================

  -- PI: welcome -> pi_intake
  IF NEW.task_key = 'welcome' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'pi_intake' AND status = 'locked';
  END IF;

  -- PI: pi_intake -> CONDITIONAL BRANCHING based on case_stage
  IF NEW.task_key = 'pi_intake' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    v_case_stage := COALESCE(NEW.metadata->'guided_answers'->>'case_stage', 'start');

    IF v_case_stage = 'start' THEN
      -- Normal flow: unlock pi_medical_records
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'pi_medical_records' AND status = 'locked';

    ELSIF v_case_stage = 'medical' THEN
      -- Skip: welcome, pi_intake (already done)
      -- Unlock: pi_medical_records
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'pi_medical_records' AND status = 'locked';

    ELSIF v_case_stage = 'insurance' THEN
      -- Skip: pi_medical_records, evidence_vault
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('pi_medical_records', 'evidence_vault')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'pi_insurance_communication' AND status = 'locked';

    ELSIF v_case_stage = 'demand' THEN
      -- Skip: pi_medical_records, evidence_vault, pi_insurance_communication
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('pi_medical_records', 'evidence_vault', 'pi_insurance_communication')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'prepare_pi_demand_letter' AND status = 'locked';

    ELSIF v_case_stage = 'negotiation' THEN
      -- Skip: pi_medical_records, evidence_vault, pi_insurance_communication, prepare_pi_demand_letter
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('pi_medical_records', 'evidence_vault', 'pi_insurance_communication', 'prepare_pi_demand_letter')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'pi_settlement_negotiation' AND status = 'locked';

    ELSIF v_case_stage = 'filing' THEN
      -- Skip: pi_medical_records, evidence_vault, pi_insurance_communication, prepare_pi_demand_letter, pi_settlement_negotiation
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('pi_medical_records', 'evidence_vault', 'pi_insurance_communication', 'prepare_pi_demand_letter', 'pi_settlement_negotiation')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'prepare_pi_petition' AND status = 'locked';

    ELSE
      -- Unknown stage: default to normal flow
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'pi_medical_records' AND status = 'locked';
    END IF;
  END IF;

  -- PI: pi_medical_records -> evidence_vault
  IF NEW.task_key = 'pi_medical_records' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'evidence_vault' AND status = 'locked';
  END IF;

  -- PI: evidence_vault -> pi_insurance_communication
  IF NEW.task_key = 'evidence_vault' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'pi_insurance_communication' AND status = 'locked';
  END IF;

  -- PI: pi_insurance_communication -> prepare_pi_demand_letter
  IF NEW.task_key = 'pi_insurance_communication' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'prepare_pi_demand_letter' AND status = 'locked';
  END IF;

  -- PI: prepare_pi_demand_letter -> pi_settlement_negotiation
  IF NEW.task_key = 'prepare_pi_demand_letter' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'pi_settlement_negotiation' AND status = 'locked';
  END IF;

  -- PI: pi_settlement_negotiation -> CONDITIONAL BRANCHING (3 paths)
  IF NEW.task_key = 'pi_settlement_negotiation' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    v_settlement_reached := COALESCE(NEW.metadata->'guided_answers'->>'settlement_reached', '');
    v_want_to_file_suit  := COALESCE(NEW.metadata->'guided_answers'->>'want_to_file_suit', '');

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
    ELSE
      -- Settled OR not filing suit: skip litigation tasks, unlock post-resolution
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN (
          'prepare_pi_petition', 'pi_file_with_court', 'pi_serve_defendant',
          'pi_wait_for_answer', 'pi_review_answer', 'pi_discovery_prep',
          'pi_discovery_responses', 'pi_scheduling_conference',
          'pi_pretrial_motions', 'pi_mediation', 'pi_trial_prep'
        )
        AND status = 'locked';

      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'pi_post_resolution' AND status = 'locked';
    END IF;
  END IF;

  -- PI: prepare_pi_petition -> pi_file_with_court
  IF NEW.task_key = 'prepare_pi_petition' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'pi_file_with_court' AND status = 'locked';
  END IF;

  -- PI: pi_file_with_court -> pi_serve_defendant
  IF NEW.task_key = 'pi_file_with_court' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'pi_serve_defendant' AND status = 'locked';
  END IF;

  -- PI: pi_serve_defendant -> pi_wait_for_answer
  IF NEW.task_key = 'pi_serve_defendant' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'pi_wait_for_answer' AND status = 'locked';
  END IF;

  -- PI: pi_wait_for_answer -> pi_review_answer (ONLY if case NOT removed to federal)
  IF NEW.task_key = 'pi_wait_for_answer' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    IF COALESCE(NEW.metadata->'guided_answers'->>'case_removed', '') != 'yes' THEN
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'pi_review_answer' AND status = 'locked';
    END IF;
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

  -- PI: pi_trial_prep -> pi_post_resolution
  IF NEW.task_key = 'pi_trial_prep' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'pi_post_resolution' AND status = 'locked';
  END IF;

  -- ========================================
  -- Debt defense chain (9 transitions)
  -- ========================================

  -- Debt: welcome -> debt_defense_intake
  IF NEW.task_key = 'welcome' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'debt_defense_intake' AND status = 'locked';
  END IF;

  -- Debt: debt_defense_intake -> evidence_vault
  IF NEW.task_key = 'debt_defense_intake' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'evidence_vault' AND status = 'locked';
  END IF;

  -- Debt: evidence_vault -> prepare_debt_validation_letter
  IF NEW.task_key = 'evidence_vault' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'prepare_debt_validation_letter' AND status = 'locked';
  END IF;

  -- Debt: prepare_debt_validation_letter -> prepare_debt_defense_answer
  IF NEW.task_key = 'prepare_debt_validation_letter' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'prepare_debt_defense_answer' AND status = 'locked';
  END IF;

  -- Debt: prepare_debt_defense_answer -> debt_file_with_court
  IF NEW.task_key = 'prepare_debt_defense_answer' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'debt_file_with_court' AND status = 'locked';
  END IF;

  -- Debt: debt_file_with_court -> serve_plaintiff
  IF NEW.task_key = 'debt_file_with_court' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'serve_plaintiff' AND status = 'locked';
  END IF;

  -- Debt: serve_plaintiff -> debt_hearing_prep
  IF NEW.task_key = 'serve_plaintiff' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'debt_hearing_prep' AND status = 'locked';
  END IF;

  -- Debt: debt_hearing_prep -> debt_hearing_day
  IF NEW.task_key = 'debt_hearing_prep' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'debt_hearing_day' AND status = 'locked';
  END IF;

  -- Debt: debt_hearing_day -> debt_post_judgment
  IF NEW.task_key = 'debt_hearing_day' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'debt_post_judgment' AND status = 'locked';
  END IF;

  -- ========================================
  -- Landlord-tenant chain (9 transitions)
  -- ========================================

  IF NEW.task_key = 'welcome' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'landlord_tenant_intake' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'landlord_tenant_intake' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'evidence_vault' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'evidence_vault' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'prepare_lt_demand_letter' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'prepare_lt_demand_letter' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'prepare_landlord_tenant_filing' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'prepare_landlord_tenant_filing' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'file_with_court' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'file_with_court' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'serve_other_party' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'serve_other_party' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'prepare_for_hearing' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'prepare_for_hearing' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'hearing_day' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'hearing_day' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'post_judgment' AND status = 'locked';
  END IF;

  -- ========================================
  -- Small claims chain (with case stage branching)
  -- ========================================

  IF NEW.task_key = 'welcome' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'small_claims_intake' AND status = 'locked';
  END IF;

  -- Small Claims: small_claims_intake -> CONDITIONAL BRANCHING based on case_stage
  IF NEW.task_key = 'small_claims_intake' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    v_case_stage := COALESCE(NEW.metadata->'guided_answers'->>'case_stage', 'start');

    IF v_case_stage = 'start' THEN
      -- Normal flow: unlock evidence_vault
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'evidence_vault' AND status = 'locked';

    ELSIF v_case_stage = 'demand_sent' THEN
      -- Skip: evidence_vault, prepare_demand_letter
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('evidence_vault', 'prepare_demand_letter')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'prepare_small_claims_filing' AND status = 'locked';

    ELSIF v_case_stage = 'filed' THEN
      -- Skip: evidence_vault, prepare_demand_letter, prepare_small_claims_filing
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('evidence_vault', 'prepare_demand_letter', 'prepare_small_claims_filing')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'file_with_court' AND status = 'locked';

    ELSIF v_case_stage = 'served' THEN
      -- Skip: evidence_vault, prepare_demand_letter, prepare_small_claims_filing, file_with_court, serve_defendant
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('evidence_vault', 'prepare_demand_letter', 'prepare_small_claims_filing', 'file_with_court', 'serve_defendant')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'prepare_for_hearing' AND status = 'locked';

    ELSIF v_case_stage = 'hearing' THEN
      -- Skip: everything through prepare_for_hearing
      UPDATE public.tasks SET status = 'skipped'
      WHERE case_id = NEW.case_id
        AND task_key IN ('evidence_vault', 'prepare_demand_letter', 'prepare_small_claims_filing', 'file_with_court', 'serve_defendant', 'prepare_for_hearing')
        AND status = 'locked';
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'hearing_day' AND status = 'locked';

    ELSE
      -- Unknown stage: default to normal flow
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'evidence_vault' AND status = 'locked';
    END IF;
  END IF;

  -- Small Claims: remaining linear transitions (unchanged)
  IF NEW.task_key = 'evidence_vault' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'prepare_demand_letter' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'prepare_demand_letter' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'prepare_small_claims_filing' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'prepare_small_claims_filing' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'file_with_court' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'file_with_court' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'serve_defendant' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'serve_defendant' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'prepare_for_hearing' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'prepare_for_hearing' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'hearing_day' AND status = 'locked';
  END IF;

  -- ========================================
  -- Family chain
  -- ========================================

  IF NEW.task_key = 'welcome' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'family_intake' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'family_intake' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'safety_screening' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'safety_screening' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'evidence_vault' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'evidence_vault' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'prepare_family_filing' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'prepare_family_filing' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'file_with_court' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'confirm_service_facts' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'waiting_period' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'waiting_period' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'temporary_orders' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'temporary_orders' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'mediation' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'mediation' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'final_orders' AND status = 'locked';
  END IF;

  -- ========================================
  -- Civil chain (unchanged)
  -- ========================================

  IF NEW.task_key = 'welcome' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks
    SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'intake' AND status = 'locked';

    INSERT INTO public.task_events (case_id, task_id, kind, payload)
    VALUES (NEW.case_id, (
      SELECT id FROM public.tasks WHERE case_id = NEW.case_id AND task_key = 'intake'
    ), 'task_unlocked', jsonb_build_object('task_key', 'intake'));
  END IF;

  IF NEW.task_key = 'intake' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks
    SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'evidence_vault' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'evidence_vault' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks
    SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'preservation_letter' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'preservation_letter' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks
    SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'prepare_filing' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'prepare_filing' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks
    SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'file_with_court' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'file_with_court' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks
    SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'upload_return_of_service' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'upload_return_of_service' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks
    SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'confirm_service_facts' AND status = 'locked';
  END IF;

  RETURN NEW;
END;
$$;
```

**Step 2: Push the migration**

Run: `cd "/Users/minwang/lawyer free" && npx supabase db push 2>&1 | tail -10`
Expected: Migration applied successfully.

**Step 3: Verify the trigger function exists**

Run: `cd "/Users/minwang/lawyer free" && npx supabase db diff --use-migra 2>&1 | head -5`
Expected: No diff (migration applied cleanly).

**Step 4: Commit**

```bash
cd "/Users/minwang/lawyer free"
git add supabase/migrations/20260310000002_intake_case_stage_branching.sql
git commit -m "feat: add intake case-stage branching to unlock_next_task trigger"
```

---

## Task 4: Manual Backend Verification

Test the branching logic with real SQL queries against the Supabase database.

**Step 1: Test small claims "demand_sent" stage**

Create a test case and simulate the flow:

```bash
cd "/Users/minwang/lawyer free"
npx supabase db reset --linked 2>&1 | tail -5
```

Or test directly via SQL in the Supabase SQL editor:

```sql
-- Create a small claims case with tasks
-- (Use an existing test case or create via the app)

-- Simulate: complete small_claims_intake with case_stage = 'demand_sent'
UPDATE public.tasks
SET status = 'completed',
    metadata = jsonb_build_object('guided_answers', jsonb_build_object('case_stage', 'demand_sent'))
WHERE case_id = '<test_case_id>' AND task_key = 'small_claims_intake';

-- Verify: evidence_vault and prepare_demand_letter should be 'skipped'
-- prepare_small_claims_filing should be 'todo'
SELECT task_key, status FROM public.tasks
WHERE case_id = '<test_case_id>'
ORDER BY unlocked_at NULLS LAST;
```

Expected:
- `evidence_vault` → `skipped`
- `prepare_demand_letter` → `skipped`
- `prepare_small_claims_filing` → `todo`

**Step 2: Test PI "filing" stage**

```sql
UPDATE public.tasks
SET status = 'completed',
    metadata = jsonb_build_object('guided_answers', jsonb_build_object('case_stage', 'filing'))
WHERE case_id = '<test_pi_case_id>' AND task_key = 'pi_intake';

SELECT task_key, status FROM public.tasks
WHERE case_id = '<test_pi_case_id>'
ORDER BY unlocked_at NULLS LAST;
```

Expected:
- `pi_medical_records`, `evidence_vault`, `pi_insurance_communication`, `prepare_pi_demand_letter`, `pi_settlement_negotiation` → `skipped`
- `prepare_pi_petition` → `todo`

**Step 3: Test default "start" stage (no regression)**

```sql
UPDATE public.tasks
SET status = 'completed',
    metadata = jsonb_build_object('guided_answers', jsonb_build_object('case_stage', 'start'))
WHERE case_id = '<test_case_id_2>' AND task_key = 'small_claims_intake';

SELECT task_key, status FROM public.tasks WHERE case_id = '<test_case_id_2>';
```

Expected: `evidence_vault` → `todo` (normal flow, no skips)

---

## Task 5: Build, Verify, Final Commit

**Step 1: Full build**

Run: `cd "/Users/minwang/lawyer free" && npx next build 2>&1 | tail -20`
Expected: Build succeeds.

**Step 2: Manual smoke test**

1. Start dev server: `cd "/Users/minwang/lawyer free" && npx next dev`
2. Create a new small claims case
3. Complete the Welcome step
4. On the intake step, select "Already sent a demand letter"
5. Fill in required fields and confirm
6. Verify: next step shown is "Prepare Small Claims Filing" (not evidence vault or demand letter)
7. Check dashboard timeline: evidence_vault and prepare_demand_letter show as "Skipped"

**Step 3: Verify no regressions**

1. Create another small claims case
2. Select "Just getting started" (default)
3. Confirm intake
4. Verify: next step is "Evidence Vault" (normal flow preserved)

---

## Summary of Changes

| File | Action | Purpose |
|------|--------|---------|
| `src/components/step/small-claims/small-claims-intake-step.tsx` | Modify | Add case stage radio group + store in metadata |
| `src/components/step/personal-injury/pi-intake-step.tsx` | Modify | Add case stage radio group + store in metadata |
| `supabase/migrations/20260310000002_intake_case_stage_branching.sql` | Create | Conditional branching in `unlock_next_task` trigger |

**Stage → Task skip mapping (Small Claims):**
| Stage | Tasks Skipped | Next Unlocked |
|-------|--------------|---------------|
| `start` | (none) | evidence_vault |
| `demand_sent` | evidence_vault, prepare_demand_letter | prepare_small_claims_filing |
| `filed` | + prepare_small_claims_filing | file_with_court |
| `served` | + file_with_court, serve_defendant | prepare_for_hearing |
| `hearing` | + prepare_for_hearing | hearing_day |

**Stage → Task skip mapping (Personal Injury):**
| Stage | Tasks Skipped | Next Unlocked |
|-------|--------------|---------------|
| `start` | (none) | pi_medical_records |
| `medical` | (none) | pi_medical_records |
| `insurance` | pi_medical_records, evidence_vault | pi_insurance_communication |
| `demand` | + pi_insurance_communication | prepare_pi_demand_letter |
| `negotiation` | + prepare_pi_demand_letter | pi_settlement_negotiation |
| `filing` | + pi_settlement_negotiation | prepare_pi_petition |
