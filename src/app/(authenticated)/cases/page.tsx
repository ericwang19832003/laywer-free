import { createClient } from '@/lib/supabase/server'
import { LegalDisclaimer } from '@/components/layout/legal-disclaimer'
import { NewCaseDialog } from '@/components/cases/new-case-dialog'
import { ImportCaseDialog } from '@/components/cases/import-case-dialog'
import { OnboardingChecklist } from '@/components/dashboard/onboarding-checklist'
import { StatsCards } from '@/components/cases/stats-cards'
import { CaseTable } from '@/components/cases/case-table'
import { Briefcase, Clock, Shield, FileText } from 'lucide-react'
import Image from 'next/image'

export default async function CasesPage() {
  const supabase = await createClient()

  const { data: cases } = await supabase
    .from('cases')
    .select('id, county, role, court_type, dispute_type, description, created_at')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

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
  const [tasksResult, deadlinesResult, healthResult, activityResult, userResult, docResult] = await Promise.all([
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
    supabase.auth.getUser(),
    hasCases
      ? supabase.from('court_documents').select('id', { count: 'exact', head: true }).in('case_id', caseIds)
      : Promise.resolve({ count: 0 }),
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

  // Onboarding
  const user = userResult.data?.user
  const onboarding = (user?.user_metadata?.onboarding as { dismissed?: boolean } | undefined) ?? {}
  const isDismissed = onboarding.dismissed === true
  const hasCase = Boolean(hasCases)
  const hasDocument = ((docResult as { count?: number | null }).count ?? 0) > 0
  const hasProfile = Boolean(user?.user_metadata?.display_name)

  const checklistItems = [
    { key: 'create_case', label: 'Create your first case', description: 'Set up your court and dispute type', href: '#new-case', completed: hasCase },
    { key: 'upload_document', label: 'Upload a document', description: 'Add complaints, filings, or evidence', href: hasCases ? `/case/${cases![0].id}` : '/cases', completed: hasDocument },
    { key: 'explore_evidence', label: 'Explore the evidence vault', description: 'Organize and tag your evidence', href: hasCases ? `/case/${cases![0].id}/evidence` : '/cases', completed: false },
    { key: 'review_deadlines', label: 'Review your deadlines', description: 'Never miss a court date', href: hasCases ? `/case/${cases![0].id}/deadlines` : '/cases', completed: false },
    { key: 'setup_profile', label: 'Set up your profile', description: 'Add your name and contact info', href: '/settings', completed: hasProfile },
  ]

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
          /* ── Has cases: stats + table ── */
          <>
            <StatsCards
              activeCases={cases.length}
              tasksCompleted={totalCompleted}
              tasksTotal={totalTasks}
              upcomingDeadlines={allDeadlines.filter(d => new Date(d.due_at).getTime() <= Date.now() + 7 * 24 * 60 * 60 * 1000).length}
              averageHealth={avgHealth}
            />

            <CaseTable cases={caseRows} />
          </>
        ) : (
          /* ── Empty state: two-column layout ── */
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left: empty state panel */}
            <div className="lg:col-span-3 rounded-lg border border-warm-border bg-white p-8">
              <div className="flex items-start gap-5 mb-6">
                <Image
                  src="/images/hero-illustration.png"
                  alt=""
                  width={140}
                  height={112}
                  className="object-contain shrink-0 hidden sm:block"
                />
                <div>
                  <h2 className="text-base font-semibold text-warm-text">Create your first case</h2>
                  <p className="text-sm text-warm-muted mt-1">Get organized in under 2 minutes. We&apos;ll guide you through every step of your legal matter.</p>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3">
                  <Clock className="h-4 w-4 text-warm-muted mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm text-warm-text font-medium">Track deadlines automatically</p>
                    <p className="text-xs text-warm-muted">We calculate key dates based on your court rules.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Shield className="h-4 w-4 text-warm-muted mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm text-warm-text font-medium">Organize evidence securely</p>
                    <p className="text-xs text-warm-muted">Upload, tag, and manage documents in one place.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <FileText className="h-4 w-4 text-warm-muted mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm text-warm-text font-medium">Generate filings with AI</p>
                    <p className="text-xs text-warm-muted">Draft motions, answers, and discovery in minutes.</p>
                  </div>
                </li>
              </ul>

              <NewCaseDialog />
            </div>

            {/* Right: onboarding checklist sidebar */}
            <div className="lg:col-span-2">
              <OnboardingChecklist items={checklistItems} dismissed={isDismissed} />
            </div>
          </div>
        )}

        <LegalDisclaimer />
      </main>
    </div>
  )
}
