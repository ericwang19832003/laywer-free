/**
 * Meet and Confer Generator
 * Generates meet and confer letters and documentation for motion requirements
 */

export interface MeetAndConferData {
  caseName: string
  caseNumber: string
  yourName: string
  yourEmail: string
  yourPhone: string
  opposingCounsel: string
  opposingEmail: string
  motionType: 'compel' | 'sanctions' | 'protective_order' | 'extend_time' | 'other'
  disputeDescription: string
  yourPosition: string
  attemptsToResolve: string[]
  proposedResolution: string
  conferenceDate: string | null
  conferenceOutcome: 'resolved' | 'partially_resolved' | 'unresolved'
  unresolvedIssues: string[]
  letterStyle: 'initial' | 'followup' | 'certification'
}

export interface MeetAndConferDocument {
  type: string
  date: string
  yourName: string
  opposingCounsel: string
  content: string
}

export function generateMeetAndConferLetter(data: MeetAndConferData): string {
  const letterType = {
    initial: 'Initial Meet and Confer Letter',
    followup: 'Follow-Up Meet and Confer Letter',
    certification: 'Certification of Good Faith Conference',
  }[data.letterStyle]

  const motionTypeLabels: Record<string, string> = {
    compel: 'Motion to Compel',
    sanctions: 'Motion for Sanctions',
    protective_order: 'Motion for Protective Order',
    extend_time: 'Motion to Extend Time',
    other: 'Motion',
  }

  const lines: string[] = []

  lines.push('='.repeat(70))
  lines.push(letterType.toUpperCase())
  lines.push('='.repeat(70))
  lines.push('')

  if (data.letterStyle === 'initial' || data.letterStyle === 'followup') {
    lines.push(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }))
    lines.push('')
    lines.push(`Via Email: ${data.opposingEmail}`)
    lines.push('')
    lines.push(`To: ${data.opposingCounsel}`)
    lines.push(`Re: ${data.caseName}, Case No. ${data.caseNumber}`)
    lines.push(`    ${motionTypeLabels[data.motionType]} - Meet and Confer`)
    lines.push('')
    lines.push(`Dear ${data.opposingCounsel.split(' ').pop() || 'Counsel'}:`)
    lines.push('')

    if (data.letterStyle === 'initial') {
      lines.push('I write to discuss the following dispute in good faith before I consider filing a motion.')
      lines.push('')
    } else {
      lines.push('I am writing to follow up on our previous communications regarding this dispute.')
      lines.push('')
    }

    lines.push('DISPUTE DESCRIPTION')
    lines.push('-'.repeat(40))
    lines.push(data.disputeDescription)
    lines.push('')

    lines.push('MY POSITION')
    lines.push('-'.repeat(40))
    lines.push(data.yourPosition)
    lines.push('')

    lines.push('ATTEMPTS TO RESOLVE')
    lines.push('-'.repeat(40))
    for (const attempt of data.attemptsToResolve) {
      lines.push(`- ${attempt}`)
    }
    lines.push('')

    lines.push('PROPOSED RESOLUTION')
    lines.push('-'.repeat(40))
    lines.push(data.proposedResolution)
    lines.push('')

    lines.push('NEXT STEPS')
    lines.push('-'.repeat(40))
    lines.push('I propose that we discuss this matter by phone or video conference.')
    lines.push(`Please contact me at ${data.yourEmail} or ${data.yourPhone} within [X] business days`)
    lines.push('to schedule a meet and confer session.')
    lines.push('')

    lines.push('Sincerely,')
    lines.push('')
    lines.push('')
    lines.push(`${data.yourName}`)
  } else {
    lines.push('CERTIFICATE OF GOOD FAITH CONFERENCE')
    lines.push('')
    lines.push(`Case: ${data.caseName}`)
    lines.push(`Case No.: ${data.caseNumber}`)
    lines.push(`Motion Type: ${motionTypeLabels[data.motionType]}`)
    lines.push(`Conference Date: ${data.conferenceDate || 'Not held'}`)
    lines.push('')

    lines.push('CERTIFICATION')
    lines.push('-'.repeat(40))
    lines.push('')
    lines.push(`I, ${data.yourName}, hereby certify that:`)
    lines.push('')
    lines.push('1. I conferred in good faith with opposing counsel regarding the subject of this motion.')
    lines.push('')

    if (data.conferenceDate) {
      lines.push(`2. The conference occurred on ${data.conferenceDate}.`)
      lines.push('')
    }

    lines.push('3. My efforts to resolve this matter included:')
    for (const attempt of data.attemptsToResolve) {
      lines.push(`   - ${attempt}`)
    }
    lines.push('')

    lines.push('RESULT OF CONFERENCE')
    lines.push('-'.repeat(40))
    const outcomeLabels = {
      resolved: 'RESOLVED - The dispute was resolved without the need for this motion.',
      partially_resolved: 'PARTIALLY RESOLVED - Some issues were resolved; the following remain:',
      unresolved: 'UNRESOLVED - The parties were unable to resolve this dispute.',
    }
    lines.push(outcomeLabels[data.conferenceOutcome])
    lines.push('')

    if (data.unresolvedIssues.length > 0) {
      lines.push('Unresolved Issues:')
      for (const issue of data.unresolvedIssues) {
        lines.push(`- ${issue}`)
      }
      lines.push('')
    }

    lines.push('I certify under penalty of perjury that the foregoing is true and correct.')
    lines.push('')
    lines.push(`Executed on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`)
    lines.push('')
    lines.push('_______________________________')
    lines.push(data.yourName)
    lines.push('Pro Se Plaintiff/Defendant')
  }

  lines.push('')
  lines.push('='.repeat(70))

  return lines.join('\n')
}

export function generateMeetAndConferSummary(data: MeetAndConferData): {
  subject: string
  summary: string
  outcome: string
} {
  const motionTypeLabels: Record<string, string> = {
    compel: 'Motion to Compel',
    sanctions: 'Motion for Sanctions',
    protective_order: 'Motion for Protective Order',
    extend_time: 'Motion to Extend Time',
    other: 'Motion',
  }

  let summary = ''

  if (data.letterStyle === 'initial') {
    summary = `Initial meet and confer letter sent to ${data.opposingCounsel} regarding ${motionTypeLabels[data.motionType]}.`
  } else if (data.letterStyle === 'followup') {
    summary = `Follow-up letter sent to ${data.opposingCounsel} regarding unresolved dispute.`
  } else {
    const outcomeMap = {
      resolved: 'Resolved',
      partially_resolved: 'Partially resolved',
      unresolved: 'Unresolved',
    }
    summary = `Good faith conference certification prepared. Outcome: ${outcomeMap[data.conferenceOutcome]}`
  }

  return {
    subject: `Re: ${data.caseName} - ${motionTypeLabels[data.motionType]} - Meet and Confer`,
    summary,
    outcome: data.conferenceOutcome,
  }
}
