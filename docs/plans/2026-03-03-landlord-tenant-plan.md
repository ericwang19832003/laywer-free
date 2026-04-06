# Landlord-Tenant Module Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Add comprehensive landlord-tenant support as a top-level case type with 8 sub-types, both landlord and tenant perspectives, LT-specific demand letter generator, sub-type-specific filing prompts with Texas Property Code citations, and educational hearing/post-judgment steps. 10-step task chain. Amount-based court routing with eviction always JP.

**Architecture:** New `LandlordTenantWizard` component using the existing `WizardShell` infrastructure. Sub-type selection added to case creation dialog as a fourth branching path alongside Civil, Family, and Small Claims. Separate `landlord_tenant_details` table stores case-specific data. 10-step task chain from welcome through post-judgment. All filings target Texas courts (JP/County/District) based on amount, with eviction always JP Court.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui, Supabase, Anthropic Claude API, Zod, vitest

---

## Task 1: Database Migration — landlord_tenant_details + task seeding

**Files:**
- Create: `supabase/migrations/20260303000007_landlord_tenant_tables.sql`

**Migration creates:**

1. `landlord_tenant_details` table with RLS:

```sql
CREATE TABLE IF NOT EXISTS public.landlord_tenant_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  landlord_tenant_sub_type text NOT NULL CHECK (landlord_tenant_sub_type IN (
    'eviction', 'nonpayment', 'security_deposit', 'property_damage',
    'repair_maintenance', 'lease_termination', 'habitability', 'other'
  )),
  party_role text NOT NULL CHECK (party_role IN ('landlord', 'tenant')) DEFAULT 'tenant',
  property_address text,
  property_type text CHECK (property_type IN ('house', 'apartment', 'condo', 'commercial', 'other')),
  unit_number text,
  lease_start_date date,
  lease_end_date date,
  lease_type text CHECK (lease_type IN ('fixed_term', 'month_to_month', 'oral')),
  monthly_rent numeric(10,2),
  deposit_amount numeric(10,2),
  amount_claimed numeric(10,2),
  damages_breakdown jsonb DEFAULT '[]'::jsonb,
  eviction_notice_date date,
  eviction_notice_type text,
  eviction_reason text,
  repair_requests jsonb DEFAULT '[]'::jsonb,
  deposit_deductions jsonb DEFAULT '[]'::jsonb,
  habitability_issues text,
  demand_letter_sent boolean DEFAULT false,
  demand_letter_date date,
  demand_deadline_days integer DEFAULT 14,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(case_id)
);

ALTER TABLE public.landlord_tenant_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own LT details"
  ON public.landlord_tenant_details
  FOR ALL
  USING (
    case_id IN (SELECT id FROM public.cases WHERE user_id = auth.uid())
  );

CREATE INDEX idx_landlord_tenant_details_case_id ON public.landlord_tenant_details(case_id);
```

2. Replace `seed_case_tasks()` — add landlord-tenant branch BEFORE small claims branch:

```sql
-- Inside seed_case_tasks(), add this block BEFORE the small_claims block:
IF NEW.dispute_type = 'landlord_tenant' THEN
  INSERT INTO public.tasks (case_id, task_key, title, status, unlocked_at)
  VALUES (NEW.id, 'welcome', 'Welcome — Get Started', 'todo', now());

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES
    (NEW.id, 'landlord_tenant_intake', 'Tell Us About Your Situation', 'locked'),
    (NEW.id, 'evidence_vault', 'Organize Your Evidence', 'locked'),
    (NEW.id, 'prepare_lt_demand_letter', 'Draft a Demand Letter', 'locked'),
    (NEW.id, 'prepare_landlord_tenant_filing', 'Prepare Your Court Filing', 'locked'),
    (NEW.id, 'file_with_court', 'File With the Court', 'locked'),
    (NEW.id, 'serve_other_party', 'Serve the Other Party', 'locked'),
    (NEW.id, 'prepare_for_hearing', 'Prepare for Your Hearing', 'locked'),
    (NEW.id, 'hearing_day', 'Hearing Day', 'locked'),
    (NEW.id, 'post_judgment', 'After the Ruling', 'locked');

  INSERT INTO public.task_events (case_id, kind, payload)
  VALUES (NEW.id, 'case_created', jsonb_build_object(
    'role', NEW.role,
    'county', NEW.county,
    'court_type', NEW.court_type,
    'dispute_type', NEW.dispute_type
  ));

  RETURN NEW;
END IF;
```

3. Replace `unlock_next_task()` — add landlord-tenant chain entries (9 transitions) BEFORE small claims chain:

```sql
-- Landlord-tenant chain (9 transitions)
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
```

