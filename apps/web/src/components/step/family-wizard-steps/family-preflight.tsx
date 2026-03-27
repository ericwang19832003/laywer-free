'use client'

import { Button } from '@/components/ui/button'
import { HelpTooltip } from '@/components/ui/help-tooltip'
import { Card, CardContent } from '@/components/ui/card'
import {
  CheckCircle2,
  Clock,
} from 'lucide-react'
import { useMemo, useState } from 'react'

interface FamilyPreflightProps {
  familySubType: string
  onReady: () => void
}

interface ChecklistItem {
  title: string
  helpText: string
  required?: boolean
}

function getChecklist(familySubType: string): ChecklistItem[] {
  const items: ChecklistItem[] = []

  // All types need these
  items.push({
    title: 'Valid photo ID',
    helpText:
      'A government-issued photo ID such as a driver\'s license, state ID, passport, or military ID.',
    required: true,
  })
  items.push({
    title: 'Residency documentation',
    helpText:
      'Utility bills, lease agreements, or mail showing your current address and how long you\'ve lived in your county and state.',
    required: true,
  })

  // Divorce and spousal support need marriage certificate
  if (['divorce', 'spousal_support'].includes(familySubType)) {
    items.push({
      title: 'Marriage certificate',
      helpText:
        'An official copy of your marriage certificate. If you don\'t have one, you can request a copy from the county clerk where you were married or from the Texas Vital Statistics office.',
    })
  }

  // Custody, support, visitation need children's birth certificates
  if (['divorce', 'custody', 'child_support', 'visitation', 'modification'].includes(familySubType)) {
    items.push({
      title: 'Children\'s birth certificates',
      helpText:
        'Official birth certificates for each child involved. You\'ll need the child\'s full legal name, date of birth, and parentage information.',
    })
  }

  // Support needs income documentation
  if (['child_support', 'spousal_support', 'modification'].includes(familySubType)) {
    items.push({
      title: 'Income documentation',
      helpText:
        'Recent pay stubs (last 3 months), most recent tax returns (last 2 years), W-2s, and any documentation of other income sources like rental income or self-employment.',
    })
  }

  // Modification needs existing court orders
  if (familySubType === 'modification') {
    items.push({
      title: 'Copy of existing court orders',
      helpText:
        'The most recent court order you want to modify. This includes the cause number, court name, and the terms you\'re seeking to change.',
    })
  }

  // Protective order needs evidence
  if (familySubType === 'protective_order') {
    items.push({
      title: 'Evidence of violence or threats',
      helpText:
        'Photos of injuries, police reports, medical records, threatening text messages or emails, witness statements, and any prior protective orders. Gather what you can safely access — you don\'t need everything to get started.',
    })
  }

  // Divorce needs property/financial records
  if (familySubType === 'divorce') {
    items.push({
      title: 'Property and financial records',
      helpText:
        'Bank statements, mortgage documents, vehicle titles, retirement account statements, credit card statements, and any prenuptial agreements. List major assets and debts.',
    })
  }

  return items
}

export function FamilyPreflight({ familySubType, onReady }: FamilyPreflightProps) {
  const checklist = useMemo(() => getChecklist(familySubType), [familySubType])
  const [deferred, setDeferred] = useState<string[]>([])

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
          <span>This will take about 20-30 minutes</span>
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
              Nice to have
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
