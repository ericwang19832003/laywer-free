import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

interface DefendantSectionProps {
  isGeneralDenial: boolean
  specificDefenses: string
  hasCounterclaim: boolean
  counterclaimDetails: string
  onGeneralDenialChange: (v: boolean) => void
  onDefensesChange: (v: string) => void
  onCounterclaimChange: (v: boolean) => void
  onCounterclaimDetailsChange: (v: string) => void
}

export function DefendantSection({
  isGeneralDenial, specificDefenses, hasCounterclaim, counterclaimDetails,
  onGeneralDenialChange, onDefensesChange, onCounterclaimChange, onCounterclaimDetailsChange,
}: DefendantSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <Checkbox id="general-denial" checked={isGeneralDenial} onCheckedChange={(c) => onGeneralDenialChange(c === true)} />
        <div>
          <Label htmlFor="general-denial" className="cursor-pointer">File a General Denial (recommended)</Label>
          <p className="text-xs text-warm-muted mt-0.5">A general denial denies all allegations. This is the simplest and most common response for self-represented litigants.</p>
        </div>
      </div>
      <div>
        <Label htmlFor="defenses">Specific defenses (optional)</Label>
        <Textarea id="defenses" value={specificDefenses} onChange={(e) => onDefensesChange(e.target.value)} rows={3} placeholder="e.g. statute of limitations, payment already made" />
      </div>
      <div className="flex items-start gap-3">
        <Checkbox id="counterclaim" checked={hasCounterclaim} onCheckedChange={(c) => onCounterclaimChange(c === true)} />
        <Label htmlFor="counterclaim" className="cursor-pointer">I want to file a counterclaim</Label>
      </div>
      {hasCounterclaim && (
        <div>
          <Label htmlFor="counterclaim-details">Counterclaim details</Label>
          <Textarea id="counterclaim-details" value={counterclaimDetails} onChange={(e) => onCounterclaimDetailsChange(e.target.value)} rows={3} placeholder="Describe your counterclaim..." />
        </div>
      )}
    </div>
  )
}
