import Link from 'next/link'
import { LegalDisclaimer } from '@/components/layout/legal-disclaimer'

export const metadata = {
  title: 'Privacy Policy | Lawyer Free',
  description: 'How Lawyer Free collects, uses, and shares legal self-help account and case data.',
}

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      <h1 className="text-3xl font-bold text-warm-text">Privacy Policy</h1>
      <p className="text-sm text-warm-muted">Last updated: May 22, 2026</p>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-warm-text">1. What We Collect</h2>
        <p className="text-sm text-warm-text leading-relaxed">
          Lawyer Free stores account details, case descriptions, deadlines, documents,
          evidence notes, generated drafts, research history, billing status, support
          requests, and product usage events you choose to create in the service.
        </p>
        <p className="text-sm text-warm-text leading-relaxed">
          Do not enter Social Security numbers, bank account numbers, full medical
          records, government ID numbers, or other highly sensitive identifiers unless
          they are necessary for the self-help task you are performing and you are
          comfortable with the processing described below.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-warm-text">2. How We Use Your Data</h2>
        <p className="text-sm text-warm-text leading-relaxed">
          We use your data to provide the case dashboard, guided steps, deadline
          tracking, document drafting, legal research, evidence organization, account
          management, billing, support, abuse prevention, and security monitoring.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-warm-text">3. Third-Party Processors</h2>
        <p className="text-sm text-warm-text leading-relaxed">
          Lawyer Free uses third-party services to operate the product. Case facts,
          document text, and user prompts may be processed by OpenAI and Anthropic
          when you use AI features. Account, case, document, and evidence data are
          stored with Supabase. Payments are processed by Stripe. Emails may be sent
          through Resend. Product analytics may be collected with Plausible. If you
          enable Gmail features, Gmail message metadata and content needed for the
          requested feature may be processed through the configured Gmail integration.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-warm-text">4. Legal Confidentiality</h2>
        <p className="text-sm text-warm-text leading-relaxed">
          Lawyer Free is not a law firm and your use of the product does not create
          an attorney-client relationship or attorney-client privilege. Treat
          AI-generated outputs and document drafts as self-help materials that you
          must review before using in court or sending to anyone else.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-warm-text">5. Security and Access</h2>
        <p className="text-sm text-warm-text leading-relaxed">
          We use Supabase authentication, row-level security, access controls, and
          ordinary transport security to help protect account data. No internet
          service can guarantee absolute security, and you are responsible for
          reviewing what you upload and share.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-warm-text">6. Your Choices</h2>
        <p className="text-sm text-warm-text leading-relaxed">
          You can export your data and request account deletion from Settings. Some
          records may be retained for security, fraud prevention, billing, legal
          compliance, backup integrity, or anonymized product analytics.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-warm-text">7. Related Terms</h2>
        <p className="text-sm text-warm-text leading-relaxed">
          This Privacy Policy should be read together with our{' '}
          <Link href="/terms" className="text-calm-indigo underline">
            Terms of Service
          </Link>
          .
        </p>
      </section>

      <LegalDisclaimer />
    </div>
  )
}
