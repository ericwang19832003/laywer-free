-- Restrict increment_ai_usage to only work on the authenticated user's own row.
-- Remove the p_user_id parameter and use auth.uid() instead.

CREATE OR REPLACE FUNCTION public.increment_ai_usage(p_month text)
RETURNS void AS $$
DECLARE
  v_user_id uuid := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO public.ai_usage (user_id, month, generation_count)
  VALUES (v_user_id, p_month, 1)
  ON CONFLICT (user_id, month)
  DO UPDATE SET generation_count = ai_usage.generation_count + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Revoke direct execute from anon (only authenticated users)
REVOKE EXECUTE ON FUNCTION public.increment_ai_usage(text) FROM anon;
