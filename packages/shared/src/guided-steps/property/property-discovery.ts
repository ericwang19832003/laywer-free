import type { GuidedStepConfig } from '../types'

export const propertyDiscoveryConfig: GuidedStepConfig = {
  title: 'Gather Evidence Through Discovery',
  reassurance:
    'Discovery is how both sides exchange evidence before trial. In property disputes, surveys, appraisals, and title records are especially important.',

  questions: [
    {
      id: 'discovery_overview',
      type: 'info',
      prompt:
        'In a property dispute, discovery helps you gather critical evidence: property surveys, appraisals, title searches, deeds, and communications. Texas allows interrogatories, requests for production, requests for admission, and depositions.',
    },
    {
      id: 'has_survey',
      type: 'single_choice',
      prompt: 'Do you have a current property survey?',
      options: [
        { value: 'yes_recent', label: 'Yes, from the last 5 years' },
        { value: 'yes_old', label: 'Yes, but it is older than 5 years' },
        { value: 'no', label: 'No' },
      ],
    },
    {
      id: 'survey_info',
      type: 'info',
      prompt:
        'A current survey is critical in boundary and encroachment disputes. If your survey is old, consider getting a new one — conditions may have changed. You can also request the other party\'s survey through discovery.',
      showIf: (answers) => answers.has_survey !== 'yes_recent',
    },
    {
      id: 'has_appraisal',
      type: 'single_choice',
      prompt: 'Have you obtained a property appraisal?',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
        { value: 'not_needed', label: 'Not applicable to my dispute' },
      ],
    },
    {
      id: 'appraisal_info',
      type: 'info',
      prompt:
        'An appraisal establishes the property\'s value and any diminished value caused by the dispute. This is important for calculating damages. Request the other party\'s appraisal through discovery as well.',
      showIf: (answers) => answers.has_appraisal === 'no',
    },
    {
      id: 'title_search',
      type: 'single_choice',
      prompt: 'Have you performed a title search on the property?',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
        { value: 'partial', label: 'Partially — I have my deed but not a full search' },
      ],
    },
    {
      id: 'title_search_info',
      type: 'info',
      prompt:
        'A full title search reveals ownership history, liens, easements, and restrictions on the property. This is essential for title disputes and helpful in boundary cases. Your title company or a title abstractor can perform the search.',
      showIf: (answers) => answers.title_search !== 'yes',
    },
    {
      id: 'sent_document_requests',
      type: 'single_choice',
      prompt: 'Have you sent requests for production (document requests) to the other party?',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
        { value: 'not_familiar', label: 'I\'m not familiar with these' },
      ],
    },
    {
      id: 'rfp_info',
      type: 'info',
      prompt:
        'Requests for production ask the other side to provide documents. In a property dispute, you should request: their deed, any surveys, correspondence about the property, contracts, HOA records, insurance policies, repair invoices, and photos of the disputed area.',
      showIf: (answers) => answers.sent_document_requests !== 'yes',
    },
    {
      id: 'sent_interrogatories',
      type: 'single_choice',
      prompt: 'Have you sent interrogatories (written questions) to the other party?',
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
        'Interrogatories are written questions the other party must answer under oath. In a property dispute, ask about: their claimed boundaries, when they first noticed the issue, any prior disputes about the property, and the basis for their property claims. Texas limits you to 25 interrogatories including subparts.',
      showIf: (answers) => answers.sent_interrogatories !== 'yes',
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
      id: 'deposition_info',
      type: 'info',
      prompt:
        'Depositions let you question the other party or witnesses under oath. In property disputes, consider deposing: the other party, their surveyor, previous owners, or any HOA board members involved. Depositions can be expensive due to court reporter fees.',
      showIf: (answers) => answers.planning_depositions !== 'yes',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.has_survey === 'yes_recent') {
      items.push({ status: 'done', text: 'Current property survey available.' })
    } else if (answers.has_survey === 'yes_old') {
      items.push({ status: 'needed', text: 'Property survey is outdated. Consider obtaining a new one.' })
    } else {
      items.push({ status: 'needed', text: 'Obtain a property survey — this is critical for boundary and encroachment disputes.' })
    }

    if (answers.has_appraisal === 'yes') {
      items.push({ status: 'done', text: 'Property appraisal obtained.' })
    } else if (answers.has_appraisal === 'no') {
      items.push({ status: 'needed', text: 'Obtain a property appraisal to establish value and calculate damages.' })
    }

    if (answers.title_search === 'yes') {
      items.push({ status: 'done', text: 'Title search completed.' })
    } else {
      items.push({ status: 'needed', text: 'Perform a full title search to reveal ownership history, liens, and easements.' })
    }

    if (answers.sent_document_requests === 'yes') {
      items.push({ status: 'done', text: 'Document requests sent to the other party.' })
    } else {
      items.push({ status: 'needed', text: 'Send requests for production (deed, surveys, correspondence, contracts, photos).' })
    }

    if (answers.sent_interrogatories === 'yes') {
      items.push({ status: 'done', text: 'Interrogatories sent to the other party.' })
    } else {
      items.push({ status: 'needed', text: 'Consider sending interrogatories (limit: 25 in Texas).' })
    }

    if (answers.planning_depositions === 'yes') {
      items.push({ status: 'done', text: 'Depositions are being planned.' })
    } else if (answers.planning_depositions === 'not_sure') {
      items.push({ status: 'info', text: 'Consider whether depositions would strengthen your property dispute case.' })
    }

    return items
  },
}
