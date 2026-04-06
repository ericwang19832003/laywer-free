# Missing Dispute Type Workflows — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add fully specialized workflows for the three missing dispute types — contract, property, and other — each with sub-types, detail tables, intake steps, demand letters, petition wizards, guided step configs, and proper unlock chains.

**Architecture:** Follow the exact patterns established by existing dispute types (small_claims, landlord_tenant, debt_collection, family, personal_injury). Each type gets: sub-types in schema, detail table with RLS, task seeding trigger branch, unlock chain, workflow phases, step components, guided configs, step guidance, page router entries, and API handling.

**Tech Stack:** Next.js 16, TypeScript, Supabase (PostgreSQL with RLS), Tailwind CSS 4, Zod, Lucide React

---

## Phase 1: Foundation (All 3 Types)

### Task 1: Schema — Add Sub-Type Enums

**Files:**
- Modify: `src/lib/schemas/case.ts`

**Step 1: Add CONTRACT_SUB_TYPES**

After the `PI_SUB_TYPES` block (line 75), add:

```typescript
export const CONTRACT_SUB_TYPES = [
  'breach_of_contract',
  'non_payment',
  'fraud_misrepresentation',
  'warranty',
  'employment',
  'construction',
  'other_contract',
] as const

export type ContractSubType = (typeof CONTRACT_SUB_TYPES)[number]
```

**Step 2: Add PROPERTY_DISPUTE_SUB_TYPES**

```typescript
export const PROPERTY_DISPUTE_SUB_TYPES = [
  'boundary_dispute',
  'easement',
  'title_defect',
  'trespass',
  'nuisance',
  'hoa_dispute',
  'real_estate_transaction',
  'other_property',
] as const

export type PropertyDisputeSubType = (typeof PROPERTY_DISPUTE_SUB_TYPES)[number]
```

**Step 3: Add OTHER_SUB_TYPES**

```typescript
export const OTHER_SUB_TYPES = [
  'consumer_protection',
  'civil_rights',
  'defamation',
  'harassment',
  'insurance_dispute',
  'government_action',
  'general_civil',
] as const

export type OtherSubType = (typeof OTHER_SUB_TYPES)[number]
```

**Step 4: Update createCaseSchema**

Add to the schema object (after `pi_sub_type` line):

```typescript
  contract_sub_type: z.enum(CONTRACT_SUB_TYPES).optional(),
  property_sub_type: z.enum(PROPERTY_DISPUTE_SUB_TYPES).optional(),
  other_sub_type: z.enum(OTHER_SUB_TYPES).optional(),
```

**Step 5: Build and verify**

Run: `cd "/Users/minwang/lawyer free" && npx next build 2>&1 | tail -5`

---

### Task 2: Workflow Phases

**Files:**
- Modify: `src/lib/workflow-phases.ts`

**Step 1: Add contract phases**

Add before the `civil` entry:

```typescript
  contract: [
    {
      label: 'Getting Started',
      taskKeys: ['welcome', 'contract_intake'],
    },
    {
      label: 'Building Your Case',
      taskKeys: ['evidence_vault', 'contract_demand_letter', 'contract_negotiation'],
    },
    {
      label: 'Filing & Service',
      taskKeys: ['contract_prepare_filing', 'contract_file_with_court', 'contract_serve_defendant'],
    },
    {
      label: 'Litigation',
      taskKeys: ['contract_wait_for_answer', 'contract_review_answer', 'contract_discovery', 'contract_mediation'],
    },
    {
      label: 'Resolution',
      taskKeys: ['contract_post_resolution'],
    },
  ],
```

**Step 2: Add property phases**

```typescript
  property: [
    {
      label: 'Getting Started',
      taskKeys: ['welcome', 'property_intake'],
    },
    {
      label: 'Building Your Case',
      taskKeys: ['evidence_vault', 'property_demand_letter', 'property_negotiation'],
    },
    {
      label: 'Filing & Service',
      taskKeys: ['property_prepare_filing', 'property_file_with_court', 'property_serve_defendant'],
    },
    {
      label: 'Litigation',
      taskKeys: ['property_wait_for_answer', 'property_review_answer', 'property_discovery'],
    },
    {
      label: 'Resolution',
      taskKeys: ['property_post_resolution'],
    },
  ],
```

**Step 3: Add other phases**

