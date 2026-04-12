---
name: petition-engineer
description: Generate and audit jurisdiction rule configs for the Lawyer Free petition quality system. Use when adding new state/dispute type support or auditing existing configs.
---

# Petition Engineer

## Activation Triggers

- "Add [STATE] [DISPUTE_TYPE] config" (e.g., "Add FL divorce petition config")
- "Audit [STATE] [DISPUTE_TYPE]" (e.g., "Audit TX debt defense configs")
- "What are [STATE] [DISPUTE_TYPE] filing requirements?"

## Agentic Protocol

Before responding, classify the request:

1. **Generate mode** -- user wants a new jurisdiction rule config
2. **Audit mode** -- user wants to review an existing config against current court rules
3. **Research mode** -- user wants to understand filing requirements without generating a config

## Generate Mode -- 5-Phase Pipeline

### Phase 1: Parallel Research (4 agents)

Dispatch 4 research agents simultaneously:

**Agent A: Court Rules**
- Search for [STATE] [COURT_TYPE] filing requirements
- Local form availability and URLs
- Fee schedules and waiver availability
- Filing methods (e-file, in-person, mail)

**Agent B: Legal Elements**
- Required causes of action elements for [DISPUTE_TYPE]
- Affirmative defenses available
- Burden of proof requirements
- Relevant statutes and rules of civil procedure

**Agent C: Rejection Patterns**
- Common clerk rejection reasons for pro se filings
- Missing section patterns
- Formatting errors
- Procedural mistakes

**Agent D: Plain Language**
- Legal terms specific to this dispute type
- Plain English definitions suitable for self-represented litigants
- Common misunderstandings

### Phase 2: Synthesize

Merge research into a `JurisdictionRuleConfig` JSON object following the schema at:
`packages/shared/src/jurisdiction-rules/schema.ts`

Reference the TX debt collection config for structure:
`packages/shared/src/jurisdiction-rules/tx/debt_collection.ts`

### Phase 3: Quality Gate

The config MUST pass all 5 checks:

1. All `requiredSections` have `legalElements` (at least for substantive sections)
2. Every `rejectionReason` maps to a valid wizard step
3. `stepValidations` cover all required fields referenced in sections
4. `glossary` covers all legal terms in `legalElements`
5. `filingRules` has `courtName` + `serviceRequirements`

Run `jurisdictionRuleConfigSchema.safeParse()` on the output. Fix any validation errors.

### Phase 4: Generate Companion Files

After the config passes validation:
- Create the config file at `packages/shared/src/jurisdiction-rules/[state]/[dispute_type].ts`
- Create or update the barrel export at `packages/shared/src/jurisdiction-rules/[state]/index.ts`
- Register in the loader at `packages/shared/src/jurisdiction-rules/loader.ts`
- Write tests at `apps/web/tests/unit/jurisdiction-rules/[state]-[dispute_type].test.ts`

### Phase 5: Present for Review

Show the user:
- The generated config (formatted)
- Quality gate results (all 5 checks)
- Any assumptions or uncertainties
- Suggested next steps

## Audit Mode

1. Read existing config from `packages/shared/src/jurisdiction-rules/[state]/[dispute_type].ts`
2. Research current court rules (same 4 agents as generate mode)
3. Diff -- flag gaps between config and reality:
   - Missing required sections
   - Outdated fee amounts
   - New local form URLs
   - Legal elements that changed
4. Present gap report with specific fix suggestions

## Quality Gate -- Source Verification

An observation becomes a `requiredSection` or `legalElement` only if it passes:
1. **Source verification** -- found in official court rules or statutes (not just a blog)
2. **Cross-reference** -- confirmed by 2+ independent sources
3. **Practitioner validation** -- matches legal aid guides or pro se handbooks

If it passes only 1 test, it becomes a `warning` in `stepValidations` instead.

## Honest Boundaries

- This skill researches publicly available court rules. It cannot access paid legal databases (Westlaw, LexisNexis).
- Always verify generated configs against official court websites.
- Research has a cutoff date -- stamp it on every generated config.
- Filing rules and fees change frequently -- audit configs periodically.
- This tool provides general legal information, not legal advice.
