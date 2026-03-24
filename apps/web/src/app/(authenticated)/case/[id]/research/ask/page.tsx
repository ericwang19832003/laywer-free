import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ResearchQuestion } from '@/components/research/research-question'

export default async function ResearchAskPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: caseData } = await supabase
    .from('cases')
    .select('id')
    .eq('id', id)
    .single()

  if (!caseData) redirect('/cases')

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-warm-text">Ask</h2>
        <p className="text-sm text-warm-muted mt-1">
          Ask a question and get a citation-backed response.
        </p>
      </div>

      <ResearchQuestion caseId={id} />
    </div>
  )
}
