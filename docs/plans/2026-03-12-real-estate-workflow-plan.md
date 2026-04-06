# Real Estate Workflow Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a top-level `real_estate` dispute type with 12 dedicated tasks, guided step configs, step guidance, milestones, and a DB migration — following existing contract/property workflow patterns.

**Architecture:** New `real_estate` dispute type mirrors the `property` workflow structure (5 phases, 12 tasks). One new guided step config (`re-evidence-vault`), plus 9 more configs for other `re_*` tasks. All wired through the same seed/unlock trigger functions in Supabase. One new `real_estate_details` table with RLS.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Supabase (PostgreSQL), Zod schemas

---

### Task 1: Add `real_estate` to TypeScript schemas

**Files:**
- Modify: `src/lib/schemas/case.ts`

**Step 1: Add the real_estate dispute type and sub-type arrays**

In `src/lib/schemas/case.ts`, make these changes:

1. Add `'real_estate'` to the `DISPUTE_TYPES` array (after `'property'`):

```typescript
export const DISPUTE_TYPES = [
  'debt_collection',
  'landlord_tenant',
  'personal_injury',
  'contract',
  'property',
  'real_estate',
  'family',
  'small_claims',
  'other',
] as const
```

2. Add the new sub-type array and type (after the `PROPERTY_DISPUTE_SUB_TYPES` block, around line 102):

```typescript
export const REAL_ESTATE_SUB_TYPES = [
  'failed_closing',
  'seller_disclosure',
  'buyer_breach',
  'title_defect',
  'earnest_money',
  'real_estate_fraud',
  'construction_defect',
  'other_real_estate',
] as const

export type RealEstateSubType = (typeof REAL_ESTATE_SUB_TYPES)[number]
```

3. Add `re_sub_type` to the `createCaseSchema` (after the `property_sub_type` line):

```typescript
re_sub_type: z.enum(REAL_ESTATE_SUB_TYPES).optional(),
```

**Step 2: Build to verify**

Run: `cd "/Users/minwang/lawyer free" && npx next build 2>&1 | tail -5`
Expected: Build succeeds

**Step 3: Commit**

```bash
cd "/Users/minwang/lawyer free"
git add src/lib/schemas/case.ts
git commit -m "feat(real-estate): add real_estate dispute type and sub-type schema"
```

---

### Task 2: Update the intake wizard to route `real_estate` to its own type

**Files:**
- Modify: `src/components/cases/wizard/dispute-type-step.tsx`

**Step 1: Change the real_estate option value**

In `src/components/cases/wizard/dispute-type-step.tsx`, find line 26:

```typescript
{ id: 'real_estate', value: 'property', label: 'Real estate', description: 'Real estate transactions, liens, or deed issues' },
```

Change `value: 'property'` to `value: 'real_estate'`:

```typescript
{ id: 'real_estate', value: 'real_estate', label: 'Real estate', description: 'Real estate transactions, liens, or deed issues' },
```

**Step 2: Build to verify**

Run: `cd "/Users/minwang/lawyer free" && npx next build 2>&1 | tail -5`
Expected: Build succeeds

**Step 3: Commit**

```bash
cd "/Users/minwang/lawyer free"
git add src/components/cases/wizard/dispute-type-step.tsx
git commit -m "feat(real-estate): route real_estate wizard option to its own dispute type"
```

---

### Task 3: Add workflow phases for real_estate

**Files:**
- Modify: `src/lib/workflow-phases.ts`

**Step 1: Add the real_estate phases**

In `src/lib/workflow-phases.ts`, add the `real_estate` entry after the `property` entry (after line 207):

```typescript
  real_estate: [
    {
      label: 'Getting Started',
      taskKeys: ['welcome', 're_intake'],
    },
    {
      label: 'Building Your Case',
      taskKeys: ['re_evidence_vault', 're_demand_letter', 're_negotiation'],
    },
    {
      label: 'Filing & Service',
      taskKeys: ['re_prepare_filing', 're_file_with_court', 're_serve_defendant'],
    },
    {
      label: 'Litigation',
      taskKeys: ['re_wait_for_answer', 're_review_answer', 're_discovery'],
    },
    {
      label: 'Resolution',
      taskKeys: ['re_post_resolution'],
    },
  ],
```

**Step 2: Build to verify**

Run: `cd "/Users/minwang/lawyer free" && npx next build 2>&1 | tail -5`
Expected: Build succeeds

**Step 3: Commit**

```bash
cd "/Users/minwang/lawyer free"
git add src/lib/workflow-phases.ts
git commit -m "feat(real-estate): add workflow phases for real_estate dispute type"
```

---

### Task 4: Add step guidance entries for all re_* tasks

**Files:**
- Modify: `src/lib/step-guidance.ts`

**Step 1: Add 11 step guidance entries**

In `src/lib/step-guidance.ts`, add a new section after the property entries (after `property_post_resolution` around line 491). Add before the `// --- Other ---` comment:

```typescript
  // --- Real Estate ---
  re_intake: {
    why: 'Property details, transaction timeline, and the nature of the dispute form the foundation of your real estate claim.',
    checklist: [
      'Purchase agreement or contract',
      'Property address and description',
      'Other party\'s name and role (buyer, seller, agent, etc.)',
      'Timeline of key events',
      'Amount of damages you\'re claiming',
    ],
    tip: 'Gather your closing documents and any correspondence with agents or title companies.',
  },
  re_evidence_vault: {
    why: 'Real estate disputes are document-heavy — organized evidence strengthens your position significantly.',
    checklist: [
      'Purchase agreement or contract',
      'Title report or title insurance policy',
      'Inspection report',
      'Closing documents (HUD-1 or settlement statement)',
      'Communications with other party or agents',
    ],
  },
  re_demand_letter: {
    why: 'A formal demand letter puts the other party on notice and often resolves real estate disputes without court.',
    checklist: [
      'Clear description of the breach or issue',
      'Specific dollar amount of damages',
      'Deadline to respond (typically 30 days)',
      'Copies of key supporting documents',
    ],
  },
  re_negotiation: {
    why: 'Many real estate disputes settle through negotiation, saving time and court costs.',
    checklist: [
      'Your minimum acceptable outcome',
      'Key evidence to reference',
      'Written record of all offers',
      'Timeline for resolution',
    ],
  },
  re_prepare_filing: {
    why: 'Filing requires specific forms and accurate information about the property and dispute.',
    checklist: [
      'Completed petition with property details',
      'Filing fee or fee waiver application',
      'Legal description of the property',
      'Correct court jurisdiction',
    ],
  },
  re_file_with_court: {
    why: 'Filing officially starts your lawsuit and establishes your claim timeline.',
    checklist: [
      'Completed petition and copies',
      'Filing fee payment',
      'Government-issued ID',
    ],
  },
  re_serve_defendant: {
    why: 'The defendant must be properly served for the court to have jurisdiction.',
    checklist: [
      'Certified copy of the petition',
      'Process server or constable contact',
      'Defendant\'s address for service',
    ],
  },
  re_wait_for_answer: {
    why: 'After service, the defendant typically has 20 days (Texas) to file an answer.',
    checklist: [
      'Service date and deadline calculation',
      'Monitor the court docket for filings',
      'Watch for mail from the court',
    ],
  },
  re_review_answer: {
    why: 'Understanding the defendant\'s response helps you prepare your strategy.',
    checklist: [
      'Read all claims and defenses',
      'Identify disputed vs. admitted facts',
      'Note any counterclaims against you',
    ],
  },
  re_discovery: {
    why: 'Discovery lets you request documents and information from the other party.',
    checklist: [
      'Written interrogatories (questions)',
      'Requests for production of documents',
      'Requests for admissions',
      'Responses to their discovery requests',
    ],
  },
  re_post_resolution: {
    why: 'After resolution, there may be steps to enforce a judgment or complete a transaction.',
    checklist: [
      'Record any judgment with the county',
      'Follow up on payment deadlines',
      'Update title records if needed',
      'Keep copies of all final documents',
    ],
  },
```

**Step 2: Build to verify**

Run: `cd "/Users/minwang/lawyer free" && npx next build 2>&1 | tail -5`
Expected: Build succeeds

**Step 3: Commit**

```bash
cd "/Users/minwang/lawyer free"
git add src/lib/step-guidance.ts
git commit -m "feat(real-estate): add step guidance entries for all re_* task keys"
```

---

### Task 5: Add milestones for real_estate

**Files:**
- Modify: `src/lib/rules/milestones.ts`

**Step 1: Add REAL_ESTATE_MILESTONES**

