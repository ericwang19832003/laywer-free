'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'

// ─── Types ────────────────────────────────────────────────────────────────────

type Section = 'bring' | 'opening' | 'arguments' | 'etiquette' | 'dayof'

export interface HearingPrepWizardProps {
  caseId: string
  taskId: string
  disputeType?: string
  yourName?: string
  opponentName?: string
  amountSought?: string
}

// ─── Static data ──────────────────────────────────────────────────────────────

const BRING_ITEMS = [
  { id: 'evidence_binder', label: 'Evidence binder (organized by category with tabs)' },
  { id: 'copies_3x', label: '3 copies of every document: one for you, one for the judge, one for the other side' },
  { id: 'preservation_email', label: 'Proof you sent the evidence preservation email (check your Sent folder)' },
  { id: 'discovery_responses', label: 'Any discovery responses you received from the other side' },
  { id: 'witness_list', label: 'Written list of witnesses (if any), with their contact information' },
  { id: 'photo_id', label: 'Photo ID' },
  { id: 'filed_petition', label: 'A copy of your filed petition or complaint' },
]

const DISPUTE_ARGUMENTS: Record<string, { theyWillSay: string; youCanSay: string }[]> = {
  debt_collection: [
    {
      theyWillSay: 'You owe this debt.',
      youCanSay: 'Your Honor, they have not shown they legally own this debt — they must produce the original signed agreement and proof of the chain of title.',
    },
    {
      theyWillSay: 'We have records showing the amount owed.',
      youCanSay: 'Your Honor, the statute of limitations for this debt may have expired. I am asserting that defense.',
    },
  ],
  landlord_tenant: [
    {
      theyWillSay: 'The rental unit was in acceptable condition.',
      youCanSay: 'Your Honor, I have dated photos and written repair requests showing the unit did not meet habitability standards.',
    },
    {
      theyWillSay: 'The security deposit deductions were valid.',
      youCanSay: 'Your Honor, state law requires itemized deductions within a set number of days — I never received them in time.',
    },
  ],
  small_claims: [
    {
      theyWillSay: 'The work was completed as agreed.',
      youCanSay: 'Your Honor, I have evidence showing the work was not completed to the specifications in our contract.',
    },
    {
      theyWillSay: 'The plaintiff agreed to accept less.',
      youCanSay: 'Your Honor, no written modification to the contract exists — the original terms control.',
    },
  ],
  personal_injury: [
    {
      theyWillSay: 'You contributed to your own injury.',
      youCanSay: 'Your Honor, I was not negligent — the evidence shows the defendant\'s actions were the sole cause.',
    },
    {
      theyWillSay: 'Your damages are exaggerated.',
      youCanSay: 'Your Honor, I have documentation of all my expenses and losses. I will present them now.',
    },
  ],
}

const ETIQUETTE_RULES = [
  { rule: 'Always say "Your Honor"', example: 'When you want to speak: "Your Honor, I would like to present Exhibit A."' },
  { rule: 'Stand when the judge enters', example: 'The bailiff says "All rise" — stand immediately and wait.' },
  { rule: "Don't interrupt", example: 'Wait until the judge or other party finishes completely before speaking.' },
  { rule: 'Speak to the judge, not the other side', example: 'Even if they say something wrong, address your response to the judge.' },
  { rule: 'Stick to facts, not emotions', example: '"The contract stated X. They did Y." Not "They were terrible and ruined my life."' },
  { rule: 'Ask permission before showing evidence', example: '"Your Honor, may I submit this document as Exhibit A?"' },
]

const DAY_OF_ITEMS = [
  'Arrive 30 minutes early — security lines take time and you need to find your courtroom',
  'Put your phone on silent (not just vibrate) before entering the courtroom',
  'Bring a bottle of water and a snack — hearings can run long',
  'Dress professionally — business casual at minimum',
  'Check in with the clerk when you arrive and confirm your case is on the docket',
  'If the other side offers a last-minute settlement in the hallway, you don\'t have to decide immediately — ask for 10 minutes',
]

const SECTION_NAMES: Record<Section, string> = {
  bring: 'What to bring to court',
  opening: 'Your opening statement',
  arguments: 'What they\'ll probably argue',
  etiquette: 'Courtroom etiquette',
  dayof: 'Day-of checklist',
}

const SECTION_ORDER: Section[] = ['bring', 'opening', 'arguments', 'etiquette', 'dayof']

