'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2Icon, CircleIcon, XIcon } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface ChecklistItem {
  key: string
  label: string
  href: string
  completed: boolean
}

interface OnboardingChecklistProps {
  items: ChecklistItem[]
  dismissed: boolean
}

export function OnboardingChecklist({ items: initialItems, dismissed: initialDismissed }: OnboardingChecklistProps) {
  const [dismissed, setDismissed] = useState(initialDismissed)
  const [items] = useState(initialItems)

  if (dismissed) return null

  const completedCount = items.filter((i) => i.completed).length
  if (completedCount === items.length) return null

  async function handleDismiss() {
    setDismissed(true)
    const supabase = createClient()
    await supabase.auth.updateUser({
      data: { onboarding: { dismissed: true } },
    })
  }

  return (
    <Card className="border-calm-indigo/20 bg-calm-indigo/5 mb-6">
      <CardContent className="pt-5 pb-4 px-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-warm-text">Getting Started</h3>
            <p className="text-xs text-warm-muted mt-0.5">
              {completedCount} of {items.length} complete
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 rounded text-warm-muted hover:text-warm-text hover:bg-warm-border/50"
            aria-label="Dismiss checklist"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-2">
          {items.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
                item.completed
                  ? 'text-warm-muted'
                  : 'text-warm-text hover:bg-white/60'
              }`}
            >
              {item.completed ? (
                <CheckCircle2Icon className="h-4 w-4 text-calm-green shrink-0" />
              ) : (
                <CircleIcon className="h-4 w-4 text-warm-muted shrink-0" />
              )}
              <span className={item.completed ? 'line-through' : ''}>{item.label}</span>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
