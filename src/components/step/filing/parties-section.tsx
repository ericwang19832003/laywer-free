import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface PartyInfo {
  full_name: string
  address?: string
  city?: string
  state?: string
  zip?: string
}

interface PartiesSectionProps {
  yourInfo: PartyInfo
  opposingParties: PartyInfo[]
  onYourInfoChange: (info: PartyInfo) => void
  onOpposingPartiesChange: (parties: PartyInfo[]) => void
}

export function PartiesSection({
  yourInfo,
  opposingParties,
  onYourInfoChange,
  onOpposingPartiesChange,
}: PartiesSectionProps) {
  function updateOpposingParty(index: number, field: keyof PartyInfo, value: string) {
    const updated = [...opposingParties]
    updated[index] = { ...updated[index], [field]: value }
    onOpposingPartiesChange(updated)
  }

  function addOpposingParty() {
    onOpposingPartiesChange([...opposingParties, { full_name: '' }])
  }

  function removeOpposingParty(index: number) {
    if (opposingParties.length <= 1) return
    onOpposingPartiesChange(opposingParties.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-warm-text mb-3">Your Information</h3>
        <div className="space-y-3">
          <div>
            <Label htmlFor="your-name">Full legal name *</Label>
            <Input id="your-name" value={yourInfo.full_name} onChange={(e) => onYourInfoChange({ ...yourInfo, full_name: e.target.value })} placeholder="e.g. John Michael Doe" />
          </div>
          <div>
            <Label htmlFor="your-address">Address</Label>
            <Input id="your-address" value={yourInfo.address ?? ''} onChange={(e) => onYourInfoChange({ ...yourInfo, address: e.target.value })} placeholder="123 Main St" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label htmlFor="your-city">City</Label>
              <Input id="your-city" value={yourInfo.city ?? ''} onChange={(e) => onYourInfoChange({ ...yourInfo, city: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="your-state">State</Label>
              <Input id="your-state" value={yourInfo.state ?? ''} onChange={(e) => onYourInfoChange({ ...yourInfo, state: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="your-zip">Zip</Label>
              <Input id="your-zip" value={yourInfo.zip ?? ''} onChange={(e) => onYourInfoChange({ ...yourInfo, zip: e.target.value })} />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-warm-text mb-3">Opposing Party</h3>
        {opposingParties.map((party, i) => (
          <div key={i} className="space-y-3 mb-4">
            {opposingParties.length > 1 && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-warm-muted">Party {i + 1}</span>
                <button type="button" onClick={() => removeOpposingParty(i)} className="text-xs text-warm-muted hover:text-warm-text">Remove</button>
              </div>
            )}
            <div>
              <Label htmlFor={`opp-name-${i}`}>Full legal name *</Label>
              <Input id={`opp-name-${i}`} value={party.full_name} onChange={(e) => updateOpposingParty(i, 'full_name', e.target.value)} placeholder="e.g. Jane Smith" />
            </div>
            <div>
              <Label htmlFor={`opp-address-${i}`}>Address (if known)</Label>
              <Input id={`opp-address-${i}`} value={party.address ?? ''} onChange={(e) => updateOpposingParty(i, 'address', e.target.value)} />
            </div>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addOpposingParty}>
          + Add another party
        </Button>
      </div>
    </div>
  )
}
