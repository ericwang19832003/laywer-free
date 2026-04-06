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

ALTER TABLE public.evidence_items ADD COLUMN IF NOT EXISTS edited_at timestamptz;

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
  PERFORM 1 FROM public.exhibit_sets WHERE id = p_exhibit_set_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Exhibit set not found';
  END IF;

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

  UPDATE public.exhibit_sets
  SET next_number = v_counter
  WHERE id = p_exhibit_set_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.renumber_exhibits(uuid) TO authenticated;
