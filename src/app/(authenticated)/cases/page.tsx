import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { LegalDisclaimer } from '@/components/layout/legal-disclaimer'
import { NewCaseDialog } from '@/components/cases/new-case-dialog'
import { ImportCaseDialog } from '@/components/cases/import-case-dialog'
import { StatsCards } from '@/components/cases/stats-cards'
import { CaseCards } from '@/components/cases/case-cards'
import { PaginatedCaseList } from '@/components/cases/paginated-case-list'
import { TodaysActionCard } from '@/components/cases/todays-action-card'
import { Clock, Shield, FileText } from 'lucide-react'
import Image from 'next/image'

export default async function CasesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const userDisplayName = user?.user_metadata?.display_name || user?.user_metadata?.full_name || null

  const PAGE_SIZE = 12
  const { data: allCasesFetched, count: totalCaseCount } = await supabase
    .from('cases')
    .select('id, county, role, court_type, dispute_type, description, created_at', { count: 'exact' })
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(PAGE_SIZE + 1)

  const hasMoreCases = (allCasesFetched ?? []).length > PAGE_SIZE
  const cases = hasMoreCases ? (allCasesFetched ?? []).slice(0, PAGE_SIZE) : (allCasesFetched ?? [])
  const initialNextCursor = hasMoreCases ? cases[cases.length - 1]?.id ?? null : null

  // Fetch pi_sub_type for PI cases to show "Property Damage" when applicable
  const piCaseIds = (cases ?? []).filter(c => c.dispute_type === 'personal_injury').map(c => c.id)
  const piSubTypeMap = new Map<string, string>()
  if (piCaseIds.length > 0) {
    const { data: piDetails } = await supabase
      .from('personal_injury_details')
      .select('case_id, pi_sub_type')
      .in('case_id', piCaseIds)
    for (const pd of piDetails ?? []) {
      if (pd.pi_sub_type) piSubTypeMap.set(pd.case_id, pd.pi_sub_type)
    }
  }

  const hasCases = cases && cases.length > 0
  const caseIds = (cases ?? []).map((c) => c.id)

  // Fetch analytics data in parallel
  const [tasksResult, deadlinesResult, healthResult, activityResult] = await Promise.all([
    hasCases
      ? supabase.from('tasks').select('case_id, status').in('case_id', caseIds)
      : Promise.resolve({ data: [] }),
    hasCases
      ? supabase.from('deadlines').select('case_id, due_at, key, label').in('case_id', caseIds)
          .gte('due_at', new Date().toISOString())
          .order('due_at', { ascending: true })
      : Promise.resolve({ data: [] }),
    hasCases
      ? supabase.from('case_risk_scores').select('case_id, overall_score, computed_at')
          .in('case_id', caseIds).order('computed_at', { ascending: false })
      : Promise.resolve({ data: [] }),
    hasCases
      ? supabase.from('task_events').select('case_id, created_at')
          .in('case_id', caseIds).order('created_at', { ascending: false })
      : Promise.resolve({ data: [] }),
  ])

  const allTasks = (tasksResult.data ?? []) as { case_id: string; status: string }[]
  const allDeadlines = (deadlinesResult.data ?? []) as { case_id: string; due_at: string; key: string; label: string | null }[]
  const allHealth = (healthResult.data ?? []) as { case_id: string; overall_score: number; computed_at: string }[]
  const allActivity = (activityResult.data ?? []) as { case_id: string; created_at: string }[]

  // Aggregate stats
  const totalCompleted = allTasks.filter((t) => t.status === 'completed' || t.status === 'done').length
  const totalTasks = allTasks.length

  // Latest health per case (deduplicate)
  const healthByCase = new Map<string, number>()
  for (const h of allHealth) {
    if (!healthByCase.has(h.case_id)) healthByCase.set(h.case_id, h.overall_score)
  }
  const healthScores = Array.from(healthByCase.values())
  const avgHealth = healthScores.length > 0 ? Math.round(healthScores.reduce((a, b) => a + b, 0) / healthScores.length) : null

  // Per-case task counts
  const tasksByCase = new Map<string, { completed: number; total: number }>()
  for (const t of allTasks) {
    const entry = tasksByCase.get(t.case_id) ?? { completed: 0, total: 0 }
    entry.total++
    if (t.status === 'completed' || t.status === 'done') entry.completed++
    tasksByCase.set(t.case_id, entry)
  }

  // Per-case next deadline (earliest future deadline)
  const deadlineByCase = new Map<string, { due_at: string; key: string; label: string | null }>()
  for (const d of allDeadlines) {
    const existing = deadlineByCase.get(d.case_id)
    if (!existing || d.due_at < existing.due_at) {
      deadlineByCase.set(d.case_id, { due_at: d.due_at, key: d.key, label: d.label })
    }
  }

  // Per-case last activity
  const activityByCase = new Map<string, string>()
  for (const a of allActivity) {
    if (!activityByCase.has(a.case_id)) activityByCase.set(a.case_id, a.created_at)
  }

  // Build case table rows
  const caseRows = (cases ?? []).map((c) => {
    const taskData = tasksByCase.get(c.id) ?? { completed: 0, total: 0 }
    return {
      id: c.id,
      county: c.county,
      description: c.description ?? null,
      role: c.role,
      courtType: c.court_type,
      disputeType: c.dispute_type,
      piSubType: piSubTypeMap.get(c.id) ?? null,
      createdAt: c.created_at,
      healthScore: healthByCase.get(c.id) ?? null,
      tasksCompleted: taskData.completed,
      tasksTotal: taskData.total,
      nextDeadline: deadlineByCase.get(c.id) ?? null,
      lastActivity: activityByCase.get(c.id) ?? null,
    }
  })

  return (
    <div className="min-h-screen bg-warm-bg">
      <main className="py-6">
        {/* Page header — compact, professional */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-warm-text">Cases</h1>
            <p className="mt-0.5 text-sm text-warm-muted">
              Organize your matters, track deadlines, and keep evidence in one place.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ImportCaseDialog />
            <NewCaseDialog />
          </div>
        </div>

        {hasCases ? (
          /* ── Has cases: hero action + stats + cards ── */
          <>
            <TodaysActionCard />

            <StatsCards
              activeCases={totalCaseCount ?? cases.length}
              tasksCompleted={totalCompleted}
              tasksTotal={totalTasks}
              // eslint-disable-next-line react-hooks/purity
              upcomingDeadlines={allDeadlines.filter(d => new Date(d.due_at).getTime() <= Date.now() + 7 * 24 * 60 * 60 * 1000).length}
              averageHealth={avgHealth}
            />

            <PaginatedCaseList
              initialCases={caseRows.map(row => ({
                id: row.id,
                description: row.description || '',
                county: row.county || '',
                role: row.role,
                court_type: row.courtType || '',
                dispute_type: row.piSubType || row.disputeType || '',
                created_at: row.createdAt,
                progress: row.tasksTotal > 0 ? Math.round((row.tasksCompleted / row.tasksTotal) * 100) : 0,
                nextAction: row.nextDeadline?.label || undefined,
                deadline: row.nextDeadline ? {
                  due_at: row.nextDeadline.due_at,
                  label: row.nextDeadline.label || 'Deadline'
                } : undefined,
                lastActivity: row.lastActivity || undefined,
                status: 'active' as const,
                yourName: userDisplayName || undefined,
              }))}
              initialNextCursor={initialNextCursor}
              initialHasMore={hasMoreCases}
              totalCount={totalCaseCount ?? cases.length}
            />
          </>
        ) : (
          /* ── Empty state: professional hero layout ── */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Hero section */}
            <div className="flex flex-col items-center text-center lg:items-start lg:text-left justify-center">
              <div className="relative w-full max-w-sm mb-6">
                <Image
                  src="/images/ai-generated/hero-welcome.png"
                  alt="Welcome to Lawyer Free"
                  width={400}
                  height={400}
                  className="w-full h-auto rounded-2xl"
                  priority
                />
              </div>
            </div>

            {/* Content section */}
            <div className="flex flex-col justify-center">
              <h2 className="text-2xl font-bold text-warm-text mb-3">
                Start Your Legal Journey
              </h2>
              <p className="text-warm-muted mb-6">
                Get organized in under 2 minutes. We&apos;ll guide you through every step of your legal matter.
              </p>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-calm-indigo/10 flex items-center justify-center shrink-0">
                    <Clock className="h-4 w-4 text-calm-indigo" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-warm-text">Track deadlines automatically</p>
                    <p className="text-xs text-warm-muted">We calculate key dates based on your court rules.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-calm-green/10 flex items-center justify-center shrink-0">
                    <Shield className="h-4 w-4 text-calm-green" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-warm-text">Organize evidence securely</p>
                    <p className="text-xs text-warm-muted">Upload, tag, and manage documents in one place.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-calm-amber/10 flex items-center justify-center shrink-0">
                    <FileText className="h-4 w-4 text-calm-amber" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-warm-text">Generate filings with AI</p>
                    <p className="text-xs text-warm-muted">Draft motions, answers, and discovery in minutes.</p>
                  </div>
                </li>
              </ul>

              <div className="flex flex-col sm:flex-row gap-3">
                <NewCaseDialog />
                <Link
                  href="/assess"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-warm-border bg-white text-sm font-medium text-warm-text hover:bg-warm-bg transition-colors"
                >
                  Take Assessment
                </Link>
              </div>
            </div>
          </div>
        )}

        <LegalDisclaimer />
      </main>
    </div>
  )
}
