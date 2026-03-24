'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface ResearchSidebarProps {
  caseId: string
  caseLabel: string
  authorityCount: number
}

const NAV_ITEMS = [
  { key: 'overview', label: 'Overview', hrefSuffix: '' },
  { key: 'search', label: 'Search', hrefSuffix: '/search' },
  { key: 'authorities', label: 'Authorities', hrefSuffix: '/authorities' },
  { key: 'ask', label: 'Ask', hrefSuffix: '/ask' },
  { key: 'history', label: 'History', hrefSuffix: '/history' },
]

export function ResearchSidebar({ caseId, caseLabel, authorityCount }: ResearchSidebarProps) {
  const pathname = usePathname()
  const base = `/case/${caseId}/research`

  return (
    <aside className="w-full lg:w-72 shrink-0">
      <div className="rounded-2xl border border-warm-border bg-white/90 p-5 shadow-sm">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-warm-muted">Research Workspace</p>
          <h2 className="text-lg font-semibold text-warm-text">{caseLabel}</h2>
          <p className="text-xs text-warm-muted">Authorities saved: {authorityCount}</p>
        </div>

        <nav className="mt-6 space-y-1">
          {NAV_ITEMS.map((item) => {
            const href = `${base}${item.hrefSuffix}`
            const isActive = pathname === href || pathname.startsWith(`${href}/`)
            return (
              <Link
                key={item.key}
                href={href}
                data-testid={`research-nav-${item.key}`}
                data-active={isActive ? 'true' : 'false'}
                className={cn(
                  'flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition',
                  isActive
                    ? 'bg-warm-ink text-white shadow-sm'
                    : 'text-warm-text hover:bg-warm-bg'
                )}
              >
                <span>{item.label}</span>
                {item.key === 'authorities' && (
                  <span className={cn(
                    'text-xs rounded-full px-2 py-0.5',
                    isActive ? 'bg-white/20 text-white' : 'bg-warm-bg text-warm-muted'
                  )}>
                    {authorityCount}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
