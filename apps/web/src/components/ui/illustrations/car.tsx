'use client'

import { cn } from '@/lib/utils'

interface CarProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function Car({ className, size = 'md' }: CarProps) {
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
      className={cn('text-calm-blue', className)}
    >
      {/* Car body */}
      <path d="M15 65C15 60.5817 18.5817 57 23 57H45L55 40H75L85 57H97C101.418 57 105 60.5817 105 65V80C105 84.4183 101.418 88 97 88H23C18.5817 88 15 84.4183 15 80V65Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" />
      
      {/* Windows */}
      <path d="M48 42H65L72 57H48V42Z" fill="currentColor" fillOpacity="0.3" />
      <path d="M72 42H78L82 57H72V42Z" fill="currentColor" fillOpacity="0.3" />
      
      {/* Wheels */}
      <circle cx="35" cy="80" r="10" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="2" />
      <circle cx="35" cy="80" r="4" fill="currentColor" fillOpacity="0.5" />
      
      <circle cx="85" cy="80" r="10" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="2" />
      <circle cx="85" cy="80" r="4" fill="currentColor" fillOpacity="0.5" />
      
      {/* Headlights */}
      <circle cx="20" cy="68" r="4" fill="currentColor" fillOpacity="0.5" />
      <circle cx="100" cy="68" r="4" fill="currentColor" fillOpacity="0.5" />
    </svg>
  )
}
