-- Fix: overly-permissive INSERT policy allowed any client to insert
-- notifications for any user. Replace with two scoped policies:
--   1. Authenticated users can only insert notifications for themselves.
--   2. Service role (CRON / Edge Functions) can insert for any user.

DROP POLICY "Service can insert notifications" ON public.notifications;

CREATE POLICY "Users can insert own notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Service role can insert notifications"
  ON public.notifications FOR INSERT
  TO service_role
  WITH CHECK (true);
