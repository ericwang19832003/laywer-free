'use client'

import { useState } from 'react'
import { StepRunner } from './step-runner'
import Link from 'next/link'

interface DiscoveryStarterPackStepProps {
  caseId: string
  taskId: string
  courtType: string
}

function ExpandableSection({
  title,
  isOpen,
  onToggle,
  children,
}: {
  title: string
  isOpen: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="rounded-lg border border-warm-border">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-sm font-medium text-warm-text">{title}</span>
        <span
          className={`text-warm-muted transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        >
          ▾
        </span>
      </button>
      {isOpen && (
        <div className="border-t border-warm-border px-4 py-3">
          {children}
        </div>
      )}
    </div>
  )
}

function getCourtIntro(courtType: string): string {
  switch (courtType) {
    case 'jp':
      return 'Justice of the Peace courts have limited formal discovery. You may still be able to request documents through subpoenas or informal requests.'
    case 'federal':
      return 'Federal courts follow the Federal Rules of Civil Procedure (FRCP) Rules 26–37. Discovery is a structured process with specific requirements, including mandatory initial disclosures.'
    default:
      return 'Texas state courts follow the Texas Rules of Civil Procedure for discovery. You can request documents, ask written questions, and request admissions from the other side.'
  }
}

function getDeadlinesContent(courtType: string): React.ReactNode {
  if (courtType === 'jp') {
    return (
      <div className="space-y-2 text-sm text-warm-muted">
        <p>
          JP courts have limited formal discovery rules. If you need documents
          from the other party, consider:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Requesting documents informally in writing</li>
          <li>Asking the court to issue a subpoena for specific records</li>
          <li>Bringing your evidence directly to trial</li>
        </ul>
      </div>
    )
  }

  if (courtType === 'federal') {
    return (
      <div className="space-y-2 text-sm text-warm-muted">
        <p>Key federal discovery rules (FRCP):</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Mandatory disclosures</strong> — Required within 14 days
            of the Rule 26(f) conference
          </li>
          <li>
            <strong>Response deadline</strong> — 30 days to respond to
            discovery requests
          </li>
          <li>
            <strong>Proportionality</strong> — Requests must be proportional
            to the needs of the case (Rule 26(b)(1))
          </li>
          <li>
            <strong>Interrogatory limit</strong> — 25 interrogatories
            (including subparts) unless the court orders otherwise
          </li>
        </ul>
      </div>
    )
  }

  // county / district (Texas state)
  return (
    <div className="space-y-2 text-sm text-warm-muted">
      <p>Key Texas discovery rules (TRCP):</p>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>Response deadline</strong> — 30 days from the date you
          receive the discovery request
        </li>
        <li>
          <strong>Interrogatory limit</strong> — 25 interrogatories
          (including subparts)
        </li>
        <li>
          <strong>Discovery period</strong> — Generally ends 30 days before
          trial (Level 1 cases) or by court order
        </li>
        <li>
          <strong>Objections</strong> — Must be specific and timely, or
          they may be waived
        </li>
      </ul>
    </div>
  )
}

export function DiscoveryStarterPackStep({
  caseId,
  taskId,
  courtType,
}: DiscoveryStarterPackStepProps) {
  const [openSection, setOpenSection] = useState<string | null>(null)

  function toggleSection(key: string) {
    setOpenSection((prev) => (prev === key ? null : key))
  }

  async function patchTask(status: string) {
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Failed to update task')
    }
  }

  async function handleConfirm() {
    await patchTask('in_progress')
    await patchTask('completed')
  }

  const intro = getCourtIntro(courtType)

  return (
    <StepRunner
      caseId={caseId}
      taskId={taskId}
      title="Discovery Starter Pack"
      reassurance="Learn about the tools you can use to request documents and information from the other side."
      onConfirm={handleConfirm}
      skipReview
    >
      <div className="space-y-4">
        <div className="rounded-lg border border-calm-indigo/20 bg-calm-indigo/5 p-4">
          <p className="text-sm text-warm-text">{intro}</p>
        </div>

        <ExpandableSection
          title="What is Discovery?"
          isOpen={openSection === 'what'}
          onToggle={() => toggleSection('what')}
        >
          <div className="space-y-2 text-sm text-warm-muted">
            <p>
              Discovery is the formal process of exchanging information
              between parties in a lawsuit. It happens after the case is
              filed and before trial.
            </p>
            <p>
              The goal is to prevent surprises at trial — both sides get to
              see the evidence and understand each other&apos;s positions
              beforehand.
            </p>
          </div>
        </ExpandableSection>

        <ExpandableSection
          title="Tools Available to You"
          isOpen={openSection === 'tools'}
          onToggle={() => toggleSection('tools')}
        >
          <div className="space-y-3 text-sm text-warm-muted">
            <div>
              <p className="font-medium text-warm-text">
                Requests for Production (RFP)
              </p>
              <p>
                Ask the other side to produce documents, photos, contracts,
                communications, or other tangible evidence relevant to the
                case.
              </p>
            </div>
            <div>
              <p className="font-medium text-warm-text">
                Interrogatories (ROG)
              </p>
              <p>
                Written questions the other party must answer under oath.
                Useful for getting facts, timelines, and identifying
                witnesses.
              </p>
            </div>
            <div>
              <p className="font-medium text-warm-text">
                Requests for Admissions (RFA)
              </p>
              <p>
                Ask the other side to admit or deny specific facts. If they
                don&apos;t respond within the deadline, the facts are
                considered admitted.
              </p>
            </div>
          </div>
        </ExpandableSection>

        <ExpandableSection
          title="Key Deadlines & Rules"
          isOpen={openSection === 'rules'}
          onToggle={() => toggleSection('rules')}
        >
          {getDeadlinesContent(courtType)}
        </ExpandableSection>

        <div className="pt-2">
          <Link
            href={`/case/${caseId}/discovery`}
            className="text-sm text-calm-indigo hover:underline"
          >
            Go to Discovery Hub →
          </Link>
        </div>
      </div>
    </StepRunner>
  )
}
