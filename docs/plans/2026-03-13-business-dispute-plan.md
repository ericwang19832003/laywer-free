# Business Dispute Workflow Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a `business` dispute type with three branching sub-workflows (partnership/LLC, employment, B2B commercial), following the family law sub-type branching pattern.

**Architecture:** Family law pattern — `dispute_type='business'` in `cases` table, `business_sub_type` in a new `business_details` table. Three separate workflow phase keys (`partnership`, `employment`, `b2b_commercial`) in `WORKFLOW_PHASES`. A `seed_business_tasks()` trigger on `business_details` insert seeds sub-type-specific tasks. Each sub-workflow has its own intake component, guided step configs, milestones, and unlock chain.

**Tech Stack:** Next.js 14 App Router, TypeScript, Supabase PostgreSQL, Zod schemas

**Design doc:** `docs/plans/2026-03-13-business-dispute-design.md`

---

## Context: How Family Law Branching Works (Reference)

The business workflow replicates the family law pattern exactly:

1. **Wizard**: User selects "Business dispute" → second step shows 3 categories (partnership/employment/b2b)
2. **API**: Creates `cases` row with `dispute_type='business'` + `business_details` row with `business_sub_type`
3. **DB trigger**: `seed_case_tasks()` seeds only `welcome` for business. `seed_business_tasks()` trigger on `business_details` insert seeds sub-type-specific tasks
4. **Layout**: `layout.tsx` maps `dispute_type='business'` + `business_sub_type` → phaseKey (e.g., `'partnership'`)
5. **Phases**: `WORKFLOW_PHASES['partnership']` returns the partnership task chain
6. **Milestones**: `getMilestones('business', 'partnership')` returns `PARTNERSHIP_MILESTONES`

---

## Sub-Type & Task Key Reference

**Business sub-types** (workflow-branching): `partnership`, `employment`, `b2b_commercial`

**Detailed sub-types** (captured at intake):
- Partnership: `breach_fiduciary`, `profit_loss`, `dissolution_buyout`, `management_deadlock`
- Employment: `wrongful_termination`, `wage_overtime`, `non_compete_nda`, `discrimination_harassment`
- B2B: `vendor_service`, `ip_trade_secret`, `unfair_competition`, `breach_of_contract`

### Partnership Tasks (11)
```
welcome → biz_partnership_intake → biz_partnership_evidence → biz_partnership_demand_letter* →
biz_partnership_adr* → biz_partnership_prepare_filing → biz_partnership_file_with_court →
biz_partnership_serve_defendant → biz_partnership_wait_for_answer → biz_partnership_discovery →
biz_partnership_post_resolution
```

### Employment Tasks (11)
```
welcome → biz_employment_intake → biz_employment_evidence → biz_employment_demand_letter* →
biz_employment_eeoc* → biz_employment_prepare_filing → biz_employment_file_with_court →
biz_employment_serve_defendant → biz_employment_wait_for_answer → biz_employment_discovery →
biz_employment_post_resolution
```

### B2B Commercial Tasks (11)
```
welcome → biz_b2b_intake → biz_b2b_evidence → biz_b2b_demand_letter* →
biz_b2b_negotiation* → biz_b2b_prepare_filing → biz_b2b_file_with_court →
biz_b2b_serve_defendant → biz_b2b_wait_for_answer → biz_b2b_discovery →
biz_b2b_post_resolution
```

*Skippable tasks marked with asterisk

---

### Task 1: Schema & Types

**Files:**
- Modify: `src/lib/schemas/case.ts`
- Modify: `src/lib/rules/court-recommendation.ts`

**Step 1: Add business to DISPUTE_TYPES** (case.ts, line 9 — after `'real_estate'`)

Add `'business'` to the DISPUTE_TYPES array:
```typescript
export const DISPUTE_TYPES = [
  'debt_collection',
  'landlord_tenant',
  'personal_injury',
  'contract',
  'property',
  'real_estate',
  'business',       // ← ADD
  'family',
  'small_claims',
  'other',
] as const
```

**Step 2: Add BUSINESS_SUB_TYPES** (case.ts, after REAL_ESTATE_SUB_TYPES around line 116)

```typescript
export const BUSINESS_SUB_TYPES = [
  'partnership',
  'employment',
  'b2b_commercial',
] as const

export type BusinessSubType = (typeof BUSINESS_SUB_TYPES)[number]

export const BUSINESS_PARTNERSHIP_TYPES = [
  'breach_fiduciary',
  'profit_loss',
  'dissolution_buyout',
  'management_deadlock',
] as const

export const BUSINESS_EMPLOYMENT_TYPES = [
  'wrongful_termination',
  'wage_overtime',
  'non_compete_nda',
  'discrimination_harassment',
] as const

export const BUSINESS_B2B_TYPES = [
  'vendor_service',
  'ip_trade_secret',
  'unfair_competition',
  'breach_of_contract',
] as const
```

**Step 3: Add business_sub_type to createCaseSchema** (case.ts, near line 155 after `re_sub_type`)

```typescript
business_sub_type: z.enum(BUSINESS_SUB_TYPES).optional(),
```

**Step 4: Add 'business' to DisputeType union** (court-recommendation.ts, line ~17 after `'real_estate'`)

```typescript
export type DisputeType =
  | 'debt_collection'
  | 'landlord_tenant'
  | 'personal_injury'
  | 'contract'
  | 'property'
  | 'real_estate'
  | 'business'        // ← ADD
  | 'family'
  | 'small_claims'
  | 'other'
```

**Step 5: Build**
```bash
npx next build 2>&1 | tail -5
```

**Step 6: Commit**
```bash
git add src/lib/schemas/case.ts src/lib/rules/court-recommendation.ts
git commit -m "feat(business): add business dispute type and sub-types to schema"
```

---

### Task 2: Dispute Type Wizard & Business Sub-Type Step

**Files:**
- Modify: `src/components/cases/wizard/dispute-type-step.tsx`
- Create: `src/components/cases/wizard/business-sub-type-step.tsx`
- Modify: `src/components/cases/wizard/new-case-dialog.tsx` (or wherever the wizard flow lives)

**Step 1: Add business option to dispute type picker** (dispute-type-step.tsx, around line 26 — after real_estate, before family)

```typescript
{ id: 'business', value: 'business', label: 'Business dispute', description: 'Partnership, employment, or commercial dispute' },
```

**Step 2: Create BusinessSubTypeStep component**

Create `src/components/cases/wizard/business-sub-type-step.tsx`:
```typescript
'use client'

import type { BusinessSubType } from '@/lib/schemas/case'

interface BusinessSubTypeOption {
  value: BusinessSubType
  label: string
  description: string
}

const BUSINESS_OPTIONS: BusinessSubTypeOption[] = [
  { value: 'partnership', label: 'Partnership / LLC', description: 'Partner disagreements, profit sharing, dissolution, buyouts, or fiduciary duty breaches' },
  { value: 'employment', label: 'Employment', description: 'Wrongful termination, wage disputes, non-compete violations, or discrimination' },
  { value: 'b2b_commercial', label: 'Business-to-Business', description: 'Vendor disputes, service agreements, IP/trade secrets, or unfair competition' },
]

interface BusinessSubTypeStepProps {
  value: BusinessSubType | null
  onSelect: (subType: BusinessSubType) => void
}

export function BusinessSubTypeStep({ value, onSelect }: BusinessSubTypeStepProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-warm-text">What type of business dispute?</h3>
      <p className="text-sm text-warm-muted">This helps us tailor the process to your situation.</p>
      <div className="space-y-2 mt-4">
        {BUSINESS_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => onSelect(option.value)}
            className={`w-full text-left p-4 rounded-lg border transition-colors ${
              value === option.value
                ? 'border-calm-indigo bg-calm-indigo/5'
                : 'border-warm-border hover:border-warm-muted'
            }`}
          >
            <div className="font-medium text-warm-text">{option.label}</div>
            <div className="text-sm text-warm-muted mt-1">{option.description}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
```

**Step 3: Wire into case creation wizard**

Find the file that contains the wizard flow (likely `new-case-dialog.tsx` or similar). Look for how family sub-type step is conditionally shown:
```typescript
{state.step === 4 && isFamily && (
  <FamilySubTypeStep ... />
)}
```

Add the same pattern for business:
```typescript
{state.step === N && isBusiness && (
  <BusinessSubTypeStep
    value={state.businessSubType}
    onSelect={(businessSubType) =>
      dispatch({ type: 'SET_BUSINESS_SUB_TYPE', businessSubType })
    }
  />
)}
```

You'll need to:
1. Add `businessSubType` to the wizard state
2. Add `SET_BUSINESS_SUB_TYPE` action to the reducer
3. Add `isBusiness` check (`state.disputeType === 'business'`)
4. Ensure the "Next" button requires business sub-type selection when dispute type is business

**Step 4: Update case creation API** (`src/app/api/cases/route.ts`)

