# Petition Quality System — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a two-part petition quality system: shared jurisdiction rule configs consumed by a 3-layer in-app validation pipeline, plus a Claude Code skill for generating and auditing configs.

**Architecture:** Jurisdiction rule configs (JSON) live in `packages/shared/src/jurisdiction-rules/`. The in-app pipeline has 3 layers: step validators (config-driven, no AI), pre-generation completeness check (config-driven, no AI), and a post-generation triple review gate (3 parallel AI calls using Haiku). The Claude Code skill dispatches 4 parallel research agents to generate or audit configs.

**Tech Stack:** TypeScript, Zod 4, Vitest, Next.js API routes, Anthropic SDK (Haiku for validators), shadcn/ui components

**Design doc:** `docs/plans/2026-04-12-petition-quality-system-design.md`

---

## Task 1: Jurisdiction Rule Config Schema

Define the shared TypeScript types and Zod schema that all configs must conform to.

**Files:**
- Create: `packages/shared/src/jurisdiction-rules/schema.ts`
- Create: `packages/shared/src/jurisdiction-rules/index.ts`
- Modify: `packages/shared/src/schemas/index.ts` (add export)
- Test: `apps/web/tests/unit/jurisdiction-rules/schema.test.ts`

**Step 1: Write the failing test**

```typescript
// apps/web/tests/unit/jurisdiction-rules/schema.test.ts
import { describe, it, expect } from 'vitest'
import { jurisdictionRuleConfigSchema } from '@lawyer-free/shared/jurisdiction-rules/schema'

const validConfig = {
  state: 'TX',
  disputeType: 'debt_collection',
  requiredSections: [
    {
      id: 'caption',
      label: 'Caption',
      description: 'Case caption with court name, parties, and cause number',
      legalElements: ['court name', 'plaintiff name', 'defendant name', 'cause number placeholder'],
      minParagraphs: 1,
    },
  ],
  filingRules: {
    courtName: 'Justice of the Peace Court',
    serviceRequirements: 'Must serve via certified mail or personal service per TRCP Rule 21a',
    filingFee: '$54 (fee waiver available via Statement of Inability to Afford Payment)',
  },
  rejectionReasons: [
    {
      reason: 'Missing verification paragraph',
      howToAvoid: 'Include a signed verification under penalty of perjury',
      wizardStep: 'review',
    },
  ],
  stepValidations: {
    facts: {
      required: ['debt_origination_date'],
      warnings: [
        {
          condition: 'no_validation_notice_mentioned',
          message: 'Consider mentioning whether you received a written validation notice within 30 days. This strengthens an FDCPA defense.',
        },
      ],
    },
  },
  glossary: [
    {
      term: 'statute of limitations',
      plainEnglish: 'A deadline for the creditor to sue you. In Texas, it\'s usually 4 years for debt.',
    },
  ],
}

describe('jurisdictionRuleConfigSchema', () => {
  it('accepts a valid config', () => {
    const result = jurisdictionRuleConfigSchema.safeParse(validConfig)
    expect(result.success).toBe(true)
  })

  it('rejects missing state', () => {
    const { state, ...noState } = validConfig
    const result = jurisdictionRuleConfigSchema.safeParse(noState)
    expect(result.success).toBe(false)
  })

  it('rejects invalid state code', () => {
    const result = jurisdictionRuleConfigSchema.safeParse({ ...validConfig, state: 'XX' })
    expect(result.success).toBe(false)
  })

  it('rejects empty requiredSections', () => {
    const result = jurisdictionRuleConfigSchema.safeParse({ ...validConfig, requiredSections: [] })
    expect(result.success).toBe(false)
  })

  it('rejects rejectionReason without wizardStep', () => {
    const result = jurisdictionRuleConfigSchema.safeParse({
      ...validConfig,
      rejectionReasons: [{ reason: 'Missing caption', howToAvoid: 'Add it' }],
    })
    expect(result.success).toBe(false)
  })

  it('accepts config with optional subType', () => {
    const result = jurisdictionRuleConfigSchema.safeParse({ ...validConfig, subType: 'credit_card' })
    expect(result.success).toBe(true)
  })

  it('accepts config with optional filingRules fields', () => {
    const result = jurisdictionRuleConfigSchema.safeParse({
      ...validConfig,
      filingRules: {
        ...validConfig.filingRules,
        maxPages: 25,
        fontRequirements: '14pt minimum',
        marginRequirements: '1 inch all sides',
        copies: 3,
        localFormUrl: 'https://www.txcourts.gov/forms',
      },
    })
    expect(result.success).toBe(true)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `cd "lawyer free" && npx turbo test:unit -- --run tests/unit/jurisdiction-rules/schema.test.ts`
Expected: FAIL — module not found

**Step 3: Write minimal implementation**

```typescript
// packages/shared/src/jurisdiction-rules/schema.ts
import { z } from 'zod'

const SUPPORTED_STATES = ['TX', 'CA', 'PA', 'NY', 'FL'] as const

const requiredSectionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  description: z.string().min(1),
  legalElements: z.array(z.string()).optional(),
  minParagraphs: z.number().int().positive().optional(),
})

const filingRulesSchema = z.object({
  courtName: z.string().min(1),
  maxPages: z.number().int().positive().optional(),
  fontRequirements: z.string().optional(),
  marginRequirements: z.string().optional(),
  serviceRequirements: z.string().min(1),
  filingFee: z.string().optional(),
  copies: z.number().int().positive().optional(),
  localFormUrl: z.string().url().optional(),
})

const rejectionReasonSchema = z.object({
  reason: z.string().min(1),
  howToAvoid: z.string().min(1),
  wizardStep: z.string().min(1),
})

const stepWarningSchema = z.object({
  condition: z.string().min(1),
  message: z.string().min(1),
})

const stepValidationSchema = z.object({
  required: z.array(z.string()),
  warnings: z.array(stepWarningSchema),
})

const glossaryEntrySchema = z.object({
  term: z.string().min(1),
  plainEnglish: z.string().min(1),
})

export const jurisdictionRuleConfigSchema = z.object({
  state: z.enum(SUPPORTED_STATES),
  disputeType: z.string().min(1),
  subType: z.string().optional(),
  requiredSections: z.array(requiredSectionSchema).min(1),
  filingRules: filingRulesSchema,
  rejectionReasons: z.array(rejectionReasonSchema),
  stepValidations: z.record(z.string(), stepValidationSchema),
  glossary: z.array(glossaryEntrySchema),
})

