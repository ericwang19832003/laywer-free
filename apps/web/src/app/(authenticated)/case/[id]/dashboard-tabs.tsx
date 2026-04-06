'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useCallback, type ReactNode } from 'react'
import { Target, BarChart3, Wrench } from 'lucide-react'

const TABS = [
  { key: 'focus', label: 'Focus', icon: Target },
  { key: 'overview', label: 'Overview', icon: BarChart3 },
  { key: 'tools', label: 'Tools', icon: Wrench },
] as const

type TabKey = (typeof TABS)[number]['key']

export function DashboardTabs({
  focusContent,
  overviewContent,
  toolsContent,
}: {
  focusContent: ReactNode
  overviewContent: ReactNode
  toolsContent: ReactNode
}) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const activeTab = (searchParams.get('tab') as TabKey) || 'focus'

  const setTab = useCallback(
    (tab: TabKey) => {
      const params = new URLSearchParams(searchParams.toString())
      if (tab === 'focus') {
        params.delete('tab')
      } else {
        params.set('tab', tab)
      }
      const qs = params.toString()
      router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false })
    },
    [searchParams, router, pathname],
  )

  const contentMap: Record<TabKey, ReactNode> = {
    focus: focusContent,
    overview: overviewContent,
    tools: toolsContent,
  }

  return (
    <>
      <div
        role="tablist"
        aria-label="Dashboard sections"
        className="flex gap-1 p-1 rounded-lg bg-warm-border/30 mb-6"
      >
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            role="tab"
            aria-selected={activeTab === key}
            aria-controls={`tabpanel-${key}`}
            onClick={() => setTab(key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === key
                ? 'bg-white text-warm-text shadow-sm'
                : 'text-warm-muted hover:text-warm-text'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`tabpanel-${activeTab}`}
        aria-labelledby={activeTab}
      >
        {contentMap[activeTab]}
      </div>
    </>
  )
}
