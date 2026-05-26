import type { GuidedStepConfig } from '../types'
import { getSmallClaimsInfo } from '../state-litigation-info'

export function createScServiceGuideConfig(state?: string): GuidedStepConfig {
  const sc = getSmallClaimsInfo(state)

  return {
    title: 'How to Serve the Other Party',
    reassurance: `The court handles most of the service process for you in ${sc.courtAbbrev} — just provide the defendant's address.`,

    questions: [
      {
        id: 'know_service_basics',
        type: 'yes_no',
        prompt: `Do you know how service of process works in ${sc.courtAbbrev}?`,
      },
      {
        id: 'service_basics_info',
        type: 'info',
        prompt: `Service means officially delivering the lawsuit papers to the defendant. In ${sc.courtAbbrev}, the clerk typically handles this for you when you file. The most common method is constable or process server delivery — they physically deliver the papers to the defendant.`,
        showIf: (answers) => answers.know_service_basics === 'no',
      },
      {
        id: 'have_defendant_address',
        type: 'yes_no',
        prompt: "Do you have the defendant's current physical address?",
      },
      {
        id: 'address_info',
        type: 'info',
        prompt: `You need the defendant's physical address for service. Check your original contract, business filings (${sc.sosName}: ${sc.sosUrl}), or property records if you need to find their address.`,
        showIf: (answers) => answers.have_defendant_address === 'no',
      },
      {
        id: 'service_method',
        type: 'single_choice',
        prompt: 'Which service method will be used?',
        options: [
          { value: 'constable', label: 'Constable / process server (most common)' },
          { value: 'certified_mail', label: 'Certified mail (if allowed in your county)' },
          { value: 'not_sure', label: 'Not sure — the clerk will advise' },
        ],
      },
      {
        id: 'constable_info',
        type: 'info',
        prompt: `Constable or process server delivery is the most common and reliable method in ${sc.courtAbbrev}. The fee is typically $50–$100. In many courts, when you file your claim, the clerk issues citation and arranges delivery. You just pay the fee and provide the address.`,
        showIf: (answers) => answers.service_method === 'constable',
      },
      {
        id: 'certified_mail_info',
        type: 'info',
        prompt: "Some courts allow service by certified mail with return receipt requested. This is cheaper but less reliable — the defendant can refuse to sign. If certified mail fails, you may need to switch to constable or process server.",
        showIf: (answers) => answers.service_method === 'certified_mail',
      },
      {
        id: 'know_service_fee',
        type: 'yes_no',
        prompt: 'Can you afford the service fee ($50–$100)?',
      },
      {
        id: 'service_fee_info',
        type: 'info',
        prompt: `If you received a fee waiver, service fees are also waived. Otherwise, the service fee is typically $50–$100 and is paid when you file or separately to the constable's office.`,
        showIf: (answers) => answers.know_service_fee === 'no',
      },
      {
        id: 'worried_about_failure',
        type: 'yes_no',
        prompt: 'Are you concerned the defendant might be hard to locate or avoid service?',
      },
      {
        id: 'service_failure_info',
        type: 'info',
        prompt: "If the constable can't serve the defendant, you have options: (1) Request an alias citation to try again at a different address or time. (2) Ask for service by posting — the constable posts the citation on the defendant's door. (3) File a motion for alternative service if the defendant is actively avoiding service. The clerk or judge can guide you through these options.",
        showIf: (answers) => answers.worried_about_failure === 'yes',
      },
      {
        id: 'service_complete',
        type: 'yes_no',
        prompt: 'Has the defendant been successfully served?',
      },
      {
        id: 'proof_of_service_info',
        type: 'info',
        prompt: "Once service is complete, the constable or process server files proof of service with the court. This is your proof that the defendant was notified. You don't usually need to do anything — the court receives this automatically. Your hearing will be set 10–21 days after service.",
        showIf: (answers) => answers.service_complete === 'no',
      },
    ],

    generateSummary(answers) {
      const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

      if (answers.know_service_basics === 'yes') {
        items.push({ status: 'done', text: `Understands ${sc.courtAbbrev} service process.` })
      } else {
        items.push({
          status: 'info',
          text: "The clerk handles service — the constable or process server delivers papers to the defendant at the address you provide.",
        })
      }

      if (answers.have_defendant_address === 'yes') {
        items.push({ status: 'done', text: "Defendant's address available for service." })
      } else {
        items.push({
          status: 'needed',
          text: "Locate the defendant's current physical address before filing.",
        })
      }

      if (answers.service_method && answers.service_method !== 'not_sure') {
        const labels: Record<string, string> = {
          constable: 'constable / process server ($50–$100)',
          certified_mail: 'certified mail',
        }
        items.push({
          status: 'done',
          text: `Service method: ${labels[answers.service_method]}.`,
        })
      } else {
        items.push({
          status: 'info',
          text: 'The clerk will advise on service method. Constable / process server is most common ($50–$100).',
        })
      }

      if (answers.know_service_fee === 'yes') {
        items.push({ status: 'done', text: 'Service fee is affordable.' })
      } else {
        items.push({
          status: 'needed',
          text: 'Prepare $50–$100 for service fee, or confirm fee waiver covers it.',
        })
      }

      if (answers.worried_about_failure === 'yes') {
        items.push({
          status: 'info',
          text: 'If service fails: alias citation, service by posting, or motion for alternative service are available.',
        })
      }

      if (answers.service_complete === 'yes') {
        items.push({ status: 'done', text: 'Defendant has been served. Hearing will be scheduled.' })
      } else {
        items.push({
          status: 'needed',
          text: 'Await confirmation of service. Proof of service is filed with the court automatically.',
        })
      }

      return items
    },
  }
}

export const scServiceGuideConfig = createScServiceGuideConfig()
