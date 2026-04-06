# Personal Injury / Minor Car Accident Module — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Add a plaintiff-side personal injury module with 8 sub-types, 12-step guided task chain, 3 AI-generated documents (demand letter, petition, settlement agreement), and a dynamic wizard orchestrator.

**Architecture:** Follows the Debt Defense / Landlord-Tenant module pattern — Supabase migration (details table + trigger branches), case schema sub-types, wizard sub-type selection in case creation, prompt builders with Zod schemas (TDD), wizard orchestrator with dynamic steps per sub-type, StepRunner-based filing steps, educational task chain steps, and step router wiring.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, Supabase (PostgreSQL + RLS), Anthropic Claude API, Zod, vitest

**Design doc:** `docs/plans/2026-03-04-personal-injury-auto-design.md`

---

## Task 1: Migration — `personal_injury_details` Table + Trigger Branches

**Files:**
- Create: `supabase/migrations/20260304000001_personal_injury_tables.sql`

**What to build:**

A single SQL migration with 3 sections:

### Section 1: `personal_injury_details` table

```sql
CREATE TABLE IF NOT EXISTS public.personal_injury_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  pi_sub_type text NOT NULL CHECK (pi_sub_type IN (
    'auto_accident', 'pedestrian_cyclist', 'rideshare', 'uninsured_motorist',
    'slip_and_fall', 'dog_bite', 'product_liability', 'other'
  )),
  incident_date date,
  incident_location text,
  incident_description text,
  police_report_number text,
  police_report_filed boolean DEFAULT false,
  other_driver_name text,
  other_driver_insurance text,
  other_driver_policy_number text,
  your_insurance_carrier text,
  your_policy_number text,
  injury_description text,
  injury_severity text CHECK (injury_severity IS NULL OR injury_severity IN ('minor', 'moderate', 'severe')),
  medical_providers jsonb DEFAULT '[]',
  medical_expenses numeric(10,2),
  lost_wages numeric(10,2),
  property_damage_amount numeric(10,2),
  pain_suffering_multiplier numeric(3,1),
  total_demand_amount numeric(10,2),
  demand_sent_date date,
  settlement_status text CHECK (settlement_status IS NULL OR settlement_status IN (
    'not_started', 'demand_sent', 'negotiating', 'settled', 'filing'
  )),
  premises_owner text,
  product_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(case_id)
);

ALTER TABLE public.personal_injury_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own personal injury details"
  ON public.personal_injury_details
  FOR ALL
  USING (
    case_id IN (SELECT id FROM public.cases WHERE user_id = auth.uid())
  );

CREATE INDEX idx_personal_injury_details_case_id ON public.personal_injury_details(case_id);
```

### Section 2: `seed_case_tasks()` — add personal_injury branch

Replace function. Add `personal_injury` plaintiff branch as an early return **before** the `debt_collection` defendant branch. The PI branch seeds 12 tasks:

```sql
-- Personal injury plaintiff cases — early return
IF NEW.dispute_type = 'personal_injury' THEN
  INSERT INTO public.tasks (case_id, task_key, title, status, unlocked_at)
  VALUES (NEW.id, 'welcome', 'Welcome — Get Started', 'todo', now());

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'pi_intake', 'Tell Us About Your Injury', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'pi_medical_records', 'Organize Your Medical Records', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'evidence_vault', 'Collect Your Evidence', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'pi_insurance_communication', 'Communicate With Insurance', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'prepare_pi_demand_letter', 'Draft Your Demand Letter', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'pi_settlement_negotiation', 'Negotiate Your Settlement', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'prepare_pi_petition', 'Prepare Your Court Petition', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'pi_file_with_court', 'File With the Court', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'pi_serve_defendant', 'Serve the Defendant', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'pi_trial_prep', 'Prepare for Trial', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'pi_post_resolution', 'After Resolution', 'locked');

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

**CRITICAL:** Copy the entire existing `seed_case_tasks()` function body from `20260303000008_debt_defense_tables.sql` and insert the PI branch at the top (before the debt_collection branch). All existing branches must remain unchanged.

### Section 3: `unlock_next_task()` — add PI chain (11 transitions)

Replace function. Add PI transitions **before** the debt defense chain. All use distinct `pi_` prefixed task_keys:

```
welcome -> pi_intake
pi_intake -> pi_medical_records
pi_medical_records -> evidence_vault
evidence_vault -> pi_insurance_communication
pi_insurance_communication -> prepare_pi_demand_letter
prepare_pi_demand_letter -> pi_settlement_negotiation
pi_settlement_negotiation -> prepare_pi_petition
prepare_pi_petition -> pi_file_with_court
pi_file_with_court -> pi_serve_defendant
pi_serve_defendant -> pi_trial_prep
pi_trial_prep -> pi_post_resolution
```

Each transition follows the pattern:
```sql
IF NEW.task_key = 'pi_intake' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
  UPDATE public.tasks SET status = 'todo', unlocked_at = now()
  WHERE case_id = NEW.case_id AND task_key = 'pi_medical_records' AND status = 'locked';