Find where family_sub_type is handled (look for `family_case_details` insert). Add the same pattern for business:
```typescript
const { dispute_type, family_sub_type, business_sub_type, ... } = parsed.data

// After case creation, if business:
if (business_sub_type) {
  const { error: bizError } = await supabase
    .from('business_details')
    .insert({
      case_id: newCase.id,
      business_sub_type,
    })
  if (bizError) {
    console.error('Failed to create business details:', bizError)
  }
}
```

**Step 5: Build**
```bash
npx next build 2>&1 | tail -5
```

**Step 6: Commit**
```bash
git add src/components/cases/wizard/dispute-type-step.tsx \
  src/components/cases/wizard/business-sub-type-step.tsx \
  src/components/cases/wizard/new-case-dialog.tsx \
  src/app/api/cases/route.ts
git commit -m "feat(business): add business sub-type selection wizard and API"
```

---

### Task 3: Workflow Phases

**Files:**
- Modify: `src/lib/workflow-phases.ts` (add after real_estate entry, around line 230)

**Step 1: Add three business workflow entries**

```typescript
partnership: [
  {
    label: 'Getting Started',
    taskKeys: ['welcome', 'biz_partnership_intake'],
  },
  {
    label: 'Building Your Case',
    taskKeys: ['biz_partnership_evidence', 'biz_partnership_demand_letter', 'biz_partnership_adr'],
  },
  {
    label: 'Filing & Service',
    taskKeys: ['biz_partnership_prepare_filing', 'biz_partnership_file_with_court', 'biz_partnership_serve_defendant'],
  },
  {
    label: 'Litigation',
    taskKeys: ['biz_partnership_wait_for_answer', 'biz_partnership_discovery'],
  },
  {
    label: 'Resolution',
    taskKeys: ['biz_partnership_post_resolution'],
  },
],

employment: [
  {
    label: 'Getting Started',
    taskKeys: ['welcome', 'biz_employment_intake'],
  },
  {
    label: 'Building Your Case',
    taskKeys: ['biz_employment_evidence', 'biz_employment_demand_letter', 'biz_employment_eeoc'],
  },
  {
    label: 'Filing & Service',
    taskKeys: ['biz_employment_prepare_filing', 'biz_employment_file_with_court', 'biz_employment_serve_defendant'],
  },
  {
    label: 'Litigation',
    taskKeys: ['biz_employment_wait_for_answer', 'biz_employment_discovery'],
  },
  {
    label: 'Resolution',
    taskKeys: ['biz_employment_post_resolution'],
  },
],

b2b_commercial: [
  {
    label: 'Getting Started',
    taskKeys: ['welcome', 'biz_b2b_intake'],
  },
  {
    label: 'Building Your Case',
    taskKeys: ['biz_b2b_evidence', 'biz_b2b_demand_letter', 'biz_b2b_negotiation'],
  },
  {
    label: 'Filing & Service',
    taskKeys: ['biz_b2b_prepare_filing', 'biz_b2b_file_with_court', 'biz_b2b_serve_defendant'],
  },
  {
    label: 'Litigation',
    taskKeys: ['biz_b2b_wait_for_answer', 'biz_b2b_discovery'],
  },
  {
    label: 'Resolution',
    taskKeys: ['biz_b2b_post_resolution'],
  },
],
```

**Step 2: Build and commit**
```bash
npx next build 2>&1 | tail -5
git add src/lib/workflow-phases.ts
git commit -m "feat(business): add workflow phases for partnership, employment, and b2b"
```

---

### Task 4: Step Guidance

**Files:**
- Modify: `src/lib/step-guidance.ts` (append after last entry, around line 1373)

**Step 1: Add all 33 business task guidance entries**

Add inside the `STEP_GUIDANCE` object (before the closing `}`):

