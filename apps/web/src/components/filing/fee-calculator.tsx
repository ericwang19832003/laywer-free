'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Calculator, DollarSign, Info } from 'lucide-react'

interface FeeBreakdown {
  item: string
  amount: number
}

interface CourtFees {
  filing: number
  digitalFiling: number
  serviceOfProcess: number
  copyFee: number
  citation: number
}

const STATE_FEES: Record<string, Record<string, CourtFees>> = {
  TX: {
    JP: { filing: 46, digitalFiling: 5, serviceOfProcess: 75, copyFee: 1, citation: 0 },
    COUNTY: { filing: 100, digitalFiling: 5, serviceOfProcess: 75, copyFee: 1, citation: 0 },
    DISTRICT: { filing: 300, digitalFiling: 5, serviceOfProcess: 75, copyFee: 1, citation: 0 },
    FEDERAL: { filing: 405, digitalFiling: 0, serviceOfProcess: 75, copyFee: 1, citation: 0 },
  },
  CA: {
    SUPERIOR: { filing: 435, digitalFiling: 0, serviceOfProcess: 40, copyFee: 0.5, citation: 0 },
    SMALL_CLAIMS: { filing: 30, digitalFiling: 0, serviceOfProcess: 40, copyFee: 0.5, citation: 0 },
  },
  NY: {
    SUPREME: { filing: 210, digitalFiling: 5, serviceOfProcess: 45, copyFee: 0.65, citation: 0 },
    COUNTY: { filing: 205, digitalFiling: 5, serviceOfProcess: 45, copyFee: 0.65, citation: 0 },
    CITY: { filing: 45, digitalFiling: 5, serviceOfProcess: 45, copyFee: 0.65, citation: 0 },
  },
  FL: {
    CIRCUIT: { filing: 401, digitalFiling: 0, serviceOfProcess: 40, copyFee: 1, citation: 0 },
    COUNTY: { filing: 255, digitalFiling: 0, serviceOfProcess: 40, copyFee: 1, citation: 0 },
    SMALL_CLAIMS: { filing: 50, digitalFiling: 0, serviceOfProcess: 40, copyFee: 1, citation: 0 },
  },
}

const COURT_TYPE_LABELS: Record<string, string> = {
  JP: 'Justice of the Peace',
  COUNTY: 'County Court',
  DISTRICT: 'District Court',
  FEDERAL: 'Federal Court',
  SUPERIOR: 'Superior Court',
  SMALL_CLAIMS: 'Small Claims Court',
  SUPREME: 'Supreme Court',
  CITY: 'City Court',
  CIRCUIT: 'Circuit Court',
}

interface FeeCalculatorProps {
  courtType: string
  county: string
  state?: string
  copies?: number
  className?: string
}

export function FeeCalculator({
  courtType,
  county,
  state = 'TX',
  copies = 3,
  className,
}: FeeCalculatorProps) {
  const [includeService, setIncludeService] = useState(true)
  const [includeCopies, setIncludeCopies] = useState(true)

  const stateFees = STATE_FEES[state] || STATE_FEES.TX
  const courtFees = stateFees[courtType] || stateFees[Object.keys(stateFees)[0]]

  const breakdown: FeeBreakdown[] = [
    { item: 'Petition filing fee', amount: courtFees.filing },
    ...(courtFees.digitalFiling > 0 ? [{ item: 'Digital filing surcharge', amount: courtFees.digitalFiling }] : []),
    ...(includeService ? [{ item: 'Service of process (est.)', amount: courtFees.serviceOfProcess }] : []),
    ...(includeCopies ? [{ item: `Certified copies (${copies})`, amount: courtFees.copyFee * copies }] : []),
  ]

  const total = breakdown.reduce((sum, item) => sum + item.amount, 0)

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Calculator className="h-4 w-4 text-calm-indigo" />
          Estimated Filing Costs
        </CardTitle>
        {county && (
          <p className="text-sm text-warm-muted">
            {county} County, {COURT_TYPE_LABELS[courtType] || courtType}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Breakdown */}
        <div className="space-y-2">
          {breakdown.map((item) => (
            <div key={item.item} className="flex justify-between text-sm">
              <span className="text-warm-muted">{item.item}</span>
              <span className="font-medium text-warm-text">
                ${item.amount.toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-warm-border pt-2">
          <div className="flex justify-between">
            <span className="font-semibold text-warm-text">Total Estimate</span>
            <span className="font-bold text-lg text-warm-text">
              ${total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Options */}
        <div className="space-y-2 pt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeService}
              onChange={(e) => setIncludeService(e.target.checked)}
              className="rounded border-warm-border text-calm-indigo focus:ring-calm-indigo"
            />
            <span className="text-sm text-warm-text">Include service of process</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeCopies}
              onChange={(e) => setIncludeCopies(e.target.checked)}
              className="rounded border-warm-border text-calm-indigo focus:ring-calm-indigo"
            />
            <span className="text-sm text-warm-text">Include certified copies</span>
          </label>
        </div>

        {/* Fee Waiver Info */}
        <div className="bg-calm-indigo/5 rounded-lg p-3 mt-4">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-calm-indigo shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm text-warm-text">
                <strong>Can&apos;t afford the fees?</strong>
              </p>
              <p className="text-xs text-warm-muted">
                Most courts offer fee waivers for those who qualify based on income. 
                Ask the court clerk about an &quot;Affidavit of Indigency&quot; form.
              </p>
            </div>
          </div>
        </div>

        <p className="text-xs text-warm-muted text-center pt-2">
          Fees are estimates and may vary. Confirm with your court.
        </p>
      </CardContent>
    </Card>
  )
}

interface FilingMethodOptionProps {
  method: 'online' | 'in_person' | 'mail'
  selected: boolean
  onSelect: () => void
  feeBreakdown?: FeeBreakdown[]
  totalFee?: number
}

export function FilingMethodOption({
  method,
  selected,
  onSelect,
  feeBreakdown,
  totalFee,
}: FilingMethodOptionProps) {
  const methodInfo = {
    online: {
      title: 'File Online (e-File)',
      description: 'Submit through the court\'s online system',
      icon: DollarSign,
    },
    in_person: {
      title: 'File in Person',
      description: 'Visit the courthouse and file at the clerk\'s window',
      icon: DollarSign,
    },
    mail: {
      title: 'File by Mail',
      description: 'Send documents to the court by certified mail',
      icon: DollarSign,
    },
  }

  const info = methodInfo[method]

  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full text-left p-4 rounded-lg border-2 transition-all',
        selected
          ? 'border-calm-indigo bg-calm-indigo/5'
          : 'border-warm-border hover:border-calm-indigo/50'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="font-medium text-warm-text">{info.title}</p>
          <p className="text-sm text-warm-muted">{info.description}</p>
          {feeBreakdown && (
            <div className="mt-2 space-y-0.5">
              {feeBreakdown.map((item) => (
                <p key={item.item} className="text-xs text-warm-muted">
                  {item.item}: ${item.amount.toFixed(2)}
                </p>
              ))}
            </div>
          )}
        </div>
        {totalFee !== undefined && (
          <div className="text-right">
            <p className="text-lg font-bold text-warm-text">${totalFee.toFixed(0)}</p>
            <p className="text-xs text-warm-muted">est.</p>
          </div>
        )}
      </div>
    </button>
  )
}
