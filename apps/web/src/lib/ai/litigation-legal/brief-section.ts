export type SectionType = 'statement_of_facts' | 'argument' | 'introduction' | 'conclusion'

export interface Authority {
  citation: string
  summary: string
}

export interface BriefSectionInput {
  motionTitle: string
  sectionType: SectionType
  keyArgument: string
  caseContext: string
  evidenceSummary: string
  authorities: Authority[]
}

const SECTION_LABELS: Record<SectionType, string> = {
  statement_of_facts: 'Statement of Facts',
  argument: 'Argument',
  introduction: 'Introduction',
  conclusion: 'Conclusion / Prayer for Relief',
}

export function buildBriefSectionPrompt(input: BriefSectionInput): { systemPrompt: string; userPrompt: string } {
  const systemPrompt = `You are helping a self-represented (pro se) litigant draft a section of a court filing.

${input.caseContext}

Rules:
- Write in plain English. Use proper legal formatting (headings in ALL CAPS, numbered arguments).
- Never use directive language such as "you must" or first-person advisory phrasing.
- Never fabricate case law, statutes, or citations. Use only the authorities provided.
- If a factual assertion cannot be supported by the evidence summary, add [VERIFY — source needed].
- If an argument is legally weak, flag it: [WEAK POINT — consider whether to include this].
- Include a bracketed placeholder for any specific fact you do not have: [DATE], [EXHIBIT NUMBER], etc.
- This is a DRAFT for the user's review before filing. Append: "DRAFT — Review carefully before filing."`

  const authoritiesSection = input.authorities.length > 0
    ? `\nAuthorities to cite:\n${input.authorities.map((a) => `- ${a.citation}: ${a.summary}`).join('\n')}`
    : '\n(no case authorities provided — use general procedural language only)'

  const userPrompt = `Draft the ${SECTION_LABELS[input.sectionType]} section for: ${input.motionTitle}

Key argument / point to make:
${input.keyArgument}

Evidence available:
${input.evidenceSummary}
${authoritiesSection}

Write the ${SECTION_LABELS[input.sectionType]} section only. Use proper court filing format.`

  return { systemPrompt, userPrompt }
}
