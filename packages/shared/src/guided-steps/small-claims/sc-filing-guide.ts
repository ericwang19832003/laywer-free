import type { GuidedStepConfig } from '../types'
import { getSmallClaimsInfo } from '../state-litigation-info'

export function createScFilingGuideConfig(state?: string): GuidedStepConfig {
  const sc = getSmallClaimsInfo(state)

  return {
    title: 'How to File Your Small Claims Case',
    reassurance: `Filing in ${sc.courtAbbrev} is simpler and cheaper than any other court. Many clerks will help you fill out the forms.`,

    questions: [
      {
        id: 'know_filing_fee',
        type: 'yes_no',
        prompt: 'Do you know what the filing fee is for your county?',
      },
      {
        id: 'filing_fee_info',
        type: 'info',
        prompt: `Filing fees vary by county. Call the clerk's office or check your county's ${sc.courtAbbrev} website for the exact amount.`,
        acknowledgeLabel: "I'll confirm the filing fee",
        showIf: (answers) => answers.know_filing_fee === 'no',
      },
      {
        id: 'can_afford_fee',
        type: 'yes_no',
        prompt: 'Can you afford the filing fee?',
      },
      {
        id: 'fee_waiver_info',
        type: 'info',
        prompt: `If you can't afford the filing fee, you can file a "${sc.feeWaiverForm}." The clerk can provide this form. If approved, your filing fee and service fees are waived.`,
        acknowledgeLabel: "I'll request a fee waiver from the clerk",
        showIf: (answers) => answers.can_afford_fee === 'no',
      },
      {
        id: 'know_venue',
        type: 'yes_no',
        prompt: `Do you know which ${sc.courtAbbrev} to file in?`,
      },
      {
        id: 'venue_info',
        type: 'info',
        acknowledgeLabel: "I understand where to file",
        prompt: state === 'CA'
          ? `File in the ${sc.courtAbbrev} in the county where: (1) the defendant lives or regularly works, (2) where the transaction or event occurred, or (3) for consumer purchases, where you signed the contract or made the purchase (CCP § 116.370). If multiple counties qualify, you can choose.`
          : state === 'NY'
          ? `File in the ${sc.courtAbbrev} in the county (borough, in NYC) where the defendant resides, works, or has their principal place of business (NYC Civil Court Act § 1803 for NYC; UCCA § 1803 for courts outside NYC). For disputes arising from a consumer transaction, you may also file where the transaction took place.`
          : state === 'FL'
          ? `File in the ${sc.courtAbbrev} in the county where the defendant resides, has their principal place of business, OR where the cause of action accrued (i.e., where the transaction or event occurred) (Fla. Stat. § 47.011). If multiple counties qualify, you can choose.`
          : state === 'PA'
          ? `File in the Magisterial District Court in the district where: (1) the defendant resides, (2) the defendant has their principal place of business, or (3) where the cause of action arose (Pa.R.Civ.P.M.D.J. 302). If multiple districts qualify, you can choose.`
          : `File in the ${sc.courtAbbrev} in the county where the defendant lives, OR where the transaction or event occurred. If those are different counties, you can choose either one.`,
        showIf: (answers) => answers.know_venue === 'no',
      },
      {
        id: 'have_petition',
        type: 'yes_no',
        prompt: 'Do you have your claim form ready?',
      },
      {
        id: 'petition_info',
        type: 'info',
        prompt: `Many ${sc.courtAbbrev}s have simplified fill-in-the-blank forms available at the clerk's office or on the court's website. You can also find forms at ${sc.helpSiteUrl} (${sc.helpSiteName}). You'll need: your name and address, the defendant's full name and address, the amount you're claiming, and a brief description of your dispute.`,
        acknowledgeLabel: "I'll get the claim form",
        showIf: (answers) => answers.have_petition === 'no',
      },
      {
        id: 'filing_method',
        type: 'single_choice',
        prompt: 'How do you plan to file?',
        options: [
          { value: 'in_person', label: "In person at the clerk's office" },
          { value: 'efiling', label: `Online at ${sc.eFilingUrl}` },
          { value: 'not_sure', label: 'Not sure yet' },
        ],
      },
      {
        id: 'efiling_info',
        type: 'info',
        prompt: `You can e-file at ${sc.eFilingUrl} (${sc.eFilingName}). Create an account, select your court, and upload your claim form. There may be a small e-filing service fee on top of the court filing fee.`,
        acknowledgeLabel: "I'll file online",
        showIf: (answers) => answers.filing_method === 'efiling',
      },
      {
        id: 'in_person_info',
        type: 'info',
        prompt: "Bring your completed claim form, the filing fee (check if they accept cash, check, or card), and the defendant's address. The clerk can help you with questions about the form.",
        acknowledgeLabel: "I'll bring my form and fee to the clerk's office",
        showIf: (answers) => answers.filing_method === 'in_person',
      },
      {
        id: 'not_sure_info',
        type: 'info',
        prompt: `If you're not sure how to file, going in person is the easiest option. The clerk's office can provide forms and answer procedural questions. You can also e-file at ${sc.eFilingUrl} if you prefer to do it from home.`,
        acknowledgeLabel: "I'll go in person to file",
        showIf: (answers) => answers.filing_method === 'not_sure',
      },
      {
        id: 'have_defendant_address',
        type: 'yes_no',
        prompt: "Do you have the defendant's current address?",
      },
      {
        id: 'defendant_address_info',
        type: 'info',
        prompt: `You'll need the defendant's physical address for both the claim form and for service of process. If you don't have it, try checking the original contract, business registration records (${sc.sosName} website: ${sc.sosUrl}), or property records.`,
        acknowledgeLabel: "I'll locate the defendant's address",
        showIf: (answers) => answers.have_defendant_address === 'no',
      },
    ],

    generateSummary(answers) {
      const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

      if (answers.know_filing_fee === 'yes') {
        items.push({ status: 'done', text: 'Filing fee amount identified.' })
      } else {
        items.push({
          status: 'needed',
          text: `Confirm filing fee with your county's ${sc.courtAbbrev}.`,
        })
      }

      if (answers.can_afford_fee === 'no') {
        items.push({
          status: 'needed',
          text: `Request a "${sc.feeWaiverForm}" from the clerk.`,
        })
      } else if (answers.can_afford_fee === 'yes') {
        items.push({ status: 'done', text: 'Filing fee is affordable.' })
      }

      if (answers.know_venue === 'yes') {
        items.push({ status: 'done', text: `Correct ${sc.courtAbbrev} identified.` })
      } else {
        items.push({
          status: 'needed',
          text: state === 'NY'
            ? `Identify the correct ${sc.courtAbbrev}: where the defendant resides, works, or has their principal place of business (NYC Civil Court Act § 1803 for NYC; UCCA § 1803 outside NYC).`
            : state === 'FL'
            ? `Identify the correct ${sc.courtAbbrev}: where the defendant resides, has their principal place of business, or where the incident/transaction occurred (Fla. Stat. § 47.011).`
            : state === 'PA'
            ? `Identify the correct Magisterial District Court: where the defendant resides, has their principal place of business, or where the incident/transaction occurred (Pa.R.Civ.P.M.D.J. 302).`
            : `Identify the correct ${sc.courtAbbrev}: where the defendant lives or where the transaction occurred.`,
        })
      }

      if (answers.have_petition === 'yes') {
        items.push({ status: 'done', text: 'Claim form is ready.' })
      } else {
        items.push({
          status: 'needed',
          text: `Get the claim form from the clerk's office, court website, or ${sc.helpSiteUrl}.`,
        })
      }

      if (answers.filing_method && answers.filing_method !== 'not_sure') {
        const labels: Record<string, string> = {
          in_person: "in person at the clerk's office",
          efiling: `online at ${sc.eFilingUrl}`,
        }
        items.push({
          status: 'done',
          text: `Filing method chosen: ${labels[answers.filing_method]}.`,
        })
      } else {
        items.push({
          status: 'needed',
          text: `Choose a filing method: in person or online at ${sc.eFilingUrl}.`,
        })
      }

      if (answers.have_defendant_address === 'yes') {
        items.push({ status: 'done', text: "Defendant's address confirmed." })
      } else {
        items.push({
          status: 'needed',
          text: "Locate the defendant's current address for the claim form and service.",
        })
      }

      return items
    },
  }
}

export const scFilingGuideConfig = createScFilingGuideConfig()
