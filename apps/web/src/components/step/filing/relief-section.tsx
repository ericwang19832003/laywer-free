import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

interface ReliefSectionProps {
  amountSought: string
  otherRelief: string
  requestAttorneyFees: boolean
  requestCourtCosts: boolean
  onAmountChange: (v: string) => void
  onOtherReliefChange: (v: string) => void
  onAttorneyFeesChange: (v: boolean) => void
  onCourtCostsChange: (v: boolean) => void
}

export function ReliefSection({
  amountSought, otherRelief, requestAttorneyFees, requestCourtCosts,
  onAmountChange, onOtherReliefChange, onAttorneyFeesChange, onCourtCostsChange,
}: ReliefSectionProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="amount">Dollar amount sought</Label>
        <Input id="amount" type="number" value={amountSought} onChange={(e) => onAmountChange(e.target.value)} placeholder="e.g. 5000" />
      </div>
      <div>
        <Label htmlFor="other-relief">Other relief requested (optional)</Label>
        <Textarea id="other-relief" value={otherRelief} onChange={(e) => onOtherReliefChange(e.target.value)} rows={2} placeholder="e.g. injunction, return of property" />
      </div>
      <div className="flex items-center gap-3">
        <Checkbox id="attorney-fees" checked={requestAttorneyFees} onCheckedChange={(c) => onAttorneyFeesChange(c === true)} />
        <Label htmlFor="attorney-fees" className="cursor-pointer">Request attorney fees</Label>
      </div>
      <div className="flex items-center gap-3">
        <Checkbox id="court-costs" checked={requestCourtCosts} onCheckedChange={(c) => onCourtCostsChange(c === true)} />
        <Label htmlFor="court-costs" className="cursor-pointer">Request court costs</Label>
      </div>
    </div>
  )
}
