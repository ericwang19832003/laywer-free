# Motion Builder System — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Build a config-driven motion builder system with 7 new litigation workflow paths, a Motions Hub, and 3 new gatekeeper rules.

**Architecture:** One reusable `<MotionBuilder>` component renders dynamically from `MotionConfig` objects. Each motion type is a config file — no new React components needed per motion type. A registry pattern replaces the growing if/else chain in generate-filing.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind, Supabase, Anthropic Claude API, Zod, vitest

---

## Task 1: Foundation Types

**Files:**
- Create: `src/lib/motions/types.ts`

Create the core type definitions that everything else builds on.

```typescript
import { ZodSchema } from 'zod'

export interface FieldConfig {
  key: string
  type: 'text' | 'textarea' | 'date' | 'number' | 'checkbox'
       | 'select' | 'party-picker' | 'dynamic-list'
  label: string
  placeholder?: string
  helperText?: string
  required?: boolean
  section: number
  sectionTitle?: string
  options?: { label: string; value: string }[]
  listItemFields?: FieldConfig[]
  showWhen?: { field: string; value: unknown }
}

export type MotionCategory = 'discovery' | 'pretrial' | 'trial' | 'post_trial'

export interface MotionConfig {
  key: string
  title: string
  description: string
  reassurance: string
  category: MotionCategory

  fields: FieldConfig[]
  schema: ZodSchema
  buildPrompt: (facts: Record<string, unknown>) => { system: string; user: string }
  documentType: string

  taskKey?: string  // if it can appear as a gatekeeper task
}
```

---

## Task 2: Database Migration

**Files:**
- Create: `supabase/migrations/20260303000002_motions_table.sql`

### Motions table

```sql
-- Motions table for storing user-generated motions
CREATE TABLE public.motions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id     uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL DEFAULT auth.uid(),
  motion_type text NOT NULL,
  status      text NOT NULL DEFAULT 'draft'
                CHECK (status IN ('draft','finalized','filed')),
  facts       jsonb NOT NULL DEFAULT '{}',
  draft_text  text,
  final_text  text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.motions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own motions"
  ON public.motions
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Index for listing motions by case
CREATE INDEX idx_motions_case_id ON public.motions(case_id);

-- Updated_at trigger
CREATE TRIGGER set_motions_updated_at
  BEFORE UPDATE ON public.motions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
```

### Task seeding

Add to the `seed_case_tasks()` function. New tasks start as `'locked'` — gatekeeper rules unlock them.

```sql
-- Seed motion-related tasks for new cases
-- motion_to_compel: unlocked by Rule 16 when discovery response overdue
-- trial_prep_checklist: unlocked by Rule 17 when trial date ≤60 days
-- appellate_brief: unlocked by Rule 18 after notice_of_appeal completed

-- Note: These tasks are ONLY seeded; they stay locked until gatekeeper unlocks them.
-- notice_of_appeal, summary_judgment, settlement_demand, continuance, mtd_response
-- are on-demand from the Motions Hub — no tasks needed.

INSERT INTO public.tasks (case_id, task_key, title, status)
VALUES
  (NEW.id, 'motion_to_compel', 'Motion to Compel Discovery', 'locked'),
  (NEW.id, 'trial_prep_checklist', 'Trial Preparation Checklist', 'locked'),
  (NEW.id, 'appellate_brief', 'Appellate Brief', 'locked');
```

**Important:** Only the 3 gatekeeper-triggered tasks get seeded. The other 4 motion types (summary judgment, settlement demand, continuance, MTD response, notice of appeal) are launched on-demand from the Motions Hub — they use the `motions` table directly, not the `tasks` table.

---

## Task 3: Motion to Compel — Prompt Builder (TDD)

**Files:**
- Create: `src/lib/motions/configs/motion-to-compel.ts`
- Create: `tests/unit/rules/motion-to-compel-prompts.test.ts`

This is the first config — establishes the pattern all others follow.

### Schema

```typescript
import { z } from 'zod'
import { partySchema } from '@/lib/schemas/filing'

export const motionToCompelFactsSchema = z.object({
  your_info: partySchema,
  opposing_parties: z.array(partySchema).min(1),
  court_type: z.enum(['jp', 'county', 'district', 'federal']),
  county: z.string().min(1),
  cause_number: z.string().optional(),
  discovery_type: z.enum([
    'interrogatories',
    'requests_for_production',
    'requests_for_admission',
    'deposition',
    'combined',
  ]),
  date_served: z.string().min(1),
  response_deadline: z.string().min(1),
  deficiency_description: z.string().min(10),
  good_faith_conference_date: z.string().min(1),
  good_faith_outcome: z.string().min(10),
  specific_requests_at_issue: z.string().min(10),
  relief_requested: z.string().optional(),
})
```

### Prompt builder

```typescript
export function buildMotionToCompelPrompt(
  facts: z.infer<typeof motionToCompelFactsSchema>
): { system: string; user: string } {
  // System: legal document formatting assistant preamble
  // - DRAFT disclaimer
  // - Format: Caption, Introduction, Background (discovery served, deficient response),
  //   Good Faith Conference, Argument (relevance + proportionality),
  //   Prayer for Relief, Certificate of Conference, Signature block
  // User: structured facts in labeled sections
  //   --- PARTIES ---
  //   --- COURT ---
  //   --- DISCOVERY ---
  //   --- GOOD FAITH CONFERENCE ---
  //   --- SPECIFIC ISSUES ---
  //   --- RELIEF ---
}
```

### MotionConfig export

