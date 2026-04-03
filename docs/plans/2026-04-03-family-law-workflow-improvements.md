# Family Law Workflow Improvements — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Close 10 critical gaps in the family law guided workflows by adding path branching after service, post-decree steps, UCCJEA affidavit, AG filing option, spousal support eligibility screening, paternity establishment, county standing orders, 1-year modification restriction, QDRO warning, and expanded SPO details.

**Architecture:** Each improvement is a combination of (a) new/modified guided step TypeScript files in `packages/shared/src/guided-steps/family/`, (b) new task keys in a single Supabase migration, and (c) updated unlock chain logic in that same migration. All 10 items ship in one migration to keep the DB clean.

**Tech Stack:** TypeScript (guided step configs), PostgreSQL (Supabase migrations, PL/pgSQL triggers)

---

## Conventions

- **Guided step files** live in `packages/shared/src/guided-steps/family/`
- **Types** are defined in `packages/shared/src/guided-steps/types.ts` (`GuidedStepConfig`, `QuestionDef`, `SummaryItem`)
- **Migration** goes to `supabase/migrations/` with next available timestamp
- **Unlock chain** is the `unlock_next_task()` function in the migration — each task_key completion triggers the next task to unlock
- **Task seeding** happens in `seed_family_tasks()` — called on `family_case_details` INSERT
- All guided step files export a function `create*Config(subType)` or a const `*Config`
- Questions use types: `yes_no`, `single_choice`, `info`, `text`
- Conditional display via `showIf: (answers) => boolean`

## File Overview

### New files to create:
1. `family-response-checkpoint.ts` — Item 1: after-service branching (agreed/default/contested)
2. `family-post-decree.ts` — Item 2: post-decree steps per sub-type
3. `family-uccjea-affidavit.ts` — Item 3: UCCJEA child address history
4. `family-ag-option.ts` ��� Item 4: AG vs private filing for child support
5. `family-spousal-eligibility.ts` — Item 5: spousal support eligibility screening
6. `family-paternity.ts` — Item 6: paternity establishment
7. `family-standing-orders.ts` — Item 7: county standing orders awareness

### Existing files to modify:
8. `family-existing-order-review.ts` — Item 8: add 1-year restriction check
9. `family-property-division.ts` — Item 9: add QDRO warning
10. `family-custody-factors.ts` — Item 10: expand SPO details

### Migration file to create:
- `supabase/migrations/20260403000001_family_workflow_improvements.sql`

---

## Task 1: Response Checkpoint — Contested/Default/Agreed Path Branching

**Why:** Currently all family workflows are linear after service. In reality, what happens next depends entirely on whether the respondent files an answer, ignores service, or cooperates. This is the single most impactful gap.

**Design:** Add a new `{subtype}_response_checkpoint` task after the serve step. The user indicates what happened. The unlock chain then routes to different next steps:
- **Agreed** → skip to final orders (fast track)
- **Default** (no answer filed) → skip mediation, go to final orders with default-specific guidance
- **Contested** (answer filed) → continue normal chain (temp orders → mediation → final)

**Files:**
- Create: `packages/shared/src/guided-steps/family/family-response-checkpoint.ts`
- Create: `supabase/migrations/20260403000001_family_workflow_improvements.sql` (started here, extended in later tasks)

### Step 1: Create the guided step config

Create `packages/shared/src/guided-steps/family/family-response-checkpoint.ts`:

```typescript
import type { GuidedStepConfig } from '../types'

type ResponseSubType = 'divorce' | 'custody' | 'child_support' | 'visitation' | 'spousal_support' | 'modification'

export function createResponseCheckpointConfig(subType: ResponseSubType): GuidedStepConfig {
  const deadlineNote = subType === 'divorce'
    ? 'In Texas, the respondent has until 10:00 a.m. on the first Monday after 20 days from service to file an answer.'
    : 'The respondent typically has until 10:00 a.m. on the first Monday after 20 days from service to file an answer.'

  return {
    title: 'What Happened After Service?',
    reassurance: 'How the other party responds determines your next steps. Take a moment to confirm what has happened so we can guide you correctly.',

    questions: [
      {
        id: 'response_status',
        type: 'single_choice',
        prompt: 'What has the other party done since being served?',
        options: [
          { value: 'agreed', label: 'They agree to all terms — we have a full agreement' },
          { value: 'answer_filed', label: 'They filed an answer — the case is contested' },
          { value: 'no_response', label: 'No response — the answer deadline has passed' },
          { value: 'waiting', label: 'Still waiting — the deadline has not passed yet' },
        ],
      },
      {
        id: 'agreed_info',
        type: 'info',
        prompt: 'Since you have a full agreement, you can move toward a final order much faster. You may be able to skip mediation and go straight to a prove-up hearing. Make sure any agreement is in writing and signed by both parties.',
        showIf: (a) => a.response_status === 'agreed',
      },
      {
        id: 'answer_filed_info',
        type: 'info',
        prompt: 'A contested case means you and the other party disagree on one or more issues. The court will help resolve these through temporary orders, mediation, and if needed, a trial. This takes longer but the process is designed to be fair.',
        showIf: (a) => a.response_status === 'answer_filed',
      },
      {
        id: 'no_response_info',
        type: 'info',
        prompt: 'If the answer deadline has passed with no response, you may be able to proceed by default. Before the hearing, verify with the clerk that no answer was filed. You will also need a Military Status Declaration and Certificate of Last Known Mailing Address.',
        showIf: (a) => a.response_status === 'no_response',
      },
      {
        id: 'waiting_info',
        type: 'info',
        prompt: deadlineNote + ' Come back and update this step once you know the outcome.',
        showIf: (a) => a.response_status === 'waiting',
      },
      {
        id: 'waiver_timing',
        type: 'info',
        prompt: 'Important: If service was by waiver, it must have been signed at least one day after the petition was filed — not the same day.',
        showIf: (a) => a.response_status === 'agreed',
      },
    ],

    generateSummary(answers) {
      const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

      if (answers.response_status === 'agreed') {
        items.push({ status: 'done', text: 'Both parties agree — fast-track path available.' })
        items.push({ status: 'info', text: 'Next: Prepare your agreed final order and schedule a prove-up hearing.' })
      } else if (answers.response_status === 'answer_filed') {
        items.push({ status: 'done', text: 'Answer filed — case is contested.' })
        items.push({ status: 'info', text: 'Next: Consider temporary orders, then prepare for mediation.' })
      } else if (answers.response_status === 'no_response') {
        items.push({ status: 'done', text: 'No response filed — default path available.' })
        items.push({ status: 'needed', text: 'Verify with the clerk that no answer was filed before scheduling your default hearing.' })
        items.push({ status: 'needed', text: 'Prepare: Military Status Declaration and Certificate of Last Known Mailing Address.' })
      } else {
        items.push({ status: 'needed', text: 'Still waiting for the answer deadline to pass. Come back when you know the outcome.' })
      }

      return items
    },
  }
}
```

### Step 2: Verify it compiles

Run: `cd "/Users/minwang/lawyer free" && npx tsc --noEmit packages/shared/src/guided-steps/family/family-response-checkpoint.ts`

### Step 3: Commit

```bash
git add packages/shared/src/guided-steps/family/family-response-checkpoint.ts
git commit -m "feat(family): add response checkpoint guided step for contested/default/agreed branching"
```

