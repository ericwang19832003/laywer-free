'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const DISPUTE_TYPES = [
  { value: 'personal_injury', label: 'Personal Injury' },
  { value: 'landlord_tenant', label: 'Landlord / Tenant' },
  { value: 'small_claims', label: 'Small Claims' },
  { value: 'family', label: 'Family Matter' },
  { value: 'business', label: 'Business Dispute' },
  { value: 'contract', label: 'Contract Dispute' },
  { value: 'property', label: 'Property Dispute' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'debt_collection', label: 'Debt Collection' },
  { value: 'other', label: 'Something Else' },
]

const FAMILY_SUB_TYPES = [
  { value: 'divorce', label: 'Divorce' },
  { value: 'custody', label: 'Child Custody' },
  { value: 'child_support', label: 'Child Support' },
  { value: 'visitation', label: 'Visitation Rights' },
  { value: 'spousal_support', label: 'Spousal Support / Alimony' },
  { value: 'protective_order', label: 'Protective Order' },
  { value: 'modification', label: 'Modify Existing Order' },
]

const BUSINESS_SUB_TYPES = [
  { value: 'partnership', label: 'Partnership Dispute' },
  { value: 'employment', label: 'Employment Dispute' },
  { value: 'b2b_commercial', label: 'Business-to-Business / Commercial' },
]

const LT_SUB_TYPES = [
  { value: 'eviction', label: 'Eviction' },
  { value: 'nonpayment', label: 'Non-Payment of Rent' },
  { value: 'security_deposit', label: 'Security Deposit' },
  { value: 'repair_maintenance', label: 'Repairs / Maintenance' },
  { value: 'habitability', label: 'Habitability Issue' },
  { value: 'lease_termination', label: 'Lease Termination' },
  { value: 'property_damage', label: 'Property Damage' },
  { value: 'other', label: 'Other' },
]

const PI_SUB_TYPES = [
  { value: 'auto_accident', label: 'Auto Accident' },
  { value: 'slip_and_fall', label: 'Slip and Fall' },
  { value: 'dog_bite', label: 'Dog Bite' },
  { value: 'pedestrian_cyclist', label: 'Pedestrian / Cyclist' },
  { value: 'rideshare', label: 'Rideshare Accident' },
  { value: 'uninsured_motorist', label: 'Uninsured Motorist' },
  { value: 'product_liability', label: 'Product Liability' },
  { value: 'vehicle_damage', label: 'Vehicle Damage' },
  { value: 'property_damage_negligence', label: 'Property Damage (Negligence)' },
  { value: 'vandalism', label: 'Vandalism' },
  { value: 'other_injury', label: 'Other Injury' },
  { value: 'other_property_damage', label: 'Other Property Damage' },
]

function needsSubType(type: string) {
  return type === 'family' || type === 'business'
}

function getSubTypeOptions(type: string) {
  if (type === 'family') return FAMILY_SUB_TYPES
  if (type === 'business') return BUSINESS_SUB_TYPES
  if (type === 'landlord_tenant') return LT_SUB_TYPES
  if (type === 'personal_injury') return PI_SUB_TYPES
  return []
}

function subTypeLabel(type: string) {
  if (type === 'family') return 'What kind of family matter?'
  if (type === 'business') return 'What kind of business dispute?'
  if (type === 'landlord_tenant') return 'What kind of landlord-tenant issue?'
  if (type === 'personal_injury') return 'What kind of injury or damage?'
  return ''
}

interface ChangeCaseTypeDialogProps {
  caseId: string
  currentDisputeType: string
}

export function ChangeCaseTypeDialog({ caseId, currentDisputeType }: ChangeCaseTypeDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [newType, setNewType] = useState('')
  const [subType, setSubType] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleOpenChange(isOpen: boolean) {
    setOpen(isOpen)
    if (isOpen) {
      setNewType('')
      setSubType('')
      setError(null)
    }
  }

  function handleTypeChange(value: string) {
    setNewType(value)
    setSubType('')
  }

  const subTypeOptions = getSubTypeOptions(newType)
  const requiresSubType = needsSubType(newType)
  const canConfirm = newType && newType !== currentDisputeType && (!requiresSubType || subType)

  async function handleConfirm() {
    if (!canConfirm) return
    setSaving(true)
    setError(null)
    try {
      const body: Record<string, string> = { new_type: newType }
      if (newType === 'family' && subType) body.family_sub_type = subType
      if (newType === 'business' && subType) body.business_sub_type = subType
      if (newType === 'landlord_tenant' && subType) body.lt_sub_type = subType
      if (newType === 'personal_injury' && subType) body.pi_sub_type = subType

      const res = await fetch(`/api/cases/${caseId}/change-type`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Failed to change case type')
        return
      }

      const { new_case_id } = await res.json()
      router.push(`/case/${new_case_id}`)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-1.5 text-xs text-warm-muted hover:text-warm-text transition-colors w-full px-1 py-1.5 rounded-md hover:bg-warm-border/30">
          <RefreshCw className="h-3.5 w-3.5 shrink-0" />
          Change case type
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Case Type</DialogTitle>
          <DialogDescription>
            Select the case type that matches your situation.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg bg-calm-amber/10 border border-calm-amber/20 px-3 py-2.5 flex gap-2.5">
          <AlertTriangle className="h-4 w-4 text-calm-amber shrink-0 mt-0.5" />
          <p className="text-xs text-warm-text leading-snug">
            This creates a new workflow for your case. Your filing details (county, court type) carry over. Your current step progress will be cleared.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-type">New case type</Label>
            <Select value={newType} onValueChange={handleTypeChange}>
              <SelectTrigger id="new-type">
                <SelectValue placeholder="Select case type" />
              </SelectTrigger>
              <SelectContent>
                {DISPUTE_TYPES.filter(t => t.value !== currentDisputeType).map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {subTypeOptions.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="sub-type">{subTypeLabel(newType)}</Label>
              <Select value={subType} onValueChange={setSubType}>
                <SelectTrigger id="sub-type">
                  <SelectValue placeholder="Select…" />
                </SelectTrigger>
                <SelectContent>
                  {subTypeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!canConfirm || saving}>
            {saving ? 'Switching…' : 'Switch Case Type'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
