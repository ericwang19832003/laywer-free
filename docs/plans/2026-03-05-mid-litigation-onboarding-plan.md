# Mid-Litigation Onboarding Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Let users with active lawsuits import their case at any stage, auto-skip prior tasks, and start where they actually are in litigation.

**Architecture:** Add an "Import Existing Case" wizard that reuses the existing case creation wizard steps (state, role, dispute type), then adds a milestone timeline picker and catch-up form. After case creation, a new API endpoint bulk-skips tasks before the selected milestone and unlocks the milestone task. A backfill banner on the dashboard reminds users to fill in skipped details.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Supabase, Tailwind CSS, Zod, lucide-react

---

### Task 1: Milestone Definitions Module

**Files:**
- Create: `src/lib/rules/milestones.ts`
- Test: `tests/unit/milestones.test.ts`

**Step 1: Write the failing test**

Create `tests/unit/milestones.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { getMilestones, getTasksToSkip } from '@/lib/rules/milestones'

describe('milestones', () => {
  it('returns milestones for civil dispute type', () => {
    const milestones = getMilestones('contract')
    expect(milestones.length).toBeGreaterThan(2)
    expect(milestones[0].id).toBe('start')
    expect(milestones[0].firstUnlockedTask).toBe('welcome')
  })

  it('returns milestones for personal_injury', () => {
    const milestones = getMilestones('personal_injury')
    expect(milestones.find(m => m.id === 'medical')).toBeDefined()
    expect(milestones.find(m => m.id === 'demand')).toBeDefined()
  })

  it('returns milestones for debt_collection', () => {
    const milestones = getMilestones('debt_collection')
    expect(milestones.find(m => m.id === 'validation')).toBeDefined()
  })

  it('returns milestones for family', () => {
    const milestones = getMilestones('family')
    expect(milestones.find(m => m.id === 'filed')).toBeDefined()
  })

  it('returns milestones for small_claims', () => {
    const milestones = getMilestones('small_claims')
    expect(milestones.find(m => m.id === 'demand_sent')).toBeDefined()
  })

  it('returns milestones for landlord_tenant', () => {
    const milestones = getMilestones('landlord_tenant')
    expect(milestones.find(m => m.id === 'demand_sent')).toBeDefined()
  })

  it('returns tasks to skip for a given milestone', () => {
    const toSkip = getTasksToSkip('contract', 'served')
    expect(toSkip).toContain('welcome')
    expect(toSkip).toContain('intake')
    expect(toSkip).toContain('prepare_filing')
    expect(toSkip).toContain('file_with_court')
    expect(toSkip).toContain('upload_return_of_service')
    expect(toSkip).toContain('confirm_service_facts')
    expect(toSkip).not.toContain('wait_for_answer')
  })

  it('returns empty array for start milestone', () => {
    const toSkip = getTasksToSkip('contract', 'start')
    expect(toSkip).toEqual([])
  })

  it('falls back to civil milestones for unknown dispute type', () => {
    const milestones = getMilestones('other')
    expect(milestones[0].id).toBe('start')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `cd "/Users/minwang/lawyer free" && npx vitest run tests/unit/milestones.test.ts`
Expected: FAIL — module not found

**Step 3: Write the implementation**

Create `src/lib/rules/milestones.ts`:

```typescript
import type { DisputeType } from '@/lib/rules/court-recommendation'

export interface Milestone {
  id: string
  label: string
  description: string
  firstUnlockedTask: string
  tasksToSkip: string[]
}

const CIVIL_MILESTONES: Milestone[] = [
  {
    id: 'start',
    label: 'Just getting started',
    description: 'Haven\'t filed anything yet',
    firstUnlockedTask: 'welcome',
    tasksToSkip: [],
  },
  {
    id: 'filed',
    label: 'Filed petition with court',
    description: 'Petition/complaint has been filed',
    firstUnlockedTask: 'evidence_vault',
    tasksToSkip: ['welcome', 'intake', 'prepare_filing', 'file_with_court'],
  },
  {
    id: 'served',
    label: 'Served the defendant',
    description: 'Defendant has been served with papers',
    firstUnlockedTask: 'wait_for_answer',
    tasksToSkip: ['welcome', 'intake', 'evidence_vault', 'preservation_letter', 'prepare_filing', 'file_with_court', 'upload_return_of_service', 'confirm_service_facts'],
  },
  {
    id: 'answer',
    label: 'Received answer / waiting',
    description: 'Answer deadline passed or answer received',
    firstUnlockedTask: 'upload_answer',
    tasksToSkip: ['welcome', 'intake', 'evidence_vault', 'preservation_letter', 'prepare_filing', 'file_with_court', 'upload_return_of_service', 'confirm_service_facts', 'wait_for_answer', 'check_docket_for_answer'],
  },
  {
    id: 'conference_prep',
    label: 'Preparing for 26(f) conference',
    description: 'Getting ready for discovery planning conference',
    firstUnlockedTask: 'rule_26f_prep',
    tasksToSkip: ['welcome', 'intake', 'evidence_vault', 'preservation_letter', 'prepare_filing', 'file_with_court', 'upload_return_of_service', 'confirm_service_facts', 'wait_for_answer', 'check_docket_for_answer', 'upload_answer', 'discovery_starter_pack'],
  },
  {
    id: 'discovery',
    label: 'In active discovery',
    description: 'Exchanging discovery with opposing counsel',
    firstUnlockedTask: 'discovery_starter_pack',
    tasksToSkip: ['welcome', 'intake', 'evidence_vault', 'preservation_letter', 'prepare_filing', 'file_with_court', 'upload_return_of_service', 'confirm_service_facts', 'wait_for_answer', 'check_docket_for_answer', 'upload_answer', 'rule_26f_prep', 'mandatory_disclosures'],
  },
  {
    id: 'trial_prep',
    label: 'Preparing for trial',
    description: 'Discovery is done, getting ready for trial',
    firstUnlockedTask: 'trial_prep_checklist',
    tasksToSkip: ['welcome', 'intake', 'evidence_vault', 'preservation_letter', 'prepare_filing', 'file_with_court', 'upload_return_of_service', 'confirm_service_facts', 'wait_for_answer', 'check_docket_for_answer', 'upload_answer', 'rule_26f_prep', 'mandatory_disclosures', 'discovery_starter_pack', 'default_packet_prep'],
  },
]

