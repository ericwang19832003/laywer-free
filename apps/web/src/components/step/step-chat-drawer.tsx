'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader2, MessageCircle, Send, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface StepChatDrawerProps {
  taskKey: string
  stepName: string
  disputeType?: string
  state?: string
  glossaryTerms?: { term: string; plain: string }[]
  suggestedQuestions?: string[]
}

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export function StepChatDrawer({
  taskKey,
  stepName,
  disputeType,
  state,
  glossaryTerms,
  suggestedQuestions,
}: StepChatDrawerProps) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when drawer opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  async function sendMessage(text: string) {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    const userMessage: Message = { role: 'user', content: trimmed }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setLoading(true)

    // Placeholder for the streaming assistant reply
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

    try {
      const history = updatedMessages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }))

      const res = await fetch('/api/ai/step-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskKey,
          stepName,
          disputeType,
          state,
          glossaryTerms,
          question: trimmed,
          history,
        }),
      })

      if (!res.ok || !res.body) {
        throw new Error(`HTTP ${res.status}`)
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        setMessages((prev) => {
          const next = [...prev]
          next[next.length - 1] = { role: 'assistant', content: accumulated }
          return next
        })
      }
    } catch {
      setMessages((prev) => {
        const next = [...prev]
        next[next.length - 1] = {
          role: 'assistant',
          content:
            "I'm having trouble connecting right now. Please try again.",
        }
        return next
      })
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <>
      {/* Floating trigger button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Ask a question"
        className={cn(
          'fixed bottom-6 right-6 z-40',
          'flex items-center gap-2 rounded-full px-5 py-3',
          'bg-calm-indigo text-white shadow-lg',
          'hover:bg-calm-indigo/90 hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.97]',
          'transition-all duration-200 ease-out',
          'text-sm font-semibold'
        )}
      >
        <MessageCircle className="h-4 w-4 shrink-0" />
        Ask a question
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40"
          aria-hidden="true"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Legal Guide"
        className={cn(
          'fixed inset-y-0 right-0 z-50',
          'flex flex-col',
          'w-full sm:w-96',
          'bg-white shadow-2xl',
          'transition-transform duration-300 ease-out',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-warm-border px-5 py-4">
          <div>
            <p className="text-base font-semibold text-warm-text">Legal Guide</p>
            <p className="mt-0.5 text-xs text-warm-text/60">
              Plain-English answers · Not legal advice
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close chat"
            className="rounded-lg p-1.5 text-warm-text/50 hover:bg-warm-border/50 hover:text-warm-text transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.length === 0 ? (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-warm-text/70 leading-relaxed">
                Have a question about this step? Ask me anything in plain English —
                I&apos;ll do my best to explain what&apos;s happening without the legal
                jargon.
              </p>
              {suggestedQuestions && suggestedQuestions.length > 0 && (
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-medium text-warm-text/50 uppercase tracking-wide">
                    Suggested questions
                  </p>
                  {suggestedQuestions.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => sendMessage(q)}
                      className={cn(
                        'rounded-lg border border-calm-indigo/20 bg-calm-indigo/5',
                        'px-3 py-2 text-left text-sm text-calm-indigo',
                        'hover:bg-calm-indigo/10 transition-colors'
                      )}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  'flex',
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                    msg.role === 'user'
                      ? 'bg-calm-indigo text-white'
                      : 'border border-warm-border bg-warm-bg text-warm-text'
                  )}
                >
                  {msg.role === 'assistant' && loading && i === messages.length - 1 && msg.content === '' ? (
                    <Loader2 className="h-4 w-4 animate-spin text-warm-text/50" />
                  ) : (
                    msg.content
                  )}
                  {msg.role === 'assistant' && loading && i === messages.length - 1 && msg.content !== '' && (
                    <span className="ml-1 inline-block h-3 w-0.5 animate-pulse bg-warm-text/40 align-middle" />
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div className="border-t border-warm-border px-4 py-3">
          <div className="flex items-center gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question…"
              disabled={loading}
              className="flex-1"
              aria-label="Your question"
            />
            <Button
              type="button"
              size="icon"
              disabled={loading || !input.trim()}
              onClick={() => sendMessage(input)}
              aria-label="Send"
              className="shrink-0"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
