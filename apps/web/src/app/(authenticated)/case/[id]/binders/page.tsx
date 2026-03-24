import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SupportiveHeader } from '@/components/layout/supportive-header'
import { BindersList } from '@/components/binders/binders-list'
import { Button } from '@/components/ui/button'

export default async function BindersPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: caseId } = await params
  const supabase = await createClient()

  const { data: binders, error } = await supabase
    .from('trial_binders')
    .select('id, title, status, error, created_at')
    .eq('case_id', caseId)
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <div className="min-h-screen bg-warm-bg">
        <main className="mx-auto max-w-2xl px-4 py-10">
          <SupportiveHeader
            title="Something went wrong"
            subtitle="We couldn't load your binders right now. Please try again in a moment."
          />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-warm-bg">
      <main className="mx-auto max-w-2xl px-4 py-10">
        <SupportiveHeader
          title="Your trial binders"
          subtitle="Download your organized case files whenever you're ready."
        />

        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/case/${caseId}`} className="text-calm-indigo">
              Back to dashboard
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/case/${caseId}/exhibits`} className="text-calm-indigo">
              View exhibits
            </Link>
          </Button>
        </div>

        <BindersList caseId={caseId} initialBinders={binders ?? []} />

        <footer className="mt-12 border-t border-warm-border pt-4 pb-8">
          <p className="text-xs text-warm-muted text-center">
            This export is for organization only and not legal advice.
            For legal advice, please consult a licensed attorney.
          </p>
        </footer>
      </main>
    </div>
  )
}
