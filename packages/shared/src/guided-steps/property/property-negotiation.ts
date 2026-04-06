import type { GuidedStepConfig } from '../types'

export const propertyNegotiationConfig: GuidedStepConfig = {
  title: 'Negotiate a Resolution',
  reassurance:
    'Many property disputes are resolved through negotiation. A reasonable agreement can save both sides the cost and stress of litigation.',

  questions: [
    {
      id: 'ideal_resolution',
      type: 'single_choice',
      prompt: 'What is your ideal resolution?',
      options: [
        { value: 'remove_encroachment', label: 'Other party removes the encroachment' },
        { value: 'boundary_agreement', label: 'Agree on a new boundary line' },
        { value: 'easement_agreement', label: 'Formalize an easement' },
        { value: 'monetary_payment', label: 'Other party pays monetary damages' },
        { value: 'repair_restoration', label: 'Other party repairs or restores the property' },
        { value: 'combination', label: 'A combination of remedies' },
      ],
    },
    {
      id: 'boundary_agreement_info',
      type: 'info',
      prompt:
        'A boundary line agreement should be in writing, signed by both parties, and recorded with the county clerk. Consider having a surveyor mark the agreed line.',
      showIf: (answers) => answers.ideal_resolution === 'boundary_agreement',
    },
    {
      id: 'easement_info',
      type: 'info',
      prompt:
        'An easement agreement should describe the exact area, permitted uses, maintenance responsibilities, and duration. Record it with the county clerk so it binds future owners.',
      showIf: (answers) => answers.ideal_resolution === 'easement_agreement',
    },
    {
      id: 'evidence_gathered',
      type: 'single_choice',
      prompt: 'What evidence do you have to support your position?',
      options: [
        { value: 'survey', label: 'Property survey' },
        { value: 'photos', label: 'Photos or video' },
        { value: 'documents', label: 'Deeds, title records, or contracts' },
        { value: 'multiple', label: 'Multiple types of evidence' },
        { value: 'none', label: 'None yet' },
      ],
    },
    {
      id: 'no_evidence_info',
      type: 'info',
      prompt:
        'Gathering evidence before negotiating strengthens your position. Consider getting a property survey, taking photos of the disputed area, and pulling your deed from the county records.',
      showIf: (answers) => answers.evidence_gathered === 'none',
    },
    {
      id: 'prior_communications',
      type: 'single_choice',
      prompt: 'How have prior communications with the other party gone?',
      options: [
        { value: 'cooperative', label: 'They seem willing to talk' },
        { value: 'unresponsive', label: 'They have not responded' },
        { value: 'hostile', label: 'They are hostile or uncooperative' },
        { value: 'no_contact', label: 'I have not contacted them yet' },
      ],
    },
    {
      id: 'hostile_info',
      type: 'info',
      prompt:
        'If the other party is hostile, consider communicating only in writing (letters or email) to create a record. You may also want to propose mediation through a neutral third party.',
      showIf: (answers) => answers.prior_communications === 'hostile',
    },
    {
      id: 'open_to_mediation',
      type: 'yes_no',
      prompt: 'Would you be open to mediation if direct negotiation stalls?',
    },
    {
      id: 'mediation_info',
      type: 'info',
      prompt:
        'Mediation uses a neutral third party to help both sides reach a voluntary agreement. Many Texas courts require mediation before trial in property disputes. It is typically faster and less expensive than going to trial.',
      showIf: (answers) => answers.open_to_mediation === 'yes',
    },
    {
      id: 'agreement_reached',
      type: 'yes_no',
      prompt: 'Have you reached an agreement with the other party?',
    },
    {
      id: 'agreement_info',
      type: 'info',
      prompt:
        'Put any agreement in writing immediately. For property matters, the agreement should be signed, notarized, and recorded with the county clerk to be enforceable against future owners.',
      showIf: (answers) => answers.agreement_reached === 'yes',
    },
    {
      id: 'no_agreement_info',
      type: 'info',
      prompt:
        'If negotiation fails, the next step is to file a petition with the court. We will guide you through preparing and filing your property dispute petition.',
      showIf: (answers) => answers.agreement_reached === 'no',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.ideal_resolution) {
      const labels: Record<string, string> = {
        remove_encroachment: 'removal of the encroachment',
        boundary_agreement: 'a boundary line agreement',
        easement_agreement: 'a formalized easement',
        monetary_payment: 'monetary damages',
        repair_restoration: 'repair or restoration of the property',
        combination: 'a combination of remedies',
      }
      items.push({
        status: 'done',
        text: `Ideal resolution: ${labels[answers.ideal_resolution] || answers.ideal_resolution}.`,
      })
    }

    if (answers.evidence_gathered === 'none') {
      items.push({
        status: 'needed',
        text: 'Gather evidence (survey, photos, deed, title records) before negotiating.',
      })
    } else if (answers.evidence_gathered) {
      items.push({
        status: 'done',
        text: 'Evidence gathered to support negotiation position.',
      })
    }

    if (answers.prior_communications === 'hostile') {
      items.push({
        status: 'info',
        text: 'Other party is hostile. Communicate in writing and consider mediation.',
      })
    } else if (answers.prior_communications === 'unresponsive') {
      items.push({
        status: 'needed',
        text: 'Other party has not responded. Follow up in writing with a clear deadline.',
      })
    }

    if (answers.open_to_mediation === 'yes') {
      items.push({
        status: 'info',
        text: 'Open to mediation. Many Texas courts require mediation before trial in property disputes.',
      })
    }

    if (answers.agreement_reached === 'yes') {
      items.push({
        status: 'done',
        text: 'Agreement reached. Put it in writing, have it notarized, and record it with the county clerk.',
      })
    } else if (answers.agreement_reached === 'no') {
      items.push({
        status: 'needed',
        text: 'No agreement reached. Next step: file a petition with the court.',
      })
    }

    return items
  },
}