```typescript
  other: [
    {
      label: 'Getting Started',
      taskKeys: ['welcome', 'other_intake'],
    },
    {
      label: 'Building Your Case',
      taskKeys: ['evidence_vault', 'other_demand_letter'],
    },
    {
      label: 'Filing & Service',
      taskKeys: ['other_prepare_filing', 'other_file_with_court', 'other_serve_defendant'],
    },
    {
      label: 'Litigation',
      taskKeys: ['other_wait_for_answer', 'other_review_answer', 'other_discovery'],
    },
    {
      label: 'Resolution',
      taskKeys: ['other_post_resolution'],
    },
  ],
```

**Step 4: Build and verify**

Run: `cd "/Users/minwang/lawyer free" && npx next build 2>&1 | tail -5`

---

### Task 3: Step Guidance — All 3 Types

**Files:**
- Modify: `src/lib/step-guidance.ts`

**Step 1: Add contract guidance entries**

Add after the existing family section (before the closing `}`):

```typescript
  // --- Contract ---
  contract_intake: {
    why: 'Contract details — the parties, terms, and breach — form the foundation of your legal claim.',
    checklist: [
      'A copy of the contract (written or summary of oral terms)',
      'Names of all parties involved',
      'Description of what the other party failed to do',
      'Amount of damages you\'re claiming',
    ],
    tip: 'Even if you don\'t have a written contract, oral agreements can be enforceable.',
  },
  contract_demand_letter: {
    why: 'A demand letter formally notifies the other party and often resolves disputes without court involvement.',
    checklist: [
      'Other party\'s name and mailing address',
      'Specific contract terms that were breached',
      'Amount you\'re demanding',
      'Deadline for response (typically 30 days)',
    ],
  },
  contract_negotiation: {
    why: 'Many contract disputes settle through negotiation. Understanding your leverage helps you reach a fair resolution.',
    checklist: [
      'Your minimum acceptable settlement amount',
      'Evidence of the breach and your damages',
      'Any prior communications about the dispute',
    ],
  },
  contract_prepare_filing: {
    why: 'Your petition establishes your legal claims in court. Getting the format and content right is essential.',
    checklist: [
      'Completed demand letter (if sent)',
      'All evidence from your vault',
      'Filing fee for your county',
    ],
  },
  contract_file_with_court: {
    why: 'Filing officially starts your lawsuit. This step guides you through the filing process.',
    checklist: [
      'Prepared petition document',
      'Filing fee payment',
      'Government-issued ID',
    ],
  },
  contract_serve_defendant: {
    why: 'The defendant must be formally notified of the lawsuit before the case can proceed.',
    checklist: [
      'Defendant\'s address for service',
      'Budget for process server or certified mail',
    ],
  },
  contract_wait_for_answer: {
    why: 'After service, the defendant has a set number of days to respond. This waiting period is normal.',
    checklist: [
      'Monitor the court docket for filings',
      'Watch for mail from the court',
    ],
  },
  contract_review_answer: {
    why: 'Understanding the defendant\'s response helps you identify their defenses and plan your strategy.',
    checklist: [
      'The defendant\'s filed answer',
      'Note any counterclaims or affirmative defenses',
    ],
  },
  contract_discovery: {
    why: 'Discovery lets you formally request evidence from the other side to strengthen your position.',
    checklist: [
      'List of documents you want from the defendant',
      'Questions about the contract and breach',
      'Financial records related to damages',
    ],
  },
  contract_mediation: {
    why: 'Mediation with a neutral third party can resolve your dispute faster and cheaper than going to trial.',
    checklist: [
      'Your settlement range (minimum to ideal)',
      'Summary of your strongest evidence',
      'All financial documentation of damages',
    ],
  },
  contract_post_resolution: {
    why: 'After your case resolves, there are steps to collect payment or enforce the judgment.',
    checklist: [
      'Settlement agreement or court order',
      'Payment timeline and method',
    ],
  },
```

**Step 2: Add property guidance entries**

