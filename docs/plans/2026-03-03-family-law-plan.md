# Family Law Module Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Add comprehensive family law support for 7 sub-types (divorce, custody, child support, visitation, spousal support, protective orders, modification) with tailored wizard flows, Texas-specific filing prompts, interactive child support calculator, safety module, and family-specific motions.

**Architecture:** New `FamilyLawWizard` component using the existing `WizardShell` infrastructure. Family sub-type selection added to case creation dialog. Separate `family_case_details` table stores children, marriage, and property data. Family-specific filing prompts reference Texas Family Code. Child support calculator uses Ch. 154 guidelines. Safety module for protective orders includes screening, resources, and digital safety warnings. 5 new motion configs for family law. Task seeding branches on `dispute_type = 'family'`.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui, Supabase, Anthropic Claude API, Zod, vitest

---

## Task 1: Database Migration — family_case_details + family task seeding

**Files:**
- Create: `supabase/migrations/20260303000005_family_law_tables.sql`

**Migration creates:**

```sql
-- Family case details table
CREATE TABLE IF NOT EXISTS public.family_case_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  family_sub_type text NOT NULL CHECK (family_sub_type IN (
    'divorce', 'custody', 'child_support', 'visitation',
    'spousal_support', 'protective_order', 'modification'
  )),
  -- Marriage info
  marriage_date date,
  separation_date date,
  marriage_county text,
  marriage_state text DEFAULT 'Texas',
  -- Children (JSONB array)
  children jsonb DEFAULT '[]'::jsonb,
  -- Property
  community_property_exists boolean DEFAULT false,
  property_description text,
  -- Safety
  domestic_violence_flag boolean DEFAULT false,
  -- Military
  military_involvement boolean DEFAULT false,
  -- Existing orders
  existing_court_orders boolean DEFAULT false,
  existing_order_court text,
  existing_order_cause_number text,
  -- Custody preferences
  custody_arrangement_sought text CHECK (custody_arrangement_sought IN (
    'joint_managing', 'sole_managing', 'possessory', NULL
  )),
  -- Support
  child_support_amount numeric(10,2),
  spousal_support_amount numeric(10,2),
  spousal_support_duration_months integer,
  -- Residency (for divorce venue)
  petitioner_county_months integer,
  petitioner_state_months integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(case_id)
);

ALTER TABLE public.family_case_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own family details"
  ON public.family_case_details
  FOR ALL
  USING (
    case_id IN (SELECT id FROM public.cases WHERE user_id = auth.uid())
  );

-- RLS index
CREATE INDEX idx_family_case_details_case_id ON public.family_case_details(case_id);
```

**Modify `seed_case_tasks()`** — add family branch. When `NEW.dispute_type = 'family'`, seed family-specific tasks INSTEAD of civil litigation tasks:

```sql
-- Inside seed_case_tasks(), after the case_created event, add:
IF NEW.dispute_type = 'family' THEN
  -- Family-specific task chain
  INSERT INTO public.tasks (case_id, task_key, title, status, unlocked_at)
  VALUES (NEW.id, 'welcome', 'Welcome — Get Started', 'todo', now());

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'family_intake', 'Tell Us About Your Family Matter', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'safety_screening', 'Safety Check', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'evidence_vault', 'Organize Your Evidence', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'prepare_family_filing', 'Prepare Your Family Court Filing', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'file_with_court', 'File With the Court', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'upload_return_of_service', 'Upload Return of Service', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'confirm_service_facts', 'Confirm Service Details', 'locked');

  -- Family-specific gatekeeper-managed tasks
  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'waiting_period', 'Mandatory Waiting Period', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'temporary_orders', 'Request Temporary Orders', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'mediation', 'Attend Mediation', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'final_orders', 'Final Orders', 'locked');

  RETURN NEW;
END IF;

-- Existing civil litigation task seeding follows (no change)
```

**Modify `unlock_next_task()`** — add family chain:

