import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SupportiveHeader } from '@/components/layout/supportive-header'
import { LegalDisclaimer } from '@/components/layout/legal-disclaimer'
import { TrendChart } from '@/components/health/trend-chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { InputsSnapshot } from '@/lib/rules/compute-case-health'

// ── Helpers ──────────────────────────────────────────────────────

interface Explanation {
  summary: string
  focus_areas: string[]
}

function extractExplanation(breakdown: unknown): Explanation | null {
  if (!breakdown || typeof breakdown !== 'object') return null
  const obj = breakdown as Record<string, unknown>
  const ai = obj.ai_explanation as Explanation | undefined
  return ai?.summary ? ai : null
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function SnapshotRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <dt className="text-sm text-warm-muted">{label}</dt>
      <dd className="text-sm text-warm-text font-medium tabular-nums">{value}</dd>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────

export default async function HealthPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [trendResult, latestResult] = await Promise.all([
    supabase
      .from('case_risk_scores')
      .select('health_score, computed_at')
      .eq('case_id', id)
      .gte('computed_at', thirtyDaysAgo.toISOString())
      .order('computed_at', { ascending: true }),
    supabase
      .from('case_risk_scores')
      .select('health_score, risk_level, computed_at, inputs_snapshot, breakdown')
      .eq('case_id', id)
      .order('computed_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  if (trendResult.error || latestResult.error) {
    return (
      <div className="min-h-screen bg-warm-bg">
        <main className="mx-auto max-w-2xl px-4 py-10">
          <SupportiveHeader
            title="Something went wrong"
            subtitle="We couldn't load your health data right now. Please try again in a moment."
          />
        </main>
      </div>
    )
  }

  const trendData = (trendResult.data ?? []).map((row) => ({
    date: row.computed_at!,
    score: row.health_score as number,
  }))

  const latest = latestResult.data
  const snapshot = latest?.inputs_snapshot as InputsSnapshot | null
  const explanation = latest ? extractExplanation(latest.breakdown) : null

  return (
    <div className="min-h-screen bg-warm-bg">
      <main className="mx-auto max-w-2xl px-4 py-10">
        <SupportiveHeader
          title="Case Health History"
          subtitle="A 30-day view of how your case health has changed over time."
        />

        <div className="mb-6 flex justify-end">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/case/${id}`} className="text-calm-indigo">
              Back to dashboard
            </Link>
          </Button>
        </div>

        <div className="space-y-6">
          {/* ── Section 1: Trend Chart ──────────────────────── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-warm-text">
                Health Score — Last 30 Days
              </CardTitle>
            </CardHeader>
            <CardContent>
              {trendData.length === 0 ? (
                <p className="text-sm text-warm-muted">
                  No score history yet. Run a health check from the dashboard to
                  start tracking.
                </p>
              ) : (
                <TrendChart data={trendData} />
              )}
            </CardContent>
          </Card>

          {/* ── Section 2: What Changed? ────────────────────── */}
          {snapshot && latest?.computed_at && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-warm-text">
                  What Changed?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-warm-muted mb-4">
                  Factors from the most recent calculation on{' '}
                  {formatDate(latest.computed_at)}.
                </p>
                <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <SnapshotRow
                    label="Overdue deadlines"
                    value={snapshot.overdue_deadlines}
                  />
                  <SnapshotRow
                    label="Due within 3 days"
                    value={snapshot.due_within_3_days}
                  />
                  <SnapshotRow
                    label="Due within 7 days"
                    value={snapshot.due_within_7_days}
                  />
                  <SnapshotRow
                    label="Discovery due within 3 days"
                    value={snapshot.discovery_due_within_3_days}
                  />
                  <SnapshotRow
                    label="Days since last activity"
                    value={
                      snapshot.days_since_last_activity === -1
                        ? 'No activity recorded'
                        : snapshot.days_since_last_activity
                    }
                  />
                  <SnapshotRow
                    label="Evidence items"
                    value={snapshot.evidence_count}
                  />
                  <SnapshotRow
                    label="Exhibits"
                    value={snapshot.exhibit_count}
                  />
                </dl>
              </CardContent>
            </Card>
          )}

          {/* ── Section 3: AI Explanation ────────────────────── */}
          {explanation && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-warm-text">
                  What This Means
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm leading-relaxed text-warm-text">
                  {explanation.summary}
                </p>
                {explanation.focus_areas.length > 0 && (
                  <ul className="space-y-2">
                    {explanation.focus_areas.map((area, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span
                          className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-calm-indigo"
                          aria-hidden="true"
                        />
                        <span className="text-sm text-warm-text">{area}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <LegalDisclaimer />
      </main>
    </div>
  )
}