```typescript
import { MotionConfig, FieldConfig } from '../types'

const fields: FieldConfig[] = [
  // Section 1: Court & Case Info
  { key: 'court_type', type: 'select', label: 'Court type', section: 1, sectionTitle: 'Court Information', required: true,
    options: [
      { label: 'Justice Court', value: 'jp' },
      { label: 'County Court', value: 'county' },
      { label: 'District Court', value: 'district' },
      { label: 'Federal Court', value: 'federal' },
    ] },
  { key: 'county', type: 'text', label: 'County', placeholder: 'e.g. Travis', section: 1, required: true },
  { key: 'cause_number', type: 'text', label: 'Cause number', placeholder: 'Optional', section: 1 },

  // Section 2: Discovery Details
  { key: 'discovery_type', type: 'select', label: 'Type of discovery', section: 2, sectionTitle: 'Discovery Details', required: true,
    options: [
      { label: 'Interrogatories', value: 'interrogatories' },
      { label: 'Requests for Production', value: 'requests_for_production' },
      { label: 'Requests for Admission', value: 'requests_for_admission' },
      { label: 'Deposition', value: 'deposition' },
      { label: 'Combined discovery', value: 'combined' },
    ] },
  { key: 'date_served', type: 'date', label: 'Date discovery was served', section: 2, required: true },
  { key: 'response_deadline', type: 'date', label: 'Response deadline', section: 2, required: true },
  { key: 'deficiency_description', type: 'textarea', label: 'How is the response deficient?',
    placeholder: 'Describe what was missing, incomplete, or evasive...', section: 2, required: true },
  { key: 'specific_requests_at_issue', type: 'textarea', label: 'Specific requests at issue',
    placeholder: 'List the request numbers and what each seeks...', section: 2, required: true },

  // Section 3: Good Faith Conference
  { key: 'good_faith_conference_date', type: 'date', label: 'Conference date', section: 3, sectionTitle: 'Good Faith Conference', required: true,
    helperText: 'Texas requires a good-faith attempt to resolve discovery disputes before filing a motion.' },
  { key: 'good_faith_outcome', type: 'textarea', label: 'Conference outcome',
    placeholder: 'Describe what was discussed and why the dispute remains unresolved...', section: 3, required: true },

  // Section 4: Relief
  { key: 'relief_requested', type: 'textarea', label: 'Additional relief requested',
    placeholder: 'Optional — e.g., sanctions, attorney fees...', section: 4, sectionTitle: 'Relief Requested' },
]

export const motionToCompelConfig: MotionConfig = {
  key: 'motion_to_compel',
  title: 'Motion to Compel Discovery',
  description: 'Force the opposing party to respond to your discovery requests when they have failed to respond or provided inadequate responses.',
  reassurance: 'Discovery is how you gather evidence. If the other side isn\'t cooperating, this motion asks the court to order them to respond. It\'s a standard procedural tool.',
  category: 'discovery',
  fields,
  schema: motionToCompelFactsSchema,
  buildPrompt: buildMotionToCompelPrompt,
  documentType: 'motion_to_compel',
  taskKey: 'motion_to_compel',
}
```

### Tests (12+)

```
tests/unit/rules/motion-to-compel-prompts.test.ts:
- buildMotionToCompelPrompt:
  - returns { system, user } object
  - system includes DRAFT disclaimer
  - system includes "legal document formatting assistant"
  - system includes "good faith" / "certificate of conference"
  - user includes party names
  - user includes court info
  - user includes discovery type
  - user includes served date and response deadline
  - user includes deficiency description
  - user includes good faith conference details
  - user includes specific requests at issue
  - user includes relief requested when provided
  - user omits relief section when not provided
- Schema validation:
  - accepts valid facts
  - rejects missing discovery_type
  - rejects short deficiency_description (< 10 chars)
  - rejects empty opposing_parties
```

---

## Task 4: Generate-Filing Registry Refactor

**Files:**
- Modify: `src/app/api/cases/[id]/generate-filing/route.ts`

Replace the growing if/else chain with a registry lookup. Keep backward compatibility with existing document types.

### Current state (if/else chain):
```
amended_complaint → buildAmendedComplaintPrompt
motion_to_remand → buildRemandMotionPrompt
default_judgment → buildDefaultJudgmentPrompt
else → original filing
```

### New pattern (registry):

```typescript
import { ZodSchema } from 'zod'
import {
  buildAmendedComplaintPrompt,
  amendedComplaintFactsSchema,
} from '@/lib/rules/removal-prompts'
import {
  buildRemandMotionPrompt,
  remandMotionFactsSchema,
} from '@/lib/rules/removal-prompts'
import {
  buildDefaultJudgmentPrompt,
  defaultJudgmentFactsSchema,
} from '@/lib/rules/default-judgment-prompts'
import {
  motionToCompelFactsSchema,
  buildMotionToCompelPrompt,
} from '@/lib/motions/configs/motion-to-compel'
// ... future imports added here

interface RegistryEntry {
  schema: ZodSchema
  buildPrompt: (facts: Record<string, unknown>) => { system: string; user: string }
}

const MOTION_REGISTRY: Record<string, RegistryEntry> = {
  amended_complaint: { schema: amendedComplaintFactsSchema, buildPrompt: buildAmendedComplaintPrompt },
  motion_to_remand: { schema: remandMotionFactsSchema, buildPrompt: buildRemandMotionPrompt },
  default_judgment: { schema: defaultJudgmentFactsSchema, buildPrompt: buildDefaultJudgmentPrompt },
  motion_to_compel: { schema: motionToCompelFactsSchema, buildPrompt: buildMotionToCompelPrompt },
}

// In POST handler, replace if/else with:
if (documentType && MOTION_REGISTRY[documentType]) {
  const handler = MOTION_REGISTRY[documentType]
  const parsed = handler.schema.safeParse(body.facts)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.issues },
      { status: 422 }
    )
  }
  prompt = handler.buildPrompt(parsed.data)
  auditDocType = documentType
} else {
  // Original filing (petition/answer) — unchanged
  const parsed = generateFilingRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.issues },
      { status: 422 }
    )
  }
  const { facts } = parsed.data
  prompt = buildFilingPrompt(facts)
}
```

**Key:** The `else` branch (original filing) remains untouched — it uses `generateFilingRequestSchema` not `body.facts`.

---

## Task 5: MotionBuilder Component

**Files:**
- Create: `src/components/step/motion-builder.tsx`

This is the core reusable component. It renders a form from `MotionConfig.fields`, validates via `config.schema`, generates a draft via the generate-filing API, and shows a DraftViewer for review.

### Props

```typescript
interface MotionBuilderProps {
  config: MotionConfig
  caseId: string
  taskId?: string                            // from gatekeeper task
  existingMetadata?: Record<string, unknown> // for resume
  caseData?: {
    court_type?: string
    county?: string | null
    role?: string
  }
}
```

### Component structure

