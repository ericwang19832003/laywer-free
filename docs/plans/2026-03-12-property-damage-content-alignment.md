# Property Damage Content Alignment — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Ensure that when a user selects a property damage sub-type (vehicle_damage, property_damage_negligence, vandalism, other_property_damage), every page shows contextually appropriate content — no "personal injury" language, no "medical records" prompts, no "injuries" steps.

**Architecture:** Pure UI/content changes across 3 files. No schema, API, or database changes. The system already stores and passes `pi_sub_type` correctly — the issue is that several UI components don't branch on it.

**Tech Stack:** Next.js 16, React, TypeScript, Tailwind CSS 4

---

### Task 1: PersonalInjuryWizard — Sub-Type Labels & Preflight

**Files:**
- Modify: `src/components/step/personal-injury-wizard.tsx`

**Step 1: Add property damage sub-types to `getSubTypeLabel()` (lines 73-85)**

Add cases for the 4 property damage sub-types before the `default` case:

```typescript
function getSubTypeLabel(subType: string): string {
  switch (subType) {
    case 'auto_accident': return 'Auto Accident'
    case 'pedestrian_cyclist': return 'Pedestrian/Cyclist'
    case 'rideshare': return 'Rideshare Accident'
    case 'uninsured_motorist': return 'Uninsured/Underinsured Motorist'
    case 'slip_and_fall': return 'Slip and Fall'
    case 'dog_bite': return 'Dog Bite'
    case 'product_liability': return 'Product Liability'
    case 'vehicle_damage': return 'Vehicle Damage'
    case 'property_damage_negligence': return 'Property Damage'
    case 'vandalism': return 'Vandalism'
    case 'other_property_damage': return 'Property Damage'
    case 'other': return 'Other Personal Injury'
    default: return 'Personal Injury'
  }
}
```

**Step 2: Add property damage tips to `getPreflightTip()` (lines 87-103)**

Add cases for property damage sub-types:

```typescript
case 'vehicle_damage':
  return 'For vehicle damage cases, get at least three repair estimates and document the damage with timestamped photos from multiple angles.'
case 'property_damage_negligence':
  return 'For property damage cases, document the damage thoroughly with photos, get professional repair estimates, and preserve any evidence of what caused the damage.'
case 'vandalism':
  return 'For vandalism cases, file a police report if you have not already. Preserve any surveillance footage and document the damage with photos before making repairs.'
case 'other_property_damage':
  return 'Document all property damage with photos and written descriptions. Get professional repair estimates and keep all receipts.'
```

**Step 3: Update `getDocumentTitle()` (line 138)**

Import `isPropertyDamageSubType` from constants and change:

```typescript
import { isPropertyDamageSubType } from '@/lib/guided-steps/personal-injury/constants'

function getDocumentTitle(subType: string): string {
  const docType = isPropertyDamageSubType(subType) ? 'Property Damage Petition' : 'Personal Injury Petition'
  return `${docType} - ${getSubTypeLabel(subType)}`
}
```

**Step 4: Update `getDraftTitle()` (line 142)**

```typescript
function getDraftTitle(subType: string): string {
  return `Your ${getSubTypeLabel(subType)} Petition Draft`
}
```

(This already works correctly since it uses `getSubTypeLabel` — once Step 1 is done, this will return proper labels.)

**Step 5: Update preflight checklist items (lines 743-756)**

Make the checklist items dynamic based on `isPropertyDamageSubType(piSubType)`. Add `isPropertyDamage` const at component level (near line 218, after `piSubType`):

```typescript
const isPropertyDamage = isPropertyDamageSubType(piSubType)
```

Then replace the hardcoded checklist in the `preflight` case:

```tsx
{(isPropertyDamage
  ? [
      { icon: Camera, label: 'Photos of the damage (multiple angles)' },
      { icon: FileText, label: 'Repair estimates or invoices' },
      { icon: Shield, label: 'Police report (if filed)' },
      { icon: Shield, label: 'Insurance information (yours and theirs)' },
      { icon: Receipt, label: 'Receipts for damaged property or repairs' },
    ]
  : [
      { icon: Camera, label: 'Photos of injuries and scene' },
      { icon: FileText, label: 'Medical records and bills' },
      { icon: Shield, label: 'Police report (if filed)' },
      { icon: Shield, label: 'Insurance information (yours and theirs)' },
      { icon: Receipt, label: 'Bills and receipts for expenses' },
    ]
).map(({ icon: Icon, label }) => (
```

**Step 6: Build and verify**

Run: `cd "/Users/minwang/lawyer free" && npx next build 2>&1 | tail -5`
Expected: Build succeeds

