'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
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

export function NewCaseDialog() {
  const [open, setOpen] = useState(false)
  const [role, setRole] = useState<'plaintiff' | 'defendant' | ''>('')
  const [county, setCounty] = useState('')
  const [courtType, setCourtType] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!role) {
      setError('Please select your role.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      const res = await fetch('/api/cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token
            ? { Authorization: `Bearer ${session.access_token}` }
            : {}),
        },
        body: JSON.stringify({
          role,
          ...(county.trim() ? { county: county.trim() } : {}),
          ...(courtType ? { court_type: courtType } : {}),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Something went wrong. Please try again.')
        setLoading(false)
        return
      }

      const data = await res.json()
      setOpen(false)
      router.push(`/case/${data.case.id}`)
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    if (!nextOpen) {
      // Reset form when closing
      setRole('')
      setCounty('')
      setCourtType('')
      setError(null)
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="w-full" size="lg">
          Start a New Case
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start a new case</DialogTitle>
          <DialogDescription>
            A few quick details to get you organized.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Role selector */}
          <div className="space-y-2">
            <Label>I am the...</Label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setRole('plaintiff')}
                className={`flex-1 rounded-md border px-4 py-2.5 text-sm font-medium transition-colors ${
                  role === 'plaintiff'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-warm-border text-warm-muted hover:border-warm-text hover:text-warm-text'
                }`}
              >
                Plaintiff
              </button>
              <button
                type="button"
                onClick={() => setRole('defendant')}
                className={`flex-1 rounded-md border px-4 py-2.5 text-sm font-medium transition-colors ${
                  role === 'defendant'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-warm-border text-warm-muted hover:border-warm-text hover:text-warm-text'
                }`}
              >
                Defendant
              </button>
            </div>
          </div>

          {/* County */}
          <div className="space-y-2">
            <Label htmlFor="county">County (optional)</Label>
            <Input
              id="county"
              value={county}
              onChange={(e) => setCounty(e.target.value)}
              placeholder="e.g. Travis County"
            />
          </div>

          {/* Court type */}
          <div className="space-y-2">
            <Label htmlFor="court-type">Court type (optional)</Label>
            <Select value={courtType} onValueChange={setCourtType}>
              <SelectTrigger className="w-full" id="court-type">
                <SelectValue placeholder="Select a court type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="jp">JP Court</SelectItem>
                <SelectItem value="county">County Court</SelectItem>
                <SelectItem value="district">District Court</SelectItem>
                <SelectItem value="unknown">I&apos;m not sure</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && (
            <p className="text-sm text-calm-amber">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating...' : 'Get Started'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