**Key details:**
- Distinct task_keys: `landlord_tenant_intake`, `prepare_lt_demand_letter`, `prepare_landlord_tenant_filing`, `serve_other_party`, `post_judgment`
- Shared task_keys: `welcome`, `evidence_vault`, `file_with_court`, `prepare_for_hearing`, `hearing_day` — these have existing step router components
- The `welcome → landlord_tenant_intake` unlock fires alongside civil/family/small-claims unlocks — only the one that was seeded for this case type exists

---

## Task 2: Case creation flow — sub-type selection + schema updates

**Files:**
- Modify: `src/lib/schemas/case.ts`
- Create: `src/components/cases/wizard/landlord-tenant-sub-type-step.tsx`
- Modify: `src/components/cases/new-case-dialog.tsx`
- Modify: `src/app/api/cases/route.ts`

### Schema updates (`src/lib/schemas/case.ts`)

Add after `SMALL_CLAIMS_SUB_TYPES`:

```typescript
export const LANDLORD_TENANT_SUB_TYPES = [
  'eviction',
  'nonpayment',
  'security_deposit',
  'property_damage',
  'repair_maintenance',
  'lease_termination',
  'habitability',
  'other',
] as const

export type LandlordTenantSubType = (typeof LANDLORD_TENANT_SUB_TYPES)[number]
```

Add to `createCaseSchema`:
```typescript
landlord_tenant_sub_type: z.enum(LANDLORD_TENANT_SUB_TYPES).optional(),
```

### Sub-type selection component (`landlord-tenant-sub-type-step.tsx`)

Pattern: Copy `small-claims-sub-type-step.tsx` structure.

```typescript
'use client'

import { Building2, DollarSign, Home, Hammer, FileText, Shield, AlertTriangle, HelpCircle } from 'lucide-react'

export type LandlordTenantSubType =
  | 'eviction' | 'nonpayment' | 'security_deposit' | 'property_damage'
  | 'repair_maintenance' | 'lease_termination' | 'habitability' | 'other'

const SUB_TYPES = [
  { value: 'eviction', label: 'Eviction (Unlawful Detainer)', description: 'Landlord seeking to remove a tenant, or tenant defending against eviction', icon: Building2 },
  { value: 'nonpayment', label: 'Nonpayment of Rent', description: 'Landlord seeking unpaid rent or tenant disputing rent owed', icon: DollarSign },
  { value: 'security_deposit', label: 'Security Deposit Dispute', description: 'Dispute over return or deductions from a security deposit', icon: Home },
  { value: 'property_damage', label: 'Property Damage', description: 'Claims for damage to rental property by either party', icon: Hammer },
  { value: 'repair_maintenance', label: 'Repair & Maintenance', description: 'Tenant requesting repairs the landlord won\'t make', icon: Hammer },
  { value: 'lease_termination', label: 'Lease Termination', description: 'Dispute over early termination or lease renewal', icon: FileText },
  { value: 'habitability', label: 'Habitability Claim', description: 'Unsafe or unlivable conditions in the rental property', icon: Shield },
  { value: 'other', label: 'Other Landlord-Tenant Issue', description: 'Another type of rental housing dispute', icon: HelpCircle },
]
```

Props: `{ selected: LandlordTenantSubType | '', onSelect: (subType: LandlordTenantSubType) => void }`

### Wizard dialog updates (`new-case-dialog.tsx`)

Add to WizardState:
```typescript
landlordTenantSubType: LandlordTenantSubType | ''
```

Add to WizardAction:
```typescript
| { type: 'SET_LANDLORD_TENANT_SUB_TYPE'; landlordTenantSubType: LandlordTenantSubType }
```

Update reducer:
- `SET_DISPUTE_TYPE`: clear `landlordTenantSubType` when switching away from `landlord_tenant`
- `SET_LANDLORD_TENANT_SUB_TYPE`: set value and advance step

Update `getTotalSteps`:
```typescript
if (disputeType === 'landlord_tenant') return 5  // role, type, sub-type, amount, recommendation
```

Note: Landlord-tenant uses 5 steps (like civil) because it needs the amount step for court routing. Unlike small claims (always JP) or family (always district), LT uses amount-based routing.

Update step rendering:
- Step 3 when `isLandlordTenant`: `<LandlordTenantSubTypeStep>`
- Step 4 when `isLandlordTenant`: `<AmountStep>` (existing — for court routing)
- Step 5 when `isLandlordTenant`: `<RecommendationStep>` with computed recommendation

Special case for eviction: if `landlordTenantSubType === 'eviction'`, skip the amount step (always JP) — set totalSteps to 4 and show RecommendationStep at step 4 with hardcoded JP recommendation.

Update `handleAccept`:
```typescript
const isLandlordTenant = state.disputeType === 'landlord_tenant'
const isEviction = isLandlordTenant && state.landlordTenantSubType === 'eviction'

const courtType = isFamily ? 'district'
  : isSmallClaims ? 'jp'
  : isEviction ? 'jp'
  : state.disputeType && state.amount
    ? recommendCourt({ ... }).recommended
    : 'unknown'

// Include landlord_tenant_sub_type in POST body
...(isLandlordTenant && state.landlordTenantSubType
  ? { landlord_tenant_sub_type: state.landlordTenantSubType }
  : {}),
```

