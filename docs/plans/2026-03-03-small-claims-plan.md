# Small Claims Module Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Add comprehensive small claims support as a top-level case type with 8 sub-types, interactive damages calculator, AI demand letter generator, simplified JP Court filing, and educational hearing prep steps.

**Architecture:** New `SmallClaimsWizard` component using the existing `WizardShell` infrastructure. Small claims sub-type selection added to case creation dialog as a third top-level option alongside Civil and Family. Separate `small_claims_details` table stores claim-specific data. Simplified 9-step task chain with demand letter before filing. All filings target Texas JP Court (TRCP 500-507).

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui, Supabase, Anthropic Claude API, Zod, vitest

---

## Task 1: Database Migration — small_claims_details + small claims task seeding

**Files:**
- Create: `supabase/migrations/20260303000006_small_claims_tables.sql`

**Migration creates:**

1. `small_claims_details` table with RLS:

```sql
CREATE TABLE IF NOT EXISTS public.small_claims_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  claim_sub_type text NOT NULL CHECK (claim_sub_type IN (
    'security_deposit', 'breach_of_contract', 'consumer_refund', 'property_damage',
    'car_accident', 'neighbor_dispute', 'unpaid_loan', 'other'
  )),
  claim_amount numeric(10,2),
  damages_breakdown jsonb DEFAULT '[]'::jsonb,
  incident_date date,
  incident_description text,
  demand_letter_sent boolean DEFAULT false,
  demand_letter_date date,
  demand_deadline_days integer DEFAULT 14,
  defendant_is_business boolean DEFAULT false,
  defendant_business_name text,
  -- Sub-type-specific fields (nullable)
  lease_start_date date,
  lease_end_date date,
  deposit_amount numeric(10,2),
  contract_date date,
  loan_date date,
  loan_amount numeric(10,2),
  accident_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(case_id)
);

ALTER TABLE public.small_claims_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own small claims details"
  ON public.small_claims_details
  FOR ALL
  USING (
    case_id IN (SELECT id FROM public.cases WHERE user_id = auth.uid())
  );

CREATE INDEX idx_small_claims_details_case_id ON public.small_claims_details(case_id);
```

2. Replace `seed_case_tasks()` — add small claims branch BEFORE family branch:

```sql
CREATE OR REPLACE FUNCTION public.seed_case_tasks()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- ========================================
  -- Small claims cases — early return
  -- ========================================
  IF NEW.dispute_type = 'small_claims' THEN
    INSERT INTO public.tasks (case_id, task_key, title, status, unlocked_at)
    VALUES (NEW.id, 'welcome', 'Welcome — Get Started', 'todo', now());

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'small_claims_intake', 'Tell Us About Your Claim', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'evidence_vault', 'Organize Your Evidence', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'prepare_demand_letter', 'Draft a Demand Letter', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'prepare_small_claims_filing', 'Prepare Your Small Claims Petition', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'file_with_court', 'File With the Court', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'serve_defendant', 'Serve the Defendant', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'prepare_for_hearing', 'Prepare for Your Hearing', 'locked');

    INSERT INTO public.tasks (case_id, task_key, title, status)
    VALUES (NEW.id, 'hearing_day', 'Hearing Day', 'locked');

    INSERT INTO public.task_events (case_id, kind, payload)
    VALUES (NEW.id, 'case_created', jsonb_build_object(
      'role', NEW.role,
      'county', NEW.county,
      'court_type', NEW.court_type,
      'dispute_type', NEW.dispute_type
    ));

    RETURN NEW;
  END IF;

  -- ========================================
  -- Family law cases — early return (unchanged)
  -- ========================================
  IF NEW.dispute_type = 'family' THEN
    -- ... (copy entire existing family block unchanged)
    RETURN NEW;
  END IF;

  -- ========================================
  -- Civil cases — existing chain (unchanged)
  -- ========================================
  -- ... (copy entire existing civil block unchanged)

  RETURN NEW;
END;
$$;
```

3. Replace `unlock_next_task()` — add small claims chain entries BEFORE family chain:

