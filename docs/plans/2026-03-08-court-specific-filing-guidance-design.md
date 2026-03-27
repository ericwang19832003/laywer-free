# Court-Specific Petition Filing Guidance — Design

## Problem

When users answer "No" to "Have you already filed a petition?", the current `pi_file_with_court` step provides only generic, Texas-hardcoded guidance (eFileTexas.gov, ~$300/$200 fees, 2-year SOL). Users in other states or different court types get inaccurate instructions.

## Solution

Replace the static `piFileWithCourtConfig` with a **data-driven factory** that generates court-specific, state-specific `GuidedStepConfig` based on the case's `state`, `court_type`, and `county`.

## Architecture

```
cases table (state, court_type, county)
        ↓
step router → fetches case data
        ↓
PIFileWithCourtStep(caseData)
        ↓
createPiFileWithCourtConfig(state, courtType, county)
        ↓
GuidedStepConfig (dynamic questions + info)
        ↓
<GuidedStep config={...} />
```

## Data Model

### StateFilingInfo

```typescript
interface StateFilingInfo {
  name: string              // "Texas"
  abbreviation: string      // "TX"
  sol: {
    personalInjury: string  // "2 years"
    propertyDamage: string  // "2 years"
  }
  eFilingSystem?: {
    name: string
    url: string
    mandatory: boolean
  }
  filingMethods: string[]   // ["e-file", "in-person", "mail"]
  feeWaiverForm: string     // Name of fee waiver form
  feeWaiverRule?: string    // Statutory cite
  courtSelectionGuide: string
  courts: Record<string, CourtFilingInfo>
}

interface CourtFilingInfo {
  label: string             // "District Court"
  feeRange: string          // "$300 – $400"
  filingSteps: string[]     // Step-by-step instructions
  eFilingUrl?: string       // Court-specific portal
  specialRequirements?: string
}
```

### Coverage

- **Tier 1 (detailed):** TX, CA, NY, FL, PA — specific e-filing portals, fee amounts, form names, step-by-step
- **Tier 2 (all other states):** Accurate SOL, generic court structure, generic filing methods, "contact your clerk" fallback

## Question Flow

1. Court selection — "Do you know which court to file in?" + state-specific guidance
2. Filing method — e-file portal info or in-person instructions
3. Filing fee — court-type-specific fee + fee waiver process
4. Documents checklist — petition, summons, civil cover sheet (varies by court)
5. SOL reminder — state-specific years

## Files

| Action | File |
|--------|------|
| Create | `src/lib/guided-steps/personal-injury/state-filing-info.ts` |
| Create | `src/lib/guided-steps/personal-injury/pi-file-with-court-factory.ts` |
| Modify | `src/components/step/personal-injury/pi-file-with-court-step.tsx` |
| Modify | `src/app/(authenticated)/case/[id]/step/[taskId]/page.tsx` (line ~774) |

## Decisions

- Reuse GuidedStep component — no new UI
- Config factory pattern — data-driven, easy to add states
- All 50 states covered via Tier 2 generic fallback
- Property damage variant gets same treatment (if separate step exists)
