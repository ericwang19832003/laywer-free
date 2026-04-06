-- Allow health-based alerts that have no associated deadline
ALTER TABLE public.reminder_escalations
  ALTER COLUMN deadline_id DROP NOT NULL;

-- One health alert per case per UTC day (race-condition proof dedup)
CREATE UNIQUE INDEX reminder_escalations_health_case_day_uniq
  ON public.reminder_escalations (case_id, (date(triggered_at AT TIME ZONE 'UTC')))
  WHERE deadline_id IS NULL;
