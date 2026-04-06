'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Home, 
  FileText, 
  BookOpen, 
  HelpCircle, 
  Settings,
  Sun,
  Moon,
  Keyboard
} from 'lucide-react'

interface KeyboardShortcut {
  key: string
  modifiers?: ('ctrl' | 'alt' | 'shift' | 'meta')[]
  description: string
  icon: React.ElementType
  action?: () => void
  category: 'navigation' | 'actions' | 'editing' | 'view'
}

export function KeyboardShortcuts() {
  const [open, setOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const router = useRouter()

  const handleOpenChange = useCallback((open: boolean) => {
    setOpen(open)
  }, [])

  const shortcuts: KeyboardShortcut[] = [
    { key: 'K', modifiers: ['ctrl'], description: 'Open command palette', icon: Search, category: 'navigation' },
    { key: '/', description: 'Open command palette', icon: Search, category: 'navigation' },
    { key: 'G then H', description: 'Go to home/dashboard', icon: Home, category: 'navigation' },
    { key: 'G then C', description: 'Go to cases', icon: FileText, category: 'navigation' },
    { key: 'G then L', description: 'Go to learn', icon: BookOpen, category: 'navigation' },
    { key: '?', description: 'Show keyboard shortcuts', icon: Keyboard, category: 'navigation' },
    { key: 'Escape', description: 'Close dialog/panel', icon: Keyboard, category: 'actions' },
    { key: 'S', modifiers: ['ctrl'], description: 'Save current work', icon: FileText, category: 'actions' },
    { key: 'N', modifiers: ['ctrl'], description: 'New case', icon: FileText, category: 'actions' },
    { key: '?', description: 'Show this help', icon: HelpCircle, category: 'navigation' },
  ]

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input/textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return
      }

      // Open command palette: Ctrl+K or /
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
        return
      }

      if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        setSearchOpen(true)
        return
      }

      // Show keyboard shortcuts: ?
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        setOpen(true)
        return
      }

      // Escape to close
      if (e.key === 'Escape') {
        setOpen(false)
        setSearchOpen(false)
        return
      }

      // Save: Ctrl+S
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        // Trigger save action - could dispatch event
        window.dispatchEvent(new CustomEvent('keyboard:save'))
        return
      }

      // New case: Ctrl+N
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault()
        router.push('/case/new')
        return
      }

      // Toggle theme: Ctrl+Shift+D
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
        e.preventDefault()
        const html = document.documentElement
        if (html.classList.contains('dark')) {
          html.classList.remove('dark')
          html.classList.add('light')
          localStorage.setItem('theme', 'light')
        } else {
          html.classList.remove('light')
          html.classList.add('dark')
          localStorage.setItem('theme', 'dark')
        }
        window.dispatchEvent(new CustomEvent('theme:toggle'))
        return
      }

      // Go to home: G then H
      if (e.key === 'g' && !e.ctrlKey && !e.metaKey) {
        const handler = (nextKey: KeyboardEvent) => {
          if (nextKey.key === 'h') {
            e.preventDefault()
            router.push('/cases')
          }
          document.removeEventListener('keydown', handler)
        }
        document.addEventListener('keydown', handler)
        setTimeout(() => {
          document.removeEventListener('keydown', handler)
        }, 1000)
        return
      }

      // Go to learn: G then L
      if (e.key === 'g' && !e.ctrlKey && !e.metaKey) {
        const handler = (nextKey: KeyboardEvent) => {
          if (nextKey.key === 'l') {
            e.preventDefault()
            router.push('/learn')
          }
          document.removeEventListener('keydown', handler)
        }
        document.addEventListener('keydown', handler)
        setTimeout(() => {
          document.removeEventListener('keydown', handler)
        }, 1000)
        return
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [router])

  const categories = [
    { id: 'navigation', label: 'Navigation' },
    { id: 'actions', label: 'Actions' },
    { id: 'editing', label: 'Editing' },
    { id: 'view', label: 'View' },
  ]

  return (
    <>
      {/* Floating help button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-40 flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-warm-border rounded-lg shadow-lg hover:shadow-xl transition-all text-sm text-warm-muted hover:text-warm-text"
      >
        <Keyboard className="h-4 w-4" />
        <span className="hidden sm:inline">Press ? for shortcuts</span>
        <Badge variant="outline" className="ml-2 text-xs">⌘K</Badge>
      </button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Keyboard className="h-5 w-5" />
              Keyboard Shortcuts
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {categories.map((category) => {
              const categoryShortcuts = shortcuts.filter((s) => s.category === category.id)
              if (categoryShortcuts.length === 0) return null

              return (
                <div key={category.id}>
                  <h3 className="text-sm font-semibold text-warm-muted uppercase tracking-wider mb-3">
                    {category.label}
                  </h3>
                  <div className="space-y-2">
                    {categoryShortcuts.map((shortcut, i) => {
                      const Icon = shortcut.icon
                      return (
                        <div
                          key={i}
                          className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-warm-border/30"
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="h-4 w-4 text-warm-muted" />
                            <span className="text-sm text-warm-text">{shortcut.description}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {shortcut.modifiers?.map((mod) => (
                              <kbd
                                key={mod}
                                className="px-2 py-1 text-xs font-medium bg-warm-border/50 rounded border border-warm-border"
                              >
                                {mod === 'ctrl' ? '⌘' : mod === 'shift' ? '⇧' : mod === 'alt' ? '⌥' : mod}
                              </kbd>
                            ))}
                            <kbd className="px-2 py-1 text-xs font-medium bg-warm-border/50 rounded border border-warm-border">
                              {shortcut.key}
                            </kbd>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <p className="text-sm text-warm-text">
                  <strong>Tip:</strong> Most shortcuts also work with ⌘ instead of Ctrl on Mac.
                </p>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

interface ShortcutHintProps {
  shortcut: string
  className?: string
}

export function ShortcutHint({ shortcut, className }: ShortcutHintProps) {
  return (
    <kbd
      className={`px-1.5 py-0.5 text-xs font-medium bg-warm-border/50 rounded border border-warm-border ${className}`}
    >
      {shortcut}
    </kbd>
  )
}