```typescript
// ── BUSINESS: PARTNERSHIP ────────────────────────────────
biz_partnership_intake: {
  why: 'Understanding the business structure, partners involved, and the nature of the dispute helps us determine the best legal strategy for your partnership or LLC case.',
  checklist: [
    'Partnership or operating agreement',
    'Names and roles of all partners/members',
    'Ownership percentages',
    'Financial records showing the dispute',
    'Timeline of key events',
  ],
  tip: 'If you have an operating or partnership agreement, it may contain dispute resolution clauses that affect your options.',
},
biz_partnership_evidence: {
  why: 'Strong evidence is critical in partnership disputes, where the facts often involve complex financial arrangements and verbal agreements.',
  checklist: [
    'Partnership/operating agreement and amendments',
    'Financial statements and tax returns',
    'Bank statements and transaction records',
    'Emails, texts, and letters between partners',
    'Meeting minutes or written decisions',
  ],
  tip: 'Forensic accounting may be needed if you suspect financial misconduct — start gathering bank and financial records early.',
},
biz_partnership_demand_letter: {
  why: 'A formal demand letter notifies your partner of the dispute and your intent to seek resolution, creating a record that you attempted to resolve the matter before filing suit.',
  checklist: [
    'Specific breaches or actions you are alleging',
    'Dollar amount of damages or relief requested',
    'Deadline for response (typically 30 days)',
    'Reference to any agreement provisions violated',
  ],
  tip: 'Reference specific sections of your partnership or operating agreement to strengthen your demand.',
},
biz_partnership_adr: {
  why: 'Many partnership and LLC agreements require mediation or arbitration before filing a lawsuit. Skipping mandatory ADR could get your case dismissed.',
  checklist: [
    'Review operating/partnership agreement for ADR clauses',
    'Identify whether mediation or arbitration is required',
    'Research qualified business mediators in your area',
    'Prepare a summary of the dispute for the mediator',
  ],
  tip: 'Even if ADR is not mandatory, mediation is often faster and cheaper than litigation for partnership disputes.',
},
biz_partnership_prepare_filing: {
  why: 'Preparing your court filing correctly ensures your case proceeds without delays or dismissals due to procedural errors.',
  checklist: [
    'Completed petition or complaint',
    'Filing fee payment ready',
    'Correct court identified (county where business operates)',
    'All defendants properly named',
  ],
},
biz_partnership_file_with_court: {
  why: 'Filing your lawsuit with the court officially starts the legal process and establishes your case timeline.',
  checklist: [
    'File petition with the district clerk',
    'Pay filing fee',
    'Get file-stamped copies for your records',
    'Note your cause number',
  ],
  tip: 'Many Texas counties support e-filing at efiletexas.gov — check if yours does.',
},
biz_partnership_serve_defendant: {
  why: 'Proper service notifies the other party of the lawsuit. Improper service can delay or invalidate your case.',
  checklist: [
    'Serve each defendant individually',
    'Use a licensed process server or constable',
    'Serve at the registered agent address for LLCs/corporations',
    'File proof of service (return of citation) with the court',
  ],
  tip: 'For business entities, serve the registered agent listed with the Texas Secretary of State.',
},
biz_partnership_wait_for_answer: {
  why: 'After service, the defendant has a deadline to respond. Understanding this timeline helps you prepare for what comes next.',
  checklist: [
    'Monitor the court docket for the defendant\'s answer',
    'Note the answer deadline (typically 20 days after service in Texas)',
    'Watch for counterclaims or cross-claims',
    'Consult an attorney if the response is complex',
  ],
},
biz_partnership_discovery: {
  why: 'Discovery lets both sides gather evidence. In partnership disputes, this often involves financial records, communications, and depositions.',
  checklist: [
    'Prepare interrogatories (written questions)',
    'Draft requests for production of documents',
    'Plan depositions of key witnesses',
    'Review discovery responses from the other side',
  ],
  tip: 'Request complete financial records, including bank statements, QuickBooks exports, and tax returns for the partnership.',
},
biz_partnership_post_resolution: {
  why: 'After your case resolves, there are important steps to protect the outcome — whether you won, settled, or need to dissolve the business.',
  checklist: [
    'Enforce the judgment or settlement terms',
    'File any required dissolution paperwork with the state',
    'Update business registrations if ownership changed',
    'Close shared business accounts if applicable',
  ],
},

// ── BUSINESS: EMPLOYMENT ─────────────────────────────────
biz_employment_intake: {
  why: 'Employment disputes have strict deadlines and specific legal requirements. Understanding your situation early helps us guide you to the right process.',
  checklist: [
    'Employer name and size',
    'Your position and employment dates',
    'Description of what happened',
    'Any HR complaints you\'ve filed',
    'Employment contract or handbook (if available)',
  ],
  tip: 'Discrimination and harassment claims have strict filing deadlines — usually 180-300 days from the incident.',
},
biz_employment_evidence: {
  why: 'Employment cases depend heavily on documentation. The more records you have, the stronger your case.',
  checklist: [
    'Pay stubs and W-2s showing compensation',
    'Employment contract, offer letter, or handbook',
    'Performance reviews and evaluations',
    'Emails, texts, and written communications',
    'Witness names and contact information',
  ],
  tip: 'Save copies of all work-related communications before you lose access to company systems.',
},
biz_employment_demand_letter: {
  why: 'A demand letter formally notifies your employer of the dispute and gives them a chance to resolve it before litigation.',
  checklist: [
    'Specific violations or wrongful actions alleged',
    'Dollar amount of damages (lost wages, benefits, etc.)',
    'Deadline for response',
    'Reference to applicable employment laws',
  ],
  tip: 'For wage claims, reference the Texas Payday Law or FLSA provisions that apply to your situation.',
},
biz_employment_eeoc: {
  why: 'For discrimination or harassment claims, you must file a charge with the EEOC or Texas Workforce Commission (TWC) before you can sue in court. This is a legal prerequisite.',
  checklist: [
    'Determine if your claim requires EEOC/TWC filing',
    'File charge within 180 days (TWC) or 300 days (EEOC) of the incident',
    'Provide a clear description of the discriminatory actions',
    'Wait for right-to-sue letter (or request one after 180 days)',
  ],
  tip: 'You can file with the EEOC online at publicportal.eeoc.gov. Filing with one agency automatically cross-files with the other.',
},
biz_employment_prepare_filing: {
  why: 'Employment lawsuits require careful preparation to ensure all claims are properly stated and the right court is selected.',
  checklist: [
    'Completed petition with all causes of action',
    'Filing fee payment ready',
    'Right-to-sue letter (if discrimination claim)',
    'Correct court identified',
  ],
},
biz_employment_file_with_court: {
  why: 'Filing your employment lawsuit officially begins the legal process and preserves your right to recovery.',
  checklist: [
    'File petition with the district clerk',
    'Pay filing fee',
    'Get file-stamped copies',
    'Note your cause number',
  ],
  tip: 'Some employment claims can be filed in federal court. Consider whether state or federal court is more favorable.',
},
biz_employment_serve_defendant: {
  why: 'Your employer must be properly served to respond to the lawsuit. Service on a business has specific requirements.',
  checklist: [
    'Serve the employer\'s registered agent',
    'Use a licensed process server or constable',
    'For federal claims, follow federal service rules',
    'File proof of service with the court',
  ],
  tip: 'Look up the employer\'s registered agent on the Texas Secretary of State website.',
},
biz_employment_wait_for_answer: {
  why: 'After service, your employer has a deadline to respond. Their answer may include counterclaims or affirmative defenses.',
  checklist: [
    'Monitor the court docket for the answer',
    'Note the answer deadline (20 days in Texas state court)',
    'Watch for motions to dismiss',
    'Review any counterclaims carefully',
  ],
},
biz_employment_discovery: {
  why: 'Discovery in employment cases focuses on company records, policies, and communications that support your claim.',
  checklist: [
    'Request your complete personnel file',
    'Request company policies and handbooks',
    'Request communications about your termination/discipline',
    'Depose key decision-makers (supervisor, HR)',
  ],
  tip: 'Request comparator evidence — how were similarly situated employees treated?',
},
biz_employment_post_resolution: {
  why: 'After resolution, there are practical steps to take regardless of the outcome — from enforcing a judgment to managing your career transition.',
  checklist: [
    'Enforce judgment or settlement terms',
    'Negotiate reference letter terms if applicable',
    'File for unemployment benefits if not already done',
    'Update professional references and resume',
  ],
},

// ── BUSINESS: B2B COMMERCIAL ─────────────────────────────
biz_b2b_intake: {
  why: 'Understanding the business relationship, contract terms, and nature of the commercial dispute helps us build the strongest case strategy.',
  checklist: [
    'Other business name and contact information',
    'Contract or agreement (if written)',
    'Description of goods or services involved',
    'Amount in dispute',
    'Timeline of key events',
  ],
  tip: 'Check your contract for a forum selection clause — it may specify where disputes must be filed.',
},
biz_b2b_evidence: {
  why: 'Commercial disputes are won with documentation. Contracts, invoices, communications, and deliverables tell the story of what was agreed and what went wrong.',
  checklist: [
    'Signed contracts and amendments',
    'Invoices, purchase orders, and payment records',
    'Emails and written communications',
    'Deliverables, reports, or work product',
    'Witness statements from employees involved',
  ],
  tip: 'Organize evidence chronologically — courts want to see the timeline of events.',
},
biz_b2b_demand_letter: {
  why: 'A formal demand letter puts the other business on notice and creates a record of your good-faith attempt to resolve the dispute before litigation.',
  checklist: [
    'Specific contract provisions breached',
    'Dollar amount of damages claimed',
    'Deadline for response (typically 30 days)',
    'Reference to applicable contract terms',
  ],
  tip: 'Send the demand via certified mail with return receipt for proof of delivery.',
},
biz_b2b_negotiation: {
  why: 'Business-to-business disputes often resolve through negotiation, saving both sides the cost and disruption of litigation.',
  checklist: [
    'Determine your minimum acceptable settlement',
    'Prepare a settlement proposal with supporting evidence',
    'Consider the ongoing business relationship',
    'Document all negotiation communications in writing',
  ],
  tip: 'Consider whether preserving the business relationship matters — this may influence your negotiation strategy.',
},
biz_b2b_prepare_filing: {
  why: 'Commercial litigation requires careful pleading to capture all causes of action and potential damages.',
  checklist: [
    'Completed petition with all causes of action',
    'Filing fee payment ready',
    'Correct court identified (check contract for forum clause)',
    'All business entity defendants properly named',
  ],
},
biz_b2b_file_with_court: {
  why: 'Filing your commercial lawsuit starts the litigation clock and preserves your right to recover damages.',
  checklist: [
    'File petition with the district clerk',
    'Pay filing fee',
    'Get file-stamped copies',
    'Note your cause number',
  ],
  tip: 'For disputes over $200, consider whether federal diversity jurisdiction applies if the businesses are in different states.',
},
biz_b2b_serve_defendant: {
  why: 'Proper service on a business entity requires serving the registered agent, not just any employee.',
  checklist: [
    'Identify the registered agent for each business defendant',
    'Use a licensed process server or constable',
    'For out-of-state businesses, follow long-arm statute requirements',
    'File proof of service with the court',
  ],
  tip: 'Look up registered agents on the Secretary of State website for the state where the business is incorporated.',
},
biz_b2b_wait_for_answer: {
  why: 'After service, the defendant business has a deadline to respond. Their answer may include counterclaims for amounts they claim you owe.',
  checklist: [
    'Monitor the court docket for the answer',
    'Note the answer deadline',
    'Watch for counterclaims and affirmative defenses',
    'Prepare responses to any counterclaims',
  ],
},
biz_b2b_discovery: {
  why: 'Commercial discovery focuses on contracts, financial records, and communications that prove the breach and damages.',
  checklist: [
    'Request all contracts and amendments',
    'Request financial records showing damages',
    'Request internal communications about the dispute',
    'Depose key personnel who managed the relationship',
  ],
  tip: 'In IP/trade secret cases, request forensic imaging of relevant computers and storage devices early.',
},
biz_b2b_post_resolution: {
  why: 'After resolution, enforce the outcome and make business decisions about the ongoing relationship.',
  checklist: [
    'Enforce judgment or settlement terms',
    'Collect on the judgment if the other side doesn\'t pay voluntarily',
    'Decide whether to continue the business relationship',
    'Update internal contracts and processes to prevent future disputes',
  ],
},
```

**Step 2: Build and commit**
```bash
npx next build 2>&1 | tail -5
git add src/lib/step-guidance.ts
git commit -m "feat(business): add step guidance for all 33 business tasks"
```

---

### Task 5: Milestones

**Files:**
- Modify: `src/lib/rules/milestones.ts`

**Step 1: Add three milestone arrays** (after REAL_ESTATE_MILESTONES, around line 328)

