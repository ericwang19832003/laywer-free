'use client'

import { useState } from 'react'

const TABS = ['Focus', 'Overview', 'Tools'] as const
type Tab = (typeof TABS)[number]

interface DashboardTabsProps {
  focus: React.ReactNode
  overview: React.ReactNode
  tools: React.ReactNode
}

export function DashboardTabs({ focus, overview, tools }: DashboardTabsProps) {
  const [active, setActive] = useState<Tab>('Focus')

  return (
    <div>
      <div
        role="tablist"
        className="flex border-b border-warm-border mb-6"
        onKeyDown={(e) => {
          const idx = TABS.indexOf(active)
          if (e.key === 'ArrowRight') setActive(TABS[(idx + 1) % TABS.length])
          if (e.key === 'ArrowLeft') setActive(TABS[(idx - 1 + TABS.length) % TABS.length])
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab}
            id={`tab-${tab.toLowerCase()}`}
            role="tab"
            aria-selected={active === tab}
            aria-controls={`panel-${tab.toLowerCase()}`}
            tabIndex={active === tab ? 0 : -1}
            onClick={() => setActive(tab)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
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
          aria-labelledby={`tab-${tab.toLowerCase()}`}
          hidden={active !== tab}
        >
          {tab === 'Focus' ? focus : tab === 'Overview' ? overview : tools}
        </div>
      ))}
    </div>
  )
}
