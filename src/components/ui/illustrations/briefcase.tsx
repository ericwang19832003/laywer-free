'use client'

import { cn } from '@/lib/utils'

interface BriefcaseProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function Briefcase({ className, size = 'md' }: BriefcaseProps) {
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
      {/* Handle */}
      <path d="M45 40V30C45 25 50 20 60 20C70 20 75 25 75 30V40" stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none" />
      
      {/* Body */}
      <rect x="20" y="40" width="80" height="60" rx="6" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="3" />
      
      {/* Flap */}
      <path d="M20 55H100" stroke="currentColor" strokeWidth="2" />
      
      {/* Latches */}
      <rect x="35" y="50" width="10" height="15" rx="2" fill="currentColor" fillOpacity="0.4" />
      <rect x="75" y="50" width="10" height="15" rx="2" fill="currentColor" fillOpacity="0.4" />
      
      {/* Lock */}
      <circle cx="60" cy="65" r="6" fill="currentColor" fillOpacity="0.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}
