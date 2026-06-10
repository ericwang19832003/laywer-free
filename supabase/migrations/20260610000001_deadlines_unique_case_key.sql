-- Add unique constraint on (case_id, key) so that upsert with onConflict: 'case_id,key' works.
-- Required by auto-deadline creation (SOL, appeal, discovery cutoff, discovery response).
CREATE UNIQUE INDEX IF NOT EXISTS idx_deadlines_case_key
  ON public.deadlines (case_id, key);
