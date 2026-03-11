# Settlement Decision Workflow Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add settlement decision questions to the PI settlement negotiation step so the app conditionally unlocks either the litigation path (petition → trial) or the post-resolution path based on user answers.

**Architecture:** Extend the existing `pi_settlement_negotiation` guided step config with two new decision questions (`settlement_reached` and `want_to_file_suit`). Create property damage variants for both settlement negotiation and post-resolution steps. Update the DB `unlock_next_task()` trigger to branch: if settled or not filing suit, skip litigation tasks (mark them `skipped`) and unlock `pi_post_resolution` directly; if filing suit, unlock `prepare_pi_petition` as before.

**Tech Stack:** Next.js 16 (App Router), TypeScript, Supabase PostgreSQL triggers, GuidedStep component pattern

---

### Task 1: Add decision questions to injury settlement negotiation config

**Files:**
- Modify: `src/lib/guided-steps/personal-injury/pi-settlement-negotiation.ts`

**Context:** The existing config has 7 questions about offers, counter-offers, mediation, and SOL. We need to add two decision questions at the end: `settlement_reached` and `want_to_file_suit`. These drive the DB trigger branching.

**Step 1: Add the two decision questions to the questions array**

Add after the existing `sol_warning` info question (the last question):

```typescript
    {
      id: 'settlement_reached',
      type: 'yes_no' as const,
      prompt:
        'Have you reached a settlement agreement that you are satisfied with?',
      helpText:
        'If you accepted a settlement offer, select Yes. If negotiations are still ongoing or failed, select No.',
    },
    {
      id: 'want_to_file_suit',
      type: 'yes_no' as const,
      prompt: 'Do you want to file a lawsuit (petition) against the other party?',
      helpText:
        'If settlement negotiations have failed and you want to pursue your claim in court, select Yes.',
      showIf: (answers) => answers.settlement_reached === 'no',
    },
    {
      id: 'filing_suit_info',
      type: 'info' as const,
      prompt:
        'We will guide you through preparing and filing your petition. Make sure you file before your statute of limitations expires.',
      showIf: (answers) =>
        answers.settlement_reached === 'no' && answers.want_to_file_suit === 'yes',
    },
    {
      id: 'settled_info',
      type: 'info' as const,
      prompt:
        'Great — we will skip the litigation steps and guide you through the post-resolution process, including reviewing your settlement agreement and understanding any liens or tax implications.',
      showIf: (answers) => answers.settlement_reached === 'yes',
    },
```

**Step 2: Update generateSummary to include the decision outcomes**

Add these summary items at the end of the `generateSummary` function, before the final `return items`:

```typescript
    if (answers.settlement_reached === 'yes') {
      items.push({
        status: 'done',
        text: 'Settlement reached. Litigation steps will be skipped.',
      })
    } else if (answers.settlement_reached === 'no') {
      if (answers.want_to_file_suit === 'yes') {
        items.push({
          status: 'needed',
          text: 'Filing a lawsuit. Next step: prepare your petition.',
        })
      } else {
        items.push({
          status: 'info',
          text: 'Not filing suit at this time. You can revisit this decision later.',
        })
      }
    }
```

**Step 3: Verify the file compiles**

Run: `cd "/Users/minwang/lawyer free" && npx tsc --noEmit src/lib/guided-steps/personal-injury/pi-settlement-negotiation.ts 2>&1 | head -20`

If tsc doesn't work on a single file, run: `npm run build 2>&1 | tail -30`

**Step 4: Commit**

```bash
git add src/lib/guided-steps/personal-injury/pi-settlement-negotiation.ts
git commit -m "feat: add settlement decision questions to PI settlement negotiation config"
```

---

### Task 2: Create property damage settlement negotiation config

**Files:**
- Create: `src/lib/guided-steps/personal-injury/pi-settlement-negotiation-property.ts`

**Context:** Property damage cases don't involve "injuries" or "pain and suffering." The settlement negotiation config needs property-damage-appropriate language: "repair costs," "diminished value," "loss of use" instead of "medical bills," "lost wages," "pain and suffering."

