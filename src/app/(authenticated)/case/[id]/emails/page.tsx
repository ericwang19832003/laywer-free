import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { SupportiveHeader } from '@/components/layout/supportive-header'
import { CaseEmailsClient } from '@/components/emails/case-emails-client'

export default async function CaseEmailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: caseId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: gmailAccount } = await supabase
    .from('connected_accounts')
    .select('email')
    .eq('user_id', user.id)
    .eq('provider', 'gmail')
    .is('revoked_at', null)
    .maybeSingle()

  const { data: filters } = await supabase
    .from('case_email_filters')
    .select('id, email_address, label, created_at')
    .eq('case_id', caseId)
    .order('created_at')

  const { data: caseRow } = await supabase
    .from('cases')
    .select('dispute_type, role')
    .eq('id', caseId)
    .single()

  return (
    <div className="min-h-screen bg-warm-bg">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link
          href={`/case/${caseId}`}
          className="text-sm text-warm-muted hover:text-warm-text mb-6 inline-block"
        >
          &larr; Back to dashboard
        </Link>

        <SupportiveHeader
          title="Email Monitor"
          subtitle="Track and respond to emails from opposing counsel."
        />

        {!gmailAccount ? (
          <Card className="mt-6">
            <CardContent className="pt-6 text-center py-12">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-warm-bg">
                <svg className="h-6 w-6 text-warm-muted" viewBox="0 0 24 24" fill="none">
                  <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-warm-text mb-2">
                Connect your Gmail
              </h2>
              <p className="text-sm text-warm-muted mb-4 max-w-md mx-auto">
                Connect your Gmail account to monitor emails from opposing counsel
                and get AI-powered reply suggestions.
              </p>
              <Link
                href="/settings"
                className="inline-flex items-center justify-center rounded-md bg-calm-indigo px-4 py-2 text-sm font-medium text-white hover:bg-calm-indigo/90 transition-colors"
              >
                Go to Settings to Connect
              </Link>
            </CardContent>
          </Card>
        ) : (
          <CaseEmailsClient
            caseId={caseId}
            gmailEmail={gmailAccount.email}
            initialFilters={filters ?? []}
            disputeType={caseRow?.dispute_type ?? null}
          />
        )}
      </div>
    </div>
  )
}
