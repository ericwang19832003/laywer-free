# 10-Feature Improvement Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement 10 major features across UX, growth, revenue, AI, mobile, and data to transform Lawyer Free from a filing tool into a full case companion platform.

**Architecture:** Each feature is an independent module integrating with existing case/task/wizard architecture via Supabase tables, Next.js API routes, and React components. Features share Stripe infrastructure (features #3, #5) and analytics infrastructure (features #4, #7, #10).

**Tech Stack:** Next.js 16, Supabase (Postgres + RLS), React 19, Tailwind CSS 4, Claude AI, shadcn/ui, Stripe

---

## Phase 1: Foundation (Features #4, #5, #10)

---

### Task 1: Database migration for Phase 1 tables

**Files:**
- Create: `supabase/migrations/20260314100000_phase1_foundation.sql`

**Step 1: Write the migration**

```sql
-- ============================================
-- Phase 1 Foundation: Confidence Scores, Analytics, Subscriptions
-- ============================================

-- ── Confidence Scores ─────────────────────────────────────────────

CREATE TABLE public.case_confidence_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
  score int NOT NULL CHECK (score >= 0 AND score <= 100),
  breakdown jsonb NOT NULL DEFAULT '{}'::jsonb,
  computed_at timestamptz DEFAULT now()
);

CREATE INDEX idx_case_confidence_case_computed
  ON public.case_confidence_scores (case_id, computed_at DESC);

ALTER TABLE public.case_confidence_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own confidence scores"
  ON public.case_confidence_scores FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = case_confidence_scores.case_id
      AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own confidence scores"
  ON public.case_confidence_scores FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = case_confidence_scores.case_id
      AND cases.user_id = auth.uid()
  ));

-- ── Case Analytics ────────────────────────────────────────────────

CREATE TABLE public.case_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
  event_type text NOT NULL,
  payload jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_case_analytics_case_type
  ON public.case_analytics (case_id, event_type, created_at DESC);

CREATE INDEX idx_case_analytics_type_created
  ON public.case_analytics (event_type, created_at DESC);

ALTER TABLE public.case_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own analytics"
  ON public.case_analytics FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = case_analytics.case_id
      AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own analytics"
  ON public.case_analytics FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = case_analytics.case_id
      AND cases.user_id = auth.uid()
  ));

-- Service role can insert analytics (for cron jobs)
CREATE POLICY "Service role can insert analytics"
  ON public.case_analytics FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- ── Analytics Benchmarks ──────────────────────────────────────────

CREATE TABLE public.analytics_benchmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_type text NOT NULL,
  court_type text,
  metric text NOT NULL,
  value numeric NOT NULL,
  sample_size int NOT NULL DEFAULT 0,
  computed_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX idx_benchmarks_unique
  ON public.analytics_benchmarks (dispute_type, COALESCE(court_type, ''), metric);

-- Benchmarks are public read (anonymized aggregate data)
ALTER TABLE public.analytics_benchmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read benchmarks"
  ON public.analytics_benchmarks FOR SELECT
  USING (true);

CREATE POLICY "Service role can manage benchmarks"
  ON public.analytics_benchmarks FOR ALL
  USING (auth.role() = 'service_role');

-- ── User Subscriptions ────────────────────────────────────────────

CREATE TABLE public.user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  tier text NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'premium')),
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_user_subscriptions_user
  ON public.user_subscriptions (user_id);

CREATE INDEX idx_user_subscriptions_stripe
  ON public.user_subscriptions (stripe_customer_id);

ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own subscription"
  ON public.user_subscriptions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own subscription"
  ON public.user_subscriptions FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Service role can manage subscriptions"
  ON public.user_subscriptions FOR ALL
  USING (auth.role() = 'service_role');

-- ── AI Usage Tracking ─────────────────────────────────────────────

CREATE TABLE public.ai_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  month text NOT NULL,  -- '2026-03' format
  generation_count int NOT NULL DEFAULT 0,
  UNIQUE (user_id, month)
);

ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own usage"
  ON public.ai_usage FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can upsert own usage"
  ON public.ai_usage FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own usage"
  ON public.ai_usage FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Service role can manage usage"
  ON public.ai_usage FOR ALL
  USING (auth.role() = 'service_role');

-- ── Auto-create subscription on signup ────────────────────────────

CREATE OR REPLACE FUNCTION public.auto_create_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_subscriptions (user_id, tier)
  VALUES (NEW.id, 'free')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.auto_create_subscription();

-- Backfill existing users
INSERT INTO public.user_subscriptions (user_id, tier)
SELECT id, 'free' FROM auth.users
ON CONFLICT (user_id) DO NOTHING;
```

**Step 2: Apply migration**

Run: `cd "/Users/minwang/lawyer free" && npx supabase db push`
Expected: Migration applied successfully

**Step 3: Commit**

```bash
git add supabase/migrations/20260314100000_phase1_foundation.sql
git commit -m "feat: add Phase 1 tables (confidence scores, analytics, subscriptions)"
```

---

### Task 2: Confidence Score computation engine

**Files:**
- Create: `src/lib/confidence/compute.ts`
- Create: `src/lib/confidence/types.ts`

**Step 1: Create types**

```typescript
// src/lib/confidence/types.ts
export interface ConfidenceBreakdown {
  case_created: number        // 20 pts
  intake_completed: number     // 10 pts
  evidence_uploaded: number    // 10 pts
  filing_prep_done: number     // 10 pts
  filed_with_court: number     // 5 pts
  served_defendant: number     // 5 pts
  no_missed_deadlines: number  // 5 pts
  evidence_3plus: number       // 5 pts
  discovery_created: number    // 5 pts
  tasks_current: number        // 5 pts
  research_saved: number       // 5 pts
  notes_added: number          // 5 pts
  trial_binder: number         // 5 pts
  courtroom_prep: number       // 5 pts
}

export interface ConfidenceResult {
  score: number
  breakdown: ConfidenceBreakdown
}
```

**Step 2: Create computation function**

```typescript
// src/lib/confidence/compute.ts
import type { SupabaseClient } from '@supabase/supabase-js'
import type { ConfidenceResult, ConfidenceBreakdown } from './types'

export async function computeConfidenceScore(
  supabase: SupabaseClient,
  caseId: string
): Promise<ConfidenceResult> {
  // Fetch all data in parallel
  const [
    { data: tasks },
    { data: evidence },
    { data: deadlines },
    { data: discoveryPacks },
    { data: authorities },
    { data: notes },
    { data: binders },
  ] = await Promise.all([
    supabase.from('tasks').select('task_key, status').eq('case_id', caseId),
    supabase.from('evidence_items').select('id').eq('case_id', caseId),
    supabase.from('deadlines').select('due_at').eq('case_id', caseId).lt('due_at', new Date().toISOString()),
    supabase.from('discovery_packs').select('id').eq('case_id', caseId),
    supabase.from('case_authorities').select('id').eq('case_id', caseId),
    supabase.from('case_notes').select('id').eq('case_id', caseId),
    supabase.from('trial_binders').select('id').eq('case_id', caseId),
  ])

  const taskMap = new Map((tasks ?? []).map(t => [t.task_key, t.status]))
  const completedKeys = new Set(
    (tasks ?? []).filter(t => t.status === 'completed').map(t => t.task_key)
  )

  // Filing-related keys (any workflow)
  const filingKeys = ['prepare_filing', 'prepare_small_claims_filing', 'prepare_pi_petition',
    'contract_prepare_filing', 'property_prepare_filing', 'prepare_landlord_tenant_filing',
    'prepare_debt_defense_answer', 'other_prepare_filing',
    'divorce_prepare_filing', 'custody_prepare_filing', 'child_support_prepare_filing',
    'visitation_prepare_filing', 'spousal_support_prepare_filing', 'po_prepare_filing', 'mod_prepare_filing',
    'biz_partnership_prepare_filing', 'biz_employment_prepare_filing', 'biz_b2b_prepare_filing',
    're_prepare_filing']
  const fileWithCourtKeys = ['file_with_court', 'sc_file_with_court', 'pi_file_with_court',
    'contract_file_with_court', 'property_file_with_court', 'lt_file_with_court',
    'debt_file_with_court', 'other_file_with_court',
    'divorce_file_with_court', 'custody_file_with_court', 'child_support_file_with_court',
    'visitation_file_with_court', 'spousal_support_file_with_court', 'po_file_with_court', 'mod_file_with_court']
  const serveKeys = ['serve_defendant', 'sc_serve_defendant', 'pi_serve_defendant',
    'contract_serve_defendant', 'property_serve_defendant', 'lt_serve_defendant',
    'debt_serve_defendant', 'other_serve_defendant',
    'divorce_serve_respondent', 'custody_serve_respondent', 'visitation_serve_respondent',
    'spousal_support_serve_respondent']
  const intakeKeys = ['intake', 'small_claims_intake', 'pi_intake', 'contract_intake',
    'property_intake', 'lt_intake', 'debt_defense_intake', 'other_intake',
    'divorce_intake', 'custody_intake', 'child_support_intake', 'visitation_intake',
    'spousal_support_intake', 'po_intake', 'mod_intake']

  const hasAnyCompleted = (keys: string[]) => keys.some(k => completedKeys.has(k))

  // Check for missed deadlines
  const now = new Date()
  const missedDeadlines = (deadlines ?? []).filter(d => new Date(d.due_at) < now)

  // Count tasks not completed/skipped that are unlocked
  const pendingTasks = (tasks ?? []).filter(t =>
    t.status !== 'completed' && t.status !== 'skipped' && t.status !== 'locked'
  )

  const breakdown: ConfidenceBreakdown = {
    case_created: 20,
    intake_completed: hasAnyCompleted(intakeKeys) ? 10 : 0,
    evidence_uploaded: (evidence?.length ?? 0) > 0 ? 10 : 0,
    filing_prep_done: hasAnyCompleted(filingKeys) ? 10 : 0,
    filed_with_court: hasAnyCompleted(fileWithCourtKeys) ? 5 : 0,
    served_defendant: hasAnyCompleted(serveKeys) ? 5 : 0,
    no_missed_deadlines: missedDeadlines.length === 0 ? 5 : 0,
    evidence_3plus: (evidence?.length ?? 0) >= 3 ? 5 : 0,
    discovery_created: (discoveryPacks?.length ?? 0) > 0 ? 5 : 0,
    tasks_current: pendingTasks.length === 0 ? 5 : 0,
    research_saved: (authorities?.length ?? 0) > 0 ? 5 : 0,
    notes_added: (notes?.length ?? 0) > 0 ? 5 : 0,
    trial_binder: (binders?.length ?? 0) > 0 ? 5 : 0,
    courtroom_prep: completedKeys.has('courtroom_prep') ? 5 : 0,
  }

  const score = Object.values(breakdown).reduce((sum, v) => sum + v, 0)

  return { score: Math.min(score, 100), breakdown }
}

export async function computeAndStoreConfidence(
  supabase: SupabaseClient,
  caseId: string
): Promise<ConfidenceResult> {
  const result = await computeConfidenceScore(supabase, caseId)

  await supabase.from('case_confidence_scores').insert({
    case_id: caseId,
    score: result.score,
    breakdown: result.breakdown,
  })

  return result
}
```

**Step 3: Commit**

```bash
git add src/lib/confidence/
git commit -m "feat: add confidence score computation engine"
```

---

### Task 3: Confidence Score dashboard card

**Files:**
- Create: `src/components/dashboard/confidence-score-card.tsx`
- Modify: `src/app/(authenticated)/case/[id]/page.tsx`

**Step 1: Create the card component**

```typescript
// src/components/dashboard/confidence-score-card.tsx
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react'
import { useState } from 'react'
import type { ConfidenceBreakdown } from '@/lib/confidence/types'

interface ConfidenceScoreCardProps {
  score: number
  breakdown: ConfidenceBreakdown
}

const BREAKDOWN_LABELS: Record<keyof ConfidenceBreakdown, string> = {
  case_created: 'Case created',
  intake_completed: 'Intake completed',
  evidence_uploaded: 'Evidence uploaded',
  filing_prep_done: 'Filing preparation done',
  filed_with_court: 'Filed with court',
  served_defendant: 'Served other party',
  no_missed_deadlines: 'No missed deadlines',
  evidence_3plus: '3+ evidence items',
  discovery_created: 'Discovery pack created',
  tasks_current: 'All tasks up to date',
  research_saved: 'Legal research saved',
  notes_added: 'Case notes added',
  trial_binder: 'Trial binder created',
  courtroom_prep: 'Courtroom prep completed',
}

function getMilestoneMessage(score: number): string {
  if (score >= 100) return "Fully prepared! You've done everything possible to give yourself the best chance."
  if (score >= 75) return "Almost ready! You're better prepared than most self-represented litigants."
  if (score >= 50) return 'Halfway there! Your case is more organized than most.'
  if (score >= 25) return "Great start! You've taken the first steps to protect your rights."
  return 'Getting started — every step counts.'
}

function getScoreStyle(score: number) {
  if (score >= 75) return { ring: 'text-calm-green', bg: 'bg-calm-green', badge: 'bg-calm-green/10 text-calm-green' }
  if (score >= 50) return { ring: 'text-calm-indigo', bg: 'bg-calm-indigo', badge: 'bg-calm-indigo/10 text-calm-indigo' }
  if (score >= 25) return { ring: 'text-calm-amber', bg: 'bg-calm-amber', badge: 'bg-calm-amber/10 text-calm-amber' }
  return { ring: 'text-warm-muted', bg: 'bg-warm-muted', badge: 'bg-warm-muted/10 text-warm-muted' }
}

export function ConfidenceScoreCard({ score, breakdown }: ConfidenceScoreCardProps) {
  const [expanded, setExpanded] = useState(false)
  const style = getScoreStyle(score)
  const message = getMilestoneMessage(score)

  const earned = Object.entries(breakdown).filter(([, v]) => v > 0)
  const remaining = Object.entries(breakdown).filter(([, v]) => v === 0)

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-warm-text flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-calm-indigo" />
            Case Confidence
          </CardTitle>
          <Badge className={style.badge}>{score}%</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress bar */}
        <div className="w-full h-3 rounded-full bg-warm-bg overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${style.bg}`}
            style={{ width: `${score}%` }}
          />
        </div>

        <p className="text-sm text-warm-muted">{message}</p>

        {/* Expandable breakdown */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs text-calm-indigo hover:underline"
        >
          {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          {expanded ? 'Hide details' : 'Show what counts'}
        </button>

        {expanded && (
          <div className="space-y-3 text-xs">
            {earned.length > 0 && (
              <div className="space-y-1">
                <p className="font-medium text-warm-text">Earned</p>
                {earned.map(([key, pts]) => (
                  <div key={key} className="flex justify-between text-warm-muted">
                    <span className="flex items-center gap-1">
                      <span className="text-calm-green">&#10003;</span>
                      {BREAKDOWN_LABELS[key as keyof ConfidenceBreakdown]}
                    </span>
                    <span className="text-calm-green">+{pts}</span>
                  </div>
                ))}
              </div>
            )}
            {remaining.length > 0 && (
              <div className="space-y-1">
                <p className="font-medium text-warm-text">Still available</p>
                {remaining.map(([key]) => (
                  <div key={key} className="flex justify-between text-warm-muted">
                    <span className="opacity-50">{BREAKDOWN_LABELS[key as keyof ConfidenceBreakdown]}</span>
                    <span className="opacity-50">—</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

**Step 2: Add to case dashboard**

In `src/app/(authenticated)/case/[id]/page.tsx`:
- Add import for `ConfidenceScoreCard`
- Add query for latest confidence score (parallel with risk score query)
- Add `<ConfidenceScoreCard>` after `<CaseHealthCard>` in the layout
- If no score exists yet, compute one on first dashboard load

**Step 3: Build and verify**

Run: `cd "/Users/minwang/lawyer free" && npx next build`
Expected: Build passes

**Step 4: Commit**

```bash
git add src/components/dashboard/confidence-score-card.tsx src/app/\(authenticated\)/case/\[id\]/page.tsx
git commit -m "feat: add confidence score dashboard card"
```

---

### Task 4: Confidence score API route + task completion hook

**Files:**
- Create: `src/app/api/cases/[id]/confidence/route.ts`
- Modify: `src/app/api/tasks/[id]/route.ts`

**Step 1: Create API route**

```typescript
// src/app/api/cases/[id]/confidence/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { computeAndStoreConfidence } from '@/lib/confidence/compute'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase } = auth

    const { data: caseData } = await supabase
      .from('cases').select('id').eq('id', caseId).single()
    if (!caseData) return NextResponse.json({ error: 'Case not found' }, { status: 404 })

    const { data: existing } = await supabase
      .from('case_confidence_scores')
      .select('score, breakdown, computed_at')
      .eq('case_id', caseId)
      .order('computed_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    return NextResponse.json({ confidence: existing })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase } = auth

    const { data: caseData } = await supabase
      .from('cases').select('id').eq('id', caseId).single()
    if (!caseData) return NextResponse.json({ error: 'Case not found' }, { status: 404 })

    const result = await computeAndStoreConfidence(supabase, caseId)
    return NextResponse.json({ confidence: result })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

**Step 2: Add hook in task completion**

In `src/app/api/tasks/[id]/route.ts`, after the `task_events` insert when status changes to `completed`, add:

```typescript
// Recompute confidence score on task completion
if (newStatus === 'completed' || newStatus === 'skipped') {
  computeAndStoreConfidence(supabase, currentTask.case_id).catch(() => {})
}
```

**Step 3: Commit**

```bash
git add src/app/api/cases/\[id\]/confidence/route.ts src/app/api/tasks/\[id\]/route.ts
git commit -m "feat: add confidence score API and task completion hook"
```

---

### Task 5: Analytics tracking utility

**Files:**
- Create: `src/lib/analytics/track.ts`

**Step 1: Create analytics tracker**

```typescript
// src/lib/analytics/track.ts
import type { SupabaseClient } from '@supabase/supabase-js'

export type AnalyticsEvent =
  | 'wizard_step_completed'
  | 'wizard_step_skipped'
  | 'wizard_abandoned'
  | 'ai_generation_used'
  | 'ai_generation_edited'
  | 'feature_accessed'
  | 'case_outcome_recorded'
  | 'deadline_met'
  | 'deadline_missed'
  | 'evidence_uploaded'
  | 'discovery_created'
  | 'research_query'

export async function trackEvent(
  supabase: SupabaseClient,
  caseId: string,
  eventType: AnalyticsEvent,
  payload: Record<string, unknown> = {}
): Promise<void> {
  await supabase.from('case_analytics').insert({
    case_id: caseId,
    event_type: eventType,
    payload,
  }).then(() => {}) // fire and forget
}
```

**Step 2: Add tracking calls to task completion**

In `src/app/api/tasks/[id]/route.ts`, after task status update:

```typescript
import { trackEvent } from '@/lib/analytics/track'

// After successful status update
if (newStatus === 'completed') {
  trackEvent(supabase, currentTask.case_id, 'wizard_step_completed', {
    task_key: currentTask.task_key,
    duration_seconds: null, // can be added later with client timing
  })
}
if (newStatus === 'skipped') {
  trackEvent(supabase, currentTask.case_id, 'wizard_step_skipped', {
    task_key: currentTask.task_key,
  })
}
```

**Step 3: Commit**

```bash
git add src/lib/analytics/track.ts src/app/api/tasks/\[id\]/route.ts
git commit -m "feat: add analytics event tracking utility"
```

---

### Task 6: Case comparison card (analytics user-facing)

**Files:**
- Create: `src/components/dashboard/case-comparison-card.tsx`
- Modify: `src/app/(authenticated)/case/[id]/page.tsx`

**Step 1: Create comparison card**

```typescript
// src/components/dashboard/case-comparison-card.tsx
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3 } from 'lucide-react'

interface CaseComparisonCardProps {
  taskCompletionRate: number    // 0-100, what % of tasks completed
  evidenceCount: number
  daysSinceCreation: number
  disputeType: string
}

export function CaseComparisonCard({
  taskCompletionRate,
  evidenceCount,
  daysSinceCreation,
  disputeType,
}: CaseComparisonCardProps) {
  // Simple deterministic comparisons (no benchmark table needed initially)
  const avgEvidenceForType = getAvgEvidence(disputeType)
  const evidencePercentile = Math.min(Math.round((evidenceCount / Math.max(avgEvidenceForType, 1)) * 60 + 20), 99)

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-warm-text flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-calm-indigo" />
          How You Compare
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <ComparisonRow
          label="Task completion"
          value={`${taskCompletionRate}%`}
          detail={taskCompletionRate >= 50 ? 'Above average' : 'Keep going'}
          positive={taskCompletionRate >= 50}
        />
        <ComparisonRow
          label="Evidence organized"
          value={`${evidenceCount} items`}
          detail={evidenceCount >= avgEvidenceForType
            ? `More than typical ${formatDisputeType(disputeType)} cases`
            : `Most ${formatDisputeType(disputeType)} cases have ${avgEvidenceForType}+ items`}
          positive={evidenceCount >= avgEvidenceForType}
        />
        <ComparisonRow
          label="Time invested"
          value={`${daysSinceCreation} days`}
          detail="Every day of preparation counts"
          positive={true}
        />
      </CardContent>
    </Card>
  )
}

function ComparisonRow({ label, value, detail, positive }: {
  label: string; value: string; detail: string; positive: boolean
}) {
  return (
    <div className="flex items-start justify-between gap-2">
      <div>
        <p className="text-sm font-medium text-warm-text">{label}</p>
        <p className="text-xs text-warm-muted">{detail}</p>
      </div>
      <span className={`text-sm font-semibold ${positive ? 'text-calm-green' : 'text-warm-muted'}`}>
        {value}
      </span>
    </div>
  )
}

function getAvgEvidence(disputeType: string): number {
  const avgs: Record<string, number> = {
    personal_injury: 8, small_claims: 4, landlord_tenant: 5, family: 6,
    contract: 5, property: 6, debt_defense: 3, other: 4, civil: 5,
  }
  return avgs[disputeType] ?? 5
}

function formatDisputeType(dt: string): string {
  return dt.replace(/_/g, ' ')
}
```

**Step 2: Add to case dashboard**

In `src/app/(authenticated)/case/[id]/page.tsx`, add after the confidence score card:
- Query task completion rate and evidence count
- Render `<CaseComparisonCard>`

**Step 3: Commit**

```bash
git add src/components/dashboard/case-comparison-card.tsx src/app/\(authenticated\)/case/\[id\]/page.tsx
git commit -m "feat: add case comparison analytics card"
```

---

### Task 7: Subscription check utility + AI usage gating

**Files:**
- Create: `src/lib/subscription/check.ts`
- Create: `src/lib/subscription/limits.ts`

**Step 1: Create subscription limits config**

```typescript
// src/lib/subscription/limits.ts
export const TIER_LIMITS = {
  free: {
    maxCases: 1,
    aiGenerationsPerMonth: 5,
    discovery: false,
    trialBinders: false,
    research: 3,  // queries per month
    emailIntegration: false,
    caseSharing: false,
    attorneyReview: false,
  },
  pro: {
    maxCases: 3,
    aiGenerationsPerMonth: Infinity,
    discovery: true,
    trialBinders: true,
    research: Infinity,
    emailIntegration: true,
    caseSharing: true,
    attorneyReview: false,
  },
  premium: {
    maxCases: Infinity,
    aiGenerationsPerMonth: Infinity,
    discovery: true,
    trialBinders: true,
    research: Infinity,
    emailIntegration: true,
    caseSharing: true,
    attorneyReview: true,
  },
} as const

export type SubscriptionTier = keyof typeof TIER_LIMITS
export type Feature = keyof typeof TIER_LIMITS.free

// Features that are NEVER gated (safety-critical)
export const NEVER_GATED: string[] = [
  'deadline_tracking',
  'basic_wizard',
  'fee_waiver_info',
  'court_directory',
  'case_dashboard',
  'health_score',
]
```

**Step 2: Create check utility**

```typescript
// src/lib/subscription/check.ts
import type { SupabaseClient } from '@supabase/supabase-js'
import { TIER_LIMITS, type SubscriptionTier, type Feature } from './limits'

export interface SubscriptionInfo {
  tier: SubscriptionTier
  canAccess: (feature: Feature) => boolean
  aiRemaining: number
  casesRemaining: number
}

export async function getSubscription(
  supabase: SupabaseClient,
  userId: string
): Promise<SubscriptionInfo> {
  const { data: sub } = await supabase
    .from('user_subscriptions')
    .select('tier, current_period_end')
    .eq('user_id', userId)
    .single()

  const tier: SubscriptionTier = (sub?.tier as SubscriptionTier) ?? 'free'

  // Check if subscription expired
  const isExpired = sub?.current_period_end && new Date(sub.current_period_end) < new Date()
  const effectiveTier = isExpired ? 'free' : tier

  const limits = TIER_LIMITS[effectiveTier]

  // Get AI usage for current month
  const month = new Date().toISOString().slice(0, 7)
  const { data: usage } = await supabase
    .from('ai_usage')
    .select('generation_count')
    .eq('user_id', userId)
    .eq('month', month)
    .maybeSingle()

  const aiUsed = usage?.generation_count ?? 0

  // Get case count
  const { count: caseCount } = await supabase
    .from('cases')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .neq('status', 'archived')

  return {
    tier: effectiveTier,
    canAccess: (feature: Feature) => !!limits[feature],
    aiRemaining: limits.aiGenerationsPerMonth === Infinity
      ? Infinity
      : Math.max(0, limits.aiGenerationsPerMonth - aiUsed),
    casesRemaining: limits.maxCases === Infinity
      ? Infinity
      : Math.max(0, limits.maxCases - (caseCount ?? 0)),
  }
}

export async function incrementAiUsage(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  const month = new Date().toISOString().slice(0, 7)
  await supabase.rpc('increment_ai_usage', { p_user_id: userId, p_month: month })
}
```

**Step 3: Add RPC function for atomic AI usage increment**

Add to migration or new migration:

```sql
CREATE OR REPLACE FUNCTION public.increment_ai_usage(p_user_id uuid, p_month text)
RETURNS void AS $$
BEGIN
  INSERT INTO public.ai_usage (user_id, month, generation_count)
  VALUES (p_user_id, p_month, 1)
  ON CONFLICT (user_id, month)
  DO UPDATE SET generation_count = ai_usage.generation_count + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Step 4: Commit**

```bash
git add src/lib/subscription/ supabase/migrations/
git commit -m "feat: add subscription check and AI usage gating"
```

---

### Task 8: useSubscription client hook + upgrade prompt component

**Files:**
- Create: `src/hooks/use-subscription.ts`
- Create: `src/components/subscription/upgrade-prompt.tsx`

**Step 1: Create client hook**

```typescript
// src/hooks/use-subscription.ts
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { SubscriptionTier } from '@/lib/subscription/limits'

interface ClientSubscription {
  tier: SubscriptionTier
  aiRemaining: number
  casesRemaining: number
  loading: boolean
}

export function useSubscription(): ClientSubscription {
  const [sub, setSub] = useState<ClientSubscription>({
    tier: 'free', aiRemaining: 5, casesRemaining: 1, loading: true,
  })

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: subData } = await supabase
        .from('user_subscriptions')
        .select('tier')
        .eq('user_id', user.id)
        .single()

      const month = new Date().toISOString().slice(0, 7)
      const { data: usage } = await supabase
        .from('ai_usage')
        .select('generation_count')
        .eq('user_id', user.id)
        .eq('month', month)
        .maybeSingle()

      const { count: caseCount } = await supabase
        .from('cases')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .neq('status', 'archived')

      const tier = (subData?.tier as SubscriptionTier) ?? 'free'
      const { TIER_LIMITS } = await import('@/lib/subscription/limits')
      const limits = TIER_LIMITS[tier]

      setSub({
        tier,
        aiRemaining: limits.aiGenerationsPerMonth === Infinity
          ? Infinity
          : Math.max(0, limits.aiGenerationsPerMonth - (usage?.generation_count ?? 0)),
        casesRemaining: limits.maxCases === Infinity
          ? Infinity
          : Math.max(0, limits.maxCases - (caseCount ?? 0)),
        loading: false,
      })
    }
    load()
  }, [])

  return sub
}
```

**Step 2: Create upgrade prompt**

```typescript
// src/components/subscription/upgrade-prompt.tsx
'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'
import Link from 'next/link'

interface UpgradePromptProps {
  feature: string
  description: string
}

export function UpgradePrompt({ feature, description }: UpgradePromptProps) {
  return (
    <Card className="border-calm-indigo/20 bg-calm-indigo/5">
      <CardContent className="pt-6 text-center space-y-3">
        <Sparkles className="h-8 w-8 text-calm-indigo mx-auto" />
        <h3 className="font-semibold text-warm-text">{feature}</h3>
        <p className="text-sm text-warm-muted">{description}</p>
        <Button asChild className="bg-calm-indigo hover:bg-calm-indigo/90">
          <Link href="/settings#billing">Upgrade to Pro</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
```

**Step 3: Commit**

```bash
git add src/hooks/use-subscription.ts src/components/subscription/upgrade-prompt.tsx
git commit -m "feat: add useSubscription hook and upgrade prompt component"
```

---

## Phase 2: Intelligence (Features #7, #1)

---

### Task 9: Case insights table + rules engine

**Files:**
- Create: `supabase/migrations/20260314200000_phase2_intelligence.sql`
- Create: `src/lib/insights/types.ts`
- Create: `src/lib/insights/rules.ts`

**Step 1: Migration**

```sql
-- ============================================
-- Phase 2: Case Insights + Post-Filing Lifecycle
-- ============================================

-- ── Case Insights ─────────────────────────────────────────────────

CREATE TABLE public.case_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
  insight_type text NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  priority text NOT NULL DEFAULT 'info' CHECK (priority IN ('info', 'warning', 'urgent')),
  dismissed boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_case_insights_active
  ON public.case_insights (case_id, dismissed, created_at DESC);

ALTER TABLE public.case_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own insights"
  ON public.case_insights FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.cases WHERE cases.id = case_insights.case_id AND cases.user_id = auth.uid()));

CREATE POLICY "Users can update own insights"
  ON public.case_insights FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.cases WHERE cases.id = case_insights.case_id AND cases.user_id = auth.uid()));

CREATE POLICY "Service role can manage insights"
  ON public.case_insights FOR ALL
  USING (auth.role() = 'service_role');

-- ── Post-Filing columns ───────────────────────────────────────────

ALTER TABLE public.cases
  ADD COLUMN IF NOT EXISTS outcome text CHECK (outcome IN ('won', 'lost', 'settled', 'dismissed', 'continued')),
  ADD COLUMN IF NOT EXISTS hearing_date timestamptz;
```

**Step 2: Create insight rules**

```typescript
// src/lib/insights/types.ts
export interface InsightInput {
  caseId: string
  disputeType: string
  createdAt: string
  tasks: { task_key: string; status: string; completed_at: string | null }[]
  deadlines: { key: string; due_at: string }[]
  evidenceCount: number
  incidentDate?: string | null
}

export interface Insight {
  insight_type: string
  title: string
  body: string
  priority: 'info' | 'warning' | 'urgent'
}
```

```typescript
// src/lib/insights/rules.ts
import type { InsightInput, Insight } from './types'

type InsightRule = (input: InsightInput) => Insight | null

const solDays: Record<string, number> = {
  personal_injury: 730, small_claims: 730, contract: 1460,
  property: 1460, landlord_tenant: 730, debt_defense: 1460,
  family: 0, other: 1460,
}

const solWarning: InsightRule = (input) => {
  if (!input.incidentDate) return null
  const solDaysForType = solDays[input.disputeType] ?? 1460
  if (solDaysForType === 0) return null

  const incident = new Date(input.incidentDate)
  const deadline = new Date(incident.getTime() + solDaysForType * 86400000)
  const daysLeft = Math.ceil((deadline.getTime() - Date.now()) / 86400000)

  if (daysLeft <= 0) {
    return { insight_type: 'sol_expired', title: 'Statute of limitations may have passed', body: `Based on your incident date, the filing deadline may have passed ${Math.abs(daysLeft)} days ago. Consult an attorney immediately.`, priority: 'urgent' }
  }
  if (daysLeft <= 90) {
    return { insight_type: 'sol_warning', title: `${daysLeft} days left to file`, body: `Based on your incident date, you have approximately ${daysLeft} days left before the statute of limitations expires.`, priority: daysLeft <= 30 ? 'urgent' : 'warning' }
  }
  return null
}

const missingEvidence: InsightRule = (input) => {
  const filingStarted = input.tasks.some(t =>
    t.task_key.includes('prepare_filing') || t.task_key.includes('prepare_pi') ||
    t.task_key.includes('prepare_small') || t.task_key.includes('prepare_debt')
  )
  if (!filingStarted) return null
  if (input.evidenceCount >= 3) return null

  return {
    insight_type: 'missing_evidence',
    title: 'Consider adding more evidence',
    body: `You have ${input.evidenceCount} evidence item${input.evidenceCount === 1 ? '' : 's'}. Cases with 3+ pieces of organized evidence tend to be stronger.`,
    priority: 'info',
  }
}

const upcomingDeadline: InsightRule = (input) => {
  const now = Date.now()
  const upcoming = input.deadlines
    .map(d => ({ ...d, daysUntil: Math.ceil((new Date(d.due_at).getTime() - now) / 86400000) }))
    .filter(d => d.daysUntil > 0 && d.daysUntil <= 7)
    .sort((a, b) => a.daysUntil - b.daysUntil)

  if (upcoming.length === 0) return null

  const nearest = upcoming[0]
  return {
    insight_type: 'deadline_approaching',
    title: `Deadline in ${nearest.daysUntil} day${nearest.daysUntil === 1 ? '' : 's'}`,
    body: `Your "${nearest.key.replace(/_/g, ' ')}" deadline is coming up. Make sure you're prepared.`,
    priority: nearest.daysUntil <= 3 ? 'urgent' : 'warning',
  }
}

const staleCase: InsightRule = (input) => {
  const lastActivity = input.tasks
    .filter(t => t.completed_at)
    .map(t => new Date(t.completed_at!).getTime())
    .sort((a, b) => b - a)[0]

  if (!lastActivity) return null
  const daysSince = Math.ceil((Date.now() - lastActivity) / 86400000)
  if (daysSince < 14) return null

  return {
    insight_type: 'stale_case',
    title: 'Your case needs attention',
    body: `It's been ${daysSince} days since your last activity. Staying active keeps your case on track.`,
    priority: daysSince >= 30 ? 'warning' : 'info',
  }
}

export const INSIGHT_RULES: InsightRule[] = [
  solWarning,
  missingEvidence,
  upcomingDeadline,
  staleCase,
]

export function generateInsights(input: InsightInput): Insight[] {
  return INSIGHT_RULES.map(rule => rule(input)).filter((r): r is Insight => r !== null)
}
```

**Step 3: Commit**

```bash
git add supabase/migrations/20260314200000_phase2_intelligence.sql src/lib/insights/
git commit -m "feat: add case insights rules engine"
```

---

### Task 10: Insights API + cron job + dashboard card

**Files:**
- Create: `src/app/api/cases/[id]/insights/route.ts`
- Create: `src/app/api/cron/insights/route.ts`
- Create: `src/components/dashboard/insights-card.tsx`
- Modify: `src/app/(authenticated)/case/[id]/page.tsx`

**Step 1: Create insights API** (GET active insights, PATCH to dismiss)

**Step 2: Create cron job** that processes all active cases and generates new insights

**Step 3: Create InsightsCard** — shows top 3 undismissed insights with dismiss buttons, priority badges (info=blue, warning=amber, urgent=red)

**Step 4: Add to dashboard** after ConfidenceScoreCard

**Step 5: Commit**

```bash
git add src/app/api/cases/\[id\]/insights/ src/app/api/cron/insights/ src/components/dashboard/insights-card.tsx
git commit -m "feat: add proactive case insights with dashboard card"
```

---

### Task 11: Post-filing lifecycle tasks

**Files:**
- Modify: `src/lib/workflow-phases.ts` — add post-filing phases to all workflows
- Modify: `src/lib/step-guidance.ts` — add guidance for new task keys
- Create: `src/components/step/record-outcome-step.tsx`
- Create: `src/lib/guided-steps/post-filing/courtroom-prep-config.ts`
- Create: `src/lib/guided-steps/post-filing/post-judgment-config.ts`

**Step 1: Add new phases to workflow-phases.ts**

For each dispute type, append:
```typescript
{ label: 'Court Response', taskKeys: ['wait_for_response'] },
{ label: 'Hearing', taskKeys: ['pre_hearing_prep', 'hearing_day_guide'] },
{ label: 'Resolution', taskKeys: ['record_outcome', 'post_judgment', 'case_closure'] },
```

**Step 2: Create RecordOutcomeStep** — radio cards for won/lost/settled/dismissed/continued, with conditional next steps based on outcome

**Step 3: Create guided step configs** for courtroom prep (what to wear, what to bring) and post-judgment (collection, appeal, compliance)

**Step 4: Update DB migration** — seed new tasks in `seed_case_tasks()`, extend `unlock_next_task()` chains

**Step 5: Add switch cases in page.tsx** for new task keys

**Step 6: Commit**

```bash
git commit -m "feat: add post-filing lifecycle tasks (hearing prep, outcome tracking, post-judgment)"
```

---

## Phase 3: Growth (Features #2, #8)

---

### Task 12: Case assessment page infrastructure

**Files:**
- Create: `src/app/(public)/assess/[disputeType]/page.tsx`
- Create: `src/lib/assessment/questions.ts`
- Create: `src/lib/assessment/rules.ts`
- Create: `src/components/assessment/assessment-wizard.tsx`
- Create: `src/components/assessment/assessment-result.tsx`

**Step 1: Create question configs** per dispute type (5 questions each: what happened, when, how much, evidence, location)

**Step 2: Create assessment rules** — deterministic scoring: SOL check, court type recommendation, filing fee estimate, viability score

**Step 3: Create assessment wizard** — full-screen, mobile-friendly, 5-step flow with progress bar

**Step 4: Create result page** — viability score, timeline estimate, CTA to sign up with pre-filled data

**Step 5: Add public route** at `/assess/[disputeType]` — no auth required

**Step 6: Add SEO meta tags** — title, description, Open Graph, structured data (FAQ schema)

**Step 7: Commit**

```bash
git commit -m "feat: add public case assessment landing pages for SEO acquisition"
```

---

### Task 13: Courtroom companion

**Files:**
- Create: `src/lib/guided-steps/courtroom/courtroom-prep-config.ts`
- Create: `src/lib/guided-steps/courtroom/objection-reference.ts`
- Create: `src/components/step/courtroom/objection-cards.tsx`
- Create: `src/app/api/cases/[id]/courtroom-script/route.ts`

**Step 1: Create courtroom prep guided step config** — etiquette checklist, what to wear, what to bring, arrival time, how to address judge

**Step 2: Create objection reference cards** — static data for 8 common objections with when to use and example language

**Step 3: Create ObjectionCards component** — swipeable card UI using CSS scroll-snap

**Step 4: Create courtroom script API** — AI-generated step-by-step script based on case type, court type, and evidence. One Claude call, cached in `ai_cache`

**Step 5: Add to workflow** — `courtroom_prep` task key in each workflow's hearing phase

**Step 6: Commit**

```bash
git commit -m "feat: add courtroom companion (prep guide, objection cards, AI script)"
```

---

## Phase 4: Platform (Features #3, #9, #6)

---

### Task 14: Stripe integration + billing settings

**Files:**
- Create: `src/app/api/webhooks/stripe/route.ts`
- Create: `src/app/api/billing/create-checkout/route.ts`
- Create: `src/app/api/billing/portal/route.ts`
- Create: `src/components/settings/billing-section.tsx`
- Modify: `src/app/(authenticated)/settings/page.tsx`

**Step 1: Install Stripe** — `npm install stripe @stripe/stripe-js`

**Step 2: Create Stripe webhook handler** — handle `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted` events. Update `user_subscriptions` table.

**Step 3: Create checkout API** — creates Stripe Checkout session for Pro/Premium plans

**Step 4: Create portal API** — creates Stripe Customer Portal session for managing subscription

**Step 5: Create BillingSection component** — current plan display, upgrade buttons, usage meters, manage subscription link

**Step 6: Add to settings page** — new "Billing" section between Notifications and Data Export

**Step 7: Commit**

```bash
git commit -m "feat: add Stripe billing integration with subscription management"
```

---

### Task 15: Attorney document review (marketplace MVP)

**Files:**
- Create: `supabase/migrations/20260314300000_attorney_reviews.sql`
- Create: `src/app/api/cases/[id]/attorney-review/route.ts`
- Create: `src/components/step/attorney-review-card.tsx`

**Step 1: Migration** — `attorney_reviews` table with RLS

**Step 2: Create API** — POST to request review (creates Stripe payment intent), GET to check status

**Step 3: Create AttorneyReviewCard** — shown on petition review step, "Get Attorney Review" CTA, payment flow, status tracking

**Step 4: Commit**

```bash
git commit -m "feat: add attorney document review service (marketplace MVP)"
```

---

### Task 16: Mobile-first responsive improvements

**Files:**
- Create: `src/components/layout/mobile-nav.tsx`
- Create: `src/components/evidence/quick-capture.tsx`
- Modify: `src/app/(authenticated)/case/[id]/page.tsx`
- Modify: `src/components/layout/header.tsx`

**Step 1: Create MobileNav** — bottom tab bar with 5 icons (Dashboard, Tasks, Evidence, Research, More), visible only on `sm:` screens, hidden on `md:+`

**Step 2: Update dashboard layout** — single column on mobile, 2-column on desktop. Hero-sized next step card on mobile.

**Step 3: Create QuickCapture** — camera button in evidence vault that opens device camera, uploads photo directly to Supabase storage

**Step 4: Update header** — simplified mobile header, hamburger menu for navigation

**Step 5: Commit**

```bash
git commit -m "feat: add mobile-first responsive layout with bottom nav and quick capture"
```

---

### Task 17: PWA + panic button

**Files:**
- Create: `public/manifest.json`
- Create: `src/components/layout/panic-button.tsx`
- Modify: `next.config.ts` — add PWA headers
- Modify: `src/app/layout.tsx` — add manifest link

**Step 1: Create PWA manifest** — app name, icons, theme color, display: standalone

**Step 2: Add manifest link** to root layout `<head>`

**Step 3: Create PanicButton component** — small, subtle button in header. On click: clears localStorage/sessionStorage, redirects to google.com. Visible only when user has opted into "privacy mode" in settings.

**Step 4: Add privacy mode toggle** to settings page

**Step 5: Commit**

```bash
git commit -m "feat: add PWA manifest and panic button for safety"
```

---

## Verification

After all tasks:

1. `npx next build` passes
2. All new tables have RLS enabled
3. Confidence score computes correctly on task completion
4. Analytics events fire on task completion
5. Subscription gating prevents free users from accessing gated features
6. Insights display on dashboard with dismiss functionality
7. Assessment pages load without auth
8. Courtroom prep guided step renders in wizard
9. Mobile nav appears on small screens only
10. PWA manifest is valid (Lighthouse audit)

---

## Summary

| Task | Feature | Files Created/Modified |
|------|---------|----------------------|
| 1 | Foundation DB | 1 migration |
| 2 | Confidence engine | 2 new lib files |
| 3 | Confidence card | 1 component + dashboard edit |
| 4 | Confidence API | 1 API route + task hook |
| 5 | Analytics tracker | 1 lib file + task hook |
| 6 | Comparison card | 1 component + dashboard edit |
| 7 | Subscription check | 2 lib files |
| 8 | Subscription UI | 1 hook + 1 component |
| 9 | Insights engine | 1 migration + 2 lib files |
| 10 | Insights UI | 2 API routes + 1 component |
| 11 | Post-filing lifecycle | 3 configs + 1 component + workflow edits |
| 12 | Assessment pages | 1 page + 2 lib files + 2 components |
| 13 | Courtroom companion | 2 lib files + 1 component + 1 API |
| 14 | Stripe billing | 3 API routes + 1 component + settings edit |
| 15 | Attorney review | 1 migration + 1 API + 1 component |
| 16 | Mobile layout | 2 components + layout edits |
| 17 | PWA + panic | manifest + 1 component + config edits |
