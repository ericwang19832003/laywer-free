# Court-Specific Filing Guidance Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the generic, Texas-only `pi_file_with_court` step with a data-driven, state-and-court-type-aware filing guidance system covering all 50 states.

**Architecture:** State filing data module (`state-filing-info.ts`) provides per-state filing info. Factory function (`pi-file-with-court-factory.ts`) generates a `GuidedStepConfig` dynamically based on the case's `state`, `court_type`, and `county`. Step router passes case data to the component.

**Tech Stack:** TypeScript, Next.js, Supabase, existing GuidedStep component

---

### Task 1: Create state filing data module

**Files:**
- Create: `src/lib/guided-steps/personal-injury/state-filing-info.ts`

**Step 1: Create the types and data**

```typescript
export interface CourtFilingInfo {
  label: string
  feeRange: string
  filingSteps: string[]
  eFilingUrl?: string
  specialRequirements?: string
}

export interface StateFilingInfo {
  name: string
  abbreviation: string
  sol: {
    personalInjury: string
    propertyDamage: string
    note?: string          // e.g. FL's 2023 tort reform note
  }
  eFilingSystem?: {
    name: string
    url: string
    mandatory: boolean     // for attorneys; pro se usually exempt
    mandatoryNote?: string // clarification
  }
  filingMethods: string[]
  feeWaiverForm: string
  feeWaiverRule?: string
  courtSelectionGuide: string
  courts: Record<string, CourtFilingInfo>
}

export const STATE_FILING_INFO: Record<string, StateFilingInfo> = { ... }
```

Populate with detailed data for TX, CA, NY, FL, PA (Tier 1). For all other states (Tier 2), include:
- Accurate SOL for personal injury and property damage
- Generic court structure description
- Filing methods: `['in-person', 'mail', 'e-file (check local court)']`
- Fee waiver: generic name and note to check local rules
- Courts: empty record `{}` (triggers generic guidance in factory)

**Tier 1 state data (from research):**

**Texas:**
- SOL: PI 2yr, PD 2yr (Tex. Civ. Prac. & Rem. Code 16.003)
- E-filing: eFileTexas (efiletexas.gov), mandatory for attorneys
- Fee waiver: "Statement of Inability to Afford Payment of Court Costs" (TRCP Rule 145)
- Courts: jp ($54 base), county ($250-$350), district ($250-$400), federal ($405)
- Court guide: JP up to $20k, County $200-$325k, District over $325k

**California:**
- SOL: PI 2yr, PD 3yr (CCP 335.1, 338)
- E-filing: Odyssey eFileCA (odysseyefileca.com), mandatory for attorneys
- Fee waiver: "Request to Waive Court Fees (Form FW-001)" (Gov Code 68631-68636)
- Courts: small_claims ($30-$100), limited_civil ($225-$370), unlimited_civil ($435), federal ($405)
- Court guide: Small claims up to $12.5k, Limited up to $35k, Unlimited over $35k
- Note: 6-month govt tort claim deadline

**New York:**
- SOL: PI 3yr, PD 3yr (CPLR 214)
- E-filing: NYSCEF, mandatory in select counties
- Fee waiver: "Affidavit to Proceed as Poor Person" (CPLR 1101)
- Courts: ny_small_claims ($15-$20), ny_civil ($45), ny_supreme ($305), federal ($405)
- Court guide: Small claims up to $10k (NYC), Civil up to $50k, Supreme unlimited
- Note: 90-day notice of claim for municipalities

**Florida:**
- SOL: PI 2yr (post-3/24/2023), PD 4yr (Fla. Stat. 95.11)
- E-filing: FL Courts E-Filing Portal (myflcourtaccess.com), mandatory for attorneys
- Fee waiver: "Application for Determination of Civil Indigent Status" (Fla. Stat. 57.082)
- Courts: fl_small_claims ($55-$295), fl_county ($295-$395), fl_circuit ($395-$1,900), federal ($405)
- Court guide: Small claims up to $8k, County up to $50k, Circuit over $50k
- Note: 2023 tort reform changed PI SOL from 4yr to 2yr

**Pennsylvania:**
- SOL: PI 2yr, PD 4yr (42 Pa. C.S. 5524)
- E-filing: PACFile (ujsportal.pacourts.us), varies by district
- Fee waiver: "Petition to Proceed In Forma Pauperis" (Pa. R.C.P. 240)
- Courts: pa_magisterial ($53-$128), pa_common_pleas ($130-$350+), federal ($405)
- Court guide: Magisterial up to $12k, Common Pleas over $12k
- Note: PACFile does NOT cover Magisterial District Courts

