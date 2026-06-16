import type { GuidedStepConfig } from '../types'
import { isPropertyDamageSubType } from './constants'
import { STATE_FILING_INFO } from './state-filing-info'
import type { StateFilingInfo, CourtFilingInfo } from './state-filing-info'

function buildEFilingPrompt(
  stateInfo: StateFilingInfo | undefined,
  courtInfo: CourtFilingInfo | undefined
): string {
  if (!stateInfo) {
    return 'Check with your local court clerk for e-filing options and filing procedures.'
  }

  const parts: string[] = []

  if (stateInfo.eFilingSystem) {
    const sys = stateInfo.eFilingSystem
    parts.push(
      `${stateInfo.name} uses ${sys.name} (${sys.url}) for electronic filing.`
    )
    if (sys.mandatoryNote) {
      parts.push(sys.mandatoryNote + '.')
    }
  }

  if (courtInfo && courtInfo.filingSteps.length > 0) {
    parts.push('')
    parts.push('Steps to file:')
    courtInfo.filingSteps.forEach((step, i) => {
      parts.push(`${i + 1}. ${step}`)
    })
  } else if (!stateInfo.eFilingSystem) {
    parts.push(
      `Filing methods available in ${stateInfo.name}: ${stateInfo.filingMethods.join(', ')}.`
    )
  }

  if (courtInfo?.specialRequirements) {
    parts.push('')
    parts.push(`Note: ${courtInfo.specialRequirements}`)
  }

  return parts.join('\n') || 'Check with your local court clerk for filing procedures.'
}

function buildFeePrompt(
  stateInfo: StateFilingInfo | undefined,
  courtInfo: CourtFilingInfo | undefined,
  courtType: string
): string {
  if (courtInfo) {
    return `Filing fee for ${courtInfo.label}: ${courtInfo.feeRange}. Contact the court clerk for the exact amount, as fees may vary.`
  }
  if (stateInfo) {
    return `Filing fees vary by court in ${stateInfo.name}. Contact your local court clerk for the exact filing fee.`
  }
  return 'Filing fees vary by court. Contact your local court clerk for the exact amount.'
}

function buildFeeWaiverPrompt(
  stateInfo: StateFilingInfo | undefined
): string {
  if (!stateInfo) {
    return 'If you cannot afford the filing fee, you can apply for a fee waiver. Ask the court clerk for the fee waiver application form.'
  }

  let prompt = `If you cannot afford the filing fee, file a "${stateInfo.feeWaiverForm}" with the court.`
  if (stateInfo.feeWaiverRule) {
    prompt += ` This is authorized under ${stateInfo.feeWaiverRule}.`
  }
  return prompt
}

function buildDocumentsPrompt(
  stateInfo: StateFilingInfo | undefined,
  courtType: string
): string {
  const docs = ['Your petition (complaint)']

  if (courtType === 'federal') {
    docs.push('Civil Cover Sheet (Form JS-44)')
    docs.push('Summons form')
    docs.push('Filing fee payment or In Forma Pauperis motion')
  } else if (stateInfo?.abbreviation === 'CA') {
    docs.push('Civil Case Cover Sheet (Form CM-010)')
    docs.push('Summons (Form SUM-100)')
    docs.push('Filing fee payment or fee waiver (Form FW-001)')
  } else if (stateInfo?.abbreviation === 'NY' && courtType === 'ny_supreme') {
    docs.push('Summons')
    docs.push('Filing fee payment or fee waiver application')
    docs.push('Request for Judicial Intervention (RJI) form')
  } else {
    docs.push('Summons form (if required by your court)')
    docs.push('Civil cover sheet (if required by your court)')
    docs.push('Filing fee payment or fee waiver application')
  }

  docs.push('Copies for each defendant (plus one for the court and one for your records)')

  return (
    'Make sure you have the following documents ready before filing:\n\n' +
    docs.map((d, i) => `${i + 1}. ${d}`).join('\n')
  )
}

function buildCourtIdentificationPrompt(
  stateInfo: StateFilingInfo | undefined,
  courtInfo: CourtFilingInfo | undefined,
  courtType: string,
  county: string | null
): string {
  if (courtInfo) {
    const countyText = county ? ` in ${county} County` : ''
    const lines: string[] = [`YOUR FILING COURT: ${courtInfo.label}${countyText}`]
    if (stateInfo?.courtSelectionGuide) {
      lines.push('')
      lines.push(stateInfo.courtSelectionGuide)
    }
    return lines.join('\n')
  }

  // Court type known but not in STATE_FILING_INFO — use the selection guide or generic guidance
  if (stateInfo?.courtSelectionGuide) {
    return stateInfo.courtSelectionGuide
  }

  return 'File in the county where the incident occurred or where the defendant resides. The correct court tier depends on the amount of your claim — contact your local court clerk to confirm.'
}