---

### Task 2: PersonalInjuryWizard — Property Damage Step Flow

**Files:**
- Modify: `src/components/step/personal-injury-wizard.tsx`

Property damage cases should NOT show "Your Injuries" or "Medical Treatment" steps. Instead, they need a "Damage Details" step and a property-focused "Damages" step.

**Step 1: Add `PROPERTY_DAMAGE_TYPES` constant (near line 71)**

```typescript
const PROPERTY_DAMAGE_TYPES = ['vehicle_damage', 'property_damage_negligence', 'vandalism', 'other_property_damage']
```

**Step 2: Update `getStepsForSubType()` (lines 109-135)**

Add property damage branch. Property damage cases skip `injuries` and `medical`, replacing them with `damage_details`:

```typescript
function getStepsForSubType(subType: string): WizardStep[] {
  const preflight: WizardStep = { id: 'preflight', title: 'Before You Start', subtitle: "Let's make sure you have what you need." }
  const incident: WizardStep = { id: 'incident', title: 'What Happened', subtitle: 'Tell us about the incident.' }
  const otherDriver: WizardStep = { id: 'other_driver', title: 'Other Driver Info', subtitle: 'Information about the other driver.' }
  const premises: WizardStep = { id: 'premises', title: 'Property/Location Info', subtitle: 'Details about where it happened.' }
  const product: WizardStep = { id: 'product', title: 'Product Information', subtitle: 'Details about the defective product.' }
  const injuries: WizardStep = { id: 'injuries', title: 'Your Injuries', subtitle: 'Describe your injuries.' }
  const medical: WizardStep = { id: 'medical', title: 'Medical Treatment', subtitle: 'Your medical providers and costs.' }
  const damageDetails: WizardStep = { id: 'damage_details', title: 'Damage Details', subtitle: 'Describe the property damage.' }
  const damages: WizardStep = { id: 'damages', title: 'Your Damages', subtitle: 'Calculate your total damages.' }
  const insurance: WizardStep = { id: 'insurance', title: 'Insurance Information', subtitle: 'Your insurance details.' }
  const venue: WizardStep = { id: 'venue', title: 'Where to File', subtitle: "We'll help you pick the right court." }
  const review: WizardStep = { id: 'review', title: 'Review Everything', subtitle: 'Check your information before generating.' }

  const common = [preflight, incident]

  // Property damage cases: no injuries/medical steps
  if (PROPERTY_DAMAGE_TYPES.includes(subType)) {
    if (subType === 'vehicle_damage') {
      return [...common, otherDriver, damageDetails, damages, insurance, venue, review]
    }
    return [...common, damageDetails, damages, insurance, venue, review]
  }

  const tail = [injuries, medical, damages, insurance, venue, review]

  if (MOTOR_VEHICLE_TYPES.includes(subType)) {
    return [...common, otherDriver, ...tail]
  }
  if (subType === 'slip_and_fall') {
    return [...common, premises, ...tail]
  }
  if (subType === 'product_liability') {
    return [...common, product, ...tail]
  }
  return [...common, ...tail]
}
```

**Step 3: Add `damage_details` step content in `renderStepContent`**

After the `product` case block (around line 983), add the `damage_details` case:

```tsx
/* ============================================================ */
/*  DAMAGE DETAILS (property damage sub-types)                   */
/* ============================================================ */
case 'damage_details':
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="damage-description">Describe the Damage</Label>
        <Textarea
          id="damage-description"
          placeholder="Describe all property damage in detail (e.g. front bumper crushed, hood dented, fence destroyed, water damage to living room)"
          value={propertyDamageDescription}
          onChange={(e) => setPropertyDamageDescription(e.target.value)}
          rows={4}
        />
        <p className="text-xs text-warm-muted">Be as specific as possible about what was damaged and how.</p>
      </div>

      <div className="space-y-2">
        <Label>Damage Severity</Label>
        <div className="flex gap-2">
          {(['minor', 'moderate', 'severe', 'total_loss'] as const).map((s) => (
            <Button
              key={s}
              type="button"
              variant={damageSeverity === s ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDamageSeverity(s)}
            >
              {s === 'total_loss' ? 'Total Loss' : s.charAt(0).toUpperCase() + s.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="repair-estimate">Repair/Replacement Estimate ($)</Label>
        <Input
          id="repair-estimate"
          type="number"
          min="0"
          step="0.01"
          placeholder="0.00"
          value={repairEstimate}
          onChange={(e) => setRepairEstimate(e.target.value)}
        />
        <p className="text-xs text-warm-muted">
          Professional estimate from a contractor, mechanic, or appraiser.
        </p>
      </div>

      <div className="flex items-center gap-2 pt-2">
        <Checkbox
          id="has-repair-receipts"
          checked={hasRepairReceipts}
          onCheckedChange={(c) => setHasRepairReceipts(c === true)}
        />
        <Label htmlFor="has-repair-receipts" className="text-sm cursor-pointer">
          I have repair estimates or receipts to upload
        </Label>
      </div>
    </div>
  )
```