```sql
-- Family law unlock chain
-- welcome → family_intake
IF NEW.task_key = 'welcome' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
  UPDATE public.tasks SET status = 'todo', unlocked_at = now()
  WHERE case_id = NEW.case_id AND task_key = 'family_intake' AND status = 'locked';
END IF;

-- family_intake → safety_screening
IF NEW.task_key = 'family_intake' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
  UPDATE public.tasks SET status = 'todo', unlocked_at = now()
  WHERE case_id = NEW.case_id AND task_key = 'safety_screening' AND status = 'locked';
END IF;

-- safety_screening → evidence_vault
IF NEW.task_key = 'safety_screening' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
  UPDATE public.tasks SET status = 'todo', unlocked_at = now()
  WHERE case_id = NEW.case_id AND task_key = 'evidence_vault' AND status = 'locked';
END IF;

-- evidence_vault → prepare_family_filing (family path)
-- Note: existing evidence_vault → preservation_letter chain only fires
-- if preservation_letter task exists. Family cases won't have it.
IF NEW.task_key = 'evidence_vault' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
  UPDATE public.tasks SET status = 'todo', unlocked_at = now()
  WHERE case_id = NEW.case_id AND task_key = 'prepare_family_filing' AND status = 'locked';
END IF;

-- prepare_family_filing → file_with_court (reuse existing)
IF NEW.task_key = 'prepare_family_filing' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
  UPDATE public.tasks SET status = 'todo', unlocked_at = now()
  WHERE case_id = NEW.case_id AND task_key = 'file_with_court' AND status = 'locked';
END IF;

-- file_with_court → upload_return_of_service (already exists)

-- confirm_service_facts → waiting_period (for divorce, 60 days)
IF NEW.task_key = 'confirm_service_facts' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
  UPDATE public.tasks SET status = 'todo', unlocked_at = now()
  WHERE case_id = NEW.case_id AND task_key = 'waiting_period' AND status = 'locked';
END IF;

-- waiting_period → temporary_orders
IF NEW.task_key = 'waiting_period' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
  UPDATE public.tasks SET status = 'todo', unlocked_at = now()
  WHERE case_id = NEW.case_id AND task_key = 'temporary_orders' AND status = 'locked';
END IF;

-- temporary_orders → mediation
IF NEW.task_key = 'temporary_orders' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
  UPDATE public.tasks SET status = 'todo', unlocked_at = now()
  WHERE case_id = NEW.case_id AND task_key = 'mediation' AND status = 'locked';
END IF;

-- mediation → final_orders
IF NEW.task_key = 'mediation' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
  UPDATE public.tasks SET status = 'todo', unlocked_at = now()
  WHERE case_id = NEW.case_id AND task_key = 'final_orders' AND status = 'locked';
END IF;
```

---

## Task 2: Family Sub-Type Selection + Case Schema Updates

**Files:**
- Create: `src/components/cases/wizard/family-sub-type-step.tsx`
- Modify: `src/components/cases/new-case-dialog.tsx` — add family sub-type step, skip amount/circumstances for family
- Modify: `src/lib/schemas/case.ts` — add `family_sub_type` field
- Modify: `src/app/api/cases/route.ts` — insert into `family_case_details` after case creation

### FamilySubTypeStep Component

```typescript
// src/components/cases/wizard/family-sub-type-step.tsx
'use client'

export type FamilySubType =
  | 'divorce' | 'custody' | 'child_support' | 'visitation'
  | 'spousal_support' | 'protective_order' | 'modification'

interface FamilySubTypeStepProps {
  value: FamilySubType | ''
  onSelect: (subType: FamilySubType) => void
}
```

**Options (clickable cards like dispute-type-step):**
1. **Divorce** (icon: Unlink) — "I want to end my marriage"
2. **Child Custody** (icon: Users) — "I need a custody arrangement for my children"
3. **Child Support** (icon: DollarSign) — "I need child support established or enforced"
4. **Visitation** (icon: Calendar) — "I need a visitation/possession schedule"
5. **Spousal Support** (icon: Heart) — "I need spousal maintenance (alimony)"
6. **Protective Order** (icon: Shield) — "I need protection from domestic violence or abuse"
   - Amber safety banner below: "If you are in immediate danger, call 911. National DV Hotline: 1-800-799-7233"
7. **Modification** (icon: RefreshCw) — "I need to change an existing court order"

### NewCaseDialog Changes

When `disputeType === 'family'`:
- After step 2 (dispute type), insert step 2.5: FamilySubTypeStep
- Skip step 3 (amount — irrelevant for family, always District Court)
- Skip step 4 (circumstances — replace with family-relevant info later in wizard)
- Go directly to step 5 (recommendation — always District Court for family)
- Send `family_sub_type` in the POST body

Update `TOTAL_STEPS` logic to be dynamic: `state.disputeType === 'family' ? 4 : 5`

Update `handleAccept` to include `family_sub_type` in the request body.

### Schema Changes

Add to `createCaseSchema` in `src/lib/schemas/case.ts`:
```typescript
family_sub_type: z.enum([
  'divorce', 'custody', 'child_support', 'visitation',
  'spousal_support', 'protective_order', 'modification',
]).optional(),
```

### API Route Changes

In `POST /api/cases`, after creating the case, if `family_sub_type` is provided:
```typescript
if (parsed.data.family_sub_type) {
  await supabase!.from('family_case_details').insert({
    case_id: newCase.id,
    family_sub_type: parsed.data.family_sub_type,
    domestic_violence_flag: parsed.data.family_sub_type === 'protective_order',
  })
}
```

---

