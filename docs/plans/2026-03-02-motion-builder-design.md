# Motion Builder System — Design Document

**Date:** 2026-03-02
**Status:** Approved
**Scope:** 7 new litigation workflow paths via config-driven motion builder

## Problem

Users complete the filing → service → answer response workflow, then hit a dead end. The post-filing litigation phase (discovery enforcement, pretrial motions, settlement, trial prep, appeals) has no guidance. Pro se litigants need these motions most.

## Solution: Config-Driven Motion Builder

### Architecture: One Component, Many Configs

Instead of building 7 bespoke step components (~5,000 lines), we build ONE reusable `<MotionBuilder>` component that renders dynamically from a `MotionConfig` object. Each motion type is a config file — no new React components needed per motion type.

### UX Model: Hybrid (Gatekeeper + On-Demand)

- **Gatekeeper tasks** auto-suggest motions when conditions are met (e.g., Motion to Compel when discovery response is overdue)
- **Motions Hub** (`/case/[id]/motions`) lets users generate any motion on demand

## Core Types

### FieldConfig

```typescript
interface FieldConfig {
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
```

### MotionConfig

```typescript
interface MotionConfig {
  key: string
  title: string
  description: string
  reassurance: string
  category: 'discovery' | 'pretrial' | 'trial' | 'post_trial'

  fields: FieldConfig[]
  schema: ZodSchema
  buildPrompt: (facts: Record<string, unknown>) => { system: string; user: string }
  documentType: string

  taskKey?: string  // if it can appear as a gatekeeper task
}
```

## MotionBuilder Component

```
Props:
  config: MotionConfig
  caseId: string
  taskId?: string                            // from gatekeeper task
  existingMetadata?: Record<string, unknown> // for resume
  caseData?: { court_type, county, ... }     // pre-fetched context

Flow:
  StepRunner wrapper
    ├── Form (auto-generated from config.fields)
    │   ├── Section N: fields where section=N with sectionTitle header
    │   └── conditional fields via showWhen
    ├── Court info context card (from caseData)
    └── Generate button → DraftViewer review

Behaviors:
  - Auto-initializes state from existingMetadata (resumable)
  - Validates via config.schema.safeParse()
  - Calls POST /api/cases/{id}/generate-filing with { document_type, facts }
  - Shows DraftViewer in review phase
  - onConfirm: saves metadata + completes task (if taskId) or saves to motions table (if hub)
  - onSave: saves as in_progress for later
```

## Motions Hub Page

`/case/[id]/motions` — lists available motion types grouped by category (discovery, pretrial, post_trial). Each card shows title, description, and "Create" button. Previously generated motions shown below.

Each motion opens `/case/[id]/motions/[motionKey]` rendering `<MotionBuilder config={configs[motionKey]} />`.

## The 7 Features

### Config-Driven Motions (6)

| # | Key | Category | Title | Auto-Suggest Trigger |
|---|-----|----------|-------|---------------------|
| 1 | `motion_to_compel` | discovery | Motion to Compel Discovery | Discovery response overdue |
| 2 | `motion_summary_judgment` | pretrial | Motion for Summary Judgment | None (user-initiated) |
| 3 | `settlement_demand` | pretrial | Settlement Demand Letter | None (user-initiated) |
| 4 | `motion_continuance` | pretrial | Motion for Continuance | None (user-initiated) |
| 5 | `mtd_response` | pretrial | Response to Motion to Dismiss | None (user-initiated) |
| 6 | `notice_of_appeal` | post_trial | Notice of Appeal | None (user-initiated) |
| 7 | `appellate_brief` | post_trial | Appellate Brief | After Notice of Appeal completed |

### Educational Checklist (1)

| Key | Title | Auto-Suggest Trigger |
|-----|-------|---------------------|
| `trial_prep_checklist` | Trial Preparation Checklist | Trial date set, <=60 days away |

Built as an educational step (like evidence_vault pattern), not a motion config.

### Motion Field Summaries

**Motion to Compel:** parties, court info, discovery pack reference, date served, response deadline, good-faith conference date/outcome

**Summary Judgment:** parties, court info, undisputed facts (dynamic list), legal grounds, evidence references, damages

**Settlement Demand:** parties (with attorney info), incident summary, liability basis, damages breakdown (dynamic list), demand amount, response deadline

