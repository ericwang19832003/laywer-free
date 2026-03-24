'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface EmailFilter {
  id: string
  email_address: string
  label: string | null
  created_at: string
}

interface EmailSummary {
  id: string
  threadId: string
  from: string
  subject: string
  date: string
  snippet: string
}

interface ThreadMessage {
  id: string
  from: string
  to: string
  subject: string
  date: string
  body: string
}

interface CaseEmailsClientProps {
  caseId: string
  gmailEmail: string
  initialFilters: EmailFilter[]
  disputeType: string | null
}

export function CaseEmailsClient({
  caseId,
  gmailEmail,
  initialFilters,
  disputeType,
}: CaseEmailsClientProps) {
  const [filters, setFilters] = useState<EmailFilter[]>(initialFilters)
  const [newEmail, setNewEmail] = useState('')
  const [newLabel, setNewLabel] = useState('')
  const [addingFilter, setAddingFilter] = useState(false)

  const [emails, setEmails] = useState<EmailSummary[]>([])
  const [loadingEmails, setLoadingEmails] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)

  const [selectedEmail, setSelectedEmail] = useState<string | null>(null)
  const [thread, setThread] = useState<ThreadMessage[] | null>(null)
  const [loadingThread, setLoadingThread] = useState(false)

  const [draft, setDraft] = useState<string | null>(null)
  const [loadingDraft, setLoadingDraft] = useState(false)
  const [copied, setCopied] = useState(false)

  const fetchEmails = useCallback(async () => {
    if (filters.length === 0) return
    setLoadingEmails(true)
    setEmailError(null)
    try {
      const res = await fetch(`/api/cases/${caseId}/emails`)
      if (!res.ok) throw new Error('Failed to fetch emails')
      const data = await res.json()
      setEmails(data.emails)
    } catch {
      setEmailError('Could not load emails. Please try again.')
    } finally {
      setLoadingEmails(false)
    }
  }, [caseId, filters.length])

  useEffect(() => {
    fetchEmails()
  }, [fetchEmails])

  async function addFilter() {
    if (!newEmail) return
    setAddingFilter(true)
    try {
      const res = await fetch(`/api/cases/${caseId}/email-filters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email_address: newEmail,
          label: newLabel || undefined,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        setEmailError(err.error ?? 'Failed to add filter')
        return
      }
      const filter = await res.json()
      setFilters([...filters, filter])
      setNewEmail('')
      setNewLabel('')
    } finally {
      setAddingFilter(false)
    }
  }

  async function removeFilter(filterId: string) {
    await fetch(`/api/cases/${caseId}/email-filters/${filterId}`, {
      method: 'DELETE',
    })
    setFilters(filters.filter((f) => f.id !== filterId))
  }

  async function openEmail(emailId: string) {
    setSelectedEmail(emailId)
    setThread(null)
    setDraft(null)
    setLoadingThread(true)
    try {
      const res = await fetch(`/api/cases/${caseId}/emails/${emailId}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setThread(data.messages)
    } catch {
      setThread([])
    } finally {
      setLoadingThread(false)
    }
  }

  async function generateDraft() {
    if (!selectedEmail) return
    setLoadingDraft(true)
    setDraft(null)
    try {
      const res = await fetch(
        `/api/cases/${caseId}/emails/${selectedEmail}/draft-reply`,
        { method: 'POST' }
      )
      if (!res.ok) {
        const err = await res.json()
        setDraft(`Error: ${err.error ?? 'Failed to generate draft'}`)
        return
      }
      const data = await res.json()
      setDraft(data.draft)
    } finally {
      setLoadingDraft(false)
    }
  }

  async function copyDraft() {
    if (!draft) return
    await navigator.clipboard.writeText(draft)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mt-6 space-y-6">
      <p className="text-sm text-warm-muted">
        Monitoring emails via <span className="font-medium text-warm-text">{gmailEmail}</span>
      </p>

      {/* Email Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Monitored Email Addresses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {filters.length > 0 && (
            <ul className="space-y-2">
              {filters.map((f) => (
                <li key={f.id} className="flex items-center justify-between rounded-lg border border-warm-border p-3">
                  <div>
                    <p className="text-sm font-medium text-warm-text">{f.email_address}</p>
                    {f.label && <p className="text-xs text-warm-muted">{f.label}</p>}
                  </div>
                  <button
                    onClick={() => removeFilter(f.id)}
                    className="text-xs text-warm-muted hover:text-destructive transition-colors"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="flex gap-2">
            <input
              type="email"
              placeholder="opposing@lawfirm.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="flex-1 rounded-md border border-warm-border bg-white px-3 py-2 text-sm text-warm-text placeholder:text-warm-muted focus:outline-none focus:ring-2 focus:ring-calm-indigo/30"
              onKeyDown={(e) => e.key === 'Enter' && addFilter()}
            />
            <input
              type="text"
              placeholder="Label (optional)"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              className="w-40 rounded-md border border-warm-border bg-white px-3 py-2 text-sm text-warm-text placeholder:text-warm-muted focus:outline-none focus:ring-2 focus:ring-calm-indigo/30"
            />
            <Button size="sm" onClick={addFilter} disabled={!newEmail || addingFilter}>
              {addingFilter ? 'Adding...' : 'Add'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Email List */}
      {filters.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Emails</CardTitle>
            <Button variant="outline" size="sm" onClick={fetchEmails} disabled={loadingEmails}>
              {loadingEmails ? 'Loading...' : 'Refresh'}
            </Button>
          </CardHeader>
          <CardContent>
            {emailError && (
              <p className="text-sm text-destructive mb-4">{emailError}</p>
            )}

            {loadingEmails && emails.length === 0 ? (
              <p className="text-sm text-warm-muted text-center py-8">Loading emails...</p>
            ) : emails.length === 0 ? (
              <p className="text-sm text-warm-muted text-center py-8">
                No emails found from these addresses.
              </p>
            ) : (
              <ul className="divide-y divide-warm-border">
                {emails.map((email) => (
                  <li key={email.id}>
                    <button
                      onClick={() => openEmail(email.id)}
                      className={`w-full text-left px-3 py-3 hover:bg-warm-bg transition-colors ${
                        selectedEmail === email.id ? 'bg-warm-bg' : ''
                      }`}
                    >
                      <div className="flex items-baseline justify-between gap-4">
                        <p className="text-sm font-medium text-warm-text truncate">
                          {email.from.replace(/<[^>]+>/, '').trim()}
                        </p>
                        <p className="text-xs text-warm-muted whitespace-nowrap">
                          {new Date(email.date).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="text-sm text-warm-text truncate">{email.subject}</p>
                      <p className="text-xs text-warm-muted truncate mt-0.5">{email.snippet}</p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}

      {/* Email Detail + Thread */}
      {selectedEmail && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Conversation</CardTitle>
            <button
              onClick={() => {
                setSelectedEmail(null)
                setThread(null)
                setDraft(null)
              }}
              className="text-sm text-warm-muted hover:text-warm-text"
            >
              Close
            </button>
          </CardHeader>
          <CardContent>
            {loadingThread ? (
              <p className="text-sm text-warm-muted text-center py-8">Loading conversation...</p>
            ) : thread && thread.length > 0 ? (
              <div className="space-y-4">
                {thread.map((msg, i) => (
                  <div
                    key={msg.id}
                    className={`rounded-lg border p-4 ${
                      i === thread.length - 1
                        ? 'border-calm-indigo/30 bg-indigo-50/50'
                        : 'border-warm-border'
                    }`}
                  >
                    <div className="flex items-baseline justify-between mb-2">
                      <p className="text-sm font-medium text-warm-text">
                        {msg.from.replace(/<[^>]+>/, '').trim()}
                      </p>
                      <p className="text-xs text-warm-muted">
                        {new Date(msg.date).toLocaleString()}
                      </p>
                    </div>
                    <pre className="text-sm text-warm-text whitespace-pre-wrap font-sans">
                      {msg.body}
                    </pre>
                  </div>
                ))}

                <div className="border-t border-warm-border pt-4">
                  {!draft && !loadingDraft && (
                    <Button onClick={generateDraft} className="w-full">
                      Draft a Reply with AI
                    </Button>
                  )}

                  {loadingDraft && (
                    <div className="text-center py-4">
                      <p className="text-sm text-warm-muted">Generating reply draft...</p>
                    </div>
                  )}

                  {draft && (
                    <div className="space-y-3">
                      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                        <p className="text-xs font-medium text-amber-700">
                          AI-generated draft — review carefully before sending from your Gmail.
                        </p>
                      </div>

                      <textarea
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        className="w-full min-h-[200px] rounded-md border border-warm-border bg-white p-3 text-sm text-warm-text font-sans focus:outline-none focus:ring-2 focus:ring-calm-indigo/30"
                      />

                      <div className="flex gap-2">
                        <Button onClick={copyDraft} variant={copied ? 'outline' : 'default'} className="flex-1">
                          {copied ? 'Copied!' : 'Copy to Clipboard'}
                        </Button>
                        <Button onClick={generateDraft} variant="outline">
                          Regenerate
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-warm-muted text-center py-8">
                Could not load this conversation.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
