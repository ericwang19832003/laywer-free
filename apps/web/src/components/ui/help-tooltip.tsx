'use client'

import { useState } from 'react'
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react'

interface HelpTooltipProps {
  label?: string
  children: React.ReactNode
  variant?: 'inline' | 'expandable'
  icon?: boolean
}

export function HelpTooltip({
  label,
  children,
  variant = 'expandable',
  icon = true,
}: HelpTooltipProps) {
  const [open, setOpen] = useState(false)

  if (variant === 'inline') {
    return (
      <div className="text-xs text-warm-muted mt-1">{children}</div>
    )
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="text-xs text-calm-indigo hover:text-calm-indigo/80 flex items-center gap-1 mt-1"
      >
        {icon && <HelpCircle className="h-3.5 w-3.5" />}
        {label || 'What does this mean?'}
        {open ? (
          <ChevronUp className="h-3.5 w-3.5" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5" />
        )}
      </button>

      <div
        className="overflow-hidden transition-all duration-200"
        style={{ maxHeight: open ? '500px' : '0px' }}
      >
        <div className="rounded-lg bg-calm-indigo/5 border border-calm-indigo/20 p-3 mt-2 text-sm text-warm-text">
          {children}
        </div>
      </div>
    </div>
  )
}
