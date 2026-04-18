-- supabase/migrations/20260418000001_sms_preferences.sql
ALTER TABLE public.user_preferences
  ADD COLUMN IF NOT EXISTS phone_number TEXT,
  ADD COLUMN IF NOT EXISTS sms_opt_in BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.user_preferences.phone_number IS 'E.164 format, e.g. +15551234567';
COMMENT ON COLUMN public.user_preferences.sms_opt_in IS 'User has opted in to SMS deadline alerts';
