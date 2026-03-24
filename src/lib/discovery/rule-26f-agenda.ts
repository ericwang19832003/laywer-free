/**
 * Rule 26(f) Conference Agenda Generator
 * Generates a structured agenda document for the Rule 26(f) conference
 */

export interface Rule26fConferenceData {
  caseName: string
  caseNumber: string
  yourName: string
  opposingCounsel: string
  conferenceDate: string
  conferenceTime: string
  conferenceLocation: string
  schedulingOrderDeadline: string | null
}

export interface ConferenceTopic {
  id: string
  label: string
  description: string
  notes: string
  agreed: boolean | null
  contested: boolean
}

interface BaseAgendaItem {
  id: string
  label: string
  description: string
}

export interface Rule26fAgenda {
  header: string
  caseInfo: {
    caseName: string
    caseNumber: string
    conferenceDate: string
    conferenceTime: string
    conferenceLocation: string
  }
  participants: {
    yourName: string
    opposingCounsel: string
  }
  agendaItems: ConferenceTopic[]
  additionalTopics: string[]
  nextSteps: string[]
  signatureBlock: {
    yourSignature: string
    opposingSignature: string
    date: string
  }
}

const DEFAULT_AGENDA_ITEMS: BaseAgendaItem[] = [
  {
    id: 'jurisdiction',
    label: 'Jurisdiction and Service',
    description: 'Confirm all parties have been properly served and court has jurisdiction.',
  },
  {
    id: 'claims_defenses',
    label: 'Claims and Defenses',
    description: 'Brief discussion of plaintiff claims and defendant defenses.',
  },
  {
    id: 'initial_disclosures',
    label: 'Initial Disclosures',
    description: 'When will initial disclosures under Rule 26(a)(1) be exchanged?',
  },
  {
    id: 'discovery_scope',
    label: 'Discovery Scope',
    description: 'What subjects of discovery are anticipated? Any limitations needed?',
  },
  {
    id: 'esi_protocols',
    label: 'ESI and Electronically Stored Information',
    description: 'Format for production, metadata requirements, privilege log procedures.',
  },
  {
    id: 'depositions',
    label: 'Depositions',
    description: 'Number of depositions permitted, notice requirements, who may attend.',
  },
  {
    id: 'discovery_timeline',
    label: 'Discovery Timeline',
    description: 'Proposed dates for discovery opening, closing, and expert disclosures.',
  },
  {
    id: 'pretrial_conference',
    label: 'Pre-Trial Conference',
    description: 'Proposed date for pre-trial conference.',
  },
  {
    id: 'trial_date',
    label: 'Trial Date',
    description: 'Requested trial date and estimated trial length.',
  },
  {
    id: 'settlement',
    label: 'Settlement and ADR',
    description: 'Whether parties will engage in settlement discussions or ADR.',
  },
  {
    id: 'protective_orders',
    label: 'Protective Orders',
    description: 'Need for any protective order regarding confidential information.',
  },
  {
    id: 'other_matters',
    label: 'Other Matters',
    description: 'Any other matters the parties wish to raise.',
  },
]

export function generateRule26fAgenda(data: Rule26fConferenceData): Rule26fAgenda {
  return {
    header: 'RULE 26(f) CONFERENCE AGENDA',
    caseInfo: {
      caseName: data.caseName,
      caseNumber: data.caseNumber,
      conferenceDate: data.conferenceDate,
      conferenceTime: data.conferenceTime,
      conferenceLocation: data.conferenceLocation,
    },
    participants: {
      yourName: data.yourName,
      opposingCounsel: data.opposingCounsel,
    },
    agendaItems: DEFAULT_AGENDA_ITEMS.map((item) => ({
      ...item,
      notes: '',
      agreed: null,
      contested: false,
    })),
    additionalTopics: [],
    nextSteps: [],
    signatureBlock: {
      yourSignature: '',
      opposingSignature: '',
      date: '',
    },
  }
}

export function generateRule26fAgendaText(agenda: Rule26fAgenda): string {
  const lines: string[] = []

  lines.push('='.repeat(70))
  lines.push(agenda.header)
  lines.push('='.repeat(70))
  lines.push('')

  lines.push('CASE INFORMATION')
  lines.push('-'.repeat(40))
  lines.push(`Case Name: ${agenda.caseInfo.caseName}`)
  lines.push(`Case Number: ${agenda.caseInfo.caseNumber}`)
  lines.push(`Conference Date: ${agenda.caseInfo.conferenceDate}`)
  lines.push(`Conference Time: ${agenda.caseInfo.conferenceTime}`)
  lines.push(`Location: ${agenda.caseInfo.conferenceLocation}`)
  lines.push('')

  lines.push('PARTICIPANTS')
  lines.push('-'.repeat(40))
  lines.push(`Your Representative: ${agenda.participants.yourName}`)
  lines.push(`Opposing Counsel: ${agenda.participants.opposingCounsel}`)
  lines.push('')

  lines.push('CONFERENCE AGENDA')
  lines.push('-'.repeat(40))
  lines.push('')

  for (let i = 0; i < agenda.agendaItems.length; i++) {
    const item = agenda.agendaItems[i]
    lines.push(`${i + 1}. ${item.label}`)
    lines.push(`   ${item.description}`)
    if (item.notes) {
      lines.push(`   Notes: ${item.notes}`)
    }
    const status = item.agreed === true ? 'AGREED' : item.agreed === false ? 'NOT AGREED' : 'PENDING'
    lines.push(`   Status: ${status}`)
    lines.push('')
  }

  if (agenda.additionalTopics.length > 0) {
    lines.push('ADDITIONAL TOPICS')
    lines.push('-'.repeat(40))
    for (const topic of agenda.additionalTopics) {
      lines.push(`- ${topic}`)
    }
    lines.push('')
  }

  lines.push('NEXT STEPS')
  lines.push('-'.repeat(40))
  for (let i = 0; i < agenda.nextSteps.length; i++) {
    lines.push(`${i + 1}. ${agenda.nextSteps[i]}`)
  }
  lines.push('')

  lines.push('SIGNATURES')
  lines.push('-'.repeat(40))
  lines.push('')
  lines.push('For Plaintiff/Defendant:')
  lines.push('')
  lines.push('Signature: ____________________________')
  lines.push(`Name: ${agenda.participants.yourName}`)
  lines.push(`Date: ${agenda.signatureBlock.date}`)
  lines.push('')
  lines.push('For Defendant/Plaintiff:')
  lines.push('')
  lines.push('Signature: ____________________________')
  lines.push(`Name: ${agenda.participants.opposingCounsel}`)
  lines.push(`Date: ${agenda.signatureBlock.date}`)
  lines.push('')
  lines.push('='.repeat(70))
  lines.push('This agenda is for planning purposes only and does not constitute legal advice.')
  lines.push('='.repeat(70))

  return lines.join('\n')
}
