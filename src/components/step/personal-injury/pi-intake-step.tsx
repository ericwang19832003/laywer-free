'use client'

import { useState } from 'react'
import { StepRunner } from '../step-runner'

interface PIIntakeStepProps {
  caseId: string
  taskId: string
  existingMetadata?: Record<string, unknown>
}

export function PIIntakeStep({
  caseId,
  taskId,
  existingMetadata,
}: PIIntakeStepProps) {
  const meta = existingMetadata ?? {}

  const [incidentDate, setIncidentDate] = useState(
    (meta.incident_date as string) ?? ''
  )
  const [incidentLocation, setIncidentLocation] = useState(
    (meta.incident_location as string) ?? ''
  )
  const [incidentDescription, setIncidentDescription] = useState(
    (meta.incident_description as string) ?? ''
  )
  const [policeReportFiled, setPoliceReportFiled] = useState<boolean | null>(
    (meta.police_report_filed as boolean | null) ?? null
  )
  const [policeReportNumber, setPoliceReportNumber] = useState(
    (meta.police_report_number as string) ?? ''
  )
  const [injuryDescription, setInjuryDescription] = useState(
    (meta.injury_description as string) ?? ''
  )
  const [injurySeverity, setInjurySeverity] = useState(
    (meta.injury_severity as string) ?? ''
  )

  // -- SOL warning calculator --

  function getSolWarning(): { show: boolean; daysRemaining: number } | null {
    if (!incidentDate) return null
    const incidentDateObj = new Date(incidentDate)
    if (isNaN(incidentDateObj.getTime())) return null
    const daysSinceIncident = Math.floor(
      (Date.now() - incidentDateObj.getTime()) / 86400000
    )
    // Show warning if more than 18 months (547 days) ago
    if (daysSinceIncident <= 547) return null
    const daysRemaining = Math.max(
      0,
      Math.ceil(
        (incidentDateObj.getTime() + 730 * 86400000 - Date.now()) / 86400000
      )
    )
    return { show: true, daysRemaining }
  }

  const solWarning = getSolWarning()

  // -- Metadata --

  function buildMetadata() {
    return {
      incident_date: incidentDate || null,
      incident_location: incidentLocation.trim() || null,
      incident_description: incidentDescription.trim() || null,
      police_report_filed: policeReportFiled,
      police_report_number: policeReportNumber.trim() || null,
      injury_description: injuryDescription.trim() || null,
      injury_severity: injurySeverity || null,
    }
  }

  // -- API calls --

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
    const metadata = buildMetadata()
    await patchTask('in_progress', metadata)
    await patchTask('completed')
  }

  async function handleSave() {
    const metadata = buildMetadata()
    await patchTask('in_progress', metadata)
  }

  // -- Review content --

  const severityLabels: Record<string, string> = {
    minor: 'Minor',
    moderate: 'Moderate',
    severe: 'Severe',
  }

  const reviewContent = (
    <dl className="space-y-4">
      <div>
        <dt className="text-sm font-medium text-warm-muted">
          Date of incident
        </dt>
        <dd className="text-warm-text mt-0.5">
          {incidentDate || 'Not provided'}
        </dd>
      </div>
      <div>
        <dt className="text-sm font-medium text-warm-muted">
          Location of incident
        </dt>
        <dd className="text-warm-text mt-0.5">
          {incidentLocation.trim() || 'Not provided'}
        </dd>
      </div>
      <div>
        <dt className="text-sm font-medium text-warm-muted">
          What happened
        </dt>
        <dd className="text-warm-text mt-0.5 whitespace-pre-wrap">
          {incidentDescription.trim() || 'Not provided'}
        </dd>
      </div>
      <div>
        <dt className="text-sm font-medium text-warm-muted">
          Police report filed
        </dt>
        <dd className="text-warm-text mt-0.5">
          {policeReportFiled === null
            ? 'Not answered'
            : policeReportFiled
              ? 'Yes'
              : 'No'}
          {policeReportFiled && policeReportNumber.trim() && (
            <span className="text-warm-muted ml-2">
              (Report #{policeReportNumber.trim()})
            </span>
          )}
        </dd>
      </div>
      <div>
        <dt className="text-sm font-medium text-warm-muted">
          Injuries described
        </dt>
        <dd className="text-warm-text mt-0.5 whitespace-pre-wrap">
          {injuryDescription.trim() || 'Not provided'}
        </dd>
      </div>
      <div>
        <dt className="text-sm font-medium text-warm-muted">
          Injury severity
        </dt>
        <dd className="text-warm-text mt-0.5">
          {severityLabels[injurySeverity] ?? 'Not specified'}
        </dd>
      </div>
    </dl>
  )

  // -- Shared input class --

  const inputClass =
    'flex h-9 w-full rounded-md border border-warm-border bg-transparent px-3 py-1 text-sm text-warm-text shadow-xs placeholder:text-warm-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-calm-indigo'

  return (
    <StepRunner
      caseId={caseId}
      taskId={taskId}
      title="Tell Us About Your Injury"
      reassurance="This information helps us understand your case and prepare your documents."
      onConfirm={handleConfirm}
      onSave={handleSave}
      reviewContent={reviewContent}
    >
      <div className="space-y-5">
        {/* Incident date */}
        <div className="space-y-2">
          <label
            htmlFor="pi-incident-date"
            className="text-sm font-medium text-warm-text"
          >
            Date of incident *
          </label>
          <input
            id="pi-incident-date"
            type="date"
            value={incidentDate}
            onChange={(e) => setIncidentDate(e.target.value)}
            className={inputClass}
          />
        </div>

        {/* SOL warning */}
        {solWarning && solWarning.show && (
          <div className="rounded-lg border border-calm-amber bg-calm-amber/5 p-3">
            <p className="text-sm font-medium text-warm-text">
              &#x26A0; Statute of Limitations Warning
            </p>
            <p className="text-xs text-warm-muted mt-1">
              The Texas statute of limitations for personal injury is 2 years
              from the date of injury (Tex. Civ. Prac. &amp; Rem. Code
              &sect; 16.003). You have approximately {solWarning.daysRemaining}{' '}
              days remaining to file.
            </p>
          </div>
        )}

        {/* Incident location */}
        <div className="space-y-2">
          <label
            htmlFor="pi-incident-location"
            className="text-sm font-medium text-warm-text"
          >
            Location of incident *
          </label>
          <input
            id="pi-incident-location"
            type="text"
            placeholder="e.g. I-35 and 51st Street, Austin, TX"
            value={incidentLocation}
            onChange={(e) => setIncidentLocation(e.target.value)}
            className={inputClass}
          />
        </div>

        {/* Incident description */}
        <div className="space-y-2">
          <label
            htmlFor="pi-incident-description"
            className="text-sm font-medium text-warm-text"
          >
            What happened? *
          </label>
          <textarea
            id="pi-incident-description"
            placeholder="Describe the incident in your own words..."
            value={incidentDescription}
            onChange={(e) => setIncidentDescription(e.target.value)}
            rows={4}
            className="flex min-h-[60px] w-full rounded-md border border-warm-border bg-transparent px-3 py-2 text-sm text-warm-text shadow-xs placeholder:text-warm-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-calm-indigo"
          />
        </div>

        {/* Police report filed */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-warm-text">
            Was a police report filed?
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPoliceReportFiled(true)}
              className={`rounded-md border px-4 py-1.5 text-sm font-medium transition-colors ${
                policeReportFiled === true
                  ? 'border-calm-indigo bg-calm-indigo/10 text-calm-indigo'
                  : 'border-warm-border text-warm-muted hover:border-warm-text hover:text-warm-text'
              }`}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => setPoliceReportFiled(false)}
              className={`rounded-md border px-4 py-1.5 text-sm font-medium transition-colors ${
                policeReportFiled === false
                  ? 'border-calm-indigo bg-calm-indigo/10 text-calm-indigo'
                  : 'border-warm-border text-warm-muted hover:border-warm-text hover:text-warm-text'
              }`}
            >
              No
            </button>
          </div>
        </div>

        {/* Police report number (conditional) */}
        {policeReportFiled === true && (
          <div className="space-y-2">
            <label
              htmlFor="pi-police-report-number"
              className="text-sm font-medium text-warm-text"
            >
              Police report number
            </label>
            <input
              id="pi-police-report-number"
              type="text"
              placeholder="e.g. 2024-00012345"
              value={policeReportNumber}
              onChange={(e) => setPoliceReportNumber(e.target.value)}
              className={inputClass}
            />
          </div>
        )}

        {/* Injury description */}
        <div className="space-y-2">
          <label
            htmlFor="pi-injury-description"
            className="text-sm font-medium text-warm-text"
          >
            Describe your injuries *
          </label>
          <textarea
            id="pi-injury-description"
            placeholder="Include all injuries, even minor ones..."
            value={injuryDescription}
            onChange={(e) => setInjuryDescription(e.target.value)}
            rows={4}
            className="flex min-h-[60px] w-full rounded-md border border-warm-border bg-transparent px-3 py-2 text-sm text-warm-text shadow-xs placeholder:text-warm-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-calm-indigo"
          />
        </div>

        {/* Injury severity */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-warm-text">
            How severe are your injuries?
          </label>
          <div className="space-y-2">
            {(['minor', 'moderate', 'severe'] as const).map((level) => (
              <label
                key={level}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="radio"
                  name="pi-injury-severity"
                  value={level}
                  checked={injurySeverity === level}
                  onChange={() => setInjurySeverity(level)}
                  className="h-4 w-4 border-warm-border text-calm-indigo focus:ring-calm-indigo"
                />
                <span className="text-sm text-warm-text capitalize">
                  {level}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Texas PI SOL info callout */}
        <div className="rounded-md border border-calm-indigo/30 bg-calm-indigo/5 px-3 py-2">
          <p className="text-xs font-medium text-warm-text">
            Texas statute of limitations for personal injury
          </p>
          <p className="text-xs text-warm-muted mt-0.5">
            In Texas, the statute of limitations for personal injury claims is 2
            years from the date of injury (Tex. Civ. Prac. &amp; Rem. Code
            &sect; 16.003). Filing after this deadline can result in your case
            being dismissed.
          </p>
        </div>
      </div>
    </StepRunner>
  )
}
