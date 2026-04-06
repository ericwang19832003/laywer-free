# PI Petition Flow Phase 1 — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enhance pre-filing and filing PI tasks with government entity detection, hospital lien tracking, insurance tactics education, UM/UIM guidance, and a guided petition builder.

**Architecture:** Extend existing guided step configs and custom step components. Add conditional task injection via a new SQL trigger. New deadline rules for Tort Claims Act and UM/UIM. No new tables — all data stored in task metadata JSONB.

**Tech Stack:** TypeScript (shared configs), React (step components), PostgreSQL (triggers/functions), Zod (validation), Next.js API routes

**Design Doc:** `docs/plans/2026-04-05-pi-petition-flow-phase1-design.md`

---

## Task 1: Add MOTOR_VEHICLE_SUB_TYPES constant to shared package

**Files:**
- Modify: `packages/shared/src/guided-steps/personal-injury/constants.ts`

The wizard currently defines `MOTOR_VEHICLE_TYPES` locally. We need it shared for UM/UIM conditional logic.

**Step 1: Add the constant**

```typescript
// Add after PROPERTY_DAMAGE_SUB_TYPES

export const MOTOR_VEHICLE_SUB_TYPES: PiSubType[] = [
  'auto_accident',
  'pedestrian_cyclist',
  'rideshare',
  'uninsured_motorist',
]

export function isMotorVehicleSubType(subType?: string): boolean {
  return MOTOR_VEHICLE_SUB_TYPES.includes(subType as PiSubType)
}
```

**Step 2: Update the wizard to use shared constant**

In `apps/web/src/components/step/personal-injury-wizard.tsx`, replace:
```typescript
const MOTOR_VEHICLE_TYPES = ['auto_accident', 'pedestrian_cyclist', 'rideshare', 'uninsured_motorist']
```
With:
```typescript
import { MOTOR_VEHICLE_SUB_TYPES } from '@lawyer-free/shared/guided-steps/personal-injury/constants'
```
And update all references from `MOTOR_VEHICLE_TYPES` to `MOTOR_VEHICLE_SUB_TYPES`.

**Step 3: Verify build**

Run: `cd "/Users/minwang/lawyer free" && npx turbo typecheck --filter=@lawyer-free/shared --filter=@lawyer-free/web`
Expected: PASS

**Step 4: Commit**

```bash
git add packages/shared/src/guided-steps/personal-injury/constants.ts apps/web/src/components/step/personal-injury-wizard.tsx
git commit -m "refactor: move MOTOR_VEHICLE_TYPES to shared constants"
```

---

## Task 2: Enhance `pi_intake` guided step — Government Entity Detection

**Files:**
- Modify: `packages/shared/src/guided-steps/personal-injury/pi-intake.ts`

Add government entity detection questions and SOL tolling questions to the existing config. These use the `GuidedStepConfig` pattern with `showIf` conditionals.

**Step 1: Add government entity questions**

Add these questions after the existing incident description questions in the `questions` array:

```typescript
// --- Government Entity Detection ---
{
  id: 'gov_entity_info',
  type: 'info' as const,
  prompt: '⚖️ Government Entity Check\n\nIf a government entity (city, county, state, school district) caused your injury, Texas law requires a special pre-suit notice. Missing this deadline bars your claim entirely. Let\'s check.',
},
{
  id: 'gov_employee_on_duty',
  type: 'yes_no' as const,
  prompt: 'Was the other party a government employee acting in their official capacity? (Examples: city bus driver, police officer, public school staff, state highway worker)',
},
{
  id: 'gov_property',
  type: 'yes_no' as const,
  prompt: 'Did the incident happen on government-owned property? (Examples: public park, state highway defect, government building, public transit)',
  showIf: (answers: Record<string, string>) => answers.gov_employee_on_duty !== 'yes',
},
{
  id: 'gov_vehicle',
  type: 'yes_no' as const,
  prompt: 'Was a government-owned vehicle involved? (Examples: city bus, county truck, state vehicle)',
  showIf: (answers: Record<string, string>) => answers.gov_employee_on_duty !== 'yes' && answers.gov_property !== 'yes',
},
{
  id: 'gov_entity_type',
  type: 'single_choice' as const,
  prompt: 'What type of government entity is involved?',
  options: [
    { value: 'city', label: 'City (city bus, city park, city employee)' },
    { value: 'county', label: 'County (county road, county hospital, sheriff)' },
    { value: 'state_agency', label: 'State Agency (TxDOT, state trooper, state hospital)' },
    { value: 'school_district', label: 'School District (school bus, school property)' },
  ],
  showIf: (answers: Record<string, string>) =>
    answers.gov_employee_on_duty === 'yes' || answers.gov_property === 'yes' || answers.gov_vehicle === 'yes',
},
{
  id: 'gov_entity_name',
  type: 'text' as const,
  prompt: 'What is the name of the government entity? (e.g., "City of Houston", "Harris County", "Texas Department of Transportation")',
  placeholder: 'Enter the government entity name',
  showIf: (answers: Record<string, string>) =>
    answers.gov_employee_on_duty === 'yes' || answers.gov_property === 'yes' || answers.gov_vehicle === 'yes',
},
{
  id: 'gov_entity_warning',
  type: 'info' as const,
  prompt: '🚨 Important: Texas Tort Claims Act\n\nBecause a government entity is involved, you MUST send a written pre-suit notice before filing your lawsuit. Texas law gives you only 6 months from the date of injury — and some cities have even shorter deadlines (Austin: 45 days, Houston/Dallas: 90 days).\n\nWe\'ll add a special task to help you draft and send this notice. Missing this deadline means your claim is permanently barred.',
  showIf: (answers: Record<string, string>) =>
    answers.gov_employee_on_duty === 'yes' || answers.gov_property === 'yes' || answers.gov_vehicle === 'yes',
},
```

**Step 2: Add SOL tolling questions**

Add after the government entity section:

```typescript
// --- SOL Tolling ---
{
  id: 'sol_tolling_info',
  type: 'info' as const,
  prompt: '⏰ Statute of Limitations Check\n\nTexas gives you 2 years from the date of injury to file a lawsuit. However, some circumstances can extend this deadline.',
},
{
  id: 'minor_at_incident',
  type: 'yes_no' as const,
  prompt: 'Were you under 18 years old at the time of the incident?',
  helpText: 'If yes, the 2-year clock doesn\'t start until you turn 18.',
},
{
  id: 'mental_incapacity',
  type: 'yes_no' as const,
  prompt: 'Were you mentally incapacitated at the time of the incident (e.g., coma, severe brain injury)?',
  helpText: 'If yes, the clock is paused during the period of incapacity.',
  showIf: (answers: Record<string, string>) => answers.minor_at_incident !== 'yes',
},
{
  id: 'discovered_later',
  type: 'yes_no' as const,
  prompt: 'Did you discover the injury significantly later than when it occurred? (e.g., toxic exposure, delayed medical diagnosis)',
  helpText: 'Texas\'s "discovery rule" may start the clock from when you discovered (or should have discovered) the injury.',
  showIf: (answers: Record<string, string>) => answers.minor_at_incident !== 'yes' && answers.mental_incapacity !== 'yes',
},
```

**Step 3: Add proportionate responsibility awareness**

Add at the end of the questions array:

```typescript
// --- Proportionate Responsibility Awareness ---
{
  id: 'prop_responsibility_info',
  type: 'info' as const,
  prompt: '📋 Important: Texas\'s 51% Rule\n\nTexas uses a "proportionate responsibility" system. If a jury finds you were more than 50% at fault for your injury, you recover nothing — zero.\n\nThis is why documenting the other party\'s fault matters. In the next steps, we\'ll help you gather evidence that clearly establishes who was responsible.\n\nThe defendant\'s lawyer will try to shift blame onto you. Being prepared for this is one of the most important things you can do.',
},
```

