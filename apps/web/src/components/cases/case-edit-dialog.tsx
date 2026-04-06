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

interface CaseEditDialogProps {
  caseId: string
  currentCounty: string | null
  currentDescription: string | null
}

export function CaseEditDialog({ caseId, currentCounty, currentDescription }: CaseEditDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [county, setCounty] = useState(currentCounty ?? '')
  const [description, setDescription] = useState(currentDescription ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleOpen(isOpen: boolean) {
    setOpen(isOpen)
    if (isOpen) {
      setCounty(currentCounty ?? '')
      setDescription(currentDescription ?? '')
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
        <button
          className="text-warm-muted hover:text-warm-text transition-colors p-1 rounded-md hover:bg-gray-100"
          aria-label="Edit case"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Case</DialogTitle>
          <DialogDescription>Update your case county and description.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
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
