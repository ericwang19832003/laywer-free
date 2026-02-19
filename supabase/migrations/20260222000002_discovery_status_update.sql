-- ============================================
-- Update discovery_packs status values to match API spec
-- Old: draft, finalized, served, response_received
-- New: draft, ready, served, responses_pending, complete
-- ============================================

ALTER TABLE public.discovery_packs
  DROP CONSTRAINT IF EXISTS discovery_packs_status_check;

ALTER TABLE public.discovery_packs
  ADD CONSTRAINT discovery_packs_status_check
  CHECK (status IN ('draft', 'ready', 'served', 'responses_pending', 'complete'));