```typescript
const PARTNERSHIP_MILESTONES: Milestone[] = [
  {
    id: 'start',
    label: 'Just getting started',
    description: 'I haven\'t taken any action yet.',
    firstUnlockedTask: 'welcome',
    tasksToSkip: [],
  },
  {
    id: 'demand_sent',
    label: 'Sent a demand or attempted ADR',
    description: 'I\'ve already sent a demand letter or attempted mediation/arbitration.',
    firstUnlockedTask: 'biz_partnership_prepare_filing',
    tasksToSkip: [
      'welcome',
      'biz_partnership_intake',
      'biz_partnership_evidence',
      'biz_partnership_demand_letter',
      'biz_partnership_adr',
    ],
  },
  {
    id: 'filed',
    label: 'Filed with court',
    description: 'I\'ve already filed my case with the court.',
    firstUnlockedTask: 'biz_partnership_file_with_court',
    tasksToSkip: [
      'welcome',
      'biz_partnership_intake',
      'biz_partnership_evidence',
      'biz_partnership_demand_letter',
      'biz_partnership_adr',
      'biz_partnership_prepare_filing',
    ],
  },
  {
    id: 'served',
    label: 'Served the other party',
    description: 'I\'ve served the other party with the lawsuit.',
    firstUnlockedTask: 'biz_partnership_wait_for_answer',
    tasksToSkip: [
      'welcome',
      'biz_partnership_intake',
      'biz_partnership_evidence',
      'biz_partnership_demand_letter',
      'biz_partnership_adr',
      'biz_partnership_prepare_filing',
      'biz_partnership_file_with_court',
      'biz_partnership_serve_defendant',
    ],
  },
  {
    id: 'in_litigation',
    label: 'In litigation',
    description: 'I\'m in the litigation phase (discovery, motions, etc.).',
    firstUnlockedTask: 'biz_partnership_discovery',
    tasksToSkip: [
      'welcome',
      'biz_partnership_intake',
      'biz_partnership_evidence',
      'biz_partnership_demand_letter',
      'biz_partnership_adr',
      'biz_partnership_prepare_filing',
      'biz_partnership_file_with_court',
      'biz_partnership_serve_defendant',
      'biz_partnership_wait_for_answer',
    ],
  },
]

const EMPLOYMENT_MILESTONES: Milestone[] = [
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
    description: 'I\'ve already sent a demand letter to my employer.',
    firstUnlockedTask: 'biz_employment_eeoc',
    tasksToSkip: [
      'welcome',
      'biz_employment_intake',
      'biz_employment_evidence',
      'biz_employment_demand_letter',
    ],
  },
  {
    id: 'filed',
    label: 'Filed complaint or EEOC charge',
    description: 'I\'ve filed with the EEOC/TWC or filed a lawsuit.',
    firstUnlockedTask: 'biz_employment_file_with_court',
    tasksToSkip: [
      'welcome',
      'biz_employment_intake',
      'biz_employment_evidence',
      'biz_employment_demand_letter',
      'biz_employment_eeoc',
      'biz_employment_prepare_filing',
    ],
  },
  {
    id: 'served',
    label: 'Served the employer',
    description: 'I\'ve served my employer with the lawsuit.',
    firstUnlockedTask: 'biz_employment_wait_for_answer',
    tasksToSkip: [
      'welcome',
      'biz_employment_intake',
      'biz_employment_evidence',
      'biz_employment_demand_letter',
      'biz_employment_eeoc',
      'biz_employment_prepare_filing',
      'biz_employment_file_with_court',
      'biz_employment_serve_defendant',
    ],
  },
  {
    id: 'in_litigation',
    label: 'In litigation',
    description: 'I\'m in the litigation phase (discovery, motions, etc.).',
    firstUnlockedTask: 'biz_employment_discovery',
    tasksToSkip: [
      'welcome',
      'biz_employment_intake',
      'biz_employment_evidence',
      'biz_employment_demand_letter',
      'biz_employment_eeoc',
      'biz_employment_prepare_filing',
      'biz_employment_file_with_court',
      'biz_employment_serve_defendant',
      'biz_employment_wait_for_answer',
    ],
  },
]

const B2B_COMMERCIAL_MILESTONES: Milestone[] = [
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
    firstUnlockedTask: 'biz_b2b_prepare_filing',
    tasksToSkip: [
      'welcome',
      'biz_b2b_intake',
      'biz_b2b_evidence',
      'biz_b2b_demand_letter',
      'biz_b2b_negotiation',
    ],
  },
  {
    id: 'filed',
    label: 'Filed with court',
    description: 'I\'ve already filed my case with the court.',
    firstUnlockedTask: 'biz_b2b_file_with_court',
    tasksToSkip: [
      'welcome',
      'biz_b2b_intake',
      'biz_b2b_evidence',
      'biz_b2b_demand_letter',
      'biz_b2b_negotiation',
      'biz_b2b_prepare_filing',
    ],
  },
  {
    id: 'served',
    label: 'Served the other party',
    description: 'I\'ve served the other business with the lawsuit.',
    firstUnlockedTask: 'biz_b2b_wait_for_answer',
    tasksToSkip: [
      'welcome',
      'biz_b2b_intake',
      'biz_b2b_evidence',
      'biz_b2b_demand_letter',
      'biz_b2b_negotiation',
      'biz_b2b_prepare_filing',
      'biz_b2b_file_with_court',
      'biz_b2b_serve_defendant',
    ],
  },
  {
    id: 'in_litigation',
    label: 'In litigation',
    description: 'I\'m in the litigation phase (discovery, motions, etc.).',
    firstUnlockedTask: 'biz_b2b_discovery',
    tasksToSkip: [
      'welcome',
      'biz_b2b_intake',
      'biz_b2b_evidence',
      'biz_b2b_demand_letter',
      'biz_b2b_negotiation',
      'biz_b2b_prepare_filing',
      'biz_b2b_file_with_court',
      'biz_b2b_serve_defendant',
      'biz_b2b_wait_for_answer',
    ],
  },
]
```

**Step 2: Add to MILESTONES_BY_TYPE dispatch map** (around line 881)

```typescript
partnership: PARTNERSHIP_MILESTONES,
employment: EMPLOYMENT_MILESTONES,
b2b_commercial: B2B_COMMERCIAL_MILESTONES,
```

**Step 3: Update getMilestones function** (around line 902)

Add business handling alongside family:
```typescript
export function getMilestones(disputeType: DisputeType, familySubType?: string, businessSubType?: string): Milestone[] {
  if (disputeType === 'family' && familySubType) {
    return MILESTONES_BY_TYPE[familySubType] ?? DIVORCE_MILESTONES
  }
  if (disputeType === 'business' && businessSubType) {
    return MILESTONES_BY_TYPE[businessSubType] ?? PARTNERSHIP_MILESTONES
  }
  return MILESTONES_BY_TYPE[disputeType] ?? CIVIL_MILESTONES
}
```

Also update all call sites of `getMilestones` to pass the new `businessSubType` parameter. Search for `getMilestones(` to find all call sites.

**Step 4: Build and commit**
```bash
npx next build 2>&1 | tail -5
git add src/lib/rules/milestones.ts
git commit -m "feat(business): add milestones for partnership, employment, and b2b"
```

---

### Task 6: Skippable Tasks & Case Layout

**Files:**
- Modify: `src/components/case/workflow-sidebar.tsx` (SKIPPABLE_TASKS around line 16-39)
- Modify: `src/components/dashboard/next-step-card.tsx` (SKIPPABLE_TASKS around line 9-17)
- Modify: `src/app/(authenticated)/case/[id]/layout.tsx`

**Step 1: Add business skippable tasks to workflow-sidebar.tsx** (after `'re_negotiation'`)

```typescript
'biz_partnership_demand_letter',
'biz_partnership_adr',
'biz_employment_demand_letter',
'biz_employment_eeoc',
'biz_b2b_demand_letter',
'biz_b2b_negotiation',
```

**Step 2: Add business skippable tasks to next-step-card.tsx** (after `'re_negotiation'`)

```typescript
'biz_partnership_demand_letter',
'biz_partnership_adr',
'biz_employment_demand_letter',
'biz_employment_eeoc',
'biz_b2b_demand_letter',
'biz_b2b_negotiation',
```

**Step 3: Update case layout for business sub-type resolution** (layout.tsx)

Find where `familyDetails` is fetched in the Promise.all. Add a business_details fetch:
```typescript
supabase.from('business_details').select('business_sub_type').eq('case_id', id).maybeSingle(),
```

Find the phaseKey resolution logic and extend it:
```typescript
const phaseKey = disputeType === 'business' && businessDetails?.business_sub_type
  ? businessDetails.business_sub_type
  : disputeType === 'family' && familyDetails?.family_sub_type
    ? familyDetails.family_sub_type
    : disputeType
```

Also pass `businessSubType` to any milestone calls in layout.tsx.

**Step 4: Build and commit**
```bash
npx next build 2>&1 | tail -5
git add src/components/case/workflow-sidebar.tsx \
  src/components/dashboard/next-step-card.tsx \
  src/app/(authenticated)/case/[id]/layout.tsx
git commit -m "feat(business): add skippable tasks and layout sub-type resolution"
```

---

### Task 7: Partnership Intake Component

**Files:**
- Create: `src/components/step/business/biz-partnership-intake-step.tsx`

**Step 1: Create the component**

Follow the pattern from `re-intake-step.tsx`. Fields:
- `county` (text input)
- `businessName` (text input — partnership or LLC name)
- `businessType` (select: partnership / llc / corporation / other)
- `partnerNames` (text input — comma-separated)
- `ownershipPercentages` (text input)
- `formationState` (text input, default 'Texas')
- `hasOperatingAgreement` (yes/no toggle)
- `specificDisputeType` (select from BUSINESS_PARTNERSHIP_TYPES: breach_fiduciary, profit_loss, dissolution_buyout, management_deadlock)
- `disputeDescription` (textarea)
- `damagesSought` (currency input)
- `caseStage` (select: start, demand_sent, filed, served, in_litigation)

