-- Add user-editable title to cases table
ALTER TABLE public.cases
  ADD COLUMN IF NOT EXISTS title text;
