'use client'

import { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'

interface ChecklistItemProps {
  id: string
  label: string
  description: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}

export function ChecklistItem({ id, label, description, checked, onCheckedChange }: ChecklistItemProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="rounded-lg border border-warm-border p-3">
      <div className="flex items-start gap-3">
        <Checkbox id={id} checked={checked} onCheckedChange={(c) => onCheckedChange(c === true)} className="mt-0.5" />
        <div className="flex-1">
          <button type="button" onClick={() => setExpanded(!expanded)} className="text-left w-full">
            <span className={`text-sm font-medium ${checked ? 'text-warm-muted line-through' : 'text-warm-text'}`}>
              {label}
            </span>
            <span className="text-xs text-warm-muted ml-2">{expanded ? '▾' : '▸'}</span>
          </button>
          {expanded && (
            <div className="mt-2 text-sm text-warm-muted leading-relaxed whitespace-pre-line">
              {description}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