---

## Task 2: Post-Decree Steps

**Why:** After the judge signs the final order, users need guidance on: filing the order with the clerk, getting certified copies, name changes, property transfers, beneficiary updates, child support account setup, and the 30-day remarriage restriction (divorce only). Currently the workflow ends at "Final Orders" with no post-judgment task in the chain.

**Files:**
- Create: `packages/shared/src/guided-steps/family/family-post-decree.ts`

### Step 1: Create the guided step config

Create `packages/shared/src/guided-steps/family/family-post-decree.ts`:

```typescript
import type { GuidedStepConfig } from '../types'

type PostDecreeSubType = 'divorce' | 'custody' | 'child_support' | 'visitation' | 'spousal_support' | 'modification'

export function createPostDecreeConfig(subType: PostDecreeSubType): GuidedStepConfig {
  const titles: Record<PostDecreeSubType, string> = {
    divorce: 'After Your Divorce Is Final',
    custody: 'After Your Custody Order',
    child_support: 'After Your Support Order',
    visitation: 'After Your Visitation Order',
    spousal_support: 'After Your Support Order',
    modification: 'After Your Modified Order',
  }

  const baseQuestions = [
    {
      id: 'order_filed',
      type: 'yes_no' as const,
      prompt: 'Have you filed the signed order with the district clerk?',
      helpText: 'Your case is NOT final until the signed order is filed with the clerk. This is a separate step from the judge signing it.',
    },
    {
      id: 'order_filed_warning',
      type: 'info' as const,
      prompt: 'IMPORTANT: Return to the clerk\'s office and file the signed order immediately. Until it is filed, your case is not legally final.',
      showIf: (a: Record<string, string>) => a.order_filed === 'no',
    },
    {
      id: 'certified_copies',
      type: 'yes_no' as const,
      prompt: 'Have you obtained certified copies of the final order?',
      helpText: 'Get at least 3-5 certified copies. You will need them for schools, employers, banks, and other institutions. Fees are typically $2-$5 per page.',
    },
    {
      id: 'vs165_filed',
      type: 'yes_no' as const,
      prompt: 'Have you filed the VS-165 form (Information on Suit Affecting the Family Relationship)?',
      helpText: 'This form is required by the Bureau of Vital Statistics. Ask the clerk for the form if you don\'t have it.',
    },
  ]

  const divorceQuestions = subType === 'divorce' ? [
    {
      id: 'remarriage_info',
      type: 'info' as const,
      prompt: 'REMARRIAGE RESTRICTION: Texas law imposes a 30-day waiting period after the divorce is final before either party can remarry (unless the judge waives it or you remarry each other).',
    },
    {
      id: 'name_change',
      type: 'yes_no' as const,
      prompt: 'Did the decree include a name change?',
    },
    {
      id: 'name_change_steps',
      type: 'info' as const,
      prompt: 'NAME CHANGE — Update in this order:\n1. Social Security Administration (update SS card first — foundation for all other changes)\n2. Texas DPS (driver\'s license / state ID)\n3. Voter registration (through your county)\n4. U.S. Passport (State Department)\n5. Banks, credit cards, insurance, employers\n6. Utility companies and subscriptions',
      showIf: (a: Record<string, string>) => a.name_change === 'yes',
    },
    {
      id: 'property_transfers',
      type: 'yes_no' as const,
      prompt: 'Does the decree require property transfers (real estate, vehicles, retirement accounts)?',
    },
    {
      id: 'property_transfer_steps',
      type: 'info' as const,
      prompt: 'PROPERTY TRANSFERS:\n• Real estate: File a Special Warranty Deed with the county clerk where the property is located\n• Vehicles: Take a certified copy of the decree and VIN to the county tax office\n• Retirement accounts: Send the certified QDRO and decree to the plan administrator via certified mail\n• Bank accounts: Take a certified copy of the decree to each bank',
      showIf: (a: Record<string, string>) => a.property_transfers === 'yes',
    },
    {
      id: 'beneficiary_updates',
      type: 'info' as const,
      prompt: 'UPDATE LEGAL DOCUMENTS:\n• Revise your will and estate plan\n• Update life insurance beneficiaries\n• Update retirement account beneficiaries\n• Review powers of attorney and healthcare directives\n• Update emergency contacts everywhere\n\nThe decree does NOT automatically change your beneficiaries.',
    },
  ] : []

  const supportQuestions = ['child_support', 'spousal_support', 'custody', 'modification'].includes(subType) ? [
    {
      id: 'support_ordered',
      type: 'yes_no' as const,
      prompt: 'Was child support or spousal support ordered?',
    },
    {
      id: 'support_setup_info',
      type: 'info' as const,
      prompt: 'SUPPORT PAYMENT SETUP:\n• Ask the clerk how to establish a child support account\n• Request the clerk send the Income Withholding Order to the employer\n• Complete the Record of Support Order (Form 1828A)\n• All payments should go through the Texas State Disbursement Unit (SDU) — NOT directly to the other party\n• Direct payments may be considered "gifts" and not credited toward your obligation\n• Texas AG child support help: 1-800-252-8014',
      showIf: (a: Record<string, string>) => a.support_ordered === 'yes',
    },
  ] : []

  const notifyQuestions = ['custody', 'visitation', 'modification'].includes(subType) ? [
    {
      id: 'institutions_notified',
      type: 'yes_no' as const,
      prompt: 'Have you notified relevant institutions (schools, doctors, daycare)?',
    },
    {
      id: 'notify_info',
      type: 'info' as const,
      prompt: 'NOTIFY WITH CERTIFIED COPIES:\n• Child\'s school (enrollment, pickup authorization, emergency contacts)\n• Medical providers (consent and access rights)\n• Daycare / aftercare providers\n• Insurance companies (if health coverage was ordered)\n• Keep certified copies accessible for law enforcement if needed',
      showIf: (a: Record<string, string>) => a.institutions_notified === 'no',
    },
  ] : []

  return {
    title: titles[subType],
    reassurance: 'The court order is signed — but there are important steps to make it effective and protect yourself going forward.',
    questions: [...baseQuestions, ...divorceQuestions, ...supportQuestions, ...notifyQuestions],
    generateSummary(answers) {
      const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

      if (answers.order_filed === 'yes') {
        items.push({ status: 'done', text: 'Signed order filed with the clerk.' })
      } else {
        items.push({ status: 'needed', text: 'File the signed order with the district clerk — your case is not final until this is done.' })
      }

      if (answers.certified_copies === 'yes') {
        items.push({ status: 'done', text: 'Certified copies obtained.' })
      } else {
        items.push({ status: 'needed', text: 'Get 3-5 certified copies of the final order from the clerk.' })
      }

      if (answers.vs165_filed === 'yes') {
        items.push({ status: 'done', text: 'VS-165 form filed.' })
      } else {
        items.push({ status: 'needed', text: 'File the VS-165 form with the clerk for vital statistics.' })
      }

      if (subType === 'divorce') {
        items.push({ status: 'info', text: '30-day remarriage waiting period applies.' })
        if (answers.name_change === 'yes') {
          items.push({ status: 'needed', text: 'Begin name change process: SS card → DPS → passport → accounts.' })
        }
        if (answers.property_transfers === 'yes') {
          items.push({ status: 'needed', text: 'Complete property transfers: deeds, vehicle titles, QDRO submission.' })
        }
      }

      return items
    },
  }
}
```