// ─── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ section }: { section: Section }) {
  const current = SECTION_ORDER.indexOf(section)
  return (
    <div className="flex gap-1 mb-3">
      {SECTION_ORDER.map((_, i) => (
        <div
          key={i}
          className={`h-1.5 flex-1 rounded-full transition-colors ${
            i <= current ? 'bg-calm-indigo' : 'bg-warm-border'
          }`}
        />
      ))}
    </div>
  )
}

// ─── Section 1: Bring ─────────────────────────────────────────────────────────

function BringSection({
  checkedItems,
  setCheckedItems,
  onNext,
}: {
  checkedItems: string[]
  setCheckedItems: (items: string[]) => void
  onNext: () => void
}) {
  function toggle(id: string) {
    if (checkedItems.includes(id)) {
      setCheckedItems(checkedItems.filter(i => i !== id))
    } else {
      setCheckedItems([...checkedItems, id])
    }
  }

  return (
    <div>
      <p className="text-warm-muted text-sm mb-4">
        Check each item off as you pack it. Bring everything on this list — missing any of these can hurt your case.
      </p>
      <div className="space-y-3 mb-6">
        {BRING_ITEMS.map(item => (
          <div key={item.id} className="flex items-start gap-3 rounded-lg border border-warm-border p-3">
            <Checkbox
              id={item.id}
              checked={checkedItems.includes(item.id)}
              onCheckedChange={() => toggle(item.id)}
              className="mt-0.5"
            />
            <label htmlFor={item.id} className="text-sm text-warm-text cursor-pointer leading-snug">
              {item.label}
            </label>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={onNext}
        className="w-full px-4 py-2 rounded-lg bg-calm-indigo text-white text-sm font-medium hover:opacity-90 transition-opacity"
      >
        Next →
      </button>
    </div>
  )
}

// ─── Section 2: Opening ───────────────────────────────────────────────────────

function OpeningSection({
  openingStatement,
  setOpeningStatement,
  onBack,
  onNext,
}: {
  openingStatement: string
  setOpeningStatement: (v: string) => void
  onBack: () => void
  onNext: () => void
}) {
  return (
    <div>
      <p className="text-warm-muted text-sm mb-4">
        We've drafted a starting point based on your case. Edit it until it sounds like you, then practice saying it out loud.
      </p>
      <Textarea
        rows={6}
        value={openingStatement}
        onChange={e => setOpeningStatement(e.target.value)}
        className="mb-3 text-sm text-warm-text"
      />
      <p className="text-xs text-warm-muted mb-5 italic">
        Keep it under 2 minutes. Practice it out loud at least 3 times before your hearing.
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 rounded-lg border border-warm-border text-warm-text text-sm hover:bg-warm-bg transition-colors"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="px-4 py-2 rounded-lg border border-warm-border text-warm-text text-sm hover:bg-warm-bg transition-colors"
        >
          Print
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex-1 px-4 py-2 rounded-lg bg-calm-indigo text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Next →
        </button>
      </div>
    </div>
  )
}

// ─── Section 3: Arguments ─────────────────────────────────────────────────────

function ArgumentsSection({
  disputeType,
  onBack,
  onNext,
}: {
  disputeType?: string
  onBack: () => void
  onNext: () => void
}) {
  const args = DISPUTE_ARGUMENTS[disputeType ?? ''] ?? DISPUTE_ARGUMENTS.small_claims
  const displayType = disputeType ? disputeType.replace(/_/g, ' ') : 'small claims'

  return (
    <div>
      <p className="text-warm-muted text-sm mb-4">
        Here are the most common arguments in {displayType} cases and how to respond.
      </p>
      <div className="space-y-4 mb-6">
        {args.map((arg, i) => (
          <div key={i} className="rounded-lg border border-warm-border p-4">
            <p className="text-sm text-warm-muted mb-2">
              <span className="font-medium text-amber-700">They'll say:</span>{' '}
              "{arg.theyWillSay}"
            </p>
            <p className="text-sm text-calm-indigo">
              <span className="font-medium">You can say:</span>{' '}
              "{arg.youCanSay}"
            </p>
          </div>
        ))}
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 rounded-lg border border-warm-border text-warm-text text-sm hover:bg-warm-bg transition-colors"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex-1 px-4 py-2 rounded-lg bg-calm-indigo text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Next →
        </button>
      </div>
    </div>
  )
}

// ─── Section 4: Etiquette ─────────────────────────────────────────────────────

function EtiquetteSection({
  onBack,
  onNext,
}: {
  onBack: () => void
  onNext: () => void
}) {
  return (
    <div>
      <p className="text-warm-muted text-sm mb-4">
        Judges notice how you carry yourself. Following these rules makes you appear credible.
      </p>
      <div className="space-y-3 mb-6">
        {ETIQUETTE_RULES.map((item, i) => (
          <div key={i} className="rounded-lg border border-warm-border p-3">
            <p className="text-sm text-warm-text font-bold mb-1">{item.rule}</p>
            <p className="text-xs text-warm-muted italic">{item.example}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 rounded-lg border border-warm-border text-warm-text text-sm hover:bg-warm-bg transition-colors"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex-1 px-4 py-2 rounded-lg bg-calm-indigo text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Next →
        </button>
      </div>
    </div>
  )
}

// ─── Section 5: Day-of ────────────────────────────────────────────────────────

function DayOfSection({
  caseId,
  taskId,
  checkedItems,
  openingStatement,
  onBack,
}: {
  caseId: string
  taskId: string
  checkedItems: string[]
  openingStatement: string
  onBack: () => void
}) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleComplete() {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'completed',
          metadata: {
            hearing_prep_checklist: checkedItems,
            hearing_opening_statement: openingStatement,
          },
        }),
      })
      if (!res.ok) throw new Error('Failed to save')
      router.push(`/case/${caseId}`)
    } catch {
      setError('Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <div>
      <p className="text-warm-muted text-sm mb-4">The morning of your hearing.</p>
      <ol className="space-y-3 mb-6 list-none pl-0">
        {DAY_OF_ITEMS.map((item, i) => (
          <li key={i} className="flex gap-3 text-sm text-warm-text">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-calm-indigo/10 text-calm-indigo text-xs font-semibold flex items-center justify-center">
              {i + 1}
            </span>
            <span className="leading-relaxed pt-0.5">{item}</span>
          </li>
        ))}
      </ol>

      {error && (
        <p className="text-sm text-red-600 mb-3">{error}</p>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          className="px-4 py-2 rounded-lg border border-warm-border text-warm-text text-sm hover:bg-warm-bg transition-colors disabled:opacity-50"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={handleComplete}
          disabled={submitting}
          className="flex-1 px-4 py-2 rounded-lg bg-calm-indigo text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {submitting ? 'Saving…' : 'Complete Hearing Prep'}
        </button>
      </div>
    </div>
  )
}

// ─── Main wizard ───────────────────────────────────────────────────────────────

export function HearingPrepWizard({
  caseId,
  taskId,
  disputeType,
  yourName,
  opponentName,
  amountSought,
}: HearingPrepWizardProps) {
  const [section, setSection] = useState<Section>('bring')
  const [checkedItems, setCheckedItems] = useState<string[]>([])
  const [openingStatement, setOpeningStatement] = useState(
    `Your Honor, my name is ${yourName ?? '[Your Name]'}. I am appearing today as a self-represented litigant. I am here because ${opponentName ?? 'the other party'} ${disputeType ? `in my ${disputeType.replace(/_/g, ' ')} case` : 'in this matter'} caused me harm. I am asking the court to award me ${amountSought ?? 'the relief described in my petition'}. I have organized my evidence and will present it clearly for the court.`
  )

  const currentIndex = SECTION_ORDER.indexOf(section)

  return (
    <div className="max-w-lg mx-auto py-8 px-4">
      <ProgressBar section={section} />
      <p className="text-xs font-medium text-calm-indigo uppercase tracking-wide mb-4">
        {currentIndex + 1} of 5: {SECTION_NAMES[section]}
      </p>

      {section === 'bring' && (
        <BringSection
          checkedItems={checkedItems}
          setCheckedItems={setCheckedItems}
          onNext={() => setSection('opening')}
        />
      )}

      {section === 'opening' && (
        <OpeningSection
          openingStatement={openingStatement}
          setOpeningStatement={setOpeningStatement}
          onBack={() => setSection('bring')}
          onNext={() => setSection('arguments')}
        />
      )}

      {section === 'arguments' && (
        <ArgumentsSection
          disputeType={disputeType}
          onBack={() => setSection('opening')}
          onNext={() => setSection('etiquette')}
        />
      )}

      {section === 'etiquette' && (
        <EtiquetteSection
          onBack={() => setSection('arguments')}
          onNext={() => setSection('dayof')}
        />
      )}

      {section === 'dayof' && (
        <DayOfSection
          caseId={caseId}
          taskId={taskId}
          checkedItems={checkedItems}
          openingStatement={openingStatement}
          onBack={() => setSection('etiquette')}
        />
      )}
    </div>
  )
}
