import type { GuidedStepConfig } from '../types'

export const piInsuranceCommunicationPropertyConfig: GuidedStepConfig = {
  title: 'Communicate With Insurance',
  reassurance:
    "Knowing how to handle insurance communications protects your rights and your claim's value.",

  questions: [
    {
      id: 'claim_filed',
      type: 'yes_no',
      prompt:
        'Have you filed an insurance claim (with your own or the at-fault party\'s insurance)?',
      helpText:
        'Most policies require timely notice. Get a claim number and keep it handy.',
    },
    {
      id: 'adjuster_contacted_you',
      type: 'yes_no',
      prompt: 'Has an insurance adjuster contacted you?',
      helpText:
        'Adjusters may call, email, or send letters. Keep a record of all contact.',
    },
    {
      id: 'recorded_statement_requested',
      type: 'yes_no',
      prompt: 'Has the adjuster asked you for a recorded statement?',
      helpText:
        'This is a common request, especially from the other party\'s insurance.',
      showIf: (answers) => answers.adjuster_contacted_you === 'yes',
    },
    {
      id: 'recorded_statement_warning',
      type: 'info',
      prompt:
        'You are NOT required to give a recorded statement to the other party\'s insurance company. You can decline and say "I prefer to communicate in writing." Stick to basic facts about the property damage only.',
      helpText:
        'Your own insurance policy may require cooperation, but be cautious about what you say.',
      showIf: (answers) => answers.recorded_statement_requested === 'yes',
    },
    {
      id: 'offered_quick_settlement',
      type: 'yes_no',
      prompt: 'Has the insurance company offered you a quick settlement?',
      helpText:
        'Insurance companies sometimes offer early settlements before you know the full extent of the damage.',
    },
    {
      id: 'quick_settlement_warning',
      type: 'info',
      prompt:
        'Early settlement offers are almost always too low. Do not accept any settlement before getting complete repair estimates and understanding the full scope of damage (including diminished value and loss of use). Once you accept, you cannot go back and ask for more.',
      helpText:
        'Get multiple repair estimates and document all costs before agreeing to any amount.',
      showIf: (answers) => answers.offered_quick_settlement === 'yes',
    },
    {
      id: 'documenting_communications',
      type: 'yes_no',
      prompt:
        'Are you documenting all communications with insurance companies (dates, names, what was discussed)?',
      helpText:
        'A written log protects you if there is a dispute about what was said.',
    },
    {
      id: 'know_policy_limits',
      type: 'single_choice',
      prompt:
        "Do you know the at-fault party's insurance policy limits?",
      helpText:
        'Policy limits determine the maximum the insurance will pay. This affects your strategy.',
      options: [
        { value: 'yes', label: 'Yes, I know the limits' },
        { value: 'no', label: "No, I don't know them" },
        { value: 'unsure', label: "I'm not sure what policy limits are" },
      ],
    },
    {
      id: 'adjuster_tactics_info',
      type: 'info',
      prompt:
        'Watch out for common adjuster tactics: offering a lowball settlement before you have full repair estimates, pressuring you to use their preferred repair shop, disputing the scope of damage, and delaying responses. Get your own independent estimates, document everything, and never rush to accept.',
      helpText:
        'You can always say "I need time to think about it" before agreeing to anything.',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.claim_filed === 'yes') {
      items.push({ status: 'done', text: 'Insurance claim filed.' })
    } else {
      items.push({
        status: 'needed',
        text: 'File an insurance claim promptly. Most policies require timely notice.',
      })
    }

    if (answers.adjuster_contacted_you === 'yes') {
      if (answers.recorded_statement_requested === 'yes') {
        items.push({
          status: 'info',
          text: 'You are NOT required to give a recorded statement to the other party\'s insurer. Consider declining or communicating in writing.',
        })
      }
    }

    if (answers.offered_quick_settlement === 'yes') {
      items.push({
        status: 'needed',
        text: 'Do NOT accept the early settlement offer. Get complete repair estimates and document all costs first.',
      })
    }

    if (answers.documenting_communications === 'yes') {
      items.push({
        status: 'done',
        text: 'Keeping a log of all insurance communications.',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Start documenting all insurance communications: dates, names, and what was discussed.',
      })
    }

    if (answers.know_policy_limits === 'yes') {
      items.push({ status: 'done', text: 'Policy limits are known.' })
    } else if (answers.know_policy_limits === 'unsure') {
      items.push({
        status: 'info',
        text: "Policy limits are the maximum an insurer will pay. Ask the adjuster or check the at-fault party's declarations page.",
      })
    } else {
      items.push({
        status: 'needed',
        text: "Find out the at-fault party's policy limits. This affects your settlement strategy.",
      })
    }

    items.push({
      status: 'info',
      text: 'Watch for adjuster tactics: lowball offers, pressure to use their repair shop, disputing damage scope, and delays.',
    })

    return items
  },
}
