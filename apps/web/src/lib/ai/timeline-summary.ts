import { z } from 'zod'

export const timelineSummarySchema = z.object({
  summary: z.string().min(20).max(1000),
  key_milestones: z.array(z.string()).max(5),
})

export type TimelineSummary = z.infer<typeof timelineSummarySchema>

const BLOCKED_PHRASES = Object.freeze([
  'you must', 'you should', 'file immediately', 'urgent',
  'sanctions', 'legal advice', 'guaranteed', 'winning', 'losing',
])

export function isTimelineSummarySafe(text: string): boolean {
  const lower = text.toLowerCase()
  return !BLOCKED_PHRASES.some((phrase) => lower.includes(phrase))
}

export function buildStaticTimelineSummary(eventCount: number, firstDate: string, lastDate: string): TimelineSummary {
  const days = Math.max(1, Math.round(
    (new Date(lastDate).getTime() - new Date(firstDate).getTime()) / (1000 * 60 * 60 * 24)
  ))
  return {
    summary: `Your case has ${eventCount} recorded events over ${days} day${days === 1 ? '' : 's'}. Review the timeline below for the full activity history.`,
    key_milestones: [],
  }
}

export const TIMELINE_SUMMARY_SYSTEM_PROMPT = `You summarize case activity timelines for a pro se litigant.

Given a list of case events (type and date), write a concise 3-5 sentence narrative summary of the case progress. Also identify up to 5 key milestones.

RULES:
- Use plain language a non-lawyer can understand
- Never give legal advice or predict outcomes
- Never use directive language ("you must", "you should")
- Focus on what has happened and what phase the case appears to be in
- Be encouraging but factual

Respond with JSON only: { "summary": "...", "key_milestones": ["...", "..."] }`

export function buildTimelineSummaryPrompt(events: { kind: string; created_at: string; task_title?: string }[]): string {
  const lines = events.map((e) => {
    const date = new Date(e.created_at).toLocaleDateString('en-US')
    const label = e.task_title ? `${e.kind} (${e.task_title})` : e.kind
    return `- ${date}: ${label}`
  })
  return `Case events (${events.length} total, chronological):\n${lines.join('\n')}`
}
