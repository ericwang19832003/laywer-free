import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SupportiveHeader } from '@/components/layout/supportive-header'
import { LegalDisclaimer } from '@/components/layout/legal-disclaimer'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Download, Scale } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { generateMediationAgendaText } from '@/lib/discovery/mediation-agenda'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function MediationAgendaPage({ params }: PageProps) {
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

  const defaultAgenda = {
    caseName: caseData.description || 'Untitled Case',
    caseNumber: caseData.case_number || '',
    mediator: '',
    parties: { you: '', opposing: '' },
    issues: [],
  }

  const agendaText = generateMediationAgendaText(
    // @ts-expect-error - simplified for client download
    { ...defaultAgenda, mediationDate: '[Date]', mediationTime: '[Time]', mediationLocation: '[Location]' }
  )

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
            title="Mediation Preparation"
            subtitle="Prepare for mediation with a neutral third party mediator."
          />
        </div>

        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-calm-indigo" />
                Mediation Agenda Template
              </CardTitle>
              <CardDescription>
                A structured agenda for your mediation session
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border bg-warm-bg p-4">
                <h4 className="font-medium text-sm mb-2">Agenda Sections</h4>
                <ul className="text-sm text-warm-muted space-y-1">
                  <li>1. Introduction and ground rules</li>
                  <li>2. Opening statements from each party</li>
                  <li>3. Joint discussion of key issues</li>
                  <li>4. Private caucuses with mediator</li>
                  <li>5. Negotiation toward agreement</li>
                  <li>6. Document agreement or declare impasse</li>
                </ul>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  const blob = new Blob([agendaText], { type: 'text/plain' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `mediation-agenda-${caseData.case_number || 'case'}.txt`
                  document.body.appendChild(a)
                  a.click()
                  document.body.removeChild(a)
                  URL.revokeObjectURL(url)
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Agenda Template
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">What to Bring to Mediation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Documents</h4>
                  <ul className="text-warm-muted space-y-1">
                    <li>• Contract or agreement</li>
                    <li>• Evidence and photos</li>
                    <li>• Medical records (if injury)</li>
                    <li>• Financial documents</li>
                    <li>• Correspondence</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Information</h4>
                  <ul className="text-warm-muted space-y-1">
                    <li>• Settlement authority</li>
                    <li>• Walkaway point</li>
                    <li>• Alternative options (BATNA)</li>
                    <li>• Key witnesses</li>
                    <li>• Important dates</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-calm-amber/50">
            <CardHeader>
              <CardTitle className="text-sm text-calm-amber">Tips for Success</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-warm-muted">
              <p>1. <strong>Be prepared</strong> - Know your case strengths and weaknesses</p>
              <p>2. <strong>Stay calm</strong> - Mediation can be emotional; take breaks if needed</p>
              <p>3. <strong>Listen actively</strong> - Understand the other side's perspective</p>
              <p>4. <strong>Be flexible</strong> - Creative solutions often work better than rigid positions</p>
              <p>5. <strong>Focus on interests</strong> - Not positions; understand what each party really needs</p>
            </CardContent>
          </Card>
        </div>

        <LegalDisclaimer />
      </main>
    </div>
  )
}
