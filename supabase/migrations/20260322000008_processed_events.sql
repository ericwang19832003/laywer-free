CREATE TABLE IF NOT EXISTS public.processed_events (
  event_id text PRIMARY KEY,
  event_type text NOT NULL,
  processed_at timestamptz DEFAULT now()
);