```sql
-- Small claims chain (8 transitions)
-- welcome -> small_claims_intake
IF NEW.task_key = 'welcome' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
  UPDATE public.tasks SET status = 'todo', unlocked_at = now()
  WHERE case_id = NEW.case_id AND task_key = 'small_claims_intake' AND status = 'locked';
END IF;

-- small_claims_intake -> evidence_vault
IF NEW.task_key = 'small_claims_intake' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
  UPDATE public.tasks SET status = 'todo', unlocked_at = now()
  WHERE case_id = NEW.case_id AND task_key = 'evidence_vault' AND status = 'locked';
END IF;

-- evidence_vault -> prepare_demand_letter
IF NEW.task_key = 'evidence_vault' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
  UPDATE public.tasks SET status = 'todo', unlocked_at = now()
  WHERE case_id = NEW.case_id AND task_key = 'prepare_demand_letter' AND status = 'locked';
END IF;

-- prepare_demand_letter -> prepare_small_claims_filing
IF NEW.task_key = 'prepare_demand_letter' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
  UPDATE public.tasks SET status = 'todo', unlocked_at = now()
  WHERE case_id = NEW.case_id AND task_key = 'prepare_small_claims_filing' AND status = 'locked';
END IF;

-- prepare_small_claims_filing -> file_with_court
IF NEW.task_key = 'prepare_small_claims_filing' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
  UPDATE public.tasks SET status = 'todo', unlocked_at = now()
  WHERE case_id = NEW.case_id AND task_key = 'file_with_court' AND status = 'locked';
END IF;

-- file_with_court -> serve_defendant
IF NEW.task_key = 'file_with_court' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
  UPDATE public.tasks SET status = 'todo', unlocked_at = now()
  WHERE case_id = NEW.case_id AND task_key = 'serve_defendant' AND status = 'locked';
END IF;

-- serve_defendant -> prepare_for_hearing
IF NEW.task_key = 'serve_defendant' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
  UPDATE public.tasks SET status = 'todo', unlocked_at = now()
  WHERE case_id = NEW.case_id AND task_key = 'prepare_for_hearing' AND status = 'locked';
END IF;

-- prepare_for_hearing -> hearing_day
IF NEW.task_key = 'prepare_for_hearing' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
  UPDATE public.tasks SET status = 'todo', unlocked_at = now()
  WHERE case_id = NEW.case_id AND task_key = 'hearing_day' AND status = 'locked';
END IF;
```

**Key details:**
- Small claims uses distinct task_keys (`small_claims_intake`, `prepare_demand_letter`, `prepare_small_claims_filing`, `serve_defendant`, `prepare_for_hearing`, `hearing_day`) that don't conflict with civil or family
- Shared task_keys: `welcome`, `evidence_vault`, `file_with_court` — these already have components in the step router
- The `welcome → small_claims_intake` unlock triggers for both civil (`welcome → intake`) and small claims (`welcome → small_claims_intake`) — both fire on `welcome` completion, but only one target task exists per case (civil seeds `intake`, small claims seeds `small_claims_intake`)

---

## Task 2: Small claims sub-type selection + case schema updates

**Files:**
- Modify: `src/lib/schemas/case.ts`
- Create: `src/components/cases/wizard/small-claims-sub-type-step.tsx`
- Modify: `src/components/cases/new-case-dialog.tsx`
- Modify: `src/app/api/cases/route.ts`

### Schema updates (`src/lib/schemas/case.ts`)

Add after `FAMILY_SUB_TYPES`:

```typescript
export const SMALL_CLAIMS_SUB_TYPES = [
  'security_deposit',
  'breach_of_contract',
  'consumer_refund',
  'property_damage',
  'car_accident',
  'neighbor_dispute',
  'unpaid_loan',
  'other',
] as const

export type SmallClaimsSubType = (typeof SMALL_CLAIMS_SUB_TYPES)[number]
```

Add `'small_claims'` to `DISPUTE_TYPES` array.

Add to `createCaseSchema`:
```typescript
small_claims_sub_type: z.enum(SMALL_CLAIMS_SUB_TYPES).optional(),
```

### Sub-type selection component (`src/components/cases/wizard/small-claims-sub-type-step.tsx`)

Pattern: Copy `family-sub-type-step.tsx` structure.

