'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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

interface DeadlineFormDialogProps {
  caseId: string
}

const DEADLINE_TYPES = [
  { value: 'answer_deadline', label: 'Answer Deadline' },
  { value: 'hearing_date', label: 'Hearing Date' },
  { value: 'other', label: 'Other' },
] as const

const SOURCE_OPTIONS = [
  { value: 'user_confirmed', label: 'I confirmed this' },
  { value: 'court_notice', label: 'From a court notice' },
] as const

export function DeadlineFormDialog({ caseId }: DeadlineFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [deadlineType, setDeadlineType] = useState('')
  const [customKey, setCustomKey] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [source, setSource] = useState('')
  const [rationale, setRationale] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  function resetForm() {
    setDeadlineType('')
    setCustomKey('')
    setDueDate('')
    setSource('')
    setRationale('')
    setError(null)
    setLoading(false)
    setSuccess(false)
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    if (!nextOpen) {
      resetForm()
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const key = deadlineType === 'other' ? customKey.trim() : deadlineType
    if (!key) {
      setError('Please select or enter a deadline type.')
      return
    }
    if (!dueDate) {
      setError('Please select a due date.')
      return
    }
    if (!source) {
      setError('Please select a source.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      // Convert the local datetime-local value to ISO string
      const dueDateISO = new Date(dueDate).toISOString()

      const res = await fetch(`/api/cases/${caseId}/deadlines`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token
            ? { Authorization: `Bearer ${session.access_token}` }
            : {}),
        },
        body: JSON.stringify({
          key,
          due_at: dueDateISO,
          source,
          ...(rationale.trim() ? { rationale: rationale.trim() } : {}),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Something went wrong. Please try again.')
        setLoading(false)
        return
      }

      // Show brief success state
      setSuccess(true)
      setTimeout(() => {
        setOpen(false)
        resetForm()
        router.refresh()
      }, 1200)
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="secondary">Add a Deadline</Button>
      </DialogTrigger>
      <DialogContent>
        {success ? (
          <div className="py-8 text-center">
            <p className="text-lg font-medium text-warm-text">
              Got it. We&apos;ll remind you ahead of time.
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Add a deadline</DialogTitle>
              <DialogDescription>
                We&apos;ll create reminders to help you prepare.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Deadline type */}
              <div className="space-y-2">
                <Label htmlFor="deadline-type">Type</Label>
                <Select value={deadlineType} onValueChange={setDeadlineType}>
                  <SelectTrigger className="w-full" id="deadline-type">
                    <SelectValue placeholder="Select a deadline type" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEADLINE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Custom key (shown when "Other" is selected) */}
              {deadlineType === 'other' && (
                <div className="space-y-2">
                  <Label htmlFor="custom-key">Deadline name</Label>
                  <Input
                    id="custom-key"
                    value={customKey}
                    onChange={(e) => setCustomKey(e.target.value)}
                    placeholder="e.g. Discovery response, Motion filing"
                  />
                </div>
              )}

              {/* Due date */}
              <div className="space-y-2">
                <Label htmlFor="due-date">Due date</Label>
                <Input
                  id="due-date"
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>

              {/* Source */}
              <div className="space-y-2">
                <Label htmlFor="source">Source</Label>
                <Select value={source} onValueChange={setSource}>
                  <SelectTrigger className="w-full" id="source">
                    <SelectValue placeholder="How do you know this date?" />
                  </SelectTrigger>
                  <SelectContent>
                    {SOURCE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Rationale */}
              <div className="space-y-2">
                <Label htmlFor="rationale">
                  Notes <span className="text-warm-muted font-normal">(optional)</span>
                </Label>
                <Textarea
                  id="rationale"
                  value={rationale}
                  onChange={(e) => setRationale(e.target.value)}
                  placeholder="Any notes about this deadline?"
                  rows={3}
                />
              </div>

              {error && (
                <p className="text-sm text-calm-amber">{error}</p>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Saving...' : 'Save Deadline'}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
