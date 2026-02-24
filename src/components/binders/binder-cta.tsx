'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PackageIcon, Loader2Icon, AlertTriangleIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface BinderCtaProps {
  caseId: string
  exhibitSetId: string | null
}

export function BinderCta({ caseId, exhibitSetId }: BinderCtaProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [includeTimeline, setIncludeTimeline] = useState(false)
  const [includeDeadlines, setIncludeDeadlines] = useState(false)
  const [includeAllEvidence, setIncludeAllEvidence] = useState(false)
  const [totalBytes, setTotalBytes] = useState<number | null>(null)

  const SIZE_THRESHOLD = 250 * 1024 * 1024 // 250 MB

  const loadSize = useCallback(async () => {
    if (!exhibitSetId) return
    const supabase = createClient()
    const { data } = await supabase
      .from('exhibits')
      .select('evidence_items(file_size)')
      .eq('exhibit_set_id', exhibitSetId)

    if (data) {
      const total = data.reduce((sum, ex) => {
        const ev = ex.evidence_items as unknown as { file_size: number | null } | null
        return sum + (ev?.file_size ?? 0)
      }, 0)
      setTotalBytes(total)
    }
  }, [exhibitSetId])

  useEffect(() => {
    if (open) loadSize()
  }, [open, loadSize])

  function formatBytes(bytes: number): string {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
  }

  async function handleGenerate() {
    if (!exhibitSetId) return
    setLoading(true)

    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      // 1. Create binder
      const createRes = await fetch(`/api/cases/${caseId}/binders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': document.cookie,
        },
        body: JSON.stringify({
          exhibit_set_id: exhibitSetId,
          options: {
            include_timeline: includeTimeline,
            include_deadlines: includeDeadlines,
            include_all_evidence: includeAllEvidence,
          },
        }),
      })

      if (!createRes.ok) {
        const err = await createRes.json()
        throw new Error(err.error || 'Failed to create binder')
      }

      const { binder } = await createRes.json()

      // 2. Fire build (don't await — navigate immediately)
      fetch(`/api/binders/${binder.id}/generate`, {
        method: 'POST',
        headers: { 'Cookie': document.cookie },
      }).catch(() => {
        // Build errors are captured in the DB — the binders page will show them
      })

      toast.success('Binder generation started.')
      setOpen(false)
      router.push(`/case/${caseId}/binders`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  if (!exhibitSetId) return null

  return (
    <>
      <Card className="border-calm-indigo/20 bg-calm-indigo/5">
        <CardContent className="flex items-start gap-4 py-5">
          <div className="rounded-lg bg-calm-indigo/10 p-2.5">
            <PackageIcon className="size-5 text-calm-indigo" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-warm-text">
              Export your Trial Binder
            </h3>
            <p className="mt-0.5 text-sm text-warm-muted">
              We&apos;ll package your exhibit list and files into a single download.
            </p>
          </div>
          <Button
            size="sm"
            className="shrink-0"
            onClick={() => setOpen(true)}
          >
            Generate binder
          </Button>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Trial Binder</DialogTitle>
            <DialogDescription>
              Choose what to include in your binder. Your exhibits are always included.
            </DialogDescription>
          </DialogHeader>

          {totalBytes !== null && totalBytes > SIZE_THRESHOLD && (
            <div className="flex items-start gap-2 rounded-lg border border-calm-amber/30 bg-calm-amber/5 px-3 py-2.5">
              <AlertTriangleIcon className="mt-0.5 size-4 shrink-0 text-calm-amber" />
              <p className="text-xs text-warm-text">
                Your exhibits total ~{formatBytes(totalBytes)}. This binder may
                be large and take extra time to generate.
              </p>
            </div>
          )}

          <div className="space-y-4 py-2">
            <ToggleOption
              label="Include timeline"
              description="A record of actions taken on this case"
              checked={includeTimeline}
              onChange={setIncludeTimeline}
            />
            <ToggleOption
              label="Include deadlines"
              description="Important dates and their sources"
              checked={includeDeadlines}
              onChange={setIncludeDeadlines}
            />
            <ToggleOption
              label="Include all evidence files"
              description="Bundle every uploaded file, not just exhibited ones"
              checked={includeAllEvidence}
              onChange={setIncludeAllEvidence}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={handleGenerate} disabled={loading}>
              {loading ? (
                <>
                  <Loader2Icon className="mr-2 size-4 animate-spin" />
                  Generating…
                </>
              ) : (
                'Generate'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// ── Toggle row ──────────────────────────────

function ToggleOption({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-lg border border-warm-border px-4 py-3 transition-colors hover:bg-warm-bg">
      <div>
        <p className="text-sm font-medium text-warm-text">{label}</p>
        <p className="text-xs text-warm-muted">{description}</p>
      </div>
      <div className="relative ml-4 shrink-0">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div className="h-5 w-9 rounded-full bg-warm-border transition-colors peer-checked:bg-calm-indigo" />
        <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
      </div>
    </label>
  )
}