```
'use client'

MotionBuilder:
  State:
    - formData: Record<string, unknown> — initialized from existingMetadata, then caseData defaults
    - draft: string
    - acknowledged: boolean
    - generating: boolean
    - genError: string | null
    - dynamicLists: Record<string, unknown[][]> — for dynamic-list fields

  Rendering:
    <StepRunner
      caseId={caseId}
      taskId={taskId ?? 'motion-hub'}   // fallback for hub-launched motions
      title={config.title}
      reassurance={config.reassurance}
      onBeforeReview={generateDraft}
      onConfirm={handleConfirm}
      onSave={handleSave}
      reviewButtonLabel="Generate Motion →"
      reviewContent={<DraftViewer ... />}
    >
      {/* Auto-generated form from config.fields */}
      {renderSections()}
    </StepRunner>

  renderSections():
    - Group fields by section number
    - For each section: render sectionTitle header, then fields
    - For each field, render based on field.type:
      - 'text' → <input type="text">
      - 'textarea' → <textarea>
      - 'date' → <input type="date">
      - 'number' → <input type="number">
      - 'checkbox' → <input type="checkbox"> with label
      - 'select' → <select> with options
      - 'party-picker' → read-only display of your_info/opposing_parties from caseData
      - 'dynamic-list' → add/remove rows with listItemFields
    - Apply showWhen conditional rendering
    - Apply helperText as small muted text below field

  generateDraft():
    - Validate: config.schema.safeParse(formData)
    - If invalid: setGenError with first error message, throw
    - POST /api/cases/${caseId}/generate-filing with:
        { document_type: config.documentType, facts: formData }
    - setDraft(response.draft)

  handleConfirm():
    if taskId (gatekeeper-launched):
      - PATCH /api/tasks/${taskId} status: 'in_progress', metadata: { ...formData, draft_text: draft }
      - PATCH /api/tasks/${taskId} status: 'completed'
      - POST /api/cases/${caseId}/rules/run (trigger gatekeeper)
    else (hub-launched):
      - POST /api/cases/${caseId}/motions with:
          { motion_type: config.key, status: 'finalized', facts: formData, draft_text: draft, final_text: draft }

  handleSave():
    if taskId:
      - PATCH /api/tasks/${taskId} status: 'in_progress', metadata: { ...formData, draft_text: draft }
    else:
      - POST /api/cases/${caseId}/motions with:
          { motion_type: config.key, status: 'draft', facts: formData, draft_text: draft }
```

### Field rendering pattern

For each field type, follow the existing step component patterns:

```tsx
function renderField(field: FieldConfig) {
  // Check showWhen
  if (field.showWhen) {
    const currentValue = formData[field.showWhen.field]
    if (currentValue !== field.showWhen.value) return null
  }

  const value = formData[field.key]

  switch (field.type) {
    case 'text':
      return (
        <div key={field.key}>
          <label className="text-sm font-medium text-warm-text block mb-1">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          {field.helperText && <p className="text-xs text-warm-muted mb-1">{field.helperText}</p>}
          <input
            type="text"
            value={(value as string) ?? ''}
            onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
            placeholder={field.placeholder}
            className="w-full rounded-md border border-warm-border p-3 text-sm text-warm-text bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      )
    case 'textarea':
      return (/* similar with <textarea rows={4}> */)
    case 'date':
      return (/* <input type="date"> */)
    case 'number':
      return (/* <input type="number"> */)
    case 'checkbox':
      return (/* checkbox with label, like upload-answer-step pattern */)
    case 'select':
      return (
        <div key={field.key}>
          <label ...>{field.label}</label>
          <select
            value={(value as string) ?? ''}
            onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
            className="w-full rounded-md border border-warm-border p-3 text-sm text-warm-text bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Select...</option>
            {field.options?.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      )
    case 'dynamic-list':
      return (/* add/remove rows using field.listItemFields, like damages in default-packet-prep */)
  }
}
```

### Styling

Follow existing warm theme: `warm-text`, `warm-muted`, `warm-border`, `warm-bg`. Warning/info boxes use `calm-amber`.

---

## Task 6: Pretrial Motion Configs (TDD)

**Files:**
- Create: `src/lib/motions/configs/motion-summary-judgment.ts`
- Create: `src/lib/motions/configs/settlement-demand.ts`
- Create: `src/lib/motions/configs/motion-continuance.ts`
- Create: `src/lib/motions/configs/mtd-response.ts`
- Create: `tests/unit/rules/motion-summary-judgment-prompts.test.ts`
- Create: `tests/unit/rules/settlement-demand-prompts.test.ts`
- Create: `tests/unit/rules/motion-continuance-prompts.test.ts`
- Create: `tests/unit/rules/mtd-response-prompts.test.ts`

Each config follows the exact pattern from Task 3. Here are the specifications:

### Motion for Summary Judgment (`motion_summary_judgment`)

**Category:** `pretrial`

**Schema:**
```typescript
z.object({
  your_info: partySchema,
  opposing_parties: z.array(partySchema).min(1),
  court_type: z.enum(['jp', 'county', 'district', 'federal']),
  county: z.string().min(1),
  cause_number: z.string().optional(),
  undisputed_facts: z.array(z.object({
    fact: z.string().min(1),
    evidence_reference: z.string().optional(),
  })).min(1),
  legal_grounds: z.string().min(10),
  evidence_summary: z.string().min(10),
  damages_amount: z.number().positive().optional(),
})
```

**Fields (4 sections):**
1. Court Info: court_type (select), county (text), cause_number (text)
2. Undisputed Facts: dynamic-list with `fact` (text) + `evidence_reference` (text)
3. Legal Grounds: legal_grounds (textarea), evidence_summary (textarea)
4. Damages: damages_amount (number, optional)

**Prompt:** Format as Motion for Summary Judgment with: Caption, Introduction, Statement of Undisputed Facts (numbered), Standard of Review, Argument, Conclusion, Signature block.

**Tests (10):** system/user structure, DRAFT disclaimer, undisputed facts rendered as numbered list, legal grounds included, evidence summary included, optional damages, schema validation (4 tests).

### Settlement Demand Letter (`settlement_demand`)

**Category:** `pretrial`

**Schema:**
```typescript
z.object({
  your_info: partySchema,
  opposing_parties: z.array(partySchema).min(1),
  opposing_attorney: z.object({
    name: z.string().min(1),
    firm: z.string().optional(),
    address: z.string().optional(),
  }).optional(),
  incident_summary: z.string().min(10),
  liability_basis: z.string().min(10),
  damages_breakdown: z.array(z.object({
    category: z.string().min(1),
    amount: z.number().positive(),
    description: z.string().optional(),
  })).min(1),
  demand_amount: z.number().positive(),
  response_deadline_days: z.number().int().positive().default(30),
})
```