**Step 4: Update `generateSummary` to reflect new questions**

Add to the `generateSummary` function:

```typescript
// Government entity
const isGovEntity = answers.gov_employee_on_duty === 'yes' || answers.gov_property === 'yes' || answers.gov_vehicle === 'yes'
if (isGovEntity) {
  items.push({
    status: answers.gov_entity_name ? 'done' : 'needed',
    text: `Government entity identified: ${answers.gov_entity_name || 'Name needed'}`,
  })
  items.push({
    status: 'info',
    text: '⚠️ Tort Claims Act notice required — task will be added to your case',
  })
}

// SOL tolling
if (answers.minor_at_incident === 'yes') {
  items.push({ status: 'info', text: 'SOL tolling: Minor at time of incident — clock starts at age 18' })
} else if (answers.mental_incapacity === 'yes') {
  items.push({ status: 'info', text: 'SOL tolling: Mental incapacity — clock paused during incapacity' })
} else if (answers.discovered_later === 'yes') {
  items.push({ status: 'info', text: 'SOL tolling: Discovery rule may apply — clock starts at discovery' })
}
```

**Step 5: Verify build**

Run: `cd "/Users/minwang/lawyer free" && npx turbo typecheck --filter=@lawyer-free/shared`
Expected: PASS

**Step 6: Commit**

```bash
git add packages/shared/src/guided-steps/personal-injury/pi-intake.ts
git commit -m "feat(pi): add government entity detection, SOL tolling, and 51% rule awareness to intake"
```

---

## Task 3: Enhance `pi_intake` component — Government entity metadata + conditional task injection

**Files:**
- Modify: `apps/web/src/components/step/personal-injury/pi-intake-step.tsx`
- Modify: `apps/web/src/app/api/tasks/[id]/route.ts`

The intake step component uses a custom form (Type B component), not GuidedStep. We need to handle government entity detection on the component side and trigger conditional task injection on completion.

**Step 1: Add government entity state and form fields to `pi-intake-step.tsx`**

Add state variables after existing state declarations:

```typescript
// Government entity detection
const [govEmployeeOnDuty, setGovEmployeeOnDuty] = useState(
  (meta.gov_employee_on_duty as string) ?? ''
)
const [govProperty, setGovProperty] = useState(
  (meta.gov_property as string) ?? ''
)
const [govVehicle, setGovVehicle] = useState(
  (meta.gov_vehicle as string) ?? ''
)
const [govEntityType, setGovEntityType] = useState(
  (meta.gov_entity_type as string) ?? ''
)
const [govEntityName, setGovEntityName] = useState(
  (meta.gov_entity_name as string) ?? ''
)

// SOL tolling
const [minorAtIncident, setMinorAtIncident] = useState(
  (meta.minor_at_incident as string) ?? ''
)
const [mentalIncapacity, setMentalIncapacity] = useState(
  (meta.mental_incapacity as string) ?? ''
)
const [discoveredLater, setDiscoveredLater] = useState(
  (meta.discovered_later as string) ?? ''
)

// Derived
const isGovEntity = govEmployeeOnDuty === 'yes' || govProperty === 'yes' || govVehicle === 'yes'
```

**Step 2: Update `buildMetadata()` to include new fields**

```typescript
function buildMetadata() {
  return {
    // ... existing fields ...
    gov_employee_on_duty: govEmployeeOnDuty || null,
    gov_property: govProperty || null,
    gov_vehicle: govVehicle || null,
    gov_entity_type: isGovEntity ? govEntityType || null : null,
    gov_entity_name: isGovEntity ? govEntityName.trim() || null : null,
    government_entity_detected: isGovEntity,
    minor_at_incident: minorAtIncident || null,
    mental_incapacity: mentalIncapacity || null,
    discovered_later: discoveredLater || null,
  }
}
```

**Step 3: Add form sections to the render**

Add after the existing incident description section, before the review section. Use the same UI patterns (labels, selects, inputs, info cards) already used in the component:

- Government Entity Check section with 3 yes/no selects
- Conditional entity type + name fields (shown when `isGovEntity`)
- Tort Claims Act warning card (shown when `isGovEntity`)
- SOL Tolling section with conditional yes/no selects
- 51% Rule info card

**Step 4: Handle task injection on completion**

After the existing `handleConfirm` completes (task marked as `completed`), if `isGovEntity`, call a new API endpoint to inject Tort Claims tasks:

```typescript
async function handleConfirm() {
  const metadata = buildMetadata()
  await patchTask('in_progress', metadata)
  await patchTask('completed')

  // Inject Tort Claims tasks if government entity detected
  if (isGovEntity) {
    await fetch(`/api/cases/${caseId}/inject-tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        task_keys: ['pi_tort_claims_notice', 'pi_tort_claims_tracking'],
        insert_after: 'pi_intake',
        incident_date: incidentDate,
        gov_entity_type: govEntityType,
      }),
    })
  }
}
```

**Step 5: Verify build**

Run: `cd "/Users/minwang/lawyer free" && npx turbo typecheck --filter=@lawyer-free/web`
Expected: PASS

**Step 6: Commit**

```bash
git add apps/web/src/components/step/personal-injury/pi-intake-step.tsx
git commit -m "feat(pi): add government entity detection and SOL tolling to intake component"
```

---

## Task 4: Create task injection API endpoint

**Files:**
- Create: `apps/web/src/app/api/cases/[id]/inject-tasks/route.ts`
- Create: `supabase/migrations/20260405000001_pi_tort_claims_injection.sql`

**Step 1: Create the API route**

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'

const injectTasksSchema = z.object({
  task_keys: z.array(z.string()),
  insert_after: z.string(),
  incident_date: z.string().optional(),
  gov_entity_type: z.string().optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: caseId } = await params
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify case ownership
  const { data: caseData, error: caseError } = await supabase
    .from('cases')
    .select('id, user_id')
    .eq('id', caseId)
    .single()

  if (caseError || !caseData || caseData.user_id !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const body = await request.json()
  const parsed = injectTasksSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { task_keys, insert_after, incident_date, gov_entity_type } = parsed.data

  const { data, error } = await supabase.rpc('inject_conditional_tasks', {
    p_case_id: caseId,
    p_task_keys: task_keys,
    p_insert_after: insert_after,
    p_incident_date: incident_date ?? null,
    p_gov_entity_type: gov_entity_type ?? null,
  })

  if (error) {
    console.error('inject_conditional_tasks error:', error)
    return NextResponse.json({ error: 'Failed to inject tasks' }, { status: 500 })
  }

  return NextResponse.json({ success: true, tasks_injected: task_keys })
}
```

**Step 2: Create the database migration**

