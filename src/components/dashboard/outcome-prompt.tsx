'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const OUTCOME_OPTIONS = [
  { value: 'won', label: 'Won', description: 'The court ruled in your favor' },
  { value: 'settled', label: 'Settled', description: 'You reached an agreement' },
  { value: 'lost', label: 'Lost', description: 'The court ruled against you' },
  { value: 'dropped', label: 'Dropped', description: 'The case was dismissed or withdrawn' },
  { value: 'ongoing', label: 'Still Ongoing', description: 'The case is still active' },
] as const

interface OutcomePromptProps {
  caseId: string
  currentOutcome: string | null
  allTasksDone: boolean
}

export function OutcomePrompt({ caseId, currentOutcome, allTasksDone }: OutcomePromptProps) {
  const [selected, setSelected] = useState<string | null>(currentOutcome)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(!!currentOutcome)
  const [dismissed, setDismissed] = useState(false)

  if (!allTasksDone || dismissed) return null
  if (saved && currentOutcome) return null

  async function handleSubmit() {
    if (!selected) return
    setSaving(true)
    try {
      const res = await fetch(`/api/cases/${caseId}/outcome`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outcome: selected, outcome_notes: notes || undefined }),
      })
      if (res.ok) {
        setSaved(true)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="border-calm-green/30 bg-calm-green/5">
      <CardHeader>
        <CardTitle className="text-lg text-warm-text">
          How did your case turn out?
        </CardTitle>
        <p className="text-sm text-warm-muted">
          Your progress helps us improve guidance for others in similar situations.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {OUTCOME_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelected(option.value)}
              className={`p-3 rounded-lg border text-left transition-colors ${
                selected === option.value
                  ? 'border-calm-indigo bg-calm-indigo/5 text-warm-text'
                  : 'border-warm-border hover:border-warm-muted text-warm-muted'
              }`}
            >
              <div className="font-medium text-sm">{option.label}</div>
              <div className="text-xs mt-0.5 opacity-75">{option.description}</div>
            </button>
          ))}
        </div>

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any notes about the outcome? (optional)"
          maxLength={2000}
          className="w-full rounded-lg border border-warm-border bg-white p-3 text-sm text-warm-text placeholder:text-warm-muted/50 resize-none h-20"
        />

        <div className="flex gap-2">
          <Button
            onClick={handleSubmit}
            disabled={!selected || saving}
          >
            {saving ? 'Saving...' : 'Save Outcome'}
          </Button>
          <Button
            variant="ghost"
            onClick={() => setDismissed(true)}
          >
            Ask me later
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
