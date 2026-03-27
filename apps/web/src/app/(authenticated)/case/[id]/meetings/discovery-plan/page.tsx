import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SupportiveHeader } from '@/components/layout/supportive-header'
import { LegalDisclaimer } from '@/components/layout/legal-disclaimer'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Download, Calendar, Clock } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { generateDiscoveryPlanText, generateDiscoveryPlan, type DiscoveryPlanData } from '@lawyer-free/shared/discovery/discovery-plan'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function DiscoveryPlanPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: caseData } = await supabase
    .from('cases')
    .select('id, description, case_number, jurisdiction, court_type, county')
    .eq('id', id)
    .single()

  if (!caseData) {
    return (
      <div className="min-h-screen bg-warm-bg">
        <main className="mx-auto max-w-3xl px-4 py-10">
          <SupportiveHeader
            title="Case not found"
            subtitle="We couldn't find this case."
          />
        </main>
      </div>
    )
  }

  const defaultPlanData: DiscoveryPlanData = {
    caseName: caseData.description || 'Untitled Case',
    caseNumber: caseData.case_number || '',
    courtName: `${caseData.county || ''} ${caseData.court_type || ''} Court`.trim(),
    yourName: '',
    opposingCounsel: '',
    conferenceDate: new Date().toISOString().split('T')[0],
    proposedDates: {
      initialDisclosures: '',
      amendmentsPleading: '',
      factDiscoveryOpens: '',
      factDiscoveryCloses: '',
      expertDisclosurePlaintiff: '',
      expertDisclosureDefendant: '',
      expertDiscoveryCloses: '',
      dispositiveMotions: '',
      pretrialConference: '',
      trialDate: '',
    },
    depositionLimits: '10 per side',
    interrogatoryLimits: '25 per side',
    rfpLimits: '50 per side',
    esiProtocol: 'Parties will produce ESI in native format with standard metadata.',
    privilegeLogProcedure: 'Privilege log to be exchanged within 30 days of document production.',
    otherAgreements: '',
  }

  const plan = generateDiscoveryPlan(defaultPlanData)
  const planText = generateDiscoveryPlanText(plan)

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
            title="Joint Discovery Plan"
            subtitle="Create a written discovery plan for Rule 26(f) compliance."
          />
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-calm-indigo" />
              How It Works
            </CardTitle>
            <CardDescription>
              A discovery plan outlines the timeline and limitations for discovery in your case.
              After meeting with opposing counsel, use this template to document your agreed schedule.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-lg border bg-warm-bg p-4">
                <h4 className="font-medium text-sm mb-2">Before You Start</h4>
                <ul className="text-sm text-warm-muted space-y-1">
                  <li>1. Complete your Rule 26(f) conference with opposing counsel</li>
                  <li>2. Agree on discovery deadlines and limitations</li>
                  <li>3. Document ESI protocols and privilege log procedures</li>
                </ul>
              </div>

              <div className="rounded-lg border bg-warm-bg p-4">
                <h4 className="font-medium text-sm mb-2">What's Included</h4>
                <ul className="text-sm text-warm-muted space-y-1">
                  <li>Initial disclosure deadline</li>
                  <li>Discovery opening and closing dates</li>
                  <li>Expert disclosure deadlines</li>
                  <li>Deposition and interrogatory limits</li>
                  <li>ESI protocols and privilege log procedures</li>
                  <li>Pre-trial and trial dates</li>
                </ul>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  const blob = new Blob([planText], { type: 'text/plain' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `discovery-plan-${caseData.case_number || 'case'}.txt`
                  document.body.appendChild(a)
                  a.click()
                  document.body.removeChild(a)
                  URL.revokeObjectURL(url)
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Required Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <span className="text-warm-muted">Case:</span>
                <span className="font-medium ml-2">{caseData.description || 'Untitled'}</span>
              </div>
              <div className="space-y-1">
                <span className="text-warm-muted">Case Number:</span>
                <span className="font-medium ml-2">{caseData.case_number || 'Not set'}</span>
              </div>
              <div className="space-y-1">
                <span className="text-warm-muted">Court:</span>
                <span className="font-medium ml-2">{caseData.court_type} - {caseData.county}</span>
              </div>
              <div className="space-y-1">
                <span className="text-warm-muted">Jurisdiction:</span>
                <span className="font-medium ml-2">{caseData.jurisdiction}</span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-medium text-sm mb-3">Standard Discovery Limits (Federal)</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center p-3 rounded-lg border bg-warm-bg">
                  <p className="font-semibold text-calm-indigo">10</p>
                  <p className="text-warm-muted text-xs">Depositions</p>
                </div>
                <div className="text-center p-3 rounded-lg border bg-warm-bg">
                  <p className="font-semibold text-calm-indigo">25</p>
                  <p className="text-warm-muted text-xs">Interrogatories</p>
                </div>
                <div className="text-center p-3 rounded-lg border bg-warm-bg">
                  <p className="font-semibold text-calm-indigo">50</p>
                  <p className="text-warm-muted text-xs">RFPs</p>
                </div>
              </div>
              <p className="text-xs text-warm-muted mt-3">
                Note: State courts often have different limits. Check your local rules.
              </p>
            </div>
          </CardContent>
        </Card>

        <LegalDisclaimer />
      </main>
    </div>
  )
}
