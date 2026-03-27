'use client'

import { Label } from '@/components/ui/label'
import { HelpTooltip } from '@/components/ui/help-tooltip'
import { Scale } from 'lucide-react'

interface PropertyStepProps {
  communityPropertyExists: boolean
  propertyDescription: string
  onCommunityPropertyChange: (v: boolean) => void
  onPropertyDescriptionChange: (v: string) => void
}

export function PropertyStep({
  communityPropertyExists,
  propertyDescription,
  onCommunityPropertyChange,
  onPropertyDescriptionChange,
}: PropertyStepProps) {
  return (
    <div className="space-y-6">
      {/* Community property checkbox */}
      <div>
        <label className="flex items-start gap-3 cursor-pointer rounded-lg border border-warm-border p-4 transition-colors hover:bg-warm-bg/50">
          <input
            type="checkbox"
            checked={communityPropertyExists}
            onChange={(e) => onCommunityPropertyChange(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-warm-border text-calm-indigo focus:ring-calm-indigo"
          />
          <div>
            <span className="text-sm font-medium text-warm-text">
              Do you and your spouse have property to divide?
            </span>
            <p className="text-xs text-warm-muted mt-0.5">
              This includes real estate, vehicles, bank accounts, retirement accounts, and debts.
            </p>
          </div>
        </label>

        <HelpTooltip label="What is community property vs. separate property?">
          <p>
            Community property = everything acquired during the marriage.
            Separate property = what you owned before marriage or received as a
            gift or inheritance during the marriage. The distinction matters
            because the court only divides community property.
          </p>
        </HelpTooltip>
      </div>

      {/* Property description */}
      {communityPropertyExists && (
        <div>
          <Label htmlFor="property-description" className="text-sm font-medium text-warm-text">
            Describe the community property to divide
          </Label>
          <HelpTooltip label="What should I include?">
            <p>
              List each significant asset and debt. Include estimated values when
              you know them. Major items to consider: home, vehicles, bank accounts,
              retirement accounts (401k, IRA, pension), investments, business
              interests, credit card debts, and loans.
            </p>
          </HelpTooltip>
          <textarea
            id="property-description"
            value={propertyDescription}
            onChange={(e) => onPropertyDescriptionChange(e.target.value)}
            placeholder="List community property: real estate, vehicles, bank accounts, retirement accounts, debts..."
            className="mt-2 w-full rounded-md border border-warm-border bg-white px-3 py-2 text-sm text-warm-text placeholder:text-warm-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
            style={{ minHeight: '150px' }}
            rows={6}
          />
        </div>
      )}

      {/* Community property info */}
      <div className="rounded-lg border border-calm-indigo/20 bg-calm-indigo/5 p-4">
        <div className="flex items-start gap-3">
          <Scale className="h-5 w-5 text-calm-indigo shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-warm-text">
              Texas Community Property Law
            </p>
            <p className="text-sm text-warm-muted mt-1">
              Texas is a community property state. The court divides community
              property in a way that is &quot;just and right&quot; &mdash; not necessarily
              50/50. Factors include earning capacity, fault in the breakup, health,
              age, and the needs of any children.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