### Step 2: Verify it compiles

Run: `cd "/Users/minwang/lawyer free" && npx tsc --noEmit packages/shared/src/guided-steps/family/family-post-decree.ts`

### Step 3: Commit

```bash
git add packages/shared/src/guided-steps/family/family-post-decree.ts
git commit -m "feat(family): add post-decree guided step with name change, property transfer, and support setup guidance"
```

---

## Task 3: UCCJEA Affidavit Step (Custody)

**Why:** Texas Family Code § 152.209 requires a UCCJEA affidavit in EVERY initial SAPCR filing — 5-year address history for the child. Missing this can get your case dismissed.

**Files:**
- Create: `packages/shared/src/guided-steps/family/family-uccjea-affidavit.ts`

### Step 1: Create the guided step config

Create `packages/shared/src/guided-steps/family/family-uccjea-affidavit.ts`:

```typescript
import type { GuidedStepConfig } from '../types'

export const uccjeaAffidavitConfig: GuidedStepConfig = {
  title: 'UCCJEA Affidavit — Child Address History',
  reassurance: 'Texas requires this information in every custody case. It helps the court confirm it has jurisdiction over your child. Take your time — accuracy is critical.',

  questions: [
    {
      id: 'uccjea_intro',
      type: 'info',
      prompt: 'The Uniform Child Custody Jurisdiction and Enforcement Act (UCCJEA) requires you to disclose your child\'s living history for the past 5 years. This is mandatory under Texas Family Code § 152.209.',
    },
    {
      id: 'child_current_state',
      type: 'single_choice',
      prompt: 'Has the child lived in Texas for the last 6 months?',
      helpText: 'Texas must be the child\'s "home state" for the court to have jurisdiction. For infants under 6 months, Texas is the home state if the child has lived here since birth.',
      options: [
        { value: 'yes', label: 'Yes — child has lived in Texas for 6+ months' },
        { value: 'infant', label: 'Child is under 6 months and was born in Texas' },
        { value: 'recently_moved', label: 'Child recently moved to Texas (less than 6 months)' },
        { value: 'no', label: 'No — child does not live in Texas' },
      ],
    },
    {
      id: 'jurisdiction_warning',
      type: 'info',
      prompt: 'If the child has not lived in Texas for 6 months, Texas may not have jurisdiction. You may need to file in the child\'s home state instead. Consider consulting an attorney about jurisdiction issues.',
      showIf: (a) => a.child_current_state === 'recently_moved' || a.child_current_state === 'no',
    },
    {
      id: 'addresses_prepared',
      type: 'yes_no',
      prompt: 'Can you list every address where the child has lived for the past 5 years?',
      helpText: 'Include: full address, dates lived there, and the names of every person the child lived with at each address.',
    },
    {
      id: 'addresses_help',
      type: 'info',
      prompt: 'You need to document:\n1. Each address where the child has lived (past 5 years)\n2. Start and end dates at each address\n3. Full names of every person who lived with the child at each address\n\nThis includes time with both parents, grandparents, or anyone else.',
      showIf: (a) => a.addresses_prepared === 'no',
    },
    {
      id: 'other_proceedings',
      type: 'yes_no',
      prompt: 'Are you aware of any other custody proceedings involving this child (in any state)?',
    },
    {
      id: 'other_proceedings_info',
      type: 'info',
      prompt: 'You must disclose all other custody proceedings. This includes: pending cases in other states, prior custody orders from any court, and any CPS or child welfare investigations. Failure to disclose can result in dismissal.',
      showIf: (a) => a.other_proceedings === 'yes',
    },
    {
      id: 'other_claims',
      type: 'yes_no',
      prompt: 'Is there anyone (not a party to this case) who claims custody or visitation rights to the child?',
    },
    {
      id: 'other_claims_info',
      type: 'info',
      prompt: 'You must disclose anyone else who claims custody or visitation — such as grandparents, other relatives, or non-parent caregivers. The court needs this to ensure all affected parties are notified.',
      showIf: (a) => a.other_claims === 'yes',
    },
    {
      id: 'continuing_duty',
      type: 'info',
      prompt: 'CONTINUING DUTY: You must update the court if any of this information changes during the case. This is a legal obligation under § 152.209.',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.child_current_state === 'yes' || answers.child_current_state === 'infant') {
      items.push({ status: 'done', text: 'Texas has home state jurisdiction.' })
    } else if (answers.child_current_state) {
      items.push({ status: 'needed', text: 'Jurisdiction may be an issue — consider consulting an attorney.' })
    }

    if (answers.addresses_prepared === 'yes') {
      items.push({ status: 'done', text: '5-year address history prepared.' })
    } else {
      items.push({ status: 'needed', text: 'Prepare 5-year address history with dates and names of all persons the child lived with.' })
    }

    if (answers.other_proceedings === 'yes') {
      items.push({ status: 'needed', text: 'Disclose all other custody proceedings in the UCCJEA affidavit.' })
    }

    if (answers.other_claims === 'yes') {
      items.push({ status: 'needed', text: 'Disclose all persons claiming custody or visitation rights.' })
    }

    items.push({ status: 'info', text: 'Remember: you must update the court if this information changes during the case.' })
    return items
  },
}
```

### Step 2: Verify it compiles

Run: `cd "/Users/minwang/lawyer free" && npx tsc --noEmit packages/shared/src/guided-steps/family/family-uccjea-affidavit.ts`

### Step 3: Commit

```bash
git add packages/shared/src/guided-steps/family/family-uccjea-affidavit.ts
git commit -m "feat(family): add UCCJEA affidavit guided step for custody jurisdiction verification"
```

---

## Task 4: AG vs. Private Filing Option (Child Support)

**Why:** The Texas AG Child Support Division handles most cases for free. Many pro se users don't know this exists and file privately when the AG could handle it at no cost.

**Files:**
- Create: `packages/shared/src/guided-steps/family/family-ag-option.ts`

### Step 1: Create the guided step config

Create `packages/shared/src/guided-steps/family/family-ag-option.ts`:

```typescript
import type { GuidedStepConfig } from '../types'

export const agOptionConfig: GuidedStepConfig = {
  title: 'Filing Options — AG vs. Private Petition',
  reassurance: 'Before you file on your own, you should know about a free option. The Texas Attorney General\'s office can help establish child support at no cost to you.',

  questions: [
    {
      id: 'ag_intro',
      type: 'info',
      prompt: 'You have two paths to establish child support:\n\n1. TEXAS AG CHILD SUPPORT DIVISION (free) — The AG locates the other parent, establishes paternity if needed, obtains the support order, and enforces it. No cost to you.\n\n2. PRIVATE PETITION (you file) — You control the timeline and can negotiate specific terms, but you pay filing fees and handle service yourself.',
    },
    {
      id: 'filing_path',
      type: 'single_choice',
      prompt: 'Which path would you like to take?',
      options: [
        { value: 'ag', label: 'Texas AG — free, they handle everything' },
        { value: 'private', label: 'Private petition — I want to file myself' },
        { value: 'not_sure', label: 'Not sure — tell me more' },
      ],
    },
    {
      id: 'ag_details',
      type: 'info',
      prompt: 'TEXAS AG PATH:\n• Apply at texasattorneygeneral.gov/child-support or call 1-800-255-8014\n• The AG does NOT represent you — they represent the state\'s interest in the child\n• Cases can take longer due to high caseloads\n• Less control over specific terms beyond guideline amounts\n• Best for: straightforward cases where you want guideline support\n\nIMPORTANT: If the child receives Medicaid, SNAP, TANF, or WIC, the AG may already be involved or required to be notified.',
      showIf: (a) => a.filing_path === 'ag' || a.filing_path === 'not_sure',
    },
    {
      id: 'private_details',
      type: 'info',
      prompt: 'PRIVATE PETITION PATH:\n• File a SAPCR in district court in the county where the child lives\n• Filing fees apply ($250-$350, fee waiver available)\n• You handle service of process\n• You control the timeline\n• More flexibility on terms (e.g., above-guideline support)\n• Best for: when you want specific terms or faster resolution',
      showIf: (a) => a.filing_path === 'private' || a.filing_path === 'not_sure',
    },
    {
      id: 'government_benefits',
      type: 'yes_no',
      prompt: 'Does the child receive Medicaid, SNAP, TANF, or WIC?',
    },
    {
      id: 'benefits_info',
      type: 'info',
      prompt: 'Since the child receives government benefits, the AG\'s office may already be involved or may need to be notified. Even if you file privately, you must send a file-stamped copy of your petition to the county AG child support office via certified mail.',
      showIf: (a) => a.government_benefits === 'yes',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.filing_path === 'ag') {
      items.push({ status: 'done', text: 'Chosen path: Texas AG Child Support Division (free).' })
      items.push({ status: 'needed', text: 'Apply at texasattorneygeneral.gov/child-support or call 1-800-255-8014.' })
      items.push({ status: 'info', text: 'The remaining steps in this workflow apply to private petitions. The AG will guide you through their process.' })
    } else if (answers.filing_path === 'private') {
      items.push({ status: 'done', text: 'Chosen path: Private petition (you file).' })
      items.push({ status: 'info', text: 'Continue with the next steps to prepare and file your petition.' })
    } else {
      items.push({ status: 'needed', text: 'Decide between the AG path (free) and filing privately.' })
    }

    if (answers.government_benefits === 'yes') {
      items.push({ status: 'needed', text: 'Notify the AG\'s office — required when the child receives government benefits.' })
    }

    return items
  },
}
```

### Step 2: Verify and commit

```bash
git add packages/shared/src/guided-steps/family/family-ag-option.ts
git commit -m "feat(family): add AG vs private filing option for child support cases"
```

---

## Task 5: Spousal Support Eligibility Screening

**Why:** Court-ordered spousal maintenance has strict eligibility requirements (§ 8.051). Without screening, users may waste time filing for something they don't qualify for.

**Files:**
- Create: `packages/shared/src/guided-steps/family/family-spousal-eligibility.ts`

### Step 1: Create the guided step config

Create `packages/shared/src/guided-steps/family/family-spousal-eligibility.ts`:

```typescript
import type { GuidedStepConfig } from '../types'

export const spousalEligibilityConfig: GuidedStepConfig = {
  title: 'Spousal Support Eligibility Check',
  reassurance: 'Texas has specific rules about who qualifies for court-ordered maintenance. Let\'s check your eligibility so you know what to expect.',

  questions: [
    {
      id: 'support_type_intro',
      type: 'info',
      prompt: 'Texas has TWO types of spousal support:\n\n1. COURT-ORDERED MAINTENANCE — The judge orders it. Strict eligibility rules, capped at $5,000/month or 20% of gross income.\n\n2. CONTRACTUAL ALIMONY — You and your spouse agree to it. No eligibility test, no cap on amount or duration, but very hard to modify later.\n\nThis screening checks your eligibility for court-ordered maintenance.',
    },
    {
      id: 'financial_need',
      type: 'yes_no',
      prompt: 'Will you lack sufficient property (including from the property division) to provide for your minimum reasonable needs?',
      helpText: 'This means: after the divorce divides the property, you still cannot meet your basic needs (housing, food, utilities, transportation, medical care).',
    },
    {
      id: 'need_warning',
      type: 'info',
      prompt: 'Financial need is the first requirement. If the property division gives you enough to meet your basic needs, the court will not order maintenance — but you can still negotiate contractual alimony as part of your settlement.',
      showIf: (a) => a.financial_need === 'no',
    },
    {
      id: 'qualifying_circumstance',
      type: 'single_choice',
      prompt: 'Which of these applies to your situation?',
      helpText: 'You must meet at least one of these to qualify for court-ordered maintenance.',
      options: [
        { value: 'violence', label: 'My spouse was convicted of or received deferred adjudication for family violence within the last 2 years' },
        { value: 'ten_years', label: 'We have been married for 10 or more years' },
        { value: 'disability', label: 'I have a physical or mental disability that prevents me from earning enough income' },
        { value: 'disabled_child', label: 'I am the primary caretaker of our child who has a disability requiring substantial care' },
        { value: 'none', label: 'None of these apply' },
      ],
    },
    {
      id: 'not_eligible_info',
      type: 'info',
      prompt: 'Based on your answers, you may not qualify for COURT-ORDERED maintenance. However, you can still negotiate CONTRACTUAL ALIMONY as part of your divorce settlement. Contractual alimony has no eligibility test — any amount and duration you both agree to. Discuss this during mediation or settlement negotiations.',
      showIf: (a) => a.qualifying_circumstance === 'none' || a.financial_need === 'no',
    },
    {
      id: 'duration_info',
      type: 'info',
      prompt: 'DURATION LIMITS for court-ordered maintenance:\n• Family violence (any marriage length): up to 5 years\n• Marriage of 10-20 years: up to 5 years\n• Marriage of 20-30 years: up to 7 years\n• Marriage of 30+ years: up to 10 years\n• Disability or disabled child caretaker: no maximum (reviewed periodically)',
      showIf: (a) => a.qualifying_circumstance !== 'none' && a.financial_need === 'yes',
    },
    {
      id: 'amount_info',
      type: 'info',
      prompt: 'AMOUNT CAP: The court cannot order more than the lesser of $5,000/month or 20% of the paying spouse\'s average monthly gross income. There is no formula — the judge decides within these limits.\n\nTermination triggers: maintenance ends automatically upon remarriage, death of either party, or cohabitation with a romantic partner.',
      showIf: (a) => a.qualifying_circumstance !== 'none' && a.financial_need === 'yes',
    },
    {
      id: 'diligent_effort',
      type: 'info',
      prompt: 'IMPORTANT (10+ year marriages): You must demonstrate diligent efforts toward becoming self-sufficient during the separation. This means actively seeking employment, education, or training. The court will ask about your efforts.',
      showIf: (a) => a.qualifying_circumstance === 'ten_years',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    const eligible = answers.financial_need === 'yes' && answers.qualifying_circumstance !== 'none'

    if (eligible) {
      items.push({ status: 'done', text: 'You likely qualify for court-ordered spousal maintenance.' })
      const durations: Record<string, string> = {
        violence: 'Up to 5 years',
        ten_years: 'Up to 5-10 years (depends on marriage length)',
        disability: 'No maximum (reviewed periodically)',
        disabled_child: 'No maximum (reviewed periodically)',
      }
      if (answers.qualifying_circumstance && durations[answers.qualifying_circumstance]) {
        items.push({ status: 'info', text: `Maximum duration: ${durations[answers.qualifying_circumstance]}` })
      }
      items.push({ status: 'info', text: 'Cap: lesser of $5,000/month or 20% of spouse\'s gross income.' })
    } else {
      items.push({ status: 'info', text: 'Court-ordered maintenance may not be available, but contractual alimony can be negotiated.' })
    }

    return items
  },
}
```