## Task 3: Texas Child Support Calculator (TDD)

**Files:**
- Create: `src/lib/family/child-support-calculator.ts`
- Create: `tests/unit/family/child-support-calculator.test.ts`

### Calculator Function

```typescript
export interface ChildSupportInput {
  grossMonthlyIncome: number
  federalTax: number        // monthly
  stateTax: number           // monthly
  socialSecurity: number     // monthly
  healthInsurance: number    // monthly for child
  unionDues: number          // monthly
  numberOfChildren: number   // with this other parent
  otherChildrenCount: number // children with other relationships
}

export interface ChildSupportResult {
  netMonthlyResources: number
  guidelinePercentage: number
  guidelineAmount: number
  adjustedForOtherChildren: number | null
  cappedAmount: number | null  // if net > $9,200 cap
  finalAmount: number
  breakdown: {
    grossIncome: number
    totalDeductions: number
    netResources: number
    percentage: number
    amount: number
  }
}

export function calculateChildSupport(input: ChildSupportInput): ChildSupportResult
```

**Texas Family Code Ch. 154 formula:**
- Net resources = gross - (federal tax + state tax + SS + health insurance + union dues)
- Percentage: 1 child = 20%, 2 = 25%, 3 = 30%, 4 = 35%, 5+ = 40% (not less than max of 5)
- Cap: guideline percentage applies to first $9,200/month of net resources
- Other children offset: reduce percentage per table in § 154.129

**Other children offset table (§ 154.129):**
- 1 child before court + 1 other = 17.5%, + 2 other = 16%, + 3 other = 14.75%, + 4 other = 13.33%, + 5+ other = 12.5%
- 2 children before court + 1 other = 22.5%, + 2 other = 20.63%, + 3 other = 19%, etc.
- (Full table for all combinations)

**Tests (16):**
- Basic: 1 child, no deductions, under cap
- With deductions: correct net resources calculation
- Percentage for 1-5+ children
- Cap applied when net > $9,200
- Other children offset applied correctly
- Zero income returns zero
- Multiple children with other children offset
- Edge: exactly at cap boundary
- Edge: 0 children throws or returns 0

---

## Task 4: Family Venue Rules (TDD)

**Files:**
- Modify: `src/lib/rules/venue-helper.ts` — add family venue rules
- Modify: `tests/unit/rules/venue-helper.test.ts` — add family venue tests

### New Venue Rules

Add to `recommendVenue()`:

```typescript
// Family law venue rules (check before default)
case 'family': {
  // Need to know family sub-type for proper venue
  // For now, use petitioner's county (domicile rule)
  if (defendantCounty) {
    return {
      recommended_county: defendantCounty,
      explanation: `File in ${defendantCounty} County. For divorce, you must have lived in this county for at least 90 days and in Texas for at least 6 months.`,
      alternativeNote: incidentCounty && incidentCounty !== defendantCounty
        ? `If your children primarily live in ${incidentCounty} County, you may need to file there for custody matters.`
        : undefined,
      rule_citation: 'Tex. Fam. Code § 6.301 (divorce); § 103.001 (SAPCR)',
    }
  }
  return {
    recommended_county: null,
    explanation: 'For divorce, file in the county where you have lived for at least 90 days. For custody, file in the county where the child has lived for 6 months.',
    rule_citation: 'Tex. Fam. Code § 6.301; § 103.001',
  }
}
```

**New tests (5):**
- Family returns petitioner's county with domicile explanation
- Family includes SAPCR alternative note when incident county differs
- Family returns null with explanation when no county provided
- Family citation references Family Code (not Civ. Prac.)
- Family mentions 90-day/6-month residency requirements

---

## Task 5: Family Law Filing Prompts (TDD)

**Files:**
- Create: `src/lib/rules/family-filing-prompts.ts`
- Create: `tests/unit/rules/family-filing-prompts.test.ts`
- Create: `src/lib/schemas/family-filing.ts`

### Schema

