'use client'

import { useState, useCallback } from 'react'
import { StepRunner } from './step-runner'
import { DraftViewer } from './filing/draft-viewer'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import type { MotionConfig, FieldConfig } from '@/lib/motions/types'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface MotionBuilderProps {
  config: MotionConfig
  caseId: string
  taskId?: string
  existingMetadata?: Record<string, unknown>
  caseData?: {
    court_type?: string
    county?: string | null
    role?: string
  }
}

// ---------------------------------------------------------------------------
// Party shape (matches partySchema from lib/schemas/filing)
// ---------------------------------------------------------------------------

interface PartyInfo {
  full_name: string
  address?: string
  city?: string
  state?: string
  zip?: string
}

const EMPTY_PARTY: PartyInfo = { full_name: '' }

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function MotionBuilder({
  config,
  caseId,
  taskId,
  existingMetadata,
  caseData,
}: MotionBuilderProps) {
  // ── State initialisation ──────────────────────────────────────────────
  const [formData, setFormData] = useState<Record<string, unknown>>(() => {
    const initial: Record<string, unknown> = {}

    // 1. Hydrate from existingMetadata (resume path)
    //    Hydrate ALL keys (not just config.fields) so party data, draft_text, etc. persist
    if (existingMetadata) {
      for (const [key, val] of Object.entries(existingMetadata)) {
        if (val !== undefined) initial[key] = val
      }
    }

    // 2. Fill case-level defaults for unfilled court fields
    if (caseData) {
      if (!initial.court_type && caseData.court_type)
        initial.court_type = caseData.court_type
      if (!initial.county && caseData.county)
        initial.county = caseData.county
    }

    // 3. Default party fields (required by all motion schemas)
    if (!initial.your_info) initial.your_info = { ...EMPTY_PARTY }
    if (!initial.opposing_parties) initial.opposing_parties = [{ ...EMPTY_PARTY }]

    // 4. Ensure dynamic-list fields default to one empty row
    for (const field of config.fields) {
      if (field.type === 'dynamic-list' && !initial[field.key]) {
        const emptyRow: Record<string, unknown> = {}
        for (const sub of field.listItemFields ?? []) {
          emptyRow[sub.key] = sub.type === 'number' ? 0 : ''
        }
        initial[field.key] = [emptyRow]
      }
      // Ensure party-picker defaults
      if (field.type === 'party-picker' && !initial[field.key]) {
        if (field.key.includes('parties')) {
          initial[field.key] = [{ ...EMPTY_PARTY }]
        } else {
          initial[field.key] = { ...EMPTY_PARTY }
        }
      }
    }

    return initial
  })

  const [draft, setDraft] = useState<string>(
    (existingMetadata?.draft_text as string) ?? ''
  )
  const [acknowledged, setAcknowledged] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState<string | null>(null)

  // ── Helpers ────────────────────────────────────────────────────────────

  const updateField = useCallback((key: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }, [])

  function buildMetadata() {
    return {
      ...formData,
      draft_text: draft || null,
      final_text: draft || null,
    }
  }

  // ── Generate draft via generate-filing API ─────────────────────────────

  async function generateDraft() {
    setGenError(null)

    // Validate via config schema
    const result = config.schema.safeParse(formData)
    if (!result.success) {
      const firstError = result.error.issues[0]
      const path = firstError.path.join('.')
      const msg = path ? `${path}: ${firstError.message}` : firstError.message
      setGenError(msg)
      throw new Error(msg)
    }

    setGenerating(true)
    try {
      const res = await fetch(`/api/cases/${caseId}/generate-filing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document_type: config.documentType,
          facts: formData,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to generate document')
      }

      const data = await res.json()
      setDraft(data.draft)
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Failed to generate document'
      setGenError(msg)
      throw err
    } finally {
      setGenerating(false)
    }
  }

  // ── Confirm (finalise) ─────────────────────────────────────────────────

  async function handleConfirm() {
    if (taskId) {
      // Gatekeeper-launched: save metadata then complete task
      const res1 = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'in_progress',
          metadata: buildMetadata(),
        }),
      })
      if (!res1.ok) {
        const err = await res1.json()
        // Tolerate already-in_progress race
        if (!err.details?.includes?.("'in_progress'")) {
          throw new Error(err.error || 'Failed to update task')
        }
      }

      const res2 = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      })
      if (!res2.ok) throw new Error('Failed to complete task')

      // Trigger gatekeeper
      await fetch(`/api/cases/${caseId}/rules/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
    } else {
      // Hub-launched: save to motions table
      const res = await fetch(`/api/cases/${caseId}/motions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          motion_type: config.key,
          status: 'finalized',
          facts: formData,
          draft_text: draft,
          final_text: draft,
        }),
      })
      if (!res.ok) throw new Error('Failed to save motion')
    }
  }

  // ── Save (draft for later) ─────────────────────────────────────────────

  async function handleSave() {
    if (taskId) {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'in_progress',
          metadata: buildMetadata(),
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        if (!err.details?.includes?.("'in_progress'")) {
          throw new Error(err.error || 'Failed to save')
        }
      }
    } else {
      const res = await fetch(`/api/cases/${caseId}/motions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          motion_type: config.key,
          status: 'draft',
          facts: formData,
          draft_text: draft || null,
        }),
      })
      if (!res.ok) throw new Error('Failed to save draft')
    }
  }

  // ── Conditional visibility ─────────────────────────────────────────────

  function isFieldVisible(field: FieldConfig): boolean {
    if (!field.showWhen) return true
    return formData[field.showWhen.field] === field.showWhen.value
  }

  // ── Dynamic-list helpers ───────────────────────────────────────────────

  function getListRows(key: string): Record<string, unknown>[] {
    return (formData[key] as Record<string, unknown>[]) ?? []
  }

  function updateListRow(
    listKey: string,
    index: number,
    subKey: string,
    value: unknown
  ) {
    const rows = [...getListRows(listKey)]
    rows[index] = { ...rows[index], [subKey]: value }
    updateField(listKey, rows)
  }

  function addListRow(listKey: string, subFields: FieldConfig[]) {
    const emptyRow: Record<string, unknown> = {}
    for (const sub of subFields) {
      emptyRow[sub.key] = sub.type === 'number' ? 0 : ''
    }
    updateField(listKey, [...getListRows(listKey), emptyRow])
  }

  function removeListRow(listKey: string, index: number) {
    const rows = getListRows(listKey)
    if (rows.length <= 1) return
    updateField(
      listKey,
      rows.filter((_, i) => i !== index)
    )
  }

  // ── Party-picker helpers ───────────────────────────────────────────────

  function getPartyArray(key: string): PartyInfo[] {
    const val = formData[key]
    if (Array.isArray(val)) return val as PartyInfo[]
    return []
  }

  function getSingleParty(key: string): PartyInfo {
    const val = formData[key]
    if (val && typeof val === 'object' && !Array.isArray(val))
      return val as PartyInfo
    return { ...EMPTY_PARTY }
  }

  function updatePartyField(
    key: string,
    index: number | null,
    field: keyof PartyInfo,
    value: string
  ) {
    if (index === null) {
      // Single party
      const party = getSingleParty(key)
      updateField(key, { ...party, [field]: value })
    } else {
      // Array of parties
      const parties = [...getPartyArray(key)]
      parties[index] = { ...parties[index], [field]: value }
      updateField(key, parties)
    }
  }

  function addParty(key: string) {
    updateField(key, [...getPartyArray(key), { ...EMPTY_PARTY }])
  }

  function removeParty(key: string, index: number) {
    const parties = getPartyArray(key)
    if (parties.length <= 1) return
    updateField(
      key,
      parties.filter((_, i) => i !== index)
    )
  }

  // ── Field rendering ────────────────────────────────────────────────────

  function renderField(field: FieldConfig) {
    if (!isFieldVisible(field)) return null

    const fieldId = `mb-${field.key}`
    const value = formData[field.key]

    switch (field.type) {
      case 'text':
        return (
          <div key={field.key} className="space-y-1">
            <Label htmlFor={fieldId}>
              {field.label}
              {field.required && ' *'}
            </Label>
            {field.helperText && (
              <p className="text-xs text-warm-muted">{field.helperText}</p>
            )}
            <Input
              id={fieldId}
              value={(value as string) ?? ''}
              onChange={(e) => updateField(field.key, e.target.value)}
              placeholder={field.placeholder}
            />
          </div>
        )

      case 'textarea':
        return (
          <div key={field.key} className="space-y-1">
            <Label htmlFor={fieldId}>
              {field.label}
              {field.required && ' *'}
            </Label>
            {field.helperText && (
              <p className="text-xs text-warm-muted">{field.helperText}</p>
            )}
            <textarea
              id={fieldId}
              value={(value as string) ?? ''}
              onChange={(e) => updateField(field.key, e.target.value)}
              rows={4}
              className="w-full min-h-[100px] rounded-md border border-warm-border p-3 text-sm text-warm-text bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder={field.placeholder}
            />
          </div>
        )

      case 'date':
        return (
          <div key={field.key} className="space-y-1">
            <Label htmlFor={fieldId}>
              {field.label}
              {field.required && ' *'}
            </Label>
            {field.helperText && (
              <p className="text-xs text-warm-muted">{field.helperText}</p>
            )}
            <Input
              id={fieldId}
              type="date"
              value={(value as string) ?? ''}
              onChange={(e) => updateField(field.key, e.target.value)}
            />
          </div>
        )

      case 'number':
        return (
          <div key={field.key} className="space-y-1">
            <Label htmlFor={fieldId}>
              {field.label}
              {field.required && ' *'}
            </Label>
            {field.helperText && (
              <p className="text-xs text-warm-muted">{field.helperText}</p>
            )}
            <Input
              id={fieldId}
              type="number"
              value={value !== undefined && value !== null ? String(value) : ''}
              onChange={(e) =>
                updateField(
                  field.key,
                  e.target.value === '' ? undefined : parseFloat(e.target.value) || 0
                )
              }
              placeholder={field.placeholder}
            />
          </div>
        )

      case 'checkbox':
        return (
          <div
            key={field.key}
            className="flex items-start gap-3 rounded-lg border border-warm-border p-3"
          >
            <Checkbox
              id={fieldId}
              checked={(value as boolean) ?? false}
              onCheckedChange={(c) => updateField(field.key, c === true)}
            />
            <div>
              <Label htmlFor={fieldId} className="cursor-pointer">
                {field.label}
              </Label>
              {field.helperText && (
                <p className="text-xs text-warm-muted mt-1">
                  {field.helperText}
                </p>
              )}
            </div>
          </div>
        )

      case 'select':
        return (
          <div key={field.key} className="space-y-1">
            <Label htmlFor={fieldId}>
              {field.label}
              {field.required && ' *'}
            </Label>
            {field.helperText && (
              <p className="text-xs text-warm-muted">{field.helperText}</p>
            )}
            <select
              id={fieldId}
              value={(value as string) ?? ''}
              onChange={(e) => updateField(field.key, e.target.value)}
              className="w-full rounded-md border border-warm-border p-2.5 text-sm text-warm-text bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Select...</option>
              {(field.options ?? []).map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )

      case 'party-picker':
        return renderPartyPicker(field)

      case 'dynamic-list':
        return renderDynamicList(field)

      default:
        return null
    }
  }

  // ── Party picker rendering ─────────────────────────────────────────────

  function renderPartyPicker(field: FieldConfig) {
    const isArray = field.key.includes('parties')

    if (!isArray) {
      // Single party
      const party = getSingleParty(field.key)
      return (
        <div key={field.key} className="space-y-3">
          <Label>
            {field.label}
            {field.required && ' *'}
          </Label>
          {field.helperText && (
            <p className="text-xs text-warm-muted">{field.helperText}</p>
          )}
          {renderPartyFields(field.key, party, null)}
        </div>
      )
    }

    // Array of parties
    const parties = getPartyArray(field.key)
    return (
      <div key={field.key} className="space-y-3">
        <Label>
          {field.label}
          {field.required && ' *'}
        </Label>
        {field.helperText && (
          <p className="text-xs text-warm-muted">{field.helperText}</p>
        )}
        {parties.map((party, i) => (
          <div key={i} className="space-y-3 mb-4">
            {parties.length > 1 && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-warm-muted">Party {i + 1}</span>
                <button
                  type="button"
                  onClick={() => removeParty(field.key, i)}
                  className="text-xs text-warm-muted hover:text-warm-text"
                >
                  Remove
                </button>
              </div>
            )}
            {renderPartyFields(field.key, party, i)}
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addParty(field.key)}
        >
          + Add another party
        </Button>
      </div>
    )
  }

  function renderPartyFields(
    key: string,
    party: PartyInfo,
    index: number | null
  ) {
    const suffix = index !== null ? `-${index}` : ''
    return (
      <div className="space-y-3">
        <div>
          <Label htmlFor={`mb-${key}-name${suffix}`}>Full legal name *</Label>
          <Input
            id={`mb-${key}-name${suffix}`}
            value={party.full_name}
            onChange={(e) =>
              updatePartyField(key, index, 'full_name', e.target.value)
            }
            placeholder="e.g. John Michael Doe"
          />
        </div>
        <div>
          <Label htmlFor={`mb-${key}-address${suffix}`}>Address</Label>
          <Input
            id={`mb-${key}-address${suffix}`}
            value={party.address ?? ''}
            onChange={(e) =>
              updatePartyField(key, index, 'address', e.target.value)
            }
            placeholder="123 Main St"
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label htmlFor={`mb-${key}-city${suffix}`}>City</Label>
            <Input
              id={`mb-${key}-city${suffix}`}
              value={party.city ?? ''}
              onChange={(e) =>
                updatePartyField(key, index, 'city', e.target.value)
              }
            />
          </div>
          <div>
            <Label htmlFor={`mb-${key}-state${suffix}`}>State</Label>
            <Input
              id={`mb-${key}-state${suffix}`}
              value={party.state ?? ''}
              onChange={(e) =>
                updatePartyField(key, index, 'state', e.target.value)
              }
            />
          </div>
          <div>
            <Label htmlFor={`mb-${key}-zip${suffix}`}>ZIP</Label>
            <Input
              id={`mb-${key}-zip${suffix}`}
              value={party.zip ?? ''}
              onChange={(e) =>
                updatePartyField(key, index, 'zip', e.target.value)
              }
            />
          </div>
        </div>
      </div>
    )
  }

  // ── Dynamic list rendering ─────────────────────────────────────────────

  function renderDynamicList(field: FieldConfig) {
    const subFields = field.listItemFields ?? []
    const rows = getListRows(field.key)

    return (
      <div key={field.key} className="space-y-3">
        <Label>
          {field.label}
          {field.required && ' *'}
        </Label>
        {field.helperText && (
          <p className="text-xs text-warm-muted">{field.helperText}</p>
        )}
        {rows.map((row, rowIdx) => (
          <div key={rowIdx} className="flex items-start gap-3">
            {subFields.map((sub) => (
              <div
                key={sub.key}
                className={sub.type === 'number' ? 'w-32' : 'flex-1'}
              >
                <Label htmlFor={`mb-${field.key}-${rowIdx}-${sub.key}`}>
                  {sub.label}
                  {sub.required && ' *'}
                </Label>
                {sub.type === 'textarea' ? (
                  <textarea
                    id={`mb-${field.key}-${rowIdx}-${sub.key}`}
                    value={(row[sub.key] as string) ?? ''}
                    onChange={(e) =>
                      updateListRow(
                        field.key,
                        rowIdx,
                        sub.key,
                        e.target.value
                      )
                    }
                    rows={2}
                    className="w-full rounded-md border border-warm-border p-2 text-sm text-warm-text bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder={sub.placeholder}
                  />
                ) : (
                  <Input
                    id={`mb-${field.key}-${rowIdx}-${sub.key}`}
                    type={sub.type === 'number' ? 'number' : 'text'}
                    value={
                      sub.type === 'number'
                        ? row[sub.key] !== undefined && row[sub.key] !== null
                          ? String(row[sub.key])
                          : ''
                        : (row[sub.key] as string) ?? ''
                    }
                    onChange={(e) =>
                      updateListRow(
                        field.key,
                        rowIdx,
                        sub.key,
                        sub.type === 'number'
                          ? e.target.value === ''
                            ? 0
                            : parseFloat(e.target.value) || 0
                          : e.target.value
                      )
                    }
                    placeholder={sub.placeholder}
                  />
                )}
              </div>
            ))}
            {rows.length > 1 && (
              <button
                type="button"
                onClick={() => removeListRow(field.key, rowIdx)}
                className="mt-6 text-xs text-warm-muted hover:text-warm-text"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addListRow(field.key, subFields)}
        >
          + Add item
        </Button>
      </div>
    )
  }

  // ── Section rendering ──────────────────────────────────────────────────

  function renderSections() {
    // Group fields by section number
    const sections = new Map<number, FieldConfig[]>()
    for (const field of config.fields) {
      const existing = sections.get(field.section) ?? []
      existing.push(field)
      sections.set(field.section, existing)
    }

    return Array.from(sections.entries())
      .sort(([a], [b]) => a - b)
      .map(([sectionNum, fields]) => {
        const title = fields.find((f) => f.sectionTitle)?.sectionTitle
        // Only render section if at least one field is visible
        const visibleFields = fields.filter(isFieldVisible)
        if (visibleFields.length === 0) return null

        return (
          <div key={sectionNum} className="space-y-4">
            {title && (
              <h3 className="text-sm font-semibold text-warm-text">{title}</h3>
            )}
            {fields.map((field) => renderField(field))}
          </div>
        )
      })
  }

  // ── Review content ─────────────────────────────────────────────────────

  const reviewContent = (
    <div className="space-y-4">
      {genError && (
        <div className="rounded-lg border border-calm-amber bg-calm-amber/5 p-3">
          <p className="text-sm text-warm-text">{genError}</p>
        </div>
      )}
      {draft ? (
        <DraftViewer
          draft={draft}
          onDraftChange={setDraft}
          onRegenerate={() => generateDraft()}
          regenerating={generating}
          acknowledged={acknowledged}
          onAcknowledgeChange={setAcknowledged}
        />
      ) : (
        <p className="text-sm text-warm-muted">Generating your draft...</p>
      )}
    </div>
  )

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <StepRunner
      caseId={caseId}
      taskId={taskId ?? 'motion-hub'}
      title={config.title}
      reassurance={config.reassurance}
      onBeforeReview={generateDraft}
      onConfirm={handleConfirm}
      onSave={handleSave}
      reviewButtonLabel="Generate Motion →"
      reviewContent={reviewContent}
    >
      <div className="space-y-6">
        {genError && (
          <div className="rounded-lg border border-calm-amber bg-calm-amber/5 p-3">
            <p className="text-sm text-warm-text">{genError}</p>
            <p className="text-xs text-warm-muted mt-1">
              Review your information below and try again.
            </p>
          </div>
        )}
        {/* Auto-rendered party fields (required by all motion schemas) */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-warm-text">Your Information</h3>
          {renderPartyFields('your_info', getSingleParty('your_info'), null)}
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-warm-text">Opposing Party</h3>
          {getPartyArray('opposing_parties').map((party, idx) => (
            <div key={idx} className="space-y-3">
              {idx > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-warm-muted">Party {idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeParty('opposing_parties', idx)}
                    className="text-xs text-warm-muted hover:text-warm-text"
                  >
                    Remove
                  </button>
                </div>
              )}
              {renderPartyFields('opposing_parties', party, idx)}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addParty('opposing_parties')}
          >
            + Add another party
          </Button>
        </div>

        {renderSections()}
      </div>
    </StepRunner>
  )
}
