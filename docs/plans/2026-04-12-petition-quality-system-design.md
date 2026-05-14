# Petition Quality System — Design Document

**Date:** 2026-04-12
**Status:** Approved
**Inspired by:** [nuwa-skill](https://github.com/alchaincyf/nuwa-skill) — cognitive framework distillation patterns

## Problem

Three pain points in the current petition flow:
1. **Quality** — generated petitions are too generic, miss jurisdiction-specific nuances
2. **UX** — users get stuck mid-wizard, don't know what to put in fields like "facts" and "claims"
3. **Developer velocity** — adding new state/dispute configs is slow and error-prone

## Solution: Two-Part System

A Claude Code skill for development time + an in-app validation pipeline for runtime, connected by shared jurisdiction rule configs.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   SHARED FOUNDATION                      │
│  Jurisdiction Rule Configs (JSON per state/dispute)      │
│  packages/shared/src/jurisdiction-rules/{state}/{type}   │
└──────────────┬──────────────────────┬────────────────────┘
               │                      │
    ┌──────────▼──────────┐  ┌───────▼────────────────────┐
    │  CLAUDE CODE SKILL  │  │  IN-APP VALIDATION PIPELINE │
    │  "Petition Engineer" │  │  (Runtime, user-facing)     │
    │                      │  │                             │
    │  • Generate configs  │  │  Step Validators (per step) │
    │  • Audit configs     │  │  Triple Review Gate (final) │
    │  • Research court     │  │  • Legal Correctness Agent  │
    │    rules via agents  │  │  • Jurisdiction Agent        │
    │  • Quality check     │  │  • Plain Language Agent      │
    │    generated output  │  │                             │
    └──────────────────────┘  └─────────────────────────────┘
```

## Jurisdiction Rule Config Schema

```typescript
interface JurisdictionRuleConfig {
  state: "TX" | "CA" | "PA" | "NY" | "FL"
  disputeType: string
  subType?: string

  requiredSections: {
    id: string
    label: string
    description: string
    legalElements?: string[]
    minParagraphs?: number
  }[]

  filingRules: {
    courtName: string
    maxPages?: number
    fontRequirements?: string
    marginRequirements?: string
    serviceRequirements: string
    filingFee?: string
    copies?: number
    localFormUrl?: string
  }

  rejectionReasons: {
    reason: string
    howToAvoid: string
    wizardStep: string
  }[]

  stepValidations: {
    [wizardStep: string]: {
      required: string[]
      warnings: {
        condition: string
        message: string
      }[]
    }
  }

  glossary: {
    term: string
    plainEnglish: string
  }[]
}
```

## Claude Code Skill — "Petition Engineer"

### Activation Triggers
- "Add FL divorce petition config"
- "Audit TX debt defense configs"
- "What are CA small claims filing requirements?"

### Mode 1: Generate Config

5-phase pipeline with parallel research agents:

1. **Phase 1: Parallel Research (4 agents)**
   - Agent A: Court Rules — filing requirements, local forms, fee schedules
   - Agent B: Legal Elements — required causes of action, affirmative defenses, burden of proof
   - Agent C: Rejection Patterns — common clerk rejections, pro se mistakes, missing sections
   - Agent D: Plain Language — legal terms in this dispute type, plain English mappings

2. **Phase 2: Synthesize** — merge research into JurisdictionRuleConfig JSON

3. **Phase 3: Quality Gate** (automated checks)
   - All requiredSections have legalElements?
   - Every rejectionReason maps to a wizardStep?
   - stepValidations cover all required fields?
   - Glossary covers all legal terms in legalElements?
   - filingRules has courtName + serviceRequirements?

4. **Phase 4: Generate companion files** — Zod schema, prompt builder, guided-step config

5. **Phase 5: Present for review**

Quality gate adapted from nuwa-skill's triple verification:
- **Source verification** — found in official court rules or statutes
- **Cross-reference** — confirmed by 2+ independent sources
- **Practitioner validation** — matches legal aid guides or pro se handbooks
- Passes 1 test → becomes a `warning` instead of hard requirement

### Mode 2: Audit Config

1. Read existing config
2. Research current court rules (same 4 agents)
3. Diff — flag gaps between config and reality
4. Present gap report with fix suggestions

### Honest Boundaries
- Cannot access paid legal databases (Westlaw, LexisNexis)
- Always verify generated configs against official court websites
- Research cutoff date stamped on every generated config

### File Structure

```
.claude/skills/petition-engineer/
├── SKILL.md
├── references/
│   ├── config-schema.md
│   ├── research-agents.md
│   └── quality-checklist.md
└── templates/
    ├── jurisdiction-rule.json
    ├── zod-schema.ts.template
    └── prompt-builder.ts.template
```

## In-App Validation Pipeline

### Layer 1: Step Validators (Continuous)

Config-driven, zero AI calls. Runs on blur/next at every wizard step.

- **Hard blocks:** required fields empty — explains *why* it's needed
- **Soft warnings (amber):** completeness hints — suggests strengthening the filing
- **Glossary tooltips:** auto-detected legal terms with plain English definitions

### Layer 2: Pre-Generation Check

Config-driven, zero AI calls. Runs when user clicks "Generate Petition."

- Checks every `requiredSection` has sufficient user input
- Gaps shown as a checklist with [Go back to fix] or [Generate anyway with placeholders]

### Layer 3: Triple Review Gate (Post-generation)

Three parallel AI validator calls after Claude generates the petition:

1. **Legal Correctness Agent** — each cause of action has all legalElements? Prayer matches claims? No contradictions? Verification proper?
2. **Jurisdictional Compliance Agent** — required sections present? Format rules met? Certificate of service? Court name correct?
3. **Plain Language Agent** — Flesch-Kincaid ≤ 10th grade for summary? Glossary coverage? No unexplained jargon?

Results merged into a review panel with pass counts. "Auto-fix issues" sends flagged problems back to Claude with specific instructions.

### File Structure

```
packages/shared/src/
├── jurisdiction-rules/
│   ├── tx/
│   ├── ca/
│   ├── pa/
│   ├── ny/
│   └── fl/
├── validators/
│   ├── step-validator.ts
│   ├── pre-generation-check.ts
│   └── triple-review/
│       ├── legal-correctness.ts
│       ├── jurisdiction-compliance.ts
│       └── plain-language.ts
└── glossary/
    └── build-glossary.ts
```

## UX Principles

- Amber warnings, never red errors (anxious users)
- Guidance explains *why* something matters, not just *what's* missing
- Glossary tooltips appear inline where legal terms naturally occur
- Quality check results are simple pass counts, not walls of text
- User always has the option to proceed with gaps (placeholders)
- Copy tone: never use "ERROR", "FAILED", "WARNING", "URGENT", "OVERDUE"

## Cost & Performance

| Layer | AI calls | Cost per petition | Latency |
|-------|----------|-------------------|---------|
| Step validation | 0 | $0 | <10ms |
| Pre-generation check | 0 | $0 | <10ms |
| Triple review | 3 parallel | ~$0.01 | ~2s |
| Auto-fix (if needed) | 0-1 | ~$0.005 | ~3s |
| **Total runtime** | **3-4** | **~$0.015** | **~2-5s** |

- Validators use Haiku (fast, cheap, checklist-style prompts)
- Petition generation stays on Sonnet/Opus
- Claude Code skill: ~2-3 minutes per config generation (4 parallel web research agents)