### Step 2: Verify and commit

```bash
git add packages/shared/src/guided-steps/family/family-spousal-eligibility.ts
git commit -m "feat(family): add spousal support eligibility screening with duration/amount guidance"
```

---

## Task 6: Paternity Establishment Step

**Why:** Before custody or child support can be ordered for unmarried parents, legal paternity must be established. No step currently handles this.

**Files:**
- Create: `packages/shared/src/guided-steps/family/family-paternity.ts`

### Step 1: Create the guided step config

Create `packages/shared/src/guided-steps/family/family-paternity.ts`:

```typescript
import type { GuidedStepConfig } from '../types'

export const paternityConfig: GuidedStepConfig = {
  title: 'Establishing Paternity',
  reassurance: 'Before the court can order custody or child support, legal paternity must be established. This step helps you determine if paternity is already established or what you need to do.',

  questions: [
    {
      id: 'parents_married',
      type: 'single_choice',
      prompt: 'Were the parents married when the child was born?',
      options: [
        { value: 'married_at_birth', label: 'Yes — married at the time of birth' },
        { value: 'married_within_300', label: 'Divorced, but within 300 days before birth' },
        { value: 'married_after', label: 'Married after the child was born' },
        { value: 'never_married', label: 'Never married' },
      ],
    },
    {
      id: 'presumed_info',
      type: 'info',
      prompt: 'PATERNITY IS PRESUMED: Since the parents were married (or recently divorced), paternity is legally presumed under Texas law. You do not need to take additional steps to establish paternity.',
      showIf: (a) => a.parents_married === 'married_at_birth' || a.parents_married === 'married_within_300' || a.parents_married === 'married_after',
    },
    {
      id: 'aop_signed',
      type: 'yes_no',
      prompt: 'Was an Acknowledgment of Paternity (AOP) signed?',
      helpText: 'This is often signed at the hospital at birth, or later through a certified entity. If both parents signed it, paternity may already be established.',
      showIf: (a) => a.parents_married === 'never_married',
    },
    {
      id: 'aop_established',
      type: 'info',
      prompt: 'PATERNITY IS ESTABLISHED: A signed AOP filed with Texas Vital Statistics has the same legal effect as a court order. You do not need to take additional steps.\n\nNote: An AOP can be rescinded within 60 days of signing. After that, it can only be challenged by proving fraud, duress, or material mistake of fact.',
      showIf: (a) => a.parents_married === 'never_married' && a.aop_signed === 'yes',
    },
    {
      id: 'paternity_path',
      type: 'single_choice',
      prompt: 'Since paternity is not yet established, how would you like to proceed?',
      showIf: (a) => a.parents_married === 'never_married' && a.aop_signed === 'no',
      options: [
        { value: 'voluntary', label: 'The other parent will sign an Acknowledgment voluntarily' },
        { value: 'court_order', label: 'I need the court to establish paternity (DNA testing)' },
        { value: 'not_sure', label: 'Not sure' },
      ],
    },
    {
      id: 'voluntary_info',
      type: 'info',
      prompt: 'VOLUNTARY ACKNOWLEDGMENT:\n• Both parents sign an AOP form under penalty of perjury\n• Free to complete\n• Can be signed at a certified entity (call 866-255-2006)\n• Once filed with Texas Vital Statistics, it has the same legal effect as a court order\n• If a presumed father exists (e.g., mother was married to someone else), a Denial of Paternity must also be filed',
      showIf: (a) => a.paternity_path === 'voluntary',
    },
    {
      id: 'court_order_info',
      type: 'info',
      prompt: 'COURT-ORDERED PATERNITY:\n• File a paternity suit in district court\n• The court orders genetic (DNA) testing — simple, accurate, and often available through the AG at no cost\n• If the alleged father refuses testing, the court may presume paternity\n• Once paternity is adjudicated, the court can immediately order custody and support\n• The Texas AG can also establish paternity through their process at no cost: 1-800-255-8014',
      showIf: (a) => a.paternity_path === 'court_order' || a.paternity_path === 'not_sure',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    const presumed = answers.parents_married === 'married_at_birth' || answers.parents_married === 'married_within_300' || answers.parents_married === 'married_after'
    const aopEstablished = answers.parents_married === 'never_married' && answers.aop_signed === 'yes'

    if (presumed || aopEstablished) {
      items.push({ status: 'done', text: 'Paternity is established.' })
    } else if (answers.paternity_path === 'voluntary') {
      items.push({ status: 'needed', text: 'Complete and file an Acknowledgment of Paternity (AOP). Call 866-255-2006 for assistance.' })
    } else if (answers.paternity_path === 'court_order' || answers.paternity_path === 'not_sure') {
      items.push({ status: 'needed', text: 'File a paternity suit or contact the Texas AG at 1-800-255-8014 for free paternity establishment.' })
    } else {
      items.push({ status: 'needed', text: 'Determine if paternity is established before proceeding.' })
    }

    return items
  },
}
```

### Step 2: Verify and commit

```bash
git add packages/shared/src/guided-steps/family/family-paternity.ts
git commit -m "feat(family): add paternity establishment step for unmarried parents"
```

---

## Task 7: County Standing Orders Awareness

**Why:** Many TX counties automatically impose injunctions upon filing. Users who violate standing orders unknowingly (e.g., canceling insurance, hiding assets) can face contempt.

**Files:**
- Create: `packages/shared/src/guided-steps/family/family-standing-orders.ts`

### Step 1: Create the guided step config

Create `packages/shared/src/guided-steps/family/family-standing-orders.ts`:

```typescript
import type { GuidedStepConfig } from '../types'

export const standingOrdersConfig: GuidedStepConfig = {
  title: 'County Standing Orders',
  reassurance: 'Many Texas counties have automatic rules that take effect the moment you file. Understanding these protects you from accidental violations.',

  questions: [
    {
      id: 'standing_orders_intro',
      type: 'info',
      prompt: 'WHAT ARE STANDING ORDERS?\n\nMany Texas counties (including Harris, Dallas, Travis, Tarrant, Bexar, and Collin) have automatic injunctions that take effect immediately when a family law case is filed. These apply to BOTH parties — even before the other party is served.\n\nViolating a standing order can result in contempt of court.',
    },
    {
      id: 'standing_orders_aware',
      type: 'yes_no',
      prompt: 'Have you checked whether your county has standing orders?',
      helpText: 'Ask the district clerk when you file, or check your county\'s district court website. The clerk may attach the standing orders to your petition.',
    },
    {
      id: 'check_info',
      type: 'info',
      prompt: 'How to find out:\n• Ask the district clerk when you file\n• Check your county\'s family court website\n• Look for "Standing Orders" or "Local Rules" for family cases\n• The clerk may automatically attach them to your filed petition',
      showIf: (a) => a.standing_orders_aware === 'no',
    },
    {
      id: 'typical_prohibitions',
      type: 'info',
      prompt: 'TYPICAL STANDING ORDER PROHIBITIONS (for both parties):\n\n• Do NOT destroy, hide, or transfer community property\n• Do NOT cancel or change insurance policies (health, auto, life, homeowner\'s)\n• Do NOT make extraordinary purchases or expenditures\n• Do NOT harass, threaten, or intimidate the other party\n• Do NOT remove children from the jurisdiction without agreement or court order\n• Do NOT change locks or deny access to shared residence (unless a protective order exists)\n• Do NOT destroy or alter documents, records, or electronic data\n• Do NOT open the other party\'s mail',
    },
    {
      id: 'understood',
      type: 'yes_no',
      prompt: 'Do you understand the restrictions that may apply?',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.standing_orders_aware === 'yes') {
      items.push({ status: 'done', text: 'Checked for county standing orders.' })
    } else {
      items.push({ status: 'needed', text: 'Check with the district clerk whether your county has standing orders.' })
    }

    items.push({ status: 'info', text: 'Standing orders apply to BOTH parties from the moment of filing. Do not destroy property, cancel insurance, or make extraordinary purchases.' })
    return items
  },
}
```

