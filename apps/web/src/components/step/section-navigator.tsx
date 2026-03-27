'use client'

import { cn } from '@/lib/utils'
import { CheckCircle2, Circle, Loader2 } from 'lucide-react'
import type { SectionStatus } from '@/hooks/usePetitionCompleteness'

export interface SectionNavigatorProps {
  sections: SectionStatus[]
  activeSectionId?: string
  onSectionClick: (sectionId: string) => void
  className?: string
}

export function SectionNavigator({
  sections,
  activeSectionId,
  onSectionClick,
  className,
}: SectionNavigatorProps) {
  return (
    <nav className={cn('space-y-1', className)} aria-label="Petition sections">
      <h3 className="text-xs font-medium text-warm-muted uppercase tracking-wider mb-3">
        Petition Sections
      </h3>
      {sections.map((section) => {
        const isActive = section.id === activeSectionId
        const Icon = section.isComplete
          ? CheckCircle2
          : section.isInProgress
          ? Loader2
          : Circle

        return (
          <button
            key={section.id}
            onClick={() => onSectionClick(section.id)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all',
              isActive
                ? 'bg-calm-indigo/10 text-calm-indigo'
                : 'hover:bg-warm-bg text-warm-text'
            )}
          >
            <Icon
              className={cn(
                'h-4 w-4 shrink-0',
                section.isComplete
                  ? 'text-calm-green'
                  : section.isInProgress
                  ? 'text-calm-amber animate-pulse'
                  : 'text-warm-muted'
              )}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{section.title}</p>
              <p className="text-xs text-warm-muted">
                {section.completedFields} of {section.totalFields} fields
              </p>
            </div>
            <span
              className={cn(
                'text-xs font-medium',
                section.isComplete
                  ? 'text-calm-green'
                  : section.isInProgress
                  ? 'text-calm-amber'
                  : 'text-warm-muted'
              )}
            >
              {section.completionPercent}%
            </span>
          </button>
        )
      })}
    </nav>
  )
}
