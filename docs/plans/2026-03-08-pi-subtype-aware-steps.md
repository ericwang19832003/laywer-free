# PI Sub-Type-Aware Steps Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make personal injury guided steps sub-type-aware so property damage cases see property-damage-relevant content instead of injury-specific content (e.g., "Document Your Property Damage" instead of "Organize Your Medical Records").

**Architecture:** Reuse the existing pattern from `pi-intake-step.tsx` — pass `piSubType` to each PI step component and conditionally render different content. A helper constant `PROPERTY_DAMAGE_SUB_TYPES` is already defined; extract it to a shared location. Update the DB trigger to set appropriate titles at case creation time.

**Tech Stack:** Next.js 16 App Router, Supabase (PostgreSQL triggers), TypeScript, React 19

---

### Task 1: Extract shared `PROPERTY_DAMAGE_SUB_TYPES` constant

**Files:**
- Create: `src/lib/guided-steps/personal-injury/constants.ts`
- Modify: `src/components/step/personal-injury/pi-intake-step.tsx:8-13`

**Step 1: Create the shared constants file**

```typescript
// src/lib/guided-steps/personal-injury/constants.ts
import type { PiSubType } from '@/lib/schemas/case'

export const PROPERTY_DAMAGE_SUB_TYPES: PiSubType[] = [
  'vehicle_damage',
  'property_damage_negligence',
  'vandalism',
  'other_property_damage',
]

export function isPropertyDamageSubType(subType?: string): boolean {
  return PROPERTY_DAMAGE_SUB_TYPES.includes(subType as PiSubType)
}
```

**Step 2: Update pi-intake-step.tsx to import from shared constants**

In `src/components/step/personal-injury/pi-intake-step.tsx`, replace lines 8-13:

```typescript
// BEFORE:
const PROPERTY_DAMAGE_SUB_TYPES: PiSubType[] = [
  'vehicle_damage',
  'property_damage_negligence',
  'vandalism',
  'other_property_damage',
]

// AFTER:
import { PROPERTY_DAMAGE_SUB_TYPES } from '@/lib/guided-steps/personal-injury/constants'
```