In `src/lib/rules/milestones.ts`, add a new section after PROPERTY_MILESTONES (after line 255):

```typescript
// -- Real Estate Milestones ---------------------------------------------------

const REAL_ESTATE_MILESTONES: Milestone[] = [
  {
    id: 'start',
    label: 'Just getting started',
    description: 'I haven\'t taken any action yet.',
    firstUnlockedTask: 'welcome',
    tasksToSkip: [],
  },
  {
    id: 'demand_sent',
    label: 'Sent a demand letter',
    description: 'I\'ve already sent a demand letter.',
    firstUnlockedTask: 're_prepare_filing',
    tasksToSkip: [
      'welcome',
      're_intake',
      're_evidence_vault',
      're_demand_letter',
      're_negotiation',
    ],
  },
  {
    id: 'filed',
    label: 'Filed with court',
    description: 'I\'ve already filed my case with the court.',
    firstUnlockedTask: 're_file_with_court',
    tasksToSkip: [
      'welcome',
      're_intake',
      're_evidence_vault',
      're_demand_letter',
      're_negotiation',
      're_prepare_filing',
    ],
  },
  {
    id: 'served',
    label: 'Served the other party',
    description: 'I\'ve served the other party with the lawsuit.',
    firstUnlockedTask: 're_wait_for_answer',
    tasksToSkip: [
      'welcome',
      're_intake',
      're_evidence_vault',
      're_demand_letter',
      're_negotiation',
      're_prepare_filing',
      're_file_with_court',
      're_serve_defendant',
    ],
  },
  {
    id: 'in_litigation',
    label: 'In litigation',
    description: 'I\'m in the litigation phase (discovery, motions, etc.).',
    firstUnlockedTask: 're_discovery',
    tasksToSkip: [
      'welcome',
      're_intake',
      're_evidence_vault',
      're_demand_letter',
      're_negotiation',
      're_prepare_filing',
      're_file_with_court',
      're_serve_defendant',
      're_wait_for_answer',
      're_review_answer',
    ],
  },
]
```

**Step 2: Add to dispatch map**

In the `MILESTONES_BY_TYPE` record (around line 805), add:

```typescript
  real_estate: REAL_ESTATE_MILESTONES,
```

Add it after the `property` entry.

**Step 3: Build to verify**

Run: `cd "/Users/minwang/lawyer free" && npx next build 2>&1 | tail -5`
Expected: Build succeeds

**Step 4: Commit**

```bash
cd "/Users/minwang/lawyer free"
git add src/lib/rules/milestones.ts
git commit -m "feat(real-estate): add milestones for mid-litigation onboarding"
```

---

### Task 6: Add re_* to SKIPPABLE_TASKS in sidebar and next-step card

**Files:**
- Modify: `src/components/case/workflow-sidebar.tsx`
- Modify: `src/components/dashboard/next-step-card.tsx`

**Step 1: Add to workflow-sidebar.tsx**

In `src/components/case/workflow-sidebar.tsx`, add to the `SKIPPABLE_TASKS` Set (around line 16-30). Add these two entries alongside the other demand letter / negotiation entries:

```typescript
  're_demand_letter',
  're_negotiation',
```

Add them after the existing `'property_negotiation'` entry.

**Step 2: Add to next-step-card.tsx**

In `src/components/dashboard/next-step-card.tsx`, add `'re_demand_letter'` to the `SKIPPABLE_TASKS` Set (around line 9-15):

```typescript
  're_demand_letter',
```

Add it after the existing `'sc_demand_letter'` entry.

**Step 3: Build to verify**

Run: `cd "/Users/minwang/lawyer free" && npx next build 2>&1 | tail -5`
Expected: Build succeeds

**Step 4: Commit**

```bash
cd "/Users/minwang/lawyer free"
git add src/components/case/workflow-sidebar.tsx src/components/dashboard/next-step-card.tsx
git commit -m "feat(real-estate): add re_demand_letter and re_negotiation to skippable tasks"
```

---

### Task 7: Create the RE evidence vault guided step config

**Files:**
- Create: `src/lib/guided-steps/real-estate/re-evidence-vault.ts`

**Step 1: Create the directory and file**

Create `src/lib/guided-steps/real-estate/re-evidence-vault.ts`:

```typescript
import type { GuidedStepConfig } from '../types'

export const reEvidenceVaultConfig: GuidedStepConfig = {
  title: 'Organize Your Evidence',
  reassurance:
    'Real estate disputes are won with documents. Organizing your evidence now makes every future step easier.',

  questions: [
    {
      id: 'has_purchase_agreement',
      type: 'yes_no',
      prompt: 'Do you have the purchase agreement or contract?',
    },
    {
      id: 'agreement_info',
      type: 'info',
      prompt:
        'The purchase agreement is the most important document in a real estate dispute. Check your email, your realtor\'s records, or the title company files.',
      showIf: (answers) => answers.has_purchase_agreement === 'no',
    },
    {
      id: 'has_title_report',
      type: 'yes_no',
      prompt: 'Do you have a title report or title insurance policy?',
    },
    {
      id: 'title_info',
      type: 'info',
      prompt:
        'Contact your title company or closing attorney to obtain a copy of the title report and policy.',
      showIf: (answers) => answers.has_title_report === 'no',
    },
    {
      id: 'has_inspection_report',
      type: 'yes_no',
      prompt: 'Do you have a property inspection report?',
    },
    {
      id: 'has_closing_docs',
      type: 'yes_no',
      prompt: 'Do you have closing documents (HUD-1 or settlement statement)?',
    },
    {
      id: 'has_appraisal',
      type: 'yes_no',
      prompt: 'Do you have a property appraisal?',
    },
    {
      id: 'has_communications',
      type: 'yes_no',
      prompt:
        'Do you have emails, texts, or letters with the other party or their agent?',
    },
    {
      id: 'has_photos',
      type: 'yes_no',
      prompt: 'Do you have photos or videos of the property or defects?',
    },
    {
      id: 'has_financial_records',
      type: 'yes_no',
      prompt:
        'Do you have financial records (mortgage docs, payment receipts, earnest money receipt)?',
    },
    {
      id: 'evidence_organized',
      type: 'yes_no',
      prompt: 'Have you organized your evidence into categories?',
    },
    {
      id: 'organize_info',
      type: 'info',
      prompt:
        'Create folders for: Purchase Agreement, Title Documents, Inspection Reports, Closing Documents, Communications, Photos/Videos, Financial Records. Label files clearly with dates.',
      showIf: (answers) => answers.evidence_organized === 'no',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.has_purchase_agreement === 'yes') {
      items.push({ status: 'done', text: 'Purchase agreement collected.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Locate the purchase agreement or contract.',
      })
    }

    if (answers.has_title_report === 'yes') {
      items.push({ status: 'done', text: 'Title report or insurance policy collected.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Obtain a title report or title insurance policy from the title company.',
      })
    }

    if (answers.has_inspection_report === 'yes') {
      items.push({ status: 'done', text: 'Inspection report collected.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Locate the property inspection report.',
      })
    }

    if (answers.has_closing_docs === 'yes') {
      items.push({ status: 'done', text: 'Closing documents collected.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Obtain closing documents (HUD-1 or settlement statement).',
      })
    }

    if (answers.has_communications === 'yes') {
      items.push({ status: 'done', text: 'Communications collected.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Save relevant emails, texts, and letters with the other party or agents.',
      })
    }

    if (answers.has_photos === 'yes') {
      items.push({ status: 'done', text: 'Photos or videos collected.' })
    } else {
      items.push({
        status: 'info',
        text: 'Consider taking photos or videos of the property or any defects.',
      })
    }

    if (answers.evidence_organized === 'yes') {
      items.push({ status: 'done', text: 'Evidence organized into categories.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Organize evidence into folders: Agreement, Title, Inspection, Closing, Communications, Photos, Financial.',
      })
    }

    return items
  },
}
```

**Step 2: Build to verify**