```typescript
// src/lib/schemas/family-filing.ts
import { z } from 'zod'
import { partySchema } from './filing'

export const childSchema = z.object({
  name: z.string().min(1),
  date_of_birth: z.string().min(1),
  age: z.number().optional(),
  relationship: z.enum(['biological', 'adopted', 'step']).default('biological'),
})

export const familyFilingFactsSchema = z.object({
  // Parties
  petitioner: partySchema,
  respondent: partySchema,

  // Court
  court_type: z.literal('district'),
  county: z.string().min(1),
  cause_number: z.string().optional(),

  // Sub-type
  family_sub_type: z.enum([
    'divorce', 'custody', 'child_support', 'visitation',
    'spousal_support', 'protective_order', 'modification',
  ]),

  // Marriage (divorce/spousal)
  marriage_date: z.string().optional(),
  separation_date: z.string().optional(),

  // Children
  children: z.array(childSchema).default([]),

  // Facts
  grounds: z.string().min(10),
  additional_facts: z.string().optional(),

  // Custody
  custody_arrangement_sought: z.enum([
    'joint_managing', 'sole_managing', 'possessory',
  ]).optional(),
  custody_reasoning: z.string().optional(),

  // Support
  child_support_amount: z.number().optional(),
  spousal_support_amount: z.number().optional(),
  spousal_support_duration_months: z.number().optional(),

  // Property (divorce)
  community_property_exists: z.boolean().default(false),
  property_description: z.string().optional(),

  // Protective order
  domestic_violence_description: z.string().optional(),
  protective_order_requests: z.array(z.string()).optional(),

  // Modification
  existing_order_court: z.string().optional(),
  existing_order_cause_number: z.string().optional(),
  modification_reason: z.string().optional(),

  // Residency
  petitioner_county_months: z.number().optional(),
  petitioner_state_months: z.number().optional(),

  // Military
  military_involvement: z.boolean().default(false),
})

export type FamilyFilingFacts = z.infer<typeof familyFilingFactsSchema>
```

### Prompt Builder

```typescript
// src/lib/rules/family-filing-prompts.ts

export function buildFamilyFilingPrompt(facts: FamilyFilingFacts): { system: string; user: string }
```

**System prompt:** Same "legal document formatting assistant" preamble as civil. Document format varies by sub-type:

- **Divorce**: "ORIGINAL PETITION FOR DIVORCE" — Texas Family Code Ch. 6. Includes: case style, discovery control plan, parties & residency (§ 6.301), marriage info, grounds (insupportability § 6.001 or fault-based), children section (if any — UCCJEA affidavit, conservatorship, possession, support), property division (community vs separate), spousal maintenance (if sought), prayer, verification, signature block "Pro Se"
- **Custody (SAPCR)**: "ORIGINAL PETITION IN SUIT AFFECTING THE PARENT-CHILD RELATIONSHIP" — Ch. 102. UCCJEA affidavit, child info, standing, conservatorship request, standard possession order, child support, health insurance
- **Child Support**: Petition for child support — Ch. 154. Income info, guideline calculation, health insurance, withholding order
- **Visitation**: Petition for access and possession — standard possession order (§ 153.312-317) or modified schedule
- **Spousal Support**: Petition for Spousal Maintenance — Ch. 8. Eligibility (§ 8.051), duration limits (§ 8.054), amount caps
- **Protective Order**: Application for Protective Order — Ch. 85. Description of family violence (§ 71.004), specific relief requested (stay-away, exclusive possession, custody), duration (up to 2 years)
- **Modification**: Petition to Modify — Ch. 156. Material & substantial change in circumstances, best interest of child, existing order details

**User prompt:** Structured sections: PARTIES, COURT, MARRIAGE (if applicable), CHILDREN (if applicable), GROUNDS/FACTS, CUSTODY (if applicable), SUPPORT (if applicable), PROPERTY (if applicable), PROTECTIVE ORDER REQUESTS (if applicable), EXISTING ORDER (if modification), RESIDENCY

After the document, include `---ANNOTATIONS---` section (same format as civil filing prompts).

**Tests (14):**
- Each sub-type produces correct document title
- Divorce includes residency requirements
- SAPCR includes UCCJEA affidavit requirement
- Protective order includes violence description
- Modification includes existing order reference
- Child support includes guideline calculation
- Spousal support includes Ch. 8 eligibility
- Includes DRAFT disclaimer
- Uses Petitioner/Respondent (not Plaintiff/Defendant)
- Schema validates correctly / rejects invalid

---

## Task 6: Safety Module

**Files:**
- Create: `src/components/step/family/safety-screening-step.tsx`
- Create: `src/components/step/family/safety-resources.tsx`

### SafetyScreeningStep

A step component for the `safety_screening` task. Uses StepRunner.

**Content:**
- Digital safety warning at top (amber): "Safety notice: If you share a device with the person you need protection from, consider using a different device or clearing your browser history after each session."
- Emergency resources card (red border): National DV Hotline 1-800-799-7233, Texas Council on Family Violence 1-800-525-1978, Text "START" to 88788
- Three yes/no screening questions (checkboxes):
  1. "Has the other person physically hurt you, your children, or threatened to?"
  2. "Are you afraid of the other person?"
  3. "Has the other person destroyed your property or harmed your pets?"
- If ANY checked: show recommendation card (indigo): "Based on your answers, you may want to consider filing for a Protective Order. This can provide immediate legal protection." + "You can still proceed with your current filing type."
- Safety planning checklist (expandable):
  - Keep important documents in a safe location outside the home
  - Set up a separate email account the other person doesn't know about
  - Save evidence of threats or violence (screenshots, photos, medical records)
  - Know where your local shelter is (link to Texas DV shelters)
  - Have an exit plan if you need to leave quickly
