'use client'

import { cn } from '@/lib/utils'

interface HouseProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function House({ className, size = 'md' }: HouseProps) {
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
      {/* Roof */}
      <path d="M60 20L20 55H100L60 20Z" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      
      {/* House body */}
      <rect x="30" y="55" width="60" height="45" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" />
      
      {/* Door */}
      <rect x="50" y="70" width="20" height="30" fill="currentColor" fillOpacity="0.4" stroke="currentColor" strokeWidth="2" />
      <circle cx="66" cy="87" r="2" fill="currentColor" />
      
      {/* Windows */}
      <rect x="36" y="65" width="10" height="12" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1.5" />
      <rect x="74" y="65" width="10" height="12" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1.5" />
      
      {/* Chimney */}
      <rect x="80" y="30" width="10" height="20" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}
