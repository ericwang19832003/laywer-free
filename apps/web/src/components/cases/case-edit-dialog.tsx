'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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

const PI_SUB_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: 'auto_accident', label: 'Auto Accident' },
  { value: 'pedestrian_cyclist', label: 'Pedestrian / Cyclist' },
  { value: 'rideshare', label: 'Rideshare Accident' },
  { value: 'uninsured_motorist', label: 'Uninsured Motorist' },
  { value: 'slip_and_fall', label: 'Slip and Fall' },
  { value: 'dog_bite', label: 'Dog Bite' },
  { value: 'product_liability', label: 'Product Liability' },
  { value: 'other_injury', label: 'Other Injury' },
  { value: 'vehicle_damage', label: 'Vehicle Damage' },
  { value: 'property_damage_negligence', label: 'Property Damage (Negligence)' },
  { value: 'vandalism', label: 'Vandalism' },
  { value: 'other_property_damage', label: 'Other Property Damage' },
]

const COURT_TYPE_OPTIONS: Record<string, { value: string; label: string }[]> = {
  TX: [
    { value: 'jp', label: 'JP Court (Small Claims)' },
    { value: 'county', label: 'County Court' },
    { value: 'district', label: 'District Court' },
    { value: 'federal', label: 'Federal Court' },
  ],
  CA: [
    { value: 'small_claims', label: 'Small Claims Court' },
    { value: 'limited_civil', label: 'Limited Civil Court' },
    { value: 'unlimited_civil', label: 'Unlimited Civil Court' },
    { value: 'federal', label: 'Federal Court' },
  ],
  NY: [
    { value: 'ny_small_claims', label: 'Small Claims Court' },
    { value: 'ny_civil', label: 'Civil Court' },
    { value: 'ny_supreme', label: 'Supreme Court' },
    { value: 'federal', label: 'Federal Court' },
  ],
  FL: [
    { value: 'fl_small_claims', label: 'Small Claims Court' },
    { value: 'fl_county', label: 'County Court' },
    { value: 'fl_circuit', label: 'Circuit Court' },
    { value: 'federal', label: 'Federal Court' },
  ],
  PA: [
    { value: 'pa_magisterial', label: 'Magisterial District Court' },
    { value: 'pa_common_pleas', label: 'Court of Common Pleas' },
    { value: 'federal', label: 'Federal Court' },
  ],
  IL: [
    { value: 'il_small_claims', label: 'Circuit Court — Small Claims' },
    { value: 'il_circuit', label: 'Circuit Court' },
    { value: 'federal', label: 'Federal Court' },
  ],
  OH: [
    { value: 'oh_small_claims', label: 'Small Claims Court' },
    { value: 'oh_municipal', label: 'Municipal Court' },
    { value: 'oh_common_pleas', label: 'Court of Common Pleas' },
    { value: 'federal', label: 'Federal Court' },
  ],
  GA: [
    { value: 'ga_magistrate', label: 'Magistrate Court' },
    { value: 'ga_state_court', label: 'State Court' },
    { value: 'ga_superior', label: 'Superior Court' },
    { value: 'federal', label: 'Federal Court' },
  ],
  NC: [
    { value: 'nc_small_claims', label: 'Small Claims (Magistrate)' },
    { value: 'nc_district', label: 'District Court' },
    { value: 'nc_superior', label: 'Superior Court' },
    { value: 'federal', label: 'Federal Court' },
  ],
  MI: [
    { value: 'mi_small_claims', label: 'Small Claims Court' },
    { value: 'mi_district', label: 'District Court' },
    { value: 'mi_circuit', label: 'Circuit Court' },
    { value: 'federal', label: 'Federal Court' },
  ],
  NJ: [
    { value: 'nj_small_claims', label: 'Small Claims Court' },
    { value: 'nj_special_civil', label: 'Special Civil Part' },
    { value: 'nj_civil', label: 'Superior Court — Civil Part' },
    { value: 'nj_family', label: 'Superior Court — Family Part' },
    { value: 'federal', label: 'Federal Court' },
  ],
  VA: [
    { value: 'va_small_claims', label: 'Small Claims Division' },
    { value: 'va_general_district', label: 'General District Court' },
    { value: 'va_circuit', label: 'Circuit Court' },
    { value: 'va_jdr', label: 'J&DR District Court' },
    { value: 'federal', label: 'Federal Court' },
  ],
  WA: [
    { value: 'wa_small_claims', label: 'Small Claims Court' },
    { value: 'wa_district', label: 'District Court' },
    { value: 'wa_superior', label: 'Superior Court' },
    { value: 'federal', label: 'Federal Court' },
  ],
  AZ: [
    { value: 'az_small_claims', label: 'Small Claims Court' },
    { value: 'az_justice', label: 'Justice Court' },
    { value: 'az_superior', label: 'Superior Court' },
    { value: 'federal', label: 'Federal Court' },
  ],
  CO: [
    { value: 'co_small_claims', label: 'Small Claims Court' },
    { value: 'co_county', label: 'County Court' },
    { value: 'co_district', label: 'District Court' },
    { value: 'federal', label: 'Federal Court' },
  ],
  TN: [
    { value: 'tn_general_sessions', label: 'General Sessions Court' },
    { value: 'tn_circuit', label: 'Circuit Court' },
    { value: 'federal', label: 'Federal Court' },
  ],
  IN: [
    { value: 'in_small_claims', label: 'Small Claims Court' },
    { value: 'in_circuit', label: 'Circuit / Superior Court' },
    { value: 'federal', label: 'Federal Court' },
  ],
  MO: [
    { value: 'mo_small_claims', label: 'Small Claims Court' },
    { value: 'mo_associate_circuit', label: 'Associate Circuit Court' },
    { value: 'mo_circuit', label: 'Circuit Court' },
    { value: 'federal', label: 'Federal Court' },
  ],
  MD: [
    { value: 'md_district', label: 'District Court' },
    { value: 'md_circuit', label: 'Circuit Court' },
    { value: 'federal', label: 'Federal Court' },
  ],
  WI: [
    { value: 'wi_small_claims', label: 'Circuit Court — Small Claims' },
    { value: 'wi_circuit', label: 'Circuit Court' },
    { value: 'federal', label: 'Federal Court' },
  ],
  MN: [
    { value: 'mn_conciliation', label: 'Conciliation Court (Small Claims)' },
    { value: 'mn_district', label: 'District Court' },
    { value: 'federal', label: 'Federal Court' },
  ],
  SC: [
    { value: 'sc_magistrate', label: 'Magistrate Court' },
    { value: 'sc_circuit', label: 'Circuit Court' },
    { value: 'federal', label: 'Federal Court' },
  ],
  AL: [
    { value: 'al_small_claims', label: 'District Court — Small Claims' },
    { value: 'al_district', label: 'District Court' },
    { value: 'al_circuit', label: 'Circuit Court' },
    { value: 'federal', label: 'Federal Court' },
  ],
  LA: [
    { value: 'la_small_claims', label: 'City Court — Small Claims' },
    { value: 'la_district', label: 'District Court' },
    { value: 'federal', label: 'Federal Court' },
  ],
  KY: [
    { value: 'ky_small_claims', label: 'District Court — Small Claims' },
    { value: 'ky_district', label: 'District Court' },
    { value: 'ky_circuit', label: 'Circuit Court' },
    { value: 'federal', label: 'Federal Court' },
  ],
  OR: [
    { value: 'or_small_claims', label: 'Small Claims Dept, Circuit Court' },
    { value: 'or_circuit', label: 'Circuit Court' },
    { value: 'federal', label: 'Federal Court' },
  ],
  NV: [
    { value: 'nv_small_claims', label: 'Small Claims Court (Justice Court)' },
    { value: 'nv_district', label: 'District Court' },
    { value: 'federal', label: 'Federal Court' },
  ],
  CT: [
    { value: 'ct_small_claims', label: 'Superior Court — Small Claims Session' },
    { value: 'ct_superior', label: 'Superior Court' },
    { value: 'federal', label: 'Federal Court' },
  ],
  MA: [
    { value: 'ma_small_claims', label: 'Small Claims Session, District Court' },
    { value: 'ma_district', label: 'District Court / Superior Court' },
    { value: 'federal', label: 'Federal Court' },
  ],
  OK: [
    { value: 'ok_small_claims', label: 'Small Claims Docket, District Court' },
    { value: 'ok_district', label: 'District Court' },
    { value: 'federal', label: 'Federal Court' },
  ],
  AR: [
    { value: 'ar_small_claims', label: 'Small Claims Court (District Court)' },
    { value: 'ar_circuit', label: 'Circuit Court' },
    { value: 'federal', label: 'Federal Court' },
  ],
  MS: [
    { value: 'ms_justice', label: 'Justice Court' },
    { value: 'ms_county', label: 'County Court' },
    { value: 'ms_circuit', label: 'Circuit Court' },
    { value: 'federal', label: 'Federal Court' },
  ],
  UT: [
    { value: 'ut_small_claims', label: 'Justice Court — Small Claims' },
    { value: 'ut_district', label: 'District Court' },
    { value: 'federal', label: 'Federal Court' },
  ],
  NM: [
    { value: 'nm_magistrate', label: 'Magistrate Court (or Metro Court in Bernalillo)' },
    { value: 'nm_district', label: 'District Court' },
    { value: 'federal', label: 'Federal Court' },
  ],
  WV: [
    { value: 'wv_magistrate', label: 'Magistrate Court' },
    { value: 'wv_circuit', label: 'Circuit Court' },
    { value: 'federal', label: 'Federal Court' },
  ],
  DE: [
    { value: 'de_jp', label: 'Justice of the Peace Court' },
    { value: 'de_common_pleas', label: 'Court of Common Pleas' },
    { value: 'de_superior', label: 'Superior Court' },
    { value: 'federal', label: 'Federal Court' },
  ],
  RI: [
    { value: 'ri_small_claims', label: 'District Court Small Claims' },
    { value: 'ri_district', label: 'District Court' },
    { value: 'ri_superior', label: 'Superior Court' },
    { value: 'federal', label: 'Federal Court' },
  ],
  NH: [
    { value: 'nh_small_claims', label: 'Circuit Court Small Claims' },
    { value: 'nh_superior', label: 'Superior Court' },
    { value: 'federal', label: 'Federal Court' },
  ],
  VT: [
    { value: 'vt_small_claims', label: 'Small Claims Court' },
    { value: 'vt_superior', label: 'Superior Court' },
    { value: 'federal', label: 'Federal Court' },
  ],
  ME: [
    { value: 'me_small_claims', label: 'District Court Small Claims' },
    { value: 'me_superior', label: 'Superior Court' },
    { value: 'federal', label: 'Federal Court' },
  ],
  IA: [
    { value: 'ia_small_claims', label: 'Small Claims Court' },
    { value: 'ia_district', label: 'District Court' },
    { value: 'federal', label: 'Federal Court' },
  ],
  KS: [
    { value: 'ks_small_claims', label: 'Small Claims Court' },
    { value: 'ks_district', label: 'District Court' },
    { value: 'federal', label: 'Federal Court' },
  ],
  NE: [
    { value: 'ne_small_claims', label: 'County Court Small Claims' },
    { value: 'ne_county', label: 'County Court' },
    { value: 'ne_district', label: 'District Court' },
    { value: 'federal', label: 'Federal Court' },
  ],
  SD: [
    { value: 'sd_small_claims', label: 'Small Claims Court' },
    { value: 'sd_circuit', label: 'Circuit Court' },
    { value: 'federal', label: 'Federal Court' },
  ],
  ND: [
    { value: 'nd_small_claims', label: 'Small Claims Court' },
    { value: 'nd_district', label: 'District Court' },
    { value: 'federal', label: 'Federal Court' },
  ],
  MT: [
    { value: 'mt_justice', label: 'Justice Court Small Claims' },
    { value: 'mt_district', label: 'District Court' },
    { value: 'federal', label: 'Federal Court' },
  ],
  WY: [
    { value: 'wy_small_claims', label: 'Circuit Court Small Claims' },
    { value: 'wy_district', label: 'District Court' },
    { value: 'federal', label: 'Federal Court' },
  ],
  ID: [
    { value: 'id_small_claims', label: 'Small Claims Court' },
    { value: 'id_magistrate', label: 'Magistrate Division' },
    { value: 'id_district', label: 'District Court' },
    { value: 'federal', label: 'Federal Court' },
  ],
  HI: [
    { value: 'hi_small_claims', label: 'Small Claims Court' },
    { value: 'hi_district', label: 'District Court' },
    { value: 'hi_circuit', label: 'Circuit Court' },
    { value: 'federal', label: 'Federal Court' },
  ],
  AK: [
    { value: 'ak_small_claims', label: 'District Court Small Claims' },
    { value: 'ak_district', label: 'District Court' },
    { value: 'federal', label: 'Federal Court' },
  ],
}