Also remove the `PiSubType` import from `@/lib/schemas/case` if it was only used for the constant (check — it's also used on line 30 for the `as PiSubType` cast, so keep it).

**Step 3: Build to verify**

Run: `cd "/Users/minwang/lawyer free" && npx next build 2>&1 | tail -20`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/lib/guided-steps/personal-injury/constants.ts src/components/step/personal-injury/pi-intake-step.tsx
git commit -m "refactor: extract PROPERTY_DAMAGE_SUB_TYPES to shared constants"
```

---

### Task 2: Create property damage documentation step config

**Files:**
- Create: `src/lib/guided-steps/personal-injury/pi-damage-documentation.ts`

**Step 1: Create the property damage step config**

This replaces `piMedicalRecordsConfig` for property damage cases. Instead of medical records questions, it asks about repair estimates, contractor quotes, damage photos, appraisals, and a damage timeline.

```typescript
// src/lib/guided-steps/personal-injury/pi-damage-documentation.ts
import type { GuidedStepConfig } from '../types'

export const piDamageDocumentationConfig: GuidedStepConfig = {
  title: 'Document Your Property Damage',
  reassurance:
    'Thorough damage documentation strengthens your case and helps calculate your full losses.',

  questions: [
    {
      id: 'has_photos',
      type: 'yes_no',
      prompt: 'Do you have photos of the damage (before and after, if possible)?',
      helpText:
        'Photos taken immediately after the incident are the strongest evidence. Include wide shots and close-ups.',
    },
    {
      id: 'has_repair_estimate',
      type: 'single_choice',
      prompt: 'Do you have a professional repair estimate or appraisal?',
      helpText:
        'Get at least two written estimates from licensed contractors or repair shops.',
      options: [
        { value: 'multiple', label: 'Yes, two or more estimates' },
        { value: 'one', label: 'Yes, one estimate' },
        { value: 'none', label: 'Not yet' },
      ],
    },
    {
      id: 'estimate_tip',
      type: 'info',
      prompt:
        'Get at least two written estimates from licensed, reputable professionals. Written estimates carry more weight than verbal ones. Keep all receipts.',
      showIf: (answers) => answers.has_repair_estimate === 'none' || answers.has_repair_estimate === 'one',
    },
    {
      id: 'damage_type',
      type: 'single_choice',
      prompt: 'What type of property was damaged?',
      options: [
        { value: 'vehicle', label: 'Vehicle' },
        { value: 'home', label: 'Home or building' },
        { value: 'personal_property', label: 'Personal property (electronics, furniture, etc.)' },
        { value: 'multiple', label: 'Multiple types of property' },
      ],
    },
    {
      id: 'has_pre_damage_value',
      type: 'yes_no',
      prompt: 'Can you document the value of the property before the damage?',
      helpText:
        'This could be a recent appraisal, purchase receipt, Kelly Blue Book value (for vehicles), or comparable market listings.',
    },
    {
      id: 'insurance_claim_filed',
      type: 'yes_no',
      prompt: 'Have you filed a claim with your own insurance company?',
      helpText:
        'Even if you plan to recover from the at-fault party, filing with your own insurer can speed up repairs.',
    },
    {
      id: 'repairs_started',
      type: 'single_choice',
      prompt: 'What is the current status of repairs?',
      options: [
        { value: 'not_started', label: 'Not started yet' },
        { value: 'in_progress', label: 'In progress' },
        { value: 'completed', label: 'Completed' },
        { value: 'total_loss', label: 'Total loss / not repairable' },
      ],
    },
    {
      id: 'keep_receipts_info',
      type: 'info',
      prompt:
        'Keep every receipt related to the damage: repair invoices, rental car costs, temporary housing, storage fees, and any other out-of-pocket expenses. These are all recoverable damages.',
      showIf: (answers) => answers.repairs_started === 'in_progress' || answers.repairs_started === 'completed',
    },
    {
      id: 'has_loss_of_use',
      type: 'yes_no',
      prompt: 'Have you experienced loss of use (e.g., rental car, temporary housing, inability to use property)?',
      helpText:
        'Loss of use costs are compensable damages. Document dates and amounts for any substitute arrangements.',
    },
    {
      id: 'has_diminished_value',
      type: 'yes_no',
      prompt: 'Do you believe the property has lost value even after repairs (diminished value)?',
      helpText:
        'For vehicles, a diminished value claim compensates for the reduced resale value after an accident. You may need a professional appraisal.',
      showIf: (answers) => answers.damage_type === 'vehicle',
    },
    {
      id: 'timeline_created',
      type: 'yes_no',
      prompt: 'Have you created a timeline of events (incident, damage discovery, estimates, repairs)?',
      helpText:
        'A clear timeline helps present your claim. Include dates, what happened, and any costs incurred.',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.has_photos === 'yes') {
      items.push({ status: 'done', text: 'Damage photos collected.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Take photos of all damage — wide shots and close-ups. Include before photos if available.',
      })
    }

    if (answers.has_repair_estimate === 'multiple') {
      items.push({ status: 'done', text: 'Multiple repair estimates obtained.' })
    } else if (answers.has_repair_estimate === 'one') {
      items.push({
        status: 'needed',
        text: 'Get at least one more written repair estimate for comparison.',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Get at least two written repair estimates from licensed professionals.',
      })
    }

    if (answers.has_pre_damage_value === 'yes') {
      items.push({ status: 'done', text: 'Pre-damage property value documented.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Document the pre-damage value: purchase receipts, appraisals, or market comparables.',
      })
    }

    if (answers.insurance_claim_filed === 'yes') {
      items.push({ status: 'done', text: 'Insurance claim filed.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Consider filing a claim with your own insurance to speed up repairs.',
      })
    }

    if (answers.repairs_started === 'completed') {
      items.push({ status: 'done', text: 'Repairs completed.' })
    } else if (answers.repairs_started === 'total_loss') {
      items.push({
        status: 'info',
        text: 'Property is a total loss. Document the fair market value for your claim.',
      })
    } else {
      items.push({
        status: 'info',
        text: 'Keep all repair receipts, invoices, and records of out-of-pocket expenses.',
      })
    }

    if (answers.has_loss_of_use === 'yes') {
      items.push({
        status: 'info',
        text: 'Document all loss-of-use costs (rental car, temporary housing, etc.) with receipts and dates.',
      })
    }

    if (answers.has_diminished_value === 'yes') {
      items.push({
        status: 'needed',
        text: 'Consider getting a diminished value appraisal to document reduced resale value.',
      })
    }

    if (answers.timeline_created === 'yes') {
      items.push({ status: 'done', text: 'Damage timeline created.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Create a timeline: incident date, damage discovery, estimates obtained, repairs started/completed, costs incurred.',
      })
    }

    return items
  },
}
```

**Step 2: Build to verify**

Run: `cd "/Users/minwang/lawyer free" && npx next build 2>&1 | tail -20`
Expected: Build succeeds (file is created but not yet imported)

**Step 3: Commit**

```bash
git add src/lib/guided-steps/personal-injury/pi-damage-documentation.ts
git commit -m "feat: add property damage documentation step config"
```

---

### Task 3: Make PIMedicalRecordsStep sub-type-aware

**Files:**
- Modify: `src/components/step/personal-injury/pi-medical-records-step.tsx`

**Step 1: Update the component to accept piSubType and pick the right config**

Replace the entire file content:

```typescript
'use client'

import { GuidedStep } from '../guided-step'
import { piMedicalRecordsConfig } from '@/lib/guided-steps/personal-injury/pi-medical-records'
import { piDamageDocumentationConfig } from '@/lib/guided-steps/personal-injury/pi-damage-documentation'
import { isPropertyDamageSubType } from '@/lib/guided-steps/personal-injury/constants'

interface PIMedicalRecordsStepProps {
  caseId: string
  taskId: string
  existingAnswers?: Record<string, string>
  piSubType?: string
}

export function PIMedicalRecordsStep({ caseId, taskId, existingAnswers, piSubType }: PIMedicalRecordsStepProps) {
  const config = isPropertyDamageSubType(piSubType)
    ? piDamageDocumentationConfig
    : piMedicalRecordsConfig

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

**Step 2: Build to verify**

Run: `cd "/Users/minwang/lawyer free" && npx next build 2>&1 | tail -20`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/components/step/personal-injury/pi-medical-records-step.tsx
git commit -m "feat: make PIMedicalRecordsStep sub-type-aware"
```

---

### Task 4: Create property damage insurance communication config

**Files:**
- Create: `src/lib/guided-steps/personal-injury/pi-insurance-communication-property.ts`

**Step 1: Create the property damage insurance communication config**

This is a variant of `piInsuranceCommunicationConfig` with property-damage-appropriate language (no references to injuries, MMI, or medical authorizations).

```typescript
// src/lib/guided-steps/personal-injury/pi-insurance-communication-property.ts
import type { GuidedStepConfig } from '../types'

export const piInsuranceCommunicationPropertyConfig: GuidedStepConfig = {
  title: 'Communicate With Insurance',
  reassurance:
    "Knowing how to handle insurance communications protects your rights and your claim's value.",

  questions: [
    {
      id: 'claim_filed',
      type: 'yes_no',
      prompt:
        'Have you filed an insurance claim (with your own or the at-fault party\'s insurance)?',
      helpText:
        'Most policies require timely notice. Get a claim number and keep it handy.',
    },
    {
      id: 'adjuster_contacted_you',
      type: 'yes_no',
      prompt: 'Has an insurance adjuster contacted you?',
      helpText:
        'Adjusters may call, email, or send letters. Keep a record of all contact.',
    },
    {
      id: 'recorded_statement_requested',
      type: 'yes_no',
      prompt: 'Has the adjuster asked you for a recorded statement?',
      helpText:
        'This is a common request, especially from the other party\'s insurance.',
      showIf: (answers) => answers.adjuster_contacted_you === 'yes',
    },
    {
      id: 'recorded_statement_warning',
      type: 'info',
      prompt:
        'You are NOT required to give a recorded statement to the other party\'s insurance company. You can decline and say "I prefer to communicate in writing." Stick to basic facts about the property damage only.',
      helpText:
        'Your own insurance policy may require cooperation, but be cautious about what you say.',
      showIf: (answers) => answers.recorded_statement_requested === 'yes',
    },
    {
      id: 'offered_quick_settlement',
      type: 'yes_no',
      prompt: 'Has the insurance company offered you a quick settlement?',
      helpText:
        'Insurance companies sometimes offer early settlements before you know the full extent of the damage.',
    },
    {
      id: 'quick_settlement_warning',
      type: 'info',
      prompt:
        'Early settlement offers are almost always too low. Do not accept any settlement before getting complete repair estimates and understanding the full scope of damage (including diminished value and loss of use). Once you accept, you cannot go back and ask for more.',
      helpText:
        'Get multiple repair estimates and document all costs before agreeing to any amount.',
      showIf: (answers) => answers.offered_quick_settlement === 'yes',
    },
    {
      id: 'documenting_communications',
      type: 'yes_no',
      prompt:
        'Are you documenting all communications with insurance companies (dates, names, what was discussed)?',
      helpText:
        'A written log protects you if there is a dispute about what was said.',
    },
    {
      id: 'know_policy_limits',
      type: 'single_choice',
      prompt:
        "Do you know the at-fault party's insurance policy limits?",
      helpText:
        'Policy limits determine the maximum the insurance will pay. This affects your strategy.',
      options: [
        { value: 'yes', label: 'Yes, I know the limits' },
        { value: 'no', label: "No, I don't know them" },
        { value: 'unsure', label: "I'm not sure what policy limits are" },
      ],
    },
    {
      id: 'adjuster_tactics_info',
      type: 'info',
      prompt:
        'Watch out for common adjuster tactics: offering a lowball settlement before you have full repair estimates, pressuring you to use their preferred repair shop, disputing the scope of damage, and delaying responses. Get your own independent estimates, document everything, and never rush to accept.',
      helpText:
        'You can always say "I need time to think about it" before agreeing to anything.',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.claim_filed === 'yes') {
      items.push({ status: 'done', text: 'Insurance claim filed.' })
    } else {
      items.push({
        status: 'needed',
        text: 'File an insurance claim promptly. Most policies require timely notice.',
      })
    }

    if (answers.adjuster_contacted_you === 'yes') {
      if (answers.recorded_statement_requested === 'yes') {
        items.push({
          status: 'info',
          text: 'You are NOT required to give a recorded statement to the other party\'s insurer. Consider declining or communicating in writing.',
        })
      }
    }

    if (answers.offered_quick_settlement === 'yes') {
      items.push({
        status: 'needed',
        text: 'Do NOT accept the early settlement offer. Get complete repair estimates and document all costs first.',
      })
    }

    if (answers.documenting_communications === 'yes') {
      items.push({
        status: 'done',
        text: 'Keeping a log of all insurance communications.',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Start documenting all insurance communications: dates, names, and what was discussed.',
      })
    }

    if (answers.know_policy_limits === 'yes') {
      items.push({ status: 'done', text: 'Policy limits are known.' })
    } else if (answers.know_policy_limits === 'unsure') {
      items.push({
        status: 'info',
        text: "Policy limits are the maximum an insurer will pay. Ask the adjuster or check the at-fault party's declarations page.",
      })
    } else {
      items.push({
        status: 'needed',
        text: "Find out the at-fault party's policy limits. This affects your settlement strategy.",
      })
    }

    items.push({
      status: 'info',
      text: 'Watch for adjuster tactics: lowball offers, pressure to use their repair shop, disputing damage scope, and delays.',
    })

    return items
  },
}
```

**Step 2: Commit**

```bash
git add src/lib/guided-steps/personal-injury/pi-insurance-communication-property.ts
git commit -m "feat: add property damage insurance communication step config"
```

---

### Task 5: Make PIInsuranceCommunicationStep sub-type-aware

**Files:**
- Modify: `src/components/step/personal-injury/pi-insurance-communication-step.tsx`

**Step 1: Update the component**

Replace the entire file content:

```typescript
'use client'

import { GuidedStep } from '../guided-step'
import { piInsuranceCommunicationConfig } from '@/lib/guided-steps/personal-injury/pi-insurance-communication'
import { piInsuranceCommunicationPropertyConfig } from '@/lib/guided-steps/personal-injury/pi-insurance-communication-property'
import { isPropertyDamageSubType } from '@/lib/guided-steps/personal-injury/constants'

interface PIInsuranceCommunicationStepProps {
  caseId: string
  taskId: string
  existingAnswers?: Record<string, string>
  piSubType?: string
}

export function PIInsuranceCommunicationStep({ caseId, taskId, existingAnswers, piSubType }: PIInsuranceCommunicationStepProps) {
  const config = isPropertyDamageSubType(piSubType)
    ? piInsuranceCommunicationPropertyConfig
    : piInsuranceCommunicationConfig

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

**Step 2: Build to verify**

Run: `cd "/Users/minwang/lawyer free" && npx next build 2>&1 | tail -20`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/components/step/personal-injury/pi-insurance-communication-step.tsx
git commit -m "feat: make PIInsuranceCommunicationStep sub-type-aware"
```

---

### Task 6: Make PIDemandLetterStep sub-type-aware

The demand letter step (`src/components/step/personal-injury/pi-demand-letter-step.tsx`) is a custom StepRunner (not a GuidedStep), so it needs inline conditional rendering — same pattern as `pi-intake-step.tsx`.

**Files:**
- Modify: `src/components/step/personal-injury/pi-demand-letter-step.tsx`

**Step 1: Add the property damage import and detection**

At the top of the file, after existing imports (line 8), add:

```typescript
import { isPropertyDamageSubType } from '@/lib/guided-steps/personal-injury/constants'
```

In the component body, after `const pid = personalInjuryDetails` (line 47), add:

```typescript
const isPropertyDamage = isPropertyDamageSubType(pid?.pi_sub_type)
```

**Step 2: Update the title and reassurance (line 326-327)**

```typescript
// BEFORE:
title="Draft Your Demand Letter"
reassurance="A demand letter is your first step in seeking fair compensation. It puts the insurance company on notice of your claim."

// AFTER:
title="Draft Your Demand Letter"
reassurance={isPropertyDamage
  ? "A demand letter formally notifies the at-fault party's insurance of your property damage claim and the compensation you are seeking."
  : "A demand letter is your first step in seeking fair compensation. It puts the insurance company on notice of your claim."
}
```

**Step 3: Make Section 5 (Injuries) conditional — show "Damage Details" for property damage**

Find the Section 5 JSX block (around lines 509-552) and wrap it:

```typescript
{/* Section 5: Injuries / Damage Details */}
{isPropertyDamage ? (
  <div>
    <h2 className="text-sm font-semibold text-warm-text mb-4">
      5. Damage Details
    </h2>
    <div className="space-y-3">
      <div>
        <Label htmlFor="pidl-damage-description">
          Description of property damage *
        </Label>
        <textarea
          id="pidl-damage-description"
          value={injuriesDescription}
          onChange={(e) => setInjuriesDescription(e.target.value)}
          placeholder="Describe all property damage in detail..."
          rows={4}
          className="flex min-h-[60px] w-full rounded-md border border-warm-border bg-transparent px-3 py-2 text-sm text-warm-text shadow-xs placeholder:text-warm-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-calm-indigo"
        />
      </div>
    </div>
  </div>
) : (
  <div>
    {/* existing Section 5 Injuries content unchanged */}
  </div>
)}
```

**Step 4: Make Section 6 (Medical Providers) conditional — show "Repair Vendors" for property damage**

Find the Section 6 JSX block (around lines 554-652). For property damage, relabel:
- "Medical Providers" → "Repair Vendors & Contractors"
- "Provider name" → "Vendor / contractor name"
- "Type of treatment" → "Type of work"
- "Dates of treatment" → "Date of estimate / service"
- "Amount ($)" stays the same
- "+ Add another provider" → "+ Add another vendor"

Wrap the section header and labels:

```typescript
<h2 className="text-sm font-semibold text-warm-text mb-4">
  {isPropertyDamage ? '6. Repair Vendors & Contractors' : '6. Medical Providers'}
</h2>
```

Update provider field labels:
```typescript
<Label htmlFor={`pidl-provider-name-${index}`}>
  {isPropertyDamage ? 'Vendor / contractor name' : 'Provider name'}
</Label>
```
```typescript
<Label htmlFor={`pidl-provider-type-${index}`}>
  {isPropertyDamage ? 'Type of work' : 'Type of treatment'}
</Label>
```
```typescript
<Label htmlFor={`pidl-provider-dates-${index}`}>
  {isPropertyDamage ? 'Date of estimate / service' : 'Dates of treatment'}
</Label>
```
```typescript
{isPropertyDamage ? '+ Add another vendor' : '+ Add another provider'}
```

**Step 5: Make Section 7 (Damages Summary) conditional**

For property damage cases:
- "Total medical expenses" → "Total repair / replacement costs"
- Remove "Pain & suffering" line (not applicable to pure property damage)
- Add "Diminished value" field if applicable
- "Lost wages" → "Loss of use costs"

Update the auto-sum label:
```typescript
<p className="text-sm text-warm-text">
  {isPropertyDamage ? 'Total repair / replacement costs' : 'Total medical expenses'}
</p>
```

Update lost wages label:
```typescript
<Label htmlFor="pidl-lost-wages">
  {isPropertyDamage ? 'Loss of use costs (rental car, temporary housing, etc.)' : 'Lost wages'}
</Label>
```

Conditionally show pain & suffering only for injury cases:
```typescript
{!isPropertyDamage && (
  <div className="rounded-lg border border-warm-border bg-warm-bg/50 p-3">
    {/* Pain & suffering calculation */}
  </div>
)}
```

Update total demand calculation to exclude pain & suffering for property damage:
```typescript
const totalDemandAmount = isPropertyDamage
  ? totalMedicalExpenses + (parseFloat(lostWages) || 0) + (parseFloat(propertyDamage) || 0)
  : totalMedicalExpenses + (parseFloat(lostWages) || 0) + (parseFloat(propertyDamage) || 0) + painSufferingAmount
```

**Step 6: Update the info callout at the bottom**

```typescript
{isPropertyDamage ? (
  <div className="rounded-md border border-calm-indigo/30 bg-calm-indigo/5 px-3 py-2">
    <p className="text-xs font-medium text-warm-text">
      What is a demand letter?
    </p>
    <p className="text-xs text-warm-muted mt-0.5">
      A demand letter formally notifies the at-fault party&apos;s insurance
      company of your property damage claim. It details the incident, the
      damage to your property, and the compensation you are seeking. This
      is typically the first step before filing a lawsuit.
    </p>
  </div>
) : (
  // existing injury info callout
)}
```

**Step 7: Build to verify**

Run: `cd "/Users/minwang/lawyer free" && npx next build 2>&1 | tail -20`
Expected: Build succeeds

**Step 8: Commit**

```bash
git add src/components/step/personal-injury/pi-demand-letter-step.tsx
git commit -m "feat: make PIDemandLetterStep sub-type-aware for property damage"
```

---

### Task 7: Update the step router to pass piSubType to all PI steps

**Files:**
- Modify: `src/app/(authenticated)/case/[id]/step/[taskId]/page.tsx:729-732`

Currently only `pi_intake` (line 717-727) fetches `piSubType`. We need to also pass it to `pi_medical_records`, `pi_insurance_communication`, and `prepare_pi_demand_letter`.

**Step 1: Update the `pi_medical_records` case (line 729-730)**

```typescript
// BEFORE:
case 'pi_medical_records':
  return <PIMedicalRecordsStep caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />

// AFTER:
case 'pi_medical_records': {
  const { data: piDetails } = await supabase
    .from('personal_injury_details').select('pi_sub_type').eq('case_id', id).maybeSingle()
  return <PIMedicalRecordsStep caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} piSubType={piDetails?.pi_sub_type ?? undefined} />
}
```

**Step 2: Update the `pi_insurance_communication` case (line 731-732)**

```typescript
// BEFORE:
case 'pi_insurance_communication':
  return <PIInsuranceCommunicationStep caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />

// AFTER:
case 'pi_insurance_communication': {
  const { data: piDetails } = await supabase
    .from('personal_injury_details').select('pi_sub_type').eq('case_id', id).maybeSingle()
  return <PIInsuranceCommunicationStep caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} piSubType={piDetails?.pi_sub_type ?? undefined} />
}
```

Note: `prepare_pi_demand_letter` (line 733-747) already fetches `piDetails` with `select('*')` which includes `pi_sub_type`, and passes it as `personalInjuryDetails={piDetails}`. The demand letter component already accesses `pid?.pi_sub_type` internally, so no change needed in the router for that case.

**Step 3: Build to verify**

Run: `cd "/Users/minwang/lawyer free" && npx next build 2>&1 | tail -20`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/app/(authenticated)/case/[id]/step/[taskId]/page.tsx
git commit -m "feat: pass piSubType to PIMedicalRecordsStep and PIInsuranceCommunicationStep"
```

---

### Task 8: DB migration — conditional task titles based on sub-type

**Files:**
- Create: `supabase/migrations/20260308000001_pi_subtype_aware_titles.sql`

The `seed_case_tasks()` trigger fires on INSERT to `cases`. However, `personal_injury_details` is inserted AFTER the case (in the API route, lines 114-129 of `src/app/api/cases/route.ts`). This means the trigger can't look up the sub-type at case creation time.

**Solution:** Instead of modifying the trigger (which fires before PI details exist), create a second trigger on `personal_injury_details` INSERT that updates the task titles based on the sub-type.

**Step 1: Create the migration**

```sql
-- Migration: Update PI task titles based on sub-type
-- The seed_case_tasks trigger fires before personal_injury_details is inserted,
-- so we add a trigger on personal_injury_details to fix titles post-creation.

CREATE OR REPLACE FUNCTION public.update_pi_task_titles()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only update for property damage sub-types
  IF NEW.pi_sub_type IN ('vehicle_damage', 'property_damage_negligence', 'vandalism', 'other_property_damage') THEN
    UPDATE public.tasks
    SET title = 'Tell Us About the Property Damage'
    WHERE case_id = NEW.case_id AND task_key = 'pi_intake';

    UPDATE public.tasks
    SET title = 'Document Your Property Damage'
    WHERE case_id = NEW.case_id AND task_key = 'pi_medical_records';
  END IF;

  RETURN NEW;
END;
$$;

-- Fire after personal_injury_details is inserted
CREATE TRIGGER update_pi_task_titles_trigger
  AFTER INSERT ON public.personal_injury_details
  FOR EACH ROW
  EXECUTE FUNCTION public.update_pi_task_titles();

-- Also update any EXISTING property damage cases that already have wrong titles
UPDATE public.tasks t
SET title = 'Document Your Property Damage'
FROM public.personal_injury_details pid
WHERE t.case_id = pid.case_id
  AND t.task_key = 'pi_medical_records'
  AND pid.pi_sub_type IN ('vehicle_damage', 'property_damage_negligence', 'vandalism', 'other_property_damage');

UPDATE public.tasks t
SET title = 'Tell Us About the Property Damage'
FROM public.personal_injury_details pid
WHERE t.case_id = pid.case_id
  AND t.task_key = 'pi_intake'
  AND pid.pi_sub_type IN ('vehicle_damage', 'property_damage_negligence', 'vandalism', 'other_property_damage');
```

**Step 2: Commit**

```bash
git add supabase/migrations/20260308000001_pi_subtype_aware_titles.sql
git commit -m "feat: add trigger to set property damage task titles based on PI sub-type"
```

---

### Task 9: Update milestones for property damage cases

**Files:**
- Modify: `src/lib/rules/milestones.ts:149-284`

The milestones need property-damage-appropriate labels. Since milestones are used in the onboarding/milestone picker, the labels should make sense for property damage cases.

**Step 1: Check how milestones are consumed**

Look at how `PERSONAL_INJURY_MILESTONES` is referenced. It's likely selected based on `dispute_type` without sub-type awareness. For now, the simplest fix is to make the labels generic enough for both, or add sub-type awareness to the milestone selection.

Since milestones are selected by the user at onboarding and the label text is the only user-facing part, update the `medical` milestone to use generic language:

```typescript
// BEFORE (line 158-166):
{
  id: 'medical',
  label: 'Gathering medical records',
  description: 'I\'m collecting my medical records and bills.',
  firstUnlockedTask: 'pi_medical_records',
  tasksToSkip: [
    'welcome',
    'pi_intake',
  ],
},

// AFTER:
{
  id: 'medical',
  label: 'Documenting damages',
  description: 'I\'m collecting records, estimates, and documentation.',
  firstUnlockedTask: 'pi_medical_records',
  tasksToSkip: [
    'welcome',
    'pi_intake',
  ],
},
```

This label works for both injury (medical records) and property damage (repair estimates) cases.

**Step 2: Build to verify**

Run: `cd "/Users/minwang/lawyer free" && npx next build 2>&1 | tail -20`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/lib/rules/milestones.ts
git commit -m "feat: update PI milestones to use sub-type-neutral language"
```

---

### Task 10: Manual testing checklist

**No files changed — testing only.**

**Step 1: Reset local Supabase to apply the new migration**

```bash
cd "/Users/minwang/lawyer free"
npx supabase db reset
```

**Step 2: Start the dev server**

```bash
npm run dev
```

**Step 3: Create a property damage case and verify**

1. Sign in
2. Create a new case: Personal Injury → `vehicle_damage` or `property_damage_negligence`
3. Complete the Welcome step
4. Complete the Intake step — verify it says "Tell Us About the Property Damage" (not "Your Injury")
5. After completing Intake, verify the dashboard shows "Document Your Property Damage" as the next step (NOT "Organize Your Medical Records")
6. Open the damage documentation step — verify it asks about repair estimates, photos, contractors (not ER records, specialists, imaging)
7. Complete it and verify "Communicate With Insurance" unlocks with property-damage-appropriate content
8. Verify the demand letter step shows "Damage Details" and "Repair Vendors" sections (not "Injuries" and "Medical Providers")

**Step 4: Create an injury case and verify no regression**

1. Create a new case: Personal Injury → `auto_accident`
2. Verify all steps still show injury-specific content:
   - "Tell Us About Your Injury"
   - "Organize Your Medical Records"
   - Medical records step asks about ER, specialists, imaging, prescriptions
   - Insurance communication mentions MMI
   - Demand letter shows injuries and medical providers sections

**Step 5: Final commit**

```bash
git add -A
git commit -m "feat: PI steps now show property-damage-relevant content for property damage sub-types

- Extract PROPERTY_DAMAGE_SUB_TYPES to shared constants
- Create pi-damage-documentation config (repair estimates, photos, contractors)
- Create pi-insurance-communication-property config (no injury-specific language)
- Make PIMedicalRecordsStep, PIInsuranceCommunicationStep, PIDemandLetterStep sub-type-aware
- Pass piSubType from step router to all affected PI step components
- Add DB trigger to set correct task titles based on PI sub-type
- Update milestones to use sub-type-neutral language"
```
