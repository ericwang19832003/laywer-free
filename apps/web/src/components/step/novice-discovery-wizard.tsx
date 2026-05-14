'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Checkbox } from '@/components/ui/checkbox'

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase = 'explainer' | 'interrogatories' | 'rfp' | 'admissions' | 'service' | 'tracker'

export interface NoviceDiscoveryWizardProps {
  caseId: string
  taskId: string
  disputeType?: string
  state?: string
}

// ─── Template data ─────────────────────────────────────────────────────────────

const INTERROGATORIES = [
  { id: 'witnesses', plain: 'Ask them to name everyone who knows something about what happened.', legal: 'Identify all persons with knowledge of facts related to this lawsuit.' },
  { id: 'documents', plain: 'Ask them to list every document they plan to use.', legal: 'Identify all documents you may use to support your claims or defenses.' },
  { id: 'damages', plain: 'Ask them to explain exactly what damages they claim.', legal: 'Describe in detail each item of damage you claim, and the calculation thereof.' },
  { id: 'communications', plain: 'Ask them to describe every communication about this dispute.', legal: 'Describe all communications between the parties regarding the subject matter of this lawsuit.' },
]

const RFPS = [
  { id: 'all_docs', plain: 'Ask for all documents they mentioned in their answers.', legal: 'Produce all documents identified in your interrogatory responses.' },
  { id: 'communications', plain: 'Ask for all messages and emails about this dispute.', legal: 'Produce all communications related to this dispute.' },
  { id: 'financial', plain: 'Ask for financial records related to this case.', legal: 'Produce all financial records related to the claims in this lawsuit.' },
]

const ADMISSIONS = [
  { id: 'parties', plain: 'Ask them to confirm they are the right party in this lawsuit.', legal: 'Admit that you are the party named in the complaint.' },
  { id: 'transaction', plain: 'Ask them to admit the key event you are suing over actually happened.', legal: 'Admit that the transaction described in the complaint occurred.' },
]

const SERVICE_METHODS = [
  {
    id: 'certified_mail',
    label: 'Certified Mail',
    description: 'Most common. Mail to their address — keep the green tracking card you get back.',
  },
  {
    id: 'process_server',
    label: 'Process Server',
    description: 'A professional delivers in person. Required in some courts. Costs ~$50–100.',
  },
  {
    id: 'email',
    label: 'Email',
    description: 'Only if opposing counsel has agreed in writing. Otherwise not valid.',
  },
]

// ─── Sub-components ────────────────────────────────────────────────────────────

function ProgressBar({ phase }: { phase: Phase }) {
  const phases: Phase[] = ['explainer', 'interrogatories', 'rfp', 'admissions', 'service', 'tracker']
  const current = phases.indexOf(phase)
  return (
    <div className="flex gap-1 mb-6">
      {phases.map((p, i) => (
        <div
          key={p}
          className={`h-1.5 flex-1 rounded-full transition-colors ${
            i <= current ? 'bg-calm-indigo' : 'bg-warm-border'
          }`}
        />
      ))}
    </div>
  )
}

interface TemplateItem {
  id: string
  plain: string
  legal: string
}

