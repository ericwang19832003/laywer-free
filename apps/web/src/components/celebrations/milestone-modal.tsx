'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, Sparkles, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import type { MilestoneType } from './use-milestone'
import { getAttorneyFeeEstimate } from '@lawyer-free/shared/rules/attorney-fee-estimates'

/* ------------------------------------------------------------------ */
/*  Encouraging messages by progress ratio                            */
/* ------------------------------------------------------------------ */

export function getEncouragingMessage(ratio: number): string {
  if (ratio < 0.25) return 'Great start! You\'re building momentum.'
  if (ratio < 0.5) return 'You\'re making real progress.'
  if (ratio < 0.75) return 'Over halfway there! Keep going.'
  return 'Almost done — the finish line is in sight.'
}

/* ------------------------------------------------------------------ */
/*  Props                                                             */
/* ------------------------------------------------------------------ */

interface MilestoneModalProps {
  type: MilestoneType
  open: boolean
  completedSteps: number
  totalSteps: number
  disputeType?: string
  outcome?: string
  onDismiss: () => void
}

/* ------------------------------------------------------------------ */
/*  Step completion content                                           */
/* ------------------------------------------------------------------ */

function StepContent({ completedSteps, totalSteps }: { completedSteps: number; totalSteps: number }) {
  const ratio = totalSteps > 0 ? completedSteps / totalSteps : 0
  const pct = Math.round(ratio * 100)

  return (
    <>
      <div className="flex items-center justify-center">
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-calm-green/10">
          <CheckCircle className="h-8 w-8 text-calm-green" />
        </div>
      </div>

      <DialogHeader className="items-center text-center">
        <DialogTitle className="text-xl text-warm-text">
          {completedSteps} of {totalSteps} steps done!
        </DialogTitle>
        <DialogDescription className="text-warm-muted">
          {getEncouragingMessage(ratio)}
        </DialogDescription>
      </DialogHeader>

      <div>
        <div className="flex justify-between text-xs text-warm-muted mb-1.5">
          <span>{completedSteps} completed</span>
          <span>{pct}%</span>
        </div>
        <Progress value={pct} className="h-2.5" />
      </div>
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  Halfway milestone content                                         */
/* ------------------------------------------------------------------ */

function HalfwayContent() {
  return (
    <>
      <div className="flex items-center justify-center">
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-calm-amber/10">
          <Sparkles className="h-8 w-8 text-calm-amber" />
        </div>
      </div>

      <DialogHeader className="items-center text-center">
        <DialogTitle className="text-xl text-warm-text">
          You&apos;re halfway there!
        </DialogTitle>
        <DialogDescription className="text-warm-muted">
          Most people who reach this point successfully complete their case. You&apos;re doing great — keep going.
        </DialogDescription>
      </DialogHeader>
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  Case resolved / won content                                       */
/* ------------------------------------------------------------------ */

function ResolvedContent({
  disputeType,
  outcome,
  onShare,
  copied,
}: {
  disputeType: string
  outcome: string
  onShare: () => void
  copied: boolean
}) {
  const fees = getAttorneyFeeEstimate(disputeType)
  const caseLabel = disputeType.replace(/_/g, ' ')
  const outcomeLabel = outcome === 'settled' ? 'settled' : 'won'

  return (
    <>
      {/* confetti-style dots using CSS only */}
      <div className="absolute inset-x-0 top-0 h-32 overflow-hidden pointer-events-none" aria-hidden>
        {Array.from({ length: 20 }).map((_, i) => (
          <span
            key={i}
            className="absolute rounded-full opacity-60"
            style={{
              width: 6 + Math.random() * 6,
              height: 6 + Math.random() * 6,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: ['#6366F1', '#F59E0B', '#10B981', '#EC4899', '#3B82F6'][i % 5],
              animation: `pulse ${1.5 + Math.random()}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="flex items-center justify-center relative z-10">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-calm-green/10">
          <Trophy className="h-10 w-10 text-calm-green" />
        </div>
      </div>

      <DialogHeader className="items-center text-center relative z-10">
        <DialogTitle className="text-2xl text-warm-text">
          Congratulations!
        </DialogTitle>
        <DialogDescription asChild>
          <div className="text-warm-muted space-y-2">
            <p>
              You {outcomeLabel} your {caseLabel} case — and saved an estimated{' '}
              <span className="font-semibold text-warm-text">
                ${fees.lowEnd.toLocaleString()}-${fees.highEnd.toLocaleString()}
              </span>{' '}
              in attorney fees.
            </p>
            <p className="text-xs text-warm-muted/70">
              Source: {fees.source}. Estimates based on publicly available market data.
            </p>
          </div>
        </DialogDescription>
      </DialogHeader>

      <Button onClick={onShare} className="w-full relative z-10">
        {copied ? 'Copied!' : 'Share your success'}
      </Button>
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  Main modal                                                        */
/* ------------------------------------------------------------------ */

export function MilestoneModal({
  type,
  open,
  completedSteps,
  totalSteps,
  disputeType = 'small_claims',
  outcome = 'won',
  onDismiss,
}: MilestoneModalProps) {
  const [copied, setCopied] = useState(false)

  // Reset copied state when modal reopens
  useEffect(() => {
    if (open) setCopied(false)
  }, [open])

  async function handleShare() {
    const fees = getAttorneyFeeEstimate(disputeType)
    const caseLabel = disputeType.replace(/_/g, ' ')
    const outcomeLabel = outcome === 'settled' ? 'settled' : 'won'
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
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onDismiss() }}>
      <DialogContent
        className="sm:max-w-md"
        showCloseButton={type !== 'resolved'}
      >
        <div className="flex flex-col gap-4 py-2">
          {type === 'step' && (
            <StepContent completedSteps={completedSteps} totalSteps={totalSteps} />
          )}

          {type === 'halfway' && <HalfwayContent />}

          {type === 'resolved' && (
            <ResolvedContent
              disputeType={disputeType}
              outcome={outcome}
              onShare={handleShare}
              copied={copied}
            />
          )}

          <DialogFooter>
            <Button variant="outline" onClick={onDismiss} className="w-full">
              {type === 'resolved' ? 'Close' : 'Continue'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
