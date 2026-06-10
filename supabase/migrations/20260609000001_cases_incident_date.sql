-- Add incident_date to cases for SOL calculation
-- This replaces the per-dispute-type side table approach with a unified column.
ALTER TABLE public.cases
  ADD COLUMN IF NOT EXISTS incident_date date;
