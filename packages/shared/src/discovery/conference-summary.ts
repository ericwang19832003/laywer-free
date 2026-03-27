/**
 * Conference Summary Generator
 * Document outcomes and track next steps from meetings with opposing counsel
 */

export interface ConferenceSummaryData {
  caseName: string
  caseNumber: string
  conferenceType: 'rule_26f' | 'scheduling' | 'pretrial' | 'settlement' | 'status' | 'other'
  conferenceDate: string
  conferenceTime: string
  conferenceLocation: string
  yourName: string
  opposingCounsel: string
  attendees: {
    name: string
    role: string
    present: boolean
  }[]
  topicsDiscussed: {
    topic: string
    yourPosition: string
    opposingPosition: string
    outcome: 'agreed' | 'disagreed' | 'deferred' | 'pending'
    notes: string
  }[]
  agreements: string[]
  disagreements: string[]
  followUpItems: {
    action: string
    responsibleParty: 'plaintiff' | 'defendant' | 'both'
    deadline: string | null
    completed: boolean
  }[]
  nextConference: {
    date: string | null
    time: string | null
    location: string | null
  }
  additionalNotes: string
}

export interface ConferenceSummary {
  id: string
  caseId: string
  conferenceType: string
  conferenceDate: string
  participants: {
    yourName: string
    opposingCounsel: string
    attendees: { name: string; role: string }[]
  }
  summary: {
    topicsDiscussed: { topic: string; outcome: string; notes: string }[]
    agreements: string[]
    disagreements: string[]
  }
  followUpItems: {
    action: string
    responsibleParty: string
    deadline: string | null
    completed: boolean
  }[]
  nextConference: {
    date: string | null
    time: string | null
    location: string | null
  }
  createdAt: string
}

export function generateConferenceSummary(data: ConferenceSummaryData): ConferenceSummary {
  return {
    id: `summary-${Date.now()}`,
    caseId: '',
    conferenceType: data.conferenceType,
    conferenceDate: data.conferenceDate,
    participants: {
      yourName: data.yourName,
      opposingCounsel: data.opposingCounsel,
      attendees: data.attendees.filter(a => a.present).map(a => ({ name: a.name, role: a.role })),
    },
    summary: {
      topicsDiscussed: data.topicsDiscussed.map(t => ({
        topic: t.topic,
        outcome: t.outcome,
        notes: t.notes,
      })),
      agreements: data.agreements,
      disagreements: data.disagreements,
    },
    followUpItems: data.followUpItems.map(f => ({
      action: f.action,
      responsibleParty: f.responsibleParty,
      deadline: f.deadline,
      completed: f.completed,
    })),
    nextConference: data.nextConference,
    createdAt: new Date().toISOString(),
  }
}

export function generateConferenceSummaryText(
  data: ConferenceSummaryData,
  summary?: ConferenceSummary
): string {
  const conferenceTypeLabels: Record<string, string> = {
    rule_26f: 'Rule 26(f) Conference',
    scheduling: 'Scheduling Conference',
    pretrial: 'Pre-Trial Conference',
    settlement: 'Settlement Conference',
    status: 'Status Conference',
    other: 'Conference',
  }

  const lines: string[] = []

  lines.push('='.repeat(70))
  lines.push('CONFERENCE SUMMARY')
  lines.push('='.repeat(70))
  lines.push('')

  lines.push(`Conference Type: ${conferenceTypeLabels[data.conferenceType] || 'Conference'}`)
  lines.push(`Date: ${data.conferenceDate}`)
  lines.push(`Time: ${data.conferenceTime}`)
  lines.push(`Location: ${data.conferenceLocation}`)
  lines.push('')

  lines.push('CASE INFORMATION')
  lines.push('-'.repeat(40))
  lines.push(`Case Name: ${data.caseName}`)
  lines.push(`Case Number: ${data.caseNumber}`)
  lines.push('')

  lines.push('PARTICIPANTS')
  lines.push('-'.repeat(40))
  lines.push(`Your Representative: ${data.yourName}`)
  lines.push(`Opposing Counsel: ${data.opposingCounsel}`)
  if (data.attendees.length > 0) {
    lines.push('')
    lines.push('Other Attendees:')
    for (const attendee of data.attendees.filter(a => a.present)) {
      lines.push(`  - ${attendee.name} (${attendee.role})`)
    }
  }
  lines.push('')

  if (data.topicsDiscussed.length > 0) {
    lines.push('TOPICS DISCUSSED')
    lines.push('-'.repeat(40))
    lines.push('')
    for (const topic of data.topicsDiscussed) {
      lines.push(`Topic: ${topic.topic}`)
      lines.push(`  Your Position: ${topic.yourPosition}`)
      lines.push(`  Opposing Position: ${topic.opposingPosition}`)
      const outcomeLabel = {
        agreed: 'OUTCOME: AGREED',
        disagreed: 'OUTCOME: DISAGREED',
        deferred: 'OUTCOME: DEFERRED',
        pending: 'OUTCOME: PENDING',
      }[topic.outcome]
      lines.push(`  ${outcomeLabel}`)
      if (topic.notes) {
        lines.push(`  Notes: ${topic.notes}`)
      }
      lines.push('')
    }
  }

  if (data.agreements.length > 0) {
    lines.push('AGREEMENTS REACHED')
    lines.push('-'.repeat(40))
    for (const agreement of data.agreements) {
      lines.push(`  [AGREED] ${agreement}`)
    }
    lines.push('')
  }

  if (data.disagreements.length > 0) {
    lines.push('DISAGREEMENTS / OPEN ISSUES')
    lines.push('-'.repeat(40))
    for (const disagreement of data.disagreements) {
      lines.push(`  [OPEN] ${disagreement}`)
    }
    lines.push('')
  }

  if (data.followUpItems.length > 0) {
    lines.push('FOLLOW-UP ITEMS')
    lines.push('-'.repeat(40))
    for (const item of data.followUpItems) {
      const status = item.completed ? '[DONE]' : '[PENDING]'
      const deadline = item.deadline ? ` (Due: ${item.deadline})` : ''
      const party = item.responsibleParty === 'both' ? 'Both Parties' : 
                    item.responsibleParty === 'plaintiff' ? data.yourName : data.opposingCounsel
      lines.push(`  ${status} ${item.action}`)
      lines.push(`     Responsible: ${party}${deadline}`)
    }
    lines.push('')
  }

  if (data.nextConference.date) {
    lines.push('NEXT CONFERENCE')
    lines.push('-'.repeat(40))
    lines.push(`Date: ${data.nextConference.date}`)
    if (data.nextConference.time) lines.push(`Time: ${data.nextConference.time}`)
    if (data.nextConference.location) lines.push(`Location: ${data.nextConference.location}`)
    lines.push('')
  }

  if (data.additionalNotes) {
    lines.push('ADDITIONAL NOTES')
    lines.push('-'.repeat(40))
    lines.push(data.additionalNotes)
    lines.push('')
  }

  lines.push('='.repeat(70))
  lines.push(`Prepared: ${new Date().toLocaleDateString()}`)
  lines.push('='.repeat(70))

  return lines.join('\n')
}

export function generateFollowUpTasks(
  summary: ConferenceSummary,
  caseId: string
): { taskKey: string; action: string; deadline: string | null; responsibleParty: string }[] {
  return summary.followUpItems
    .filter(f => !f.completed && f.deadline)
    .map(f => ({
      taskKey: `followup-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      action: f.action,
      deadline: f.deadline,
      responsibleParty: f.responsibleParty,
    }))
}
