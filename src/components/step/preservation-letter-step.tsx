'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { StepRunner } from './step-runner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { generatePreservationLetter } from '@/lib/templates/preservation-letter'

interface PreservationLetterStepProps {
  caseId: string
  taskId: string
}

const EVIDENCE_CATEGORIES = [
  'Emails and text messages',
  'Photographs and videos',
  'Financial records and receipts',
  'Contracts and agreements',
  'Social media posts and messages',
  'Surveillance or security footage',
  'Medical records',
  'Phone records and voicemails',
] as const

const TONE_OPTIONS = [
  { value: 'polite' as const, label: 'Polite', desc: 'Warm and cooperative' },
  { value: 'neutral' as const, label: 'Neutral', desc: 'Professional and direct' },
  { value: 'firm' as const, label: 'Firm', desc: 'Formal with legal language' },
]

async function computeSHA256(text: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function PreservationLetterStep({
  caseId,
  taskId,
}: PreservationLetterStepProps) {
  const router = useRouter()

  // Form state
  const [opponentName, setOpponentName] = useState('')
  const [opponentEmail, setOpponentEmail] = useState('')
  const [incidentDate, setIncidentDate] = useState('')
  const [caseSummary, setCaseSummary] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [customCategory, setCustomCategory] = useState('')
  const [tone, setTone] = useState<'polite' | 'neutral' | 'firm'>('polite')

  // Preview + acknowledgment state
  const [generatedLetter, setGeneratedLetter] = useState('')
  const [acknowledged, setAcknowledged] = useState(false)
  const [savedDocumentId, setSavedDocumentId] = useState<string | null>(null)

  // AI state
  const [useAi, setUseAi] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [generatorMeta, setGeneratorMeta] = useState<{
    generator: 'template' | 'openai'
    model?: string
    prompt_version?: string
  }>({ generator: 'template' })

  // Send state
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState<'sent' | 'failed' | null>(null)

  function toggleCategory(category: string) {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    )
  }

  async function handleBeforeReview() {
    if (!caseSummary.trim()) {
      throw new Error('Please provide a brief case summary.')
    }
    setAcknowledged(false)
    setSavedDocumentId(null)
    setSendResult(null)
    setAiError(null)

    // Try AI path if enabled
    if (useAi) {
      try {
        const res = await fetch('/api/ai/preservation-letter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            summary: caseSummary,
            incident_date: incidentDate || undefined,
            evidence_categories: selectedCategories,
            tone,
            opponent_name: opponentName || undefined,
            // NOTE: opponentEmail intentionally excluded
          }),
        })

        if (res.ok) {
          const data = await res.json()
          setGeneratedLetter(data.body)
          setGeneratorMeta({
            generator: 'openai',
            model: data._meta?.model,
            prompt_version: data._meta?.prompt_version,
          })
          return
        }

        // AI failed — fall through to template
        setAiError('AI generation unavailable. Showing template draft instead.')
      } catch {
        setAiError('AI generation unavailable. Showing template draft instead.')
      }
    }

    // Template path (default or AI fallback)
    const result = generatePreservationLetter({
      opponent_name: opponentName || undefined,
      incident_date: incidentDate || undefined,
      summary: caseSummary,
      evidence_categories: selectedCategories,
      custom_evidence_text: customCategory || undefined,
      tone,
    })
    setGeneratedLetter(result.body)
    setGeneratorMeta({ generator: 'template' })
  }

  /** Save draft, acknowledge disclaimer, complete task */
  async function saveDraftAndComplete(): Promise<string> {
    const sha256 = await computeSHA256(generatedLetter)

    // Record disclaimer acknowledgment
    await fetch(`/api/cases/${caseId}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kind: 'disclaimer_acknowledged',
        task_id: taskId,
        payload: { step: 'preservation_letter' },
      }),
    })

    // Save document
    const docRes = await fetch(`/api/cases/${caseId}/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        task_id: taskId,
        doc_type: 'preservation_letter',
        content_text: generatedLetter,
        sha256,
        metadata: generatorMeta,
      }),
    })

    if (!docRes.ok) {
      const err = await docRes.json()
      throw new Error(err.error || 'Failed to save draft')
    }

    const { document: doc } = await docRes.json()

    // Transition task: todo → in_progress → completed
    await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'in_progress' }),
    })

    await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'completed' }),
    })

    return doc.id
  }

  /** Confirm & Save Draft (no email) */
  async function handleConfirm() {
    if (!acknowledged) {
      throw new Error('Please acknowledge the disclaimer before continuing.')
    }
    await saveDraftAndComplete()
  }

  /** Confirm & Send Email */
  async function handleSendEmail() {
    if (!acknowledged) return
    if (!opponentEmail.trim()) return

    setSending(true)
    try {
      // Save draft first if not already saved
      let docId = savedDocumentId
      if (!docId) {
        docId = await saveDraftAndComplete()
        setSavedDocumentId(docId)
      }

      // Send via server
      const sendRes = await fetch(`/api/cases/${caseId}/preservation-letter/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document_id: docId,
          to_email: opponentEmail.trim(),
        }),
      })

      if (!sendRes.ok) {
        setSendResult('failed')
        setSending(false)
        return
      }

      setSendResult('sent')
      // Navigate after a brief moment so user sees the success state
      setTimeout(() => {
        router.push(`/case/${caseId}`)
        router.refresh()
      }, 1500)
    } catch {
      setSendResult('failed')
      setSending(false)
    }
  }

  function handleDownload() {
    const blob = new Blob([generatedLetter], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'preservation-letter.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  const hasEmail = opponentEmail.trim().length > 0

  const reviewContent = (
    <div className="space-y-4">
      <div className="rounded-md border border-warm-border bg-warm-bg p-4">
        {generatorMeta.generator === 'openai' && (
          <span className="inline-block rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-medium mb-3">
            AI-assisted draft
          </span>
        )}
        <pre className="whitespace-pre-wrap text-sm text-warm-text font-sans leading-relaxed">
          {generatedLetter}
        </pre>
      </div>

      {/* AI fallback warning */}
      {aiError && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm text-amber-800">{aiError}</p>
        </div>
      )}

      {/* Prominent disclaimer */}
      <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 space-y-1.5">
        <p className="text-sm font-medium text-amber-900">
          For reference only. Not legal advice.
        </p>
        <p className="text-xs text-amber-800">
          This draft may be incomplete or inaccurate. Consider consulting a
          licensed attorney before sending any legal correspondence.
        </p>
      </div>

      {/* Acknowledgment checkbox — required before confirm or send */}
      <label className="flex items-start gap-3 cursor-pointer">
        <Checkbox
          checked={acknowledged}
          onCheckedChange={(checked) => setAcknowledged(checked === true)}
          className="mt-0.5"
        />
        <span className="text-sm text-warm-text leading-snug">
          I understand this letter is for reference only and not legal advice.
          I will review it carefully.
        </span>
      </label>

      {/* Send email section */}
      {hasEmail ? (
        <div className="rounded-md border border-warm-border px-4 py-3 space-y-3">
          <div>
            <p className="text-sm font-medium text-warm-text">
              Send to: {opponentEmail}
            </p>
            <p className="text-xs text-warm-muted mt-0.5">
              The letter will be emailed from our system. A copy stays in your case file.
            </p>
          </div>

          {sendResult === 'sent' && (
            <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2">
              <p className="text-sm text-green-800">
                Email sent successfully. Redirecting to your dashboard...
              </p>
            </div>
          )}

          {sendResult === 'failed' && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2">
              <p className="text-sm text-red-800">
                We couldn&apos;t send the email right now. Your draft has been saved.
                You can try again later or download the letter instead.
              </p>
            </div>
          )}

          <Button
            onClick={handleSendEmail}
            disabled={!acknowledged || sending || sendResult === 'sent'}
            className="w-full"
          >
            {sending
              ? 'Sending...'
              : sendResult === 'sent'
                ? 'Sent'
                : 'Confirm & Send Email'}
          </Button>
        </div>
      ) : (
        <div className="rounded-md border border-warm-border bg-warm-bg px-4 py-3">
          <p className="text-sm text-warm-muted">
            Add an email address above to send this letter directly.
            You can also save the draft and download it instead.
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={handleDownload}
        className="text-sm text-calm-indigo hover:underline"
      >
        Download as TXT
      </button>
    </div>
  )

  return (
    <StepRunner
      caseId={caseId}
      taskId={taskId}
      title="You're doing the right thing."
      reassurance="We'll draft a polite preservation request. You'll review it before sending."
      onConfirm={handleConfirm}
      onBeforeReview={handleBeforeReview}
      reviewContent={reviewContent}
      reviewButtonLabel="Review Draft &rarr;"
    >
      <div className="space-y-6">
        {/* Prominent disclaimer — always visible */}
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 space-y-1.5">
          <p className="text-sm font-medium text-amber-900">
            For reference only. Not legal advice.
          </p>
          <ul className="text-xs text-amber-800 space-y-0.5">
            <li>This draft may be incomplete or inaccurate.</li>
            <li>Consider consulting a licensed attorney.</li>
          </ul>
        </div>

        {/* Opponent info */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="opponent-name">
              Opponent name <span className="text-warm-muted font-normal">(optional)</span>
            </Label>
            <Input
              id="opponent-name"
              placeholder="e.g. Jane Smith or Acme Corp"
              value={opponentName}
              onChange={(e) => setOpponentName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="opponent-email">
              Opponent email <span className="text-warm-muted font-normal">(optional)</span>
            </Label>
            <Input
              id="opponent-email"
              type="email"
              placeholder="e.g. jane@example.com"
              value={opponentEmail}
              onChange={(e) => setOpponentEmail(e.target.value)}
            />
            <p className="text-xs text-warm-muted">
              If provided, you&apos;ll have the option to send the letter by email after reviewing.
            </p>
          </div>
        </div>

        {/* Incident date */}
        <div className="space-y-2">
          <Label htmlFor="incident-date">
            Incident date <span className="text-warm-muted font-normal">(optional)</span>
          </Label>
          <Input
            id="incident-date"
            type="date"
            value={incidentDate}
            onChange={(e) => setIncidentDate(e.target.value)}
          />
          <p className="text-xs text-warm-muted">
            The approximate date of the incident or dispute, if known.
          </p>
        </div>

        {/* Case summary */}
        <div className="space-y-2">
          <Label htmlFor="case-summary">Brief case summary</Label>
          <Textarea
            id="case-summary"
            placeholder="Describe the situation in a few sentences. For example: 'I hired a contractor to renovate my kitchen. They didn't finish the work and won't return my calls.'"
            value={caseSummary}
            onChange={(e) => setCaseSummary(e.target.value)}
            maxLength={1200}
            className="min-h-24"
          />
          <p className="text-xs text-warm-muted">
            {caseSummary.length}/1,200 characters
          </p>
        </div>

        {/* Evidence categories */}
        <div className="space-y-3">
          <Label>Types of evidence to preserve</Label>
          <div className="space-y-2">
            {EVIDENCE_CATEGORIES.map((category) => (
              <label
                key={category}
                className="flex items-center gap-3 cursor-pointer"
              >
                <Checkbox
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={() => toggleCategory(category)}
                />
                <span className="text-sm text-warm-text">{category}</span>
              </label>
            ))}
          </div>
          <div className="space-y-2 pt-1">
            <Input
              placeholder="Other (describe)"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
            />
          </div>
        </div>

        {/* Tone */}
        <div className="space-y-3">
          <Label>Tone</Label>
          <div className="flex gap-3">
            {TONE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setTone(option.value)}
                className={`flex-1 rounded-md border px-3 py-2.5 text-left transition-colors ${
                  tone === option.value
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-warm-border text-warm-muted hover:border-warm-text hover:text-warm-text'
                }`}
              >
                <p className="text-sm font-medium">{option.label}</p>
                <p className="text-xs mt-0.5 opacity-70">{option.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* AI toggle */}
        <div className="rounded-md border border-warm-border px-4 py-3">
          <label className="flex items-start gap-3 cursor-pointer">
            <Checkbox
              checked={useAi}
              onCheckedChange={(checked) => setUseAi(checked === true)}
              className="mt-0.5"
            />
            <div>
              <p className="text-sm font-medium text-warm-text">
                Use AI to improve wording
              </p>
              <p className="text-xs text-warm-muted mt-0.5">
                Optional. Uses AI to refine the letter&apos;s language. You&apos;ll still review before sending.
              </p>
            </div>
          </label>
        </div>
      </div>
    </StepRunner>
  )
}
