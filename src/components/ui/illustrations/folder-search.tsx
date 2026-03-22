'use client'

import { cn } from '@/lib/utils'

interface FolderSearchProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function FolderSearch({ className, size = 'md' }: FolderSearchProps) {
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
      {/* Folder */}
      <path d="M15 35C15 32.7909 16.7909 31 19 31H50L62 43H101C103.209 43 105 44.7909 105 47V90C105 92.2091 103.209 94 101 94H19C16.7909 94 15 92.2091 15 90V35Z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="2" />
      
      {/* Search glass */}
      <circle cx="75" cy="65" r="18" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="3" />
      
      {/* Search handle */}
      <line x1="88" y1="78" x2="100" y2="90" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      
      {/* Question mark in glass */}
      <path d="M68 60C68 55 72 52 76 52C80 52 84 55 84 60C84 64 80 66 76 68M76 72V75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
