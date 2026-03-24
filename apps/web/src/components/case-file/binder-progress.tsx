'use client'

import { useEffect, useRef, useState } from 'react'
import {
  CheckCircle2,
  Loader2,
  AlertCircle,
  Circle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Types ───────────────────────────────────

type StepStatus = 'done' | 'running' | 'failed' | 'pending'

interface ProgressStep {
  key: string
  status: StepStatus
}

interface ProgressPayload {
  status: 'pending' | 'running' | 'complete' | 'failed'
  percent: number
  steps: ProgressStep[]
  error?: string
}

interface BinderProgressProps {
  binderId: string
  onComplete: () => void
}

// ── Step labels ─────────────────────────────

const STEP_LABELS: Record<string, string> = {
  summary_generation: 'Generating case summary',
  exhibit_index: 'Building exhibit index',
  timeline_compilation: 'Compiling timeline',
  exhibit_download: 'Downloading exhibits',
  discovery_packaging: 'Packaging discovery',
  strategy_generation: 'Generating strategy notes',
  zip_creation: 'Creating ZIP archive',
}

// ── Status icons ────────────────────────────

function StepIcon({ status }: { status: StepStatus }) {
  switch (status) {
    case 'done':
      return <CheckCircle2 className="size-4 shrink-0 text-calm-green" />
    case 'running':
      return (
        <Loader2 className="size-4 shrink-0 animate-spin text-calm-indigo" />
      )
    case 'failed':
      return <AlertCircle className="size-4 shrink-0 text-destructive" />
    case 'pending':
    default:
      return <Circle className="size-4 shrink-0 text-warm-border" />
  }
}

// ── Component ───────────────────────────────

export function BinderProgress({ binderId, onComplete }: BinderProgressProps) {
  const [data, setData] = useState<ProgressPayload | null>(null)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null
    let cancelled = false

    async function poll() {
      try {
        const res = await fetch(`/api/binders/${binderId}/progress`)
        if (!res.ok) throw new Error('fetch failed')
        const payload: ProgressPayload = await res.json()

        if (cancelled) return
        setData(payload)

        if (payload.status === 'complete') {
          onCompleteRef.current()
          return
        }

        if (payload.status === 'failed') return

        timer = setTimeout(poll, 2000)
      } catch {
        if (cancelled) return
        timer = setTimeout(poll, 5000)
      }
    }

    poll()

    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
    }
  }, [binderId])

  if (!data) {
    return (
      <div className="flex items-center gap-2 py-4 text-sm text-warm-muted">
        <Loader2 className="size-4 animate-spin text-calm-indigo" />
        Connecting...
      </div>
    )
  }

  const isFailed = data.status === 'failed'

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-warm-text">
            {isFailed ? 'Build failed' : 'Building binder'}
          </span>
          <span
            className={cn(
              'tabular-nums',
              isFailed ? 'text-destructive' : 'text-warm-muted'
            )}
          >
            {data.percent}%
          </span>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-warm-bg">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              isFailed ? 'bg-destructive' : 'bg-calm-indigo'
            )}
            style={{ width: `${data.percent}%` }}
          />
        </div>
      </div>

      {/* Step list */}
      <ul className="space-y-2">
        {data.steps.map((step) => (
          <li key={step.key} className="flex items-center gap-2">
            <StepIcon status={step.status} />
            <span
              className={cn(
                'text-sm',
                step.status === 'done' && 'text-warm-muted',
                step.status === 'running' && 'font-medium text-warm-text',
                step.status === 'failed' && 'font-medium text-destructive',
                step.status === 'pending' && 'text-warm-muted/60'
              )}
            >
              {STEP_LABELS[step.key] ?? step.key}
            </span>
          </li>
        ))}
      </ul>

      {/* Error message */}
      {isFailed && data.error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2.5">
          <p className="text-xs text-destructive">{data.error}</p>
        </div>
      )}
    </div>
  )
}
