interface SubpoenaTriageInput {
  state: string
  caseContext: string
  subpoenaText: string
}

const STATE_SUBPOENA_NOTES: Record<string, string> = {
  TX: 'Texas: Document subpoenas typically allow 10-30 days to respond. You may file a motion to quash or modify within that time. See TRCP Rule 176.',
  CA: 'California: Consumer records subpoenas require 15 days notice. Personal records subpoenas require 10 days. See CCP §§ 1985-1987.',
  NY: 'New York: Subpoenas are governed by CPLR Article 23. Response time depends on the type — typically 20 days for deposition, as specified for documents.',
  FL: 'Florida: See Fla. R. Civ. P. 1.351 for subpoenas to non-parties. Response time is typically set in the subpoena itself.',
}

export function buildSubpoenaTriagePrompt(input: SubpoenaTriageInput): { systemPrompt: string; userPrompt: string } {
  const stateNote = STATE_SUBPOENA_NOTES[input.state] ?? `${input.state}: Check your state's rules of civil procedure for subpoena response requirements.`

  const systemPrompt = `You are helping a self-represented litigant understand and respond to a subpoena they received.

${input.caseContext}

${stateNote}

Rules:
- Use plain English. Explain legal terms when first used.
- Never predict outcomes or give legal advice.
- Structure your response as:
  1. What type of subpoena this is (document, deposition, or third-party)
  2. What it is asking for
  3. The response deadline (based on state rules, or as stated in the subpoena)
  4. Potential objection grounds to raise
  5. Step-by-step checklist for responding
- Flag urgent deadlines prominently.`

  const userPrompt = `Triage this subpoena. Classify it, explain what it requires in plain English, identify the response deadline, and provide a response checklist.

Subpoena text:
${input.subpoenaText}`

  return { systemPrompt, userPrompt }
}
