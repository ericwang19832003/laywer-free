'use client'

import { useState } from 'react'
import { CheckCircle2, Circle, X, ChevronRight } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface ChecklistItem {
  key: string
  label: string
  description: string
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

  const percentage = Math.round((completedCount / items.length) * 100)

  async function handleDismiss() {
    setDismissed(true)
    const supabase = createClient()
    await supabase.auth.updateUser({
      data: { onboarding: { dismissed: true } },
    })
  }

  return (
    <div className="rounded-lg border border-warm-border bg-white">
      <div className="flex items-center justify-between px-5 py-4 border-b border-warm-border">
        <div className="flex items-center gap-3 min-w-0">
          <h3 className="text-sm font-semibold text-warm-text whitespace-nowrap">Getting Started</h3>
          <div className="w-20">
            <Progress value={percentage} className="h-1.5" />
          </div>
          <span className="text-xs text-warm-muted">{completedCount}/{items.length}</span>
        </div>
        <button
          onClick={handleDismiss}
          className="p-1 rounded text-warm-muted hover:text-warm-text hover:bg-warm-border/50 shrink-0"
          aria-label="Dismiss checklist"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <ul className="divide-y divide-warm-border">
        {items.map((item) => (
          <li key={item.key}>
            <Link
              href={item.href}
              className={`flex items-center gap-3 px-5 py-3 transition-colors ${
                item.completed
                  ? 'opacity-60'
                  : 'hover:bg-gray-50'
              }`}
            >
              {item.completed ? (
                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
              ) : (
                <Circle className="h-4 w-4 text-warm-border shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <p className={`text-sm ${item.completed ? 'text-warm-muted' : 'text-warm-text font-medium'}`}>
                  {item.label}
                </p>
                {!item.completed && item.description && (
                  <p className="text-xs text-warm-muted mt-0.5">{item.description}</p>
                )}
              </div>
              {!item.completed && (
                <ChevronRight className="h-3.5 w-3.5 text-warm-muted shrink-0" />
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
