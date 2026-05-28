import type { GuidedStepConfig } from '../types'

export function createServeDefendantConfig(state?: string): GuidedStepConfig {
  const isFL = state === 'FL'

  return {
    title: 'Serve the Defendant',
    reassurance: isFL
      ? 'In Florida, the county sheriff or a certified process server personally delivers the papers — certified mail is not allowed.'
      : 'Proper service notifies the defendant and lets the case proceed.',

    questions: [
      {
        id: 'know_defendant_address',
        type: 'yes_no',
        prompt: "Do you have the defendant's current address?",
      },
      {
        id: 'address_help',
        type: 'info',
        prompt:
          'Check public records, social media, or use a skip tracing service.',
        showIf: (answers) => answers.know_defendant_address === 'no',
      },
      {
        id: 'service_method',
        type: 'single_choice',
        prompt: 'Which service method will you use?',
        options: isFL
          ? [
              { value: 'sheriff', label: 'County sheriff (most common in Florida)' },
              { value: 'process_server', label: 'Certified process server' },
              { value: 'not_sure', label: 'Not sure yet' },
            ]
          : [
              { value: 'certified_mail', label: 'Certified mail' },
              { value: 'constable', label: 'Constable' },
              { value: 'process_server', label: 'Process server' },
              { value: 'not_sure', label: 'Not sure yet' },
            ],
      },
      {
        id: 'method_info',
        type: 'info',
        prompt: isFL
          ? "Florida Small Claims Court requires personal service — certified mail is NOT valid (Fla. R. Sm. Cl. P. 7.070). Use the county sheriff ($40–$60) or a certified process server ($50–$100). Provide the defendant's address at filing and the clerk forwards the papers to the sheriff."
          : 'Certified mail is cheapest but can be refused. A constable or process server is more reliable.',
        showIf: (answers) => answers.service_method === 'not_sure',
      },
      {
        id: 'service_completed',
        type: 'yes_no',
        prompt: 'Have you completed service?',
      },
      {
        id: 'proof_filed',
        type: 'yes_no',
        prompt: 'Have you filed proof of service with the court?',
        showIf: (answers) => answers.service_completed === 'yes',
      },
      {
        id: 'cant_find_info',
        type: 'info',
        prompt: isFL
          ? "If the defendant can't be found after diligent effort, ask the court about alias summons, substituted service, or service by publication (Fla. R. Sm. Cl. P. 7.070)."
          : "If the defendant can't be found after diligent effort, ask the court about alternative service (posting on the courthouse door or publication).",
      },
    ],

    generateSummary(answers) {
      const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

      if (answers.know_defendant_address === 'yes') {
        items.push({ status: 'done', text: "You have the defendant's address." })
      } else {
        items.push({
          status: 'needed',
          text: "Locate the defendant's current address using public records, social media, or a skip tracing service.",
        })
      }

      if (answers.service_method && answers.service_method !== 'not_sure') {
        const labels: Record<string, string> = {
          certified_mail: 'certified mail',
          constable: 'constable',
          process_server: 'process server',
          sheriff: 'county sheriff ($40–$60)',
        }
        items.push({
          status: 'done',
          text: `Service method chosen: ${labels[answers.service_method] ?? answers.service_method}.`,
        })
      } else {
        items.push({
          status: 'needed',
          text: isFL
            ? 'Choose a service method: county sheriff or certified process server (certified mail is not valid in Florida).'
            : 'Choose a service method: certified mail, constable, or process server.',
        })
      }

      if (answers.service_completed === 'yes') {
        items.push({ status: 'done', text: 'Service has been completed.' })
      } else {
        items.push({ status: 'needed', text: 'Complete service on the defendant.' })
      }

      if (answers.proof_filed === 'yes') {
        items.push({ status: 'done', text: 'Proof of service filed with the court.' })
      } else if (answers.service_completed === 'yes') {
        items.push({ status: 'needed', text: 'File proof of service with the court.' })
      }

      items.push({
        status: 'info',
        text: isFL
          ? "If the defendant can't be found, ask the court about alias summons or substituted service (Fla. R. Sm. Cl. P. 7.070)."
          : "If the defendant can't be found, ask the court about alternative service options.",
      })

      return items
    },
  }
}

export const serveDefendantConfig = createServeDefendantConfig()