END IF;
```

**CRITICAL:** Copy the entire existing `unlock_next_task()` function body from `20260303000008_debt_defense_tables.sql` and insert the PI chain entries at the top. All existing chain entries (debt, landlord-tenant, small claims, family, civil) must remain unchanged.

---

## Task 2: Schema — `PI_SUB_TYPES` + `pi_sub_type` Field + Tests

**Files:**
- Modify: `src/lib/schemas/case.ts`
- Modify: `tests/unit/schemas/case.test.ts`

### Schema changes (`src/lib/schemas/case.ts`):

After the `DEBT_SUB_TYPES` block (line 60), add:

```typescript
export const PI_SUB_TYPES = [
  'auto_accident',
  'pedestrian_cyclist',
  'rideshare',
  'uninsured_motorist',
  'slip_and_fall',
  'dog_bite',
  'product_liability',
  'other',
] as const

export type PiSubType = (typeof PI_SUB_TYPES)[number]
```

In `createCaseSchema` (around line 62), add after `debt_sub_type`:

```typescript
pi_sub_type: z.enum(PI_SUB_TYPES).optional(),
```

### Test changes (`tests/unit/schemas/case.test.ts`):

Add 3 tests after the existing `debt_sub_type` tests (after line 78):

```typescript
it('accepts pi_sub_type for personal_injury cases', () => {
  const result = createCaseSchema.safeParse({
    role: 'plaintiff',
    dispute_type: 'personal_injury',
    pi_sub_type: 'auto_accident',
  })
  expect(result.success).toBe(true)
})

it('accepts all valid pi_sub_type values', () => {
  for (const st of ['auto_accident', 'pedestrian_cyclist', 'rideshare', 'uninsured_motorist', 'slip_and_fall', 'dog_bite', 'product_liability', 'other']) {
    const result = createCaseSchema.safeParse({ role: 'plaintiff', pi_sub_type: st })
    expect(result.success).toBe(true)
  }
})

it('rejects invalid pi_sub_type', () => {
  const result = createCaseSchema.safeParse({ role: 'plaintiff', pi_sub_type: 'invalid_type' })
  expect(result.success).toBe(false)
})
```

**Verify:** `npx vitest run tests/unit/schemas/case.test.ts`

---

## Task 3: Case Creation Wizard — PI Sub-Type Step + Dialog Wiring

**Files:**
- Create: `src/components/cases/wizard/pi-sub-type-step.tsx`
- Modify: `src/components/cases/new-case-dialog.tsx`

### PI Sub-Type Step (`src/components/cases/wizard/pi-sub-type-step.tsx`):

Follow the pattern from `src/components/cases/wizard/dispute-type-step.tsx`. Create a component that displays 8 PI sub-type cards:

```typescript
import type { PiSubType } from '@/lib/schemas/case'
import { OptionCard } from './option-card'

const PI_OPTIONS: { value: PiSubType; label: string; description: string }[] = [
  { value: 'auto_accident', label: 'Minor car accident', description: 'Fender-bender, rear-end collision, parking lot accident' },
  { value: 'pedestrian_cyclist', label: 'Pedestrian or cyclist hit', description: 'Hit while walking, biking, or using e-scooter' },
  { value: 'rideshare', label: 'Rideshare accident', description: 'Uber, Lyft, or other rideshare-related accident' },
  { value: 'uninsured_motorist', label: 'Uninsured/underinsured motorist', description: 'Other driver has no/insufficient insurance' },
  { value: 'slip_and_fall', label: 'Slip and fall', description: 'Injury on someone else\'s property' },
  { value: 'dog_bite', label: 'Dog bite', description: 'Animal attack or bite injury' },
  { value: 'product_liability', label: 'Defective product', description: 'Injury caused by a faulty product' },
  { value: 'other', label: 'Other personal injury', description: 'General PI claim not covered above' },
]

interface PISubTypeStepProps {
  value: PiSubType | ''
  onSelect: (type: PiSubType) => void
}