```typescript
  // --- Property Dispute ---
  property_intake: {
    why: 'Property dispute details — location, parties, and the nature of the dispute — shape your legal strategy.',
    checklist: [
      'Property address',
      'Other party\'s name and relationship (neighbor, seller, HOA, etc.)',
      'Description of the dispute',
      'Any surveys, deeds, or title documents',
    ],
    tip: 'Photos and documentation of the property issue are especially valuable.',
  },
  property_demand_letter: {
    why: 'A demand letter formally notifies the other party and establishes a record of your attempt to resolve the issue.',
    checklist: [
      'Other party\'s name and address',
      'Specific property right being violated',
      'What you want them to do (stop, pay, fix)',
      'Deadline for response',
    ],
  },
  property_negotiation: {
    why: 'Property disputes often benefit from negotiation, especially between neighbors or in real estate transactions.',
    checklist: [
      'Your ideal resolution',
      'Evidence supporting your position (surveys, photos, deeds)',
      'Any prior communications about the issue',
    ],
  },
  property_prepare_filing: {
    why: 'Your court filing establishes your property rights claims. Getting the legal basis right is essential.',
    checklist: [
      'Property deed or title documents',
      'Survey (if applicable)',
      'Evidence from your vault',
      'Filing fee for your county',
    ],
  },
  property_file_with_court: {
    why: 'Filing officially starts your lawsuit to protect your property rights.',
    checklist: [
      'Prepared petition document',
      'Filing fee payment',
      'Government-issued ID',
    ],
  },
  property_serve_defendant: {
    why: 'The other party must be formally notified of the lawsuit before the case can proceed.',
    checklist: [
      'Other party\'s address for service',
      'Budget for process server or certified mail',
    ],
  },
  property_wait_for_answer: {
    why: 'After service, the other party has a set number of days to respond.',
    checklist: [
      'Monitor the court docket for filings',
      'Watch for mail from the court',
    ],
  },
  property_review_answer: {
    why: 'Understanding the other party\'s response reveals their legal position and any counterclaims.',
    checklist: [
      'The defendant\'s filed answer',
      'Note any counterclaims about property rights',
    ],
  },
  property_discovery: {
    why: 'Discovery in property cases often involves surveys, appraisals, and title searches.',
    checklist: [
      'Documents you want from the other party',
      'Whether you need a professional survey or appraisal',
      'Title search records',
    ],
  },
  property_post_resolution: {
    why: 'After resolution, you may need to record the judgment or take steps to enforce property rights.',
    checklist: [
      'Court order or settlement agreement',
      'Recording requirements at the county clerk',
    ],
  },
```

**Step 3: Add other guidance entries**

```typescript
  // --- Other ---
  other_intake: {
    why: 'Understanding your situation helps us guide you through the right legal process.',
    checklist: [
      'Names of the parties involved',
      'Description of what happened',
      'What outcome you\'re seeking',
      'Any deadlines you\'re aware of',
    ],
    tip: 'Even if your situation feels unique, the legal process follows the same basic steps.',
  },
  other_demand_letter: {
    why: 'A demand letter formally requests resolution and creates a record of your attempt to settle before court.',
    checklist: [
      'Other party\'s name and address',
      'Clear description of your complaint',
      'What you want (compensation, action, or both)',
      'Deadline for response',
    ],
  },
  other_prepare_filing: {
    why: 'Your court filing establishes your legal claims. Getting the content right helps the court understand your case.',
    checklist: [
      'All evidence from your vault',
      'Demand letter (if sent)',
      'Filing fee for your county',
    ],
  },
  other_file_with_court: {
    why: 'Filing officially starts your case with the court.',
    checklist: [
      'Prepared petition document',
      'Filing fee payment',
      'Government-issued ID',
    ],
  },
  other_serve_defendant: {
    why: 'The other party must receive formal notice of the lawsuit before the case can move forward.',
    checklist: [
      'Other party\'s address for service',
      'Budget for process server or certified mail',
    ],
  },
  other_wait_for_answer: {
    why: 'After service, the other party has a set number of days to respond.',
    checklist: [
      'Monitor the court docket',
      'Watch for court mail',
    ],
  },
  other_review_answer: {
    why: 'The other party\'s response reveals their defenses and any counterclaims.',
    checklist: [
      'The filed answer document',
      'Note any counterclaims or defenses',
    ],
  },
  other_discovery: {
    why: 'Discovery lets you formally obtain evidence and information from the other side.',
    checklist: [
      'List of documents you need',
      'Questions for the other party',
    ],
  },
  other_post_resolution: {
    why: 'After your case resolves, there may be steps to enforce the judgment or finalize the outcome.',
    checklist: [
      'Court order or settlement agreement',
      'Payment or compliance deadlines',
    ],
  },
```

**Step 4: Build and verify**

Run: `cd "/Users/minwang/lawyer free" && npx next build 2>&1 | tail -5`

---

### Task 4: Case API — Handle New Sub-Types

**Files:**
- Modify: `src/app/api/cases/route.ts`

**Step 1: Read the file to find the pattern**

Look for the existing sub-type insertion blocks (e.g., `if (body.family_sub_type)` pattern).

**Step 2: Add contract_sub_type handling**

After the existing `pi_sub_type` block, add:

