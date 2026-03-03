import { createClient } from '@/lib/supabase/server'
import { SupportiveHeader } from '@/components/layout/supportive-header'
import { LegalDisclaimer } from '@/components/layout/legal-disclaimer'
import { CaseCard } from '@/components/cases/case-card'
import { NewCaseDialog } from '@/components/cases/new-case-dialog'
import { OnboardingChecklist } from '@/components/dashboard/onboarding-checklist'

export default async function CasesPage() {
  const supabase = await createClient()

  const { data: cases } = await supabase
    .from('cases')
    .select()
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  const hasCases = cases && cases.length > 0

  const { data: { user } } = await supabase.auth.getUser()
  const onboarding = (user?.user_metadata?.onboarding as { dismissed?: boolean } | undefined) ?? {}
  const isDismissed = onboarding.dismissed === true

  // Auto-detect completed steps
  const hasCase = Boolean(hasCases)
  const hasDocument = hasCases ? ((await supabase
    .from('court_documents')
    .select('id', { count: 'exact', head: true })
    .in('case_id', (cases ?? []).map(c => c.id))
  ).count ?? 0) > 0 : false

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

        {hasCases ? (
          <div className="space-y-3">
            {cases.map((c) => (
              <CaseCard
                key={c.id}
                id={c.id}
                county={c.county}
                role={c.role}
                createdAt={c.created_at}
              />
            ))}
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
