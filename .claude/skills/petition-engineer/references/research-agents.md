# Research Agents

Four parallel research agents gather the information needed to build a jurisdiction rule config. Each agent has a specific focus and output format.

---

## Agent A: Court Rules

### Purpose
Gather procedural filing requirements for the target court.

### What to Search For
- Court name and jurisdictional amounts (e.g., JP Court handles claims under $20,000)
- Filing fees and fee waiver availability
- Filing methods (e-file portals, in-person, mail)
- Required number of copies
- Page limits, font requirements, margin requirements
- Official court forms (URLs to download)
- E-filing system requirements (e.g., Texas uses eFileTexas.gov)

### Recommended Search Queries
- `[STATE] [COURT_TYPE] filing requirements pro se`
- `[STATE] rules of civil procedure filing`
- `[STATE] [COUNTY] court forms [DISPUTE_TYPE]`
- `[STATE] filing fee schedule [COURT_TYPE]`
- `[STATE] fee waiver affidavit of indigency`
- `site:[STATE]courts.gov forms`

### Output Format
```markdown
## Court Rules: [STATE] [DISPUTE_TYPE]

**Court Name:** [full name with jurisdictional amounts]
**Filing Fee:** [amount] (waiver: [yes/no, form name])
**Filing Methods:** [list]
**Page Limit:** [number or "none specified"]
**Font Requirements:** [requirements or "none specified"]
**Margin Requirements:** [requirements or "none specified"]
**Copies Required:** [number]
**Official Forms URL:** [URL]

### Sources
- [source title](URL) -- accessed [date]
- [source title](URL) -- accessed [date]
```

---

## Agent B: Legal Elements

### Purpose
Identify the substantive legal requirements for each section of the document.

### What to Search For
- Required elements of each cause of action or defense
- Relevant statutes with section numbers
- Rules of civil procedure governing pleading requirements
- Affirmative defenses available for this dispute type
- Burden of proof (preponderance, clear and convincing)
- Any special pleading requirements (heightened specificity, verification)

### Recommended Search Queries
- `[STATE] elements [DISPUTE_TYPE] cause of action`
- `[STATE] affirmative defenses [DISPUTE_TYPE]`
- `[STATE] rules civil procedure answer requirements`
- `[STATE] [DISPUTE_TYPE] statute`
- `[STATE] pro se [DISPUTE_TYPE] guide legal aid`
- `[STATE] bar association [DISPUTE_TYPE] practice guide`

### Output Format
```markdown
## Legal Elements: [STATE] [DISPUTE_TYPE]

### Required Sections (in order)
1. **[Section Name]**
   - Element: [description] ([statute cite])
   - Element: [description] ([statute cite])

### Affirmative Defenses Available
- [Defense name]: [brief description] ([statute cite])

### Burden of Proof
[Standard and who bears it]

### Special Requirements
[Verification, heightened pleading, etc.]

### Sources
- [source title](URL) -- accessed [date]
```

---

## Agent C: Rejection Patterns

### Purpose
Identify the most common reasons court clerks reject pro se filings for this dispute type.

### What to Search For
- Common clerk rejection reasons
- Pro se filing mistakes documented by legal aid organizations
- Court self-help center FAQs
- Bar association pro se guides listing common errors
- State-specific formatting requirements that trip up filers

### Recommended Search Queries
- `[STATE] pro se filing mistakes [DISPUTE_TYPE]`
- `[STATE] clerk rejection reasons [DISPUTE_TYPE]`
- `[STATE] self-represented litigant common errors`
- `[STATE] legal aid [DISPUTE_TYPE] filing guide`
- `[STATE] court self-help [DISPUTE_TYPE]`

### Output Format
```markdown
## Rejection Patterns: [STATE] [DISPUTE_TYPE]

### Common Rejections
1. **[Reason]**
   - How to avoid: [actionable instruction]
   - Wizard step: [which step catches this]
   - Source: [URL]

2. **[Reason]**
   - How to avoid: [actionable instruction]
   - Wizard step: [which step catches this]
   - Source: [URL]

### Sources
- [source title](URL) -- accessed [date]
```

---

## Agent D: Plain Language

### Purpose
Build a glossary of legal terms that self-represented litigants need to understand.

### What to Search For
- Legal terms specific to this dispute type
- Terms used in the required sections and legal elements
- Common legal jargon that appears in court forms
- Terms that pro se litigants frequently misunderstand
- Plain English definitions from legal aid resources

### Recommended Search Queries
- `[STATE] [DISPUTE_TYPE] legal terms glossary`
- `[STATE] legal aid [DISPUTE_TYPE] guide plain language`
- `[DISPUTE_TYPE] legal terms explained simple`
- `self-represented litigant [DISPUTE_TYPE] vocabulary`

### Output Format
```markdown
## Glossary: [STATE] [DISPUTE_TYPE]

| Term | Plain English | Statute/Rule |
|------|--------------|--------------|
| [Term] | [8th-grade reading level definition] | [cite] |

### Sources
- [source title](URL) -- accessed [date]
```

---

## When Sources Conflict

If agents find contradictory information:

1. **Official court rules win.** Statutes and rules of civil procedure override blog posts, articles, and even legal aid guides.
2. **More recent wins.** If two official sources conflict, use the more recently updated one. Note the conflict in the config comments.
3. **Flag it.** Add a comment in the generated config: `// NOTE: Conflicting sources on [topic]. Using [source] dated [date]. Verify at [URL].`
4. **Downgrade to warning.** If the conflict cannot be resolved, do not make it a `requiredSection` or `legalElement`. Instead, add it as a `warning` in `stepValidations` with a message explaining the uncertainty.

## Research Cutoff Date

Every generated config must include a comment at the top:
```typescript
// Research date: [YYYY-MM-DD]
// Verify current rules at: [official court URL]
```