**Step 1: Create the property damage variant**

Create `src/lib/guided-steps/personal-injury/pi-settlement-negotiation-property.ts`:

```typescript
import type { GuidedStepConfig } from '../types'

export const piSettlementNegotiationPropertyConfig: GuidedStepConfig = {
  title: 'Negotiate Your Settlement',
  reassurance:
    'Understanding your options helps you get fair compensation for your property damage.',

  questions: [
    {
      id: 'received_offer',
      type: 'yes_no',
      prompt:
        'Have you received a settlement offer from the insurance company?',
    },
    {
      id: 'offer_evaluation',
      type: 'single_choice',
      prompt: 'How does the offer compare to your total property damage costs?',
      options: [
        { value: 'too_low', label: 'Too low' },
        { value: 'seems_fair', label: 'Seems fair' },
        { value: 'unsure', label: "I'm not sure" },
      ],
      showIf: (answers) => answers.received_offer === 'yes',
    },
    {
      id: 'counter_offer_info',
      type: 'info',
      prompt:
        'To write a counter-offer: state why their offer is low, itemize your repair costs (including diminished value and loss of use), propose a specific amount, and set a response deadline.',
      showIf: (answers) => answers.offer_evaluation === 'too_low',
    },
    {
      id: 'open_to_mediation',
      type: 'yes_no',
      prompt: 'Would you be open to mediation if negotiations stall?',
    },
    {
      id: 'mediation_info',
      type: 'info',
      prompt:
        "Mediation uses a neutral third party to help reach agreement. It's faster and cheaper than going to court.",
      showIf: (answers) => answers.open_to_mediation === 'yes',
    },
    {
      id: 'know_statute_of_limitations',
      type: 'yes_no',
      prompt:
        'Do you know your statute of limitations deadline for filing suit?',
    },
    {
      id: 'sol_warning',
      type: 'info',
      prompt:
        'Important: If negotiations fail, you must file suit before your statute of limitations expires. In Texas, this is generally 2 years for property damage claims.',
    },
    {
      id: 'settlement_reached',
      type: 'yes_no',
      prompt:
        'Have you reached a settlement agreement that you are satisfied with?',
      helpText:
        'If you accepted a settlement offer, select Yes. If negotiations are still ongoing or failed, select No.',
    },
    {
      id: 'want_to_file_suit',
      type: 'yes_no',
      prompt: 'Do you want to file a lawsuit (petition) against the other party?',
      helpText:
        'If settlement negotiations have failed and you want to pursue your claim in court, select Yes.',
      showIf: (answers) => answers.settlement_reached === 'no',
    },
    {
      id: 'filing_suit_info',
      type: 'info',
      prompt:
        'We will guide you through preparing and filing your petition. Make sure you file before your statute of limitations expires.',
      showIf: (answers) =>
        answers.settlement_reached === 'no' && answers.want_to_file_suit === 'yes',
    },
    {
      id: 'settled_info',
      type: 'info',
      prompt:
        'Great — we will skip the litigation steps and guide you through the post-resolution process, including reviewing your settlement agreement and understanding any tax implications.',
      showIf: (answers) => answers.settlement_reached === 'yes',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.received_offer === 'yes') {
      items.push({
        status: 'done',
        text: 'Settlement offer received from the insurance company.',
      })

      if (answers.offer_evaluation === 'too_low') {
        items.push({
          status: 'needed',
          text: 'Write a counter-offer: explain why the offer is low, itemize your repair costs (including diminished value and loss of use), propose a specific amount, and set a deadline.',
        })
      } else if (answers.offer_evaluation === 'seems_fair') {
        items.push({
          status: 'info',
          text: 'The offer seems fair. Review it carefully before accepting and make sure it covers all repair costs, diminished value, and loss of use.',
        })
      } else if (answers.offer_evaluation === 'unsure') {
        items.push({
          status: 'needed',
          text: 'Compare the offer to your total costs (repair estimates, diminished value, loss of use, rental expenses) before deciding.',
        })
      }
    } else {
      items.push({
        status: 'info',
        text: 'No settlement offer received yet. Continue building your case and documenting damage costs.',
      })
    }

    if (answers.open_to_mediation === 'yes') {
      items.push({
        status: 'info',
        text: 'Open to mediation. This is a cost-effective way to resolve disputes if direct negotiation stalls.',
      })
    } else {
      items.push({
        status: 'info',
        text: 'Not currently open to mediation. You can reconsider later if negotiations stall.',
      })
    }

    if (answers.know_statute_of_limitations === 'yes') {
      items.push({
        status: 'done',
        text: 'Statute of limitations deadline is known.',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Determine your statute of limitations deadline. In Texas, it is generally 2 years for property damage claims.',
      })
    }

    if (answers.settlement_reached === 'yes') {
      items.push({
        status: 'done',
        text: 'Settlement reached. Litigation steps will be skipped.',
      })
    } else if (answers.settlement_reached === 'no') {
      if (answers.want_to_file_suit === 'yes') {
        items.push({
          status: 'needed',
          text: 'Filing a lawsuit. Next step: prepare your petition.',
        })
      } else {
        items.push({
          status: 'info',
          text: 'Not filing suit at this time. You can revisit this decision later.',
        })
      }
    }

    return items
  },
}
```

