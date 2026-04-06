'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { HelpTooltip } from '@/components/ui/help-tooltip'
import { Trash2 } from 'lucide-react'

interface PartyInfo {
  full_name: string
  address?: string
  city?: string
  state?: string
  zip?: string
}

interface PartiesStepProps {
  yourInfo: PartyInfo
  opposingParties: PartyInfo[]
  onYourInfoChange: (info: PartyInfo) => void
  onOpposingPartiesChange: (parties: PartyInfo[]) => void
}

export function PartiesStep({
  yourInfo,
  opposingParties,
  onYourInfoChange,
  onOpposingPartiesChange,
}: PartiesStepProps) {
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
    <div className="space-y-8">
      {/* Your information */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="your-name" className="text-sm font-medium text-warm-text">
            What is your full legal name?
          </Label>
          <HelpTooltip label="Why does this matter?">
            <p>
              Use your full legal name exactly as it appears on your driver&apos;s license or
              government ID. The court uses this name on all official documents.
            </p>
          </HelpTooltip>
          <Input
            id="your-name"
            value={yourInfo.full_name}
            onChange={(e) => onYourInfoChange({ ...yourInfo, full_name: e.target.value })}
            placeholder="e.g. John Michael Doe"
            className="mt-2"
          />
        </div>

        <div>
          <Label className="text-sm font-medium text-warm-text">
            What is your mailing address?
          </Label>
          <HelpTooltip label="Why does the court need my address?">
            <p>
              The court will send important documents to this address, including hearing notices
              and deadlines. Use the address where you actually receive mail.
            </p>
          </HelpTooltip>
          <div className="space-y-2 mt-2">
            <Input
              id="your-address"
              value={yourInfo.address ?? ''}
              onChange={(e) => onYourInfoChange({ ...yourInfo, address: e.target.value })}
              placeholder="Street address"
            />
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label htmlFor="your-city" className="text-xs text-warm-muted">City</Label>
                <Input
                  id="your-city"
                  value={yourInfo.city ?? ''}
                  onChange={(e) => onYourInfoChange({ ...yourInfo, city: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="your-state" className="text-xs text-warm-muted">State</Label>
                <Input
                  id="your-state"
                  value={yourInfo.state ?? ''}
                  onChange={(e) => onYourInfoChange({ ...yourInfo, state: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="your-zip" className="text-xs text-warm-muted">Zip</Label>
                <Input
                  id="your-zip"
                  value={yourInfo.zip ?? ''}
                  onChange={(e) => onYourInfoChange({ ...yourInfo, zip: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Opposing parties */}
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium text-warm-text">
            Who are you suing?
          </Label>
          <HelpTooltip label="How do I know the right name?">
            <p>
              Use their full legal name. If you are suing a business, use the registered business
              name — you can look this up on the Texas Secretary of State website. If you are
              suing an individual, use the name on their ID.
            </p>
          </HelpTooltip>
        </div>

        {opposingParties.map((party, i) => (
          <div
            key={i}
            className="rounded-lg border border-warm-border p-4 space-y-3"
          >
            {opposingParties.length > 1 && (
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-warm-muted">
                  Party {i + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeOpposingParty(i)}
                  className="text-xs text-warm-muted hover:text-warm-text flex items-center gap-1"
                >
                  <Trash2 className="h-3 w-3" />
                  Remove
                </button>
              </div>
            )}

            <div>
              <Label htmlFor={`opp-name-${i}`} className="text-xs text-warm-muted">
                Full legal name
              </Label>
              <Input
                id={`opp-name-${i}`}
                value={party.full_name}
                onChange={(e) => updateOpposingParty(i, 'full_name', e.target.value)}
                placeholder="e.g. Jane Smith or ABC Company LLC"
              />
            </div>

            <div>
              <Label htmlFor={`opp-address-${i}`} className="text-xs text-warm-muted">
                What is their address? (if known)
              </Label>
              <HelpTooltip label="Why do I need their address?" variant="expandable">
                <p>
                  This is needed to serve them court papers later. If you don&apos;t know their
                  home address, you can use their work address or look them up later.
                </p>
              </HelpTooltip>
              <Input
                id={`opp-address-${i}`}
                value={party.address ?? ''}
                onChange={(e) => updateOpposingParty(i, 'address', e.target.value)}
                placeholder="Street address, City, State, Zip"
                className="mt-1"
              />
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addOpposingParty}
        >
          + Add another party
        </Button>
      </div>
    </div>
  )
}