```typescript
'use client'

import { Receipt, FileText, ShoppingBag, Home, Car, TreePine, Banknote, HelpCircle } from 'lucide-react'

export type SmallClaimsSubType =
  | 'security_deposit'
  | 'breach_of_contract'
  | 'consumer_refund'
  | 'property_damage'
  | 'car_accident'
  | 'neighbor_dispute'
  | 'unpaid_loan'
  | 'other'

const SUB_TYPES: { value: SmallClaimsSubType; label: string; description: string; icon: typeof Receipt }[] = [
  { value: 'security_deposit', label: 'Security Deposit', description: 'Landlord kept your deposit unfairly', icon: Home },
  { value: 'breach_of_contract', label: 'Breach of Contract', description: 'Someone didn\'t hold up their end of an agreement', icon: FileText },
  { value: 'consumer_refund', label: 'Consumer Refund', description: 'Business won\'t refund you for a product or service', icon: ShoppingBag },
  { value: 'property_damage', label: 'Property Damage', description: 'Someone damaged your property', icon: Home },
  { value: 'car_accident', label: 'Car Accident', description: 'Minor vehicle damage from an accident', icon: Car },
  { value: 'neighbor_dispute', label: 'Neighbor Dispute', description: 'Property line, noise, or other neighbor issue', icon: TreePine },
  { value: 'unpaid_loan', label: 'Unpaid Loan', description: 'Someone owes you money and won\'t pay', icon: Banknote },
  { value: 'other', label: 'Other Small Claim', description: 'Another type of claim under $20,000', icon: HelpCircle },
]

interface SmallClaimsSubTypeStepProps {
  selected: SmallClaimsSubType | ''
  onSelect: (subType: SmallClaimsSubType) => void
}

export function SmallClaimsSubTypeStep({ selected, onSelect }: SmallClaimsSubTypeStepProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-warm-text">What type of claim do you have?</h3>
        <p className="text-sm text-warm-muted mt-1">This helps us tailor the process and documents to your specific situation.</p>
      </div>
      <div className="grid gap-3">
        {SUB_TYPES.map((st) => {
          const Icon = st.icon
          const isSelected = selected === st.value
          return (
            <button
              key={st.value}
              onClick={() => onSelect(st.value)}
              className={`flex items-start gap-3 rounded-lg border p-4 text-left transition-colors ${
                isSelected
                  ? 'border-calm-indigo bg-calm-indigo/5'
                  : 'border-warm-border hover:border-warm-text/30'
              }`}
            >
              <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${isSelected ? 'text-calm-indigo' : 'text-warm-muted'}`} />
              <div>
                <div className={`font-medium ${isSelected ? 'text-calm-indigo' : 'text-warm-text'}`}>{st.label}</div>
                <div className="text-sm text-warm-muted">{st.description}</div>
              </div>
            </button>
          )
        })}
      </div>
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 mt-4">
        <p className="text-sm text-amber-800">
          <strong>Texas small claims limit:</strong> $20,000. If your claim is for more than $20,000, you may need to file in County or District Court instead.
        </p>
      </div>
    </div>
  )
}
```

### Wizard dialog updates (`src/components/cases/new-case-dialog.tsx`)

Add to WizardState:
```typescript
smallClaimsSubType: SmallClaimsSubType | ''
```

Add to WizardAction:
```typescript
| { type: 'SET_SMALL_CLAIMS_SUB_TYPE'; smallClaimsSubType: SmallClaimsSubType }
```

Update reducer:
- `SET_DISPUTE_TYPE`: clear `smallClaimsSubType` when switching away from `small_claims`
- `SET_SMALL_CLAIMS_SUB_TYPE`: set value and advance step

Update `getTotalSteps`:
```typescript
function getTotalSteps(disputeType: DisputeType | ''): number {
  if (disputeType === 'family') return 4
  if (disputeType === 'small_claims') return 4  // role, type, sub-type, recommendation+county
  return 5  // civil
}
```

Update step rendering — when `isSmallClaims`:
- Step 3: `<SmallClaimsSubTypeStep>` (instead of AmountStep)
- Step 4: Recommendation step — hardcode JP Court, show county input + amount input with $20,000 warning

Update `handleAccept`:
```typescript
const courtType = isFamily
  ? 'district'
  : isSmallClaims
    ? 'jp'
    : (state.disputeType && state.amount ? recommendCourt({...}).recommended : 'unknown')

// Include small_claims_sub_type in POST body
body: JSON.stringify({
  role: state.role,
  court_type: courtType,
  dispute_type: state.disputeType || undefined,
  county: state.county || undefined,
  family_sub_type: isFamily ? state.familySubType || undefined : undefined,
  small_claims_sub_type: isSmallClaims ? state.smallClaimsSubType || undefined : undefined,
})
```

### API route updates (`src/app/api/cases/route.ts`)

After the family_sub_type block, add:
```typescript
if (small_claims_sub_type) {
  await supabase!.from('small_claims_details').insert({
    case_id: caseData!.id,
    claim_sub_type: small_claims_sub_type,
  })
}
```

---

## Task 3: Damages calculator (TDD)

**Files:**
- Create: `src/lib/small-claims/damages-calculator.ts`
- Create: `tests/unit/small-claims/damages-calculator.test.ts`

### Calculator interface

```typescript
export interface DamageItem {
  category: string
  amount: number
  description?: string
}

export interface DamagesInput {
  items: DamageItem[]
  /** Texas JP Court limit */
  jurisdictionCap?: number
}

export interface DamagesResult {
  totalDamages: number
  itemCount: number
  exceedsCap: boolean
  capAmount: number
  items: DamageItem[]
  /** Amount over cap, 0 if under */
  overCapBy: number
  /** Whether total is within warning zone (90%+ of cap) */
  nearingCap: boolean
}

/** Default Texas JP Court jurisdictional limit */
export const TX_JP_COURT_CAP = 20_000

