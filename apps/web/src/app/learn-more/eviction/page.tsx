import Link from 'next/link'

export const metadata = {
  title: 'Facing Eviction in Texas? Know Your Rights | Lawyer Free',
  description:
    'Texas tenants have legal protections against eviction. Get free guided help responding to eviction notices, documenting habitability issues, and preparing for JP court.',
  openGraph: {
    title: 'Facing Eviction in Texas?',
    description: 'Free guided help for eviction defense in Texas.',
  },
}

const timeline = [
  { notice: '3-Day Notice to Vacate', detail: 'You have 3 days to respond or vacate.' },
  { notice: '30-Day Notice to Vacate', detail: 'You have 30 days — use that time to prepare.' },
  { notice: 'Court Citation Filed', detail: 'Your hearing is in 10–21 days.' },
]

const steps = [
  { num: 1, title: 'Understand your eviction notice', desc: 'We help you identify what type of notice you received and what it legally requires.' },
  { num: 2, title: 'Check for landlord violations', desc: 'Many evictions are retaliatory or procedurally defective — both are valid defenses.' },
  { num: 3, title: 'Document habitability issues', desc: 'If your landlord failed to maintain the property, that can be a defense or counterclaim.' },
  { num: 4, title: 'Prepare your defense', desc: 'Generate your written answer and organize your evidence for the judge.' },
  { num: 5, title: 'Get ready for JP court', desc: 'Know what to expect at your Justice of the Peace hearing and how to present your case.' },
]

const protections = [
  { statute: '\u00a792.331', title: 'Retaliation Defense', desc: 'Landlords cannot evict you for reporting code violations or exercising legal rights.' },
  { statute: '\u00a792.052', title: 'Habitability Rights', desc: 'Landlords must maintain the property in a habitable condition under Texas law.' },
  { statute: '\u00a792.103', title: 'Security Deposit Rules', desc: 'Landlords must return your deposit within 30 days or provide an itemized list of deductions.' },
  { statute: '\u00a792.0081', title: 'Lockout Prohibition', desc: 'Your landlord cannot change locks, remove doors, or shut off utilities to force you out.' },
]

export default function EvictionPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Hero */}
      <section className="text-center mb-16">
        <h1 className="text-3xl md:text-4xl font-bold text-warm-text mb-4">
          Facing Eviction in Texas?
        </h1>
        <p className="text-lg text-warm-muted max-w-2xl mx-auto">
          You have rights — and time matters. Most tenants can contest evictions, but you need to
          act quickly.
        </p>
      </section>

      {/* Know Your Timeline */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-warm-text mb-6 text-center">Know Your Timeline</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {timeline.map((t) => (
            <div key={t.notice} className="bg-calm-indigo/5 rounded-xl p-6 text-center">
              <p className="font-bold text-warm-text mb-2">{t.notice}</p>
              <p className="text-sm text-warm-muted">{t.detail}</p>
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-warm-muted mt-4">
          Don&apos;t ignore it — responding preserves your rights.
        </p>
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

      {/* Texas Tenant Protections */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-warm-text mb-6 text-center">
          Texas Tenant Protections
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {protections.map((p) => (
            <div key={p.statute} className="bg-calm-green/5 rounded-xl p-6">
              <p className="text-xs font-mono text-calm-indigo mb-1">{p.statute}</p>
              <h3 className="font-semibold text-warm-text mb-1">{p.title}</h3>
              <p className="text-sm text-warm-muted">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center mb-16">
        <h2 className="text-2xl font-bold text-warm-text mb-4">
          Ready to fight your eviction?
        </h2>
        <Link
          href="/signup?type=landlord_tenant&role=defendant"
          className="inline-block bg-calm-indigo text-white font-semibold px-8 py-3 rounded-lg text-lg hover:bg-calm-indigo/90 transition-colors"
        >
          Start Your Free Eviction Defense
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