**Step 2: Add Tier 2 states (all remaining)**

Include every U.S. state with at minimum: name, abbreviation, SOL (PI + PD), generic filing methods, generic fee waiver info, and empty courts record. SOL data per state:

| State | PI SOL | PD SOL |
|-------|--------|--------|
| AL | 2yr | 6yr |
| AK | 2yr | 6yr |
| AZ | 2yr | 2yr |
| AR | 3yr | 3yr |
| CO | 2yr (discovery: 3yr) | 2yr |
| CT | 2yr | 2yr |
| DE | 2yr | 2yr |
| DC | 3yr | 3yr |
| GA | 2yr | 4yr |
| HI | 2yr | 2yr |
| ID | 2yr | 3yr |
| IL | 2yr | 5yr |
| IN | 2yr | 6yr |
| IA | 2yr | 5yr |
| KS | 2yr | 2yr |
| KY | 1yr | 5yr |
| LA | 1yr | 1yr |
| ME | 6yr | 6yr |
| MD | 3yr | 3yr |
| MA | 3yr | 3yr |
| MI | 3yr | 3yr |
| MN | 6yr | 6yr |
| MS | 3yr | 3yr |
| MO | 5yr | 5yr |
| MT | 3yr | 2yr |
| NE | 4yr | 4yr |
| NV | 2yr | 3yr |
| NH | 3yr | 3yr |
| NJ | 2yr | 6yr |
| NM | 3yr | 4yr |
| NC | 3yr | 3yr |
| ND | 6yr | 6yr |
| OH | 2yr | 4yr |
| OK | 2yr | 2yr |
| OR | 2yr | 6yr |
| RI | 3yr | 10yr |
| SC | 3yr | 3yr |
| SD | 3yr | 6yr |
| TN | 1yr | 3yr |
| UT | 4yr | 3yr |
| VT | 3yr | 3yr |
| VA | 2yr | 5yr |
| WA | 3yr | 3yr |
| WV | 2yr | 2yr |
| WI | 3yr | 6yr |
| WY | 4yr | 4yr |

Each Tier 2 entry follows this template:
```typescript
AL: {
  name: 'Alabama',
  abbreviation: 'AL',
  sol: { personalInjury: '2 years', propertyDamage: '6 years' },
  filingMethods: ['in-person', 'mail', 'e-file (check local court)'],
  feeWaiverForm: 'Petition to Proceed In Forma Pauperis',
  courtSelectionGuide: 'File in the county where the incident occurred or where the defendant resides. Check your local court clerk for specific jurisdiction rules.',
  courts: {},
}
```

**Step 3: Commit**
```bash
git add src/lib/guided-steps/personal-injury/state-filing-info.ts
git commit -m "feat: add state filing data module with Tier 1 and Tier 2 state info"
```

---

### Task 2: Create config factory function

**Files:**
- Create: `src/lib/guided-steps/personal-injury/pi-file-with-court-factory.ts`
- Reference: `src/lib/guided-steps/types.ts`

**Step 1: Create the factory**

```typescript
import type { GuidedStepConfig } from '../types'
import { STATE_FILING_INFO } from './state-filing-info'

export function createPiFileWithCourtConfig(
  state: string,
  courtType: string,
  county: string | null
): GuidedStepConfig {
  const stateInfo = STATE_FILING_INFO[state]
  const courtInfo = stateInfo?.courts[courtType]
  const isTier1 = stateInfo && Object.keys(stateInfo.courts).length > 0

  return {
    title: 'File With the Court',
    reassurance: 'Filing your petition starts the formal legal process.',
    questions: [
      // Q1: Court selection
      {
        id: 'know_which_court',
        type: 'single_choice',
        prompt: 'Do you know which court to file in?',
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'not_sure', label: "I'm not sure" },
        ],
      },
      {
        id: 'court_info',
        type: 'info',
        prompt: stateInfo?.courtSelectionGuide ?? 'File in the county where the incident occurred or where the defendant resides.',
        showIf: (a) => a.know_which_court === 'not_sure',
      },
      // Q2: Filing method (state-specific)
      {
        id: 'efile_info',
        type: 'info',
        prompt: buildEFilingPrompt(stateInfo, courtInfo),
      },
      // Q3: Filing fee
      {
        id: 'know_filing_fee',
        type: 'yes_no',
        prompt: 'Do you know the filing fee for your court?',
      },
      {
        id: 'fee_info',
        type: 'info',
        prompt: buildFeePrompt(stateInfo, courtInfo, courtType),
        showIf: (a) => a.know_filing_fee === 'no',
      },
      // Q4: Fee waiver
      {
        id: 'need_fee_waiver',
        type: 'yes_no',
        prompt: 'Do you need to apply for a fee waiver?',
      },
      {
        id: 'fee_waiver_info',
        type: 'info',
        prompt: buildFeeWaiverPrompt(stateInfo),
        showIf: (a) => a.need_fee_waiver === 'yes',
      },
      // Q5: Documents checklist
      {
        id: 'documents_checklist',
        type: 'info',
        prompt: buildDocumentsPrompt(stateInfo, courtType),
      },
      // Q6: SOL reminder
      {
        id: 'know_sol_deadline',
        type: 'yes_no',
        prompt: 'Do you know your statute of limitations deadline?',
      },
      {
        id: 'sol_critical',
        type: 'info',
        prompt: buildSolPrompt(stateInfo),
      },
    ],
    generateSummary(answers) { ... },
  }
}
```

