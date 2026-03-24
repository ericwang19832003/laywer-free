'use client'

import { useState } from 'react'
import { Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface AIInsightBannerProps {
  message: string
  actionLabel: string
  onAction: () => void
}

export function AIInsightBanner({
  message,
  actionLabel,
  onAction,
}: AIInsightBannerProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <Card className="border-calm-indigo/20 bg-calm-indigo/5">
      <CardContent className="py-4 px-4">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-calm-indigo mt-0.5 shrink-0" />

          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground">{message}</p>

            <div className="mt-3 flex items-center gap-2">
              <Button
                size="sm"
                onClick={onAction}
                className="bg-calm-indigo text-white hover:bg-calm-indigo/90"
              >
                {actionLabel}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setDismissed(true)}
              >
                Dismiss
              </Button>
            </div>
          </div>

          <button
            onClick={() => setDismissed(true)}
            className="shrink-0 p-1 rounded-md hover:bg-calm-indigo/10 transition-colors"
            aria-label="Dismiss AI insight"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
