import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SupportiveHeader } from '@/components/layout/supportive-header'
import { LegalDisclaimer } from '@/components/layout/legal-disclaimer'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Scale, DollarSign, Target } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function SettlementPrepPage({ params }: PageProps) {
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
            title="Settlement Conference Preparation"
            subtitle="Prepare for negotiations to resolve your case without trial."
          />
        </div>

        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-calm-indigo" />
                Know Your Numbers
              </CardTitle>
              <CardDescription>
                Before entering settlement discussions, know your numbers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-lg border p-4 text-center">
                  <DollarSign className="h-6 w-6 text-calm-green mx-auto mb-2" />
                  <p className="text-xs text-warm-muted mb-1">Ideal Settlement</p>
                  <p className="font-medium">Best outcome you hope for</p>
                </div>
                <div className="rounded-lg border p-4 text-center">
                  <Scale className="h-6 w-6 text-calm-indigo mx-auto mb-2" />
                  <p className="text-xs text-warm-muted mb-1">Walkaway Point</p>
                  <p className="font-medium">Minimum you'll accept</p>
                </div>
                <div className="rounded-lg border p-4 text-center">
                  <Target className="h-6 w-6 text-calm-amber mx-auto mb-2" />
                  <p className="text-xs text-warm-muted mb-1">BATNA</p>
                  <p className="font-medium">What happens if no deal</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Settlement Factors to Consider</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2 text-calm-green">Strengthen Your Position</h4>
                  <ul className="text-warm-muted space-y-1">
                    <li>• Strong evidence and documentation</li>
                    <li>• Clear liability showing</li>
                    <li>• Witness availability</li>
                    <li>• Understanding of law</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2 text-red-500">Weaken Their Position</h4>
                  <ul className="text-warm-muted space-y-1">
                    <li>• Gaps in their evidence</li>
                    <li>• Uncertainty about facts</li>
                    <li>• Risk of trial loss</li>
                    <li>• Time and cost of trial</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Beyond Money: Other Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-warm-muted mb-3">
                Settlement isn't just about money. Consider these non-monetary terms:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  'Payment timing',
                  'Confidentiality',
                  'Non-disparagement',
                  'Reference letters',
                  'Apology',
                  'Future business',
                  'Release of claims',
                  'Policy changes',
                  'Training requirements',
                ].map((term) => (
                  <div key={term} className="flex items-center gap-2 p-2 rounded-lg bg-warm-bg">
                    <div className="w-3 h-3 rounded-full border border-warm-border" />
                    <span className="text-sm">{term}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-calm-amber/50">
            <CardHeader>
              <CardTitle className="text-sm text-calm-amber">Tips for Settlement Success</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-warm-muted">
              <p>1. <strong>Start high (or low)</strong> - Leave room for negotiation</p>
              <p>2. <strong>Don't show desperation</strong> - They should think you can walk away</p>
              <p>3. <strong>Listen more than you talk</strong> - Understand their constraints</p>
              <p>4. <strong>Focus on interests</strong> - Not positions; find underlying needs</p>
              <p>5. <strong>Get it in writing</strong> - Verbal agreements aren't enforceable</p>
              <p>6. <strong>Think long-term</strong> - Consider relationship if applicable</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Settlement Agreement Checklist</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-warm-muted">
                <li>• Party names and contact information</li>
                <li>• Settlement amount and payment terms</li>
                <li>• Payment schedule (if applicable)</li>
                <li>• Release of claims language</li>
                <li>• Confidentiality clause (if applicable)</li>
                <li>• Non-disparagement clause (if applicable)</li>
                <li>• Effective date</li>
                <li>• Signatures from all parties</li>
                <li>• Witness signatures (optional)</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <LegalDisclaimer />
      </main>
    </div>
  )
}
