'use client'

import { Button } from '@/components/ui/button'
import { HelpTooltip } from '@/components/ui/help-tooltip'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2, Clock } from 'lucide-react'
import { useMemo, useState } from 'react'

interface LtPreflightProps {
  subType: string
  partyRole: string
  onReady: () => void
}

interface ChecklistItem {
  title: string
  helpText: string
  required?: boolean
}

function getChecklist(subType: string, partyRole: string): ChecklistItem[] {
  const common: ChecklistItem[] = [
    {
      title: 'Valid photo ID',
      helpText:
        'A government-issued photo ID such as a driver\'s license, state ID, passport, or military ID.',
      required: true,
    },
  ]

  switch (subType) {
    case 'eviction':
      if (partyRole === 'landlord') {
        return [
          ...common,
          {
            title: 'Lease agreement',
            helpText:
              'Your signed lease or rental agreement showing the terms, rent amount, and lease period.',
          },
          {
            title: 'Notice to vacate',
            helpText:
              'A copy of the notice to vacate you served to the tenant. Texas law requires written notice before filing an eviction (Tex. Prop. Code § 24.005).',
          },
          {
            title: 'Rent ledger',
            helpText:
              'A record of rent payments showing dates paid, amounts, and any outstanding balances.',
          },
          {
            title: 'Photos of property condition',
            helpText:
              'Photos documenting the current condition of the property, any damage, or lease violations.',
          },
        ]
      } else {
        return [
          ...common,
          {
            title: 'Lease agreement',
            helpText:
              'Your signed lease or rental agreement. If you have an oral lease, write down the terms as you understand them.',
          },
          {
            title: 'Notice received',
            helpText:
              'A copy of any notice to vacate or eviction notice you received from your landlord.',
          },
          {
            title: 'Payment records',
            helpText:
              'Bank statements, canceled checks, receipts, or money order stubs showing your rent payments.',
          },
          {
            title: 'Photos of property condition',
            helpText:
              'Photos showing the condition of the property to counter any damage claims.',
          },
        ]
      }

    case 'security_deposit':
      return [
        ...common,
        {
          title: 'Lease agreement',
          helpText:
            'Your signed lease or rental agreement showing the deposit amount and move-out conditions.',
        },
        {
          title: 'Deposit receipt',
          helpText:
            'Receipt or proof of your security deposit payment. Bank statements or canceled checks work too.',
        },
        {
          title: 'Move-in/move-out inspection reports',
          helpText:
            'Any inspection checklists or reports from when you moved in and out. These are critical for disputing deductions.',
        },
        {
          title: 'Deduction letter',
          helpText:
            'The itemized deduction letter from the landlord. Under Tex. Prop. Code § 92.104, landlords must provide this within 30 days of move-out.',
        },
        {
          title: 'Photos of property condition',
          helpText:
            'Photos documenting the condition at move-in and move-out. Timestamped photos are best.',
        },
      ]

    case 'repair':
      return [
        ...common,
        {
          title: 'Lease agreement',
          helpText:
            'Your signed lease or rental agreement showing maintenance responsibilities.',
        },
        {
          title: 'Repair request records',
          helpText:
            'Copies of written repair requests you sent to the landlord, including dates and methods of delivery.',
        },
        {
          title: 'Photos of issues',
          helpText:
            'Clear photos showing the repair issues from multiple angles. Include timestamps if possible.',
        },
        {
          title: 'Contractor estimates',
          helpText:
            'Written estimates from qualified contractors showing the cost to fix the issues.',
        },
      ]

    case 'habitability':
      return [
        ...common,
        {
          title: 'Lease agreement',
          helpText:
            'Your signed lease or rental agreement.',
        },
        {
          title: 'Photos of conditions',
          helpText:
            'Clear photos documenting the habitability issues (mold, pests, plumbing failures, structural problems, etc.).',
        },
        {
          title: 'Health/safety reports',
          helpText:
            'Any reports from health inspectors, code enforcement, or other agencies documenting the conditions.',
        },
        {
          title: 'Repair request records',
          helpText:
            'Written requests to the landlord asking for repairs, showing dates and delivery method.',
        },
      ]

    case 'property_damage':
      return [
        ...common,
        {
          title: 'Lease agreement',
          helpText:
            'Your signed lease or rental agreement.',
        },
        {
          title: 'Photos of damage',
          helpText:
            'Clear photos showing the property damage from multiple angles.',
        },
        {
          title: 'Repair estimates',
          helpText:
            'Written estimates from qualified professionals showing the cost to repair the damage.',
        },
        {
          title: 'Incident documentation',
          helpText:
            'Any documentation of how the damage occurred, including communications, police reports, or witness statements.',
        },
      ]

    case 'nonpayment':
      return [
        ...common,
        {
          title: 'Lease agreement',
          helpText:
            'Your signed lease or rental agreement showing the rent amount and payment terms.',
        },
        {
          title: 'Rent ledger',
          helpText:
            'A detailed record of all rent payments, showing dates, amounts, and outstanding balances.',
        },
        {
          title: 'Payment records',
          helpText:
            'Bank statements, receipts, or other records showing payments received.',
        },
        {
          title: 'Notices sent',
          helpText:
            'Copies of any late payment notices, pay-or-quit notices, or other written demands for rent.',
        },
      ]

    case 'lease_termination':
      return [
        ...common,
        {
          title: 'Lease agreement',
          helpText:
            'Your signed lease or rental agreement showing the lease term and termination provisions.',
        },
        {
          title: 'Notices',
          helpText:
            'Any notices of termination, non-renewal, or intent to vacate exchanged between the parties.',
        },
        {
          title: 'Communications',
          helpText:
            'Emails, texts, or letters between you and the other party about the lease termination.',
        },
      ]

    default:
      return [
        ...common,
        {
          title: 'Lease agreement',
          helpText:
            'Your signed lease or rental agreement.',
        },
        {
          title: 'Communications',
          helpText:
            'Emails, texts, or letters between you and the other party related to the dispute.',
        },
        {
          title: 'Photos or evidence',
          helpText:
            'Photos, videos, or documents that support your version of events.',
        },
      ]
  }
}

