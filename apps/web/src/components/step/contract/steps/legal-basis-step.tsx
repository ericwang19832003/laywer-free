'use client'

import { Scale, ShieldCheck } from 'lucide-react'

export const CAUSE_OF_ACTION_OPTIONS = [
  {
    id: 'breach_of_contract',
    label: 'Breach of Contract',
    description: 'The other party did not fulfill their contractual obligations.',
  },
  {
    id: 'breach_of_warranty',
    label: 'Breach of Warranty',
    description: 'A product or service did not meet the warranties provided.',
  },
  {
    id: 'unjust_enrichment',
    label: 'Unjust Enrichment',
    description: 'The other party was enriched at your expense without a valid contract.',
  },
  {
    id: 'fraud',
    label: 'Fraud / Misrepresentation',
    description: 'The other party made false statements to induce the contract.',
  },
]

interface LegalBasisStepProps {
  causesOfAction: string[]
  onToggleCause: (id: string) => void
}

export function LegalBasisStep({ causesOfAction, onToggleCause }: LegalBasisStepProps) {
  return (
    <div className="space-y-5">
      <p className="text-sm text-warm-muted">
        Select the legal theories that apply to your situation. You can choose more than one.
      </p>

      <div className="space-y-3">
        {CAUSE_OF_ACTION_OPTIONS.map(({ id, label, description }) => (
          <button
            key={id}
            type="button"
            onClick={() => onToggleCause(id)}
            className={`w-full rounded-lg border px-4 py-4 text-left transition-colors ${
              causesOfAction.includes(id)
                ? 'border-calm-indigo bg-calm-indigo/5 ring-1 ring-calm-indigo/20'
                : 'border-warm-border hover:border-warm-text/30'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-calm-indigo/10 flex items-center justify-center shrink-0 mt-0.5">
                <Scale className="h-4 w-4 text-calm-indigo" />
              </div>
              <div>
                <p className={`text-sm font-medium ${causesOfAction.includes(id) ? 'text-calm-indigo' : 'text-warm-text'}`}>
                  {label}
                </p>
                <p className="text-xs text-warm-muted mt-0.5">{description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-calm-indigo/10 bg-calm-indigo/[0.03] p-3">
        <div className="flex gap-2">
          <ShieldCheck className="h-4 w-4 text-calm-indigo shrink-0 mt-0.5" />
          <p className="text-xs text-warm-muted">
            Not sure which to pick? &quot;Breach of Contract&quot; is the most common basis and applies to most situations where the other party didn&apos;t hold up their end.
          </p>
        </div>
      </div>
    </div>
  )
}
