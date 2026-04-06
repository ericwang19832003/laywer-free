'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Gift, Users, Copy, Mail } from 'lucide-react'
import { toast } from 'sonner'

type ReferralData = {
  referralCode: string
  referralUrl: string
  stats: {
    totalReferred: number
    signedUp: number
    converted: number
    credited: number
  }
}

export function ReferralSection() {
  const [data, setData] = useState<ReferralData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/referrals')
      .then((r) => r.json())
      .then(setData)
      .catch(() => toast.error('Failed to load referral info'))
      .finally(() => setLoading(false))
  }, [])

  function handleCopy() {
    if (!data) return
    navigator.clipboard.writeText(data.referralUrl)
    toast.success('Referral link copied!')
  }

  function handleEmailShare() {
    if (!data) return
    const subject = encodeURIComponent('Try Lawyer Free - manage your case with confidence')
    const body = encodeURIComponent(
      `I've been using Lawyer Free to manage my legal case and it's been incredibly helpful. You'll get 10 free AI generations when you sign up with my link:\n\n${data.referralUrl}`
    )
    window.open(`mailto:?subject=${subject}&body=${body}`)
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

  if (!data) return null

  const { stats, referralUrl } = data
  const earnedDollars = stats.credited * 10

  return (
    <Card id="referrals">
      <CardHeader>
        <CardTitle className="text-lg text-warm-text flex items-center gap-2">
          <Gift className="h-5 w-5 text-calm-indigo" />
          Referral Program
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Referral link */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-warm-text">Your referral link</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 rounded-lg bg-warm-bg px-3 py-2 text-sm text-warm-muted truncate">
              {referralUrl}
            </div>
            <Button variant="outline" size="sm" onClick={handleCopy}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-warm-bg text-center">
            <p className="text-lg font-semibold text-warm-text">{stats.totalReferred}</p>
            <span className="relative group cursor-help">
              <span className="text-xs text-warm-muted">Referred</span>
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-warm-text text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                People who clicked your referral link
              </span>
            </span>
          </div>
          <div className="p-3 rounded-lg bg-warm-bg text-center">
            <p className="text-lg font-semibold text-warm-text">{stats.signedUp}</p>
            <span className="relative group cursor-help">
              <span className="text-xs text-warm-muted">Signed Up</span>
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-warm-text text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                People who created an account through your link
              </span>
            </span>
          </div>
          <div className="p-3 rounded-lg bg-warm-bg text-center">
            <p className="text-lg font-semibold text-warm-text">{stats.converted}</p>
            <span className="relative group cursor-help">
              <span className="text-xs text-warm-muted">Converted</span>
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-warm-text text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                People who upgraded to a paid plan
              </span>
            </span>
          </div>
          <div className="p-3 rounded-lg bg-warm-bg text-center">
            <p className="text-lg font-semibold text-warm-text">${earnedDollars}</p>
            <span className="relative group cursor-help">
              <span className="text-xs text-warm-muted">Earned</span>
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-warm-text text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                Credits applied to your account ($10 per conversion)
              </span>
            </span>
          </div>
        </div>

        {/* Share buttons */}
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={handleCopy} className="flex items-center gap-2">
            <Copy className="h-4 w-4" />
            Copy Link
          </Button>
          <Button variant="outline" size="sm" onClick={handleEmailShare} className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Share via Email
          </Button>
        </div>

        {/* How it works */}
        <div className="rounded-lg bg-warm-bg p-4 space-y-2">
          <p className="text-sm font-medium text-warm-text flex items-center gap-2">
            <Users className="h-4 w-4 text-calm-indigo" />
            How it works
          </p>
          <ol className="text-sm text-warm-muted space-y-1 list-decimal list-inside">
            <li>Share your link with a friend</li>
            <li>Friend gets 10 AI generations free when they sign up</li>
            <li>You get $10 credit when they upgrade to a paid plan</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  )
}
