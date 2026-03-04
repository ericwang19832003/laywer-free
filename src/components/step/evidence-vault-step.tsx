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
  const checklistItems = [
    {
      id: 'core-docs',
      title: 'Collect core documents',
      detail: 'Contracts, receipts, invoices, policies, or court notices.',
    },
    {
      id: 'communications',
      title: 'Gather key communications',
      detail: 'Texts, emails, letters, and call logs with dates.',
    },
    {
      id: 'photos',
      title: 'Pull photos or video',
      detail: 'Before/after shots, damage, or the condition at issue.',
    },
    {
      id: 'damages',
      title: 'Proof of losses',
      detail: 'Estimates, repair bills, and payment records.',
    },
    {
      id: 'witnesses',
      title: 'List witnesses',
      detail: 'Names, contact info, and what they saw.',
    },
  ]
  const namingTemplates = [
    {
      label: 'General',
      template: 'YYYY-MM-DD_type_description.ext',
      example: '2026-03-03_receipt_window-repair.pdf',
    },
    {
      label: 'Communications',
      template: 'YYYY-MM-DD_message_from-to_topic.ext',
      example: '2026-02-19_text_jordan-to-alex_refund.png',
    },
    {
      label: 'Photos',
      template: 'YYYY-MM-DD_photo_location_subject.ext',
      example: '2026-02-10_photo_kitchen_water-damage.jpg',
    },
  ]
  const [checklistState, setChecklistState] = useState<Record<string, boolean>>(
    () =>
      Object.fromEntries(
        checklistItems.map((item) => [item.id, false])
      )
  )

  function toggleSection(key: string) {
    setOpenSection((prev) => (prev === key ? null : key))
  }
  function toggleChecklistItem(id: string) {
    setChecklistState((prev) => ({ ...prev, [id]: !prev[id] }))
  }
  function markAllChecklistDone() {
    setChecklistState(
      Object.fromEntries(checklistItems.map((item) => [item.id, true]))
    )
  }
  function resetChecklist() {
    setChecklistState(
      Object.fromEntries(checklistItems.map((item) => [item.id, false]))
    )
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

        <div className="rounded-lg border border-calm-amber/40 bg-calm-amber/10 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-warm-text">
                Quick start checklist
              </h2>
              <p className="text-xs text-warm-muted">
                Start with the essentials. You can add the rest later.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                type="button"
                onClick={markAllChecklistDone}
                className="rounded-full border border-calm-indigo/30 px-3 py-1 text-calm-indigo hover:border-calm-indigo/60"
              >
                Mark all done
              </button>
              <button
                type="button"
                onClick={resetChecklist}
                className="rounded-full border border-warm-border px-3 py-1 text-warm-muted hover:text-warm-text"
              >
                Reset checklist
              </button>
            </div>
          </div>
          <ul className="mt-4 space-y-3">
            {checklistItems.map((item) => (
              <li key={item.id} className="flex items-start gap-3">
                <label className="flex items-start gap-3 text-sm text-warm-text">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-warm-border"
                    checked={checklistState[item.id] ?? false}
                    onChange={() => toggleChecklistItem(item.id)}
                  />
                  <span>
                    <span className="font-medium">{item.title}</span>
                    <span className="block text-xs text-warm-muted">
                      {item.detail}
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-warm-border bg-white p-4">
          <h2 className="text-sm font-semibold text-warm-text">
            File naming templates
          </h2>
          <p className="text-xs text-warm-muted">
            Consistent names make it easy to find evidence fast.
          </p>
          <div className="mt-3 space-y-3">
            {namingTemplates.map((template) => (
              <div
                key={template.label}
                className="rounded-md border border-warm-border/70 bg-warm-border/10 p-3"
              >
                <p className="text-xs font-medium text-warm-text">
                  {template.label}
                </p>
                <p className="mt-1 font-mono text-[11px] text-warm-text">
                  {template.template}
                </p>
                <p className="mt-1 text-[11px] text-warm-muted">
                  Example: {template.example}
                </p>
              </div>
            ))}
          </div>
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
