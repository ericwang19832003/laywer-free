import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SupportiveHeader } from '@/components/layout/supportive-header'
import { LegalDisclaimer } from '@/components/layout/legal-disclaimer'
import { EvidenceVault, type EvidenceItem } from '@/components/evidence/evidence-vault'
import { Button } from '@/components/ui/button'

export default async function EvidencePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: evidence, error } = await supabase
    .from('evidence_items')
    .select('*')
    .eq('case_id', id)
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <div className="min-h-screen bg-warm-bg">
        <main className="mx-auto max-w-2xl px-4 py-10">
          <SupportiveHeader
            title="Something went wrong"
            subtitle="We couldn't load your evidence right now. Please try again in a moment."
          />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-warm-bg">
      <main className="mx-auto max-w-2xl px-4 py-10">
        <SupportiveHeader
          title="You're building your case file."
          subtitle="Upload and organize your documents in one place."
        />

        <div className="mb-6 flex items-center justify-end">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/case/${id}`} className="text-calm-indigo">
              Back to dashboard
            </Link>
          </Button>
        </div>

        <EvidenceVault
          caseId={id}
          initialEvidence={(evidence ?? []) as EvidenceItem[]}
        />

        <LegalDisclaimer />
      </main>
    </div>
  )
}
