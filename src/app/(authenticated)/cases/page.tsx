import { createClient } from '@/lib/supabase/server'
import { SupportiveHeader } from '@/components/layout/supportive-header'
import { LegalDisclaimer } from '@/components/layout/legal-disclaimer'
import { CaseCard } from '@/components/cases/case-card'
import { NewCaseDialog } from '@/components/cases/new-case-dialog'
import { OnboardingChecklist } from '@/components/dashboard/onboarding-checklist'
import { StatsCards } from '@/components/cases/stats-cards'

export default async function CasesPage() {
  const supabase = await createClient()

  const { data: cases } = await supabase
    .from('cases')
    .select('id, county, role, court_type, dispute_type, created_at')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  const hasCases = cases && cases.length > 0
  const caseIds = (cases ?? []).map((c) => c.id)

  // Fetch analytics data in parallel
  const [tasksResult, deadlinesResult, healthResult, activityResult, userResult, docResult] = await Promise.all([
    hasCases
      ? supabase.from('tasks').select('case_id, status').in('case_id', caseIds)
      : Promise.resolve({ data: [] }),
    hasCases
      ? supabase.from('deadlines').select('case_id, due_at').in('case_id', caseIds)
          .gte('due_at', new Date().toISOString())
          .lte('due_at', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString())
      : Promise.resolve({ data: [] }),
    hasCases
      ? supabase.from('case_risk_scores').select('case_id, overall_score, computed_at')
          .in('case_id', caseIds).order('computed_at', { ascending: false })
      : Promise.resolve({ data: [] }),
    hasCases
      ? supabase.from('task_events').select('case_id, created_at')
          .in('case_id', caseIds).order('created_at', { ascending: false })
      : Promise.resolve({ data: [] }),
    supabase.auth.getUser(),
    hasCases
      ? supabase.from('court_documents').select('id', { count: 'exact', head: true }).in('case_id', caseIds)
      : Promise.resolve({ count: 0 }),
  ])

  const allTasks = (tasksResult.data ?? []) as { case_id: string; status: string }[]
  const allDeadlines = (deadlinesResult.data ?? []) as { case_id: string; due_at: string }[]
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

  // Per-case next deadline
  const deadlineByCase = new Map<string, string>()
  for (const d of allDeadlines) {
    if (!deadlineByCase.has(d.case_id) || d.due_at < deadlineByCase.get(d.case_id)!) {
      deadlineByCase.set(d.case_id, d.due_at)
    }
  }

  // Per-case last activity
  const activityByCase = new Map<string, string>()
  for (const a of allActivity) {
    if (!activityByCase.has(a.case_id)) activityByCase.set(a.case_id, a.created_at)
  }

  // Onboarding
  const user = userResult.data?.user
  const onboarding = (user?.user_metadata?.onboarding as { dismissed?: boolean } | undefined) ?? {}
  const isDismissed = onboarding.dismissed === true
  const hasCase = Boolean(hasCases)
  const hasDocument = ((docResult as { count?: number | null }).count ?? 0) > 0
  const hasProfile = Boolean(user?.user_metadata?.display_name)

  const checklistItems = [
    { key: 'create_case', label: 'Create your first case', href: '#new-case', completed: hasCase },
    { key: 'upload_document', label: 'Upload a document', href: hasCases ? `/case/${cases![0].id}` : '/cases', completed: hasDocument },
    { key: 'explore_evidence', label: 'Explore the evidence vault', href: hasCases ? `/case/${cases![0].id}/evidence` : '/cases', completed: false },
    { key: 'review_deadlines', label: 'Review your deadlines', href: hasCases ? `/case/${cases![0].id}/deadlines` : '/cases', completed: false },
    { key: 'setup_profile', label: 'Set up your profile', href: '/settings', completed: hasProfile },
  ]

  return (
    <div className="min-h-screen bg-warm-bg">
      <main className="mx-auto max-w-2xl px-4 py-10">
        <SupportiveHeader
          title="Your Cases"
          subtitle="Welcome back. Let's keep moving."
        />

        <OnboardingChecklist items={checklistItems} dismissed={isDismissed} />

        {hasCases && (
          <StatsCards
            activeCases={cases.length}
            tasksCompleted={totalCompleted}
            tasksTotal={totalTasks}
            upcomingDeadlines={allDeadlines.length}
            averageHealth={avgHealth}
          />
        )}

        {hasCases ? (
          <div className="space-y-3">
            {cases.map((c) => {
              const taskData = tasksByCase.get(c.id) ?? { completed: 0, total: 0 }
              return (
                <CaseCard
                  key={c.id}
                  id={c.id}
                  county={c.county}
                  role={c.role}
                  courtType={c.court_type}
                  disputeType={c.dispute_type}
                  createdAt={c.created_at}
                  healthScore={healthByCase.get(c.id) ?? null}
                  tasksCompleted={taskData.completed}
                  tasksTotal={taskData.total}
                  nextDeadline={deadlineByCase.get(c.id) ?? null}
                  lastActivity={activityByCase.get(c.id) ?? null}
                />
              )
            })}
          </div>
        ) : (
          <div className="rounded-lg border border-warm-border bg-white py-16 text-center">
            <p className="text-warm-muted">
              No cases yet. Let&apos;s get started — one step at a time.
            </p>
          </div>
        )}

        <div className="mt-8">
          <NewCaseDialog />
        </div>

        <LegalDisclaimer />
      </main>
    </div>
  )
}