function buildSolPrompt(
  stateInfo: StateFilingInfo | undefined,
  piSubType?: string
): string {
  if (!stateInfo) {
    return 'Critical: You must file your lawsuit before the statute of limitations expires. Check your state\'s deadline — missing it means losing your right to sue.'
  }

  const isProperty = isPropertyDamageSubType(piSubType)
  const solYears = isProperty
    ? stateInfo.sol.propertyDamage
    : stateInfo.sol.personalInjury
  const claimType = isProperty ? 'property damage' : 'personal injury'

  let prompt = `Critical: In ${stateInfo.name}, ${claimType} claims must be filed within ${solYears} of the date of the incident. Missing this deadline means losing your right to sue.`

  if (stateInfo.sol.note) {
    prompt += `\n\nNote: ${stateInfo.sol.note}`
  }

  return prompt
}

export function createPiFileWithCourtConfig(
  state: string,
  courtType: string,
  county: string | null,
  piSubType?: string
): GuidedStepConfig {
  const stateInfo = STATE_FILING_INFO[state]
  const courtInfo = stateInfo?.courts[courtType]
  const isTier1 = stateInfo && Object.keys(stateInfo.courts).length > 0

  return {
    title: 'File With the Court',
    reassurance:
      'Filing your petition starts the formal legal process.' +
      (stateInfo ? ` Here is guidance specific to ${stateInfo.name}.` : ''),

    questions: [
      {
        id: 'your_filing_court',
        type: 'info',
        prompt: buildCourtIdentificationPrompt(stateInfo, courtInfo, courtType, county),
        acknowledgeLabel: "Got it — I know where to file →",
      },
      {
        id: 'efile_info',
        type: 'info',
        prompt: buildEFilingPrompt(stateInfo, courtInfo),
        acknowledgeLabel: "I'll follow the e-filing steps and save my confirmation receipt",
      },
      {
        id: 'fee_info',
        type: 'info',
        prompt: buildFeePrompt(stateInfo, courtInfo, courtType),
        acknowledgeLabel: "Got it — I'll confirm the exact filing fee with the court clerk",
      },
      {
        id: 'need_fee_waiver',
        type: 'yes_no',
        prompt: 'Do you need to apply for a fee waiver?',
        helpText:
          'If you cannot afford the filing fee, you may be eligible for a fee waiver.',
      },
      {
        id: 'fee_waiver_info',
        type: 'info',
        prompt: buildFeeWaiverPrompt(stateInfo),
        acknowledgeLabel: "I'll file the fee waiver form with the court before submitting my case",
        showIf: (a) => a.need_fee_waiver === 'yes',
      },
      {
        id: 'documents_checklist',
        type: 'info',
        prompt: buildDocumentsPrompt(stateInfo, courtType),
        acknowledgeLabel: "I'll gather all required documents before going to file",
      },
      {
        id: 'sol_critical',
        type: 'info',
        prompt: buildSolPrompt(stateInfo, piSubType),
        acknowledgeLabel: "I understand the statute of limitations — I'll file before the deadline",
      },
    ],

    generateSummary(answers) {
      const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

      if (courtInfo) {
        const countyText = county ? ` in ${county} County` : ''
        items.push({
          status: 'done',
          text: `Filing court confirmed: ${courtInfo.label}${countyText}.`,
        })
      } else {
        items.push({
          status: 'info',
          text:
            stateInfo?.courtSelectionGuide ??
            'File in the county where the incident occurred. Court tier depends on the amount of your claim.',
        })
      }

      if (stateInfo?.eFilingSystem) {
        items.push({
          status: 'info',
          text: `Use ${stateInfo.eFilingSystem.name} (${stateInfo.eFilingSystem.url}) to file electronically.`,
        })
      } else {
        items.push({
          status: 'info',
          text:
            stateInfo
              ? `Filing methods in ${stateInfo.name}: ${stateInfo.filingMethods.join(', ')}.`
              : 'Check with your local court for filing options.',
        })
      }

      items.push({
        status: 'info',
        text: courtInfo
          ? `Filing fee for ${courtInfo.label}: ${courtInfo.feeRange}. Confirm the exact amount with the court clerk.`
          : 'Contact your local court clerk for the exact filing fee.',
      })

      if (answers.need_fee_waiver === 'yes') {
        items.push({
          status: 'needed',
          text: `Apply for a fee waiver: file a "${stateInfo?.feeWaiverForm ?? 'fee waiver application'}" with the court.`,
        })
      }

      const isProperty = isPropertyDamageSubType(piSubType)
      const solYears = stateInfo
        ? isProperty
          ? stateInfo.sol.propertyDamage
          : stateInfo.sol.personalInjury
        : 'varies by state'
      items.push({
        status: 'needed',
        text: `File before your statute of limitations deadline. In ${stateInfo?.name ?? 'your state'}, it is ${solYears} from the date of the incident.`,
      })

      items.push({
        status: 'info',
        text: 'File well before the statute of limitations deadline to account for processing delays.',
      })

      return items
    },
  }
}