**Step 2: Verify the file compiles**

Run: `npm run build 2>&1 | tail -30`

**Step 3: Commit**

```bash
git add src/lib/guided-steps/personal-injury/pi-settlement-negotiation-property.ts
git commit -m "feat: add property damage variant for settlement negotiation config"
```

---

### Task 3: Make PISettlementNegotiationStep sub-type-aware

**Files:**
- Modify: `src/components/step/personal-injury/pi-settlement-negotiation-step.tsx`

**Context:** Follow the same pattern used in `pi-medical-records-step.tsx` and `pi-insurance-communication-step.tsx`: accept `piSubType` prop, use `isPropertyDamageSubType()` to select config.

**Step 1: Update the component**

Replace the entire file contents with:

```typescript
'use client'

import { GuidedStep } from '../guided-step'
import { piSettlementNegotiationConfig } from '@/lib/guided-steps/personal-injury/pi-settlement-negotiation'
import { piSettlementNegotiationPropertyConfig } from '@/lib/guided-steps/personal-injury/pi-settlement-negotiation-property'
import { isPropertyDamageSubType } from '@/lib/guided-steps/personal-injury/constants'

interface Props {
  caseId: string
  taskId: string
  existingAnswers?: Record<string, string>
  piSubType?: string
}

export function PISettlementNegotiationStep({ caseId, taskId, existingAnswers, piSubType }: Props) {
  const config = isPropertyDamageSubType(piSubType)
    ? piSettlementNegotiationPropertyConfig
    : piSettlementNegotiationConfig

  return (
    <GuidedStep
      caseId={caseId}
      taskId={taskId}
      config={config}
      existingAnswers={existingAnswers}
    />
  )
}
```

**Step 2: Verify the file compiles**

Run: `npm run build 2>&1 | tail -30`

**Step 3: Commit**

```bash
git add src/components/step/personal-injury/pi-settlement-negotiation-step.tsx
git commit -m "feat: make PISettlementNegotiationStep sub-type-aware"
```

---

### Task 4: Create property damage post-resolution config

**Files:**
- Create: `src/lib/guided-steps/personal-injury/pi-post-resolution-property.ts`

**Context:** The existing `pi-post-resolution.ts` mentions "medical liens" and "compensation for physical injuries." Property damage post-resolution should mention "repair liens," "subrogation," and property-specific tax implications.

**Step 1: Create the property damage variant**

Create `src/lib/guided-steps/personal-injury/pi-post-resolution-property.ts`:

```typescript
import type { GuidedStepConfig } from '../types'

export const piPostResolutionPropertyConfig: GuidedStepConfig = {
  title: 'After Resolution',
  reassurance:
    'Understanding your next steps ensures you handle the outcome correctly.',

  questions: [
    {
      id: 'case_outcome',
      type: 'single_choice',
      prompt: 'What was the outcome of your case?',
      options: [
        { value: 'settled', label: 'Settled' },
        { value: 'won_trial', label: 'Won at trial' },
        { value: 'lost_trial', label: 'Lost at trial' },
        { value: 'still_pending', label: 'Still pending' },
      ],
    },
    {
      id: 'settlement_reviewed',
      type: 'yes_no',
      prompt:
        'Have you reviewed the settlement agreement for any liens (e.g., repair shop liens, subrogation claims)?',
      showIf: (answers) => answers.case_outcome === 'settled',
    },
    {
      id: 'lien_info',
      type: 'info',
      prompt:
        'Before spending settlement funds, check for any outstanding liens — your insurance company may have a subrogation claim to recover what they paid on your behalf.',
      showIf: (answers) => answers.case_outcome === 'settled',
    },
    {
      id: 'defendant_paid',
      type: 'yes_no',
      prompt: 'Has the defendant paid the judgment?',
      showIf: (answers) => answers.case_outcome === 'won_trial',
    },
    {
      id: 'collection_info',
      type: 'info',
      prompt:
        "If the defendant hasn't paid, you may need to pursue collection through wage garnishment, bank levy, or property lien.",
      showIf: (answers) => answers.defendant_paid === 'no',
    },
    {
      id: 'considering_appeal',
      type: 'yes_no',
      prompt: 'Are you considering an appeal?',
      showIf: (answers) => answers.case_outcome === 'lost_trial',
    },
    {
      id: 'appeal_info',
      type: 'info',
      prompt:
        "Appeals must typically be filed within 30 days. You'll need to show the court made a legal error — disagreeing with the outcome alone isn't enough.",
      showIf: (answers) => answers.considering_appeal === 'yes',
    },
    {
      id: 'tax_info',
      type: 'info',
      prompt:
        'Property damage settlements are generally not taxable if they reimburse you for a loss (restoring you to your previous position). However, if you receive more than your actual loss, the excess may be taxable. Consult a tax professional if unsure.',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []
    const outcome = answers.case_outcome

    if (outcome === 'settled') {
      items.push({
        status: 'done',
        text: 'Case settled.',
      })

      if (answers.settlement_reviewed === 'yes') {
        items.push({
          status: 'done',
          text: 'Settlement agreement reviewed for liens and subrogation claims.',
        })
      } else {
        items.push({
          status: 'needed',
          text: 'Review the settlement agreement for any liens or subrogation claims before spending funds.',
        })
      }

      items.push({
        status: 'info',
        text: 'Check if your insurance company has a subrogation claim to recover what they paid on your behalf.',
      })
    } else if (outcome === 'won_trial') {
      items.push({
        status: 'done',
        text: 'Won at trial.',
      })

      if (answers.defendant_paid === 'yes') {
        items.push({
          status: 'done',
          text: 'Defendant has paid the judgment.',
        })
      } else {
        items.push({
          status: 'needed',
          text: 'Pursue collection: wage garnishment, bank levy, or property lien may be needed.',
        })
      }
    } else if (outcome === 'lost_trial') {
      items.push({
        status: 'info',
        text: 'Lost at trial.',
      })

      if (answers.considering_appeal === 'yes') {
        items.push({
          status: 'needed',
          text: 'File your appeal within 30 days. You must show the court made a legal error.',
        })
      } else {
        items.push({
          status: 'info',
          text: 'Not pursuing an appeal. The deadline is typically 30 days if you change your mind.',
        })
      }
    } else if (outcome === 'still_pending') {
      items.push({
        status: 'info',
        text: 'Case is still pending. Return to this step once your case reaches a resolution.',
      })
    }

    items.push({
      status: 'info',
      text: 'Property damage settlements that reimburse your actual loss are generally not taxable. Consult a tax professional if you received more than your loss.',
    })

    return items
  },
}
```

**Step 2: Verify the file compiles**

Run: `npm run build 2>&1 | tail -30`

**Step 3: Commit**

