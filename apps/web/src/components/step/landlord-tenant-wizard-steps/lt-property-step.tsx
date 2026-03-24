'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { HelpTooltip } from '@/components/ui/help-tooltip'
import { Home } from 'lucide-react'

interface LtPropertyStepProps {
  propertyAddress: string
  propertyType: string
  unitNumber: string
  onFieldChange: (field: string, value: string) => void
}

const PROPERTY_TYPES = [
  { value: '', label: 'Select property type...' },
  { value: 'house', label: 'House' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'condo', label: 'Condo' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'other', label: 'Other' },
]

export function LtPropertyStep({
  propertyAddress,
  propertyType,
  unitNumber,
  onFieldChange,
}: LtPropertyStepProps) {
  return (
    <div className="space-y-6">
      {/* Info callout */}
      <div className="rounded-lg border border-calm-indigo/20 bg-calm-indigo/5 p-4">
        <div className="flex items-start gap-3">
          <Home className="h-4 w-4 text-calm-indigo shrink-0 mt-0.5" />
          <p className="text-sm text-warm-text">
            The property address helps determine where to file your case and is used on all
            court documents.
          </p>
        </div>
      </div>

      {/* Property address */}
      <div>
        <Label htmlFor="property-address" className="text-sm font-medium text-warm-text">
          Property address
        </Label>
        <HelpTooltip label="What address should I use?">
          <p>
            Enter the full street address of the rental property that is the subject of
            this dispute. This is the property where the landlord-tenant relationship exists.
          </p>
        </HelpTooltip>
        <textarea
          id="property-address"
          value={propertyAddress}
          onChange={(e) => onFieldChange('propertyAddress', e.target.value)}
          placeholder="e.g. 123 Main Street, Austin, TX 78701"
          className="mt-2 w-full rounded-md border border-warm-border bg-white px-3 py-2 text-sm text-warm-text placeholder:text-warm-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
          style={{ minHeight: '72px' }}
          rows={3}
        />
      </div>

      {/* Unit number */}
      <div>
        <Label htmlFor="unit-number" className="text-sm font-medium text-warm-text">
          Unit number (optional)
        </Label>
        <HelpTooltip label="When do I need a unit number?">
          <p>
            If the property is an apartment, condo, or multi-unit building, include the unit
            or apartment number to identify the specific unit.
          </p>
        </HelpTooltip>
        <Input
          id="unit-number"
          value={unitNumber}
          onChange={(e) => onFieldChange('unitNumber', e.target.value)}
          placeholder="e.g. Apt 4B"
          className="mt-2"
        />
      </div>

      {/* Property type */}
      <div>
        <Label htmlFor="property-type" className="text-sm font-medium text-warm-text">
          Property type
        </Label>
        <HelpTooltip label="Why does property type matter?">
          <p>
            Different property types may have different legal requirements. For example,
            apartments and condos may have additional regulations from HOAs or property
            management companies.
          </p>
        </HelpTooltip>
        <select
          id="property-type"
          value={propertyType}
          onChange={(e) => onFieldChange('propertyType', e.target.value)}
          className="mt-2 w-full rounded-md border border-warm-border bg-white px-3 py-2 text-sm text-warm-text focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          {PROPERTY_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
