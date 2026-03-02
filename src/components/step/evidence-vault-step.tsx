'use client'

import { useState } from 'react'
import { StepRunner } from './step-runner'
import Link from 'next/link'

interface EvidenceVaultStepProps {
  caseId: string
  taskId: string
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

export function EvidenceVaultStep({
  caseId,
  taskId,
}: EvidenceVaultStepProps) {
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

  return (
    <StepRunner
      caseId={caseId}
      taskId={taskId}
      title="Evidence Vault"
      reassurance="Learn how to collect and organize evidence to build a strong case."
      onConfirm={handleConfirm}
      skipReview
    >
      <div className="space-y-4">
        <div className="rounded-lg border border-calm-indigo/20 bg-calm-indigo/5 p-4">
          <p className="text-sm text-warm-text">
            The Evidence Vault is where you&apos;ll store and organize all
            evidence for your case. Upload documents, photos, and other files
            so everything is in one place when you need it.
          </p>
        </div>

        <ExpandableSection
          title="What evidence should I collect?"
          isOpen={openSection === 'what'}
          onToggle={() => toggleSection('what')}
        >
          <div className="space-y-3 text-sm text-warm-muted">
            <p>
              Gather anything that supports your claims or defenses. Common
              types of evidence include:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong className="text-warm-text">Documents</strong> —
                Contracts, leases, agreements, invoices, receipts, and
                official records
              </li>
              <li>
                <strong className="text-warm-text">Photos &amp; videos</strong>{' '}
                — Images of property damage, injuries, conditions, or
                relevant locations
              </li>
              <li>
                <strong className="text-warm-text">Communications</strong> —
                Emails, text messages, letters, and voicemails between
                parties
              </li>
              <li>
                <strong className="text-warm-text">Financial records</strong>{' '}
                — Bank statements, pay stubs, tax returns, and expense
                reports
              </li>
              <li>
                <strong className="text-warm-text">
                  Witness statements
                </strong>{' '}
                — Written accounts from people who saw or know about what
                happened
              </li>
            </ul>
          </div>
        </ExpandableSection>

        <ExpandableSection
          title="How to organize your evidence"
          isOpen={openSection === 'organize'}
          onToggle={() => toggleSection('organize')}
        >
          <div className="space-y-3 text-sm text-warm-muted">
            <p>
              Keeping your evidence organized makes it easier to find what
              you need and present a clear case. Here are some tips:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong className="text-warm-text">
                  Group by category
                </strong>{' '}
                — Separate documents, photos, communications, and financial
                records into distinct groups
              </li>
              <li>
                <strong className="text-warm-text">
                  Label clearly
                </strong>{' '}
                — Use descriptive file names that include the date and a
                brief description (e.g., &quot;2024-03-15_lease_agreement.pdf&quot;)
              </li>
              <li>
                <strong className="text-warm-text">
                  Create a log
                </strong>{' '}
                — Maintain an index that lists each piece of evidence, when
                you obtained it, and what it proves
              </li>
              <li>
                <strong className="text-warm-text">
                  Note the source
                </strong>{' '}
                — Record where each piece of evidence came from and how you
                obtained it
              </li>
            </ul>
          </div>
        </ExpandableSection>

        <ExpandableSection
          title="Tips for strengthening your case"
          isOpen={openSection === 'tips'}
          onToggle={() => toggleSection('tips')}
        >
          <div className="space-y-3 text-sm text-warm-muted">
            <p>
              Strong evidence is authentic, well-preserved, and easy to
              verify. Follow these guidelines:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong className="text-warm-text">
                  Authenticate everything
                </strong>{' '}
                — Be prepared to explain how you know each document or photo
                is genuine and unaltered
              </li>
              <li>
                <strong className="text-warm-text">
                  Maintain chain of custody
                </strong>{' '}
                — Track who has handled the evidence and when, especially
                for physical items
              </li>
              <li>
                <strong className="text-warm-text">
                  Get certified copies
                </strong>{' '}
                — For official records (court filings, government documents),
                request certified copies rather than relying on photocopies
              </li>
              <li>
                <strong className="text-warm-text">
                  Keep originals safe
                </strong>{' '}
                — Store original documents securely and use copies for
                everyday reference. Never alter an original.
              </li>
              <li>
                <strong className="text-warm-text">
                  Back up digital files
                </strong>{' '}
                — Keep multiple copies of digital evidence in case of data
                loss or corruption
              </li>
            </ul>
          </div>
        </ExpandableSection>

        <div className="pt-2">
          <Link
            href={`/case/${caseId}/evidence`}
            className="text-sm text-calm-indigo hover:underline"
          >
            Go to Evidence Vault →
          </Link>
        </div>
      </div>
    </StepRunner>
  )
}
