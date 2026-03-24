'use client'

import { cn } from '@/lib/utils'

interface ScalesProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function Scales({ className, size = 'md' }: ScalesProps) {
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
      {/* Base */}
      <ellipse cx="60" cy="105" rx="25" ry="6" fill="currentColor" fillOpacity="0.2" />
      <rect x="55" y="75" width="10" height="30" fill="currentColor" fillOpacity="0.3" />
      
      {/* Beam */}
      <rect x="20" y="45" width="80" height="6" rx="3" fill="currentColor" />
      
      {/* Top */}
      <circle cx="60" cy="35" r="8" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="2" />
      
      {/* Left chain */}
      <line x1="25" y1="45" x2="25" y2="55" stroke="currentColor" strokeWidth="2" />
      
      {/* Left pan */}
      <ellipse cx="25" cy="65" rx="18" ry="8" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" />
      
      {/* Right chain */}
      <line x1="95" y1="45" x2="95" y2="55" stroke="currentColor" strokeWidth="2" />
      
      {/* Right pan */}
      <ellipse cx="95" cy="65" rx="18" ry="8" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}
