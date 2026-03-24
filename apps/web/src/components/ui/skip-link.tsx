'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { Keyboard } from 'lucide-react'

export function SkipLink() {
  const skipLinkRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        skipLinkRef.current?.classList.remove('sr-only')
        skipLinkRef.current?.classList.add('sr-only-focusable')
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <Link
      ref={skipLinkRef}
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-calm-indigo focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-calm-indigo"
    >
      <span className="flex items-center gap-2">
        <Keyboard className="h-4 w-4" aria-hidden="true" />
        Skip to main content
      </span>
    </Link>
  )
}