```sql
-- Inject conditional tasks for Tort Claims Act (government entity PI cases)
-- Also creates associated deadlines

CREATE OR REPLACE FUNCTION public.inject_conditional_tasks(
  p_case_id uuid,
  p_task_keys text[],
  p_insert_after text,
  p_incident_date text DEFAULT NULL,
  p_gov_entity_type text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_task_key text;
  v_title text;
  v_incident_ts timestamptz;
  v_notice_deadline timestamptz;
BEGIN
  -- Verify case ownership via RLS context
  SELECT user_id INTO v_user_id FROM public.cases WHERE id = p_case_id;
  IF v_user_id IS NULL OR v_user_id != auth.uid() THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  FOREACH v_task_key IN ARRAY p_task_keys LOOP
    -- Skip if task already exists for this case
    IF EXISTS (SELECT 1 FROM public.tasks WHERE case_id = p_case_id AND task_key = v_task_key) THEN
      CONTINUE;
    END IF;

    -- Determine title
    CASE v_task_key
      WHEN 'pi_tort_claims_notice' THEN v_title := 'Draft & Send Tort Claims Notice';
      WHEN 'pi_tort_claims_tracking' THEN v_title := 'Track Tort Claims Notice Response';
      ELSE v_title := v_task_key;
    END CASE;

    -- Insert task as todo (immediately actionable since intake is complete)
    INSERT INTO public.tasks (case_id, task_key, title, status, unlocked_at)
    VALUES (p_case_id, v_task_key, v_title, 'todo', now());

    -- Log event
    INSERT INTO public.task_events (case_id, task_id, kind, payload)
    VALUES (
      p_case_id,
      (SELECT id FROM public.tasks WHERE case_id = p_case_id AND task_key = v_task_key),
      'task_injected',
      jsonb_build_object('task_key', v_task_key, 'insert_after', p_insert_after)
    );
  END LOOP;

  -- Create Tort Claims notice deadline (6 months from incident)
  IF p_incident_date IS NOT NULL AND 'pi_tort_claims_notice' = ANY(p_task_keys) THEN
    v_incident_ts := p_incident_date::timestamptz;
    v_notice_deadline := v_incident_ts + interval '6 months';

    -- Only create if deadline is in the future
    IF v_notice_deadline > now() THEN
      INSERT INTO public.deadlines (case_id, key, due_at, source, rationale, label, consequence, auto_generated)
      VALUES (
        p_case_id,
        'tort_claims_notice_deadline',
        v_notice_deadline,
        'system',
        'Texas Tort Claims Act requires written notice to government entity within 6 months of injury. Some cities have shorter deadlines (Austin: 45 days, Houston/Dallas: 90 days). Verify your local rules.',
        'Tort Claims Notice Deadline',
        'Your claim against the government entity will be permanently barred if notice is not sent by this date.',
        true
      );
    END IF;
  END IF;
END;
$$;
```

**Step 3: Verify migration applies**

Run: `cd "/Users/minwang/lawyer free" && npx supabase db reset`
Expected: All migrations apply without error

**Step 4: Commit**

```bash
git add apps/web/src/app/api/cases/*/inject-tasks/route.ts supabase/migrations/20260405000001_pi_tort_claims_injection.sql
git commit -m "feat(pi): add task injection API and Tort Claims deadline for government entities"
```

---

## Task 5: Create `pi_tort_claims_notice` guided step config

**Files:**
- Create: `packages/shared/src/guided-steps/personal-injury/pi-tort-claims-notice.ts`

**Step 1: Create the config**

```typescript
import type { GuidedStepConfig } from '../types'

export const piTortClaimsNoticeConfig: GuidedStepConfig = {
  title: 'Draft & Send Tort Claims Notice',
  reassurance:
    'Texas law requires a written notice to the government entity before you can file a lawsuit. This step helps you draft and send that notice correctly.',
  questions: [
    {
      id: 'tort_claims_overview',
      type: 'info' as const,
      prompt:
        '📋 What Is a Tort Claims Notice?\n\nUnder the Texas Tort Claims Act, you must send written notice to the government entity before filing suit. This notice must describe:\n\n• The date, time, and place of the incident\n• How the injury occurred\n• The injuries or damages you suffered\n• The amount of damages you are claiming\n\nThe notice must be sent to the correct person — which depends on the type of government entity.',
    },
    {
      id: 'notice_recipient_info',
      type: 'info' as const,
      prompt:
        '📬 Who to Send the Notice To\n\n• **City:** City Secretary or City Manager\n• **County:** County Judge\n• **State Agency:** Texas Attorney General (P.O. Box 12548, Austin, TX 78711-2548)\n• **School District:** Superintendent\n\nYou can usually find the correct contact on the entity\'s official website.',
    },
    {
      id: 'recipient_name',
      type: 'text' as const,
      prompt: 'What is the name and title of the person you are sending the notice to?',
      placeholder: 'e.g., John Smith, City Secretary',
    },
    {
      id: 'recipient_address',
      type: 'text' as const,
      prompt: 'What is the mailing address for the notice?',
      placeholder: 'Full mailing address including city, state, ZIP',
    },
    {
      id: 'incident_date_confirm',
      type: 'text' as const,
      prompt: 'Confirm the date of the incident (YYYY-MM-DD):',
      placeholder: 'YYYY-MM-DD',
    },
    {
      id: 'incident_time',
      type: 'text' as const,
      prompt: 'What time did the incident occur (approximate)?',
      placeholder: 'e.g., 2:30 PM',
    },
    {
      id: 'incident_location',
      type: 'text' as const,
      prompt: 'Where exactly did the incident happen?',
      placeholder: 'Specific address or location description',
    },
    {
      id: 'how_injury_occurred',
      type: 'text' as const,
      prompt: 'Describe how the injury occurred. Include what the government entity or its employee did or failed to do.',
      placeholder: 'Describe the incident and the government entity\'s role...',
    },
    {
      id: 'injuries_sustained',
      type: 'text' as const,
      prompt: 'Describe the injuries or damages you suffered.',
      placeholder: 'List your injuries, medical treatment needed, and any property damage...',
    },
    {
      id: 'damages_amount',
      type: 'text' as const,
      prompt: 'What is the approximate total amount of damages you are claiming? (You can update this later — an approximate amount is acceptable at this stage.)',
      placeholder: 'e.g., $50,000',
    },
    {
      id: 'local_deadline_warning',
      type: 'info' as const,
      prompt:
        '⚠️ Local Deadline Warning\n\nSome cities have shorter notice deadlines than the 6-month state default:\n\n• **Austin:** 45 days\n• **Houston:** 90 days\n• **Dallas:** 90 days\n• **San Antonio:** 90 days\n\nCheck your city\'s charter or ordinances for the specific deadline. When in doubt, send the notice as soon as possible.',
    },
    {
      id: 'delivery_method',
      type: 'single_choice' as const,
      prompt: 'How will you send the notice?',
      options: [
        { value: 'certified_mail', label: 'Certified mail, return receipt requested (recommended)' },
        { value: 'hand_delivery', label: 'Hand delivery with signed acknowledgment' },
        { value: 'both', label: 'Both certified mail and hand delivery' },
      ],
    },
    {
      id: 'delivery_instructions',
      type: 'info' as const,
      prompt:
        '📮 Delivery Instructions\n\n**Certified Mail (Recommended):**\n1. Go to USPS and send via Certified Mail with Return Receipt Requested\n2. Keep the certified mail receipt (green card) — this is your proof of delivery\n3. Save the tracking number\n\n**Hand Delivery:**\n1. Deliver in person to the recipient\'s office\n2. Ask them to sign and date a copy acknowledging receipt\n3. Keep the signed copy\n\nProof of delivery is critical — without it, the government entity can claim they never received your notice.',
    },
  ],
  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    items.push({
      status: answers.recipient_name && answers.recipient_address ? 'done' : 'needed',
      text: `Recipient: ${answers.recipient_name || 'Not yet identified'}`,
    })
    items.push({
      status: answers.how_injury_occurred ? 'done' : 'needed',
      text: 'Incident description provided',
    })
    items.push({
      status: answers.injuries_sustained ? 'done' : 'needed',
      text: 'Injuries/damages described',
    })
    items.push({
      status: answers.damages_amount ? 'done' : 'needed',
      text: `Damages claimed: ${answers.damages_amount || 'Not specified'}`,
    })
    items.push({
      status: answers.delivery_method ? 'done' : 'needed',
      text: `Delivery method: ${answers.delivery_method === 'certified_mail' ? 'Certified mail' : answers.delivery_method === 'hand_delivery' ? 'Hand delivery' : answers.delivery_method === 'both' ? 'Both methods' : 'Not selected'}`,
    })
    items.push({
      status: 'info',
      text: '⚠️ Send this notice as soon as possible — your deadline is firm',
    })

    return items
  },
}
```

