-- ============================================
-- Objection Classification v1
-- ============================================
-- objection_reviews        → child of cases, references discovery_packs + discovery_responses
-- objection_items          → child of objection_reviews
-- meet_and_confer_drafts   → child of cases, references discovery_packs + objection_reviews

-- ── Tables ─────────────────────────────────

-- 1) objection_reviews
CREATE TABLE public.objection_reviews (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id         uuid        REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
  pack_id         uuid        REFERENCES public.discovery_packs(id) ON DELETE CASCADE NOT NULL,
  response_id     uuid        REFERENCES public.discovery_responses(id) ON DELETE CASCADE NOT NULL,
  status          text        NOT NULL DEFAULT 'pending'
                              CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  extractor       text,
  model           text,
  prompt_version  text,
  error           text,
  created_by      uuid        REFERENCES auth.users(id) NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- 2) objection_items
CREATE TABLE public.objection_items (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id       uuid        REFERENCES public.objection_reviews(id) ON DELETE CASCADE NOT NULL,
  item_type       text        NOT NULL,
  item_no         int         NOT NULL,
  text_excerpt    text,
  labels          text[]      NOT NULL DEFAULT '{}',
  confidence      numeric     CHECK (confidence >= 0 AND confidence <= 1),
  neutral_summary text,
  follow_up_flag  boolean     NOT NULL DEFAULT false,
  status          text        NOT NULL DEFAULT 'pending'
                              CHECK (status IN ('pending', 'reviewed', 'disputed')),
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- 3) meet_and_confer_drafts
CREATE TABLE public.meet_and_confer_drafts (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id         uuid        REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
  pack_id         uuid        REFERENCES public.discovery_packs(id) ON DELETE CASCADE NOT NULL,
  review_id       uuid        REFERENCES public.objection_reviews(id) ON DELETE CASCADE NOT NULL,
  status          text        NOT NULL DEFAULT 'draft'
                              CHECK (status IN ('draft', 'final', 'sent')),
  content_text    text,
  sha256          text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ── Indexes ────────────────────────────────

CREATE INDEX idx_objection_reviews_pack_created
  ON public.objection_reviews (pack_id, created_at DESC);

CREATE INDEX idx_objection_reviews_case_created
  ON public.objection_reviews (case_id, created_at DESC);

CREATE INDEX idx_objection_items_review_type_no
  ON public.objection_items (review_id, item_type, item_no);

CREATE INDEX idx_meet_and_confer_drafts_pack_created
  ON public.meet_and_confer_drafts (pack_id, created_at DESC);

-- ── RLS ────────────────────────────────────

ALTER TABLE public.objection_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.objection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meet_and_confer_drafts ENABLE ROW LEVEL SECURITY;

-- ---- objection_reviews: join through cases ----

CREATE POLICY "Users can select own objection reviews"
  ON public.objection_reviews FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = objection_reviews.case_id
      AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own objection reviews"
  ON public.objection_reviews FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = objection_reviews.case_id
      AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own objection reviews"
  ON public.objection_reviews FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = objection_reviews.case_id
      AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own objection reviews"
  ON public.objection_reviews FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = objection_reviews.case_id
      AND cases.user_id = auth.uid()
  ));

-- ---- objection_items: join through objection_reviews → cases ----

CREATE POLICY "Users can select own objection items"
  ON public.objection_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.objection_reviews
    JOIN public.cases ON cases.id = objection_reviews.case_id
    WHERE objection_reviews.id = objection_items.review_id
      AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own objection items"
  ON public.objection_items FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.objection_reviews
    JOIN public.cases ON cases.id = objection_reviews.case_id
    WHERE objection_reviews.id = objection_items.review_id
      AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own objection items"
  ON public.objection_items FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.objection_reviews
    JOIN public.cases ON cases.id = objection_reviews.case_id
    WHERE objection_reviews.id = objection_items.review_id
      AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own objection items"
  ON public.objection_items FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.objection_reviews
    JOIN public.cases ON cases.id = objection_reviews.case_id
    WHERE objection_reviews.id = objection_items.review_id
      AND cases.user_id = auth.uid()
  ));

-- ---- meet_and_confer_drafts: join through cases ----

CREATE POLICY "Users can select own meet and confer drafts"
  ON public.meet_and_confer_drafts FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = meet_and_confer_drafts.case_id
      AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own meet and confer drafts"
  ON public.meet_and_confer_drafts FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = meet_and_confer_drafts.case_id
      AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own meet and confer drafts"
  ON public.meet_and_confer_drafts FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = meet_and_confer_drafts.case_id
      AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own meet and confer drafts"
  ON public.meet_and_confer_drafts FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = meet_and_confer_drafts.case_id
      AND cases.user_id = auth.uid()
  ));