- `skipReview: true` — simple confirmation step
- `onConfirm`: mark task completed, save screening results to task metadata

### SafetyResources Component

A reusable banner that can be shown on any family law page.

```typescript
interface SafetyResourcesProps {
  compact?: boolean  // Small single-line version for headers
}
```

Shows emergency numbers and hotline. Compact mode shows just the hotline number as a small banner.

---

## Task 7: Family Law Wizard Steps

**Files:**
- Create: `src/components/step/family-wizard-steps/marriage-step.tsx`
- Create: `src/components/step/family-wizard-steps/children-step.tsx`
- Create: `src/components/step/family-wizard-steps/custody-step.tsx`
- Create: `src/components/step/family-wizard-steps/property-step.tsx`
- Create: `src/components/step/family-wizard-steps/child-support-step.tsx`
- Create: `src/components/step/family-wizard-steps/spousal-support-step.tsx`
- Create: `src/components/step/family-wizard-steps/existing-orders-step.tsx`
- Create: `src/components/step/family-wizard-steps/family-grounds-step.tsx`
- Create: `src/components/step/family-wizard-steps/family-parties-step.tsx`
- Create: `src/components/step/family-wizard-steps/family-venue-step.tsx`
- Create: `src/components/step/family-wizard-steps/family-review-step.tsx`
- Create: `src/components/step/family-wizard-steps/family-preflight.tsx`

### FamilyPartiesStep
Same as civil PartiesStep but with Petitioner/Respondent terminology:
- "What is your full legal name?" (label: "Petitioner")
- "What is the other person's full legal name?" (label: "Respondent")
- HelpTooltip: "In family law cases, the person filing is called the 'Petitioner' and the other person is the 'Respondent.'"

### MarriageStep (divorce & spousal support only)
- "When did you get married?" — date input
- "When did you separate?" — date input (optional)
- "Where did you get married?" — county + state inputs
- HelpTooltip: "The exact date of marriage is required for the petition. If you don't remember, check your marriage certificate."
- Residency questions:
  - "How many months have you lived in this county?" — number input
  - "How many months have you lived in Texas?" — number input
  - Validation warning if county < 90 days or state < 6 months: "Texas requires you to live in the county for at least 90 days and in Texas for at least 6 months to file for divorce."

### ChildrenStep (divorce, custody, support, visitation, modification)
- Dynamic list of children (add/remove):
  - "Child's full legal name" — text input
  - "Date of birth" — date input
  - "Relationship" — select: biological, adopted, step-child
- HelpTooltip: "List all children of this relationship. This includes biological children, adopted children, and children born during the marriage."
- If no children and sub_type is custody/support/visitation: warning that children are required

### CustodyStep (divorce, custody, visitation, modification)
- "What custody arrangement are you asking for?" — radio cards:
  - **Joint Managing Conservators** (Recommended) — "Both parents share rights and duties. This is the most common arrangement in Texas."
  - **Sole Managing Conservator** — "One parent has primary decision-making authority. Usually granted when the other parent is unfit or there is family violence."
  - **Possessory Conservator** — "The other parent gets limited visitation rights."
- "Why do you believe this arrangement is best for the children?" — textarea
- HelpTooltip: "Texas law presumes that appointing both parents as Joint Managing Conservators is in the child's best interest, unless there is evidence of family violence or abuse."
- Standard Possession Order info card (indigo): explains the default visitation schedule under § 153.312

### PropertyStep (divorce only)
- "Do you and your spouse have property to divide?" — checkbox
- If yes:
  - "Describe the community property" — textarea (real estate, vehicles, bank accounts, retirement, debts)
  - HelpTooltip: "Community property is everything acquired during the marriage. Separate property is what you owned before marriage or received as a gift or inheritance."
  - Indigo info card: "Texas is a community property state. The court will divide community property in a way that is 'just and right.'"

### ChildSupportStep (divorce, custody, support, modification)
- Integrates the child support calculator from Task 3
- Input fields for obligor income and deductions
- Shows calculated guideline amount with breakdown
- "Do you agree with the guideline amount, or do you want to request a different amount?" — radio
  - Guideline amount (recommended)
  - Different amount — text input with reasoning textarea
- HelpTooltip explaining the Texas child support guidelines

### SpousalSupportStep (divorce, spousal_support, modification)
- "Are you requesting spousal maintenance?" — checkbox
- If yes:
  - "Monthly amount requested" — number input
  - "Duration requested (months)" — number input
  - Indigo info card: eligibility requirements under § 8.051 (marriage 10+ years, unable to earn enough, DV, disability)
  - Maximum duration table: 10-20 years marriage = 5 years, 20-30 years = 7 years, 30+ years = 10 years
  - Maximum amount: lesser of $5,000/month or 20% of obligor's gross income
  - HelpTooltip explaining eligibility

