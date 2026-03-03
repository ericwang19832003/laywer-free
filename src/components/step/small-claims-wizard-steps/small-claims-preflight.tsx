'use client'

import { Button } from '@/components/ui/button'
import { HelpTooltip } from '@/components/ui/help-tooltip'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2, Clock } from 'lucide-react'
import { useMemo, useState } from 'react'

interface SmallClaimsPreflightProps {
  claimSubType: string
  onReady: () => void
}

interface ChecklistItem {
  title: string
  helpText: string
  required?: boolean
}

function getChecklist(claimSubType: string): ChecklistItem[] {
  const common: ChecklistItem[] = [
    {
      title: 'Valid photo ID',
      helpText:
        'A government-issued photo ID such as a driver\'s license, state ID, passport, or military ID.',
      required: true,
    },
  ]

  switch (claimSubType) {
    case 'security_deposit':
      return [
        ...common,
        {
          title: 'Lease agreement',
          helpText:
            'Your signed lease or rental agreement showing the terms, deposit amount, and move-out conditions.',
        },
        {
          title: 'Move-in/move-out photos',
          helpText:
            'Photos documenting the condition of the property when you moved in and when you moved out. Timestamped photos are best.',
        },
        {
          title: 'Itemized deduction letter',
          helpText:
            'The letter from your landlord listing any deductions from your deposit. Texas law requires landlords to provide this within 30 days of move-out.',
        },
        {
          title: 'Communication records',
          helpText:
            'Emails, texts, or letters between you and your landlord about the deposit, move-out, or deductions.',
        },
      ]

    case 'breach_of_contract':
      return [
        ...common,
        {
          title: 'Copy of the contract',
          helpText:
            'The written contract or agreement that was breached. If it was a verbal agreement, write down the terms as you understood them.',
        },
        {
          title: 'Proof of payment',
          helpText:
            'Receipts, bank statements, canceled checks, or other proof of any payments you made under the contract.',
        },
        {
          title: 'Communications',
          helpText:
            'Emails, texts, or letters showing what was agreed to and any discussions about the breach.',
        },
        {
          title: 'Evidence of breach',
          helpText:
            'Documentation showing how the other party failed to fulfill their obligations under the contract.',
        },
      ]

    case 'consumer_refund':
      return [
        ...common,
        {
          title: 'Receipt or proof of purchase',
          helpText:
            'The receipt, invoice, order confirmation, or credit card statement showing your purchase.',
        },
        {
          title: 'Product or service documentation',
          helpText:
            'Warranties, product descriptions, service agreements, or advertisements showing what was promised.',
        },
        {
          title: 'Refund request records',
          helpText:
            'Documentation of your attempts to get a refund, including emails, return receipts, or complaint records.',
        },
      ]

    case 'property_damage':
      return [
        ...common,
        {
          title: 'Photos of damage',
          helpText:
            'Clear photos showing the damage to your property. Take photos from multiple angles and include close-ups.',
        },
        {
          title: 'Repair estimates (at least 2)',
          helpText:
            'Written estimates from qualified repair professionals. Having at least two estimates strengthens your case and shows the court a fair market value for repairs.',
        },
        {
          title: 'Incident documentation',
          helpText:
            'Police reports, incident reports, or witness statements documenting how the damage occurred.',
        },
      ]

    case 'car_accident':
      return [
        ...common,
        {
          title: 'Police report',
          helpText:
            'The official police report from the accident. You can request a copy from the responding agency if you don\'t have one.',
        },
        {
          title: 'Photos of damage',
          helpText:
            'Photos of damage to your vehicle, the other vehicle, and the accident scene. Include photos from the day of the accident if available.',
        },
        {
          title: 'Repair estimates',
          helpText:
            'Written estimates or invoices for vehicle repairs. Get at least two estimates if possible.',
        },
        {
          title: 'Insurance information',
          helpText:
            'Your insurance policy details, any claim numbers, and correspondence with insurance companies.',
        },
      ]

    case 'neighbor_dispute':
      return [
        ...common,
        {
          title: 'Photos or evidence',
          helpText:
            'Photos, videos, or other evidence documenting the issue (e.g., property damage, encroachment, nuisance conditions).',
        },
        {
          title: 'Communications',
          helpText:
            'Emails, texts, letters, or notes from conversations with your neighbor about the issue.',
        },
        {
          title: 'HOA records (if applicable)',
          helpText:
            'HOA rules, violation notices, complaint records, or correspondence related to the dispute.',
        },
      ]

    case 'unpaid_loan':
      return [
        ...common,
        {
          title: 'Loan agreement or promissory note',
          helpText:
            'The written loan agreement, promissory note, or any documentation of the loan terms. If the loan was verbal, write down the terms as agreed.',
        },
        {
          title: 'Payment records',
          helpText:
            'Bank statements, canceled checks, Venmo/Zelle receipts, or other proof of payments made and received.',
        },
        {
          title: 'Communications about repayment',
          helpText:
            'Emails, texts, or messages discussing repayment, promises to pay, or acknowledgment of the debt.',
        },
      ]

    case 'other':
    default:
      return [
        ...common,
        {
          title: 'Any relevant contracts or agreements',
          helpText:
            'Written contracts, agreements, receipts, or other documents related to your claim.',
        },
        {
          title: 'Communications',
          helpText:
            'Emails, texts, letters, or other communications with the other party related to the dispute.',
        },
        {
          title: 'Photos or evidence',
          helpText:
            'Photos, videos, or documents that support your version of events.',
        },
        {
          title: 'Financial records',
          helpText:
            'Receipts, invoices, bank statements, or other records showing the financial impact.',
        },
      ]
  }
}