export function PISubTypeStep({ value, onSelect }: PISubTypeStepProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-warm-text">What type of injury case is this?</p>
      <div className="space-y-2">
        {PI_OPTIONS.map((opt) => (
          <OptionCard
            key={opt.value}
            label={opt.label}
            description={opt.description}
            selected={value === opt.value}
            onClick={() => onSelect(opt.value)}
          />
        ))}
      </div>
    </div>
  )
}
```

### Dialog wiring (`src/components/cases/new-case-dialog.tsx`):

Follow the existing pattern used for `debt_collection` and `landlord_tenant` sub-types:

1. Import `PISubTypeStep` and `PiSubType`
2. Add `piSubType: PiSubType | ''` to the reducer state
3. Add a `SET_PI_SUB_TYPE` action
4. In the step rendering logic, add a PI sub-type step after DisputeTypeStep when `disputeType === 'personal_injury'`
5. Force role to `'plaintiff'` when `disputeType === 'personal_injury'` (PI is plaintiff-only — skip RoleStep)
6. Include `pi_sub_type` in the POST body to `/api/cases`
7. Update total step count calculation for PI

**Key behavior:** When user selects `personal_injury` as dispute type, the wizard should:
- Auto-set role to `plaintiff` (no RoleStep shown)
- Show PISubTypeStep next
- Then AmountStep → RecommendationStep

---

## Task 4: API Route — Insert `personal_injury_details` on Case Creation

**Files:**
- Modify: `src/app/api/cases/route.ts`

### Changes:

1. Add `pi_sub_type` to the destructuring on line 20:

```typescript
const { role, county, court_type, dispute_type, family_sub_type, small_claims_sub_type, landlord_tenant_sub_type, debt_sub_type, pi_sub_type } = parsed.data
```

2. After the debt defense details block (after line 110), add:

```typescript
// Insert personal injury details if this is a PI case
if (pi_sub_type) {
  const { error: piError } = await supabase!
    .from('personal_injury_details')
    .insert({
      case_id: newCase.id,
      pi_sub_type,
    })

  if (piError) {
    return NextResponse.json(
      { error: 'Case created but failed to save personal injury details', details: piError.message },
      { status: 500 }
    )
  }
}
```

---

## Task 5: PI Demand Letter Prompt Builder (TDD)

**Files:**
- Create: `src/lib/rules/pi-demand-letter-prompts.ts`
- Create: `tests/unit/rules/pi-demand-letter-prompts.test.ts`

### Schema (`piDemandLetterFactsSchema`):

```typescript
import { z } from 'zod'
import { partySchema } from '../schemas/filing'

export const piDemandLetterFactsSchema = z.object({
  your_info: partySchema,
  defendant_info: partySchema,
  insurance_carrier: z.string().min(1),
  policy_number: z.string().optional(),
  claim_number: z.string().optional(),
  pi_sub_type: z.enum([
    'auto_accident', 'pedestrian_cyclist', 'rideshare', 'uninsured_motorist',
    'slip_and_fall', 'dog_bite', 'product_liability', 'other',
  ]),
  incident_date: z.string().min(1),
  incident_location: z.string().min(1),
  incident_description: z.string().min(10),
  injuries_description: z.string().min(10),
  injury_severity: z.enum(['minor', 'moderate', 'severe']),
  medical_providers: z.array(z.object({
    name: z.string().min(1),
    type: z.string().min(1),
    dates: z.string().min(1),
    amount: z.number().nonnegative(),
  })).min(1),
  total_medical_expenses: z.number().nonnegative(),
  lost_wages: z.number().nonnegative(),
  property_damage: z.number().nonnegative(),
  pain_suffering_amount: z.number().nonnegative(),
  total_demand_amount: z.number().positive(),
  county: z.string().optional(),
})

export type PiDemandLetterFacts = z.infer<typeof piDemandLetterFactsSchema>
```

### Prompt builder (`buildPiDemandLetterPrompt`):

- **System prompt:** Role = legal document formatting assistant. Format: DATE → YOUR INFO → VIA CERTIFIED MAIL → INSURANCE ADDRESS → RE LINE → OPENING → FACTS OF INCIDENT → INJURIES & TREATMENT → DAMAGES (itemized table) → DEMAND (30-day deadline) → CLOSING. Legal citations: Tex. Ins. Code § 542, Tex. Civ. Prac. & Rem. Code § 16.003. DRAFT disclaimer. Annotations section.
- **User prompt:** Builds sections from facts: sender info, insurance carrier info, incident details (sub-type-specific context), injuries, medical providers, damages breakdown (medical, lost wages, property damage, pain & suffering), total demand amount.

### Tests (~20):

Follow `tests/unit/rules/debt-validation-letter-prompts.test.ts` pattern with `makeFacts()` helper.

**Schema tests:**
- Accepts valid facts
- Rejects missing insurance_carrier
- Rejects empty medical_providers
- Rejects zero total_demand_amount
- Accepts all 8 pi_sub_types

**Prompt builder tests:**
- Returns `{ system, user }` object
- System includes "DRAFT" disclaimer
- System includes "Tex. Ins. Code § 542"
- System includes "Tex. Civ. Prac. & Rem. Code § 16.003"
- System includes "30-day" demand deadline
- System includes "CERTIFIED MAIL"
- System includes annotations instructions
- User includes plaintiff name
- User includes insurance carrier name
- User includes incident date
- User includes incident description
- User includes medical provider names
- User includes total demand amount
- User includes damages breakdown (medical, lost wages, property damage, pain & suffering)
- User includes sub-type context for auto_accident

**Verify:** `npx vitest run tests/unit/rules/pi-demand-letter-prompts.test.ts`

---

## Task 6: PI Court Petition Prompt Builder (TDD)

**Files:**
- Create: `src/lib/rules/pi-petition-prompts.ts`
- Create: `tests/unit/rules/pi-petition-prompts.test.ts`

### Schema (`piPetitionFactsSchema`):

```typescript
import { z } from 'zod'
import { partySchema } from '../schemas/filing'

