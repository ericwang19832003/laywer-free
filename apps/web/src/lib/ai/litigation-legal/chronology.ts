export interface ChronologyEntry {
  entry_date: string
  description: string
  source: 'task_event' | 'evidence' | 'document' | 'manual'
  source_id?: string
  significance: 'high' | 'medium' | 'background'
  perspective: 'plaintiff' | 'defendant'
}

interface ChronologyInput {
  caseName: string
  perspective: 'plaintiff' | 'defendant'
  caseContext: string
  rawFacts: string[]
}

export function buildChronologyPrompt(input: ChronologyInput): { systemPrompt: string; userPrompt: string } {
  const significanceGuide = input.perspective === 'plaintiff'
    ? '- "high": events that establish elements of the claim, close gaps the defense will open, or start limitation clocks in your favor\n- "medium": events that support the claim but may be subject to challenge\n- "background": context only'
    : '- "high": events that break elements of the claim, support affirmative defenses, or undermine plaintiff\'s timeline\n- "medium": events that weaken plaintiff\'s narrative\n- "background": context only'

  const systemPrompt = `You are helping a self-represented (${input.perspective}) litigant build a case chronology.

${input.caseContext}

Your job: extract dated events from the provided facts, de-duplicate them, and return a JSON array.

Significance tagging (from ${input.perspective} perspective):
${significanceGuide}

Return ONLY valid JSON. No explanation, no markdown. Format:
[{"date":"YYYY-MM-DD","description":"plain English description","significance":"high|medium|background","source":"manual"}]`

  const userPrompt = `Build a chronology from these case facts. Extract every event with a date. De-duplicate overlapping events. Tag each with significance from the ${input.perspective}'s perspective.

Facts:
${input.rawFacts.join('\n')}`

  return { systemPrompt, userPrompt }
}

export function parseChronologyResponse(
  raw: string,
  perspective: 'plaintiff' | 'defendant'
): ChronologyEntry[] {
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((e) => e.date && e.description)
      .map((e) => ({
        entry_date: String(e.date).slice(0, 10),
        description: String(e.description),
        source: (['task_event', 'evidence', 'document', 'manual'].includes(e.source) ? e.source : 'manual') as ChronologyEntry['source'],
        source_id: e.source_id ?? undefined,
        significance: (['high', 'medium', 'background'].includes(e.significance) ? e.significance : 'background') as ChronologyEntry['significance'],
        perspective,
      }))
  } catch {
    return []
  }
}
