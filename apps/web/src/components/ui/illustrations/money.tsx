'use client'

import { cn } from '@/lib/utils'

interface MoneyProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function Money({ className, size = 'md' }: MoneyProps) {
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
      {/* Dollar sign */}
      <circle cx="60" cy="60" r="40" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="3" />
      
      {/* Dollar sign path */}
      <path
        d="M60 30V35M60 85V90M60 45C50 45 45 50 45 58C45 68 60 68 60 75C60 82 70 85 75 80"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  )
}
