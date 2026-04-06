# Case File Command Center — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace 4 disconnected features (Evidence, Exhibits, Discovery, Binders) with a unified Case File hub featuring a 4-stage pipeline, AI assistant, and cross-referencing.

**Architecture:** New `/case/[id]/case-file` hub page with stage tabs (Collect, Organize, Discover, Prepare). Existing components refactored into stage detail views. New Supabase tables for checklists, suggestions, evidence-discovery links, and build progress. AI integration via Anthropic SDK for suggestions, exhibit titles, discovery packs, case summaries, and strategy notes.

**Tech Stack:** Next.js 16 App Router, Supabase (PostgreSQL + RLS), Tailwind CSS 4, shadcn/ui, Zod 4, Anthropic SDK, Vitest

**Design Doc:** `docs/plans/2026-03-10-case-file-pipeline-design.md`

---

## Phase 1: Database Foundation

### Task 1: Create case_file_checklists migration

**Files:**
- Create: `supabase/migrations/20260310000001_case_file_pipeline_tables.sql`

**Step 1: Write the migration**

```sql
-- ============================================
-- Case File Pipeline — New Tables
-- Supports unified evidence-to-trial pipeline
-- ============================================

-- ── case_file_checklists ───────────────────────

CREATE TABLE public.case_file_checklists (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id       uuid        REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL UNIQUE,
  model         text,
  generated_at  timestamptz NOT NULL DEFAULT now(),
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_case_file_checklists_case ON public.case_file_checklists (case_id);

ALTER TABLE public.case_file_checklists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own checklists"
  ON public.case_file_checklists FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = case_file_checklists.case_id
      AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own checklists"
  ON public.case_file_checklists FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = case_file_checklists.case_id
      AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own checklists"
  ON public.case_file_checklists FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = case_file_checklists.case_id
      AND cases.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = case_file_checklists.case_id
      AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own checklists"
  ON public.case_file_checklists FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = case_file_checklists.case_id
      AND cases.user_id = auth.uid()
  ));

-- ── case_file_checklist_items ──────────────────

CREATE TABLE public.case_file_checklist_items (
  id                    uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_id          uuid        REFERENCES public.case_file_checklists(id) ON DELETE CASCADE NOT NULL,
  label                 text        NOT NULL,
  category              text,
  matched_evidence_id   uuid        REFERENCES public.evidence_items(id) ON DELETE SET NULL,
  checked               boolean     NOT NULL DEFAULT false,
  sort_order            int         NOT NULL DEFAULT 0,
  created_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_checklist_items_checklist ON public.case_file_checklist_items (checklist_id);

ALTER TABLE public.case_file_checklist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own checklist items"
  ON public.case_file_checklist_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.case_file_checklists c
    JOIN public.cases ON cases.id = c.case_id
    WHERE c.id = case_file_checklist_items.checklist_id
      AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own checklist items"
  ON public.case_file_checklist_items FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.case_file_checklists c
    JOIN public.cases ON cases.id = c.case_id
    WHERE c.id = case_file_checklist_items.checklist_id
      AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own checklist items"
  ON public.case_file_checklist_items FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.case_file_checklists c
    JOIN public.cases ON cases.id = c.case_id
    WHERE c.id = case_file_checklist_items.checklist_id
      AND cases.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.case_file_checklists c
    JOIN public.cases ON cases.id = c.case_id
    WHERE c.id = case_file_checklist_items.checklist_id
      AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own checklist items"
  ON public.case_file_checklist_items FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.case_file_checklists c
    JOIN public.cases ON cases.id = c.case_id
    WHERE c.id = case_file_checklist_items.checklist_id
      AND cases.user_id = auth.uid()
  ));

-- ── discovery_item_evidence_links ──────────────

CREATE TABLE public.discovery_item_evidence_links (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  discovery_item_id   uuid        REFERENCES public.discovery_items(id) ON DELETE CASCADE NOT NULL,
  evidence_item_id    uuid        REFERENCES public.evidence_items(id) ON DELETE CASCADE NOT NULL,
  created_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE(discovery_item_id, evidence_item_id)
);

CREATE INDEX idx_diel_discovery ON public.discovery_item_evidence_links (discovery_item_id);
CREATE INDEX idx_diel_evidence ON public.discovery_item_evidence_links (evidence_item_id);

ALTER TABLE public.discovery_item_evidence_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own discovery-evidence links"
  ON public.discovery_item_evidence_links FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.discovery_items di
    JOIN public.discovery_packs dp ON dp.id = di.pack_id
    JOIN public.cases ON cases.id = dp.case_id
    WHERE di.id = discovery_item_evidence_links.discovery_item_id
      AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own discovery-evidence links"
  ON public.discovery_item_evidence_links FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.discovery_items di
    JOIN public.discovery_packs dp ON dp.id = di.pack_id
    JOIN public.cases ON cases.id = dp.case_id
    WHERE di.id = discovery_item_evidence_links.discovery_item_id
      AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own discovery-evidence links"
  ON public.discovery_item_evidence_links FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.discovery_items di
    JOIN public.discovery_packs dp ON dp.id = di.pack_id
    JOIN public.cases ON cases.id = dp.case_id
    WHERE di.id = discovery_item_evidence_links.discovery_item_id
      AND cases.user_id = auth.uid()
  ));

-- ── binder_build_steps ─────────────────────────

CREATE TABLE public.binder_build_steps (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  binder_id     uuid        REFERENCES public.trial_binders(id) ON DELETE CASCADE NOT NULL,
  step_key      text        NOT NULL,
  status        text        NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending', 'running', 'done', 'failed')),
  error         text,
  started_at    timestamptz,
  completed_at  timestamptz
);

CREATE INDEX idx_binder_build_steps_binder ON public.binder_build_steps (binder_id);

ALTER TABLE public.binder_build_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own binder build steps"
  ON public.binder_build_steps FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.trial_binders tb
    JOIN public.cases ON cases.id = tb.case_id
    WHERE tb.id = binder_build_steps.binder_id
      AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own binder build steps"
  ON public.binder_build_steps FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.trial_binders tb
    JOIN public.cases ON cases.id = tb.case_id
    WHERE tb.id = binder_build_steps.binder_id
      AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own binder build steps"
  ON public.binder_build_steps FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.trial_binders tb
    JOIN public.cases ON cases.id = tb.case_id
    WHERE tb.id = binder_build_steps.binder_id
      AND cases.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.trial_binders tb
    JOIN public.cases ON cases.id = tb.case_id
    WHERE tb.id = binder_build_steps.binder_id
      AND cases.user_id = auth.uid()
  ));

-- ── case_file_suggestions ──────────────────────

CREATE TABLE public.case_file_suggestions (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id           uuid        REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
  suggestion_type   text        NOT NULL CHECK (suggestion_type IN ('next_step', 'stage_guide', 'action_result')),
  priority          text        NOT NULL CHECK (priority IN ('urgent', 'recommended', 'nice_to_have')),
  title             text        NOT NULL,
  description       text        NOT NULL,
  action_type       text        NOT NULL CHECK (action_type IN ('navigate', 'ai_trigger', 'info')),
  action_payload    jsonb       NOT NULL DEFAULT '{}'::jsonb,
  dismissed         boolean     NOT NULL DEFAULT false,
  created_at        timestamptz NOT NULL DEFAULT now(),
  expires_at        timestamptz
);

CREATE INDEX idx_case_file_suggestions_case ON public.case_file_suggestions (case_id);
CREATE INDEX idx_case_file_suggestions_active ON public.case_file_suggestions (case_id)
  WHERE dismissed = false;

ALTER TABLE public.case_file_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own suggestions"
  ON public.case_file_suggestions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = case_file_suggestions.case_id
      AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own suggestions"
  ON public.case_file_suggestions FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = case_file_suggestions.case_id
      AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own suggestions"
  ON public.case_file_suggestions FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = case_file_suggestions.case_id
      AND cases.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = case_file_suggestions.case_id
      AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own suggestions"
  ON public.case_file_suggestions FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = case_file_suggestions.case_id
      AND cases.user_id = auth.uid()
  ));

-- ── Alter existing tables ──────────────────────

-- evidence_items: add edited_at
ALTER TABLE public.evidence_items ADD COLUMN IF NOT EXISTS edited_at timestamptz;

-- trial_binders: add version tracking and regeneration
ALTER TABLE public.trial_binders
  ADD COLUMN IF NOT EXISTS version int NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS parent_binder_id uuid REFERENCES public.trial_binders(id) ON DELETE SET NULL;

-- ── renumber_exhibits RPC ──────────────────────

CREATE OR REPLACE FUNCTION public.renumber_exhibits(p_exhibit_set_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_row RECORD;
  v_counter int := 1;
BEGIN
  -- ① Verify ownership via RLS (SELECT will fail if not owner)
  PERFORM 1 FROM public.exhibit_sets WHERE id = p_exhibit_set_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Exhibit set not found';
  END IF;

  -- ② Renumber all exhibits by sort_order
  FOR v_row IN
    SELECT id FROM public.exhibits
    WHERE exhibit_set_id = p_exhibit_set_id
    ORDER BY sort_order ASC, created_at ASC
  LOOP
    UPDATE public.exhibits
    SET exhibit_no = v_counter
    WHERE id = v_row.id;
    v_counter := v_counter + 1;
  END LOOP;

  -- ③ Update next_number on the set
  UPDATE public.exhibit_sets
  SET next_number = v_counter
  WHERE id = p_exhibit_set_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.renumber_exhibits(uuid) TO authenticated;
```

**Step 2: Apply migration locally**

Run: `npx supabase db push` (or `npx supabase migration up` depending on local setup)
Expected: Migration applies without errors

**Step 3: Commit**

```bash
git add supabase/migrations/20260310000001_case_file_pipeline_tables.sql
git commit -m "feat: add case file pipeline database tables

New tables: case_file_checklists, case_file_checklist_items,
discovery_item_evidence_links, binder_build_steps, case_file_suggestions.
Adds renumber_exhibits RPC. Extends evidence_items and trial_binders."
```

---

## Phase 2: Schemas & Validation

### Task 2: Create Zod schemas for new tables

**Files:**
- Create: `src/lib/schemas/case-file.ts`
- Test: `tests/unit/schemas/case-file.test.ts`

**Step 1: Write the failing test**

```typescript
import { describe, it, expect } from 'vitest'
import {
  createChecklistItemSchema,
  updateChecklistItemSchema,
  createSuggestionSchema,
  dismissSuggestionSchema,
  createEvidenceLinkSchema,
  SUGGESTION_TYPES,
  SUGGESTION_PRIORITIES,
  SUGGESTION_ACTION_TYPES,
} from '@/lib/schemas/case-file'

describe('case-file schemas', () => {
  // -----------------------------------------------------------------------
  // createChecklistItemSchema
  // -----------------------------------------------------------------------
  it('validates a valid checklist item', () => {
    const result = createChecklistItemSchema.safeParse({
      label: 'Original signed contract',
      category: 'contract',
      sort_order: 0,
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty label', () => {
    const result = createChecklistItemSchema.safeParse({
      label: '',
      category: 'contract',
    })
    expect(result.success).toBe(false)
  })

  // -----------------------------------------------------------------------
  // updateChecklistItemSchema
  // -----------------------------------------------------------------------
  it('allows partial update of checklist item', () => {
    const result = updateChecklistItemSchema.safeParse({
      checked: true,
    })
    expect(result.success).toBe(true)
  })

  it('allows linking matched evidence', () => {
    const result = updateChecklistItemSchema.safeParse({
      matched_evidence_id: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.success).toBe(true)
  })

  // -----------------------------------------------------------------------
  // createSuggestionSchema
  // -----------------------------------------------------------------------
  it('validates a valid suggestion', () => {
    const result = createSuggestionSchema.safeParse({
      suggestion_type: 'next_step',
      priority: 'recommended',
      title: 'Add evidence to exhibits',
      description: 'You have 4 unexhibited items.',
      action_type: 'navigate',
      action_payload: { route: '/case/123/case-file?stage=organize' },
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid suggestion_type', () => {
    const result = createSuggestionSchema.safeParse({
      suggestion_type: 'invalid',
      priority: 'recommended',
      title: 'Test',
      description: 'Test',
      action_type: 'navigate',
    })
    expect(result.success).toBe(false)
  })

  // -----------------------------------------------------------------------
  // createEvidenceLinkSchema
  // -----------------------------------------------------------------------
  it('validates a valid evidence link', () => {
    const result = createEvidenceLinkSchema.safeParse({
      discovery_item_id: '550e8400-e29b-41d4-a716-446655440000',
      evidence_item_id: '550e8400-e29b-41d4-a716-446655440001',
    })
    expect(result.success).toBe(true)
  })

  it('rejects non-uuid evidence link ids', () => {
    const result = createEvidenceLinkSchema.safeParse({
      discovery_item_id: 'not-a-uuid',
      evidence_item_id: '550e8400-e29b-41d4-a716-446655440001',
    })
    expect(result.success).toBe(false)
  })

  // -----------------------------------------------------------------------
  // constants
  // -----------------------------------------------------------------------
  it('exports correct suggestion type constants', () => {
    expect(SUGGESTION_TYPES).toEqual(['next_step', 'stage_guide', 'action_result'])
    expect(SUGGESTION_PRIORITIES).toEqual(['urgent', 'recommended', 'nice_to_have'])
    expect(SUGGESTION_ACTION_TYPES).toEqual(['navigate', 'ai_trigger', 'info'])
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/schemas/case-file.test.ts`
Expected: FAIL — module not found

