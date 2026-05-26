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
  const content: Record<Tab, React.ReactNode> = { Focus: focus, Overview: overview, Tools: tools }

  return (
    <div>
      <div role="tablist" className="flex border-b border-warm-border mb-6">
        {TABS.map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={active === tab}
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
        <div key={tab} role="tabpanel" hidden={active !== tab}>
          {content[tab]}
        </div>
      ))}
    </div>
  )
}