### API route updates (`src/app/api/cases/route.ts`)

After the `small_claims_sub_type` block, add:
```typescript
if (landlord_tenant_sub_type) {
  await supabase!.from('landlord_tenant_details').insert({
    case_id: newCase.id,
    landlord_tenant_sub_type,
    party_role: role === 'plaintiff' ? 'landlord' : 'tenant',
  })
}
```

---

## Task 3: Court recommendation — eviction always JP (TDD)

**Files:**
- Modify: `src/lib/rules/court-recommendation.ts`
- Modify: `tests/unit/rules/court-recommendation.test.ts`

Add a new rule between Rule 2 (family) and Rule 3 (real property):

```typescript
// Rule 2.5: Eviction (FED) -- always JP Court in Texas
if (disputeType === 'landlord_tenant' && circumstances.evictionSubType) {
  return {
    recommended: 'jp',
    reasoning:
      'Eviction (forcible entry and detainer) cases are filed in Justice of the Peace Court, regardless of the amount involved.',
    confidence: 'high',
  }
}
```

Wait — `CircumstanceFlags` doesn't have `evictionSubType`. Since the court recommendation engine takes `CircumstanceFlags`, we need a clean approach. Better approach: add an optional `subType` field to `CourtRecommendationInput`:

```typescript
export interface CourtRecommendationInput {
  disputeType: DisputeType
  amount: AmountRange
  circumstances: CircumstanceFlags
  subType?: string  // Optional sub-type for dispute-specific routing
}
```

Then add the rule:
```typescript
// Rule 2.5: Eviction -- always JP Court
if (disputeType === 'landlord_tenant' && input.subType === 'eviction') {
  return {
    recommended: 'jp',
    reasoning:
      'Eviction (forcible entry and detainer) cases are filed in Justice of the Peace Court in Texas, regardless of the amount involved.',
    confidence: 'high',
  }
}
```

**Tests (3 new):**
- Eviction sub-type returns JP regardless of amount
- Non-eviction LT with under_20k still returns JP (existing rule)
- Non-eviction LT with 20k_75k returns county (existing rule)

---

## Task 4: LT demand letter prompts (TDD)

**Files:**
- Create: `src/lib/rules/landlord-tenant-demand-letter-prompts.ts`
- Create: `tests/unit/rules/landlord-tenant-demand-letter-prompts.test.ts`

### Schema

```typescript
import { z } from 'zod'
import { partySchema } from '../schemas/filing'
import { damageItemSchema } from '../schemas/small-claims-filing'

export const ltDemandLetterFactsSchema = z.object({
  party_role: z.enum(['landlord', 'tenant']),
  your_info: partySchema,
  other_party: partySchema,
  landlord_tenant_sub_type: z.enum([
    'eviction', 'nonpayment', 'security_deposit', 'property_damage',
    'repair_maintenance', 'lease_termination', 'habitability', 'other',
  ]),
  property_address: z.string().min(5),
  claim_amount: z.number().positive(),
  damages_breakdown: z.array(damageItemSchema).min(1),
  description: z.string().min(10),
  deadline_days: z.number().min(1).max(90).default(14),
  preferred_resolution: z.string().optional(),
  lease_start_date: z.string().optional(),
  monthly_rent: z.number().optional(),
  deposit_amount: z.number().optional(),
  county: z.string().optional(),
})

export type LtDemandLetterFacts = z.infer<typeof ltDemandLetterFactsSchema>
```

### Prompt builder `buildLtDemandLetterPrompt(facts)`

- System: Professional demand letter for landlord-tenant disputes
- Sub-type-specific content:
  - `security_deposit` (tenant): Cites Tex. Prop. Code § 92.104, 30-day return deadline
  - `repair_maintenance` (tenant): Cites warranty of habitability, Tex. Prop. Code § 92.052, repair-and-deduct remedy § 92.0561
  - `habitability` (tenant): Cites Tex. Prop. Code § 92.052, right to repair/deduct/terminate
  - `nonpayment` (landlord): Includes notice-to-vacate language, Tex. Prop. Code § 24.005
  - `eviction` (landlord): Notice to vacate with cure period, Tex. Prop. Code § 24.005
  - `lease_termination`: Cites lease terms, early termination provisions
  - `property_damage`: Itemized damage claims with repair estimates
  - `other`: General demand letter format
- Role-adaptive: sender/recipient labels change based on `party_role`
- DRAFT disclaimer
- ANNOTATIONS section

