ALTER TABLE public.documents
  ADD COLUMN metadata jsonb NOT NULL DEFAULT '{}'::jsonb;
