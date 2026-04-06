'use client'

import { useState } from 'react'
import { StepRunner } from './step-runner'

interface MandatoryDisclosuresStepProps {
  caseId: string
  taskId: string
}

interface DisclosureItem {
  key: string
  title: string
  description: string
}

const DISCLOSURE_ITEMS: DisclosureItem[] = [
  {
    key: 'witnesses',
    title: 'Individuals with discoverable information',
    description: 'Provide the names, addresses, and phone numbers of each person likely to have discoverable information that you may use to support your claims. Include a brief description of what each person knows.',
  },
  {
    key: 'documents',
    title: 'Documents and electronically stored information (ESI)',
    description: 'Provide copies (or descriptions by category and location) of all documents, electronically stored information, and tangible things you have that you may use to support your claims.',
  },
  {
    key: 'damages',
    title: 'Damages computation',
    description: 'Provide a computation of each category of damages you are claiming. Make available the documents or other evidence on which each computation is based.',
  },
  {
    key: 'insurance',
    title: 'Insurance agreements',
    description: 'Provide copies of any insurance agreement that may be relevant to satisfying part or all of a judgment in this case.',
  },
]

export function MandatoryDisclosuresStep({
  caseId,
  taskId,
}: MandatoryDisclosuresStepProps) {
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [expandedItem, setExpandedItem] = useState<string | null>(null)

  function toggleChecked(key: string) {
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  function toggleExpanded(key: string) {
    setExpandedItem((prev) => (prev === key ? null : key))
  }

  const allChecked = DISCLOSURE_ITEMS.every((item) => checked[item.key])

  async function patchTask(status: string, metadata?: Record<string, unknown>) {
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, ...(metadata ? { metadata } : {}) }),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Failed to update task')
    }
  }

  async function handleConfirm() {
    await patchTask('in_progress', { disclosures_completed: checked })
    await patchTask('completed')

    // Run gatekeeper to unlock discovery_starter_pack
    await fetch(`/api/cases/${caseId}/rules/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
  }

  return (
    <StepRunner
      caseId={caseId}
      taskId={taskId}
      title="Complete Mandatory Disclosures"
      reassurance="Federal Rule 26(a)(1) requires both sides to exchange basic information early in the case — without waiting for formal discovery requests."
      onConfirm={handleConfirm}
      skipReview
    >
      <div className="space-y-4">
        <div className="rounded-lg border border-calm-indigo/20 bg-calm-indigo/5 p-4">
          <p className="text-sm text-warm-text">
            These disclosures are due within 14 days of the Rule 26(f) conference.
            Check off each category once you have gathered the required information.
          </p>
        </div>

        <div className="space-y-3">
          {DISCLOSURE_ITEMS.map((item) => (
            <div key={item.key} className="rounded-lg border border-warm-border">
              <div className="flex items-start gap-3 px-4 py-3">
                <input
                  type="checkbox"
                  checked={checked[item.key] ?? false}
                  onChange={() => toggleChecked(item.key)}
                  className="mt-0.5 h-4 w-4 rounded border-warm-border text-primary focus:ring-primary"
                />
                <div className="flex-1">
                  <button
                    type="button"
                    onClick={() => toggleExpanded(item.key)}
                    className="flex w-full items-center justify-between text-left"
                  >
                    <span className={`text-sm font-medium ${
                      checked[item.key] ? 'text-warm-muted line-through' : 'text-warm-text'
                    }`}>
                      {item.title}
                    </span>
                    <span
                      className={`text-warm-muted transition-transform duration-200 ml-2 ${
                        expandedItem === item.key ? 'rotate-180' : ''
                      }`}
                      aria-hidden="true"
                    >
                      ▾
                    </span>
                  </button>
                  {expandedItem === item.key && (
                    <p className="text-sm text-warm-muted mt-2">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {!allChecked && (
          <p className="text-xs text-warm-muted">
            Check off each category once you have gathered the required information.
          </p>
        )}
      </div>
    </StepRunner>
  )
}
