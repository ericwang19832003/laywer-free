import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SupportiveHeader } from '@/components/layout/supportive-header'
import { LegalDisclaimer } from '@/components/layout/legal-disclaimer'
import { DeadlineFormDialog } from '@/components/deadlines/deadline-form'
import { DeadlineViews } from '@/components/deadlines/deadline-views'
import { Button } from '@/components/ui/button'

interface Reminder {
  id: string
  send_at: string
  status: string
  channel: string
}

interface Deadline {
  id: string
  key: string
  due_at: string
  source: string
  rationale: string | null
  consequence: string | null
  label: string | null
  auto_generated: boolean
  reminders: Reminder[]
}

/**
 * Filter deadlines: if a confirmed answer deadline exists,
 * hide the estimated one (confirmed supersedes it).
 */
function filterDeadlines(deadlines: Deadline[]): Deadline[] {
  const hasConfirmed = deadlines.some((d) => d.key === 'answer_deadline_confirmed')
  if (!hasConfirmed) return deadlines
  return deadlines.filter((d) => d.key !== 'answer_deadline_estimated')
}

export default async function DeadlinesPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: deadlines, error } = await supabase
    .from('deadlines')
    .select('*, reminders(*)')
    .eq('case_id', id)
    .order('due_at', { ascending: true })

  if (error) {
    return (
      <div className="min-h-screen bg-warm-bg">
        <main className="mx-auto max-w-2xl px-4 py-10">
          <SupportiveHeader
            title="Something went wrong"
            subtitle="We couldn't load your deadlines right now. Please try again in a moment."
          />
        </main>
      </div>
    )
  }

  const deadlineList = filterDeadlines((deadlines || []) as Deadline[])

  return (
    <div className="min-h-screen bg-warm-bg">
      <main className="mx-auto max-w-2xl px-4 py-10">
        <SupportiveHeader
          title="Your Deadlines"
          subtitle="We'll help you stay on top of every important date."
        />

        <div className="mb-6 flex items-center justify-between">
          <DeadlineFormDialog caseId={id} />
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/case/${id}`} className="text-calm-indigo">
              Back to dashboard
            </Link>
          </Button>
        </div>

        <DeadlineViews deadlines={deadlineList as Deadline[]} />

        <LegalDisclaimer />
      </main>
    </div>
  )
}
