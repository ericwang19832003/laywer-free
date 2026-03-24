/**
 * Mediation Conference Agenda Generator
 */

export interface MediationAgendaItem {
  id: string
  label: string
  description: string
  yourPosition: string
  notes: string
}

export interface MediationAgenda {
  caseName: string
  caseNumber: string
  mediator: string
  mediationDate: string
  mediationTime: string
  mediationLocation: string
  parties: {
    you: string
    opposing: string
  }
  agendaItems: MediationAgendaItem[]
  issues: {
    issue: string
    yourDemand: string
    opponentOffer: string
    notes: string
  }[]
  settlementTerms: {
    monetary: string
    nonMonetary: string
  }
}

export function generateMediationAgenda(data: {
  caseName: string
  caseNumber: string
  mediator: string
  parties: { you: string; opposing: string }
  issues: { issue: string }[]
}): MediationAgenda {
  return {
    caseName: data.caseName,
    caseNumber: data.caseNumber,
    mediator: data.mediator,
    mediationDate: '',
    mediationTime: '',
    mediationLocation: '',
    parties: data.parties,
    agendaItems: [
      { id: 'intro', label: 'Introduction', description: 'Mediator explains process and ground rules', yourPosition: '', notes: '' },
      { id: 'opening', label: 'Opening Statements', description: 'Each party presents their opening position', yourPosition: '', notes: '' },
      { id: 'discussion', label: 'Joint Discussion', description: 'Open discussion of key issues', yourPosition: '', notes: '' },
      { id: 'caucus', label: 'Private Caucuses', description: 'Separate meetings with mediator', yourPosition: '', notes: '' },
      { id: 'negotiation', label: 'Negotiation', description: 'Work toward mutually acceptable terms', yourPosition: '', notes: '' },
      { id: 'agreement', label: 'Agreement or Impasse', description: 'Document agreement or declare impasse', yourPosition: '', notes: '' },
    ],
    issues: data.issues.map((issue) => ({
      issue: issue.issue,
      yourDemand: '',
      opponentOffer: '',
      notes: '',
    })),
    settlementTerms: {
      monetary: '',
      nonMonetary: '',
    },
  }
}

export function generateMediationAgendaText(agenda: MediationAgenda): string {
  const lines: string[] = []

  lines.push('='.repeat(70))
  lines.push('MEDIATION CONFERENCE AGENDA')
  lines.push('='.repeat(70))
  lines.push('')

  lines.push('CASE INFORMATION')
  lines.push('-'.repeat(40))
  lines.push(`Case: ${agenda.caseName}`)
  lines.push(`Case Number: ${agenda.caseNumber}`)
  lines.push(`Mediator: ${agenda.mediator}`)
  lines.push(`Date: ${agenda.mediationDate || '[Date]'}`)
  lines.push(`Time: ${agenda.mediationTime || '[Time]'}`)
  lines.push(`Location: ${agenda.mediationLocation || '[Location]'}`)
  lines.push('')

  lines.push('PARTIES')
  lines.push('-'.repeat(40))
  lines.push(`Mediating Party: ${agenda.parties.you}`)
  lines.push(`Opposing Party: ${agenda.parties.opposing}`)
  lines.push('')

  if (agenda.issues.length > 0) {
    lines.push('KEY ISSUES TO RESOLVE')
    lines.push('-'.repeat(40))
    for (const issue of agenda.issues) {
      lines.push(`Issue: ${issue.issue}`)
      if (issue.yourDemand) lines.push(`  Your Position: ${issue.yourDemand}`)
      if (issue.opponentOffer) lines.push(`  Opposing Position: ${issue.opponentOffer}`)
      if (issue.notes) lines.push(`  Notes: ${issue.notes}`)
      lines.push('')
    }
  }

  lines.push('SETTLEMENT TERMS')
  lines.push('-'.repeat(40))
  lines.push(`Monetary Terms: ${agenda.settlementTerms.monetary || '[To be discussed]'}`)
  lines.push(`Non-Monetary Terms: ${agenda.settlementTerms.nonMonetary || '[To be discussed]'}`)
  lines.push('')

  lines.push('PREPARATION NOTES')
  lines.push('-'.repeat(40))
  lines.push(`Your Walkaway Point: ____________________________`)
  lines.push(`Settlement Authority: ____________________________`)
  lines.push(`BATNA (if no settlement): ____________________________`)
  lines.push('')

  lines.push('='.repeat(70))
  lines.push('Remember: Be prepared to listen, stay calm, and focus on solutions.')
  lines.push('='.repeat(70))

  return lines.join('\n')
}
