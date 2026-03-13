'use client'

import { useState } from 'react'
import { StepRunner } from '../step-runner'
import { SafetyResources } from './safety-resources'

interface SafetyScreeningStepProps {
  caseId: string
  taskId: string
  /** When true, suppresses the "consider filing for a Protective Order" recommendation
   *  since the user is already in the PO workflow. */
  isProtectiveOrder?: boolean
}

export function SafetyScreeningStep({
  caseId,
  taskId,
  isProtectiveOrder = false,
}: SafetyScreeningStepProps) {
  const [physicalHarm, setPhysicalHarm] = useState(false)
  const [afraid, setAfraid] = useState(false)
  const [propertyDestruction, setPropertyDestruction] = useState(false)
  const [safetyTipsOpen, setSafetyTipsOpen] = useState(false)

  const anyConcern = physicalHarm || afraid || propertyDestruction

  async function patchTask(
    status: string,
    metadata?: Record<string, unknown>
  ) {
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
    const metadata = {
      physical_harm: physicalHarm,
      afraid,
      property_destruction: propertyDestruction,
      any_concern: anyConcern,
    }
    await patchTask('in_progress', metadata)
    await patchTask('completed')
  }

  return (
    <StepRunner
      caseId={caseId}
      taskId={taskId}
      title="Safety Screening"
      reassurance="Your safety matters. This step helps us understand your situation so we can guide you to the right resources."
      onConfirm={handleConfirm}
      skipReview
    >
      <div className="space-y-5">
        {/* Digital safety warning */}
        <div className="rounded-lg border border-calm-amber/30 bg-calm-amber/5 p-4">
          <p className="text-sm text-warm-text">
            <strong>Safety notice:</strong> If you share a device with the
            person you need protection from, consider using a different device or
            clearing your browser history after each session. Use a
            private/incognito browser window when possible.
          </p>
        </div>

        {/* Emergency resources */}
        <SafetyResources />

        {/* Screening questions */}
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-warm-text mb-3">
            Please answer the following questions honestly. Your answers are
            confidential and help us provide the right guidance.
          </h3>
          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer rounded-lg border border-warm-border p-3 transition-colors hover:bg-warm-bg/50">
              <input
                type="checkbox"
                checked={physicalHarm}
                onChange={(e) => setPhysicalHarm(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-warm-border text-calm-indigo focus:ring-calm-indigo"
              />
              <span className="text-sm text-warm-text">
                Has the other person physically hurt you, your children, or
                threatened to?
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer rounded-lg border border-warm-border p-3 transition-colors hover:bg-warm-bg/50">
              <input
                type="checkbox"
                checked={afraid}
                onChange={(e) => setAfraid(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-warm-border text-calm-indigo focus:ring-calm-indigo"
              />
              <span className="text-sm text-warm-text">
                Are you afraid of the other person?
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer rounded-lg border border-warm-border p-3 transition-colors hover:bg-warm-bg/50">
              <input
                type="checkbox"
                checked={propertyDestruction}
                onChange={(e) => setPropertyDestruction(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-warm-border text-calm-indigo focus:ring-calm-indigo"
              />
              <span className="text-sm text-warm-text">
                Has the other person destroyed your property or harmed your pets?
              </span>
            </label>
          </div>
        </div>

        {/* Conditional recommendation */}
        {anyConcern && (
          <div className="rounded-lg border border-calm-indigo/20 bg-calm-indigo/5 p-4 space-y-2">
            {isProtectiveOrder ? (
              <>
                <p className="text-sm font-medium text-warm-text">
                  Thank you for sharing this information. Your responses confirm
                  that seeking a Protective Order is appropriate for your situation.
                </p>
                <p className="text-sm text-warm-muted">
                  We&apos;ll use your answers to help build your case in the next steps.
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-warm-text">
                  Based on your answers, you may want to consider filing for a
                  Protective Order. This can provide immediate legal protection.
                </p>
                <p className="text-sm text-warm-muted">
                  You can still proceed with your current filing type. We&apos;ll
                  include safety considerations in your case.
                </p>
              </>
            )}
          </div>
        )}

        {/* Safety planning checklist (expandable) */}
        <div className="rounded-lg border border-warm-border">
          <button
            type="button"
            onClick={() => setSafetyTipsOpen((prev) => !prev)}
            aria-expanded={safetyTipsOpen}
            className="flex w-full items-center justify-between px-4 py-3 text-left"
          >
            <span className="text-sm font-medium text-warm-text">
              Safety Planning Tips
            </span>
            <span
              className={`text-warm-muted transition-transform duration-200 ${
                safetyTipsOpen ? 'rotate-180' : ''
              }`}
            >
              ▾
            </span>
          </button>
          {safetyTipsOpen && (
            <div className="border-t border-warm-border px-4 py-3">
              <ul className="space-y-2 text-sm text-warm-muted">
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
                  Keep important documents in a safe location outside the home
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
                  Set up a separate email account the other person doesn&apos;t
                  know about
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
                  Save evidence of threats or violence (screenshots, photos,
                  medical records)
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
                  Know where your local shelter is
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-calm-indigo" />
                  Have an exit plan if you need to leave quickly
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </StepRunner>
  )
}
