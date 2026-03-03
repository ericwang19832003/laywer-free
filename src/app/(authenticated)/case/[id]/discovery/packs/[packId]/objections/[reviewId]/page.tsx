import { createClient } from '@/lib/supabase/server'
import { SupportiveHeader } from '@/components/layout/supportive-header'
import { LegalDisclaimer } from '@/components/layout/legal-disclaimer'
import { ObjectionReviewEditor } from '@/components/objections/objection-review-editor'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function ObjectionReviewPage({
  params,
}: {
  params: Promise<{ id: string; packId: string; reviewId: string }>
}) {
  const { id: caseId, packId, reviewId } = await params
  const supabase = await createClient()

  const [reviewRes, itemsRes] = await Promise.all([
    supabase
      .from('objection_reviews')
      .select('*')
      .eq('id', reviewId)
      .single(),
    supabase
      .from('objection_items')
      .select('*')
      .eq('review_id', reviewId)
      .order('item_type')
      .order('item_no'),
  ])

  if (reviewRes.error || !reviewRes.data) {
    return (
      <div className="min-h-screen bg-warm-bg">
        <main className="mx-auto max-w-2xl px-4 py-10">
          <SupportiveHeader
            title="Review not found"
            subtitle="We couldn't locate this objection review. It may have been removed."
          />
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/case/${caseId}/discovery/packs/${packId}`} className="text-calm-indigo">
              Back to discovery pack
            </Link>
          </Button>
        </main>
      </div>
    )
  }

  const review = reviewRes.data
  const items = itemsRes.data ?? []

  return (
    <div className="min-h-screen bg-warm-bg">
      <main className="mx-auto max-w-2xl px-4 py-10">
        <SupportiveHeader
          title="Review objections"
          subtitle="Take your time. Review each item, make any edits, and confirm when ready."
        />

        <div className="mb-6 flex items-center justify-end">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/case/${caseId}/discovery/packs/${packId}`} className="text-calm-indigo">
              Back to discovery pack
            </Link>
          </Button>
        </div>

        <ObjectionReviewEditor
          caseId={caseId}
          packId={packId}
          review={review}
          initialItems={items}
        />

        <LegalDisclaimer />
      </main>
    </div>
  )
}
