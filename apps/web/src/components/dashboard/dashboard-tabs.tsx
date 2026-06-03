'use client'

import { useState, useRef, useEffect } from 'react'

const TABS = ['Focus', 'Overview', 'Tools'] as const
type Tab = (typeof TABS)[number]

interface DashboardTabsProps {
  focus: React.ReactNode
  overview: React.ReactNode
  tools: React.ReactNode
}

export function DashboardTabs({ focus, overview, tools }: DashboardTabsProps) {
  const [active, setActive] = useState<Tab>('Focus')
  const tabRefs = useRef<Partial<Record<Tab, HTMLButtonElement | null>>>({})

  // Restore active tab from URL on mount without triggering a server re-render
  useEffect(() => {
    const raw = new URLSearchParams(window.location.search).get('tab') ?? ''
    const fromUrl = TABS.find((t) => t.toLowerCase() === raw.toLowerCase())
    if (fromUrl) setActive(fromUrl)
  }, [])

  function changeTab(tab: Tab) {
    setActive(tab)
    try {
      const url = new URL(window.location.href)
      url.searchParams.set('tab', tab.toLowerCase())
      window.history.replaceState(null, '', url.toString())
    } catch {
      // no-op in environments without full URL support
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    const idx = TABS.indexOf(active)
    let next: Tab | null = null
    if (e.key === 'ArrowRight') next = TABS[(idx + 1) % TABS.length]
    if (e.key === 'ArrowLeft') next = TABS[(idx - 1 + TABS.length) % TABS.length]
    if (next) {
      changeTab(next)
      tabRefs.current[next]?.focus()
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
            aria-controls={`panel-${tab.toLowerCase()}`}
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
      {TABS.map((tab) => (
        <div
          key={tab}
          id={`panel-${tab.toLowerCase()}`}
          role="tabpanel"
          tabIndex={0}
          aria-labelledby={`tab-${tab.toLowerCase()}`}
          hidden={active !== tab}
        >
          {tab === 'Focus' ? focus : tab === 'Overview' ? overview : tools}
        </div>
      ))}
    </div>
  )
}
