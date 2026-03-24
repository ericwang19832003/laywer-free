import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

const DISPUTE_PROMPTS: Record<string, string> = {
  debt_collection: 'Describe the debt: original amount, agreement, and how it was breached.',
  landlord_tenant: 'Describe the lease issue: terms, violation, and what happened.',
  personal_injury: 'Describe the injury: what caused it, medical treatment, and damages.',
  contract: 'Describe the contract: key terms, how it was breached, and damages.',
  property: 'Describe the property dispute: what property, your claim, and what relief you seek.',
  family: 'Describe the family matter: relationship, children involved, and what you are seeking.',
  other: 'Describe your claim in detail.',
}

interface ClaimsSectionProps {
  disputeType: string
  claimDetails: string
  onClaimDetailsChange: (v: string) => void
}

export function ClaimsSection({ disputeType, claimDetails, onClaimDetailsChange }: ClaimsSectionProps) {
  const prompt = DISPUTE_PROMPTS[disputeType] ?? DISPUTE_PROMPTS.other

  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="claim-details">Claim Details</Label>
        <p className="text-xs text-warm-muted mb-2">{prompt}</p>
        <Textarea id="claim-details" value={claimDetails} onChange={(e) => onClaimDetailsChange(e.target.value)} rows={4} placeholder="Provide details about your claim..." />
      </div>
    </div>
  )
}