```bash
git add src/lib/guided-steps/personal-injury/pi-post-resolution-property.ts
git commit -m "feat: add property damage variant for post-resolution config"
```

---

### Task 5: Make PIPostResolutionStep sub-type-aware

**Files:**
- Modify: `src/components/step/personal-injury/pi-post-resolution-step.tsx`

**Context:** Same pattern as Task 3. Accept `piSubType`, select between property and injury configs.

**Step 1: Update the component**

Replace the entire file contents with:

```typescript
'use client'

import { GuidedStep } from '../guided-step'
import { piPostResolutionConfig } from '@/lib/guided-steps/personal-injury/pi-post-resolution'
import { piPostResolutionPropertyConfig } from '@/lib/guided-steps/personal-injury/pi-post-resolution-property'
import { isPropertyDamageSubType } from '@/lib/guided-steps/personal-injury/constants'

interface Props {
  caseId: string
  taskId: string
  existingAnswers?: Record<string, string>
  piSubType?: string
}

export function PIPostResolutionStep({ caseId, taskId, existingAnswers, piSubType }: Props) {
  const config = isPropertyDamageSubType(piSubType)
    ? piPostResolutionPropertyConfig
    : piPostResolutionConfig

  return (
    <GuidedStep
      caseId={caseId}
      taskId={taskId}
      config={config}
      existingAnswers={existingAnswers}
    />
  )
}
```

**Step 2: Verify the file compiles**

Run: `npm run build 2>&1 | tail -30`

**Step 3: Commit**

```bash
git add src/components/step/personal-injury/pi-post-resolution-step.tsx
git commit -m "feat: make PIPostResolutionStep sub-type-aware"
```

---

### Task 6: Update step router to pass piSubType to settlement negotiation and post-resolution

**Files:**
- Modify: `src/app/(authenticated)/case/[id]/step/[taskId]/page.tsx`

**Context:** The step router at lines 754-755 renders `PISettlementNegotiationStep` without `piSubType`. Lines 791-792 render `PIPostResolutionStep` without `piSubType`. Both need to fetch `piSubType` from `personal_injury_details` and pass it as a prop, following the same pattern already used for `pi_medical_records` (lines 729-733) and `pi_insurance_communication` (lines 734-738).

**Step 1: Update the `pi_settlement_negotiation` case**

Replace lines 754-755:

```typescript
    case 'pi_settlement_negotiation':
      return <PISettlementNegotiationStep caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
```

With:

```typescript
    case 'pi_settlement_negotiation': {
      const { data: piDetails } = await supabase
        .from('personal_injury_details').select('pi_sub_type').eq('case_id', id).maybeSingle()
      return <PISettlementNegotiationStep caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} piSubType={piDetails?.pi_sub_type ?? undefined} />
    }
```

**Step 2: Update the `pi_post_resolution` case**

Replace line 792:

```typescript
    case 'pi_post_resolution':
      return <PIPostResolutionStep caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
```

With:

```typescript
    case 'pi_post_resolution': {
      const { data: piDetails } = await supabase
        .from('personal_injury_details').select('pi_sub_type').eq('case_id', id).maybeSingle()
      return <PIPostResolutionStep caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} piSubType={piDetails?.pi_sub_type ?? undefined} />
    }
```

**Step 3: Verify the file compiles**

Run: `npm run build 2>&1 | tail -30`

**Step 4: Commit**

```bash
git add src/app/(authenticated)/case/[id]/step/[taskId]/page.tsx
git commit -m "feat: pass piSubType to settlement negotiation and post-resolution steps"
```

---

### Task 7: DB migration — conditional unlock with settlement decision branching

**Files:**
- Create: `supabase/migrations/20260308000002_settlement_decision_branching.sql`

**Context:** Currently, completing `pi_settlement_negotiation` always unlocks `prepare_pi_petition` (line 58-62 of the latest migration). We need to replace that single transition with conditional logic that reads `metadata->'guided_answers'->>'settlement_reached'` and `metadata->'guided_answers'->>'want_to_file_suit'`:

- **If `settlement_reached = 'yes'`**: Skip all litigation tasks (mark them `skipped`), unlock `pi_post_resolution` directly.
- **If `settlement_reached = 'no'` AND `want_to_file_suit = 'yes'`**: Unlock `prepare_pi_petition` (existing behavior).
- **If `settlement_reached = 'no'` AND `want_to_file_suit != 'yes'`**: Skip all litigation tasks, unlock `pi_post_resolution` directly.

The 11 litigation tasks to skip when not filing suit:
`prepare_pi_petition`, `pi_file_with_court`, `pi_serve_defendant`, `pi_wait_for_answer`, `pi_review_answer`, `pi_discovery_prep`, `pi_discovery_responses`, `pi_scheduling_conference`, `pi_pretrial_motions`, `pi_mediation`, `pi_trial_prep`

**Step 1: Create the migration file**

Create `supabase/migrations/20260308000002_settlement_decision_branching.sql`:

```sql
-- ============================================
-- Settlement Decision Branching
-- ============================================
--
-- Makes the pi_settlement_negotiation transition conditional:
--   - settlement_reached = 'yes'  → skip litigation, unlock pi_post_resolution
--   - want_to_file_suit = 'yes'   → unlock prepare_pi_petition (existing behavior)
--   - otherwise                    → skip litigation, unlock pi_post_resolution
--
-- All other transitions remain exactly the same.
-- ============================================

CREATE OR REPLACE FUNCTION public.unlock_next_task()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_settlement_reached TEXT;
  v_want_to_file_suit  TEXT;
BEGIN
  -- ========================================
  -- Personal injury chain (18 transitions)
  -- ========================================

  -- PI: welcome -> pi_intake
  IF NEW.task_key = 'welcome' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'pi_intake' AND status = 'locked';
  END IF;

  -- PI: pi_intake -> pi_medical_records
  IF NEW.task_key = 'pi_intake' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'pi_medical_records' AND status = 'locked';
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

  -- PI: pi_settlement_negotiation -> CONDITIONAL BRANCHING
  IF NEW.task_key = 'pi_settlement_negotiation' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    v_settlement_reached := COALESCE(NEW.metadata->'guided_answers'->>'settlement_reached', '');
    v_want_to_file_suit  := COALESCE(NEW.metadata->'guided_answers'->>'want_to_file_suit', '');

    IF v_settlement_reached = 'no' AND v_want_to_file_suit = 'yes' THEN
      -- Filing suit: unlock prepare_pi_petition (normal litigation path)
      UPDATE public.tasks SET status = 'todo', unlocked_at = now()
      WHERE case_id = NEW.case_id AND task_key = 'prepare_pi_petition' AND status = 'locked';
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
  -- Small claims chain
  -- ========================================

  IF NEW.task_key = 'welcome' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'small_claims_intake' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'small_claims_intake' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'evidence_vault' AND status = 'locked';
  END IF;

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

**Step 2: Push migration to remote**

Run: `cd "/Users/minwang/lawyer free" && npx supabase db push`

This pushes to the remote Supabase instance (the one `.env.local` points to).

**Step 3: Commit**

```bash
git add supabase/migrations/20260308000002_settlement_decision_branching.sql
git commit -m "feat: add settlement decision branching to unlock_next_task trigger"
```

---

### Task 8: Verify the full build compiles

**Files:** None (verification only)

**Step 1: Run the full build**

Run: `cd "/Users/minwang/lawyer free" && npm run build 2>&1 | tail -40`

Expected: Build succeeds with no TypeScript errors.

**Step 2: Manual test plan**

1. Create a new PI property damage case
2. Progress through steps until "Negotiate Your Settlement"
3. Verify property-damage-specific language (repair costs, diminished value)
4. Answer `settlement_reached = yes` → complete step
5. Verify litigation tasks show as `skipped` in DB
6. Verify "After Resolution" unlocks with property-damage-specific content
7. Repeat with `settlement_reached = no`, `want_to_file_suit = yes` → verify petition unlocks
8. Repeat with injury sub-type → verify injury-specific language throughout