**Tests (15):**
- Returns system and user strings
- Includes DRAFT disclaimer
- Includes property address
- Includes deadline days
- Includes consequence language (filing in court)
- Adapts sender/recipient based on party_role (2 tests)
- Includes Tex. Prop. Code § 92.104 for security deposit
- Includes Tex. Prop. Code § 92.052 for habitability
- Includes notice-to-vacate for nonpayment
- Includes damages breakdown
- Schema accepts valid facts
- Schema rejects missing property_address
- Schema rejects missing party_role
- Schema rejects empty damages

---

## Task 5: LT filing schema + prompts (TDD)

**Files:**
- Create: `src/lib/schemas/landlord-tenant-filing.ts`
- Create: `src/lib/rules/landlord-tenant-filing-prompts.ts`
- Create: `tests/unit/rules/landlord-tenant-filing-prompts.test.ts`

### Filing schema (`landlord-tenant-filing.ts`)

```typescript
import { z } from 'zod'
import { partySchema } from './filing'
import { damageItemSchema } from './small-claims-filing'

export const landlordTenantFilingFactsSchema = z.object({
  party_role: z.enum(['landlord', 'tenant']),
  your_info: partySchema,
  other_party: partySchema,
  court_type: z.enum(['jp', 'county', 'district']),
  county: z.string().min(1),
  cause_number: z.string().optional(),
  landlord_tenant_sub_type: z.enum([
    'eviction', 'nonpayment', 'security_deposit', 'property_damage',
    'repair_maintenance', 'lease_termination', 'habitability', 'other',
  ]),
  property_address: z.string().min(5),
  lease_start_date: z.string().optional(),
  lease_end_date: z.string().optional(),
  lease_type: z.string().optional(),
  monthly_rent: z.number().optional(),
  deposit_amount: z.number().optional(),
  claim_amount: z.number().positive(),
  damages_breakdown: z.array(damageItemSchema).min(1),
  description: z.string().min(10),
  eviction_notice_date: z.string().optional(),
  eviction_notice_type: z.string().optional(),
  eviction_reason: z.string().optional(),
  repair_requests: z.array(z.object({
    date: z.string(),
    issue: z.string(),
    response: z.string().optional(),
    status: z.string().optional(),
  })).optional(),
  deposit_deductions: z.array(z.object({
    amount: z.number(),
    reason: z.string(),
  })).optional(),
  habitability_issues: z.string().optional(),
  demand_letter_sent: z.boolean(),
  demand_letter_date: z.string().optional(),
})

export type LandlordTenantFilingFacts = z.infer<typeof landlordTenantFilingFactsSchema>
```

### Filing prompt builder (`landlord-tenant-filing-prompts.ts`)

```typescript
export function buildLandlordTenantFilingPrompt(facts: LandlordTenantFilingFacts): { system: string; user: string }
```

- System prompt: Legal document formatting assistant for landlord-tenant petitions
- Caption adapts by court_type:
  - JP: "In the Justice Court, Precinct ___, [County] County, Texas"
  - County: "In the County Court at Law No. ___, [County] County, Texas"
  - District: "In the District Court of [County] County, Texas"
- Title adapts by sub_type and party_role:
  - eviction (landlord): "PETITION FOR FORCIBLE ENTRY AND DETAINER"
  - nonpayment (landlord): "PETITION FOR NONPAYMENT OF RENT AND EVICTION"
  - security_deposit (tenant): "PETITION FOR RETURN OF SECURITY DEPOSIT"
  - property_damage: "PETITION FOR PROPERTY DAMAGES"
  - repair_maintenance (tenant): "PETITION FOR REPAIR AND REMEDY"
  - lease_termination: "PETITION FOR BREACH OF LEASE AND TERMINATION"
  - habitability (tenant): "PETITION FOR BREACH OF WARRANTY OF HABITABILITY"
  - other: "PETITION — LANDLORD-TENANT DISPUTE"
- Texas Property Code citations per sub-type:
  - Security deposit: Tex. Prop. Code § 92.104, § 92.109
  - Habitability: Tex. Prop. Code § 92.052
  - Repair: Tex. Prop. Code § 92.0563
  - Eviction: Tex. Prop. Code § 24.005, TRCP 510
  - Nonpayment: Tex. Prop. Code § 24.005
- DRAFT disclaimer, ANNOTATIONS section
- Role-adaptive terminology (Landlord/Tenant vs Plaintiff/Defendant)

```typescript
export function getDocumentTitle(subType: string, partyRole: string): string
export function getDocumentFormat(subType: string): string
```

**Tests (18):**
- Returns system and user strings
- Includes DRAFT disclaimer
- Correct court caption for JP, County, District (3 tests)
- Uses Landlord/Tenant terminology
- Includes property address
- Includes damages itemization
- Includes verification section
- Correct title per sub-type (8 tests)
- Includes Texas Property Code citations for security_deposit, habitability, repair_maintenance
- Schema accepts valid facts
- Schema rejects missing property_address