export const piPetitionFactsSchema = z.object({
  your_info: partySchema,
  opposing_parties: z.array(partySchema).min(1),
  court_type: z.enum(['jp', 'county', 'district']),
  county: z.string().min(1),
  cause_number: z.string().optional(),
  pi_sub_type: z.enum([
    'auto_accident', 'pedestrian_cyclist', 'rideshare', 'uninsured_motorist',
    'slip_and_fall', 'dog_bite', 'product_liability', 'other',
  ]),
  incident_date: z.string().min(1),
  incident_location: z.string().min(1),
  incident_description: z.string().min(10),
  injuries_description: z.string().min(10),
  injury_severity: z.enum(['minor', 'moderate', 'severe']),
  damages: z.object({
    medical: z.number().nonnegative(),
    lost_wages: z.number().nonnegative(),
    property_damage: z.number().nonnegative(),
    pain_suffering: z.number().nonnegative(),
    total: z.number().positive(),
  }),
  negligence_theory: z.string().min(10),
  prior_demand_sent: z.boolean(),
  demand_date: z.string().optional(),
})

export type PiPetitionFacts = z.infer<typeof piPetitionFactsSchema>
```

### Prompt builder (`buildPiPetitionPrompt`):

- **System prompt:** Court caption → PARTIES → JURISDICTION & VENUE → FACTS → NEGLIGENCE/LIABILITY → DAMAGES → CONDITIONS PRECEDENT → PRAYER FOR RELIEF → JURY DEMAND. Sub-type-specific negligence theories (auto: failure to maintain lookout; slip & fall: Tex. Civ. Prac. & Rem. Code § 75; product: Tex. Civ. Prac. & Rem. Code § 82.001; dog bite: known dangerous propensities). DRAFT disclaimer. Annotations section.
- **User prompt:** Parties, court info, case facts, injury details, damages, negligence theory, prior demand info.
- **Court label helper:** JP → "Justice Court, Precinct ___, County, Texas", county → "County Court at Law No. ___, County, Texas", district → "District Court, County, Texas". Follow pattern from `debt-defense-prompts.ts`.

### Tests (~18):

**Schema tests:**
- Accepts valid facts
- Rejects `'federal'` court_type
- Rejects empty opposing_parties
- Rejects missing county
- Rejects zero total damages

**Prompt builder tests:**
- Returns `{ system, user }` object
- System includes "DRAFT" disclaimer
- System includes court caption instructions
- System includes NEGLIGENCE section
- System includes PRAYER FOR RELIEF
- System includes JURY DEMAND
- System includes annotations instructions
- User includes plaintiff name
- User includes defendant name
- User includes incident date and location
- User includes damages total
- User includes negligence theory
- Sub-type theory: auto_accident includes "maintain proper lookout"
- Sub-type theory: slip_and_fall includes "§ 75" or "premises"
- Sub-type theory: product_liability includes "§ 82.001" or "strict liability"
- Sub-type theory: dog_bite includes "dangerous propensities"
- Prior demand reference included when `prior_demand_sent: true`
- Correct court label per type (JP, county, district — 3 tests)

**Verify:** `npx vitest run tests/unit/rules/pi-petition-prompts.test.ts`

---

## Task 7: PI Settlement Agreement Prompt Builder (TDD)

**Files:**
- Create: `src/lib/rules/pi-settlement-prompts.ts`
- Create: `tests/unit/rules/pi-settlement-prompts.test.ts`

### Schema (`piSettlementFactsSchema`):

```typescript
import { z } from 'zod'
import { partySchema } from '../schemas/filing'

export const piSettlementFactsSchema = z.object({
  your_info: partySchema,
  defendant_info: partySchema,
  insurance_carrier: z.string().optional(),
  settlement_amount: z.number().positive(),
  incident_date: z.string().min(1),
  incident_description: z.string().min(10),
  county: z.string().optional(),
  include_medical_liens_release: z.boolean(),
  include_confidentiality: z.boolean(),
})

