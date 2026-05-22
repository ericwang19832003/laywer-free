import { LegalDisclaimer } from '@/components/layout/legal-disclaimer'

export const metadata = {
  title: 'Terms of Service | Lawyer Free',
}

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      <h1 className="text-3xl font-bold text-warm-text">Terms of Service</h1>
      <p className="text-sm text-warm-muted">Last updated: May 22, 2026</p>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-warm-text">1. Not a Law Firm</h2>
        <p className="text-sm text-warm-text leading-relaxed">
          Lawyer Free is not a law firm and does not provide legal advice. Use of this platform
          does not create an attorney-client relationship. The information, documents, and
          AI-generated content provided are for general informational and self-help purposes only.
          For advice specific to your situation, consult a licensed attorney.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-warm-text">2. AI-Generated Content</h2>
        <p className="text-sm text-warm-text leading-relaxed">
          This platform uses artificial intelligence (powered by OpenAI) to generate documents,
          summaries, and legal research. AI-generated content may contain errors, omissions, or
          outdated information. You are responsible for reviewing all AI-generated content for
          accuracy before using it in any legal proceeding. Lawyer Free makes no warranty that
          AI-generated documents are suitable for filing in any court.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-warm-text">3. OpenAI Data Processing</h2>
        <p className="text-sm text-warm-text leading-relaxed">
          To generate AI responses, the facts and case details you enter are sent to OpenAI&apos;s
          API. Do not enter sensitive personal information (Social Security numbers, bank account
          numbers, medical records) that you do not want processed by a third party. Review
          OpenAI&apos;s privacy policy at openai.com/policies/privacy-policy for details on how
          they handle data.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-warm-text">4. Limitation of Liability</h2>
        <p className="text-sm text-warm-text leading-relaxed">
          To the maximum extent permitted by law, Lawyer Free shall not be liable for any
          damages arising from your use of this platform, including adverse legal outcomes,
          missed deadlines, or reliance on AI-generated content. You use this service at your
          own risk.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-warm-text">5. Jurisdiction</h2>
        <p className="text-sm text-warm-text leading-relaxed">
          This platform is designed to assist with civil cases in U.S. state courts. It is not
          designed for criminal matters, immigration proceedings, or cases outside the
          United States. Laws vary by jurisdiction — always verify that information applies to
          your specific court and state.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-warm-text">6. Data Retention</h2>
        <p className="text-sm text-warm-text leading-relaxed">
          Your case data is stored on our servers for as long as your account is active. You
          may delete your account and all associated data by contacting support. We retain
          anonymized usage logs for up to 12 months.
        </p>
      </section>

      <LegalDisclaimer />
    </div>
  )
}