Helper functions:
- `buildEFilingPrompt(stateInfo, courtInfo)` — returns e-filing portal name, URL, and step-by-step for Tier 1; generic "check your local court" for Tier 2
- `buildFeePrompt(stateInfo, courtInfo, courtType)` — returns court-specific fee range for Tier 1; generic "contact clerk" for Tier 2
- `buildFeeWaiverPrompt(stateInfo)` — returns state-specific form name and rule
- `buildDocumentsPrompt(stateInfo, courtType)` — returns checklist (petition, summons, civil cover sheet, copies)
- `buildSolPrompt(stateInfo)` — returns state-specific SOL years and citation

**Step 2: Commit**
```bash
git add src/lib/guided-steps/personal-injury/pi-file-with-court-factory.ts
git commit -m "feat: add config factory for court-specific filing guidance"
```

---

### Task 3: Update step component and router

**Files:**
- Modify: `src/components/step/personal-injury/pi-file-with-court-step.tsx`
- Modify: `src/app/(authenticated)/case/[id]/step/[taskId]/page.tsx` (line ~774)

**Step 1: Update PIFileWithCourtStep to accept caseData and use factory**

```typescript
'use client'

import { useMemo } from 'react'
import { GuidedStep } from '../guided-step'
import { createPiFileWithCourtConfig } from '@/lib/guided-steps/personal-injury/pi-file-with-court-factory'

interface PIFileWithCourtStepProps {
  caseId: string
  taskId: string
  existingAnswers?: Record<string, string>
  caseData?: {
    state: string
    court_type: string
    county: string | null
  }
}

export function PIFileWithCourtStep({ caseId, taskId, existingAnswers, caseData }: PIFileWithCourtStepProps) {
  const config = useMemo(
    () => createPiFileWithCourtConfig(
      caseData?.state ?? 'TX',
      caseData?.court_type ?? 'district',
      caseData?.county ?? null
    ),
    [caseData]
  )

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

**Step 2: Update step router to fetch and pass case data**

At line ~774 in page.tsx, change:
```typescript
// BEFORE:
case 'pi_file_with_court':
  return <PIFileWithCourtStep caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />

// AFTER:
case 'pi_file_with_court': {
  const { data: caseRow } = await supabase
    .from('cases')
    .select('state, court_type, county')
    .eq('id', id)
    .single()
  return (
    <PIFileWithCourtStep
      caseId={id}
      taskId={taskId}
      existingAnswers={task.metadata?.guided_answers}
      caseData={caseRow ?? undefined}
    />
  )
}
```

**Step 3: Delete old static config file**

The old `src/lib/guided-steps/personal-injury/pi-file-with-court.ts` is no longer imported. Delete it.

**Step 4: Commit**
```bash
git add src/components/step/personal-injury/pi-file-with-court-step.tsx
git add src/app/\(authenticated\)/case/\[id\]/step/\[taskId\]/page.tsx
git rm src/lib/guided-steps/personal-injury/pi-file-with-court.ts
git commit -m "feat: wire up court-specific filing guidance with case data"
```

---

### Task 4: Build verification

**Step 1: Run build**
```bash
cd "/Users/minwang/lawyer free" && npm run build 2>&1 | tail -30
```

**Step 2: Fix any type errors or import issues**

**Step 3: Commit any fixes**
