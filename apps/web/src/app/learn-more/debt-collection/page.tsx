import Link from 'next/link'

export const metadata = {
  title: 'Being Sued for Debt in Texas? Free Step-by-Step Help | Lawyer Free',
  description:
    'Learn your rights under the FDCPA, check if the statute of limitations has expired, and defend yourself in Texas debt collection lawsuits — for free.',
  openGraph: {
    title: 'Being Sued for Debt in Texas?',
    description: 'Free guided help for debt collection defense.',
  },
}

const steps = [
  { num: 1, title: 'Check your rights under FDCPA', desc: 'We walk you through the Fair Debt Collection Practices Act to identify violations by the collector.' },
  { num: 2, title: 'Calculate if statute of limitations expired', desc: 'Most Texas debts have a 4-year statute of limitations. If yours has passed, the case may be dismissed.' },
  { num: 3, title: 'Generate a debt validation letter', desc: 'Force the collector to prove you actually owe the debt — and the amount is correct.' },
  { num: 4, title: 'Prepare your court answer', desc: 'File a proper answer before the deadline so you don\'t lose by default judgment.' },
  { num: 5, title: 'Get ready for your hearing', desc: 'Know what to expect, what to bring, and how to present your defenses to the judge.' },
]

const differentiators = [
  { title: 'Guided steps, not a chatbot', desc: 'Every action is a clear, numbered step — not an AI conversation that leaves you guessing.' },
  { title: 'Citation-verified documents', desc: 'Every document we generate is checked against real Texas legal citations.' },
  { title: 'Free first case', desc: 'Complete your entire debt defense case at zero cost. No credit card required.' },
  { title: 'Texas-specific legal knowledge', desc: 'Built specifically for Texas courts, rules, and deadlines — not generic templates.' },
]

export default function DebtCollectionPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Hero */}
      <section className="text-center mb-16">
        <h1 className="text-3xl md:text-4xl font-bold text-warm-text mb-4">
          Being Sued for Debt in Texas?
        </h1>
        <p className="text-lg text-warm-muted max-w-2xl mx-auto">
          You have more rights than you think. Most debt collection lawsuits have defenses — and
          many can be won.
        </p>
      </section>

      {/* Did You Know? */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-warm-text mb-6 text-center">Did You Know?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-calm-indigo/5 rounded-xl p-6 text-center">
            <p className="text-3xl font-bold text-calm-indigo mb-2">49%</p>
            <p className="text-sm text-warm-muted">
              Surge in pro se debt cases
              <br />
              <span className="text-xs">(Bloomberg Law)</span>
            </p>
          </div>
          <div className="bg-calm-indigo/5 rounded-xl p-6 text-center">
            <p className="text-3xl font-bold text-calm-indigo mb-2">$1,500–$3,000</p>
            <p className="text-sm text-warm-muted">
              Average cost to hire an attorney for debt defense
            </p>
          </div>
          <div className="bg-calm-indigo/5 rounded-xl p-6 text-center">
            <p className="text-3xl font-bold text-calm-indigo mb-2">4 Years</p>
            <p className="text-sm text-warm-muted">
              Statute of limitations on most Texas debts
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

      {/* What Makes Us Different */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-warm-text mb-6 text-center">
          What Makes Us Different
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {differentiators.map((d) => (
            <div key={d.title} className="bg-calm-green/5 rounded-xl p-6">
              <h3 className="font-semibold text-warm-text mb-1">{d.title}</h3>
              <p className="text-sm text-warm-muted">{d.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center mb-16">
        <h2 className="text-2xl font-bold text-warm-text mb-4">
          Ready to defend yourself?
        </h2>
        <Link
          href="/signup?type=debt_collection&role=defendant"
          className="inline-block bg-calm-indigo text-white font-semibold px-8 py-3 rounded-lg text-lg hover:bg-calm-indigo/90 transition-colors"
        >
          Start Your Free Debt Defense Case
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
