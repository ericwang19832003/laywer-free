-- Add 'federal' as a valid court_type
ALTER TABLE public.cases
  DROP CONSTRAINT IF EXISTS cases_court_type_check;

ALTER TABLE public.cases
  ADD CONSTRAINT cases_court_type_check
  CHECK (court_type IN ('jp', 'county', 'district', 'federal', 'unknown'));
