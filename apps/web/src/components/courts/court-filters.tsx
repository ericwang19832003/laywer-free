'use client'

import { useState } from 'react'
import { Search, Filter, MapPin, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { STATE_COURT_TYPES, type CourtTypeCode } from '@lawyer-free/shared/courts/court-types'

interface CourtFiltersProps {
  state: string
  query: string
  types: CourtTypeCode[]
  county: string
  onQueryChange: (query: string) => void
  onTypesChange: (types: CourtTypeCode[]) => void
  onCountyChange: (county: string) => void
  courtCount: number
}

const COURT_TYPE_GROUPS = {
  small_claims: { label: 'Small Claims', color: 'bg-green-100 text-green-700' },
  limited: { label: 'Limited/County', color: 'bg-yellow-100 text-yellow-700' },
  general: { label: 'General/District', color: 'bg-blue-100 text-blue-700' },
  federal: { label: 'Federal Court', color: 'bg-calm-indigo/10 text-calm-indigo' },
}

export function CourtFilters({
  state,
  query,
  types,
  county,
  onQueryChange,
  onTypesChange,
  onCountyChange,
  courtCount,
}: CourtFiltersProps) {
  const [showFilters, setShowFilters] = useState(false)

  const stateCourtTypes = STATE_COURT_TYPES[state] || STATE_COURT_TYPES.TX

  const groupedTypes = {
    small_claims: stateCourtTypes.filter(t => 
      t.value.includes('small_claims') || t.value === 'jp' || t.value === 'pa_magisterial'
    ),
    limited: stateCourtTypes.filter(t =>
      t.value.includes('county') || t.value === 'limited_civil' || t.value === 'ny_civil'
    ),
    general: stateCourtTypes.filter(t =>
      t.value === 'district' || t.value === 'unlimited_civil' || t.value === 'ny_supreme' ||
      t.value === 'fl_circuit' || t.value === 'pa_common_pleas'
    ),
    federal: stateCourtTypes.filter(t => t.value === 'federal'),
  }

  const toggleType = (type: CourtTypeCode) => {
    if (types.includes(type)) {
      onTypesChange(types.filter(t => t !== type))
    } else {
      onTypesChange([...types, type])
    }
  }

  const clearFilters = () => {
    onQueryChange('')
    onTypesChange([])
    onCountyChange('')
  }

  const hasFilters = query || types.length > 0 || county

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-warm-muted" />
          <Input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search by name, city, or address..."
            className="pl-9"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
          className={cn(showFilters && 'bg-calm-indigo/10 border-calm-indigo/30')}
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[150px]">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-warm-muted" />
          <Input
            value={county}
            onChange={(e) => onCountyChange(e.target.value)}
            placeholder="Filter by county..."
            className="pl-9"
          />
        </div>
        <span className="text-xs text-warm-muted">
          {courtCount} court{courtCount !== 1 ? 's' : ''} found
        </span>
      </div>

      {hasFilters && (
        <div className="flex items-center gap-2">
          {query && (
            <Badge variant="secondary" className="gap-1">
              Search: {query}
              <button onClick={() => onQueryChange('')} className="ml-1 hover:text-calm-indigo">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {county && (
            <Badge variant="secondary" className="gap-1">
              County: {county}
              <button onClick={() => onCountyChange('')} className="ml-1 hover:text-calm-indigo">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {types.length > 0 && (
            <Badge variant="secondary" className="gap-1">
              {types.length} type{types.length !== 1 ? 's' : ''}
              <button onClick={() => onTypesChange([])} className="ml-1 hover:text-calm-indigo">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 px-2 text-xs">
            Clear all
          </Button>
        </div>
      )}

      {showFilters && (
        <div className="p-3 bg-warm-bg rounded-lg border border-warm-border space-y-4">
          <div className="space-y-3">
            {Object.entries(groupedTypes).map(([group, courtTypes]) => {
              if (courtTypes.length === 0) return null
              const groupInfo = COURT_TYPE_GROUPS[group as keyof typeof COURT_TYPE_GROUPS]
              return (
                <div key={group}>
                  <Label className={cn('text-xs font-medium', groupInfo.color.split(' ')[1])}>
                    {groupInfo.label}
                  </Label>
                  <div className="mt-1.5 space-y-1.5">
                    {courtTypes.map((ct) => (
                      <label
                        key={ct.value}
                        className="flex items-center gap-2 text-sm cursor-pointer hover:text-calm-indigo"
                      >
                        <Checkbox
                          checked={types.includes(ct.value)}
                          onCheckedChange={() => toggleType(ct.value)}
                        />
                        {ct.label}
                      </label>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
