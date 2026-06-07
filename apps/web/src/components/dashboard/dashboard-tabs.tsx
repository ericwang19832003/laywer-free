'use client'

import { useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'

const TABS = ['Focus', 'Analyze', 'Tools'] as const
type Tab = (typeof TABS)[number]

interface DashboardTabsProps {
  activeTab: 'focus' | 'analyze' | 'tools'
  focus: React.ReactNode
  overview: React.ReactNode
  tools: React.ReactNode
}

export function DashboardTabs({ activeTab, focus, overview, tools }: DashboardTabsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const active = TABS.find((t) => t.toLowerCase() === activeTab) ?? 'Focus'
  const tabRefs = useRef<Partial<Record<Tab, HTMLButtonElement | null>>>({})

  function changeTab(tab: Tab) {
    router.push(`${pathname}?tab=${tab.toLowerCase()}`, { scroll: false })
    tabRefs.current[tab]?.focus()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    const idx = TABS.indexOf(active)
    let next: Tab | null = null
    if (e.key === 'ArrowRight') next = TABS[(idx + 1) % TABS.length]
    if (e.key === 'ArrowLeft') next = TABS[(idx - 1 + TABS.length) % TABS.length]
    if (next) {
      changeTab(next)
    }
  }

  return (
    <div>
      <div
        role="tablist"
        className="flex border-b border-warm-border mb-6"
        onKeyDown={handleKeyDown}
      >
        {TABS.map((tab) => (
          <button
            key={tab}
            ref={(el) => { tabRefs.current[tab] = el }}
            id={`tab-${tab.toLowerCase()}`}
            role="tab"
            aria-selected={active === tab}
            aria-controls={active === tab ? `panel-${tab.toLowerCase()}` : undefined}
            tabIndex={active === tab ? 0 : -1}
            onClick={() => changeTab(tab)}
            className={`flex-1 text-center px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              active === tab
                ? 'border-calm-indigo text-calm-indigo'
                : 'border-transparent text-warm-muted hover:text-warm-text'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div
        id={`panel-${activeTab}`}
        role="tabpanel"
        tabIndex={0}
        aria-labelledby={`tab-${activeTab}`}
      >
        {active === 'Focus' ? focus : active === 'Analyze' ? overview : tools}
      </div>
    </div>
  )
}
