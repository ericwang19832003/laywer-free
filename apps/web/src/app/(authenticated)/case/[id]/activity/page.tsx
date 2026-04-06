import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ActivityFeed } from '@/components/activity/activity-feed'

export default async function ActivityPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Verify case belongs to user
  const { error } = await supabase.from('cases').select('id').eq('id', id).single()
  if (error) redirect('/cases')

  // Fetch initial batch server-side
  const { data: events } = await supabase
    .from('task_events')
    .select('id, case_id, task_id, kind, payload, created_at, tasks(title)')
    .eq('case_id', id)
    .order('created_at', { ascending: false })
    .limit(21)

  const hasMore = (events?.length ?? 0) > 20
  const initialEvents = (events ?? []).slice(0, 20).map((e) => {
    const raw = e as Record<string, unknown>
    const tasks = raw.tasks as { title: string } | null
    return {
      id: raw.id as string,
      kind: raw.kind as string,
      payload: (raw.payload ?? {}) as Record<string, unknown>,
      created_at: raw.created_at as string,
      task_title: tasks?.title ?? undefined,
    }
  })

  const nextCursor = hasMore
    ? initialEvents[initialEvents.length - 1]?.created_at
    : null

  return (
    <div className="min-h-screen bg-warm-bg">
      <main className="mx-auto max-w-2xl px-4 py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-warm-text">Case Activity</h1>
          <p className="text-sm text-warm-muted mt-1">Full history of all actions and events in this case.</p>
        </div>
        <ActivityFeed
          caseId={id}
          initialEvents={initialEvents}
          initialCursor={nextCursor}
          initialHasMore={hasMore}
        />
      </main>
    </div>
  )
}