const PI_MILESTONES: Milestone[] = [
  {
    id: 'start',
    label: 'Just getting started',
    description: 'Haven\'t taken any legal action yet',
    firstUnlockedTask: 'welcome',
    tasksToSkip: [],
  },
  {
    id: 'medical',
    label: 'Gathering medical records',
    description: 'Collecting medical documentation',
    firstUnlockedTask: 'pi_medical_records',
    tasksToSkip: ['welcome', 'pi_intake'],
  },
  {
    id: 'insurance',
    label: 'Dealing with insurance',
    description: 'Communicating with insurance companies',
    firstUnlockedTask: 'pi_insurance_communication',
    tasksToSkip: ['welcome', 'pi_intake', 'pi_medical_records', 'evidence_vault'],
  },
  {
    id: 'demand',
    label: 'Sending demand letter',
    description: 'Preparing or sent demand letter',
    firstUnlockedTask: 'prepare_pi_demand_letter',
    tasksToSkip: ['welcome', 'pi_intake', 'pi_medical_records', 'evidence_vault', 'pi_insurance_communication'],
  },
  {
    id: 'negotiation',
    label: 'In settlement negotiations',
    description: 'Negotiating settlement with other party',
    firstUnlockedTask: 'pi_settlement_negotiation',
    tasksToSkip: ['welcome', 'pi_intake', 'pi_medical_records', 'evidence_vault', 'pi_insurance_communication', 'prepare_pi_demand_letter'],
  },
  {
    id: 'filing',
    label: 'Filing petition',
    description: 'Preparing or filed lawsuit petition',
    firstUnlockedTask: 'prepare_pi_petition',
    tasksToSkip: ['welcome', 'pi_intake', 'pi_medical_records', 'evidence_vault', 'pi_insurance_communication', 'prepare_pi_demand_letter', 'pi_settlement_negotiation'],
  },
  {
    id: 'litigation',
    label: 'In active litigation',
    description: 'Served defendant, preparing for trial',
    firstUnlockedTask: 'pi_trial_prep',
    tasksToSkip: ['welcome', 'pi_intake', 'pi_medical_records', 'evidence_vault', 'pi_insurance_communication', 'prepare_pi_demand_letter', 'pi_settlement_negotiation', 'prepare_pi_petition', 'pi_file_with_court', 'pi_serve_defendant'],
  },
]

const DEBT_MILESTONES: Milestone[] = [
  {
    id: 'start',
    label: 'Just got served',
    description: 'Received a lawsuit or collection notice',
    firstUnlockedTask: 'welcome',
    tasksToSkip: [],
  },
  {
    id: 'validation',
    label: 'Sent validation letter',
    description: 'Requested debt validation from collector',
    firstUnlockedTask: 'prepare_debt_defense_answer',
    tasksToSkip: ['welcome', 'debt_defense_intake', 'evidence_vault', 'prepare_debt_validation_letter'],
  },
  {
    id: 'answered',
    label: 'Filed my answer',
    description: 'Filed answer with the court',
    firstUnlockedTask: 'debt_file_with_court',
    tasksToSkip: ['welcome', 'debt_defense_intake', 'evidence_vault', 'prepare_debt_validation_letter', 'prepare_debt_defense_answer'],
  },
  {
    id: 'hearing',
    label: 'Preparing for hearing',
    description: 'Getting ready for court hearing',
    firstUnlockedTask: 'debt_hearing_prep',
    tasksToSkip: ['welcome', 'debt_defense_intake', 'evidence_vault', 'prepare_debt_validation_letter', 'prepare_debt_defense_answer', 'debt_file_with_court', 'serve_plaintiff'],
  },
]

const SMALL_CLAIMS_MILESTONES: Milestone[] = [
  {
    id: 'start',
    label: 'Just getting started',
    description: 'Haven\'t filed anything yet',
    firstUnlockedTask: 'welcome',
    tasksToSkip: [],
  },
  {
    id: 'demand_sent',
    label: 'Sent demand letter',
    description: 'Sent written demand to the other party',
    firstUnlockedTask: 'prepare_small_claims_filing',
    tasksToSkip: ['welcome', 'small_claims_intake', 'evidence_vault', 'prepare_demand_letter'],
  },
  {
    id: 'filed',
    label: 'Filed with court',
    description: 'Filed small claims petition',
    firstUnlockedTask: 'file_with_court',
    tasksToSkip: ['welcome', 'small_claims_intake', 'evidence_vault', 'prepare_demand_letter', 'prepare_small_claims_filing'],
  },
  {
    id: 'served',
    label: 'Served the other party',
    description: 'Other party has been served',
    firstUnlockedTask: 'prepare_for_hearing',
    tasksToSkip: ['welcome', 'small_claims_intake', 'evidence_vault', 'prepare_demand_letter', 'prepare_small_claims_filing', 'file_with_court', 'serve_defendant'],
  },
  {
    id: 'hearing',
    label: 'Preparing for hearing',
    description: 'Getting ready for court date',
    firstUnlockedTask: 'hearing_day',
    tasksToSkip: ['welcome', 'small_claims_intake', 'evidence_vault', 'prepare_demand_letter', 'prepare_small_claims_filing', 'file_with_court', 'serve_defendant', 'prepare_for_hearing'],
  },
]

const FAMILY_MILESTONES: Milestone[] = [
  {
    id: 'start',
    label: 'Just getting started',
    description: 'Haven\'t filed anything yet',
    firstUnlockedTask: 'welcome',
    tasksToSkip: [],
  },
  {
    id: 'filed',
    label: 'Filed petition',
    description: 'Filed family law petition with court',
    firstUnlockedTask: 'file_with_court',
    tasksToSkip: ['welcome', 'family_intake', 'safety_screening', 'evidence_vault', 'prepare_family_filing'],
  },
  {
    id: 'served',
    label: 'Served the other party',
    description: 'Other party has been served',
    firstUnlockedTask: 'waiting_period',
    tasksToSkip: ['welcome', 'family_intake', 'safety_screening', 'evidence_vault', 'prepare_family_filing', 'file_with_court', 'upload_return_of_service', 'confirm_service_facts'],
  },
  {
    id: 'temporary',
    label: 'Seeking temporary orders',
    description: 'Need temporary custody, support, or protective orders',
    firstUnlockedTask: 'temporary_orders',
    tasksToSkip: ['welcome', 'family_intake', 'safety_screening', 'evidence_vault', 'prepare_family_filing', 'file_with_court', 'upload_return_of_service', 'confirm_service_facts', 'waiting_period'],
  },
  {
    id: 'mediation',
    label: 'In mediation',
    description: 'Attending or preparing for mediation',
    firstUnlockedTask: 'mediation',
    tasksToSkip: ['welcome', 'family_intake', 'safety_screening', 'evidence_vault', 'prepare_family_filing', 'file_with_court', 'upload_return_of_service', 'confirm_service_facts', 'waiting_period', 'temporary_orders'],
  },
  {
    id: 'final',
    label: 'Working on final orders',
    description: 'Preparing final decree or orders',
    firstUnlockedTask: 'final_orders',
    tasksToSkip: ['welcome', 'family_intake', 'safety_screening', 'evidence_vault', 'prepare_family_filing', 'file_with_court', 'upload_return_of_service', 'confirm_service_facts', 'waiting_period', 'temporary_orders', 'mediation'],
  },
]

