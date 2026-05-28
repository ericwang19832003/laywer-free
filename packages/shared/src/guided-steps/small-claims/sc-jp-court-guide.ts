import type { GuidedStepConfig } from '../types'
import { getSmallClaimsInfo } from '../state-litigation-info'

export function createScCourtGuideConfig(state?: string): GuidedStepConfig {
  const sc = getSmallClaimsInfo(state)
  const isTx = (state ?? 'TX') === 'TX'

  return {
    title: `${sc.courtName} — What You Need to Know`,
    reassurance: `${sc.courtName} is designed for regular people — the most informal court available, and that works in your favor.`,

    questions: [
      {
        id: 'know_sc_basics',
        type: 'yes_no',
        prompt: `Do you know what ${sc.courtAbbrev} is?`,
      },
      {
        id: 'sc_basics_info',
        type: 'info',
        prompt: `${sc.courtName} handles small claims up to ${sc.limit}. It uses relaxed procedures — no formal discovery is required, evidence rules are relaxed, and hearings are typically 15–30 minutes long.${isTx ? ' (Governed by TRCP Rules 500-507.)' : ''}`,
        showIf: (answers) => answers.know_sc_basics === 'no',
      },
      {
        id: 'know_timeline',
        type: 'yes_no',
        prompt: 'Do you know how quickly your hearing will be scheduled?',
      },
      {
        id: 'timeline_info',
        type: 'info',
        prompt: state === 'NY'
          ? 'Once the defendant is served, your hearing in New York Small Claims Court is typically scheduled 30–70 days later (NYC). The court mails you a Notice of Hearing with the date and time.'
          : state === 'FL'
          ? 'After filing, your hearing in Florida Small Claims Court is typically scheduled 30–45 days later. The clerk mails you a Notice of Hearing with the date and time (Fla. R. Sm. Cl. P. 7.090).'
          : state === 'PA'
          ? 'Once the defendant is served, your hearing in Pennsylvania Magisterial District Court is typically scheduled within 30–70 days of filing. The court mails you a Notice of Hearing with the date and time (Pa.R.Civ.P.M.D.J. 307).'
          : 'Once the defendant is served, your hearing is typically set 10–21 days later. Small claims court moves fast compared to other courts.',
        showIf: (answers) => answers.know_timeline === 'no',
      },
      {
        id: 'know_judge_decides',
        type: 'yes_no',
        prompt: 'Do you know who decides your case — a judge or a jury?',
      },
      {
        id: 'judge_decides_info',
        type: 'info',
        prompt: 'The judge decides your case unless someone requests a jury in writing. Most small claims cases are decided by the judge alone. Judges value clear facts and common sense over legal citations.',
        showIf: (answers) => answers.know_judge_decides === 'no',
      },
      {
        id: 'know_evidence_rules',
        type: 'yes_no',
        prompt: `Do you know how evidence rules work in ${sc.courtAbbrev}?`,
      },
      {
        id: 'evidence_rules_info',
        type: 'info',
        prompt: `${sc.courtAbbrev} has relaxed evidence rules. You don't need to follow formal rules of evidence. You can present documents, photos, and tell your story in plain language. The judge has wide discretion to consider what's relevant.`,
        showIf: (answers) => answers.know_evidence_rules === 'no',
      },
      {
        id: 'know_service',
        type: 'yes_no',
        prompt: 'Do you know how the defendant gets notified about your case?',
      },
      {
        id: 'service_info',
        type: 'info',
        prompt: state === 'NY'
          ? `In New York Small Claims Court, the clerk mails the lawsuit papers to the defendant by certified mail — you just need to provide the defendant's address and pay the filing fee. Service must be done at least 5 days before your hearing.`
          : state === 'FL'
          ? `In Florida Small Claims Court, you must arrange personal service — the clerk does not mail the papers for you. The county sheriff or a certified process server must personally deliver the papers to the defendant (Fla. R. Sm. Cl. P. 7.070). Provide the defendant's address at filing and pay the sheriff's service fee (typically $40–$60).`
          : state === 'PA'
          ? `In Pennsylvania Magisterial District Court, service can be by personal delivery from a constable, OR by certified mail with return receipt requested — both are valid (Pa.R.Civ.P.M.D.J. 307). The court typically arranges service when you file. Provide the defendant's address and pay the service fee (typically $50–$100 for constable; less for certified mail). The defendant must be served at least 10 days before your hearing.`
          : `In most counties, a constable or process server delivers the lawsuit papers to the defendant. The court typically arranges this for you when you file — you just need to provide the defendant's address and pay the service fee.`,
        showIf: (answers) => answers.know_service === 'no',
      },
      {
        id: 'claim_under_limit',
        type: 'yes_no',
        prompt: `Is the amount you're claiming ${sc.limit} or less?`,
      },
      {
        id: 'over_limit_info',
        type: 'info',
        prompt: `${sc.courtAbbrev} can only handle claims up to ${sc.limit}. If your claim exceeds this amount, you'll need to file in ${sc.upperCourtName}. You can choose to reduce your claim to ${sc.limit} to stay in ${sc.courtAbbrev}, but you'll give up the excess.`,
        showIf: (answers) => answers.claim_under_limit === 'no',
      },
    ],

    generateSummary(answers) {
      const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

      if (answers.know_sc_basics === 'yes') {
        items.push({ status: 'done', text: `Understands ${sc.courtAbbrev} basics (${sc.limit} limit, relaxed rules).` })
      } else {
        items.push({
          status: 'info',
          text: `${sc.courtAbbrev} handles claims up to ${sc.limit} with relaxed evidence rules and no formal discovery.`,
        })
      }

      if (answers.know_timeline === 'yes') {
        items.push({ status: 'done', text: 'Aware of hearing timeline (10–21 days after service).' })
      } else {
        items.push({
          status: 'info',
          text: 'Hearing is typically set 10–21 days after the defendant is served. Hearings last 15–30 minutes.',
        })
      }

      if (answers.know_judge_decides === 'yes') {
        items.push({ status: 'done', text: 'Understands judge-decided format.' })
      } else {
        items.push({
          status: 'info',
          text: 'The judge decides unless a jury is requested in writing. Judges value clear facts over legal jargon.',
        })
      }

      if (answers.know_evidence_rules === 'yes') {
        items.push({ status: 'done', text: 'Familiar with relaxed evidence rules.' })
      } else {
        items.push({
          status: 'info',
          text: 'Evidence rules are relaxed — present documents and tell your story in plain language.',
        })
      }

      if (answers.know_service === 'yes') {
        items.push({ status: 'done', text: 'Understands service process.' })
      } else {
        items.push({
          status: 'info',
          text: "The court arranges service — you provide the defendant's address.",
        })
      }

      if (answers.claim_under_limit === 'yes') {
        items.push({ status: 'done', text: `Claim is within the ${sc.limit} ${sc.courtAbbrev} limit.` })
      } else if (answers.claim_under_limit === 'no') {
        items.push({
          status: 'needed',
          text: `Claim exceeds ${sc.limit}. Decide whether to reduce the claim or file in ${sc.upperCourtName}.`,
        })
      }

      return items
    },
  }
}

export const scJpCourtGuideConfig = createScCourtGuideConfig()
