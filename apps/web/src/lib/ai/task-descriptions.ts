import { z } from 'zod'

// --- Schema ---
export const taskDescriptionSchema = z.object({
  description: z.string().min(10).max(500),
  importance: z.enum(['critical', 'important', 'helpful']),
})

export type TaskDescription = z.infer<typeof taskDescriptionSchema>

// --- Safety ---
const BLOCKED_PHRASES = Object.freeze([
  'you must', 'you should', 'file immediately', 'urgent',
  'sanctions', 'winning', 'losing', 'guaranteed',
  'i recommend', 'legal advice',
])

export function isTaskDescriptionSafe(text: string): boolean {
  const lower = text.toLowerCase()
  return !BLOCKED_PHRASES.some((phrase) => lower.includes(phrase))
}

// --- Static fallback ---
const STATIC_DESCRIPTIONS: Record<string, TaskDescription> = {
  welcome: {
    description: 'This introductory step walks you through what to expect in your case journey and how this tool helps you stay organized.',
    importance: 'helpful',
  },
  intake: {
    description: 'Gathering your case details helps us tailor every future step to your specific court, dispute type, and situation.',
    importance: 'critical',
  },
  prepare_filing: {
    description: 'Your initial court filing establishes your legal claims. Getting the format and content right is essential for the court to accept it.',
    importance: 'critical',
  },
  file_with_court: {
    description: 'Submitting your filing to the court officially starts your case. This step tracks what you need to do at the courthouse or online.',
    importance: 'critical',
  },
  preservation_letter: {
    description: 'A preservation letter puts the other side on notice to keep relevant evidence. Sending this early protects your ability to obtain proof later.',
    importance: 'important',
  },
  upload_return_of_service: {
    description: 'Proof of service shows the court that the other party was properly notified. Without it, your case cannot move forward.',
    importance: 'critical',
  },
  confirm_service_facts: {
    description: 'Confirming the dates and method of service lets us calculate your critical deadlines accurately.',
    importance: 'critical',
  },
  wait_for_answer: {
    description: 'After service, the other side has a set number of days to respond. This step tracks that window and prepares you for what comes next.',
    importance: 'helpful',
  },
  check_docket_for_answer: {
    description: 'Checking whether an answer was filed determines your next path — either requesting a default judgment or preparing for discovery.',
    importance: 'critical',
  },
  default_packet_prep: {
    description: 'If the other side did not respond in time, you may be able to win by default. This packet asks the court to enter judgment in your favor.',
    importance: 'critical',
  },
  upload_answer: {
    description: "Uploading the defendant's answer lets us analyze their defenses and counterclaims so you can plan your response strategy.",
    importance: 'important',
  },
  evidence_vault: {
    description: 'Organizing your evidence now makes everything easier later — from discovery requests to trial preparation.',
    importance: 'important',
  },
  discovery_starter_pack: {
    description: 'Discovery is how you legally request information from the other side. This starter pack gives you the standard requests for your case type.',
    importance: 'important',
  },
  understand_removal: {
    description: 'Your case was moved to federal court. Understanding why this happened and what it means helps you decide your next move.',
    importance: 'critical',
  },
  choose_removal_strategy: {
    description: 'You need to decide whether to accept federal court, file to send the case back to state court, or do both. Each path has trade-offs.',
    importance: 'critical',
  },
  prepare_amended_complaint: {
    description: 'Amending your complaint can remove the basis for federal jurisdiction, which is key to getting your case sent back to state court.',
    importance: 'important',
  },
  file_amended_complaint: {
    description: 'Filing your amended complaint with the court puts your changes on record and supports your remand motion.',
    importance: 'important',
  },
  prepare_remand_motion: {
    description: 'A motion to remand asks the federal court to send your case back to state court. This is your formal argument for why removal was improper.',
    importance: 'critical',
  },
  file_remand_motion: {
    description: "Filing your remand motion starts the clock on the court's decision about whether your case belongs in federal or state court.",
    importance: 'critical',
  },
  rule_26f_prep: {
    description: 'Rule 26(f) requires both sides to meet and plan for discovery before the court conference. Being prepared shows the judge you are organized.',
    importance: 'important',
  },
  mandatory_disclosures: {
    description: 'Federal rules require you to disclose key witnesses and documents early, even without being asked. Missing this deadline can limit your evidence at trial.',
    importance: 'critical',
  },
  motion_to_compel: {
    description: 'If the other side is not cooperating with discovery, a motion to compel asks the court to order them to respond.',
    importance: 'important',
  },
  trial_prep_checklist: {
    description: 'Trial preparation covers everything from witness lists to exhibit organization. This checklist ensures nothing is missed before your court date.',
    importance: 'critical',
  },
  appellate_brief: {
    description: "An appellate brief explains to a higher court why the trial court's decision was wrong. Strong legal arguments are essential here.",
    importance: 'critical',
  },
}

export function getStaticTaskDescription(taskKey: string): TaskDescription {
  return STATIC_DESCRIPTIONS[taskKey] ?? {
    description: 'Complete this step to move your case forward. Each task builds on the previous ones to keep your case on track.',
    importance: 'helpful' as const,
  }
}

// --- Prompt builder ---
export const TASK_DESCRIPTION_SYSTEM_PROMPT = `You explain legal procedure steps to a pro se litigant (someone representing themselves in court).

Given a task name and case context, write a 2-3 sentence description explaining WHY this step matters for their specific case. Be encouraging but honest. Use plain language.

RULES:
- Never give specific legal advice
- Never use directive language ("you must", "you should")
- Never predict outcomes ("winning", "losing", "guaranteed")
- Focus on WHY this step matters, not HOW to do it
- Tailor to their court type and dispute type when relevant

Respond with JSON only: { "description": "...", "importance": "critical" | "important" | "helpful" }`

export function buildTaskDescriptionPrompt(input: {
  task_key: string
  task_title: string
  court_type: string
  dispute_type: string | null
  role: string
  completed_tasks: string[]
}): string {
  const lines = [
    `Task: ${input.task_title} (${input.task_key})`,
    `Court: ${input.court_type}`,
    `Dispute: ${input.dispute_type ?? 'general'}`,
    `Role: ${input.role}`,
    `Completed steps: ${input.completed_tasks.length > 0 ? input.completed_tasks.join(', ') : 'none yet'}`,
  ]
  return lines.join('\n')
}
