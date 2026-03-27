import type { GuidedStepConfig } from '../types'

export const propertyPostResolutionConfig: GuidedStepConfig = {
  title: 'After Resolution',
  reassurance:
    'Properly wrapping up a property dispute ensures the outcome is recorded and enforceable for the long term.',

  questions: [
    {
      id: 'case_outcome',
      type: 'single_choice',
      prompt: 'What was the outcome of your property dispute?',
      options: [
        { value: 'settled', label: 'Settled by agreement' },
        { value: 'won_trial', label: 'Won at trial' },
        { value: 'lost_trial', label: 'Lost at trial' },
        { value: 'still_pending', label: 'Still pending' },
      ],
    },
    {
      id: 'agreement_recorded',
      type: 'yes_no',
      prompt: 'Has the settlement agreement been recorded with the county clerk?',
      showIf: (answers) => answers.case_outcome === 'settled',
    },
    {
      id: 'recording_info',
      type: 'info',
      prompt:
        'For property disputes, it is critical to record any agreement, judgment, or deed modification with the county clerk\'s office. This makes the resolution binding on future owners and provides public notice of the changed property rights.',
      showIf: (answers) => answers.case_outcome === 'settled' && answers.agreement_recorded === 'no',
    },
    {
      id: 'judgment_recorded',
      type: 'yes_no',
      prompt: 'Has the court judgment been recorded with the county clerk?',
      showIf: (answers) => answers.case_outcome === 'won_trial',
    },
    {
      id: 'judgment_recording_info',
      type: 'info',
      prompt:
        'Record the judgment with the county clerk to provide public notice. For boundary or title rulings, you may also need to file an amended deed or plat reflecting the court\'s decision.',
      showIf: (answers) => answers.case_outcome === 'won_trial' && answers.judgment_recorded === 'no',
    },
    {
      id: 'enforcement_needed',
      type: 'yes_no',
      prompt: 'Does the other party need to take action (remove structure, pay damages, etc.)?',
      showIf: (answers) => answers.case_outcome === 'won_trial' || answers.case_outcome === 'settled',
    },
    {
      id: 'enforcement_complied',
      type: 'yes_no',
      prompt: 'Has the other party complied with the judgment or agreement?',
      showIf: (answers) => answers.enforcement_needed === 'yes',
    },
    {
      id: 'enforcement_info',
      type: 'info',
      prompt:
        'If the other party does not comply, you may need to file a motion to enforce the judgment or hold them in contempt. For monetary judgments, collection methods include property liens, wage garnishment, or bank levies. For injunctive relief (remove a structure), the court can hold them in contempt.',
      showIf: (answers) => answers.enforcement_complied === 'no',
    },
    {
      id: 'survey_updated',
      type: 'yes_no',
      prompt: 'Has the property survey been updated to reflect the resolution?',
      showIf: (answers) => answers.case_outcome === 'won_trial' || answers.case_outcome === 'settled',
    },
    {
      id: 'survey_update_info',
      type: 'info',
      prompt:
        'If the resolution changed any boundaries or property rights, get an updated survey to reflect the new state. This protects you if the property is ever sold or refinanced.',
      showIf: (answers) => answers.survey_updated === 'no',
    },
    {
      id: 'considering_appeal',
      type: 'yes_no',
      prompt: 'Are you considering an appeal?',
      showIf: (answers) => answers.case_outcome === 'lost_trial',
    },
    {
      id: 'appeal_info',
      type: 'info',
      prompt:
        'In Texas, you must file a notice of appeal within 30 days of the judgment. An appeal must show the trial court made a legal error — simply disagreeing with the outcome is not enough. Property cases can involve complex factual findings that are difficult to overturn on appeal.',
      showIf: (answers) => answers.considering_appeal === 'yes',
    },
    {
      id: 'title_insurance_claim',
      type: 'yes_no',
      prompt: 'If you have title insurance, have you filed a claim with your title insurer?',
      showIf: (answers) => answers.case_outcome === 'lost_trial' || answers.case_outcome === 'settled',
    },
    {
      id: 'title_insurance_info',
      type: 'info',
      prompt:
        'If your property dispute involved a title defect, lien, or encumbrance that should have been caught, your title insurance policy may cover your losses. Contact your title company to file a claim.',
      showIf: (answers) => answers.title_insurance_claim === 'no',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []
    const outcome = answers.case_outcome

    if (outcome === 'settled') {
      items.push({ status: 'done', text: 'Property dispute settled by agreement.' })

      if (answers.agreement_recorded === 'yes') {
        items.push({ status: 'done', text: 'Settlement agreement recorded with the county clerk.' })
      } else {
        items.push({ status: 'needed', text: 'Record the settlement agreement with the county clerk to bind future owners.' })
      }
    } else if (outcome === 'won_trial') {
      items.push({ status: 'done', text: 'Won at trial.' })

      if (answers.judgment_recorded === 'yes') {
        items.push({ status: 'done', text: 'Judgment recorded with the county clerk.' })
      } else {
        items.push({ status: 'needed', text: 'Record the judgment with the county clerk. File an amended deed or plat if needed.' })
      }
    } else if (outcome === 'lost_trial') {
      items.push({ status: 'info', text: 'Lost at trial.' })

      if (answers.considering_appeal === 'yes') {
        items.push({ status: 'needed', text: 'File your notice of appeal within 30 days. You must show the court made a legal error.' })
      } else {
        items.push({ status: 'info', text: 'Not pursuing an appeal. The deadline is 30 days from the judgment.' })
      }
    } else if (outcome === 'still_pending') {
      items.push({ status: 'info', text: 'Case is still pending. Return to this step once a resolution is reached.' })
    }

    if (answers.enforcement_needed === 'yes' && answers.enforcement_complied === 'no') {
      items.push({ status: 'needed', text: 'Other party has not complied. Consider filing a motion to enforce the judgment.' })
    } else if (answers.enforcement_complied === 'yes') {
      items.push({ status: 'done', text: 'Other party has complied with the judgment or agreement.' })
    }

    if (answers.survey_updated === 'no' && (outcome === 'won_trial' || outcome === 'settled')) {
      items.push({ status: 'needed', text: 'Update the property survey to reflect the resolution.' })
    }

    if (answers.title_insurance_claim === 'no') {
      items.push({ status: 'info', text: 'Consider filing a claim with your title insurer if the dispute involved a covered defect.' })
    }

    return items
  },
}