---

## Task 6: Wizard step components (12 files)

**Files:**
- Create: `src/components/step/landlord-tenant-wizard-steps/lt-preflight.tsx`
- Create: `src/components/step/landlord-tenant-wizard-steps/lt-parties-step.tsx`
- Create: `src/components/step/landlord-tenant-wizard-steps/lt-property-step.tsx`
- Create: `src/components/step/landlord-tenant-wizard-steps/lt-lease-step.tsx`
- Create: `src/components/step/landlord-tenant-wizard-steps/lt-financial-step.tsx`
- Create: `src/components/step/landlord-tenant-wizard-steps/eviction-notice-step.tsx`
- Create: `src/components/step/landlord-tenant-wizard-steps/repair-history-step.tsx`
- Create: `src/components/step/landlord-tenant-wizard-steps/deposit-deductions-step.tsx`
- Create: `src/components/step/landlord-tenant-wizard-steps/lt-timeline-step.tsx`
- Create: `src/components/step/landlord-tenant-wizard-steps/lt-demand-info-step.tsx`
- Create: `src/components/step/landlord-tenant-wizard-steps/lt-venue-step.tsx`
- Create: `src/components/step/landlord-tenant-wizard-steps/lt-review-step.tsx`

**Component patterns:** Follow family and small claims wizard steps exactly.

### Preflight (`lt-preflight.tsx`)
- Props: `{ subType: string, partyRole: string, onReady: () => void }`
- Sub-type-specific document checklists:
  - Eviction (landlord): lease, notice to vacate, rent ledger, photos
  - Eviction (tenant): lease, notice received, payment records, photos
  - Security deposit: lease, deposit receipt, move-in/out inspection, deduction letter, photos
  - Repair/maintenance: lease, repair request records, photos of issues, contractor estimates
  - Habitability: lease, photos of conditions, health/safety reports, repair requests
  - Property damage: lease, photos, repair estimates, incident documentation
  - Nonpayment: lease, rent ledger, payment records, notices sent
  - Lease termination: lease, notices, communications

### Parties (`lt-parties-step.tsx`)
- Props: `{ partyRole, landlordInfo, tenantInfo, onLandlordChange, onTenantChange }`
- Role-adaptive labels: "Your information" and "Other party's information" swap based on partyRole
- If partyRole = 'landlord': "Your info" shows landlord fields, "Other party" shows tenant
- If partyRole = 'tenant': "Your info" shows tenant fields, "Other party" shows landlord
- Fields: full_name, address, city, state, zip for each party

### Property (`lt-property-step.tsx`)
- Props: `{ propertyAddress, propertyType, unitNumber, onFieldChange }`
- Property address (required), unit number (optional)
- Property type select: house, apartment, condo, commercial, other
- Info callout: "The property address helps determine where to file"

### Lease (`lt-lease-step.tsx`)
- Props: `{ leaseStartDate, leaseEndDate, leaseType, monthlyRent, onFieldChange }`
- Lease start/end dates, lease type (fixed/month-to-month/oral)
- Monthly rent amount
- Info callout about oral vs written lease implications

### Financial (`lt-financial-step.tsx`)
- Props: `{ items: DamageItem[], onItemsChange, subType, depositAmount, onDepositAmountChange }`
- Reuses `calculateDamages` from `@/lib/small-claims/damages-calculator`
- Dynamic add/remove damage items
- Running total with cap warnings (for JP court cases)
- Sub-type-specific category suggestions
- Deposit amount field for security_deposit sub-type

### Eviction Notice (`eviction-notice-step.tsx`)
- Props: `{ noticeDate, noticeType, reason, tenantCured, onFieldChange }`
- Notice date, notice type (3-day pay or quit, 30-day, cure-or-quit, unconditional quit)
- Reason for eviction (nonpayment, lease violation, holdover, criminal activity)
- Whether tenant cured the violation (for cure-or-quit notices)
- Texas-specific guidance on notice periods (Tex. Prop. Code § 24.005)

### Repair History (`repair-history-step.tsx`)
- Props: `{ requests: RepairRequest[], onRequestsChange }`
- Dynamic add/remove list of repair requests
- Each: date reported, issue description, landlord response, current status
- Guidance on documenting repair requests in writing

### Deposit Deductions (`deposit-deductions-step.tsx`)
- Props: `{ deductions: Deduction[], onDeductionsChange, depositAmount }`
- Dynamic add/remove list of claimed deductions (amount + reason)
- Running total vs deposit amount comparison
- Guidance on Tex. Prop. Code § 92.104 (30-day return requirement)

### Timeline (`lt-timeline-step.tsx`)
- Props: `{ events: TimelineEvent[], onEventsChange }`
- Same pattern as small claims timeline-step.tsx
- Chronological events with date + description