function getSubTypeGuidance(subType: string, partyRole: string): string {
  switch (subType) {
    case 'eviction':
      if (partyRole === 'landlord') {
        return 'Under Texas Property Code § 24.005, a landlord must give written notice to vacate before filing an eviction suit. The notice must be at least 3 days unless the lease specifies a different period. Proper notice is critical — without it, the court may dismiss your case.'
      }
      return 'As a tenant facing eviction, you have rights under Texas law. If you were not given proper written notice (Tex. Prop. Code § 24.005), you may have a defense. Document everything and keep records of all payments made.'
    case 'security_deposit':
      return 'Under Texas Property Code § 92.104, landlords must return security deposits within 30 days of move-out or provide an itemized list of deductions. You can sue for up to 3x the deposit plus $100 in statutory damages if the landlord acted in bad faith.'
    case 'repair':
      return 'Under Texas Property Code § 92.0563, tenants can pursue remedies when landlords fail to make necessary repairs after proper notice. Document every repair request in writing and keep copies.'
    case 'habitability':
      return 'Texas law requires landlords to maintain rental properties in a habitable condition. Under Tex. Prop. Code § 92.052, landlords must make a diligent effort to repair conditions that materially affect the health or safety of an ordinary tenant.'
    case 'property_damage':
      return 'Document all damage thoroughly with photos and get multiple repair estimates. The party responsible for the damage is generally liable for the cost of repairs or the diminished value of the property.'
    case 'nonpayment':
      return 'Texas law allows landlords to pursue unpaid rent through the courts. Keep detailed records of all rent owed, payments received, and notices sent. A clear rent ledger is your most important piece of evidence.'
    case 'lease_termination':
      return 'Lease termination disputes often hinge on the specific terms of the lease agreement and whether proper notice was given. Review your lease carefully for early termination provisions, notice requirements, and penalty clauses.'
    default:
      return 'Gather all documents, photos, and communications related to your landlord-tenant dispute. The more organized your evidence, the stronger your case will be.'
  }
}

export function LtPreflight({ subType, partyRole, onReady }: LtPreflightProps) {
  const checklist = useMemo(() => getChecklist(subType, partyRole), [subType, partyRole])
  const [deferred, setDeferred] = useState<string[]>([])
  const guidance = getSubTypeGuidance(subType, partyRole)

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
            {optionalItems.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setDeferred(optionalItems.map((item) => item.title))}
                  className="rounded-full bg-white px-2.5 py-0.5 text-xs text-warm-text border border-warm-border transition hover:border-calm-indigo/40 hover:bg-calm-indigo/10"
                >
                  Get all later
                </button>
                {deferred.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setDeferred([])}
                    className="rounded-full bg-white px-2.5 py-0.5 text-xs text-warm-text border border-warm-border transition hover:border-calm-indigo/40 hover:bg-calm-indigo/10"
                  >
                    Clear later list
                  </button>
                )}
              </div>
            )}
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
