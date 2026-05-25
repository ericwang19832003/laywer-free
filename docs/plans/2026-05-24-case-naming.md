# Case Naming Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Let users name their case during creation — pre-filled with a smart auto-generated name, editable before the case is saved.

**Architecture:** Add a case name input to `RecommendationStep` (the final step in every creation path). The auto-name is generated in `new-case-dialog.tsx` from the dispute/sub-type and current month/year, passed as a prop, and sent as `description` in the POST body. The API route stores it via a one-line Supabase `.update()` after the atomic RPC creates the case.

**Tech Stack:** React (useState/useReducer), Zod schema validation, Supabase JS client, Next.js API route

---

### Task 1: Add `description` to `createCaseSchema`

**Files:**
- Modify: `packages/shared/src/schemas/case.ts` (line 172–188)

**Step 1: Add the field**

In `createCaseSchema`, add after line 187 (`other_sub_type` line):

```typescript
description: z.string().max(80).optional(),
```

So the schema ends:
```typescript
  other_sub_type: z.enum(OTHER_SUB_TYPES).optional(),
  re_sub_type: z.enum(REAL_ESTATE_SUB_TYPES).optional(),
  business_sub_type: z.enum(BUSINESS_SUB_TYPES).optional(),
  description: z.string().max(80).optional(),
})
```

**Step 2: Verify TypeScript compiles**

Run from repo root:
```bash
cd apps/web && npx tsc --noEmit 2>&1 | head -30
```
Expected: no errors about `createCaseSchema` or `CreateCaseInput`.

**Step 3: Commit**

```bash
git add packages/shared/src/schemas/case.ts
git commit -m "feat: add description field to createCaseSchema"
```

---

### Task 2: Add case name input to `RecommendationStep`

**Files:**
- Modify: `apps/web/src/components/cases/wizard/recommendation-step.tsx`

**Step 1: Extend the props interface (line 60–67)**

Replace:
```typescript
interface RecommendationStepProps {
  recommendation: CourtRecommendation
  selectedState?: State
  county: string
  onCountyChange: (county: string) => void
  onAccept: (courtOverride: string | null) => void
  loading: boolean
}
```

With:
```typescript
interface RecommendationStepProps {
  recommendation: CourtRecommendation
  selectedState?: State
  county: string
  onCountyChange: (county: string) => void
  caseName: string
  onCaseNameChange: (name: string) => void
  onAccept: (courtOverride: string | null) => void
  loading: boolean
}
```

**Step 2: Destructure new props (line 69–76)**

Replace:
```typescript
export function RecommendationStep({
  recommendation,
  selectedState = 'TX',
  county,
  onCountyChange,
  onAccept,
  loading,
}: RecommendationStepProps) {
```

With:
```typescript
export function RecommendationStep({
  recommendation,
  selectedState = 'TX',
  county,
  onCountyChange,
  caseName,
  onCaseNameChange,
  onAccept,
  loading,
}: RecommendationStepProps) {
```

**Step 3: Add `X` icon import**

At the top of the file, change:
```typescript
import { ChevronRight, Scale, HelpCircle } from 'lucide-react'
```
To:
```typescript
import { ChevronRight, Scale, HelpCircle, X } from 'lucide-react'
```

**Step 4: Add the case name input block**

In the JSX, add this block directly before the county `<div className="space-y-2">` block (before line 144):

```tsx
      <div className="space-y-2">
        <Label htmlFor="case-name">Name your case</Label>
        <div className="relative">
          <Input
            id="case-name"
            value={caseName}
            onChange={(e) => onCaseNameChange(e.target.value.slice(0, 80))}
            placeholder="e.g. Auto Accident — May 2026"
            className="pr-8"
            ref={(el) => { if (el) { el.focus(); el.select() } }}
          />
          {caseName && (
            <button
              type="button"
              onClick={() => onCaseNameChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-warm-muted hover:text-warm-text transition-colors"
              aria-label="Clear name"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <p className="text-xs text-warm-muted">Max 80 characters · {80 - caseName.length} left</p>
      </div>
```

**Step 5: Disable "Get Started" when name is empty**

