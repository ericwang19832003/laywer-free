'use client'

import { Card, CardContent } from '@/components/ui/card'
import { ExpandableSection } from '@/components/ui/expandable-section'
import { CheckCircle2, Clock } from 'lucide-react'
import { HelpTooltip } from '@/components/ui/help-tooltip'

interface DebtPreflightProps {
  debtSubType: string
}

interface ChecklistItem {
  title: string
  helpText: string
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    title: 'Court papers / summons',
    helpText:
      'The official court documents you received notifying you of the lawsuit. These contain the case number, court information, and your deadline to respond.',
  },
  {
    title: 'Any correspondence from the creditor or collector',
    helpText:
      'Letters, emails, or notices you received from the original creditor, debt buyer, or their attorneys. These may include validation notices, settlement offers, or collection letters.',
  },
  {
    title: 'Payment records',
    helpText:
      'Bank statements, receipts, or records showing any payments you made on this debt. These help establish your last payment date, which is critical for statute of limitations calculations.',
  },
  {
    title: 'Account statements',
    helpText:
      'Original account statements from the creditor showing the account balance, charges, and transaction history. These help verify whether the amount claimed is accurate.',
  },
]

export function DebtPreflight({ debtSubType }: DebtPreflightProps) {
  void debtSubType

  return (
    <Card>
      <CardContent className="space-y-4">
        {/* Header */}
        <div>
          <h2 className="text-lg font-semibold text-warm-text">
            You&apos;ve been sued for a debt. Here&apos;s what we&apos;ll help you do.
          </h2>
          <p className="text-sm text-warm-muted">
            Having these items ready will make this go much faster.
          </p>
        </div>

        {/* Time estimate */}
        <div className="flex items-center gap-1.5 text-xs text-warm-muted">
          <Clock className="h-3.5 w-3.5" />
          <span>This will take about 15-25 minutes</span>
        </div>

        {/* Context card */}
        <div className="rounded-lg border border-calm-indigo/20 bg-calm-indigo/5 p-3 text-sm text-warm-text">
          This wizard will walk you through building your court answer &mdash; the formal
          response you file to fight the lawsuit. We&apos;ll help you identify your strongest
          defenses, draft a validation letter if needed, and generate the documents you need
          to file with the court.
        </div>

        {/* Expandable educational sections */}
        <div className="space-y-2">
          <ExpandableSection title="Your rights under the FDCPA">
            <div className="space-y-2">
              <p>
                The Fair Debt Collection Practices Act (FDCPA) protects consumers from unfair
                debt collection. Key protections include:
              </p>
              <ul className="list-disc pl-4 space-y-1">
                <li>You have a 30-day right to request validation of the debt.</li>
                <li>Collectors cannot harass or threaten you.</li>
                <li>You can dispute the debt in writing.</li>
              </ul>
            </div>
          </ExpandableSection>

          <ExpandableSection title="What is a debt validation letter?">
            <p>
              A debt validation letter is a formal letter requiring the collector to prove
              they own the debt and that the amount is correct. If you send one within 30
              days of their first contact, the collector must stop collection efforts until
              they provide verification. We&apos;ll help you draft one before your answer if
              appropriate.
            </p>
          </ExpandableSection>

          <ExpandableSection title="General Denial vs. Specific Answer">
            <div className="space-y-2">
              <p>
                <strong className="text-warm-text">General Denial:</strong> Denies everything
                in the plaintiff&apos;s petition in one statement. This is simpler and
                recommended for most debt cases. It puts the burden on the creditor to prove
                every element of their claim.
              </p>
              <p>
                <strong className="text-warm-text">Specific Answer:</strong> Responds to each
                allegation individually (admit, deny, or lack knowledge). More detailed and
                time-consuming, but can include counterclaims if you have grounds.
              </p>
            </div>
          </ExpandableSection>
        </div>

        {/* Checklist */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-warm-muted uppercase tracking-wide">
            Gather these items if you have them
          </p>
          {CHECKLIST_ITEMS.map((item) => (
            <div
              key={item.title}
              className="flex items-start gap-3 rounded-lg border border-warm-border p-4"
            >
              <CheckCircle2 className="h-4 w-4 text-calm-indigo shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-warm-text">{item.title}</p>
                <HelpTooltip label="What counts?">
                  <p>{item.helpText}</p>
                </HelpTooltip>
              </div>
            </div>
          ))}
        </div>

        {/* Tip */}
        <div className="rounded-lg bg-calm-indigo/5 border border-calm-indigo/20 p-3 text-xs text-warm-text">
          <strong>Tip:</strong> You don&apos;t need everything to start. You can save your
          progress and come back anytime.
        </div>
      </CardContent>
    </Card>
  )
}
