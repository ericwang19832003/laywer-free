# Filing Method Step Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a shared "How to File" wizard step to all 9 petition wizards with filing method selection (online vs in-person), eFileTexas deep-links, and petition PDF download guidance.

**Architecture:** A shared `FilingMethodStep` component renders two filing method cards (online/in-person) with expandable step-by-step guidance. A `FILING_CONFIGS` data file maps dispute types to eFileTexas Guide-and-File `legalProcessKey` values and case categories. Each of the 9 wizards adds one step definition, one state variable, one validation case, and one render case — all delegating to the shared component.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS, Lucide icons, existing WizardShell pattern

---

### Task 1: Create Filing Configs Data

**Files:**
- Create: `src/lib/filing-configs.ts`

**Step 1: Create the config file**

```typescript
// src/lib/filing-configs.ts

export interface FilingConfig {
  /** Guide-and-File legalProcessKey for deep-linking, null if not supported */
  legalProcessKey: string | null
  /** eFileTexas case category */
  caseCategory: string
  /** Label for the petition document */
  documentLabel: string
}

/**
 * Maps dispute types (and sub-types where needed) to eFileTexas filing config.
 * Guide-and-File deep-link: https://selfhelp.efiletexas.gov/SRL/SRL/Start?legalProcessKey=<KEY>
 * Fallback: https://www.efiletexas.gov
 */
export const FILING_CONFIGS: Record<string, FilingConfig> = {
  // Personal Injury (all sub-types)
  personal_injury: { legalProcessKey: null, caseCategory: 'Civil', documentLabel: 'petition' },

  // Contract
  contract: { legalProcessKey: null, caseCategory: 'Civil', documentLabel: 'petition' },

  // Property Dispute
  property: { legalProcessKey: null, caseCategory: 'Civil', documentLabel: 'petition' },

  // Family Law sub-types
  divorce: { legalProcessKey: 'divorce', caseCategory: 'Family', documentLabel: 'petition' },
  custody: { legalProcessKey: 'custody', caseCategory: 'Family', documentLabel: 'petition' },
  child_support: { legalProcessKey: null, caseCategory: 'Family', documentLabel: 'petition' },
  visitation: { legalProcessKey: null, caseCategory: 'Family', documentLabel: 'petition' },
  spousal_support: { legalProcessKey: null, caseCategory: 'Family', documentLabel: 'petition' },
  protective_order: { legalProcessKey: 'protective_order', caseCategory: 'Family', documentLabel: 'application' },
  modification: { legalProcessKey: null, caseCategory: 'Family', documentLabel: 'petition' },

  // Small Claims
  small_claims: { legalProcessKey: 'small_claims', caseCategory: 'Civil', documentLabel: 'petition' },

  // Landlord-Tenant
  eviction: { legalProcessKey: 'eviction', caseCategory: 'Civil', documentLabel: 'petition' },
  landlord_tenant: { legalProcessKey: null, caseCategory: 'Civil', documentLabel: 'petition' },

  // Debt Defense
  debt_defense: { legalProcessKey: null, caseCategory: 'Civil', documentLabel: 'answer' },

  // Real Estate
  real_estate: { legalProcessKey: null, caseCategory: 'Civil', documentLabel: 'petition' },

  // Business
  partnership: { legalProcessKey: null, caseCategory: 'Civil', documentLabel: 'petition' },
  employment: { legalProcessKey: null, caseCategory: 'Civil', documentLabel: 'petition' },
  b2b_commercial: { legalProcessKey: null, caseCategory: 'Civil', documentLabel: 'petition' },

  // Other
  other: { legalProcessKey: null, caseCategory: 'Civil', documentLabel: 'petition' },

  // Generic fallback
  civil: { legalProcessKey: null, caseCategory: 'Civil', documentLabel: 'petition' },
}

/** Build the eFileTexas deep-link URL */
export function getEFileTexasUrl(config: FilingConfig): string {
  if (config.legalProcessKey) {
    return `https://selfhelp.efiletexas.gov/SRL/SRL/Start?legalProcessKey=${config.legalProcessKey}`
  }
  return 'https://www.efiletexas.gov'
}

