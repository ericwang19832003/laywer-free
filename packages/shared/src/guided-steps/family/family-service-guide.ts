import type { GuidedStepConfig } from '../types'

export const familyServiceGuideConfig: GuidedStepConfig = {
  title: 'How to Serve Your Spouse/Other Party',
  reassurance:
    'Proper service is required before the court can act. This guide explains every option available to you.',

  questions: [
    {
      id: 'cannot_serve_yourself',
      type: 'info',
      prompt:
        'IMPORTANT: You CANNOT serve the papers yourself. Texas law requires a third party to deliver the citation and petition to the other party.',
    },
    {
      id: 'service_method',
      type: 'single_choice',
      prompt: 'How will you serve the other party?',
      options: [
        { value: 'process_server', label: 'Private process server' },
        { value: 'sheriff', label: 'County sheriff' },
        { value: 'certified_mail', label: 'Certified mail (if allowed)' },
        { value: 'waiver', label: 'Waiver of service (other party agrees)' },
        { value: 'not_sure', label: 'Not sure yet' },
      ],
    },
    {
      id: 'process_server_info',
      type: 'info',
      prompt:
        'PRIVATE PROCESS SERVER:\n\u2022 Cost: $50\u2013$100 typically\n\u2022 A licensed process server delivers the citation and petition directly to your spouse\n\u2022 They file a Return of Service (proof of delivery) with the court\n\u2022 Faster and more flexible than the sheriff \u2014 they can attempt service at different times and locations\n\u2022 Find one through the Texas Process Server Association or ask the court clerk for referrals',
      showIf: (answers) => answers.service_method === 'process_server',
    },
    {
      id: 'sheriff_info',
      type: 'info',
      prompt:
        'SHERIFF SERVICE:\n\u2022 Cost: $75\u2013$100 depending on the county\n\u2022 File a request for service with the District Clerk\n\u2022 The county sheriff\u2019s office will attempt to deliver the papers\n\u2022 A deputy will file a Return of Service with the court\n\u2022 May take longer than a private process server, especially in busy counties\n\u2022 If the sheriff cannot locate the respondent after multiple attempts, you\u2019ll need to try another method',
      showIf: (answers) => answers.service_method === 'sheriff',
    },
    {
      id: 'certified_mail_info',
      type: 'info',
      prompt:
        'CERTIFIED MAIL:\n\u2022 Some Texas courts allow service by certified mail with return receipt requested\n\u2022 The respondent must sign for the delivery \u2014 if they refuse or aren\u2019t home, service fails\n\u2022 Check with your court clerk whether this method is permitted in your county for your case type\n\u2022 Keep the signed return receipt (green card) as proof of service',
      showIf: (answers) => answers.service_method === 'certified_mail',
    },
    {
      id: 'waiver_info',
      type: 'info',
      prompt:
        'WAIVER OF SERVICE:\n\u2022 If your spouse agrees, they can sign a "Waiver of Service" form\n\u2022 No delivery needed \u2014 this saves time and money\n\u2022 This is common in uncontested divorces where both parties cooperate\n\u2022 The waiver must be signed, notarized, and filed with the court\n\u2022 The respondent must wait at least the day AFTER receiving the petition before signing\n\u2022 Once filed, the case can proceed without waiting for formal service',
      showIf: (answers) => answers.service_method === 'waiver',
    },
    {
      id: 'not_sure_info',
      type: 'info',
      prompt:
        'OPTIONS SUMMARY:\n\u2022 Process server ($50\u2013$100): fastest, most flexible\n\u2022 Sheriff ($75\u2013$100): reliable but slower\n\u2022 Certified mail: cheapest but respondent must sign\n\u2022 Waiver of service: free if the other party cooperates\n\nRecommendation: If your spouse is cooperative, use a Waiver of Service. If not, a private process server is usually the fastest option.',
      showIf: (answers) => answers.service_method === 'not_sure',
    },
    {
      id: 'citation_info',
      type: 'info',
      prompt:
        'CITATION REQUIREMENTS:\n\u2022 The citation is issued by the District Clerk after you file your petition\n\u2022 It tells the respondent they have been sued and must file an answer by a certain date\n\u2022 The citation MUST be served with a copy of your Original Petition\n\u2022 The respondent generally has until 10:00 AM on the first Monday after 20 days from service to file an answer',
    },
    {
      id: 'cant_find_them',
      type: 'yes_no',
      prompt: 'Are you having trouble locating the other party?',
    },
    {
      id: 'service_by_publication',
      type: 'info',
      prompt:
        'SERVICE BY PUBLICATION (when you can\u2019t find them):\n\u2022 Governed by Texas Rules of Civil Procedure 109\u2013117\n\u2022 You must file a sworn statement (affidavit) explaining what efforts you\u2019ve made to find the respondent\n\u2022 The court may order publication in a local newspaper for a set period\n\u2022 This is a last resort \u2014 it\u2019s slow and the court may limit what relief it can grant\n\u2022 You may need to hire a skip-tracing service first to show the court you made diligent efforts\n\u2022 Cost: newspaper publication fees vary ($100\u2013$300+)',
      showIf: (answers) => answers.cant_find_them === 'yes',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    items.push({
      status: 'info',
      text: 'You cannot serve the papers yourself. Texas law requires a third party.',
    })

    if (answers.service_method && answers.service_method !== 'not_sure') {
      const methodLabels: Record<string, string> = {
        process_server: 'Private process server',
        sheriff: 'County sheriff',
        certified_mail: 'Certified mail',
        waiver: 'Waiver of service',
      }
      items.push({
        status: 'done',
        text: `Service method: ${methodLabels[answers.service_method] ?? answers.service_method}`,
      })
    } else {
      items.push({ status: 'needed', text: 'Choose a service method.' })
    }

    if (answers.service_method === 'waiver') {
      items.push({
        status: 'needed',
        text: 'Have the respondent sign the Waiver of Service (must be notarized) and file it with the court.',
      })
    }

    items.push({
      status: 'info',
      text: 'The citation and a copy of your Original Petition must be served together. The respondent has until 10:00 AM on the first Monday after 20 days to answer.',
    })

    if (answers.cant_find_them === 'yes') {
      items.push({
        status: 'needed',
        text: 'File an affidavit of diligent search and request service by publication (Tex. R. Civ. P. 109\u2013117).',
      })
    }

    return items
  },
}
