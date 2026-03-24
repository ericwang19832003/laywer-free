'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { HelpTooltip } from '@/components/ui/help-tooltip'

interface PartyInfo {
  full_name: string
  address?: string
  city?: string
  state?: string
  zip?: string
}

interface LtPartiesStepProps {
  partyRole: string
  landlordInfo: PartyInfo
  tenantInfo: PartyInfo
  onLandlordChange: (info: PartyInfo) => void
  onTenantChange: (info: PartyInfo) => void
}

export function LtPartiesStep({
  partyRole,
  landlordInfo,
  tenantInfo,
  onLandlordChange,
  onTenantChange,
}: LtPartiesStepProps) {
  const isLandlord = partyRole === 'landlord'
  const yourInfo = isLandlord ? landlordInfo : tenantInfo
  const otherInfo = isLandlord ? tenantInfo : landlordInfo
  const onYourChange = isLandlord ? onLandlordChange : onTenantChange
  const onOtherChange = isLandlord ? onTenantChange : onLandlordChange
  const yourLabel = isLandlord ? 'Landlord' : 'Tenant'
  const otherLabel = isLandlord ? 'Tenant' : 'Landlord'

  return (
    <div className="space-y-8">
      {/* Terminology explanation */}
      <div className="rounded-lg border border-calm-indigo/20 bg-calm-indigo/5 p-3 text-sm text-warm-text">
        You are the <strong>{yourLabel}</strong> in this case. The other party is the <strong>{otherLabel}</strong>.
      </div>
      <HelpTooltip label="Why do we need both parties' information?">
        <p>
          The court requires the full legal names and addresses of both the landlord
          and the tenant to properly identify the parties in the case. This information
          is used on all official court documents and for service of process.
        </p>
      </HelpTooltip>

      {/* Your information */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="your-name" className="text-sm font-medium text-warm-text">
            What is your full legal name?
          </Label>
          <p className="text-xs text-warm-muted mt-0.5">{yourLabel} &mdash; You</p>
          <HelpTooltip label="Why does this matter?">
            <p>
              Use your full legal name exactly as it appears on your driver&apos;s license or
              government ID. The court uses this name on all official documents.
            </p>
          </HelpTooltip>
          <Input
            id="your-name"
            value={yourInfo.full_name}
            onChange={(e) => onYourChange({ ...yourInfo, full_name: e.target.value })}
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
              id="your-address"
              value={yourInfo.address ?? ''}
              onChange={(e) => onYourChange({ ...yourInfo, address: e.target.value })}
              placeholder="Street address"
            />
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label htmlFor="your-city" className="text-xs text-warm-muted">City</Label>
                <Input
                  id="your-city"
                  value={yourInfo.city ?? ''}
                  onChange={(e) => onYourChange({ ...yourInfo, city: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="your-state" className="text-xs text-warm-muted">State</Label>
                <Input
                  id="your-state"
                  value={yourInfo.state ?? ''}
                  onChange={(e) => onYourChange({ ...yourInfo, state: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="your-zip" className="text-xs text-warm-muted">Zip</Label>
                <Input
                  id="your-zip"
                  value={yourInfo.zip ?? ''}
                  onChange={(e) => onYourChange({ ...yourInfo, zip: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Other party */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="other-name" className="text-sm font-medium text-warm-text">
            What is the {otherLabel.toLowerCase()}&apos;s full legal name?
          </Label>
          <p className="text-xs text-warm-muted mt-0.5">{otherLabel}</p>
          <HelpTooltip label="What name should I use?">
            <p>
              Use the {otherLabel.toLowerCase()}&apos;s full legal name. If you are dealing with a
              property management company, use the name of the individual and include the company
              name as well.
            </p>
          </HelpTooltip>
          <Input
            id="other-name"
            value={otherInfo.full_name}
            onChange={(e) => onOtherChange({ ...otherInfo, full_name: e.target.value })}
            placeholder={isLandlord ? 'e.g. James Robert Smith' : 'e.g. ABC Property Management LLC'}
            className="mt-2"
          />
        </div>

        <div>
          <Label className="text-sm font-medium text-warm-text">
            What is their mailing address?
          </Label>
          <HelpTooltip label="Why do I need their address?">
            <p>
              The court needs this address to serve the {otherLabel.toLowerCase()} with your lawsuit.
              If you are suing a property management company, use their registered office address.
            </p>
          </HelpTooltip>
          <div className="space-y-2 mt-2">
            <Input
              id="other-address"
              value={otherInfo.address ?? ''}
              onChange={(e) => onOtherChange({ ...otherInfo, address: e.target.value })}
              placeholder="Street address"
            />
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label htmlFor="other-city" className="text-xs text-warm-muted">City</Label>
                <Input
                  id="other-city"
                  value={otherInfo.city ?? ''}
                  onChange={(e) => onOtherChange({ ...otherInfo, city: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="other-state" className="text-xs text-warm-muted">State</Label>
                <Input
                  id="other-state"
                  value={otherInfo.state ?? ''}
                  onChange={(e) => onOtherChange({ ...otherInfo, state: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="other-zip" className="text-xs text-warm-muted">Zip</Label>
                <Input
                  id="other-zip"
                  value={otherInfo.zip ?? ''}
                  onChange={(e) => onOtherChange({ ...otherInfo, zip: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
