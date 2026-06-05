import type { GuidedStepConfig } from '../types'
import {
  getPropertyDamageDiscoveryRequests,
  isPiPropertyDamageSubtype,
} from './pi-litigation-file'

const personalInjuryDiscoveryPrepConfig: GuidedStepConfig = {
  title: 'Prepare Your Discovery Requests',
  reassurance:
    'Discovery is how both sides gather evidence before trial. We\'ll help you understand the tools available and plan what to request.',

  questions: [
    {
      id: 'discovery_overview',
      type: 'info',
      prompt:
        'Discovery is the formal process for gathering evidence. In Texas, you can use: interrogatories (written questions), requests for production (documents), requests for admission (confirm/deny facts), and depositions (sworn testimony).',
    },
    {
      id: 'sent_interrogatories',
      type: 'single_choice',
      prompt: 'Have you sent interrogatories (written questions) to the defendant?',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
        { value: 'not_familiar', label: 'I\'m not familiar with these' },
      ],
    },
    {
      id: 'interrogatories_info',
      type: 'info',
      prompt:
        'Interrogatories are written questions the defendant must answer under oath. In a PI case, you\'d typically ask about: the defendant\'s version of events, their insurance coverage, witnesses they know of, and any prior incidents. Texas limits you to 25 interrogatories (including subparts).',
      showIf: (answers) => answers.sent_interrogatories === 'not_familiar',
    },
    {
      id: 'sent_rfps',
      type: 'single_choice',
      prompt: 'Have you sent requests for production (document requests)?',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
        { value: 'not_familiar', label: 'I\'m not familiar with these' },
      ],
    },
    {
      id: 'rfps_info',
      type: 'info',
      prompt:
        'Requests for production ask the other side to provide documents. In a PI case, you\'d request: the defendant\'s insurance policy, incident reports, photos, surveillance footage, maintenance records, cell phone records from the time of the incident, and any internal communications about the incident.',
      showIf: (answers) => answers.sent_rfps === 'not_familiar',
    },
    {
      id: 'planning_depositions',
      type: 'single_choice',
      prompt: 'Are you planning to take any depositions?',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
        { value: 'not_sure', label: 'Not sure yet' },
      ],
    },
    {
      id: 'depositions_info',
      type: 'info',
      prompt:
        'Depositions are live, sworn testimony recorded by a court reporter. In PI cases, you might depose: the defendant, the defendant\'s insurance adjuster, eyewitnesses, and the defendant\'s medical expert (if they have one). Depositions can be expensive due to court reporter fees.',
      showIf: (answers) => answers.planning_depositions !== 'yes',
    },
    {
      id: 'subpoena_medical',
      type: 'single_choice',
      prompt: 'Have you subpoenaed medical records from the defendant\'s insurance company?',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
        { value: 'not_applicable', label: 'Not applicable to my case' },
      ],
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.sent_interrogatories === 'yes') {
      items.push({ status: 'done', text: 'Interrogatories sent to defendant.' })
    } else {
      items.push({ status: 'needed', text: 'Consider sending interrogatories to the defendant (limit: 25 in Texas).' })
    }

    if (answers.sent_rfps === 'yes') {
      items.push({ status: 'done', text: 'Requests for production sent.' })
    } else {
      items.push({ status: 'needed', text: 'Consider sending requests for production (insurance policy, incident reports, photos, etc.).' })
    }

    if (answers.planning_depositions === 'yes') {
      items.push({ status: 'done', text: 'Depositions are being planned.' })
    } else if (answers.planning_depositions === 'not_sure') {
      items.push({ status: 'info', text: 'Consider whether depositions would strengthen your case. They\'re especially useful for locking in witness testimony.' })
    }

    if (answers.subpoena_medical === 'yes') {
      items.push({ status: 'done', text: 'Medical records subpoenaed from defendant\'s insurance.' })
    } else if (answers.subpoena_medical === 'no') {
      items.push({ status: 'needed', text: 'Consider subpoenaing medical records from the defendant\'s insurance company.' })
    }

    return items
  },
}

const propertyDamageDiscoveryQuestions = getPropertyDamageDiscoveryRequests()

