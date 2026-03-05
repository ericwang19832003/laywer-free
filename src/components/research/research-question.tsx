'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Loader2, MessageSquare } from 'lucide-react'
import { ResearchAnswer } from './research-answer'

interface ResearchQuestionProps {
  caseId: string
}

interface Citation {
  case_name: string
  court: string
  year: number | null
  excerpt: string
  opinion_type: string
}

export function ResearchQuestion({ caseId }: ResearchQuestionProps) {
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [answer, setAnswer] = useState<string | null>(null)
  const [citations, setCitations] = useState<Citation[]>([])
  const [notice, setNotice] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleAsk(e: React.FormEvent) {
    e.preventDefault()
    if (question.trim().length < 10) return

    setLoading(true)
    setError(null)
    setAnswer(null)
    setCitations([])
    setNotice(null)

    try {
      const res = await fetch(`/api/cases/${caseId}/research/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to get answer')
      }

      setAnswer(data.answer)
      setCitations(data.citations ?? [])
      setNotice(data.notice ?? null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleAsk} className="space-y-2">
        <Label htmlFor="research-question" className="text-sm font-semibold" style={{ color: '#1C1917' }}>
          Ask a Legal Question
        </Label>
        <p className="text-xs" style={{ color: '#78716C' }}>
          Ask about your legal situation. The AI will answer based on your saved case law authorities.
        </p>
        <textarea
          id="research-question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g., What legal basis supports my claim that the landlord violated habitability standards?"
          className="w-full rounded-md border px-3 py-2 text-sm min-h-[80px] resize-y"
          style={{ borderColor: '#D6D3D1' }}
        />
        <Button type="submit" disabled={loading || question.trim().length < 10}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />}
          <span className="ml-1.5">{loading ? 'Analyzing...' : 'Ask'}</span>
        </Button>
      </form>

      {error && <p className="text-sm" style={{ color: '#D97706' }}>{error}</p>}

      {answer && <ResearchAnswer answer={answer} citations={citations} notice={notice} />}
    </div>
  )
}