**Step 3: Write the schema**

```typescript
// src/lib/schemas/case-file.ts
import { z } from 'zod'

// ── Constants ──────────────────────────────────

export const SUGGESTION_TYPES = ['next_step', 'stage_guide', 'action_result'] as const
export type SuggestionType = (typeof SUGGESTION_TYPES)[number]

export const SUGGESTION_PRIORITIES = ['urgent', 'recommended', 'nice_to_have'] as const
export type SuggestionPriority = (typeof SUGGESTION_PRIORITIES)[number]

export const SUGGESTION_ACTION_TYPES = ['navigate', 'ai_trigger', 'info'] as const
export type SuggestionActionType = (typeof SUGGESTION_ACTION_TYPES)[number]

export const PIPELINE_STAGES = ['collect', 'organize', 'discover', 'prepare'] as const
export type PipelineStage = (typeof PIPELINE_STAGES)[number]

// ── Checklist Schemas ──────────────────────────

export const createChecklistItemSchema = z.object({
  label: z.string().min(1).max(500),
  category: z.string().max(100).optional(),
  sort_order: z.number().int().min(0).optional(),
})

export type CreateChecklistItemInput = z.infer<typeof createChecklistItemSchema>

export const updateChecklistItemSchema = z.object({
  checked: z.boolean().optional(),
  matched_evidence_id: z.string().uuid().nullable().optional(),
  label: z.string().min(1).max(500).optional(),
})

export type UpdateChecklistItemInput = z.infer<typeof updateChecklistItemSchema>

// ── Suggestion Schemas ─────────────────────────

export const createSuggestionSchema = z.object({
  suggestion_type: z.enum(SUGGESTION_TYPES),
  priority: z.enum(SUGGESTION_PRIORITIES),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  action_type: z.enum(SUGGESTION_ACTION_TYPES),
  action_payload: z.record(z.unknown()).optional().default({}),
  expires_at: z.string().datetime().optional(),
})

export type CreateSuggestionInput = z.infer<typeof createSuggestionSchema>

export const dismissSuggestionSchema = z.object({
  suggestion_id: z.string().uuid(),
})

export type DismissSuggestionInput = z.infer<typeof dismissSuggestionSchema>

// ── Evidence Link Schemas ──────────────────────

export const createEvidenceLinkSchema = z.object({
  discovery_item_id: z.string().uuid(),
  evidence_item_id: z.string().uuid(),
})

export type CreateEvidenceLinkInput = z.infer<typeof createEvidenceLinkSchema>

// ── Pipeline Stage Schema ──────────────────────

export const pipelineStageSchema = z.enum(PIPELINE_STAGES)
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/schemas/case-file.test.ts`
Expected: PASS — all 8 tests pass

**Step 5: Commit**

```bash
git add src/lib/schemas/case-file.ts tests/unit/schemas/case-file.test.ts
git commit -m "feat: add Zod schemas for case file pipeline"
```

---

## Phase 3: AI Utilities

### Task 3: Create AI evidence checklist generator

**Files:**
- Create: `src/lib/ai/evidence-checklist.ts`
- Test: `tests/unit/ai/evidence-checklist.test.ts`

**Step 1: Write the failing test**

```typescript
import { describe, it, expect } from 'vitest'
import {
  buildChecklistPrompt,
  isChecklistSafe,
  buildStaticChecklist,
  EVIDENCE_CHECKLIST_SYSTEM_PROMPT,
  checklistSchema,
} from '@/lib/ai/evidence-checklist'

describe('evidence-checklist AI utility', () => {
  // -----------------------------------------------------------------------
  // buildStaticChecklist — fallback when AI unavailable
  // -----------------------------------------------------------------------
  it('returns debt defense checklist', () => {
    const result = buildStaticChecklist({ dispute_type: 'debt', state: 'TX' })
    expect(result.items.length).toBeGreaterThanOrEqual(4)
    expect(result.items[0]).toHaveProperty('label')
    expect(result.items[0]).toHaveProperty('category')
  })

  it('returns small claims checklist', () => {
    const result = buildStaticChecklist({ dispute_type: 'small_claims', state: 'TX' })
    expect(result.items.length).toBeGreaterThanOrEqual(3)
  })

  it('returns personal injury checklist', () => {
    const result = buildStaticChecklist({ dispute_type: 'personal_injury', state: 'CA' })
    expect(result.items.some(i => i.category === 'medical_records')).toBe(true)
  })

  it('returns family law checklist', () => {
    const result = buildStaticChecklist({ dispute_type: 'family', state: 'TX' })
    expect(result.items.length).toBeGreaterThanOrEqual(4)
  })

  it('returns landlord tenant checklist', () => {
    const result = buildStaticChecklist({ dispute_type: 'landlord_tenant', state: 'NY' })
    expect(result.items.some(i => i.label.toLowerCase().includes('lease'))).toBe(true)
  })

  it('returns generic checklist for unknown dispute type', () => {
    const result = buildStaticChecklist({ dispute_type: 'unknown' as any, state: 'TX' })
    expect(result.items.length).toBeGreaterThanOrEqual(2)
  })

  // -----------------------------------------------------------------------
  // buildChecklistPrompt
  // -----------------------------------------------------------------------
  it('builds prompt with dispute type and state', () => {
    const prompt = buildChecklistPrompt({
      dispute_type: 'debt',
      state: 'TX',
      role: 'defendant',
      existing_categories: ['contract'],
    })
    expect(prompt).toContain('debt')
    expect(prompt).toContain('Texas')
    expect(prompt).toContain('defendant')
  })

  // -----------------------------------------------------------------------
  // isChecklistSafe
  // -----------------------------------------------------------------------
  it('marks safe checklist as safe', () => {
    expect(isChecklistSafe('Gather original signed contract')).toBe(true)
  })

  it('blocks unsafe checklist items', () => {
    expect(isChecklistSafe('You must file a motion to dismiss')).toBe(false)
    expect(isChecklistSafe('This guarantees victory')).toBe(false)
  })

  // -----------------------------------------------------------------------
  // checklistSchema
  // -----------------------------------------------------------------------
  it('validates proper checklist response', () => {
    const result = checklistSchema.safeParse({
      items: [
        { label: 'Original contract', category: 'contract' },
        { label: 'Payment receipts', category: 'financial_records' },
      ],
    })
    expect(result.success).toBe(true)
  })

  // -----------------------------------------------------------------------
  // system prompt
  // -----------------------------------------------------------------------
  it('exports system prompt', () => {
    expect(EVIDENCE_CHECKLIST_SYSTEM_PROMPT).toContain('evidence')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/ai/evidence-checklist.test.ts`
Expected: FAIL — module not found

**Step 3: Write the implementation**

```typescript
// src/lib/ai/evidence-checklist.ts
import { z } from 'zod'

const BLOCKED_PHRASES = [
  'you must', 'you should file', 'guaranteed', 'sanctions',
  'this guarantees', 'legal advice', 'i recommend filing',
  'sue them', 'you will win',
]

export const EVIDENCE_CHECKLIST_SYSTEM_PROMPT = `You are a legal organization assistant helping a self-represented litigant identify what evidence they should collect for their case. You provide general information about document categories — never legal advice.

Return a JSON object with an "items" array. Each item has:
- "label": plain English description of the evidence to collect (max 100 chars)
- "category": one of "contract", "photos", "emails", "text_messages", "financial_records", "medical_records", "other"

Return 5-8 items prioritized by importance. Do NOT use phrases like "you must", "you should file", "guaranteed", or anything resembling legal advice.`

export const checklistSchema = z.object({
  items: z.array(z.object({
    label: z.string().min(1).max(500),
    category: z.string(),
  })).min(1).max(20),
})

export type ChecklistResponse = z.infer<typeof checklistSchema>

export function isChecklistSafe(text: string): boolean {
  const lower = text.toLowerCase()
  return !BLOCKED_PHRASES.some(phrase => lower.includes(phrase))
}

export function buildChecklistPrompt(input: {
  dispute_type: string
  state: string
  role?: string
  existing_categories?: string[]
}): string {
  const stateNames: Record<string, string> = {
    TX: 'Texas', CA: 'California', NY: 'New York', FL: 'Florida', PA: 'Pennsylvania',
  }
  const stateName = stateNames[input.state] || input.state
  const roleStr = input.role ? ` as the ${input.role}` : ''
  const existingStr = input.existing_categories?.length
    ? `\n\nThe user already has evidence in these categories: ${input.existing_categories.join(', ')}. Focus on what's missing.`
    : ''

  return `Generate an evidence collection checklist for a ${input.dispute_type.replace(/_/g, ' ')} case in ${stateName}${roleStr}.${existingStr}`
}

interface StaticChecklistItem {
  label: string
  category: string
}

const STATIC_CHECKLISTS: Record<string, StaticChecklistItem[]> = {
  debt: [
    { label: 'Original signed credit agreement or contract', category: 'contract' },
    { label: 'Complete payment or transaction history', category: 'financial_records' },
    { label: 'Collection letters or demand notices received', category: 'emails' },
    { label: 'Communication with creditor (emails, letters)', category: 'emails' },
    { label: 'Credit report showing the debt', category: 'financial_records' },
    { label: 'Any written dispute letters you sent', category: 'emails' },
  ],
  small_claims: [
    { label: 'Contract or written agreement', category: 'contract' },
    { label: 'Receipts, invoices, or payment records', category: 'financial_records' },
    { label: 'Photos of damage or defective goods', category: 'photos' },
    { label: 'Text messages or emails about the dispute', category: 'text_messages' },
    { label: 'Estimates or repair quotes', category: 'financial_records' },
  ],
  personal_injury: [
    { label: 'Medical records and bills', category: 'medical_records' },
    { label: 'Photos of injuries and accident scene', category: 'photos' },
    { label: 'Police or incident report', category: 'other' },
    { label: 'Insurance correspondence', category: 'emails' },
    { label: 'Pay stubs or proof of lost wages', category: 'financial_records' },
    { label: 'Witness contact information', category: 'other' },
    { label: 'Prescription and treatment records', category: 'medical_records' },
  ],
  family: [
    { label: 'Marriage certificate', category: 'contract' },
    { label: 'Financial statements (bank, retirement, assets)', category: 'financial_records' },
    { label: 'Tax returns (last 2-3 years)', category: 'financial_records' },
    { label: 'Pay stubs or proof of income', category: 'financial_records' },
    { label: 'Property deeds or lease agreements', category: 'contract' },
    { label: 'Communication about children (texts, emails)', category: 'text_messages' },
  ],
  landlord_tenant: [
    { label: 'Lease or rental agreement', category: 'contract' },
    { label: 'Rent payment receipts or records', category: 'financial_records' },
    { label: 'Photos of property condition', category: 'photos' },
    { label: 'Communication with landlord/tenant', category: 'text_messages' },
    { label: 'Repair requests or maintenance records', category: 'emails' },
    { label: 'Security deposit documentation', category: 'financial_records' },
  ],
}

const GENERIC_CHECKLIST: StaticChecklistItem[] = [
  { label: 'Contracts or written agreements', category: 'contract' },
  { label: 'Financial records (receipts, invoices, statements)', category: 'financial_records' },
  { label: 'Relevant communications (emails, texts, letters)', category: 'emails' },
  { label: 'Photos or videos', category: 'photos' },
]

