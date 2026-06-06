import type { GuidedStepConfig } from '../types'
import { getSmallClaimsInfo } from '../state-litigation-info'

export function createScAppealGuideConfig(state?: string): GuidedStepConfig {
  const sc = getSmallClaimsInfo(state)

  return {
    title: 'Appealing a Small Claims Decision',
    reassurance: state === 'NY'
      ? `Losing in ${sc.courtAbbrev} is NOT the end. Outside NYC, you get a new trial in County Court. In NYC, the Appellate Term reviews the record from your small claims hearing.`
      : `Losing in ${sc.courtAbbrev} is NOT the end. An appeal gives you a completely new trial in ${sc.upperCourtName}.`,

    questions: [
      {
        id: 'case_type',
        type: 'single_choice',
        prompt: 'What type of case are you appealing?',
        options: [
          { value: 'eviction', label: 'Eviction case' },
          { value: 'other', label: 'Money dispute or other case' },
        ],
      },

      {
        id: 'eviction_timeline',
        type: 'info',
        prompt: `EVICTION APPEAL DEADLINE: ${sc.appealDeadlineEviction.toUpperCase()} from the judgment.\n\nThis is an extremely tight deadline. If you are close to the deadline, go to the court clerk immediately to file your Notice of Appeal.`,
        acknowledgeLabel: 'I am filing my appeal immediately →',
        showIf: (answers) => answers.case_type === 'eviction',
      },
      {
        id: 'other_timeline',
        type: 'info',
        prompt: `APPEAL DEADLINE: ${sc.appealDeadlineOther.toUpperCase()} from the judgment.\n\nMark this date on your calendar. If you miss it, you lose your right to appeal.`,
        acknowledgeLabel: 'I have noted the appeal deadline →',
        showIf: (answers) => answers.case_type === 'other',
      },

      {
        id: 'days_since',
        type: 'single_choice',
        prompt: 'How long ago was the judgment?',
        options: [
          { value: 'within', label: 'Still within the deadline' },
          { value: 'close', label: 'Close to the deadline' },
          { value: 'past', label: 'Past the deadline' },
          { value: 'not_sure', label: 'Not sure' },
        ],
      },

      {
        id: 'past_deadline_info',
        type: 'info',
        prompt: 'If you are past the appeal deadline, your options are very limited. Consult an attorney immediately to see if any exceptions apply to your situation.',
        acknowledgeLabel: 'I will consult an attorney immediately →',
        showIf: (answers) => answers.days_since === 'past',
      },

      {
        id: 'filing_steps',
        type: 'info',
        prompt: `HOW TO FILE YOUR APPEAL:\n1. Go to the ${sc.courtAbbrev} clerk where your case was heard\n2. File a Notice of Appeal\n3. Pay the filing fee\n4. Post an appeal bond (or file an inability-to-pay affidavit)\n5. The clerk will transfer your case to ${sc.upperCourtName}\n6. You will receive a new hearing date from ${sc.upperCourtName}`,
        acknowledgeLabel: 'I understand the filing steps →',
      },

      {
        id: 'can_afford_costs',
        type: 'yes_no',
        prompt: 'Can you afford the appeal filing fee and appeal bond?',
      },

      {
        id: 'inability_to_pay',
        type: 'info',
        prompt: `FILE AN INABILITY-TO-PAY AFFIDAVIT:\nIf you cannot afford the filing fee or appeal bond, file a "${sc.feeWaiverForm}" at the court clerk. The court will review your finances. If approved, both the fee and bond are waived.`,
        acknowledgeLabel: 'I will file for a fee waiver →',
        showIf: (answers) => answers.can_afford_costs === 'no',
      },

      {
        id: 'trial_de_novo',
        type: 'info',
        acknowledgeLabel: 'I understand what the appeal means →',
        prompt: state === 'NY'
          ? `APPEAL — WHAT IT MEANS:\n\nOutside NYC: Your case starts completely fresh in County Court (trial de novo). The ${sc.courtAbbrev} decision is erased and you can present new evidence and witnesses.\n\nIn NYC (Appellate Term): The Appellate Term reviews the record from your small claims hearing — it is NOT a new trial. You argue that the judge made a legal error. New evidence is generally not considered.`
          : `TRIAL DE NOVO — WHAT IT MEANS:\nYour case starts completely fresh in ${sc.upperCourtName}. The ${sc.courtAbbrev} decision is erased. You can:\n- Present new evidence you didn't have before\n- Call new witnesses\n- Make different arguments\n- Get a completely different result\n\nIt's as if the ${sc.courtAbbrev} hearing never happened.`,
      },

      {
        id: 'upper_court_changes',
        type: 'info',
        prompt: `WHAT CHANGES IN ${sc.upperCourtName.toUpperCase()}:\n- More formal procedures (rules of evidence are stricter)\n- You may be able to request a jury trial\n- The other side may hire an attorney\n- Discovery (exchanging evidence before trial) may be available\n- The process takes longer than ${sc.courtAbbrev}\n- You may want to consider hiring an attorney yourself`,
        acknowledgeLabel: 'I understand what changes in the upper court →',
      },

      {
        id: 'judgment_amount',
        type: 'text',
        prompt: 'What was the judgment amount?',
        helpText: 'Enter the dollar amount of the judgment against you. This helps evaluate whether an appeal is worth the time and cost.',
        placeholder: 'e.g. $3,000',
      },

      {
        id: 'cost_benefit',
        type: 'info',
        prompt: `COST-BENEFIT ANALYSIS:\nConsider before appealing:\n- Filing fee + possible attorney costs vs. the judgment amount\n- Your time for a second round of court\n- Strength of your evidence — do you have something new or stronger?\n- If the judgment was close, an appeal may be worth it\n- If the judgment was clearly supported by the evidence, a new trial may reach the same result`,
        acknowledgeLabel: 'I have weighed the costs and benefits →',
      },

      {
        id: 'filed_notice',
        type: 'yes_no',
        prompt: 'Have you filed your Notice of Appeal?',
      },
    ],

    generateSummary(answers) {
      const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

      const deadline =
        answers.case_type === 'eviction' ? sc.appealDeadlineEviction : sc.appealDeadlineOther
      items.push({
        status: 'info',
        text: `Appeal deadline: ${deadline} from the judgment date.`,
      })

      if (answers.days_since === 'past') {
        items.push({
          status: 'needed',
          text: 'You may be past the deadline. Consult an attorney immediately.',
        })
      } else if (answers.days_since === 'close') {
        items.push({
          status: 'needed',
          text: `Deadline is approaching. File your Notice of Appeal at the ${sc.courtAbbrev} clerk as soon as possible.`,
        })
      }

      if (answers.filed_notice === 'yes') {
        items.push({
          status: 'done',
          text: 'Notice of Appeal filed.',
        })
      } else {
        items.push({
          status: 'needed',
          text: `File your Notice of Appeal at the ${sc.courtAbbrev} clerk.`,
        })
      }

      if (answers.can_afford_costs === 'no') {
        items.push({
          status: 'needed',
          text: `File a "${sc.feeWaiverForm}" to waive the filing fee and appeal bond.`,
        })
      } else if (answers.can_afford_costs === 'yes') {
        items.push({
          status: 'needed',
          text: 'Pay the filing fee and post the appeal bond.',
        })
      }

      if (answers.judgment_amount) {
        items.push({
          status: 'info',
          text: `Judgment amount: ${answers.judgment_amount}. Weigh this against the cost and time of appealing.`,
        })
      }

      items.push({
        status: 'info',
        text: `Trial de novo: your case starts fresh in ${sc.upperCourtName} with a new judge, new evidence allowed, and the ${sc.courtAbbrev} decision erased.`,
      })

      return items
    },
  }
}

export const scAppealGuideConfig = createScAppealGuideConfig()