interface CaseEditDialogProps {
  caseId: string
  currentCounty: string | null
  currentDescription: string | null
  currentCourtType?: string | null
  jurisdiction?: string | null
  trigger?: React.ReactNode
  disputeType?: string | null
  currentPiSubType?: string | null
}

export function CaseEditDialog({ caseId, currentCounty, currentDescription, currentCourtType, jurisdiction, trigger, disputeType, currentPiSubType }: CaseEditDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [county, setCounty] = useState(currentCounty ?? '')
  const [description, setDescription] = useState(currentDescription ?? '')
  const [courtType, setCourtType] = useState(currentCourtType ?? '')
  const [piSubType, setPiSubType] = useState(currentPiSubType ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const courtOptions = COURT_TYPE_OPTIONS[jurisdiction ?? 'TX'] ?? COURT_TYPE_OPTIONS.TX

  function handleOpen(isOpen: boolean) {
    setOpen(isOpen)
    if (isOpen) {
      setCounty(currentCounty ?? '')
      setDescription(currentDescription ?? '')
      setCourtType(currentCourtType ?? '')
      setPiSubType(currentPiSubType ?? '')
      setError(null)
    }
  }

  async function handleSave() {
    setSaving(true)
    setError(null)

    try {
      const res = await fetch(`/api/cases/${caseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          county: county.trim() || null,
          description: description.trim() || null,
          ...(courtType ? { court_type: courtType } : {}),
          ...(disputeType === 'personal_injury' && piSubType ? { pi_sub_type: piSubType } : {}),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Failed to update case')
        return
      }

      setOpen(false)
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <button
            className="text-warm-muted hover:text-warm-text transition-colors p-1 rounded-md hover:bg-gray-100"
            aria-label="Edit case"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Case Details</DialogTitle>
          <DialogDescription>Update your filing type, county, and description.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {disputeType === 'personal_injury' && (
            <div className="space-y-2">
              <Label htmlFor="pi-sub-type">Injury Type</Label>
              <Select value={piSubType} onValueChange={setPiSubType}>
                <SelectTrigger id="pi-sub-type">
                  <SelectValue placeholder="Select injury type" />
                </SelectTrigger>
                <SelectContent>
                  {PI_SUB_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="court-type">Filing Type</Label>
            <Select value={courtType} onValueChange={setCourtType}>
              <SelectTrigger id="court-type">
                <SelectValue placeholder="Select court type" />
              </SelectTrigger>
              <SelectContent>
                {courtOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="county">County</Label>
            <Input
              id="county"
              placeholder="e.g. Harris, Travis, Dallas"
              value={county}
              onChange={(e) => setCounty(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Brief description of your case"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