export type PiSettlementFacts = z.infer<typeof piSettlementFactsSchema>
```

### Prompt builder (`buildPiSettlementPrompt`):

- **System prompt:** SETTLEMENT AGREEMENT AND RELEASE OF ALL CLAIMS → PARTIES → RECITALS → SETTLEMENT PAYMENT → RELEASE OF CLAIMS → MEDICAL LIENS (conditional on `include_medical_liens_release`) → CONFIDENTIALITY (conditional on `include_confidentiality`) → REPRESENTATIONS → GOVERNING LAW → SIGNATURES. DRAFT disclaimer. Annotations section.
- **User prompt:** Parties, insurance carrier, settlement amount, incident details, conditional sections flags.

### Tests (~12):

**Schema tests:**
- Accepts valid facts
- Rejects zero settlement_amount
- Rejects missing incident_date

**Prompt builder tests:**
- Returns `{ system, user }` object
- System includes "DRAFT" disclaimer
- System includes "SETTLEMENT AGREEMENT AND RELEASE"
- System includes "RELEASE OF CLAIMS"
- System includes "GOVERNING LAW"
- System includes annotations instructions
- User includes settlement amount
- User includes plaintiff and defendant names
- Medical liens section included when `include_medical_liens_release: true`
- Medical liens section omitted when `include_medical_liens_release: false`
- Confidentiality section included when `include_confidentiality: true`
- Confidentiality section omitted when `include_confidentiality: false`

**Verify:** `npx vitest run tests/unit/rules/pi-settlement-prompts.test.ts`

---

## Task 8: Wire PI Prompts into Generate-Filing Route

**Files:**
- Modify: `src/app/api/cases/[id]/generate-filing/route.ts`

### Changes:

1. Add imports (after the debt-defense imports around line 74):

```typescript
import { piDemandLetterFactsSchema, buildPiDemandLetterPrompt } from '@/lib/rules/pi-demand-letter-prompts'
import { piPetitionFactsSchema, buildPiPetitionPrompt } from '@/lib/rules/pi-petition-prompts'
import { piSettlementFactsSchema, buildPiSettlementPrompt } from '@/lib/rules/pi-settlement-prompts'
```

2. Add 3 entries to `MOTION_REGISTRY` (after the `debt_defense_specific_answer` entry, before the closing `}`):

```typescript
// Personal injury
pi_demand_letter: {
  schema: piDemandLetterFactsSchema,
  buildPrompt: buildPiDemandLetterPrompt as unknown as RegistryEntry['buildPrompt'],
},
pi_petition: {
  schema: piPetitionFactsSchema,
  buildPrompt: buildPiPetitionPrompt as unknown as RegistryEntry['buildPrompt'],
},
pi_settlement_agreement: {
  schema: piSettlementFactsSchema,
  buildPrompt: buildPiSettlementPrompt as unknown as RegistryEntry['buildPrompt'],
},
```

**Verify:** `npx next build` — no type errors.

---

## Task 9: PI Intake Step Component

**Files:**
- Create: `src/components/step/personal-injury/pi-intake-step.tsx`

### Component design:

Follow `src/components/step/debt-defense/debt-defense-intake-step.tsx` pattern (StepRunner-wrapped form).

**Props:**
```typescript
interface PIIntakeStepProps {
  caseId: string
  taskId: string
  existingMetadata?: Record<string, unknown>
}
```

**Form fields (state hydrated from `existingMetadata`):**
1. Incident date (date input)
2. Incident location (text input)
3. Incident description (textarea)
4. Police report filed (yes/no toggle)
5. Police report number (conditional text input — shown when police_report_filed is true)
6. Injury description (textarea)
7. Injury severity (radio: minor / moderate / severe)

**SOL warning:** If `incident_date` is more than 18 months ago, show amber warning: "The Texas statute of limitations for personal injury is 2 years from the date of injury. You have X days remaining to file." Calculate days remaining from incident_date + 730 days.

**onConfirm:** PATCH task `in_progress` with metadata → PATCH task `completed`. No gatekeeper call — `unlock_next_task` DB trigger handles transition.

**skipReview:** false — show review phase with read-only summary of entered data.

---

## Task 10: PI Demand Letter Step Component

**Files:**
- Create: `src/components/step/personal-injury/pi-demand-letter-step.tsx`

### Component design:

Follow `src/components/step/debt-defense/debt-validation-letter-step.tsx` pattern (StepRunner with AI generation).

**Props:**
```typescript
interface PIDemandLetterStepProps {
  caseId: string
  taskId: string
  existingMetadata?: Record<string, unknown>
  personalInjuryDetails: {
    pi_sub_type?: string
    incident_date?: string
    incident_location?: string
    incident_description?: string
    injury_description?: string
    injury_severity?: string
    medical_providers?: unknown[]
    medical_expenses?: number
    lost_wages?: number
    property_damage_amount?: number
    pain_suffering_multiplier?: number
    your_insurance_carrier?: string
    your_policy_number?: string
  } | null
  caseData: { county: string | null }
}
```

**Form sections (pre-populated from `personalInjuryDetails`):**
1. Your Information — name, address
2. Insurance Information — carrier, policy number, claim number (optional)
3. Defendant/At-Fault Party — name, address
4. Incident Details — date, location, description (pre-filled)
5. Injuries — description, severity (pre-filled)
6. Medical Providers — dynamic list (name, type, dates, amount) (pre-filled from details)
7. Damages — medical expenses total, lost wages, property damage, pain & suffering (auto-calculated: multiplier × medical), total demand amount

**onBeforeReview:** POST to `/api/cases/${caseId}/generate-filing` with `document_type: 'pi_demand_letter'` and assembled facts.

**reviewContent:** `<AnnotatedDraftViewer>` with generated draft.

**onConfirm:** Save metadata + complete task. No gatekeeper call.

---

## Task 11: PI Petition Wizard (Dynamic Steps per Sub-Type)

**Files:**
- Create: `src/components/step/personal-injury-wizard.tsx`

### Component design:

Follow `src/components/step/landlord-tenant-wizard.tsx` and `src/components/step/debt-defense-wizard.tsx` pattern. This is the most complex component.

**Props:**
```typescript
interface PersonalInjuryWizardProps {
  caseId: string
  taskId: string
  existingMetadata?: Record<string, unknown>
  personalInjuryDetails: {
    pi_sub_type?: string
    incident_date?: string
    incident_location?: string
    incident_description?: string
    police_report_filed?: boolean
    police_report_number?: string
    other_driver_name?: string
    other_driver_insurance?: string
    other_driver_policy_number?: string
    your_insurance_carrier?: string
    your_policy_number?: string
    injury_description?: string
    injury_severity?: string
    medical_providers?: unknown[]
    medical_expenses?: number
    lost_wages?: number
    property_damage_amount?: number
    pain_suffering_multiplier?: number
    premises_owner?: string
    product_name?: string
  } | null
  caseData: { county: string | null; court_type: string }
}
```

**Dynamic steps via `getStepsForSubType(subType)`:**

| Step ID | Title | Shown For |
|---------|-------|-----------|
| `preflight` | Before You Start | All |
| `incident` | What Happened | All |
| `other_driver` | Other Driver Info | auto_accident, pedestrian_cyclist, rideshare, uninsured_motorist |
| `premises` | Property/Location Info | slip_and_fall |
| `product` | Product Information | product_liability |
| `injuries` | Your Injuries | All |
| `medical` | Medical Treatment | All |
| `damages` | Your Damages | All |
| `insurance` | Insurance Information | All |
| `venue` | Where to File | All |
| `review` | Review Everything | All |

Step count: auto/pedestrian/rideshare/uninsured = 11, slip_and_fall = 11, product_liability = 11, dog_bite/other = 10.

**Each sub-step is rendered inline** (not separate files — they're simple form sections). Follow the debt-defense-wizard pattern where steps are rendered inside the wizard component with switch/case.

**Key sub-step content:**

- **preflight:** Checklist (photos, medical records, police report, insurance info, bills/receipts). Sub-type-specific tips.
- **incident:** Date, location, description textarea, police report filed (y/n), police report number.
- **other_driver:** Name, insurance carrier, policy number, license plate. Only for auto-related sub-types.
- **premises:** Property owner name, property address, hazard description. Only for slip_and_fall.
- **product:** Product name, manufacturer, purchase date, defect description. Only for product_liability.
- **injuries:** Injury description textarea, severity selector (minor/moderate/severe), body parts affected (multi-select checkboxes).
- **medical:** Dynamic list of medical providers (name, type, dates, cost). Running total.
- **damages:** Medical expenses (auto-summed), lost wages, property damage, pain & suffering (multiplier × medical with 1.5x–5x slider). Running grand total.
- **insurance:** Your insurance carrier, policy number. Other party's insurance if applicable.
- **venue:** County, court type (auto-suggested from total damages — under $20K=JP, $20K-$200K=county, over $200K=district).
- **review:** Read-only summary of all data with edit buttons per section.

**Draft generation:** `buildFacts()` assembles `piPetitionFactsSchema`-compatible object. POST to `/api/cases/${caseId}/generate-filing` with `document_type: 'pi_petition'`.

**Draft phase:** Uses `AnnotatedDraftViewer`.

**onConfirm:** Save metadata + complete task.

---

## Task 12: Educational Steps (7 Components)

**Files:**
- Create: `src/components/step/personal-injury/pi-medical-records-step.tsx`
- Create: `src/components/step/personal-injury/pi-insurance-communication-step.tsx`
- Create: `src/components/step/personal-injury/pi-settlement-negotiation-step.tsx`
- Create: `src/components/step/personal-injury/pi-file-with-court-step.tsx`
- Create: `src/components/step/personal-injury/pi-serve-defendant-step.tsx`
- Create: `src/components/step/personal-injury/pi-trial-prep-step.tsx`
- Create: `src/components/step/personal-injury/pi-post-resolution-step.tsx`

### Pattern:

All follow `src/components/step/debt-defense/debt-file-with-court-step.tsx` pattern:
- StepRunner with `skipReview: true`
- Local `ExpandableSection` inline component (accordion pattern)
- `patchTask('in_progress')` then `patchTask('completed')` on confirm
- No gatekeeper call — DB triggers handle task unlocking

### Content per step:

**`pi-medical-records-step.tsx`** — Title: "Organize Your Medical Records"
- "What medical records to collect" — ER visit records, doctor's notes, imaging (X-ray, MRI), prescriptions, physical therapy records, mental health records if applicable
- "How to request records" — HIPAA authorization form, timeline (30 days), keep copies of all requests
- "Organizing your medical timeline" — Chronological order, link each provider to dates and costs
- "Maximum Medical Improvement (MMI)" — Don't send demand letter until treatment is complete or you've reached MMI

**`pi-insurance-communication-step.tsx`** — Title: "Communicate With Insurance"
- "Filing a claim" — File with your own insurance + the at-fault party's insurance, get claim numbers
- "What to say (and not say) to adjusters" — Stick to facts, don't speculate on fault, don't downplay injuries, don't give recorded statements without preparation
- "Recorded statements — your rights" — You are not required to give a recorded statement to the other party's insurance
- "Common adjuster tactics" — Lowball offers, delaying, requesting unnecessary documentation, disputing treatment
- Warning callout: "Do not accept any settlement before completing medical treatment."

**`pi-settlement-negotiation-step.tsx`** — Title: "Negotiate Your Settlement"
- "Evaluating the offer" — Compare to your demand, consider multiplier range, evaluate strength of evidence
- "Writing a counter-offer" — Respond in writing, reference your demand letter, itemize why their offer is too low
- "When to accept vs. file suit" — If offer is within 70-80% of demand, consider accepting. If insurer denies or lowballs, file suit.
- "Mediation" — Many Texas courts require mediation before trial. Mediator helps negotiate.
- Legal reference: Tex. Ins. Code § 542 (15-day acknowledgment, 15-business-day accept/deny deadlines)

**`pi-file-with-court-step.tsx`** — Title: "File With the Court"
- "How to e-file" — eFileTexas.gov, create account, select court, upload petition
- "Filing fees" — JP Court ~$75, County Court ~$250-350, District Court ~$300-400
- "Which court" — Based on total damages threshold
- SOL warning: "The 2-year statute of limitations (Tex. Civ. Prac. & Rem. Code § 16.003) is a hard deadline. If you miss it, your case is permanently barred."

**`pi-serve-defendant-step.tsx`** — Title: "Serve the Defendant"
- "Methods of service" — Process server, constable, certified mail (JP Court only)
- "Serving an insurance company" — Serve the defendant personally, not the insurance company (unless suing the insurer directly under UM/UIM)
- "Certificate of service" — File proof of service with the court
- "Timeline" — Must serve within 90 days of filing in most Texas courts

**`pi-trial-prep-step.tsx`** — Title: "Prepare for Trial"
- "What to bring" — All medical records, bills, photos, police report, demand letter, any correspondence
- "Presenting damages" — Organize by category, have totals ready, bring copies for judge
- "Direct examination outline" — Tell your story chronologically, focus on how the injury affected your life
- "Cross-examination tips" — Stay calm, answer only what's asked, don't volunteer information

**`pi-post-resolution-step.tsx`** — Title: "After Resolution"
- "If you settled" — Sign release, verify payment timeline (usually 30 days), resolve any medical liens
- "If you won at trial" — Collecting judgment, 5% post-judgment interest (Tex. Fin. Code § 304.003)
- "If you lost" — 30-day window to file motion for new trial, 30 days after that for notice of appeal
- "Tax implications" — Physical injury settlements generally not taxable (IRC § 104(a)(2)), but interest and punitive damages are taxable

---

## Task 13: Wire Step Router (page.tsx Switch Cases)

**Files:**
- Modify: `src/app/(authenticated)/case/[id]/step/[taskId]/page.tsx`

### Changes:

1. Add imports (after the debt defense imports, before the MOTION_CONFIGS import):

```typescript
import { PIIntakeStep } from '@/components/step/personal-injury/pi-intake-step'
import { PIDemandLetterStep } from '@/components/step/personal-injury/pi-demand-letter-step'
import { PersonalInjuryWizard } from '@/components/step/personal-injury-wizard'
import { PIMedicalRecordsStep } from '@/components/step/personal-injury/pi-medical-records-step'
import { PIInsuranceCommunicationStep } from '@/components/step/personal-injury/pi-insurance-communication-step'
import { PISettlementNegotiationStep } from '@/components/step/personal-injury/pi-settlement-negotiation-step'
import { PIFileWithCourtStep } from '@/components/step/personal-injury/pi-file-with-court-step'
import { PIServeDefendantStep } from '@/components/step/personal-injury/pi-serve-defendant-step'
import { PITrialPrepStep } from '@/components/step/personal-injury/pi-trial-prep-step'
import { PIPostResolutionStep } from '@/components/step/personal-injury/pi-post-resolution-step'
```

2. Add 10 switch cases before the `default:` case (after the `debt_post_judgment` case):

```typescript
// Personal injury task chain steps
case 'pi_intake':
  return (
    <PIIntakeStep
      caseId={id}
      taskId={taskId}
      existingMetadata={task.metadata}
    />
  )
