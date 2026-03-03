'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { HelpTooltip } from '@/components/ui/help-tooltip'
import { useState } from 'react'

interface PartyInfo {
  full_name: string
  address?: string
  city?: string
  state?: string
  zip?: string
}

interface FamilyPartiesStepProps {
  petitioner: PartyInfo
  respondent: PartyInfo
  onPetitionerChange: (info: PartyInfo) => void
  onRespondentChange: (info: PartyInfo) => void
}

export function FamilyPartiesStep({
  petitioner,
  respondent,
  onPetitionerChange,
  onRespondentChange,
}: FamilyPartiesStepProps) {
  const [respondentAddressUnknown, setRespondentAddressUnknown] = useState(false)

  return (
    <div className="space-y-8">
      {/* Terminology explanation */}
      <div className="rounded-lg border border-calm-indigo/20 bg-calm-indigo/5 p-3 text-sm text-warm-text">
        Petitioner = the person filing. Respondent = the other person.
      </div>
      <HelpTooltip label="What do Petitioner and Respondent mean?">
        <p>
          In family law, the person filing is the &quot;Petitioner&quot; and the other
          person is the &quot;Respondent.&quot; This is different from civil cases, which
          use Plaintiff and Defendant.
        </p>
      </HelpTooltip>

      {/* Petitioner (You) */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="petitioner-name" className="text-sm font-medium text-warm-text">
            What is your full legal name?
          </Label>
          <p className="text-xs text-warm-muted mt-0.5">Petitioner &mdash; You</p>
          <HelpTooltip label="Why does this matter?">
            <p>
              Use your full legal name exactly as it appears on your driver&apos;s license or
              government ID. The court uses this name on all official documents.
            </p>
          </HelpTooltip>
          <Input
            id="petitioner-name"
            value={petitioner.full_name}
            onChange={(e) => onPetitionerChange({ ...petitioner, full_name: e.target.value })}
            placeholder="e.g. Maria Elena Garcia"
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
              id="petitioner-address"
              value={petitioner.address ?? ''}
              onChange={(e) => onPetitionerChange({ ...petitioner, address: e.target.value })}
              placeholder="Street address"
            />
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label htmlFor="petitioner-city" className="text-xs text-warm-muted">City</Label>
                <Input
                  id="petitioner-city"
                  value={petitioner.city ?? ''}
                  onChange={(e) => onPetitionerChange({ ...petitioner, city: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="petitioner-state" className="text-xs text-warm-muted">State</Label>
                <Input
                  id="petitioner-state"
                  value={petitioner.state ?? ''}
                  onChange={(e) => onPetitionerChange({ ...petitioner, state: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="petitioner-zip" className="text-xs text-warm-muted">Zip</Label>
                <Input
                  id="petitioner-zip"
                  value={petitioner.zip ?? ''}
                  onChange={(e) => onPetitionerChange({ ...petitioner, zip: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Respondent */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="respondent-name" className="text-sm font-medium text-warm-text">
            What is the other person&apos;s full legal name?
          </Label>
          <p className="text-xs text-warm-muted mt-0.5">Respondent</p>
          <HelpTooltip label="What if I'm not sure of their exact name?">
            <p>
              Use the most complete legal name you know. Check old court documents, marriage
              certificates, or birth certificates for their full name. The court may reject
              your filing if the name doesn&apos;t match their legal name.
            </p>
          </HelpTooltip>
          <Input
            id="respondent-name"
            value={respondent.full_name}
            onChange={(e) => onRespondentChange({ ...respondent, full_name: e.target.value })}
            placeholder="e.g. James Robert Smith"
            className="mt-2"
          />
        </div>

        <div>
          <Label className="text-sm font-medium text-warm-text">
            What is their mailing address?
          </Label>
          <HelpTooltip label="Why do I need their address?">
            <p>
              This is needed to serve them court papers. If you don&apos;t know their home
              address, you can use their work address or last known address.
            </p>
          </HelpTooltip>
          <div className="space-y-3 mt-2">
            <label className="flex items-start gap-3 cursor-pointer rounded-lg border border-warm-border p-3 transition-colors hover:bg-warm-bg/50">
              <input
                type="checkbox"
                checked={respondentAddressUnknown}
                onChange={(e) => setRespondentAddressUnknown(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-warm-border text-calm-indigo focus:ring-calm-indigo"
              />
              <span className="text-sm text-warm-text">I don&apos;t know their address yet</span>
            </label>

            {respondentAddressUnknown ? (
              <p className="text-xs text-warm-muted">
                You can add a work or last known address later.
              </p>
            ) : (
              <div className="space-y-2">
                <Input
                  id="respondent-address"
                  data-testid="respondent-address"
                  value={respondent.address ?? ''}
                  onChange={(e) => onRespondentChange({ ...respondent, address: e.target.value })}
                  placeholder="Street address"
                />
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label htmlFor="respondent-city" className="text-xs text-warm-muted">City</Label>
                    <Input
                      id="respondent-city"
                      value={respondent.city ?? ''}
                      onChange={(e) => onRespondentChange({ ...respondent, city: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="respondent-state" className="text-xs text-warm-muted">State</Label>
                    <Input
                      id="respondent-state"
                      value={respondent.state ?? ''}
                      onChange={(e) => onRespondentChange({ ...respondent, state: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="respondent-zip" className="text-xs text-warm-muted">Zip</Label>
                    <Input
                      id="respondent-zip"
                      value={respondent.zip ?? ''}
                      onChange={(e) => onRespondentChange({ ...respondent, zip: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
