# Filing Method Step Design

## Goal

Add a new "How to File" wizard step to all petition wizards that guides users through filing online (e-filing via eFileTexas) or in person, with smart handoff including deep-links and petition PDF download.

## Context

- Users generate their petition in the wizard but have no in-app guidance on how to actually submit it to the court
- eFileTexas has no public API — programmatic filing requires EFSP certification
- eFileTexas Guide-and-File supports deep-linking via `legalProcessKey` URL parameter
- Most other workflows already have filing method guidance in their post-wizard "File With the Court" guided step, but the wizard itself lacks it
- JP courts don't universally support e-filing

## Design

### New Wizard Step: "How to File"

Added as the **last step** in every petition wizard (after Review/Generate). Built as a **shared component** (`FilingMethodStep`) used by all 9 wizards.

### Config-Driven Data

```typescript
const FILING_CONFIGS: Record<string, FilingConfig> = {
  personal_injury: { legalProcessKey: null, caseCategory: 'Civil' },
  divorce: { legalProcessKey: 'divorce', caseCategory: 'Family' },
  custody: { legalProcessKey: 'custody', caseCategory: 'Family' },
  small_claims: { legalProcessKey: 'small_claims', caseCategory: 'Civil' },
  eviction: { legalProcessKey: 'eviction', caseCategory: 'Civil' },
  // ...etc
}
```

Component receives: `disputeType`, `courtType`, `county`, `state`.

### UI Layout

**Phase 1 — Filing Method Selection**

Two side-by-side cards (Lucide icons: Globe / Building2):
- **File Online (e-filing)** — "Fastest option. Most Texas courts require it."
- **File In Person** — "Bring documents to the courthouse."

**Phase 2 — Contextual Guidance**

Expands below the selected card with numbered steps.

**If "File Online":**
1. Go to eFileTexas.gov
2. Create a free account (it's free)
3. Select your court: {county} — {courtType}
4. Upload your petition PDF
5. Pay filing fee ({feeRange})

Plus:
- JP court caveat: "Some JP courts don't accept e-filing yet. Check with your local court before filing online."
- Two CTA buttons: **"Download Petition PDF"** + **"Open eFileTexas →"**
- eFileTexas link uses Guide-and-File deep-link when `legalProcessKey` is available, falls back to main portal

**If "File In Person":**
1. Print your petition (bring original + 2 copies)
2. Bring valid photo ID
3. Bring filing fee payment ({feeRange}) — cash, check, or money order
4. Go to {county} County Courthouse
5. File at the clerk's office — they'll stamp your copies

Plus:
- CTA button: **"Download Petition PDF"** + **"Find Courthouse →"** (Google Maps link)
- Payment method note varies by court type

### Post-Wizard Step Simplification

The existing "File With the Court" guided step (the task after the petition wizard) is simplified to a **confirmation step**:
- "Did you file your petition?"
- Upload stamped copy / confirmation number
- Track filing status

This avoids duplicating filing method guidance.

### Scope

All 9 petition wizards:
1. `personal-injury-wizard.tsx`
2. `contract-wizard.tsx`
3. `property-wizard.tsx`
4. `family-law-wizard.tsx`
5. `small-claims-wizard.tsx`
6. `landlord-tenant-wizard.tsx`
7. `debt-defense-wizard.tsx`
8. `petition-wizard.tsx` (generic/civil)
9. `other-wizard.tsx`

### Security

- External links use `target="_blank"` with `rel="noopener noreferrer"`
- No PII passed in URL parameters
- PDF download requires authentication (only case owner)

### Edge Cases

- JP court without e-filing → show caveat note
- State without e-filing system → show generic "check your court's website" guidance
- No `legalProcessKey` match → link to main eFileTexas portal
- User changes court type after selecting filing method → guidance updates reactively