export function calculateDamages(input: DamagesInput): DamagesResult {
  const cap = input.jurisdictionCap ?? TX_JP_COURT_CAP
  const items = input.items.filter(item => item.amount > 0)
  const totalDamages = round2(items.reduce((sum, item) => sum + item.amount, 0))
  const exceedsCap = totalDamages > cap
  const overCapBy = exceedsCap ? round2(totalDamages - cap) : 0
  const nearingCap = !exceedsCap && totalDamages >= cap * 0.9

  return {
    totalDamages,
    itemCount: items.length,
    exceedsCap,
    capAmount: cap,
    items,
    overCapBy,
    nearingCap,
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}
```

### Tests (16):

```typescript
import { describe, it, expect } from 'vitest'
import { calculateDamages, TX_JP_COURT_CAP } from '@/lib/small-claims/damages-calculator'

function makeInput(overrides: Partial<Parameters<typeof calculateDamages>[0]> = {}) {
  return {
    items: [{ category: 'Test', amount: 1000 }],
    ...overrides,
  }
}

describe('calculateDamages', () => {
  it('calculates total for single item', () => { ... })
  it('calculates total for multiple items', () => { ... })
  it('filters out zero-amount items', () => { ... })
  it('filters out negative-amount items', () => { ... })
  it('handles empty items array', () => { ... })
  it('rounds to 2 decimal places', () => { ... })
  it('returns correct itemCount', () => { ... })
  it('uses TX_JP_COURT_CAP as default cap', () => { ... })
  it('respects custom jurisdictionCap', () => { ... })
  it('detects exceeds cap', () => { ... })
  it('calculates overCapBy amount', () => { ... })
  it('detects nearing cap (90%+)', () => { ... })
  it('not nearing cap at 89%', () => { ... })
  it('handles exactly at cap boundary', () => { ... })
  it('TX_JP_COURT_CAP is 20000', () => { ... })
  it('handles large number of items', () => { ... })
})
```

---

## Task 4: Small claims venue rules (TDD)

**Files:**
- Modify: `src/lib/rules/venue-helper.ts`
- Modify: `tests/unit/rules/venue-helper.test.ts`

Add `case 'small_claims':` block in `recommendVenue()` before `default:`:

```typescript
case 'small_claims': {
  if (defendantCounty) {
    return {
      recommended_county: defendantCounty,
      explanation: `File in the Justice Court in ${defendantCounty} County, where the defendant resides. For small claims, you can also file in the county where the obligation was to be performed (e.g., where the work was done or where the property is located).`,
      alternativeNote: incidentCounty && incidentCounty !== defendantCounty
        ? `You may alternatively file in ${incidentCounty} County if that's where the events giving rise to the claim occurred.`
        : undefined,
      rule_citation: 'TRCP 502.4 (venue in justice court cases)',
    }
  }
  return {
    recommended_county: null,
    explanation: 'For small claims, file in the county where the defendant lives, or where the obligation was to be performed. If the defendant is a business, file where the business has an office or representative.',
    rule_citation: 'TRCP 502.4',
  }
}
```

### Tests (5 new):

```typescript
describe('small claims venue', () => {
  it('recommends defendant county for small claims', () => { ... })
  it('provides alternative when incident county differs', () => { ... })
  it('cites TRCP 502.4', () => { ... })
  it('returns null county when none provided', () => { ... })
  it('no alternative when counties match', () => { ... })
})
```

---

## Task 5: Small claims filing prompts + demand letter prompts (TDD)

**Files:**
- Create: `src/lib/schemas/small-claims-filing.ts`
- Create: `src/lib/rules/small-claims-filing-prompts.ts`
- Create: `src/lib/rules/demand-letter-prompts.ts`
- Create: `tests/unit/rules/small-claims-filing-prompts.test.ts`
- Create: `tests/unit/rules/demand-letter-prompts.test.ts`

### Filing schema (`src/lib/schemas/small-claims-filing.ts`)

```typescript
import { z } from 'zod'
import { partySchema } from './filing'

export const damageItemSchema = z.object({
  category: z.string().min(1),
  amount: z.number().positive(),
  description: z.string().optional(),
})

export const smallClaimsFilingFactsSchema = z.object({
  plaintiff: partySchema,
  defendant: partySchema,
  court_type: z.literal('jp'),
  county: z.string().min(1),
  precinct: z.string().optional(),
  cause_number: z.string().optional(),
  claim_sub_type: z.enum([
    'security_deposit', 'breach_of_contract', 'consumer_refund', 'property_damage',
    'car_accident', 'neighbor_dispute', 'unpaid_loan', 'other',
  ]),
  claim_amount: z.number().positive().max(20000),
  damages_breakdown: z.array(damageItemSchema).min(1),
  incident_date: z.string().min(1),
  description: z.string().min(10),
  demand_letter_sent: z.boolean(),
  demand_letter_date: z.string().optional(),
  // Sub-type-specific optional fields
  lease_dates: z.string().optional(),
  deposit_amount: z.number().optional(),
  contract_date: z.string().optional(),
  loan_amount: z.number().optional(),
  loan_date: z.string().optional(),
  accident_date: z.string().optional(),
  defendant_is_business: z.boolean().default(false),
})

export type SmallClaimsFilingFacts = z.infer<typeof smallClaimsFilingFactsSchema>
```

### Demand letter schema + prompt builder (`src/lib/rules/demand-letter-prompts.ts`)

```typescript
import { z } from 'zod'
import { partySchema } from '../schemas/filing'
import { damageItemSchema } from '../schemas/small-claims-filing'

export const demandLetterFactsSchema = z.object({
  plaintiff: partySchema,
  defendant: partySchema,
  claim_sub_type: z.enum([...]),
  claim_amount: z.number().positive(),
  damages_breakdown: z.array(damageItemSchema).min(1),
  description: z.string().min(10),
  deadline_days: z.number().min(1).max(90).default(14),
  preferred_resolution: z.string().optional(),
  incident_date: z.string().min(1),
  defendant_is_business: z.boolean().default(false),
})

export type DemandLetterFacts = z.infer<typeof demandLetterFactsSchema>

export function buildDemandLetterPrompt(facts: DemandLetterFacts): { system: string; user: string } {
  // System prompt: professional demand letter format
  // - Firm but professional tone
  // - Include specific facts and dates
  // - Itemize damages
  // - Set deadline (facts.deadline_days)
  // - State consequence: "If I do not receive payment by [date], I will file a small claims lawsuit in [County] Justice Court"
  // - DRAFT disclaimer
  // - ANNOTATIONS section

  // User prompt: formatted facts
}
```

### Filing prompt builder (`src/lib/rules/small-claims-filing-prompts.ts`)

```typescript
export function buildSmallClaimsFilingPrompt(facts: SmallClaimsFilingFacts): { system: string; user: string } {
  const title = getDocumentTitle(facts.claim_sub_type)
  const format = getDocumentFormat(facts.claim_sub_type)

  // System: JP Court small claims petition format (TRCP 500-507)
  // - Caption: "In the Justice Court, Precinct ___, [County] County, Texas"
  // - Title: "PLAINTIFF'S ORIGINAL PETITION (SMALL CLAIMS)"
  // - Plain language fact sections per sub-type
  // - Damages itemization table
  // - Prayer for relief
  // - Verification (sworn statement)
  // - Pro se signature block
  // - DRAFT disclaimer
  // - ANNOTATIONS section
}

function getDocumentTitle(subType: string): string {
  // All return "PLAINTIFF'S ORIGINAL PETITION (SMALL CLAIMS)"
  // with sub-type context in subtitle
}

function getDocumentFormat(subType: string): string {
  // Sub-type-specific format instructions
  // Security deposit: lease terms, deposit amount, itemized deductions, Tex. Prop. Code § 92.104
  // Breach of contract: contract terms, performance, breach, damages
  // Consumer refund: purchase details, defect/issue, refund attempts, DTPA if applicable
  // Property damage: description, cause, repair estimates
  // Car accident: accident facts, fault, damages
  // Neighbor dispute: property addresses, nature of dispute, duration
  // Unpaid loan: loan terms, payments made, amount owed
  // Other: general fact narrative
}
```

### Tests — filing prompts (14):

```typescript
describe('buildSmallClaimsFilingPrompt', () => {
  it('returns system and user strings')
  it('includes DRAFT disclaimer')
  it('includes JP Court caption')
  it('uses Plaintiff/Defendant terminology')
  it('includes TRCP citation')
  it('includes damages itemization')
  it('includes verification section')
  // One test per sub-type title (8 tests)
  // Schema validation: accepts valid, rejects > $20k, rejects empty damages
})
```

### Tests — demand letter (12):

```typescript
describe('buildDemandLetterPrompt', () => {
  it('returns system and user strings')
  it('includes DRAFT disclaimer')
  it('includes deadline days')
  it('includes consequence language (small claims filing)')
  it('includes plaintiff name')
  it('includes defendant name')
  it('includes damages breakdown')
  it('includes total amount')
  it('includes incident date')
  it('adapts tone for business defendant')
  // Schema: accepts valid, rejects 0 amount, rejects empty description
})
```

---

## Task 6: Small claims wizard steps (10 components)

**Files:**
- Create: `src/components/step/small-claims-wizard-steps/small-claims-preflight.tsx`
- Create: `src/components/step/small-claims-wizard-steps/small-claims-parties-step.tsx`
- Create: `src/components/step/small-claims-wizard-steps/claim-details-step.tsx`
- Create: `src/components/step/small-claims-wizard-steps/damages-calculator-step.tsx`
- Create: `src/components/step/small-claims-wizard-steps/timeline-step.tsx`
- Create: `src/components/step/small-claims-wizard-steps/demand-letter-info-step.tsx`
- Create: `src/components/step/small-claims-wizard-steps/small-claims-venue-step.tsx`
- Create: `src/components/step/small-claims-wizard-steps/small-claims-review-step.tsx`

**Component patterns:** Follow family wizard steps exactly.

### Preflight (`small-claims-preflight.tsx`)
- Sub-type-specific document checklists (what to gather before starting)
- Security deposit: lease, photos, deduction letter, communications
- Contract: contract copy, communications, proof of payment
- Car accident: police report, photos, repair estimates, insurance info
- etc.

### Parties (`small-claims-parties-step.tsx`)
- Plaintiff info: full_name, address, city, state, zip
- Defendant info: full_name, address, city, state, zip
- Checkbox: "Defendant is a business" → shows business_name field + registered agent info
- Props: `plaintiff`, `defendant`, `defendantIsBusiness`, `defendantBusinessName`, onChange callbacks

### Claim Details (`claim-details-step.tsx`)
- Sub-type-specific form that switches on `claimSubType`:
  - Security deposit: lease start/end dates, deposit amount, move-out date, what landlord deducted
  - Breach of contract: contract date, what was promised, what happened, when breach occurred
  - Consumer refund: purchase date, product/service, amount paid, issue description, refund attempts
  - Property damage: what was damaged, when, how, repair estimates received
  - Car accident: accident date, location, what happened, fault description, insurance status
  - Neighbor dispute: property addresses, nature of dispute, how long, attempts to resolve
  - Unpaid loan: loan date, amount, terms, payments made, amount still owed
  - Other: free-form description with date field
- Props: `claimSubType`, form field values, onChange callbacks

### Damages Calculator (`damages-calculator-step.tsx`)
- Dynamic add/remove list of `DamageItem` (category + amount + optional description)
- Integrates `calculateDamages()` for live total + cap warning
- Running total display at bottom
- Amber warning when `nearingCap` (90%+ of $20,000)
- Red warning when `exceedsCap`
- Props: `items: DamageItem[]`, `onItemsChange`, `claimSubType`
- Pre-populate category suggestions based on sub-type

### Timeline (`timeline-step.tsx`)
- Only shown for: security_deposit, breach_of_contract, car_accident, unpaid_loan
- Ordered list of events with date + description
- Dynamic add/remove pattern (same as children-step)
- Props: `events: TimelineEvent[]`, `onEventsChange`

### Demand Letter Info (`demand-letter-info-step.tsx`)
- Checkbox: "I already sent a demand letter"
- If not sent: deadline days selector (7, 14, 21, 30 days), preferred resolution textarea
- If already sent: date sent field, response received description
- Informational callout: "A demand letter often resolves the dispute without going to court"
- Props: `demandLetterSent`, `demandLetterDate`, `deadlineDays`, `preferredResolution`, onChange callbacks

### Venue (`small-claims-venue-step.tsx`)
- County where defendant lives
- Alternative: county where incident occurred
- Integrates `recommendVenue()` with `disputeType: 'small_claims'`
- JP Court precinct input (optional — user may not know)
- Props: `defendantCounty`, `incidentCounty`, `precinct`, onChange callbacks

### Review (`small-claims-review-step.tsx`)
- Summary cards for each section with edit buttons
- Conditional sections by sub-type (timeline only shown when applicable)
- Total damages prominently displayed
- Demand letter status shown
- Props: all form values + `onEdit(stepId)` callback

---

## Task 7: Small claims wizard orchestrator

**Files:**
- Create: `src/components/step/small-claims-wizard.tsx`

**Pattern:** Follow `family-law-wizard.tsx` exactly.

### Component structure

```typescript
interface SmallClaimsWizardProps {
  caseId: string
  taskId: string
  existingMetadata?: Record<string, unknown>
  claimDetails: {
    claim_sub_type: string
    claim_amount: number | null
    damages_breakdown: unknown[]
    incident_date: string | null
    defendant_is_business: boolean
    demand_letter_sent: boolean
  } | null
  caseData: { county: string | null }
}

export function SmallClaimsWizard({ ... }: SmallClaimsWizardProps) {
  // getStepsForSubType(subType) — returns WizardStep[] based on sub-type
  // Steps vary: timeline only for security_deposit, breach_of_contract, car_accident, unpaid_loan

  // Parent-owned form state (~20 useState hooks), hydrating from existingMetadata
  // buildFacts() creates smallClaimsFilingFactsSchema payload
  // generateDraft() POSTs to /api/cases/${caseId}/generate-filing with document_type: 'small_claims_${subType}'
  // Draft phase uses AnnotatedDraftViewer
  // canAdvance per-step validation
}
```

### Dynamic steps by sub-type

| Sub-type | Steps |
|----------|-------|
| security_deposit | preflight, parties, claim_details, damages, timeline, demand_info, venue, review |
| breach_of_contract | preflight, parties, claim_details, damages, timeline, demand_info, venue, review |
| consumer_refund | preflight, parties, claim_details, damages, demand_info, venue, review |
| property_damage | preflight, parties, claim_details, damages, demand_info, venue, review |
| car_accident | preflight, parties, claim_details, damages, timeline, demand_info, venue, review |
| neighbor_dispute | preflight, parties, claim_details, damages, demand_info, venue, review |
| unpaid_loan | preflight, parties, claim_details, damages, timeline, demand_info, venue, review |
| other | preflight, parties, claim_details, damages, demand_info, venue, review |

---

## Task 8: Small claims educational steps (3 components)

**Files:**
- Create: `src/components/step/small-claims/small-claims-intake-step.tsx`
- Create: `src/components/step/small-claims/serve-defendant-step.tsx`
- Create: `src/components/step/small-claims/prepare-for-hearing-step.tsx`
- Create: `src/components/step/small-claims/hearing-day-step.tsx`

**Pattern:** Follow `family-intake-step.tsx` for intake, `waiting-period-step.tsx` for educational steps.

### Small Claims Intake (`small-claims-intake-step.tsx`)
- Form with review: county, claim amount (with $20k warning), brief description of situation
- Props: `caseId`, `taskId`, `existingMetadata`
- `onConfirm`: save metadata + complete task

### Serve Defendant (`serve-defendant-step.tsx`)
- Educational step (`skipReview: true`)
- 3 ExpandableSections:
  1. "How to serve in small claims" — certified mail (cheapest, TRCP 501.2), constable/sheriff, process server
  2. "Service requirements" — must be served at least 14 days before hearing (TRCP 501.4)
  3. "What if they can't be found?" — alternative service, skip tracing tips

### Prepare for Hearing (`prepare-for-hearing-step.tsx`)
- Educational step (`skipReview: true`)
- 3 ExpandableSections:
  1. "What to bring" — copies of evidence, demand letter, filing receipt, photo ID, organized folder
  2. "How to present your case" — arrive early, dress appropriately, be respectful, state facts clearly, present evidence in order
  3. "What the judge expects" — brief opening, evidence presentation, testimony, closing. Judge may ask questions.

### Hearing Day (`hearing-day-step.tsx`)
- Educational step (`skipReview: true`)
- 3 ExpandableSections:
  1. "Day-of checklist" — directions to courthouse, parking, courtroom number, arrive 30 min early
  2. "What happens at the hearing" — both sides present, judge rules (sometimes same day, sometimes mailed)
  3. "After the hearing" — if you win: judgment enforcement, if you lose: appeal options (10 days, TRCP 506.1)

---

## Task 9: Wire generate-filing route for small claims

**Files:**
- Modify: `src/app/api/cases/[id]/generate-filing/route.ts`

Add imports:
```typescript
import { buildSmallClaimsFilingPrompt } from '@/lib/rules/small-claims-filing-prompts'
import { smallClaimsFilingFactsSchema } from '@/lib/schemas/small-claims-filing'
import { demandLetterFactsSchema, buildDemandLetterPrompt } from '@/lib/rules/demand-letter-prompts'
```

Add to `MOTION_REGISTRY`:
```typescript
// Small claims filing types — all 8 sub-types use the same schema/prompt builder
small_claims_security_deposit: {
  schema: smallClaimsFilingFactsSchema,
  buildPrompt: buildSmallClaimsFilingPrompt as unknown as RegistryEntry['buildPrompt'],
},
small_claims_breach_of_contract: { ... },
small_claims_consumer_refund: { ... },
small_claims_property_damage: { ... },
small_claims_car_accident: { ... },
small_claims_neighbor_dispute: { ... },
small_claims_unpaid_loan: { ... },
small_claims_other: { ... },
// Demand letter
demand_letter: {
  schema: demandLetterFactsSchema,
  buildPrompt: buildDemandLetterPrompt as unknown as RegistryEntry['buildPrompt'],
},
```

---

## Task 10: Wire step router + Demand Letter wizard step

**Files:**
- Create: `src/components/step/small-claims/demand-letter-step.tsx`
- Modify: `src/app/(authenticated)/case/[id]/step/[taskId]/page.tsx`

### Demand Letter Step (`demand-letter-step.tsx`)

This is a simplified wizard that collects demand letter facts and generates the letter:
- Form phase: plaintiff/defendant info, claim details, damages, deadline, preferred resolution
- Uses same `StepRunner` with `onBeforeReview` calling `/api/cases/${caseId}/generate-filing` with `document_type: 'demand_letter'`
- Review phase: `AnnotatedDraftViewer` with the generated demand letter
- `onConfirm`: save metadata + complete task
- Props: `caseId`, `taskId`, `existingMetadata`, `claimDetails` (from `small_claims_details`)

### Step Router Updates

Add imports:
```typescript
import { SmallClaimsIntakeStep } from '@/components/step/small-claims/small-claims-intake-step'
import { DemandLetterStep } from '@/components/step/small-claims/demand-letter-step'
import { SmallClaimsWizard } from '@/components/step/small-claims-wizard'
import { ServeDefendantStep } from '@/components/step/small-claims/serve-defendant-step'
import { PrepareForHearingStep } from '@/components/step/small-claims/prepare-for-hearing-step'
import { HearingDayStep } from '@/components/step/small-claims/hearing-day-step'
```

Add switch cases:
```typescript
case 'small_claims_intake':
  return (
    <SmallClaimsIntakeStep
      caseId={id}
      taskId={taskId}
      existingMetadata={task.metadata}
    />
  )
case 'prepare_demand_letter': {
  const { data: caseRow } = await supabase
    .from('cases').select('county').eq('id', id).single()
  const { data: claimDetails } = await supabase
    .from('small_claims_details').select('*').eq('case_id', id).maybeSingle()
  return (
    <DemandLetterStep
      caseId={id}
      taskId={taskId}
      existingMetadata={task.metadata}
      claimDetails={claimDetails}
      caseData={{ county: caseRow?.county ?? null }}
    />
  )
}
case 'prepare_small_claims_filing': {
  const { data: caseRow } = await supabase
    .from('cases').select('county').eq('id', id).single()
  const { data: claimDetails } = await supabase
    .from('small_claims_details').select('*').eq('case_id', id).maybeSingle()
  return (
    <SmallClaimsWizard
      caseId={id}
      taskId={taskId}
      existingMetadata={task.metadata}
      claimDetails={claimDetails}
      caseData={{ county: caseRow?.county ?? null }}
    />
  )
}
case 'serve_defendant':
  return <ServeDefendantStep caseId={id} taskId={taskId} />
case 'prepare_for_hearing':
  return <PrepareForHearingStep caseId={id} taskId={taskId} />
case 'hearing_day':
  return <HearingDayStep caseId={id} taskId={taskId} />
```

---

## Task 11: Build & test verification

1. Run all tests — expect all passing + new tests
2. `npx next build` — no type errors
3. Verify all new switch cases render (not "Coming soon")

---

## File Summary

| File | Action | Module |
|------|--------|--------|
| `supabase/migrations/20260303000006_small_claims_tables.sql` | Create | Migration |
| `src/lib/schemas/case.ts` | Modify | Schema |
| `src/components/cases/wizard/small-claims-sub-type-step.tsx` | Create | Case creation |
| `src/components/cases/new-case-dialog.tsx` | Modify | Case creation |
| `src/app/api/cases/route.ts` | Modify | API |
| `src/lib/small-claims/damages-calculator.ts` | Create | Calculator |
| `tests/unit/small-claims/damages-calculator.test.ts` | Create | Calculator |
| `src/lib/rules/venue-helper.ts` | Modify | Venue |
| `tests/unit/rules/venue-helper.test.ts` | Modify | Venue |
| `src/lib/schemas/small-claims-filing.ts` | Create | Filing |
| `src/lib/rules/small-claims-filing-prompts.ts` | Create | Filing |
| `src/lib/rules/demand-letter-prompts.ts` | Create | Demand letter |
| `tests/unit/rules/small-claims-filing-prompts.test.ts` | Create | Filing |
| `tests/unit/rules/demand-letter-prompts.test.ts` | Create | Demand letter |
| `src/components/step/small-claims-wizard-steps/*.tsx` (8 files) | Create | Wizard steps |
| `src/components/step/small-claims-wizard.tsx` | Create | Wizard |
| `src/components/step/small-claims/small-claims-intake-step.tsx` | Create | Task steps |
| `src/components/step/small-claims/demand-letter-step.tsx` | Create | Demand letter |
| `src/components/step/small-claims/serve-defendant-step.tsx` | Create | Educational |
| `src/components/step/small-claims/prepare-for-hearing-step.tsx` | Create | Educational |
| `src/components/step/small-claims/hearing-day-step.tsx` | Create | Educational |
| `src/app/api/cases/[id]/generate-filing/route.ts` | Modify | API |
| `src/app/(authenticated)/case/[id]/step/[taskId]/page.tsx` | Modify | Router |

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| Claim amount > $20,000 | Damages calculator shows red warning; schema rejects > 20000; wizard prevents filing |
| Claim amount at exactly $20,000 | Valid — at the cap but not over |
| No damages items | Schema requires min(1); wizard validates before advancing |
| Defendant is a business | Shows business name + registered agent fields; filing prompt adapts |
| Demand letter already sent | Skips deadline/resolution fields; records date sent |
| Timeline step skipped | Only shown for security_deposit, breach_of_contract, car_accident, unpaid_loan |
| Federal law small claim | Not supported — small claims always goes to JP Court |
| Counter-claim by defendant | Not in scope — this module is plaintiff-only |

## Verification

1. All unit tests pass (damages calculator: 16, filing prompts: 14, demand letter: 12, venue: 5)
2. `npx next build` — compiles clean
3. Case creation shows 3 top-level options: Civil, Family, Small Claim
4. Selecting Small Claim → 8 sub-type cards → JP Court recommendation
5. Task chain: 9 steps from welcome through hearing day
6. Demand letter generates with deadline and consequence language
7. Small claims petition uses JP Court format (TRCP 500-507)
8. No "Coming soon" for any small claims task_keys
