'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const CONTRACT_TYPE_LABELS: Record<string, string> = {
  breach_of_contract: 'Breach of Contract',
  non_payment: 'Non-Payment',
  fraud_misrepresentation: 'Fraud / Misrepresentation',
  warranty: 'Warranty Dispute',
  employment: 'Employment Contract',
  construction: 'Construction Contract',
  other_contract: 'Other Contract Dispute',
}

export { CONTRACT_TYPE_LABELS }

interface IntakeStepProps {
  contractSubType: string
  onContractSubTypeChange: (v: string) => void
  otherPartyName: string
  onOtherPartyNameChange: (v: string) => void
  otherPartyType: string
  onOtherPartyTypeChange: (v: string) => void
  contractDate: string
  onContractDateChange: (v: string) => void
  breachDate: string
  onBreachDateChange: (v: string) => void
}

export function IntakeStep({
  contractSubType, onContractSubTypeChange,
  otherPartyName, onOtherPartyNameChange,
  otherPartyType, onOtherPartyTypeChange,
  contractDate, onContractDateChange,
  breachDate, onBreachDateChange,
}: IntakeStepProps) {
  return (
    <div className="space-y-5">
      <p className="text-sm text-warm-muted">
        Let&apos;s start with the basics. Take your time &mdash; you can always come back and update this later.
      </p>

      <div className="space-y-2">
        <Label>What type of contract is this about?</Label>
        <div className="grid gap-2">
          {Object.entries(CONTRACT_TYPE_LABELS).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => onContractSubTypeChange(value)}
              className={`rounded-lg border px-4 py-3 text-left transition-colors ${
                contractSubType === value
                  ? 'border-calm-indigo bg-calm-indigo/5'
                  : 'border-warm-border hover:border-warm-text/30'
              }`}
            >
              <p className={`text-sm font-medium ${contractSubType === value ? 'text-calm-indigo' : 'text-warm-text'}`}>
                {label}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="other-party-name">Who is the other party?</Label>
        <Input
          id="other-party-name"
          placeholder="Full legal name or business name"
          value={otherPartyName}
          onChange={(e) => onOtherPartyNameChange(e.target.value)}
        />
        <div className="flex gap-3 pt-1">
          {(['individual', 'business'] as const).map((t) => (
            <Button
              key={t}
              type="button"
              variant={otherPartyType === t ? 'default' : 'outline'}
              size="sm"
              onClick={() => onOtherPartyTypeChange(t)}
              className="flex-1"
            >
              {t === 'individual' ? 'Individual' : 'Business'}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="contract-date" className="text-xs">Contract Date</Label>
          <Input id="contract-date" type="date" value={contractDate} onChange={(e) => onContractDateChange(e.target.value)} />
          <p className="text-xs text-warm-muted">When was the contract signed or agreed to?</p>
        </div>
        <div className="space-y-1">
          <Label htmlFor="breach-date" className="text-xs">Breach Date</Label>
          <Input id="breach-date" type="date" value={breachDate} onChange={(e) => onBreachDateChange(e.target.value)} />
          <p className="text-xs text-warm-muted">When did the other party break the agreement?</p>
        </div>
      </div>
    </div>
  )
}