```typescript
    if (body.contract_sub_type) {
      await supabase.from('contract_details').insert({
        case_id: newCase.id,
        contract_sub_type: body.contract_sub_type,
      })
    }
```

**Step 3: Add property_sub_type handling**

```typescript
    if (body.property_sub_type) {
      await supabase.from('property_dispute_details').insert({
        case_id: newCase.id,
        property_sub_type: body.property_sub_type,
      })
    }
```

**Step 4: Add other_sub_type handling**

```typescript
    if (body.other_sub_type) {
      await supabase.from('other_case_details').insert({
        case_id: newCase.id,
        other_sub_type: body.other_sub_type,
      })
    }
```

**Step 5: Build and verify**

Run: `cd "/Users/minwang/lawyer free" && npx next build 2>&1 | tail -5`

---

### Task 5: Database Migration — Detail Tables & Task Seeding

**Files:**
- Create: `supabase/migrations/20260312000001_contract_property_other_tables.sql`

**Step 1: Create the migration file**

This migration creates 3 detail tables, adds RLS, and updates both `seed_case_tasks()` and `unlock_next_task()` with branches for all 3 new dispute types.

```sql
-- =============================================================
-- CONTRACT DETAILS TABLE
-- =============================================================
CREATE TABLE IF NOT EXISTS public.contract_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  contract_sub_type text NOT NULL CHECK (contract_sub_type IN (
    'breach_of_contract', 'non_payment', 'fraud_misrepresentation',
    'warranty', 'employment', 'construction', 'other_contract'
  )),
  contract_date date,
  contract_amount numeric,
  other_party_name text,
  other_party_type text CHECK (other_party_type IN ('individual', 'business')),
  breach_description text,
  damages_sought numeric,
  has_written_contract boolean DEFAULT false,
  contract_document_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(case_id)
);

ALTER TABLE public.contract_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own contract details"
  ON public.contract_details
  FOR ALL
  USING (
    case_id IN (SELECT id FROM public.cases WHERE user_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS idx_contract_details_case ON public.contract_details(case_id);

-- =============================================================
-- PROPERTY DISPUTE DETAILS TABLE
-- =============================================================
CREATE TABLE IF NOT EXISTS public.property_dispute_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  property_sub_type text NOT NULL CHECK (property_sub_type IN (
    'boundary_dispute', 'easement', 'title_defect', 'trespass',
    'nuisance', 'hoa_dispute', 'real_estate_transaction', 'other_property'
  )),
  property_address text,
  property_type text CHECK (property_type IN ('residential', 'commercial', 'land')),
  other_party_name text,
  other_party_relationship text CHECK (other_party_relationship IN (
    'neighbor', 'seller', 'buyer', 'hoa', 'other'
  )),
  dispute_description text,
  property_value numeric,
  damages_sought numeric,
  has_survey boolean DEFAULT false,
  has_title_insurance boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(case_id)
);

ALTER TABLE public.property_dispute_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own property dispute details"
  ON public.property_dispute_details
  FOR ALL
  USING (
    case_id IN (SELECT id FROM public.cases WHERE user_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS idx_property_dispute_details_case ON public.property_dispute_details(case_id);

-- =============================================================
-- OTHER CASE DETAILS TABLE
-- =============================================================
CREATE TABLE IF NOT EXISTS public.other_case_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  other_sub_type text NOT NULL CHECK (other_sub_type IN (
    'consumer_protection', 'civil_rights', 'defamation',
    'harassment', 'insurance_dispute', 'government_action', 'general_civil'
  )),
  other_party_name text,
  other_party_type text CHECK (other_party_type IN ('individual', 'business', 'government')),
  dispute_description text,
  damages_sought numeric,
  urgency text CHECK (urgency IN ('routine', 'time_sensitive', 'urgent')),
  has_prior_demand boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(case_id)
);

ALTER TABLE public.other_case_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own other case details"
  ON public.other_case_details
  FOR ALL
  USING (
    case_id IN (SELECT id FROM public.cases WHERE user_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS idx_other_case_details_case ON public.other_case_details(case_id);

-- =============================================================
-- UPDATE seed_case_tasks() — Add 3 new branches
-- =============================================================
CREATE OR REPLACE FUNCTION public.seed_case_tasks()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- ========== CONTRACT ==========
  IF NEW.dispute_type = 'contract' THEN
    INSERT INTO public.tasks (case_id, task_key, title, status, unlocked_at)
    VALUES (NEW.id, 'welcome', 'Welcome — Get Started', 'todo', now());

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES
      (NEW.id, 'contract_intake', 'Tell Us About Your Contract Dispute', 'locked'),
      (NEW.id, 'evidence_vault', 'Organize Your Evidence', 'locked'),
      (NEW.id, 'contract_demand_letter', 'Draft Your Demand Letter', 'locked'),
      (NEW.id, 'contract_negotiation', 'Settlement Negotiation', 'locked'),
      (NEW.id, 'contract_prepare_filing', 'Prepare Your Court Filing', 'locked'),
      (NEW.id, 'contract_file_with_court', 'File With the Court', 'locked'),
      (NEW.id, 'contract_serve_defendant', 'Serve the Defendant', 'locked'),
      (NEW.id, 'contract_wait_for_answer', 'Wait for the Answer', 'locked'),
      (NEW.id, 'contract_review_answer', 'Review the Opposing Answer', 'locked'),
      (NEW.id, 'contract_discovery', 'Prepare Your Discovery', 'locked'),
      (NEW.id, 'contract_mediation', 'Mediation', 'locked'),
      (NEW.id, 'contract_post_resolution', 'Post-Resolution Steps', 'locked');

    INSERT INTO public.task_events (case_id, kind, payload)
    VALUES (NEW.id, 'case_created', jsonb_build_object(
      'dispute_type', NEW.dispute_type,
      'tasks_seeded', 13
    ));

    RETURN NEW;
  END IF;

  -- ========== PROPERTY ==========
  IF NEW.dispute_type = 'property' THEN
    INSERT INTO public.tasks (case_id, task_key, title, status, unlocked_at)
    VALUES (NEW.id, 'welcome', 'Welcome — Get Started', 'todo', now());

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES
      (NEW.id, 'property_intake', 'Tell Us About Your Property Dispute', 'locked'),
      (NEW.id, 'evidence_vault', 'Organize Your Evidence', 'locked'),
      (NEW.id, 'property_demand_letter', 'Draft Your Demand Letter', 'locked'),
      (NEW.id, 'property_negotiation', 'Attempt Resolution', 'locked'),
      (NEW.id, 'property_prepare_filing', 'Prepare Your Court Filing', 'locked'),
      (NEW.id, 'property_file_with_court', 'File With the Court', 'locked'),
      (NEW.id, 'property_serve_defendant', 'Serve the Other Party', 'locked'),
      (NEW.id, 'property_wait_for_answer', 'Wait for the Answer', 'locked'),
      (NEW.id, 'property_review_answer', 'Review the Opposing Answer', 'locked'),
      (NEW.id, 'property_discovery', 'Prepare Your Discovery', 'locked'),
      (NEW.id, 'property_post_resolution', 'Post-Resolution Steps', 'locked');

    INSERT INTO public.task_events (case_id, kind, payload)
    VALUES (NEW.id, 'case_created', jsonb_build_object(
      'dispute_type', NEW.dispute_type,
      'tasks_seeded', 12
    ));

    RETURN NEW;
  END IF;

  -- ========== OTHER ==========
  IF NEW.dispute_type = 'other' THEN
    INSERT INTO public.tasks (case_id, task_key, title, status, unlocked_at)
    VALUES (NEW.id, 'welcome', 'Welcome — Get Started', 'todo', now());

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES
      (NEW.id, 'other_intake', 'Tell Us About Your Situation', 'locked'),
      (NEW.id, 'evidence_vault', 'Organize Your Evidence', 'locked'),
      (NEW.id, 'other_demand_letter', 'Draft Your Demand Letter', 'locked'),
      (NEW.id, 'other_prepare_filing', 'Prepare Your Court Filing', 'locked'),
      (NEW.id, 'other_file_with_court', 'File With the Court', 'locked'),
      (NEW.id, 'other_serve_defendant', 'Serve the Other Party', 'locked'),
      (NEW.id, 'other_wait_for_answer', 'Wait for the Answer', 'locked'),
      (NEW.id, 'other_review_answer', 'Review the Opposing Answer', 'locked'),
      (NEW.id, 'other_discovery', 'Prepare Your Discovery', 'locked'),
      (NEW.id, 'other_post_resolution', 'Post-Resolution Steps', 'locked');

    INSERT INTO public.task_events (case_id, kind, payload)
    VALUES (NEW.id, 'case_created', jsonb_build_object(
      'dispute_type', NEW.dispute_type,
      'tasks_seeded', 11
    ));

    RETURN NEW;
  END IF;

  -- ... existing branches (personal_injury, small_claims, etc.) remain below ...
  -- NOTE: The implementer must read the FULL existing function body and
  -- INSERT these 3 new IF blocks BEFORE the existing branches.
  -- The existing function body stays unchanged after these new blocks.
```