**Step 4: Add state variables for damage details**

Add these state variables in the component (after the existing damages state, around line 310):

```typescript
/* ---- Property damage details (property damage sub-types) ---- */
const [propertyDamageDescription, setPropertyDamageDescription] = useState<string>(
  (meta.property_damage_description as string) ?? ''
)
const [damageSeverity, setDamageSeverity] = useState<string>(
  (meta.damage_severity as string) ?? ''
)
const [repairEstimate, setRepairEstimate] = useState<string>(
  (meta.repair_estimate as string) ?? ''
)
const [hasRepairReceipts, setHasRepairReceipts] = useState<boolean>(
  (meta.has_repair_receipts as boolean) ?? false
)
```

**Step 5: Update `canAdvance` validation for new step**

Add a `damage_details` case in the `canAdvance` useMemo:

```typescript
case 'damage_details':
  return propertyDamageDescription.trim().length >= 10
```

**Step 6: Update the damages step for property damage cases**

In the `damages` case (line 1161), wrap the injury-specific fields conditionally. For property damage, don't show Medical Expenses (read-only) or Pain & Suffering multiplier. Instead, show the repair estimate as the primary cost:

Replace the entire `damages` case content with conditional rendering:

```tsx
case 'damages':
  return (
    <div className="space-y-4">
      {isPropertyDamage ? (
        <>
          {/* Repair/replacement cost (from damage details) */}
          <div className="space-y-2">
            <Label>Repair/Replacement Cost</Label>
            <div className="rounded-lg border border-warm-border p-3 bg-warm-surface/50">
              <p className="text-sm font-medium text-warm-text">
                ${(parseFloat(repairEstimate) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-warm-muted">From the Damage Details step</p>
            </div>
          </div>

          {/* Loss of use */}
          <div className="space-y-2">
            <Label htmlFor="loss-of-use">Loss of Use ($)</Label>
            <Input
              id="loss-of-use"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={lossOfUse}
              onChange={(e) => setLossOfUse(e.target.value)}
            />
            <p className="text-xs text-warm-muted">
              Rental car costs, temporary housing, or other costs from not having your property.
            </p>
          </div>

          {/* Additional out-of-pocket */}
          <div className="space-y-2">
            <Label htmlFor="additional-costs">Additional Out-of-Pocket Costs ($)</Label>
            <Input
              id="additional-costs"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={additionalCosts}
              onChange={(e) => setAdditionalCosts(e.target.value)}
            />
            <p className="text-xs text-warm-muted">
              Towing, storage, temporary fixes, or other related expenses.
            </p>
          </div>

          {/* Grand total for property damage */}
          <div className="rounded-lg bg-warm-surface p-4 border border-warm-border">
            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-warm-muted">
                <span>Repair/replacement</span>
                <span>${(parseFloat(repairEstimate) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-warm-muted">
                <span>Loss of use</span>
                <span>${(parseFloat(lossOfUse) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-warm-muted">
                <span>Additional costs</span>
                <span>${(parseFloat(additionalCosts) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="border-t border-warm-border pt-2 mt-2 flex justify-between font-semibold text-warm-text">
                <span>Grand Total</span>
                <span>${propertyGrandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </>
      ) : (
        // Keep existing injury damages content (medical expenses, lost wages, property damage, pain & suffering)
        <>
          {/* ... existing content stays unchanged ... */}
        </>
      )}
    </div>
  )
```

**Step 7: Add property damage state variables and computed total**

```typescript
/* ---- Property damage costs (property damage sub-types) ---- */
const [lossOfUse, setLossOfUse] = useState<string>(
  (meta.loss_of_use as string) ?? ''
)
const [additionalCosts, setAdditionalCosts] = useState<string>(
  (meta.additional_costs as string) ?? ''
)

const propertyGrandTotal = useMemo(() => {
  return (parseFloat(repairEstimate) || 0) +
    (parseFloat(lossOfUse) || 0) +
    (parseFloat(additionalCosts) || 0)
}, [repairEstimate, lossOfUse, additionalCosts])
```

**Step 8: Update grandTotal and suggestCourtType to use correct total**

The existing `grandTotal` is used for court type suggestion. Update it to use `propertyGrandTotal` when appropriate:

