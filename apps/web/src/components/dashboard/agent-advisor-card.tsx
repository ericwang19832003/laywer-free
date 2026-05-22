'use client'

import { useState, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface AgentAdvisorCardProps {
  caseId: string
  isPro: boolean
}

const SUGGESTIONS = [
  "What's my strongest argument?",
  "What deadlines am I at risk of missing?",
  "How strong is my evidence?",
  "Draft a demand letter",
]

const TOOL_LABELS: Record<string, string> = {
  search_case_law: 'Searching case law...',
  analyze_deadlines: 'Reviewing your deadlines...',
  review_evidence: 'Reviewing your evidence...',
  draft_document: 'Drafting document...',
}

export function AgentAdvisorCard({ caseId, isPro }: AgentAdvisorCardProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [toolStatus, setToolStatus] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  async function send(text: string) {
    if (!text.trim() || loading) return
    setInput('')
    setMessages((m) => [...m, { role: 'user', content: text }])
    setLoading(true)
    setToolStatus(null)

    let assistantContent = ''
    setMessages((m) => [...m, { role: 'assistant', content: '' }])

    try {
      const res = await fetch(`/api/cases/${caseId}/agent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })

      if (!res.body) throw new Error('No response body')
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const evt = JSON.parse(line.slice(6))
            if (evt.type === 'tool_start') setToolStatus(TOOL_LABELS[evt.tool] ?? 'Thinking...')
            if (evt.type === 'tool_end') setToolStatus(null)
            if (evt.type === 'token') {
              assistantContent += evt.content
              setMessages((m) => [
                ...m.slice(0, -1),
                { role: 'assistant', content: assistantContent },
              ])
              bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
            }
            if (evt.type === 'done') setToolStatus(null)
            if (evt.type === 'error') {
              setMessages((m) => [
                ...m.slice(0, -1),
                { role: 'assistant', content: `Something went wrong: ${evt.content}` },
              ])
            }
          } catch { /* malformed SSE line, skip */ }
        }
      }
    } catch {
      setMessages((m) => [
        ...m.slice(0, -1),
        { role: 'assistant', content: 'Something went wrong. Please try again.' },
      ])
    } finally {
      setLoading(false)
      setToolStatus(null)
    }
  }

  if (!isPro) {
    return (
      <Card>
        <CardContent className="pt-5 pb-4 px-5">
          <h3 className="text-sm font-semibold text-warm-text mb-1">AI Strategy Advisor</h3>
          <p className="text-xs text-warm-text/60 mb-3">
            Ask open-ended strategy questions about your case. Powered by LangGraph AI agents.
          </p>
          <Button size="sm" variant="outline">Upgrade to Pro</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="pt-5 pb-4 px-5">
        <h3 className="text-sm font-semibold text-warm-text mb-2">AI Strategy Advisor</h3>
        <p className="text-xs text-warm-text/60 mb-3">
          This provides general legal information — not legal advice.
        </p>

        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                disabled={loading}
                className="text-xs px-3 py-1.5 rounded-full border border-calm-green/40 text-calm-green hover:bg-calm-green/10 transition-colors disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {messages.length > 0 && (
          <div className="space-y-3 max-h-80 overflow-y-auto mb-3 text-sm pr-1">
            {messages.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
                <span className={`inline-block px-3 py-2 rounded-lg text-xs max-w-[90%] text-left ${
                  m.role === 'user'
                    ? 'bg-calm-green/10 text-warm-text font-medium'
                    : 'bg-warm-bg text-warm-text/80 border border-warm-text/10'
                }`}>
                  <span className="whitespace-pre-wrap">{m.content || (m.role === 'assistant' && loading ? '...' : '')}</span>
                </span>
              </div>
            ))}
            {toolStatus && (
              <p className="text-xs text-calm-indigo animate-pulse pl-1">{toolStatus}</p>
            )}
            <div ref={bottomRef} />
          </div>
        )}

        <div className="flex gap-2 mt-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) } }}
            placeholder="Ask a strategy question..."
            className="flex-1 text-sm border border-warm-text/20 rounded-md px-3 py-1.5 bg-white outline-none focus:ring-1 focus:ring-calm-green/40 disabled:opacity-50"
            disabled={loading}
          />
          <Button size="sm" onClick={() => send(input)} disabled={loading || !input.trim()}>
            {loading ? '...' : 'Ask'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
