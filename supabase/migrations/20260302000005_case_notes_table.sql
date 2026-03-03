CREATE TABLE public.case_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  pinned boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_case_notes_case_created
  ON public.case_notes (case_id, pinned DESC, created_at DESC);

ALTER TABLE public.case_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own case notes"
  ON public.case_notes FOR ALL
  USING (user_id = auth.uid());