case 'pi_medical_records':
  return <PIMedicalRecordsStep caseId={id} taskId={taskId} />
case 'pi_insurance_communication':
  return <PIInsuranceCommunicationStep caseId={id} taskId={taskId} />
case 'prepare_pi_demand_letter': {
  const { data: caseRow } = await supabase
    .from('cases').select('county').eq('id', id).single()
  const { data: piDetails } = await supabase
    .from('personal_injury_details').select('*').eq('case_id', id).maybeSingle()
  return (
    <PIDemandLetterStep
      caseId={id}
      taskId={taskId}
      existingMetadata={task.metadata}
      personalInjuryDetails={piDetails}
      caseData={{ county: caseRow?.county ?? null }}
    />
  )
}
case 'pi_settlement_negotiation':
  return <PISettlementNegotiationStep caseId={id} taskId={taskId} />
case 'prepare_pi_petition': {
  const { data: caseRow } = await supabase
    .from('cases').select('county, court_type').eq('id', id).single()
  const { data: piDetails } = await supabase
    .from('personal_injury_details').select('*').eq('case_id', id).maybeSingle()
  return (
    <PersonalInjuryWizard
      caseId={id}
      taskId={taskId}
      existingMetadata={task.metadata}
      personalInjuryDetails={piDetails}
      caseData={{ county: caseRow?.county ?? null, court_type: caseRow?.court_type ?? 'county' }}
    />
  )
}
case 'pi_file_with_court':
  return <PIFileWithCourtStep caseId={id} taskId={taskId} />
