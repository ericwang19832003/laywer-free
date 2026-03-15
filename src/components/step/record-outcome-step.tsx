'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Handshake, Ban, Clock } from 'lucide-react'
import { toast } from 'sonner'

interface RecordOutcomeStepProps {
  caseId: string
  taskId: string
  onComplete: () => void
}

const OUTCOMES = [
  { value: 'won', label: 'Won', description: 'The court ruled in my favor', icon: CheckCircle, color: 'text-calm-green' },
  { value: 'lost', label: 'Lost', description: 'The court ruled against me', icon: XCircle, color: 'text-red-500' },
  { value: 'settled', label: 'Settled', description: 'We reached an agreement', icon: Handshake, color: 'text-calm-indigo' },
  { value: 'dismissed', label: 'Dismissed', description: 'The case was dismissed', icon: Ban, color: 'text-warm-muted' },
  { value: 'continued', label: 'Continued', description: 'The hearing was rescheduled', icon: Clock, color: 'text-calm-amber' },
] as const

export function RecordOutcomeStep({ caseId, taskId, onComplete }: RecordOutcomeStepProps) {
  const [selected, setSelected] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!selected) return
    setSaving(true)

    try {
      // Update case outcome
      const outcomeRes = await fetch(`/api/cases/${caseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outcome: selected }),
      })

      if (!outcomeRes.ok) {
        toast.error('Failed to save outcome')
        setSaving(false)
        return
      }

      // Complete the task only after outcome is saved
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      })

      onComplete()
    } catch {
      toast.error('Something went wrong')
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-warm-text">Record Your Outcome</h2>
        <p className="text-sm text-warm-muted mt-1">
          How did your case resolve? This helps us provide the right next steps.
        </p>
      </div>

      <div className="grid gap-3">
        {OUTCOMES.map((outcome) => {
          const Icon = outcome.icon
          const isSelected = selected === outcome.value
          return (
            <button
              key={outcome.value}
              onClick={() => setSelected(outcome.value)}
              className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                isSelected
                  ? 'border-calm-indigo bg-calm-indigo/5'
                  : 'border-warm-border hover:border-warm-muted'
              }`}
            >
              <Icon className={`h-6 w-6 shrink-0 ${outcome.color}`} />
              <div>
                <p className="font-medium text-warm-text">{outcome.label}</p>
                <p className="text-sm text-warm-muted">{outcome.description}</p>
              </div>
            </button>
          )
        })}
      </div>

      <Button
        onClick={handleSave}
        disabled={!selected || saving}
        className="w-full bg-calm-indigo hover:bg-calm-indigo/90"
      >
        {saving ? 'Saving...' : 'Save Outcome'}
      </Button>
    </div>
  )
}
