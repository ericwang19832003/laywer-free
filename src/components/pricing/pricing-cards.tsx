'use client'

import { useState } from 'react'
import Link from 'next/link'
import { TIER_PRICING } from '@/lib/subscription/limits'

const tiers = [
  {
    name: 'Free',
    monthlyPrice: TIER_PRICING.free.monthly,
    annualPrice: TIER_PRICING.free.annual,
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
    monthlyPrice: TIER_PRICING.essentials.monthly,
    annualPrice: TIER_PRICING.essentials.annual,
    oneTimePrice: TIER_PRICING.essentials.oneTime,
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
    monthlyPrice: TIER_PRICING.pro.monthly,
    annualPrice: TIER_PRICING.pro.annual,
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

function annualSavings(monthly: number, annual: number): number {
  return monthly * 12 - annual
}

function monthlyEquivalent(annual: number): string {
  return (annual / 12).toFixed(2)
}

export function PricingCards() {
  const [isAnnual, setIsAnnual] = useState(false)

  return (
    <div>
      {/* Billing Toggle */}
      <div className="flex items-center justify-center gap-1 mb-10">
        <div className="inline-flex rounded-lg bg-warm-text/5 p-1">
          <button
            onClick={() => setIsAnnual(false)}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
              !isAnnual
                ? 'bg-calm-indigo text-white shadow-sm'
                : 'text-warm-muted hover:text-warm-text'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setIsAnnual(true)}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
              isAnnual
                ? 'bg-calm-indigo text-white shadow-sm'
                : 'text-warm-muted hover:text-warm-text'
            }`}
          >
            Annual <span className="text-xs font-normal opacity-80">(Save 17%)</span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {tiers.map((tier) => {
          const isFree = tier.monthlyPrice === 0
          const savings = annualSavings(tier.monthlyPrice, tier.annualPrice)

          return (
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
                {isAnnual && !isFree ? (
                  <>
                    <span className="text-3xl font-bold text-warm-text">
                      ${tier.annualPrice}
                    </span>
                    <span className="text-warm-muted">/year</span>
                    <span className="block text-sm text-warm-muted mt-0.5">
                      ${monthlyEquivalent(tier.annualPrice)}/mo
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-3xl font-bold text-warm-text">
                      ${tier.monthlyPrice}
                    </span>
                    <span className="text-warm-muted">/month</span>
                  </>
                )}
              </div>

              {/* Annual savings badge */}
              {isAnnual && !isFree && savings > 0 && (
                <span className="inline-block self-start text-xs font-semibold px-2 py-0.5 rounded-full bg-calm-green/10 text-calm-green mb-2">
                  Save ${savings}
                </span>
              )}

              {/* One-time option (Essentials only, always visible) */}
              {tier.oneTimePrice && (
                <p className="text-sm text-warm-muted mb-4">
                  or <span className="font-semibold text-warm-text">${tier.oneTimePrice}</span>{' '}
                  one-time
                </p>
              )}
              {!tier.oneTimePrice && !(isAnnual && !isFree && savings > 0) && (
                <div className="mb-4" />
              )}
              {!tier.oneTimePrice && isAnnual && !isFree && savings > 0 && (
                <div className="mb-2" />
              )}

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
          )
        })}
      </div>
    </div>
  )
}
