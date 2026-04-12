'use client'

import { useState } from 'react'

interface GlossaryTooltipProps {
  term: string
  plainEnglish: string
}

export function GlossaryTooltip({ term, plainEnglish }: GlossaryTooltipProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span
        className="font-semibold text-calm-indigo cursor-help border-b border-dashed border-calm-indigo/40"
        title={plainEnglish}
      >
        {term}
      </span>

      {showTooltip && (
        <span
          role="tooltip"
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 rounded-lg bg-warm-text text-white text-xs p-2.5 shadow-lg z-10 transition-opacity duration-150"
        >
          {plainEnglish}
        </span>
      )}
    </span>
  )
}