**Fields (4 sections):**
1. Recipient: opposing attorney name (text), firm (text), address (textarea)
2. Incident: incident_summary (textarea), liability_basis (textarea)
3. Damages: dynamic-list with category (text) + amount (number) + description (text), demand_amount (number)
4. Terms: response_deadline_days (number, default 30)

**Prompt:** Format as Settlement Demand Letter (not a court filing — letter format): Date, Addressee, RE line, Introduction, Statement of Facts, Liability Analysis, Damages (itemized), Demand, Response Deadline, Closing.

**Tests (10):** letter format (not court filing), DRAFT disclaimer, opposing attorney included when present, incident summary, damages itemized, total demand amount, response deadline, schema validation (3 tests).

### Motion for Continuance (`motion_continuance`)

**Category:** `pretrial`

**Schema:**
```typescript
z.object({
  your_info: partySchema,
  opposing_parties: z.array(partySchema).min(1),
  court_type: z.enum(['jp', 'county', 'district', 'federal']),
  county: z.string().min(1),
  cause_number: z.string().optional(),
  hearing_or_trial_date: z.string().min(1),
  event_type: z.enum(['hearing', 'trial']),
  reason: z.enum([
    'medical',
    'scheduling_conflict',
    'need_more_time',
    'witness_unavailable',
    'settlement_negotiations',
    'attorney_withdrawal',
    'other',
  ]),
  explanation: z.string().min(10),
  proposed_new_date: z.string().optional(),
  opposing_position: z.enum(['agrees', 'opposes', 'unknown']),
  previous_continuances: z.number().int().min(0).default(0),
})
```

**Fields (3 sections):**
1. Court & Event: court_type (select), county (text), cause_number (text), hearing_or_trial_date (date), event_type (select: hearing/trial)
2. Reason: reason (select), explanation (textarea), proposed_new_date (date)
3. Context: opposing_position (select: agrees/opposes/unknown), previous_continuances (number)

**Prompt:** Format as Motion for Continuance: Caption, Introduction, Background, Grounds for Continuance, No Prejudice to Opposing Party, Proposed New Date, Certificate of Conference (if opposing_position given), Signature block.

**Tests (10):** system/user structure, DRAFT disclaimer, reason included, event type (hearing vs trial), opposing position, proposed date when provided, previous continuances count, schema validation (3 tests).

### Response to Motion to Dismiss (`mtd_response`)

**Category:** `pretrial`

**Schema:**
```typescript
z.object({
  your_info: partySchema,
  opposing_parties: z.array(partySchema).min(1),
  court_type: z.enum(['jp', 'county', 'district', 'federal']),
  county: z.string().min(1),
  cause_number: z.string().optional(),
  mtd_filing_date: z.string().min(1),
  dismissal_grounds: z.array(z.enum([
    'failure_to_state_claim',
    'lack_of_jurisdiction',
    'improper_venue',
    'insufficient_service',
    'statute_of_limitations',
    'res_judicata',
    'failure_to_join_party',
    'other',
  ])).min(1),
  factual_response: z.string().min(10),
  legal_arguments: z.string().min(10),
  additional_authority: z.string().optional(),
})
```

**Fields (3 sections):**
1. Court & MTD Info: court_type (select), county (text), cause_number (text), mtd_filing_date (date)
2. Dismissal Grounds: dismissal_grounds (checkboxes — render as multiple checkboxes, store as array), factual_response (textarea)
3. Arguments: legal_arguments (textarea), additional_authority (textarea, optional)

**Prompt:** Format as Plaintiff's Response to Defendant's Motion to Dismiss: Caption, Introduction, Factual Background, Standard of Review (accept all facts as true at this stage), Argument by Ground (one section per dismissal ground cited), Conclusion, Signature block.

**Tests (10):** system/user structure, DRAFT disclaimer, MTD filing date included, each dismissal ground addressed, factual response, legal arguments, additional authority when provided, schema validation (3 tests).

### Register all in generate-filing

After creating each config, add its schema + buildPrompt to the `MOTION_REGISTRY` in `generate-filing/route.ts`:

```typescript
import { motionSummaryJudgmentFactsSchema, buildMotionSummaryJudgmentPrompt } from '@/lib/motions/configs/motion-summary-judgment'
import { settlementDemandFactsSchema, buildSettlementDemandPrompt } from '@/lib/motions/configs/settlement-demand'
import { motionContinuanceFactsSchema, buildMotionContinuancePrompt } from '@/lib/motions/configs/motion-continuance'
import { mtdResponseFactsSchema, buildMtdResponsePrompt } from '@/lib/motions/configs/mtd-response'

// Add to MOTION_REGISTRY:
motion_summary_judgment: { schema: motionSummaryJudgmentFactsSchema, buildPrompt: buildMotionSummaryJudgmentPrompt },
settlement_demand: { schema: settlementDemandFactsSchema, buildPrompt: buildSettlementDemandPrompt },
motion_continuance: { schema: motionContinuanceFactsSchema, buildPrompt: buildMotionContinuancePrompt },
mtd_response: { schema: mtdResponseFactsSchema, buildPrompt: buildMtdResponsePrompt },
```

---

## Task 7: Post-Trial Motion Configs (TDD)

**Files:**
- Create: `src/lib/motions/configs/notice-of-appeal.ts`
- Create: `src/lib/motions/configs/appellate-brief.ts`
- Create: `tests/unit/rules/notice-of-appeal-prompts.test.ts`
- Create: `tests/unit/rules/appellate-brief-prompts.test.ts`

### Notice of Appeal (`notice_of_appeal`)

**Category:** `post_trial`

**Schema:**
```typescript
z.object({
  your_info: partySchema,
  opposing_parties: z.array(partySchema).min(1),
  court_type: z.enum(['jp', 'county', 'district', 'federal']),
  county: z.string().min(1),
  cause_number: z.string().optional(),
  judgment_date: z.string().min(1),
  judgment_description: z.string().min(10),
  appeal_grounds: z.array(z.enum([
    'legal_error',
    'insufficient_evidence',
    'procedural_error',
    'abuse_of_discretion',
    'constitutional_violation',
    'other',
  ])).min(1),
  appellate_court: z.string().min(1),
})
```

