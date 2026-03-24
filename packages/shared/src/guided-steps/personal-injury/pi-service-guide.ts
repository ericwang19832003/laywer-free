import type { GuidedStepConfig } from '../types'

export const piServiceGuideConfig: GuidedStepConfig = {
  title: 'How to Serve the Defendant',
  reassurance:
    'Proper service is legally required before your case can proceed. This guide covers every method and situation.',

  questions: [
    {
      id: 'serve_the_person',
      type: 'info',
      prompt:
        "IMPORTANT: You must serve the PERSON who caused your injury \u2014 not their insurance company. The insurance company is not a party to your lawsuit (unless you have a separate UM/UIM claim). You cannot serve papers yourself; Texas law requires a third party to deliver them.",
    },
    {
      id: 'defendant_type',
      type: 'single_choice',
      prompt: 'Who is the defendant in your case?',
      options: [
        { value: 'individual', label: 'An individual person' },
        { value: 'business', label: 'A business or company' },
        { value: 'out_of_state', label: 'Someone who lives out of state' },
        { value: 'not_sure', label: 'Not sure how to identify them' },
      ],
    },
    {
      id: 'individual_service_info',
      type: 'info',
      prompt:
        "SERVING AN INDIVIDUAL:\n\u2022 You need the defendant's current address (home or workplace)\n\u2022 A process server or sheriff will deliver the citation and a copy of your Original Petition directly to the defendant\n\u2022 Service must be made in person \u2014 you cannot leave papers on a doorstep or with a random person at the address\n\u2022 If the defendant avoids service, you may need to attempt service at different times or locations",
      showIf: (answers) => answers.defendant_type === 'individual',
    },
    {
      id: 'business_service_info',
      type: 'info',
      prompt:
        "SERVING A BUSINESS:\n\u2022 Serve the company's registered agent \u2014 this is the person or entity designated to receive legal documents\n\u2022 Find the registered agent by searching the Texas Secretary of State's website (sos.state.tx.us) under \"SOSDirect\"\n\u2022 If the business is a sole proprietorship, serve the owner personally\n\u2022 For corporations and LLCs, service on the registered agent constitutes service on the company\n\u2022 If the registered agent cannot be found, you may serve through the Texas Secretary of State",
      showIf: (answers) => answers.defendant_type === 'business',
    },
    {
      id: 'out_of_state_service_info',
      type: 'info',
      prompt:
        "SERVING AN OUT-OF-STATE DEFENDANT:\nTexas long-arm statute (Tex. Civ. Prac. & Rem. Code \u00a717.044) allows you to serve nonresidents through the Texas Secretary of State:\n1. File a Motion for Substituted Service through the Secretary of State\n2. Send two copies of the citation and petition to the Secretary of State with the required fee\n3. The Secretary of State will forward the documents to the defendant by certified mail\n4. The defendant has the standard time to answer after receiving the forwarded documents\n\nThis method is commonly used when the at-fault driver was passing through Texas or lives across state lines.",
      showIf: (answers) => answers.defendant_type === 'out_of_state',
    },
    {
      id: 'service_method',
      type: 'single_choice',
      prompt: 'How will you serve the defendant?',
      options: [
        { value: 'process_server', label: 'Private process server' },
        { value: 'sheriff', label: 'County sheriff' },
        { value: 'not_sure', label: 'Not sure yet' },
      ],
      showIf: (answers) =>
        answers.defendant_type === 'individual' || answers.defendant_type === 'business',
    },
    {
      id: 'process_server_info',
      type: 'info',
      prompt:
        "PRIVATE PROCESS SERVER:\n\u2022 Cost: $50\u2013$150 typically\n\u2022 A licensed process server delivers the citation and petition directly to the defendant\n\u2022 They file a Return of Service (proof of delivery) with the court\n\u2022 Faster and more flexible than the sheriff \u2014 they can attempt service at different times and locations\n\u2022 Find one through the Texas Process Server Association or ask the court clerk for referrals",
      showIf: (answers) => answers.service_method === 'process_server',
    },
    {
      id: 'sheriff_info',
      type: 'info',
      prompt:
        "SHERIFF SERVICE:\n\u2022 Cost: $75\u2013$100 depending on the county\n\u2022 File a request for service with the District Clerk\n\u2022 The county sheriff's office will attempt to deliver the papers\n\u2022 A deputy will file a Return of Service with the court\n\u2022 May take longer than a private process server, especially in busy counties",
      showIf: (answers) => answers.service_method === 'sheriff',
    },
    {
      id: 'certificate_of_service',
      type: 'info',
      prompt:
        "CERTIFICATE OF SERVICE REQUIREMENTS:\n\u2022 After the defendant is served, the person who served them must file a \"Return of Service\" or \"Certificate of Service\" with the court\n\u2022 This document proves: who was served, when they were served, where they were served, and how they were served\n\u2022 Without a properly filed return of service, the court cannot proceed\n\u2022 The defendant then has until 10:00 AM on the first Monday after 20 days from service to file an answer\n\u2022 Keep a copy of the return of service for your records",
    },
    {
      id: 'trouble_locating',
      type: 'yes_no',
      prompt: 'Are you having trouble locating the defendant?',
    },
    {
      id: 'trouble_locating_info',
      type: 'info',
      prompt:
        "IF YOU CANNOT FIND THE DEFENDANT:\n\u2022 Try skip-tracing services or online people-search tools to locate their current address\n\u2022 Check the police accident report for their address, phone number, and insurance info\n\u2022 As a last resort, you can request service by publication (Tex. R. Civ. P. 109\u2013117):\n  1. File an affidavit describing your diligent efforts to locate the defendant\n  2. The court may order publication in a local newspaper\n  3. This is slow and expensive ($100\u2013$300+) and limits the relief available\n\u2022 Document every attempt to locate the defendant \u2014 the court needs to see diligent effort",
      showIf: (answers) => answers.trouble_locating === 'yes',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    items.push({
      status: 'info',
      text: 'Serve the person who caused your injury \u2014 not their insurance company. You cannot serve papers yourself.',
    })

    if (answers.defendant_type && answers.defendant_type !== 'not_sure') {
      const typeLabels: Record<string, string> = {
        individual: 'Individual \u2014 serve in person at their home or workplace',
        business: 'Business \u2014 serve the registered agent (search sos.state.tx.us)',
        out_of_state: 'Out-of-state \u2014 serve through the Secretary of State (Tex. Civ. Prac. & Rem. Code \u00a717.044)',
      }
      items.push({
        status: 'done',
        text: `Defendant type: ${typeLabels[answers.defendant_type] ?? answers.defendant_type}`,
      })
    } else {
      items.push({ status: 'needed', text: 'Identify the defendant type to determine the correct service method.' })
    }

    if (answers.service_method && answers.service_method !== 'not_sure') {
      const methodLabels: Record<string, string> = {
        process_server: 'Private process server ($50\u2013$150)',
        sheriff: 'County sheriff ($75\u2013$100)',
      }
      items.push({
        status: 'done',
        text: `Service method: ${methodLabels[answers.service_method] ?? answers.service_method}`,
      })
    } else if (answers.defendant_type !== 'out_of_state') {
      items.push({ status: 'needed', text: 'Choose a service method (process server or sheriff).' })
    }

    items.push({
      status: 'info',
      text: 'A Return of Service must be filed with the court after service. The defendant then has until 10:00 AM on the first Monday after 20 days to answer.',
    })

    if (answers.trouble_locating === 'yes') {
      items.push({
        status: 'needed',
        text: 'Document all attempts to locate the defendant. Consider skip-tracing or service by publication as a last resort.',
      })
    }

    return items
  },
}
