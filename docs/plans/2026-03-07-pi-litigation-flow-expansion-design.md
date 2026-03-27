# PI Litigation Flow Expansion Design

## Problem

The Personal Injury (plaintiff) task chain goes directly from "Serve the Defendant" to "Prepare for Trial", skipping the entire mid-litigation phase: waiting for the answer, reviewing it, discovery, scheduling, pre-trial motions, and mediation. Users completing the serve step jump straight to trial prep or post-resolution, missing critical guided steps.

## Solution

Insert 7 new TurboTax-style guided steps between `pi_serve_defendant` and `pi_trial_prep`, covering the full PI litigation lifecycle. Each step uses the existing `GuidedStep` component with a dedicated config.

## New PI Task Chain (19 steps total)

```
welcome
pi_intake
pi_medical_records
evidence_vault
pi_insurance_communication
prepare_pi_demand_letter
pi_settlement_negotiation
prepare_pi_petition
pi_file_with_court
pi_serve_defendant
   ↓ NEW STEPS ↓
pi_wait_for_answer          ← gatekeeper-managed, deadline-based
pi_review_answer            ← TurboTax Q&A
pi_discovery_prep           ← TurboTax Q&A
pi_discovery_responses      ← TurboTax Q&A
pi_scheduling_conference    ← TurboTax Q&A
pi_pretrial_motions         ← TurboTax Q&A
pi_mediation               ← TurboTax Q&A
   ↓
pi_trial_prep
pi_post_resolution
```

## TurboTax Q&A Content

### 1. pi_wait_for_answer — "Wait for Opposing Counsel's Answer"

**Questions:**
- When did you file your petition? (single_choice: date context)
- Has the defendant been served? (yes/no)
- What date was the defendant served? (helps calculate deadline)
- INFO: In Texas, the defendant has 20 days (Monday after 20 days) to file an answer.
- Have you received the answer yet? (yes/no/not_sure)
  - yes → complete, unlock next
  - no → gatekeeper tracks deadline

### 2. pi_review_answer — "Review the Opposing Answer"

**Questions:**
- Did opposing counsel file a general denial or specific denials? (general/specific/not_sure)
- INFO: General denial = deny everything. Specific denials show what they dispute.
- Did they raise affirmative defenses? (yes/no/not_sure)
  - yes → which ones? (contributory negligence, assumption of risk, statute of limitations, other)
- Did they file a counterclaim? (yes/no)
  - yes → INFO: You may need to respond within 30 days.
- Did they file special exceptions? (yes/no/not_sure)

### 3. pi_discovery_prep — "Prepare Your Discovery Requests"

**Questions:**
- INFO: Discovery is how you gather evidence. Texas allows interrogatories, RFPs, requests for admission, and depositions.
- Have you sent interrogatories? (yes/no/not_familiar)
  - not_familiar → INFO: explains with PI examples
- Have you sent requests for production? (yes/no/not_familiar)
  - not_familiar → INFO: explains with PI examples
- Are you planning depositions? (yes/no/not_sure)
  - INFO: typical PI deposition targets
- Have you subpoenaed medical records from defendant's insurance? (yes/no/not_applicable)

### 4. pi_discovery_responses — "Respond to Opposing Discovery"

**Questions:**
- Has opposing counsel sent you discovery requests? (yes/no/not_yet)
- If yes → type? (interrogatories/RFPs/RFAs/depositions)
- Do you know your response deadline? (yes/no)
  - INFO: 30 days in Texas
- Are there objectionable questions? (yes/no/not_sure)
  - INFO: common objections
- Has defendant requested an IME? (yes/no)
  - yes → INFO: your rights regarding IME

### 5. pi_scheduling_conference — "Scheduling Conference & Court Dates"

**Questions:**
- Has the court issued a scheduling order? (yes/no/not_sure)
  - yes → discovery cutoff date? trial date?
- Has a Rule 16 pretrial conference been scheduled? (yes/no/not_sure)
  - INFO: what to expect and prepare
- Have you exchanged expert witness designations? (yes/no/not_applicable)
  - INFO: PI typically needs medical expert

### 6. pi_pretrial_motions — "Pre-Trial Motions"

**Questions:**
- Has defendant filed a motion for summary judgment? (yes/no/not_sure)
  - yes → INFO: serious — must respond with evidence
  - Filed or need to file response? (yes/no/need_help)
- Motions in limine to consider? (yes/no/not_familiar)
  - INFO: excluding prior injuries, insurance info
- Daubert challenges to your experts? (yes/no/not_sure)

### 7. pi_mediation — "Mediation & Settlement Conference"

**Questions:**
- Is mediation ordered or voluntary? (ordered/voluntary/no_mediation)
  - no_mediation → INFO: can still negotiate
- Have you prepared your settlement demand? (yes/no/working_on_it)
  - INFO: medical expenses, lost wages, pain and suffering
- Minimum acceptable settlement? (think about this)
- INFO: mediator is neutral, be prepared to compromise

## Technical Implementation

### Migration

New migration `20260307000001_pi_litigation_flow_expansion.sql`:

1. **Update `seed_case_tasks()`**: Insert 7 new tasks in the PI chain between `pi_serve_defendant` and `pi_trial_prep`
2. **Update `unlock_next_task()`**: Chain the new tasks:
   - `pi_serve_defendant` → `pi_wait_for_answer`
   - `pi_wait_for_answer` → `pi_review_answer`
   - `pi_review_answer` → `pi_discovery_prep`
   - `pi_discovery_prep` → `pi_discovery_responses`
   - `pi_discovery_responses` → `pi_scheduling_conference`
   - `pi_scheduling_conference` → `pi_pretrial_motions`
   - `pi_pretrial_motions` → `pi_mediation`
   - `pi_mediation` → `pi_trial_prep`
3. **Add gatekeeper rule**: For `pi_wait_for_answer` deadline tracking
4. **Update PI milestones**: Add new stages (answer, discovery, motions)

### New Files (7 guided step configs)

- `src/lib/guided-steps/personal-injury/pi-wait-for-answer.ts`
- `src/lib/guided-steps/personal-injury/pi-review-answer.ts`
- `src/lib/guided-steps/personal-injury/pi-discovery-prep.ts`
- `src/lib/guided-steps/personal-injury/pi-discovery-responses.ts`
- `src/lib/guided-steps/personal-injury/pi-scheduling-conference.ts`
- `src/lib/guided-steps/personal-injury/pi-pretrial-motions.ts`
- `src/lib/guided-steps/personal-injury/pi-mediation.ts`

### Modified Files

- `src/app/(authenticated)/case/[id]/step/[taskId]/page.tsx` — add 7 new task_key → config mappings
- `src/lib/rules/gatekeeper.ts` — add `pi_wait_for_answer` deadline rule
- `src/lib/rules/milestones.ts` — update PI milestones

### No New UI Components

All 7 steps reuse the existing `GuidedStep` component.