**Step 2: Verify build**

Run: `cd "/Users/minwang/lawyer free" && npx turbo typecheck --filter=@lawyer-free/shared`
Expected: PASS

**Step 3: Commit**

```bash
git add packages/shared/src/guided-steps/personal-injury/pi-tort-claims-notice.ts
git commit -m "feat(pi): add Tort Claims notice guided step config"
```

---

## Task 6: Create `pi_tort_claims_tracking` guided step config

**Files:**
- Create: `packages/shared/src/guided-steps/personal-injury/pi-tort-claims-tracking.ts`

**Step 1: Create the config**

```typescript
import type { GuidedStepConfig } from '../types'

export const piTortClaimsTrackingConfig: GuidedStepConfig = {
  title: 'Track Tort Claims Notice Response',
  reassurance:
    'Now that your notice is sent, we need to track the delivery and wait for the government entity\'s response. This step keeps you organized while you wait.',
  questions: [
    {
      id: 'tracking_overview',
      type: 'info' as const,
      prompt:
        '📬 What Happens Next\n\nAfter sending your Tort Claims notice, the government entity has time to respond. They may:\n\n• **Accept liability** and offer a settlement\n• **Deny your claim** in writing\n• **Ignore your notice** entirely\n\nIf they deny or ignore your notice, you may proceed with filing your lawsuit after the response window closes.',
    },
    {
      id: 'date_mailed',
      type: 'text' as const,
      prompt: 'What date did you mail or deliver the notice?',
      placeholder: 'YYYY-MM-DD',
    },
    {
      id: 'tracking_number',
      type: 'text' as const,
      prompt: 'What is the certified mail tracking number? (Leave blank if hand-delivered)',
      placeholder: 'USPS tracking number',
    },
    {
      id: 'return_receipt_received',
      type: 'yes_no' as const,
      prompt: 'Have you received the return receipt (green card) confirming delivery?',
    },
    {
      id: 'return_receipt_date',
      type: 'text' as const,
      prompt: 'What date was the notice received (per the return receipt)?',
      placeholder: 'YYYY-MM-DD',
      showIf: (answers: Record<string, string>) => answers.return_receipt_received === 'yes',
    },
    {
      id: 'response_window_info',
      type: 'info' as const,
      prompt:
        '⏳ Response Window\n\nThe government entity generally has 90 days to respond to your notice. After this window closes without a satisfactory response, you may proceed with filing your petition.\n\nDuring this waiting period:\n• Continue gathering medical records and evidence\n• Track your ongoing medical treatment and expenses\n• Do not discuss your case publicly',
      showIf: (answers: Record<string, string>) => answers.return_receipt_received === 'yes',
    },
    {
      id: 'entity_response',
      type: 'single_choice' as const,
      prompt: 'Has the government entity responded?',
      options: [
        { value: 'not_yet', label: 'Not yet — still waiting' },
        { value: 'accepted', label: 'They accepted liability / offered settlement' },
        { value: 'denied', label: 'They denied the claim' },
        { value: 'ignored', label: 'Response window passed with no response' },
      ],
      showIf: (answers: Record<string, string>) => answers.return_receipt_received === 'yes',
    },
    {
      id: 'response_accepted_info',
      type: 'info' as const,
      prompt:
        '✅ Settlement Offer\n\nThe government entity has offered to settle. Before accepting:\n• Ensure you have reached Maximum Medical Improvement (MMI)\n• Calculate your full damages (past and future)\n• Consider consulting with an attorney before accepting\n• Remember: once you accept, you cannot reopen the claim',
      showIf: (answers: Record<string, string>) => answers.entity_response === 'accepted',
    },
    {
      id: 'response_denied_info',
      type: 'info' as const,
      prompt:
        '➡️ Claim Denied\n\nThe government entity denied your claim. You may now proceed with filing your petition in court. The next task will guide you through preparing your petition — it will include special language required for Tort Claims Act cases.\n\nKeep the denial letter as evidence.',
      showIf: (answers: Record<string, string>) => answers.entity_response === 'denied' || answers.entity_response === 'ignored',
    },
  ],
  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    items.push({
      status: answers.date_mailed ? 'done' : 'needed',
      text: `Notice sent: ${answers.date_mailed || 'Date not recorded'}`,
    })
    items.push({
      status: answers.return_receipt_received === 'yes' ? 'done' : 'needed',
      text: answers.return_receipt_received === 'yes'
        ? `Delivery confirmed: ${answers.return_receipt_date || 'Date recorded'}`
        : 'Awaiting delivery confirmation (return receipt)',
    })

    if (answers.entity_response === 'accepted') {
      items.push({ status: 'info', text: '💡 Settlement offered — review carefully before accepting' })
    } else if (answers.entity_response === 'denied' || answers.entity_response === 'ignored') {
      items.push({ status: 'done', text: 'Response window complete — ready to file petition' })
    } else if (answers.return_receipt_received === 'yes') {
      items.push({ status: 'info', text: '⏳ Waiting for government entity response (90-day window)' })
    }

    return items
  },
}
```

**Step 2: Verify build**

Run: `cd "/Users/minwang/lawyer free" && npx turbo typecheck --filter=@lawyer-free/shared`
Expected: PASS

**Step 3: Commit**

```bash
git add packages/shared/src/guided-steps/personal-injury/pi-tort-claims-tracking.ts
git commit -m "feat(pi): add Tort Claims tracking guided step config"
```

---

## Task 7: Wire Tort Claims step components and page routing

**Files:**
- Create: `apps/web/src/components/step/personal-injury/pi-tort-claims-notice-step.tsx`
- Create: `apps/web/src/components/step/personal-injury/pi-tort-claims-tracking-step.tsx`
- Modify: `apps/web/src/app/(authenticated)/case/[id]/step/[taskId]/page.tsx`

**Step 1: Create notice step component**

```typescript
'use client'

import { GuidedStep } from '../guided-step'
import { piTortClaimsNoticeConfig } from '@lawyer-free/shared/guided-steps/personal-injury/pi-tort-claims-notice'

interface PITortClaimsNoticeStepProps {
  caseId: string
  taskId: string
  existingAnswers?: Record<string, string>
}

export function PITortClaimsNoticeStep({
  caseId,
  taskId,
  existingAnswers,
}: PITortClaimsNoticeStepProps) {
  return (
    <GuidedStep
      caseId={caseId}
      taskId={taskId}
      config={piTortClaimsNoticeConfig}
      existingAnswers={existingAnswers}
    />
  )
}
```

**Step 2: Create tracking step component**

```typescript
'use client'

import { GuidedStep } from '../guided-step'
import { piTortClaimsTrackingConfig } from '@lawyer-free/shared/guided-steps/personal-injury/pi-tort-claims-tracking'

interface PITortClaimsTrackingStepProps {
  caseId: string
  taskId: string
  existingAnswers?: Record<string, string>
}

export function PITortClaimsTrackingStep({
  caseId,
  taskId,
  existingAnswers,
}: PITortClaimsTrackingStepProps) {
  return (
    <GuidedStep
      caseId={caseId}
      taskId={taskId}
      config={piTortClaimsTrackingConfig}
      existingAnswers={existingAnswers}
    />
  )
}
```

**Step 3: Add routing in page.tsx**

