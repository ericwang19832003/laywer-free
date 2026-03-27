'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, FileText, Clock, Scale, FolderOpen } from 'lucide-react'

interface SearchResults {
  cases: Array<{ id: string; county: string | null; role: string; dispute_type: string | null }>
  tasks: Array<{ id: string; case_id: string; title: string; status: string }>
  documents: Array<{ id: string; case_id: string; doc_type: string; original_filename: string | null }>
  deadlines: Array<{ id: string; case_id: string; key: string; due_at: string }>
}

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResults | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        onOpenChange(!open)
      }
      if (e.key === 'Escape' && open) {
        onOpenChange(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onOpenChange])

  useEffect(() => {
    if (open) {
      setQuery('')
      setResults(null)
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query || query.length < 2) {
      setResults(null)
      return
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        if (res.ok) {
          const data = await res.json()
          setResults(data.results)
          setSelectedIndex(0)
        }
      } finally {
        setLoading(false)
      }
    }, 200)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query])

  const flatItems = useCallback(() => {
    if (!results) return []
    const flat: Array<{ type: string; label: string; sublabel: string; href: string }> = []

    for (const c of results.cases) {
      flat.push({
        type: 'Case',
        label: c.county || 'Case',
        sublabel: `${c.role} — ${c.dispute_type || 'General'}`,
        href: `/case/${c.id}`,
      })
    }
    for (const t of results.tasks) {
      flat.push({
        type: 'Task',
        label: t.title,
        sublabel: t.status,
        href: `/case/${t.case_id}/step/${t.id}`,
      })
    }
    for (const d of results.documents) {
      flat.push({
        type: 'Document',
        label: d.original_filename || d.doc_type,
        sublabel: d.doc_type,
        href: `/case/${d.case_id}`,
      })
    }
    for (const dl of results.deadlines) {
      flat.push({
        type: 'Deadline',
        label: dl.key.replace(/_/g, ' '),
        sublabel: new Date(dl.due_at).toLocaleDateString(),
        href: `/case/${dl.case_id}/deadlines`,
      })
    }
    return flat
  }, [results])()

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((i) => Math.min(i + 1, flatItems.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && flatItems[selectedIndex]) {
      onOpenChange(false)
      router.push(flatItems[selectedIndex].href)
    }
  }

  const typeIcon: Record<string, React.ReactNode> = {
    Case: <FolderOpen className="h-4 w-4 text-warm-muted" />,
    Task: <Scale className="h-4 w-4 text-warm-muted" />,
    Document: <FileText className="h-4 w-4 text-warm-muted" />,
    Deadline: <Clock className="h-4 w-4 text-warm-muted" />,
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      <div
        className="fixed inset-0 bg-black/40"
        onClick={() => onOpenChange(false)}
      />

      <div className="relative w-full max-w-lg rounded-xl border border-warm-border bg-white shadow-2xl mx-4">
        <div className="flex items-center gap-2 border-b border-warm-border px-4 py-3">
          <Search className="h-4 w-4 text-warm-muted flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search cases, tasks, documents..."
            className="flex-1 bg-transparent text-sm text-warm-text placeholder:text-warm-muted outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center rounded border border-warm-border px-1.5 py-0.5 text-[10px] text-warm-muted font-mono">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto py-2">
          {loading && (
            <p className="px-4 py-3 text-sm text-warm-muted">Searching...</p>
          )}

          {!loading && query.length >= 2 && flatItems.length === 0 && (
            <p className="px-4 py-3 text-sm text-warm-muted">No results found.</p>
          )}

          {!loading && flatItems.length > 0 && (
            <ul>
              {flatItems.map((item, i) => (
                <li key={`${item.type}-${item.href}-${i}`}>
                  <button
                    className={`flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition-colors ${
                      i === selectedIndex ? 'bg-primary/5 text-warm-text' : 'text-warm-muted hover:bg-warm-border/30'
                    }`}
                    onClick={() => {
                      onOpenChange(false)
                      router.push(item.href)
                    }}
                    onMouseEnter={() => setSelectedIndex(i)}
                  >
                    {typeIcon[item.type]}
                    <div className="flex-1 min-w-0">
                      <span className="block truncate font-medium text-warm-text">{item.label}</span>
                      <span className="block truncate text-xs text-warm-muted">{item.sublabel}</span>
                    </div>
                    <span className="text-xs text-warm-border flex-shrink-0">{item.type}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {!loading && query.length < 2 && (
            <p className="px-4 py-3 text-sm text-warm-muted">
              Type at least 2 characters to search...
            </p>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-warm-border px-4 py-2">
          <div className="flex gap-2 text-[10px] text-warm-muted">
            <span><kbd className="font-mono">↑↓</kbd> navigate</span>
            <span><kbd className="font-mono">↵</kbd> open</span>
          </div>
          <div className="text-[10px] text-warm-muted">
            <kbd className="font-mono">⌘K</kbd> to toggle
          </div>
        </div>
      </div>
    </div>
  )
}