function getSubTypeGuidance(claimSubType: string): string {
  switch (claimSubType) {
    case 'security_deposit':
      return 'Under Texas Property Code Section 92.109, landlords must return security deposits within 30 days of move-out or provide an itemized list of deductions. You can sue for up to 3x the deposit if the landlord acted in bad faith.'
    case 'breach_of_contract':
      return 'To win a breach of contract case, you need to show: (1) a valid agreement existed, (2) you held up your end, (3) the other party broke the agreement, and (4) you suffered damages as a result.'
    case 'consumer_refund':
      return 'The Texas Deceptive Trade Practices Act (DTPA) protects consumers. If a business engaged in false, misleading, or deceptive acts, you may be entitled to up to 3x your actual damages.'
    case 'property_damage':
      return 'Document everything thoroughly. The more repair estimates you have, the stronger your case. Photos with timestamps are especially helpful.'
    case 'car_accident':
      return 'Texas follows a "modified comparative fault" rule. You can recover damages as long as you are less than 51% at fault for the accident.'
    case 'neighbor_dispute':
      return 'Before filing, check if your HOA has a dispute resolution process. Many courts require you to show you attempted to resolve the issue before suing.'
    case 'unpaid_loan':
      return 'Even verbal loans are enforceable in Texas. Text messages, emails, or witnesses acknowledging the debt can serve as evidence of the agreement.'
    case 'other':
    default:
      return 'Gather all documents, photos, and communications related to your dispute. The more organized your evidence, the stronger your case will be.'
  }
}

export function SmallClaimsPreflight({ claimSubType, onReady }: SmallClaimsPreflightProps) {
  const checklist = useMemo(() => getChecklist(claimSubType), [claimSubType])
  const [deferred, setDeferred] = useState<string[]>([])
  const guidance = getSubTypeGuidance(claimSubType)

  const requiredItems = checklist.filter((item) => item.required)
  const optionalItems = checklist.filter((item) => !item.required)

  function toggleDeferred(title: string) {
    setDeferred((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    )
  }

  return (
    <Card>
      <CardContent className="space-y-4">
        {/* Title */}
        <div>
          <h2 className="text-lg font-semibold text-warm-text">Before You Start</h2>
          <p className="text-sm text-warm-muted">
            Having these items ready will make this go much faster.
          </p>
        </div>

        {/* Time estimate */}
        <div className="flex items-center gap-1.5 text-xs text-warm-muted">
          <Clock className="h-3.5 w-3.5" />
          <span>This will take about 15-25 minutes</span>
        </div>

        {/* Sub-type specific guidance */}
        <div className="rounded-lg border border-calm-indigo/20 bg-calm-indigo/5 p-3 text-sm text-warm-text">
          {guidance}
        </div>

        {/* Checklist */}
        <div className="space-y-5">
          <div className="space-y-3">
            <p className="text-xs font-semibold text-warm-muted uppercase tracking-wide">
              Minimum required to start
            </p>
            {requiredItems.map((item) => (
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

          <div className="space-y-3">
            <p className="text-xs font-semibold text-warm-muted uppercase tracking-wide">
              Gather if you have them
            </p>
            {optionalItems.map((item) => {
              const isDeferred = deferred.includes(item.title)
              return (
                <div
                  key={item.title}
                  className="flex items-start gap-3 rounded-lg border border-warm-border p-4"
                >
                  <CheckCircle2 className="h-4 w-4 text-calm-indigo shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-warm-text">{item.title}</p>
                      <button
                        type="button"
                        onClick={() => toggleDeferred(item.title)}
                        className="text-xs text-calm-indigo hover:text-calm-indigo/80"
                      >
                        {isDeferred ? 'Saved for later' : 'Get later'}
                      </button>
                    </div>
                    <HelpTooltip label="What counts?">
                      <p>{item.helpText}</p>
                    </HelpTooltip>
                  </div>
                </div>
              )
            })}
          </div>

          {deferred.length > 0 && (
            <div className="rounded-lg border border-calm-indigo/20 bg-calm-indigo/5 p-3 text-xs text-warm-text">
              Saved for later: {deferred.length} item{deferred.length === 1 ? '' : 's'}. We&apos;ll add these to your checklist.
            </div>
          )}
        </div>

        {/* Tip */}
        <div className="rounded-lg bg-calm-indigo/5 border border-calm-indigo/20 p-3 text-xs text-warm-text">
          <strong>Tip:</strong> You don&apos;t need everything to start. You can save your progress
          and come back anytime.
        </div>

        {/* Ready button */}
        <Button className="w-full mt-4" onClick={onReady}>
          Ready? Let&apos;s Begin
        </Button>
      </CardContent>
    </Card>
  )
}