### Step 2: Verify and commit

```bash
git add packages/shared/src/guided-steps/family/family-standing-orders.ts
git commit -m "feat(family): add county standing orders awareness step"
```

---

## Task 8: 1-Year Modification Restriction Check

**Why:** Users can't modify custody within 1 year unless child safety is at risk (§ 156.102). Filing prematurely wastes time and money.

**Files:**
- Modify: `packages/shared/src/guided-steps/family/family-existing-order-review.ts`

### Step 1: Read current file and add restriction check

Add questions about the order date and whether it's been at least 1 year. Add the 3 exceptions (consent, endangerment, custody transfer).

The existing file has: `existing_order_uploaded`, `provisions_identified`, `material_change_documented`. Add before `material_change_documented`:

```typescript
// Add these questions to the existing questions array:
{
  id: 'order_date',
  type: 'text',
  prompt: 'When was the existing order signed by the judge?',
  placeholder: 'e.g., March 2025',
  helpText: 'This determines whether you can file now or need to wait.',
},
{
  id: 'one_year_warning',
  type: 'info',
  prompt: 'ONE-YEAR RULE: Texas law generally prohibits modifying custody/conservatorship within 1 year of the last order.\n\nEXCEPTIONS (you can file within 1 year if):\n1. The person with primary custody agrees to the change\n2. The child\'s current environment endangers their physical health or significantly harms emotional development\n3. The person with primary custody has allowed someone else to have primary care for 6+ months (military deployment excluded)\n\nFiling on endangerment grounds requires a sworn declaration with specific facts.',
},
{
  id: 'exception_applies',
  type: 'single_choice',
  prompt: 'If the order is less than 1 year old, does an exception apply?',
  showIf: (a) => a.what_to_modify === 'custody',
  options: [
    { value: 'over_one_year', label: 'The order is more than 1 year old — no exception needed' },
    { value: 'consent', label: 'The other parent agrees to the change' },
    { value: 'endangerment', label: 'The child\'s current environment is dangerous' },
    { value: 'custody_transfer', label: 'The custodial parent gave primary care to someone else for 6+ months' },
    { value: 'not_custody', label: 'I am only modifying support or visitation, not custody' },
  ],
},
{
  id: 'endangerment_info',
  type: 'info',
  prompt: 'ENDANGERMENT EXCEPTION: You must file a "Declaration in Support of Changing Primary Custody within One Year" with specific facts under penalty of perjury. The judge reviews this to decide whether to schedule a hearing. Be specific and factual — vague allegations will be rejected.',
  showIf: (a) => a.exception_applies === 'endangerment',
},
```

Also add to `generateSummary`:
```typescript
if (answers.exception_applies === 'endangerment') {
  items.push({ status: 'needed', text: 'Prepare a sworn declaration with specific facts for the 1-year exception.' })
}
```

### Step 2: Verify and commit

```bash
git add packages/shared/src/guided-steps/family/family-existing-order-review.ts
git commit -m "feat(family): add 1-year modification restriction check with exceptions"
```

---

## Task 9: QDRO Warning (Divorce Property Division)

**Why:** Failing to include a QDRO for retirement accounts is one of the most financially devastating mistakes in divorce. Even TexasLawHelp doesn't provide QDRO forms.

**Files:**
- Modify: `packages/shared/src/guided-steps/family/family-property-division.ts`

### Step 1: Add QDRO questions to existing file

Add after the existing retirement/property questions:

```typescript
{
  id: 'retirement_accounts',
  type: 'yes_no',
  prompt: 'Does either spouse have retirement accounts (401(k), pension, IRA)?',
},
{
  id: 'qdro_warning',
  type: 'info',
  prompt: 'CRITICAL — QDRO REQUIRED:\n\nDividing retirement accounts (401(k)s, pensions) requires a Qualified Domestic Relations Order (QDRO). This is a separate legal document that the plan administrator must approve.\n\n• TexasLawHelp does NOT provide QDRO forms\n• A defective or missing QDRO can permanently lose your community interest in the retirement plan\n• QDRO specialists typically charge $500-$1,500 — far less than the retirement benefits at stake\n• The QDRO must be included with or shortly after the final decree\n• IRAs can be divided by transfer incident to divorce without a QDRO, but must follow IRS rules\n\nSTRONG RECOMMENDATION: Hire a QDRO specialist or family law attorney for this part, even if you handle the rest yourself.',
  showIf: (a) => a.retirement_accounts === 'yes',
},
{
  id: 'debt_warning',
  type: 'info',
  prompt: 'DEBT REMINDER: Creditors are NOT bound by the divorce decree. If your name is on a joint debt, the creditor can still pursue you even if the decree assigns it to your spouse. Consider requiring refinancing as part of the settlement (especially for mortgages).',
},
```

### Step 2: Verify and commit

```bash
git add packages/shared/src/guided-steps/family/family-property-division.ts
git commit -m "feat(family): add QDRO warning and debt creditor reminder to property division"
```

---

## Task 10: Expanded SPO Details (Visitation/Custody)

**Why:** The current custody factors step mentions SPO briefly but lacks the expanded/long-distance schedules, holiday details, and under-age-3 rules.

**Files:**
- Modify: `packages/shared/src/guided-steps/family/family-custody-factors.ts`

### Step 1: Expand the SPO section

Add these questions to the existing `family-custody-factors.ts` after the current SPO mention:

```typescript
{
  id: 'parent_distance',
  type: 'single_choice',
  prompt: 'How far apart do the parents live?',
  options: [
    { value: 'under_50', label: 'Less than 50 miles apart' },
    { value: '50_to_100', label: '50-100 miles apart' },
    { value: 'over_100', label: 'More than 100 miles apart' },
  ],
},
{
  id: 'spo_under_50',
  type: 'info',
  prompt: 'EXPANDED SPO (default for parents within 50 miles):\n• Weekends: 1st, 3rd, 5th — Friday at school dismissal through Monday at school resumption\n• Thursdays: School dismissal through Friday at school resumption (overnight)\n• Spring break: Alternates yearly\n• Summer: 30 days (can split into two 7+ day periods)\n• Holidays override the regular schedule and alternate by odd/even year',
  showIf: (a) => a.parent_distance === 'under_50',
},
{
  id: 'spo_50_to_100',
  type: 'info',
  prompt: 'STANDARD SPO (50-100 miles):\n• Weekends: 1st, 3rd, 5th — Friday 6 p.m. through Sunday 6 p.m.\n• Thursdays: 6 p.m. to 8 p.m. (no overnight)\n• Spring break: Alternates yearly\n• Summer: 30 days\n• You may ELECT expanded times (school pickup/dropoff) — tell the court',
  showIf: (a) => a.parent_distance === '50_to_100',
},
{
  id: 'spo_over_100',
  type: 'info',
  prompt: 'LONG-DISTANCE SPO (100+ miles):\n• Weekends: Choose either 1st/3rd/5th OR one weekend per month (14 days written notice)\n• NO Thursday midweek visits\n• Spring break: EVERY year (not alternating)\n• Summer: 42 days (not 30)\n• Holiday schedule remains the same (alternating odd/even years)',
  showIf: (a) => a.parent_distance === 'over_100',
},
{
  id: 'child_age',
  type: 'single_choice',
  prompt: 'How old is the youngest child?',
  options: [
    { value: 'under_3', label: 'Under 3 years old' },
    { value: '3_or_older', label: '3 years or older' },
  ],
},
{
  id: 'under_3_info',
  type: 'info',
  prompt: 'CHILDREN UNDER 3:\nThe Standard Possession Order presumption does NOT apply to children under 3. The judge determines the schedule based on the child\'s developmental needs, each parent\'s caregiving history, and practical logistics.\n\nCourts often start with shorter, more frequent visits for very young children and expand the schedule as the child grows.',
  showIf: (a) => a.child_age === 'under_3',
},
{
  id: 'holiday_schedule',
  type: 'info',
  prompt: 'HOLIDAY SCHEDULE (alternates odd/even years):\n• Thanksgiving: School dismissal Wed through Sunday 6 p.m.\n• Christmas Part 1: School dismissal through noon Dec 28\n• Christmas Part 2: Noon Dec 28 through day before school resumes\n• Spring break: Alternates (or every year for 100+ miles)\n• Mother\'s/Father\'s Day: 6 p.m. Friday before through 6 p.m. on the day\n• Child\'s birthday: 6 p.m. to 8 p.m.\n• Monday holidays: Possession extends through Tuesday 8 a.m. if Monday is a school holiday',
},
{
  id: 'supervised_visitation',
  type: 'info',
  prompt: 'SUPERVISED VISITATION may be ordered when there are safety concerns (family violence, substance abuse, CPS history). Types: family member supervises, neutral third party, or professional supervision agency. To move from supervised to unsupervised, file a modification with evidence that unsupervised visits serve the child\'s best interest.',
},
```

### Step 2: Verify and commit

```bash
git add packages/shared/src/guided-steps/family/family-custody-factors.ts
git commit -m "feat(family): expand SPO details with distance tiers, under-3 rules, holidays, supervised visitation"
```

---

## Task 11: Database Migration — New Tasks + Updated Unlock Chains

**Why:** Tasks 1-7 created new guided step files, but the database doesn't know about the new task_keys yet. This migration adds the new tasks to the seed function and updates the unlock chain.

**Files:**
- Create: `supabase/migrations/20260403000001_family_workflow_improvements.sql`

### Step 1: Write the migration

This is the most complex piece. The migration must:

1. **Add new task_keys to `seed_family_tasks()`**:
   - `{subtype}_response_checkpoint` — after serve, before temp orders/final (all except PO)
   - `{subtype}_post_decree` — after final orders (all sub-types)
   - `custody_uccjea_affidavit` — after custody_intake, before custody_safety_screening
   - `child_support_ag_option` — after child_support_intake, before child_support_evidence_vault
   - `spousal_support_eligibility` — after spousal_support_intake, before spousal_support_evidence_vault
   - `custody_paternity` / `child_support_paternity` — after intake, before evidence vault (for custody & child_support)
   - `divorce_standing_orders` — after divorce_file_with_court, before divorce_serve_respondent

2. **Update `unlock_next_task()` with new transitions and branching**:
   - Response checkpoint branching: `agreed` → skip to final orders, `no_response` → skip mediation → final orders, `answer_filed` → temp orders → mediation → final
   - UCCJEA: custody_intake → custody_uccjea_affidavit → custody_safety_screening
   - AG option: child_support_intake → child_support_ag_option → child_support_evidence_vault
   - Eligibility: spousal_support_intake ��� spousal_support_eligibility → spousal_support_evidence_vault
   - Paternity: insert after intake for custody/child_support
   - Standing orders: divorce_file_with_court → divorce_standing_orders → divorce_serve_respondent
   - Post-decree: {subtype}_final_orders → {subtype}_post_decree

3. **Backfill existing cases** — insert new tasks as 'locked' for existing family cases

The exact SQL is large (~300-400 lines) and follows the established patterns in `20260312000003_family_law_parity.sql`. The key patterns:

```sql
-- Seed example: add response_checkpoint after serve
(NEW.case_id, 'divorce_response_checkpoint', 'What Happened After Service?', 'locked'),

-- Unlock chain example: serve → response_checkpoint
IF NEW.task_key = 'divorce_serve_respondent' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
  UPDATE public.tasks SET status = 'todo', unlocked_at = now()
  WHERE case_id = NEW.case_id AND task_key = 'divorce_response_checkpoint' AND status = 'locked';
END IF;

-- Response checkpoint branching based on response_status
IF NEW.task_key = 'divorce_response_checkpoint' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
  v_response := COALESCE(NEW.metadata->'guided_answers'->>'response_status', 'answer_filed');

  IF v_response = 'agreed' THEN
    -- Skip temp orders, mediation, property division → go straight to final
    UPDATE public.tasks SET status = 'skipped'
    WHERE case_id = NEW.case_id
      AND task_key IN ('divorce_temporary_orders', 'divorce_mediation')
      AND status = 'locked';
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'divorce_property_division' AND status = 'locked';

  ELSIF v_response = 'no_response' THEN
    -- Default path: skip mediation
    UPDATE public.tasks SET status = 'skipped'
    WHERE case_id = NEW.case_id AND task_key = 'divorce_mediation' AND status = 'locked';
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'divorce_waiting_period' AND status = 'locked';

  ELSE -- answer_filed or waiting
    -- Contested path: normal chain continues
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'divorce_waiting_period' AND status = 'locked';
  END IF;
END IF;
```

### Step 2: Write the full migration

Write the complete SQL migration following the patterns above, covering all 7 sub-types and all new task insertions.

### Step 3: Test locally

Run: `cd "/Users/minwang/lawyer free" && npx supabase db reset`

Verify: Create a test family case and confirm the new tasks appear and unlock correctly.

### Step 4: Commit

```bash
git add supabase/migrations/20260403000001_family_workflow_improvements.sql
git commit -m "feat(family): add migration for response checkpoint, post-decree, UCCJEA, AG option, eligibility, paternity, standing orders"
```

---

## Task 12: Register New Step Configs in Step Router

**Why:** The guided step TypeScript files need to be imported and mapped to task_keys in the step page component so the UI renders the correct config when a user navigates to a task.

