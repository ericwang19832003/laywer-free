CREATE TABLE public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  endpoint text NOT NULL,
  window_start timestamptz NOT NULL DEFAULT now(),
  request_count int NOT NULL DEFAULT 1,
  UNIQUE(user_id, endpoint, window_start)
);

CREATE INDEX idx_rate_limits_lookup ON public.rate_limits (user_id, endpoint, window_start DESC);

-- RLS: only service role can access (used server-side only)
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Atomic upsert-and-increment; returns the new request_count
CREATE OR REPLACE FUNCTION increment_rate_limit(
  p_user_id uuid,
  p_endpoint text,
  p_window_start timestamptz
) RETURNS int AS $$
DECLARE
  v_count int;
BEGIN
  INSERT INTO public.rate_limits (user_id, endpoint, window_start, request_count)
  VALUES (p_user_id, p_endpoint, p_window_start, 1)
  ON CONFLICT (user_id, endpoint, window_start)
  DO UPDATE SET request_count = rate_limits.request_count + 1
  RETURNING request_count INTO v_count;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cleanup old entries (run daily via CRON)
CREATE OR REPLACE FUNCTION cleanup_rate_limits() RETURNS void AS $$
BEGIN
  DELETE FROM public.rate_limits WHERE window_start < now() - interval '2 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
