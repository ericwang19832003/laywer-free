-- ============================================
-- Discovery Pack v1: tables, indexes, RLS
-- ============================================
-- discovery_packs        → direct child of cases
-- discovery_items        → child of discovery_packs
-- discovery_service_logs → child of discovery_packs
-- discovery_responses    → child of discovery_packs
-- ============================================

-- 1) discovery_packs
CREATE TABLE public.discovery_packs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  status text CHECK (status IN ('draft', 'finalized', 'served', 'response_received')) DEFAULT 'draft',
  created_by uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 2) discovery_items
CREATE TABLE public.discovery_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pack_id uuid REFERENCES public.discovery_packs(id) ON DELETE CASCADE NOT NULL,
  item_type text CHECK (item_type IN ('rfp', 'rog', 'rfa')) NOT NULL,
  item_no int NOT NULL,
  prompt_text text,
  generated_text text,
  status text CHECK (status IN ('draft', 'reviewed', 'finalized')) DEFAULT 'draft',
  created_at timestamptz DEFAULT now(),
  UNIQUE (pack_id, item_type, item_no)
);

-- 3) discovery_service_logs
CREATE TABLE public.discovery_service_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pack_id uuid REFERENCES public.discovery_packs(id) ON DELETE CASCADE NOT NULL,
  served_at timestamptz NOT NULL,
  service_method text NOT NULL,
  served_to_name text,
  served_to_email text,
  served_to_address text,
  notes text,
  communications_id uuid REFERENCES public.communications(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- 4) discovery_responses
CREATE TABLE public.discovery_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pack_id uuid REFERENCES public.discovery_packs(id) ON DELETE CASCADE NOT NULL,
  received_at timestamptz NOT NULL,
  response_type text NOT NULL,
  storage_path text NOT NULL,
  file_name text NOT NULL,
  mime_type text,
  sha256 text,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_discovery_packs_case_created
  ON public.discovery_packs (case_id, created_at DESC);

CREATE INDEX idx_discovery_items_pack_type_no
  ON public.discovery_items (pack_id, item_type, item_no);

CREATE INDEX idx_discovery_service_logs_pack_served
  ON public.discovery_service_logs (pack_id, served_at DESC);

CREATE INDEX idx_discovery_responses_pack_received
  ON public.discovery_responses (pack_id, received_at DESC);

-- ============================================
-- RLS
-- ============================================

ALTER TABLE public.discovery_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discovery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discovery_service_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discovery_responses ENABLE ROW LEVEL SECURITY;

-- ---- discovery_packs: join through cases ----

CREATE POLICY "Users can select own discovery packs"
  ON public.discovery_packs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = discovery_packs.case_id
      AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own discovery packs"
  ON public.discovery_packs FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = discovery_packs.case_id
      AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own discovery packs"
  ON public.discovery_packs FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = discovery_packs.case_id
      AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own discovery packs"
  ON public.discovery_packs FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = discovery_packs.case_id
      AND cases.user_id = auth.uid()
  ));

-- ---- discovery_items: join through discovery_packs → cases ----

CREATE POLICY "Users can select own discovery items"
  ON public.discovery_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.discovery_packs
    JOIN public.cases ON cases.id = discovery_packs.case_id
    WHERE discovery_packs.id = discovery_items.pack_id
      AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own discovery items"
  ON public.discovery_items FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.discovery_packs
    JOIN public.cases ON cases.id = discovery_packs.case_id
    WHERE discovery_packs.id = discovery_items.pack_id
      AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own discovery items"
  ON public.discovery_items FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.discovery_packs
    JOIN public.cases ON cases.id = discovery_packs.case_id
    WHERE discovery_packs.id = discovery_items.pack_id
      AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own discovery items"
  ON public.discovery_items FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.discovery_packs
    JOIN public.cases ON cases.id = discovery_packs.case_id
    WHERE discovery_packs.id = discovery_items.pack_id
      AND cases.user_id = auth.uid()
  ));

-- ---- discovery_service_logs: join through discovery_packs → cases ----

CREATE POLICY "Users can select own discovery service logs"
  ON public.discovery_service_logs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.discovery_packs
    JOIN public.cases ON cases.id = discovery_packs.case_id
    WHERE discovery_packs.id = discovery_service_logs.pack_id
      AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own discovery service logs"
  ON public.discovery_service_logs FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.discovery_packs
    JOIN public.cases ON cases.id = discovery_packs.case_id
    WHERE discovery_packs.id = discovery_service_logs.pack_id
      AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own discovery service logs"
  ON public.discovery_service_logs FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.discovery_packs
    JOIN public.cases ON cases.id = discovery_packs.case_id
    WHERE discovery_packs.id = discovery_service_logs.pack_id
      AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own discovery service logs"
  ON public.discovery_service_logs FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.discovery_packs
    JOIN public.cases ON cases.id = discovery_packs.case_id
    WHERE discovery_packs.id = discovery_service_logs.pack_id
      AND cases.user_id = auth.uid()
  ));

-- ---- discovery_responses: join through discovery_packs → cases ----

CREATE POLICY "Users can select own discovery responses"
  ON public.discovery_responses FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.discovery_packs
    JOIN public.cases ON cases.id = discovery_packs.case_id
    WHERE discovery_packs.id = discovery_responses.pack_id
      AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own discovery responses"
  ON public.discovery_responses FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.discovery_packs
    JOIN public.cases ON cases.id = discovery_packs.case_id
    WHERE discovery_packs.id = discovery_responses.pack_id
      AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own discovery responses"
  ON public.discovery_responses FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.discovery_packs
    JOIN public.cases ON cases.id = discovery_packs.case_id
    WHERE discovery_packs.id = discovery_responses.pack_id
      AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own discovery responses"
  ON public.discovery_responses FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.discovery_packs
    JOIN public.cases ON cases.id = discovery_packs.case_id
    WHERE discovery_packs.id = discovery_responses.pack_id
      AND cases.user_id = auth.uid()
  ));