export function createPiDiscoveryPrepConfig(piSubType?: string | null): GuidedStepConfig {
  if (!isPiPropertyDamageSubtype(piSubType)) {
    return personalInjuryDiscoveryPrepConfig
  }

  return {
    title: 'Draft Property Damage Discovery Requests',
    reassurance:
      'Discovery should come directly from what the defendant denied. For a property damage case, the strongest requests usually target fault, repair costs, valuation, photos, appraisals, and insurer communications.',

    questions: [
      {
        id: 'answer_reviewed',
        type: 'yes_no',
        prompt: 'Have you reviewed the defendant answer and identified what they denied?',
      },
      {
        id: 'answer_first_info',
        type: 'info',
        prompt:
          'Review the answer first. Discovery requests should be aimed at the exact disputes: fault, repair amount, replacement value, diminished value, loss of use, or mitigation.',
        showIf: (answers) => answers.answer_reviewed === 'no',
      },
      {
        id: 'main_dispute',
        type: 'single_choice',
        prompt: 'What is the main issue the defendant is disputing?',
        showIf: (answers) => answers.answer_reviewed === 'yes',
        options: [
          { value: 'fault', label: 'Who was at fault' },
          { value: 'repair_cost', label: 'Repair or replacement cost' },
          { value: 'loss_of_use', label: 'Loss of use or rental costs' },
          { value: 'mitigation', label: 'Whether I reduced my damages' },
          { value: 'multiple', label: 'Multiple issues' },
        ],
      },
      {
        id: 'draft_pack_info',
        type: 'info',
        prompt: `Suggested first discovery set:\n${propertyDamageDiscoveryQuestions.map((request) => `• ${request}`).join('\n')}`,
        showIf: (answers) => answers.answer_reviewed === 'yes',
      },
      {
        id: 'has_repair_documents',
        type: 'single_choice',
        prompt: 'Do you already have your repair estimate, invoice, photos, and proof of payment organized?',
        showIf: (answers) => answers.answer_reviewed === 'yes',
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'partial', label: 'Some, but not all' },
          { value: 'no', label: 'No' },
        ],
      },
      {
        id: 'service_plan',
        type: 'single_choice',
        prompt: 'How do you plan to serve the discovery requests?',
        showIf: (answers) => answers.answer_reviewed === 'yes',
        options: [
          { value: 'efile_service', label: 'Through e-service / e-filing provider' },
          { value: 'mail', label: 'By mail' },
          { value: 'email_agreement', label: 'By email with agreement' },
          { value: 'not_sure', label: 'Not sure' },
        ],
      },
      {
        id: 'response_deadline_info',
        type: 'info',
        prompt:
          'After discovery is served, track the response deadline. Many courts use a 30-day response period, but the exact rule depends on the court and request type.',
        showIf: (answers) => answers.answer_reviewed === 'yes',
      },
    ],

    generateSummary(answers) {
      const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

      if (answers.answer_reviewed !== 'yes') {
        items.push({ status: 'needed', text: 'Review the defendant answer before drafting discovery.' })
        return items
      }

      items.push({
        status: 'done',
        text: `Primary dispute identified: ${answers.main_dispute?.replace(/_/g, ' ') ?? 'property damage issues'}.`,
      })

      if (answers.has_repair_documents === 'yes') {
        items.push({ status: 'done', text: 'Repair documents and photos are organized for disclosure and trial use.' })
      } else {
        items.push({ status: 'needed', text: 'Organize repair estimates, invoices, photos, payment proof, and any appraisal before serving discovery.' })
      }

      if (answers.service_plan === 'not_sure') {
        items.push({ status: 'needed', text: 'Confirm the proper service method for discovery requests in this court.' })
      } else if (answers.service_plan) {
        items.push({ status: 'info', text: `Discovery service plan: ${answers.service_plan.replace(/_/g, ' ')}.` })
      }

      items.push({ status: 'info', text: 'Track the response deadline immediately after serving the discovery requests.' })

      return items
    },
  }
}

export const piDiscoveryPrepConfig: GuidedStepConfig = personalInjuryDiscoveryPrepConfig
