'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { CheckCircle, AlertTriangle, Pencil, X } from 'lucide-react'
import type { AnalysisResult } from '@lawyer-free/shared/schemas/quick-resolve'

interface AnalysisReviewProps {
  analysis: AnalysisResult
  onConfirm: (edited: AnalysisResult) => void
}

const DISPUTE_TYPE_LABELS: Record<string, string> = {
  landlord_tenant: 'Landlord / Tenant',
  debt_collection: 'Debt Collection',
  small_claims: 'Small Claims',
  consumer_complaint: 'Consumer Complaint',
  contract: 'Contract Dispute',
  personal_injury: 'Personal Injury',
  employment: 'Employment',
  insurance: 'Insurance Claim',
}

const STATE_SOS_URLS: Record<string, string> = {
  CA: 'https://bizfileonline.sos.ca.gov/search/business',
  TX: 'https://mycpa.cpa.state.tx.us/coa/',
  NY: 'https://appext20.dos.ny.gov/corp_public/corpsearch.entity_search_entry',
  FL: 'https://search.sunbiz.org/Inquiry/CorporationSearch/ByName',
}

const CONFIDENCE_STYLES = {
  high: 'bg-calm-green/10 text-calm-green',
  medium: 'bg-calm-amber/10 text-calm-amber',
  low: 'bg-calm-amber/10 text-calm-amber',
} as const

