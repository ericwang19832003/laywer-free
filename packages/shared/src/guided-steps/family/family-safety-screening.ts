import type { GuidedStepConfig } from '../types'

type SafetySubType = 'divorce' | 'custody' | 'visitation' | 'protective_order'

export function createSafetyScreeningConfig(subType: SafetySubType): GuidedStepConfig {
  return {
    title: 'Safety Screening',
    reassurance: 'Your safety comes first. This confidential screening helps us identify if any protective measures are needed.',
    questions: [
      {
        id: 'physical_violence',
        type: 'yes_no',
        prompt: 'Has the other party ever been physically violent toward you or your children?',
      },
      {
        id: 'threats',
        type: 'yes_no',
        prompt: 'Has the other party made threats of violence or harm?',
      },
      {
        id: 'controlling_behavior',
        type: 'yes_no',
        prompt: 'Does the other party control your finances, movements, or communications?',
      },
      {
        id: 'safety_plan_info',
        type: 'info',
        prompt: subType === 'protective_order'
          ? 'Based on your responses, filing for a protective order is the right step. The court can grant an emergency ex parte order the same day you file. There is no filing fee.'
          : 'If you answered yes to any question, consider requesting a protective order. The National DV Hotline is 1-800-799-7233. You can also request the court to keep your address confidential.',
        showIf: (a) => a.physical_violence === 'yes' || a.threats === 'yes' || a.controlling_behavior === 'yes',
      },
      {
        id: 'safe_info',
        type: 'info',
        prompt: 'No safety concerns identified. If your situation changes at any time, you can request protective measures.',
        showIf: (a) => a.physical_violence === 'no' && a.threats === 'no' && a.controlling_behavior === 'no',
      },
    ],
    generateSummary(answers) {
      const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []
      const hasConcerns = answers.physical_violence === 'yes' || answers.threats === 'yes' || answers.controlling_behavior === 'yes'

      if (hasConcerns) {
        items.push({ status: 'needed', text: 'Safety concerns identified. Consider protective measures.' })
        if (subType === 'protective_order') {
          items.push({ status: 'needed', text: 'File your protective order application as soon as possible.' })
        } else {
          items.push({ status: 'info', text: 'National DV Hotline: 1-800-799-7233.' })
        }
      } else {
        items.push({ status: 'done', text: 'No immediate safety concerns identified.' })
      }

      items.push({ status: 'info', text: 'Safety screening complete. Your answers are confidential.' })
      return items
    },
  }
}
