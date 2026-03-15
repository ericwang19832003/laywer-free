'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, ListChecks, FileBox, BookOpen, MoreHorizontal } from 'lucide-react'

interface MobileNavProps {
  caseId: string
}

const NAV_ITEMS = [
  { href: (id: string) => `/case/${id}`, label: 'Dashboard', icon: LayoutDashboard },
  { href: (id: string) => `/case/${id}/step`, label: 'Tasks', icon: ListChecks },
  { href: (id: string) => `/case/${id}/evidence`, label: 'Evidence', icon: FileBox },
  { href: (id: string) => `/case/${id}/research`, label: 'Research', icon: BookOpen },
  { href: (_id: string) => `/cases`, label: 'More', icon: MoreHorizontal },
]

export function MobileNav({ caseId }: MobileNavProps) {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-warm-border md:hidden">
      <div className="flex justify-around items-center h-16 px-2">
        {NAV_ITEMS.map((item) => {
          const href = item.href(caseId)
          const isActive = pathname === href || (item.label !== 'Dashboard' && pathname.startsWith(href))
          const Icon = item.icon
          return (
            <Link
              key={item.label}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors ${
                isActive ? 'text-calm-indigo' : 'text-warm-muted hover:text-warm-text'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
