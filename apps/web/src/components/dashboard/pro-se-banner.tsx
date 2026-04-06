'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Scale, X } from 'lucide-react'

const STORAGE_KEY = 'pro-se-banner-dismissed'

export default function ProSeBanner() {
  const [dismissed, setDismissed] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored !== 'true') {
      setDismissed(false)
    }
  }, [])

  function handleDismiss() {
    localStorage.setItem(STORAGE_KEY, 'true')
    setDismissed(true)
  }

  if (dismissed) return null

  return (
    <Card className="mb-4 border-calm-indigo/20 bg-calm-indigo/5">
      <CardContent className="py-4 px-4">
        <div className="flex items-start gap-3">
          <Scale className="h-5 w-5 text-calm-indigo mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-foreground">
              You are representing yourself (&ldquo;Pro Se&rdquo;)
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              &ldquo;Pro se&rdquo; (pronounced &ldquo;pro say&rdquo;) means
              you&apos;re handling your own case without a lawyer. This is
              completely legal and common. We&apos;ll guide you through every
              step and explain legal terms as they come up. This tool is not a
              lawyer&nbsp;&mdash; it helps you format documents, but you make all
              the decisions.
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="shrink-0 p-1 rounded-md hover:bg-calm-indigo/10 transition-colors"
            aria-label="Dismiss pro se banner"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
