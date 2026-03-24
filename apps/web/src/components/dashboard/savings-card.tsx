'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trophy } from 'lucide-react'
import { toast } from 'sonner'
import { getAttorneyFeeEstimate, formatSavingsMessage } from '@/lib/rules/attorney-fee-estimates'

interface SavingsCardProps {
  disputeType: string
  outcome: string | null  // only show for 'won' or 'settled'
  userTier: string        // to calculate what they spent
}

function getUserSpent(tier: string): number {
  switch (tier) {
    case 'free':
      return 0
    case 'essentials':
      return 19
    case 'pro':
      return 39
    default:
      return 0
  }
}

export function SavingsCard({ disputeType, outcome, userTier }: SavingsCardProps) {
  const [copied, setCopied] = useState(false)

  if (outcome !== 'won' && outcome !== 'settled') return null

  const userSpent = getUserSpent(userTier)
  const fees = getAttorneyFeeEstimate(disputeType)
  const savedLow = fees.lowEnd - userSpent
  const savedHigh = fees.highEnd - userSpent

  if (savedLow <= 0) return null

  const savingsMessage = formatSavingsMessage(disputeType, userSpent)
  const caseLabel = disputeType.replace(/_/g, ' ')

  async function handleShare() {
    const shareText = `I just won my ${caseLabel} case using Lawyer Free — and saved $${savedLow.toLocaleString()}-$${savedHigh.toLocaleString()} in attorney fees! Try it free: lawyer-free.vercel.app`
    try {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      toast.success('Copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Could not copy to clipboard')
    }
  }

  return (
    <Card className="border-calm-green/40 bg-calm-green/5">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-calm-green" />
          <CardTitle className="text-lg text-warm-text">
            Congratulations!
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-warm-text font-medium">
          You saved an estimated ${savedLow.toLocaleString()}-${savedHigh.toLocaleString()}
        </p>
        <p className="text-sm text-warm-muted">
          {savingsMessage}
        </p>
        <p className="text-xs text-warm-muted/70">
          Source: {fees.source}. Estimates based on publicly available market data and may vary.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={handleShare}
          className="border-calm-green/30 text-calm-green hover:bg-calm-green/10"
        >
          {copied ? 'Copied!' : 'Share your success'}
        </Button>
      </CardContent>
    </Card>
  )
}