export type JurisdictionRuleConfig = z.infer<typeof jurisdictionRuleConfigSchema>
export type RequiredSection = z.infer<typeof requiredSectionSchema>
export type FilingRules = z.infer<typeof filingRulesSchema>
export type RejectionReason = z.infer<typeof rejectionReasonSchema>
export type StepValidation = z.infer<typeof stepValidationSchema>
export type GlossaryEntry = z.infer<typeof glossaryEntrySchema>
export { SUPPORTED_STATES }
```

```typescript
// packages/shared/src/jurisdiction-rules/index.ts
export {
  jurisdictionRuleConfigSchema,
  type JurisdictionRuleConfig,
  type RequiredSection,
  type FilingRules,
  type RejectionReason,
  type StepValidation,
  type GlossaryEntry,
  SUPPORTED_STATES,
} from './schema'
```

**Step 4: Run test to verify it passes**

Run: `cd "lawyer free" && npx turbo test:unit -- --run tests/unit/jurisdiction-rules/schema.test.ts`
Expected: PASS (7 tests)

**Step 5: Commit**

```bash
git add packages/shared/src/jurisdiction-rules/ apps/web/tests/unit/jurisdiction-rules/
git commit -m "feat: add jurisdiction rule config schema with Zod validation"
```

---

## Task 2: First Config — TX Debt Collection

Create the first real jurisdiction rule config as the reference implementation.

**Files:**
- Create: `packages/shared/src/jurisdiction-rules/tx/debt_collection.ts`
- Create: `packages/shared/src/jurisdiction-rules/tx/index.ts`
- Modify: `packages/shared/src/jurisdiction-rules/index.ts` (add TX exports)
- Test: `apps/web/tests/unit/jurisdiction-rules/tx-debt-collection.test.ts`

**Step 1: Write the failing test**

```typescript
// apps/web/tests/unit/jurisdiction-rules/tx-debt-collection.test.ts
import { describe, it, expect } from 'vitest'
import { jurisdictionRuleConfigSchema } from '@lawyer-free/shared/jurisdiction-rules/schema'
import { txDebtCollection } from '@lawyer-free/shared/jurisdiction-rules/tx'

describe('TX debt collection config', () => {
  it('passes schema validation', () => {
    const result = jurisdictionRuleConfigSchema.safeParse(txDebtCollection)
    expect(result.success).toBe(true)
  })

  it('has state TX and disputeType debt_collection', () => {
    expect(txDebtCollection.state).toBe('TX')
    expect(txDebtCollection.disputeType).toBe('debt_collection')
  })

  it('includes required petition sections', () => {
    const sectionIds = txDebtCollection.requiredSections.map(s => s.id)
    expect(sectionIds).toContain('caption')
    expect(sectionIds).toContain('general_denial')
    expect(sectionIds).toContain('affirmative_defenses')
    expect(sectionIds).toContain('verification')
    expect(sectionIds).toContain('certificate_of_service')
  })

  it('has legal elements for affirmative defenses', () => {
    const affDefenses = txDebtCollection.requiredSections.find(s => s.id === 'affirmative_defenses')
    expect(affDefenses?.legalElements).toBeDefined()
    expect(affDefenses!.legalElements!.length).toBeGreaterThanOrEqual(3)
  })

  it('has step validations for facts step', () => {
    expect(txDebtCollection.stepValidations.facts).toBeDefined()
    expect(txDebtCollection.stepValidations.facts.required.length).toBeGreaterThan(0)
  })

  it('has at least 5 glossary entries', () => {
    expect(txDebtCollection.glossary.length).toBeGreaterThanOrEqual(5)
  })

  it('maps every rejectionReason to a valid wizard step', () => {
    const validSteps = ['preflight', 'parties', 'venue', 'facts', 'claims', 'relief', 'how_to_file', 'review']
    for (const r of txDebtCollection.rejectionReasons) {
      expect(validSteps).toContain(r.wizardStep)
    }
  })
})
```

**Step 2: Run test to verify it fails**

Run: `cd "lawyer free" && npx turbo test:unit -- --run tests/unit/jurisdiction-rules/tx-debt-collection.test.ts`
Expected: FAIL — module not found

**Step 3: Write minimal implementation**

Create `packages/shared/src/jurisdiction-rules/tx/debt_collection.ts` with a complete TX debt defense config. Reference:
- TX Rules of Civil Procedure (general denial, verification, certificate of service)
- FDCPA provisions (validation notice, SOL, standing)
- Common JP court rejection reasons
- Glossary: statute of limitations, general denial, affirmative defense, FDCPA, verification, certificate of service, fee waiver

Create `packages/shared/src/jurisdiction-rules/tx/index.ts` barrel export.
Update `packages/shared/src/jurisdiction-rules/index.ts` to re-export TX configs.

**Step 4: Run test to verify it passes**

Run: `cd "lawyer free" && npx turbo test:unit -- --run tests/unit/jurisdiction-rules/tx-debt-collection.test.ts`
Expected: PASS (7 tests)

**Step 5: Commit**

```bash
git add packages/shared/src/jurisdiction-rules/tx/ apps/web/tests/unit/jurisdiction-rules/tx-debt-collection.test.ts
git commit -m "feat: add TX debt collection jurisdiction rule config"
```

---

## Task 3: Config Loader Utility

A function to load the right config given state + disputeType + optional subType.

**Files:**
- Create: `packages/shared/src/jurisdiction-rules/loader.ts`
- Modify: `packages/shared/src/jurisdiction-rules/index.ts` (add export)
- Test: `apps/web/tests/unit/jurisdiction-rules/loader.test.ts`

**Step 1: Write the failing test**

```typescript
// apps/web/tests/unit/jurisdiction-rules/loader.test.ts
import { describe, it, expect } from 'vitest'
import { loadJurisdictionRules } from '@lawyer-free/shared/jurisdiction-rules'