The component should:
1. Load existing metadata on mount
2. Build metadata object with `guided_answers: { case_stage: caseStage }`
3. Call `patchTask('in_progress', metadata)` then `patchTask('completed')` on confirm
4. Use the `StepRunner` wrapper component

Template: Copy `re-intake-step.tsx` and adapt field names.

**Step 2: Build and commit**
```bash
npx next build 2>&1 | tail -5
git add src/components/step/business/biz-partnership-intake-step.tsx
git commit -m "feat(business): add partnership intake component"
```

---

### Task 8: Employment Intake Component

**Files:**
- Create: `src/components/step/business/biz-employment-intake-step.tsx`

**Step 1: Create the component**

Fields:
- `county` (text input)
- `employerName` (text input)
- `employerSize` (select: small_under_15 / medium_15_to_100 / large_over_100)
- `positionTitle` (text input)
- `employmentStartDate` (date input)
- `employmentEndDate` (date input, optional — still employed?)
- `specificDisputeType` (select from BUSINESS_EMPLOYMENT_TYPES: wrongful_termination, wage_overtime, non_compete_nda, discrimination_harassment)
- `hrComplaintFiled` (yes/no toggle)
- `hasEmploymentContract` (yes/no toggle)
- `hasEmployeeHandbook` (yes/no toggle)
- `disputeDescription` (textarea)
- `damagesSought` (currency input)
- `caseStage` (select: start, demand_sent, filed, served, in_litigation)

Same pattern as Task 7.

**Step 2: Build and commit**
```bash
npx next build 2>&1 | tail -5
git add src/components/step/business/biz-employment-intake-step.tsx
git commit -m "feat(business): add employment intake component"
```

---

### Task 9: B2B Intake Component

**Files:**
- Create: `src/components/step/business/biz-b2b-intake-step.tsx`

**Step 1: Create the component**

Fields:
- `county` (text input)
- `otherBusinessName` (text input)
- `contractType` (select: service / vendor / licensing / distribution / other)
- `contractDate` (date input)
- `contractAmount` (currency input)
- `hasWrittenContract` (yes/no toggle)
- `specificDisputeType` (select from BUSINESS_B2B_TYPES: vendor_service, ip_trade_secret, unfair_competition, breach_of_contract)
- `disputeDescription` (textarea)
- `damagesSought` (currency input)
- `caseStage` (select: start, demand_sent, filed, served, in_litigation)

Same pattern as Tasks 7-8.

**Step 2: Build and commit**
```bash
npx next build 2>&1 | tail -5
git add src/components/step/business/biz-b2b-intake-step.tsx
git commit -m "feat(business): add B2B intake component"
```

---

### Task 10: Partnership Guided Step Configs (8 files)

**Files:**
- Create: `src/lib/guided-steps/business/biz-partnership-evidence.ts`
- Create: `src/lib/guided-steps/business/biz-partnership-demand-letter.ts`
- Create: `src/lib/guided-steps/business/biz-partnership-adr.ts`
- Create: `src/lib/guided-steps/business/biz-partnership-file-with-court.ts`
- Create: `src/lib/guided-steps/business/biz-partnership-serve-defendant.ts`
- Create: `src/lib/guided-steps/business/biz-partnership-wait-for-answer.ts`
- Create: `src/lib/guided-steps/business/biz-partnership-discovery.ts`
- Create: `src/lib/guided-steps/business/biz-partnership-post-resolution.ts`

**Step 1: Create all 8 configs**

Each file follows the `GuidedStepConfig` pattern from `re-evidence-vault.ts`:
```typescript
import type { GuidedStepConfig } from '../types'

export const bizPartnershipEvidenceConfig: GuidedStepConfig = {
  title: 'Organize Your Partnership Evidence',
  reassurance: 'Strong evidence is the foundation of any partnership dispute...',
  questions: [
    { id: 'has_agreement', type: 'yes_no', prompt: 'Do you have a written partnership or operating agreement?' },
    { id: 'agreement_tip', type: 'info', prompt: 'Your agreement may contain dispute resolution clauses...', showIf: (a) => a.has_agreement === 'yes' },
    { id: 'has_financial_records', type: 'yes_no', prompt: 'Do you have financial statements or tax returns for the business?' },
    { id: 'has_communications', type: 'yes_no', prompt: 'Do you have emails, texts, or letters with the other partner(s)?' },
    { id: 'has_bank_records', type: 'yes_no', prompt: 'Do you have bank statements showing disputed transactions?' },
    { id: 'has_meeting_minutes', type: 'yes_no', prompt: 'Do you have meeting minutes or written business decisions?' },
  ],
  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []
    if (answers.has_agreement === 'yes') items.push({ status: 'done', text: 'Partnership/operating agreement available.' })
    else if (answers.has_agreement === 'no') items.push({ status: 'needed', text: 'No written agreement — document any verbal agreements.' })
    // ... similar for each question
    return items
  },
}
```

Key content for each config:

**biz-partnership-demand-letter.ts** — Questions: recipient_name (text), dispute_type (single_choice: breach_fiduciary/profit_loss/dissolution_buyout/management_deadlock), damages_amount (text), deadline_days (single_choice: 15/30/60), has_agreement_reference (yes_no)

**biz-partnership-adr.ts** — Questions: has_adr_clause (yes_no), adr_type (single_choice: mediation/arbitration/both, showIf has_adr_clause=yes), has_mediator (yes_no), attempted_adr (yes_no). Info blocks about mandatory vs voluntary ADR.

**biz-partnership-file-with-court.ts** — Questions: know_court (yes_no), court_info (info), have_filing_fee (yes_no), filing_method (single_choice: in_person/online/mail)

**biz-partnership-serve-defendant.ts** — Questions: know_registered_agent (yes_no), agent_lookup_info (info), service_method (single_choice: process_server/constable/certified_mail)

**biz-partnership-wait-for-answer.ts** — Questions: answer_received (yes_no), days_since_service (text), has_counterclaim (yes_no, showIf answer_received=yes)

**biz-partnership-discovery.ts** — Questions: need_financial_records (yes_no), need_depositions (yes_no), need_interrogatories (yes_no), need_document_requests (yes_no)

**biz-partnership-post-resolution.ts** — Questions: resolution_type (single_choice: judgment/settlement/dismissal), need_enforcement (yes_no), need_dissolution (yes_no), need_business_updates (yes_no)

**Step 2: Build and commit**
```bash
npx next build 2>&1 | tail -5
git add src/lib/guided-steps/business/biz-partnership-*.ts
git commit -m "feat(business): add partnership guided step configs"
```

---

### Task 11: Employment Guided Step Configs (9 files)

**Files:**
- Create: `src/lib/guided-steps/business/biz-employment-evidence.ts`
- Create: `src/lib/guided-steps/business/biz-employment-demand-letter.ts`
- Create: `src/lib/guided-steps/business/biz-employment-eeoc.ts`
- Create: `src/lib/guided-steps/business/biz-employment-file-with-court.ts`
- Create: `src/lib/guided-steps/business/biz-employment-serve-defendant.ts`
- Create: `src/lib/guided-steps/business/biz-employment-wait-for-answer.ts`
- Create: `src/lib/guided-steps/business/biz-employment-discovery.ts`
- Create: `src/lib/guided-steps/business/biz-employment-post-resolution.ts`

Same pattern as Task 10 but employment-specific.

**biz-employment-eeoc.ts** (unique to employment) — Questions:
- `claim_type` (single_choice: discrimination/harassment/retaliation/wage_theft/other)
- `needs_eeoc` (info: "Discrimination and harassment claims require filing with the EEOC or TWC before suing", showIf claim_type in discrimination/harassment/retaliation)
- `filing_agency` (single_choice: eeoc/twc/both, showIf needs_eeoc shown)
- `days_since_incident` (text: "How many days ago did the incident occur?")
- `deadline_warning` (info: "TWC deadline is 180 days, EEOC is 300 days", showIf days_since_incident > 150)
- `charge_filed` (yes_no: "Have you already filed an EEOC/TWC charge?")
- `has_right_to_sue` (yes_no: "Have you received a right-to-sue letter?", showIf charge_filed=yes)

**Step 2: Build and commit**
```bash
npx next build 2>&1 | tail -5
git add src/lib/guided-steps/business/biz-employment-*.ts
git commit -m "feat(business): add employment guided step configs including EEOC"
```

---

### Task 12: B2B Guided Step Configs (8 files)

**Files:**
- Create: `src/lib/guided-steps/business/biz-b2b-evidence.ts`
- Create: `src/lib/guided-steps/business/biz-b2b-demand-letter.ts`
- Create: `src/lib/guided-steps/business/biz-b2b-negotiation.ts`
- Create: `src/lib/guided-steps/business/biz-b2b-file-with-court.ts`
- Create: `src/lib/guided-steps/business/biz-b2b-serve-defendant.ts`
- Create: `src/lib/guided-steps/business/biz-b2b-wait-for-answer.ts`
- Create: `src/lib/guided-steps/business/biz-b2b-discovery.ts`
- Create: `src/lib/guided-steps/business/biz-b2b-post-resolution.ts`

