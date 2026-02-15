import { createClient } from '@/lib/supabase/server'
import { SupportiveHeader } from '@/components/layout/supportive-header'
import { LegalDisclaimer } from '@/components/layout/legal-disclaimer'
import { CaseCard } from '@/components/cases/case-card'
import { NewCaseDialog } from '@/components/cases/new-case-dialog'

export default async function CasesPage() {
  const supabase = await createClient()

  const { data: cases } = await supabase
    .from('cases')
    .select()
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  const hasCases = cases && cases.length > 0

  return (
    <div className="min-h-screen bg-warm-bg">
      <main className="mx-auto max-w-2xl px-4 py-10">
        <SupportiveHeader
          title="Your Cases"
          subtitle="Welcome back. Let's keep moving."
        />

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
