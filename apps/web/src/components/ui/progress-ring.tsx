'use client'

import { cn } from '@/lib/utils'

interface ProgressRingProps {
  progress: number
  size?: number
  strokeWidth?: number
  className?: string
  showPercentage?: boolean
  color?: 'primary' | 'success' | 'warning' | 'error'
}

export function ProgressRing({
  progress,
  size = 80,
  strokeWidth = 8,
  className,
  showPercentage = true,
  color = 'primary',
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (progress / 100) * circumference

  const colors = {
    primary: 'stroke-primary',
    success: 'stroke-calm-green',
    warning: 'stroke-calm-amber',
    error: 'stroke-destructive',
  }

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-warm-border"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn(colors[color], 'transition-all duration-500 ease-out')}
        />
      </svg>
      {showPercentage && (
        <span className="absolute text-sm font-semibold text-warm-text">
          {Math.round(progress)}%
        </span>
      )}
    </div>
  )
}

interface ProgressBarProps {
  progress: number
  className?: string
  color?: 'primary' | 'success' | 'warning' | 'error'
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function ProgressBar({
  progress,
  className,
  color = 'primary',
  showLabel = false,
  size = 'md',
}: ProgressBarProps) {
  const heights = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  }

  const colors = {
    primary: 'bg-primary',
    success: 'bg-calm-green',
    warning: 'bg-calm-amber',
    error: 'bg-destructive',
  }

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between text-sm mb-1">
          <span className="text-warm-muted">Progress</span>
          <span className="font-medium text-warm-text">{Math.round(progress)}%</span>
        </div>
      )}
      <div className={cn('w-full bg-warm-border rounded-full overflow-hidden', heights[size])}>
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            colors[color]
          )}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  )
}

interface StepProgressProps {
  steps: string[]
  currentStep: number
  className?: string
}

export function StepProgress({ steps, currentStep, className }: StepProgressProps) {
  return (
    <div className={cn('flex items-center', className)}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep
        const isCurrent = index === currentStep
        const isLast = index === steps.length - 1

        return (
          <div key={index} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300',
                  isCompleted && 'bg-primary text-white',
                  isCurrent && 'bg-primary text-white ring-4 ring-primary/20',
                  !isCompleted && !isCurrent && 'bg-warm-border text-warm-muted'
                )}
              >
                {isCompleted ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={cn(
                  'mt-2 text-xs text-center max-w-[60px]',
                  isCurrent ? 'text-warm-text font-medium' : 'text-warm-muted'
                )}
              >
                {step}
              </span>
            </div>
            {!isLast && (
              <div
                className={cn(
                  'w-8 h-0.5 mx-1 -mt-6',
                  index < currentStep ? 'bg-primary' : 'bg-warm-border'
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
