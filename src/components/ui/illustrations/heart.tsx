'use client'

import { cn } from '@/lib/utils'

interface HeartProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function Heart({ className, size = 'md' }: HeartProps) {
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
      className={cn('text-calm-red', className)}
    >
      <path
        d="M60 100C60 100 15 70 15 40C15 20 35 15 50 25C55 28 58 32 60 35C62 32 65 28 70 25C85 15 105 20 105 40C105 70 60 100 60 100Z"
        fill="currentColor"
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Shine */}
      <ellipse cx="40" cy="40" rx="8" ry="5" fill="white" fillOpacity="0.4" transform="rotate(-30 40 40)" />
    </svg>
  )
}
