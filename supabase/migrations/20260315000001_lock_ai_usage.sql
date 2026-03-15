-- Remove client-writable policies on ai_usage.
-- The increment_ai_usage() function is SECURITY DEFINER and handles writes.
-- Users should only be able to SELECT their own usage.

DROP POLICY IF EXISTS "Users can upsert own usage" ON public.ai_usage;
DROP POLICY IF EXISTS "Users can update own usage" ON public.ai_usage;