### Demand Letter Info (`lt-demand-info-step.tsx`)
- Props: `{ demandLetterSent, demandLetterDate, deadlineDays, preferredResolution, onFieldChange }`
- Same pattern as small claims demand-letter-info-step.tsx
- Adapted info callout for LT context

### Venue (`lt-venue-step.tsx`)
- Props: `{ propertyCounty, defendantCounty, onFieldChange }`
- Property county (primary for LT — where property is located)
- Defendant county (alternative)
- Venue explanation citing Tex. Civ. Prac. & Rem. Code § 15.0115

### Review (`lt-review-step.tsx`)
- Props: all form values + `subType` + `partyRole` + `onEdit(stepId)` callback
- SectionCard pattern from FamilyReviewStep
- Sections: Parties, Property, Lease, Financial, sub-type-specific (eviction/repair/deductions), Timeline, Demand Letter, Venue
- Conditional sections based on sub-type

---

## Task 7: LandlordTenantWizard orchestrator

**Files:**
- Create: `src/components/step/landlord-tenant-wizard.tsx`

**Pattern:** Follow `family-law-wizard.tsx` and `small-claims-wizard.tsx` exactly.

### Props
```typescript
interface LandlordTenantWizardProps {
  caseId: string
  taskId: string
  existingMetadata?: Record<string, unknown>
  landlordTenantDetails: {
    landlord_tenant_sub_type: string
    party_role: string
    property_address: string | null
    lease_start_date: string | null
    lease_end_date: string | null
    lease_type: string | null
    monthly_rent: number | null
    deposit_amount: number | null
    amount_claimed: number | null
    eviction_notice_date: string | null
    eviction_notice_type: string | null
    demand_letter_sent: boolean
  } | null
  caseData: { county: string | null; court_type: string }
}
```

### Dynamic steps by sub-type

| Sub-type | Steps |
|----------|-------|
| eviction | preflight, parties, property, lease, financial, eviction_notice, timeline, demand_info, venue, review |
| nonpayment | preflight, parties, property, lease, financial, eviction_notice, demand_info, venue, review |
| security_deposit | preflight, parties, property, lease, financial, deductions, timeline, demand_info, venue, review |
| property_damage | preflight, parties, property, financial, timeline, demand_info, venue, review |
| repair_maintenance | preflight, parties, property, lease, financial, repairs, demand_info, venue, review |
| lease_termination | preflight, parties, property, lease, financial, demand_info, venue, review |
| habitability | preflight, parties, property, lease, financial, repairs, timeline, demand_info, venue, review |
| other | preflight, parties, property, financial, demand_info, venue, review |

### Key behaviors
- `buildFacts()`: Creates payload matching `landlordTenantFilingFactsSchema`
- `generateDraft()`: POST to `/api/cases/${caseId}/generate-filing` with `document_type: \`landlord_tenant_${subType}\``
- `buildMetadata()`: Returns all form state
- Draft phase: `AnnotatedDraftViewer`
- `canAdvance`: Per-step validation
- `totalEstimateMinutes`: 25
- `handleSave`, `handleComplete`, `handleFinalConfirm`: Same pattern as family/small claims

---

## Task 8: Educational + intake steps (5 components)

**Files:**
- Create: `src/components/step/landlord-tenant/lt-intake-step.tsx`
- Create: `src/components/step/landlord-tenant/serve-other-party-step.tsx`
- Create: `src/components/step/landlord-tenant/lt-hearing-prep-step.tsx`
- Create: `src/components/step/landlord-tenant/lt-hearing-day-step.tsx`
- Create: `src/components/step/landlord-tenant/post-judgment-step.tsx`

**Patterns:** Follow `small-claims-intake-step.tsx` for intake, `waiting-period-step.tsx` for educational steps.

### LT Intake (`lt-intake-step.tsx`)
- Form with review: county, property address, claim amount (with court routing info), brief description
- Props: `{ caseId, taskId, existingMetadata }`
- `onConfirm`: save metadata + complete task

### Serve Other Party (`serve-other-party-step.tsx`)
- Educational step (`skipReview: true`)
- 3 ExpandableSections:
  1. "How to serve in landlord-tenant cases" — certified mail, constable, posting on door for eviction (TRCP 510.4)
  2. "Service requirements" — timing rules, what to include
  3. "Special rules for eviction service" — door posting allowed, substituted service

### LT Hearing Prep (`lt-hearing-prep-step.tsx`)
- Educational step (`skipReview: true`)
- 3 ExpandableSections:
  1. "What to bring" — lease, photos, repair records, payment receipts, demand letter, filing receipt
  2. "How to present your case" — chronological, evidence-based, focus on lease terms and law
  3. "What the judge expects" — specific amounts, proof of notice, timeline of events