Run: `cd "/Users/minwang/lawyer free" && npx next build 2>&1 | tail -5`
Expected: Build succeeds (file created but not yet imported — that's fine)

**Step 3: Commit**

```bash
cd "/Users/minwang/lawyer free"
git add src/lib/guided-steps/real-estate/re-evidence-vault.ts
git commit -m "feat(real-estate): add RE-specific evidence vault guided step config"
```

---

### Task 8: Create remaining RE guided step configs

**Files:**
- Create: `src/lib/guided-steps/real-estate/re-demand-letter.ts`
- Create: `src/lib/guided-steps/real-estate/re-negotiation.ts`
- Create: `src/lib/guided-steps/real-estate/re-file-with-court.ts`
- Create: `src/lib/guided-steps/real-estate/re-serve-defendant.ts`
- Create: `src/lib/guided-steps/real-estate/re-wait-for-answer.ts`
- Create: `src/lib/guided-steps/real-estate/re-review-answer.ts`
- Create: `src/lib/guided-steps/real-estate/re-discovery.ts`
- Create: `src/lib/guided-steps/real-estate/re-post-resolution.ts`

**Context:** These follow the same pattern as the property guided step configs but with real-estate-specific questions about transactions, title, closing docs, etc. Use the property configs as templates (`/src/lib/guided-steps/property/`) but adapt the content.

**Step 1: Create `re-demand-letter.ts`**

Create `src/lib/guided-steps/real-estate/re-demand-letter.ts`:

```typescript
import type { GuidedStepConfig } from '../types'

export const reDemandLetterConfig: GuidedStepConfig = {
  title: 'Draft Your Demand Letter',
  reassurance:
    'A demand letter formally notifies the other party and gives them a chance to resolve the dispute before you file suit. Many real estate disputes settle at this stage.',

  questions: [
    {
      id: 'recipient_name',
      type: 'text',
      prompt: 'Who will the demand letter be addressed to?',
      helpText:
        'The person or entity you have the dispute with (seller, buyer, agent, title company, builder, etc.).',
      placeholder: 'e.g. Jane Doe or ABC Realty LLC',
    },
    {
      id: 'dispute_type',
      type: 'single_choice',
      prompt: 'What is the core issue?',
      options: [
        { value: 'failed_closing', label: 'Failed closing or deal fell through' },
        { value: 'seller_disclosure', label: 'Seller failed to disclose defects' },
        { value: 'buyer_breach', label: 'Buyer breached the purchase agreement' },
        { value: 'title_defect', label: 'Title defect or lien issue' },
        { value: 'earnest_money', label: 'Earnest money dispute' },
        { value: 'fraud', label: 'Real estate fraud or misrepresentation' },
        { value: 'construction_defect', label: 'Construction defect' },
        { value: 'other', label: 'Other real estate issue' },
      ],
    },
    {
      id: 'disclosure_info',
      type: 'info',
      prompt:
        'Texas sellers must provide a Seller\'s Disclosure Notice. If the seller failed to disclose known defects, reference the specific defects and the disclosure form in your demand letter.',
      showIf: (answers) => answers.dispute_type === 'seller_disclosure',
    },
    {
      id: 'title_info',
      type: 'info',
      prompt:
        'For title defects, reference your title policy, title search results, and the specific defect (lien, undisclosed encumbrance, forgery, etc.). Your title insurance company may have a duty to defend or pay.',
      showIf: (answers) => answers.dispute_type === 'title_defect',
    },
    {
      id: 'damages_amount',
      type: 'text',
      prompt: 'What is the dollar amount of damages you are claiming?',
      helpText: 'Include repair costs, lost earnest money, price difference, etc.',
      placeholder: 'e.g. $15,000',
    },
    {
      id: 'what_you_want',
      type: 'single_choice',
      prompt: 'What are you requesting?',
      options: [
        { value: 'monetary_compensation', label: 'Monetary compensation' },
        { value: 'complete_transaction', label: 'Complete the transaction as agreed' },
        { value: 'return_earnest_money', label: 'Return earnest money' },
        { value: 'repair_defects', label: 'Repair the defects' },
        { value: 'clear_title', label: 'Clear the title defect' },
        { value: 'multiple', label: 'Multiple remedies' },
      ],
    },
    {
      id: 'deadline_days',
      type: 'single_choice',
      prompt: 'How many days will you give them to respond?',
      options: [
        { value: '14', label: '14 days' },
        { value: '30', label: '30 days (most common)' },
        { value: '60', label: '60 days' },
      ],
    },
    {
      id: 'prior_communication',
      type: 'yes_no',
      prompt: 'Have you already tried to resolve this informally?',
    },
    {
      id: 'prior_communication_info',
      type: 'info',
      prompt:
        'Documenting prior attempts to resolve the issue strengthens your demand letter and shows the court you acted in good faith.',
      showIf: (answers) => answers.prior_communication === 'yes',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.recipient_name) {
      items.push({ status: 'done', text: `Demand letter addressed to: ${answers.recipient_name}.` })
    } else {
      items.push({ status: 'needed', text: 'Identify the recipient for the demand letter.' })
    }

    if (answers.dispute_type && answers.dispute_type !== 'other') {
      items.push({ status: 'done', text: 'Core issue identified for demand letter.' })
    } else {
      items.push({ status: 'needed', text: 'Specify the core issue in the demand letter.' })
    }

    if (answers.damages_amount) {
      items.push({ status: 'done', text: `Damages claimed: ${answers.damages_amount}.` })
    } else {
      items.push({ status: 'needed', text: 'Calculate and specify the damages amount.' })
    }

    if (answers.what_you_want) {
      items.push({ status: 'done', text: 'Remedy requested in demand letter.' })
    } else {
      items.push({ status: 'needed', text: 'Specify what you are requesting.' })
    }

    if (answers.deadline_days) {
      items.push({ status: 'done', text: `Response deadline: ${answers.deadline_days} days.` })
    }

    items.push({
      status: 'info',
      text: 'Send the demand letter by certified mail with return receipt requested.',
    })

    return items
  },
}
```

**Step 2: Create `re-negotiation.ts`**

Create `src/lib/guided-steps/real-estate/re-negotiation.ts`:

```typescript
import type { GuidedStepConfig } from '../types'

export const reNegotiationConfig: GuidedStepConfig = {
  title: 'Attempt Negotiation or Mediation',
  reassurance:
    'Many real estate disputes settle through negotiation, saving both sides the cost and stress of litigation.',

  questions: [
    {
      id: 'ideal_resolution',
      type: 'single_choice',
      prompt: 'What is your ideal resolution?',
      options: [
        { value: 'monetary_compensation', label: 'Monetary compensation for damages' },
        { value: 'complete_transaction', label: 'Complete the transaction as agreed' },
        { value: 'return_funds', label: 'Return of earnest money or other funds' },
        { value: 'repair_defects', label: 'Repair defects or complete construction' },
        { value: 'clear_title', label: 'Clear the title' },
        { value: 'combination', label: 'A combination of remedies' },
      ],
    },
    {
      id: 'prior_communications',
      type: 'single_choice',
      prompt: 'How have communications with the other party gone?',
      options: [
        { value: 'cooperative', label: 'They seem willing to talk' },
        { value: 'unresponsive', label: 'They have not responded' },
        { value: 'hostile', label: 'They are hostile or uncooperative' },
        { value: 'no_contact', label: 'I have not contacted them yet' },
      ],
    },
    {
      id: 'hostile_info',
      type: 'info',
      prompt:
        'If the other party is hostile, communicate only in writing to create a record. You may want to propose mediation through a neutral third party.',
      showIf: (answers) => answers.prior_communications === 'hostile',
    },
    {
      id: 'open_to_mediation',
      type: 'yes_no',
      prompt: 'Would you be open to mediation if direct negotiation stalls?',
    },
    {
      id: 'mediation_info',
      type: 'info',
      prompt:
        'Mediation uses a neutral third party to help both sides reach a voluntary agreement. Many Texas courts require or encourage mediation before trial. It is typically faster and less expensive than going to court.',
      showIf: (answers) => answers.open_to_mediation === 'yes',
    },
    {
      id: 'agreement_reached',
      type: 'yes_no',
      prompt: 'Have you reached an agreement with the other party?',
    },
    {
      id: 'agreement_info',
      type: 'info',
      prompt:
        'Put any agreement in writing immediately. For real estate matters, have it signed, notarized, and recorded with the county clerk if it affects title or property rights.',
      showIf: (answers) => answers.agreement_reached === 'yes',
    },
    {
      id: 'no_agreement_info',
      type: 'info',
      prompt:
        'If negotiation fails, the next step is to file a petition with the court. We will guide you through preparing and filing your real estate dispute petition.',
      showIf: (answers) => answers.agreement_reached === 'no',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.ideal_resolution) {
      items.push({ status: 'done', text: 'Ideal resolution identified.' })
    }

    if (answers.prior_communications === 'hostile') {
      items.push({ status: 'info', text: 'Other party is hostile. Communicate in writing and consider mediation.' })
    } else if (answers.prior_communications === 'unresponsive') {
      items.push({ status: 'needed', text: 'Other party has not responded. Follow up in writing with a clear deadline.' })
    }

    if (answers.open_to_mediation === 'yes') {
      items.push({ status: 'info', text: 'Open to mediation if direct negotiation stalls.' })
    }

    if (answers.agreement_reached === 'yes') {
      items.push({ status: 'done', text: 'Agreement reached. Put it in writing and record if necessary.' })
    } else if (answers.agreement_reached === 'no') {
      items.push({ status: 'needed', text: 'No agreement reached. Next step: file a petition with the court.' })
    }

    return items
  },
}
```

**Step 3: Create `re-file-with-court.ts`**

Create `src/lib/guided-steps/real-estate/re-file-with-court.ts`:

```typescript
import type { GuidedStepConfig } from '../types'

export const reFileWithCourtConfig: GuidedStepConfig = {
  title: 'File With the Court',
  reassurance:
    'Filing officially starts your lawsuit. The court clerk can answer procedural questions about the filing process.',

  questions: [
    {
      id: 'have_petition',
      type: 'yes_no',
      prompt: 'Do you have your completed petition ready to file?',
    },
    {
      id: 'petition_info',
      type: 'info',
      prompt:
        'Your petition should include the property address, legal description, parties involved, the facts of your dispute, and the relief you are seeking.',
      showIf: (answers) => answers.have_petition === 'no',
    },
    {
      id: 'have_filing_fee',
      type: 'yes_no',
      prompt: 'Do you have the filing fee ready?',
    },
    {
      id: 'fee_info',
      type: 'info',
      prompt:
        'Filing fees vary by county (typically $250-$350 for district court). If you can\'t afford the fee, you can apply for a fee waiver (Statement of Inability to Afford Payment of Court Costs).',
      showIf: (answers) => answers.have_filing_fee === 'no',
    },
    {
      id: 'filing_method',
      type: 'single_choice',
      prompt: 'How will you file?',
      options: [
        { value: 'in_person', label: 'In person at the courthouse' },
        { value: 'online', label: 'Online (e-filing)' },
        { value: 'not_sure', label: 'Not sure yet' },
      ],
    },
    {
      id: 'efiling_info',
      type: 'info',
      prompt:
        'Texas requires e-filing in most courts. Check efiletexas.gov to see if your county requires it.',
      showIf: (answers) => answers.filing_method === 'online' || answers.filing_method === 'not_sure',
    },
    {
      id: 'filed_case',
      type: 'yes_no',
      prompt: 'Have you filed your case?',
    },
    {
      id: 'after_filing_info',
      type: 'info',
      prompt:
        'After filing, you\'ll receive a cause number and case assignment. Keep copies of everything you file. The next step is serving the defendant.',
      showIf: (answers) => answers.filed_case === 'yes',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.have_petition === 'yes') {
      items.push({ status: 'done', text: 'Petition is ready to file.' })
    } else {
      items.push({ status: 'needed', text: 'Complete your petition before filing.' })
    }

    if (answers.have_filing_fee === 'yes') {
      items.push({ status: 'done', text: 'Filing fee ready.' })
    } else {
      items.push({ status: 'needed', text: 'Prepare the filing fee or apply for a fee waiver.' })
    }

    if (answers.filing_method && answers.filing_method !== 'not_sure') {
      items.push({ status: 'done', text: `Filing method: ${answers.filing_method === 'online' ? 'e-filing' : 'in person'}.` })
    } else {
      items.push({ status: 'needed', text: 'Choose a filing method (e-filing is required in most Texas courts).' })
    }

    if (answers.filed_case === 'yes') {
      items.push({ status: 'done', text: 'Case filed with the court.' })
    } else {
      items.push({ status: 'needed', text: 'File your case and note the cause number.' })
    }

    return items
  },
}
```

**Step 4: Create `re-serve-defendant.ts`**

Create `src/lib/guided-steps/real-estate/re-serve-defendant.ts`:

```typescript
import type { GuidedStepConfig } from '../types'

export const reServeDefendantConfig: GuidedStepConfig = {
  title: 'Serve the Defendant',
  reassurance:
    'Proper service is required for the court to have jurisdiction over the defendant. This step ensures they receive official notice.',

  questions: [
    {
      id: 'know_address',
      type: 'yes_no',
      prompt: 'Do you know the defendant\'s current address for service?',
    },
    {
      id: 'address_info',
      type: 'info',
      prompt:
        'If you don\'t know the defendant\'s address, you may be able to find it through property records, the purchase agreement, or a skip trace service. As a last resort, you can request service by publication.',
      showIf: (answers) => answers.know_address === 'no',
    },
    {
      id: 'service_method',
      type: 'single_choice',
      prompt: 'How will you serve the defendant?',
      options: [
        { value: 'process_server', label: 'Private process server' },
        { value: 'constable', label: 'County constable or sheriff' },
        { value: 'certified_mail', label: 'Certified mail (if allowed)' },
        { value: 'not_sure', label: 'Not sure yet' },
      ],
    },
    {
      id: 'service_info',
      type: 'info',
      prompt:
        'A private process server is typically the fastest option. The county constable is often the least expensive. Certified mail may be allowed for some types of service — check your local rules.',
    },
    {
      id: 'served',
      type: 'yes_no',
      prompt: 'Has the defendant been served?',
    },
    {
      id: 'after_service_info',
      type: 'info',
      prompt:
        'After service, file the return of service (proof of service) with the court. The defendant typically has 20 days to file an answer (Monday after 20 days in Texas).',
      showIf: (answers) => answers.served === 'yes',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.know_address === 'yes') {
      items.push({ status: 'done', text: 'Defendant\'s address identified for service.' })
    } else {
      items.push({ status: 'needed', text: 'Locate the defendant\'s address for service.' })
    }

    if (answers.service_method && answers.service_method !== 'not_sure') {
      items.push({ status: 'done', text: 'Service method chosen.' })
    } else {
      items.push({ status: 'needed', text: 'Choose a service method (process server, constable, or certified mail).' })
    }

    if (answers.served === 'yes') {
      items.push({ status: 'done', text: 'Defendant served. File the return of service with the court.' })
    } else {
      items.push({ status: 'needed', text: 'Serve the defendant and file proof of service.' })
    }

    return items
  },
}
```

**Step 5: Create `re-wait-for-answer.ts`**

Create `src/lib/guided-steps/real-estate/re-wait-for-answer.ts`:

```typescript
import type { GuidedStepConfig } from '../types'

export const reWaitForAnswerConfig: GuidedStepConfig = {
  title: 'Wait for the Defendant\'s Answer',
  reassurance:
    'After service, the defendant has a set period to respond. Use this time to review your evidence and prepare.',

  questions: [
    {
      id: 'service_date_known',
      type: 'yes_no',
      prompt: 'Do you know the date the defendant was served?',
    },
    {
      id: 'deadline_info',
      type: 'info',
      prompt:
        'In Texas, the defendant has until the Monday after 20 days from service to file an answer. Mark this deadline on your calendar.',
    },
    {
      id: 'monitoring_docket',
      type: 'yes_no',
      prompt: 'Are you checking the court docket for filings?',
    },
    {
      id: 'docket_info',
      type: 'info',
      prompt:
        'Check the court\'s online docket regularly for any filings by the defendant. Some courts send notifications if you register for them.',
      showIf: (answers) => answers.monitoring_docket === 'no',
    },
    {
      id: 'answer_received',
      type: 'yes_no',
      prompt: 'Has the defendant filed an answer?',
    },
    {
      id: 'no_answer_info',
      type: 'info',
      prompt:
        'If the defendant misses the deadline, you may be able to request a default judgment. This means you could win your case without a trial.',
      showIf: (answers) => answers.answer_received === 'no',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.service_date_known === 'yes') {
      items.push({ status: 'done', text: 'Service date recorded. Answer deadline calculated.' })
    } else {
      items.push({ status: 'needed', text: 'Determine the service date and calculate the answer deadline.' })
    }

    if (answers.monitoring_docket === 'yes') {
      items.push({ status: 'done', text: 'Monitoring court docket for filings.' })
    } else {
      items.push({ status: 'needed', text: 'Check the court docket regularly for defendant\'s filings.' })
    }

    if (answers.answer_received === 'yes') {
      items.push({ status: 'done', text: 'Defendant\'s answer received. Proceed to review.' })
    } else {
      items.push({ status: 'info', text: 'Waiting for defendant\'s answer. Consider default judgment if deadline passes.' })
    }

    return items
  },
}
```

**Step 6: Create `re-review-answer.ts`**

Create `src/lib/guided-steps/real-estate/re-review-answer.ts`:

```typescript
import type { GuidedStepConfig } from '../types'

export const reReviewAnswerConfig: GuidedStepConfig = {
  title: 'Review the Defendant\'s Answer',
  reassurance:
    'Understanding the defendant\'s response reveals their legal position and helps you prepare your strategy.',

  questions: [
    {
      id: 'read_answer',
      type: 'yes_no',
      prompt: 'Have you read the defendant\'s answer thoroughly?',
    },
    {
      id: 'has_counterclaims',
      type: 'yes_no',
      prompt: 'Did the defendant file any counterclaims against you?',
    },
    {
      id: 'counterclaim_info',
      type: 'info',
      prompt:
        'A counterclaim means the defendant is suing you back. You will need to file an answer to the counterclaim within 20 days. Take this seriously — it can increase your exposure.',
      showIf: (answers) => answers.has_counterclaims === 'yes',
    },
    {
      id: 'disputed_facts',
      type: 'single_choice',
      prompt: 'How much of your claim does the defendant dispute?',
      options: [
        { value: 'everything', label: 'They deny everything' },
        { value: 'some', label: 'They admit some facts but dispute others' },
        { value: 'mostly_admitted', label: 'They admit most facts' },
        { value: 'not_sure', label: 'I\'m not sure what they\'re disputing' },
      ],
    },
    {
      id: 'not_sure_info',
      type: 'info',
      prompt:
        'Legal answers use specific language like "denied" and "admitted." Each numbered paragraph in the answer corresponds to a paragraph in your petition. If the defendant says "denied," they dispute that fact.',
      showIf: (answers) => answers.disputed_facts === 'not_sure',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.read_answer === 'yes') {
      items.push({ status: 'done', text: 'Defendant\'s answer reviewed.' })
    } else {
      items.push({ status: 'needed', text: 'Read the defendant\'s answer carefully.' })
    }

    if (answers.has_counterclaims === 'yes') {
      items.push({ status: 'needed', text: 'Defendant filed counterclaims. You must respond within 20 days.' })
    } else if (answers.has_counterclaims === 'no') {
      items.push({ status: 'info', text: 'No counterclaims filed.' })
    }

    if (answers.disputed_facts === 'everything') {
      items.push({ status: 'info', text: 'All facts disputed. Focus discovery on proving your key claims.' })
    } else if (answers.disputed_facts === 'some') {
      items.push({ status: 'info', text: 'Partial dispute. Focus on the contested issues.' })
    }

    return items
  },
}
```

**Step 7: Create `re-discovery.ts`**

Create `src/lib/guided-steps/real-estate/re-discovery.ts`:

```typescript
import type { GuidedStepConfig } from '../types'

export const reDiscoveryConfig: GuidedStepConfig = {
  title: 'Discovery — Exchange Evidence',
  reassurance:
    'Discovery lets you formally obtain documents and information from the other party. In real estate cases, this often includes transaction records, inspection reports, and communications.',

  questions: [
    {
      id: 'documents_needed',
      type: 'yes_no',
      prompt: 'Do you know what documents you need from the other party?',
    },
    {
      id: 'documents_info',
      type: 'info',
      prompt:
        'Common discovery requests in real estate cases: the purchase agreement, closing documents, inspection reports, disclosure notices, communications with agents, repair estimates, appraisals, and title documents.',
      showIf: (answers) => answers.documents_needed === 'no',
    },
    {
      id: 'sent_discovery',
      type: 'yes_no',
      prompt: 'Have you sent your discovery requests to the other party?',
    },
    {
      id: 'received_discovery',
      type: 'yes_no',
      prompt: 'Has the other party sent you discovery requests?',
    },
    {
      id: 'response_info',
      type: 'info',
      prompt:
        'You typically have 30 days to respond to discovery requests. Respond honestly and completely — withholding information can hurt your case.',
      showIf: (answers) => answers.received_discovery === 'yes',
    },
    {
      id: 'discovery_complete',
      type: 'yes_no',
      prompt: 'Is the discovery exchange complete?',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.documents_needed === 'yes') {
      items.push({ status: 'done', text: 'Discovery requests identified.' })
    } else {
      items.push({ status: 'needed', text: 'Identify what documents and information you need from the other party.' })
    }

    if (answers.sent_discovery === 'yes') {
      items.push({ status: 'done', text: 'Discovery requests sent to other party.' })
    } else {
      items.push({ status: 'needed', text: 'Prepare and send discovery requests.' })
    }

    if (answers.received_discovery === 'yes') {
      items.push({ status: 'needed', text: 'Respond to the other party\'s discovery requests within 30 days.' })
    }

    if (answers.discovery_complete === 'yes') {
      items.push({ status: 'done', text: 'Discovery exchange complete.' })
    }

    return items
  },
}
```

**Step 8: Create `re-post-resolution.ts`**

Create `src/lib/guided-steps/real-estate/re-post-resolution.ts`:

```typescript
import type { GuidedStepConfig } from '../types'

export const rePostResolutionConfig: GuidedStepConfig = {
  title: 'Post-Resolution Steps',
  reassurance:
    'After your case resolves, there may be important follow-up steps to enforce the judgment or finalize property matters.',

  questions: [
    {
      id: 'resolution_type',
      type: 'single_choice',
      prompt: 'How was your case resolved?',
      options: [
        { value: 'judgment_for_you', label: 'Judgment in your favor' },
        { value: 'settlement', label: 'Settlement agreement' },
        { value: 'judgment_against', label: 'Judgment against you' },
        { value: 'dismissed', label: 'Case dismissed' },
        { value: 'pending', label: 'Not resolved yet' },
      ],
    },
    {
      id: 'judgment_info',
      type: 'info',
      prompt:
        'If you won a money judgment, the defendant has 30 days to pay or appeal. If they don\'t pay, you can pursue collection through garnishment, liens, or other enforcement methods.',
      showIf: (answers) => answers.resolution_type === 'judgment_for_you',
    },
    {
      id: 'settlement_info',
      type: 'info',
      prompt:
        'Make sure your settlement agreement is in writing and signed by both parties. If it affects property title, have it recorded with the county clerk.',
      showIf: (answers) => answers.resolution_type === 'settlement',
    },
    {
      id: 'title_update_needed',
      type: 'yes_no',
      prompt: 'Does the outcome require updating title or property records?',
    },
    {
      id: 'title_update_info',
      type: 'info',
      prompt:
        'Record the judgment or settlement agreement with the county clerk to update the property records. This ensures the resolution is reflected in the title chain.',
      showIf: (answers) => answers.title_update_needed === 'yes',
    },
    {
      id: 'payment_received',
      type: 'yes_no',
      prompt: 'Have you received any payment owed under the judgment or settlement?',
    },
    {
      id: 'collection_info',
      type: 'info',
      prompt:
        'If payment is overdue, you can file an abstract of judgment to create a lien on the defendant\'s property, or pursue wage garnishment or bank account levy.',
      showIf: (answers) => answers.payment_received === 'no' && answers.resolution_type === 'judgment_for_you',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.resolution_type && answers.resolution_type !== 'pending') {
      const labels: Record<string, string> = {
        judgment_for_you: 'Judgment in your favor',
        settlement: 'Settlement agreement',
        judgment_against: 'Judgment against you',
        dismissed: 'Case dismissed',
      }
      items.push({ status: 'done', text: `Resolution: ${labels[answers.resolution_type]}.` })
    } else {
      items.push({ status: 'info', text: 'Case not yet resolved.' })
    }

    if (answers.title_update_needed === 'yes') {
      items.push({ status: 'needed', text: 'Record the outcome with the county clerk to update property records.' })
    }

    if (answers.payment_received === 'yes') {
      items.push({ status: 'done', text: 'Payment received.' })
    } else if (answers.payment_received === 'no' && answers.resolution_type === 'judgment_for_you') {
      items.push({ status: 'needed', text: 'Payment not yet received. Consider enforcement options.' })
    }

    return items
  },
}
```

**Step 9: Build to verify**

Run: `cd "/Users/minwang/lawyer free" && npx next build 2>&1 | tail -5`
Expected: Build succeeds

**Step 10: Commit**

```bash
cd "/Users/minwang/lawyer free"
git add src/lib/guided-steps/real-estate/
git commit -m "feat(real-estate): add all RE guided step configs (demand letter, negotiation, filing, service, litigation, resolution)"
```

---

### Task 9: Create the RE intake step component and wizard

**Files:**
- Create: `src/components/step/real-estate/re-intake-step.tsx`
- Create: `src/components/step/real-estate/re-wizard.tsx`

**Context:** These are modeled on `src/components/step/property/property-intake-step.tsx` and `src/components/step/property/property-wizard.tsx`. The intake step collects case details and saves them to task metadata. The wizard generates the court filing petition.

**Step 1: Create `re-intake-step.tsx`**

Create `src/components/step/real-estate/re-intake-step.tsx`. This is based on the property intake step but with real-estate-specific fields:

```typescript
'use client'

import { useState } from 'react'
import { StepRunner } from '../step-runner'

interface REIntakeStepProps {
  caseId: string
  taskId: string
  existingMetadata?: Record<string, unknown>
}

export function REIntakeStep({
  caseId,
  taskId,
  existingMetadata,
}: REIntakeStepProps) {
  const [county, setCounty] = useState(
    (existingMetadata?.county as string) || ''
  )
  const [propertyAddress, setPropertyAddress] = useState(
    (existingMetadata?.property_address as string) || ''
  )
  const [propertyType, setPropertyType] = useState(
    (existingMetadata?.property_type as string) || 'residential'
  )
  const [transactionDate, setTransactionDate] = useState(
    (existingMetadata?.transaction_date as string) || ''
  )
  const [purchasePrice, setPurchasePrice] = useState(
    (existingMetadata?.purchase_price as string) || ''
  )
  const [otherPartyName, setOtherPartyName] = useState(
    (existingMetadata?.other_party_name as string) || ''
  )
  const [otherPartyRole, setOtherPartyRole] = useState(
    (existingMetadata?.other_party_role as string) || 'seller'
  )
  const [disputeDescription, setDisputeDescription] = useState(
    (existingMetadata?.dispute_description as string) || ''
  )
  const [damagesSought, setDamagesSought] = useState(
    (existingMetadata?.damages_sought as string) || ''
  )
  const [hasPurchaseAgreement, setHasPurchaseAgreement] = useState(
    (existingMetadata?.has_purchase_agreement as boolean) || false
  )
  const [hasTitleInsurance, setHasTitleInsurance] = useState(
    (existingMetadata?.has_title_insurance as boolean) || false
  )
  const [hasInspectionReport, setHasInspectionReport] = useState(
    (existingMetadata?.has_inspection_report as boolean) || false
  )
  const [caseStage, setCaseStage] = useState(
    (existingMetadata?.guided_answers as Record<string, string>)?.case_stage || 'start'
  )

  const parsedPurchasePrice = parseFloat(purchasePrice.replace(/[^0-9.]/g, '')) || 0
  const parsedDamagesSought = parseFloat(damagesSought.replace(/[^0-9.]/g, '')) || 0

  function formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value)
  }

  function buildMetadata() {
    return {
      county: county.trim() || null,
      property_address: propertyAddress.trim() || null,
      property_type: propertyType,
      transaction_date: transactionDate || null,
      purchase_price: parsedPurchasePrice || null,
      other_party_name: otherPartyName.trim() || null,
      other_party_role: otherPartyRole,
      dispute_description: disputeDescription.trim() || null,
      damages_sought: parsedDamagesSought || null,
      has_purchase_agreement: hasPurchaseAgreement,
      has_title_insurance: hasTitleInsurance,
      has_inspection_report: hasInspectionReport,
      guided_answers: { case_stage: caseStage },
    }
  }

  async function patchTask(
    status: string,
    metadata?: Record<string, unknown>
  ) {
    await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, metadata }),
    })
  }

  return (
    <StepRunner
      caseId={caseId}
      taskId={taskId}
      title="Tell Us About Your Real Estate Dispute"
      onComplete={async () => {
        await patchTask('completed', buildMetadata())
      }}
      onSave={async () => {
        await patchTask('todo', buildMetadata())
      }}
    >
      <div className="space-y-6">
        {/* Where is the property? */}
        <div>
          <label className="block text-sm font-medium text-warm-text mb-1">
            County
          </label>
          <input
            className="w-full rounded-md border border-warm-border bg-white px-3 py-2 text-sm"
            placeholder="e.g. Harris, Travis, Dallas"
            value={county}
            onChange={(e) => setCounty(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-warm-text mb-1">
            Property address
          </label>
          <input
            className="w-full rounded-md border border-warm-border bg-white px-3 py-2 text-sm"
            placeholder="e.g. 123 Main St, Austin, TX 78701"
            value={propertyAddress}
            onChange={(e) => setPropertyAddress(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-warm-text mb-1">
            Property type
          </label>
          <select
            className="w-full rounded-md border border-warm-border bg-white px-3 py-2 text-sm"
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
          >
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
            <option value="land">Land</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-warm-text mb-1">
            Transaction date (closing or expected closing)
          </label>
          <input
            type="date"
            className="w-full rounded-md border border-warm-border bg-white px-3 py-2 text-sm"
            value={transactionDate}
            onChange={(e) => setTransactionDate(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-warm-text mb-1">
            Purchase price
          </label>
          <input
            className="w-full rounded-md border border-warm-border bg-white px-3 py-2 text-sm"
            placeholder="e.g. $350,000"
            value={purchasePrice}
            onChange={(e) => setPurchasePrice(e.target.value)}
          />
          {parsedPurchasePrice > 0 && (
            <p className="text-xs text-warm-muted mt-1">
              {formatCurrency(parsedPurchasePrice)}
            </p>
          )}
        </div>

        {/* Other party info */}
        <div>
          <label className="block text-sm font-medium text-warm-text mb-1">
            Other party&apos;s name
          </label>
          <input
            className="w-full rounded-md border border-warm-border bg-white px-3 py-2 text-sm"
            placeholder="e.g. John Smith or ABC Realty LLC"
            value={otherPartyName}
            onChange={(e) => setOtherPartyName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-warm-text mb-1">
            Other party&apos;s role
          </label>
          <select
            className="w-full rounded-md border border-warm-border bg-white px-3 py-2 text-sm"
            value={otherPartyRole}
            onChange={(e) => setOtherPartyRole(e.target.value)}
          >
            <option value="buyer">Buyer</option>
            <option value="seller">Seller</option>
            <option value="agent">Real estate agent</option>
            <option value="title_company">Title company</option>
            <option value="builder">Builder / contractor</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-warm-text mb-1">
            Describe the dispute
          </label>
          <textarea
            className="w-full rounded-md border border-warm-border bg-white px-3 py-2 text-sm"
            rows={4}
            placeholder="What happened? What did the other party do or fail to do?"
            value={disputeDescription}
            onChange={(e) => setDisputeDescription(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-warm-text mb-1">
            Damages sought
          </label>
          <input
            className="w-full rounded-md border border-warm-border bg-white px-3 py-2 text-sm"
            placeholder="e.g. $15,000"
            value={damagesSought}
            onChange={(e) => setDamagesSought(e.target.value)}
          />
          {parsedDamagesSought > 0 && (
            <p className="text-xs text-warm-muted mt-1">
              {formatCurrency(parsedDamagesSought)}
            </p>
          )}
        </div>

        {/* Documents on hand */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-warm-text">
            Which documents do you have?
          </p>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={hasPurchaseAgreement}
              onChange={(e) => setHasPurchaseAgreement(e.target.checked)}
            />
            Purchase agreement or contract
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={hasTitleInsurance}
              onChange={(e) => setHasTitleInsurance(e.target.checked)}
            />
            Title insurance policy
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={hasInspectionReport}
              onChange={(e) => setHasInspectionReport(e.target.checked)}
            />
            Property inspection report
          </label>
        </div>

        {/* Case stage for mid-litigation onboarding */}
        <div>
          <label className="block text-sm font-medium text-warm-text mb-1">
            Where are you in the process?
          </label>
          <select
            className="w-full rounded-md border border-warm-border bg-white px-3 py-2 text-sm"
            value={caseStage}
            onChange={(e) => setCaseStage(e.target.value)}
          >
            <option value="start">Just getting started</option>
            <option value="demand_sent">I&apos;ve sent a demand letter</option>
            <option value="filed">I&apos;ve filed with the court</option>
            <option value="served">I&apos;ve served the other party</option>
          </select>
        </div>
      </div>
    </StepRunner>
  )
}
```

**Step 2: Create `re-wizard.tsx`**

Create `src/components/step/real-estate/re-wizard.tsx`. This is the petition-building wizard for `re_prepare_filing`:

```typescript
'use client'

import { PetitionWizard } from '../petition-wizard'

interface REWizardProps {
  caseId: string
  taskId: string
  existingMetadata?: Record<string, unknown>
  realEstateDetails?: {
    re_sub_type?: string
    property_address?: string
    property_type?: string
    other_party_name?: string
    other_party_role?: string
    dispute_description?: string
    purchase_price?: number
    damages_sought?: number
  } | null
  caseData?: {
    county: string | null
    court_type: string
  }
}

export function REWizard({
  caseId,
  taskId,
  existingMetadata,
  realEstateDetails,
  caseData,
}: REWizardProps) {
  return (
    <PetitionWizard
      caseId={caseId}
      taskId={taskId}
      existingMetadata={existingMetadata}
      disputeType="real_estate"
      disputeLabel="Real Estate"
      details={{
        subType: realEstateDetails?.re_sub_type ?? undefined,
        propertyAddress: realEstateDetails?.property_address ?? undefined,
        otherPartyName: realEstateDetails?.other_party_name ?? undefined,
        otherPartyRole: realEstateDetails?.other_party_role ?? undefined,
        disputeDescription: realEstateDetails?.dispute_description ?? undefined,
        damagesSought: realEstateDetails?.damages_sought ?? undefined,
      }}
      caseData={caseData}
    />
  )
}
```

**Step 3: Build to verify**

Run: `cd "/Users/minwang/lawyer free" && npx next build 2>&1 | tail -5`
Expected: Build succeeds

**Step 4: Commit**

```bash
cd "/Users/minwang/lawyer free"
git add src/components/step/real-estate/
git commit -m "feat(real-estate): add RE intake step and petition wizard components"
```

---

### Task 10: Wire up all RE switch cases in page.tsx

**Files:**
- Modify: `src/app/(authenticated)/case/[id]/step/[taskId]/page.tsx`

**Step 1: Add imports**

At the top of the file, after the property imports (around line 108), add:

```typescript
import { REIntakeStep } from '@/components/step/real-estate/re-intake-step'
import { REWizard } from '@/components/step/real-estate/re-wizard'
import { reEvidenceVaultConfig } from '@/lib/guided-steps/real-estate/re-evidence-vault'
import { reDemandLetterConfig } from '@/lib/guided-steps/real-estate/re-demand-letter'
import { reNegotiationConfig } from '@/lib/guided-steps/real-estate/re-negotiation'
import { reFileWithCourtConfig } from '@/lib/guided-steps/real-estate/re-file-with-court'
import { reServeDefendantConfig } from '@/lib/guided-steps/real-estate/re-serve-defendant'
import { reWaitForAnswerConfig } from '@/lib/guided-steps/real-estate/re-wait-for-answer'
import { reReviewAnswerConfig } from '@/lib/guided-steps/real-estate/re-review-answer'
import { reDiscoveryConfig } from '@/lib/guided-steps/real-estate/re-discovery'
import { rePostResolutionConfig } from '@/lib/guided-steps/real-estate/re-post-resolution'
```

**Step 2: Add switch cases**

After the property switch cases (after `case 'property_post_resolution':` around line 1052), add the real estate cases:

```typescript
    // Real estate dispute task chain steps
    case 're_intake':
      return (
        <REIntakeStep
          caseId={id}
          taskId={taskId}
          existingMetadata={task.metadata}
        />
      )
    case 're_evidence_vault':
      return <GuidedStep caseId={id} taskId={taskId} config={reEvidenceVaultConfig} existingAnswers={task.metadata?.guided_answers} />
    case 're_demand_letter':
      return <GuidedStep caseId={id} taskId={taskId} config={reDemandLetterConfig} existingAnswers={task.metadata?.guided_answers} skippable />
    case 're_negotiation':
      return <GuidedStep caseId={id} taskId={taskId} config={reNegotiationConfig} existingAnswers={task.metadata?.guided_answers} skippable />
    case 're_prepare_filing': {
      const { data: caseRow } = await supabase
        .from('cases').select('county, court_type').eq('id', id).single()
      const { data: reDetails } = await supabase
        .from('real_estate_details').select('*').eq('case_id', id).maybeSingle()
      return (
        <REWizard
          caseId={id}
          taskId={taskId}
          existingMetadata={task.metadata}
          realEstateDetails={reDetails}
          caseData={{ county: caseRow?.county ?? null, court_type: caseRow?.court_type ?? 'county' }}
        />
      )
    }
    case 're_file_with_court':
      return <GuidedStep caseId={id} taskId={taskId} config={reFileWithCourtConfig} existingAnswers={task.metadata?.guided_answers} />
    case 're_serve_defendant':
      return <GuidedStep caseId={id} taskId={taskId} config={reServeDefendantConfig} existingAnswers={task.metadata?.guided_answers} />
    case 're_wait_for_answer':
      return <GuidedStep caseId={id} taskId={taskId} config={reWaitForAnswerConfig} existingAnswers={task.metadata?.guided_answers} />
    case 're_review_answer':
      return <GuidedStep caseId={id} taskId={taskId} config={reReviewAnswerConfig} existingAnswers={task.metadata?.guided_answers} />
    case 're_discovery':
      return <GuidedStep caseId={id} taskId={taskId} config={reDiscoveryConfig} existingAnswers={task.metadata?.guided_answers} />
    case 're_post_resolution':
      return <GuidedStep caseId={id} taskId={taskId} config={rePostResolutionConfig} existingAnswers={task.metadata?.guided_answers} />
```

**Step 3: Build to verify**

Run: `cd "/Users/minwang/lawyer free" && npx next build 2>&1 | tail -5`
Expected: Build succeeds

**Step 4: Commit**

```bash
cd "/Users/minwang/lawyer free"
git add "src/app/(authenticated)/case/[id]/step/[taskId]/page.tsx"
git commit -m "feat(real-estate): wire up all RE switch cases in step page"
```

---

### Task 11: Create the DB migration

**Files:**
- Create: `supabase/migrations/20260312000005_real_estate_workflow.sql`

**Context:** This migration does three things:
1. Creates the `real_estate_details` table with RLS
2. Updates `seed_case_tasks()` to add a `real_estate` branch
3. Updates `unlock_next_task()` to add the `real_estate` unlock chain

**IMPORTANT:** The `seed_case_tasks()` and `unlock_next_task()` functions must be written as `CREATE OR REPLACE FUNCTION` with the **complete** function body, including ALL existing dispute type branches. You must read the previous migration (`20260312000004_small_claims_parity.sql`) to get the current function bodies, then add the new `real_estate` branch.

**Step 1: Read the current migration**

Read the full `supabase/migrations/20260312000004_small_claims_parity.sql` to get the current `seed_case_tasks()` and `unlock_next_task()` function bodies. The new migration must reproduce these functions in their entirety, adding only the `real_estate` branches.

**Step 2: Create the migration file**

Create `supabase/migrations/20260312000005_real_estate_workflow.sql`.

The migration has three parts:

**Part 1: Create `real_estate_details` table**

```sql
-- =========================================================================
-- Part 1: Create real_estate_details table
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.real_estate_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  re_sub_type text NOT NULL CHECK (re_sub_type IN (
    'failed_closing', 'seller_disclosure', 'buyer_breach',
    'title_defect', 'earnest_money', 'real_estate_fraud',
    'construction_defect', 'other_real_estate'
  )),
  property_address text,
  property_type text CHECK (property_type IN ('residential', 'commercial', 'land')),
  transaction_date date,
  purchase_price numeric,
  other_party_name text,
  other_party_role text CHECK (other_party_role IN (
    'buyer', 'seller', 'agent', 'title_company', 'builder', 'other'
  )),
  dispute_description text,
  damages_sought numeric,
  has_purchase_agreement boolean DEFAULT false,
  has_title_insurance boolean DEFAULT false,
  has_inspection_report boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(case_id)
);

ALTER TABLE public.real_estate_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own real estate details"
  ON public.real_estate_details
  FOR ALL
  USING (
    case_id IN (SELECT id FROM public.cases WHERE user_id = auth.uid())
  );
```

**Part 2: Update `seed_case_tasks()`**

Copy the entire function from the previous migration and add a new `IF NEW.dispute_type = 'real_estate' THEN` block. Place it after the property block. The new block seeds 12 tasks:

```sql
-- Real estate cases — early return
IF NEW.dispute_type = 'real_estate' THEN
  INSERT INTO public.tasks (case_id, task_key, title, status, unlocked_at)
  VALUES (NEW.id, 'welcome', 'Welcome — Get Started', 'todo', now());

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES
    (NEW.id, 're_intake', 'Tell Us About Your Real Estate Dispute', 'locked'),
    (NEW.id, 're_evidence_vault', 'Organize Your Evidence', 'locked'),
    (NEW.id, 're_demand_letter', 'Draft Your Demand Letter', 'locked'),
    (NEW.id, 're_negotiation', 'Attempt Negotiation or Mediation', 'locked'),
    (NEW.id, 're_prepare_filing', 'Prepare Your Court Filing', 'locked'),
    (NEW.id, 're_file_with_court', 'File With the Court', 'locked'),
    (NEW.id, 're_serve_defendant', 'Serve the Defendant', 'locked'),
    (NEW.id, 're_wait_for_answer', 'Wait for the Defendant''s Answer', 'locked'),
    (NEW.id, 're_review_answer', 'Review the Defendant''s Answer', 'locked'),
    (NEW.id, 're_discovery', 'Discovery — Exchange Evidence', 'locked'),
    (NEW.id, 're_post_resolution', 'Post-Resolution Steps', 'locked');

  INSERT INTO public.task_events (case_id, kind, payload)
  VALUES (NEW.id, 'case_created', jsonb_build_object(
    'role', NEW.role,
    'county', NEW.county,
    'court_type', NEW.court_type,
    'dispute_type', NEW.dispute_type,
    'tasks_seeded', 12
  ));

  RETURN NEW;
END IF;
```

**Part 3: Update `unlock_next_task()`**

Copy the entire function from the previous migration and add the real estate unlock chain. Place it after the property unlock chain. The chain has these transitions:

```sql
-- ========================================
-- REAL ESTATE UNLOCK CHAIN (11 transitions)
-- ========================================

-- Real estate: welcome -> re_intake
-- (handled by existing welcome -> *_intake pattern, or add explicit)

-- Real estate: re_intake -> CONDITIONAL based on case_stage
IF NEW.task_key = 're_intake' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
  v_case_stage := COALESCE(NEW.metadata->'guided_answers'->>'case_stage', 'start');

  IF v_case_stage = 'start' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 're_evidence_vault' AND status = 'locked';

  ELSIF v_case_stage = 'demand_sent' THEN
    UPDATE public.tasks SET status = 'skipped'
    WHERE case_id = NEW.case_id
      AND task_key IN ('re_evidence_vault', 're_demand_letter', 're_negotiation')
      AND status = 'locked';
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 're_prepare_filing' AND status = 'locked';

  ELSIF v_case_stage = 'filed' THEN
    UPDATE public.tasks SET status = 'skipped'
    WHERE case_id = NEW.case_id
      AND task_key IN ('re_evidence_vault', 're_demand_letter', 're_negotiation', 're_prepare_filing')
      AND status = 'locked';
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 're_file_with_court' AND status = 'locked';

  ELSIF v_case_stage = 'served' THEN
    UPDATE public.tasks SET status = 'skipped'
    WHERE case_id = NEW.case_id
      AND task_key IN ('re_evidence_vault', 're_demand_letter', 're_negotiation', 're_prepare_filing', 're_file_with_court', 're_serve_defendant')
      AND status = 'locked';
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 're_wait_for_answer' AND status = 'locked';

  ELSE
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 're_evidence_vault' AND status = 'locked';
  END IF;
END IF;

-- Real estate: re_evidence_vault -> re_demand_letter
IF NEW.task_key = 're_evidence_vault' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
  UPDATE public.tasks SET status = 'todo', unlocked_at = now()
  WHERE case_id = NEW.case_id AND task_key = 're_demand_letter' AND status = 'locked';
END IF;

-- Real estate: re_demand_letter -> re_negotiation (completed or skipped)
IF NEW.task_key = 're_demand_letter' AND NEW.status IN ('completed', 'skipped') AND OLD.status NOT IN ('completed', 'skipped') THEN
  UPDATE public.tasks SET status = 'todo', unlocked_at = now()
  WHERE case_id = NEW.case_id AND task_key = 're_negotiation' AND status = 'locked';
END IF;

-- Real estate: re_negotiation -> re_prepare_filing (completed or skipped)
IF NEW.task_key = 're_negotiation' AND NEW.status IN ('completed', 'skipped') AND OLD.status NOT IN ('completed', 'skipped') THEN
  UPDATE public.tasks SET status = 'todo', unlocked_at = now()
  WHERE case_id = NEW.case_id AND task_key = 're_prepare_filing' AND status = 'locked';
END IF;

-- Real estate: re_prepare_filing -> re_file_with_court
IF NEW.task_key = 're_prepare_filing' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
  UPDATE public.tasks SET status = 'todo', unlocked_at = now()
  WHERE case_id = NEW.case_id AND task_key = 're_file_with_court' AND status = 'locked';
END IF;

-- Real estate: re_file_with_court -> re_serve_defendant
IF NEW.task_key = 're_file_with_court' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
  UPDATE public.tasks SET status = 'todo', unlocked_at = now()
  WHERE case_id = NEW.case_id AND task_key = 're_serve_defendant' AND status = 'locked';
END IF;

-- Real estate: re_serve_defendant -> re_wait_for_answer
IF NEW.task_key = 're_serve_defendant' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
  UPDATE public.tasks SET status = 'todo', unlocked_at = now()
  WHERE case_id = NEW.case_id AND task_key = 're_wait_for_answer' AND status = 'locked';
END IF;

-- Real estate: re_wait_for_answer -> re_review_answer
IF NEW.task_key = 're_wait_for_answer' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
  UPDATE public.tasks SET status = 'todo', unlocked_at = now()
  WHERE case_id = NEW.case_id AND task_key = 're_review_answer' AND status = 'locked';
END IF;

-- Real estate: re_review_answer -> re_discovery
IF NEW.task_key = 're_review_answer' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
  UPDATE public.tasks SET status = 'todo', unlocked_at = now()
  WHERE case_id = NEW.case_id AND task_key = 're_discovery' AND status = 'locked';
END IF;

-- Real estate: re_discovery -> re_post_resolution
IF NEW.task_key = 're_discovery' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
  UPDATE public.tasks SET status = 'todo', unlocked_at = now()
  WHERE case_id = NEW.case_id AND task_key = 're_post_resolution' AND status = 'locked';
END IF;
```

**Note:** The `welcome -> re_intake` transition is handled by the existing generic welcome block that matches `task_key = 'welcome'` and unlocks `*_intake`. Check that the existing welcome block includes `re_intake` — if not, add an explicit block.

**Step 3: Build to verify (front-end only)**

Run: `cd "/Users/minwang/lawyer free" && npx next build 2>&1 | tail -5`
Expected: Build succeeds (migration is SQL only, doesn't affect the build)

**Step 4: Commit**

```bash
cd "/Users/minwang/lawyer free"
git add supabase/migrations/20260312000005_real_estate_workflow.sql
git commit -m "feat(real-estate): add DB migration — real_estate_details table, seed, and unlock functions"
```

---

### Task 12: Verify everything works together

**Step 1: Full build**

Run: `cd "/Users/minwang/lawyer free" && npx next build 2>&1 | tail -10`
Expected: Build succeeds with no errors

**Step 2: Verify all RE task keys have matching switch cases**

Run: `cd "/Users/minwang/lawyer free" && grep -c "case 're_" "src/app/(authenticated)/case/[id]/step/[taskId]/page.tsx"`
Expected: 11 (re_intake, re_evidence_vault, re_demand_letter, re_negotiation, re_prepare_filing, re_file_with_court, re_serve_defendant, re_wait_for_answer, re_review_answer, re_discovery, re_post_resolution)

**Step 3: Verify workflow phases**

Run: `cd "/Users/minwang/lawyer free" && grep -A 20 "real_estate:" src/lib/workflow-phases.ts`
Expected: Shows 5 phases with 12 task keys

**Step 4: Verify step guidance**

Run: `cd "/Users/minwang/lawyer free" && grep "re_" src/lib/step-guidance.ts | wc -l`
Expected: 11 entries

**Step 5: Verify milestones**

Run: `cd "/Users/minwang/lawyer free" && grep "real_estate" src/lib/rules/milestones.ts`
Expected: Shows REAL_ESTATE_MILESTONES and dispatch map entry

**Step 6: Verify SKIPPABLE_TASKS**

Run: `cd "/Users/minwang/lawyer free" && grep "re_demand_letter\|re_negotiation" src/components/case/workflow-sidebar.tsx`
Expected: Both found

**Step 7: Commit verification**

No commit needed — this is a verification step.
