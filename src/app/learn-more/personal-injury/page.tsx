import Link from 'next/link'

export const metadata = {
  title: 'Injured in Texas? How to File a Claim Without a Lawyer | Lawyer Free',
  description:
    'File a personal injury claim in Texas without expensive attorney fees. Free guided help with demand letters, petitions, and settlement negotiations.',
  openGraph: {
    title: 'Injured in Texas?',
    description: 'Free guided help filing a personal injury claim in Texas.',
  },
}

const steps = [
  { num: 1, title: 'Document your injuries and medical records', desc: 'We guide you through organizing medical bills, photos, and treatment records into a strong evidence package.' },
  { num: 2, title: 'Generate a demand letter', desc: 'Create a professional demand letter that calculates your damages and presents your case to the at-fault party or insurer.' },
  { num: 3, title: 'Negotiate with insurance', desc: 'Learn proven negotiation tactics and track offers so you don\'t settle for less than you deserve.' },
  { num: 4, title: 'File a petition if needed', desc: 'If negotiations stall, we help you prepare and file a petition in the correct Texas court.' },
  { num: 5, title: 'Prepare for trial or settlement', desc: 'Get ready for mediation, settlement conferences, or trial with organized evidence and clear arguments.' },
]

export default function PersonalInjuryPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Hero */}
      <section className="text-center mb-16">
        <h1 className="text-3xl md:text-4xl font-bold text-warm-text mb-4">
          Injured in Texas?
        </h1>
        <p className="text-lg text-warm-muted max-w-2xl mx-auto">
          You don&apos;t need a lawyer to fight for fair compensation. We guide you through every
          step.
        </p>
      </section>

      {/* The Numbers */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-warm-text mb-6 text-center">The Numbers</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-calm-indigo/5 rounded-xl p-6 text-center">
            <p className="text-3xl font-bold text-calm-indigo mb-2">33%</p>
            <p className="text-sm text-warm-muted">
              Average cut a PI attorney takes from your settlement
            </p>
          </div>
          <div className="bg-calm-indigo/5 rounded-xl p-6 text-center">
            <p className="text-3xl font-bold text-calm-indigo mb-2">2 Years</p>
            <p className="text-sm text-warm-muted">
              Texas statute of limitations for personal injury claims
            </p>
          </div>
          <div className="bg-calm-indigo/5 rounded-xl p-6 text-center">
            <p className="text-3xl font-bold text-calm-indigo mb-2">95%+</p>
            <p className="text-sm text-warm-muted">
              Of personal injury cases settle before trial
            </p>
          </div>
        </div>
      </section>

      {/* How Lawyer Free Helps */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-warm-text mb-6 text-center">
          How Lawyer Free Helps
        </h2>
        <div className="space-y-4">
          {steps.map((step) => (
            <div key={step.num} className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-calm-indigo text-white flex items-center justify-center text-sm font-bold">
                {step.num}
              </span>
              <div>
                <h3 className="font-semibold text-warm-text">{step.title}</h3>
                <p className="text-sm text-warm-muted mt-0.5">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Keep More of Your Settlement */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-warm-text mb-6 text-center">
          Keep More of Your Settlement
        </h2>
        <div className="bg-calm-green/5 rounded-xl p-8 text-center max-w-2xl mx-auto">
          <p className="text-warm-text mb-4">
            An attorney would take{' '}
            <span className="font-bold text-calm-indigo">$10,000</span> of a $30,000 settlement.
          </p>
          <p className="text-warm-text">
            With Lawyer Free Pro{' '}
            <span className="font-bold text-calm-indigo">($39/mo)</span>, you keep it all.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center mb-16">
        <h2 className="text-2xl font-bold text-warm-text mb-4">
          Ready to fight for fair compensation?
        </h2>
        <Link
          href="/signup?type=personal_injury&role=plaintiff"
          className="inline-block bg-calm-indigo text-white font-semibold px-8 py-3 rounded-lg text-lg hover:bg-calm-indigo/90 transition-colors"
        >
          Start Your Free Personal Injury Case
        </Link>
      </section>

      {/* Disclaimer */}
      <footer className="text-xs text-warm-muted text-center max-w-2xl mx-auto">
        <p>
          Lawyer Free is not a law firm and does not provide legal advice. The information and
          documents generated by this platform are for educational and self-help purposes only. You
          should consult a licensed attorney for advice specific to your situation. Use of this
          platform does not create an attorney-client relationship.
        </p>
      </footer>
    </div>
  )
}
