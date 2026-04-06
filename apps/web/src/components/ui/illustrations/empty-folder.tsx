'use client'

import { cn } from '@/lib/utils'

interface EmptyFolderProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function EmptyFolder({ className, size = 'md' }: EmptyFolderProps) {
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
      <rect x="15" y="25" width="90" height="70" rx="6" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="2" />
      <path d="M15 35C15 32.7909 16.7909 31 19 31H50L62 43H101C103.209 43 105 44.7909 105 47V90C105 92.2091 103.209 94 101 94H19C16.7909 94 15 92.2091 15 90V35Z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="2" />
      <path d="M50 31V43C50 45.2091 51.7909 47 54 47H62" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="60" cy="70" r="12" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" strokeDasharray="4 4" />
      <path d="M56 70L59 73L65 67" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.3" />
    </svg>
  )
}