Add to the PI depth steps section (around line 1196-1213) in `apps/web/src/app/(authenticated)/case/[id]/step/[taskId]/page.tsx`:

```typescript
// Import at top of file
import { piTortClaimsNoticeConfig } from '@lawyer-free/shared/guided-steps/personal-injury/pi-tort-claims-notice'
import { piTortClaimsTrackingConfig } from '@lawyer-free/shared/guided-steps/personal-injury/pi-tort-claims-tracking'
```

Add to the switch/if chain for PI task routing:

```typescript
if (task.task_key === 'pi_tort_claims_notice') {
  return (
    <GuidedStep
      caseId={caseId}
      taskId={taskId}
      config={piTortClaimsNoticeConfig}
      existingAnswers={task.metadata?.guided_answers as Record<string, string>}
    />
  )
}

if (task.task_key === 'pi_tort_claims_tracking') {
  return (
    <GuidedStep
      caseId={caseId}
      taskId={taskId}
      config={piTortClaimsTrackingConfig}
      existingAnswers={task.metadata?.guided_answers as Record<string, string>}
    />
  )
}
```

**Step 4: Add unlock trigger for Tort Claims tasks**

Create migration: `supabase/migrations/20260405000002_pi_tort_claims_unlock.sql`

```sql
-- Unlock chain for injected Tort Claims tasks
-- pi_tort_claims_notice (unlocked at injection) -> pi_tort_claims_tracking -> pi_medical_records

CREATE OR REPLACE FUNCTION public.unlock_pi_tort_claims_tasks()
RETURNS TRIGGER AS $$
DECLARE
  v_dispute_type text;
  v_response_date timestamptz;
BEGIN
  SELECT dispute_type INTO v_dispute_type FROM public.cases WHERE id = NEW.case_id;
  IF v_dispute_type != 'personal_injury' THEN RETURN NEW; END IF;

  -- After Tort Claims notice: unlock tracking
  IF NEW.task_key = 'pi_tort_claims_notice' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'pi_tort_claims_tracking' AND status = 'locked';

    -- Create 90-day response window deadline if return receipt date is available
    v_response_date := COALESCE(
      (NEW.metadata->'guided_answers'->>'return_receipt_date')::timestamptz,
      now()
    ) + interval '90 days';

    INSERT INTO public.deadlines (case_id, key, due_at, source, rationale, label, consequence, auto_generated)
    VALUES (
      NEW.case_id,
      'tort_claims_response_window',
      v_response_date,
      'system',
      'Government entity has 90 days from receipt of notice to respond.',
      'Tort Claims Response Window',
      'After this date passes without response, you may proceed with filing your petition.',
      true
    )
    ON CONFLICT DO NOTHING;
  END IF;

  -- After Tort Claims tracking complete: ensure medical records is unlocked
  IF NEW.task_key = 'pi_tort_claims_tracking' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'pi_medical_records' AND status = 'locked';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS unlock_pi_tort_claims_trigger ON public.tasks;
CREATE TRIGGER unlock_pi_tort_claims_trigger
  AFTER UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.unlock_pi_tort_claims_tasks();
```

**Step 5: Verify build**

Run: `cd "/Users/minwang/lawyer free" && npx turbo typecheck --filter=@lawyer-free/web`
Expected: PASS

**Step 6: Commit**

```bash
git add apps/web/src/components/step/personal-injury/pi-tort-claims-notice-step.tsx apps/web/src/components/step/personal-injury/pi-tort-claims-tracking-step.tsx apps/web/src/app/\(authenticated\)/case/\[id\]/step/\[taskId\]/page.tsx supabase/migrations/20260405000002_pi_tort_claims_unlock.sql
git commit -m "feat(pi): wire Tort Claims step components, page routing, and unlock trigger"
```

---

## Task 8: Enhance `pi_medical_records` — Hospital lien detection

**Files:**
- Modify: `packages/shared/src/guided-steps/personal-injury/pi-medical-records.ts`

**Step 1: Add hospital lien questions**

Add these questions after the existing medical provider questions in the `questions` array:

```typescript
// --- Hospital Lien Detection ---
{
  id: 'lien_section_header',
  type: 'info' as const,
  prompt: '🏥 Hospital Lien Check\n\nTexas law (Property Code Chapter 55) allows hospitals to file a lien against your personal injury settlement. If a lien exists, it must be paid from your settlement before you receive any money.',
},
{
  id: 'hospital_admitted_72h',
  type: 'yes_no' as const,
  prompt: 'Were you admitted to a hospital (not just an ER visit and release) within 72 hours of the incident?',
  helpText: 'Hospital admission means you were formally admitted as an inpatient, not just treated and released from the emergency room.',
},
{
  id: 'lien_check_guidance',
  type: 'info' as const,
  prompt: '📋 How to Check for Hospital Liens\n\nContact the county clerk in the county where you received treatment and ask if a hospital lien has been filed under your name. You can also check online — many Texas counties have searchable lien records.\n\nThe hospital must have filed the lien to enforce it. If no lien was filed, you are not bound by it.',
  showIf: (answers: Record<string, string>) => answers.hospital_admitted_72h === 'yes',
},
{
  id: 'lien_filed',
  type: 'yes_no' as const,
  prompt: 'Have you found a hospital lien filed against you?',
  showIf: (answers: Record<string, string>) => answers.hospital_admitted_72h === 'yes',
},
{
  id: 'lien_hospital_name',
  type: 'text' as const,
  prompt: 'What is the name of the hospital that filed the lien?',
  placeholder: 'Hospital name',
  showIf: (answers: Record<string, string>) => answers.lien_filed === 'yes',
},
{
  id: 'lien_amount',
  type: 'text' as const,
  prompt: 'What is the lien amount (if known)?',
  placeholder: 'e.g., $15,000',
  showIf: (answers: Record<string, string>) => answers.lien_filed === 'yes',
},
{
  id: 'lien_county',
  type: 'text' as const,
  prompt: 'In what county was the lien filed?',
  placeholder: 'County name',
  showIf: (answers: Record<string, string>) => answers.lien_filed === 'yes',
},
{
  id: 'lien_cap_info',
  type: 'info' as const,
  prompt: '💡 Lien Amount Cap\n\nGood news: Texas law caps hospital liens. The hospital can only recover the lesser of:\n\n• Total charges for the first 100 days of hospitalization, OR\n• 50% of your total settlement/judgment amount\n\nAlso, hospital liens do NOT attach to:\n• UM/UIM (uninsured/underinsured motorist) benefits\n• PIP (Personal Injury Protection) benefits\n• Med-Pay benefits',
  showIf: (answers: Record<string, string>) => answers.lien_filed === 'yes',
},
// --- Medical Authorization Warning ---
{
  id: 'medical_auth_warning',
  type: 'info' as const,
  prompt: '🚫 DON\'T Sign Blanket Medical Authorizations\n\nThe insurance company may ask you to sign a broad medical authorization giving them access to your entire medical history. DON\'T do this.\n\n✅ DO: Only authorize release of records directly related to this injury.\n❌ DON\'T: Sign anything that gives them access to unrelated medical history.\n\nThey want to find pre-existing conditions to reduce your claim.',
},
```

**Step 2: Update `generateSummary` to include lien info**

```typescript
// Hospital lien
if (answers.hospital_admitted_72h === 'yes') {
  if (answers.lien_filed === 'yes') {
    items.push({
      status: answers.lien_hospital_name ? 'done' : 'needed',
      text: `Hospital lien: ${answers.lien_hospital_name || 'Hospital name needed'} — ${answers.lien_amount || 'Amount unknown'}`,
    })
    items.push({
      status: 'info',
      text: '⚠️ Lien must be satisfied before distributing any settlement',
    })
  } else if (answers.lien_filed === 'no') {
    items.push({ status: 'done', text: 'Hospital lien check complete — no lien found' })
  } else {
    items.push({ status: 'needed', text: 'Hospital lien check needed — contact county clerk' })
  }
}
```

