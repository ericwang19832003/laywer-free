import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SupportiveHeader } from '@/components/layout/supportive-header'
import { LegalDisclaimer } from '@/components/layout/legal-disclaimer'
import {
  ExhibitsManager,
  type ExhibitSet,
  type Exhibit,
  type EvidenceItem,
} from '@/components/exhibits/exhibits-manager'
import { Button } from '@/components/ui/button'
import { BinderCta } from '@/components/binders/binder-cta'

export default async function ExhibitsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: caseId } = await params
  const supabase = await createClient()

  // Fetch exhibit sets, exhibits, and evidence items in parallel
  const [setsRes, evidenceRes] = await Promise.all([
    supabase
      .from('exhibit_sets')
      .select('*')
      .eq('case_id', caseId)
      .order('created_at', { ascending: false }),
    supabase
      .from('evidence_items')
      .select('id, file_name, label, created_at')
      .eq('case_id', caseId)
      .order('created_at', { ascending: false }),
  ])

  // If a set exists, fetch its exhibits
  const activeSet = (setsRes.data?.[0] ?? null) as ExhibitSet | null
  let exhibits: Exhibit[] = []

  if (activeSet) {
    const { data } = await supabase
      .from('exhibits')
      .select('*')
      .eq('exhibit_set_id', activeSet.id)
      .order('sort_order', { ascending: true })

    exhibits = (data ?? []) as Exhibit[]
  }

  if (setsRes.error || evidenceRes.error) {
    return (
      <div className="min-h-screen bg-warm-bg">
        <main className="mx-auto max-w-2xl px-4 py-10">
          <SupportiveHeader
            title="Something went wrong"
            subtitle="We couldn't load your exhibits right now. Please try again in a moment."
          />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-warm-bg">
      <main className="mx-auto max-w-2xl px-4 py-10">
        <SupportiveHeader
          title="Let's organize your exhibits."
          subtitle="You can add documents from your Evidence Vault and we'll number them for you."
        />

        <div className="mb-6 flex items-center justify-end">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/case/${caseId}`} className="text-calm-indigo">
              Back to dashboard
            </Link>
          </Button>
        </div>

        <ExhibitsManager
          caseId={caseId}
          initialSet={activeSet}
          initialExhibits={exhibits}
          evidenceItems={(evidenceRes.data ?? []) as EvidenceItem[]}
        />

        <div className="mt-6">
          <BinderCta caseId={caseId} exhibitSetId={activeSet?.id ?? null} />
        </div>

        <LegalDisclaimer />
      </main>
    </div>
  )
}
