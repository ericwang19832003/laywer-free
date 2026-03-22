'use client'

import { cn } from '@/lib/utils'

interface SuccessProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function Success({ className, size = 'md' }: SuccessProps) {
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
      className={cn('text-calm-green', className)}
    >
      {/* Circle */}
      <circle cx="60" cy="60" r="45" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="4" />
      
      {/* Checkmark */}
      <path
        d="M35 60L52 77L85 44"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Sparkles */}
      <circle cx="25" cy="25" r="3" fill="currentColor" fillOpacity="0.5" />
      <circle cx="95" cy="25" r="4" fill="currentColor" fillOpacity="0.4" />
      <circle cx="20" cy="70" r="3" fill="currentColor" fillOpacity="0.3" />
      <circle cx="100" cy="75" r="3" fill="currentColor" fillOpacity="0.4" />
    </svg>
  )
}
