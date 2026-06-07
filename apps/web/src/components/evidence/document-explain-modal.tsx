'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Sparkles,
  AlertCircle,
  Calendar,
  CheckCircle2,
  MessageSquare,
  RotateCcw,
} from 'lucide-react'
import type { DocumentExplanation } from '@/app/api/cases/[id]/evidence/[evidenceId]/explain/route'

interface DocumentExplainModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  caseId: string
  evidenceId: string
  fileName: string
}

export function DocumentExplainModal({
  open,
  onOpenChange,
  caseId,
  evidenceId,
  fileName,
}: DocumentExplainModalProps) {
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [explanation, setExplanation] = useState<DocumentExplanation | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function ask(customQuestion?: string) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/cases/${caseId}/evidence/${evidenceId}/explain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: customQuestion || undefined }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Something went wrong')
      }
      const data = await res.json()
      setExplanation(data.explanation)
      setQuestion('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }
    setLoading(false)
  }

  function reset() {
    setExplanation(null)
    setError(null)
    setQuestion('')
  }

  function handleClose(val: boolean) {
    if (!val) reset()
    onOpenChange(val)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-medium">
            <MessageSquare className="h-4 w-4 text-calm-indigo shrink-0" />
            <span className="truncate">{fileName}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-1">
          {/* Initial state */}
          {!explanation && !loading && !error && (
            <div className="space-y-3">
              <p className="text-sm text-warm-muted">
                Ask a question about this document, or get a plain-English explanation.
              </p>
              <Textarea
                placeholder="e.g. What are my obligations? When does this expire? What does clause 3 mean?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="min-h-20 text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && question.trim()) {
                    ask(question.trim())
                  }
                }}
              />
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => ask(question.trim() || undefined)}
                  disabled={loading}
                >
                  <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                  {question.trim() ? 'Ask' : 'Explain this document'}
                </Button>
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex items-center gap-2 text-sm text-warm-muted animate-pulse py-4">
              <Sparkles className="h-4 w-4 text-calm-indigo" />
              Reading your document…
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="space-y-3">
              <div className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
              <Button variant="outline" size="sm" onClick={reset}>
                Try again
              </Button>
            </div>
          )}

          {/* Result */}
          {explanation && !loading && (
            <div className="space-y-4">
              {/* Document type + summary */}
              <div className="space-y-2">
                <Badge variant="outline" className="text-xs text-warm-muted border-warm-border">
                  {explanation.document_type}
                </Badge>
                <p className="text-sm text-warm-text leading-relaxed">{explanation.summary}</p>
              </div>

              {/* Answer to specific question */}
              {explanation.answer && (
                <div className="rounded-lg bg-calm-indigo/5 border border-calm-indigo/20 p-3">
                  <p className="text-xs font-medium text-calm-indigo mb-1">Answer</p>
                  <p className="text-sm text-warm-text leading-relaxed">{explanation.answer}</p>
                </div>
              )}

              {/* Key points */}
              {explanation.key_points.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-warm-muted uppercase tracking-wide">Key points</p>
                  <ul className="space-y-1.5">
                    {explanation.key_points.map((point, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-3.5 w-3.5 text-calm-green shrink-0 mt-0.5" />
                        <span className="text-warm-text">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Important dates */}
              {explanation.important_dates.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-warm-muted uppercase tracking-wide">Important dates</p>
                  <ul className="space-y-1.5">
                    {explanation.important_dates.map((d, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Calendar className="h-3.5 w-3.5 text-calm-indigo shrink-0 mt-0.5" />
                        <span className="text-warm-text">
                          <span className="font-medium">{d.date}</span>
                          {' — '}
                          <span className="text-warm-muted">{d.label}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Warnings */}
              {explanation.warnings.length > 0 && (
                <div className="rounded-lg border border-calm-amber/30 bg-calm-amber/5 p-3 space-y-1.5">
                  <p className="text-xs font-medium text-calm-amber uppercase tracking-wide">Pay attention to</p>
                  <ul className="space-y-1.5">
                    {explanation.warnings.map((w, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <AlertCircle className="h-3.5 w-3.5 text-calm-amber shrink-0 mt-0.5" />
                        <span className="text-warm-text">{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Ask another question */}
              <div className="pt-1 border-t border-warm-border space-y-2">
                <Textarea
                  placeholder="Ask a follow-up question…"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="min-h-16 text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && question.trim()) {
                      ask(question.trim())
                    }
                  }}
                />
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => ask(question.trim())}
                    disabled={!question.trim() || loading}
                  >
                    <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                    Ask
                  </Button>
                  <Button variant="ghost" size="sm" onClick={reset}>
                    <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                    Start over
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