**Fields (3 sections):**
1. Trial Court: court_type (select), county (text), cause_number (text)
2. Judgment: judgment_date (date), judgment_description (textarea)
3. Appeal: appeal_grounds (checkboxes), appellate_court (text, helperText: "e.g., Fifth Circuit Court of Appeals, Third Court of Appeals")

**Prompt:** Format as Notice of Appeal: Caption (trial court), Notice (defendant/appellant gives notice of appeal), Judgment Appealed (date, description), Appellate Court designation, Signature block. Short document — typically 1-2 pages.

**Tests (8):** system/user structure, DRAFT disclaimer, judgment date, judgment description, appeal grounds listed, appellate court, schema validation (2 tests).

### Appellate Brief (`appellate_brief`)

**Category:** `post_trial`

**Schema:**
```typescript
z.object({
  your_info: partySchema,
  opposing_parties: z.array(partySchema).min(1),
  appellate_court: z.string().min(1),
  trial_court: z.string().min(1),
  cause_number: z.string().optional(),
  appellate_case_number: z.string().optional(),
  statement_of_case: z.string().min(20),
  issues_presented: z.array(z.string().min(10)).min(1),
  standard_of_review: z.enum([
    'de_novo',
    'abuse_of_discretion',
    'clearly_erroneous',
    'substantial_evidence',
  ]),
  argument_sections: z.array(z.object({
    heading: z.string().min(1),
    argument: z.string().min(20),
  })).min(1),
  prayer: z.string().min(10),
})
```

**Fields (5 sections):**
1. Courts: appellate_court (text), trial_court (text), cause_number (text), appellate_case_number (text)
2. Statement of Case: statement_of_case (textarea)
3. Issues: issues_presented (dynamic-list with single text field)
4. Arguments: standard_of_review (select), argument_sections (dynamic-list with heading + argument textarea)
5. Prayer: prayer (textarea, helperText: "State what relief you are asking the appellate court to grant.")

**Prompt:** Format as Appellant's Brief: Cover Page, Table of Contents, Table of Authorities (placeholder), Statement of the Case, Issues Presented (numbered), Standard of Review, Summary of the Argument, Argument (one section per heading), Prayer for Relief, Appendix (placeholder), Signature block.

**Tests (10):** system/user structure, DRAFT disclaimer, appellate court, issues presented numbered, standard of review, argument sections with headings, prayer, schema validation (3 tests).

### Register in generate-filing

```typescript
import { noticeOfAppealFactsSchema, buildNoticeOfAppealPrompt } from '@/lib/motions/configs/notice-of-appeal'
import { appellateBriefFactsSchema, buildAppellateBriefPrompt } from '@/lib/motions/configs/appellate-brief'

// Add to MOTION_REGISTRY:
notice_of_appeal: { schema: noticeOfAppealFactsSchema, buildPrompt: buildNoticeOfAppealPrompt },
appellate_brief: { schema: appellateBriefFactsSchema, buildPrompt: buildAppellateBriefPrompt },
```

---

## Task 8: Motion Config Registry

**Files:**
- Create: `src/lib/motions/registry.ts`

This module collects all configs into a single lookup for the Motions Hub.

```typescript
import { MotionConfig } from './types'
import { motionToCompelConfig } from './configs/motion-to-compel'
import { motionSummaryJudgmentConfig } from './configs/motion-summary-judgment'
import { settlementDemandConfig } from './configs/settlement-demand'
import { motionContinuanceConfig } from './configs/motion-continuance'
import { mtdResponseConfig } from './configs/mtd-response'
import { noticeOfAppealConfig } from './configs/notice-of-appeal'
import { appellateBriefConfig } from './configs/appellate-brief'

export const MOTION_CONFIGS: Record<string, MotionConfig> = {
  motion_to_compel: motionToCompelConfig,
  motion_summary_judgment: motionSummaryJudgmentConfig,
  settlement_demand: settlementDemandConfig,
  motion_continuance: motionContinuanceConfig,
  mtd_response: mtdResponseConfig,
  notice_of_appeal: noticeOfAppealConfig,
  appellate_brief: appellateBriefConfig,
}

export const MOTION_CONFIGS_BY_CATEGORY = {
  discovery: Object.values(MOTION_CONFIGS).filter(c => c.category === 'discovery'),
  pretrial: Object.values(MOTION_CONFIGS).filter(c => c.category === 'pretrial'),
  post_trial: Object.values(MOTION_CONFIGS).filter(c => c.category === 'post_trial'),
}
```

---

## Task 9: Trial Prep Checklist Step

**Files:**
- Create: `src/lib/motions/trial-prep-config.ts`
- Create: `src/components/step/trial-prep-checklist-step.tsx`

**Pattern:** Educational step like `evidence-vault-step.tsx` — ExpandableSections, `skipReview: true`, no AI generation.

### Config content (`trial-prep-config.ts`)

```typescript
export const TRIAL_PREP_SECTIONS = [
  {
    title: 'Pre-Trial Motions & Deadlines',
    items: [
      'File any remaining pre-trial motions (motions in limine, motions to exclude evidence)',
      'Review and respond to opposing party\'s pre-trial motions',
      'Check all filing deadlines with the court clerk',
      'File your pre-trial order or proposed findings if required',
      'Confirm trial date, time, and courtroom with the clerk',
    ],
  },
  {
    title: 'Evidence & Exhibits',
    items: [
      'Organize all exhibits in a numbered binder',
      'Prepare exhibit list for the court and opposing counsel',
      'Make at least 3 copies of each exhibit (court, opposing counsel, witness)',
      'Verify all evidence was properly disclosed during discovery',
      'Prepare any demonstrative aids (charts, timelines, photos)',
    ],
  },
  {
    title: 'Witnesses',
    items: [
      'Confirm all witnesses are available for trial date',
      'Subpoena any reluctant witnesses',
      'Prepare a list of questions for each witness (direct examination)',
      'Prepare anticipated cross-examination questions for opposing witnesses',
      'Brief your witnesses on courtroom procedures and expectations',
    ],
  },
  {
    title: 'Courtroom Preparation',
    items: [
      'Visit the courtroom before trial day if possible',
      'Prepare your opening statement outline',
      'Prepare your closing argument outline',
      'Dress professionally (business attire)',
      'Arrive at least 30 minutes early on trial day',
      'Bring extra copies of all documents, pens, and a notepad',
    ],
  },
  {
    title: 'Legal Research',
    items: [
      'Review the applicable jury charge or court instructions',
      'Research key legal issues and have case citations ready',
      'Review the rules of evidence for your court',
      'Understand the burden of proof for each claim',
    ],
  },
]
```