### LT Hearing Day (`lt-hearing-day-step.tsx`)
- Educational step (`skipReview: true`)
- 3 ExpandableSections:
  1. "Day-of checklist" — courthouse directions, arrive early, evidence folder, dress code
  2. "What happens at the hearing" — both sides present, judge may rule same day, 15-30 minutes typical
  3. "Possible outcomes" — judgment for possession, money judgment, dismissal, appeal info

### Post-Judgment (`post-judgment-step.tsx`)
- Educational step (`skipReview: true`)
- 3 ExpandableSections:
  1. "If you won" — enforcement (writ of possession for eviction, abstract of judgment for money), collection options
  2. "If you lost" — appeal rights (5 days for FED per TRCP 510.9, 21 days for other cases), appeal bond, new trial
  3. "Next steps" — recording judgment, garnishment, property liens, small claims enforcement

---

## Task 9: Wire generate-filing route for landlord-tenant

**Files:**
- Modify: `src/app/api/cases/[id]/generate-filing/route.ts`

Add imports:
```typescript
import { buildLandlordTenantFilingPrompt } from '@/lib/rules/landlord-tenant-filing-prompts'
import { landlordTenantFilingFactsSchema } from '@/lib/schemas/landlord-tenant-filing'
import { ltDemandLetterFactsSchema, buildLtDemandLetterPrompt } from '@/lib/rules/landlord-tenant-demand-letter-prompts'
```

Add to `MOTION_REGISTRY`:
```typescript
// Landlord-tenant filing types — all 8 sub-types use the same schema/prompt builder
landlord_tenant_eviction: {
  schema: landlordTenantFilingFactsSchema,
  buildPrompt: buildLandlordTenantFilingPrompt as unknown as RegistryEntry['buildPrompt'],
},
landlord_tenant_nonpayment: { ... },
landlord_tenant_security_deposit: { ... },
landlord_tenant_property_damage: { ... },
landlord_tenant_repair_maintenance: { ... },
landlord_tenant_lease_termination: { ... },
landlord_tenant_habitability: { ... },
landlord_tenant_other: { ... },
// LT demand letter
landlord_tenant_demand_letter: {
  schema: ltDemandLetterFactsSchema,
  buildPrompt: buildLtDemandLetterPrompt as unknown as RegistryEntry['buildPrompt'],
},
```

---

## Task 10: Wire step router + LT demand letter step

**Files:**
- Create: `src/components/step/landlord-tenant/lt-demand-letter-step.tsx`
- Modify: `src/app/(authenticated)/case/[id]/step/[taskId]/page.tsx`

### LT Demand Letter Step (`lt-demand-letter-step.tsx`)

Similar to `src/components/step/small-claims/demand-letter-step.tsx` but with LT-specific fields:
- Form phase: landlord/tenant info, property address, claim details, damages, deadline, preferred resolution
- Uses `StepRunner` pattern
- `onBeforeReview`: POST `/api/cases/${caseId}/generate-filing` with `document_type: 'landlord_tenant_demand_letter'`
- Review phase: `AnnotatedDraftViewer`
- Props: `{ caseId, taskId, existingMetadata, landlordTenantDetails, caseData }`

### Step Router Updates

Add imports:
```typescript
import { LtIntakeStep } from '@/components/step/landlord-tenant/lt-intake-step'
import { LtDemandLetterStep } from '@/components/step/landlord-tenant/lt-demand-letter-step'
import { LandlordTenantWizard } from '@/components/step/landlord-tenant-wizard'
import { ServeOtherPartyStep } from '@/components/step/landlord-tenant/serve-other-party-step'
import { LtHearingPrepStep } from '@/components/step/landlord-tenant/lt-hearing-prep-step'
import { LtHearingDayStep } from '@/components/step/landlord-tenant/lt-hearing-day-step'
import { PostJudgmentStep } from '@/components/step/landlord-tenant/post-judgment-step'
```

Add switch cases:
```typescript
// Landlord-tenant task chain steps
case 'landlord_tenant_intake':
  return (
    <LtIntakeStep caseId={id} taskId={taskId} existingMetadata={task.metadata} />
  )
case 'prepare_lt_demand_letter': {
  const { data: caseRow } = await supabase
    .from('cases').select('county, court_type').eq('id', id).single()
  const { data: ltDetails } = await supabase
    .from('landlord_tenant_details').select('*').eq('case_id', id).maybeSingle()
  return (
    <LtDemandLetterStep
      caseId={id} taskId={taskId}
      existingMetadata={task.metadata}
      landlordTenantDetails={ltDetails}
      caseData={{ county: caseRow?.county ?? null }}
    />
  )
}
case 'prepare_landlord_tenant_filing': {
  const { data: caseRow } = await supabase
    .from('cases').select('county, court_type').eq('id', id).single()
  const { data: ltDetails } = await supabase
    .from('landlord_tenant_details').select('*').eq('case_id', id).maybeSingle()
  return (
    <LandlordTenantWizard
      caseId={id} taskId={taskId}
      existingMetadata={task.metadata}
      landlordTenantDetails={ltDetails}
      caseData={{ county: caseRow?.county ?? null, court_type: caseRow?.court_type ?? 'jp' }}
    />
  )
}
case 'serve_other_party':
  return <ServeOtherPartyStep caseId={id} taskId={taskId} />
case 'post_judgment':
  return <PostJudgmentStep caseId={id} taskId={taskId} />
```

