'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import type { ReminderEscalation } from '@/lib/schemas/reminder-escalation'

interface PriorityAlertsSectionProps {
  caseId: string
  alerts: ReminderEscalation[]
}

const LEVEL_STYLES: Record<number, string> = {
  3: 'border-l-red-500 bg-red-50',
  2: 'border-l-calm-amber bg-calm-amber/5',
  1: 'border-l-warm-border bg-warm-bg',
}

function formatDueDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function PriorityAlertsSection({ caseId, alerts: initialAlerts }: PriorityAlertsSectionProps) {
  const [alerts, setAlerts] = useState(initialAlerts)
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set())
  const router = useRouter()

  if (alerts.length === 0) return null

  async function handleAcknowledge(id: string) {
    if (pendingIds.has(id)) return
    setPendingIds((s) => new Set(s).add(id))
    const previous = alerts
    setAlerts((current) => current.filter((a) => a.id !== id))

    try {
      const res = await fetch(`/api/reminder-escalations/${id}/acknowledge`, {
        method: 'PATCH',
      })

      if (!res.ok) {
        setAlerts(previous)
        toast.error('Could not acknowledge this alert. Please try again.')
        return
      }

      router.refresh()
    } catch {
      setAlerts(previous)
      toast.error('Could not acknowledge this alert. Please try again.')
    } finally {
      setPendingIds((s) => { const next = new Set(s); next.delete(id); return next })
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-warm-muted uppercase tracking-wide">
        Priority Alerts
      </p>

      {alerts.map((alert) => (
        <div
          key={alert.id}
          data-testid={`alert-card-${alert.id}`}
          className={`rounded-lg border-l-4 px-4 py-3 ${LEVEL_STYLES[alert.escalation_level] ?? LEVEL_STYLES[1]}`}
        >
          <p className="text-sm text-warm-text">{alert.message}</p>
          {alert.due_at && (
            <p className="text-xs text-warm-muted mt-1">
              Due: {formatDueDate(alert.due_at)}
            </p>
          )}
          <div className="flex gap-2 mt-3">
            <Button variant="outline" size="sm" asChild>
              <Link href={alert.deadline_id ? `/case/${caseId}/deadlines` : `/case/${caseId}/health`}>Review</Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAcknowledge(alert.id)}
            >
              Acknowledge
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
