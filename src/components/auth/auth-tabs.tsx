'use client'

import { ReactNode } from 'react'

export type AuthTabValue = 'email' | 'phone'

interface AuthTabsProps {
  activeTab: AuthTabValue
  onTabChange: (tab: AuthTabValue) => void
  children: ReactNode
}

export function AuthTabs({ activeTab, onTabChange, children }: AuthTabsProps) {
  return (
    <div>
      <div className="flex gap-1 mb-6 p-1 bg-warm-bg rounded-lg">
        <button
          type="button"
          onClick={() => onTabChange('email')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'email'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-warm-muted hover:text-warm-text'
          }`}
        >
          Email
        </button>
        <button
          type="button"
          onClick={() => onTabChange('phone')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'phone'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-warm-muted hover:text-warm-text'
          }`}
        >
          Phone
        </button>
      </div>
      {children}
    </div>
  )
}
