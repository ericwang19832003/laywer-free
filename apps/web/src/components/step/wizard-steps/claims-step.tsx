'use client'

import { HelpTooltip } from '@/components/ui/help-tooltip'
import { Label } from '@/components/ui/label'
import { Scale } from 'lucide-react'

interface ClaimsStepProps {
  disputeType: string | null
  claimDetails: string
  onClaimDetailsChange: (v: string) => void
}

function getDisputeExplanation(disputeType: string | null): React.ReactNode {
  switch (disputeType) {
    case 'debt_collection':
      return (
        <div className="space-y-2">
          <p><strong>For debt collection:</strong> The legal basis is usually &quot;breach of contract&quot; or &quot;account stated.&quot;</p>
          <p>Think about: Was there a written agreement? Did they promise to pay? Did they acknowledge the debt?</p>
        </div>
      )
    case 'landlord_tenant':
      return (
        <div className="space-y-2">
          <p><strong>For landlord-tenant disputes:</strong> The legal basis could be breach of lease, failure to return deposit, or violation of the Texas Property Code.</p>
          <p>Think about: What specific lease term or law was violated? Did you follow the proper notice requirements?</p>
        </div>
      )
    case 'personal_injury':
      return (
        <div className="space-y-2">
          <p><strong>For personal injury:</strong> The legal basis is usually &quot;negligence&quot; &mdash; the other person had a duty of care and failed to meet it.</p>
          <p>Think about: What should the other person have done differently? How did their carelessness cause your injury?</p>
        </div>
      )
    case 'contract':
      return (
        <div className="space-y-2">
          <p><strong>For contract disputes:</strong> The legal basis is &quot;breach of contract.&quot;</p>
          <p>Think about: What specific promise did they break? Was the contract written or verbal? What were the key terms?</p>
        </div>
      )
    case 'property':
      return (
        <div className="space-y-2">
          <p><strong>For property disputes:</strong> The legal basis could be trespass, nuisance, or boundary dispute.</p>
          <p>Think about: What right to the property do you have? How is the other person interfering with it?</p>
        </div>
      )
    default:
      return (
        <div className="space-y-2">
          <p>Think about what rule, law, or agreement the other person broke.</p>
          <p>Common legal bases include: breach of contract, negligence, fraud, unjust enrichment, or violation of a specific statute.</p>
        </div>
      )
  }
}

function getPlaceholder(disputeType: string | null): string {
  switch (disputeType) {
    case 'debt_collection':
      return 'e.g. The defendant breached our written agreement by failing to repay the $3,000 loan by the agreed date of June 1, 2024...'
    case 'landlord_tenant':
      return 'e.g. The landlord violated Texas Property Code Section 92.104 by failing to return my security deposit within 30 days of move-out...'
    case 'personal_injury':
      return 'e.g. The defendant was negligent in operating their vehicle by texting while driving, which directly caused the collision and my injuries...'
    case 'contract':
      return 'e.g. The defendant breached our written contract by abandoning the kitchen remodel halfway through, despite receiving $10,000 in advance payment...'
    case 'property':
      return 'e.g. The defendant is trespassing on my property by building a fence that extends 3 feet past the property line, as confirmed by a licensed surveyor...'
    default:
      return 'Describe why what happened was wrong. What rule, agreement, or duty did the other person break?'
  }
}

export function ClaimsStep({
  disputeType,
  claimDetails,
  onClaimDetailsChange,
}: ClaimsStepProps) {
  return (
    <div className="space-y-6">
      {/* Context card */}
      <div className="rounded-lg border border-calm-indigo/20 bg-calm-indigo/5 p-4">
        <div className="flex items-start gap-3">
          <Scale className="h-5 w-5 text-calm-indigo shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-warm-text">
              Why it was wrong, not just what happened
            </p>
            <p className="text-sm text-warm-muted mt-1">
              The court needs to know not just what happened, but why it was wrong. Think:
              what rule, agreement, or duty did the other person break?
            </p>
          </div>
        </div>
      </div>

      {/* Claim details */}
      <div>
        <Label htmlFor="claim-details" className="text-sm font-medium text-warm-text">
          What rule or agreement did they break?
        </Label>
        <HelpTooltip label="Help me figure this out">
          {getDisputeExplanation(disputeType)}
        </HelpTooltip>
        <textarea
          id="claim-details"
          value={claimDetails}
          onChange={(e) => onClaimDetailsChange(e.target.value)}
          placeholder={getPlaceholder(disputeType)}
          className="mt-2 w-full rounded-md border border-warm-border bg-white px-3 py-2 text-sm text-warm-text placeholder:text-warm-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
          style={{ minHeight: '120px' }}
          rows={5}
        />
        <p className="text-xs text-warm-muted mt-1.5">
          Don&apos;t worry if you&apos;re not sure about the exact legal terms. Describe
          it in plain language and we&apos;ll help frame it properly.
        </p>
      </div>
    </div>
  )
}