### ExistingOrdersStep (modification only)
- "What court issued the original order?" — text input
- "Cause number of the original case" — text input
- "What do you want to change?" — checkboxes: custody, visitation, child support, spousal support
- "Why has the situation changed?" — textarea
  - HelpTooltip: "To modify a court order, you must show a 'material and substantial change in circumstances.' This means something significant has changed since the last order."
  - Examples: job loss, relocation, child's needs changed, safety concerns

### FamilyGroundsStep (all sub-types)
Sub-type specific prompts:
- **Divorce grounds:** "Why are you seeking a divorce?" — radio: "Insupportability (no-fault)" (recommended, most common), "Cruelty", "Adultery", "Conviction of felony", "Abandonment", "Living apart 3+ years", "Confinement in mental hospital"
  - If insupportability: no additional detail needed
  - If fault-based: textarea for description
- **Custody/Visitation:** "Why are you seeking this custody/visitation arrangement?" — textarea
- **Support:** "Why is support needed?" — textarea
- **Protective order:** "Describe the violence or threats" — textarea with safety-aware prompt
- **Modification:** "What has changed since the last order?" — textarea

### FamilyVenueStep
Similar to civil VenueStep but with family-specific venue rules:
- For divorce: "What county have you been living in?" + residency validation
- For custody: "What county have the children been living in for the past 6 months?"
- For protective order: "What county do you live in?"
- For modification: "What court issued the original order?" (continuing jurisdiction)
- Uses updated `recommendVenue()` from Task 4

### FamilyPreflight
Similar to civil PreflightChecklist but family-specific items:
- Marriage certificate (divorce/spousal)
- Children's birth certificates (custody/support/visitation)
- Income documentation (support calculator)
- Existing court orders (modification)
- Evidence of violence (protective order)
- Property/financial records (divorce)
- Residency documentation (all)

### FamilyReviewStep
Summary of all collected information with Edit links per section. Government entity not relevant. Shows safety warning if DV flag is set.

---

## Task 8: Family Law Wizard Orchestrator

**Files:**
- Create: `src/components/step/family-law-wizard.tsx`
- Modify: `src/app/(authenticated)/case/[id]/step/[taskId]/page.tsx` — add `case 'prepare_family_filing'`

### FamilyLawWizard Component

```typescript
interface FamilyLawWizardProps {
  caseId: string
  taskId: string
  existingMetadata?: Record<string, unknown>
  familyDetails: {
    family_sub_type: string
    children: unknown[]
    marriage_date: string | null
    separation_date: string | null
    community_property_exists: boolean
    domestic_violence_flag: boolean
    military_involvement: boolean
    custody_arrangement_sought: string | null
    existing_court_orders: boolean
    petitioner_county_months: number | null
    petitioner_state_months: number | null
  } | null
  caseData: { county: string | null }
}
```

**Dynamic step generation based on family_sub_type:**

```typescript
function getStepsForSubType(subType: string): WizardStep[] {
  const common = [
    { id: 'preflight', title: 'Before You Start', subtitle: "Let's make sure you have what you need." },
    { id: 'parties', title: 'Who Is Involved?', subtitle: 'Tell us about yourself and the other person.' },
  ]

  const subTypeSteps: Record<string, WizardStep[]> = {
    divorce: [
      { id: 'marriage', title: 'About Your Marriage', subtitle: 'Tell us about your marriage.' },
      { id: 'children', title: 'Children', subtitle: 'Tell us about any children.' },
      { id: 'venue', title: 'Where to File', subtitle: "We'll determine the right county." },
      { id: 'grounds', title: 'Grounds for Divorce', subtitle: 'Why are you seeking a divorce?' },
      { id: 'custody', title: 'Custody Arrangement', subtitle: 'What custody arrangement do you want?' },
      { id: 'support', title: 'Child Support', subtitle: 'Calculate child support.' },
      { id: 'spousal', title: 'Spousal Maintenance', subtitle: 'Do you need spousal support?' },
      { id: 'property', title: 'Property Division', subtitle: 'Divide community property.' },
    ],
    custody: [
      { id: 'children', title: 'Your Children', ... },
      { id: 'venue', ... },
      { id: 'grounds', ... },
      { id: 'custody', ... },
      { id: 'support', ... },
    ],
    // ... similar for other sub-types
  }

  return [...common, ...(subTypeSteps[subType] ?? []), { id: 'review', title: 'Review Everything', ... }]
}
```

