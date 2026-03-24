/**
 * Rule 26(f) Discovery Plan Generator
 * Generates a written discovery plan document for submission to the court
 */

export interface DiscoveryPlanData {
  caseName: string
  caseNumber: string
  courtName: string
  yourName: string
  opposingCounsel: string
  conferenceDate: string
  proposedDates: {
    initialDisclosures: string
    amendmentsPleading: string
    factDiscoveryOpens: string
    factDiscoveryCloses: string
    expertDisclosurePlaintiff: string
    expertDisclosureDefendant: string
    expertDiscoveryCloses: string
    dispositiveMotions: string
    pretrialConference: string
    trialDate: string
  }
  depositionLimits: string
  interrogatoryLimits: string
  rfpLimits: string
  esiProtocol: string
  privilegeLogProcedure: string
  otherAgreements: string
}

export interface DiscoveryPlan {
  header: string
  caseInfo: {
    caseName: string
    caseNumber: string
    courtName: string
  }
  participants: {
    yourName: string
    opposingCounsel: string
    conferenceDate: string
  }
  proposedSchedule: {
    deadlines: {
      label: string
      proposedDate: string
    }[]
  }
  discoveryLimitations: {
    depositions: string
    interrogatories: string
    requestsForProduction: string
  }
  esiProtocol: string
  privilegeLog: string
  otherAgreements: string
  signatureBlock: {
    yourSignature: string
    opposingSignature: string
    date: string
  }
}

export function generateDiscoveryPlan(data: DiscoveryPlanData): DiscoveryPlan {
  const deadlines = [
    { label: 'Initial Disclosures', proposedDate: data.proposedDates.initialDisclosures },
    { label: 'Amendments to Pleadings', proposedDate: data.proposedDates.amendmentsPleading },
    { label: 'Fact Discovery Opens', proposedDate: data.proposedDates.factDiscoveryOpens },
    { label: 'Fact Discovery Closes', proposedDate: data.proposedDates.factDiscoveryCloses },
    { label: 'Expert Disclosure (Plaintiff)', proposedDate: data.proposedDates.expertDisclosurePlaintiff },
    { label: 'Expert Disclosure (Defendant)', proposedDate: data.proposedDates.expertDisclosureDefendant },
    { label: 'Expert Discovery Closes', proposedDate: data.proposedDates.expertDiscoveryCloses },
    { label: 'Dispositive Motions Due', proposedDate: data.proposedDates.dispositiveMotions },
    { label: 'Pre-Trial Conference', proposedDate: data.proposedDates.pretrialConference },
    { label: 'Trial Date', proposedDate: data.proposedDates.trialDate },
  ]

  return {
    header: 'JOINT DISCOVERY PLAN PURSUANT TO RULE 26(f)',
    caseInfo: {
      caseName: data.caseName,
      caseNumber: data.caseNumber,
      courtName: data.courtName,
    },
    participants: {
      yourName: data.yourName,
      opposingCounsel: data.opposingCounsel,
      conferenceDate: data.conferenceDate,
    },
    proposedSchedule: {
      deadlines,
    },
    discoveryLimitations: {
      depositions: data.depositionLimits,
      interrogatories: data.interrogatoryLimits,
      requestsForProduction: data.rfpLimits,
    },
    esiProtocol: data.esiProtocol,
    privilegeLog: data.privilegeLogProcedure,
    otherAgreements: data.otherAgreements,
    signatureBlock: {
      yourSignature: '',
      opposingSignature: '',
      date: '',
    },
  }
}

export function generateDiscoveryPlanText(plan: DiscoveryPlan): string {
  const lines: string[] = []

  lines.push('='.repeat(70))
  lines.push(plan.header)
  lines.push('='.repeat(70))
  lines.push('')
  lines.push(`IN THE ${plan.caseInfo.courtName.toUpperCase()}`)
  lines.push('')
  lines.push(`${plan.caseInfo.caseName}`)
  lines.push(`Case No. ${plan.caseInfo.caseNumber}`)
  lines.push('')
  lines.push('JOINT DISCOVERY PLAN')
  lines.push('')

  lines.push('I. PARTIES AND CONFERENCE')
  lines.push('-'.repeat(40))
  lines.push('')
  lines.push(`Plaintiff/Defendant: ${plan.participants.yourName}`)
  lines.push(`Defendant/Plaintiff: ${plan.participants.opposingCounsel}`)
  lines.push(`Rule 26(f) Conference Date: ${plan.participants.conferenceDate}`)
  lines.push('')

  lines.push('II. PROPOSED DISCOVERY SCHEDULE')
  lines.push('-'.repeat(40))
  lines.push('')
  for (const deadline of plan.proposedSchedule.deadlines) {
    lines.push(`${deadline.label}: ${deadline.proposedDate}`)
  }
  lines.push('')

  lines.push('III. DISCOVERY LIMITATIONS')
  lines.push('-'.repeat(40))
  lines.push('')
  lines.push(`A. Depositions`)
  lines.push(`   Maximum number: ${plan.discoveryLimitations.depositions}`)
  lines.push('')
  lines.push(`B. Interrogatories`)
  lines.push(`   Maximum number per party: ${plan.discoveryLimitations.interrogatories}`)
  lines.push('')
  lines.push(`C. Requests for Production`)
  lines.push(`   Maximum number per party: ${plan.discoveryLimitations.requestsForProduction}`)
  lines.push('')

  lines.push('IV. ELECTRONICALLY STORED INFORMATION')
  lines.push('-'.repeat(40))
  lines.push('')
  lines.push(plan.esiProtocol || 'To be determined.')
  lines.push('')

  lines.push('V. PRIVILEGE LOG PROCEDURES')
  lines.push('-'.repeat(40))
  lines.push('')
  lines.push(plan.privilegeLog || 'To be determined.')
  lines.push('')

  if (plan.otherAgreements) {
    lines.push('VI. OTHER AGREEMENTS')
    lines.push('-'.repeat(40))
    lines.push('')
    lines.push(plan.otherAgreements)
    lines.push('')
  }

  lines.push('VII. SIGNATURES')
  lines.push('-'.repeat(40))
  lines.push('')
  lines.push('For Plaintiff/Defendant:')
  lines.push('')
  lines.push('Signature: ____________________________')
  lines.push(`Name: ${plan.participants.yourName}`)
  lines.push(`Date: ${plan.signatureBlock.date}`)
  lines.push('')
  lines.push('For Defendant/Plaintiff:')
  lines.push('')
  lines.push('Signature: ____________________________')
  lines.push(`Name: ${plan.participants.opposingCounsel}`)
  lines.push(`Date: ${plan.signatureBlock.date}`)
  lines.push('')
  lines.push('='.repeat(70))
  lines.push('')
  lines.push('CERTIFICATE OF SERVICE')
  lines.push('')
  lines.push('I hereby certify that a copy of this Joint Discovery Plan has been served')
  lines.push('upon all parties by:')
  lines.push('')
  lines.push('     [ ] First Class Mail')
  lines.push('     [ ] Electronic Service')
  lines.push('     [ ] Other: _______________')
  lines.push('')
  lines.push('Date: _______________')
  lines.push('')
  lines.push('Signature: ____________________________')
  lines.push('')
  lines.push('='.repeat(70))

  return lines.join('\n')
}
