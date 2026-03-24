'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Briefcase, Calendar, FolderOpen, FileText, Home, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/cases', label: 'Cases', icon: Briefcase },
  { href: '/learn', label: 'Learn', icon: FileText },
  { href: '/settings', label: 'Settings', icon: Settings },
]

interface BottomNavProps {
  caseId?: string
}

export function BottomNav({ caseId }: BottomNavProps) {
  const pathname = usePathname()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsVisible(window.innerWidth < 1024)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  if (!isVisible) return null

  const getActiveHref = () => {
    if (pathname.includes('/case/') && pathname.endsWith('/deadlines')) {
      return 'deadlines'
    }
    if (pathname.includes('/case/') && pathname.includes('/evidence')) {
      return 'evidence'
    }
    if (pathname.includes('/case/') && pathname.includes('/discovery')) {
      return 'discovery'
    }
    if (pathname.includes('/case/')) {
      return 'case'
    }
    return pathname
  }

  const activeHref = getActiveHref()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white border-t border-warm-border shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
      role="navigation"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around py-2 px-4 safe-area-bottom">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors touch-manipulation min-w-[64px]',
                isActive
                  ? 'text-calm-indigo'
                  : 'text-warm-muted hover:text-warm-text'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}

        {caseId && (
          <>
            <Link
              href={`/case/${caseId}/deadlines`}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors touch-manipulation min-w-[64px]',
                activeHref === 'deadlines'
                  ? 'text-calm-indigo'
                  : 'text-warm-muted hover:text-warm-text'
              )}
              aria-current={activeHref === 'deadlines' ? 'page' : undefined}
            >
              <Calendar className="h-5 w-5" aria-hidden="true" />
              <span className="text-xs font-medium">Deadlines</span>
            </Link>

            <Link
              href={`/case/${caseId}/evidence`}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors touch-manipulation min-w-[64px]',
                activeHref === 'evidence'
                  ? 'text-calm-indigo'
                  : 'text-warm-muted hover:text-warm-text'
              )}
              aria-current={activeHref === 'evidence' ? 'page' : undefined}
            >
              <FolderOpen className="h-5 w-5" aria-hidden="true" />
              <span className="text-xs font-medium">Evidence</span>
            </Link>

            <Link
              href={`/case/${caseId}`}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors touch-manipulation min-w-[64px]',
                activeHref === 'case'
                  ? 'text-calm-indigo'
                  : 'text-warm-muted hover:text-warm-text'
              )}
              aria-current={activeHref === 'case' ? 'page' : undefined}
            >
              <Home className="h-5 w-5" aria-hidden="true" />
              <span className="text-xs font-medium">Dashboard</span>
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
