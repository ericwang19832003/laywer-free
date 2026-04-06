import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SupportiveHeader } from '@/components/layout/supportive-header'
import { LegalDisclaimer } from '@/components/layout/legal-disclaimer'
import { DiscoveryListView } from '@/components/discovery/discovery-list-view'
import { MeetingPrepCenter } from '@/components/discovery/meeting-prep-center'
import { Button } from '@/components/ui/button'
import type { DiscoveryPack } from '@/components/discovery/types'

export default async function DiscoveryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [packsResult, caseResult] = await Promise.all([
    supabase.from('discovery_packs').select('*').eq('case_id', id).order('created_at', { ascending: false }),
    supabase.from('cases').select('id, description, case_number').eq('id', id).single(),
  ])

  const { data: packs, error } = packsResult

  if (error) {
    return (
      <div className="min-h-screen bg-warm-bg">
        <main className="mx-auto max-w-2xl px-4 py-10">
          <SupportiveHeader
            title="Something went wrong"
            subtitle="We couldn't load your discovery packs right now. Please try again in a moment."
          />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-warm-bg">
      <main className="mx-auto max-w-2xl px-4 py-10">
        <SupportiveHeader
          title="Discovery"
          subtitle="Organize your requests for documents, answers, and admissions."
        />

        <div className="mb-6 flex items-center justify-end">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/case/${id}`} className="text-calm-indigo">
              Back to dashboard
            </Link>
          </Button>
        </div>

        <MeetingPrepCenter
          caseId={id}
          caseName={caseResult.data?.description ?? 'Untitled Case'}
          caseNumber={caseResult.data?.case_number ?? undefined}
        />

        <div className="mt-6">
          <DiscoveryListView
            caseId={id}
            initialPacks={(packs ?? []) as DiscoveryPack[]}
          />
        </div>

        <LegalDisclaimer />
      </main>
    </div>
  )
}
