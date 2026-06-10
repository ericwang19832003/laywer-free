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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus } from 'lucide-react'

interface DeadlineFormDialogProps {
  caseId: string
}

// Grouped deadline type categories
const DEADLINE_CATEGORIES = [
  {
    label: 'Court-Set Dates',
    types: [
      { value: 'hearing_date', label: 'Hearing Date' },
      { value: 'trial_date', label: 'Trial Date' },
      { value: 'pretrial_conference', label: 'Pretrial Conference' },
      { value: 'status_hearing', label: 'Status Conference' },
      { value: 'settlement_conference', label: 'Settlement Conference' },
    ],
  },
  {
    label: 'Scheduling Order',
    types: [
      { value: 'discovery_cutoff', label: 'Discovery Cutoff' },
      { value: 'expert_disclosure', label: 'Expert Disclosure Deadline' },
      { value: 'dispositive_motions', label: 'Dispositive Motions Deadline' },
    ],
  },
  {
    label: 'Party Deadlines',
    types: [
      { value: 'answer_deadline', label: 'Answer Deadline' },
      { value: 'discovery_response_deadline', label: 'Discovery Response Deadline' },
      { value: 'demand_response', label: 'Demand Letter Response' },
    ],
  },
  {
    label: 'Judgment & Appeal',
    types: [
      { value: 'judgment_entered', label: 'Judgment Entered' },
      { value: 'appeal_deadline', label: 'Notice of Appeal Deadline' },
    ],
  },
  {
    label: 'Case Milestones',
    types: [
      { value: 'incident_date', label: 'Incident / Breach Date' },
    ],
  },
  {
    label: 'Other',
    types: [
      { value: 'other', label: 'Other (custom)' },
    ],
  },
] as const

type DeadlineTypeValue =
  | (typeof DEADLINE_CATEGORIES)[number]['types'][number]['value']

// Helper hints shown below the type selector for special keys
const TYPE_HINTS: Partial<Record<string, string>> = {
  incident_date: "We'll automatically calculate your statute of limitations deadline.",
  judgment_entered: "We'll automatically add your notice-of-appeal deadline.",
  discovery_cutoff: 'Marks the last day to request or produce discovery.',
}

const SOURCE_OPTIONS = [
  { value: 'user_confirmed', label: 'I confirmed this date' },
  { value: 'court_notice', label: 'Received from the court' },
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
    if (!nextOpen) resetForm()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const key = deadlineType === 'other' ? customKey.trim() : deadlineType
    if (!key) {
      setError('Please select or enter a deadline type.')
      return
    }
    if (!dueDate) {
      setError('Please enter a date.')
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

  const hint = TYPE_HINTS[deadlineType as DeadlineTypeValue]
  const isDateOnly = deadlineType === 'incident_date'

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm" className="gap-1.5">
          <Plus className="w-4 h-4" />
          Add Deadline
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {success ? (
          <div className="py-10 text-center">
            <div className="text-3xl mb-3">✓</div>
            <p className="text-base font-medium text-warm-text">
              Deadline saved.
            </p>
            <p className="text-sm text-warm-muted mt-1">
              We&apos;ll send reminders as the date approaches.
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Add a deadline</DialogTitle>
              <DialogDescription>
                Court, scheduling, and personal deadlines — we&apos;ll remind you ahead of time.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-5 pt-1">
              {/* Deadline type */}
              <div className="space-y-1.5">
                <Label htmlFor="deadline-type">Deadline type</Label>
                <Select value={deadlineType} onValueChange={setDeadlineType}>
                  <SelectTrigger id="deadline-type" className="w-full">
                    <SelectValue placeholder="Choose a type…" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEADLINE_CATEGORIES.map((cat) => (
                      <SelectGroup key={cat.label}>
                        <SelectLabel>{cat.label}</SelectLabel>
                        {cat.types.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
                {hint && (
                  <p className="text-xs text-calm-indigo">{hint}</p>
                )}
              </div>

              {/* Custom key (only for "Other") */}
              {deadlineType === 'other' && (
                <div className="space-y-1.5">
                  <Label htmlFor="custom-key">Deadline name</Label>
                  <Input
                    id="custom-key"
                    value={customKey}
                    onChange={(e) => setCustomKey(e.target.value)}
                    placeholder="e.g. Expert report, Mediation session"
                  />
                </div>
              )}

              {/* Due date */}
              <div className="space-y-1.5">
                <Label htmlFor="due-date">
                  {deadlineType === 'incident_date' ? 'Date of incident or breach' : 'Date'}
                </Label>
                <Input
                  id="due-date"
                  type={isDateOnly ? 'date' : 'datetime-local'}
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="block w-full"
                />
              </div>

              {/* Source */}
              <div className="space-y-1.5">
                <Label htmlFor="source">How do you know this date?</Label>
                <Select value={source} onValueChange={setSource}>
                  <SelectTrigger id="source" className="w-full">
                    <SelectValue placeholder="Select a source…" />
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

              {/* Notes */}
              <div className="space-y-1.5">
                <Label htmlFor="rationale">
                  Notes{' '}
                  <span className="text-warm-muted font-normal text-xs">(optional)</span>
                </Label>
                <Textarea
                  id="rationale"
                  value={rationale}
                  onChange={(e) => setRationale(e.target.value)}
                  placeholder="Case number, order reference, or any notes…"
                  rows={2}
                />
              </div>

              {error && (
                <p className="text-sm text-calm-amber">{error}</p>
              )}

              <div className="flex gap-3 pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1"
                  onClick={() => handleOpenChange(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? 'Saving…' : 'Save Deadline'}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
