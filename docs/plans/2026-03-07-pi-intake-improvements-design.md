# PI Intake Form Improvements Design

## Problem

The PI intake form (`pi_intake` step) shows "Describe your injuries" and "How severe are your injuries?" for all PI cases — including property damage cases where those fields are irrelevant. Additionally, users cannot attach supporting documents (photos, police reports, damage evidence) directly from the form; they must navigate to the Evidence Vault separately.

## Solution

1. **Conditional form fields** based on `pi_sub_type` — injury sub-types see injury fields, property damage sub-types see damage fields.
2. **Inline file upload** below key text fields — files go directly to the existing Evidence Vault (`evidence_items` table) with auto-categorization.

## How It Works

### 1. Conditional Form Fields

The step page fetches `personal_injury_details.pi_sub_type` from the database and passes it to `PIIntakeStep` as a new prop.

**Injury sub-types** (`auto_accident`, `pedestrian_cyclist`, `rideshare`, `uninsured_motorist`, `slip_and_fall`, `dog_bite`, `product_liability`, `other_injury`):
- Title: "Tell Us About Your Injury"
- Shows: "Describe your injuries" textarea + "How severe are your injuries?" radio buttons

**Property damage sub-types** (`vehicle_damage`, `property_damage_negligence`, `vandalism`, `other_property_damage`):
- Title: "Tell Us About the Property Damage"
- Shows: "Describe the damage" textarea + "Estimated damage amount" text input

**Shared fields** (always shown): Date of incident, Location of incident, What happened?, Police report filed toggle + report number.

### 2. Inline File Upload Component

A reusable `<InlineFileUpload>` component placed below specific fields.

**Placement:**
- Below "What happened?" textarea — label: "Attach photos or documents"
- Below "Describe your injuries" / "Describe the damage" textarea — label: "Attach medical records or damage photos"
- Below police report number (when police_report_filed === true) — label: "Upload police report"

**Behavior:**
- Small "Attach files" button with paperclip icon
- Click opens native file picker (PDF, JPG, PNG — max 10 MB, same as Evidence Vault)
- Files upload immediately via `POST /api/cases/{caseId}/evidence` (existing API)
- Uploaded files display as small chips (filename + remove button)
- Auto-categorization based on placement:
  - "What happened" → category: `Photos`
  - "Describe injuries" → category: `Medical Records`
  - "Describe the damage" → category: `Photos`
  - "Police report" → category: `Other`, notes: `Police report`
- Files appear in Evidence Vault after upload (single source of truth)
- Evidence item IDs stored in task metadata for the review screen

**Component Props:**
```typescript
interface InlineFileUploadProps {
  caseId: string
  label: string        // e.g. "Attach photos or documents"
  category: string     // auto-assigned evidence category
  notes?: string       // optional note for categorization
  fileIds: string[]    // controlled: current list of uploaded evidence IDs
  onUpload: (evidenceId: string, fileName: string) => void
  onRemove: (evidenceId: string) => void
}
```

### 3. Review Screen Updates

The review content section updates to:
- Show "Damage description" / "Estimated damage" for property damage cases
- Show "Injuries" / "Severity" for injury cases
- Show attachment counts for each field (e.g., "2 files attached")

## Files to Modify

| File | Change |
|------|--------|
| `src/components/step/personal-injury/pi-intake-step.tsx` | Add `piSubType` prop, conditional fields, inline upload integration, property damage fields |
| `src/app/(authenticated)/case/[id]/step/[taskId]/page.tsx` | Fetch `personal_injury_details.pi_sub_type` for `pi_intake` case, pass to component |

## New Files

| File | Purpose |
|------|---------|
| `src/components/ui/inline-file-upload.tsx` | Reusable inline file upload component using existing evidence API |

## No Database Changes

- Files go to existing `evidence_items` table via existing API
- `pi_sub_type` already stored in `personal_injury_details`
- New metadata fields (`damage_description`, `estimated_damage_amount`, attachment IDs) stored in task metadata (JSON column)

## No New API Routes

Reuses existing `POST /api/cases/{caseId}/evidence` endpoint.
