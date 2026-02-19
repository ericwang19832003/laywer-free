import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SupportiveHeader } from '@/components/layout/supportive-header'
import { LegalDisclaimer } from '@/components/layout/legal-disclaimer'
import { DiscoveryPackDetail } from '@/components/discovery/discovery-pack-detail'
import { Button } from '@/components/ui/button'
import type {
  DiscoveryPack,
  DiscoveryItem,
  ServiceLog,
  DiscoveryResponse,
} from '@/components/discovery/types'

export default async function DiscoveryPackPage({
  params,
}: {
  params: Promise<{ id: string; packId: string }>
}) {
  const { id: caseId, packId } = await params
  const supabase = await createClient()

  // Fetch pack + related data in parallel
  const [packRes, itemsRes, logsRes, responsesRes] = await Promise.all([
    supabase
      .from('discovery_packs')
      .select('*')
      .eq('id', packId)
      .single(),
    supabase
      .from('discovery_items')
      .select('*')
      .eq('pack_id', packId)
      .order('item_type')
      .order('item_no'),
    supabase
      .from('discovery_service_logs')
      .select('*')
      .eq('pack_id', packId)
      .order('served_at', { ascending: false }),
    supabase
      .from('discovery_responses')
      .select('*')
      .eq('pack_id', packId)
      .order('received_at', { ascending: false }),
  ])

  if (packRes.error || !packRes.data) {
    return (
      <div className="min-h-screen bg-warm-bg">
        <main className="mx-auto max-w-2xl px-4 py-10">
          <SupportiveHeader
            title="Pack not found"
            subtitle="We couldn't find this discovery pack. It may have been removed."
          />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-warm-bg">
      <main className="mx-auto max-w-2xl px-4 py-10">
        <SupportiveHeader
          title={packRes.data.title}
          subtitle="You're organizing your requests, one step at a time."
        />

        <div className="mb-6 flex items-center justify-end">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/case/${caseId}/discovery`} className="text-calm-indigo">
              Back to discovery
            </Link>
          </Button>
        </div>

        <DiscoveryPackDetail
          caseId={caseId}
          initialPack={packRes.data as DiscoveryPack}
          initialItems={(itemsRes.data ?? []) as DiscoveryItem[]}
          initialLogs={(logsRes.data ?? []) as ServiceLog[]}
          initialResponses={(responsesRes.data ?? []) as DiscoveryResponse[]}
        />

        <LegalDisclaimer />
      </main>
    </div>
  )
}
