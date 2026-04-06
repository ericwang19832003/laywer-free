'use client'

import { cn } from '@/lib/utils'
import {
  Upload,
  Tags,
  Search,
  FileText,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react'
import type { PipelineStage } from '@lawyer-free/shared/schemas/case-file'

export interface StageInfo {
  key: PipelineStage
  label: string
  icon: LucideIcon
  count: string
  complete: boolean
}

interface PipelineBarProps {
  stages: StageInfo[]
  activeStage: PipelineStage
  onStageClick: (stage: PipelineStage) => void
}

export function PipelineBar({
  stages,
  activeStage,
  onStageClick,
}: PipelineBarProps) {
  return (
    <nav
      aria-label="Case pipeline stages"
      className="flex items-center gap-1 overflow-x-auto pb-1"
    >
      {stages.map((stage, index) => {
        const Icon = stage.icon
        const isActive = stage.key === activeStage

        return (
          <div key={stage.key} className="flex items-center">
            {/* Chevron separator between stages */}
            {index > 0 && (
              <ChevronRight
                className="mx-1 size-4 shrink-0 text-warm-muted"
                aria-hidden="true"
              />
            )}

            {/* Stage card */}
            <button
              type="button"
              onClick={() => onStageClick(stage.key)}
              className={cn(
                'group relative flex min-w-[120px] flex-col items-center gap-1.5 rounded-lg border px-4 py-3 text-center transition-colors',
                isActive
                  ? 'border-calm-indigo bg-calm-indigo/5 text-warm-text'
                  : 'border-warm-border bg-white text-warm-muted hover:border-warm-border/80 hover:bg-warm-bg'
              )}
              aria-current={isActive ? 'step' : undefined}
            >
              <Icon
                className={cn(
                  'size-5 shrink-0 transition-colors',
                  isActive
                    ? 'text-calm-indigo'
                    : 'text-warm-muted group-hover:text-warm-text'
                )}
                aria-hidden="true"
              />

              <span
                className={cn(
                  'text-xs font-medium leading-tight',
                  isActive ? 'text-warm-text' : 'text-warm-muted'
                )}
              >
                {stage.label}
              </span>

              <span
                className={cn(
                  'text-[11px] tabular-nums leading-none',
                  isActive ? 'text-calm-indigo' : 'text-warm-muted'
                )}
              >
                {stage.count}
              </span>

              {/* Bottom progress indicator */}
              <span
                className={cn(
                  'absolute inset-x-0 bottom-0 h-0.5 rounded-b-lg transition-colors',
                  stage.complete ? 'bg-calm-green' : 'bg-warm-border'
                )}
                aria-hidden="true"
              />
            </button>
          </div>
        )
      })}
    </nav>
  )
}
