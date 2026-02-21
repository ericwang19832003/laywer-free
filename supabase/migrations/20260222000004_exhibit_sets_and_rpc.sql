-- ============================================
-- Exhibit Sets & Exhibits
-- Atomic exhibit numbering via Postgres RPC
-- ============================================

-- ── Tables ─────────────────────────────────────

CREATE TABLE public.exhibit_sets (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id       uuid        REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
  title         text,
  numbering_style text      NOT NULL DEFAULT 'numeric'
                            CHECK (numbering_style IN ('numeric', 'alpha')),
  next_number   int         NOT NULL DEFAULT 1 CHECK (next_number >= 1),
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- One exhibit set per case for v1
CREATE UNIQUE INDEX idx_exhibit_sets_case ON public.exhibit_sets (case_id);

CREATE TABLE public.exhibits (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  exhibit_set_id   uuid        REFERENCES public.exhibit_sets(id) ON DELETE CASCADE NOT NULL,
  evidence_item_id uuid        REFERENCES public.evidence_items(id) ON DELETE RESTRICT NOT NULL,
  exhibit_no       text        NOT NULL,
  sort_order       int         NOT NULL,
  title            text,
  description      text,
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- One evidence item per exhibit set (no duplicates)
CREATE UNIQUE INDEX idx_exhibits_set_evidence ON public.exhibits (exhibit_set_id, evidence_item_id);

-- Unique exhibit number within a set
CREATE UNIQUE INDEX idx_exhibits_set_no ON public.exhibits (exhibit_set_id, exhibit_no);

-- Sort-order queries
CREATE INDEX idx_exhibits_set_sort ON public.exhibits (exhibit_set_id, sort_order);

-- ── RLS ────────────────────────────────────────

ALTER TABLE public.exhibit_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exhibits     ENABLE ROW LEVEL SECURITY;

-- exhibit_sets: join through cases
CREATE POLICY "Users can view own exhibit sets"
  ON public.exhibit_sets FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = exhibit_sets.case_id
      AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own exhibit sets"
  ON public.exhibit_sets FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = exhibit_sets.case_id
      AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own exhibit sets"
  ON public.exhibit_sets FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = exhibit_sets.case_id
      AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own exhibit sets"
  ON public.exhibit_sets FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = exhibit_sets.case_id
      AND cases.user_id = auth.uid()
  ));

-- exhibits: join through exhibit_sets → cases
CREATE POLICY "Users can view own exhibits"
  ON public.exhibits FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.exhibit_sets es
    JOIN public.cases c ON c.id = es.case_id
    WHERE es.id = exhibits.exhibit_set_id
      AND c.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own exhibits"
  ON public.exhibits FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.exhibit_sets es
    JOIN public.cases c ON c.id = es.case_id
    WHERE es.id = exhibits.exhibit_set_id
      AND c.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own exhibits"
  ON public.exhibits FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.exhibit_sets es
    JOIN public.cases c ON c.id = es.case_id
    WHERE es.id = exhibits.exhibit_set_id
      AND c.user_id = auth.uid()
  ));

-- ── RPC: assign_next_exhibit_number ────────────

CREATE OR REPLACE FUNCTION public.assign_next_exhibit_number(
  p_exhibit_set_id   uuid,
  p_evidence_item_id uuid,
  p_title            text DEFAULT NULL,
  p_description      text DEFAULT NULL
)
RETURNS SETOF public.exhibits
LANGUAGE plpgsql
SECURITY INVOKER          -- RLS enforced on every statement
SET search_path = public  -- prevent search_path hijacking
AS $$
DECLARE
  v_numbering_style text;
  v_next_number     int;
  v_exhibit_no      text;
  v_sort_order      int;
BEGIN
  -- ① Duplicate guard: is this evidence item already in the set?
  IF EXISTS (
    SELECT 1 FROM public.exhibits
    WHERE exhibit_set_id   = p_exhibit_set_id
      AND evidence_item_id = p_evidence_item_id
  ) THEN
    RAISE EXCEPTION 'This evidence item is already in the exhibit set.'
      USING ERRCODE = 'unique_violation';
  END IF;

  -- ② Lock the exhibit-set row and read its config
  SELECT numbering_style, next_number
    INTO v_numbering_style, v_next_number
    FROM public.exhibit_sets
   WHERE id = p_exhibit_set_id
     FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Exhibit set not found.'
      USING ERRCODE = 'no_data_found';
  END IF;

  -- ③ Generate exhibit_no
  IF v_numbering_style = 'alpha' THEN
    IF v_next_number > 26 THEN
      RAISE EXCEPTION
        'Alpha exhibit numbering is limited to 26 exhibits (A–Z). Consider switching to numeric numbering.'
        USING ERRCODE = 'check_violation';
    END IF;
    v_exhibit_no := chr(64 + v_next_number);   -- 65 = 'A'
  ELSE
    v_exhibit_no := v_next_number::text;
  END IF;

  -- ④ Determine sort_order (max + 1 within the set)
  SELECT coalesce(max(sort_order), 0) + 1
    INTO v_sort_order
    FROM public.exhibits
   WHERE exhibit_set_id = p_exhibit_set_id;

  -- ⑤ Insert the exhibit row
  RETURN QUERY
  INSERT INTO public.exhibits (
    exhibit_set_id, evidence_item_id, exhibit_no, sort_order, title, description
  ) VALUES (
    p_exhibit_set_id, p_evidence_item_id, v_exhibit_no, v_sort_order, p_title, p_description
  )
  RETURNING *;

  -- ⑥ Bump next_number
  UPDATE public.exhibit_sets
     SET next_number = v_next_number + 1
   WHERE id = p_exhibit_set_id;
END;
$$;

-- Grant execute to authenticated users (PostgREST exposes it)
GRANT EXECUTE ON FUNCTION public.assign_next_exhibit_number(uuid, uuid, text, text)
  TO authenticated;