**IMPORTANT:** The implementer must read the existing `seed_case_tasks()` function, copy its full body, and prepend these 3 new IF blocks. The CREATE OR REPLACE will replace the function entirely, so the existing branches must be preserved.

**Step 2: Update unlock_next_task() — Add unlock chains**

Same approach — read existing function, add 3 new chains:

```sql
CREATE OR REPLACE FUNCTION public.unlock_next_task()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- ========== CONTRACT UNLOCK CHAIN ==========
  IF NEW.task_key = 'welcome' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'contract_intake' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'contract_intake' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'evidence_vault' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'evidence_vault' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'contract_demand_letter' AND status = 'locked';
  END IF;

  IF (NEW.task_key = 'contract_demand_letter' AND (NEW.status = 'completed' OR NEW.status = 'skipped') AND OLD.status != 'completed' AND OLD.status != 'skipped') THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'contract_negotiation' AND status = 'locked';
  END IF;

  IF (NEW.task_key = 'contract_negotiation' AND (NEW.status = 'completed' OR NEW.status = 'skipped') AND OLD.status != 'completed' AND OLD.status != 'skipped') THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'contract_prepare_filing' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'contract_prepare_filing' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'contract_file_with_court' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'contract_file_with_court' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'contract_serve_defendant' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'contract_serve_defendant' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'contract_wait_for_answer' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'contract_wait_for_answer' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'contract_review_answer' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'contract_review_answer' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'contract_discovery' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'contract_discovery' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'contract_mediation' AND status = 'locked';
  END IF;

  IF (NEW.task_key = 'contract_mediation' AND (NEW.status = 'completed' OR NEW.status = 'skipped') AND OLD.status != 'completed' AND OLD.status != 'skipped') THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'contract_post_resolution' AND status = 'locked';
  END IF;

  -- ========== PROPERTY UNLOCK CHAIN ==========
  -- welcome → property_intake (handled by shared welcome unlock)
  IF NEW.task_key = 'welcome' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'property_intake' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'property_intake' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'evidence_vault' AND status = 'locked';
  END IF;

  -- evidence_vault → property_demand_letter (handled by shared evidence_vault unlock)
  IF NEW.task_key = 'evidence_vault' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'property_demand_letter' AND status = 'locked';
  END IF;

  IF (NEW.task_key = 'property_demand_letter' AND (NEW.status = 'completed' OR NEW.status = 'skipped') AND OLD.status != 'completed' AND OLD.status != 'skipped') THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'property_negotiation' AND status = 'locked';
  END IF;

  IF (NEW.task_key = 'property_negotiation' AND (NEW.status = 'completed' OR NEW.status = 'skipped') AND OLD.status != 'completed' AND OLD.status != 'skipped') THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'property_prepare_filing' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'property_prepare_filing' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'property_file_with_court' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'property_file_with_court' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'property_serve_defendant' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'property_serve_defendant' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'property_wait_for_answer' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'property_wait_for_answer' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'property_review_answer' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'property_review_answer' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'property_discovery' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'property_discovery' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'property_post_resolution' AND status = 'locked';
  END IF;

  -- ========== OTHER UNLOCK CHAIN ==========
  IF NEW.task_key = 'welcome' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'other_intake' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'other_intake' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'evidence_vault' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'evidence_vault' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'other_demand_letter' AND status = 'locked';
  END IF;

  IF (NEW.task_key = 'other_demand_letter' AND (NEW.status = 'completed' OR NEW.status = 'skipped') AND OLD.status != 'completed' AND OLD.status != 'skipped') THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'other_prepare_filing' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'other_prepare_filing' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'other_file_with_court' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'other_file_with_court' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'other_serve_defendant' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'other_serve_defendant' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'other_wait_for_answer' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'other_wait_for_answer' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'other_review_answer' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'other_review_answer' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'other_discovery' AND status = 'locked';
  END IF;

  IF NEW.task_key = 'other_discovery' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'other_post_resolution' AND status = 'locked';
  END IF;

  -- ... existing unlock chains for other dispute types remain below ...
  -- NOTE: Same as seed_case_tasks — read existing body, prepend these blocks,
  -- then keep all existing unlock IF blocks unchanged.
```

