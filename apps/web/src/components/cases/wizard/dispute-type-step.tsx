'use client'

import { useState } from 'react'
import type { DisputeType } from '@lawyer-free/shared/rules/court-recommendation'
import type { State } from '@lawyer-free/shared/schemas/case'
import { getSmallClaimsMax } from '@/lib/states'
import { isFeatureEnabled } from '@/lib/feature-flags'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { OptionCard } from './option-card'

interface DisputeOption {
  id: string
  value: DisputeType
  label: string
  description: string
  comingSoon?: boolean
}

interface AiSuggestion {
  primary: DisputeType
  card_id: string
  reasoning: string
  confidence: string
  secondary: DisputeType[]
}

/** Maps dispute option ids to their feature flags (only gated types) */
const GATED_TYPES: Record<string, Parameters<typeof isFeatureEnabled>[0]> = {
  contract: 'wizard_contract',
  property: 'wizard_property',
  real_estate: 'wizard_real_estate',
  business: 'wizard_business',
  other: 'wizard_other',
}

function getDisputeOptions(selectedState: State): DisputeOption[] {
  const limit = getSmallClaimsMax(selectedState)
  const limitFormatted = `$${limit.toLocaleString()}`

  const options: DisputeOption[] = [
    { id: 'debt_collection', value: 'debt_collection', label: 'Debt dispute', description: 'Debt collection, credit card lawsuit, or money owed to you' },
    { id: 'landlord_tenant', value: 'landlord_tenant', label: 'Landlord-tenant issue', description: 'Lease, eviction, repairs, or deposit dispute' },
    { id: 'personal_injury', value: 'personal_injury', label: 'Personal injury', description: 'Accident, negligence, or injury claims' },
    { id: 'property_damage', value: 'personal_injury', label: 'Property damage', description: 'Vehicle damage, property damage from negligence, or vandalism' },
    { id: 'contract', value: 'contract', label: 'Contract dispute', description: 'Breach of agreement, broken contract' },
    { id: 'business', value: 'business', label: 'Business dispute', description: 'Partnership, employment, or commercial dispute' },
    { id: 'property', value: 'property', label: 'Property dispute', description: 'Land ownership, boundary, or title dispute' },
    { id: 'real_estate', value: 'real_estate', label: 'Real estate', description: 'Real estate transactions, liens, or deed issues' },
    { id: 'family', value: 'family', label: 'Family matter', description: 'Custody, divorce, child support, or protective order' },
    { id: 'small_claims', value: 'small_claims', label: 'Small claim', description: `General dispute under ${limitFormatted} that doesn’t fit above` },
    { id: 'other', value: 'other', label: 'Something else', description: "Doesn't fit the categories above" },
  ]
  return options.map((opt) => {
    const flag = GATED_TYPES[opt.id]
    return {
      ...opt,
      comingSoon: flag ? !isFeatureEnabled(flag) : false,
    }
  })
}

interface DisputeTypeStepProps {
  value: DisputeType | ''
  selectedState?: State
  onSelect: (type: DisputeType, cardId: string) => void
}

const TEXTAREA_CLS =
  'flex min-h-[72px] w-full rounded-md border border-warm-border bg-transparent px-3 py-2 text-sm text-warm-text shadow-xs placeholder:text-warm-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-calm-indigo resize-none'

