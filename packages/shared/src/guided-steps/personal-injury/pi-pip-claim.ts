import type { GuidedStepConfig } from '../types'

export const piPipClaimConfig: GuidedStepConfig = {
  title: 'Filing Your PIP Insurance Claim',
  reassurance:
    'PIP (Personal Injury Protection) pays YOUR medical bills regardless of who caused the accident. It\'s money you\'ve already paid for.',

  questions: [
    {
      id: 'has_auto_insurance',
      type: 'yes_no',
      prompt: 'Do you have auto insurance?',
      helpText:
        'If you own a car and have insurance, you likely have PIP coverage unless you specifically rejected it in writing.',
    },
    {
      id: 'no_insurance_info',
      type: 'info',
      prompt:
        'Without auto insurance, PIP is not available to you. However, you can still pursue a claim directly against the at-fault driver. Skip ahead to the demand letter or filing steps.',
      showIf: (answers) => answers.has_auto_insurance === 'no',
    },
    {
      id: 'pip_overview',
      type: 'info',
      prompt:
        'Texas PIP coverage:\n- Pays up to your policy limit for medical expenses\n- Pays 80% of lost wages (up to $10,000 typically)\n- Covers funeral expenses\n- Available regardless of fault\n- Must file within 2 years',
      showIf: (answers) => answers.has_auto_insurance === 'yes',
    },
    {
      id: 'pip_already_filed',
      type: 'yes_no',
      prompt: 'Have you already filed a PIP claim with your auto insurance?',
      showIf: (answers) => answers.has_auto_insurance === 'yes',
    },
    {
      id: 'pip_filed_info',
      type: 'info',
      prompt:
        'Good — make sure you follow up regularly. Your insurer must respond within 15 business days of receiving your claim. If they deny or delay, you may have a bad faith claim against them.',
      showIf: (answers) =>
        answers.has_auto_insurance === 'yes' && answers.pip_already_filed === 'yes',
    },
    {
      id: 'how_to_file_pip',
      type: 'info',
      prompt:
        'HOW TO FILE:\n1. Call your auto insurance company (number on your insurance card)\n2. Say: \'I was in an accident and I need to file a PIP claim\'\n3. They\'ll send forms — fill out completely\n4. Attach: police report, medical bills, proof of lost wages\n5. Submit within 30 days of the accident for fastest processing\n\nIMPORTANT: Filing a PIP claim does NOT affect your rates. It is YOUR coverage that YOU paid for.',
      showIf: (answers) =>
        answers.has_auto_insurance === 'yes' && answers.pip_already_filed === 'no',
    },
    {
      id: 'has_um_uim',
      type: 'yes_no',
      prompt: 'Do you have Uninsured/Underinsured Motorist (UM/UIM) coverage?',
      helpText:
        'Check your declarations page (the summary sheet that lists your coverages and limits). Look for "UM" or "UIM" or "Uninsured Motorist."',
      showIf: (answers) => answers.has_auto_insurance === 'yes',
    },
    {
      id: 'um_uim_info',
      type: 'info',
      prompt:
        'If the at-fault driver has no insurance (or not enough), YOUR UM/UIM coverage pays the difference up to your policy limit.\n\nThis is especially important because roughly 1 in 5 Texas drivers is uninsured. Your UM/UIM claim is against YOUR insurance company, but they must treat it fairly under Texas law.',
      showIf: (answers) =>
        answers.has_auto_insurance === 'yes' && answers.has_um_uim === 'yes',
    },
    {
      id: 'no_um_uim_info',
      type: 'info',
      prompt:
        'Without UM/UIM coverage, if the at-fault driver is uninsured or underinsured, you may only be able to recover what they personally can pay — which is often very little. Consider adding UM/UIM to your policy for future protection.',
      showIf: (answers) =>
        answers.has_auto_insurance === 'yes' && answers.has_um_uim === 'no',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.has_auto_insurance === 'no') {
      items.push({
        status: 'info',
        text: 'No auto insurance — PIP not available. Proceed with direct claim against at-fault driver.',
      })
      return items
    }

    if (answers.pip_already_filed === 'yes') {
      items.push({
        status: 'done',
        text: 'PIP claim filed. Follow up if no response within 15 business days.',
      })
    } else if (answers.pip_already_filed === 'no') {
      items.push({
        status: 'needed',
        text: 'File your PIP claim — call the number on your insurance card and request PIP claim forms.',
      })
    }

    if (answers.has_um_uim === 'yes') {
      items.push({
        status: 'info',
        text: 'UM/UIM coverage available. If at-fault driver is uninsured or underinsured, file a UM/UIM claim with your insurer.',
      })
    } else if (answers.has_um_uim === 'no') {
      items.push({
        status: 'info',
        text: 'No UM/UIM coverage. Recovery limited to at-fault driver\'s insurance or personal assets.',
      })
    }

    return items
  },
}