**CRITICAL:** The implementer MUST read the full existing `seed_case_tasks()` and `unlock_next_task()` functions and incorporate the new blocks without losing existing branches. Use CREATE OR REPLACE to replace the entire function body.

**Step 3: Apply migration locally**

Run: `cd "/Users/minwang/lawyer free" && npx supabase db push` (or apply via Supabase dashboard)

---

## Phase 2: Contract Dispute Components

### Task 6: Contract Intake Step

**Files:**
- Create: `src/components/step/contract/contract-intake-step.tsx`

Follow the pattern of `small-claims-intake-step.tsx`. The component should:

1. Accept props: `caseId`, `taskId`, `existingMetadata?`
2. State fields: `county`, `otherPartyName`, `otherPartyType` (individual/business), `contractDate`, `contractAmount`, `hasWrittenContract`, `breachDescription`, `damagesSought`, `caseStage` (start/demand_sent/filed/served)
3. Use `StepRunner` wrapper with title "Tell Us About Your Contract Dispute"
4. Reassurance: "Understanding the details of your contract helps us build the strongest possible case."
5. Form sections: Other Party Info, Contract Details, The Breach, Damages, Case Stage
6. Patch task metadata on confirm/save (same pattern as other intakes)
7. Review content showing all entered data

---

### Task 7: Contract Guided Step Configs

