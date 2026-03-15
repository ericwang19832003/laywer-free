'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CreditCard, Sparkles, Zap } from 'lucide-react'
import { useSubscription } from '@/hooks/use-subscription'
import { useState } from 'react'

const TIER_INFO = {
  free: { label: 'Free', color: 'bg-gray-100 text-gray-700' },
  pro: { label: 'Pro', color: 'bg-calm-indigo/10 text-calm-indigo' },
  premium: { label: 'Premium', color: 'bg-calm-amber/10 text-calm-amber' },
}

export function BillingSection() {
  const { tier, aiRemaining, casesRemaining, loading } = useSubscription()
  const [upgrading, setUpgrading] = useState(false)

  async function handleUpgrade(targetTier: string) {
    setUpgrading(true)
    try {
      const res = await fetch('/api/billing/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: targetTier }),
      })
      const { url } = await res.json()
      if (url) window.location.href = url
    } finally {
      setUpgrading(false)
    }
  }

  async function handleManage() {
    const res = await fetch('/api/billing/portal', { method: 'POST' })
    const { url } = await res.json()
    if (url) window.location.href = url
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse h-20 bg-warm-bg rounded" />
        </CardContent>
      </Card>
    )
  }

  const info = TIER_INFO[tier]

  return (
    <Card id="billing">
      <CardHeader>
        <CardTitle className="text-lg text-warm-text flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-calm-indigo" />
          Billing & Subscription
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current plan */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-warm-text">Current Plan</p>
            <Badge className={info.color}>{info.label}</Badge>
          </div>
          {tier !== 'free' && (
            <Button variant="outline" size="sm" onClick={handleManage}>
              Manage Subscription
            </Button>
          )}
        </div>

        {/* Usage meters */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-warm-bg">
            <p className="text-xs text-warm-muted">AI Generations</p>
            <p className="text-lg font-semibold text-warm-text">
              {aiRemaining === Infinity ? 'Unlimited' : `${aiRemaining} left`}
            </p>
            <p className="text-xs text-warm-muted">this month</p>
          </div>
          <div className="p-3 rounded-lg bg-warm-bg">
            <p className="text-xs text-warm-muted">Active Cases</p>
            <p className="text-lg font-semibold text-warm-text">
              {casesRemaining === Infinity ? 'Unlimited' : `${casesRemaining} remaining`}
            </p>
          </div>
        </div>

        {/* Upgrade buttons */}
        {tier === 'free' && (
          <div className="grid gap-3">
            <button
              onClick={() => handleUpgrade('pro')}
              disabled={upgrading}
              className="flex items-center justify-between p-4 rounded-xl border-2 border-calm-indigo/20 hover:border-calm-indigo transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <Zap className="h-5 w-5 text-calm-indigo" />
                <div>
                  <p className="font-medium text-warm-text">Upgrade to Pro</p>
                  <p className="text-xs text-warm-muted">Unlimited AI, 3 cases, discovery tools</p>
                </div>
              </div>
              <span className="text-sm font-semibold text-calm-indigo">$19/mo</span>
            </button>
            <button
              onClick={() => handleUpgrade('premium')}
              disabled={upgrading}
              className="flex items-center justify-between p-4 rounded-xl border-2 border-calm-amber/20 hover:border-calm-amber transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-calm-amber" />
                <div>
                  <p className="font-medium text-warm-text">Upgrade to Premium</p>
                  <p className="text-xs text-warm-muted">Unlimited everything + attorney review</p>
                </div>
              </div>
              <span className="text-sm font-semibold text-calm-amber">$49/mo</span>
            </button>
          </div>
        )}

        {tier === 'pro' && (
          <button
            onClick={() => handleUpgrade('premium')}
            disabled={upgrading}
            className="flex items-center justify-between p-4 rounded-xl border-2 border-calm-amber/20 hover:border-calm-amber transition-colors text-left w-full"
          >
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-calm-amber" />
              <div>
                <p className="font-medium text-warm-text">Upgrade to Premium</p>
                <p className="text-xs text-warm-muted">Unlimited cases + attorney review</p>
              </div>
            </div>
            <span className="text-sm font-semibold text-calm-amber">$49/mo</span>
          </button>
        )}
      </CardContent>
    </Card>
  )
}