Same pattern as Tasks 10-11 but B2B-specific.

**biz-b2b-negotiation.ts** (unique to B2B) — Questions:
- `settlement_goal` (single_choice: full_payment/partial_payment/performance/relationship_preservation)
- `min_acceptable` (text: "What is the minimum you would accept?")
- `has_proposal` (yes_no: "Have you prepared a settlement proposal?")
- `ongoing_relationship` (yes_no: "Do you want to continue doing business with this company?")
- `relationship_tip` (info: "If preserving the relationship matters, consider framing demands as corrections rather than accusations", showIf ongoing_relationship=yes)

**Step 2: Build and commit**
```bash
npx next build 2>&1 | tail -5
git add src/lib/guided-steps/business/biz-b2b-*.ts
git commit -m "feat(business): add B2B guided step configs"
```

---

### Task 13: Page Routing

**Files:**
- Modify: `src/app/(authenticated)/case/[id]/step/[taskId]/page.tsx`

**Step 1: Add imports** (after RE imports, around line 118)

```typescript
// Business: Partnership
import { BizPartnershipIntakeStep } from '@/components/step/business/biz-partnership-intake-step'
import { bizPartnershipEvidenceConfig } from '@/lib/guided-steps/business/biz-partnership-evidence'
import { bizPartnershipDemandLetterConfig } from '@/lib/guided-steps/business/biz-partnership-demand-letter'
import { bizPartnershipAdrConfig } from '@/lib/guided-steps/business/biz-partnership-adr'
import { bizPartnershipFileWithCourtConfig } from '@/lib/guided-steps/business/biz-partnership-file-with-court'
import { bizPartnershipServeDefendantConfig } from '@/lib/guided-steps/business/biz-partnership-serve-defendant'
import { bizPartnershipWaitForAnswerConfig } from '@/lib/guided-steps/business/biz-partnership-wait-for-answer'
import { bizPartnershipDiscoveryConfig } from '@/lib/guided-steps/business/biz-partnership-discovery'
import { bizPartnershipPostResolutionConfig } from '@/lib/guided-steps/business/biz-partnership-post-resolution'

// Business: Employment
import { BizEmploymentIntakeStep } from '@/components/step/business/biz-employment-intake-step'
import { bizEmploymentEvidenceConfig } from '@/lib/guided-steps/business/biz-employment-evidence'
import { bizEmploymentDemandLetterConfig } from '@/lib/guided-steps/business/biz-employment-demand-letter'
import { bizEmploymentEeocConfig } from '@/lib/guided-steps/business/biz-employment-eeoc'
import { bizEmploymentFileWithCourtConfig } from '@/lib/guided-steps/business/biz-employment-file-with-court'
import { bizEmploymentServeDefendantConfig } from '@/lib/guided-steps/business/biz-employment-serve-defendant'
import { bizEmploymentWaitForAnswerConfig } from '@/lib/guided-steps/business/biz-employment-wait-for-answer'
import { bizEmploymentDiscoveryConfig } from '@/lib/guided-steps/business/biz-employment-discovery'
import { bizEmploymentPostResolutionConfig } from '@/lib/guided-steps/business/biz-employment-post-resolution'

// Business: B2B Commercial
import { BizB2bIntakeStep } from '@/components/step/business/biz-b2b-intake-step'
import { bizB2bEvidenceConfig } from '@/lib/guided-steps/business/biz-b2b-evidence'
import { bizB2bDemandLetterConfig } from '@/lib/guided-steps/business/biz-b2b-demand-letter'
import { bizB2bNegotiationConfig } from '@/lib/guided-steps/business/biz-b2b-negotiation'
import { bizB2bFileWithCourtConfig } from '@/lib/guided-steps/business/biz-b2b-file-with-court'
import { bizB2bServeDefendantConfig } from '@/lib/guided-steps/business/biz-b2b-serve-defendant'
import { bizB2bWaitForAnswerConfig } from '@/lib/guided-steps/business/biz-b2b-wait-for-answer'
import { bizB2bDiscoveryConfig } from '@/lib/guided-steps/business/biz-b2b-discovery'
import { bizB2bPostResolutionConfig } from '@/lib/guided-steps/business/biz-b2b-post-resolution'
```

**Step 2: Add 30 switch cases** (after RE cases, around line 1122)