In the main button (line ~213):
```tsx
          <Button
            type="button"
            className="w-full"
            onClick={() => onAccept(null)}
            disabled={loading || !caseName.trim()}
          >
```

And in the override button (line ~270):
```tsx
          <Button
            type="button"
            className="w-full"
            onClick={() => onAccept(override || null)}
            disabled={loading || !override || !caseName.trim()}
          >
```

**Step 6: Verify TypeScript compiles**

```bash
cd apps/web && npx tsc --noEmit 2>&1 | head -30
```

**Step 7: Commit**

```bash
git add apps/web/src/components/cases/wizard/recommendation-step.tsx
git commit -m "feat: add case name input to RecommendationStep"
```

---

### Task 3: Wire case name state and auto-name generator into `new-case-dialog.tsx`

**Files:**
- Modify: `apps/web/src/components/cases/new-case-dialog.tsx`

**Step 1: Add a sub-type label lookup table and auto-name generator**

After the `getTotalSteps` function (around line 65), add:

```typescript
const DISPUTE_TYPE_LABELS: Record<string, string> = {
  personal_injury: 'Personal Injury',
  small_claims: 'Small Claims',
  landlord_tenant: 'Landlord/Tenant',
  debt_collection: 'Debt Collection',
  family: 'Family Law',
  business: 'Business Dispute',
  contract: 'Contract Dispute',
  property: 'Property Dispute',
  real_estate: 'Real Estate',
  other: 'Legal Matter',
}

const SUB_TYPE_LABELS: Record<string, string> = {
  // Personal injury
  auto_accident: 'Auto Accident',
  slip_and_fall: 'Slip & Fall',
  medical_malpractice: 'Medical Malpractice',
  dog_bite: 'Dog Bite',
  workplace_injury: 'Workplace Injury',
  wrongful_death: 'Wrongful Death',
  product_liability: 'Product Liability',
  assault: 'Assault',
  // Small claims
  property_damage: 'Property Damage',
  unpaid_debt: 'Unpaid Debt',
  security_deposit: 'Security Deposit',
  bad_check: 'Bad Check',
  consumer_complaint: 'Consumer Complaint',
  // Landlord/tenant
  eviction: 'Eviction',
  habitability: 'Habitability',
  lease_dispute: 'Lease Dispute',
  // Debt collection
  credit_card: 'Credit Card Debt',
  medical_debt: 'Medical Debt',
  student_loan: 'Student Loan',
  mortgage: 'Mortgage',
  auto_loan: 'Auto Loan',
  personal_loan: 'Personal Loan',
  // Family
  divorce: 'Divorce',
  child_custody: 'Child Custody',
  child_support: 'Child Support',
  alimony: 'Alimony',
  adoption: 'Adoption',
  // Business
  breach_of_contract: 'Breach of Contract',
  partnership_dispute: 'Partnership Dispute',
  employment: 'Employment Dispute',
  intellectual_property: 'IP Dispute',
  // Other
  general: 'Legal Matter',
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function generateCaseName(disputeType: string, subType: string): string {
  const now = new Date()
  const monthYear = `${MONTHS[now.getMonth()]} ${now.getFullYear()}`
  const label = (subType && SUB_TYPE_LABELS[subType]) || DISPUTE_TYPE_LABELS[disputeType] || 'My Case'
  return `${label} — ${monthYear}`
}
```

**Step 2: Add `caseName` state variable**

After line 217 (`const [loading, setLoading] = useState(false)`), add:

```typescript
const [caseName, setCaseName] = useState('')
```

**Step 3: Auto-generate the name when dispute sub-type is set**

The `caseName` needs to be initialized/refreshed whenever the relevant sub-type or dispute type changes. Add a `useEffect` after the `caseName` state declaration:

```typescript
useEffect(() => {
  if (state.disputeType) {
    const subType =
      state.piSubType ||
      state.familySubType ||
      state.businessSubType ||
      state.smallClaimsSubType ||
      state.landlordTenantSubType ||
      state.debtSubType ||
      ''
    setCaseName(generateCaseName(state.disputeType, subType))
  }
}, [
  state.disputeType,
  state.piSubType,
  state.familySubType,
  state.businessSubType,
  state.smallClaimsSubType,
  state.landlordTenantSubType,
  state.debtSubType,
])
```

