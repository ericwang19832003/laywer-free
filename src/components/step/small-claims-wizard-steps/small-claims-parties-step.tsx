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

interface SmallClaimsPartiesStepProps {
  plaintiff: PartyInfo
  defendant: PartyInfo
  defendantIsBusiness: boolean
  defendantBusinessName: string
  onPlaintiffChange: (info: PartyInfo) => void
  onDefendantChange: (info: PartyInfo) => void
  onDefendantIsBusinessChange: (v: boolean) => void
  onDefendantBusinessNameChange: (v: string) => void
}

export function SmallClaimsPartiesStep({
  plaintiff,
  defendant,
  defendantIsBusiness,
  defendantBusinessName,
  onPlaintiffChange,
  onDefendantChange,
  onDefendantIsBusinessChange,
  onDefendantBusinessNameChange,
}: SmallClaimsPartiesStepProps) {
  return (
    <div className="space-y-8">
      {/* Terminology explanation */}
      <div className="rounded-lg border border-calm-indigo/20 bg-calm-indigo/5 p-3 text-sm text-warm-text">
        Plaintiff = the person filing the claim. Defendant = the person or business you are suing.
      </div>
      <HelpTooltip label="What do Plaintiff and Defendant mean?">
        <p>
          In small claims court, the person filing the lawsuit is the &quot;Plaintiff&quot; and the
          person or business being sued is the &quot;Defendant.&quot; If you are suing a business,
          you will need its legal name and registered agent information.
        </p>
      </HelpTooltip>

      {/* Plaintiff (You) */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="plaintiff-name" className="text-sm font-medium text-warm-text">
            What is your full legal name?
          </Label>
          <p className="text-xs text-warm-muted mt-0.5">Plaintiff &mdash; You</p>
          <HelpTooltip label="Why does this matter?">
            <p>
              Use your full legal name exactly as it appears on your driver&apos;s license or
              government ID. The court uses this name on all official documents.
            </p>
          </HelpTooltip>
          <Input
            id="plaintiff-name"
            value={plaintiff.full_name}
            onChange={(e) => onPlaintiffChange({ ...plaintiff, full_name: e.target.value })}
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
              id="plaintiff-address"
              value={plaintiff.address ?? ''}
              onChange={(e) => onPlaintiffChange({ ...plaintiff, address: e.target.value })}
              placeholder="Street address"
            />
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label htmlFor="plaintiff-city" className="text-xs text-warm-muted">City</Label>
                <Input
                  id="plaintiff-city"
                  value={plaintiff.city ?? ''}
                  onChange={(e) => onPlaintiffChange({ ...plaintiff, city: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="plaintiff-state" className="text-xs text-warm-muted">State</Label>
                <Input
                  id="plaintiff-state"
                  value={plaintiff.state ?? ''}
                  onChange={(e) => onPlaintiffChange({ ...plaintiff, state: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="plaintiff-zip" className="text-xs text-warm-muted">Zip</Label>
                <Input
                  id="plaintiff-zip"
                  value={plaintiff.zip ?? ''}
                  onChange={(e) => onPlaintiffChange({ ...plaintiff, zip: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Defendant */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="defendant-name" className="text-sm font-medium text-warm-text">
            Who are you suing?
          </Label>
          <p className="text-xs text-warm-muted mt-0.5">Defendant</p>
          <HelpTooltip label="What name should I use?">
            <p>
              Use the person&apos;s full legal name. If you are suing a business, enter the name of
              the person you dealt with here, then check the business box below to add the business
              name separately.
            </p>
          </HelpTooltip>
          <Input
            id="defendant-name"
            value={defendant.full_name}
            onChange={(e) => onDefendantChange({ ...defendant, full_name: e.target.value })}
            placeholder="e.g. James Robert Smith"
            className="mt-2"
          />
        </div>

        {/* Defendant is a business checkbox */}
        <label className="flex items-start gap-3 cursor-pointer rounded-lg border border-warm-border p-3 transition-colors hover:bg-warm-bg/50">
          <input
            type="checkbox"
            checked={defendantIsBusiness}
            onChange={(e) => onDefendantIsBusinessChange(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-warm-border text-calm-indigo focus:ring-calm-indigo"
          />
          <span className="text-sm text-warm-text">Defendant is a business</span>
        </label>

        {/* Business name (conditional) */}
        {defendantIsBusiness && (
          <div>
            <Label htmlFor="defendant-business-name" className="text-sm font-medium text-warm-text">
              What is the business&apos;s legal name?
            </Label>
            <HelpTooltip label="How do I find the legal name?">
              <p>
                The legal name may differ from the &quot;doing business as&quot; (DBA) name. You can
                search the Texas Secretary of State&apos;s website to find the exact legal name and
                registered agent for service. The registered agent is the person authorized to
                receive legal documents on behalf of the business.
              </p>
            </HelpTooltip>
            <Input
              id="defendant-business-name"
              value={defendantBusinessName}
              onChange={(e) => onDefendantBusinessNameChange(e.target.value)}
              placeholder="e.g. ABC Property Management LLC"
              className="mt-2"
            />
            <p className="text-xs text-warm-muted mt-1">
              Tip: Search the{' '}
              <span className="text-calm-indigo">Texas Secretary of State</span>{' '}
              website to find the registered agent for service.
            </p>
          </div>
        )}

        <div>
          <Label className="text-sm font-medium text-warm-text">
            What is their mailing address?
          </Label>
          <HelpTooltip label="Why do I need their address?">
            <p>
              The court needs this address to serve the defendant with your lawsuit. If you are
              suing a business, use the registered agent&apos;s address or the business address.
            </p>
          </HelpTooltip>
          <div className="space-y-2 mt-2">
            <Input
              id="defendant-address"
              data-testid="defendant-address"
              value={defendant.address ?? ''}
              onChange={(e) => onDefendantChange({ ...defendant, address: e.target.value })}
              placeholder="Street address"
            />
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label htmlFor="defendant-city" className="text-xs text-warm-muted">City</Label>
                <Input
                  id="defendant-city"
                  value={defendant.city ?? ''}
                  onChange={(e) => onDefendantChange({ ...defendant, city: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="defendant-state" className="text-xs text-warm-muted">State</Label>
                <Input
                  id="defendant-state"
                  value={defendant.state ?? ''}
                  onChange={(e) => onDefendantChange({ ...defendant, state: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="defendant-zip" className="text-xs text-warm-muted">Zip</Label>
                <Input
                  id="defendant-zip"
                  value={defendant.zip ?? ''}
                  onChange={(e) => onDefendantChange({ ...defendant, zip: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