describe('loadJurisdictionRules', () => {
  it('returns TX debt_collection config', () => {
    const config = loadJurisdictionRules('TX', 'debt_collection')
    expect(config).toBeDefined()
    expect(config!.state).toBe('TX')
    expect(config!.disputeType).toBe('debt_collection')
  })

  it('returns null for unsupported state/dispute combo', () => {
    const config = loadJurisdictionRules('TX', 'nonexistent_type')
    expect(config).toBeNull()
  })

  it('returns null for unsupported state', () => {
    const config = loadJurisdictionRules('XX' as any, 'debt_collection')
    expect(config).toBeNull()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `cd "lawyer free" && npx turbo test:unit -- --run tests/unit/jurisdiction-rules/loader.test.ts`
Expected: FAIL — loadJurisdictionRules not found

**Step 3: Write minimal implementation**

```typescript
// packages/shared/src/jurisdiction-rules/loader.ts
import type { JurisdictionRuleConfig } from './schema'
import { txDebtCollection } from './tx'

const REGISTRY: Record<string, JurisdictionRuleConfig> = {
  'TX:debt_collection': txDebtCollection,
}

export function loadJurisdictionRules(
  state: string,
  disputeType: string,
  subType?: string,
): JurisdictionRuleConfig | null {
  const key = subType
    ? `${state}:${disputeType}:${subType}`
    : `${state}:${disputeType}`
  return REGISTRY[key] ?? null
}
```

Update `packages/shared/src/jurisdiction-rules/index.ts` to export `loadJurisdictionRules`.

**Step 4: Run test to verify it passes**

Run: `cd "lawyer free" && npx turbo test:unit -- --run tests/unit/jurisdiction-rules/loader.test.ts`
Expected: PASS (3 tests)

**Step 5: Commit**

```bash
git add packages/shared/src/jurisdiction-rules/ apps/web/tests/unit/jurisdiction-rules/loader.test.ts
git commit -m "feat: add jurisdiction rule config loader with registry lookup"
```

---

## Task 4: Step Validator (Layer 1)

Config-driven validation that runs at each wizard step. No AI calls.

**Files:**
- Create: `packages/shared/src/validators/step-validator.ts`
- Create: `packages/shared/src/validators/index.ts`
- Test: `apps/web/tests/unit/validators/step-validator.test.ts`

**Step 1: Write the failing test**

```typescript
// apps/web/tests/unit/validators/step-validator.test.ts
import { describe, it, expect } from 'vitest'
import { validateStep } from '@lawyer-free/shared/validators'
import { txDebtCollection } from '@lawyer-free/shared/jurisdiction-rules/tx'

describe('validateStep', () => {
  it('returns no issues when all required fields present', () => {
    const result = validateStep(txDebtCollection, 'facts', {
      debt_origination_date: '2019-06-15',
    })
    expect(result.blocks).toHaveLength(0)
  })

  it('returns block when required field is missing', () => {
    const result = validateStep(txDebtCollection, 'facts', {})
    expect(result.blocks.length).toBeGreaterThan(0)
    expect(result.blocks[0].field).toBe('debt_origination_date')
  })

  it('returns block when required field is empty string', () => {
    const result = validateStep(txDebtCollection, 'facts', {
      debt_origination_date: '',
    })
    expect(result.blocks.length).toBeGreaterThan(0)
  })

  it('returns warnings from config', () => {
    const result = validateStep(txDebtCollection, 'facts', {
      debt_origination_date: '2019-06-15',
    })
    expect(result.warnings.length).toBeGreaterThan(0)
    expect(result.warnings[0].message).toBeDefined()
  })

  it('returns empty result for step with no validations', () => {
    const result = validateStep(txDebtCollection, 'preflight', {})
    expect(result.blocks).toHaveLength(0)
    expect(result.warnings).toHaveLength(0)
  })

  it('returns glossary terms found in field values', () => {
    const result = validateStep(txDebtCollection, 'facts', {
      debt_origination_date: '2019-06-15',
      description: 'The statute of limitations has expired on this debt.',
    })
    expect(result.glossaryHits.length).toBeGreaterThan(0)
    expect(result.glossaryHits[0].term).toBe('statute of limitations')
    expect(result.glossaryHits[0].plainEnglish).toBeDefined()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `cd "lawyer free" && npx turbo test:unit -- --run tests/unit/validators/step-validator.test.ts`
Expected: FAIL — module not found

**Step 3: Write minimal implementation**

```typescript
// packages/shared/src/validators/step-validator.ts
import type { JurisdictionRuleConfig, GlossaryEntry } from '../jurisdiction-rules/schema'

export interface StepValidationResult {
  blocks: { field: string; message: string }[]
  warnings: { condition: string; message: string }[]
  glossaryHits: GlossaryEntry[]
}

export function validateStep(
  config: JurisdictionRuleConfig,
  wizardStep: string,
  fieldValues: Record<string, string>,
): StepValidationResult {
  const stepConfig = config.stepValidations[wizardStep]

  if (!stepConfig) {
    return { blocks: [], warnings: [], glossaryHits: [] }
  }

  const blocks: StepValidationResult['blocks'] = []
  for (const field of stepConfig.required) {
    const value = fieldValues[field]
    if (!value || value.trim() === '') {
      blocks.push({
        field,
        message: `This field is required for your ${config.disputeType.replace(/_/g, ' ')} filing.`,
      })
    }
  }

  const warnings = [...stepConfig.warnings]

  const allText = Object.values(fieldValues).join(' ').toLowerCase()
  const glossaryHits = config.glossary.filter(g =>
    allText.includes(g.term.toLowerCase()),
  )

  return { blocks, warnings, glossaryHits }
}
```

```typescript
// packages/shared/src/validators/index.ts
export { validateStep, type StepValidationResult } from './step-validator'
```

**Step 4: Run test to verify it passes**

Run: `cd "lawyer free" && npx turbo test:unit -- --run tests/unit/validators/step-validator.test.ts`
Expected: PASS (6 tests)

**Step 5: Commit**

```bash
git add packages/shared/src/validators/ apps/web/tests/unit/validators/step-validator.test.ts
git commit -m "feat: add config-driven step validator (Layer 1, no AI)"
```

---

## Task 5: Pre-Generation Check (Layer 2)

Checks that all required sections have sufficient user input before calling AI.

**Files:**
- Create: `packages/shared/src/validators/pre-generation-check.ts`
- Modify: `packages/shared/src/validators/index.ts` (add export)
- Test: `apps/web/tests/unit/validators/pre-generation-check.test.ts`

**Step 1: Write the failing test**

```typescript
// apps/web/tests/unit/validators/pre-generation-check.test.ts
import { describe, it, expect } from 'vitest'
import { checkPreGeneration } from '@lawyer-free/shared/validators'
import { txDebtCollection } from '@lawyer-free/shared/jurisdiction-rules/tx'

describe('checkPreGeneration', () => {
  const fullWizardData = {
    yourInfo: { full_name: 'Min Wang', address: '123 Main St', city: 'Houston', state: 'TX', zip: '77001' },
    opposingParties: [{ full_name: 'ABC Collections LLC', address: '456 Corp Ave', city: 'Dallas', state: 'TX', zip: '75201' }],
    venue: { county: 'Harris', courtType: 'jp' },
    description: 'I received a collection letter for a debt from 2019. I never received validation within 30 days.',
    claimDetails: 'General denial. Statute of limitations has expired.',
    reliefRequested: 'Dismiss the case with prejudice.',
  }

  it('returns ready=true when all sections covered', () => {
    const result = checkPreGeneration(txDebtCollection, fullWizardData)
    expect(result.ready).toBe(true)
    expect(result.gaps).toHaveLength(0)
  })

  it('returns ready=false with gaps when parties missing', () => {
    const { yourInfo, ...noParties } = fullWizardData
    const result = checkPreGeneration(txDebtCollection, noParties)
    expect(result.ready).toBe(false)
    expect(result.gaps.some(g => g.sectionId === 'caption')).toBe(true)
  })

  it('returns gap with wizardStep for navigation', () => {
    const { description, ...noFacts } = fullWizardData
    const result = checkPreGeneration(txDebtCollection, noFacts)
    const factGap = result.gaps.find(g => g.sectionId === 'facts' || g.wizardStep === 'facts')
    expect(factGap).toBeDefined()
    expect(factGap!.wizardStep).toBeDefined()
  })

  it('each gap has a user-friendly message', () => {
    const result = checkPreGeneration(txDebtCollection, {})
    for (const gap of result.gaps) {
      expect(gap.message.length).toBeGreaterThan(10)
    }
  })
})
```

**Step 2: Run test to verify it fails**

Run: `cd "lawyer free" && npx turbo test:unit -- --run tests/unit/validators/pre-generation-check.test.ts`
Expected: FAIL — checkPreGeneration not found

**Step 3: Write minimal implementation**

```typescript
// packages/shared/src/validators/pre-generation-check.ts
import type { JurisdictionRuleConfig } from '../jurisdiction-rules/schema'

export interface PreGenerationGap {
  sectionId: string
  sectionLabel: string
  wizardStep: string
  message: string
}

export interface PreGenerationResult {
  ready: boolean
  gaps: PreGenerationGap[]
}

const SECTION_TO_WIZARD_STEP: Record<string, string> = {
  caption: 'parties',
  parties: 'parties',
  jurisdiction: 'venue',
  venue: 'venue',
  facts: 'facts',
  general_denial: 'claims',
  affirmative_defenses: 'claims',
  claims: 'claims',
  relief: 'relief',
  prayer: 'relief',
  verification: 'review',
  certificate_of_service: 'review',
}

const SECTION_TO_DATA_CHECK: Record<string, (data: Record<string, any>) => boolean> = {
  caption: (d) => Boolean(d.yourInfo?.full_name && d.opposingParties?.[0]?.full_name),
  parties: (d) => Boolean(d.yourInfo?.full_name && d.opposingParties?.[0]?.full_name),
  jurisdiction: (d) => Boolean(d.venue?.county),
  venue: (d) => Boolean(d.venue?.county),
  facts: (d) => Boolean(d.description && d.description.length > 20),
  general_denial: (d) => Boolean(d.claimDetails),
  affirmative_defenses: (d) => Boolean(d.claimDetails),
  claims: (d) => Boolean(d.claimDetails),
  relief: (d) => Boolean(d.reliefRequested),
  prayer: (d) => Boolean(d.reliefRequested),
  verification: () => true,
  certificate_of_service: () => true,
}

export function checkPreGeneration(
  config: JurisdictionRuleConfig,
  wizardData: Record<string, any>,
): PreGenerationResult {
  const gaps: PreGenerationGap[] = []

  for (const section of config.requiredSections) {
    const checker = SECTION_TO_DATA_CHECK[section.id]
    if (checker && !checker(wizardData)) {
      gaps.push({
        sectionId: section.id,
        sectionLabel: section.label,
        wizardStep: SECTION_TO_WIZARD_STEP[section.id] ?? 'review',
        message: `Your ${section.label.toLowerCase()} section needs more information. ${section.description}`,
      })
    }
  }

  return { ready: gaps.length === 0, gaps }
}
```

Update `packages/shared/src/validators/index.ts` to export `checkPreGeneration` and types.

**Step 4: Run test to verify it passes**

Run: `cd "lawyer free" && npx turbo test:unit -- --run tests/unit/validators/pre-generation-check.test.ts`
Expected: PASS (4 tests)

**Step 5: Commit**

```bash
git add packages/shared/src/validators/ apps/web/tests/unit/validators/pre-generation-check.test.ts
git commit -m "feat: add pre-generation completeness check (Layer 2, no AI)"
```

---

## Task 6: Triple Review Gate — Legal Correctness Agent (Layer 3a)

Post-generation AI validator that checks legal elements against the config.

**Files:**
- Create: `packages/shared/src/validators/triple-review/legal-correctness.ts`
- Create: `packages/shared/src/validators/triple-review/types.ts`
- Test: `apps/web/tests/unit/validators/triple-review/legal-correctness.test.ts`

**Step 1: Write the failing test**

```typescript
// apps/web/tests/unit/validators/triple-review/legal-correctness.test.ts
import { describe, it, expect } from 'vitest'
import { buildLegalCorrectnessPrompt, parseLegalCorrectnessResponse } from '@lawyer-free/shared/validators/triple-review/legal-correctness'
import { txDebtCollection } from '@lawyer-free/shared/jurisdiction-rules/tx'

describe('buildLegalCorrectnessPrompt', () => {
  it('includes all legal elements from config in the prompt', () => {
    const { system, user } = buildLegalCorrectnessPrompt(txDebtCollection, 'MOCK PETITION DRAFT TEXT')
    expect(system).toContain('legal elements')
    expect(user).toContain('MOCK PETITION DRAFT TEXT')
    // Should reference the legal elements from affirmative_defenses
    const affDef = txDebtCollection.requiredSections.find(s => s.id === 'affirmative_defenses')
    for (const element of affDef?.legalElements ?? []) {
      expect(user).toContain(element)
    }
  })

  it('asks for YES/NO per element', () => {
    const { system } = buildLegalCorrectnessPrompt(txDebtCollection, 'draft')
    expect(system).toContain('YES')
    expect(system).toContain('NO')
  })
})

describe('parseLegalCorrectnessResponse', () => {
  it('parses YES/NO lines into structured results', () => {
    const raw = `caption > court name: YES — Present in line 1
caption > plaintiff name: YES — Named as "Min Wang"
affirmative_defenses > statute of limitations: NO — Not mentioned in the draft
verification > signed under penalty: YES — Verification paragraph present`

    const results = parseLegalCorrectnessResponse(raw)
    expect(results.length).toBe(4)
    expect(results[0].passed).toBe(true)
    expect(results[2].passed).toBe(false)
    expect(results[2].element).toContain('statute of limitations')
    expect(results[2].reason).toContain('Not mentioned')
  })

  it('returns empty array for unparseable response', () => {
    const results = parseLegalCorrectnessResponse('This is garbage')
    expect(results).toHaveLength(0)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `cd "lawyer free" && npx turbo test:unit -- --run tests/unit/validators/triple-review/legal-correctness.test.ts`
Expected: FAIL — module not found

**Step 3: Write minimal implementation**

```typescript
// packages/shared/src/validators/triple-review/types.ts
export interface ReviewCheckResult {
  section: string
  element: string
  passed: boolean
  reason: string
}

export interface ReviewAgentResult {
  agentName: string
  checks: ReviewCheckResult[]
  passCount: number
  totalCount: number
}

export interface TripleReviewResult {
  legalCorrectness: ReviewAgentResult
  jurisdictionCompliance: ReviewAgentResult
  plainLanguage: ReviewAgentResult
  allPassed: boolean
}
```

```typescript
// packages/shared/src/validators/triple-review/legal-correctness.ts
import type { JurisdictionRuleConfig } from '../../jurisdiction-rules/schema'
import type { ReviewCheckResult } from './types'

export function buildLegalCorrectnessPrompt(
  config: JurisdictionRuleConfig,
  petitionDraft: string,
): { system: string; user: string } {
  const elementsList: string[] = []
  for (const section of config.requiredSections) {
    for (const element of section.legalElements ?? []) {
      elementsList.push(`${section.id} > ${element}`)
    }
  }

  const system = `You are a legal correctness reviewer for a ${config.state} ${config.disputeType.replace(/_/g, ' ')} petition.

Your job: check whether the petition draft contains each required legal element.

For each element listed, respond with exactly one line in this format:
SECTION > ELEMENT: YES — brief explanation
or
SECTION > ELEMENT: NO — what is missing

Only output these lines. No preamble, no summary. Answer YES or NO for every element.`

  const user = `## Required legal elements to check:

${elementsList.map(e => `- ${e}`).join('\n')}

## Petition draft to review:

${petitionDraft}`

  return { system, user }
}

export function parseLegalCorrectnessResponse(raw: string): ReviewCheckResult[] {
  const results: ReviewCheckResult[] = []
  const lines = raw.split('\n').filter(l => l.trim())

  for (const line of lines) {
    const match = line.match(/^(.+?)\s*>\s*(.+?):\s*(YES|NO)\s*[—-]\s*(.+)$/i)
    if (match) {
      results.push({
        section: match[1].trim(),
        element: match[2].trim(),
        passed: match[3].toUpperCase() === 'YES',
        reason: match[4].trim(),
      })
    }
  }

  return results
}
```

**Step 4: Run test to verify it passes**

Run: `cd "lawyer free" && npx turbo test:unit -- --run tests/unit/validators/triple-review/legal-correctness.test.ts`
Expected: PASS (4 tests)

**Step 5: Commit**

```bash
git add packages/shared/src/validators/triple-review/ apps/web/tests/unit/validators/triple-review/
git commit -m "feat: add legal correctness review agent prompt builder and parser (Layer 3a)"
```

---

## Task 7: Triple Review Gate — Jurisdiction Compliance Agent (Layer 3b)

**Files:**
- Create: `packages/shared/src/validators/triple-review/jurisdiction-compliance.ts`
- Test: `apps/web/tests/unit/validators/triple-review/jurisdiction-compliance.test.ts`

**Step 1: Write the failing test**

```typescript
// apps/web/tests/unit/validators/triple-review/jurisdiction-compliance.test.ts
import { describe, it, expect } from 'vitest'
import { buildJurisdictionCompliancePrompt, parseJurisdictionComplianceResponse } from '@lawyer-free/shared/validators/triple-review/jurisdiction-compliance'
import { txDebtCollection } from '@lawyer-free/shared/jurisdiction-rules/tx'

describe('buildJurisdictionCompliancePrompt', () => {
  it('includes required sections from config', () => {
    const { user } = buildJurisdictionCompliancePrompt(txDebtCollection, 'MOCK DRAFT')
    for (const section of txDebtCollection.requiredSections) {
      expect(user).toContain(section.id)
    }
  })

  it('includes filing rules', () => {
    const { user } = buildJurisdictionCompliancePrompt(txDebtCollection, 'MOCK DRAFT')
    expect(user).toContain(txDebtCollection.filingRules.courtName)
  })
})

describe('parseJurisdictionComplianceResponse', () => {
  it('parses YES/NO lines for sections and rules', () => {
    const raw = `caption: YES — Present with correct court name
certificate_of_service: NO — Missing entirely
court_name_correct: YES — Matches Harris County JP Court`

    const results = parseJurisdictionComplianceResponse(raw)
    expect(results.length).toBe(3)
    expect(results[1].passed).toBe(false)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `cd "lawyer free" && npx turbo test:unit -- --run tests/unit/validators/triple-review/jurisdiction-compliance.test.ts`
Expected: FAIL

**Step 3: Write minimal implementation**

Follow the same prompt builder + parser pattern as legal-correctness.ts. The system prompt asks the AI to check:
- Is each `requiredSection` present in the draft?
- Does the court name match `filingRules.courtName`?
- Are format requirements met (if specified)?
- Is certificate of service included?

Same YES/NO line format: `CHECK_ID: YES|NO — reason`

**Step 4: Run test to verify it passes**

Run: `cd "lawyer free" && npx turbo test:unit -- --run tests/unit/validators/triple-review/jurisdiction-compliance.test.ts`
Expected: PASS (3 tests)

**Step 5: Commit**

```bash
git add packages/shared/src/validators/triple-review/jurisdiction-compliance.ts apps/web/tests/unit/validators/triple-review/jurisdiction-compliance.test.ts
git commit -m "feat: add jurisdiction compliance review agent (Layer 3b)"
```

---

## Task 8: Triple Review Gate — Plain Language Agent (Layer 3c)

**Files:**
- Create: `packages/shared/src/validators/triple-review/plain-language.ts`
- Test: `apps/web/tests/unit/validators/triple-review/plain-language.test.ts`

**Step 1: Write the failing test**

```typescript
// apps/web/tests/unit/validators/triple-review/plain-language.test.ts
import { describe, it, expect } from 'vitest'
import { buildPlainLanguagePrompt, parsePlainLanguageResponse } from '@lawyer-free/shared/validators/triple-review/plain-language'
import { txDebtCollection } from '@lawyer-free/shared/jurisdiction-rules/tx'

describe('buildPlainLanguagePrompt', () => {
  it('includes glossary terms from config', () => {
    const { user } = buildPlainLanguagePrompt(txDebtCollection, 'MOCK DRAFT')
    for (const g of txDebtCollection.glossary) {
      expect(user).toContain(g.term)
    }
  })

  it('asks for jargon detection', () => {
    const { system } = buildPlainLanguagePrompt(txDebtCollection, 'draft')
    expect(system).toContain('jargon')
  })
})

describe('parsePlainLanguageResponse', () => {
  it('parses check results', () => {
    const raw = `glossary_coverage: YES — All legal terms have plain English equivalents available
unexplained_jargon: NO — "res judicata" used without explanation in paragraph 3
next_steps_clear: YES — Filing instructions are clear`

    const results = parsePlainLanguageResponse(raw)
    expect(results.length).toBe(3)
    expect(results[1].passed).toBe(false)
    expect(results[1].reason).toContain('res judicata')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `cd "lawyer free" && npx turbo test:unit -- --run tests/unit/validators/triple-review/plain-language.test.ts`
Expected: FAIL

**Step 3: Write minimal implementation**

Follow the same pattern. System prompt checks:
- Are all legal terms in the draft covered by the glossary?
- Any unexplained jargon or Latin phrases?
- Are next steps for the user clearly explained?
- Is the user-facing summary (if any) readable at 10th grade level?

**Step 4: Run test to verify it passes**

Run: `cd "lawyer free" && npx turbo test:unit -- --run tests/unit/validators/triple-review/plain-language.test.ts`
Expected: PASS (3 tests)

**Step 5: Commit**

```bash
git add packages/shared/src/validators/triple-review/plain-language.ts apps/web/tests/unit/validators/triple-review/plain-language.test.ts
git commit -m "feat: add plain language review agent (Layer 3c)"
```

---

## Task 9: Triple Review Orchestrator

Runs all 3 review agents in parallel and merges results.

**Files:**
- Create: `packages/shared/src/validators/triple-review/orchestrator.ts`
- Create: `packages/shared/src/validators/triple-review/index.ts`
- Modify: `packages/shared/src/validators/index.ts` (add export)
- Test: `apps/web/tests/unit/validators/triple-review/orchestrator.test.ts`

**Step 1: Write the failing test**

```typescript
// apps/web/tests/unit/validators/triple-review/orchestrator.test.ts
import { describe, it, expect, vi } from 'vitest'
import { runTripleReview } from '@lawyer-free/shared/validators/triple-review'
import { txDebtCollection } from '@lawyer-free/shared/jurisdiction-rules/tx'

// Mock the AI caller — orchestrator takes a generic callAI function
const mockCallAI = vi.fn()

describe('runTripleReview', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCallAI.mockResolvedValue('check_1: YES — ok\ncheck_2: YES — ok')
  })

  it('calls AI 3 times (one per agent)', async () => {
    await runTripleReview(txDebtCollection, 'draft text', mockCallAI)
    expect(mockCallAI).toHaveBeenCalledTimes(3)
  })

  it('runs all 3 agents in parallel', async () => {
    let concurrentCalls = 0
    let maxConcurrent = 0
    mockCallAI.mockImplementation(async () => {
      concurrentCalls++
      maxConcurrent = Math.max(maxConcurrent, concurrentCalls)
      await new Promise(r => setTimeout(r, 10))
      concurrentCalls--
      return 'check_1: YES — ok'
    })

    await runTripleReview(txDebtCollection, 'draft', mockCallAI)
    expect(maxConcurrent).toBe(3)
  })

  it('returns structured TripleReviewResult', async () => {
    const result = await runTripleReview(txDebtCollection, 'draft', mockCallAI)
    expect(result.legalCorrectness).toBeDefined()
    expect(result.jurisdictionCompliance).toBeDefined()
    expect(result.plainLanguage).toBeDefined()
    expect(typeof result.allPassed).toBe('boolean')
  })

  it('allPassed is true when all checks pass', async () => {
    mockCallAI.mockResolvedValue('check_1: YES — ok')
    const result = await runTripleReview(txDebtCollection, 'draft', mockCallAI)
    expect(result.allPassed).toBe(true)
  })

  it('allPassed is false when any check fails', async () => {
    mockCallAI.mockResolvedValue('check_1: NO — missing element')
    const result = await runTripleReview(txDebtCollection, 'draft', mockCallAI)
    expect(result.allPassed).toBe(false)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `cd "lawyer free" && npx turbo test:unit -- --run tests/unit/validators/triple-review/orchestrator.test.ts`
Expected: FAIL

**Step 3: Write minimal implementation**

```typescript
// packages/shared/src/validators/triple-review/orchestrator.ts
import type { JurisdictionRuleConfig } from '../../jurisdiction-rules/schema'
import type { TripleReviewResult, ReviewAgentResult } from './types'
import { buildLegalCorrectnessPrompt, parseLegalCorrectnessResponse } from './legal-correctness'
import { buildJurisdictionCompliancePrompt, parseJurisdictionComplianceResponse } from './jurisdiction-compliance'
import { buildPlainLanguagePrompt, parsePlainLanguageResponse } from './plain-language'

type CallAI = (system: string, user: string) => Promise<string>

function toAgentResult(agentName: string, checks: { section: string; element: string; passed: boolean; reason: string }[]): ReviewAgentResult {
  return {
    agentName,
    checks,
    passCount: checks.filter(c => c.passed).length,
    totalCount: checks.length,
  }
}

export async function runTripleReview(
  config: JurisdictionRuleConfig,
  petitionDraft: string,
  callAI: CallAI,
): Promise<TripleReviewResult> {
  const legalPrompt = buildLegalCorrectnessPrompt(config, petitionDraft)
  const jurisdictionPrompt = buildJurisdictionCompliancePrompt(config, petitionDraft)
  const languagePrompt = buildPlainLanguagePrompt(config, petitionDraft)

  const [legalRaw, jurisdictionRaw, languageRaw] = await Promise.all([
    callAI(legalPrompt.system, legalPrompt.user),
    callAI(jurisdictionPrompt.system, jurisdictionPrompt.user),
    callAI(languagePrompt.system, languagePrompt.user),
  ])

  const legalCorrectness = toAgentResult('Legal Correctness', parseLegalCorrectnessResponse(legalRaw))
  const jurisdictionCompliance = toAgentResult('Jurisdiction Compliance', parseJurisdictionComplianceResponse(jurisdictionRaw))
  const plainLanguage = toAgentResult('Plain Language', parsePlainLanguageResponse(languageRaw))

  const allPassed = [legalCorrectness, jurisdictionCompliance, plainLanguage]
    .every(r => r.checks.every(c => c.passed))

  return { legalCorrectness, jurisdictionCompliance, plainLanguage, allPassed }
}
```

Create barrel export in `packages/shared/src/validators/triple-review/index.ts`.
Update `packages/shared/src/validators/index.ts`.

**Step 4: Run test to verify it passes**

Run: `cd "lawyer free" && npx turbo test:unit -- --run tests/unit/validators/triple-review/orchestrator.test.ts`
Expected: PASS (5 tests)

**Step 5: Commit**

```bash
git add packages/shared/src/validators/ apps/web/tests/unit/validators/triple-review/
git commit -m "feat: add triple review orchestrator with parallel execution"
```

---

## Task 10: API Route — Triple Review Endpoint

A new API route that the petition wizard calls after generation.

**Files:**
- Create: `apps/web/src/app/api/cases/[id]/review-filing/route.ts`
- Test: `apps/web/tests/unit/api/review-filing.test.ts`

**Step 1: Write the failing test**

```typescript
// apps/web/tests/unit/api/review-filing.test.ts
import { describe, it, expect, vi } from 'vitest'

// Test the request validation and response shape
// (full integration tested via e2e)
import { reviewFilingRequestSchema } from './review-filing-schema'

describe('reviewFilingRequestSchema', () => {
  it('accepts valid request', () => {
    const result = reviewFilingRequestSchema.safeParse({
      petitionDraft: 'IN THE JUSTICE COURT...',
      state: 'TX',
      disputeType: 'debt_collection',
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty draft', () => {
    const result = reviewFilingRequestSchema.safeParse({
      petitionDraft: '',
      state: 'TX',
      disputeType: 'debt_collection',
    })
    expect(result.success).toBe(false)
  })

  it('rejects unsupported state', () => {
    const result = reviewFilingRequestSchema.safeParse({
      petitionDraft: 'draft',
      state: 'XX',
      disputeType: 'debt_collection',
    })
    expect(result.success).toBe(false)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `cd "lawyer free" && npx turbo test:unit -- --run tests/unit/api/review-filing.test.ts`
Expected: FAIL

**Step 3: Write minimal implementation**

Create the API route at `apps/web/src/app/api/cases/[id]/review-filing/route.ts`:

1. Authenticate user (same pattern as generate-filing)
2. Parse request: `{ petitionDraft, state, disputeType, subType? }`
3. Load jurisdiction rules via `loadJurisdictionRules(state, disputeType, subType)`
4. If no config found, return 404
5. Create `callAI` function using Anthropic SDK with `claude-haiku-4-5-20251001`, max_tokens: 1024
6. Call `runTripleReview(config, petitionDraft, callAI)`
7. Return `TripleReviewResult` as JSON

Extract the request schema to a shared location so the test can import it.

**Step 4: Run test to verify it passes**

Run: `cd "lawyer free" && npx turbo test:unit -- --run tests/unit/api/review-filing.test.ts`
Expected: PASS (3 tests)

**Step 5: Commit**

```bash
git add apps/web/src/app/api/cases/*/review-filing/ apps/web/tests/unit/api/ packages/shared/src/schemas/
git commit -m "feat: add /api/cases/[id]/review-filing endpoint for triple review"
```

---

## Task 11: UI — Step Validation Indicators

Add validation feedback to the petition wizard steps.

**Files:**
- Create: `apps/web/src/components/step/petition-wizard/step-validation-bar.tsx`
- Create: `apps/web/src/components/step/petition-wizard/glossary-tooltip.tsx`
- Modify: `apps/web/src/components/step/petition-wizard.tsx` (integrate validators)
- Test: `apps/web/tests/unit/components/step-validation-bar.test.tsx`

**Step 1: Write the failing test**

```typescript
// apps/web/tests/unit/components/step-validation-bar.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StepValidationBar } from '@/components/step/petition-wizard/step-validation-bar'

describe('StepValidationBar', () => {
  it('shows nothing when no blocks or warnings', () => {
    const { container } = render(
      <StepValidationBar blocks={[]} warnings={[]} glossaryHits={[]} />
    )
    expect(container.children).toHaveLength(0)
  })

  it('shows amber warning messages', () => {
    render(
      <StepValidationBar
        blocks={[]}
        warnings={[{ condition: 'test', message: 'Consider adding X' }]}
        glossaryHits={[]}
      />
    )
    expect(screen.getByText('Consider adding X')).toBeDefined()
  })

  it('shows block messages with stronger styling', () => {
    render(
      <StepValidationBar
        blocks={[{ field: 'date', message: 'This field is required' }]}
        warnings={[]}
        glossaryHits={[]}
      />
    )
    expect(screen.getByText('This field is required')).toBeDefined()
  })

  it('shows glossary tooltip triggers', () => {
    render(
      <StepValidationBar
        blocks={[]}
        warnings={[]}
        glossaryHits={[{ term: 'statute of limitations', plainEnglish: 'A deadline...' }]}
      />
    )
    expect(screen.getByText(/statute of limitations/)).toBeDefined()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `cd "lawyer free" && npx turbo test:unit -- --run tests/unit/components/step-validation-bar.test.tsx`
Expected: FAIL

**Step 3: Write minimal implementation**

Create `StepValidationBar` component:
- Renders blocks as amber-bordered cards with `calm-amber` text (per design system — no red)
- Renders warnings as lighter amber hints
- Renders glossary hits as clickable terms with tooltip (shadcn Tooltip component)
- Empty state: renders null

Create `GlossaryTooltip` component:
- Uses shadcn `Tooltip` + `TooltipTrigger` + `TooltipContent`
- Shows `term` as trigger, `plainEnglish` as content
- Styled with `calm-indigo` for interactive feel

Integrate into `petition-wizard.tsx`:
- Import `validateStep` and `loadJurisdictionRules`
- Call `validateStep()` with current step's field values (useMemo)
- Render `<StepValidationBar>` below each step's form fields
- Only render when a config is found for this case's state/disputeType

**Step 4: Run test to verify it passes**

Run: `cd "lawyer free" && npx turbo test:unit -- --run tests/unit/components/step-validation-bar.test.tsx`
Expected: PASS (4 tests)

**Step 5: Commit**

```bash
git add apps/web/src/components/step/petition-wizard/ apps/web/tests/unit/components/
git commit -m "feat: add step validation indicators with glossary tooltips to petition wizard"
```

---

## Task 12: UI — Pre-Generation Checklist

Show completeness gaps before generating the petition.

**Files:**
- Create: `apps/web/src/components/step/petition-wizard/pre-gen-checklist.tsx`
- Modify: `apps/web/src/components/step/petition-wizard.tsx` (integrate at review step)
- Test: `apps/web/tests/unit/components/pre-gen-checklist.test.tsx`

**Step 1: Write the failing test**

```typescript
// apps/web/tests/unit/components/pre-gen-checklist.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PreGenChecklist } from '@/components/step/petition-wizard/pre-gen-checklist'

describe('PreGenChecklist', () => {
  const onGenerate = vi.fn()
  const onGoToStep = vi.fn()

  it('shows Generate button when no gaps', () => {
    render(<PreGenChecklist gaps={[]} onGenerate={onGenerate} onGoToStep={onGoToStep} />)
    expect(screen.getByRole('button', { name: /Generate Petition/i })).toBeDefined()
  })

  it('shows gap list with step navigation', () => {
    render(
      <PreGenChecklist
        gaps={[{ sectionId: 'facts', sectionLabel: 'Facts', wizardStep: 'facts', message: 'Need more detail' }]}
        onGenerate={onGenerate}
        onGoToStep={onGoToStep}
      />
    )
    expect(screen.getByText('Need more detail')).toBeDefined()
    expect(screen.getByRole('button', { name: /Go back/i })).toBeDefined()
  })

  it('calls onGoToStep when gap navigation clicked', () => {
    render(
      <PreGenChecklist
        gaps={[{ sectionId: 'facts', sectionLabel: 'Facts', wizardStep: 'facts', message: 'Need detail' }]}
        onGenerate={onGenerate}
        onGoToStep={onGoToStep}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /Go back/i }))
    expect(onGoToStep).toHaveBeenCalledWith('facts')
  })

  it('still allows generate with placeholders when gaps exist', () => {
    render(
      <PreGenChecklist
        gaps={[{ sectionId: 'relief', sectionLabel: 'Relief', wizardStep: 'relief', message: 'Missing amount' }]}
        onGenerate={onGenerate}
        onGoToStep={onGoToStep}
      />
    )
    expect(screen.getByRole('button', { name: /Generate anyway/i })).toBeDefined()
  })
})
```

**Step 2-5: Same TDD cycle.** Build component, integrate into petition-wizard.tsx review step, verify tests pass, commit.

```bash
git commit -m "feat: add pre-generation completeness checklist to petition wizard"
```

---

## Task 13: UI — Triple Review Panel

Display the triple review results after petition generation.

**Files:**
- Create: `apps/web/src/components/step/petition-wizard/review-panel.tsx`
- Modify: `apps/web/src/components/step/petition-wizard.tsx` (integrate in draft phase)
- Test: `apps/web/tests/unit/components/review-panel.test.tsx`

**Step 1: Write the failing test**

```typescript
// apps/web/tests/unit/components/review-panel.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ReviewPanel } from '@/components/step/petition-wizard/review-panel'

const allPassResult = {
  legalCorrectness: { agentName: 'Legal Correctness', checks: [{ section: 'a', element: 'b', passed: true, reason: 'ok' }], passCount: 1, totalCount: 1 },
  jurisdictionCompliance: { agentName: 'Jurisdiction Compliance', checks: [{ section: 'a', element: 'b', passed: true, reason: 'ok' }], passCount: 1, totalCount: 1 },
  plainLanguage: { agentName: 'Plain Language', checks: [{ section: 'a', element: 'b', passed: true, reason: 'ok' }], passCount: 1, totalCount: 1 },
  allPassed: true,
}

describe('ReviewPanel', () => {
  it('shows all-green when everything passes', () => {
    render(<ReviewPanel result={allPassResult} onAutoFix={vi.fn()} />)
    expect(screen.getByText('1/1 passed')).toBeDefined()
    expect(screen.queryByRole('button', { name: /Auto-fix/i })).toBeNull()
  })

  it('shows amber for failed checks with auto-fix button', () => {
    const failResult = {
      ...allPassResult,
      jurisdictionCompliance: {
        agentName: 'Jurisdiction Compliance',
        checks: [{ section: 'cert', element: 'certificate_of_service', passed: false, reason: 'Missing' }],
        passCount: 0, totalCount: 1,
      },
      allPassed: false,
    }
    render(<ReviewPanel result={failResult} onAutoFix={vi.fn()} />)
    expect(screen.getByText('0/1 passed')).toBeDefined()
    expect(screen.getByRole('button', { name: /Auto-fix/i })).toBeDefined()
  })

  it('shows loading state', () => {
    render(<ReviewPanel result={null} loading onAutoFix={vi.fn()} />)
    expect(screen.getByText(/Reviewing/i)).toBeDefined()
  })
})
```

**Step 2-5: Same TDD cycle.** Build component with pass/fail indicators (green checkmark / amber warning per design system), auto-fix button, loading spinner. Integrate into petition-wizard.tsx draft phase — call `/api/cases/[id]/review-filing` after generation completes. Commit.

```bash
git commit -m "feat: add triple review panel with auto-fix to petition wizard"
```

---

## Task 14: Auto-Fix Pass

When triple review finds issues, send them back to Claude for targeted fixes.

**Files:**
- Create: `packages/shared/src/validators/triple-review/auto-fix.ts`
- Modify: `apps/web/src/app/api/cases/[id]/review-filing/route.ts` (add fix endpoint or mode)
- Test: `apps/web/tests/unit/validators/triple-review/auto-fix.test.ts`

**Step 1: Write the failing test**

```typescript
// apps/web/tests/unit/validators/triple-review/auto-fix.test.ts
import { describe, it, expect } from 'vitest'
import { buildAutoFixPrompt } from '@lawyer-free/shared/validators/triple-review/auto-fix'

describe('buildAutoFixPrompt', () => {
  it('includes only failed checks in the prompt', () => {
    const failedChecks = [
      { section: 'certificate_of_service', element: 'certificate paragraph', passed: false, reason: 'Missing entirely' },
    ]
    const { user } = buildAutoFixPrompt('ORIGINAL DRAFT', failedChecks, 'TX')
    expect(user).toContain('certificate of service')
    expect(user).toContain('ORIGINAL DRAFT')
    expect(user).toContain('TX')
  })

  it('system prompt instructs minimal targeted edits', () => {
    const { system } = buildAutoFixPrompt('draft', [], 'TX')
    expect(system).toContain('minimal')
    expect(system).not.toContain('rewrite')
  })
})
```

**Step 2-5: Same TDD cycle.** Build auto-fix prompt builder that takes the original draft + failed checks and asks Claude to make minimal targeted additions. Add a `fix` mode to the review-filing route. Commit.

```bash
git commit -m "feat: add auto-fix prompt builder for failed review checks"
```

---

## Task 15: Claude Code Skill — Petition Engineer

Create the skill file structure and SKILL.md.

**Files:**
- Create: `.claude/skills/petition-engineer/SKILL.md`
- Create: `.claude/skills/petition-engineer/references/config-schema.md`
- Create: `.claude/skills/petition-engineer/references/research-agents.md`
- Create: `.claude/skills/petition-engineer/references/quality-checklist.md`
- Create: `.claude/skills/petition-engineer/templates/jurisdiction-rule.json`

**Step 1: Create SKILL.md**

Write the skill definition following nuwa-skill's patterns:
- Activation triggers for generate and audit modes
- Agentic protocol: classify → route → execute
- Generate mode: 5-phase pipeline (research → synthesize → quality gate → companion files → review)
- Audit mode: read config → research → diff → report
- 4 research agent definitions (court rules, legal elements, rejection patterns, plain language)
- Quality gate: 5 pass/fail checks
- Honest boundaries

**Step 2: Create reference docs**

- `config-schema.md`: Copy of the TypeScript interface with field-by-field documentation
- `research-agents.md`: Detailed agent definitions with search strategies and output formats
- `quality-checklist.md`: The 5 quality checks with pass/fail criteria

**Step 3: Create template**

- `jurisdiction-rule.json`: Empty config template with comments explaining each field

**Step 4: Test the skill**

Run: Invoke the skill manually with "Add TX landlord_tenant config" and verify:
- 4 agents dispatch in parallel
- Quality gate runs
- Output passes schema validation
- Config is reasonable

**Step 5: Commit**

```bash
git add .claude/skills/petition-engineer/
git commit -m "feat: add Petition Engineer Claude Code skill for config generation and audit"
```

---

## Task 16: Integration Test — Full Flow

End-to-end test of the complete petition quality pipeline.

**Files:**
- Create: `apps/web/tests/unit/validators/integration.test.ts`

**Step 1: Write integration test**

```typescript
// apps/web/tests/unit/validators/integration.test.ts
import { describe, it, expect, vi } from 'vitest'
import { loadJurisdictionRules } from '@lawyer-free/shared/jurisdiction-rules'
import { validateStep } from '@lawyer-free/shared/validators'
import { checkPreGeneration } from '@lawyer-free/shared/validators'
import { runTripleReview } from '@lawyer-free/shared/validators/triple-review'

describe('Petition Quality System — Integration', () => {
  it('full pipeline: step validation → pre-gen check → triple review', async () => {
    // 1. Load config
    const config = loadJurisdictionRules('TX', 'debt_collection')
    expect(config).not.toBeNull()

    // 2. Step validation — facts step with partial data
    const stepResult = validateStep(config!, 'facts', {
      debt_origination_date: '2019-06-15',
      description: 'Collection letter for old credit card debt',
    })
    expect(stepResult.blocks).toHaveLength(0)
    expect(stepResult.warnings.length).toBeGreaterThan(0)

    // 3. Pre-generation check
    const preGenResult = checkPreGeneration(config!, {
      yourInfo: { full_name: 'Test User' },
      opposingParties: [{ full_name: 'ABC Collections' }],
      venue: { county: 'Harris' },
      description: 'Collection letter for old credit card debt from 2019',
      claimDetails: 'General denial. SOL expired.',
      reliefRequested: 'Dismiss with prejudice.',
    })
    expect(preGenResult.ready).toBe(true)

    // 4. Triple review (mocked AI)
    const mockCallAI = vi.fn().mockResolvedValue('check_1: YES — ok')
    const reviewResult = await runTripleReview(config!, 'MOCK PETITION DRAFT', mockCallAI)
    expect(reviewResult.allPassed).toBe(true)
    expect(mockCallAI).toHaveBeenCalledTimes(3)
  })
})
```

**Step 2: Run test**

Run: `cd "lawyer free" && npx turbo test:unit -- --run tests/unit/validators/integration.test.ts`
Expected: PASS

**Step 3: Commit**

```bash
git add apps/web/tests/unit/validators/integration.test.ts
git commit -m "test: add full pipeline integration test for petition quality system"
```

---

## Summary

| Task | What | Layer | AI? |
|------|------|-------|-----|
| 1 | Jurisdiction rule config schema | Foundation | No |
| 2 | TX debt collection config | Foundation | No |
| 3 | Config loader utility | Foundation | No |
| 4 | Step validator | Layer 1 | No |
| 5 | Pre-generation check | Layer 2 | No |
| 6 | Legal correctness agent | Layer 3a | Yes (Haiku) |
| 7 | Jurisdiction compliance agent | Layer 3b | Yes (Haiku) |
| 8 | Plain language agent | Layer 3c | Yes (Haiku) |
| 9 | Triple review orchestrator | Layer 3 | Yes (parallel) |
| 10 | API route for review | API | Yes |
| 11 | Step validation UI | UI | No |
| 12 | Pre-gen checklist UI | UI | No |
| 13 | Triple review panel UI | UI | Yes |
| 14 | Auto-fix pass | Layer 3+ | Yes |
| 15 | Claude Code skill | Dev tooling | N/A |
| 16 | Integration test | Testing | Mock |

**Estimated total:** ~16 tasks, each 2-15 minutes with TDD.