const LANDLORD_TENANT_MILESTONES: Milestone[] = [
  {
    id: 'start',
    label: 'Just getting started',
    description: 'Haven\'t taken any legal action yet',
    firstUnlockedTask: 'welcome',
    tasksToSkip: [],
  },
  {
    id: 'demand_sent',
    label: 'Sent demand letter',
    description: 'Sent written demand to landlord/tenant',
    firstUnlockedTask: 'prepare_landlord_tenant_filing',
    tasksToSkip: ['welcome', 'landlord_tenant_intake', 'evidence_vault', 'prepare_lt_demand_letter'],
  },
  {
    id: 'filed',
    label: 'Filed with court',
    description: 'Filed case with court',
    firstUnlockedTask: 'file_with_court',
    tasksToSkip: ['welcome', 'landlord_tenant_intake', 'evidence_vault', 'prepare_lt_demand_letter', 'prepare_landlord_tenant_filing'],
  },
  {
    id: 'served',
    label: 'Served the other party',
    description: 'Other party has been served',
    firstUnlockedTask: 'prepare_for_hearing',
    tasksToSkip: ['welcome', 'landlord_tenant_intake', 'evidence_vault', 'prepare_lt_demand_letter', 'prepare_landlord_tenant_filing', 'file_with_court', 'serve_other_party'],
  },
  {
    id: 'hearing',
    label: 'Preparing for hearing',
    description: 'Getting ready for court date',
    firstUnlockedTask: 'hearing_day',
    tasksToSkip: ['welcome', 'landlord_tenant_intake', 'evidence_vault', 'prepare_lt_demand_letter', 'prepare_landlord_tenant_filing', 'file_with_court', 'serve_other_party', 'prepare_for_hearing'],
  },
  {
    id: 'post',
    label: 'Post-judgment',
    description: 'Judgment has been entered, dealing with enforcement',
    firstUnlockedTask: 'post_judgment',
    tasksToSkip: ['welcome', 'landlord_tenant_intake', 'evidence_vault', 'prepare_lt_demand_letter', 'prepare_landlord_tenant_filing', 'file_with_court', 'serve_other_party', 'prepare_for_hearing', 'hearing_day'],
  },
]

const MILESTONE_MAP: Record<string, Milestone[]> = {
  personal_injury: PI_MILESTONES,
  debt_collection: DEBT_MILESTONES,
  small_claims: SMALL_CLAIMS_MILESTONES,
  family: FAMILY_MILESTONES,
  landlord_tenant: LANDLORD_TENANT_MILESTONES,
}

export function getMilestones(disputeType: DisputeType | string): Milestone[] {
  return MILESTONE_MAP[disputeType] ?? CIVIL_MILESTONES
}

export function getTasksToSkip(disputeType: DisputeType | string, milestoneId: string): string[] {
  const milestones = getMilestones(disputeType)
  const milestone = milestones.find(m => m.id === milestoneId)
  return milestone?.tasksToSkip ?? []
}

export function getMilestoneByID(disputeType: DisputeType | string, milestoneId: string): Milestone | undefined {
  const milestones = getMilestones(disputeType)
  return milestones.find(m => m.id === milestoneId)
}
```

**Step 4: Run test to verify it passes**

Run: `cd "/Users/minwang/lawyer free" && npx vitest run tests/unit/milestones.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/rules/milestones.ts tests/unit/milestones.test.ts
git commit -m "feat: add milestone definitions for mid-litigation onboarding"
```

---

### Task 2: Milestone Step UI Component

**Files:**
- Create: `src/components/cases/wizard/milestone-step.tsx`

**Step 1: Create the milestone timeline picker component**

Create `src/components/cases/wizard/milestone-step.tsx`:

```tsx
'use client'

import { Check } from 'lucide-react'
import type { Milestone } from '@/lib/rules/milestones'

interface MilestoneStepProps {
  milestones: Milestone[]
  value: string
  onSelect: (milestoneId: string) => void
}