### Component (`trial-prep-checklist-step.tsx`)

Follow `evidence-vault-step.tsx` pattern exactly:
- Props: `{ caseId: string, taskId: string }`
- 5 ExpandableSections, one per `TRIAL_PREP_SECTIONS` entry
- Each section renders items as a checklist (visual only — checkmarks are for the user's reference, not persisted)
- Context callout (indigo border): "Trial preparation is critical. This checklist helps you organize everything you need before your trial date."
- `skipReview: true`
- `onConfirm`: two-step task transition (`in_progress` → `completed`). No gatekeeper call needed.

---

## Task 10: Motions CRUD API

**Files:**
- Create: `src/app/api/cases/[id]/motions/route.ts`
- Create: `src/app/api/motions/[id]/route.ts`

### POST/GET `/api/cases/[id]/motions`

```typescript
// POST — Create/save motion
export async function POST(request, { params }) {
  const { id: caseId } = await params
  const { supabase, error: authError } = await getAuthenticatedClient()
  if (authError) return authError

  // Verify case exists
  const { data: caseData, error: caseError } = await supabase!
    .from('cases').select('id').eq('id', caseId).single()
  if (caseError || !caseData) return NextResponse.json({ error: 'Case not found' }, { status: 404 })

  const body = await request.json()
  const schema = z.object({
    motion_type: z.string().min(1),
    status: z.enum(['draft', 'finalized', 'filed']).default('draft'),
    facts: z.record(z.unknown()).default({}),
    draft_text: z.string().nullable().optional(),
    final_text: z.string().nullable().optional(),
  })

  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Validation failed', details: parsed.error.issues }, { status: 422 })

  const { data: motion, error: insertError } = await supabase!
    .from('motions')
    .insert({ case_id: caseId, ...parsed.data })
    .select()
    .single()

  if (insertError) return NextResponse.json({ error: 'Failed to create motion' }, { status: 500 })

  // Audit event
  await supabase!.from('task_events').insert({
    case_id: caseId,
    kind: 'motion_created',
    payload: { motion_type: parsed.data.motion_type, motion_id: motion.id },
  })

  return NextResponse.json({ motion }, { status: 201 })
}

// GET — List motions for case
export async function GET(request, { params }) {
  const { id: caseId } = await params
  const { supabase, error: authError } = await getAuthenticatedClient()
  if (authError) return authError

  const { data: motions, error } = await supabase!
    .from('motions')
    .select('*')
    .eq('case_id', caseId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: 'Failed to list motions' }, { status: 500 })

  return NextResponse.json({ motions })
}
```

### PATCH `/api/motions/[id]`

```typescript
export async function PATCH(request, { params }) {
  const { id: motionId } = await params
  const { supabase, error: authError } = await getAuthenticatedClient()
  if (authError) return authError

  const body = await request.json()
  const schema = z.object({
    status: z.enum(['draft', 'finalized', 'filed']).optional(),
    facts: z.record(z.unknown()).optional(),
    draft_text: z.string().nullable().optional(),
    final_text: z.string().nullable().optional(),
  })

  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Validation failed' }, { status: 422 })

  const { data: motion, error: updateError } = await supabase!
    .from('motions')
    .update(parsed.data)
    .eq('id', motionId)
    .select()
    .single()

  if (updateError || !motion) return NextResponse.json({ error: 'Motion not found or update failed' }, { status: 404 })

  return NextResponse.json({ motion })
}
```

---

## Task 11: Motions Hub Pages

**Files:**
- Create: `src/app/case/[id]/motions/page.tsx`
- Create: `src/app/case/[id]/motions/[motionKey]/page.tsx`

### Hub Page (`/case/[id]/motions`)

**Pattern:** Server component like `discovery/page.tsx`.

```typescript
// Fetch:
// 1. Case data (court_type, county)
// 2. Existing motions from motions table
// 3. Motion-related tasks (motion_to_compel, appellate_brief) for gatekeeper status

// Render:
// - SupportiveHeader: "Motions Hub", subtitle
// - Back button to /case/${id}
// - Category sections: Discovery, Pretrial, Post-Trial
//   Each shows motion config cards with:
//   - Title, description
//   - "Create" button → links to /case/${id}/motions/${config.key}
//   - If gatekeeper task exists and is 'todo', show badge "Suggested"
// - Previously created motions section below:
//   - List of motions from motions table
//   - Status badge (draft, finalized, filed)
//   - Click to open in MotionBuilder with existingMetadata
// - LegalDisclaimer
```

Layout:
```tsx
<div className="min-h-screen bg-warm-bg">
  <main className="mx-auto max-w-2xl px-4 py-10">
    <Button variant="ghost" size="sm" asChild>
      <Link href={`/case/${id}`}>← Back to dashboard</Link>
    </Button>
    <SupportiveHeader title="Motions Hub" subtitle="Create and manage your motions and filings." />

    {/* Category sections */}
    {Object.entries(MOTION_CONFIGS_BY_CATEGORY).map(([category, configs]) => (
      <div key={category} className="mb-8">
        <h3 className="text-sm font-semibold text-warm-text uppercase tracking-wide mb-3">
          {categoryLabel(category)}
        </h3>
        <div className="space-y-3">
          {configs.map(config => (
            <Card key={config.key}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-warm-text">{config.title}</h4>
                  <p className="text-xs text-warm-muted mt-0.5">{config.description}</p>
                </div>
                <Button size="sm" asChild>
                  <Link href={`/case/${id}/motions/${config.key}`}>Create</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    ))}

    {/* Previously created motions */}
    {motions.length > 0 && (
      <div className="mt-8">
        <h3 className="...">Your Motions</h3>
        {motions.map(m => (
          <Card key={m.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4>{MOTION_CONFIGS[m.motion_type]?.title ?? m.motion_type}</h4>
                  <p className="text-xs text-warm-muted">
                    {m.status} · {new Date(m.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/case/${id}/motions/${m.motion_type}?motionId=${m.id}`}>
                    {m.status === 'draft' ? 'Continue' : 'View'}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )}

    <LegalDisclaimer />
  </main>
</div>
```

### Individual Motion Page (`/case/[id]/motions/[motionKey]`)

```typescript
// Server component
// Fetch:
// 1. Case data
// 2. If ?motionId query param, fetch existing motion from motions table
// 3. If motionKey has a taskKey, check if gatekeeper task exists