**Continuance:** parties, court info, hearing/trial date, reason (select), explanation, proposed new date, opposing party position

**MTD Response:** parties, court info, MTD filing date, dismissal grounds cited (select), factual response, legal arguments

**Notice of Appeal:** parties, court info, judgment date, judgment description, appeal grounds (select), appellate court

**Appellate Brief:** parties, appellate court info, statement of case, issues presented, standard of review, argument sections (dynamic list), prayer

## Data Model

### New Table: `motions`

```sql
CREATE TABLE motions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id     uuid NOT NULL REFERENCES cases(id),
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
-- RLS: user_id = auth.uid()
```

### New API Routes

- `POST /api/cases/[id]/motions` — Create/save motion
- `GET /api/cases/[id]/motions` — List motions for case
- `PATCH /api/motions/[id]` — Update motion

### Generate-Filing Refactor: Registry Pattern

Replace the growing if/else chain with a clean lookup:

```typescript
const MOTION_REGISTRY: Record<string, { schema: ZodSchema; buildPrompt: Function }> = {
  amended_complaint: { schema: amendedComplaintFactsSchema, buildPrompt: buildAmendedComplaintPrompt },
  motion_to_remand: { schema: remandMotionFactsSchema, buildPrompt: buildRemandMotionPrompt },
  default_judgment: { schema: defaultJudgmentFactsSchema, buildPrompt: buildDefaultJudgmentPrompt },
  motion_to_compel: { schema: motionToCompelSchema, buildPrompt: buildMotionToCompelPrompt },
  // ... all types
}

// In POST handler:
const handler = MOTION_REGISTRY[documentType]
if (handler) {
  const parsed = handler.schema.safeParse(body.facts)
  if (!parsed.success) return NextResponse.json({ error: 'Validation failed', ... }, { status: 422 })
  prompt = handler.buildPrompt(parsed.data)
  auditDocType = documentType
}
```

### Gatekeeper Rules (New)

| Rule | Trigger | Unlocks |
|------|---------|---------|
| Rule 16 | Discovery pack response overdue | `motion_to_compel` task |
| Rule 17 | Trial date set, <=60 days away | `trial_prep_checklist` task |
| Rule 18 | Notice of Appeal completed | `appellate_brief` task |

## Prompt Strategy

All prompts follow the established pattern from `removal-prompts.ts`:
- System: "legal document formatting assistant" preamble, DRAFT disclaimer, document format instructions
- User: structured facts in labeled sections
- Safety: all output passes through `isFilingOutputSafe()` before returning
- Model: claude-sonnet-4-20250514, max_tokens 4096

## Testing Strategy

- Each motion config gets a `tests/unit/rules/{motion-key}-prompts.test.ts` with schema validation + prompt content tests (TDD)
- MotionBuilder component gets integration tests for form rendering, validation, and state hydration
- Generate-filing registry gets tests for routing to correct handler
- Gatekeeper rules get unit tests for new Rule 16-18

## File Summary (Estimated)

| File | Action |
|------|--------|
| `src/lib/motions/types.ts` | Create — FieldConfig, MotionConfig types |
| `src/lib/motions/registry.ts` | Create — motion config registry |
| `src/lib/motions/configs/*.ts` (6 files) | Create — one per motion type |
| `src/lib/motions/trial-prep-config.ts` | Create — trial prep checklist content |
| `src/components/step/motion-builder.tsx` | Create — reusable MotionBuilder component |
| `src/components/step/trial-prep-checklist-step.tsx` | Create — educational checklist |
| `src/app/case/[id]/motions/page.tsx` | Create — Motions Hub |
| `src/app/case/[id]/motions/[motionKey]/page.tsx` | Create — individual motion page |
| `src/app/api/cases/[id]/motions/route.ts` | Create — motions CRUD API |
| `src/app/api/motions/[id]/route.ts` | Create — motion update API |
| `src/app/api/cases/[id]/generate-filing/route.ts` | Modify — registry refactor + 6 new types |
| `src/app/case/[id]/step/[taskId]/page.tsx` | Modify — add motion task key cases |
| `src/lib/rules/gatekeeper.ts` | Modify — add Rules 16-18 |
| `supabase/migrations/...` | Create — motions table + task seeding |
| `tests/unit/rules/*.test.ts` (6+ files) | Create — prompt/schema tests |
