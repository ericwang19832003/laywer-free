'use client'

import { cn } from '@/lib/utils'

interface WarningProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function Warning({ className, size = 'md' }: WarningProps) {
  const dimensions = {
    sm: { width: 80, height: 80 },
    md: { width: 120, height: 120 },
    lg: { width: 160, height: 160 },
  }

  const { width, height } = dimensions[size]

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('text-calm-amber', className)}
    >
      {/* Triangle */}
      <path
        d="M60 15L105 100H15L60 15Z"
        fill="currentColor"
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      
      {/* Exclamation background */}
      <circle cx="60" cy="75" r="15" fill="currentColor" fillOpacity="0.3" />
      
      {/* Exclamation mark */}
      <rect x="55" y="50" width="10" height="25" rx="3" fill="currentColor" />
      <circle cx="60" cy="85" r="5" fill="currentColor" />
    </svg>
  )
}
