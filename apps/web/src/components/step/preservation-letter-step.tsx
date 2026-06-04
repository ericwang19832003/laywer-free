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
import { CheckCircle2, Loader2, AlertTriangle } from 'lucide-react'
import type { AiPreservationLetterAnalyzeResponse } from '@lawyer-free/shared/schemas/ai-preservation-letter-analyze'

interface PreservationLetterStepProps {
  caseId: string
  taskId: string
  skippable?: boolean
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

const LEGAL_CLAIMS = [
  'Negligence',
  'Gross negligence',
  'Breach of contract',
  'Unfair or deceptive practices',
  'FDCPA / debt collection violations',
  'Consumer fraud',
  'Property damage',
  'Products liability',
  'Premises liability',
  'Wrongful collection',
  'Fraud / negligent misrepresentation',
  'Conversion (unauthorized withdrawal or taking)',
  'Unjust enrichment',
  'Landlord-tenant Act violations',
  'Tortious interference with credit standing',
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
  skippable,
}: PreservationLetterStepProps) {
  const router = useRouter()

  // Form state
  const [opponentName, setOpponentName] = useState('')
  const [opponentEmail, setOpponentEmail] = useState('')
  const [defendantDescription, setDefendantDescription] = useState('')
  const [incidentDate, setIncidentDate] = useState('')
  const [referenceNumbers, setReferenceNumbers] = useState('')
  const [caseSummary, setCaseSummary] = useState('')
  const [selectedClaims, setSelectedClaims] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [customCategory, setCustomCategory] = useState('')
  const [tone, setTone] = useState<'polite' | 'neutral' | 'firm'>('firm')
  const [useAi, setUseAi] = useState(true)

  // Two-step analysis state
  const [formPhase, setFormPhase] = useState<'input' | 'analyzing' | 'analysis-ready'>('input')
  const [caseAnalysis, setCaseAnalysis] = useState<AiPreservationLetterAnalyzeResponse | null>(null)
  const [analyzeError, setAnalyzeError] = useState<string | null>(null)

  // Preview + acknowledgment state
  const [generatedLetter, setGeneratedLetter] = useState('')
  const [acknowledged, setAcknowledged] = useState(false)
  const [savedDocumentId, setSavedDocumentId] = useState<string | null>(null)

  // AI state
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
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    )
  }

  function toggleClaim(claim: string) {
    setSelectedClaims((prev) =>
      prev.includes(claim) ? prev.filter((c) => c !== claim) : [...prev, claim]
    )
  }

  async function fetchAnalysis(): Promise<AiPreservationLetterAnalyzeResponse | null> {
    try {
      const res = await fetch('/api/ai/preservation-letter/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summary: caseSummary,
          opponent_name: opponentName || undefined,
          defendant_description: defendantDescription || undefined,
        }),
      })
      if (!res.ok) return null
      return await res.json()
    } catch {
      return null
    }
  }

  async function handleAnalyze() {
    if (!caseSummary.trim()) {
      setAnalyzeError('Please provide a brief case summary first.')
      return
    }
    setAnalyzeError(null)
    setFormPhase('analyzing')

    const analysis = await fetchAnalysis()
    if (!analysis) {
      setAnalyzeError('Analysis failed. You can still generate your letter — it will reason about the case directly.')
      setFormPhase('input')
      return
    }

    setCaseAnalysis(analysis)
    // Pre-populate any suggested claims not already selected
    setSelectedClaims((prev) => {
      const newClaims = analysis.suggested_claims.filter(
        (c) => !prev.includes(c) && LEGAL_CLAIMS.includes(c as (typeof LEGAL_CLAIMS)[number])
      )
      return [...prev, ...newClaims]
    })
    setFormPhase('analysis-ready')
  }

  async function handleBeforeReview() {
    if (!caseSummary.trim()) throw new Error('Please provide a brief case summary.')

    setAcknowledged(false)
    setSavedDocumentId(null)
    setSendResult(null)
    setAiError(null)

    if (useAi) {
      try {
        // If analysis wasn't done explicitly, run it now inline
        let analysis = caseAnalysis
        if (!analysis) {
          analysis = await fetchAnalysis()
          if (analysis) setCaseAnalysis(analysis)
        }

        const res = await fetch('/api/ai/preservation-letter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            summary: caseSummary,
            incident_date: incidentDate || undefined,
            evidence_categories: selectedCategories,
            tone,
            opponent_name: opponentName || undefined,
            defendant_description: defendantDescription || undefined,
            reference_numbers: referenceNumbers || undefined,
            legal_claims: selectedClaims,
            case_analysis: analysis
              ? {
                  defendant_type: analysis.defendant_type,
                  defendant_systems: analysis.defendant_systems,
                  deletion_risks: analysis.deletion_risks,
                }
              : undefined,
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

        setAiError('AI generation unavailable. Showing template draft instead.')
      } catch {
        setAiError('AI generation unavailable. Showing template draft instead.')
      }
    }

    // Template fallback
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

  async function saveDraftAndComplete(): Promise<string> {
    const sha256 = await computeSHA256(generatedLetter)

    await fetch(`/api/cases/${caseId}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kind: 'disclaimer_acknowledged',
        task_id: taskId,
        payload: { step: 'preservation_letter' },
      }),
    })

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

  async function handleConfirm() {
    if (!acknowledged) throw new Error('Please acknowledge the disclaimer before continuing.')
    await saveDraftAndComplete()
  }

  async function handleSendEmail() {
    if (!acknowledged) return
    if (!opponentEmail.trim()) return

    setSending(true)
    try {
      let docId = savedDocumentId
      if (!docId) {
        docId = await saveDraftAndComplete()
        setSavedDocumentId(docId)
      }

      const sendRes = await fetch(`/api/cases/${caseId}/preservation-letter/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ document_id: docId, to_email: opponentEmail.trim() }),
      })

      if (!sendRes.ok) {
        setSendResult('failed')
        setSending(false)
        return
      }

      setSendResult('sent')
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

  // What the StepRunner CTA says depends on whether analysis is ready
  const ctaLabel =
    formPhase === 'analysis-ready' ? 'Generate Letter' : 'Analyze & Generate Letter'

  // ── Analysis panel (shown when formPhase === 'analysis-ready') ──────────────
  const analysisPanel = caseAnalysis && (
    <div className="rounded-lg border border-calm-indigo/20 bg-calm-indigo/[0.03] p-4 space-y-4">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 text-calm-indigo shrink-0" />
        <p className="text-sm font-medium text-warm-text">Case analysis complete</p>
      </div>

      {/* Defendant type */}
      <div className="space-y-1">
        <p className="text-xs font-medium text-warm-muted uppercase tracking-wide">Identified as</p>
        <p className="text-sm text-warm-text">{caseAnalysis.defendant_type}</p>
        <p className="text-xs text-warm-muted">
          Not right?{' '}
          <button
            type="button"
            onClick={() => { setFormPhase('input'); setCaseAnalysis(null) }}
            className="text-calm-indigo hover:underline"
          >
            Edit case details
          </button>
          {' '}and re-analyze.
        </p>
      </div>

      {/* Evidence systems */}
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-warm-muted uppercase tracking-wide">
          Evidence systems targeted ({caseAnalysis.defendant_systems.length})
        </p>
        <ul className="space-y-1">
          {caseAnalysis.defendant_systems.slice(0, 5).map((sys, i) => (
            <li key={i} className="text-xs text-warm-text flex items-start gap-1.5">
              <span className="text-calm-indigo mt-0.5">•</span>
              {sys}
            </li>
          ))}
          {caseAnalysis.defendant_systems.length > 5 && (
            <li className="text-xs text-warm-muted">
              + {caseAnalysis.defendant_systems.length - 5} more
            </li>
          )}
        </ul>
      </div>

      {/* Deletion risks */}
      {caseAnalysis.deletion_risks.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-calm-amber" />
            <p className="text-xs font-medium text-warm-muted uppercase tracking-wide">
              Auto-deletion risks
            </p>
          </div>
          <ul className="space-y-1">
            {caseAnalysis.deletion_risks.map((risk, i) => (
              <li key={i} className="text-xs text-warm-text flex items-start gap-1.5">
                <span className="text-calm-amber mt-0.5">•</span>
                {risk}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggested claims notice */}
      {caseAnalysis.suggested_claims.length > 0 && (
        <p className="text-xs text-warm-muted">
          {caseAnalysis.suggested_claims.length} legal claim
          {caseAnalysis.suggested_claims.length !== 1 ? 's' : ''} pre-filled below based on your case.
        </p>
      )}
    </div>
  )

  // ── Review content (letter preview) ────────────────────────────────────────
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

      {aiError && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm text-amber-800">{aiError}</p>
        </div>
      )}

      <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 space-y-1.5">
        <p className="text-sm font-medium text-amber-900">For reference only. Not legal advice.</p>
        <p className="text-xs text-amber-800">
          This draft may be incomplete or inaccurate. Consider consulting a licensed attorney before
          sending any legal correspondence.
        </p>
      </div>

      <label className="flex items-start gap-3 cursor-pointer">
        <Checkbox
          checked={acknowledged}
          onCheckedChange={(checked) => setAcknowledged(checked === true)}
          className="mt-0.5"
        />
        <span className="text-sm text-warm-text leading-snug">
          I understand this letter is for reference only and not legal advice. I will review it
          carefully.
        </span>
      </label>

      {hasEmail ? (
        <div className="rounded-md border border-warm-border px-4 py-3 space-y-3">
          <div>
            <p className="text-sm font-medium text-warm-text">Send to: {opponentEmail}</p>
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
            <div className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2">
              <p className="text-sm text-destructive">
                We couldn&apos;t send the email right now. Your draft has been saved. You can try
                again later or download the letter instead.
              </p>
            </div>
          )}

          <Button
            onClick={handleSendEmail}
            disabled={!acknowledged || sending || sendResult === 'sent'}
            className="w-full"
          >
            {sending ? 'Sending...' : sendResult === 'sent' ? 'Sent' : 'Confirm & Send Email'}
          </Button>
        </div>
      ) : (
        <div className="rounded-md border border-warm-border bg-warm-bg px-4 py-3">
          <p className="text-sm text-warm-muted">
            Add an email address above to send this letter directly. You can also save the draft and
            download it instead.
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
      reassurance="We'll analyze your case to identify the defendant's specific evidence systems, then draft a comprehensive preservation notice with numbered, case-specific categories."
      onConfirm={handleConfirm}
      onBeforeReview={handleBeforeReview}
      reviewContent={reviewContent}
      reviewButtonLabel={ctaLabel}
      skippable={skippable}
    >
      <div className="space-y-6">
        {/* Disclaimer */}
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 space-y-1.5">
          <p className="text-sm font-medium text-amber-900">For reference only. Not legal advice.</p>
          <ul className="text-xs text-amber-800 space-y-0.5">
            <li>This draft may be incomplete or inaccurate.</li>
            <li>Consider consulting a licensed attorney.</li>
          </ul>
        </div>

        {formPhase === 'analyzing' ? (
          // Loading state while analysis runs
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-calm-indigo" />
            <p className="text-sm text-warm-muted">Analyzing your case...</p>
            <p className="text-xs text-warm-muted/70">
              Identifying evidence systems and deletion risks
            </p>
          </div>
        ) : formPhase === 'analysis-ready' ? (
          // Analysis review panel
          <div className="space-y-4">
            {analysisPanel}

            {/* Claims updated by analysis — show for review */}
            <div className="space-y-3">
              <Label>
                Legal claims{' '}
                <span className="text-warm-muted font-normal">(pre-filled from analysis — adjust as needed)</span>
              </Label>
              <div className="space-y-2">
                {LEGAL_CLAIMS.map((claim) => (
                  <label key={claim} className="flex items-center gap-3 cursor-pointer">
                    <Checkbox
                      checked={selectedClaims.includes(claim)}
                      onCheckedChange={() => toggleClaim(claim)}
                    />
                    <span className="text-sm text-warm-text">{claim}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Tone selector */}
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

            <button
              type="button"
              onClick={() => { setFormPhase('input'); setCaseAnalysis(null) }}
              className="text-sm text-warm-muted hover:text-calm-indigo transition-colors"
            >
              ← Edit case details
            </button>
          </div>
        ) : (
          // Normal form
          <div className="space-y-6">
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
                <Label htmlFor="defendant-description">
                  What does the opponent do?{' '}
                  <span className="text-warm-muted font-normal">(optional)</span>
                </Label>
                <Input
                  id="defendant-description"
                  placeholder="e.g. residential property management company, commercial truck carrier, parking enforcement company"
                  value={defendantDescription}
                  onChange={(e) => setDefendantDescription(e.target.value)}
                />
                <p className="text-xs text-warm-muted">
                  The more specific you are, the better the AI can identify their evidence systems.
                </p>
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
            </div>

            {/* Case summary */}
            <div className="space-y-2">
              <Label htmlFor="case-summary">Brief case summary</Label>
              <Textarea
                id="case-summary"
                placeholder="Describe the situation in a few sentences. The more detail you provide, the more targeted the letter."
                value={caseSummary}
                onChange={(e) => setCaseSummary(e.target.value)}
                maxLength={1200}
                className="min-h-24"
              />
              <p className="text-xs text-warm-muted">{caseSummary.length}/1,200 characters</p>
            </div>

            {/* Reference numbers */}
            <div className="space-y-2">
              <Label htmlFor="reference-numbers">
                Reference / claim / case numbers{' '}
                <span className="text-warm-muted font-normal">(optional)</span>
              </Label>
              <Input
                id="reference-numbers"
                placeholder="e.g. Claim #2025-001, Police Report #TX-2025-8847"
                value={referenceNumbers}
                onChange={(e) => setReferenceNumbers(e.target.value)}
              />
            </div>

            {/* Legal claims */}
            <div className="space-y-3">
              <Label>
                Legal claims you&apos;re considering{' '}
                <span className="text-warm-muted font-normal">(optional)</span>
              </Label>
              <p className="text-xs text-warm-muted -mt-1">
                Select any that apply — the AI uses these to generate the right evidence categories.
              </p>
              <div className="space-y-2">
                {LEGAL_CLAIMS.map((claim) => (
                  <label key={claim} className="flex items-center gap-3 cursor-pointer">
                    <Checkbox
                      checked={selectedClaims.includes(claim)}
                      onCheckedChange={() => toggleClaim(claim)}
                    />
                    <span className="text-sm text-warm-text">{claim}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Evidence categories */}
            <div className="space-y-3">
              <Label>
                Additional evidence types{' '}
                <span className="text-warm-muted font-normal">(optional)</span>
              </Label>
              <p className="text-xs text-warm-muted -mt-1">
                AI will automatically generate case-specific categories. Select any you want to
                explicitly include.
              </p>
              <div className="space-y-2">
                {EVIDENCE_CATEGORIES.map((category) => (
                  <label key={category} className="flex items-center gap-3 cursor-pointer">
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

            {/* AI toggle + Analyze button */}
            <div className="rounded-md border border-warm-border px-4 py-3 space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <Checkbox
                  checked={useAi}
                  onCheckedChange={(checked) => setUseAi(checked === true)}
                  className="mt-0.5"
                />
                <div>
                  <p className="text-sm font-medium text-warm-text">Use AI to improve wording</p>
                  <p className="text-xs text-warm-muted mt-0.5">
                    Analyzes your case to identify defendant-specific evidence systems, then
                    generates 12–20 numbered categories. Highly recommended.
                  </p>
                </div>
              </label>

              {useAi && caseSummary.trim().length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAnalyze}
                  className="w-full"
                >
                  Analyze My Case First
                </Button>
              )}

              {analyzeError && (
                <p className="text-xs text-destructive">{analyzeError}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </StepRunner>
  )
}
