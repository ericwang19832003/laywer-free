import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SupportiveHeader } from '@/components/layout/supportive-header'
import { LegalDisclaimer } from '@/components/layout/legal-disclaimer'
import { Button } from '@/components/ui/button'
import { ArrowLeft, FileText, Download, MessageSquare, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { generateMeetAndConferLetter, type MeetAndConferData } from '@lawyer-free/shared/discovery/meet-and-confer'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function MeetAndConferPage({ params }: PageProps) {
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
          <SupportiveHeader
            title="Case not found"
            subtitle="We couldn't find this case."
          />
        </main>
      </div>
    )
  }

  const defaultData: MeetAndConferData = {
    caseName: caseData.description || 'Untitled Case',
    caseNumber: caseData.case_number || '',
    yourName: '',
    yourEmail: '',
    yourPhone: '',
    opposingCounsel: '',
    opposingEmail: '',
    motionType: 'compel',
    disputeDescription: '',
    yourPosition: '',
    attemptsToResolve: [],
    proposedResolution: '',
    conferenceDate: null,
    conferenceOutcome: 'unresolved',
    unresolvedIssues: [],
    letterStyle: 'initial',
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
            title="Meet and Confer"
            subtitle="Generate letters and certifications required before filing discovery motions."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <MessageSquare className="h-4 w-4 text-calm-indigo" />
                Initial Letter
              </CardTitle>
              <CardDescription className="text-xs">
                Send before filing a discovery motion
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-warm-muted mb-4">
                A formal letter explaining the dispute and proposing resolution before court involvement.
              </p>
              <div className="space-y-2 text-xs text-warm-muted mb-4">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-3 w-3 text-calm-green mt-0.5 shrink-0" />
                  <span>Describes the discovery dispute</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-3 w-3 text-calm-green mt-0.5 shrink-0" />
                  <span>Explains your position</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-3 w-3 text-calm-green mt-0.5 shrink-0" />
                  <span>Proposes specific resolution</span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  const letter = generateMeetAndConferLetter({ ...defaultData, letterStyle: 'initial' })
                  const blob = new Blob([letter], { type: 'text/plain' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `meet-and-confer-letter-${caseData.case_number || 'case'}.txt`
                  document.body.appendChild(a)
                  a.click()
                  document.body.removeChild(a)
                  URL.revokeObjectURL(url)
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-calm-indigo" />
                Follow-Up Letter
              </CardTitle>
              <CardDescription className="text-xs">
                If initial outreach was unsuccessful
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-warm-muted mb-4">
                A follow-up letter documenting continued good faith efforts to resolve the dispute.
              </p>
              <div className="space-y-2 text-xs text-warm-muted mb-4">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-3 w-3 text-calm-green mt-0.5 shrink-0" />
                  <span>References prior communications</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-3 w-3 text-calm-green mt-0.5 shrink-0" />
                  <span>Documents good faith efforts</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-3 w-3 text-calm-green mt-0.5 shrink-0" />
                  <span>Sets final response deadline</span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  const letter = generateMeetAndConferLetter({ ...defaultData, letterStyle: 'followup' })
                  const blob = new Blob([letter], { type: 'text/plain' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `follow-up-letter-${caseData.case_number || 'case'}.txt`
                  document.body.appendChild(a)
                  a.click()
                  document.body.removeChild(a)
                  URL.revokeObjectURL(url)
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-calm-indigo" />
                Good Faith Certification
              </CardTitle>
              <CardDescription className="text-xs">
                Required for motion filings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-warm-muted mb-4">
                Certificate documenting your meet and confer efforts for court submission.
              </p>
              <div className="space-y-2 text-xs text-warm-muted mb-4">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-3 w-3 text-calm-green mt-0.5 shrink-0" />
                  <span>Certifies good faith conference</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-3 w-3 text-calm-green mt-0.5 shrink-0" />
                  <span>Lists all resolution attempts</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-3 w-3 text-calm-green mt-0.5 shrink-0" />
                  <span>Documents outcome</span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  const cert = generateMeetAndConferLetter({ ...defaultData, letterStyle: 'certification' })
                  const blob = new Blob([cert], { type: 'text/plain' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `good-faith-certification-${caseData.case_number || 'case'}.txt`
                  document.body.appendChild(a)
                  a.click()
                  document.body.removeChild(a)
                  URL.revokeObjectURL(url)
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
            </CardContent>
          </Card>

          <Card className="border-calm-amber/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm text-calm-amber">
                Important
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-warm-muted">
                <p>
                  Before filing any discovery motion, most courts require you to confer with opposing counsel in good faith to try to resolve the dispute.
                </p>
                <p>
                  <strong>Rule 37</strong> requires this certification as a prerequisite to filing motions to compel, sanctions, and protective orders.
                </p>
                <p>
                  Keep copies of all communications with opposing counsel, including emails, letters, and call logs.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <LegalDisclaimer />
      </main>
    </div>
  )
}
