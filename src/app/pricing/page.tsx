import Link from 'next/link'
import { TIER_PRICING } from '@/lib/subscription/limits'

export const metadata = {
  title: 'Pricing | Lawyer Free',
  description: 'Affordable legal help for self-represented litigants in Texas. First case free.',
}

const tiers = [
  {
    name: 'Free',
    price: TIER_PRICING.free.monthly,
    period: '/month',
    badge: 'No credit card',
    badgeColor: 'bg-calm-green/10 text-calm-green',
    borderColor: 'border-warm-muted/20',
    cta: 'Start Free',
    href: '/signup',
    features: [
      '1 active case',
      '5 AI generations/month',
      'All guided steps',
      'Deadline tracking',
      'Court directory',
      'Case health score',
      'Citation verification',
    ],
  },
  {
    name: 'Essentials',
    price: TIER_PRICING.essentials.monthly,
    period: '/month',
    oneTime: TIER_PRICING.essentials.oneTime,
    badge: 'Most Popular',
    badgeColor: 'bg-calm-indigo/10 text-calm-indigo',
    borderColor: 'border-calm-indigo',
    highlighted: true,
    cta: 'Get Essentials',
    href: '/signup?plan=essentials',
    includesFrom: 'Free',
    features: [
      'Unlimited cases',
      'Unlimited AI generations',
      'Email deadline reminders',
      'Case sharing',
    ],
  },
  {
    name: 'Pro',
    price: TIER_PRICING.pro.monthly,
    period: '/month',
    badge: 'Power User',
    badgeColor: 'bg-calm-amber/10 text-calm-amber',
    borderColor: 'border-warm-muted/20',
    cta: 'Get Pro',
    href: '/signup?plan=pro',
    includesFrom: 'Essentials',
    features: [
      'Discovery tools',
      'Trial binders',
      'Email integration',
      'Priority AI (GPT-4o)',
    ],
  },
]

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
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-20">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={`relative rounded-2xl border-2 ${tier.borderColor} bg-warm-bg p-6 flex flex-col ${
              tier.highlighted ? 'ring-2 ring-calm-indigo/30 shadow-lg' : ''
            }`}
          >
            {/* Badge */}
            <span
              className={`inline-block self-start text-xs font-semibold px-2.5 py-1 rounded-full mb-4 ${tier.badgeColor}`}
            >
              {tier.badge}
            </span>

            {/* Name & Price */}
            <h2 className="text-xl font-bold text-warm-text mb-1">{tier.name}</h2>
            <div className="mb-1">
              <span className="text-3xl font-bold text-warm-text">${tier.price}</span>
              <span className="text-warm-muted">{tier.period}</span>
            </div>
            {tier.oneTime && (
              <p className="text-sm text-warm-muted mb-4">
                or <span className="font-semibold text-warm-text">${tier.oneTime}</span> one-time
              </p>
            )}
            {!tier.oneTime && <div className="mb-4" />}

            {/* CTA */}
            <Link
              href={tier.href}
              className={`block text-center rounded-lg py-2.5 font-semibold mb-6 transition-colors ${
                tier.highlighted
                  ? 'bg-calm-indigo text-white hover:bg-calm-indigo/90'
                  : 'bg-warm-text/10 text-warm-text hover:bg-warm-text/20'
              }`}
            >
              {tier.cta}
            </Link>

            {/* Features */}
            <ul className="space-y-2.5 flex-1">
              {tier.includesFrom && (
                <li className="text-sm text-warm-muted font-medium mb-1">
                  Everything in {tier.includesFrom}, plus:
                </li>
              )}
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-warm-text">
                  <svg
                    className="w-4 h-4 mt-0.5 text-calm-green shrink-0"
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
          </div>
        ))}
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
