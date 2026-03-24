-- Add expiry column for share tokens
ALTER TABLE cases ADD COLUMN share_expires_at timestamptz;

-- Backfill: existing share tokens expire 30 days from now
UPDATE cases
SET share_expires_at = now() + interval '30 days'
WHERE share_token IS NOT NULL;
