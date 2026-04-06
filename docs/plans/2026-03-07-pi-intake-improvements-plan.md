# PI Intake Form Improvements Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the PI intake form context-aware (injury vs property damage fields) and add inline file uploads that store to the Evidence Vault.

**Architecture:** Fetch `pi_sub_type` from `personal_injury_details` in the step page and pass it to `PIIntakeStep`. The component conditionally renders injury or property damage fields based on that sub-type. A new reusable `<InlineFileUpload>` component uploads files via the existing `POST /api/cases/{caseId}/evidence` endpoint, storing them in `evidence_items`. Evidence IDs are tracked in task metadata.

**Tech Stack:** Next.js 15, TypeScript, React, Supabase Storage, existing evidence API

---

### Task 1: Create InlineFileUpload component

**Files:**
- Create: `src/components/ui/inline-file-upload.tsx`

**Context:** This is a reusable component. The existing evidence upload API accepts FormData with `file`, `label`, `notes`, `captured_at`. It returns `{ evidence: { id, file_name, ... } }` on success (201). Allowed types: PDF, JPG, PNG. Max 10MB.

**Step 1: Create the component**

```tsx
'use client'

import { useRef, useState } from 'react'
import { Paperclip, X, Loader2 } from 'lucide-react'

interface UploadedFile {
  evidenceId: string
  fileName: string
}

interface InlineFileUploadProps {
  caseId: string
  label: string
  category: string
  notes?: string
  files: UploadedFile[]
  onUpload: (evidenceId: string, fileName: string) => void
  onRemove: (evidenceId: string) => void
}

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png']
const MAX_SIZE = 10 * 1024 * 1024

export function InlineFileUpload({
  caseId,
  label,
  category,
  notes,
  files,
  onUpload,
  onRemove,
}: InlineFileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(file: File) {
    setError(null)

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Only PDF, JPG, and PNG files are allowed.')
      return
    }
    if (file.size > MAX_SIZE) {
      setError('File must be under 10 MB.')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('label', category)
      if (notes) formData.append('notes', notes)

      const res = await fetch(`/api/cases/${caseId}/evidence`, {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Upload failed')
      }

      const data = await res.json()
      onUpload(data.evidence.id, data.evidence.file_name)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  async function handleRemove(evidenceId: string) {
    try {
      await fetch(`/api/cases/${caseId}/evidence`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ evidence_id: evidenceId }),
      })
      onRemove(evidenceId)
    } catch {
      // Non-fatal — file stays in evidence vault
    }
  }

  return (
    <div className="mt-2">
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {files.map((f) => (
            <span
              key={f.evidenceId}
              className="inline-flex items-center gap-1 rounded-md bg-calm-indigo/10 px-2 py-1 text-xs text-calm-indigo"
            >
              {f.fileName}
              <button
                type="button"
                onClick={() => handleRemove(f.evidenceId)}
                className="ml-0.5 hover:text-warm-text"
                aria-label={`Remove ${f.fileName}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="inline-flex items-center gap-1.5 text-xs text-warm-muted hover:text-warm-text transition-colors disabled:opacity-50"
      >
        {uploading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Paperclip className="h-3.5 w-3.5" />
        )}
        {uploading ? 'Uploading...' : label}
      </button>

      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  )
}
```

**Step 2: Verify it compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | grep inline-file-upload`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/ui/inline-file-upload.tsx
git commit -m "feat: add InlineFileUpload component for evidence attachments"
```

---

### Task 2: Pass pi_sub_type to PIIntakeStep

**Files:**
- Modify: `src/app/(authenticated)/case/[id]/step/[taskId]/page.tsx:717-724`

**Context:** The step page is a server component. The `pi_intake` case currently renders `<PIIntakeStep>` with only `caseId`, `taskId`, and `existingMetadata`. We need to fetch `personal_injury_details.pi_sub_type` and pass it as a prop.

**Step 1: Update the pi_intake case block**

Find the current block (around line 717):
```tsx
    case 'pi_intake':
      return (
        <PIIntakeStep
          caseId={id}
          taskId={taskId}
          existingMetadata={task.metadata}
        />
      )
```

Replace with:
```tsx
    case 'pi_intake': {
      const { data: piDetails } = await supabase
        .from('personal_injury_details').select('pi_sub_type').eq('case_id', id).maybeSingle()
      return (
        <PIIntakeStep
          caseId={id}
          taskId={taskId}
          existingMetadata={task.metadata}
          piSubType={piDetails?.pi_sub_type ?? undefined}
        />
      )
    }
```

**Step 2: Verify it compiles** (will fail until Task 3 adds the prop — that's expected)

**Step 3: Commit**

```bash
git add src/app/\(authenticated\)/case/\[id\]/step/\[taskId\]/page.tsx
git commit -m "feat: fetch pi_sub_type for PI intake step"
```

---

### Task 3: Add conditional fields and inline uploads to PIIntakeStep

**Files:**
- Modify: `src/components/step/personal-injury/pi-intake-step.tsx`

**Context:** The property damage sub-types are: `vehicle_damage`, `property_damage_negligence`, `vandalism`, `other_property_damage`. Everything else is injury. The form currently has 7 fields. For property damage: replace `injury_description` + `injury_severity` with `damage_description` + `estimated_damage_amount`. Add `<InlineFileUpload>` below 3 fields.

**Step 1: Replace the entire component**

Replace the full contents of `src/components/step/personal-injury/pi-intake-step.tsx` with:

```tsx
'use client'

import { useState } from 'react'
import { StepRunner } from '../step-runner'
import { InlineFileUpload } from '@/components/ui/inline-file-upload'
import type { PiSubType } from '@/lib/schemas/case'

const PROPERTY_DAMAGE_SUB_TYPES: PiSubType[] = [
  'vehicle_damage',
  'property_damage_negligence',
  'vandalism',
  'other_property_damage',
]

interface UploadedFile {
  evidenceId: string
  fileName: string
}

interface PIIntakeStepProps {
  caseId: string
  taskId: string
  existingMetadata?: Record<string, unknown>
  piSubType?: string
}

export function PIIntakeStep({
  caseId,
  taskId,
  existingMetadata,
  piSubType,
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
            {/* Damage description */}
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
```

**Step 2: Verify it compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | grep -E "(pi-intake-step|inline-file-upload)" || echo "No errors"`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/step/personal-injury/pi-intake-step.tsx
git commit -m "feat: add conditional fields and inline file uploads to PI intake"
```

---

### Task 4: Build verification

**Step 1: Full build check**

Run: `npm run build 2>&1 | tail -10`
Expected: Build succeeds

**Step 2: Restart dev server and manual test**

Run: `pkill -f 'next dev'; sleep 1; npm run dev &`

**Manual verification:**
1. Create a PI case with sub-type `auto_accident` → intake form should show "Describe your injuries" + severity
2. Create a PI case with sub-type `vehicle_damage` → intake form should show "Describe the damage" + estimated amount
3. Test file upload on "What happened?" → file chip appears, file shows in Evidence Vault
4. Select "Yes" for police report → upload button appears, upload a PDF
5. Complete the form, verify review screen shows correct fields and attachment counts

**Step 3: Commit any fixes**

```bash
git add -A
git commit -m "chore: finalize PI intake form improvements"
```
