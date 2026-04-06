# PI Federal Removal Support Design

## Problem

When a personal injury plaintiff files in state court and serves the defendant, the opposing lawyer can remove the case to federal court (28 U.S.C. § 1441). This happens during the "wait for answer" phase. The PI task chain currently has no way to detect or handle this — the user is left with no guidance on how to respond to removal, file a motion to remand, or adapt to federal court procedures.

The civil case chain already has a full 6-step removal flow (understand removal, choose strategy, prepare amended complaint, file it, prepare remand motion, file it) with gatekeeper branching. The PI chain needs to tap into this existing flow.

## Solution

Add a removal detection question to `pi_wait_for_answer`, and when the user reports their case was removed, dynamically inject the existing removal tasks into the PI case. The gatekeeper handles triggering, branching, and resuming the PI chain after the removal flow completes.

## How It Works

### 1. Detection (in pi_wait_for_answer)

Add a new question to the `pi_wait_for_answer` guided step:

- "Was your case removed to federal court?" (yes / no / not_sure)
  - yes → info: explains what removal means, 30-day remand deadline, next steps
  - not_sure → info: how to check (look for Notice of Removal, check docket)

### 2. Dynamic Task Injection

When `pi_wait_for_answer` is completed with `case_removed === 'yes'`, the gatekeeper triggers a new action: `inject_removal_tasks`.

**`injectRemovalTasks(caseId)` server function:**
1. Check if removal tasks already exist (idempotent)
2. INSERT 8 tasks as `locked`: `understand_removal`, `choose_removal_strategy`, `prepare_amended_complaint`, `file_amended_complaint`, `prepare_remand_motion`, `file_remand_motion`, `rule_26f_prep`, `mandatory_disclosures`
3. Unlock `understand_removal`
4. Update `cases.court_type` to `'federal'`

### 3. Gatekeeper Rules

**3 new PI-specific rules:**

| Rule | Trigger | Action |
|------|---------|--------|
| PI removal detected | `pi_wait_for_answer` completed + `case_removed === 'yes'` in answers | `inject_removal_tasks` + unlock `understand_removal` |
| PI remand complete | `file_remand_motion` completed (PI case) | unlock `pi_review_answer` (resume state court PI flow) |
| PI accepted federal | `mandatory_disclosures` completed (PI case) | unlock `pi_discovery_prep` (resume PI flow in federal court) |

**Existing civil rules (7-15) handle the internal removal flow** — they fire for any case that has the removal task_keys, regardless of dispute type.

### 4. Resume Points

After the removal flow completes, the PI chain resumes:

- **Remand granted** → unlock `pi_review_answer` (waiting for new answer in state court)
- **Accepted/staying in federal** → unlock `pi_discovery_prep` (skip state-court answer review, proceed with federal discovery)
- **Both (remand + prepare)** → after both paths finish, gatekeeper unlocks the appropriate next PI step

### 5. No Normal Flow Disruption

If `case_removed !== 'yes'`, the existing unlock trigger fires normally: `pi_wait_for_answer` → `pi_review_answer`. No change to the happy path.

## Files to Modify

| File | Change |
|------|--------|
| `src/lib/guided-steps/personal-injury/pi-wait-for-answer.ts` | Add `case_removed` question + conditional info blocks |
| `src/lib/rules/gatekeeper.ts` | Add 3 PI removal rules + new `inject_removal_tasks` action type |
| `src/app/api/cases/[id]/route.ts` | Add `injectRemovalTasks()` server function (or new file) |

## New Files

| File | Purpose |
|------|---------|
| `src/lib/rules/inject-removal-tasks.ts` | Idempotent server function: INSERT 8 removal tasks + unlock first + update court_type |

## No New UI Components

All 6 removal step components already exist and are routed in the step page. They work for any case that has those task_keys — no PI-specific UI needed.

## No New Guided Step Configs

The existing `understand-removal.ts` config works as-is for PI cases.

## Security

- `injectRemovalTasks` uses service role key (SECURITY DEFINER equivalent) to insert tasks
- RLS on tasks table ensures users only see their own case's tasks
- Idempotent — calling twice has no effect