// Validate motionKey against MOTION_CONFIGS
// If invalid, show "Motion type not found"

// Render MotionBuilder with:
//   config: MOTION_CONFIGS[motionKey]
//   caseId: id
//   taskId: gatekeeperTask?.id (if exists and status is 'todo')
//   existingMetadata: existingMotion?.facts (if resuming)
//   caseData: { court_type, county, role }
```

---

## Task 12: Gatekeeper Rules 16-18 (TDD)

**Files:**
- Modify: `src/lib/rules/gatekeeper.ts`
- Modify: `tests/unit/rules/gatekeeper.test.ts`

### New Input fields needed

The GatekeeperInput interface may need expansion. Check if discovery_packs or trial dates are already available. If not:

```typescript
// Add to GatekeeperInput:
export interface GatekeeperInput {
  tasks: GatekeeperTask[]
  deadlines: GatekeeperDeadline[]
  now: Date
  // New optional fields for motion rules:
  discoveryResponseDue?: Date | null   // when discovery response was due
  trialDate?: Date | null              // scheduled trial date
}
```

### Rule 16: Motion to Compel auto-suggest

**Trigger:** Discovery pack was sent (task `discovery_starter_pack` completed) AND `discoveryResponseDue` has passed AND `motion_to_compel` task is locked.

```typescript
// Rule 16: Suggest motion to compel when discovery response overdue
const discoveryPack = tasks.find(t => t.task_key === 'discovery_starter_pack')
const motionToCompel = tasks.find(t => t.task_key === 'motion_to_compel')
if (
  discoveryPack?.status === 'completed' &&
  motionToCompel?.status === 'locked' &&
  input.discoveryResponseDue &&
  input.now > input.discoveryResponseDue
) {
  actions.push({ type: 'unlock_task', task_key: 'motion_to_compel' })
}
```

### Rule 17: Trial prep checklist

**Trigger:** A `trial_date` deadline exists AND trial date is ≤60 days away AND `trial_prep_checklist` task is locked.

```typescript
// Rule 17: Unlock trial prep checklist when trial date within 60 days
const trialPrepChecklist = tasks.find(t => t.task_key === 'trial_prep_checklist')
if (
  trialPrepChecklist?.status === 'locked' &&
  input.trialDate &&
  input.trialDate.getTime() - input.now.getTime() <= 60 * 24 * 60 * 60 * 1000
) {
  actions.push({ type: 'unlock_task', task_key: 'trial_prep_checklist' })
}
```

### Rule 18: Appellate brief after notice of appeal

**Trigger:** A motion with type `notice_of_appeal` exists in `motions` table with status `finalized` AND `appellate_brief` task is locked.

Note: Since the gatekeeper is a pure function, we need to pass this information in. Add:

```typescript
// Add to GatekeeperInput:
completedMotionTypes?: string[]  // motion types with status 'finalized' or 'filed'
```

```typescript
// Rule 18: Unlock appellate brief after notice of appeal completed
const appellateBrief = tasks.find(t => t.task_key === 'appellate_brief')
if (
  appellateBrief?.status === 'locked' &&
  input.completedMotionTypes?.includes('notice_of_appeal')
) {
  actions.push({ type: 'unlock_task', task_key: 'appellate_brief' })
}
```

### Update the rules/run API route

The `/api/cases/[id]/rules/run` route that calls `evaluateGatekeeperRules()` needs to fetch the new input fields and pass them:

```typescript
// Fetch discovery response deadline
const { data: discoveryDeadline } = await supabase
  .from('deadlines')
  .select('due_at')
  .eq('case_id', caseId)
  .eq('key', 'discovery_response_deadline')
  .maybeSingle()

// Fetch trial date
const { data: trialDeadline } = await supabase
  .from('deadlines')
  .select('due_at')
  .eq('case_id', caseId)
  .eq('key', 'trial_date')
  .maybeSingle()

// Fetch completed motion types
const { data: completedMotions } = await supabase
  .from('motions')
  .select('motion_type')
  .eq('case_id', caseId)
  .in('status', ['finalized', 'filed'])

const input: GatekeeperInput = {
  tasks,
  deadlines,
  now: new Date(),
  discoveryResponseDue: discoveryDeadline?.due_at ? new Date(discoveryDeadline.due_at) : null,
  trialDate: trialDeadline?.due_at ? new Date(trialDeadline.due_at) : null,
  completedMotionTypes: completedMotions?.map(m => m.motion_type) ?? [],
}
```

### Tests (9+)

```
Rule 16 tests:
- unlocks motion_to_compel when discovery_starter_pack completed AND response overdue
- does NOT unlock when response deadline not yet passed
- does NOT unlock when discovery_starter_pack not completed
- does NOT unlock when motion_to_compel already unlocked

Rule 17 tests:
- unlocks trial_prep_checklist when trial date ≤60 days away
- does NOT unlock when trial date >60 days away
- does NOT unlock when no trial date set

Rule 18 tests:
- unlocks appellate_brief when notice_of_appeal in completedMotionTypes
- does NOT unlock when notice_of_appeal not completed
```

---

## Task 13: Step Page Wiring + Dashboard

**Files:**
- Modify: `src/app/case/[id]/step/[taskId]/page.tsx`
- Modify: `src/app/case/[id]/page.tsx` (dashboard)

### Step page — add 3 new cases

```typescript
// Add imports
import { MotionBuilder } from '@/components/step/motion-builder'
import { TrialPrepChecklistStep } from '@/components/step/trial-prep-checklist-step'
import { MOTION_CONFIGS } from '@/lib/motions/registry'

// Add switch cases:

case 'motion_to_compel': {
  const config = MOTION_CONFIGS['motion_to_compel']
  const { data: caseRow } = await supabase
    .from('cases')
    .select('court_type, county, role')
    .eq('id', id)
    .single()

  return (
    <MotionBuilder
      config={config}
      caseId={id}
      taskId={taskId}
      existingMetadata={task.metadata}
      caseData={caseRow ?? undefined}
    />
  )
}

case 'trial_prep_checklist':
  return <TrialPrepChecklistStep caseId={id} taskId={taskId} />

