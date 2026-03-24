'use client'

import { useState, useEffect, useCallback } from 'react'
import { Bell, CheckCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Notification {
  id: string
  case_id: string | null
  type: string
  title: string
  body: string
  read: boolean
  link: string | null
  created_at: string
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/notifications?limit=20')
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications)
        setUnreadCount(data.unread_count)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 60000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  async function handleMarkAllRead() {
    await fetch('/api/notifications/read-all', { method: 'POST' })
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  return (
    <DropdownMenu onOpenChange={(open) => { if (open) fetchNotifications() }}>
      <DropdownMenuTrigger asChild>
        <button
          className="relative inline-flex items-center justify-center size-9 rounded-lg text-warm-muted hover:text-warm-text hover:bg-warm-border/40 transition-colors duration-150"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-calm-amber px-1 text-[10px] font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-warm-border px-4 py-3">
          <p className="text-sm font-medium text-warm-text">Notifications</p>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllRead} className="h-auto px-2 py-1 text-xs">
              <CheckCheck className="mr-1 h-3 w-3" />
              Mark all read
            </Button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-warm-muted">
              No notifications yet
            </p>
          ) : (
            notifications.map((n) => (
              <a
                key={n.id}
                href={n.link ?? '#'}
                className={`block border-b border-warm-border/50 px-4 py-3 text-left transition-colors hover:bg-warm-bg ${
                  !n.read ? 'bg-calm-indigo/5' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm ${!n.read ? 'font-medium text-warm-text' : 'text-warm-muted'}`}>
                    {n.title}
                  </p>
                  {!n.read && (
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-calm-indigo" />
                  )}
                </div>
                {n.body && (
                  <p className="mt-0.5 text-xs text-warm-muted line-clamp-2">{n.body}</p>
                )}
                <p className="mt-1 text-xs text-warm-muted/70">{relativeTime(n.created_at)}</p>
              </a>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
