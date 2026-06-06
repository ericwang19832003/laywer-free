import type { GuidedStepConfig } from '../types'

export const paternityConfig: GuidedStepConfig = {
  title: 'Establishing Legal Paternity',
  reassurance:
    'Legal paternity must be established before a court can order custody or child support for unmarried parents. Let\u2019s figure out where you stand.',
  questions: [
    {
      id: 'parents_married',
      type: 'single_choice',
      prompt: 'Were the parents married at the time of the child\u2019s birth?',
      helpText:
        'Texas law presumes paternity in certain marriage situations. Select the option that best describes your situation.',
      options: [
        { value: 'married_at_birth', label: 'Yes \u2014 married when the child was born' },
        { value: 'married_within_300', label: 'Divorced, but within 300 days before the birth' },
        { value: 'married_after', label: 'Married after the child was born' },
        { value: 'never_married', label: 'Never married' },
      ],
    },
    {
      id: 'paternity_presumed_info',
      type: 'info',
      prompt:
        'Because of the marriage, paternity is legally presumed. No additional steps are needed to establish paternity. You can proceed directly to custody or support actions.',
      acknowledgeLabel: 'Great — I\'m ready to proceed →',
      showIf: (a) =>
        a.parents_married === 'married_at_birth' ||
        a.parents_married === 'married_within_300' ||
        a.parents_married === 'married_after',
    },
    {
      id: 'aop_signed',
      type: 'yes_no',
      prompt: 'Was an Acknowledgment of Paternity (AOP) signed by both parents?',
      helpText:
        'An AOP is a legal form signed voluntarily by both parents, often at the hospital after birth.',
      showIf: (a) => a.parents_married === 'never_married',
    },
    {
      id: 'aop_established_info',
      type: 'info',
      prompt:
        'A signed Acknowledgment of Paternity has the same legal effect as a court order establishing paternity. It can be rescinded within 60 days of signing. After 60 days, it can only be challenged on the basis of fraud, duress, or material mistake of fact.',
      acknowledgeLabel: 'Understood — paternity is established →',
      showIf: (a) => a.parents_married === 'never_married' && a.aop_signed === 'yes',
    },
    {
      id: 'paternity_path',
      type: 'single_choice',
      prompt: 'How would you like to establish paternity?',
      helpText:
        'If both parents agree on who the father is, a voluntary acknowledgment is the simplest path. Otherwise, a court order with DNA testing may be needed.',
      options: [
        { value: 'voluntary', label: 'Voluntary \u2014 the other parent will sign an AOP' },
        { value: 'court_order', label: 'Court order \u2014 need DNA testing' },
        { value: 'not_sure', label: 'Not sure yet' },
      ],
      showIf: (a) => a.parents_married === 'never_married' && a.aop_signed === 'no',
    },
    {
      id: 'voluntary_info',
      type: 'info',
      prompt:
        'Both parents sign the AOP under penalty of perjury. The form is free and can be obtained by calling 866-255-2006. If there is a presumed father (e.g., from a previous marriage), a Denial of Paternity must also be signed by that person.',
      acknowledgeLabel: 'Got it \u2014 I\'ll get the AOP form \u2192',
      showIf: (a) =>
        a.parents_married === 'never_married' &&
        a.aop_signed === 'no' &&
        a.paternity_path === 'voluntary',
    },
    {
      id: 'court_order_info',
      type: 'info',
      prompt:
        'You can file a paternity suit and the court will order DNA testing. The Office of the Attorney General can arrange testing at no cost \u2014 call 1-800-255-8014. If the alleged father refuses to submit to testing, the court may presume paternity.',
      acknowledgeLabel: 'Understood \u2014 I\'ll file the paternity suit \u2192',
      showIf: (a) =>
        a.parents_married === 'never_married' &&
        a.aop_signed === 'no' &&
        (a.paternity_path === 'court_order' || a.paternity_path === 'not_sure'),
    },
  ],
  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []
    const married = answers.parents_married

    // Paternity presumed via marriage
    if (married === 'married_at_birth' || married === 'married_within_300' || married === 'married_after') {
      items.push({ status: 'done', text: 'Paternity is legally presumed through marriage.' })
      items.push({ status: 'info', text: 'No additional steps needed to establish paternity.' })
      return items
    }

    // AOP already signed
    if (answers.aop_signed === 'yes') {
      items.push({ status: 'done', text: 'Paternity established via signed Acknowledgment of Paternity.' })
      items.push({
        status: 'info',
        text: 'The AOP can be rescinded within 60 days. After that, only fraud, duress, or material mistake of fact.',
      })
      return items
    }

    // Voluntary path
    if (answers.paternity_path === 'voluntary') {
      items.push({ status: 'needed', text: 'Both parents need to sign an Acknowledgment of Paternity.' })
      items.push({ status: 'info', text: 'Call 866-255-2006 to obtain the free AOP form.' })
      items.push({
        status: 'info',
        text: 'If a presumed father exists, a Denial of Paternity is also required.',
      })
      return items
    }

    // Court order or not sure
    if (answers.paternity_path === 'court_order' || answers.paternity_path === 'not_sure') {
      items.push({ status: 'needed', text: 'File a paternity suit to establish legal paternity.' })
      items.push({
        status: 'info',
        text: 'The court will order DNA testing. The AG can arrange testing at no cost \u2014 call 1-800-255-8014.',
      })
      items.push({
        status: 'info',
        text: 'If the alleged father refuses testing, the court may presume paternity.',
      })
      return items
    }

    // Fallback: not enough info yet
    items.push({ status: 'needed', text: 'Paternity has not yet been established. Complete the steps above.' })
    return items
  },
}
