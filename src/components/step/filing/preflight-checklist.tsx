'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { HelpTooltip } from '@/components/ui/help-tooltip'
import {
  FileText,
  User,
  FileSearch,
  DollarSign,
  Clock,
} from 'lucide-react'

interface PreflightChecklistProps {
  disputeType: string | null
  onReady: () => void
}

function getDocumentHint(disputeType: string | null): string {
  switch (disputeType) {
    case 'debt_collection':
      return 'Have the original agreement, payment records, and demand letters'
    case 'landlord_tenant':
      return 'Have your lease agreement, photos of damage, and communication records'
    case 'personal_injury':
      return 'Have medical records, bills, photos of injuries, and incident reports'
    case 'contract':
      return 'Have the contract, evidence of breach, and records of damages'
    case 'property':
      return 'Have property records, appraisals, and photos'
    case 'family':
      return 'Have relevant court orders, financial records, and documentation'
    default:
      return 'Gather all relevant documents and records'
  }
}

export function PreflightChecklist({ disputeType, onReady }: PreflightChecklistProps) {
  const documentHint = getDocumentHint(disputeType)

  return (
    <Card>
      <CardContent className="space-y-4">
        {/* Title area */}
        <div>
          <h2 className="text-lg font-semibold text-warm-text">Before You Start</h2>
          <p className="text-sm text-warm-muted">
            Having these items ready will make this go much faster.
          </p>
        </div>

        {/* Time estimate */}
        <div className="flex items-center gap-1.5 text-xs text-warm-muted">
          <Clock className="h-3.5 w-3.5" />
          <span>This will take about 15-20 minutes</span>
        </div>

        {/* Checklist items */}
        <div className="space-y-3">
          {/* 1. Personal information */}
          <div className="flex items-start gap-3 rounded-lg border border-warm-border p-4">
            <User className="h-5 w-5 text-calm-indigo shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-warm-text">Your personal information</p>
              <p className="text-xs text-warm-muted mt-0.5">
                Full legal name and current mailing address
              </p>
              <HelpTooltip label="Why does the court need my address?">
                <p>
                  The court uses your address to send you notices about your case. Use the address
                  where you actually receive mail.
                </p>
              </HelpTooltip>
            </div>
          </div>

          {/* 2. Other party's information */}
          <div className="flex items-start gap-3 rounded-lg border border-warm-border p-4">
            <User className="h-5 w-5 text-calm-indigo shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-warm-text">The other party&apos;s information</p>
              <p className="text-xs text-warm-muted mt-0.5">
                Their full legal name and last known address
              </p>
              <HelpTooltip label="What if I don't know their address?">
                <p>
                  You&apos;ll need their address to &quot;serve&quot; them (deliver court papers). If you
                  don&apos;t know it, you may be able to use their workplace address or do some
                  research to find it.
                </p>
              </HelpTooltip>
            </div>
          </div>

          {/* 3. What happened */}
          <div className="flex items-start gap-3 rounded-lg border border-warm-border p-4">
            <FileSearch className="h-5 w-5 text-calm-indigo shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-warm-text">What happened</p>
              <p className="text-xs text-warm-muted mt-0.5">
                A description of the dispute — dates, amounts, and key events
              </p>
              <HelpTooltip label="How detailed should my description be?">
                <p>
                  Be specific but focus on facts. Include dates, dollar amounts, and what the other
                  person did (or failed to do). 3-5 sentences is a good starting point.
                </p>
              </HelpTooltip>
            </div>
          </div>

          {/* 4. Supporting documents */}
          <div className="flex items-start gap-3 rounded-lg border border-warm-border p-4">
            <FileText className="h-5 w-5 text-calm-indigo shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-warm-text">Supporting documents</p>
              <p className="text-xs text-warm-muted mt-0.5">
                Contracts, receipts, photos, emails, or text messages
              </p>
              <HelpTooltip variant="inline">
                <p>{documentHint}</p>
              </HelpTooltip>
            </div>
          </div>

          {/* 5. What you want the court to do */}
          <div className="flex items-start gap-3 rounded-lg border border-warm-border p-4">
            <DollarSign className="h-5 w-5 text-calm-indigo shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-warm-text">What you want the court to do</p>
              <p className="text-xs text-warm-muted mt-0.5">
                The dollar amount or other resolution you&apos;re seeking
              </p>
              <HelpTooltip label="How do I figure out the right amount?">
                <p>
                  Add up everything you lost: money owed, repair costs, medical bills, lost wages,
                  etc. If you&apos;re not sure, estimate high — you can always ask for less later,
                  but you can&apos;t ask for more.
                </p>
              </HelpTooltip>
            </div>
          </div>
        </div>

        {/* Tip box */}
        <div className="rounded-lg bg-calm-indigo/5 border border-calm-indigo/20 p-3 text-xs text-warm-text">
          <strong>Tip:</strong> You don&apos;t need everything to start. You can save your progress
          and come back anytime.
        </div>

        {/* Ready button */}
        <Button className="w-full mt-4" onClick={onReady}>
          I Have My Information Ready
        </Button>
      </CardContent>
    </Card>
  )
}