**Files:**
- Modify: `apps/web/src/app/(authenticated)/case/[id]/step/[taskId]/page.tsx` (the step routing file)

### Step 1: Add imports for all 7 new files

```typescript
import { createResponseCheckpointConfig } from '@shared/guided-steps/family/family-response-checkpoint'
import { createPostDecreeConfig } from '@shared/guided-steps/family/family-post-decree'
import { uccjeaAffidavitConfig } from '@shared/guided-steps/family/family-uccjea-affidavit'
import { agOptionConfig } from '@shared/guided-steps/family/family-ag-option'
import { spousalEligibilityConfig } from '@shared/guided-steps/family/family-spousal-eligibility'
import { paternityConfig } from '@shared/guided-steps/family/family-paternity'
import { standingOrdersConfig } from '@shared/guided-steps/family/family-standing-orders'
```

### Step 2: Add task_key → config mappings

In the switch/map where task_keys are resolved to configs, add entries for each new task_key. Pattern matches the existing code — look for the section that handles `divorce_intake`, `custody_intake`, etc. and add the new keys.

Example mappings:
```typescript
// Response checkpoint (all sub-types except PO)
'divorce_response_checkpoint': createResponseCheckpointConfig('divorce'),
'custody_response_checkpoint': createResponseCheckpointConfig('custody'),
'child_support_response_checkpoint': createResponseCheckpointConfig('child_support'),
'visitation_response_checkpoint': createResponseCheckpointConfig('visitation'),
'spousal_support_response_checkpoint': createResponseCheckpointConfig('spousal_support'),
'mod_response_checkpoint': createResponseCheckpointConfig('modification'),

// Post-decree (all sub-types except PO)
'divorce_post_decree': createPostDecreeConfig('divorce'),
'custody_post_decree': createPostDecreeConfig('custody'),
'child_support_post_decree': createPostDecreeConfig('child_support'),
'visitation_post_decree': createPostDecreeConfig('visitation'),
'spousal_support_post_decree': createPostDecreeConfig('spousal_support'),
'mod_post_decree': createPostDecreeConfig('modification'),

// Sub-type specific
'custody_uccjea_affidavit': uccjeaAffidavitConfig,
'child_support_ag_option': agOptionConfig,
'spousal_support_eligibility': spousalEligibilityConfig,
'custody_paternity': paternityConfig,
'child_support_paternity': paternityConfig,
'divorce_standing_orders': standingOrdersConfig,
```

### Step 3: Verify build compiles

Run: `cd "/Users/minwang/lawyer free" && npx tsc --noEmit`

### Step 4: Commit

```bash
git add apps/web/src/app/\(authenticated\)/case/\[id\]/step/\[taskId\]/page.tsx
git commit -m "feat(family): register all new guided step configs in step router"
```

---

## Updated Workflow Chains (After All Changes)

### DIVORCE (15 tasks, was 11):
```
welcome → divorce_intake → divorce_safety_screening → divorce_evidence_vault
→ divorce_prepare_filing → divorce_file_with_court → divorce_standing_orders [NEW]
→ divorce_serve_respondent → divorce_response_checkpoint [NEW]
  → [agreed] → divorce_property_division → divorce_final_orders → divorce_post_decree [NEW]
  → [no_response] → divorce_waiting_period → divorce_property_division → divorce_final_orders → divorce_post_decree [NEW]
  → [contested] → divorce_waiting_period → divorce_temporary_orders → divorce_mediation → divorce_property_division → divorce_final_orders → divorce_post_decree [NEW]
```

### CUSTODY (13 tasks, was 9):
```
welcome → custody_intake → custody_uccjea_affidavit [NEW] → custody_paternity [NEW]
→ custody_safety_screening → custody_evidence_vault → custody_prepare_filing
→ custody_file_with_court → custody_serve_respondent → custody_response_checkpoint [NEW]
  → [agreed] → custody_final_orders → custody_post_decree [NEW]
  → [no_response] → custody_final_orders → custody_post_decree [NEW]
  → [contested] → custody_temporary_orders → custody_mediation → custody_final_orders �� custody_post_decree [NEW]
```

### CHILD SUPPORT (11 tasks, was 7):
```
welcome → child_support_intake → child_support_ag_option [NEW] → child_support_paternity [NEW]
→ child_support_evidence_vault → child_support_prepare_filing
→ child_support_file_with_court → child_support_serve_respondent → child_support_response_checkpoint [NEW]
  → [agreed] → child_support_final_orders → child_support_post_decree [NEW]
  → [contested] → child_support_temporary_orders → child_support_final_orders → child_support_post_decree [NEW]
```

### VISITATION (11 tasks, was 8):
```
welcome → visitation_intake → visitation_safety_screening → visitation_evidence_vault
→ visitation_prepare_filing → visitation_file_with_court → visitation_serve_respondent
→ visitation_response_checkpoint [NEW]
  → [agreed] → visitation_final_orders → visitation_post_decree [NEW]
  → [contested] → visitation_mediation → visitation_final_orders → visitation_post_decree [NEW]
```

### SPOUSAL SUPPORT (10 tasks, was 7):
```
welcome → spousal_support_intake → spousal_support_eligibility [NEW]
→ spousal_support_evidence_vault → spousal_support_prepare_filing
→ spousal_support_file_with_court → spousal_support_serve_respondent
→ spousal_support_response_checkpoint [NEW]
  → [agreed] → spousal_support_final_orders �� spousal_support_post_decree [NEW]
  → [contested] → spousal_support_temporary_orders → spousal_support_final_orders → spousal_support_post_decree [NEW]
```

### PROTECTIVE ORDER (unchanged — 6 tasks):
```
welcome → po_intake → po_safety_screening → po_prepare_filing → po_file_with_court → po_hearing
```

### MODIFICATION (11 tasks, was 8):
```
welcome → mod_intake → mod_evidence_vault → mod_existing_order_review [MODIFIED: adds 1-year check]
→ mod_prepare_filing → mod_file_with_court → mod_serve_respondent
→ mod_response_checkpoint [NEW]
  → [agreed] → mod_final_orders → mod_post_decree [NEW]
  → [contested] → mod_mediation �� mod_final_orders → mod_post_decree [NEW]
```

---

## Summary of All Changes

| # | Item | Type | Files |
|---|------|------|-------|
| 1 | Response checkpoint | New step + migration | `family-response-checkpoint.ts`, migration |
| 2 | Post-decree steps | New step + migration | `family-post-decree.ts`, migration |
| 3 | UCCJEA affidavit | New step + migration | `family-uccjea-affidavit.ts`, migration |
| 4 | AG option | New step + migration | `family-ag-option.ts`, migration |
| 5 | Spousal eligibility | New step + migration | `family-spousal-eligibility.ts`, migration |
| 6 | Paternity | New step + migration | `family-paternity.ts`, migration |
| 7 | Standing orders | New step + migration | `family-standing-orders.ts`, migration |
| 8 | 1-year restriction | Modify existing | `family-existing-order-review.ts` |
| 9 | QDRO warning | Modify existing | `family-property-division.ts` |
| 10 | SPO expansion | Modify existing | `family-custody-factors.ts` |
| 11 | DB migration | New migration | `20260403000001_family_workflow_improvements.sql` |
| 12 | Step router | Modify existing | `page.tsx` (step routing) |
