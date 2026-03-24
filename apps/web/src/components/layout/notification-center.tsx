'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Bell, CheckCheck, ExternalLink } from 'lucide-react'
import Link from 'next/link'
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
  if (days < 7) return `${days}d ago`
  const weeks = Math.floor(days / 7)
  if (weeks < 4) return `${weeks}w ago`
  const months = Math.floor(days / 30)
  return `${months}mo ago`
}

function isToday(dateStr: string): boolean {
  const date = new Date(dateStr)
  const now = new Date()
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  )
}

function groupNotifications(notifications: Notification[]): {
  today: Notification[]
  earlier: Notification[]
} {
  const today: Notification[] = []
  const earlier: Notification[] = []

  for (const n of notifications) {
    if (isToday(n.created_at)) {
      today.push(n)
    } else {
      earlier.push(n)
    }
  }

  return { today, earlier }
}

function NotificationItem({ notification }: { notification: Notification }) {
  const content = (
    <div
      className={`block border-b border-warm-border/50 px-4 py-3 text-left transition-colors hover:bg-warm-bg ${
        !notification.read ? 'bg-calm-indigo/5' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p
          className={`text-sm flex-1 ${
            !notification.read ? 'font-medium text-warm-text' : 'text-warm-muted'
          }`}
        >
          {notification.title}
        </p>
        {!notification.read && (
          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-calm-indigo" />
        )}
      </div>
      {notification.body && (
        <p className="mt-0.5 text-xs text-warm-muted line-clamp-2">
          {notification.body}
        </p>
      )}
      <div className="mt-1.5 flex items-center justify-between">
        <p className="text-xs text-warm-muted/70">
          {relativeTime(notification.created_at)}
        </p>
        {notification.link && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-calm-indigo hover:text-calm-indigo/80 transition-colors">
            View
            <ExternalLink className="h-3 w-3" />
          </span>
        )}
      </div>
    </div>
  )

  if (notification.link) {
    return (
      <Link href={notification.link} className="block">
        {content}
      </Link>
    )
  }

  return content
}

function NotificationGroup({
  label,
  notifications,
}: {
  label: string
  notifications: Notification[]
}) {
  if (notifications.length === 0) return null

  return (
    <div>
      <div className="sticky top-0 z-10 bg-warm-bg/95 backdrop-blur px-4 py-1.5 border-b border-warm-border/50">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-warm-muted">
          {label}
        </p>
      </div>
      {notifications.map((n) => (
        <NotificationItem key={n.id} notification={n} />
      ))}
    </div>
  )
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/notifications?limit=30')
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

  const grouped = useMemo(
    () => groupNotifications(notifications),
    [notifications]
  )

  async function handleMarkAllRead() {
    await fetch('/api/notifications/read-all', { method: 'POST' })
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (open) fetchNotifications()
      }}
    >
      <DropdownMenuTrigger asChild>
        <button
          className="relative inline-flex items-center justify-center size-9 rounded-lg text-warm-muted hover:text-warm-text hover:bg-warm-border/40 transition-colors duration-150"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-warm-border px-4 py-3">
          <p className="text-sm font-medium text-warm-text">Notifications</p>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              className="h-auto px-2 py-1 text-xs text-warm-muted hover:text-warm-text"
            >
              <CheckCheck className="mr-1 h-3 w-3" />
              Mark all read
            </Button>
          )}
        </div>

        {/* Notification list */}
        <div className="max-h-96 overflow-y-auto">
          {loading && notifications.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-warm-border border-t-calm-indigo" />
              <p className="mt-2 text-xs text-warm-muted">Loading...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <Bell className="mx-auto h-8 w-8 text-warm-border" />
              <p className="mt-2 text-sm text-warm-muted">
                No notifications yet
              </p>
              <p className="mt-0.5 text-xs text-warm-muted/70">
                You&apos;ll be notified about deadlines and case updates
              </p>
            </div>
          ) : (
            <>
              <NotificationGroup label="Today" notifications={grouped.today} />
              <NotificationGroup
                label="Earlier"
                notifications={grouped.earlier}
              />
            </>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
