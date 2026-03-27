import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'

export default async function ResearchHistoryPage({
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
        <h2 className="text-xl font-semibold text-warm-text">History</h2>
        <p className="text-sm text-warm-muted mt-1">
          Review past questions and saved answers as they become available.
        </p>
      </div>

      <Card className="border-warm-border bg-warm-bg/50">
        <CardContent className="p-5">
          <p className="text-sm text-warm-muted">
            Ask history will appear here once we add the activity feed.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
