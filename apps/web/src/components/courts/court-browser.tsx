'use client'

import { useState } from 'react'
import { CourtSelector, JurisdictionExplainer } from '@/components/courts/court-selector'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { State } from '@lawyer-free/shared/schemas/case'

const STATES: { value: State; label: string }[] = [
  { value: 'TX', label: 'Texas' },
  { value: 'CA', label: 'California' },
  { value: 'NY', label: 'New York' },
  { value: 'FL', label: 'Florida' },
  { value: 'PA', label: 'Pennsylvania' },
]

export function CourtBrowser() {
  const [selectedState, setSelectedState] = useState<State>('TX')

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <label htmlFor="court-state" className="text-sm font-medium text-warm-text">
          Select a state:
        </label>
        <Select value={selectedState} onValueChange={(v) => setSelectedState(v as State)}>
          <SelectTrigger id="court-state" className="w-[180px]">
            <SelectValue placeholder="Select state" />
          </SelectTrigger>
          <SelectContent>
            {STATES.map((state) => (
              <SelectItem key={state.value} value={state.value}>
                {state.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CourtSelector state={selectedState} showHeader={false} />
        </div>
        <div className="lg:col-span-1">
          <JurisdictionExplainer state={selectedState} />
        </div>
      </div>
    </div>
  )
}
