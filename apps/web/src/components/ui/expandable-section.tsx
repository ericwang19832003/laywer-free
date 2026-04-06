'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface ExpandableSectionProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}

export function ExpandableSection({
  title,
  children,
  defaultOpen = false,
}: ExpandableSectionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="rounded-lg border border-warm-border">
      <button
        type="button"
        className="w-full flex items-center justify-between py-3 px-4 text-left"
        onClick={() => setOpen(!open)}
      >
        <span className="text-sm font-medium text-warm-text pr-4">
          {title}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-warm-muted shrink-0 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${
          open ? 'max-h-[500px] pb-3' : 'max-h-0'
        }`}
      >
        <div className="text-sm text-warm-muted px-4">{children}</div>
      </div>
    </div>
  )
}
