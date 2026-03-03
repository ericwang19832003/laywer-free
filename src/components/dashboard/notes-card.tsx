'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { PlusIcon, PinIcon, Trash2Icon, Loader2Icon } from 'lucide-react'
import { toast } from 'sonner'

interface Note {
  id: string
  content: string
  pinned: boolean
  created_at: string
  updated_at: string
}

interface NotesCardProps {
  caseId: string
  initialNotes: Note[]
}

function relativeDate(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

export function NotesCard({ caseId, initialNotes }: NotesCardProps) {
  const [notes, setNotes] = useState<Note[]>(initialNotes)
  const [newContent, setNewContent] = useState('')
  const [adding, setAdding] = useState(false)
  const [showForm, setShowForm] = useState(false)

  async function handleAdd() {
    if (!newContent.trim()) return
    setAdding(true)
    try {
      const res = await fetch(`/api/cases/${caseId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent.trim() }),
      })
      if (!res.ok) throw new Error('Failed to add note')
      const { note } = await res.json()
      setNotes((prev) => [note, ...prev])
      setNewContent('')
      setShowForm(false)
    } catch {
      toast.error('Failed to add note')
    } finally {
      setAdding(false)
    }
  }

  async function handleTogglePin(noteId: string, currentPinned: boolean) {
    const res = await fetch(`/api/cases/${caseId}/notes/${noteId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pinned: !currentPinned }),
    })
    if (res.ok) {
      setNotes((prev) =>
        prev
          .map((n) => (n.id === noteId ? { ...n, pinned: !currentPinned } : n))
          .sort((a, b) => {
            if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          })
      )
    }
  }

  async function handleDelete(noteId: string) {
    const res = await fetch(`/api/cases/${caseId}/notes/${noteId}`, { method: 'DELETE' })
    if (res.ok) {
      setNotes((prev) => prev.filter((n) => n.id !== noteId))
    } else {
      toast.error('Failed to delete note')
    }
  }

  return (
    <Card>
      <CardContent className="pt-5 pb-4 px-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-warm-text">Notes</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowForm(!showForm)}
            className="h-auto px-2 py-1 text-xs"
          >
            <PlusIcon className="mr-1 h-3 w-3" />
            Add
          </Button>
        </div>

        {showForm && (
          <div className="mb-4 space-y-2">
            <Textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Write a note..."
              rows={3}
              className="text-sm"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAdd} disabled={adding || !newContent.trim()}>
                {adding ? <Loader2Icon className="mr-1 h-3 w-3 animate-spin" /> : null}
                Save
              </Button>
              <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); setNewContent('') }}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {notes.length === 0 ? (
          <p className="text-sm text-warm-muted py-4 text-center">
            No notes yet. Add one to keep track of important details.
          </p>
        ) : (
          <div className="space-y-2">
            {notes.slice(0, 5).map((note) => (
              <div
                key={note.id}
                className={`group rounded-md border px-3 py-2.5 ${
                  note.pinned ? 'border-calm-indigo/20 bg-calm-indigo/5' : 'border-warm-border'
                }`}
              >
                <p className="text-sm text-warm-text whitespace-pre-wrap">{note.content}</p>
                <div className="mt-1.5 flex items-center justify-between">
                  <span className="text-xs text-warm-muted">{relativeDate(note.created_at)}</span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleTogglePin(note.id, note.pinned)}
                      className={`p-1 rounded hover:bg-warm-border/50 ${
                        note.pinned ? 'text-calm-indigo' : 'text-warm-muted'
                      }`}
                      title={note.pinned ? 'Unpin' : 'Pin'}
                    >
                      <PinIcon className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="p-1 rounded text-warm-muted hover:bg-red-50 hover:text-red-500"
                      title="Delete"
                    >
                      <Trash2Icon className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {notes.length > 5 && (
              <p className="text-xs text-warm-muted text-center pt-1">
                +{notes.length - 5} more notes
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
