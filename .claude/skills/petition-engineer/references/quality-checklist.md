# Quality Gate Checklist

Every generated `JurisdictionRuleConfig` must pass all 5 checks before it can be committed. Run these checks in order -- later checks depend on earlier ones.

---

## Check 1: Legal Elements Coverage

**Rule:** All `requiredSections` must have `legalElements` arrays, except purely procedural sections (caption, certificate of service).

### What Passes
```typescript
{
  id: 'affirmative_defenses',
  label: 'Affirmative Defenses',
  description: '...',
  legalElements: [
    'Statute of limitations -- 4-year limit (TX CPRC 16.004)',
    'Lack of standing -- unbroken chain of assignment required',
  ],
  minParagraphs: 3,
}
```

### What Fails
```typescript
{
  id: 'affirmative_defenses',
  label: 'Affirmative Defenses',
  description: '...',
  // Missing legalElements -- the legal correctness agent
  // cannot verify this section without them
}
```

### How to Fix
Add `legalElements` with at least 2 specific legal requirements. Each element should reference the governing statute or rule.

### Exceptions
- `caption` -- procedural, no legal elements needed (but still recommended)
- `certificate_of_service` -- procedural, just requires date/method/recipient

---

## Check 2: Rejection Reason Mapping

**Rule:** Every `rejectionReason.wizardStep` must correspond to a key in `stepValidations`.

### What Passes
```typescript
rejectionReasons: [
  { reason: '...', howToAvoid: '...', wizardStep: 'review' },
  { reason: '...', howToAvoid: '...', wizardStep: 'venue' },
],
stepValidations: {
  review: { required: [], warnings: [] },
  venue: { required: [], warnings: [] },   // wizardStep 'venue' exists here
}
```

### What Fails
```typescript
rejectionReasons: [
  { reason: '...', howToAvoid: '...', wizardStep: 'formatting' },  // no 'formatting' in stepValidations
],
stepValidations: {
  review: { required: [], warnings: [] },
}
```

### How to Fix
Either:
- Add the missing step to `stepValidations`, or
- Change `wizardStep` to an existing step (use the step where the user can actually prevent the issue)

---

## Check 3: Step Validation Field Coverage

**Rule:** All required fields referenced in `stepValidations[].required` must correspond to data the wizard actually collects at that step.

### What Passes
```typescript
stepValidations: {
  facts: {
    required: ['debt_origination_date'],  // the facts step collects this
    warnings: [...]
  }
}
```

### What Fails
```typescript
stepValidations: {
  facts: {
    required: ['court_filing_number'],  // this is assigned by the clerk, not collected in facts step
    warnings: [...]
  }
}
```

### How to Fix
Move the field to the correct step, or remove it if the wizard does not collect it. Cross-reference with the wizard step definitions in the app.

### Current Wizard Steps
- `parties` -- plaintiff name, defendant name, addresses
- `venue` -- court selection, county
- `facts` -- dates, amounts, narrative facts
- `claims` -- causes of action, defenses selected
- `review` -- final review before generation

---

## Check 4: Glossary Completeness

**Rule:** Every legal term that appears in `legalElements` must have a corresponding `glossary` entry.

### What Passes
```typescript
requiredSections: [{
  legalElements: ['Statute of limitations -- 4-year limit (TX CPRC 16.004)']
}],
glossary: [{
  term: 'Statute of Limitations',
  plainEnglish: 'A legal deadline for the creditor to file a lawsuit...'
}]
```

### What Fails
```typescript
requiredSections: [{
  legalElements: ['FDCPA violations (15 U.S.C. 1692 et seq.)']
}],
glossary: []  // no entry for "FDCPA"
```

### How to Fix
Scan all `legalElements` strings for legal terms. For each term:
1. Add a `glossary` entry with a plain English definition
2. Write at an 8th-grade reading level
3. Include the statute cite
4. Add a practical example when helpful

### Terms to Always Define
- Any acronym (FDCPA, TRCP, CPRC, etc.)
- Latin phrases (res judicata, prima facie, etc.)
- Procedural terms (service, verification, general denial, etc.)
- Cause-of-action terms (standing, burden of proof, affirmative defense, etc.)

---

## Check 5: Filing Rules Completeness

**Rule:** `filingRules` must have both `courtName` and `serviceRequirements` filled with specific, actionable information.

### What Passes
```typescript
filingRules: {
  courtName: 'Justice of the Peace Court (claims under $20,000) or County/District Court (claims $20,000 and above)',
  serviceRequirements: 'Must serve all parties via certified mail, hand delivery, e-service, or fax per TX Rule of Civil Procedure 21a.',
  filingFee: '$54 for Justice of the Peace Court (fee waiver available)',
  // other fields...
}
```

### What Fails
```typescript
filingRules: {
  courtName: 'Texas Court',           // too vague
  serviceRequirements: 'Serve papers', // not actionable
}
```

### How to Fix
- `courtName`: Include the full court name, jurisdictional limits, and how to determine which court applies.
- `serviceRequirements`: Specify all acceptable service methods, cite the governing rule, and note any special requirements (e.g., e-service needs prior written agreement).

---

## Running the Checks

### Automated (Zod schema validation)
```typescript
import { jurisdictionRuleConfigSchema } from './schema'

const result = jurisdictionRuleConfigSchema.safeParse(config)
if (!result.success) {
  console.error(result.error.format())
}
```

This catches type errors and missing required fields but does NOT check semantic quality (checks 1, 2, 4 above).

### Manual (semantic quality)
After Zod passes, manually verify:
1. Scan each `requiredSection` -- does it have `legalElements`?
2. Collect all `wizardStep` values from `rejectionReasons` -- are they all keys in `stepValidations`?
3. Review `stepValidations[].required` -- are these fields the wizard actually collects?
4. Extract legal terms from `legalElements` -- does each have a `glossary` entry?
5. Read `courtName` and `serviceRequirements` -- are they specific and actionable?
