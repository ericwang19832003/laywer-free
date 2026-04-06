'use client'

import { useState } from 'react'
import { StepRunner } from '../step-runner'
import { InlineFileUpload, type UploadedFile } from '@/components/ui/inline-file-upload'
import type { PiSubType } from '@lawyer-free/shared/schemas/case'
import { PROPERTY_DAMAGE_SUB_TYPES } from '@lawyer-free/shared/guided-steps/personal-injury/constants'

interface PIIntakeStepProps {
  caseId: string
  taskId: string
  existingMetadata?: Record<string, unknown>
  piSubType?: string
  state?: string
}

export function PIIntakeStep({
  caseId,
  taskId,
  existingMetadata,
  piSubType,
  state,
}: PIIntakeStepProps) {
  const meta = existingMetadata ?? {}
  const isPropertyDamage = PROPERTY_DAMAGE_SUB_TYPES.includes(
    piSubType as PiSubType
  )

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
  const [caseStage, setCaseStage] = useState(
    (meta.guided_answers as Record<string, string>)?.case_stage || 'start'
  )

  // Injury-specific
  const [injuryDescription, setInjuryDescription] = useState(
    (meta.injury_description as string) ?? ''
  )
  const [injurySeverity, setInjurySeverity] = useState(
    (meta.injury_severity as string) ?? ''
  )

  // Property damage-specific
  const [damageDescription, setDamageDescription] = useState(
    (meta.damage_description as string) ?? ''
  )
  const [estimatedDamageAmount, setEstimatedDamageAmount] = useState(
    (meta.estimated_damage_amount as string) ?? ''
  )

  // File attachments tracked by field
  const [incidentFiles, setIncidentFiles] = useState<UploadedFile[]>(
    (meta.incident_files as UploadedFile[]) ?? []
  )
  const [detailFiles, setDetailFiles] = useState<UploadedFile[]>(
    (meta.detail_files as UploadedFile[]) ?? []
  )
  const [policeReportFiles, setPoliceReportFiles] = useState<UploadedFile[]>(
    (meta.police_report_files as UploadedFile[]) ?? []
  )

  // Government entity detection
  const [govEmployeeOnDuty, setGovEmployeeOnDuty] = useState(
    (meta.gov_employee_on_duty as string) ?? ''
  )
  const [govProperty, setGovProperty] = useState(
    (meta.gov_property as string) ?? ''
  )
  const [govVehicle, setGovVehicle] = useState(
    (meta.gov_vehicle as string) ?? ''
  )
  const [govEntityType, setGovEntityType] = useState(
    (meta.gov_entity_type as string) ?? ''
  )
  const [govEntityName, setGovEntityName] = useState(
    (meta.gov_entity_name as string) ?? ''
  )

  // SOL tolling
  const [minorAtIncident, setMinorAtIncident] = useState(
    (meta.minor_at_incident as string) ?? ''
  )
  const [mentalIncapacity, setMentalIncapacity] = useState(
    (meta.mental_incapacity as string) ?? ''
  )
  const [discoveredLater, setDiscoveredLater] = useState(
    (meta.discovered_later as string) ?? ''
  )

  // Prop 213 (CA only)
  const [hadValidInsurance, setHadValidInsurance] = useState(
    (meta.had_valid_insurance as string) ?? ''
  )
  const [prop213Exception, setProp213Exception] = useState(
    (meta.prop_213_exception as string) ?? ''
  )
  const prop213Applies = hadValidInsurance === 'no' && (prop213Exception === 'none' || prop213Exception === '')
  const isCalifornia = state === 'California'

  // Derived
  const isGovEntity = govEmployeeOnDuty === 'yes' || govProperty === 'yes' || govVehicle === 'yes'

  // -- SOL warning calculator --

  function getSolWarning(): { show: boolean; daysRemaining: number } | null {
    if (!incidentDate) return null
    const incidentDateObj = new Date(incidentDate)
    if (isNaN(incidentDateObj.getTime())) return null
    const daysSinceIncident = Math.floor(
      (Date.now() - incidentDateObj.getTime()) / 86400000
    )
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
      ...(isPropertyDamage
        ? {
            damage_description: damageDescription.trim() || null,
            estimated_damage_amount: estimatedDamageAmount.trim() || null,
          }
        : {
            injury_description: injuryDescription.trim() || null,
            injury_severity: injurySeverity || null,
          }),
      incident_files: incidentFiles,
      detail_files: detailFiles,
      police_report_files: policeReportFiles,
      gov_employee_on_duty: govEmployeeOnDuty || null,
      gov_property: govProperty || null,
      gov_vehicle: govVehicle || null,
      gov_entity_type: isGovEntity ? govEntityType || null : null,
      gov_entity_name: isGovEntity ? govEntityName.trim() || null : null,
      government_entity_detected: isGovEntity,
      minor_at_incident: minorAtIncident || null,
      mental_incapacity: mentalIncapacity || null,
      discovered_later: discoveredLater || null,
      had_valid_insurance: isCalifornia ? hadValidInsurance || null : null,
      prop_213_exception: isCalifornia && hadValidInsurance === 'no' ? prop213Exception || null : null,
      prop_213_applies: isCalifornia ? prop213Applies : null,
      guided_answers: { case_stage: caseStage },
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

    // Inject Tort Claims tasks if government entity detected
    if (isGovEntity) {
      try {
        await fetch(`/api/cases/${caseId}/inject-tasks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            task_keys: ['pi_tort_claims_notice', 'pi_tort_claims_tracking'],
            insert_after: 'pi_intake',
            incident_date: incidentDate,
            gov_entity_type: govEntityType,
          }),
        })
      } catch (e) {
        console.error('Failed to inject Tort Claims tasks:', e)
      }
    }
  }

  async function handleSave() {
    const metadata = buildMetadata()
    await patchTask('in_progress', metadata)
  }

  // -- File helpers --

  function addFile(
    setter: React.Dispatch<React.SetStateAction<UploadedFile[]>>
  ) {
    return (evidenceId: string, fileName: string) =>
      setter((prev) => [...prev, { evidenceId, fileName }])
  }

  function removeFile(
    setter: React.Dispatch<React.SetStateAction<UploadedFile[]>>
  ) {
    return (evidenceId: string) =>
      setter((prev) => prev.filter((f) => f.evidenceId !== evidenceId))
  }

  // -- Review content --

  const severityLabels: Record<string, string> = {
    minor: 'Minor',
    moderate: 'Moderate',
    severe: 'Severe',
  }

  function fileCount(files: UploadedFile[]) {
    if (files.length === 0) return null
    return (
      <span className="text-xs text-warm-muted ml-1">
        ({files.length} file{files.length > 1 ? 's' : ''} attached)
      </span>
    )
  }

  const reviewContent = (
    <dl className="space-y-4">
      <div>
        <dt className="text-sm font-medium text-warm-muted">Case stage</dt>
        <dd className="text-warm-text mt-0.5">
          {caseStage === 'start' && 'Just getting started'}
          {caseStage === 'medical' && 'Collecting medical records / estimates'}
          {caseStage === 'insurance' && 'Dealing with insurance'}
          {caseStage === 'demand' && 'Ready to send a demand letter'}
          {caseStage === 'negotiation' && 'Negotiating settlement'}
          {caseStage === 'filing' && 'Filing a lawsuit'}
        </dd>
      </div>
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
          What happened {fileCount(incidentFiles)}
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
          {policeReportFiled && fileCount(policeReportFiles)}
        </dd>
      </div>

      {isPropertyDamage ? (
        <>
          <div>
            <dt className="text-sm font-medium text-warm-muted">
              Damage described {fileCount(detailFiles)}
            </dt>
            <dd className="text-warm-text mt-0.5 whitespace-pre-wrap">
              {damageDescription.trim() || 'Not provided'}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-warm-muted">
              Estimated damage amount
            </dt>
            <dd className="text-warm-text mt-0.5">
              {estimatedDamageAmount.trim()
                ? `$${estimatedDamageAmount.trim()}`
                : 'Not provided'}
            </dd>
          </div>
        </>
      ) : (
        <>
          <div>
            <dt className="text-sm font-medium text-warm-muted">
              Injuries described {fileCount(detailFiles)}
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
        </>
      )}

      <div>
        <dt className="text-sm font-medium text-warm-muted">
          Government entity involved
        </dt>
        <dd className="text-warm-text mt-0.5">
          {isGovEntity ? (
            <>
              Yes
              {govEntityName.trim() && (
                <span className="text-warm-muted ml-2">
                  ({govEntityName.trim()}
                  {govEntityType && ` — ${govEntityType}`})
                </span>
              )}
            </>
          ) : govEmployeeOnDuty ? (
            'No'
          ) : (
            'Not answered'
          )}
        </dd>
      </div>

      <div>
        <dt className="text-sm font-medium text-warm-muted">
          SOL tolling factors
        </dt>
        <dd className="text-warm-text mt-0.5">
          {minorAtIncident === 'yes'
            ? 'Minor at time of incident'
            : mentalIncapacity === 'yes'
              ? 'Mental incapacity at time of incident'
              : discoveredLater === 'yes'
                ? 'Injury discovered at a later date'
                : minorAtIncident
                  ? 'None'
                  : 'Not answered'}
        </dd>
      </div>
    </dl>
  )

  // -- Shared input class --

  const inputClass =
    'flex h-9 w-full rounded-md border border-warm-border bg-transparent px-3 py-1 text-sm text-warm-text shadow-xs placeholder:text-warm-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-calm-indigo'

  const textareaClass =
    'flex min-h-[60px] w-full rounded-md border border-warm-border bg-transparent px-3 py-2 text-sm text-warm-text shadow-xs placeholder:text-warm-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-calm-indigo'

  return (
    <StepRunner
      caseId={caseId}
      taskId={taskId}
      title={
        isPropertyDamage
          ? 'Tell Us About the Property Damage'
          : 'Tell Us About Your Injury'
      }
      reassurance="This information helps us understand your case and prepare your documents."
      onConfirm={handleConfirm}
      onSave={handleSave}
      reviewContent={reviewContent}
    >
      <div className="space-y-5">
        {/* Where are you in your case? */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-warm-text">
            Where are you in this case?
          </label>
          <p className="text-xs text-warm-muted">
            This helps us skip steps you&apos;ve already completed.
          </p>
          <div className="space-y-2">
            {[
              { value: 'start', label: 'Just getting started', desc: 'I haven\'t taken any action yet.' },
              { value: 'medical', label: 'Collecting medical records / estimates', desc: 'I\'m gathering documentation of my damages.' },
              { value: 'insurance', label: 'Dealing with insurance', desc: 'I\'m communicating with the insurance company.' },
              { value: 'demand', label: 'Ready to send a demand letter', desc: 'I\'m ready to make a formal demand.' },
              { value: 'negotiation', label: 'Negotiating settlement', desc: 'I\'m in settlement negotiations.' },
              { value: 'filing', label: 'Filing a lawsuit', desc: 'Negotiations failed and I\'m filing suit.' },
            ].map((option) => (
              <label
                key={option.value}
                className={`flex items-start gap-3 cursor-pointer rounded-lg border p-3 transition-colors ${
                  caseStage === option.value
                    ? 'border-calm-indigo bg-calm-indigo/5'
                    : 'border-warm-border hover:bg-warm-bg/50'
                }`}
              >
                <input
                  type="radio"
                  name="pi-case-stage"
                  value={option.value}
                  checked={caseStage === option.value}
                  onChange={() => setCaseStage(option.value)}
                  className="mt-0.5 h-4 w-4 shrink-0 border-warm-border text-calm-indigo focus:ring-calm-indigo"
                />
                <div>
                  <span className="text-sm font-medium text-warm-text">{option.label}</span>
                  <p className="text-xs text-warm-muted mt-0.5">{option.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

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
              {isCalifornia ? (
                <>
                  The California statute of limitations for{' '}
                  {isPropertyDamage ? 'property damage' : 'personal injury'} is 2
                  years from the{' '}
                  {isPropertyDamage ? 'date of the incident' : 'date of injury'}{' '}
                  (Cal. Civ. Proc. Code &sect; 335.1). You have approximately{' '}
                  {solWarning.daysRemaining} days remaining to file.
                </>
              ) : (
                <>
                  The Texas statute of limitations for{' '}
                  {isPropertyDamage ? 'property damage' : 'personal injury'} is 2
                  years from the{' '}
                  {isPropertyDamage ? 'date of the incident' : 'date of injury'}{' '}
                  (Tex. Civ. Prac. &amp; Rem. Code &sect; 16.003). You have
                  approximately {solWarning.daysRemaining} days remaining to file.
                </>
              )}
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

        {/* Incident description + upload */}
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
            className={textareaClass}
          />
          <InlineFileUpload
            caseId={caseId}
            label="Attach photos or documents"
            category="Photos"
            files={incidentFiles}
            onUpload={addFile(setIncidentFiles)}
            onRemove={removeFile(setIncidentFiles)}
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

        {/* Police report number + upload (conditional) */}
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
            <InlineFileUpload
              caseId={caseId}
              label="Upload police report"
              category="Other"
              notes="Police report"
              files={policeReportFiles}
              onUpload={addFile(setPoliceReportFiles)}
              onRemove={removeFile(setPoliceReportFiles)}
            />
          </div>
        )}

        {/* Conditional section: Injury vs Property Damage */}
        {isPropertyDamage ? (
          <>
            {/* Damage description + upload */}
            <div className="space-y-2">
              <label
                htmlFor="pi-damage-description"
                className="text-sm font-medium text-warm-text"
              >
                Describe the damage *
              </label>
              <textarea
                id="pi-damage-description"
                placeholder="Describe the property damage in detail..."
                value={damageDescription}
                onChange={(e) => setDamageDescription(e.target.value)}
                rows={4}
                className={textareaClass}
              />
              <InlineFileUpload
                caseId={caseId}
                label="Attach damage photos"
                category="Photos"
                notes="Property damage photos"
                files={detailFiles}
                onUpload={addFile(setDetailFiles)}
                onRemove={removeFile(setDetailFiles)}
              />
            </div>

            {/* Estimated damage amount */}
            <div className="space-y-2">
              <label
                htmlFor="pi-damage-amount"
                className="text-sm font-medium text-warm-text"
              >
                Estimated damage amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-warm-muted">
                  $
                </span>
                <input
                  id="pi-damage-amount"
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={estimatedDamageAmount}
                  onChange={(e) => setEstimatedDamageAmount(e.target.value)}
                  className={`${inputClass} pl-7`}
                />
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Injury description + upload */}
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
                className={textareaClass}
              />
              <InlineFileUpload
                caseId={caseId}
                label="Attach medical records or photos"
                category="Medical Records"
                files={detailFiles}
                onUpload={addFile(setDetailFiles)}
                onRemove={removeFile(setDetailFiles)}
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
          </>
        )}

        {/* Prop 213 — CA only */}
        {isCalifornia && (
          <div className="space-y-4">
            <label className="text-sm font-medium text-warm-text">
              Insurance Status (Proposition 213)
            </label>

            <div className="space-y-2">
              <label className="text-sm font-medium text-warm-text">
                Did you have valid auto liability insurance at the time of the incident?
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setHadValidInsurance('yes')}
                  className={`rounded-md border px-4 py-1.5 text-sm font-medium transition-colors ${
                    hadValidInsurance === 'yes'
                      ? 'border-calm-indigo bg-calm-indigo/10 text-calm-indigo'
                      : 'border-warm-border text-warm-muted hover:border-warm-text hover:text-warm-text'
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setHadValidInsurance('no')}
                  className={`rounded-md border px-4 py-1.5 text-sm font-medium transition-colors ${
                    hadValidInsurance === 'no'
                      ? 'border-calm-indigo bg-calm-indigo/10 text-calm-indigo'
                      : 'border-warm-border text-warm-muted hover:border-warm-text hover:text-warm-text'
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            {hadValidInsurance === 'no' && (
              <>
                <div className="rounded-lg border border-calm-amber bg-calm-amber/5 p-3">
                  <p className="text-sm font-medium text-warm-text">
                    &#x26A0; Proposition 213 Warning
                  </p>
                  <p className="text-xs text-warm-muted mt-1">
                    Under California Civil Code &sect; 3333.4 (Prop 213), uninsured
                    drivers generally cannot recover non-economic damages (pain and
                    suffering) in a personal injury claim. You may still recover
                    economic damages (medical bills, lost wages, property damage).
                  </p>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="pi-prop213-exception"
                    className="text-sm font-medium text-warm-text"
                  >
                    Does an exception apply?
                  </label>
                  <select
                    id="pi-prop213-exception"
                    value={prop213Exception}
                    onChange={(e) => setProp213Exception(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select...</option>
                    <option value="not_at_fault">I was not at fault at all (0% liability)</option>
                    <option value="dui_defendant">The other driver was convicted of DUI</option>
                    <option value="felony_defendant">The other driver was committing a felony</option>
                    <option value="none">None of these apply</option>
                  </select>
                </div>

                {prop213Exception && prop213Exception !== 'none' && (
                  <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
                    <p className="text-sm font-medium text-warm-text">
                      Prop 213 exception may apply
                    </p>
                    <p className="text-xs text-warm-muted mt-1">
                      Based on your answer, you may qualify for an exception to
                      Proposition 213, which could allow you to recover
                      non-economic damages despite not having insurance at the
                      time of the incident.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Government Entity Check */}
        <div className="space-y-4">
          <label className="text-sm font-medium text-warm-text">
            Government Entity Check
          </label>

          <div className="space-y-2">
            <label className="text-sm font-medium text-warm-text">
              Was the at-fault party a government employee acting on duty?
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setGovEmployeeOnDuty('yes')}
                className={`rounded-md border px-4 py-1.5 text-sm font-medium transition-colors ${
                  govEmployeeOnDuty === 'yes'
                    ? 'border-calm-indigo bg-calm-indigo/10 text-calm-indigo'
                    : 'border-warm-border text-warm-muted hover:border-warm-text hover:text-warm-text'
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setGovEmployeeOnDuty('no')}
                className={`rounded-md border px-4 py-1.5 text-sm font-medium transition-colors ${
                  govEmployeeOnDuty === 'no'
                    ? 'border-calm-indigo bg-calm-indigo/10 text-calm-indigo'
                    : 'border-warm-border text-warm-muted hover:border-warm-text hover:text-warm-text'
                }`}
              >
                No
              </button>
            </div>
          </div>

          {govEmployeeOnDuty === 'no' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-warm-text">
                Did it happen on government property (e.g. city park, public building)?
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setGovProperty('yes')}
                  className={`rounded-md border px-4 py-1.5 text-sm font-medium transition-colors ${
                    govProperty === 'yes'
                      ? 'border-calm-indigo bg-calm-indigo/10 text-calm-indigo'
                      : 'border-warm-border text-warm-muted hover:border-warm-text hover:text-warm-text'
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setGovProperty('no')}
                  className={`rounded-md border px-4 py-1.5 text-sm font-medium transition-colors ${
                    govProperty === 'no'
                      ? 'border-calm-indigo bg-calm-indigo/10 text-calm-indigo'
                      : 'border-warm-border text-warm-muted hover:border-warm-text hover:text-warm-text'
                  }`}
                >
                  No
                </button>
              </div>
            </div>
          )}

          {govEmployeeOnDuty === 'no' && govProperty === 'no' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-warm-text">
                Was a government vehicle involved?
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setGovVehicle('yes')}
                  className={`rounded-md border px-4 py-1.5 text-sm font-medium transition-colors ${
                    govVehicle === 'yes'
                      ? 'border-calm-indigo bg-calm-indigo/10 text-calm-indigo'
                      : 'border-warm-border text-warm-muted hover:border-warm-text hover:text-warm-text'
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setGovVehicle('no')}
                  className={`rounded-md border px-4 py-1.5 text-sm font-medium transition-colors ${
                    govVehicle === 'no'
                      ? 'border-calm-indigo bg-calm-indigo/10 text-calm-indigo'
                      : 'border-warm-border text-warm-muted hover:border-warm-text hover:text-warm-text'
                  }`}
                >
                  No
                </button>
              </div>
            </div>
          )}

          {isGovEntity && (
            <>
              <div className="space-y-2">
                <label
                  htmlFor="pi-gov-entity-type"
                  className="text-sm font-medium text-warm-text"
                >
                  Type of government entity
                </label>
                <select
                  id="pi-gov-entity-type"
                  value={govEntityType}
                  onChange={(e) => setGovEntityType(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select...</option>
                  <option value="city">City / Municipality</option>
                  <option value="county">County</option>
                  <option value="state">{isCalifornia ? 'State of California' : 'State of Texas'}</option>
                  <option value="federal">Federal</option>
                  <option value="school_district">School District</option>
                  {isCalifornia && <option value="special_district">Special District</option>}
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="pi-gov-entity-name"
                  className="text-sm font-medium text-warm-text"
                >
                  Name of government entity
                </label>
                <input
                  id="pi-gov-entity-name"
                  type="text"
                  placeholder="e.g. City of Austin, TxDOT, AISD"
                  value={govEntityName}
                  onChange={(e) => setGovEntityName(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="rounded-lg border border-calm-amber bg-calm-amber/5 p-3">
                <p className="text-sm font-medium text-warm-text">
                  &#x26A0; {isCalifornia ? 'California Government Tort Claims Act Applies' : 'Texas Tort Claims Act Applies'}
                </p>
                <p className="text-xs text-warm-muted mt-1">
                  {isCalifornia ? (
                    <>
                      Claims against government entities in California must follow
                      the Government Tort Claims Act (Cal. Gov. Code &sect;910-913).
                      You must file a written claim with the government entity within
                      6 months of the incident. If the deadline has passed, you may
                      apply for late claim relief under Gov. Code &sect;911.4.
                      We&apos;ll add the required steps to your case automatically.
                    </>
                  ) : (
                    <>
                      Claims against government entities in Texas must follow the
                      Texas Tort Claims Act (Tex. Civ. Prac. &amp; Rem. Code Ch.
                      101). This typically requires filing a formal notice of claim
                      within 6 months of the incident. We&apos;ll add the required
                      steps to your case automatically.
                    </>
                  )}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Statute of Limitations Tolling */}
        <div className="space-y-4">
          <label className="text-sm font-medium text-warm-text">
            Statute of Limitations
          </label>

          <div className="space-y-2">
            <label className="text-sm font-medium text-warm-text">
              Were you a minor (under 18) at the time of the incident?
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMinorAtIncident('yes')}
                className={`rounded-md border px-4 py-1.5 text-sm font-medium transition-colors ${
                  minorAtIncident === 'yes'
                    ? 'border-calm-indigo bg-calm-indigo/10 text-calm-indigo'
                    : 'border-warm-border text-warm-muted hover:border-warm-text hover:text-warm-text'
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setMinorAtIncident('no')}
                className={`rounded-md border px-4 py-1.5 text-sm font-medium transition-colors ${
                  minorAtIncident === 'no'
                    ? 'border-calm-indigo bg-calm-indigo/10 text-calm-indigo'
                    : 'border-warm-border text-warm-muted hover:border-warm-text hover:text-warm-text'
                }`}
              >
                No
              </button>
            </div>
          </div>

          {minorAtIncident !== 'yes' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-warm-text">
                Were you mentally incapacitated at the time of the incident?
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMentalIncapacity('yes')}
                  className={`rounded-md border px-4 py-1.5 text-sm font-medium transition-colors ${
                    mentalIncapacity === 'yes'
                      ? 'border-calm-indigo bg-calm-indigo/10 text-calm-indigo'
                      : 'border-warm-border text-warm-muted hover:border-warm-text hover:text-warm-text'
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setMentalIncapacity('no')}
                  className={`rounded-md border px-4 py-1.5 text-sm font-medium transition-colors ${
                    mentalIncapacity === 'no'
                      ? 'border-calm-indigo bg-calm-indigo/10 text-calm-indigo'
                      : 'border-warm-border text-warm-muted hover:border-warm-text hover:text-warm-text'
                  }`}
                >
                  No
                </button>
              </div>
            </div>
          )}

          {minorAtIncident !== 'yes' && mentalIncapacity !== 'yes' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-warm-text">
                Did you discover the injury or damage at a later date?
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDiscoveredLater('yes')}
                  className={`rounded-md border px-4 py-1.5 text-sm font-medium transition-colors ${
                    discoveredLater === 'yes'
                      ? 'border-calm-indigo bg-calm-indigo/10 text-calm-indigo'
                      : 'border-warm-border text-warm-muted hover:border-warm-text hover:text-warm-text'
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setDiscoveredLater('no')}
                  className={`rounded-md border px-4 py-1.5 text-sm font-medium transition-colors ${
                    discoveredLater === 'no'
                      ? 'border-calm-indigo bg-calm-indigo/10 text-calm-indigo'
                      : 'border-warm-border text-warm-muted hover:border-warm-text hover:text-warm-text'
                  }`}
                >
                  No
                </button>
              </div>
            </div>
          )}
        </div>

        {/* SOL info callout */}
        <div className="rounded-md border border-calm-indigo/30 bg-calm-indigo/5 px-3 py-2">
          <p className="text-xs font-medium text-warm-text">
            {isCalifornia
              ? isPropertyDamage
                ? 'California statute of limitations for property damage'
                : 'California statute of limitations for personal injury'
              : isPropertyDamage
                ? 'Texas statute of limitations for property damage'
                : 'Texas statute of limitations for personal injury'}
          </p>
          <p className="text-xs text-warm-muted mt-0.5">
            {isCalifornia ? (
              <>
                In California, the statute of limitations for{' '}
                {isPropertyDamage ? 'property damage' : 'personal injury'} claims
                is 2 years from the{' '}
                {isPropertyDamage ? 'date of the incident' : 'date of injury'}{' '}
                (Cal. Civ. Proc. Code &sect; 335.1). Filing after this deadline
                can result in your case being dismissed.
              </>
            ) : (
              <>
                In Texas, the statute of limitations for{' '}
                {isPropertyDamage ? 'property damage' : 'personal injury'} claims is
                2 years from the{' '}
                {isPropertyDamage ? 'date of the incident' : 'date of injury'} (Tex.
                Civ. Prac. &amp; Rem. Code &sect; 16.003). Filing after this
                deadline can result in your case being dismissed.
              </>
            )}
          </p>
        </div>

        {/* Comparative Fault */}
        {isCalifornia ? (
          <div className="rounded-md border border-calm-indigo/30 bg-calm-indigo/5 px-3 py-2">
            <p className="text-xs font-medium text-warm-text">
              California Pure Comparative Fault
            </p>
            <p className="text-xs text-warm-muted mt-0.5">
              Under California law (Li v. Yellow Cab Co., 13 Cal.3d 804), you
              can recover damages even if you are partially at fault. Your
              recovery is reduced by your percentage of fault. For example, if
              you are 30% at fault, you can still recover 70% of your damages.
            </p>
          </div>
        ) : (
          <div className="rounded-md border border-calm-indigo/30 bg-calm-indigo/5 px-3 py-2">
            <p className="text-xs font-medium text-warm-text">
              Texas 51% Rule (Proportionate Responsibility)
            </p>
            <p className="text-xs text-warm-muted mt-0.5">
              Under Texas law (Tex. Civ. Prac. &amp; Rem. Code Ch. 33), you
              cannot recover damages if you are found to be more than 50%
              responsible for the incident. If your responsibility is 50% or less,
              your recovery is reduced by your percentage of fault.
            </p>
          </div>
        )}
      </div>
    </StepRunner>
  )
}
