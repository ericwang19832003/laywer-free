import Link from 'next/link'
import { PricingCards } from '@/components/pricing/pricing-cards'

export const metadata = {
  title: 'Pricing | Lawyer Free',
  description: 'Affordable legal help for self-represented litigants in Texas. First case free.',
}

const alwaysFreeFeatures = [
  'Deadline tracking',
  'Guided step-by-step wizards',
  'Court directory & fee info',
  'Fee waiver information',
  'Case dashboard & health score',
  'Citation verification',
]

const faqs = [
  {
    q: 'Is my first case really free?',
    a: 'Yes, complete your entire first case with all features. No credit card needed.',
  },
  {
    q: 'What happens when I need a second case?',
    a: "You'll need an Essentials or Pro plan. Your first case stays active regardless.",
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes, cancel instantly from Settings. Your cases become read-only (never deleted).',
  },
  {
    q: "What's the $149 one-time option?",
    a: 'Pay once for lifetime access to one case. Perfect if you have a single legal matter.',
  },
  {
    q: 'Is my data safe?',
    a: "Your data is encrypted, protected by row-level security, and never shared. We're built on Supabase with enterprise-grade security.",
  },
]

export default function PricingPage() {
  return (
    <div className="container max-w-6xl mx-auto px-4 py-12">
      {/* Hero */}
      <section className="text-center mb-16">
        <h1 className="text-3xl md:text-4xl font-bold text-warm-text mb-4">
          Your first case is free. Seriously.
        </h1>
        <p className="text-lg text-warm-muted max-w-2xl mx-auto">
          No credit card required. Complete your entire first case — guided steps, AI documents,
          deadline tracking — at zero cost.
        </p>
      </section>

      {/* Pricing Cards */}
      <section className="mb-20">
        <PricingCards />
      </section>

      {/* Always Free */}
      <section className="mb-20 text-center">
        <h2 className="text-2xl font-bold text-warm-text mb-2">
          These features are always free — no matter what.
        </h2>
        <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto text-left">
          {alwaysFreeFeatures.map((feature) => (
            <li key={feature} className="flex items-center gap-2 text-sm text-warm-text">
              <svg
                className="w-4 h-4 text-calm-green shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {feature}
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-warm-muted max-w-xl mx-auto">
          We believe access to justice shouldn&apos;t have a paywall. Safety-critical features are
          free forever.
        </p>
      </section>

      {/* FAQ */}
      <section className="mb-20 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-warm-text mb-6 text-center">
          Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {faqs.map((faq) => (
            <details
              key={faq.q}
              className="group rounded-lg border border-warm-muted/20 bg-warm-bg"
            >
              <summary className="cursor-pointer list-none px-5 py-4 font-medium text-warm-text flex items-center justify-between">
                {faq.q}
                <svg
                  className="w-4 h-4 text-warm-muted transition-transform group-open:rotate-180"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="px-5 pb-4 text-sm text-warm-muted">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="text-center">
        <h2 className="text-2xl font-bold text-warm-text mb-4">
          Ready to take control of your case?
        </h2>
        <Link
          href="/signup"
          className="inline-block bg-calm-indigo text-white font-semibold px-8 py-3 rounded-lg hover:bg-calm-indigo/90 transition-colors"
        >
          Start Free — No Credit Card
        </Link>
      </section>
    </div>
  )
}