**Files:**
- Create: `src/lib/guided-steps/contract/contract-serve-defendant.ts`
- Create: `src/lib/guided-steps/contract/contract-wait-for-answer.ts`
- Create: `src/lib/guided-steps/contract/contract-review-answer.ts`
- Create: `src/lib/guided-steps/contract/contract-discovery.ts`
- Create: `src/lib/guided-steps/contract/contract-mediation.ts`
- Create: `src/lib/guided-steps/contract/contract-post-resolution.ts`

Follow the pattern of `small-claims/serve-defendant.ts`. Each config implements `GuidedStepConfig` with:
- `title`, `reassurance`, `questions[]`, `generateSummary()`
- Questions use types: `yes_no`, `single_choice`, `info`, `text`
- Conditional questions use `showIf` callbacks
- Summary builds status items from answers

Content should be contract-dispute-specific (not generic civil language).

---

### Task 8: Contract Demand Letter & Negotiation Steps

**Files:**
- Create: `src/components/step/contract/contract-demand-letter-step.tsx`
- Create: `src/components/step/contract/contract-negotiation-step.tsx`
- Create: `src/lib/guided-steps/contract/contract-demand-letter.ts`
- Create: `src/lib/guided-steps/contract/contract-negotiation.ts`

The demand letter step should use the `GuidedStep` component with a config that walks users through:
- Recipient info, contract terms breached, damages amount, deadline

The negotiation step should guide users through:
- Settlement range, negotiation strategy, documentation of offers

Both are `skippable` tasks.

---

### Task 9: Contract Petition Wizard

**Files:**
- Create: `src/components/step/contract/contract-wizard.tsx`

Follow the pattern of `PersonalInjuryWizard` but simpler. A multi-step wizard with:
- Step 1: Before You Start (preflight checklist)
- Step 2: Contract Details (auto-filled from intake)
- Step 3: The Breach (what happened)
- Step 4: Your Damages (calculation)
- Step 5: Where to File (venue selection)
- Step 6: Review Everything
- Step 7: Generate Draft (AI petition generation)

Uses `WizardShell` wrapper. Calls `/api/cases/{id}/generate-filing` to produce the petition.

---

### Task 10: Contract Filing & Service Steps

**Files:**
- Create: `src/lib/guided-steps/contract/contract-file-with-court.ts`
- Create: `src/components/step/contract/contract-file-with-court-step.tsx`

Follow the pattern of `pi-file-with-court-step.tsx` / `pi-file-with-court-factory.ts`. Use the state filing info factory if applicable or create a simpler guided step.

---

### Task 11: Contract Step Page Router Entries

**Files:**
- Modify: `src/app/(authenticated)/case/[id]/step/[taskId]/page.tsx`

Add switch cases for all contract task_keys:

```typescript
case 'contract_intake':
  return <ContractIntakeStep caseId={id} taskId={taskId} existingMetadata={task.metadata} />

case 'contract_demand_letter':
  return <GuidedStep config={contractDemandLetterConfig} caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} skippable />

case 'contract_negotiation':
  return <GuidedStep config={contractNegotiationConfig} caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} skippable />

case 'contract_prepare_filing': {
  const { data: caseRow } = await supabase.from('cases').select('county, court_type').eq('id', id).single()
  const { data: contractDetails } = await supabase.from('contract_details').select('*').eq('case_id', id).maybeSingle()
  return <ContractWizard caseId={id} taskId={taskId} existingMetadata={task.metadata} contractDetails={contractDetails} caseData={{ county: caseRow?.county ?? null, court_type: caseRow?.court_type ?? 'county' }} />
}

// ... similar entries for contract_file_with_court, contract_serve_defendant, etc.
```

