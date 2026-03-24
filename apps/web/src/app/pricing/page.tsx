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
    <div className="container max-w-5xl mx-auto px-4 py-12">
      {/* Trust-first hero */}
      <section className="text-center mb-6">
        <p className="text-sm font-medium tracking-wide uppercase text-calm-indigo mb-3">
          For self-represented litigants who need guidance, not a lawyer&apos;s fee
        </p>
        <h1 className="text-3xl md:text-4xl font-bold text-warm-text mb-4">
          Your first case is completely free
        </h1>
        <p className="text-lg text-warm-muted max-w-2xl mx-auto">
          No credit card. No catch. File your first case with guided steps,
          AI-drafted documents, and deadline tracking — at zero cost.
        </p>
      </section>

      {/* First case free callout */}
      <section className="mb-14">
        <div className="max-w-2xl mx-auto rounded-xl border-2 border-calm-green/30 bg-calm-green/5 px-6 py-5 text-center">
          <p className="text-base font-semibold text-warm-text mb-1">
            &ldquo;First case free&rdquo; means exactly what it says
          </p>
          <p className="text-sm text-warm-muted">
            Sign up, open your first case, and use every feature — guided wizards, AI documents,
            deadline alerts — without paying a cent. When you need a second case, pick a plan.
          </p>
        </div>
      </section>

      {/* Pricing Cards — single recommended plan highlighted */}
      <section className="mb-16">
        <PricingCards />
      </section>

      {/* Feature comparison table */}
      <section className="mb-20">
        <h2 className="text-2xl font-bold text-warm-text mb-6 text-center">
          Compare plans side by side
        </h2>
        <ComparisonTable />
      </section>

      {/* Testimonial */}
      <section className="mb-20">
        <div className="max-w-2xl mx-auto rounded-xl border border-warm-border bg-warm-bg px-8 py-8 text-center">
          <svg
            className="w-8 h-8 text-calm-indigo/30 mx-auto mb-4"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
          </svg>
          <blockquote className="text-lg font-medium text-warm-text mb-3">
            I filed my small claims case in 2 hours instead of 2 weeks.
          </blockquote>
          <p className="text-sm text-warm-muted">
            &mdash; Sarah T., small claims filer in Texas
          </p>
        </div>
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

/* ------------------------------------------------------------------ */
/*  Feature comparison table                                          */
/* ------------------------------------------------------------------ */

const comparisonFeatures: { label: string; free: string; essentials: string; pro: string }[] = [
  { label: 'Active cases', free: '1', essentials: 'Unlimited', pro: 'Unlimited' },
  { label: 'AI document generations', free: '5/month', essentials: 'Unlimited', pro: 'Unlimited' },
  { label: 'AI model', free: 'GPT-4o Mini', essentials: 'GPT-4o Mini', pro: 'GPT-4o' },
  { label: 'Guided steps & wizards', free: 'Yes', essentials: 'Yes', pro: 'Yes' },
  { label: 'Deadline tracking', free: 'Yes', essentials: 'Yes', pro: 'Yes' },
  { label: 'Email deadline reminders', free: 'No', essentials: 'Yes', pro: 'Yes' },
  { label: 'Case sharing', free: 'No', essentials: 'Yes', pro: 'Yes' },
  { label: 'Discovery tools', free: 'No', essentials: 'No', pro: 'Yes' },
  { label: 'Trial binders', free: 'No', essentials: 'No', pro: 'Yes' },
  { label: 'Email integration', free: 'No', essentials: 'No', pro: 'Yes' },
]

function ComparisonTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b-2 border-warm-border">
            <th className="text-left py-3 pr-4 font-semibold text-warm-text">Feature</th>
            <th className="text-center py-3 px-4 font-semibold text-warm-text">Free</th>
            <th className="text-center py-3 px-4 font-semibold text-calm-indigo">
              Essentials
            </th>
            <th className="text-center py-3 pl-4 font-semibold text-warm-text">Pro</th>
          </tr>
        </thead>
        <tbody>
          {comparisonFeatures.map((row) => (
            <tr key={row.label} className="border-b border-warm-border/50">
              <td className="py-3 pr-4 text-warm-text">{row.label}</td>
              <td className="py-3 px-4 text-center text-warm-muted">
                <CellValue value={row.free} />
              </td>
              <td className="py-3 px-4 text-center text-warm-text font-medium bg-calm-indigo/[0.03]">
                <CellValue value={row.essentials} />
              </td>
              <td className="py-3 pl-4 text-center text-warm-muted">
                <CellValue value={row.pro} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function CellValue({ value }: { value: string }) {
  if (value === 'Yes') {
    return (
      <svg
        className="w-4 h-4 text-calm-green mx-auto"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    )
  }
  if (value === 'No') {
    return (
      <svg
        className="w-4 h-4 text-warm-muted/40 mx-auto"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6" />
      </svg>
    )
  }
  return <span>{value}</span>
}
