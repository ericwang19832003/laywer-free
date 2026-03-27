import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SupportiveHeader } from '@/components/layout/supportive-header'
import { LegalDisclaimer } from '@/components/layout/legal-disclaimer'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Download, ClipboardList } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { generatePreTrialChecklistText, DEFAULT_PRETRIAL_CHECKLIST } from '@lawyer-free/shared/discovery/pretrial-checklist'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PreTrialChecklistPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: caseData } = await supabase
    .from('cases')
    .select('id, description, case_number')
    .eq('id', id)
    .single()

  if (!caseData) {
    return (
      <div className="min-h-screen bg-warm-bg">
        <main className="mx-auto max-w-3xl px-4 py-10">
          <SupportiveHeader title="Case not found" subtitle="We couldn't find this case." />
        </main>
      </div>
    )
  }

  const checklistText = generatePreTrialChecklistText(
    DEFAULT_PRETRIAL_CHECKLIST.map((item) => ({
      ...item,
      completed: false,
      dueDate: null,
      notes: '',
    }))
  )

  const categories = [...new Set(DEFAULT_PRETRIAL_CHECKLIST.map((item) => item.category))]

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
            title="Pre-Trial Conference Checklist"
            subtitle="Everything you need to prepare before your trial date."
          />
        </div>

        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-calm-indigo" />
                Pre-Trial Checklist
              </CardTitle>
              <CardDescription>
                Complete these items before your pre-trial conference
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full mb-4"
                onClick={() => {
                  const blob = new Blob([checklistText], { type: 'text/plain' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `pre-trial-checklist-${caseData.case_number || 'case'}.txt`
                  document.body.appendChild(a)
                  a.click()
                  document.body.removeChild(a)
                  URL.revokeObjectURL(url)
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Checklist
              </Button>

              <div className="space-y-4">
                {categories.map((category) => (
                  <div key={category}>
                    <h4 className="font-medium text-sm text-warm-text mb-2">{category}</h4>
                    <div className="space-y-2">
                      {DEFAULT_PRETRIAL_CHECKLIST.filter((item) => item.category === category).map((item) => (
                        <div key={item.id} className="flex items-start gap-2 p-2 rounded-lg bg-warm-bg">
                          <div className="w-4 h-4 rounded border border-warm-border mt-0.5 shrink-0" />
                          <div>
                            <p className="text-sm font-medium">{item.item}</p>
                            <p className="text-xs text-warm-muted">{item.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-calm-amber/50">
            <CardHeader>
              <CardTitle className="text-sm text-calm-amber">Common Pre-Trial Deadlines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-warm-muted">
              <p>• <strong>Witness List:</strong> Usually 10-14 days before trial</p>
              <p>• <strong>Exhibit List:</strong> Usually 10-14 days before trial</p>
              <p>• <strong>Motions in Limine:</strong> Usually 7-10 days before trial</p>
              <p>• <strong>Trial Brief:</strong> Usually 5-7 days before trial</p>
              <p>• <strong>Proposed Jury Instructions:</strong> Usually 5-7 days before trial</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Day-of-Trial Checklist</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-warm-muted">
                <li>• Arrive early (at least 30 minutes before)</li>
                <li>• Bring multiple copies of all exhibits</li>
                <li>• Bring your trial notebook with all documents</li>
                <li>• Dress professionally</li>
                <li>• Bring water and snacks</li>
                <li>• Have opposing counsel's contact info ready</li>
                <li>• Charge your phone/device</li>
                <li>• Know where the courtroom is located</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <LegalDisclaimer />
      </main>
    </div>
  )
}
