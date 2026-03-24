'use client'

import { useState, useMemo } from 'react'
import { Scale, Info } from 'lucide-react'
import { CourtCardList } from './court-card'
import { CourtFilters } from './court-filters'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { CourtFilters as CourtFiltersInterface, Court } from '@/lib/courts/court-types'
import { getCourtsByState, searchCourts } from '@/lib/courts/court-database'
import type { State } from '@/lib/schemas/case'

interface CourtSelectorProps {
  state: State
  selectedCourt?: Court | null
  onSelect?: (court: Court) => void
  showHeader?: boolean
  compact?: boolean
}

export function CourtSelector({
  state,
  selectedCourt,
  onSelect,
  showHeader = true,
  compact = false,
}: CourtSelectorProps) {
  const [filters, setFilters] = useState<CourtFiltersInterface>({
    query: '',
    types: [],
    county: '',
    hasFeeInfo: false,
  })

  const courts = useMemo(() => {
    let results = getCourtsByState(state)

    if (filters.query) {
      results = searchCourts(state, filters.query)
    }

    if (filters.types.length > 0) {
      results = results.filter(c => filters.types.includes(c.type))
    }

    if (filters.county) {
      const countyLower = filters.county.toLowerCase()
      results = results.filter(c =>
        c.county?.toLowerCase().includes(countyLower)
      )
    }

    return results
  }, [state, filters])

  const updateFilter = <K extends keyof CourtFiltersInterface>(key: K, value: CourtFiltersInterface[K]) => {
    setFilters((prev: CourtFiltersInterface) => ({ ...prev, [key]: value }))
  }

  if (compact) {
    return (
      <div className="space-y-3">
        <CourtFilters
          state={state}
          query={filters.query}
          types={filters.types}
          county={filters.county}
          onQueryChange={(q) => updateFilter('query', q)}
          onTypesChange={(t) => updateFilter('types', t)}
          onCountyChange={(c) => updateFilter('county', c)}
          courtCount={courts.length}
        />
        <CourtCardList
          courts={courts}
          onSelect={onSelect}
          selectedId={selectedCourt?.id}
          compact={true}
        />
      </div>
    )
  }

  return (
    <Card>
      {showHeader && (
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Scale className="h-5 w-5 text-calm-indigo" />
            Court Directory
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className="space-y-4">
        <CourtFilters
          state={state}
          query={filters.query}
          types={filters.types}
          county={filters.county}
          onQueryChange={(q) => updateFilter('query', q)}
          onTypesChange={(t) => updateFilter('types', t)}
          onCountyChange={(c) => updateFilter('county', c)}
          courtCount={courts.length}
        />

        <Tabs defaultValue="all">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">
              All Courts ({courts.length})
            </TabsTrigger>
            <TabsTrigger value="federal" disabled={!courts.some(c => c.type === 'federal')}>
              Federal Courts
            </TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-4">
            <CourtCardList
              courts={courts}
              onSelect={onSelect}
              selectedId={selectedCourt?.id}
              emptyMessage="No courts match your search"
            />
          </TabsContent>
          <TabsContent value="federal" className="mt-4">
            <CourtCardList
              courts={courts.filter(c => c.type === 'federal')}
              onSelect={onSelect}
              selectedId={selectedCourt?.id}
              emptyMessage="No federal courts found"
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

interface CourtDirectoryProps {
  state: State
}

export function CourtDirectory({ state }: CourtDirectoryProps) {
  const courts = getCourtsByState(state)

  const groupedCourts = useMemo(() => {
    const groups: Record<string, Court[]> = {}
    courts.forEach(court => {
      const key = court.county || 'Other'
      if (!groups[key]) groups[key] = []
      groups[key].push(court)
    })
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
  }, [courts])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-warm-text">Court Directory</h2>
          <p className="text-sm text-warm-muted">
            Browse courts in {state} • {courts.length} courts available
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {groupedCourts.map(([county, countyCourts]) => (
          <div key={county}>
            <h3 className="text-sm font-medium text-warm-muted mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-calm-indigo" />
              {county} County
              <span className="text-xs">({countyCourts.length})</span>
            </h3>
            <CourtCardList courts={countyCourts} compact={true} />
          </div>
        ))}
      </div>
    </div>
  )
}

export function JurisdictionExplainer({ state }: { state: State }) {
  const rules = getJurisdictionRules(state)

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Info className="h-5 w-5 text-calm-indigo" />
          Understanding Court Jurisdiction
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm max-w-none">
          <p className="text-warm-text">
            The right court for your case depends on several factors. Here&apos;s a guide to {state} courts:
          </p>
          <ul className="mt-4 space-y-3">
            {rules.map((rule, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-calm-indigo/10 text-calm-indigo text-xs font-medium">
                  {i + 1}
                </span>
                <div>
                  <p className="font-medium text-warm-text">{rule.title}</p>
                  <p className="text-sm text-warm-muted">{rule.description}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-4 p-3 bg-calm-indigo/5 rounded-lg border border-calm-indigo/10">
            <p className="text-sm text-warm-text">
              <strong>Not sure?</strong> Start with the court type that matches your situation. If you file in the wrong court, it will typically be transferred to the correct court rather than dismissed.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface JurisdictionRule {
  title: string
  description: string
}

function getJurisdictionRules(state: string): JurisdictionRule[] {
  switch (state) {
    case 'TX':
      return [
        {
          title: 'Justice of the Peace (JP) Court',
          description: 'Claims up to $20,000. Fast, informal, minimal paperwork. Great for small disputes and evictions.',
        },
        {
          title: 'County Court',
          description: 'Claims $20,001 to $200,000. More formal than JP but still accessible without an attorney.',
        },
        {
          title: 'District Court',
          description: 'Claims over $200,000. Family law, probate, and title to real property. Most formal court.',
        },
        {
          title: 'Federal Court',
          description: 'Only if you have a federal claim (civil rights, patent, etc.) OR if parties are from different states AND the amount exceeds $75,000.',
        },
      ]
    case 'CA':
      return [
        {
          title: 'Small Claims Court',
          description: 'Claims up to $12,500 (individuals) or $6,250 (businesses). No attorney allowed at hearing.',
        },
        {
          title: 'Limited Civil Court',
          description: 'Claims $12,501 to $35,000. Standard civil procedures apply.',
        },
        {
          title: 'Unlimited Civil Court',
          description: 'Claims over $35,000. Family law, probate, unlawful detainer. Handles all case types.',
        },
        {
          title: 'Federal Court',
          description: 'Federal claims or diversity jurisdiction (over $75,000, different states).',
        },
      ]
    case 'NY':
      return [
        {
          title: 'Small Claims Court',
          description: 'Claims up to $10,000. Simple procedures, limited attorney involvement.',
        },
        {
          title: 'Civil Court',
          description: 'Claims $10,001 to $50,000. Handles most everyday disputes and evictions.',
        },
        {
          title: 'Supreme Court',
          description: 'Claims over $50,000. Note: This is the main trial court in NY, not the highest court.',
        },
        {
          title: 'Federal Court',
          description: 'Federal claims or diversity jurisdiction (over $75,000, different states).',
        },
      ]
    case 'FL':
      return [
        {
          title: 'Small Claims Court',
          description: 'Claims up to $8,000. Simple procedures, limited discovery.',
        },
        {
          title: 'County Court',
          description: 'Claims $8,001 to $50,000. Standard civil procedures.',
        },
        {
          title: 'Circuit Court',
          description: 'Claims over $50,000. Family law, probate, civil rights. Unlimited jurisdiction.',
        },
        {
          title: 'Federal Court',
          description: 'Federal claims or diversity jurisdiction (over $75,000, different states).',
        },
      ]
    case 'PA':
      return [
        {
          title: 'Magisterial District Court',
          description: 'Claims up to $12,000. Simple, quick proceedings. Most disputes start here.',
        },
        {
          title: 'Court of Common Pleas',
          description: 'Claims over $12,000. Family law, divorce, major civil cases. Full jurisdiction.',
        },
        {
          title: 'Federal Court',
          description: 'Federal claims or diversity jurisdiction (over $75,000, different states).',
        },
      ]
    default:
      return []
  }
}