Note: `prepare_for_hearing` and `hearing_day` already have small-claims components wired. For LT we need separate ones since the content differs. Add these cases BEFORE the existing small claims cases (or check if the existing ones handle the LT context — if not, create separate LT versions):

```typescript
// These are shared task_keys used by both small claims and LT.
// The existing step router already has cases for prepare_for_hearing and hearing_day
// from the small claims module. If those render small-claims-specific content,
// we need to check the case's dispute_type and render the appropriate component.
```

For `prepare_for_hearing` and `hearing_day`: These step components from small claims are generic educational steps. If the small claims versions are already wired, the LT chain will use them too (they're the same task_keys). If LT needs different content, update the existing cases to check `dispute_type` and render the LT version. The simplest approach: use the small claims versions for now (they're generic enough).

---

## Task 11: Build & test verification

1. Run all tests — expect all passing + new tests
2. `npx next build` — no type errors
3. Verify all new switch cases render (not "Coming soon")

---

## File Summary

| File | Action | Module |
|------|--------|--------|
| `supabase/migrations/20260303000007_landlord_tenant_tables.sql` | Create | Migration |
| `src/lib/schemas/case.ts` | Modify | Schema |
| `src/lib/schemas/landlord-tenant-filing.ts` | Create | Filing |
| `src/lib/rules/court-recommendation.ts` | Modify | Court |
| `tests/unit/rules/court-recommendation.test.ts` | Modify | Court |
| `src/lib/rules/landlord-tenant-demand-letter-prompts.ts` | Create | Demand letter |
| `tests/unit/rules/landlord-tenant-demand-letter-prompts.test.ts` | Create | Demand letter |
| `src/lib/rules/landlord-tenant-filing-prompts.ts` | Create | Filing |
| `tests/unit/rules/landlord-tenant-filing-prompts.test.ts` | Create | Filing |
| `src/components/cases/wizard/landlord-tenant-sub-type-step.tsx` | Create | Case creation |
| `src/components/cases/new-case-dialog.tsx` | Modify | Case creation |
| `src/app/api/cases/route.ts` | Modify | API |
| `src/components/step/landlord-tenant-wizard-steps/*.tsx` (12 files) | Create | Wizard steps |
| `src/components/step/landlord-tenant-wizard.tsx` | Create | Wizard |
| `src/components/step/landlord-tenant/lt-intake-step.tsx` | Create | Task steps |
| `src/components/step/landlord-tenant/lt-demand-letter-step.tsx` | Create | Demand letter |
| `src/components/step/landlord-tenant/serve-other-party-step.tsx` | Create | Educational |
| `src/components/step/landlord-tenant/lt-hearing-prep-step.tsx` | Create | Educational |
| `src/components/step/landlord-tenant/lt-hearing-day-step.tsx` | Create | Educational |
| `src/components/step/landlord-tenant/post-judgment-step.tsx` | Create | Educational |
| `src/app/api/cases/[id]/generate-filing/route.ts` | Modify | API |
| `src/app/(authenticated)/case/[id]/step/[taskId]/page.tsx` | Modify | Router |

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| Eviction sub-type | Always JP Court regardless of amount; skip amount step in wizard |
| User is landlord | Party forms show landlord as "Your info", tenant as "Other party" |
| User is tenant | Party forms show tenant as "Your info", landlord as "Other party" |
| Oral lease | Lease step allows "oral" type; filing prompt adapts language |
| Habitability with no repair requests | Repair history step is optional; form validates on description alone |
| Security deposit overlaps small claims | Both coexist; user chooses path based on complexity preference |
| Shared task_keys (welcome, evidence_vault, file_with_court) | Existing components handle these — no duplication needed |
| prepare_for_hearing / hearing_day shared | Use existing small claims educational steps (generic enough for LT) |
| Post-judgment is terminal | No downstream task — dead-end step with educational content |

## Verification

1. All unit tests pass (court recommendation: 3 new, demand letter: 15, filing prompts: 18)
2. `npx next build` — compiles clean
3. Case creation shows landlord-tenant option with 8 sub-type cards
4. Eviction routes directly to JP Court (no amount step)
5. Non-eviction sub-types route through amount step for court recommendation
6. Task chain: 10 steps from welcome through post-judgment
7. Demand letter generates with Texas Property Code citations
8. Filing petition uses correct court caption and title per sub-type
9. No "Coming soon" for any landlord-tenant task_keys