export function buildStaticChecklist(input: {
  dispute_type: string
  state?: string
}): ChecklistResponse {
  const items = STATIC_CHECKLISTS[input.dispute_type] || GENERIC_CHECKLIST
  return { items }
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/ai/evidence-checklist.test.ts`
Expected: PASS — all tests pass

**Step 5: Commit**

```bash
git add src/lib/ai/evidence-checklist.ts tests/unit/ai/evidence-checklist.test.ts
git commit -m "feat: add AI evidence checklist generator with static fallbacks"
```

---

### Task 4: Create AI exhibit suggestion utility

**Files:**
- Create: `src/lib/ai/exhibit-suggestions.ts`
- Test: `tests/unit/ai/exhibit-suggestions.test.ts`

**Step 1: Write the failing test**

```typescript
import { describe, it, expect } from 'vitest'
import {
  buildExhibitSuggestionPrompt,
  isExhibitSuggestionSafe,
  exhibitSuggestionSchema,
  EXHIBIT_SUGGESTION_SYSTEM_PROMPT,
} from '@/lib/ai/exhibit-suggestions'

describe('exhibit-suggestions AI utility', () => {
  it('builds prompt with evidence and case context', () => {
    const prompt = buildExhibitSuggestionPrompt({
      dispute_type: 'debt',
      state: 'TX',
      existing_exhibits: [{ exhibit_no: 1, title: 'Original Contract' }],
      unexhibited_evidence: [
        { id: '1', file_name: 'payments.pdf', category: 'financial_records', notes: 'Monthly payments' },
        { id: '2', file_name: 'letter.pdf', category: 'emails', notes: null },
      ],
    })
    expect(prompt).toContain('debt')
    expect(prompt).toContain('payments.pdf')
    expect(prompt).toContain('Exhibit 1')
  })

  it('validates suggestion response schema', () => {
    const result = exhibitSuggestionSchema.safeParse({
      suggestions: [
        {
          evidence_id: '550e8400-e29b-41d4-a716-446655440000',
          suggested_title: 'Payment History Records',
          reason: 'Shows regular payment pattern',
        },
      ],
    })
    expect(result.success).toBe(true)
  })

  it('rejects suggestion with empty title', () => {
    const result = exhibitSuggestionSchema.safeParse({
      suggestions: [{
        evidence_id: '550e8400-e29b-41d4-a716-446655440000',
        suggested_title: '',
        reason: 'Test',
      }],
    })
    expect(result.success).toBe(false)
  })

  it('blocks unsafe suggestion text', () => {
    expect(isExhibitSuggestionSafe('Payment records')).toBe(true)
    expect(isExhibitSuggestionSafe('You must submit this to win')).toBe(false)
  })

  it('exports system prompt', () => {
    expect(EXHIBIT_SUGGESTION_SYSTEM_PROMPT).toContain('exhibit')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/ai/exhibit-suggestions.test.ts`
Expected: FAIL — module not found

**Step 3: Write the implementation**

```typescript
// src/lib/ai/exhibit-suggestions.ts
import { z } from 'zod'

const BLOCKED_PHRASES = [
  'you must', 'you should file', 'guaranteed', 'sanctions',
  'this guarantees', 'legal advice', 'you will win',
]

export const EXHIBIT_SUGGESTION_SYSTEM_PROMPT = `You are a legal organization assistant helping a self-represented litigant decide which evidence items to designate as trial exhibits. You provide general organizational suggestions — never legal advice.

Return a JSON object with a "suggestions" array. Each suggestion has:
- "evidence_id": the ID of the evidence item to exhibit
- "suggested_title": a clear, professional exhibit title (max 100 chars)
- "reason": why this item is important for the case (max 200 chars)

Order suggestions by importance. Only suggest items that are genuinely relevant to the case type.`

export const exhibitSuggestionSchema = z.object({
  suggestions: z.array(z.object({
    evidence_id: z.string(),
    suggested_title: z.string().min(1).max(200),
    reason: z.string().min(1).max(500),
  })),
})

export type ExhibitSuggestionResponse = z.infer<typeof exhibitSuggestionSchema>

export function isExhibitSuggestionSafe(text: string): boolean {
  const lower = text.toLowerCase()
  return !BLOCKED_PHRASES.some(phrase => lower.includes(phrase))
}

export function buildExhibitSuggestionPrompt(input: {
  dispute_type: string
  state: string
  existing_exhibits: Array<{ exhibit_no: number; title: string }>
  unexhibited_evidence: Array<{ id: string; file_name: string; category: string; notes: string | null }>
}): string {
  const existingStr = input.existing_exhibits.length > 0
    ? `\n\nAlready exhibited:\n${input.existing_exhibits.map(e => `- Exhibit ${e.exhibit_no}: ${e.title}`).join('\n')}`
    : '\n\nNo exhibits created yet.'

  const evidenceStr = input.unexhibited_evidence
    .map(e => `- ID: ${e.id} | File: ${e.file_name} | Category: ${e.category}${e.notes ? ` | Notes: ${e.notes}` : ''}`)
    .join('\n')

  return `Suggest which evidence items to designate as exhibits for a ${input.dispute_type.replace(/_/g, ' ')} case in ${input.state}.${existingStr}

Available (unexhibited) evidence:
${evidenceStr}`
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/ai/exhibit-suggestions.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/ai/exhibit-suggestions.ts tests/unit/ai/exhibit-suggestions.test.ts
git commit -m "feat: add AI exhibit suggestion utility"
```

---

### Task 5: Create AI case file suggestion generator

**Files:**
- Create: `src/lib/ai/case-file-suggestions.ts`
- Test: `tests/unit/ai/case-file-suggestions.test.ts`

**Step 1: Write the failing test**

```typescript
import { describe, it, expect } from 'vitest'
import {
  generateStaticSuggestions,
  CASE_FILE_SUGGESTION_SYSTEM_PROMPT,
  suggestionResponseSchema,
} from '@/lib/ai/case-file-suggestions'

/** Helper to build pipeline state */
function makeState(overrides: Partial<Parameters<typeof generateStaticSuggestions>[0]> = {}) {
  return {
    dispute_type: 'debt',
    evidence_count: 0,
    exhibited_count: 0,
    unexhibited_count: 0,
    discovery_pack_count: 0,
    discovery_packs_complete: 0,
    binder_count: 0,
    latest_binder_at: null as string | null,
    evidence_changed_since_binder: false,
    flagged_objections: 0,
    approaching_deadlines: 0,
    ...overrides,
  }
}

describe('case-file-suggestions', () => {
  // -----------------------------------------------------------------------
  // Empty case — should suggest uploading evidence
  // -----------------------------------------------------------------------
  it('suggests uploading evidence for empty case', () => {
    const suggestions = generateStaticSuggestions(makeState())
    expect(suggestions.length).toBeGreaterThanOrEqual(1)
    expect(suggestions[0].action_type).toBe('navigate')
    expect(suggestions[0].title.toLowerCase()).toContain('evidence')
  })

  // -----------------------------------------------------------------------
  // Has evidence, no exhibits — should suggest organizing
  // -----------------------------------------------------------------------
  it('suggests exhibiting when evidence exists but no exhibits', () => {
    const suggestions = generateStaticSuggestions(makeState({
      evidence_count: 8,
      unexhibited_count: 8,
    }))
    expect(suggestions.some(s => s.title.toLowerCase().includes('exhibit'))).toBe(true)
  })

  // -----------------------------------------------------------------------
  // Has exhibits, no discovery — should suggest discovery
  // -----------------------------------------------------------------------
  it('suggests discovery when exhibits exist but no packs', () => {
    const suggestions = generateStaticSuggestions(makeState({
      evidence_count: 8,
      exhibited_count: 6,
      unexhibited_count: 2,
    }))
    expect(suggestions.some(s => s.title.toLowerCase().includes('discovery'))).toBe(true)
  })

  // -----------------------------------------------------------------------
  // Everything ready, no binder — should suggest generating
  // -----------------------------------------------------------------------
  it('suggests binder when case is trial-ready', () => {
    const suggestions = generateStaticSuggestions(makeState({
      evidence_count: 8,
      exhibited_count: 6,
      unexhibited_count: 2,
      discovery_pack_count: 1,
      discovery_packs_complete: 1,
    }))
    expect(suggestions.some(s => s.title.toLowerCase().includes('binder'))).toBe(true)
  })

  // -----------------------------------------------------------------------
  // Stale binder — should suggest regeneration
  // -----------------------------------------------------------------------
  it('suggests regeneration when binder is stale', () => {
    const suggestions = generateStaticSuggestions(makeState({
      evidence_count: 8,
      exhibited_count: 6,
      unexhibited_count: 2,
      discovery_pack_count: 1,
      discovery_packs_complete: 1,
      binder_count: 1,
      latest_binder_at: '2026-03-01T00:00:00Z',
      evidence_changed_since_binder: true,
    }))
    expect(suggestions.some(s => s.title.toLowerCase().includes('regenerat'))).toBe(true)
  })

  // -----------------------------------------------------------------------
  // Flagged objections — should suggest addressing them
  // -----------------------------------------------------------------------
  it('suggests addressing flagged objections as urgent', () => {
    const suggestions = generateStaticSuggestions(makeState({
      evidence_count: 8,
      exhibited_count: 6,
      unexhibited_count: 2,
      discovery_pack_count: 1,
      flagged_objections: 3,
    }))
    const objectionSuggestion = suggestions.find(s => s.title.toLowerCase().includes('objection'))
    expect(objectionSuggestion).toBeDefined()
    expect(objectionSuggestion!.priority).toBe('urgent')
  })

  // -----------------------------------------------------------------------
  // Approaching deadlines — urgent priority
  // -----------------------------------------------------------------------
  it('marks approaching deadlines as urgent', () => {
    const suggestions = generateStaticSuggestions(makeState({
      approaching_deadlines: 2,
    }))
    const deadlineSuggestion = suggestions.find(s => s.priority === 'urgent')
    expect(deadlineSuggestion).toBeDefined()
  })

  // -----------------------------------------------------------------------
  // Max 5 suggestions
  // -----------------------------------------------------------------------
  it('returns at most 5 suggestions', () => {
    const suggestions = generateStaticSuggestions(makeState({
      evidence_count: 8,
      unexhibited_count: 8,
      approaching_deadlines: 2,
      flagged_objections: 3,
    }))
    expect(suggestions.length).toBeLessThanOrEqual(5)
  })

  // -----------------------------------------------------------------------
  // Schema validation
  // -----------------------------------------------------------------------
  it('validates AI response schema', () => {
    const result = suggestionResponseSchema.safeParse({
      suggestions: [{
        title: 'Upload evidence',
        description: 'Start by collecting your documents.',
        priority: 'recommended',
        action_type: 'navigate',
        action_payload: { stage: 'collect' },
      }],
    })
    expect(result.success).toBe(true)
  })

  it('exports system prompt', () => {
    expect(CASE_FILE_SUGGESTION_SYSTEM_PROMPT).toContain('suggestion')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/ai/case-file-suggestions.test.ts`
Expected: FAIL — module not found

**Step 3: Write the implementation**

```typescript
// src/lib/ai/case-file-suggestions.ts
import { z } from 'zod'
import type { SuggestionPriority, SuggestionActionType } from '@/lib/schemas/case-file'

export const CASE_FILE_SUGGESTION_SYSTEM_PROMPT = `You are a case organization assistant generating next-step suggestion items for a self-represented litigant's case file dashboard. Generate 3-5 actionable suggestions based on the case state.

Each suggestion must have:
- "title": short action phrase (max 80 chars)
- "description": why this matters (max 200 chars)
- "priority": "urgent" | "recommended" | "nice_to_have"
- "action_type": "navigate" | "ai_trigger" | "info"
- "action_payload": { "stage": "collect"|"organize"|"discover"|"prepare" } for navigation

Never give legal advice. Focus on organization and preparation tasks.`

export const suggestionResponseSchema = z.object({
  suggestions: z.array(z.object({
    title: z.string().min(1).max(200),
    description: z.string().min(1).max(500),
    priority: z.enum(['urgent', 'recommended', 'nice_to_have']),
    action_type: z.enum(['navigate', 'ai_trigger', 'info']),
    action_payload: z.record(z.unknown()).optional().default({}),
  })).min(1).max(5),
})

export type SuggestionResponse = z.infer<typeof suggestionResponseSchema>

interface PipelineState {
  dispute_type: string
  evidence_count: number
  exhibited_count: number
  unexhibited_count: number
  discovery_pack_count: number
  discovery_packs_complete: number
  binder_count: number
  latest_binder_at: string | null
  evidence_changed_since_binder: boolean
  flagged_objections: number
  approaching_deadlines: number
}

interface StaticSuggestion {
  title: string
  description: string
  priority: SuggestionPriority
  action_type: SuggestionActionType
  action_payload: Record<string, unknown>
}

export function generateStaticSuggestions(state: PipelineState): StaticSuggestion[] {
  const suggestions: StaticSuggestion[] = []

  // Urgent: approaching deadlines
  if (state.approaching_deadlines > 0) {
    suggestions.push({
      title: `${state.approaching_deadlines} deadline${state.approaching_deadlines > 1 ? 's' : ''} approaching`,
      description: 'Review and prepare for upcoming deadlines to avoid missing critical dates.',
      priority: 'urgent',
      action_type: 'navigate',
      action_payload: { stage: 'discover' },
    })
  }

  // Urgent: flagged objections
  if (state.flagged_objections > 0) {
    suggestions.push({
      title: `${state.flagged_objections} objection${state.flagged_objections > 1 ? 's' : ''} need attention`,
      description: 'Review flagged objections and consider sending a meet-and-confer letter.',
      priority: 'urgent',
      action_type: 'navigate',
      action_payload: { stage: 'discover' },
    })
  }

  // No evidence yet
  if (state.evidence_count === 0) {
    suggestions.push({
      title: 'Upload your key evidence',
      description: `Start by collecting documents relevant to your ${state.dispute_type.replace(/_/g, ' ')} case.`,
      priority: 'recommended',
      action_type: 'navigate',
      action_payload: { stage: 'collect' },
    })
  }

  // Has evidence but nothing exhibited
  if (state.evidence_count > 0 && state.unexhibited_count > 0) {
    suggestions.push({
      title: `${state.unexhibited_count} evidence item${state.unexhibited_count > 1 ? 's' : ''} not yet exhibited`,
      description: 'Add your key evidence as numbered exhibits for trial preparation.',
      priority: state.exhibited_count === 0 ? 'recommended' : 'nice_to_have',
      action_type: 'navigate',
      action_payload: { stage: 'organize' },
    })
  }

  // Has exhibits but no discovery
  if (state.exhibited_count > 0 && state.discovery_pack_count === 0) {
    suggestions.push({
      title: 'Start a discovery pack',
      description: 'Request documents and information from the other side to strengthen your case.',
      priority: 'recommended',
      action_type: 'navigate',
      action_payload: { stage: 'discover' },
    })
  }

  // Everything ready but no binder
  if (state.exhibited_count > 0 && state.discovery_packs_complete >= state.discovery_pack_count && state.discovery_pack_count > 0 && state.binder_count === 0) {
    suggestions.push({
      title: 'Generate your trial binder',
      description: 'Package your exhibits, timeline, and discovery into a court-ready binder.',
      priority: 'recommended',
      action_type: 'navigate',
      action_payload: { stage: 'prepare' },
    })
  }

  // Stale binder
  if (state.binder_count > 0 && state.evidence_changed_since_binder) {
    suggestions.push({
      title: 'Regenerate your trial binder',
      description: 'Your evidence has changed since the last binder was generated.',
      priority: 'recommended',
      action_type: 'navigate',
      action_payload: { stage: 'prepare' },
    })
  }

  // Return top 5
  return suggestions.slice(0, 5)
}

export function buildSuggestionPrompt(state: PipelineState): string {
  return `Generate next-step suggestions for a ${state.dispute_type.replace(/_/g, ' ')} case.

Current state:
- Evidence items: ${state.evidence_count} (${state.unexhibited_count} not exhibited)
- Exhibits: ${state.exhibited_count}
- Discovery packs: ${state.discovery_pack_count} (${state.discovery_packs_complete} complete)
- Trial binders: ${state.binder_count}${state.evidence_changed_since_binder ? ' (stale)' : ''}
- Flagged objections: ${state.flagged_objections}
- Approaching deadlines: ${state.approaching_deadlines}`
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/ai/case-file-suggestions.test.ts`
Expected: PASS — all 9 tests pass

**Step 5: Commit**

```bash
git add src/lib/ai/case-file-suggestions.ts tests/unit/ai/case-file-suggestions.test.ts
git commit -m "feat: add case file suggestion generator with static fallbacks"
```

---

### Task 6: Create AI discovery pack suggestion utility

**Files:**
- Create: `src/lib/ai/discovery-suggestions.ts`
- Test: `tests/unit/ai/discovery-suggestions.test.ts`

**Step 1: Write the failing test**

```typescript
import { describe, it, expect } from 'vitest'
import {
  buildDiscoverySuggestionPrompt,
  buildStaticDiscoveryPack,
  discoverySuggestionSchema,
  DISCOVERY_SUGGESTION_SYSTEM_PROMPT,
} from '@/lib/ai/discovery-suggestions'

describe('discovery-suggestions AI utility', () => {
  it('returns debt defense discovery items', () => {
    const pack = buildStaticDiscoveryPack({ dispute_type: 'debt', state: 'TX', role: 'defendant' })
    expect(pack.title).toContain('Interrogatories')
    expect(pack.items.length).toBeGreaterThanOrEqual(3)
    expect(pack.items.some(i => i.item_type === 'rfp')).toBe(true)
    expect(pack.items.some(i => i.item_type === 'rog')).toBe(true)
  })

  it('returns landlord tenant discovery items', () => {
    const pack = buildStaticDiscoveryPack({ dispute_type: 'landlord_tenant', state: 'TX', role: 'plaintiff' })
    expect(pack.items.length).toBeGreaterThanOrEqual(3)
  })

  it('returns generic items for unknown type', () => {
    const pack = buildStaticDiscoveryPack({ dispute_type: 'unknown' as any, state: 'TX', role: 'plaintiff' })
    expect(pack.items.length).toBeGreaterThanOrEqual(2)
  })

  it('builds prompt with context', () => {
    const prompt = buildDiscoverySuggestionPrompt({
      dispute_type: 'debt',
      state: 'TX',
      role: 'defendant',
      evidence_categories: ['contract', 'financial_records'],
    })
    expect(prompt).toContain('debt')
    expect(prompt).toContain('defendant')
    expect(prompt).toContain('contract')
  })

  it('validates discovery suggestion schema', () => {
    const result = discoverySuggestionSchema.safeParse({
      title: 'First Set of Discovery',
      items: [
        { item_type: 'rfp', prompt_text: 'Produce the original agreement' },
        { item_type: 'rog', prompt_text: 'State the identity of the original creditor' },
      ],
    })
    expect(result.success).toBe(true)
  })

  it('exports system prompt', () => {
    expect(DISCOVERY_SUGGESTION_SYSTEM_PROMPT).toContain('discovery')
  })
})
```

**Step 2: Run test → FAIL, Step 3: Implement**

```typescript
// src/lib/ai/discovery-suggestions.ts
import { z } from 'zod'

export const DISCOVERY_SUGGESTION_SYSTEM_PROMPT = `You are a legal organization assistant helping a self-represented litigant prepare discovery requests. Generate a discovery pack with appropriate requests based on the case type.

Return a JSON object with:
- "title": pack title (e.g., "First Set of Interrogatories and Requests for Production")
- "items": array of { "item_type": "rfp"|"rog"|"rfa", "prompt_text": "description of what to request" }

Focus on standard, commonly-used discovery items for the case type. Never give legal advice.`

export const discoverySuggestionSchema = z.object({
  title: z.string().min(1).max(200),
  items: z.array(z.object({
    item_type: z.enum(['rfp', 'rog', 'rfa']),
    prompt_text: z.string().min(1).max(1000),
  })).min(1).max(20),
})

export type DiscoverySuggestionResponse = z.infer<typeof discoverySuggestionSchema>

interface DiscoveryItem { item_type: 'rfp' | 'rog' | 'rfa'; prompt_text: string }

const STATIC_PACKS: Record<string, { title: string; items: DiscoveryItem[] }> = {
  debt: {
    title: 'First Set of Interrogatories and Requests for Production',
    items: [
      { item_type: 'rfp', prompt_text: 'Produce the original signed credit agreement or contract' },
      { item_type: 'rfp', prompt_text: 'Produce complete payment and transaction history for this account' },
      { item_type: 'rfp', prompt_text: 'Produce all assignment or sale documents showing chain of title' },
      { item_type: 'rog', prompt_text: 'State the identity of the original creditor and each subsequent holder of this debt' },
      { item_type: 'rog', prompt_text: 'State the total amount claimed and provide an itemized breakdown' },
      { item_type: 'rfa', prompt_text: 'Admit that you do not possess the original signed credit agreement' },
    ],
  },
  landlord_tenant: {
    title: 'First Set of Discovery Requests',
    items: [
      { item_type: 'rfp', prompt_text: 'Produce the complete lease or rental agreement' },
      { item_type: 'rfp', prompt_text: 'Produce all inspection reports and maintenance records for the property' },
      { item_type: 'rfp', prompt_text: 'Produce records of all rent payments received' },
      { item_type: 'rog', prompt_text: 'State the condition of the property at the time of move-in and move-out' },
      { item_type: 'rfa', prompt_text: 'Admit that the security deposit was not returned within the statutory period' },
    ],
  },
  small_claims: {
    title: 'Discovery Requests',
    items: [
      { item_type: 'rfp', prompt_text: 'Produce all contracts, receipts, or invoices related to this dispute' },
      { item_type: 'rfp', prompt_text: 'Produce all communications (emails, texts, letters) between the parties' },
      { item_type: 'rog', prompt_text: 'Describe the goods or services provided and any defects or failures' },
    ],
  },
  personal_injury: {
    title: 'First Set of Interrogatories and Requests for Production',
    items: [
      { item_type: 'rfp', prompt_text: 'Produce all insurance policies that may provide coverage for this incident' },
      { item_type: 'rfp', prompt_text: 'Produce any surveillance footage or photos of the incident location' },
      { item_type: 'rfp', prompt_text: 'Produce all incident or accident reports prepared by any person' },
      { item_type: 'rog', prompt_text: 'Describe in detail the maintenance and inspection history of the premises or vehicle' },
      { item_type: 'rog', prompt_text: 'Identify all persons with knowledge of the incident' },
      { item_type: 'rfa', prompt_text: 'Admit that you had a duty to maintain safe conditions at the location' },
    ],
  },
  family: {
    title: 'First Set of Discovery Requests',
    items: [
      { item_type: 'rfp', prompt_text: 'Produce tax returns for the last three years' },
      { item_type: 'rfp', prompt_text: 'Produce bank statements for all accounts for the last 12 months' },
      { item_type: 'rfp', prompt_text: 'Produce documentation of all real property owned' },
      { item_type: 'rog', prompt_text: 'State your current income from all sources' },
      { item_type: 'rog', prompt_text: 'List all debts and monthly obligations' },
    ],
  },
}

const GENERIC_PACK = {
  title: 'First Set of Discovery Requests',
  items: [
    { item_type: 'rfp' as const, prompt_text: 'Produce all documents related to this dispute' },
    { item_type: 'rfp' as const, prompt_text: 'Produce all communications between the parties' },
    { item_type: 'rog' as const, prompt_text: 'Describe the factual basis for your claims or defenses' },
  ],
}

export function buildStaticDiscoveryPack(input: {
  dispute_type: string
  state: string
  role: string
}): { title: string; items: DiscoveryItem[] } {
  return STATIC_PACKS[input.dispute_type] || GENERIC_PACK
}

export function buildDiscoverySuggestionPrompt(input: {
  dispute_type: string
  state: string
  role: string
  evidence_categories?: string[]
}): string {
  const evidenceStr = input.evidence_categories?.length
    ? `\n\nExisting evidence categories: ${input.evidence_categories.join(', ')}`
    : ''
  return `Generate a discovery pack for a ${input.dispute_type.replace(/_/g, ' ')} case in ${input.state}. The user is the ${input.role}.${evidenceStr}`
}
```

**Step 4: Run test → PASS. Step 5: Commit**

```bash
git add src/lib/ai/discovery-suggestions.ts tests/unit/ai/discovery-suggestions.test.ts
git commit -m "feat: add AI discovery pack suggestion utility"
```

---

### Task 7: Create AI case summary and strategy notes utility

**Files:**
- Create: `src/lib/ai/case-summary.ts`
- Test: `tests/unit/ai/case-summary.test.ts`

**Step 1: Write the failing test**

```typescript
import { describe, it, expect } from 'vitest'
import {
  buildCaseSummaryPrompt,
  buildStrategyNotesPrompt,
  isSummarySafe,
  CASE_SUMMARY_SYSTEM_PROMPT,
  STRATEGY_NOTES_SYSTEM_PROMPT,
} from '@/lib/ai/case-summary'

describe('case-summary AI utility', () => {
  it('builds case summary prompt with full context', () => {
    const prompt = buildCaseSummaryPrompt({
      dispute_type: 'debt',
      state: 'TX',
      role: 'defendant',
      county: 'Harris',
      exhibit_count: 6,
      evidence_categories: ['contract', 'financial_records', 'emails'],
      timeline_event_count: 12,
      discovery_summary: '1 pack served, responses received',
    })
    expect(prompt).toContain('debt')
    expect(prompt).toContain('Harris')
    expect(prompt).toContain('6 exhibits')
  })

  it('builds strategy notes prompt', () => {
    const prompt = buildStrategyNotesPrompt({
      dispute_type: 'debt',
      state: 'TX',
      role: 'defendant',
      exhibit_titles: ['Original Contract', 'Payment History'],
      risk_level: 'medium',
      health_score: 72,
    })
    expect(prompt).toContain('debt')
    expect(prompt).toContain('Original Contract')
    expect(prompt).toContain('72')
  })

  it('marks safe text as safe', () => {
    expect(isSummarySafe('Case involves a debt collection dispute')).toBe(true)
  })

  it('blocks unsafe text', () => {
    expect(isSummarySafe('You must file a motion to dismiss immediately')).toBe(false)
  })

  it('exports system prompts', () => {
    expect(CASE_SUMMARY_SYSTEM_PROMPT).toContain('summary')
    expect(STRATEGY_NOTES_SYSTEM_PROMPT).toContain('strategy')
  })
})
```

**Step 2: Run → FAIL. Step 3: Implement**

```typescript
// src/lib/ai/case-summary.ts

const BLOCKED_PHRASES = [
  'you must', 'you should file', 'guaranteed', 'sanctions',
  'this guarantees', 'legal advice', 'you will win', 'i recommend filing',
]

export const CASE_SUMMARY_SYSTEM_PROMPT = `You are a legal organization assistant generating a case summary document for a self-represented litigant's trial binder. The summary is an organizational overview — not legal advice.

Generate a structured summary with sections:
1. Case Overview (2-3 sentences)
2. Parties
3. Claims & Defenses (based on case type)
4. Key Facts (bullet points)
5. Evidence Summary (categories and counts)
6. Timeline Summary (key dates)
7. Strengths (based on evidence and preparation)
8. Areas of Concern (gaps or risks)

Use plain language. Include the disclaimer: "This summary is for organizational purposes only and does not constitute legal advice."`

export const STRATEGY_NOTES_SYSTEM_PROMPT = `You are a legal organization assistant generating trial preparation notes for a self-represented litigant. These are organizational suggestions — not legal advice.

Generate notes with sections:
1. Opening Statement Themes (key points to emphasize)
2. Key Exhibits to Highlight (and why)
3. Anticipated Objections (common ones for this case type)
4. Cross-Examination Points (areas to explore)
5. Closing Argument Framework

Include the disclaimer: "These are organizational suggestions, not legal advice. Consult an attorney for advice specific to your situation."`

export function isSummarySafe(text: string): boolean {
  const lower = text.toLowerCase()
  return !BLOCKED_PHRASES.some(phrase => lower.includes(phrase))
}

export function buildCaseSummaryPrompt(input: {
  dispute_type: string
  state: string
  role: string
  county?: string
  exhibit_count: number
  evidence_categories: string[]
  timeline_event_count: number
  discovery_summary: string
}): string {
  const location = input.county ? `${input.county} County, ${input.state}` : input.state
  return `Generate a case summary for a ${input.dispute_type.replace(/_/g, ' ')} case in ${location}. The user is the ${input.role}.

Case data:
- ${input.exhibit_count} exhibits prepared
- Evidence categories: ${input.evidence_categories.join(', ') || 'none'}
- ${input.timeline_event_count} timeline events
- Discovery: ${input.discovery_summary}`
}

export function buildStrategyNotesPrompt(input: {
  dispute_type: string
  state: string
  role: string
  exhibit_titles: string[]
  risk_level?: string
  health_score?: number
}): string {
  const exhibitStr = input.exhibit_titles.length > 0
    ? `\n\nExhibits:\n${input.exhibit_titles.map((t, i) => `- Exhibit ${i + 1}: ${t}`).join('\n')}`
    : '\n\nNo exhibits prepared yet.'
  const healthStr = input.health_score !== undefined
    ? `\nCase health score: ${input.health_score}/100`
    : ''
  const riskStr = input.risk_level ? `\nRisk level: ${input.risk_level}` : ''

  return `Generate trial preparation strategy notes for a ${input.dispute_type.replace(/_/g, ' ')} case in ${input.state}. The user is the ${input.role}.${exhibitStr}${healthStr}${riskStr}`
}
```

**Step 4: Run → PASS. Step 5: Commit**

```bash
git add src/lib/ai/case-summary.ts tests/unit/ai/case-summary.test.ts
git commit -m "feat: add AI case summary and strategy notes utility"
```

---

## Phase 4: API Routes

### Task 8: Create Case File hub API (aggregated pipeline data)

**Files:**
- Create: `src/app/api/cases/[id]/case-file/route.ts`

This endpoint aggregates all pipeline data in a single request (evidence counts, exhibit counts, discovery statuses, binder statuses, suggestion list) so the hub loads fast.

**Step 1: Write the API route**

```typescript
// src/app/api/cases/[id]/case-file/route.ts
import { NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase } = auth

    // Parallel queries for pipeline data
    const [
      caseResult,
      evidenceResult,
      exhibitSetResult,
      exhibitCountResult,
      discoveryResult,
      binderResult,
      suggestionsResult,
      checklistResult,
    ] = await Promise.all([
      supabase.from('cases').select('id, dispute_type, state, role, county, status').eq('id', caseId).single(),
      supabase.from('evidence_items').select('id, label, exhibit_id:exhibits(id)', { count: 'exact' }).eq('case_id', caseId),
      supabase.from('exhibit_sets').select('id, numbering_style, next_number').eq('case_id', caseId).maybeSingle(),
      supabase.from('exhibits').select('id', { count: 'exact', head: true }).eq('exhibit_set_id', caseId),
      supabase.from('discovery_packs').select('id, title, status').eq('case_id', caseId).order('created_at', { ascending: false }),
      supabase.from('trial_binders').select('id, title, status, version, created_at').eq('case_id', caseId).order('created_at', { ascending: false }),
      supabase.from('case_file_suggestions').select('*').eq('case_id', caseId).eq('dismissed', false).order('created_at', { ascending: false }).limit(5),
      supabase.from('case_file_checklists').select('id, generated_at, case_file_checklist_items(id, label, category, checked, matched_evidence_id, sort_order)').eq('case_id', caseId).maybeSingle(),
    ])

    if (caseResult.error || !caseResult.data) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    const evidence = evidenceResult.data || []
    const evidenceCount = evidenceResult.count || 0
    const exhibitedIds = new Set(evidence.filter((e: any) => e.exhibit_id).map((e: any) => e.id))

    return NextResponse.json({
      case: caseResult.data,
      pipeline: {
        collect: {
          total: evidenceCount,
          label: `${evidenceCount} item${evidenceCount !== 1 ? 's' : ''}`,
        },
        organize: {
          exhibited: exhibitedIds.size,
          total: evidenceCount,
          label: `${exhibitedIds.size} of ${evidenceCount}`,
          exhibit_set: exhibitSetResult.data,
        },
        discover: {
          packs: (discoveryResult.data || []).map((p: any) => ({ id: p.id, title: p.title, status: p.status })),
          total: (discoveryResult.data || []).length,
          complete: (discoveryResult.data || []).filter((p: any) => p.status === 'complete').length,
        },
        prepare: {
          binders: (binderResult.data || []).map((b: any) => ({
            id: b.id, title: b.title, status: b.status, version: b.version, created_at: b.created_at,
          })),
          total: (binderResult.data || []).length,
          ready: (binderResult.data || []).filter((b: any) => b.status === 'ready').length,
        },
      },
      suggestions: suggestionsResult.data || [],
      checklist: checklistResult.data,
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

**Step 2: Commit**

```bash
git add src/app/api/cases/[id]/case-file/route.ts
git commit -m "feat: add Case File hub API aggregating pipeline data"
```

---

### Task 9: Create checklist API routes

**Files:**
- Create: `src/app/api/cases/[id]/case-file/checklist/route.ts`
- Create: `src/app/api/cases/[id]/case-file/checklist/items/[itemId]/route.ts`

**Step 1: Write the checklist API**

```typescript
// src/app/api/cases/[id]/case-file/checklist/route.ts
import { NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { buildStaticChecklist } from '@/lib/ai/evidence-checklist'

// POST — generate a new checklist (or refresh existing)
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase } = auth

    // Get case info for checklist generation
    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .select('dispute_type, state, role')
      .eq('id', caseId)
      .single()

    if (caseError || !caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    // Delete existing checklist if refreshing
    await supabase.from('case_file_checklists').delete().eq('case_id', caseId)

    // Generate checklist (static fallback; AI enhancement added later)
    const checklist = buildStaticChecklist({
      dispute_type: caseData.dispute_type,
      state: caseData.state,
    })

    // Insert checklist
    const { data: created, error: createError } = await supabase
      .from('case_file_checklists')
      .insert({ case_id: caseId, model: 'static' })
      .select('id')
      .single()

    if (createError || !created) {
      return NextResponse.json({ error: 'Failed to create checklist', details: createError?.message }, { status: 500 })
    }

    // Insert items
    const items = checklist.items.map((item, i) => ({
      checklist_id: created.id,
      label: item.label,
      category: item.category,
      sort_order: i,
    }))

    const { error: itemsError } = await supabase
      .from('case_file_checklist_items')
      .insert(items)

    if (itemsError) {
      return NextResponse.json({ error: 'Failed to create checklist items', details: itemsError.message }, { status: 500 })
    }

    // Fetch and return complete checklist
    const { data: result } = await supabase
      .from('case_file_checklists')
      .select('id, generated_at, case_file_checklist_items(id, label, category, checked, matched_evidence_id, sort_order)')
      .eq('id', created.id)
      .single()

    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

```typescript
// src/app/api/cases/[id]/case-file/checklist/items/[itemId]/route.ts
import { NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { updateChecklistItemSchema } from '@/lib/schemas/case-file'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { itemId } = await params
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase } = auth

    const body = await request.json()
    const parsed = updateChecklistItemSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.issues }, { status: 422 })
    }

    const { data, error } = await supabase
      .from('case_file_checklist_items')
      .update(parsed.data)
      .eq('id', itemId)
      .select()
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

**Step 2: Commit**

```bash
git add src/app/api/cases/[id]/case-file/checklist/route.ts src/app/api/cases/[id]/case-file/checklist/items/[itemId]/route.ts
git commit -m "feat: add checklist API routes for evidence collection tracking"
```

---

### Task 10: Create suggestions API routes

**Files:**
- Create: `src/app/api/cases/[id]/case-file/suggestions/route.ts`
- Create: `src/app/api/cases/[id]/case-file/suggestions/[suggestionId]/route.ts`

**Step 1: Write the suggestions API**

```typescript
// src/app/api/cases/[id]/case-file/suggestions/route.ts
import { NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { generateStaticSuggestions } from '@/lib/ai/case-file-suggestions'

// POST — regenerate suggestions based on current case state
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase } = auth

    // Gather pipeline state in parallel
    const [caseRes, evidenceRes, exhibitRes, discoveryRes, binderRes, objectionRes, deadlineRes] = await Promise.all([
      supabase.from('cases').select('dispute_type').eq('id', caseId).single(),
      supabase.from('evidence_items').select('id', { count: 'exact', head: true }).eq('case_id', caseId),
      supabase.from('exhibits').select('id', { count: 'exact', head: true }).eq('case_id', caseId),
      supabase.from('discovery_packs').select('id, status').eq('case_id', caseId),
      supabase.from('trial_binders').select('id, status, created_at').eq('case_id', caseId).order('created_at', { ascending: false }).limit(1),
      supabase.from('objection_items').select('id', { count: 'exact', head: true }).eq('follow_up_flag', true),
      supabase.from('deadlines').select('id', { count: 'exact', head: true }).eq('case_id', caseId).gte('due_at', new Date().toISOString()).lte('due_at', new Date(Date.now() + 14 * 86400000).toISOString()),
    ])

    if (!caseRes.data) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    const evidenceCount = evidenceRes.count || 0
    const exhibitCount = exhibitRes.count || 0
    const packs = discoveryRes.data || []
    const latestBinder = binderRes.data?.[0] || null

    const state = {
      dispute_type: caseRes.data.dispute_type,
      evidence_count: evidenceCount,
      exhibited_count: exhibitCount,
      unexhibited_count: evidenceCount - exhibitCount,
      discovery_pack_count: packs.length,
      discovery_packs_complete: packs.filter(p => p.status === 'complete').length,
      binder_count: latestBinder ? 1 : 0,
      latest_binder_at: latestBinder?.created_at || null,
      evidence_changed_since_binder: false, // TODO: compare timestamps
      flagged_objections: objectionRes.count || 0,
      approaching_deadlines: deadlineRes.count || 0,
    }

    const suggestions = generateStaticSuggestions(state)

    // Clear old non-dismissed suggestions and insert new ones
    await supabase.from('case_file_suggestions').delete().eq('case_id', caseId).eq('dismissed', false)

    if (suggestions.length > 0) {
      const rows = suggestions.map(s => ({
        case_id: caseId,
        suggestion_type: 'next_step' as const,
        ...s,
      }))
      await supabase.from('case_file_suggestions').insert(rows)
    }

    // Fetch fresh suggestions
    const { data } = await supabase
      .from('case_file_suggestions')
      .select('*')
      .eq('case_id', caseId)
      .eq('dismissed', false)
      .order('created_at', { ascending: false })
      .limit(5)

    return NextResponse.json(data || [])
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

```typescript
// src/app/api/cases/[id]/case-file/suggestions/[suggestionId]/route.ts
import { NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'

// PATCH — dismiss a suggestion
export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string; suggestionId: string }> }
) {
  try {
    const { suggestionId } = await params
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase } = auth

    const { data, error } = await supabase
      .from('case_file_suggestions')
      .update({ dismissed: true })
      .eq('id', suggestionId)
      .select()
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Suggestion not found' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

**Step 2: Commit**

```bash
git add src/app/api/cases/[id]/case-file/suggestions/route.ts src/app/api/cases/[id]/case-file/suggestions/[suggestionId]/route.ts
git commit -m "feat: add suggestions API for AI assistant recommendations"
```

---

### Task 11: Create exhibit renumber API route

**Files:**
- Create: `src/app/api/exhibit-sets/[setId]/renumber/route.ts`

**Step 1: Write the API**

```typescript
// src/app/api/exhibit-sets/[setId]/renumber/route.ts
import { NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ setId: string }> }
) {
  try {
    const { setId } = await params
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase } = auth

    const { error } = await supabase.rpc('renumber_exhibits', {
      p_exhibit_set_id: setId,
    })

    if (error) {
      return NextResponse.json({ error: 'Failed to renumber exhibits', details: error.message }, { status: 500 })
    }

    // Log timeline event
    // First get case_id from exhibit set
    const { data: setData } = await supabase
      .from('exhibit_sets')
      .select('case_id')
      .eq('id', setId)
      .single()

    if (setData) {
      await supabase.from('task_events').insert({
        case_id: setData.case_id,
        kind: 'exhibits_renumbered',
        payload: { exhibit_set_id: setId },
      })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

**Step 2: Commit**

```bash
git add src/app/api/exhibit-sets/[setId]/renumber/route.ts
git commit -m "feat: add exhibit renumber API route"
```

---

### Task 12: Create evidence-discovery link API route

**Files:**
- Create: `src/app/api/cases/[id]/case-file/evidence-links/route.ts`

**Step 1: Write the API**

```typescript
// src/app/api/cases/[id]/case-file/evidence-links/route.ts
import { NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { createEvidenceLinkSchema } from '@/lib/schemas/case-file'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await params
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase } = auth

    const body = await request.json()
    const parsed = createEvidenceLinkSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.issues }, { status: 422 })
    }

    const { data, error } = await supabase
      .from('discovery_item_evidence_links')
      .insert(parsed.data)
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Link already exists' }, { status: 409 })
      }
      return NextResponse.json({ error: 'Failed to create link', details: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await params
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase } = auth

    const { searchParams } = new URL(request.url)
    const linkId = searchParams.get('link_id')
    if (!linkId) {
      return NextResponse.json({ error: 'link_id required' }, { status: 422 })
    }

    const { error } = await supabase
      .from('discovery_item_evidence_links')
      .delete()
      .eq('id', linkId)

    if (error) {
      return NextResponse.json({ error: 'Failed to delete link', details: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

**Step 2: Commit**

```bash
git add src/app/api/cases/[id]/case-file/evidence-links/route.ts
git commit -m "feat: add evidence-discovery link API routes"
```

---

### Task 13: Create binder progress API route

**Files:**
- Create: `src/app/api/binders/[binderId]/progress/route.ts`

**Step 1: Write the API**

```typescript
// src/app/api/binders/[binderId]/progress/route.ts
import { NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ binderId: string }> }
) {
  try {
    const { binderId } = await params
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase } = auth

    const { data, error } = await supabase
      .from('binder_build_steps')
      .select('step_key, status, error, started_at, completed_at')
      .eq('binder_id', binderId)
      .order('started_at', { ascending: true })

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch progress', details: error.message }, { status: 500 })
    }

    const steps = data || []
    const total = steps.length
    const done = steps.filter(s => s.status === 'done').length
    const failed = steps.find(s => s.status === 'failed')
    const percentage = total > 0 ? Math.round((done / total) * 100) : 0

    return NextResponse.json({
      steps,
      percentage,
      is_complete: done === total && total > 0,
      has_error: !!failed,
      error_step: failed?.step_key || null,
      error_message: failed?.error || null,
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

**Step 2: Commit**

```bash
git add src/app/api/binders/[binderId]/progress/route.ts
git commit -m "feat: add binder build progress API route"
```

---

## Phase 5: UI Components

### Task 14: Create pipeline stage bar component

**Files:**
- Create: `src/components/case-file/pipeline-bar.tsx`

**Step 1: Write the component**

```typescript
// src/components/case-file/pipeline-bar.tsx
'use client'

import { cn } from '@/lib/utils'
import { Upload, Tags, Search, FileText, ChevronRight } from 'lucide-react'
import type { PipelineStage } from '@/lib/schemas/case-file'

interface StageInfo {
  key: PipelineStage
  label: string
  icon: typeof Upload
  count: string
  complete: boolean
}

interface PipelineBarProps {
  stages: StageInfo[]
  activeStage: PipelineStage
  onStageClick: (stage: PipelineStage) => void
}

export function PipelineBar({ stages, activeStage, onStageClick }: PipelineBarProps) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-2">
      {stages.map((stage, i) => (
        <div key={stage.key} className="flex items-center">
          {i > 0 && (
            <ChevronRight className="h-4 w-4 text-warm-border flex-shrink-0 mx-1" />
          )}
          <button
            onClick={() => onStageClick(stage.key)}
            className={cn(
              'flex flex-col items-center gap-1.5 rounded-xl border px-4 py-3 transition-all min-w-[120px]',
              activeStage === stage.key
                ? 'border-calm-indigo bg-calm-indigo/5 shadow-sm'
                : 'border-warm-border bg-white/50 hover:bg-white/80',
              stage.complete && 'border-calm-green/30 bg-calm-green/5'
            )}
          >
            <div className={cn(
              'flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide',
              activeStage === stage.key ? 'text-calm-indigo' : 'text-warm-muted'
            )}>
              <stage.icon className="h-3.5 w-3.5" />
              {stage.label}
            </div>
            <div className={cn(
              'text-sm font-semibold',
              activeStage === stage.key ? 'text-warm-text' : 'text-warm-muted'
            )}>
              {stage.count}
            </div>
            {stage.complete && (
              <div className="h-1 w-full rounded-full bg-calm-green" />
            )}
            {!stage.complete && (
              <div className="h-1 w-full rounded-full bg-warm-border" />
            )}
          </button>
        </div>
      ))}
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/case-file/pipeline-bar.tsx
git commit -m "feat: add pipeline stage bar component for Case File hub"
```

---

### Task 15: Create AI assistant panel component

**Files:**
- Create: `src/components/case-file/ai-assistant-panel.tsx`

**Step 1: Write the component**

```typescript
// src/components/case-file/ai-assistant-panel.tsx
'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Lightbulb, X, ChevronRight, AlertCircle, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface Suggestion {
  id: string
  title: string
  description: string
  priority: 'urgent' | 'recommended' | 'nice_to_have'
  action_type: 'navigate' | 'ai_trigger' | 'info'
  action_payload: Record<string, unknown>
}

interface AIAssistantPanelProps {
  caseId: string
  suggestions: Suggestion[]
  onAction: (suggestion: Suggestion) => void
  onDismiss: (suggestionId: string) => void
  onRefresh: () => void
}

const PRIORITY_STYLES = {
  urgent: { bg: 'bg-red-50', border: 'border-red-200', icon: AlertCircle, iconColor: 'text-red-500' },
  recommended: { bg: 'bg-calm-indigo/5', border: 'border-calm-indigo/20', icon: Lightbulb, iconColor: 'text-calm-indigo' },
  nice_to_have: { bg: 'bg-warm-bg', border: 'border-warm-border', icon: Info, iconColor: 'text-warm-muted' },
}

export function AIAssistantPanel({ suggestions, onAction, onDismiss, onRefresh }: AIAssistantPanelProps) {
  const [collapsed, setCollapsed] = useState(false)

  // Persist collapsed state
  useEffect(() => {
    const saved = localStorage.getItem('case-file-assistant-collapsed')
    if (saved === 'true') setCollapsed(true)
  }, [])

  const toggleCollapsed = () => {
    const next = !collapsed
    setCollapsed(next)
    localStorage.setItem('case-file-assistant-collapsed', String(next))
  }

  if (collapsed) {
    return (
      <button
        onClick={toggleCollapsed}
        className="fixed bottom-6 right-6 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-calm-indigo text-white shadow-lg hover:bg-calm-indigo/90 transition-colors"
        aria-label="Open AI assistant"
      >
        <Lightbulb className="h-5 w-5" />
      </button>
    )
  }

  return (
    <div className="w-[280px] flex-shrink-0 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-warm-text flex items-center gap-1.5">
          <Lightbulb className="h-4 w-4 text-calm-indigo" />
          AI Assistant
        </h3>
        <button
          onClick={toggleCollapsed}
          className="text-warm-muted hover:text-warm-text p-1 rounded transition-colors"
          aria-label="Collapse assistant"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {suggestions.length === 0 ? (
        <Card className="border-warm-border bg-white/50">
          <CardContent className="p-4 text-sm text-warm-muted text-center">
            No suggestions right now. Your case file is looking good!
            <Button variant="ghost" size="sm" className="mt-2 w-full" onClick={onRefresh}>
              Refresh
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {suggestions.map((suggestion, i) => {
            const style = PRIORITY_STYLES[suggestion.priority]
            return (
              <Card key={suggestion.id} className={cn('border', style.border, style.bg)}>
                <CardContent className="p-3">
                  <div className="flex items-start gap-2">
                    <style.icon className={cn('h-4 w-4 mt-0.5 flex-shrink-0', style.iconColor)} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-warm-text leading-snug">
                        {suggestion.title}
                      </p>
                      <p className="text-xs text-warm-muted mt-1 leading-relaxed">
                        {suggestion.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs text-calm-indigo hover:text-calm-indigo/80"
                          onClick={() => onAction(suggestion)}
                        >
                          {suggestion.action_type === 'navigate' ? 'Go' : 'Do it'}
                          <ChevronRight className="h-3 w-3 ml-0.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs text-warm-muted"
                          onClick={() => onDismiss(suggestion.id)}
                        >
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/case-file/ai-assistant-panel.tsx
git commit -m "feat: add AI assistant panel component"
```

---

### Task 16: Create beginner walkthrough component

**Files:**
- Create: `src/components/case-file/beginner-walkthrough.tsx`

**Step 1: Write the component**

```typescript
// src/components/case-file/beginner-walkthrough.tsx
'use client'

import { useState, useEffect } from 'react'
import { Upload, Tags, Search, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface BeginnerWalkthroughProps {
  onStart: () => void
}

const STEPS = [
  { icon: Upload, label: 'Collect', desc: 'Gather your documents, photos, records' },
  { icon: Tags, label: 'Organize', desc: 'Pick the most important ones & number them' },
  { icon: Search, label: 'Discover', desc: 'Request documents from the other side' },
  { icon: FileText, label: 'Prepare', desc: 'Package everything for court' },
]

export function BeginnerWalkthrough({ onStart }: BeginnerWalkthroughProps) {
  const [dismissed, setDismissed] = useState(true)

  useEffect(() => {
    const seen = localStorage.getItem('case-file-walkthrough-dismissed')
    if (!seen) setDismissed(false)
  }, [])

  const handleDismiss = (permanent: boolean) => {
    setDismissed(true)
    if (permanent) localStorage.setItem('case-file-walkthrough-dismissed', 'true')
  }

  if (dismissed) return null

  return (
    <Card className="border-calm-indigo/20 bg-calm-indigo/5 mb-6">
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold text-warm-text mb-2">
          Welcome to Your Case File
        </h2>
        <p className="text-sm text-warm-muted mb-4">
          This is where you&apos;ll organize everything for your case. Think of it like building a filing cabinet:
        </p>
        <div className="grid grid-cols-2 gap-3 mb-4 sm:grid-cols-4">
          {STEPS.map(step => (
            <div key={step.label} className="flex flex-col items-center gap-1.5 rounded-lg bg-white/60 p-3 text-center">
              <step.icon className="h-5 w-5 text-calm-indigo" />
              <span className="text-sm font-medium text-warm-text">{step.label}</span>
              <span className="text-xs text-warm-muted leading-snug">{step.desc}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-warm-muted mb-4">
          Don&apos;t worry about getting it perfect. You can always go back and add more. The AI assistant will guide you along the way.
        </p>
        <div className="flex items-center gap-3">
          <Button onClick={() => { handleDismiss(false); onStart() }} className="bg-calm-indigo hover:bg-calm-indigo/90">
            Let&apos;s start with collecting evidence
          </Button>
          <label className="flex items-center gap-1.5 text-xs text-warm-muted cursor-pointer">
            <input
              type="checkbox"
              className="rounded border-warm-border"
              onChange={(e) => { if (e.target.checked) handleDismiss(true) }}
            />
            Don&apos;t show this again
          </label>
        </div>
      </CardContent>
    </Card>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/case-file/beginner-walkthrough.tsx
git commit -m "feat: add beginner walkthrough component for first-time users"
```

---

### Task 17: Create AI insight banner component

**Files:**
- Create: `src/components/case-file/ai-insight-banner.tsx`

**Step 1: Write the component**

```typescript
// src/components/case-file/ai-insight-banner.tsx
'use client'

import { useState } from 'react'
import { Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface AIInsightBannerProps {
  message: string
  actionLabel: string
  onAction: () => void
}

export function AIInsightBanner({ message, actionLabel, onAction }: AIInsightBannerProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <Card className="border-calm-indigo/20 bg-calm-indigo/5 mb-4">
      <CardContent className="p-4 flex items-start gap-3">
        <Sparkles className="h-5 w-5 text-calm-indigo flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-warm-text leading-relaxed">{message}</p>
          <div className="flex items-center gap-2 mt-2">
            <Button size="sm" onClick={onAction} className="bg-calm-indigo hover:bg-calm-indigo/90 h-7 text-xs">
              {actionLabel}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setDismissed(true)} className="h-7 text-xs text-warm-muted">
              Dismiss
            </Button>
          </div>
        </div>
        <button onClick={() => setDismissed(true)} className="text-warm-muted hover:text-warm-text p-1">
          <X className="h-3.5 w-3.5" />
        </button>
      </CardContent>
    </Card>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/case-file/ai-insight-banner.tsx
git commit -m "feat: add AI insight banner component"
```

---

### Task 18: Create evidence checklist component

**Files:**
- Create: `src/components/case-file/evidence-checklist.tsx`

**Step 1: Write the component**

```typescript
// src/components/case-file/evidence-checklist.tsx
'use client'

import { useState } from 'react'
import { CheckCircle2, Circle, RefreshCw, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface ChecklistItem {
  id: string
  label: string
  category: string | null
  checked: boolean
  matched_evidence_id: string | null
}

interface EvidenceChecklistProps {
  caseId: string
  disputeType: string
  items: ChecklistItem[]
  onItemToggle: (itemId: string, checked: boolean) => void
  onRefresh: () => void
}

export function EvidenceChecklist({ disputeType, items, onItemToggle, onRefresh }: EvidenceChecklistProps) {
  const [refreshing, setRefreshing] = useState(false)

  const checked = items.filter(i => i.checked || i.matched_evidence_id).length
  const total = items.length

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await onRefresh()
      toast.success('Checklist refreshed')
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <Card className="border-warm-border bg-white/90">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-warm-text">
            Evidence Checklist
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-warm-muted">{checked}/{total} collected</span>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </div>
        <p className="text-xs text-warm-muted mb-3">
          Based on your {disputeType.replace(/_/g, ' ')} case, you should collect:
        </p>
        <div className="space-y-2">
          {items
            .sort((a, b) => (a.checked === b.checked ? 0 : a.checked ? 1 : -1))
            .map(item => {
              const isChecked = item.checked || !!item.matched_evidence_id
              return (
                <button
                  key={item.id}
                  onClick={() => onItemToggle(item.id, !isChecked)}
                  className={cn(
                    'flex items-start gap-2 w-full text-left rounded-lg p-2 transition-colors',
                    isChecked ? 'bg-calm-green/5' : 'hover:bg-warm-bg'
                  )}
                >
                  {isChecked ? (
                    <CheckCircle2 className="h-4 w-4 text-calm-green flex-shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="h-4 w-4 text-warm-border flex-shrink-0 mt-0.5" />
                  )}
                  <span className={cn(
                    'text-sm leading-snug',
                    isChecked ? 'text-warm-muted line-through' : 'text-warm-text'
                  )}>
                    {item.label}
                  </span>
                </button>
              )
            })}
        </div>
      </CardContent>
    </Card>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/case-file/evidence-checklist.tsx
git commit -m "feat: add evidence checklist component"
```

---

### Task 19: Create binder build progress component

**Files:**
- Create: `src/components/case-file/binder-progress.tsx`

**Step 1: Write the component**

```typescript
// src/components/case-file/binder-progress.tsx
'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, Loader2, Circle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BuildStep {
  step_key: string
  status: 'pending' | 'running' | 'done' | 'failed'
  error: string | null
}

interface BinderProgressProps {
  binderId: string
  onComplete: () => void
}

const STEP_LABELS: Record<string, string> = {
  summary_generation: 'Generating case summary',
  exhibit_index: 'Building exhibit index',
  timeline_compilation: 'Compiling timeline',
  exhibit_download: 'Downloading exhibit files',
  discovery_packaging: 'Packaging discovery materials',
  strategy_generation: 'Generating strategy notes',
  zip_creation: 'Creating ZIP archive',
}

export function BinderProgress({ binderId, onComplete }: BinderProgressProps) {
  const [steps, setSteps] = useState<BuildStep[]>([])
  const [percentage, setPercentage] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const poll = async () => {
      try {
        const res = await fetch(`/api/binders/${binderId}/progress`)
        if (!res.ok) return
        const data = await res.json()
        if (!active) return

        setSteps(data.steps)
        setPercentage(data.percentage)

        if (data.has_error) {
          setError(data.error_message)
          return
        }

        if (data.is_complete) {
          onComplete()
          return
        }

        // Continue polling
        setTimeout(poll, 2000)
      } catch {
        if (active) setTimeout(poll, 5000)
      }
    }
    poll()
    return () => { active = false }
  }, [binderId, onComplete])

  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case 'done': return <CheckCircle2 className="h-4 w-4 text-calm-green" />
      case 'running': return <Loader2 className="h-4 w-4 text-calm-indigo animate-spin" />
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-500" />
      default: return <Circle className="h-4 w-4 text-warm-border" />
    }
  }

  return (
    <div className="rounded-2xl border border-warm-border bg-white/90 p-5">
      <h3 className="text-sm font-semibold text-warm-text mb-3">Generating Trial Binder...</h3>

      <div className="mb-4">
        <div className="h-2 w-full rounded-full bg-warm-border overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-500', error ? 'bg-red-400' : 'bg-calm-indigo')}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="text-xs text-warm-muted mt-1 text-right">{percentage}%</p>
      </div>

      <div className="space-y-2">
        {steps.map(step => (
          <div key={step.step_key} className="flex items-center gap-2">
            <StatusIcon status={step.status} />
            <span className={cn(
              'text-sm',
              step.status === 'done' ? 'text-warm-muted' : 'text-warm-text'
            )}>
              {STEP_LABELS[step.step_key] || step.step_key}
            </span>
            {step.error && (
              <span className="text-xs text-red-500 ml-auto">{step.error}</span>
            )}
          </div>
        ))}
      </div>

      {error && (
        <p className="text-sm text-red-600 mt-3 p-2 bg-red-50 rounded-lg">{error}</p>
      )}
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/case-file/binder-progress.tsx
git commit -m "feat: add binder build progress component"
```

---

### Task 20: Create cross-reference badge component

**Files:**
- Create: `src/components/case-file/cross-ref-badges.tsx`

**Step 1: Write the component**

```typescript
// src/components/case-file/cross-ref-badges.tsx
'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'

interface Badge {
  label: string
  href: string
  variant: 'exhibit' | 'discovery' | 'binder' | 'evidence'
}

interface CrossRefBadgesProps {
  badges: Badge[]
  className?: string
}

const VARIANT_STYLES = {
  exhibit: 'bg-calm-indigo/10 text-calm-indigo border-calm-indigo/20',
  discovery: 'bg-calm-amber/10 text-amber-700 border-calm-amber/20',
  binder: 'bg-calm-green/10 text-green-700 border-calm-green/20',
  evidence: 'bg-warm-bg text-warm-muted border-warm-border',
}

export function CrossRefBadges({ badges, className }: CrossRefBadgesProps) {
  if (badges.length === 0) return null

  return (
    <div className={cn('flex flex-wrap gap-1', className)}>
      {badges.map((badge, i) => (
        <Link
          key={i}
          href={badge.href}
          className={cn(
            'inline-flex items-center rounded-md border px-1.5 py-0.5 text-[11px] font-medium transition-opacity hover:opacity-80',
            VARIANT_STYLES[badge.variant]
          )}
        >
          {badge.label}
        </Link>
      ))}
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/case-file/cross-ref-badges.tsx
git commit -m "feat: add cross-reference badge component"
```

---

## Phase 6: Hub Page & Integration

### Task 21: Create Case File hub page

**Files:**
- Create: `src/app/(authenticated)/case/[id]/case-file/page.tsx`
- Create: `src/components/case-file/case-file-hub.tsx`

**Step 1: Write the server page**

```typescript
// src/app/(authenticated)/case/[id]/case-file/page.tsx
import { createClient } from '@/lib/supabase/server'
import { CaseFileHub } from '@/components/case-file/case-file-hub'
import { LegalDisclaimer } from '@/components/layout/legal-disclaimer'
import { redirect } from 'next/navigation'

export default async function CaseFilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ stage?: string }>
}) {
  const { id } = await params
  const { stage } = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  // Fetch initial hub data
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL ? '' : 'http://localhost:3000'}/api/cases/${id}/case-file`,
    { headers: { cookie: '' }, cache: 'no-store' }
  )

  // Fallback: fetch directly from Supabase if API isn't reachable during SSR
  const [caseResult, evidenceResult, exhibitResult, discoveryResult, binderResult] = await Promise.all([
    supabase.from('cases').select('id, dispute_type, state, role, county, status').eq('id', id).single(),
    supabase.from('evidence_items').select('id', { count: 'exact', head: true }).eq('case_id', id),
    supabase.from('exhibits').select('id', { count: 'exact', head: true }).eq('case_id', id),
    supabase.from('discovery_packs').select('id, status').eq('case_id', id),
    supabase.from('trial_binders').select('id, status').eq('case_id', id),
  ])

  if (!caseResult.data) redirect('/cases')

  const evidenceCount = evidenceResult.count || 0
  const exhibitCount = exhibitResult.count || 0
  const packs = discoveryResult.data || []
  const binders = binderResult.data || []

  return (
    <div className="py-6">
      <CaseFileHub
        caseId={id}
        caseData={caseResult.data}
        initialStage={(stage as any) || 'collect'}
        initialCounts={{
          evidence: evidenceCount,
          exhibited: exhibitCount,
          discoveryPacks: packs.length,
          discoveryComplete: packs.filter(p => p.status === 'complete').length,
          binders: binders.length,
          bindersReady: binders.filter(b => b.status === 'ready').length,
        }}
      />
      <LegalDisclaimer />
    </div>
  )
}
```

**Step 2: Write the hub client component**

```typescript
// src/components/case-file/case-file-hub.tsx
'use client'

import { useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Upload, Tags, Search, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { PipelineBar } from './pipeline-bar'
import { AIAssistantPanel } from './ai-assistant-panel'
import { BeginnerWalkthrough } from './beginner-walkthrough'
import { AIInsightBanner } from './ai-insight-banner'
import { SupportiveHeader } from '@/components/layout/supportive-header'
import type { PipelineStage } from '@/lib/schemas/case-file'

// Lazy-load stage detail components
import dynamic from 'next/dynamic'
const EvidenceVault = dynamic(() => import('@/components/evidence/evidence-vault').then(m => ({ default: m.EvidenceVault })))
const ExhibitsManager = dynamic(() => import('@/components/exhibits/exhibits-manager').then(m => ({ default: m.ExhibitsManager })))
// Discovery and Binders will be imported similarly

interface CaseFileHubProps {
  caseId: string
  caseData: { id: string; dispute_type: string; state: string; role: string; county: string; status: string }
  initialStage: PipelineStage
  initialCounts: {
    evidence: number
    exhibited: number
    discoveryPacks: number
    discoveryComplete: number
    binders: number
    bindersReady: number
  }
}

export function CaseFileHub({ caseId, caseData, initialStage, initialCounts }: CaseFileHubProps) {
  const router = useRouter()
  const [activeStage, setActiveStage] = useState<PipelineStage>(initialStage)
  const [counts, setCounts] = useState(initialCounts)
  const [suggestions, setSuggestions] = useState<any[]>([])

  const stages = [
    {
      key: 'collect' as PipelineStage,
      label: 'Collect',
      icon: Upload,
      count: `${counts.evidence} item${counts.evidence !== 1 ? 's' : ''}`,
      complete: counts.evidence >= 3,
    },
    {
      key: 'organize' as PipelineStage,
      label: 'Organize',
      icon: Tags,
      count: `${counts.exhibited} of ${counts.evidence}`,
      complete: counts.exhibited > 0 && counts.exhibited >= counts.evidence * 0.5,
    },
    {
      key: 'discover' as PipelineStage,
      label: 'Discover',
      icon: Search,
      count: counts.discoveryPacks > 0
        ? `${counts.discoveryComplete}/${counts.discoveryPacks} pack${counts.discoveryPacks !== 1 ? 's' : ''}`
        : 'Not started',
      complete: counts.discoveryPacks > 0 && counts.discoveryComplete >= counts.discoveryPacks,
    },
    {
      key: 'prepare' as PipelineStage,
      label: 'Prepare',
      icon: FileText,
      count: counts.bindersReady > 0 ? `Ready` : 'Not started',
      complete: counts.bindersReady > 0,
    },
  ]

  const handleStageClick = (stage: PipelineStage) => {
    setActiveStage(stage)
    router.replace(`/case/${caseId}/case-file?stage=${stage}`, { scroll: false })
  }

  const handleSuggestionAction = (suggestion: any) => {
    if (suggestion.action_type === 'navigate' && suggestion.action_payload.stage) {
      handleStageClick(suggestion.action_payload.stage)
    }
  }

  const handleDismissSuggestion = async (suggestionId: string) => {
    const supabase = createClient()
    await fetch(`/api/cases/${caseId}/case-file/suggestions/${suggestionId}`, { method: 'PATCH' })
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId))
    toast('Suggestion dismissed')
  }

  const refreshSuggestions = useCallback(async () => {
    const res = await fetch(`/api/cases/${caseId}/case-file/suggestions`, { method: 'POST' })
    if (res.ok) {
      const data = await res.json()
      setSuggestions(data)
    }
  }, [caseId])

  return (
    <div className="space-y-6">
      <SupportiveHeader
        title="Case File"
        subtitle="Organize your evidence, exhibits, discovery, and trial materials in one place."
      />

      <BeginnerWalkthrough onStart={() => handleStageClick('collect')} />

      <PipelineBar stages={stages} activeStage={activeStage} onStageClick={handleStageClick} />

      <div className="flex gap-6">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          {activeStage === 'collect' && (
            <EvidenceVault caseId={caseId} initialEvidence={[]} />
          )}
          {activeStage === 'organize' && (
            <ExhibitsManager caseId={caseId} />
          )}
          {activeStage === 'discover' && (
            <div className="text-warm-muted text-sm p-4">Discovery stage — existing component will be integrated here</div>
          )}
          {activeStage === 'prepare' && (
            <div className="text-warm-muted text-sm p-4">Prepare stage — existing component will be integrated here</div>
          )}
        </div>

        {/* AI Assistant */}
        <AIAssistantPanel
          caseId={caseId}
          suggestions={suggestions}
          onAction={handleSuggestionAction}
          onDismiss={handleDismissSuggestion}
          onRefresh={refreshSuggestions}
        />
      </div>
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add src/app/\(authenticated\)/case/\[id\]/case-file/page.tsx src/components/case-file/case-file-hub.tsx
git commit -m "feat: add Case File hub page with pipeline bar and AI assistant"
```

---

### Task 22: Update breadcrumbs and navigation

**Files:**
- Modify: `src/components/layout/breadcrumbs.tsx`

**Step 1: Update SECTION_LABELS and breadcrumb logic**

Add `'case-file': 'Case File'` to SECTION_LABELS and handle the sub-stages.

In `breadcrumbs.tsx`, add to `SECTION_LABELS`:
```typescript
'case-file': 'Case File',
```

**Step 2: Add redirect pages for old routes**

Create redirect files for old routes:

```typescript
// src/app/(authenticated)/case/[id]/evidence/page.tsx — update to redirect
// Add at the top:
import { redirect } from 'next/navigation'
// Then before the existing component render, add conditional redirect logic
// OR create a middleware pattern
```

> **Note to implementer:** The cleanest approach is to update the existing pages with a banner/link saying "This feature has moved to Case File" pointing to the new hub, rather than hard redirects. This avoids breaking bookmarks while guiding users to the new UX. The full redirect can happen in a later cleanup task.

**Step 3: Commit**

```bash
git add src/components/layout/breadcrumbs.tsx
git commit -m "feat: update breadcrumbs to support Case File hub navigation"
```

---

### Task 23: Add Case File link to dashboard

**Files:**
- Modify: `src/app/(authenticated)/case/[id]/page.tsx`

**Step 1: Add a CaseFileCard component**

Create: `src/components/dashboard/case-file-card.tsx`

```typescript
// src/components/dashboard/case-file-card.tsx
'use client'

import Link from 'next/link'
import { FileText, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface CaseFileCardProps {
  caseId: string
  evidenceCount: number
  exhibitCount: number
  discoveryPackCount: number
  binderCount: number
}

export function CaseFileCard({ caseId, evidenceCount, exhibitCount, discoveryPackCount, binderCount }: CaseFileCardProps) {
  return (
    <Link href={`/case/${caseId}/case-file`}>
      <Card className="border-warm-border bg-white/90 hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-calm-indigo/10 flex items-center justify-center">
                <FileText className="h-4 w-4 text-calm-indigo" />
              </div>
              <h3 className="text-sm font-semibold text-warm-text">Case File</h3>
            </div>
            <ChevronRight className="h-4 w-4 text-warm-muted" />
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-warm-muted">
            <div>{evidenceCount} evidence items</div>
            <div>{exhibitCount} exhibits</div>
            <div>{discoveryPackCount} discovery packs</div>
            <div>{binderCount} binders</div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
```

**Step 2: Import and render in dashboard page**

Add the CaseFileCard to the dashboard grid in `page.tsx` alongside existing cards.

**Step 3: Commit**

```bash
git add src/components/dashboard/case-file-card.tsx src/app/\(authenticated\)/case/\[id\]/page.tsx
git commit -m "feat: add Case File card to case dashboard"
```

---

## Phase 7: Enhanced Existing Components

### Task 24: Add inline edit, search, and bulk select to Evidence Vault

**Files:**
- Modify: `src/components/evidence/evidence-vault.tsx`

> **Note:** This is a larger refactoring task. The key changes are:
> 1. Add a search input at top of evidence list (filter by file_name, notes, label)
> 2. Add "Status" filter dropdown (All / Not exhibited / Exhibited)
> 3. Add "Select mode" toggle that shows checkboxes on each item
> 4. Add bulk action bar (Add all to Exhibits / Export selected / Delete selected)
> 5. Add "Edit" button per item that opens inline edit for notes, category, captured_at
> 6. Add cross-reference badges (Ex. N) per item

**Implementation approach:** Add state for `searchQuery`, `statusFilter`, `selectMode`, `selectedIds`. Filter the evidence list client-side. The edit feature uses a modal or inline form that PATCHes the evidence item.

**Step 1: Implement changes. Step 2: Build to verify. Step 3: Commit**

```bash
git commit -m "feat: add search, filter, bulk select, and inline edit to Evidence Vault"
```

---

### Task 25: Add renumber button and unexhibited evidence section to Exhibits Manager

**Files:**
- Modify: `src/components/exhibits/exhibits-manager.tsx`

> **Key changes:**
> 1. Add "Renumber" button that calls `POST /api/exhibit-sets/[setId]/renumber`
> 2. After removing an exhibit, prompt: "Renumber to close the gap?"
> 3. Add "Unexhibited Evidence" section below the exhibit list showing evidence items not yet exhibited, with one-click "Add as Ex." button
> 4. Add AI suggestion banner at top (calls exhibit suggestion AI utility)

**Step 1: Implement changes. Step 2: Build to verify. Step 3: Commit**

```bash
git commit -m "feat: add renumber, unexhibited section, and AI suggestions to Exhibits Manager"
```

---

### Task 26: Add inline objection review and evidence linking to Discovery

**Files:**
- Modify: `src/components/discovery/discovery-pack-detail.tsx`
- Modify: `src/components/discovery/discovery-list-view.tsx`

> **Key changes:**
> 1. Add visual progress stepper (Draft → Ready → Served → Responses → Done) per pack card
> 2. Add evidence linking UI: each discovery item shows "Link evidence" button + linked evidence badges
> 3. Make objection review collapsible inline instead of separate page redirect
> 4. Auto-transition to "served" when service log is added
> 5. Add AI discovery suggestion banner at top of list view

**Step 1: Implement changes. Step 2: Build to verify. Step 3: Commit**

```bash
git commit -m "feat: add progress stepper, evidence linking, and inline objections to Discovery"
```

---

### Task 27: Add readiness assessment, build progress, and regenerate to Binders

**Files:**
- Modify: `src/components/binders/binder-cta.tsx`
- Modify: `src/components/binders/binders-list.tsx`

> **Key changes:**
> 1. Expose `include_discovery` checkbox in binder generation dialog
> 2. Add `AI case summary` and `AI strategy notes` checkboxes
> 3. Add binder preview section (file structure tree with sizes)
> 4. Replace polling-only status with BinderProgress component
> 5. Add "Regenerate" button on existing binders
> 6. Add AI Readiness Assessment card at top (scores trial readiness)

**Step 1: Implement changes. Step 2: Build to verify. Step 3: Commit**

```bash
git commit -m "feat: add readiness assessment, build progress, and regenerate to Binders"
```

---

## Phase 8: Testing & Cleanup

### Task 28: Write integration tests for Case File hub API

**Files:**
- Create: `tests/unit/api/case-file-hub.test.ts`

> Test the aggregated pipeline data endpoint returns correct shape, handles missing case, and returns proper counts.

### Task 29: Write tests for pipeline bar and assistant components

**Files:**
- Create: `tests/unit/components/pipeline-bar.test.tsx`
- Create: `tests/unit/components/ai-assistant-panel.test.tsx`

> Test rendering, stage click handling, suggestion display, dismiss action, collapsed state persistence.

### Task 30: Build verification and cleanup

**Step 1: Run full test suite**

```bash
npx vitest run
```

**Step 2: Run build**

```bash
npm run build
```

**Step 3: Fix any build/test failures**

**Step 4: Final commit**

```bash
git commit -m "test: add tests for Case File hub components and API"
```

---

## Summary

| Phase | Tasks | Description |
|-------|-------|-------------|
| 1. Database | 1 | Migration with 5 new tables, 2 altered tables, 1 RPC |
| 2. Schemas | 2 | Zod schemas + tests |
| 3. AI Utilities | 3-7 | Evidence checklist, exhibit suggestions, case file suggestions, discovery suggestions, case summary/strategy |
| 4. API Routes | 8-13 | Hub API, checklist API, suggestions API, renumber API, evidence links API, binder progress API |
| 5. UI Components | 14-20 | Pipeline bar, AI assistant, walkthrough, insight banner, checklist, binder progress, cross-ref badges |
| 6. Hub Page | 21-23 | Case File hub page, breadcrumbs, dashboard card |
| 7. Enhanced Components | 24-27 | Evidence vault, exhibits manager, discovery, binders enhancements |
| 8. Testing | 28-30 | Integration tests, component tests, build verification |
