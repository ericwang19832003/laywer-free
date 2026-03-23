'use client'

import { useEffect, useState } from 'react'
import { Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { getAttorneyFeeEstimate } from '@/lib/rules/attorney-fee-estimates'

interface CaseWonCelebrationProps {
  disputeType: string
  outcome: string
  onDismiss: () => void
}

export function CaseWonCelebration({ disputeType, outcome, onDismiss }: CaseWonCelebrationProps) {
  const [visible, setVisible] = useState(false)
  const [copied, setCopied] = useState(false)

  const fees = getAttorneyFeeEstimate(disputeType)
  const caseLabel = disputeType.replace(/_/g, ' ')
  const outcomeLabel = outcome === 'settled' ? 'settled' : 'won'

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(id)
  }, [])

  async function handleShare() {
    const shareText = `I just ${outcomeLabel} my ${caseLabel} case using Lawyer Free — and saved an estimated $${fees.lowEnd.toLocaleString()}-$${fees.highEnd.toLocaleString()} in attorney fees!`
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
    <div
      role="status"
      aria-live="polite"
      className="transition-all duration-500 ease-out"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(16px)',
      }}
    >
      <Card className="border-calm-green/50 bg-calm-green/5 shadow-lg">
        <CardContent className="pt-8 pb-8 space-y-5">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-calm-green/10">
              <Trophy className="h-8 w-8 text-calm-green" />
            </div>
            <h3 className="text-2xl font-bold text-warm-text">Congratulations!</h3>
          </div>

          <p className="text-center text-warm-muted">
            You {outcomeLabel} your {caseLabel} case — and saved an estimated{' '}
            <span className="font-semibold text-warm-text">
              ${fees.lowEnd.toLocaleString()}-${fees.highEnd.toLocaleString()}
            </span>{' '}
            in attorney fees.
          </p>

          <div className="space-y-3">
            <Button onClick={handleShare} className="w-full">
              {copied ? 'Copied!' : 'Share your success'}
            </Button>

            <button
              onClick={onDismiss}
              className="block w-full text-center text-sm text-warm-muted hover:text-warm-text transition-colors"
            >
              Dismiss
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
