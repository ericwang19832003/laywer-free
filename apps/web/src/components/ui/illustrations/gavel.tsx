'use client'

import { cn } from '@/lib/utils'

interface GavelProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function Gavel({ className, size = 'md' }: GavelProps) {
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
      className={cn('text-warm-brown', className)}
    >
      {/* Sound block */}
      <rect x="20" y="90" width="80" height="10" rx="3" fill="currentColor" fillOpacity="0.3" />
      
      {/* Gavel head */}
      <rect x="45" y="25" width="30" height="45" rx="4" fill="currentColor" />
      <rect x="45" y="30" width="30" height="35" rx="3" fill="currentColor" fillOpacity="0.8" />
      
      {/* Gavel handle */}
      <rect x="55" y="70" width="10" height="35" rx="2" fill="currentColor" fillOpacity="0.7" transform="rotate(-15 60 87)" />
      
      {/* Highlight */}
      <rect x="50" y="32" width="5" height="25" rx="2" fill="white" fillOpacity="0.2" />
    </svg>
  )
}
