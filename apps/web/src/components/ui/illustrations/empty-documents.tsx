'use client'

import { cn } from '@/lib/utils'

interface EmptyDocumentsProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function EmptyDocuments({ className, size = 'md' }: EmptyDocumentsProps) {
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
      className={cn('text-warm-muted', className)}
    >
      {/* Back document */}
      <rect x="30" y="20" width="50" height="65" rx="4" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" />
      <line x1="40" y1="35" x2="70" y2="35" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" strokeLinecap="round" />
      <line x1="40" y1="45" x2="65" y2="45" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" strokeLinecap="round" />
      <line x1="40" y1="55" x2="60" y2="55" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" strokeLinecap="round" />
      
      {/* Middle document */}
      <rect x="40" y="30" width="50" height="65" rx="4" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2" strokeOpacity="0.5" />
      <line x1="50" y1="45" x2="80" y2="45" stroke="currentColor" strokeWidth="2" strokeOpacity="0.5" strokeLinecap="round" />
      <line x1="50" y1="55" x2="75" y2="55" stroke="currentColor" strokeWidth="2" strokeOpacity="0.5" strokeLinecap="round" />
      <line x1="50" y1="65" x2="70" y2="65" stroke="currentColor" strokeWidth="2" strokeOpacity="0.5" strokeLinecap="round" />
      
      {/* Front document */}
      <rect x="50" y="40" width="50" height="65" rx="4" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" />
      <line x1="60" y1="55" x2="90" y2="55" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="60" y1="65" x2="85" y2="65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="60" y1="75" x2="80" y2="75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="60" y1="85" x2="75" y2="85" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