```typescript
const effectiveGrandTotal = isPropertyDamage ? propertyGrandTotal : grandTotal
```

Then use `effectiveGrandTotal` in the venue step's `suggestCourtType()` call and in the review step.

**Step 9: Include new fields in metadata saved to API**

Find the metadata payload construction (in the `handleGenerate` or `handleSave` function) and add the property damage fields:

```typescript
...(isPropertyDamage ? {
  property_damage_description: propertyDamageDescription,
  damage_severity: damageSeverity,
  repair_estimate: repairEstimate,
  has_repair_receipts: hasRepairReceipts,
  loss_of_use: lossOfUse,
  additional_costs: additionalCosts,
} : {}),
```

**Step 10: Build and verify**

Run: `cd "/Users/minwang/lawyer free" && npx next build 2>&1 | tail -5`
Expected: Build succeeds

---

### Task 3: Fix pi-file-with-court-factory.ts — Property Damage Sub-Type Check

**Files:**
- Modify: `src/lib/guided-steps/personal-injury/pi-file-with-court-factory.ts`

**Step 1: Import `isPropertyDamageSubType`**

Add import at top:

```typescript
import { isPropertyDamageSubType } from './constants'
```

**Step 2: Fix `buildSolPrompt()` (line 113)**

Replace:
```typescript
const isProperty = piSubType === 'property_damage'
```
with:
```typescript
const isProperty = isPropertyDamageSubType(piSubType)
```

**Step 3: Fix `generateSummary()` (line 267)**

Replace:
```typescript
const isProperty = piSubType === 'property_damage'
```
with:
```typescript
const isProperty = isPropertyDamageSubType(piSubType)
```

**Step 4: Build and verify**

Run: `cd "/Users/minwang/lawyer free" && npx next build 2>&1 | tail -5`
Expected: Build succeeds

---

### Task 4: Fix pi-intake-step.tsx — SOL Warning Text

**Files:**
- Modify: `src/components/step/personal-injury/pi-intake-step.tsx`

The `isPropertyDamage` variable already exists in this file (line 23). Use it to fix the hardcoded SOL text.

**Step 1: Fix dynamic SOL warning (lines 369-372)**

Replace:
```
The Texas statute of limitations for personal injury is 2 years
from the date of injury
```
with:
```
{isPropertyDamage
  ? 'The Texas statute of limitations for property damage is 2 years from the date of the incident'
  : 'The Texas statute of limitations for personal injury is 2 years from the date of injury'}
```

Keep the rest of the sentence (the citation and days remaining) as-is.

**Step 2: Fix static SOL info box (lines 594-599)**

Replace the title:
```
Texas statute of limitations for personal injury
```
with:
```
{`Texas statute of limitations for ${isPropertyDamage ? 'property damage' : 'personal injury'}`}
```

Replace the body text:
```
In Texas, the statute of limitations for personal injury claims is 2 years from the date of injury
```
with:
```
{`In Texas, the statute of limitations for ${isPropertyDamage ? 'property damage' : 'personal injury'} claims is 2 years from the date of ${isPropertyDamage ? 'the incident' : 'injury'}`}
```

**Step 3: Build and verify**

Run: `cd "/Users/minwang/lawyer free" && npx next build 2>&1 | tail -5`
Expected: Build succeeds

---

### Task 5: Update step-guidance.ts — Property-Damage-Aware Guidance

**Files:**
- Modify: `src/lib/step-guidance.ts`
- Modify: `src/components/case/context-sidebar.tsx`

The right sidebar currently shows the same guidance for all PI tasks regardless of sub-type. The cleanest fix: add duplicate entries with a `_property` suffix for the PI tasks where guidance differs, then update the context sidebar to check for property damage variants.

**Step 1: Add property damage guidance entries to `step-guidance.ts`**

Add these entries after the existing PI section (after line 258):

