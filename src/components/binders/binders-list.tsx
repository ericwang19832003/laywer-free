'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  DownloadIcon,
  FolderOpenIcon,
  Loader2Icon,
  AlertCircleIcon,
  CheckCircle2Icon,
  ClockIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

type Binder = {
  id: string
  title: string
  status: 'queued' | 'building' | 'ready' | 'failed'
  error: string | null
  created_at: string
}

interface BindersListProps {
  caseId: string
  initialBinders: Binder[]
}

const STATUS_CONFIG = {
  queued: {
    label: 'Queued',
    className: 'bg-calm-amber/10 text-calm-amber border-calm-amber/20',
    icon: ClockIcon,
  },
  building: {
    label: 'Building',
    className: 'bg-calm-indigo/10 text-calm-indigo border-calm-indigo/20',
    icon: Loader2Icon,
  },
  ready: {
    label: 'Ready',
    className: 'bg-calm-green/10 text-calm-green border-calm-green/20',
    icon: CheckCircle2Icon,
  },
  failed: {
    label: 'Failed',
    className: 'bg-red-50 text-red-700 border-red-200',
    icon: AlertCircleIcon,
  },
} as const

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function BindersList({ caseId, initialBinders }: BindersListProps) {
  const [binders, setBinders] = useState<Binder[]>(initialBinders)
  const [downloading, setDownloading] = useState<string | null>(null)

  const hasPending = binders.some(
    (b) => b.status === 'queued' || b.status === 'building'
  )

  // Poll while any binder is queued or building
  const poll = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('trial_binders')
      .select('id, title, status, error, created_at')
      .eq('case_id', caseId)
      .order('created_at', { ascending: false })

    if (data) setBinders(data as Binder[])
  }, [caseId])

  useEffect(() => {
    if (!hasPending) return
    const interval = setInterval(poll, 3000)
    return () => clearInterval(interval)
  }, [hasPending, poll])

  async function handleDownload(binderId: string) {
    setDownloading(binderId)
    try {
      const res = await fetch(`/api/binders/${binderId}/download`)
      if (!res.ok) throw new Error('Download failed')
      const { url } = await res.json()
      window.open(url, '_blank')
    } catch {
      toast.error('Could not download binder. Please try again.')
    } finally {
      setDownloading(null)
    }
  }

  if (binders.length === 0) {
    return (
      <div className="py-16 text-center">
        <FolderOpenIcon className="mx-auto size-8 text-warm-muted/50" />
        <p className="mt-3 text-sm text-warm-muted">No binders yet.</p>
        <p className="mt-1 text-xs text-warm-muted">
          Go to your{' '}
          <Link
            href={`/case/${caseId}/exhibits`}
            className="text-calm-indigo underline underline-offset-2"
          >
            exhibits
          </Link>{' '}
          to generate one.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {binders.map((binder) => {
        const config = STATUS_CONFIG[binder.status]
        const StatusIcon = config.icon

        return (
          <Card key={binder.id}>
            <CardContent className="flex items-center gap-4 py-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-warm-text truncate">
                    {binder.title}
                  </p>
                  <Badge
                    variant="outline"
                    className={`shrink-0 ${config.className}`}
                  >
                    <StatusIcon
                      className={`mr-1 size-3 ${
                        binder.status === 'building' ? 'animate-spin' : ''
                      }`}
                    />
                    {config.label}
                  </Badge>
                </div>
                <p className="mt-0.5 text-xs text-warm-muted">
                  {formatDate(binder.created_at)}
                </p>
                {binder.status === 'failed' && binder.error && (
                  <p className="mt-1 text-xs text-red-600 line-clamp-2">
                    {binder.error}
                  </p>
                )}
              </div>

              {binder.status === 'ready' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(binder.id)}
                  disabled={downloading === binder.id}
                >
                  {downloading === binder.id ? (
                    <Loader2Icon className="mr-1.5 size-3.5 animate-spin" />
                  ) : (
                    <DownloadIcon className="mr-1.5 size-3.5" />
                  )}
                  Download
                </Button>
              )}

              {binder.status === 'building' && (
                <p className="shrink-0 text-xs text-warm-muted">
                  Generating…
                </p>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