```typescript
// ── BUSINESS: PARTNERSHIP ────────────────────────────
case 'biz_partnership_intake':
  return (
    <BizPartnershipIntakeStep
      caseId={id}
      taskId={taskId}
      existingMetadata={task.metadata}
    />
  )

case 'biz_partnership_evidence':
  return <GuidedStep caseId={id} taskId={taskId} config={bizPartnershipEvidenceConfig} existingAnswers={task.metadata?.guided_answers} />

case 'biz_partnership_demand_letter':
  return <GuidedStep caseId={id} taskId={taskId} config={bizPartnershipDemandLetterConfig} existingAnswers={task.metadata?.guided_answers} skippable />

case 'biz_partnership_adr':
  return <GuidedStep caseId={id} taskId={taskId} config={bizPartnershipAdrConfig} existingAnswers={task.metadata?.guided_answers} skippable />

case 'biz_partnership_prepare_filing': {
  const { data: caseRow } = await supabase
    .from('cases').select('role, court_type, county, dispute_type').eq('id', id).single()
  const { data: bizIntakeTask } = await supabase
    .from('tasks').select('metadata').eq('case_id', id).eq('task_key', 'biz_partnership_intake').maybeSingle()
  const bizIntakeMeta = bizIntakeTask?.metadata as Record<string, unknown> | null
  const governmentEntity = (bizIntakeMeta?.government_entity as boolean) ?? false

  if (!caseRow || caseRow.court_type === 'unknown') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link href={`/case/${id}`} className="text-sm text-warm-muted hover:text-warm-text mb-6 inline-block">&larr; Back to dashboard</Link>
        <Card><CardContent className="pt-6 text-center py-12">
          <h2 className="text-lg font-semibold text-warm-text mb-2">Court type needed</h2>
          <p className="text-sm text-warm-muted">Complete the intake step first so we know which court you are filing in.</p>
        </CardContent></Card>
      </div>
    )
  }

  return (
    <PetitionWizard
      caseId={id}
      taskId={taskId}
      existingMetadata={task.metadata}
      caseData={{
        ...caseRow,
        government_entity: governmentEntity,
      }}
    />
  )
}

case 'biz_partnership_file_with_court':
  return <GuidedStep caseId={id} taskId={taskId} config={bizPartnershipFileWithCourtConfig} existingAnswers={task.metadata?.guided_answers} />

case 'biz_partnership_serve_defendant':
  return <GuidedStep caseId={id} taskId={taskId} config={bizPartnershipServeDefendantConfig} existingAnswers={task.metadata?.guided_answers} />

case 'biz_partnership_wait_for_answer':
  return <GuidedStep caseId={id} taskId={taskId} config={bizPartnershipWaitForAnswerConfig} existingAnswers={task.metadata?.guided_answers} />

case 'biz_partnership_discovery':
  return <GuidedStep caseId={id} taskId={taskId} config={bizPartnershipDiscoveryConfig} existingAnswers={task.metadata?.guided_answers} />

case 'biz_partnership_post_resolution':
  return <GuidedStep caseId={id} taskId={taskId} config={bizPartnershipPostResolutionConfig} existingAnswers={task.metadata?.guided_answers} />

// ── BUSINESS: EMPLOYMENT ─────────────────────────────
case 'biz_employment_intake':
  return (
    <BizEmploymentIntakeStep
      caseId={id}
      taskId={taskId}
      existingMetadata={task.metadata}
    />
  )

case 'biz_employment_evidence':
  return <GuidedStep caseId={id} taskId={taskId} config={bizEmploymentEvidenceConfig} existingAnswers={task.metadata?.guided_answers} />

case 'biz_employment_demand_letter':
  return <GuidedStep caseId={id} taskId={taskId} config={bizEmploymentDemandLetterConfig} existingAnswers={task.metadata?.guided_answers} skippable />

case 'biz_employment_eeoc':
  return <GuidedStep caseId={id} taskId={taskId} config={bizEmploymentEeocConfig} existingAnswers={task.metadata?.guided_answers} skippable />

case 'biz_employment_prepare_filing': {
  const { data: caseRow } = await supabase
    .from('cases').select('role, court_type, county, dispute_type').eq('id', id).single()
  const { data: bizIntakeTask } = await supabase
    .from('tasks').select('metadata').eq('case_id', id).eq('task_key', 'biz_employment_intake').maybeSingle()
  const bizIntakeMeta = bizIntakeTask?.metadata as Record<string, unknown> | null
  const governmentEntity = (bizIntakeMeta?.government_entity as boolean) ?? false

  if (!caseRow || caseRow.court_type === 'unknown') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link href={`/case/${id}`} className="text-sm text-warm-muted hover:text-warm-text mb-6 inline-block">&larr; Back to dashboard</Link>
        <Card><CardContent className="pt-6 text-center py-12">
          <h2 className="text-lg font-semibold text-warm-text mb-2">Court type needed</h2>
          <p className="text-sm text-warm-muted">Complete the intake step first so we know which court you are filing in.</p>
        </CardContent></Card>
      </div>
    )
  }

  return (
    <PetitionWizard
      caseId={id}
      taskId={taskId}
      existingMetadata={task.metadata}
      caseData={{
        ...caseRow,
        government_entity: governmentEntity,
      }}
    />
  )
}

case 'biz_employment_file_with_court':
  return <GuidedStep caseId={id} taskId={taskId} config={bizEmploymentFileWithCourtConfig} existingAnswers={task.metadata?.guided_answers} />

case 'biz_employment_serve_defendant':
  return <GuidedStep caseId={id} taskId={taskId} config={bizEmploymentServeDefendantConfig} existingAnswers={task.metadata?.guided_answers} />

case 'biz_employment_wait_for_answer':
  return <GuidedStep caseId={id} taskId={taskId} config={bizEmploymentWaitForAnswerConfig} existingAnswers={task.metadata?.guided_answers} />

case 'biz_employment_discovery':
  return <GuidedStep caseId={id} taskId={taskId} config={bizEmploymentDiscoveryConfig} existingAnswers={task.metadata?.guided_answers} />

case 'biz_employment_post_resolution':
  return <GuidedStep caseId={id} taskId={taskId} config={bizEmploymentPostResolutionConfig} existingAnswers={task.metadata?.guided_answers} />

// ── BUSINESS: B2B COMMERCIAL ─────────────────────────
case 'biz_b2b_intake':
  return (
    <BizB2bIntakeStep
      caseId={id}
      taskId={taskId}
      existingMetadata={task.metadata}
    />
  )

case 'biz_b2b_evidence':
  return <GuidedStep caseId={id} taskId={taskId} config={bizB2bEvidenceConfig} existingAnswers={task.metadata?.guided_answers} />

case 'biz_b2b_demand_letter':
  return <GuidedStep caseId={id} taskId={taskId} config={bizB2bDemandLetterConfig} existingAnswers={task.metadata?.guided_answers} skippable />

case 'biz_b2b_negotiation':
  return <GuidedStep caseId={id} taskId={taskId} config={bizB2bNegotiationConfig} existingAnswers={task.metadata?.guided_answers} skippable />

case 'biz_b2b_prepare_filing': {
  const { data: caseRow } = await supabase
    .from('cases').select('role, court_type, county, dispute_type').eq('id', id).single()
  const { data: bizIntakeTask } = await supabase
    .from('tasks').select('metadata').eq('case_id', id).eq('task_key', 'biz_b2b_intake').maybeSingle()
  const bizIntakeMeta = bizIntakeTask?.metadata as Record<string, unknown> | null
  const governmentEntity = (bizIntakeMeta?.government_entity as boolean) ?? false

  if (!caseRow || caseRow.court_type === 'unknown') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link href={`/case/${id}`} className="text-sm text-warm-muted hover:text-warm-text mb-6 inline-block">&larr; Back to dashboard</Link>
        <Card><CardContent className="pt-6 text-center py-12">
          <h2 className="text-lg font-semibold text-warm-text mb-2">Court type needed</h2>
          <p className="text-sm text-warm-muted">Complete the intake step first so we know which court you are filing in.</p>
        </CardContent></Card>
      </div>
    )
  }

  return (
    <PetitionWizard
      caseId={id}
      taskId={taskId}
      existingMetadata={task.metadata}
      caseData={{
        ...caseRow,
        government_entity: governmentEntity,
      }}
    />
  )
}

case 'biz_b2b_file_with_court':
  return <GuidedStep caseId={id} taskId={taskId} config={bizB2bFileWithCourtConfig} existingAnswers={task.metadata?.guided_answers} />

case 'biz_b2b_serve_defendant':
  return <GuidedStep caseId={id} taskId={taskId} config={bizB2bServeDefendantConfig} existingAnswers={task.metadata?.guided_answers} />

case 'biz_b2b_wait_for_answer':
  return <GuidedStep caseId={id} taskId={taskId} config={bizB2bWaitForAnswerConfig} existingAnswers={task.metadata?.guided_answers} />

case 'biz_b2b_discovery':
  return <GuidedStep caseId={id} taskId={taskId} config={bizB2bDiscoveryConfig} existingAnswers={task.metadata?.guided_answers} />

case 'biz_b2b_post_resolution':
  return <GuidedStep caseId={id} taskId={taskId} config={bizB2bPostResolutionConfig} existingAnswers={task.metadata?.guided_answers} />
```

**Step 3: Build and commit**
```bash
npx next build 2>&1 | tail -5
git add src/app/(authenticated)/case/[id]/step/[taskId]/page.tsx
git commit -m "feat(business): add page routing for all 30 business task keys"
```

---

### Task 14: DB Migration

**Files:**
- Create: `supabase/migrations/20260313000002_business_workflow.sql`

**Step 1: Read the current full `seed_case_tasks()` and `unlock_next_task()` functions**

Read `supabase/migrations/20260313000001_real_estate_workflow.sql` to get the current function bodies. The new migration must include complete `CREATE OR REPLACE` for both functions, preserving ALL existing branches and adding the business branch.

**Step 2: Create the migration**

The migration must contain:

**Part A: business_details table**
```sql
-- Business dispute details
CREATE TABLE IF NOT EXISTS public.business_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  business_sub_type text NOT NULL CHECK (business_sub_type IN (
    'partnership', 'employment', 'b2b_commercial'
  )),
  -- Partnership fields
  business_name text,
  business_type text CHECK (business_type IN ('partnership', 'llc', 'corporation', 'other')),
  partner_names text,
  ownership_percentages text,
  formation_state text,
  has_operating_agreement boolean DEFAULT false,
  -- Employment fields
  employer_name text,
  employer_size text CHECK (employer_size IN ('small_under_15', 'medium_15_to_100', 'large_over_100')),
  position_title text,
  employment_start_date date,
  employment_end_date date,
  hr_complaint_filed boolean DEFAULT false,
  has_employment_contract boolean DEFAULT false,
  has_employee_handbook boolean DEFAULT false,
  -- B2B fields
  other_business_name text,
  contract_type text CHECK (contract_type IN ('service', 'vendor', 'licensing', 'distribution', 'other')),
  contract_date date,
  contract_amount numeric,
  has_written_contract boolean DEFAULT false,
  -- Shared fields
  specific_dispute_type text,
  dispute_description text,
  damages_sought numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(case_id)
);

ALTER TABLE public.business_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own business details"
  ON public.business_details
  FOR ALL
  USING (
    case_id IN (SELECT id FROM public.cases WHERE user_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS idx_business_details_case ON public.business_details(case_id);
```

**Part B: seed_case_tasks() — Add business branch**

Inside the function body, BEFORE the property branch, add:
```sql
IF NEW.dispute_type = 'business' THEN
  INSERT INTO public.tasks (case_id, task_key, title, status, unlocked_at)
  VALUES (NEW.id, 'welcome', 'Welcome — Get Started', 'todo', now());
  RETURN NEW;
END IF;
```

Business only seeds `welcome` here. The sub-type-specific tasks come from `seed_business_tasks()`.

**Part C: seed_business_tasks() function and trigger**