```typescript
// --- Personal Injury: Property Damage Variants ---
pi_intake_property: {
  why: 'Property damage details shape your entire strategy — from documenting the damage to calculating your claim value.',
  checklist: [
    'Date and location of the incident',
    'Other party\'s name and insurance info',
    'Your insurance policy number',
    'Police report number (if applicable)',
  ],
  tip: 'Don\'t worry if you don\'t have everything yet — you can update details later.',
},
pi_medical_records_property: {
  why: 'Thorough damage documentation is the foundation of your property damage claim. Photos, estimates, and receipts prove your losses.',
  checklist: [
    'Photos of the damage from multiple angles',
    'Professional repair estimates',
    'Receipts for any repairs already made',
    'Pre-damage condition records or photos',
  ],
},
pi_insurance_communication_property: {
  why: 'How you communicate with insurance companies can significantly impact your claim. Being prepared helps protect your interests.',
  checklist: [
    'Your claim number (if you have one)',
    'Insurance adjuster\'s name and contact info',
    'Notes from any prior conversations',
  ],
  tip: 'Never agree to a settlement before you have complete repair estimates.',
},
prepare_pi_demand_letter_property: {
  why: 'A demand letter formally requests compensation and often leads to settlement without going to court.',
  checklist: [
    'Complete damage documentation and photos',
    'Professional repair or replacement estimates',
    'Evidence of loss of use costs',
    'Receipts for all related expenses',
  ],
},
pi_settlement_negotiation_property: {
  why: 'Most property damage cases settle before trial. Knowing your property\'s value and repair costs gives you leverage.',
  checklist: [
    'Total repair or replacement costs',
    'Loss of use documentation',
    'Your minimum acceptable settlement amount',
  ],
},
prepare_pi_petition_property: {
  why: 'If settlement talks fail, filing a lawsuit preserves your right to recover damages through the court.',
  checklist: [
    'All evidence from your vault',
    'Completed demand letter (if sent)',
    'Filing fee for your county',
  ],
},
pi_post_resolution_property: {
  why: 'After your case resolves, there are important follow-up steps to ensure you receive your compensation and complete any remaining repairs.',
  checklist: [
    'Settlement agreement or court order',
    'Outstanding repair or replacement invoices',
  ],
},
```

**Step 2: Update context-sidebar.tsx to check property damage variants**

In `context-sidebar.tsx`, the guidance is looked up by `task_key`. We need to also check if there's a `_property` variant when the case is property damage.

This requires passing `dispute_type` info to the context sidebar. The layout already fetches the `dispute_type` from `cases`. The context sidebar needs to:

1. Accept `disputeType` prop (already available from layout)
2. Look up the task's `pi_sub_type` from the database, OR simpler: accept a `isPropertyDamage` boolean prop
3. Try `STEP_GUIDANCE[taskKey + '_property']` first when `isPropertyDamage`, then fall back to `STEP_GUIDANCE[taskKey]`

In `layout.tsx`, pass the dispute type:

```tsx
<ContextSidebar
  caseId={id}
  tasks={taskList.map((t) => ({ id: t.id, task_key: t.task_key }))}
  fallbackTaskKey={currentTaskKey}
  deadline={deadline}
  riskScore={riskScore}
  disputeType={disputeType}
/>
```

In `context-sidebar.tsx`, add the prop and modify the guidance lookup:

```typescript
interface ContextSidebarProps {
  // ... existing props
  disputeType?: string
}
```

For the guidance lookup, also query `personal_injury_details` for the `pi_sub_type` to determine if it's a property damage case. Then:

```typescript
const guidanceKey = isPropertyDamage && STEP_GUIDANCE[currentTaskKey + '_property']
  ? currentTaskKey + '_property'
  : currentTaskKey
const guidance = STEP_GUIDANCE[guidanceKey]
```

**Step 3: Build and verify**

Run: `cd "/Users/minwang/lawyer free" && npx next build 2>&1 | tail -5`
Expected: Build succeeds

---

### Task 6: Final Build Verification

**Step 1: Full build**

Run: `cd "/Users/minwang/lawyer free" && npx next build 2>&1 | tail -30`
Expected: Build succeeds with no errors

**Step 2: Manual verification checklist**

For a **property damage** case:
- [ ] PI Petition wizard title says "Property Damage Petition - Vehicle Damage" (or appropriate sub-type)
- [ ] Preflight checklist shows "Photos of the damage", "Repair estimates or invoices" (no "injuries", no "medical records")
- [ ] Preflight tip is property-damage-specific
- [ ] Wizard steps show: Before You Start → What Happened → (Other Driver for vehicle_damage) → Damage Details → Your Damages → Insurance → Where to File → Review
- [ ] No "Your Injuries" or "Medical Treatment" steps appear
- [ ] Damages step shows Repair/Replacement, Loss of Use, Additional Costs (no Medical Expenses, no Pain & Suffering)
- [ ] SOL warnings say "property damage" not "personal injury"
- [ ] Right sidebar guidance says "property damage" not "injury" / "medical records"
- [ ] File with court page uses correct SOL for property damage

For a **personal injury** case (regression check):
- [ ] Everything works exactly as before
- [ ] Title says "Personal Injury Petition - Auto Accident" (or appropriate sub-type)
- [ ] Preflight shows injuries/medical records checklist
- [ ] All injury-specific steps still appear
- [ ] Damages step shows Medical Expenses, Pain & Suffering
