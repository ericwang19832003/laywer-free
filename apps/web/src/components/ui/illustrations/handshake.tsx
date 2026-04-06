'use client'

import { cn } from '@/lib/utils'

interface HandshakeProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function Handshake({ className, size = 'md' }: HandshakeProps) {
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
      {/* Left arm */}
      <path d="M10 60C10 60 25 55 35 60L50 65" stroke="currentColor" strokeWidth="8" strokeLinecap="round" fill="none" />
      
      {/* Right arm */}
      <path d="M110 60C110 60 95 55 85 60L70 65" stroke="currentColor" strokeWidth="8" strokeLinecap="round" fill="none" />
      
      {/* Hands clasped */}
      <ellipse cx="60" cy="62" rx="15" ry="10" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="2" />
      
      {/* Left hand */}
      <circle cx="50" cy="60" r="8" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" />
      
      {/* Right hand */}
      <circle cx="70" cy="60" r="8" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" />
      
      {/* Fingers details */}
      <path d="M45 55C45 55 50 50 55 55" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M65 55C65 55 70 50 75 55" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      
      {/* Sparkles */}
      <circle cx="30" cy="40" r="3" fill="currentColor" fillOpacity="0.5" />
      <circle cx="90" cy="40" r="3" fill="currentColor" fillOpacity="0.5" />
      <circle cx="60" cy="30" r="2" fill="currentColor" fillOpacity="0.4" />
    </svg>
  )
}
