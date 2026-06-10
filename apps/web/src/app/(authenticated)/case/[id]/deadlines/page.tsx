import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SupportiveHeader } from '@/components/layout/supportive-header'
import { LegalDisclaimer } from '@/components/layout/legal-disclaimer'
import { DeadlineFormDialog } from '@/components/deadlines/deadline-form'
import { DeadlineViews } from '@/components/deadlines/deadline-views'
import { Button } from '@/components/ui/button'
import { AlertTriangle, ArrowLeft } from 'lucide-react'

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

function urgentCount(deadlines: Deadline[]): number {
  const now = Date.now()
  const sevenDays = 7 * 24 * 60 * 60 * 1000
  return deadlines.filter((d) => {
    const diff = new Date(d.due_at).getTime() - now
    return diff >= 0 && diff <= sevenDays
  }).length
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
  const urgent = urgentCount(deadlineList)

  return (
    <div className="min-h-screen bg-warm-bg">
      <main className="mx-auto max-w-2xl px-4 py-10 space-y-6">

        {/* Back link */}
        <div>
          <Button variant="ghost" size="sm" asChild className="-ml-2 text-warm-muted hover:text-warm-text">
            <Link href={`/case/${id}`} className="flex items-center gap-1.5">
              <ArrowLeft className="w-4 h-4" />
              Back to dashboard
            </Link>
          </Button>
        </div>

        {/* Header + action */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-warm-text tracking-tight">
              Your Deadlines
            </h1>
            <p className="mt-1 text-sm text-warm-muted">
              {deadlineList.length === 0
                ? "No deadlines yet — they're created automatically as you progress."
                : urgent > 0
                  ? `${urgent} deadline${urgent === 1 ? '' : 's'} due within 7 days.`
                  : `${deadlineList.length} deadline${deadlineList.length === 1 ? '' : 's'} tracked.`}
            </p>
          </div>
          <DeadlineFormDialog caseId={id} />
        </div>

        {/* Verification notice */}
        <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-900 leading-relaxed">
            <strong>Verify with the court.</strong>{' '}
            Deadline calculations are estimates based on standard rules.
            Always confirm directly with the clerk of court — local rules, holidays, and
            judge-specific orders may affect your actual deadlines.
          </p>
        </div>

        {/* Deadline views */}
        <DeadlineViews deadlines={deadlineList as Deadline[]} />

        <LegalDisclaimer />
      </main>
    </div>
  )
}
