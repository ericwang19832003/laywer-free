import type { GuidedStepConfig } from '../types'

export const bizEmploymentEeocConfig: GuidedStepConfig = {
  title: 'File EEOC/TWC Complaint',
  reassurance:
    'For discrimination or harassment claims, filing with the EEOC or Texas Workforce Commission is a legal prerequisite before suing.',

  questions: [
    {
      id: 'claim_type',
      type: 'single_choice',
      prompt: 'What type of claim?',
      options: [
        {
          value: 'discrimination',
          label: 'Discrimination (race, sex, age, disability)',
        },
        {
          value: 'harassment',
          label: 'Harassment or hostile work environment',
        },
        { value: 'retaliation', label: 'Retaliation for reporting' },
        { value: 'other', label: 'Other employment violation' },
      ],
    },
    {
      id: 'needs_eeoc_info',
      type: 'info',
      prompt:
        'This type of claim requires filing with the EEOC or TWC before you can file a lawsuit. The deadline is 180 days (TWC) or 300 days (EEOC) from the incident.',
      showIf: (answers) =>
        answers.claim_type === 'discrimination' ||
        answers.claim_type === 'harassment' ||
        answers.claim_type === 'retaliation',
    },
    {
      id: 'skip_info',
      type: 'info',
      prompt:
        'Wage claims and non-compete disputes generally don\'t require EEOC filing. You can skip this step.',
      showIf: (answers) => answers.claim_type === 'other',
    },
    {
      id: 'charge_filed',
      type: 'yes_no',
      prompt: 'Have you already filed an EEOC or TWC charge?',
    },
    {
      id: 'filed_info',
      type: 'info',
      prompt:
        'Good. You\'ll need to wait for a right-to-sue letter, or you can request one after 180 days.',
      showIf: (answers) => answers.charge_filed === 'yes',
    },
    {
      id: 'days_since_incident',
      type: 'text',
      prompt: 'Approximately how many days ago did the incident occur?',
      placeholder: 'e.g. 45',
      showIf: (answers) => answers.charge_filed === 'no',
    },
    {
      id: 'deadline_warning',
      type: 'info',
      prompt:
        'Act quickly \u2014 the filing deadline is 180 days for TWC or 300 days for EEOC. You can file online at publicportal.eeoc.gov.',
      showIf: (answers) => answers.charge_filed === 'no',
    },
    {
      id: 'has_right_to_sue',
      type: 'yes_no',
      prompt: 'Have you received a right-to-sue letter?',
      showIf: (answers) => answers.charge_filed === 'yes',
    },
    {
      id: 'right_to_sue_info',
      type: 'info',
      prompt:
        'You have 90 days from receiving the right-to-sue letter to file your lawsuit. Don\'t delay.',
      showIf: (answers) => answers.has_right_to_sue === 'yes',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.claim_type) {
      const labels: Record<string, string> = {
        discrimination: 'Discrimination (race, sex, age, disability)',
        harassment: 'Harassment or hostile work environment',
        retaliation: 'Retaliation for reporting',
        other: 'Other employment violation',
      }
      items.push({
        status: 'done',
        text: `Claim type: ${labels[answers.claim_type]}.`,
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Identify the type of employment claim.',
      })
    }

    if (answers.claim_type === 'other') {
      items.push({
        status: 'info',
        text: 'EEOC filing not required for this claim type. You may skip this step.',
      })
      return items
    }

    if (answers.charge_filed === 'yes') {
      items.push({
        status: 'done',
        text: 'EEOC or TWC charge has been filed.',
      })

      if (answers.has_right_to_sue === 'yes') {
        items.push({
          status: 'done',
          text: 'Right-to-sue letter received.',
        })
        items.push({
          status: 'info',
          text: 'You have 90 days from the right-to-sue letter to file your lawsuit.',
        })
      } else if (answers.has_right_to_sue === 'no') {
        items.push({
          status: 'needed',
          text: 'Wait for your right-to-sue letter, or request one after 180 days.',
        })
      }
    } else if (answers.charge_filed === 'no') {
      items.push({
        status: 'needed',
        text: 'File an EEOC or TWC charge before you can proceed with a lawsuit.',
      })

      if (answers.days_since_incident) {
        const days = parseInt(answers.days_since_incident, 10)
        if (!isNaN(days)) {
          const twcRemaining = 180 - days
          const eeocRemaining = 300 - days
          if (twcRemaining <= 0 && eeocRemaining <= 0) {
            items.push({
              status: 'needed',
              text: 'Both filing deadlines may have passed. Consult an attorney immediately.',
            })
          } else if (twcRemaining <= 30) {
            items.push({
              status: 'needed',
              text: `TWC deadline is very close (approximately ${Math.max(0, twcRemaining)} days remaining). File immediately or use the EEOC (approximately ${eeocRemaining} days remaining).`,
            })
          } else {
            items.push({
              status: 'info',
              text: `Approximately ${twcRemaining} days remaining for TWC filing, ${eeocRemaining} days for EEOC filing.`,
            })
          }
        }
      }

      items.push({
        status: 'info',
        text: 'File online at publicportal.eeoc.gov or visit your local EEOC office.',
      })
    }

    return items
  },
}