export function MilestoneStep({ milestones, value, onSelect }: MilestoneStepProps) {
  const selectedIndex = milestones.findIndex(m => m.id === value)

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-warm-text">Where are you in your case?</p>
      <p className="text-xs text-warm-muted">
        Select the stage that best describes where you are right now. We&apos;ll skip the steps you&apos;ve already completed.
      </p>

      <div className="relative ml-4 mt-4">
        {milestones.map((milestone, index) => {
          const isSelected = milestone.id === value
          const isPast = selectedIndex >= 0 && index < selectedIndex
          const isFuture = selectedIndex >= 0 && index > selectedIndex

          return (
            <button
              key={milestone.id}
              type="button"
              onClick={() => onSelect(milestone.id)}
              className="group relative flex items-start w-full text-left"
            >
              {/* Vertical connector line */}
              {index < milestones.length - 1 && (
                <div
                  className={`absolute left-[11px] top-[24px] w-0.5 h-[calc(100%-4px)] ${
                    isPast ? 'bg-primary/30' : 'bg-warm-border'
                  }`}
                />
              )}

              {/* Circle node */}
              <div
                className={`relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                  isSelected
                    ? 'border-primary bg-primary text-white'
                    : isPast
                      ? 'border-primary/40 bg-primary/10 text-primary'
                      : 'border-warm-border bg-background group-hover:border-warm-text'
                }`}
              >
                {isPast && <Check className="h-3 w-3" />}
                {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
              </div>

              {/* Label + description */}
              <div className={`ml-3 pb-6 ${isFuture ? 'opacity-50' : ''}`}>
                <span
                  className={`text-sm font-medium ${
                    isSelected ? 'text-primary' : 'text-warm-text'
                  }`}
                >
                  {milestone.label}
                </span>
                {isSelected && (
                  <span className="ml-2 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                    You are here
                  </span>
                )}
                <span className="block text-xs text-warm-muted mt-0.5">
                  {milestone.description}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/cases/wizard/milestone-step.tsx
git commit -m "feat: add milestone timeline picker component"
```

---

### Task 3: Catch-Up Form Component

**Files:**
- Create: `src/components/cases/wizard/catch-up-step.tsx`
- Reference: `src/lib/schemas/case.ts` (for existing schema patterns)

**Step 1: Create the catch-up form component**

Create `src/components/cases/wizard/catch-up-step.tsx`:

```tsx
'use client'

import { Button } from '@/components/ui/button'

export interface CatchUpData {
  caseNumber: string
  opposingParty: string
  filingDate: string
  serviceDate: string
  upcomingDeadlineLabel: string
  upcomingDeadlineDate: string
}

interface CatchUpStepProps {
  value: CatchUpData
  onChange: (data: CatchUpData) => void
  onContinue: () => void
}

export function CatchUpStep({ value, onChange, onContinue }: CatchUpStepProps) {
  function update(field: keyof CatchUpData, val: string) {
    onChange({ ...value, [field]: val })
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-warm-text">Quick catch-up</p>
        <p className="text-xs text-warm-muted mt-0.5">
          Fill in what you know — all fields are optional. You can add more details later.
        </p>
      </div>

      <div className="space-y-3">
        <div>
          <label htmlFor="caseNumber" className="block text-xs font-medium text-warm-text mb-1">
            Case / cause number
          </label>
          <input
            id="caseNumber"
            type="text"
            placeholder="e.g. 2026-CV-12345"
            value={value.caseNumber}
            onChange={(e) => update('caseNumber', e.target.value)}
            className="w-full rounded-md border border-warm-border bg-background px-3 py-2 text-sm text-warm-text placeholder:text-warm-muted/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <label htmlFor="opposingParty" className="block text-xs font-medium text-warm-text mb-1">
            Opposing party name
          </label>
          <input
            id="opposingParty"
            type="text"
            placeholder="e.g. John Smith or Acme Corp"
            value={value.opposingParty}
            onChange={(e) => update('opposingParty', e.target.value)}
            className="w-full rounded-md border border-warm-border bg-background px-3 py-2 text-sm text-warm-text placeholder:text-warm-muted/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="filingDate" className="block text-xs font-medium text-warm-text mb-1">
              Filing date
            </label>
            <input
              id="filingDate"
              type="date"
              value={value.filingDate}
              onChange={(e) => update('filingDate', e.target.value)}
              className="w-full rounded-md border border-warm-border bg-background px-3 py-2 text-sm text-warm-text focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label htmlFor="serviceDate" className="block text-xs font-medium text-warm-text mb-1">
              Service date
            </label>
            <input
              id="serviceDate"
              type="date"
              value={value.serviceDate}
              onChange={(e) => update('serviceDate', e.target.value)}
              className="w-full rounded-md border border-warm-border bg-background px-3 py-2 text-sm text-warm-text focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-warm-text mb-1">
            Next upcoming deadline
          </label>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="e.g. 26(f) Conference"
              value={value.upcomingDeadlineLabel}
              onChange={(e) => update('upcomingDeadlineLabel', e.target.value)}
              className="w-full rounded-md border border-warm-border bg-background px-3 py-2 text-sm text-warm-text placeholder:text-warm-muted/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <input
              type="date"
              value={value.upcomingDeadlineDate}
              onChange={(e) => update('upcomingDeadlineDate', e.target.value)}
              className="w-full rounded-md border border-warm-border bg-background px-3 py-2 text-sm text-warm-text focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      <Button onClick={onContinue} className="w-full">
        Continue
      </Button>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/cases/wizard/catch-up-step.tsx
git commit -m "feat: add catch-up form for mid-litigation import"
```

---

### Task 4: Import Case Dialog

**Files:**
- Create: `src/components/cases/import-case-dialog.tsx`
- Reference: `src/components/cases/new-case-dialog.tsx` (follow same pattern)

**Step 1: Create the import case dialog**

Create `src/components/cases/import-case-dialog.tsx`. This follows the exact same `useReducer` pattern as `new-case-dialog.tsx` but adds milestone + catch-up steps:

```tsx
'use client'

import { useReducer, useState, useRef, useCallback, useEffect } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  recommendCourt,
  type DisputeType,
  type AmountRange,
} from '@/lib/rules/court-recommendation'
import type { State } from '@/lib/schemas/case'
import { getMilestones } from '@/lib/rules/milestones'
import { WizardProgress } from './wizard/wizard-progress'
import { StateStep } from './wizard/state-step'
import { RoleStep } from './wizard/role-step'
import { DisputeTypeStep } from './wizard/dispute-type-step'
import { MilestoneStep } from './wizard/milestone-step'
import { CatchUpStep, type CatchUpData } from './wizard/catch-up-step'
import { RecommendationStep } from './wizard/recommendation-step'
import {
  FamilySubTypeStep,
  type FamilySubType,
} from './wizard/family-sub-type-step'
import {
  SmallClaimsSubTypeStep,
  type SmallClaimsSubType,
} from './wizard/small-claims-sub-type-step'
import {
  LandlordTenantSubTypeStep,
  type LandlordTenantSubType,
} from './wizard/landlord-tenant-sub-type-step'
import { DebtSideStep, type DebtSide } from './wizard/debt-side-step'
import { DebtSubTypeStep, type DebtSubType } from './wizard/debt-sub-type-step'
import { PISubTypeStep } from './wizard/pi-sub-type-step'
import type { PiSubType } from '@/lib/schemas/case'

/* ── Wizard state ── */

interface ImportWizardState {
  step: number
  selectedState: State | ''
  role: 'plaintiff' | 'defendant' | ''
  disputeType: DisputeType | ''
  familySubType: FamilySubType | ''
  smallClaimsSubType: SmallClaimsSubType | ''
  landlordTenantSubType: LandlordTenantSubType | ''
  debtSide: DebtSide | ''
  debtSubType: DebtSubType | ''
  piSubType: PiSubType | ''
  milestone: string
  catchUp: CatchUpData
  county: string
}

type ImportAction =
  | { type: 'SET_STATE'; selectedState: State }
  | { type: 'SET_ROLE'; role: 'plaintiff' | 'defendant' }
  | { type: 'SET_DISPUTE_TYPE'; disputeType: DisputeType }
  | { type: 'SET_FAMILY_SUB_TYPE'; familySubType: FamilySubType }
  | { type: 'SET_SMALL_CLAIMS_SUB_TYPE'; smallClaimsSubType: SmallClaimsSubType }
  | { type: 'SET_LANDLORD_TENANT_SUB_TYPE'; landlordTenantSubType: LandlordTenantSubType }
  | { type: 'SET_DEBT_SIDE'; debtSide: DebtSide }
  | { type: 'SET_DEBT_SUB_TYPE'; debtSubType: DebtSubType }
  | { type: 'SET_PI_SUB_TYPE'; payload: PiSubType }
  | { type: 'SET_MILESTONE'; milestone: string }
  | { type: 'SET_CATCH_UP'; catchUp: CatchUpData }
  | { type: 'SET_COUNTY'; county: string }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'RESET' }

const emptyCatchUp: CatchUpData = {
  caseNumber: '',
  opposingParty: '',
  filingDate: '',
  serviceDate: '',
  upcomingDeadlineLabel: '',
  upcomingDeadlineDate: '',
}

const initialState: ImportWizardState = {
  step: 1,
  selectedState: '',
  role: '',
  disputeType: '',
  familySubType: '',
  smallClaimsSubType: '',
  landlordTenantSubType: '',
  debtSide: '',
  debtSubType: '',
  piSubType: '',
  milestone: '',
  catchUp: emptyCatchUp,
  county: '',
}

/*
  Step layout (varies by dispute type):
  1. State
  2. Role
  3. Dispute type
  4. Sub-type (if applicable) — same as new-case-dialog
  5. Milestone picker
  6. Catch-up form
  7. Court recommendation + create

  For types without a sub-type step, milestone is step 4, catch-up is 5, recommendation is 6.
*/

function hasSubTypeStep(disputeType: DisputeType | ''): boolean {
  return ['family', 'small_claims', 'landlord_tenant', 'personal_injury', 'debt_collection'].includes(disputeType)
}

function getTotalSteps(disputeType: DisputeType | ''): number {
  // Types with sub-type step: 7 steps. Others: 6 steps.
  return hasSubTypeStep(disputeType) ? 7 : 6
}

function getMilestoneStepNumber(disputeType: DisputeType | ''): number {
  return hasSubTypeStep(disputeType) ? 5 : 4
}

function reducer(state: ImportWizardState, action: ImportAction): ImportWizardState {
  switch (action.type) {
    case 'SET_STATE':
      return { ...state, selectedState: action.selectedState, step: 2 }
    case 'SET_ROLE':
      return { ...state, role: action.role, step: 3 }
    case 'SET_DISPUTE_TYPE':
      return {
        ...state,
        disputeType: action.disputeType,
        role: action.disputeType === 'personal_injury' ? 'plaintiff' : state.role,
        familySubType: '',
        smallClaimsSubType: '',
        landlordTenantSubType: '',
        debtSide: '',
        debtSubType: '',
        piSubType: '',
        milestone: '',
        step: 4,
      }
    case 'SET_FAMILY_SUB_TYPE':
      return { ...state, familySubType: action.familySubType, step: 5 }
    case 'SET_SMALL_CLAIMS_SUB_TYPE':
      return { ...state, smallClaimsSubType: action.smallClaimsSubType, step: 5 }
    case 'SET_LANDLORD_TENANT_SUB_TYPE':
      return { ...state, landlordTenantSubType: action.landlordTenantSubType, step: 5 }
    case 'SET_DEBT_SIDE':
      return { ...state, debtSide: action.debtSide, step: 5 }
    case 'SET_DEBT_SUB_TYPE':
      return { ...state, debtSubType: action.debtSubType, step: 5 }
    case 'SET_PI_SUB_TYPE':
      return { ...state, piSubType: action.payload, step: 5 }
    case 'SET_MILESTONE':
      return { ...state, milestone: action.milestone, step: state.step + 1 }
    case 'SET_CATCH_UP':
      return { ...state, catchUp: action.catchUp }
    case 'SET_COUNTY':
      return { ...state, county: action.county }
    case 'NEXT_STEP':
      return { ...state, step: Math.min(state.step + 1, getTotalSteps(state.disputeType)) }
    case 'PREV_STEP':
      return { ...state, step: Math.max(state.step - 1, 1) }
    case 'RESET':
      return initialState
    default:
      return state
  }
}

export function ImportCaseDialog() {
  const [open, setOpen] = useState(false)
  const [state, dispatch] = useReducer(reducer, initialState)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const totalSteps = getTotalSteps(state.disputeType)
  const milestoneStep = getMilestoneStepNumber(state.disputeType)
  const catchUpStep = milestoneStep + 1
  const recommendationStep = catchUpStep + 1

  const selectedState = state.selectedState || 'TX'
  const isFamily = state.disputeType === 'family'
  const isSmallClaims = state.disputeType === 'small_claims'
  const isPersonalInjury = state.disputeType === 'personal_injury'
  const isLandlordTenant = state.disputeType === 'landlord_tenant'
  const isDebtCollection = state.disputeType === 'debt_collection'

  const milestones = state.disputeType ? getMilestones(state.disputeType) : []

  /* ── Scroll handling (same as new-case-dialog) ── */
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollUp, setCanScrollUp] = useState(false)
  const [canScrollDown, setCanScrollDown] = useState(false)

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollUp(el.scrollTop > 0)
    setCanScrollDown(el.scrollTop + el.clientHeight < el.scrollHeight - 1)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTop = 0
    requestAnimationFrame(updateScrollState)
  }, [state.step, updateScrollState])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const ro = new ResizeObserver(updateScrollState)
    ro.observe(el)
    return () => ro.disconnect()
  }, [updateScrollState])

  function scrollByAmount(delta: number) {
    scrollRef.current?.scrollBy({ top: delta, behavior: 'smooth' })
  }

  /* ── Court recommendation (simplified — use district as default) ── */
  function getRecommendation() {
    const isCA = selectedState === 'CA'
    const isNY = selectedState === 'NY'
    const isFL = selectedState === 'FL'
    const isPA = selectedState === 'PA'

    if (isFamily) {
      return {
        recommended: (isPA ? 'pa_common_pleas' : isFL ? 'fl_circuit' : isNY ? 'ny_supreme' : isCA ? 'unlimited_civil' : 'district') as string,
        reasoning: 'Family law matters are heard in the appropriate family court.',
        confidence: 'high' as const,
      }
    }
    if (isSmallClaims) {
      return {
        recommended: (isPA ? 'pa_magisterial' : isFL ? 'fl_small_claims' : isNY ? 'ny_small_claims' : isCA ? 'small_claims' : 'jp') as string,
        reasoning: 'Small claims cases are filed in the appropriate small claims court.',
        confidence: 'high' as const,
      }
    }
    // Default to district for mid-litigation users (they already know their court)
    return {
      recommended: 'district' as string,
      reasoning: 'Civil cases are typically heard in District Court. You can confirm or change this.',
      confidence: 'medium' as const,
    }
  }

  async function handleAccept(courtOverride: string | null) {
    if (!state.role) return

    setLoading(true)
    setError(null)

    const courtType = courtOverride ?? getRecommendation().recommended

    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`

      // Step 1: Create the case (same as new case)
      const res = await fetch('/api/cases', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          state: selectedState,
          role: state.role,
          court_type: courtType,
          ...(state.disputeType ? { dispute_type: state.disputeType } : {}),
          ...(state.county.trim() ? { county: state.county.trim() } : {}),
          ...(isFamily && state.familySubType ? { family_sub_type: state.familySubType } : {}),
          ...(isSmallClaims && state.smallClaimsSubType ? { small_claims_sub_type: state.smallClaimsSubType } : {}),
          ...(isLandlordTenant && state.landlordTenantSubType ? { landlord_tenant_sub_type: state.landlordTenantSubType } : {}),
          ...(isDebtCollection && state.debtSubType ? { debt_sub_type: state.debtSubType } : {}),
          ...(isPersonalInjury && state.piSubType ? { pi_sub_type: state.piSubType } : {}),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Something went wrong. Please try again.')
        setLoading(false)
        return
      }

      const { case: newCase } = await res.json()

      // Step 2: Import — bulk skip tasks and set catch-up data
      if (state.milestone && state.milestone !== 'start') {
        const importRes = await fetch(`/api/cases/${newCase.id}/import`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            milestone: state.milestone,
            disputeType: state.disputeType,
            catchUp: state.catchUp,
          }),
        })

        if (!importRes.ok) {
          // Case was created but import failed — still navigate, user can manage from dashboard
          console.error('Import failed, continuing to dashboard')
        }
      }

      setOpen(false)
      router.push(`/case/${newCase.id}`)
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    if (!nextOpen) {
      dispatch({ type: 'RESET' })
      setError(null)
      setLoading(false)
    }
  }

  const recommendation = getRecommendation()

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Import Existing Case
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Import an existing case</DialogTitle>
          <DialogDescription>
            Already have a case in progress? We&apos;ll pick up where you left off.
          </DialogDescription>
        </DialogHeader>

        <WizardProgress
          currentStep={state.step}
          totalSteps={totalSteps}
          onBack={() => dispatch({ type: 'PREV_STEP' })}
        />

        <div className="relative min-h-0 flex-1">
          {canScrollUp && (
            <div className="pointer-events-none absolute top-0 left-0 right-0 z-10 h-6 bg-gradient-to-b from-background to-transparent" />
          )}

          <div
            ref={scrollRef}
            onScroll={updateScrollState}
            className="overflow-y-auto max-h-full pr-1"
            style={{ maxHeight: 'calc(85vh - 180px)' }}
          >
            {/* Step 1: State */}
            {state.step === 1 && (
              <StateStep
                value={state.selectedState}
                onSelect={(s) => dispatch({ type: 'SET_STATE', selectedState: s })}
              />
            )}

            {/* Step 2: Role */}
            {state.step === 2 && (
              <RoleStep
                value={state.role}
                disputeType={state.disputeType || undefined}
                onSelect={(role) => dispatch({ type: 'SET_ROLE', role })}
              />
            )}

            {/* Step 3: Dispute Type */}
            {state.step === 3 && (
              <DisputeTypeStep
                value={state.disputeType}
                selectedState={selectedState}
                onSelect={(disputeType) => dispatch({ type: 'SET_DISPUTE_TYPE', disputeType })}
              />
            )}

            {/* Step 4: Sub-type (if applicable) */}
            {state.step === 4 && isFamily && (
              <FamilySubTypeStep
                value={state.familySubType}
                onSelect={(familySubType) => dispatch({ type: 'SET_FAMILY_SUB_TYPE', familySubType })}
              />
            )}
            {state.step === 4 && isSmallClaims && (
              <SmallClaimsSubTypeStep
                value={state.smallClaimsSubType}
                selectedState={selectedState}
                onSelect={(smallClaimsSubType) => dispatch({ type: 'SET_SMALL_CLAIMS_SUB_TYPE', smallClaimsSubType })}
              />
            )}
            {state.step === 4 && isLandlordTenant && (
              <LandlordTenantSubTypeStep
                value={state.landlordTenantSubType}
                onSelect={(landlordTenantSubType) => dispatch({ type: 'SET_LANDLORD_TENANT_SUB_TYPE', landlordTenantSubType })}
              />
            )}
            {state.step === 4 && isPersonalInjury && (
              <PISubTypeStep
                value={state.piSubType}
                onSelect={(t) => dispatch({ type: 'SET_PI_SUB_TYPE', payload: t })}
              />
            )}
            {state.step === 4 && isDebtCollection && (
              <DebtSideStep
                value={state.debtSide}
                onSelect={(debtSide) => dispatch({ type: 'SET_DEBT_SIDE', debtSide })}
              />
            )}

            {/* For types without sub-type, step 4 = milestone */}
            {state.step === 4 && !hasSubTypeStep(state.disputeType) && state.disputeType && (
              <MilestoneStep
                milestones={milestones}
                value={state.milestone}
                onSelect={(milestone) => dispatch({ type: 'SET_MILESTONE', milestone })}
              />
            )}

            {/* Step 5: Milestone (for types with sub-type) OR Catch-up (for types without) */}
            {state.step === 5 && hasSubTypeStep(state.disputeType) && (
              <MilestoneStep
                milestones={milestones}
                value={state.milestone}
                onSelect={(milestone) => dispatch({ type: 'SET_MILESTONE', milestone })}
              />
            )}
            {state.step === 5 && !hasSubTypeStep(state.disputeType) && (
              <CatchUpStep
                value={state.catchUp}
                onChange={(catchUp) => dispatch({ type: 'SET_CATCH_UP', catchUp })}
                onContinue={() => dispatch({ type: 'NEXT_STEP' })}
              />
            )}

            {/* Step 6: Catch-up (for types with sub-type) OR Recommendation (for types without) */}
            {state.step === 6 && hasSubTypeStep(state.disputeType) && (
              <CatchUpStep
                value={state.catchUp}
                onChange={(catchUp) => dispatch({ type: 'SET_CATCH_UP', catchUp })}
                onContinue={() => dispatch({ type: 'NEXT_STEP' })}
              />
            )}
            {state.step === 6 && !hasSubTypeStep(state.disputeType) && (
              <RecommendationStep
                recommendation={recommendation}
                selectedState={selectedState}
                county={state.county}
                onCountyChange={(county) => dispatch({ type: 'SET_COUNTY', county })}
                onAccept={handleAccept}
                loading={loading}
              />
            )}

            {/* Step 7: Recommendation (for types with sub-type) */}
            {state.step === 7 && hasSubTypeStep(state.disputeType) && (
              <RecommendationStep
                recommendation={recommendation}
                selectedState={selectedState}
                county={state.county}
                onCountyChange={(county) => dispatch({ type: 'SET_COUNTY', county })}
                onAccept={handleAccept}
                loading={loading}
              />
            )}
          </div>

          {canScrollDown && (
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-6 bg-gradient-to-t from-background to-transparent" />
          )}

          {canScrollUp && (
            <button
              type="button"
              onClick={() => scrollByAmount(-200)}
              className="absolute top-1 right-3 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-background/80 border border-warm-border shadow-sm hover:bg-background transition-colors"
              aria-label="Scroll up"
            >
              <ChevronUp className="h-4 w-4 text-warm-muted" />
            </button>
          )}

          {canScrollDown && (
            <button
              type="button"
              onClick={() => scrollByAmount(200)}
              className="absolute bottom-1 right-3 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-background/80 border border-warm-border shadow-sm hover:bg-background transition-colors"
              aria-label="Scroll down"
            >
              <ChevronDown className="h-4 w-4 text-warm-muted" />
            </button>
          )}
        </div>

        {error && <p className="text-sm text-calm-amber">{error}</p>}
      </DialogContent>
    </Dialog>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/cases/import-case-dialog.tsx
git commit -m "feat: add import existing case dialog wizard"
```

---

### Task 5: Import API Endpoint

**Files:**
- Create: `src/app/api/cases/[id]/import/route.ts`
- Test: `tests/unit/import-api.test.ts`

**Step 1: Write the failing test**

Create `tests/unit/import-api.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { getTasksToSkip, getMilestoneByID } from '@/lib/rules/milestones'

describe('import API logic', () => {
  it('skips correct tasks for civil conference_prep milestone', () => {
    const toSkip = getTasksToSkip('contract', 'conference_prep')
    expect(toSkip).toContain('welcome')
    expect(toSkip).toContain('upload_answer')
    expect(toSkip).not.toContain('rule_26f_prep')
  })

  it('gets milestone details by ID', () => {
    const milestone = getMilestoneByID('contract', 'conference_prep')
    expect(milestone).toBeDefined()
    expect(milestone!.firstUnlockedTask).toBe('rule_26f_prep')
  })

  it('returns undefined for unknown milestone ID', () => {
    const milestone = getMilestoneByID('contract', 'nonexistent')
    expect(milestone).toBeUndefined()
  })
})
```

**Step 2: Run test to verify it passes (uses already-created module)**

Run: `cd "/Users/minwang/lawyer free" && npx vitest run tests/unit/import-api.test.ts`
Expected: PASS

**Step 3: Create the API endpoint**

Create `src/app/api/cases/[id]/import/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createRouteClient } from '@/lib/supabase/route-handler'
import { getTasksToSkip, getMilestoneByID } from '@/lib/rules/milestones'

const importSchema = z.object({
  milestone: z.string().min(1),
  disputeType: z.string().min(1),
  catchUp: z.object({
    caseNumber: z.string().optional().default(''),
    opposingParty: z.string().optional().default(''),
    filingDate: z.string().optional().default(''),
    serviceDate: z.string().optional().default(''),
    upcomingDeadlineLabel: z.string().optional().default(''),
    upcomingDeadlineDate: z.string().optional().default(''),
  }).optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: caseId } = await params
  const supabase = createRouteClient()

  // Verify case ownership
  const { data: caseRow, error: caseErr } = await supabase
    .from('cases')
    .select('id')
    .eq('id', caseId)
    .single()

  if (caseErr || !caseRow) {
    return NextResponse.json({ error: 'Case not found' }, { status: 404 })
  }

  // Parse and validate body
  const body = await request.json()
  const parsed = importSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', issues: parsed.error.issues },
      { status: 422 }
    )
  }

  const { milestone: milestoneId, disputeType, catchUp } = parsed.data

  // Look up milestone
  const milestone = getMilestoneByID(disputeType, milestoneId)
  if (!milestone) {
    return NextResponse.json({ error: 'Unknown milestone' }, { status: 422 })
  }

  const tasksToSkip = getTasksToSkip(disputeType, milestoneId)

  // Bulk skip tasks
  if (tasksToSkip.length > 0) {
    const { error: skipErr } = await supabase
      .from('tasks')
      .update({ status: 'skipped' })
      .eq('case_id', caseId)
      .in('task_key', tasksToSkip)
      .in('status', ['locked', 'todo'])

    if (skipErr) {
      return NextResponse.json({ error: 'Failed to skip tasks' }, { status: 500 })
    }
  }

  // Unlock the milestone task
  const { error: unlockErr } = await supabase
    .from('tasks')
    .update({ status: 'todo', unlocked_at: new Date().toISOString() })
    .eq('case_id', caseId)
    .eq('task_key', milestone.firstUnlockedTask)
    .in('status', ['locked'])

  if (unlockErr) {
    // Non-fatal: task may already be unlocked
    console.error('Unlock error (non-fatal):', unlockErr)
  }

  // Write import event
  await supabase.from('task_events').insert({
    case_id: caseId,
    kind: 'bulk_import_skip',
    payload: {
      milestone: milestoneId,
      tasks_skipped: tasksToSkip,
      first_unlocked: milestone.firstUnlockedTask,
      catch_up: catchUp || {},
    },
  })

  // Create upcoming deadline if provided
  if (catchUp?.upcomingDeadlineLabel && catchUp?.upcomingDeadlineDate) {
    await supabase.from('deadlines').insert({
      case_id: caseId,
      key: 'imported_deadline',
      due_at: new Date(catchUp.upcomingDeadlineDate).toISOString(),
      source: 'user_confirmed',
      rationale: catchUp.upcomingDeadlineLabel,
    })
  }

  return NextResponse.json({
    success: true,
    tasksSkipped: tasksToSkip.length,
    firstUnlockedTask: milestone.firstUnlockedTask,
  })
}
```

**Step 4: Commit**

```bash
git add src/app/api/cases/[id]/import/route.ts tests/unit/import-api.test.ts
git commit -m "feat: add import API endpoint for bulk task skipping"
```

---

### Task 6: Add Import Button to Cases Page

**Files:**
- Modify: `src/app/(authenticated)/cases/page.tsx`

**Step 1: Add import to the cases page header**

In `src/app/(authenticated)/cases/page.tsx`, add the import for `ImportCaseDialog` at the top alongside `NewCaseDialog`, then place it next to the existing "+ New Case" button.

Add import:
```typescript
import { ImportCaseDialog } from '@/components/cases/import-case-dialog'
```

Change the button area (around line 131) from:
```tsx
<NewCaseDialog />
```
to:
```tsx
<div className="flex items-center gap-2">
  <ImportCaseDialog />
  <NewCaseDialog />
</div>
```

**Step 2: Commit**

```bash
git add src/app/\(authenticated\)/cases/page.tsx
git commit -m "feat: add import existing case button to cases page"
```

---

### Task 7: Backfill Banner Component

**Files:**
- Create: `src/components/dashboard/backfill-banner.tsx`
- Modify: `src/app/(authenticated)/case/[id]/page.tsx`

**Step 1: Create the backfill banner**

Create `src/components/dashboard/backfill-banner.tsx`:

```tsx
'use client'

import { useState, useEffect } from 'react'
import { Info, X } from 'lucide-react'

interface BackfillBannerProps {
  caseId: string
  skippedCount: number
}

export function BackfillBanner({ caseId, skippedCount }: BackfillBannerProps) {
  const [dismissed, setDismissed] = useState(true) // default hidden until hydrated

  useEffect(() => {
    const key = `backfill-banner-dismissed-${caseId}`
    setDismissed(localStorage.getItem(key) === 'true')
  }, [caseId])

  if (dismissed || skippedCount === 0) return null

  function handleDismiss() {
    localStorage.setItem(`backfill-banner-dismissed-${caseId}`, 'true')
    setDismissed(true)
  }

  return (
    <div className="relative rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 mb-4">
      <div className="flex items-start gap-3">
        <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-warm-text">
            Imported case — {skippedCount} earlier {skippedCount === 1 ? 'step was' : 'steps were'} skipped
          </p>
          <p className="text-xs text-warm-muted mt-0.5">
            You can go back and fill in details from earlier steps anytime to get better recommendations and risk scoring.
          </p>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="shrink-0 rounded p-1 hover:bg-primary/10 transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-3.5 w-3.5 text-warm-muted" />
        </button>
      </div>
    </div>
  )
}
```

**Step 2: Add banner to case dashboard**

In `src/app/(authenticated)/case/[id]/page.tsx`:

Add import:
```typescript
import { BackfillBanner } from '@/components/dashboard/backfill-banner'
```

In the data fetching section, add a query to count skipped tasks:
```typescript
const { count: skippedCount } = await supabase
  .from('tasks')
  .select('*', { count: 'exact', head: true })
  .eq('case_id', id)
  .eq('status', 'skipped')
```

Place the banner right after `<ProSeBanner />` (around line 229):
```tsx
<ProSeBanner />
<BackfillBanner caseId={id} skippedCount={skippedCount ?? 0} />
```

**Step 3: Commit**

```bash
git add src/components/dashboard/backfill-banner.tsx src/app/\(authenticated\)/case/\[id\]/page.tsx
git commit -m "feat: add backfill banner for imported cases"
```

---

### Task 8: Build Verification & Manual Testing

**Step 1: Run build**

```bash
cd "/Users/minwang/lawyer free" && npx next build 2>&1 | tail -20
```

Expected: Build succeeds with no errors.

**Step 2: Run all unit tests**

```bash
cd "/Users/minwang/lawyer free" && npx vitest run tests/unit/
```

Expected: All tests pass.

**Step 3: Manual test checklist**

1. Navigate to `/cases` — verify "Import Existing Case" button appears next to "+ New Case"
2. Click "Import Existing Case" — verify wizard opens with "Import an existing case" title
3. Select state → role → dispute type (Personal Injury → Auto Accident)
4. Verify milestone timeline appears with PI-specific milestones
5. Select "Sending demand letter" milestone — verify "You are here" badge and prior milestones greyed
6. Fill in optional catch-up details → continue
7. Verify court recommendation step works → create case
8. Verify redirect to case dashboard
9. Verify backfill banner appears with correct skipped count
10. Verify the next step card shows the correct milestone task (not "welcome")
11. Dismiss the banner → refresh → verify it stays dismissed
12. Test with "start" milestone — verify no tasks skipped, no backfill banner

**Step 4: Commit all (if any fixes needed)**

```bash
git add -A
git commit -m "fix: address build/test issues from import case feature"
```

---

## Summary

| Task | Description | New Files | Modified Files |
|------|-------------|-----------|----------------|
| 1 | Milestone definitions + tests | `milestones.ts`, `milestones.test.ts` | — |
| 2 | Milestone timeline UI component | `milestone-step.tsx` | — |
| 3 | Catch-up form component | `catch-up-step.tsx` | — |
| 4 | Import case dialog wizard | `import-case-dialog.tsx` | — |
| 5 | Import API endpoint + tests | `import/route.ts`, `import-api.test.ts` | — |
| 6 | Add button to cases page | — | `cases/page.tsx` |
| 7 | Backfill banner | `backfill-banner.tsx` | `case/[id]/page.tsx` |
| 8 | Build verification + manual testing | — | — |