function TemplateChecklist({
  title,
  subtitle,
  items,
  selected,
  onToggle,
  onBack,
  onNext,
  nextLabel,
}: {
  title: string
  subtitle: string
  items: TemplateItem[]
  selected: Set<string>
  onToggle: (id: string) => void
  onBack: () => void
  onNext: () => void
  nextLabel?: string
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  function toggleExpand(id: string) {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-warm-text mb-1">{title}</h2>
      <p className="text-warm-muted text-sm mb-4">{subtitle}</p>
      <div className="space-y-3 mb-6">
        {items.map(item => (
          <div key={item.id} className="rounded-lg border border-warm-border p-3">
            <div className="flex items-start gap-3">
              <Checkbox
                id={item.id}
                checked={selected.has(item.id)}
                onCheckedChange={() => onToggle(item.id)}
                className="mt-0.5"
              />
              <div className="flex-1">
                <label htmlFor={item.id} className="text-sm text-warm-text cursor-pointer leading-snug">
                  {item.plain}
                </label>
                <button
                  type="button"
                  onClick={() => toggleExpand(item.id)}
                  className="mt-1 text-xs text-calm-indigo hover:underline block"
                >
                  {expanded.has(item.id) ? 'Hide legal text ▲' : 'Show legal text ▼'}
                </button>
                {expanded.has(item.id) && (
                  <p className="mt-1 text-xs text-warm-muted italic border-l-2 border-calm-indigo pl-2">
                    {item.legal}
                  </p>
                )}
              </div>
            </div>
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
          {nextLabel ?? 'Next →'}
        </button>
      </div>
    </div>
  )
}

// ─── Phase components ──────────────────────────────────────────────────────────

const EXPLAINER_SCREENS = [
  {
    heading: 'What is discovery?',
    body: 'Discovery is the process where both sides exchange information before trial. You send questions and document requests the other side must answer under oath.',
  },
  {
    heading: 'You have three tools',
    body: 'Interrogatories: written questions they answer in writing. Requests for Production: ask for their documents. Requests for Admissions: ask them to admit or deny key facts — anything they admit saves you from proving it in court.',
  },
  {
    heading: 'They must respond',
    body: 'In most states, they have 30–45 days to respond. If they don\'t, you can file a Motion to Compel and the court may penalize them. We\'ll help you track this deadline.',
  },
]

function ExplainerPhase({ onComplete }: { onComplete: () => void }) {
  const [screen, setScreen] = useState(0)
  const current = EXPLAINER_SCREENS[screen]
  const isLast = screen === EXPLAINER_SCREENS.length - 1

  return (
    <div>
      <div className="flex gap-1 mb-6">
        {EXPLAINER_SCREENS.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= screen ? 'bg-calm-indigo' : 'bg-warm-border'
            }`}
          />
        ))}
      </div>
      <div className="rounded-lg border border-warm-border p-5 mb-6 bg-warm-bg min-h-[140px] flex flex-col justify-center">
        <h3 className="text-lg font-semibold text-warm-text mb-3">{current.heading}</h3>
        <p className="text-sm text-warm-muted leading-relaxed">{current.body}</p>
      </div>
      <div className="flex gap-3">
        {screen > 0 && (
          <button
            type="button"
            onClick={() => setScreen(s => s - 1)}
            className="px-4 py-2 rounded-lg border border-warm-border text-warm-text text-sm hover:bg-warm-bg transition-colors"
          >
            ← Back
          </button>
        )}
        {!isLast ? (
          <button
            type="button"
            onClick={() => setScreen(s => s + 1)}
            className="flex-1 px-4 py-2 rounded-lg bg-calm-indigo text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Next →
          </button>
        ) : (
          <button
            type="button"
            onClick={onComplete}
            className="flex-1 px-4 py-2 rounded-lg bg-calm-indigo text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Build my discovery requests →
          </button>
        )}
      </div>
    </div>
  )
}

function ServicePhase({
  serviceMethod,
  setServiceMethod,
  serviceDate,
  setServiceDate,
  recipientAddress,
  setRecipientAddress,
  onBack,
  onNext,
}: {
  serviceMethod: string
  setServiceMethod: (v: string) => void
  serviceDate: string
  setServiceDate: (v: string) => void
  recipientAddress: string
  setRecipientAddress: (v: string) => void
  onBack: () => void
  onNext: () => void
}) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-warm-text mb-1">How to send your requests</h2>
      <p className="text-warm-muted text-sm mb-4">Choose a service method and fill in the details.</p>

      <div className="space-y-3 mb-5">
        {SERVICE_METHODS.map(method => (
          <button
            key={method.id}
            type="button"
            onClick={() => setServiceMethod(method.id)}
            className={`w-full text-left rounded-lg border p-3 transition-colors ${
              serviceMethod === method.id
                ? 'border-calm-indigo bg-calm-indigo/5'
                : 'border-warm-border hover:bg-warm-bg'
            }`}
          >
            <p className={`text-sm font-medium ${serviceMethod === method.id ? 'text-calm-indigo' : 'text-warm-text'}`}>
              {method.label}
            </p>
            <p className="text-xs text-warm-muted mt-0.5">{method.description}</p>
          </button>
        ))}
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-warm-text mb-1">Service date</label>
          <input
            type="date"
            value={serviceDate}
            onChange={e => setServiceDate(e.target.value)}
            className="w-full rounded-lg border border-warm-border px-3 py-2 text-sm text-warm-text bg-white focus:outline-none focus:ring-2 focus:ring-calm-indigo/30"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-warm-text mb-1">Recipient address</label>
          <input
            type="text"
            value={recipientAddress}
            onChange={e => setRecipientAddress(e.target.value)}
            placeholder="123 Main St, City, State ZIP"
            className="w-full rounded-lg border border-warm-border px-3 py-2 text-sm text-warm-text placeholder:text-warm-muted bg-white focus:outline-none focus:ring-2 focus:ring-calm-indigo/30"
          />
        </div>
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

function TrackerPhase({
  caseId,
  taskId,
  selectedInterrogatories,
  selectedRfps,
  selectedAdmissions,
  serviceMethod,
  serviceDate,
  recipientAddress,
  onBack,
}: {
  caseId: string
  taskId: string
  selectedInterrogatories: Set<string>
  selectedRfps: Set<string>
  selectedAdmissions: Set<string>
  serviceMethod: string
  serviceDate: string
  recipientAddress: string
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
            discovery_interrogatories: Array.from(selectedInterrogatories),
            discovery_rfps: Array.from(selectedRfps),
            discovery_admissions: Array.from(selectedAdmissions),
            discovery_service_method: serviceMethod,
            discovery_service_date: serviceDate,
            discovery_recipient_address: recipientAddress,
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
      <h2 className="text-xl font-semibold text-warm-text mb-1">Track their deadline</h2>
      <p className="text-warm-muted text-sm mb-4">Here is what to expect after you serve your requests.</p>

      <div className="rounded-lg border border-calm-amber bg-calm-amber/10 p-4 mb-5">
        <p className="text-sm font-medium text-warm-text">
          Typical deadline: 30–45 days from the date you served them
        </p>
      </div>

      <div className="rounded-lg border border-warm-border p-4 mb-6">
        <p className="text-sm font-medium text-warm-text mb-3">If they don't respond by the deadline:</p>
        <ol className="space-y-2 list-none pl-0">
          {[
            'Wait until the deadline has fully passed.',
            'Send a follow-up letter asking them to respond within 10 days.',
            'File a Motion to Compel with the court if they still don\'t respond.',
            'The court may impose sanctions or deem facts admitted.',
          ].map((step, i) => (
            <li key={i} className="flex gap-3 text-sm text-warm-muted">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-calm-indigo/10 text-calm-indigo text-xs font-semibold flex items-center justify-center">
                {i + 1}
              </span>
              <span className="leading-relaxed pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
      </div>

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
          {submitting ? 'Saving…' : 'Complete Discovery Setup'}
        </button>
      </div>
    </div>
  )
}

// ─── Main wizard ───────────────────────────────────────────────────────────────

export function NoviceDiscoveryWizard({ caseId, taskId }: NoviceDiscoveryWizardProps) {
  const [phase, setPhase] = useState<Phase>('explainer')

  // Selections
  const [selectedInterrogatories, setSelectedInterrogatories] = useState<Set<string>>(
    new Set(INTERROGATORIES.map(i => i.id))
  )
  const [selectedRfps, setSelectedRfps] = useState<Set<string>>(
    new Set(RFPS.map(i => i.id))
  )
  const [selectedAdmissions, setSelectedAdmissions] = useState<Set<string>>(
    new Set(ADMISSIONS.map(i => i.id))
  )

  // Service details
  const [serviceMethod, setServiceMethod] = useState('certified_mail')
  const [serviceDate, setServiceDate] = useState('')
  const [recipientAddress, setRecipientAddress] = useState('')

  function toggleItem(set: Set<string>, setFn: (s: Set<string>) => void, id: string) {
    const next = new Set(set)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setFn(next)
  }

  const PHASE_LABELS: Record<Phase, string> = {
    explainer: 'Understanding Discovery',
    interrogatories: 'Written Questions',
    rfp: 'Document Requests',
    admissions: 'Admissions',
    service: 'How to Send',
    tracker: 'Track the Deadline',
  }

  return (
    <div className="max-w-lg mx-auto py-8 px-4">
      <ProgressBar phase={phase} />

      <p className="text-xs font-medium text-calm-indigo uppercase tracking-wide mb-4">
        {PHASE_LABELS[phase]}
      </p>

      {phase === 'explainer' && (
        <ExplainerPhase onComplete={() => setPhase('interrogatories')} />
      )}

      {phase === 'interrogatories' && (
        <TemplateChecklist
          title="Written Questions (Interrogatories)"
          subtitle="Select the questions you want to send. All are pre-selected — uncheck any you don't need."
          items={INTERROGATORIES}
          selected={selectedInterrogatories}
          onToggle={id => toggleItem(selectedInterrogatories, setSelectedInterrogatories, id)}
          onBack={() => setPhase('explainer')}
          onNext={() => setPhase('rfp')}
        />
      )}

      {phase === 'rfp' && (
        <TemplateChecklist
          title="Document Requests (Requests for Production)"
          subtitle="Select the documents you want to request. All are pre-selected — uncheck any you don't need."
          items={RFPS}
          selected={selectedRfps}
          onToggle={id => toggleItem(selectedRfps, setSelectedRfps, id)}
          onBack={() => setPhase('interrogatories')}
          onNext={() => setPhase('admissions')}
        />
      )}

      {phase === 'admissions' && (
        <TemplateChecklist
          title="Requests for Admissions"
          subtitle="Ask the other side to admit or deny key facts. Admitted facts don't need to be proven at trial."
          items={ADMISSIONS}
          selected={selectedAdmissions}
          onToggle={id => toggleItem(selectedAdmissions, setSelectedAdmissions, id)}
          onBack={() => setPhase('rfp')}
          onNext={() => setPhase('service')}
        />
      )}

      {phase === 'service' && (
        <ServicePhase
          serviceMethod={serviceMethod}
          setServiceMethod={setServiceMethod}
          serviceDate={serviceDate}
          setServiceDate={setServiceDate}
          recipientAddress={recipientAddress}
          setRecipientAddress={setRecipientAddress}
          onBack={() => setPhase('admissions')}
          onNext={() => setPhase('tracker')}
        />
      )}

      {phase === 'tracker' && (
        <TrackerPhase
          caseId={caseId}
          taskId={taskId}
          selectedInterrogatories={selectedInterrogatories}
          selectedRfps={selectedRfps}
          selectedAdmissions={selectedAdmissions}
          serviceMethod={serviceMethod}
          serviceDate={serviceDate}
          recipientAddress={recipientAddress}
          onBack={() => setPhase('service')}
        />
      )}
    </div>
  )
}