```sql
CREATE OR REPLACE FUNCTION public.seed_business_tasks()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_case RECORD;
BEGIN
  SELECT id, role, county, court_type, dispute_type
  INTO v_case
  FROM public.cases
  WHERE id = NEW.case_id;

  IF v_case IS NULL OR v_case.dispute_type != 'business' THEN
    RETURN NEW;
  END IF;

  -- PARTNERSHIP (10 tasks after welcome)
  IF NEW.business_sub_type = 'partnership' THEN
    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES
      (NEW.case_id, 'biz_partnership_intake', 'Tell Us About Your Partnership Dispute', 'locked'),
      (NEW.case_id, 'biz_partnership_evidence', 'Organize Your Evidence', 'locked'),
      (NEW.case_id, 'biz_partnership_demand_letter', 'Draft Your Demand Letter', 'locked'),
      (NEW.case_id, 'biz_partnership_adr', 'Mediation or Arbitration', 'locked'),
      (NEW.case_id, 'biz_partnership_prepare_filing', 'Prepare Your Court Filing', 'locked'),
      (NEW.case_id, 'biz_partnership_file_with_court', 'File With the Court', 'locked'),
      (NEW.case_id, 'biz_partnership_serve_defendant', 'Serve the Other Party', 'locked'),
      (NEW.case_id, 'biz_partnership_wait_for_answer', 'Wait for the Answer', 'locked'),
      (NEW.case_id, 'biz_partnership_discovery', 'Prepare Your Discovery', 'locked'),
      (NEW.case_id, 'biz_partnership_post_resolution', 'Post-Resolution Steps', 'locked');

  -- EMPLOYMENT (10 tasks after welcome)
  ELSIF NEW.business_sub_type = 'employment' THEN
    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES
      (NEW.case_id, 'biz_employment_intake', 'Tell Us About Your Employment Dispute', 'locked'),
      (NEW.case_id, 'biz_employment_evidence', 'Organize Your Evidence', 'locked'),
      (NEW.case_id, 'biz_employment_demand_letter', 'Draft Your Demand Letter', 'locked'),
      (NEW.case_id, 'biz_employment_eeoc', 'File EEOC/TWC Complaint', 'locked'),
      (NEW.case_id, 'biz_employment_prepare_filing', 'Prepare Your Court Filing', 'locked'),
      (NEW.case_id, 'biz_employment_file_with_court', 'File With the Court', 'locked'),
      (NEW.case_id, 'biz_employment_serve_defendant', 'Serve the Employer', 'locked'),
      (NEW.case_id, 'biz_employment_wait_for_answer', 'Wait for the Answer', 'locked'),
      (NEW.case_id, 'biz_employment_discovery', 'Prepare Your Discovery', 'locked'),
      (NEW.case_id, 'biz_employment_post_resolution', 'Post-Resolution Steps', 'locked');

  -- B2B COMMERCIAL (10 tasks after welcome)
  ELSIF NEW.business_sub_type = 'b2b_commercial' THEN
    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES
      (NEW.case_id, 'biz_b2b_intake', 'Tell Us About Your Commercial Dispute', 'locked'),
      (NEW.case_id, 'biz_b2b_evidence', 'Organize Your Evidence', 'locked'),
      (NEW.case_id, 'biz_b2b_demand_letter', 'Draft Your Demand Letter', 'locked'),
      (NEW.case_id, 'biz_b2b_negotiation', 'Settlement Negotiation', 'locked'),
      (NEW.case_id, 'biz_b2b_prepare_filing', 'Prepare Your Court Filing', 'locked'),
      (NEW.case_id, 'biz_b2b_file_with_court', 'File With the Court', 'locked'),
      (NEW.case_id, 'biz_b2b_serve_defendant', 'Serve the Other Business', 'locked'),
      (NEW.case_id, 'biz_b2b_wait_for_answer', 'Wait for the Answer', 'locked'),
      (NEW.case_id, 'biz_b2b_discovery', 'Prepare Your Discovery', 'locked'),
      (NEW.case_id, 'biz_b2b_post_resolution', 'Post-Resolution Steps', 'locked');
  END IF;

  INSERT INTO public.task_events (case_id, kind, payload)
  VALUES (NEW.case_id, 'business_tasks_seeded', jsonb_build_object(
    'business_sub_type', NEW.business_sub_type,
    'tasks_seeded', 10
  ));

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_seed_business_tasks ON public.business_details;
CREATE TRIGGER trg_seed_business_tasks
  AFTER INSERT ON public.business_details
  FOR EACH ROW
  EXECUTE FUNCTION public.seed_business_tasks();
```

**Part D: unlock_next_task() — Add business chains**

Add 3 chains (partnership, employment, b2b) inside the function body. Each chain has:
1. `welcome → biz_X_intake`
2. `biz_X_intake → CONDITIONAL` (case_stage branching: start/demand_sent/filed/served/in_litigation)
3. `biz_X_evidence → biz_X_demand_letter`
4. `biz_X_demand_letter → biz_X_adr/eeoc/negotiation` (completed OR skipped)
5. `biz_X_adr/eeoc/negotiation → biz_X_prepare_filing` (completed OR skipped)
6. `biz_X_prepare_filing → biz_X_file_with_court`
7. `biz_X_file_with_court → biz_X_serve_defendant`
8. `biz_X_serve_defendant → biz_X_wait_for_answer`
9. `biz_X_wait_for_answer → biz_X_discovery`
10. `biz_X_discovery → biz_X_post_resolution`

For the `welcome → biz_X_intake` transition, check the task_key prefix to determine which intake to unlock. Since `welcome` is shared, use a join to `business_details` to get the sub-type:

```sql
-- Business: welcome -> biz_*_intake (check business_details for sub-type)
IF NEW.task_key = 'welcome' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
  -- Check if this is a business case
  PERFORM 1 FROM public.business_details WHERE case_id = NEW.case_id AND business_sub_type = 'partnership';
  IF FOUND THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'biz_partnership_intake' AND status = 'locked';
  END IF;

  PERFORM 1 FROM public.business_details WHERE case_id = NEW.case_id AND business_sub_type = 'employment';
  IF FOUND THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'biz_employment_intake' AND status = 'locked';
  END IF;

  PERFORM 1 FROM public.business_details WHERE case_id = NEW.case_id AND business_sub_type = 'b2b_commercial';
  IF FOUND THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'biz_b2b_intake' AND status = 'locked';
  END IF;
END IF;
```

NOTE: The `welcome → intake` transitions for other dispute types already exist. The business transitions above should be added in a way that doesn't conflict — they will only match if the corresponding `biz_*_intake` task exists (which only happens for business cases).

For all remaining transitions (intake → evidence, etc.), they are specific task_keys and won't conflict with other dispute types.

**Step 3: Build and commit**
```bash
npx next build 2>&1 | tail -5
git add supabase/migrations/20260313000002_business_workflow.sql
git commit -m "feat(business): add DB migration for business_details, seeding, and unlock chains"
```

---

### Task 15: Build Verification & Final Check

**Step 1: Full build**
```bash
npx next build 2>&1 | tail -10
```

**Step 2: Verify all task keys are wired**

Run these verification checks:

```bash
# All 30 biz_* task keys in workflow-phases.ts
grep -c 'biz_' src/lib/workflow-phases.ts

# All 33 biz_* entries in step-guidance.ts
grep -c 'biz_' src/lib/step-guidance.ts

# All 30 biz_* switch cases in page.tsx
grep -c "'biz_" src/app/\(authenticated\)/case/\[id\]/step/\[taskId\]/page.tsx

# All 3 milestone arrays in milestones.ts
grep -c 'MILESTONES' src/lib/rules/milestones.ts

# All 6 skippable tasks in sidebar
grep 'biz_' src/components/case/workflow-sidebar.tsx

# All 6 skippable tasks in next-step-card
grep 'biz_' src/components/dashboard/next-step-card.tsx

# 25 guided config files exist
ls src/lib/guided-steps/business/ | wc -l

# 3 intake components exist
ls src/components/step/business/ | wc -l

# business_details in migration
grep 'business_details' supabase/migrations/20260313000002_business_workflow.sql | head -5
```

**Step 3: Commit any fixes, then final commit**
```bash
git add -A
git commit -m "feat(business): final verification and cleanup"
```

---

## File Inventory

| # | File | Action | Task |
|---|------|--------|------|
| 1 | `src/lib/schemas/case.ts` | Modify | 1 |
| 2 | `src/lib/rules/court-recommendation.ts` | Modify | 1 |
| 3 | `src/components/cases/wizard/dispute-type-step.tsx` | Modify | 2 |
| 4 | `src/components/cases/wizard/business-sub-type-step.tsx` | Create | 2 |
| 5 | `src/components/cases/wizard/new-case-dialog.tsx` | Modify | 2 |
| 6 | `src/app/api/cases/route.ts` | Modify | 2 |
| 7 | `src/lib/workflow-phases.ts` | Modify | 3 |
| 8 | `src/lib/step-guidance.ts` | Modify | 4 |
| 9 | `src/lib/rules/milestones.ts` | Modify | 5 |
| 10 | `src/components/case/workflow-sidebar.tsx` | Modify | 6 |
| 11 | `src/components/dashboard/next-step-card.tsx` | Modify | 6 |
| 12 | `src/app/(authenticated)/case/[id]/layout.tsx` | Modify | 6 |
| 13 | `src/components/step/business/biz-partnership-intake-step.tsx` | Create | 7 |
| 14 | `src/components/step/business/biz-employment-intake-step.tsx` | Create | 8 |
| 15 | `src/components/step/business/biz-b2b-intake-step.tsx` | Create | 9 |
| 16-23 | `src/lib/guided-steps/business/biz-partnership-*.ts` | Create (8) | 10 |
| 24-32 | `src/lib/guided-steps/business/biz-employment-*.ts` | Create (9) | 11 |
| 33-40 | `src/lib/guided-steps/business/biz-b2b-*.ts` | Create (8) | 12 |
| 41 | `src/app/(authenticated)/case/[id]/step/[taskId]/page.tsx` | Modify | 13 |
| 42 | `supabase/migrations/20260313000002_business_workflow.sql` | Create | 14 |
| **Total** | | **42 files** | |