**Step 4: Reset `caseName` when dialog closes**

In `handleOpenChange`, after `dispatch({ type: 'RESET' })`, add:
```typescript
setCaseName('')
```

**Step 5: Update `handleAccept` signature and POST body**

Change the function signature from:
```typescript
async function handleAccept(courtOverride: string | null) {
```
To stay the same — the `caseName` is already in scope via state.

In the `body: JSON.stringify({...})` block, add `description` to the payload. After the last sub-type spread (`...(isPersonalInjury && state.piSubType ? { pi_sub_type: state.piSubType } : {}),`), add:

```typescript
          ...(caseName.trim() ? { description: caseName.trim() } : {}),
```

**Step 6: Pass `caseName` and `onCaseNameChange` to all `RecommendationStep` instances**

Find every `<RecommendationStep` in the file and add the two new props. There are multiple instances (one per dispute-type branch). Add to each:

```tsx
  caseName={caseName}
  onCaseNameChange={setCaseName}
```

**Step 7: Verify TypeScript compiles**

```bash
cd apps/web && npx tsc --noEmit 2>&1 | head -30
```
Expected: no errors.

**Step 8: Commit**

```bash
git add apps/web/src/components/cases/new-case-dialog.tsx
git commit -m "feat: wire case name state and auto-name generator in NewCaseDialog"
```

---

### Task 4: Persist `description` in the API route

**Files:**
- Modify: `apps/web/src/app/api/cases/route.ts`

**Step 1: Extract `description` from parsed data (line 37–43)**

Change:
```typescript
    const {
      role, county, court_type, dispute_type, state,
      family_sub_type, small_claims_sub_type, landlord_tenant_sub_type,
      debt_sub_type, pi_sub_type, business_sub_type, contract_sub_type,
      property_sub_type, other_sub_type, re_sub_type,
    } = parsed.data
```

To:
```typescript
    const {
      role, county, court_type, dispute_type, state,
      family_sub_type, small_claims_sub_type, landlord_tenant_sub_type,
      debt_sub_type, pi_sub_type, business_sub_type, contract_sub_type,
      property_sub_type, other_sub_type, re_sub_type, description,
    } = parsed.data
```

**Step 2: Update description after RPC creation**

After the existing case fetch block (after line 83, before the tasks fetch), add:

```typescript
    // Persist the user-provided case name
    if (description && newCase) {
      await supabase
        .from('cases')
        .update({ description })
        .eq('id', caseId)
      newCase.description = description
    }
```

**Step 3: Verify TypeScript compiles**

```bash
cd apps/web && npx tsc --noEmit 2>&1 | head -30
```

**Step 4: Commit**

```bash
git add apps/web/src/app/api/cases/route.ts
git commit -m "feat: persist description on case creation"
```

---

### Task 5: Manual smoke test

**Step 1: Start dev server**

```bash
cd apps/web && npm run dev
```

**Step 2: Create a new case**

1. Open http://localhost:3000
2. Click "New Case"
3. Complete wizard: select state → role → dispute type (e.g. Personal Injury → Auto Accident)
4. On the final Recommendation step, verify:
   - Name input shows `Auto Accident — May 2026` pre-filled
   - Text is selected on mount (typing replaces it)
   - ✕ button clears the field
   - "Get Started" is disabled when field is empty
   - Character counter shows remaining chars
5. Accept the default name → click "Get Started"
6. Verify the dashboard shows the case name (not "Untitled Case")

**Step 3: Test edge cases**

- Clear the name field → "Get Started" should be disabled
- Type 81 characters → input should cap at 80
- Close dialog mid-way → reopen → name field should be empty (reset)

**Step 4: Commit any fixes found during testing**

```bash
git add -p
git commit -m "fix: address smoke test findings for case naming"
```

---

### Task 6: Deploy

**Step 1: Push to GitHub**

```bash
git push origin HEAD
```

**Step 2: Deploy to Vercel**

```bash
vercel deploy --prod
```

**Step 3: Verify on production**

Create a case on production and confirm the name is saved and displayed on the dashboard.
