import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function StepIndexPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Find the first actionable task
  const { data: tasks } = await supabase
    .from('tasks')
    .select('id, status')
    .eq('case_id', id)
    .in('status', ['in_progress', 'needs_review', 'todo'])
    .order('created_at', { ascending: true })
    .limit(1)

  const taskId = tasks?.[0]?.id

  if (taskId) {
    redirect(`/case/${id}/step/${taskId}`)
  } else {
    redirect(`/case/${id}`)
  }
}