**API integration:**
- `onComplete` generates draft via `POST /api/cases/${caseId}/generate-filing` with `document_type: 'family_${subType}'` and family filing facts
- Uses `AnnotatedDraftViewer` for review
- `onConfirm` saves metadata and completes task
- `onSave` saves to task metadata for resume

**Step page router change:**
```typescript
case 'prepare_family_filing': {
  const { data: familyDetails } = await supabase
    .from('family_case_details')
    .select('*')
    .eq('case_id', id)
    .maybeSingle()

  const { data: caseRow } = await supabase
    .from('cases')
    .select('county')
    .eq('id', id)
    .single()

  return (
    <FamilyLawWizard
      caseId={id}
      taskId={taskId}
      existingMetadata={task.metadata}
      familyDetails={familyDetails}
      caseData={caseRow ?? { county: null }}
    />
  )
}
```

Also add `family_intake` and `safety_screening` cases. Family intake uses the existing IntakeStep pattern but with family-specific fields. Safety screening uses the SafetyScreeningStep from Task 6.

---

## Task 9: Family Law Motions

**Files:**
- Create: `src/lib/motions/configs/temporary-orders.ts`
- Create: `src/lib/motions/configs/protective-order.ts`
- Create: `src/lib/motions/configs/motion-to-modify.ts`
- Create: `src/lib/motions/configs/motion-for-enforcement.ts`
- Create: `src/lib/motions/configs/motion-for-mediation.ts`
- Modify: `src/lib/motions/types.ts` — add `'family'` category
- Modify: `src/lib/motions/registry.ts` — register 5 new configs
- Modify: `src/app/api/cases/[id]/generate-filing/route.ts` — add family motion entries to MOTION_REGISTRY

### Motion Category

Add `'family'` to `MotionCategory`:
```typescript
export type MotionCategory = 'discovery' | 'pretrial' | 'trial' | 'post_trial' | 'family'
```

### 5 Motion Configs (each follows the same pattern as motion-to-compel.ts):

1. **Temporary Orders** — Motion for Temporary Orders (custody, support, property restraints). Fields: parties, children, requested custody, requested support, requested property restraints. Prompt references Texas Family Code § 105.001.

2. **Protective Order** — Application for Protective Order. Fields: parties, description of violence, requested protections (stay-away distance, exclusive possession, custody, firearm surrender). Prompt references Ch. 85.

3. **Motion to Modify** — Petition to Modify Existing Order. Fields: parties, existing order details (court, cause number), what to modify, material change in circumstances. References Ch. 156.

4. **Motion for Enforcement** — Motion for Enforcement of Court Order. Fields: parties, order being violated, specific violations, requested relief (contempt, make-up time, attorney fees). References Ch. 157.

5. **Motion for Mediation** — Motion to Refer to Mediation. Fields: parties, issues for mediation, preferred mediator/service. References § 153.0071.

Each config has: `key`, `title`, `description`, `reassurance`, `category: 'family'`, `fields[]`, `schema` (Zod), `buildPrompt()`, `documentType`.

---

## Task 10: Wire Generate-Filing Route for Family

**Files:**
- Modify: `src/app/api/cases/[id]/generate-filing/route.ts` — add family filing entries to MOTION_REGISTRY

Add family sub-type entries to `MOTION_REGISTRY`:
```typescript
import { familyFilingFactsSchema, buildFamilyFilingPrompt } from '@/lib/rules/family-filing-prompts'

// Family filing types — each sub-type routes through the same schema/prompt builder
for (const subType of ['divorce', 'custody', 'child_support', 'visitation', 'spousal_support', 'protective_order', 'modification']) {
  MOTION_REGISTRY[`family_${subType}`] = {
    schema: familyFilingFactsSchema,
    buildPrompt: buildFamilyFilingPrompt as unknown as RegistryEntry['buildPrompt'],
  }
}
```

Also add the 5 family motion schemas/prompts to the registry.

---

## Task 11: Family Intake Step + Waiting Period Step

**Files:**
- Create: `src/components/step/family/family-intake-step.tsx`
- Create: `src/components/step/family/waiting-period-step.tsx`
- Create: `src/components/step/family/temporary-orders-step.tsx`
- Create: `src/components/step/family/mediation-step.tsx`
- Create: `src/components/step/family/final-orders-step.tsx`

### FamilyIntakeStep
Similar to IntakeStep but collects family-specific info:
- Family sub-type display (read-only, from family_case_details)
- County input (with family venue guidance)
- Brief narrative of the situation
- Military involvement checkbox
- Saves to task metadata and updates family_case_details

### WaitingPeriodStep (divorce only)
Educational step explaining the 60-day mandatory waiting period:
- "Texas requires a 60-day waiting period after filing for divorce before the court can grant it."
- Calendar display showing: filing date + 60 days = earliest final hearing date
- Checklist of what to do during waiting period
- `skipReview: true` — simple confirmation

