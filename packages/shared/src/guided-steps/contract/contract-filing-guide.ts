import type { GuidedStepConfig } from '../types'
import { getContractInfo } from '../state-litigation-info'

export function createContractFilingGuideConfig(state?: string): GuidedStepConfig {
  const ct = getContractInfo(state)

  return {
    title: 'How to File Your Contract Lawsuit',
    reassurance: "Filing is straightforward once you know which court. We'll walk you through every detail.",

    questions: [
      {
        id: 'total_damages',
        type: 'single_choice',
        prompt: 'How much are your damages?',
        helpText: 'Include the full amount owed under the contract, consequential damages, and any out-of-pocket costs caused by the breach.',
        options: [
          { value: 'under_jp', label: `Under ${ct.jpCourtLimit}` },
          { value: 'mid_range', label: ct.midCourtRange },
          { value: 'over_mid', label: `Over ${ct.midCourtRange.split(' to ')[1]}` },
        ],
      },

      {
        id: 'court_jp',
        type: 'info',
        prompt: `File in ${ct.jpCourtName}. Simpler process, no jury unless requested. Faster resolution.`,
        showIf: (answers) => answers.total_damages === 'under_jp',
      },
      {
        id: 'court_mid',
        type: 'info',
        prompt: `File in ${ct.midCourtName}. More formal, but still manageable for pro se litigants.`,
        showIf: (answers) => answers.total_damages === 'mid_range',
      },
      {
        id: 'court_high',
        type: 'info',
        prompt: `File in ${ct.highCourtName}. Most formal. Consider consulting an attorney for complex cases.`,
        showIf: (answers) => answers.total_damages === 'over_mid',
      },

      {
        id: 'forum_selection',
        type: 'yes_no',
        prompt: 'Does your contract specify where to file (a "forum selection" clause)?',
        helpText: 'Look for language like "any disputes shall be resolved in [county/state]" or "exclusive jurisdiction in [court]." This is usually near the end of the contract.',
      },
      {
        id: 'forum_selection_yes_info',
        type: 'info',
        prompt: "Your contract's forum selection clause usually controls where you must file. File in the court and location specified in the contract. If the clause names a different state, you may need to file there instead. Consult an attorney if the clause seems unfair or was buried in fine print.",
        showIf: (answers) => answers.forum_selection === 'yes',
      },

      {
        id: 'filing_method',
        type: 'single_choice',
        prompt: 'How do you plan to file?',
        helpText: 'E-filing is the fastest option and available 24/7. In-person filing lets you get instant confirmation. Mail is the slowest but works if you cannot get to the courthouse.',
        options: [
          { value: 'efile', label: `Online (${ct.eFilingUrl}) — recommended` },
          { value: 'in_person', label: 'In person at the courthouse' },
          { value: 'mail', label: 'By mail' },
        ],
      },

      {
        id: 'efile_instructions',
        type: 'info',
        prompt: `To file online:\n1. Go to ${ct.eFilingUrl} (${ct.eFilingName}) and create a free account\n2. Select your court and case type (breach of contract)\n3. Upload your Petition or Complaint as a PDF\n4. Pay the filing fee online (or submit fee waiver)\n5. You'll receive a confirmation email when accepted\n\nTip: Most courts accept e-filed documents within 24 hours.`,
        showIf: (answers) => answers.filing_method === 'efile',
      },

      {
        id: 'in_person_instructions',
        type: 'info',
        prompt: "To file in person:\n1. Print 3 copies of your Petition or Complaint (one for the court, one for you, one to serve)\n2. Go to the court clerk's office during business hours (usually 8am–5pm)\n3. Tell the clerk: \"I need to file a Petition for breach of contract\"\n4. Pay the filing fee (or bring a completed fee waiver form)\n5. The clerk will stamp all copies — keep your stamped copy as proof\n6. Ask the clerk about service options for the defendant",
        showIf: (answers) => answers.filing_method === 'in_person',
      },

      {
        id: 'mail_instructions',
        type: 'info',
        prompt: "To file by mail:\n1. Print 3 copies of your Petition or Complaint\n2. Include a self-addressed stamped envelope for the clerk to return your stamped copy\n3. Mail to the court clerk's office via certified mail with return receipt\n4. Include a check or money order for the filing fee (or fee waiver form)\n\nWarning: Mail takes time. Allow at least 7–10 business days for processing.",
        showIf: (answers) => answers.filing_method === 'mail',
      },

      {
        id: 'can_afford_fee',
        type: 'yes_no',
        prompt: 'Can you afford the filing fee?',
      },

      {
        id: 'fee_waiver_info',
        type: 'info',
        prompt: `You can file a "${ct.feeWaiverForm}" to request a fee waiver.\n\n1. Download the form from ${ct.helpSiteUrl} (${ct.helpSiteName}) or ask the court clerk\n2. Fill it out honestly — include your income, expenses, and why you can't pay\n3. File it WITH your Petition (same time)\n4. The court will review it — most are approved within a few days\n5. If approved, you pay $0. If denied, you can appeal the denial.`,
        showIf: (answers) => answers.can_afford_fee === 'no',
      },

      {
        id: 'venue_info',
        type: 'info',
        prompt: 'VENUE: File in the county where: (a) the contract was performed, (b) the contract was made, or (c) the defendant lives. If your contract specifies a venue, that usually controls.',
      },

      {
        id: 'what_to_bring',
        type: 'info',
        prompt: 'Checklist — what to bring when filing:\n\n• Your Petition or Complaint (3 copies, signed)\n• A copy of the contract (or written summary if oral contract)\n• Filing fee payment or fee waiver form\n• Government-issued ID',
      },
    ],

    generateSummary(answers) {
      const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

      if (answers.total_damages) {
        const courtLabels: Record<string, string> = {
          under_jp: `${ct.jpCourtName} (under ${ct.jpCourtLimit})`,
          mid_range: `${ct.midCourtName} (${ct.midCourtRange})`,
          over_mid: `${ct.highCourtName} (over ${ct.midCourtRange.split(' to ')[1]})`,
        }
        items.push({
          status: 'done',
          text: `Court: ${courtLabels[answers.total_damages]}.`,
        })
      } else {
        items.push({
          status: 'needed',
          text: 'Determine your total damages to identify the correct court.',
        })
      }

      if (answers.forum_selection === 'yes') {
        items.push({
          status: 'info',
          text: 'Your contract specifies where to file — follow the forum selection clause.',
        })
      }

      if (answers.filing_method) {
        const methodLabels: Record<string, string> = {
          efile: `Online via ${ct.eFilingUrl}`,
          in_person: 'In person at the courthouse',
          mail: 'By certified mail',
        }
        items.push({
          status: 'done',
          text: `Filing method: ${methodLabels[answers.filing_method]}.`,
        })
      } else {
        items.push({
          status: 'needed',
          text: 'Choose a filing method (online, in person, or by mail).',
        })
      }

      if (answers.filing_method === 'efile') {
        items.push({
          status: 'needed',
          text: `Create an account at ${ct.eFilingUrl} and upload your Petition as a PDF.`,
        })
      } else if (answers.filing_method === 'in_person') {
        items.push({
          status: 'needed',
          text: 'Print 3 copies of your Petition and bring them to the court clerk during business hours (8am–5pm).',
        })
      } else if (answers.filing_method === 'mail') {
        items.push({
          status: 'needed',
          text: 'Mail 3 copies via certified mail with return receipt. Include a self-addressed stamped envelope. Allow 7–10 business days.',
        })
      }

      if (answers.can_afford_fee === 'yes') {
        items.push({
          status: 'done',
          text: 'Filing fee: prepared to pay.',
        })
      } else if (answers.can_afford_fee === 'no') {
        items.push({
          status: 'needed',
          text: `Download and complete the "${ct.feeWaiverForm}" from ${ct.helpSiteUrl}. File it with your Petition.`,
        })
      } else {
        items.push({
          status: 'needed',
          text: 'Determine if you can afford the filing fee. Fee waivers are available if you qualify.',
        })
      }

      items.push({
        status: 'info',
        text: "File in the county where the contract was performed, was made, or where the defendant lives. If your contract specifies a venue, that usually controls.",
      })

      return items
    },
  }
}

export const contractFilingGuideConfig = createContractFilingGuideConfig()