**Step 3: Verify build**

Run: `cd "/Users/minwang/lawyer free" && npx turbo typecheck --filter=@lawyer-free/shared`
Expected: PASS

**Step 4: Commit**

```bash
git add packages/shared/src/guided-steps/personal-injury/pi-medical-records.ts
git commit -m "feat(pi): add hospital lien detection and medical authorization warning to medical records step"
```

---

## Task 9: Enhance `pi_insurance_communication` — Tactics playbook + UM/UIM

**Files:**
- Modify: `packages/shared/src/guided-steps/personal-injury/pi-insurance-communication.ts`

**Step 1: Add insurance playbook questions at the beginning of the questions array**

```typescript
// --- Insurance Playbook ---
{
  id: 'playbook_header',
  type: 'info' as const,
  prompt: '🛡️ Know Before You Talk — Insurance Playbook\n\nBefore communicating with any insurance company, read these critical DO/DON\'T rules. Insurance companies are not on your side — they are businesses trying to minimize what they pay.',
},
{
  id: 'playbook_recorded_statements',
  type: 'info' as const,
  prompt: '🎙️ Recorded Statements\n\n❌ DON\'T agree to a recorded statement from the other driver\'s insurance company. You are NOT legally required to give one. Anything you say can and will be used to reduce your claim.\n\n✅ DO keep written notes of every conversation — date, time, who you spoke with, and what was discussed.',
},
{
  id: 'playbook_early_offers',
  type: 'info' as const,
  prompt: '💰 Early Settlement Offers\n\n❌ DON\'T accept the first offer. It is almost always far below the fair value of your claim. The adjuster is testing whether you know what your case is worth.\n\n✅ DO wait until you have reached Maximum Medical Improvement (MMI) — the point where your doctor says your condition will not improve further. Settling before MMI means you cannot account for future treatment costs.',
},
{
  id: 'playbook_authorizations',
  type: 'info' as const,
  prompt: '📋 Blanket Authorizations\n\n❌ DON\'T sign blanket medical or employment record authorizations. The insurer wants access to your entire history to find pre-existing conditions or unrelated issues.\n\n✅ DO only provide records directly related to this incident. You control what they see.',
},
{
  id: 'playbook_surveillance',
  type: 'info' as const,
  prompt: '📷 Surveillance\n\n✅ DO be aware that insurance companies may hire investigators to photograph or video you if your claim is significant. Anything inconsistent with your claimed injuries can be used against you.\n\n✅ DO be honest about your limitations — don\'t exaggerate, but don\'t push through pain for appearances either.',
},
{
  id: 'playbook_social_media',
  type: 'info' as const,
  prompt: '📱 Social Media\n\n❌ DON\'T post about your case, your injuries, or your activities on social media. Insurance companies and defense attorneys routinely monitor and screenshot plaintiff social media accounts.\n\n✅ DO set all profiles to private and avoid posting until your case is resolved.',
},
{
  id: 'playbook_acknowledged',
  type: 'yes_no' as const,
  prompt: 'I have read and understand the insurance playbook above.',
},
```

**Step 2: Add UM/UIM section (conditional on motor vehicle sub-types)**

This requires checking the PI sub-type. Since guided step configs receive answers but not case metadata, we'll use a different approach: add UM/UIM questions that are always present but use `showIf` based on a question asked earlier in the flow.

Add after playbook section:

```typescript
// --- UM/UIM Guidance ---
{
  id: 'uim_section_header',
  type: 'info' as const,
  prompt: '🚗 You May Have More Coverage Than You Think\n\nIf the at-fault driver has no insurance or not enough insurance, your own auto policy may cover you through Uninsured/Underinsured Motorist (UM/UIM) coverage.\n\nImportant: Under Texas Insurance Code §1952.101, if you did not reject UM/UIM coverage in writing, you have it by law — even if it is not listed on your policy declarations page.',
},
{
  id: 'at_fault_has_insurance',
  type: 'single_choice' as const,
  prompt: 'Does the at-fault driver have insurance?',
  options: [
    { value: 'yes', label: 'Yes — they have insurance' },
    { value: 'no', label: 'No — they are uninsured' },
    { value: 'unknown', label: 'I don\'t know yet' },
    { value: 'not_vehicle', label: 'This is not a motor vehicle case' },
  ],
},
{
  id: 'coverage_sufficient',
  type: 'single_choice' as const,
  prompt: 'Is their insurance coverage enough to cover your damages?',
  options: [
    { value: 'yes', label: 'Yes — their coverage seems sufficient' },
    { value: 'no', label: 'No — their limits are too low' },
    { value: 'unknown', label: 'I don\'t know their coverage limits' },
  ],
  showIf: (answers: Record<string, string>) => answers.at_fault_has_insurance === 'yes',
},
{
  id: 'uim_guidance',
  type: 'info' as const,
  prompt: '📋 File a UM/UIM Claim With Your Own Insurer\n\nSince the at-fault driver has no insurance or insufficient coverage, you should file a UM/UIM claim with your own auto insurer.\n\nSteps:\n1. Find your auto insurance policy declarations page\n2. Look for "Uninsured Motorist" or "Underinsured Motorist" coverage and limits\n3. Call your insurer and report the claim\n4. ⚠️ Most policies require you to notify your insurer within 30 days\n\nDo NOT give your own insurer a recorded statement without preparation — the same rules apply.',
  showIf: (answers: Record<string, string>) =>
    answers.at_fault_has_insurance === 'no' ||
    answers.at_fault_has_insurance === 'unknown' ||
    answers.coverage_sufficient === 'no' ||
    answers.coverage_sufficient === 'unknown',
},
{
  id: 'uim_insurer_name',
  type: 'text' as const,
  prompt: 'What is your auto insurance company name?',
  placeholder: 'e.g., State Farm, GEICO, Progressive',
  showIf: (answers: Record<string, string>) =>
    answers.at_fault_has_insurance === 'no' ||
    answers.at_fault_has_insurance === 'unknown' ||
    answers.coverage_sufficient === 'no' ||
    answers.coverage_sufficient === 'unknown',
},
{
  id: 'uim_policy_number',
  type: 'text' as const,
  prompt: 'What is your policy number?',
  placeholder: 'Policy number from declarations page',
  showIf: (answers: Record<string, string>) =>
    answers.at_fault_has_insurance === 'no' ||
    answers.at_fault_has_insurance === 'unknown' ||
    answers.coverage_sufficient === 'no' ||
    answers.coverage_sufficient === 'unknown',
},
{
  id: 'uim_limits',
  type: 'text' as const,
  prompt: 'What are your UM/UIM coverage limits (if you can find them)?',
  placeholder: 'e.g., $30,000/$60,000',
  showIf: (answers: Record<string, string>) =>
    answers.at_fault_has_insurance === 'no' ||
    answers.at_fault_has_insurance === 'unknown' ||
    answers.coverage_sufficient === 'no' ||
    answers.coverage_sufficient === 'unknown',
},
{
  id: 'uim_notice_reminder',
  type: 'info' as const,
  prompt: '⏰ 30-Day Notice Deadline\n\nMost UM/UIM policies require you to notify your insurer within 30 days of the accident. We will track this deadline for you. File the claim as soon as possible.',
  showIf: (answers: Record<string, string>) =>
    answers.at_fault_has_insurance === 'no' ||
    answers.at_fault_has_insurance === 'unknown' ||
    answers.coverage_sufficient === 'no' ||
    answers.coverage_sufficient === 'unknown',
},
```

