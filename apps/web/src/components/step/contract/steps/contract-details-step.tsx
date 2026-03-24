'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { AlertTriangle } from 'lucide-react'

interface ContractDetailsStepProps {
  contractDescription: string
  onContractDescriptionChange: (v: string) => void
  keyTerms: string
  onKeyTermsChange: (v: string) => void
  whatWasPromised: string
  onWhatWasPromisedChange: (v: string) => void
  contractAmount: string
  onContractAmountChange: (v: string) => void
  hasWrittenContract: boolean
  onHasWrittenContractChange: (v: boolean) => void
}

export function ContractDetailsStep({
  contractDescription, onContractDescriptionChange,
  keyTerms, onKeyTermsChange,
  whatWasPromised, onWhatWasPromisedChange,
  contractAmount, onContractAmountChange,
  hasWrittenContract, onHasWrittenContractChange,
}: ContractDetailsStepProps) {
  return (
    <div className="space-y-5">
      <p className="text-sm text-warm-muted">
        Help us understand what the agreement was about. The more detail you provide, the stronger your petition will be.
      </p>

      <div className="space-y-2">
        <Label htmlFor="contract-description">Describe the contract</Label>
        <Textarea
          id="contract-description"
          placeholder="What was the overall purpose of this contract? For example: 'I hired a contractor to remodel my kitchen for $15,000.'"
          rows={3}
          value={contractDescription}
          onChange={(e) => onContractDescriptionChange(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="key-terms">Key terms of the agreement</Label>
        <Textarea
          id="key-terms"
          placeholder="What were the main obligations? Include deadlines, deliverables, and payment terms..."
          rows={3}
          value={keyTerms}
          onChange={(e) => onKeyTermsChange(e.target.value)}
        />
        <p className="text-xs text-warm-muted">
          What was each side supposed to do? Even if it was an oral agreement, describe the terms as best you remember.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="what-was-promised">What was promised to you?</Label>
        <Textarea
          id="what-was-promised"
          placeholder="What specific deliverables, services, or results were you supposed to receive?"
          rows={3}
          value={whatWasPromised}
          onChange={(e) => onWhatWasPromisedChange(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contract-amount">Contract Amount ($)</Label>
        <Input
          id="contract-amount"
          type="number"
          min="0"
          step="0.01"
          placeholder="0.00"
          value={contractAmount}
          onChange={(e) => onContractAmountChange(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-2 pt-1">
        <Checkbox
          id="written-contract"
          checked={hasWrittenContract}
          onCheckedChange={(c) => onHasWrittenContractChange(c === true)}
        />
        <Label htmlFor="written-contract" className="text-sm cursor-pointer">
          I have a written contract
        </Label>
      </div>

      {!hasWrittenContract && (
        <div className="rounded-lg border border-calm-amber bg-calm-amber/5 p-3">
          <div className="flex gap-2">
            <AlertTriangle className="h-4 w-4 text-calm-amber shrink-0 mt-0.5" />
            <p className="text-xs text-warm-muted">
              That&apos;s okay. Even oral contracts can be enforceable. Gather any evidence of the agreement: texts, emails, invoices, witnesses, or partial performance.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
