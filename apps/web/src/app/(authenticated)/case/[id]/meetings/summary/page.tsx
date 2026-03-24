import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SupportiveHeader } from '@/components/layout/supportive-header'
import { LegalDisclaimer } from '@/components/layout/legal-disclaimer'
import { ConferenceSummaryForm } from '@/components/discovery/conference-summary-form'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, FileText } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ConferenceSummaryPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const [caseResult, summariesResult] = await Promise.all([
    supabase.from('cases').select('id, description, case_number').eq('id', id).single(),
    supabase.from('conference_summaries').select('*').eq('case_id', id).order('conference_date', { ascending: false }),
  ])

  const caseData = caseResult.data
  const summaries = summariesResult.data || []

  const conferenceTypeLabels: Record<string, string> = {
    rule_26f: 'Rule 26(f) Conference',
    scheduling: 'Scheduling Conference',
    pretrial: 'Pre-Trial Conference',
    settlement: 'Settlement Conference',
    status: 'Status Conference',
    other: 'Other Conference',
  }

  return (
    <div className="min-h-screen bg-warm-bg">
      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href={`/case/${id}/discovery`}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Discovery
            </Link>
          </Button>

          <SupportiveHeader
            title="Conference Summary"
            subtitle="Document what was discussed and agreed upon at conferences with opposing counsel."
          />
        </div>

        {summaries.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-warm-text mb-3">Previous Summaries</h3>
            <div className="space-y-3">
              {summaries.slice(0, 3).map((summary) => (
                <Card key={summary.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="py-3 px-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-calm-indigo" />
                        <CardTitle className="text-sm">
                          {conferenceTypeLabels[summary.conference_type] || summary.conference_type}
                        </CardTitle>
                      </div>
                      <span className="text-xs text-warm-muted">
                        {new Date(summary.conference_date).toLocaleDateString()}
                      </span>
                    </div>
                  </CardHeader>
                  {(summary.agreements as string[])?.length > 0 && (
                    <CardContent className="py-0 px-4 pb-3">
                      <p className="text-xs text-calm-green">
                        {(summary.agreements as string[]).length} agreement(s) documented
                      </p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        <ConferenceSummaryForm
          caseId={id}
          caseName={caseData?.description || 'Untitled Case'}
          caseNumber={caseData?.case_number || undefined}
        />

        <LegalDisclaimer />
      </main>
    </div>
  )
}