export function AnalysisReview({ analysis, onConfirm }: AnalysisReviewProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<AnalysisResult>({ ...analysis })

  function updateField<K extends keyof AnalysisResult>(key: K, value: AnalysisResult[K]) {
    setDraft(prev => ({ ...prev, [key]: value }))
  }

  function updateOpposingParty(field: string, value: string) {
    setDraft(prev => ({
      ...prev,
      opposingParty: { ...prev.opposingParty, [field]: value },
    }))
  }

  const current = editing ? draft : analysis
  const hasEntity = current.opposingParty.type === 'business' && current.opposingParty.legalName
  const sosUrl = STATE_SOS_URLS[current.state] || `https://www.google.com/search?q=${encodeURIComponent(current.state + ' secretary of state business search')}`

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-warm-text mb-2">
          Here&apos;s what we found
        </h2>
        <p className="text-warm-muted">
          Review the details below. You can edit anything that doesn&apos;t look right.
        </p>
      </div>

      <Card className="bg-white border-warm-border">
        <CardContent className="pt-6">
          {/* Confidence badge */}
          <div className="flex items-center justify-between mb-6">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${CONFIDENCE_STYLES[current.confidence]}`}>
              {current.confidence === 'high' ? (
                <CheckCircle className="h-3.5 w-3.5" />
              ) : (
                <AlertTriangle className="h-3.5 w-3.5" />
              )}
              {current.confidence.charAt(0).toUpperCase() + current.confidence.slice(1)} confidence
            </span>
            <button
              type="button"
              onClick={() => {
                if (editing) setDraft({ ...analysis })
                setEditing(!editing)
              }}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-calm-indigo hover:text-calm-indigo/80 transition-colors"
            >
              {editing ? (
                <>
                  <X className="h-3.5 w-3.5" />
                  Cancel edits
                </>
              ) : (
                <>
                  <Pencil className="h-3.5 w-3.5" />
                  Edit details
                </>
              )}
            </button>
          </div>

          <div className="space-y-4">
            {/* Dispute type */}
            <FieldRow label="Dispute type">
              {editing ? (
                <Input
                  value={draft.disputeType}
                  onChange={(e) => updateField('disputeType', e.target.value)}
                  className="text-sm"
                />
              ) : (
                <span className="text-sm text-warm-text">
                  {DISPUTE_TYPE_LABELS[current.disputeType] || current.disputeType}
                  {current.subType && (
                    <span className="text-warm-muted"> &mdash; {current.subType}</span>
                  )}
                </span>
              )}
            </FieldRow>

            {/* Role */}
            <FieldRow label="Your role">
              {editing ? (
                <select
                  value={draft.role}
                  onChange={(e) => updateField('role', e.target.value as 'plaintiff' | 'defendant')}
                  className="rounded-md border border-warm-border bg-warm-bg px-3 py-1.5 text-sm text-warm-text focus:outline-none focus:ring-2 focus:ring-calm-indigo/40"
                >
                  <option value="plaintiff">Plaintiff (making the claim)</option>
                  <option value="defendant">Defendant (responding)</option>
                </select>
              ) : (
                <span className="text-sm text-warm-text capitalize">{current.role}</span>
              )}
            </FieldRow>

            {/* Opposing party */}
            <FieldRow label="Opposing party">
              {editing ? (
                <div className="space-y-2">
                  <Input
                    value={draft.opposingParty.name}
                    onChange={(e) => updateOpposingParty('name', e.target.value)}
                    placeholder="Name"
                    className="text-sm"
                  />
                  <select
                    value={draft.opposingParty.type}
                    onChange={(e) => updateOpposingParty('type', e.target.value)}
                    className="w-full rounded-md border border-warm-border bg-warm-bg px-3 py-1.5 text-sm text-warm-text focus:outline-none focus:ring-2 focus:ring-calm-indigo/40"
                  >
                    <option value="person">Individual</option>
                    <option value="business">Business</option>
                  </select>
                </div>
              ) : (
                <span className="text-sm text-warm-text">
                  {current.opposingParty.name}
                  <span className="text-warm-muted"> ({current.opposingParty.type})</span>
                </span>
              )}
            </FieldRow>

            {/* Entity info */}
            {current.opposingParty.type === 'business' && (
              <div className="ml-4 pl-4 border-l-2 border-warm-border">
                {hasEntity ? (
                  <div className="rounded-lg bg-calm-green/5 border border-calm-green/20 px-4 py-3">
                    <p className="text-xs font-medium text-calm-green mb-1">Business entity found</p>
                    <p className="text-sm text-warm-text">{current.opposingParty.legalName}</p>
                    {current.opposingParty.registeredAgent && (
                      <p className="text-xs text-warm-muted mt-1">
                        Registered Agent: {current.opposingParty.registeredAgent.name}
                        {current.opposingParty.registeredAgent.address && (
                          <> &mdash; {current.opposingParty.registeredAgent.address}</>
                        )}
                      </p>
                    )}
                    {current.opposingParty.entityStatus && (
                      <p className="text-xs text-warm-muted mt-0.5">
                        Status: {current.opposingParty.entityStatus}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="rounded-lg bg-calm-amber/5 border border-calm-amber/20 px-4 py-3">
                    <p className="text-xs font-medium text-calm-amber mb-1">
                      Business entity not confirmed
                    </p>
                    <p className="text-xs text-warm-muted">
                      You can verify this business on your{' '}
                      <a
                        href={sosUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-calm-indigo underline hover:text-calm-indigo/80"
                      >
                        state Secretary of State website
                      </a>.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Amount */}
            <FieldRow label="Approximate amount">
              {editing ? (
                <Input
                  type="number"
                  value={draft.approximateAmount}
                  onChange={(e) => updateField('approximateAmount', Number(e.target.value))}
                  className="text-sm"
                />
              ) : (
                <span className="text-sm text-warm-text font-medium">
                  ${current.approximateAmount.toLocaleString()}
                </span>
              )}
            </FieldRow>

            {/* State */}
            <FieldRow label="State">
              {editing ? (
                <Input
                  value={draft.state}
                  onChange={(e) => updateField('state', e.target.value.toUpperCase().slice(0, 2))}
                  maxLength={2}
                  className="text-sm w-20"
                />
              ) : (
                <span className="text-sm text-warm-text">{current.state}</span>
              )}
            </FieldRow>

            {/* Summary */}
            <FieldRow label="Summary">
              {editing ? (
                <textarea
                  value={draft.summary}
                  onChange={(e) => updateField('summary', e.target.value)}
                  rows={3}
                  className="w-full resize-none rounded-md border border-warm-border bg-warm-bg px-3 py-2 text-sm text-warm-text focus:outline-none focus:ring-2 focus:ring-calm-indigo/40"
                />
              ) : (
                <p className="text-sm text-warm-text">{current.summary}</p>
              )}
            </FieldRow>
          </div>

          <Button
            onClick={() => onConfirm(editing ? draft : analysis)}
            className="w-full mt-8"
          >
            Looks right &mdash; draft my letter &rarr;
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
      <span className="text-xs font-medium text-warm-muted uppercase tracking-wide sm:w-36 shrink-0 sm:pt-1.5">
        {label}
      </span>
      <div className="flex-1">{children}</div>
    </div>
  )
}
