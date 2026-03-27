-- ============================================
-- Notification Preferences Support
-- Adds snoozed_until to reminders, updates channel constraint
-- ============================================

-- 1) Add snoozed_until to reminders table
ALTER TABLE public.reminders
  ADD COLUMN IF NOT EXISTS snoozed_until timestamptz;

-- 2) Update channel check constraint to include push and sms
-- The original constraint was inline (unnamed), so we need to find and drop it
-- In PostgreSQL, inline CHECK constraints get auto-named as <table>_<column>_check
ALTER TABLE public.reminders
  DROP CONSTRAINT IF EXISTS reminders_channel_check;

ALTER TABLE public.reminders
  ADD CONSTRAINT reminders_channel_check
  CHECK (channel IN ('email', 'push', 'sms'));