**Step 3: Update `generateSummary` with playbook and UM/UIM status**

```typescript
// Playbook
items.push({
  status: answers.playbook_acknowledged === 'yes' ? 'done' : 'needed',
  text: 'Insurance playbook reviewed',
})

// UM/UIM
const needsUim = answers.at_fault_has_insurance === 'no' ||
  answers.at_fault_has_insurance === 'unknown' ||
  answers.coverage_sufficient === 'no' ||
  answers.coverage_sufficient === 'unknown'

if (needsUim) {
  items.push({
    status: answers.uim_insurer_name ? 'done' : 'needed',
    text: `UM/UIM insurer: ${answers.uim_insurer_name || 'Not yet provided'}`,
  })
  items.push({
    status: 'info',
    text: '⏰ Notify your insurer within 30 days — deadline will be tracked',
  })
}
```

**Step 4: Verify build**

Run: `cd "/Users/minwang/lawyer free" && npx turbo typecheck --filter=@lawyer-free/shared`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/shared/src/guided-steps/personal-injury/pi-insurance-communication.ts
git commit -m "feat(pi): add insurance tactics playbook and UM/UIM guidance to insurance communication step"
```

---

## Task 10: Add UM/UIM deadline rule

**Files:**
- Modify: `packages/shared/src/rules/deadline-rules.ts`

**Step 1: Add UM/UIM deadline to `buildDisputeSpecificRules()`**

Add to the array returned by `buildDisputeSpecificRules()`:

```typescript
{
  trigger_task: 'pi_insurance_communication',
  deadline_key: 'um_uim_notice_30day',
  deadline_label: 'UM/UIM Insurer Notification Deadline',
  offset_days: 30,
  reference: 'task_completed_at' as const,
  apply_rule_4: false,
  consequence: 'Most UM/UIM policies require notification within 30 days. Failure to notify your insurer in time may jeopardize your UM/UIM claim.',
  // Only generate if UM/UIM is applicable — check metadata
  condition_metadata_field: 'guided_answers.at_fault_has_insurance',
  condition_metadata_values: ['no', 'unknown'],
},
```

Note: If the `condition_metadata_field` / `condition_metadata_values` pattern doesn't exist yet in the `DeadlineRule` interface, we need to add it:

```typescript
export interface DeadlineRule {
  // ... existing fields ...
  condition_metadata_field?: string    // dot-notation path in task metadata
  condition_metadata_values?: string[] // deadline only created if field value is in this array
}
```

And update `autoGenerateDeadlines` (or wherever deadlines are created) to check the condition before inserting.

**Step 2: Verify build**

Run: `cd "/Users/minwang/lawyer free" && npx turbo typecheck --filter=@lawyer-free/shared`
Expected: PASS

**Step 3: Commit**

```bash
git add packages/shared/src/rules/deadline-rules.ts
git commit -m "feat(pi): add conditional UM/UIM 30-day notice deadline rule"
```

---

## Task 11: Enhance `prepare_pi_petition` — Guided petition builder

**Files:**
- Modify: `apps/web/src/components/step/personal-injury-wizard.tsx`

This is the largest change. The existing wizard already has a multi-step form. We need to add sections for:
- Relief level selection (TRCP 47(c))
- Discovery control plan (auto-selected based on relief level)
- Venue analysis
- Cause of action elements (with pre-filled duty based on sub-type)
- Damages checklist
- Jury demand
- AI petition generation

**Step 1: Add relief level state and form section**

Add state after existing state variables:

```typescript
// Petition builder — new fields
const [reliefLevel, setReliefLevel] = useState(
  (meta.relief_level as string) ?? ''
)
const [venueCounty, setVenueCounty] = useState(
  (meta.venue_county as string) ?? ''
)
const [venueBasis, setVenueBasis] = useState(
  (meta.venue_basis as string) ?? ''
)
const [defendantCounty, setDefendantCounty] = useState(
  (meta.defendant_county as string) ?? ''
)
const [juryDemand, setJuryDemand] = useState(
  (meta.jury_demand as string) ?? ''
)
// Cause of action
const [duty, setDuty] = useState(
  (meta.cause_duty as string) ?? getDefaultDuty(piSubType)
)
const [breach, setBreach] = useState(
  (meta.cause_breach as string) ?? ''
)
const [causation, setCausation] = useState(
  (meta.cause_causation as string) ?? ''
)
// Damages checklist
const [pastMedical, setPastMedical] = useState((meta.damages_past_medical as string) ?? '')
const [futureMedical, setFutureMedical] = useState((meta.damages_future_medical as string) ?? '')
const [pastLostWages, setPastLostWages] = useState((meta.damages_past_lost_wages as string) ?? '')
const [futureLostEarning, setFutureLostEarning] = useState((meta.damages_future_lost_earning as string) ?? '')
const [painSuffering, setPainSuffering] = useState((meta.damages_pain_suffering as boolean) ?? false)
const [mentalAnguish, setMentalAnguish] = useState((meta.damages_mental_anguish as boolean) ?? false)
const [physicalImpairment, setPhysicalImpairment] = useState((meta.damages_physical_impairment as boolean) ?? false)
const [disfigurement, setDisfigurement] = useState((meta.damages_disfigurement as boolean) ?? false)
```

**Step 2: Add helper function for default duty by sub-type**

```typescript
function getDefaultDuty(subType?: string): string {
  switch (subType) {
    case 'auto_accident':
    case 'pedestrian_cyclist':
    case 'rideshare':
    case 'uninsured_motorist':
      return 'Defendant owed a duty to operate their motor vehicle in a safe and prudent manner, obeying all traffic laws and exercising ordinary care.'
    case 'slip_and_fall':
      return 'Defendant owed a duty to maintain their premises in a reasonably safe condition and to warn of known hazards.'
    case 'dog_bite':
      return 'Defendant owed a duty to control their animal and prevent it from causing harm to others.'
    case 'product_liability':
      return 'Defendant owed a duty to design, manufacture, and market a product that was reasonably safe for its intended use.'
    default:
      return 'Defendant owed a duty of ordinary care to prevent harm to others.'
  }
}
```

**Step 3: Add new wizard steps to the step array**

Add these steps to the wizard's step configuration array (after existing steps, before the final review/submit step):

- "Relief Level" step — radio buttons for $250K or less / $250K–$1M / over $1M, with explanations
- "Venue" step — county inputs with recommendation logic
- "Cause of Action" step — duty (pre-filled, editable), breach (textarea), causation (textarea)
- "Damages" step — dollar inputs for economic damages, checkboxes for non-economic
- "Jury Demand" step — yes/no with explanation

**Step 4: Update `buildMetadata()` with new fields**

```typescript
// Add to metadata object
relief_level: reliefLevel || null,
discovery_level: reliefLevel === '250k_or_less' ? 1 : 2,
venue_county: venueCounty || null,
venue_basis: venueBasis || null,
defendant_county: defendantCounty || null,
jury_demand: juryDemand === 'yes',
cause_duty: duty || null,
cause_breach: breach.trim() || null,
cause_causation: causation.trim() || null,
damages_past_medical: pastMedical || null,
damages_future_medical: futureMedical || null,
damages_past_lost_wages: pastLostWages || null,
damages_future_lost_earning: futureLostEarning || null,
damages_pain_suffering: painSuffering,
damages_mental_anguish: mentalAnguish,
damages_physical_impairment: physicalImpairment,
damages_disfigurement: disfigurement,
```

**Step 5: Verify build**

Run: `cd "/Users/minwang/lawyer free" && npx turbo typecheck --filter=@lawyer-free/web`
Expected: PASS

**Step 6: Commit**

```bash
git add apps/web/src/components/step/personal-injury-wizard.tsx
git commit -m "feat(pi): add relief level, venue analysis, cause of action, damages, and jury demand to petition wizard"
```

---

## Task 12: Add AI petition generation to the wizard

**Files:**
- Modify: `packages/shared/src/rules/pi-petition-prompts.ts`
- Modify: `apps/web/src/components/step/personal-injury-wizard.tsx`

**Step 1: Update petition prompt to use new structured fields**

Update `buildStateSystemPrompt()` in `pi-petition-prompts.ts` to include instructions for:
- Discovery control plan in first paragraph (TRCP 190.1)
- Relief level statement (TRCP 47(c))
- Venue with statutory citation (CPRC §15.002)
- Structured damages section (itemized from metadata)
- Jury demand paragraph (if selected)
- Government entity / Tort Claims Act language (if applicable)

Add to the system prompt:

```typescript
// Add after existing prompt content
const discoveryPlanInstruction = `
CRITICAL — FIRST PARAGRAPH REQUIREMENT (TRCP 190.1):
The very first numbered paragraph of the petition MUST state the discovery control plan level.
- If relief level is $250,000 or less: "Plaintiff intends that discovery be conducted under Level 1 of Rule 190 of the Texas Rules of Civil Procedure."
- Otherwise: "Plaintiff intends that discovery be conducted under Level 2 of Rule 190 of the Texas Rules of Civil Procedure."

TRCP 47(c) RELIEF LEVEL STATEMENT — REQUIRED:
The petition must include one of these statements:
- "$250,000 or less": "Plaintiff seeks only monetary relief of $250,000 or less, excluding interest, statutory or punitive damages, penalties, attorney's fees, and costs."
- "$250,001 to $1,000,000": "Plaintiff seeks monetary relief over $250,000 but not more than $1,000,000."
- "Over $1,000,000": "Plaintiff seeks monetary relief over $1,000,000."

Failure to include this statement bars the party from conducting discovery until the pleading is amended.
`
```

**Step 2: Add "Generate Petition" button and preview to wizard**

In the final review step of the wizard, add a "Generate Petition Draft" button that:
1. Calls `POST /api/cases/[id]/petition-draft` with all metadata
2. Shows the generated petition in a preview panel
3. Allows editing
4. Allows regeneration of individual sections

This follows the same pattern as the existing demand letter generation in `PIDemandLetterStep`.

**Step 3: Verify build**

Run: `cd "/Users/minwang/lawyer free" && npx turbo typecheck --filter=@lawyer-free/shared --filter=@lawyer-free/web`
Expected: PASS

**Step 4: Commit**

```bash
git add packages/shared/src/rules/pi-petition-prompts.ts apps/web/src/components/step/personal-injury-wizard.tsx
git commit -m "feat(pi): add AI petition generation with TRCP 47(c) and 190.1 compliance"
```

---

## Task 13: Add lien warning to settlement/demand letter dashboard

**Files:**
- Modify: `apps/web/src/app/(authenticated)/case/[id]/focus-tab.tsx` (or wherever the dashboard cards render)

**Step 1: Add lien warning card**

Read the focus tab component to find where task-specific warnings are rendered. Add a conditional card:

```typescript
// Check if hospital lien exists in medical records task metadata
const medicalRecordsTask = tasks.find(t => t.task_key === 'pi_medical_records')
const hasHospitalLien = medicalRecordsTask?.metadata?.guided_answers?.lien_filed === 'yes'
const lienHospitalName = medicalRecordsTask?.metadata?.guided_answers?.lien_hospital_name
const lienAmount = medicalRecordsTask?.metadata?.guided_answers?.lien_amount

