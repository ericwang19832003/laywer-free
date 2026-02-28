-- ============================================
-- Fix objection_reviews.status CHECK constraint
-- and make objection_items.item_no nullable
-- ============================================
-- The original migration only allowed ('pending', 'running', 'completed', 'failed'),
-- but the extract and classify endpoints use 'queued', 'classifying', and 'needs_review'.

-- 1) Replace the status CHECK constraint
ALTER TABLE public.objection_reviews
  DROP CONSTRAINT objection_reviews_status_check;

ALTER TABLE public.objection_reviews
  ADD CONSTRAINT objection_reviews_status_check
  CHECK (status IN ('queued', 'running', 'classifying', 'needs_review', 'completed', 'failed'));

-- 2) Update the default from 'pending' (removed) to 'queued'
ALTER TABLE public.objection_reviews
  ALTER COLUMN status SET DEFAULT 'queued';

-- 3) Make item_no nullable — when item_type is 'unknown' we may not know the number
ALTER TABLE public.objection_items
  ALTER COLUMN item_no DROP NOT NULL;