Add necessary imports at the top of the file.

---

## Phase 3: Property Dispute Components

### Task 12-16: Property Dispute (Same Pattern as Contract)

Follow the exact same pattern as Tasks 6-11, but for property disputes:

- **Task 12: Property Intake Step** — `src/components/step/property/property-intake-step.tsx`
  - Fields: `propertyAddress`, `propertyType`, `otherPartyName`, `otherPartyRelationship`, `disputeDescription`, `propertyValue`, `damagesSought`, `hasSurvey`, `hasTitleInsurance`

- **Task 13: Property Guided Configs** — `src/lib/guided-steps/property/*.ts`
  - serve-defendant, wait-for-answer, review-answer, discovery, post-resolution

- **Task 14: Property Demand Letter & Negotiation** — steps + configs
  - Property-specific: cite property rights, boundary lines, deed terms

- **Task 15: Property Petition Wizard** — `src/components/step/property/property-wizard.tsx`
  - Steps: Preflight → Property Details → The Dispute → Damages → Venue → Review → Generate

- **Task 16: Property Router Entries** — add switch cases to page.tsx

---

## Phase 4: Other Dispute Components

### Task 17-21: Other Dispute (Same Pattern, Simpler)

- **Task 17: Other Intake Step** — `src/components/step/other/other-intake-step.tsx`
  - Fields: `otherPartyName`, `otherPartyType`, `disputeDescription`, `damagesSought`, `urgency`, `hasPriorDemand`
  - More flexible/generic than contract or property

- **Task 18: Other Guided Configs** — `src/lib/guided-steps/other/*.ts`
  - serve-defendant, wait-for-answer, review-answer, discovery, post-resolution

- **Task 19: Other Demand Letter** — step + config (skippable, generic)

- **Task 20: Other Petition Wizard** — `src/components/step/other/other-wizard.tsx`
  - Steps: Preflight → Your Situation → Damages → Venue → Review → Generate

- **Task 21: Other Router Entries** — add switch cases to page.tsx

---

## Phase 5: AI Prompts

### Task 22: Filing Prompts for All 3 Types

**Files:**
- Create: `src/lib/rules/contract-filing-prompts.ts`
- Create: `src/lib/rules/property-filing-prompts.ts`
- Create: `src/lib/rules/other-filing-prompts.ts`

Follow the pattern of `pi-petition-prompts.ts`. Each exports a function that builds the system + user prompt for AI petition generation, using the dispute-specific details.

---

### Task 23: Demand Letter Prompts for All 3 Types

**Files:**
- Create: `src/lib/rules/contract-demand-letter-prompts.ts`
- Create: `src/lib/rules/property-demand-letter-prompts.ts`
- Create: `src/lib/rules/other-demand-letter-prompts.ts`

Follow the pattern of `landlord-tenant-demand-letter-prompts.ts`.

---

## Phase 6: Skippable Tasks & Sidebar

### Task 24: Update SKIPPABLE_TASKS in Sidebar

**Files:**
- Modify: `src/components/case/workflow-sidebar.tsx`

Add skippable tasks to the `SKIPPABLE_TASKS` set:

```typescript
const SKIPPABLE_TASKS = new Set([
  // existing...
  'contract_demand_letter',
  'contract_negotiation',
  'contract_mediation',
  'property_demand_letter',
  'property_negotiation',
  'other_demand_letter',
])
```

---

## Phase 7: Final Verification

### Task 25: Build Verification

Run: `cd "/Users/minwang/lawyer free" && npx next build 2>&1 | tail -30`

### Task 26: Manual Verification Checklist

For each dispute type (contract, property, other):
- [ ] Case creation with sub-type populates detail table
- [ ] Task chain is seeded correctly (all tasks appear in sidebar)
- [ ] Workflow phases render with correct labels and groupings
- [ ] Welcome step unlocks intake on completion
- [ ] Intake step captures dispute-specific fields
- [ ] Evidence vault unlocks after intake
- [ ] Demand letter renders with correct content
- [ ] Skippable tasks can be skipped (demand letter, negotiation, mediation)
- [ ] Skip advances to next task correctly
- [ ] Petition wizard generates dispute-specific draft
- [ ] All guided steps render questions and generate summaries
- [ ] Right sidebar shows correct guidance for each task
- [ ] Progress bar counts correctly
- [ ] No build errors
