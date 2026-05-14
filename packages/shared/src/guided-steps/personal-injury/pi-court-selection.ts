import type { GuidedStepConfig } from '../types'
import { isPropertyDamageSubType } from './constants'

export function createPiCourtSelectionConfig(piSubType?: string): GuidedStepConfig {
  const isPropDamage = isPropertyDamageSubType(piSubType)

  const damagesPrompt = isPropDamage
    ? 'What is the approximate total value of your claim (repair costs, replacement value, loss of use, and any other damages)?'
    : 'What is the approximate total value of your claim (medical bills + lost wages + pain & suffering)?'

  return {
    title: 'Choose the Right Court',
    reassurance:
      'Filing in the correct court saves time and money. Let\u2019s figure out where your case belongs.',

    questions: [
      {
        id: 'court_selection_overview',
        type: 'info',
        prompt:
          'Texas has 4 court paths for civil cases:\n\n\u2022 Justice Court \u2014 Claims under $20,000. Simplified rules, lower fees, faster resolution.\n\u2022 County Court at Law \u2014 Claims between $20,000 and $250,000. Standard civil procedure.\n\u2022 District Court \u2014 Claims over $250,000, or cases seeking equity relief (injunctions, declaratory judgments). Broadest jurisdiction.\n\u2022 Federal Court \u2014 Cases involving a federal law (federal question) or where the defendant is from a different state and the claim exceeds $75,000 (diversity jurisdiction).\n\nEach court has different rules, fees, and procedures. The next few questions will help determine which court fits your case.',
      },
      {
        id: 'estimated_total_damages',
        type: 'single_choice',
        prompt: damagesPrompt,
        options: [
          { value: 'under_20k', label: 'Under $20,000' },
          { value: '20k_to_250k', label: '$20,000 to $250,000' },
          { value: 'over_250k', label: 'Over $250,000' },
          { value: 'unsure', label: "I'm not sure yet" },
        ],
      },
      {
        id: 'equity_relief',
        type: 'yes_no',
        prompt:
          'Are you seeking non-monetary relief? (For example: an injunction, a court order to stop someone from doing something, or a declaratory judgment)',
        helpText:
          'If yes, your case likely belongs in District Court regardless of the dollar amount.',
      },
      {
        id: 'defendant_out_of_state',
        type: 'yes_no',
        prompt: 'Is the defendant from a different state than Texas?',
        helpText:
          'If the defendant is from another state and your claim exceeds $75,000, your case may qualify for federal court.',
      },
      {
        id: 'federal_question',
        type: 'yes_no',
        prompt:
          'Does your claim involve a federal law? (For example: civil rights, ADA, employment discrimination, patent/copyright)',
      },
      {
        id: 'federal_warning',
        type: 'info',
        prompt:
          'Your case may qualify for federal court. Important: Federal courts follow the Federal Rules of Civil Procedure (FRCP), NOT the Texas Rules (TRCP). Discovery deadlines, disclosure requirements, and complaint format are all different.\n\nOur guided steps are optimized for Texas state courts. If your case is in federal court, some guidance may need to be adapted.',
        // Only warn about federal court when it's actually plausible:
        // federal question, OR out-of-state defendant with damages above $75k threshold
        showIf: (answers) =>
          answers.federal_question === 'yes' ||
          (answers.defendant_out_of_state === 'yes' &&
            answers.estimated_total_damages !== 'under_20k'),
      },
      {
        id: 'recommendation_justice',
        type: 'info',
        prompt:
          'Recommended: Texas Justice Court\n\nYour claim appears to be under $20,000 with no equity relief or federal issues. Justice Court is faster, less formal, and has lower filing fees (~$50\u2013$100).\n\nNote: Justice Court has simplified rules and limited discovery. Appeals go to County Court for a new trial (trial de novo).',
        // Out-of-state defendant with <$20k claim cannot reach federal diversity threshold ($75k),
        // so Justice Court is still the right recommendation.
        showIf: (answers) =>
          answers.estimated_total_damages === 'under_20k' &&
          answers.equity_relief !== 'yes' &&
          answers.federal_question !== 'yes',
      },
      {
        id: 'recommendation_county',
        type: 'info',
        prompt:
          'Recommended: Texas County Court at Law\n\nYour claim is between $20,000 and $250,000. County Court at Law handles most mid-range civil cases. Filing fees are ~$200\u2013$300.\n\nDiscovery follows Texas Rules of Civil Procedure. You\u2019ll likely be on Discovery Level 1 (expedited) if seeking $250,000 or less.',
        showIf: (answers) =>
          answers.estimated_total_damages === '20k_to_250k' &&
          answers.equity_relief !== 'yes' &&
          answers.federal_question !== 'yes' &&
          answers.defendant_out_of_state !== 'yes',
      },
      {
        id: 'recommendation_district',
        type: 'info',
        prompt:
          'Recommended: Texas District Court\n\nYour claim exceeds $250,000 or involves equity relief. District Court has the broadest jurisdiction. Filing fees are ~$350+.\n\nDiscovery follows Level 2 rules (25 interrogatories, 50 hours of depositions). Cases take longer but allow for more thorough litigation.',
        showIf: (answers) =>
          answers.estimated_total_damages === 'over_250k' ||
          answers.equity_relief === 'yes',
      },
      {
        id: 'recommendation_federal',
        type: 'info',
        prompt:
          'Possible: Federal Court\n\nYour case may qualify for federal jurisdiction based on federal question or diversity of citizenship (defendant from different state + >$75,000).\n\nFederal court has mandatory initial disclosures (FRCP 26(a)), different discovery rules, and stricter complaint requirements. Consider consulting an attorney if you\u2019re unsure about federal vs. state.',
        showIf: (answers) =>
          answers.federal_question === 'yes' ||
          (answers.defendant_out_of_state === 'yes' &&
            answers.estimated_total_damages !== 'under_20k'),
      },
      {
        id: 'recommendation_unsure',
        type: 'info',
        prompt: isPropDamage
          ? 'We need your damages estimate to recommend a court. Consider:\n\n\u2022 Get repair estimates or replacement quotes for damaged property\n\u2022 Calculate any loss of use (e.g., rental car costs, lost rental income)\n\u2022 Add any additional out-of-pocket costs caused by the damage\n\nOnce you have an estimate, come back to this step.'
          : 'We need your damages estimate to recommend a court. Consider:\n\n\u2022 Add up all medical bills (past and expected future)\n\u2022 Calculate lost wages (past and expected future)\n\u2022 Estimate pain and suffering (typically 1\u20135x economic damages)\n\nOnce you have an estimate, come back to this step.',
        showIf: (answers) => answers.estimated_total_damages === 'unsure',
      },
      {
        id: 'court_confirmed',
        type: 'single_choice',
        prompt: 'Based on the guidance above, which court will you file in?',
        options: [
          { value: 'justice', label: 'Justice Court' },
          { value: 'county', label: 'County Court at Law' },
          { value: 'district', label: 'District Court' },
          { value: 'federal', label: 'Federal Court' },
          { value: 'unsure_still', label: 'Still unsure \u2014 I need to research more' },
        ],
      },
    ],

    generateSummary(answers) {
      const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

      const damages = answers.estimated_total_damages
      const equity = answers.equity_relief === 'yes'
      const federal = answers.federal_question === 'yes'
      const outOfState = answers.defendant_out_of_state === 'yes'

      if (damages === 'unsure') {
        items.push({
          status: 'needed',
          text: 'Damages estimate needed before a court can be recommended.',
        })
      } else if (federal) {
        items.push({
          status: 'info',
          text: 'Recommended path: Federal Court (federal question jurisdiction).',
        })
      } else if (outOfState && damages !== 'under_20k') {
        items.push({
          status: 'info',
          text: 'Recommended path: Federal Court (diversity jurisdiction — out-of-state defendant + claim >$75K).',
        })
      } else if (damages === 'over_250k' || equity) {
        items.push({
          status: 'info',
          text: 'Recommended path: Texas District Court.',
        })
      } else if (damages === '20k_to_250k') {
        items.push({
          status: 'info',
          text: 'Recommended path: Texas County Court at Law.',
        })
      } else if (damages === 'under_20k') {
        items.push({
          status: 'info',
          text: 'Recommended path: Texas Justice Court.',
        })
      }

      if (answers.court_confirmed) {
        const courtLabels: Record<string, string> = {
          justice: 'Justice Court',
          county: 'County Court at Law',
          district: 'District Court',
          federal: 'Federal Court',
          unsure_still: 'Still unsure',
        }
        const label = courtLabels[answers.court_confirmed] ?? answers.court_confirmed
        items.push({
          status: answers.court_confirmed === 'unsure_still' ? 'needed' : 'done',
          text: `Confirmed court selection: ${label}.`,
        })
      }

      if (federal || outOfState) {
        items.push({
          status: 'needed',
          text: 'Federal court path flagged — FRCP rules apply, not TRCP. Some guided steps may need adaptation.',
        })
      }

      if (damages === 'unsure') {
        items.push({
          status: 'needed',
          text: isPropDamage
            ? 'Damages estimate is unclear — get repair quotes or replacement value to finalize court selection.'
            : 'Damages estimate is unclear — calculate medical bills + lost wages + pain & suffering to finalize court selection.',
        })
      }

      return items
    },
  }
}

/** @deprecated Use createPiCourtSelectionConfig() instead */
export const piCourtSelectionConfig = createPiCourtSelectionConfig()