/** Get filing fee range from state-filing-info for a given court type */
export function getFeeRange(courtType: string): string {
  switch (courtType) {
    case 'jp': return '$75 – $200'
    case 'county': return '$250 – $350'
    case 'district': return '$250 – $400'
    case 'federal': return '$405'
    default: return 'varies by court'
  }
}
```

**Step 2: Verify it compiles**

Run: `cd "/Users/minwang/lawyer free" && npx tsc --noEmit src/lib/filing-configs.ts 2>&1 | head -5`
Expected: No errors

**Step 3: Commit**

```bash
git add src/lib/filing-configs.ts
git commit -m "feat: add filing configs for eFileTexas deep-linking"
```

---

### Task 2: Create FilingMethodStep Shared Component

**Files:**
- Create: `src/components/step/filing-method-step.tsx`

**Step 1: Create the component**

```typescript
// src/components/step/filing-method-step.tsx
'use client'

import { Globe, Building2, Download, ExternalLink, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { type FilingConfig, getEFileTexasUrl, getFeeRange } from '@/lib/filing-configs'

interface FilingMethodStepProps {
  filingMethod: 'online' | 'in_person' | ''
  onFilingMethodChange: (method: 'online' | 'in_person') => void
  county: string
  courtType: string
  config: FilingConfig
}

export function FilingMethodStep({
  filingMethod,
  onFilingMethodChange,
  county,
  courtType,
  config,
}: FilingMethodStepProps) {
  const feeRange = getFeeRange(courtType)
  const eFileUrl = getEFileTexasUrl(config)
  const isJP = courtType === 'jp'

  return (
    <div className="space-y-6">
      <p className="text-sm text-warm-muted">
        Your {config.documentLabel} is ready. Choose how you want to file it with the court.
      </p>

      {/* Filing Method Cards */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onFilingMethodChange('online')}
          className={cn(
            'flex flex-col items-center gap-2 rounded-xl border-2 p-5 transition-all text-left',
            filingMethod === 'online'
              ? 'border-calm-indigo bg-calm-indigo/5 ring-1 ring-calm-indigo/20'
              : 'border-warm-border hover:border-calm-indigo/40'
          )}
        >
          <Globe className="h-7 w-7 text-calm-indigo" />
          <span className="font-semibold text-warm-text text-sm">File Online</span>
          <span className="text-xs text-warm-muted text-center">(e-filing)</span>
        </button>

        <button
          type="button"
          onClick={() => onFilingMethodChange('in_person')}
          className={cn(
            'flex flex-col items-center gap-2 rounded-xl border-2 p-5 transition-all text-left',
            filingMethod === 'in_person'
              ? 'border-calm-indigo bg-calm-indigo/5 ring-1 ring-calm-indigo/20'
              : 'border-warm-border hover:border-calm-indigo/40'
          )}
        >
          <Building2 className="h-7 w-7 text-calm-indigo" />
          <span className="font-semibold text-warm-text text-sm">File In Person</span>
          <span className="text-xs text-warm-muted text-center">at courthouse</span>
        </button>
      </div>

      {/* JP Court Caveat */}
      {isJP && filingMethod === 'online' && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <Info className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-800">
            Some Justice of the Peace courts don&apos;t accept e-filing yet. Check with your local court before filing online.
          </p>
        </div>
      )}

      {/* Online Filing Guidance */}
      {filingMethod === 'online' && (
        <div className="space-y-4 rounded-lg border border-warm-border bg-warm-bg/50 p-4">
          <h4 className="font-semibold text-warm-text text-sm">Step-by-step e-filing guide</h4>
          <ol className="space-y-3 text-sm text-warm-muted">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-calm-indigo/10 text-xs font-semibold text-calm-indigo">1</span>
              <span>Go to <strong>eFileTexas.gov</strong> and create a free account</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-calm-indigo/10 text-xs font-semibold text-calm-indigo">2</span>
              <span>Select your court: <strong>{county || 'your county'}</strong> — <strong>{courtType === 'jp' ? 'Justice of the Peace' : courtType === 'county' ? 'County Court' : courtType === 'district' ? 'District Court' : courtType}</strong></span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-calm-indigo/10 text-xs font-semibold text-calm-indigo">3</span>
              <span>Select case category &quot;<strong>{config.caseCategory}</strong>&quot;</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-calm-indigo/10 text-xs font-semibold text-calm-indigo">4</span>
              <span>Upload your {config.documentLabel} PDF (download it from your case dashboard after completing this wizard)</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-calm-indigo/10 text-xs font-semibold text-calm-indigo">5</span>
              <span>Pay filing fee online (<strong>{feeRange}</strong>)</span>
            </li>
          </ol>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="flex-1"
            >
              <a href={eFileUrl} target="_blank" rel="noopener noreferrer">
                Open eFileTexas
                <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
              </a>
            </Button>
          </div>
        </div>
      )}

      {/* In-Person Filing Guidance */}
      {filingMethod === 'in_person' && (
        <div className="space-y-4 rounded-lg border border-warm-border bg-warm-bg/50 p-4">
          <h4 className="font-semibold text-warm-text text-sm">What to bring to the courthouse</h4>
          <ol className="space-y-3 text-sm text-warm-muted">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-calm-indigo/10 text-xs font-semibold text-calm-indigo">1</span>
              <span>Print your {config.documentLabel} — bring the <strong>original plus 2 copies</strong></span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-calm-indigo/10 text-xs font-semibold text-calm-indigo">2</span>
              <span>Bring a <strong>valid photo ID</strong></span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-calm-indigo/10 text-xs font-semibold text-calm-indigo">3</span>
              <span>Bring filing fee payment (<strong>{feeRange}</strong>) — cash, check, or money order</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-calm-indigo/10 text-xs font-semibold text-calm-indigo">4</span>
              <span>Go to <strong>{county || 'your county'} County Courthouse</strong> clerk&apos;s office</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-calm-indigo/10 text-xs font-semibold text-calm-indigo">5</span>
              <span>File at the clerk&apos;s window — they&apos;ll stamp your copies and assign a cause number</span>
            </li>
          </ol>

          <div className="flex gap-2 pt-2">
            {county && (
              <Button
                variant="outline"
                size="sm"
                asChild
                className="flex-1"
              >
                <a
                  href={`https://www.google.com/maps/search/${encodeURIComponent(`${county} County Courthouse Texas`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Find Courthouse
                  <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
                </a>
              </Button>
            )}
          </div>

          <p className="text-xs text-warm-muted">
            Tip: Check courthouse hours before going. Most courts close at 4:30 PM and may require appointments.
          </p>
        </div>
      )}
    </div>
  )
}
```

**Step 2: Verify it compiles**

Run: `cd "/Users/minwang/lawyer free" && npx next build 2>&1 | tail -5`
Expected: Build passes

**Step 3: Commit**

```bash
git add src/components/step/filing-method-step.tsx
git commit -m "feat: add shared FilingMethodStep component"
```

---

### Task 3: Add to Personal Injury Wizard

**Files:**
- Modify: `src/components/step/personal-injury-wizard.tsx`

**Step 1: Add import**

At the top of the file, add after the existing imports:

```typescript
import { FilingMethodStep } from '@/components/step/filing-method-step'
import { FILING_CONFIGS } from '@/lib/filing-configs'
```

**Step 2: Add step definition**

In `getStepsForSubType()` (~line 122), add the step object:

```typescript
const howToFile: WizardStep = { id: 'how_to_file', title: 'How to File', subtitle: 'Choose how to submit your petition.' }
```

Then insert `howToFile` after `venue` and before `review` in ALL return statements. Example for property damage:
```typescript
// Before:
return [...common, damageDetails, damages, insurance, venue, review]
// After:
return [...common, damageDetails, damages, insurance, venue, howToFile, review]
```

Do this for ALL return statements in `getStepsForSubType()`.

**Step 3: Add state variable**

Inside the component function (~line 240 area), add:
```typescript
const [filingMethod, setFilingMethod] = useState<'online' | 'in_person' | ''>(
  (meta.filing_method as 'online' | 'in_person') ?? ''
)
```

**Step 4: Add canAdvance case**

In the `canAdvance` useMemo switch (~line 762), add:
```typescript
case 'how_to_file':
  return filingMethod !== ''
```

Add `filingMethod` to the useMemo dependency array.

**Step 5: Add render case**

In the step rendering switch (find the `case 'venue':` block and add before it, or after it):
```typescript
case 'how_to_file':
  return (
    <FilingMethodStep
      filingMethod={filingMethod}
      onFilingMethodChange={setFilingMethod}
      county={county}
      courtType={courtType}
      config={FILING_CONFIGS.personal_injury}
    />
  )
```

**Step 6: Add to metadata save**

Find the `buildMetadata()` or equivalent function that builds the metadata object, and add:
```typescript
filing_method: filingMethod || null,
```

**Step 7: Verify build**

Run: `cd "/Users/minwang/lawyer free" && npx next build 2>&1 | tail -5`
Expected: Build passes

**Step 8: Commit**

```bash
git add src/components/step/personal-injury-wizard.tsx
git commit -m "feat: add How to File step to PI wizard"
```

---

### Task 4: Add to Contract Wizard

**Files:**
- Modify: `src/components/step/contract/contract-wizard.tsx`

Apply the same pattern as Task 3:

1. **Import** `FilingMethodStep` and `FILING_CONFIGS`
2. **Add step** `{ id: 'how_to_file', title: 'How to File', subtitle: 'Choose how to submit your petition.' }` to `WIZARD_STEPS` array — insert between `review` and `generate`
3. **Add state** `filingMethod` initialized from `meta.filing_method`
4. **Add canAdvance** case `'how_to_file': return filingMethod !== ''`
5. **Add render** case using `<FilingMethodStep config={FILING_CONFIGS.contract} />`
6. **Add to metadata** `filing_method: filingMethod || null`
7. **Build verify**: `npx next build`
8. **Commit**: `git commit -m "feat: add How to File step to contract wizard"`

---

### Task 5: Add to Property Wizard

**Files:**
- Modify: `src/components/step/property/property-wizard.tsx`

Same pattern. Insert `how_to_file` step between `review` and `generate`.
Use `config={FILING_CONFIGS.property}`.
Commit: `"feat: add How to File step to property wizard"`

---

### Task 6: Add to Generic Petition Wizard

**Files:**
- Modify: `src/components/step/petition-wizard.tsx`

Same pattern. This wizard ends with `review` (no `generate` step) — insert `how_to_file` between `venue` and `review`. Note: this wizard receives `caseData.dispute_type` — use it to look up the config:
```typescript
const filingConfig = FILING_CONFIGS[caseData.dispute_type ?? 'civil'] ?? FILING_CONFIGS.civil
```
Commit: `"feat: add How to File step to generic petition wizard"`

---

### Task 7: Add to Family Law Wizard

**Files:**
- Modify: `src/components/step/family-law-wizard.tsx`

Same pattern. In `getStepsForSubType()`, add `howToFile` step between `venue` and the steps after venue (varies by sub-type — just insert it in all return statements after `venue`).

For the config lookup, use the family sub-type:
```typescript
const filingConfig = FILING_CONFIGS[familySubType] ?? FILING_CONFIGS.civil
```
This handles divorce, custody, protective_order, etc. having different `legalProcessKey` values.

Commit: `"feat: add How to File step to family law wizard"`

---

### Task 8: Add to Small Claims Wizard

**Files:**
- Modify: `src/components/step/small-claims-wizard.tsx`

Same pattern. In `getStepsForSubType()`, insert `howToFile` after `venue` in all return statements.
Use `config={FILING_CONFIGS.small_claims}`.
Commit: `"feat: add How to File step to small claims wizard"`

---

### Task 9: Add to Landlord-Tenant Wizard

**Files:**
- Modify: `src/components/step/landlord-tenant-wizard.tsx`

Same pattern. In `getStepsForSubType()`, insert `howToFile` after `venue` in all return statements.

For the config, check sub-type:
```typescript
const filingConfig = ltSubType === 'eviction' || ltSubType === 'nonpayment'
  ? FILING_CONFIGS.eviction
  : FILING_CONFIGS.landlord_tenant
```
Commit: `"feat: add How to File step to landlord-tenant wizard"`

---

### Task 10: Add to Debt Defense Wizard

**Files:**
- Modify: `src/components/step/debt-defense-wizard.tsx`

Same pattern. Insert `how_to_file` step after `venue` in the static `STEPS` array.
Use `config={FILING_CONFIGS.debt_defense}`.
Commit: `"feat: add How to File step to debt defense wizard"`

---

### Task 11: Add to Other Wizard

**Files:**
- Modify: `src/components/step/other/other-wizard.tsx`

Same pattern. Insert `how_to_file` between `review` and `generate`.
Use `config={FILING_CONFIGS.other}`.
Commit: `"feat: add How to File step to other wizard"`

---

### Task 12: Build Verification

**Step 1: Full build**

Run: `cd "/Users/minwang/lawyer free" && npx next build 2>&1 | tail -10`
Expected: Build passes with no errors

**Step 2: Verify all wizards have the step**

Search for `how_to_file` across all wizard files:
```bash
grep -rn "how_to_file" src/components/step/ | grep -v node_modules
```
Expected: 9 wizard files + 1 shared component = matches in 10 files

**Step 3: Commit any remaining fixes**

```bash
git add -A && git commit -m "fix: address build issues from filing method step"
```
