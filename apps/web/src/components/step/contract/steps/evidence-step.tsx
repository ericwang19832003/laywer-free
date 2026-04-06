'use client'

import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { FileText } from 'lucide-react'

export const EVIDENCE_TYPES = [
  { id: 'contract_copy', label: 'Copy of the contract (written, email, or text)' },
  { id: 'communications', label: 'Emails, texts, or letters about the agreement' },
  { id: 'invoices', label: 'Invoices, receipts, or payment records' },
  { id: 'photos', label: 'Photos or videos of the work or product' },
  { id: 'demand_letter', label: 'Demand letter sent to the other party' },
  { id: 'estimates', label: 'Estimates or bids to fix or complete the work' },
  { id: 'witness', label: 'Witness statements or contact information' },
]

interface EvidenceStepProps {
  availableEvidence: string[]
  onToggleEvidence: (id: string) => void
  evidenceNotes: string
  onEvidenceNotesChange: (v: string) => void
}

export function EvidenceStep({
  availableEvidence, onToggleEvidence,
  evidenceNotes, onEvidenceNotesChange,
}: EvidenceStepProps) {
  return (
    <div className="space-y-5">
      <p className="text-sm text-warm-muted">
        Check off the documents and evidence you have available. Don&apos;t worry if you&apos;re missing some &mdash; you can gather more later.
      </p>

      <div className="space-y-3">
        {EVIDENCE_TYPES.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => onToggleEvidence(id)}
            className={`w-full flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors ${
              availableEvidence.includes(id)
                ? 'border-calm-indigo bg-calm-indigo/5'
                : 'border-warm-border hover:border-warm-text/30'
            }`}
          >
            <div className="h-8 w-8 rounded-full bg-calm-indigo/10 flex items-center justify-center shrink-0">
              <FileText className="h-4 w-4 text-calm-indigo" />
            </div>
            <span className={`text-sm ${availableEvidence.includes(id) ? 'text-calm-indigo font-medium' : 'text-warm-text'}`}>
              {label}
            </span>
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <Label htmlFor="evidence-notes">Anything else? (optional)</Label>
        <Textarea
          id="evidence-notes"
          placeholder="Describe any other evidence or documents you have..."
          rows={2}
          value={evidenceNotes}
          onChange={(e) => onEvidenceNotesChange(e.target.value)}
        />
      </div>

      <p className="text-xs text-warm-muted">
        You can update this anytime. Having more evidence strengthens your position.
      </p>
    </div>
  )
}