### TemporaryOrdersStep
Educational expandable sections explaining temporary orders:
- What temporary orders are and when to request them
- Types: temporary custody, temporary support, property restraints
- Link to the temporary orders motion (from Task 9)
- Can skip if not needed

### MediationStep
Educational step about mediation:
- What mediation is and how it works
- When it's required (most Texas family courts require it)
- How to find a mediator
- What to prepare for mediation
- Can skip if already completed or not required

### FinalOrdersStep
Educational step about final orders:
- What happens at the final hearing
- What documents to bring
- How to prepare
- Agreed vs. contested final orders

---

## Task 12: Wire Step Router + Build Verification

**Files:**
- Modify: `src/app/(authenticated)/case/[id]/step/[taskId]/page.tsx` — add all family task cases
- Verify: `npx next build` passes
- Verify: `npx vitest run` passes

### Step Router Cases to Add

```typescript
case 'family_intake':
  return <FamilyIntakeStep caseId={id} taskId={taskId} existingMetadata={task.metadata} />

case 'safety_screening':
  return <SafetyScreeningStep caseId={id} taskId={taskId} />

case 'prepare_family_filing': {
  // (from Task 8)
}

case 'waiting_period':
  return <WaitingPeriodStep caseId={id} taskId={taskId} />

case 'temporary_orders':
  return <TemporaryOrdersStep caseId={id} taskId={taskId} />

case 'mediation':
  return <MediationStep caseId={id} taskId={taskId} />

case 'final_orders':
  return <FinalOrdersStep caseId={id} taskId={taskId} />
```

Also add family motions to the motion builder switch cases.

### Build Verification
1. `npx vitest run` — all tests pass (including new child-support-calculator + family-venue + family-filing-prompt tests)
2. `npx next build` — no type errors
3. Verify family sub-type selection in new case dialog
4. Verify family task chain seeds correctly for family cases
5. Verify family wizard renders with correct steps per sub-type

---

## File Summary

| File | Action | Task |
|------|--------|------|
| `supabase/migrations/20260303000005_family_law_tables.sql` | Create | 1 |
| `src/components/cases/wizard/family-sub-type-step.tsx` | Create | 2 |
| `src/components/cases/new-case-dialog.tsx` | Modify | 2 |
| `src/lib/schemas/case.ts` | Modify | 2 |
| `src/app/api/cases/route.ts` | Modify | 2 |
| `src/lib/family/child-support-calculator.ts` | Create | 3 |
| `tests/unit/family/child-support-calculator.test.ts` | Create | 3 |
| `src/lib/rules/venue-helper.ts` | Modify | 4 |
| `tests/unit/rules/venue-helper.test.ts` | Modify | 4 |
| `src/lib/rules/family-filing-prompts.ts` | Create | 5 |
| `tests/unit/rules/family-filing-prompts.test.ts` | Create | 5 |
| `src/lib/schemas/family-filing.ts` | Create | 5 |
| `src/components/step/family/safety-screening-step.tsx` | Create | 6 |
| `src/components/step/family/safety-resources.tsx` | Create | 6 |
| 12 family wizard step files | Create | 7 |
| `src/components/step/family-law-wizard.tsx` | Create | 8 |
| 5 family motion config files | Create | 9 |
| `src/lib/motions/types.ts` | Modify | 9 |
| `src/lib/motions/registry.ts` | Modify | 9 |
| `src/app/api/cases/[id]/generate-filing/route.ts` | Modify | 10 |
| 5 family step files | Create | 11 |
| `src/app/(authenticated)/case/[id]/step/[taskId]/page.tsx` | Modify | 12 |

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| Protective order selected | Safety screening mandatory, DV flag auto-set |
| Divorce with no children | Skip children, custody, child support steps |
| Modification without existing order | Validation catches missing order details |
| County residency < 90 days | Warning but not blocking (user may be mistaken about dates) |
| Child support at income cap | Calculator applies cap and shows breakdown |
| Other children offset | Calculator reduces percentage per § 154.129 table |
| Sub-type change after case creation | Not supported — user creates new case |
| Family case with amount | Amount step skipped, always District Court |

## Verification

1. All tests pass (child-support-calculator, venue-helper family, family-filing-prompts)
2. `npx next build` clean
3. New case dialog shows family sub-type selection when "Family" chosen
4. Family cases get family-specific task chain (not civil litigation)
5. Family wizard shows correct steps per sub-type
6. Child support calculator produces correct guideline amounts
7. Safety screening shows resources and screening for DV cases
8. Family filing prompts generate correct document formats per sub-type
9. Family motions available in motion builder
10. Petitioner/Respondent terminology throughout (not Plaintiff/Defendant)
