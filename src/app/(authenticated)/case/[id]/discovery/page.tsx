import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SupportiveHeader } from '@/components/layout/supportive-header'
import { LegalDisclaimer } from '@/components/layout/legal-disclaimer'
import { DiscoveryListView } from '@/components/discovery/discovery-list-view'
import { Button } from '@/components/ui/button'
import type { DiscoveryPack } from '@/components/discovery/types'

export default async function DiscoveryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: packs, error } = await supabase
    .from('discovery_packs')
    .select('*')
    .eq('case_id', id)
    .order('created_at', { ascending: false })

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

        <DiscoveryListView
          caseId={id}
          initialPacks={(packs ?? []) as DiscoveryPack[]}
        />

        <LegalDisclaimer />
      </main>
    </div>
  )
}