// Show warning when user is at settlement or demand letter stage
const currentTaskKey = nextTask?.task_key
const isSettlementPhase = currentTaskKey === 'pi_settlement_negotiation' || currentTaskKey === 'prepare_pi_demand_letter' || currentTaskKey === 'pi_post_resolution'

if (hasHospitalLien && isSettlementPhase) {
  // Render warning card with amber/destructive styling
  // "Hospital Lien Alert: You have a recorded lien of $X from [Hospital]. 
  //  You must satisfy this lien before distributing any settlement funds."
}
```

**Step 2: Verify build**

Run: `cd "/Users/minwang/lawyer free" && npx turbo typecheck --filter=@lawyer-free/web`
Expected: PASS

**Step 3: Commit**

```bash
git add apps/web/src/app/\(authenticated\)/case/\[id\]/focus-tab.tsx
git commit -m "feat(pi): add hospital lien warning card on dashboard during settlement phase"
```

---

## Task 14: End-to-end verification

**Step 1: Reset database and verify migrations**

```bash
cd "/Users/minwang/lawyer free" && npx supabase db reset
```
Expected: All migrations apply cleanly

**Step 2: Start dev server**

```bash
cd "/Users/minwang/lawyer free" && npx turbo dev --filter=@lawyer-free/web
```

**Step 3: Manual test — standard PI case (no government entity)**

1. Create a new PI case (auto_accident)
2. Complete `pi_intake` — answer NO to all government entity questions
3. Verify: no Tort Claims tasks injected, `pi_medical_records` unlocks normally
4. Complete `pi_medical_records` — answer YES to hospital admission, add lien data
5. Proceed to `pi_insurance_communication` — verify playbook shows, answer that at-fault driver has no insurance
6. Verify UM/UIM section appears, fill in insurer details
7. Verify 30-day UM/UIM deadline is created
8. Proceed to `prepare_pi_petition` — verify relief level, venue, cause of action, damages sections
9. Generate petition draft — verify TRCP 47(c) and 190.1 compliance
10. When reaching settlement phase — verify lien warning card appears

**Step 4: Manual test — government entity PI case**

1. Create a new PI case (slip_and_fall)
2. Complete `pi_intake` — answer YES to "government property"
3. Select entity type (city) and enter entity name
4. Verify: `pi_tort_claims_notice` and `pi_tort_claims_tracking` tasks appear
5. Verify: 6-month Tort Claims deadline is created
6. Complete the Tort Claims tasks
7. Verify: `pi_medical_records` unlocks after tracking completes

**Step 5: Verify typecheck passes**

```bash
cd "/Users/minwang/lawyer free" && npx turbo typecheck
```
Expected: PASS for all packages

**Step 6: Commit any fixes from testing**

```bash
git add -A
git commit -m "fix: address issues found during PI Phase 1 end-to-end testing"
```

---

## Summary

| Task | Description | Files Changed |
|------|-------------|---------------|
| 1 | Share MOTOR_VEHICLE_SUB_TYPES constant | 2 |
| 2 | Enhance pi_intake config (gov entity, SOL, 51% rule) | 1 |
| 3 | Enhance pi_intake component (metadata + injection call) | 1 |
| 4 | Create task injection API + SQL function | 2 |
| 5 | Create pi_tort_claims_notice config | 1 |
| 6 | Create pi_tort_claims_tracking config | 1 |
| 7 | Wire Tort Claims components + page routing + unlock trigger | 4 |
| 8 | Enhance pi_medical_records (lien detection) | 1 |
| 9 | Enhance pi_insurance_communication (playbook + UM/UIM) | 1 |
| 10 | Add UM/UIM deadline rule | 1 |
| 11 | Enhance petition wizard (relief level, venue, damages) | 1 |
| 12 | Add AI petition generation | 2 |
| 13 | Add lien warning to dashboard | 1 |
| 14 | End-to-end verification | 0 |

**Total: 14 tasks, ~19 files touched/created**
