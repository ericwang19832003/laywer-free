import type { GuidedStepConfig } from '../types'

export const fdcpaCheckConfig: GuidedStepConfig = {
  title: 'Check for Collector Violations (FDCPA & TDCPA)',
  reassurance:
    'Debt collectors must follow strict federal and Texas rules. If they broke them, you may have additional defenses or even a counterclaim worth real money.',

  questions: [
    {
      id: 'tdcpa_intro',
      type: 'info',
      prompt:
        'This step checks for violations under TWO laws:\n\n1. FEDERAL (FDCPA) — Applies to third-party debt collectors. Statutory damages up to $1,000 per lawsuit.\n\n2. TEXAS (TDCPA / Texas Finance Code Ch. 392) — Applies to BOTH debt collectors AND original creditors (broader protection). TDCPA violations automatically become DTPA violations, which can mean TREBLE DAMAGES (3x your actual damages) for knowing or intentional conduct.\n\nIf the company suing you is the original creditor (not a debt buyer), the TDCPA still protects you even though the FDCPA may not.',
    },
    {
      id: 'plaintiff_is_original',
      type: 'yes_no',
      prompt: 'Is the plaintiff the original creditor (not a debt buyer or collection agency)?',
      helpText: 'The FDCPA only covers third-party collectors, but the TDCPA covers original creditors too.',
    },
    {
      id: 'original_creditor_info',
      type: 'info',
      prompt:
        'Since this is the original creditor, the federal FDCPA may not apply — but the Texas TDCPA still does. All the violations below are also prohibited under Texas law. If you find violations, you can pursue a counterclaim under the TDCPA/DTPA.',
      showIf: (answers) => answers.plaintiff_is_original === 'yes',
    },
    {
      id: 'called_odd_hours',
      type: 'yes_no',
      prompt: 'Did the collector call you before 8am or after 9pm?',
      helpText:
        'The FDCPA restricts calls to between 8am and 9pm in your local time zone.',
    },
    {
      id: 'called_odd_hours_info',
      type: 'info',
      prompt:
        'This is a violation of FDCPA § 1692c(a)(1). Collectors are prohibited from contacting you at any unusual time or place. Calls before 8am or after 9pm are presumed inconvenient.',
      showIf: (answers) => answers.called_odd_hours === 'yes',
    },
    {
      id: 'contacted_at_work',
      type: 'yes_no',
      prompt:
        'Did the collector contact you at work after you told them to stop?',
      helpText:
        'Once you tell a collector your employer disapproves of such calls, they must stop.',
    },
    {
      id: 'contacted_at_work_info',
      type: 'info',
      prompt:
        'This is a violation of FDCPA § 1692c(a)(3). Once a collector knows or has reason to know your employer prohibits such communication, they must stop contacting you at work.',
      showIf: (answers) => answers.contacted_at_work === 'yes',
    },
    {
      id: 'threatened_arrest',
      type: 'yes_no',
      prompt: 'Did the collector threaten you with arrest or jail?',
      helpText:
        'Debt collectors cannot threaten criminal action for a civil debt.',
    },
    {
      id: 'threatened_arrest_info',
      type: 'info',
      prompt:
        'This is a violation of FDCPA § 1692e(4) and § 1692e(5). Threatening arrest, imprisonment, or any action that cannot legally be taken is a false and deceptive practice.',
      showIf: (answers) => answers.threatened_arrest === 'yes',
    },
    {
      id: 'misrepresented_amount',
      type: 'yes_no',
      prompt: 'Did the collector misrepresent the amount you owe?',
      helpText:
        'This includes inflating the balance, adding unauthorized fees, or misstating interest.',
    },
    {
      id: 'misrepresented_amount_info',
      type: 'info',
      prompt:
        'This is a violation of FDCPA § 1692e(2)(A). Falsely representing the character, amount, or legal status of a debt is prohibited.',
      showIf: (answers) => answers.misrepresented_amount === 'yes',
    },
    {
      id: 'failed_validation',
      type: 'yes_no',
      prompt:
        'Did the collector fail to send you a written validation notice within 5 days of first contacting you?',
      helpText:
        'Within 5 days of first contact, they must send a written notice with the debt amount, creditor name, and your right to dispute.',
    },
    {
      id: 'failed_validation_info',
      type: 'info',
      prompt:
        'This is a violation of FDCPA § 1692g(a). The collector must provide written notice within 5 days of initial communication stating the amount of the debt, the name of the creditor, and your right to dispute within 30 days.',
      showIf: (answers) => answers.failed_validation === 'yes',
    },
    {
      id: 'used_profanity',
      type: 'yes_no',
      prompt: 'Did the collector use obscene or profane language?',
      helpText: 'Any abusive, obscene, or profane language is prohibited.',
    },
    {
      id: 'used_profanity_info',
      type: 'info',
      prompt:
        'This is a violation of FDCPA § 1692d(2). The use of obscene, profane, or abusive language in connection with debt collection is expressly prohibited.',
      showIf: (answers) => answers.used_profanity === 'yes',
    },
    {
      id: 'contacted_third_parties',
      type: 'yes_no',
      prompt:
        'Did the collector contact your family, friends, neighbors, or coworkers about the debt?',
      helpText:
        'Collectors can only contact third parties to find your location, and cannot reveal the debt.',
    },
    {
      id: 'contacted_third_parties_info',
      type: 'info',
      prompt:
        'This is a violation of FDCPA § 1692c(b). A collector may not communicate with any third party in connection with the collection of a debt, except to obtain your location information (and even then, cannot reveal the debt).',
      showIf: (answers) => answers.contacted_third_parties === 'yes',
    },
    {
      id: 'continued_after_cease',
      type: 'yes_no',
      prompt:
        'Did the collector continue contacting you after you sent a written cease-and-desist request?',
      helpText:
        'Once you send a written request to stop, they must cease communication with limited exceptions.',
    },
    {
      id: 'continued_after_cease_info',
      type: 'info',
      prompt:
        'This is a violation of FDCPA § 1692c(c). After receiving a written request to cease communication, the collector may only contact you to confirm they are stopping, or to notify you of a specific action (such as filing a lawsuit).',
      showIf: (answers) => answers.continued_after_cease === 'yes',
    },
    {
      id: 'false_attorney',
      type: 'yes_no',
      prompt:
        'Did the collector falsely claim to be an attorney or represent that they were from a law firm?',
      helpText:
        'Misrepresenting their identity or professional status is a serious violation.',
    },
    {
      id: 'false_attorney_info',
      type: 'info',
      prompt:
        'This is a violation of FDCPA § 1692e(3). Falsely representing or implying that any individual is an attorney or that any communication is from an attorney is prohibited.',
      showIf: (answers) => answers.false_attorney === 'yes',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    const violations: { key: string; label: string; statute: string }[] = [
      {
        key: 'called_odd_hours',
        label: 'Calls at prohibited times',
        statute: '§ 1692c(a)(1)',
      },
      {
        key: 'contacted_at_work',
        label: 'Continued workplace contact',
        statute: '§ 1692c(a)(3)',
      },
      {
        key: 'threatened_arrest',
        label: 'Threats of arrest or jail',
        statute: '§ 1692e(4)/(5)',
      },
      {
        key: 'misrepresented_amount',
        label: 'Misrepresented debt amount',
        statute: '§ 1692e(2)(A)',
      },
      {
        key: 'failed_validation',
        label: 'Failed to send validation notice',
        statute: '§ 1692g(a)',
      },
      {
        key: 'used_profanity',
        label: 'Used obscene or profane language',
        statute: '§ 1692d(2)',
      },
      {
        key: 'contacted_third_parties',
        label: 'Contacted third parties about the debt',
        statute: '§ 1692c(b)',
      },
      {
        key: 'continued_after_cease',
        label: 'Continued collection after cease request',
        statute: '§ 1692c(c)',
      },
      {
        key: 'false_attorney',
        label: 'False representation as attorney',
        statute: '§ 1692e(3)',
      },
    ]

    const found = violations.filter((v) => answers[v.key] === 'yes')

    if (found.length === 0) {
      items.push({
        status: 'info',
        text: 'No FDCPA violations identified based on your answers. The collector appears to have followed the rules.',
      })
    } else {
      items.push({
        status: 'done',
        text: `${found.length} potential FDCPA violation${found.length > 1 ? 's' : ''} identified.`,
      })

      for (const v of found) {
        items.push({
          status: 'info',
          text: `${v.label} — FDCPA ${v.statute}`,
        })
      }

      items.push({
        status: 'needed',
        text: 'Document each violation with dates, times, and any evidence (call logs, voicemails, letters). Potential damages: up to $1,000 statutory (FDCPA § 1692k) + actual damages. Under Texas TDCPA/DTPA, knowing violations can result in TREBLE damages (3x actual damages).',
      })
    }

    return items
  },
}
