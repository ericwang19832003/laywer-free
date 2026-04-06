-- ============================================
-- Enforce one risk score per case per UTC day
-- ============================================

-- ── Deduplicate existing rows (keep most recent per case per day) ─

DELETE FROM public.case_risk_scores a
 USING public.case_risk_scores b
 WHERE a.case_id = b.case_id
   AND date(a.computed_at AT TIME ZONE 'UTC') = date(b.computed_at AT TIME ZONE 'UTC')
   AND a.created_at < b.created_at;

-- ── Unique index ─────────────────────────────────────────────────

CREATE UNIQUE INDEX case_risk_scores_case_day_uniq
    ON public.case_risk_scores (case_id, (date(computed_at AT TIME ZONE 'UTC')));
