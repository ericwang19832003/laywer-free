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
}

interface CaseEditDialogProps {
  caseId: string
  currentCounty: string | null
  currentDescription: string | null
  currentCourtType?: string | null
  jurisdiction?: string | null
  trigger?: React.ReactNode
}

export function CaseEditDialog({ caseId, currentCounty, currentDescription, currentCourtType, jurisdiction, trigger }: CaseEditDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [county, setCounty] = useState(currentCounty ?? '')
  const [description, setDescription] = useState(currentDescription ?? '')
  const [courtType, setCourtType] = useState(currentCourtType ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const courtOptions = COURT_TYPE_OPTIONS[jurisdiction ?? 'TX'] ?? COURT_TYPE_OPTIONS.TX

  function handleOpen(isOpen: boolean) {
    setOpen(isOpen)
    if (isOpen) {
      setCounty(currentCounty ?? '')
      setDescription(currentDescription ?? '')
      setCourtType(currentCourtType ?? '')
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