case 'pi_serve_defendant':
  return <PIServeDefendantStep caseId={id} taskId={taskId} />
case 'pi_trial_prep':
  return <PITrialPrepStep caseId={id} taskId={taskId} />
case 'pi_post_resolution':
  return <PIPostResolutionStep caseId={id} taskId={taskId} />
```

---

## Task 14: Build & Test Verification

1. Run all unit tests:
```bash
npx vitest run
```
Expected: All existing tests pass + ~53 new tests pass (pi-demand-letter ~20, pi-petition ~18, pi-settlement ~12, case schema +3).

2. Run build:
```bash
npx next build
```
Expected: Compiles clean, no type errors.

3. Verify all 10 PI switch cases render (not "Coming soon"):
- Each PI task_key maps to a component (no fallthrough to default).

---

## File Summary

| File | Action | Task |
|------|--------|------|
| `supabase/migrations/20260304000001_personal_injury_tables.sql` | Create | T1 |
| `src/lib/schemas/case.ts` | Modify | T2 |
| `tests/unit/schemas/case.test.ts` | Modify | T2 |
| `src/components/cases/wizard/pi-sub-type-step.tsx` | Create | T3 |
| `src/components/cases/new-case-dialog.tsx` | Modify | T3 |
| `src/app/api/cases/route.ts` | Modify | T4 |
| `src/lib/rules/pi-demand-letter-prompts.ts` | Create | T5 |
| `tests/unit/rules/pi-demand-letter-prompts.test.ts` | Create | T5 |
| `src/lib/rules/pi-petition-prompts.ts` | Create | T6 |
| `tests/unit/rules/pi-petition-prompts.test.ts` | Create | T6 |
| `src/lib/rules/pi-settlement-prompts.ts` | Create | T7 |
| `tests/unit/rules/pi-settlement-prompts.test.ts` | Create | T7 |
| `src/app/api/cases/[id]/generate-filing/route.ts` | Modify | T8 |
| `src/components/step/personal-injury/pi-intake-step.tsx` | Create | T9 |
| `src/components/step/personal-injury/pi-demand-letter-step.tsx` | Create | T10 |
| `src/components/step/personal-injury-wizard.tsx` | Create | T11 |
| `src/components/step/personal-injury/pi-medical-records-step.tsx` | Create | T12 |
| `src/components/step/personal-injury/pi-insurance-communication-step.tsx` | Create | T12 |
| `src/components/step/personal-injury/pi-settlement-negotiation-step.tsx` | Create | T12 |
| `src/components/step/personal-injury/pi-file-with-court-step.tsx` | Create | T12 |
| `src/components/step/personal-injury/pi-serve-defendant-step.tsx` | Create | T12 |
| `src/components/step/personal-injury/pi-trial-prep-step.tsx` | Create | T12 |
| `src/components/step/personal-injury/pi-post-resolution-step.tsx` | Create | T12 |
| `src/app/(authenticated)/case/[id]/step/[taskId]/page.tsx` | Modify | T13 |

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| Incident date > 2 years ago | SOL warning, schema still accepts |
| Incident date > 18 months ago | Amber warning with days remaining |
| $0 medical expenses | Pain & suffering = $0, calculator works |
| Slip & fall sub-type | Premises step shown, other_driver hidden |
| Product liability | Product step shown, strict liability theory |
| Dog bite | No conditional step, 10-step wizard |
| Settlement amount = $0 | Schema rejects — must be positive |
| PI with federal court | Not supported — schema rejects `'federal'` |
| Defendant role + PI | Not supported — wizard forces plaintiff role |
