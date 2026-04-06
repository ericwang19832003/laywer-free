'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Share2Icon, CopyIcon, CheckIcon } from 'lucide-react'
import { toast } from 'sonner'

interface ShareCaseCardProps {
  caseId: string
  initialEnabled: boolean
  initialToken: string | null
}

export function ShareCaseCard({ caseId, initialEnabled, initialToken }: ShareCaseCardProps) {
  const [enabled, setEnabled] = useState(initialEnabled)
  const [token, setToken] = useState(initialToken)
  const [toggling, setToggling] = useState(false)
  const [copied, setCopied] = useState(false)

  const shareUrl = token ? `${typeof window !== 'undefined' ? window.location.origin : ''}/shared/${token}` : ''

  async function handleToggle() {
    setToggling(true)
    try {
      const res = await fetch(`/api/cases/${caseId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !enabled }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setEnabled(data.share_enabled)
      setToken(data.share_token)
      toast.success(data.share_enabled ? 'Share link enabled' : 'Share link disabled')
    } catch {
      toast.error('Failed to update sharing')
    } finally {
      setToggling(false)
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    toast.success('Link copied')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card>
      <CardContent className="pt-5 pb-4 px-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-warm-text">Share Case</h3>
          <Button
            variant={enabled ? 'outline' : 'default'}
            size="sm"
            onClick={handleToggle}
            disabled={toggling}
            className="h-auto px-3 py-1.5 text-xs"
          >
            <Share2Icon className="mr-1.5 h-3 w-3" />
            {enabled ? 'Disable Link' : 'Enable Link'}
          </Button>
        </div>
        <p className="text-xs text-warm-muted mb-3">
          {enabled
            ? 'Anyone with this link can view basic case info (deadlines, status). No documents or evidence are shared.'
            : 'Generate a read-only link to share basic case info with a family member or advisor.'}
        </p>
        {enabled && token && (
          <div className="flex gap-2">
            <Input value={shareUrl} readOnly className="text-xs bg-warm-bg" />
            <Button variant="outline" size="sm" onClick={handleCopy} className="shrink-0">
              {copied ? <CheckIcon className="h-3.5 w-3.5" /> : <CopyIcon className="h-3.5 w-3.5" />}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
