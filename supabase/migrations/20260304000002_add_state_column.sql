-- Add state column to cases table
-- Defaults to 'TX' so all existing cases are automatically Texas
ALTER TABLE public.cases
  ADD COLUMN IF NOT EXISTS state text NOT NULL DEFAULT 'TX';

-- Add CHECK constraint for valid states
ALTER TABLE public.cases
  ADD CONSTRAINT cases_state_check
  CHECK (state IN ('TX', 'CA'));

-- Expand court_type to include CA court types
ALTER TABLE public.cases
  DROP CONSTRAINT IF EXISTS cases_court_type_check;

ALTER TABLE public.cases
  ADD CONSTRAINT cases_court_type_check
  CHECK (court_type IN (
    'jp', 'county', 'district', 'federal', 'unknown',
    'small_claims', 'limited_civil', 'unlimited_civil'
  ));

-- Index for state-filtered queries
CREATE INDEX IF NOT EXISTS idx_cases_state ON public.cases(state);

-- Backfill existing rows (safety measure, default handles it)
UPDATE public.cases SET state = 'TX' WHERE state IS NULL;