case 'appellate_brief': {
  const config = MOTION_CONFIGS['appellate_brief']
  const { data: caseRow } = await supabase
    .from('cases')
    .select('court_type, county, role')
    .eq('id', id)
    .single()

  return (
    <MotionBuilder
      config={config}
      caseId={id}
      taskId={taskId}
      existingMetadata={task.metadata}
      caseData={caseRow ?? undefined}
    />
  )
}
```

### Dashboard — add MotionsCard

Create a new card component or inline in the dashboard. Follow the DiscoveryCard pattern:

```typescript
// In dashboard page, after DiscoveryCard:
// Fetch motion-related tasks
const motionTasks = tasks?.filter(t =>
  ['motion_to_compel', 'trial_prep_checklist', 'appellate_brief'].includes(t.task_key)
) ?? []

// Fetch motions count
const { count: motionsCount } = await supabase
  .from('motions')
  .select('*', { count: 'exact', head: true })
  .eq('case_id', id)

// Only show card if there are unlocked motion tasks OR existing motions
const hasMotionActivity = motionTasks.some(t => t.status !== 'locked') || (motionsCount ?? 0) > 0

{hasMotionActivity && (
  <Card>
    <CardContent className="p-4">
      <h3 className="text-sm font-semibold text-warm-text mb-2">Motions</h3>
      {motionTasks
        .filter(t => t.status === 'todo')
        .map(t => (
          <div key={t.id} className="flex items-center justify-between py-2">
            <span className="text-sm text-warm-text">{t.title}</span>
            <Button size="sm" asChild>
              <Link href={`/case/${id}/step/${t.id}`}>Get Started</Link>
            </Button>
          </div>
        ))
      }
      {(motionsCount ?? 0) > 0 && (
        <p className="text-xs text-warm-muted mt-2">
          {motionsCount} motion{motionsCount !== 1 ? 's' : ''} created
        </p>
      )}
      <Button variant="outline" size="sm" className="mt-3 w-full" asChild>
        <Link href={`/case/${id}/motions`}>View Motions Hub →</Link>
      </Button>
    </CardContent>
  </Card>
)}
```

---

## Task 14: Build & Test Verification

1. Run all existing tests — expect all passing + new tests passing:
   ```bash
   npx vitest run
   ```

2. Type check:
   ```bash
   npx tsc --noEmit
   ```

3. Build:
   ```bash
   npx next build
   ```

4. Verify:
   - All motion configs have passing prompt + schema tests
   - Gatekeeper Rules 16-18 have passing tests
   - Registry refactor passes (existing generate-filing tests still pass)
   - No "Coming soon" for motion_to_compel, trial_prep_checklist, appellate_brief
   - Motions Hub page renders at `/case/[id]/motions`
   - Individual motion pages render at `/case/[id]/motions/[key]`

---

## File Summary

| File | Action | Task |
|------|--------|------|
| `src/lib/motions/types.ts` | Create | 1 |
| `supabase/migrations/20260303000002_motions_table.sql` | Create | 2 |
| `src/lib/motions/configs/motion-to-compel.ts` | Create | 3 |
| `tests/unit/rules/motion-to-compel-prompts.test.ts` | Create | 3 |
| `src/app/api/cases/[id]/generate-filing/route.ts` | Modify | 4 |
| `src/components/step/motion-builder.tsx` | Create | 5 |
| `src/lib/motions/configs/motion-summary-judgment.ts` | Create | 6 |
| `src/lib/motions/configs/settlement-demand.ts` | Create | 6 |
| `src/lib/motions/configs/motion-continuance.ts` | Create | 6 |
| `src/lib/motions/configs/mtd-response.ts` | Create | 6 |
| `tests/unit/rules/motion-summary-judgment-prompts.test.ts` | Create | 6 |
| `tests/unit/rules/settlement-demand-prompts.test.ts` | Create | 6 |
| `tests/unit/rules/motion-continuance-prompts.test.ts` | Create | 6 |
| `tests/unit/rules/mtd-response-prompts.test.ts` | Create | 6 |
| `src/lib/motions/configs/notice-of-appeal.ts` | Create | 7 |
| `src/lib/motions/configs/appellate-brief.ts` | Create | 7 |
| `tests/unit/rules/notice-of-appeal-prompts.test.ts` | Create | 7 |
| `tests/unit/rules/appellate-brief-prompts.test.ts` | Create | 7 |
| `src/lib/motions/registry.ts` | Create | 8 |
| `src/lib/motions/trial-prep-config.ts` | Create | 9 |
| `src/components/step/trial-prep-checklist-step.tsx` | Create | 9 |
| `src/app/api/cases/[id]/motions/route.ts` | Create | 10 |
| `src/app/api/motions/[id]/route.ts` | Create | 10 |
| `src/app/case/[id]/motions/page.tsx` | Create | 11 |
| `src/app/case/[id]/motions/[motionKey]/page.tsx` | Create | 11 |
| `src/lib/rules/gatekeeper.ts` | Modify | 12 |
| `tests/unit/rules/gatekeeper.test.ts` | Modify | 12 |
| `src/app/api/cases/[id]/rules/run/route.ts` | Modify | 12 |
| `src/app/case/[id]/step/[taskId]/page.tsx` | Modify | 13 |
| `src/app/case/[id]/page.tsx` | Modify | 13 |

## Dependencies

```
Task 1 (types) ─────┬──→ Task 3 (compel config) ──→ Task 4 (registry refactor)
                     │                                       │
                     ├──→ Task 5 (MotionBuilder) ←──────────┘
                     │
                     ├──→ Task 6 (pretrial configs) ──→ Task 8 (config registry)
                     │                                       │
                     ├──→ Task 7 (post-trial configs) ──────┘
                     │
                     └──→ Task 9 (trial prep) ──────────────────────────────────┐
                                                                                │
Task 2 (migration) ──→ Task 10 (CRUD API) ──→ Task 11 (hub pages) ───────────→│
                                                                                │
                         Task 12 (gatekeeper rules) ──→ Task 13 (wiring) ──→ Task 14 (verify)
```

**Parallel groups:**
- Group A (independent): Tasks 1, 2
- Group B (after Task 1): Tasks 3, 6, 7, 9
- Group C (after Tasks 3): Task 4
- Group D (after Task 4): Task 5
- Group E (after Tasks 6, 7): Task 8
- Group F (after Task 2): Task 10
- Group G (after Tasks 5, 8, 10): Task 11
- Group H (independent after Task 2): Task 12
- Group I (after Tasks 9, 11, 12): Task 13
- Group J (after all): Task 14