export function DisputeTypeStep({ value, selectedState = 'TX', onSelect }: DisputeTypeStepProps) {
  const options = getDisputeOptions(selectedState)

  const [view, setView] = useState<'describe' | 'select'>(() => (value ? 'select' : 'describe'))
  const [description, setDescription] = useState('')
  const [classifying, setClassifying] = useState(false)
  const [describeError, setDescribeError] = useState('')
  const [aiSuggestion, setAiSuggestion] = useState<AiSuggestion | null>(null)
  const [selectedId, setSelectedId] = useState<string>(() => {
    if (!value) return ''
    const match = options.find((opt) => opt.value === value)
    return match?.id ?? ''
  })

  async function handleAnalyze() {
    if (classifying) return
    if (!description.trim()) {
      setDescribeError('Please describe your situation before continuing.')
      return
    }
    setDescribeError('')
    setClassifying(true)
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/cases/classify-dispute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ description: description.trim() }),
      })
      if (res.ok) {
        const data: AiSuggestion = await res.json()
        setAiSuggestion(data)
        // Prefer card_id (more specific) over falling back to primary type match
        const match =
          options.find((opt) => opt.id === data.card_id && !opt.comingSoon) ??
          options.find((opt) => opt.value === data.primary && !opt.comingSoon)
        if (match) setSelectedId(match.id)
      }
    } catch {
      // Best-effort — fall through to select view regardless
    } finally {
      setClassifying(false)
      setView('select')
    }
  }

  function handleSelect(opt: DisputeOption) {
    setSelectedId(opt.id)
    onSelect(opt.value, opt.id)
  }

  function getCardLabel(cardId: string): string {
    return options.find((o) => o.id === cardId)?.label ?? options.find((o) => o.value === cardId)?.label ?? cardId
  }

  if (view === 'describe') {
    return (
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium text-warm-text">What&apos;s your situation?</p>
          <p className="text-xs text-warm-muted mt-1">
            Briefly describe what happened — we&apos;ll suggest the right case type.
          </p>
        </div>
        <textarea
          className={TEXTAREA_CLS}
          value={description}
          onChange={(e) => { setDescription(e.target.value); if (describeError) setDescribeError('') }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAnalyze()
          }}
          placeholder="e.g. I rented a truck and my belongings were damaged when it caught fire on the highway"
          rows={3}
          maxLength={500}
        />
        {describeError && (
          <p className="text-xs text-red-500">{describeError}</p>
        )}
        <div className="flex flex-col gap-2">
          <Button
            onClick={handleAnalyze}
            disabled={classifying}
            className="w-full"
          >
            {classifying ? 'Analyzing…' : 'Continue'}
          </Button>
          <button
            type="button"
            onClick={() => setView('select')}
            className="text-xs text-warm-muted text-center hover:underline"
          >
            Skip — let me pick a category
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {aiSuggestion && (
        <div className="rounded-lg bg-calm-indigo/8 border border-calm-indigo/20 px-3 py-2.5 space-y-1">
          <p className="text-xs font-medium text-calm-indigo">
            This looks like a <strong>{getCardLabel(aiSuggestion.card_id)}</strong> case.
          </p>
          {aiSuggestion.reasoning && (
            <p className="text-xs text-warm-muted leading-relaxed">{aiSuggestion.reasoning}</p>
          )}
          {aiSuggestion.secondary.length > 0 && (
            <p className="text-xs text-warm-muted">
              Also related:{' '}
              {aiSuggestion.secondary.map((t, i) => (
                <span key={t}>
                  {i > 0 && ', '}
                  {getCardLabel(t)}
                </span>
              ))}
            </p>
          )}
        </div>
      )}
      <p className="text-sm font-medium text-warm-text">What is this dispute about?</p>
      {!aiSuggestion && (
        <p className="text-xs text-warm-muted">
          Choose the category that best describes your situation. We&apos;ll ask follow-up questions to narrow it down.
        </p>
      )}
      <div className="space-y-2">
        {options.map((opt) => (
          <div key={opt.id} className="relative">
            <OptionCard
              label={opt.label}
              description={opt.description}
              selected={selectedId === opt.id}
              onClick={() => !opt.comingSoon && handleSelect(opt)}
              disabled={opt.comingSoon}
            />
            {opt.comingSoon && (
              <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
                <span className="text-[11px] font-medium text-calm-indigo bg-calm-indigo/10 px-2 py-0.5 rounded-full">
                  Coming soon
                </span>
                <span className="text-[10px] text-warm-muted max-w-[200px] text-right">
                  Full wizard coming soon — you can still use guided steps for this type.
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
