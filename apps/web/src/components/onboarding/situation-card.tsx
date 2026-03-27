'use client'

import type { LucideIcon } from 'lucide-react'

interface SituationCardProps {
  icon: LucideIcon
  label: string
  description: string
  onSelect: () => void
}

export function SituationCard({ icon: Icon, label, description, onSelect }: SituationCardProps) {
  return (
    <button
      onClick={onSelect}
      className="flex flex-col items-center gap-2 p-4 rounded-lg border border-warm-border bg-white hover:border-calm-indigo/50 hover:bg-calm-indigo/5 transition-colors text-center"
    >
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-calm-indigo/10">
        <Icon className="h-5 w-5 text-calm-indigo" />
      </div>
      <span className="text-sm font-medium text-warm-text">{label}</span>
      <span className="text-xs text-warm-muted">{description}</span>
    </button>
  )
}
