'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface MoreSectionProps {
  children: React.ReactNode
}

export function MoreSection({ children }: MoreSectionProps) {
  const [open, setOpen] = useState(false)

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full py-3 text-sm text-warm-muted hover:text-warm-text transition-colors"
      >
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        {open ? 'Show less' : 'More tools & details'}
      </button>
      {open && <div className="space-y-6">{children}</div>}
    </div>
  )
}
