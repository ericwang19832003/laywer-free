# JurisdictionRuleConfig Schema Reference

Source: `packages/shared/src/jurisdiction-rules/schema.ts`

## Top-Level Config

```typescript
jurisdictionRuleConfigSchema = z.object({
  state: z.enum(['TX', 'CA', 'PA', 'NY', 'FL']),
  disputeType: z.string().min(1),
  subType: z.string().optional(),
  requiredSections: z.array(requiredSectionSchema).min(1),
  filingRules: filingRulesSchema,
  rejectionReasons: z.array(rejectionReasonSchema),
  stepValidations: z.record(z.string(), stepValidationSchema),
  glossary: z.array(glossaryEntrySchema),
})
```

### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `state` | enum | Yes | Two-letter state code. Must be one of the supported states: TX, CA, PA, NY, FL. |
| `disputeType` | string | Yes | Snake_case identifier for the dispute category (e.g., `debt_collection`, `divorce`, `eviction_defense`). Used as the filename and registry key. |
| `subType` | string | No | Further narrows the dispute type (e.g., `credit_card` under `debt_collection`). When present, the loader key becomes `STATE:disputeType:subType`. |
| `requiredSections` | array | Yes | Ordered list of document sections that must appear in the generated petition/answer. Min 1 section. The order matters -- it defines document structure. |
| `filingRules` | object | Yes | Court-specific filing requirements (formatting, fees, service rules). |
| `rejectionReasons` | array | Yes | Common reasons court clerks reject pro se filings. Each maps to a wizard step so the UI can warn users before they submit. |
| `stepValidations` | record | Yes | Per-wizard-step validation rules. Keys are step IDs (e.g., `facts`, `claims`, `parties`, `venue`, `review`). |
| `glossary` | array | Yes | Legal terms with plain English definitions. Shown to users in tooltips and the glossary panel. |

---

## RequiredSection

```typescript
requiredSectionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  description: z.string().min(1),
  legalElements: z.array(z.string()).optional(),
  minParagraphs: z.number().int().positive().optional(),
})
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Machine-readable identifier (e.g., `caption`, `general_denial`, `affirmative_defenses`). Used as an anchor in the generated document. |
| `label` | string | Yes | Human-readable section title shown in the UI and document heading. |
| `description` | string | Yes | Explains what this section is and why it matters. Written for self-represented litigants, not lawyers. |
| `legalElements` | string[] | No | Specific items that must appear in this section. The legal correctness agent checks generated text against these elements. Substantive sections (not caption/certificate) should always have these. |
| `minParagraphs` | number | No | Minimum paragraph count for this section. Used by the step validator to flag incomplete sections. |

---

## FilingRules

```typescript
filingRulesSchema = z.object({
  courtName: z.string().min(1),
  maxPages: z.number().int().positive().optional(),
  fontRequirements: z.string().optional(),
  marginRequirements: z.string().optional(),
  serviceRequirements: z.string().min(1),
  filingFee: z.string().optional(),
  copies: z.number().int().positive().optional(),
  localFormUrl: z.string().url().optional(),
})
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `courtName` | string | Yes | Full name of the court(s) with jurisdictional amounts. The jurisdiction compliance agent verifies the generated document names the correct court. |
| `maxPages` | number | No | Page limit imposed by the court. Used to warn if generated document is too long. |
| `fontRequirements` | string | No | Font size/family requirements (e.g., "14-point minimum for body text in JP Court"). |
| `marginRequirements` | string | No | Margin requirements (e.g., "1-inch margins on all sides"). |
| `serviceRequirements` | string | Yes | How to serve the opposing party. Critical for procedural compliance -- the jurisdiction compliance agent checks this. |
| `filingFee` | string | No | Filing fee amount and fee waiver availability. Shown to the user in the filing checklist. |
| `copies` | number | No | Number of copies required when filing (original + copies for service). |
| `localFormUrl` | string (URL) | No | Link to official court forms page. Must be a valid URL. Shown as a reference link in the UI. |

---

## RejectionReason

```typescript
rejectionReasonSchema = z.object({
  reason: z.string().min(1),
  howToAvoid: z.string().min(1),
  wizardStep: z.string().min(1),
})
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `reason` | string | Yes | What the clerk will flag (e.g., "Missing verification paragraph"). Written as the clerk would state it. |
| `howToAvoid` | string | Yes | Actionable instruction for the user to prevent this rejection. |
| `wizardStep` | string | Yes | The wizard step where this issue can be prevented (e.g., `review`, `venue`, `parties`). The UI shows the warning on this step. Must match a key in `stepValidations`. |

---

## StepValidation

```typescript
stepValidationSchema = z.object({
  required: z.array(z.string()),
  warnings: z.array(stepWarningSchema),
})

stepWarningSchema = z.object({
  condition: z.string().min(1),
  message: z.string().min(1),
})
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `required` | string[] | Yes | Field IDs that must be filled before the user can proceed past this step. Empty array `[]` means no hard requirements. |
| `warnings` | StepWarning[] | Yes | Soft warnings shown when certain conditions are detected. The user can proceed despite warnings. |
| `warnings[].condition` | string | Yes | Machine-readable condition identifier (e.g., `no_validation_notice_mentioned`). Checked by the step validator. |
| `warnings[].message` | string | Yes | User-facing warning message explaining why this matters and what to do about it. |

---

## GlossaryEntry

```typescript
glossaryEntrySchema = z.object({
  term: z.string().min(1),
  plainEnglish: z.string().min(1),
})
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `term` | string | Yes | The legal term as it appears in the document (e.g., "Statute of Limitations", "General Denial"). |
| `plainEnglish` | string | Yes | Plain English definition written at an 8th-grade reading level. Should include the relevant statute cite and a practical example when helpful. |

---

## How the Schema Is Used

1. **Step Validator (Layer 1)** reads `requiredSections[].minParagraphs` and `stepValidations[].required` to check completeness.
2. **Pre-Generation Check (Layer 2)** reads `stepValidations` to verify all required fields are filled before generating the document.
3. **Legal Correctness Agent (Layer 3a)** reads `requiredSections[].legalElements` to verify the generated text includes all required legal elements.
4. **Jurisdiction Compliance Agent (Layer 3b)** reads `filingRules` to verify formatting, court name, and service requirements.
5. **Plain Language Agent (Layer 3c)** reads `glossary` to ensure legal terms are defined and the document is accessible.
6. **Auto-Fix Pass** uses `rejectionReasons[].howToAvoid` to suggest fixes when issues are detected.
