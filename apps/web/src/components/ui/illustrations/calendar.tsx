'use client'

import { cn } from '@/lib/utils'

interface CalendarProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function Calendar({ className, size = 'md' }: CalendarProps) {
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
      className={cn('text-calm-indigo', className)}
    >
      {/* Calendar body */}
      <rect x="15" y="30" width="90" height="80" rx="8" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="3" />
      
      {/* Header */}
      <rect x="15" y="30" width="90" height="25" rx="8" fill="currentColor" fillOpacity="0.2" />
      <rect x="15" y="45" width="90" height="10" fill="currentColor" fillOpacity="0.2" />
      
      {/* Rings */}
      <rect x="35" y="25" width="8" height="15" rx="2" fill="currentColor" />
      <rect x="77" y="25" width="8" height="15" rx="2" fill="currentColor" />
      
      {/* Grid dots */}
      <circle cx="35" cy="75" r="4" fill="currentColor" fillOpacity="0.3" />
      <circle cx="60" cy="75" r="4" fill="currentColor" fillOpacity="0.3" />
      <circle cx="85" cy="75" r="4" fill="currentColor" fillOpacity="0.3" />
      
      <circle cx="35" cy="95" r="4" fill="currentColor" fillOpacity="0.3" />
      <circle cx="60" cy="95" r="4" fill="currentColor" fillOpacity="0.3" />
      <circle cx="85" cy="95" r="4" fill="currentColor" fillOpacity="0.3" />
      
      {/* Highlighted date */}
      <circle cx="60" cy="75" r="6" fill="currentColor" />
    </svg>
  )
}
