'use client'

import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import {
  AnnotatedDraftViewer,
  type DraftAnnotation,
} from '@/components/step/filing/annotated-draft-viewer'
import { CONTRACT_TYPE_LABELS } from './intake-step'
import { EVIDENCE_TYPES } from './evidence-step'
import { CAUSE_OF_ACTION_OPTIONS } from './legal-basis-step'
import { courtTypeLabel } from './filing-step'
import type { DamageLineItem } from './damages-step'

function ReviewSection({
  title,
  stepId,
  onEdit,
  children,
}: {
  title: string
  stepId: string
  onEdit: (stepId: string) => void
  children: React.ReactNode
}) {
  return (
    <div className="rounded-lg border border-warm-border p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-warm-text">{title}</h3>
        <button
          type="button"
          onClick={() => onEdit(stepId)}
          className="text-xs text-calm-indigo hover:text-calm-indigo/80 transition-colors"
        >
          Edit
        </button>
      </div>
      <div className="space-y-1 text-sm">{children}</div>
    </div>
  )
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-warm-muted">{label}</span>
      <span className="text-warm-text text-right max-w-[60%]">{value}</span>
    </div>
  )
}

function fmt$(n: number): string {
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

interface ReviewStepProps {
  /* Draft state */
  draftPhase: boolean
  draft: string
  annotations: DraftAnnotation[]
  onDraftChange: (v: string) => void
  onRegenerate: () => Promise<void>
  generating: boolean
  acknowledged: boolean
  onAcknowledgeChange: (v: boolean) => void
  confirming: boolean
  onFinalConfirm: () => Promise<void>
  genError: string | null
  onGenerateDraft: () => Promise<void>
  /* Review data */
  contractSubType: string
  otherPartyName: string
  otherPartyType: string
  contractDate: string
  breachDate: string
  contractAmount: string
  hasWrittenContract: boolean
  contractDescription: string
  whatWasPromised: string
  breachDescription: string
  discoveryDate: string
  priorDemandSent: boolean
  damageLineItems: DamageLineItem[]
  consequentialDamages: string
  costToCure: string
  grandTotal: number
  availableEvidence: string[]
  causesOfAction: string[]
  yourName: string
  county: string
  courtType: string
  filingMethod: string
  causeNumber: string
  onEdit: (stepId: string) => void
}

export function ReviewStep({
  draftPhase, draft, annotations, onDraftChange, onRegenerate,
  generating, acknowledged, onAcknowledgeChange,
  confirming, onFinalConfirm, genError, onGenerateDraft,
  contractSubType, otherPartyName, otherPartyType,
  contractDate, breachDate, contractAmount, hasWrittenContract,
  contractDescription, whatWasPromised,
  breachDescription, discoveryDate, priorDemandSent,
  damageLineItems, consequentialDamages, costToCure, grandTotal,
  availableEvidence, causesOfAction,
  yourName, county, courtType, filingMethod, causeNumber,
  onEdit,
}: ReviewStepProps) {
  if (draftPhase && draft) {
    return (
      <div className="space-y-4">
        <AnnotatedDraftViewer
          draft={draft}
          annotations={annotations}
          onDraftChange={onDraftChange}
          onRegenerate={onRegenerate}
          regenerating={generating}
          acknowledged={acknowledged}
          onAcknowledgeChange={onAcknowledgeChange}
          documentTitle="Your Contract Petition Draft"
        />

        {acknowledged && (
          <Button
            className="w-full h-11 text-base"
            onClick={onFinalConfirm}
            disabled={confirming}
          >
            {confirming ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              'Confirm & Complete'
            )}
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-warm-muted">
        Take a moment to review everything below. You can click &quot;Edit&quot; on any section to make changes.
      </p>

      <ReviewSection title="Contract Type & Parties" stepId="intake" onEdit={onEdit}>
        <ReviewRow label="Contract type" value={(CONTRACT_TYPE_LABELS[contractSubType] ?? contractSubType) || 'Not specified'} />
        <ReviewRow label="Other party" value={otherPartyName || 'Not provided'} />
        <ReviewRow label="Party type" value={otherPartyType === 'business' ? 'Business' : 'Individual'} />
        <ReviewRow label="Contract date" value={contractDate || 'Not provided'} />
        <ReviewRow label="Breach date" value={breachDate || 'Not provided'} />
      </ReviewSection>

      <ReviewSection title="Contract Details" stepId="contract_details" onEdit={onEdit}>
        <ReviewRow label="Contract amount" value={contractAmount ? fmt$(parseFloat(contractAmount)) : 'Not provided'} />
        <ReviewRow label="Written contract" value={hasWrittenContract ? 'Yes' : 'No'} />
        {contractDescription && <ReviewRow label="Description" value={contractDescription} />}
        {whatWasPromised && <ReviewRow label="What was promised" value={whatWasPromised} />}
      </ReviewSection>

      <ReviewSection title="The Breach" stepId="breach" onEdit={onEdit}>
        <ReviewRow label="Description" value={breachDescription || 'Not provided'} />
        {discoveryDate && <ReviewRow label="Discovered" value={discoveryDate} />}
        <ReviewRow label="Demand letter sent" value={priorDemandSent ? 'Yes' : 'No'} />
      </ReviewSection>

      <ReviewSection title="Damages" stepId="damages" onEdit={onEdit}>
        {damageLineItems.filter((i) => i.description || i.amount).map((item, idx) => (
          <ReviewRow key={idx} label={item.description || `Item ${idx + 1}`} value={fmt$(parseFloat(item.amount) || 0)} />
        ))}
        {(parseFloat(consequentialDamages) || 0) > 0 && (
          <ReviewRow label="Consequential damages" value={fmt$(parseFloat(consequentialDamages) || 0)} />
        )}
        {(parseFloat(costToCure) || 0) > 0 && (
          <ReviewRow label="Cost to fix" value={fmt$(parseFloat(costToCure) || 0)} />
        )}
        <div className="border-t border-warm-border pt-1 mt-1">
          <ReviewRow label="Grand total" value={fmt$(grandTotal)} />
        </div>
      </ReviewSection>

      <ReviewSection title="Evidence" stepId="evidence" onEdit={onEdit}>
        {availableEvidence.length > 0 ? (
          availableEvidence.map((id) => {
            const label = EVIDENCE_TYPES.find((e) => e.id === id)?.label ?? id
            return <ReviewRow key={id} label={label} value="Available" />
          })
        ) : (
          <p className="text-xs text-warm-muted">No evidence selected yet.</p>
        )}
      </ReviewSection>

      <ReviewSection title="Legal Basis" stepId="legal_basis" onEdit={onEdit}>
        {causesOfAction.length > 0 ? (
          causesOfAction.map((id) => {
            const label = CAUSE_OF_ACTION_OPTIONS.find((c) => c.id === id)?.label ?? id
            return <ReviewRow key={id} label={label} value="Selected" />
          })
        ) : (
          <p className="text-xs text-warm-muted">No causes of action selected.</p>
        )}
      </ReviewSection>

      <ReviewSection title="Filing Details" stepId="how_to_file" onEdit={onEdit}>
        <ReviewRow label="Your name" value={yourName || 'Not provided'} />
        <ReviewRow label="County" value={county || 'Not provided'} />
        <ReviewRow label="Court type" value={courtTypeLabel(courtType)} />
        <ReviewRow label="Filing method" value={filingMethod === 'online' ? 'Online (e-filing)' : filingMethod === 'in_person' ? 'In Person' : 'Not selected'} />
        {causeNumber && <ReviewRow label="Cause number" value={causeNumber} />}
      </ReviewSection>

      {!generating && !genError && (
        <p className="text-xs text-warm-muted text-center pt-2">
          When you&apos;re ready, click &quot;Generate My Petition&quot; below to create your draft.
        </p>
      )}

      {generating && (
        <div className="flex items-center gap-3 py-8 justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-calm-indigo" />
          <p className="text-sm text-warm-muted">Generating your petition... This may take 30&#8211;60 seconds.</p>
        </div>
      )}

      {genError && (
        <div className="space-y-3">
          <div className="rounded-lg border border-calm-amber bg-calm-amber/5 p-4">
            <p className="text-sm text-warm-text">{genError}</p>
          </div>
          <Button onClick={onGenerateDraft} variant="outline" size="sm" className="w-full">
            Try Again
          </Button>
        </div>
      )}
    </div>
  )
}
