import type { GuidedStepConfig } from '../types'

function valueOrFallback(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim()
  return trimmed ? trimmed : fallback
}

export const piServiceGuideConfig: GuidedStepConfig = {
  title: 'How to Serve the Defendant',
  reassurance:
    "Let's build your service plan. Answer a few practical questions and we will tell you who to serve, where to send the papers, and how to confirm service was completed.",

  questions: [
    {
      id: 'service_overview',
      type: 'info',
      prompt:
        "Let's build your service plan.\n\nStart with what you know. If you only know the truck/company/person involved, we will help turn that into a service target. The goal is to answer four questions:\n1. Has the court accepted the petition?\n2. Has citation been issued?\n3. Who or what business should receive service?\n4. Which county's sheriff, constable, or process server should receive the packet?\n\nDo not serve the insurance company unless it is named as a defendant in your lawsuit. You cannot serve the papers yourself.",
    },
    {
      id: 'filing_accepted',
      type: 'single_choice',
      prompt: 'Has the court accepted your petition?',
      helpText:
        'Look for an eFileTexas acceptance notice, file-stamped petition, receipt, or cause number. If the filing is only submitted, wait for acceptance before arranging service.',
      options: [
        { value: 'yes', label: 'Yes, it was accepted' },
        { value: 'submitted_only', label: 'Submitted, but not accepted yet' },
        { value: 'not_sure', label: 'I am not sure' },
      ],
    },
    {
      id: 'filing_not_ready_info',
      type: 'info',
      prompt:
        'Wait for court acceptance before arranging service. Once accepted, the clerk can issue citation and you can send the citation plus petition to a sheriff, constable, or process server.',
      showIf: (answers) =>
        answers.filing_accepted === 'submitted_only' ||
        answers.filing_accepted === 'not_sure',
    },
    {
      id: 'citation_status',
      type: 'single_choice',
      prompt: 'Do you have the court-issued citation?',
      helpText:
        'After your petition is accepted, the clerk issues a citation. The citation is the official notice that must be delivered with your petition. A file-stamped petition alone is not enough.',
      options: [
        { value: 'yes', label: 'Yes, I have it' },
        { value: 'no', label: 'No, I do not have it yet' },
        { value: 'not_sure', label: 'I am not sure' },
      ],
      showIf: (answers) => answers.filing_accepted === 'yes',
    },
    {
      id: 'citation_needed_info',
      type: 'info',
      prompt:
        'If you do not know whether citation was issued:\n1. Contact the clerk for the court where you filed\n2. Ask: "Has citation been issued for each defendant in cause number [your case number]?"\n3. Ask how to download it from eFileTexas or pick it up\n4. Do not send papers to a sheriff or process server until the packet includes both the citation and petition',
      showIf: (answers) =>
        answers.citation_status === 'no' || answers.citation_status === 'not_sure',
    },
    {
      id: 'filing_court',
      type: 'text',
      prompt: 'Which court issued or will issue the citation?',
      placeholder: 'Example: Harris County Court at Law, Harris County District Clerk, JP Court Precinct 1',
      helpText:
        'Use the court or clerk shown on your accepted filing, cause number, or eFileTexas acceptance notice.',
    },
    {
      id: 'filing_county',
      type: 'text',
      prompt: 'What county is the case filed in?',
      placeholder: 'Example: Harris County',
      helpText:
        'This is the county where your petition was filed. The Return of Service must go back into this case.',
    },
    {
      id: 'known_defendant_source',
      type: 'single_choice',
      prompt: 'Who did you sue or plan to sue?',
      helpText:
        'Use what you know. If this is a company case, the service target is usually the company through its registered agent or authorized recipient.',
      options: [
        { value: 'individual', label: 'A person, driver, or property owner' },
        { value: 'rental_truck_company', label: 'I sued or plan to sue Penske / a rental-truck company' },
        { value: 'business', label: 'Another business or company' },
        { value: 'insurance_company', label: 'The insurance company' },
        { value: 'not_sure', label: 'I am not sure' },
      ],
    },
    {
      id: 'defendant_name',
      type: 'text',
      prompt: 'What is the defendant name exactly as listed in your petition?',
      placeholder: 'Example: Penske Truck Leasing Co.',
      helpText:
        'Use the legal name from the petition caption. If the defendant is a business, do not use only a store name, adjuster, or insurer unless that entity is named as a defendant.',
    },
    {
      id: 'company_service_target_info',
      type: 'info',
      prompt:
        'For a company such as Penske, service usually goes to the company through its registered agent or another authorized business recipient. The user does not need to personally know the legal recipient at first; the next task is to look up the registered agent and service address, then give that information to the sheriff, constable, or process server.',
      showIf: (answers) =>
        answers.known_defendant_source === 'rental_truck_company' ||
        answers.known_defendant_source === 'business',
    },
    {
      id: 'insurance_company_warning',
      type: 'info',
      prompt:
        'Usually you do not serve the insurance company unless the insurance company is named as a defendant in your petition. If your petition names the driver, company, or property owner, service should be directed to that named defendant instead.',
      showIf: (answers) => answers.known_defendant_source === 'insurance_company',
    },
    {
      id: 'not_sure_defendant_info',
      type: 'info',
      prompt:
        'If you are not sure who to serve, compare the petition caption to your evidence. For a driver, use the driver named as defendant. For a company, look up the legal entity and registered agent. Do not serve only an adjuster, claim representative, or insurance company unless that entity is listed as a defendant.',
      showIf: (answers) => answers.known_defendant_source === 'not_sure',
    },
    {
      id: 'individual_service_info',
      type: 'info',
      prompt:
        "For an individual defendant, give the server the person's full name, physical address, phone number if known, workplace if known, vehicle description if useful, and any best times to find them. The server should personally deliver the citation and petition.",
      showIf: (answers) =>
        answers.known_defendant_source === 'individual' ||
        answers.defendant_type === 'individual',
    },
    {
      id: 'business_service_info',
      type: 'info',
      prompt:
        "For a business defendant, search for the registered agent and registered office before service. The process server or sheriff usually serves the registered agent. If the business is a sole proprietorship, you may need to serve the owner personally.",
      showIf: (answers) =>
        answers.known_defendant_source === 'business' ||
        answers.known_defendant_source === 'rental_truck_company' ||
        answers.defendant_type === 'business',
    },
    {
      id: 'out_of_state_service_info',
      type: 'info',
      prompt:
        'For an out-of-state defendant, ask the clerk or a process server about the correct method before sending papers. Depending on the facts, service may be handled by an out-of-state process server, certified mail if allowed by the court, or the Texas Secretary of State under the long-arm process.',
      showIf: (answers) => answers.defendant_type === 'out_of_state',
    },
    {
      id: 'service_address_known',
      type: 'yes_no',
      prompt: 'Do you know where the defendant can be served?',
      helpText:
        'Use a physical address where the defendant or registered agent can actually be found. A P.O. box is usually not enough for personal delivery.',
    },
    {
      id: 'address_needed_info',
      type: 'info',
      prompt:
        'Find a service address before ordering service:\n1. Check the crash report, repair records, contract, emails, or prior letters\n2. For a business, search the Secretary of State or Comptroller records for the registered agent\n3. For a person, consider a workplace address if home address is unknown\n4. Document every attempt if you cannot locate the defendant',
      showIf: (answers) => answers.service_address_known === 'no',
    },
    {
      id: 'service_recipient',
      type: 'text',
      prompt: 'Who should receive service at that address?',
      placeholder: 'Example: Penske registered agent, John Smith, store manager authorized for service',
      helpText:
        'For an individual, this is usually the defendant. For a business, use the registered agent or another legally authorized recipient.',
      showIf: (answers) => answers.service_address_known === 'yes',
    },
    {
      id: 'service_address',
      type: 'text',
      prompt: 'What address will be used for service?',
      placeholder: 'Example: 123 Main St, Austin, TX 78701',
      helpText:
        'Use a physical address where the defendant, registered agent, or authorized recipient can actually be found.',
      showIf: (answers) => answers.service_address_known === 'yes',
    },
    {
      id: 'service_county_location',
      type: 'single_choice',
      prompt: 'Where is the service address compared with the filing court?',
      options: [
        { value: 'same_county', label: 'Same county as the filing court' },
        { value: 'different_texas_county', label: 'Different Texas county' },
        { value: 'outside_texas', label: 'Outside Texas' },
        { value: 'not_sure', label: 'Not sure' },
      ],
      showIf: (answers) => answers.service_address_known === 'yes',
    },
    {
      id: 'service_county',
      type: 'text',
      prompt: 'What county is the service address in?',
      placeholder: 'Example: Travis County',
      helpText:
        'This determines which sheriff, constable, or local process server should receive the service packet.',
      showIf: (answers) =>
        answers.service_address_known === 'yes' &&
        answers.service_county_location === 'different_texas_county',
    },
    {
      id: 'service_method',
      type: 'single_choice',
      prompt: 'How will you serve the defendant?',
      options: [
        { value: 'process_server', label: 'Private process server' },
        { value: 'sheriff_constable', label: 'Sheriff or constable' },
        { value: 'secretary_of_state', label: 'Texas Secretary of State or special method' },
        { value: 'not_sure', label: 'Not sure yet' },
      ],
    },
    {
      id: 'process_server_info',
      type: 'info',
      prompt:
        'Private process server instructions:\n1. Contact a certified process server in the county where service will happen\n2. Send the court-issued citation, file-stamped petition, defendant name, address, phone number if known, and any helpful locating details\n3. Ask how many attempts are included and what the fee covers\n4. After service, confirm the server will file a Return of Service with the court\n5. Save the return and the invoice/receipt',
      showIf: (answers) => answers.service_method === 'process_server',
    },
    {
      id: 'sheriff_info',
      type: 'info',
      prompt:
        "Sheriff or constable instructions:\n1. Ask the clerk which sheriff or constable handles service for the address\n2. Pay the service fee if required\n3. Provide the citation, petition, defendant name, and service address\n4. Ask how to track attempts\n5. Confirm the officer will file a Return of Service with the court",
      showIf: (answers) => answers.service_method === 'sheriff_constable',
    },
    {
      id: 'special_method_info',
      type: 'info',
      prompt:
        'Special service methods need extra care. Ask the clerk, a process server, or legal aid before using Secretary of State service, substituted service, publication, or certified mail. Some methods require a motion, affidavit, court order, or extra fee.',
      showIf: (answers) =>
        answers.service_method === 'secretary_of_state' ||
        answers.service_method === 'not_sure',
    },
    {
      id: 'service_packet_ready',
      type: 'yes_no',
      prompt: 'What will you send to the sheriff, constable, or process server?',
      helpText:
        'Your service packet should include the court-issued citation, file-stamped petition, any required attachments, defendant name, service address, helpful locating details, your contact information, and payment for service if required.',
    },
    {
      id: 'service_packet_info',
      type: 'info',
      prompt:
        'Prepare the service packet:\n- Court-issued citation for each defendant\n- File-stamped petition and required attachments\n- Defendant name and physical service address\n- Registered agent information for a business defendant\n- Helpful details such as phone number, workplace, vehicle, or best service times\n- Your contact information and service fee payment if required',
      showIf: (answers) => answers.service_packet_ready === 'no',
    },
    {
      id: 'return_of_service_plan',
      type: 'yes_no',
      prompt: 'Will the server file a Return of Service with the court?',
      helpText:
        'The Return of Service proves who was served, when, where, and how. The court usually cannot move forward until this proof is filed.',
    },
    {
      id: 'return_of_service_info',
      type: 'info',
      prompt:
        'After service is completed:\n1. Get a copy of the Return of Service\n2. Confirm it was filed with the court\n3. Record the service completed date, service method, and defendant name served\n4. Use that date to calculate the answer deadline\n\nThe answer deadline does not start until service is completed.',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []
    const filingCourt = valueOrFallback(answers.filing_court, 'the filing court or clerk')
    const filingCounty = valueOrFallback(answers.filing_county, 'the filing county')
    const defendantName = valueOrFallback(answers.defendant_name, 'the defendant named in your petition')
    const serviceRecipient = valueOrFallback(answers.service_recipient, defendantName)
    const serviceAddress = valueOrFallback(answers.service_address, 'the confirmed service address')
    const serviceCounty = valueOrFallback(answers.service_county, 'the county where service will happen')
    const citationStatus = answers.citation_status ?? answers.citation_ready
    const defendantSource = answers.known_defendant_source ?? answers.defendant_type

    if (answers.filing_accepted === 'submitted_only') {
      items.push({
        status: 'needed',
        text: 'Wait for the court to accept the petition before arranging service.',
      })
    } else if (answers.filing_accepted === 'not_sure') {
      items.push({
        status: 'needed',
        text: 'Check eFileTexas or call the filing clerk to confirm whether the petition was accepted.',
      })
    }

    if (citationStatus === 'yes') {
      items.push({ status: 'done', text: 'Court-issued citation is ready.' })
    } else if (citationStatus === 'not_sure') {
      items.push({
        status: 'needed',
        text: 'Ask the filing clerk whether citation has been issued for each defendant. Get the court-issued citation from the clerk or download it from eFileTexas before ordering service.',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Get the court-issued citation from the clerk before ordering service.',
      })
    }

    if (defendantSource && defendantSource !== 'not_sure') {
      const labels: Record<string, string> = {
        individual: 'Individual person',
        business: 'Business or company',
        rental_truck_company: 'Rental-truck company or Penske',
        insurance_company: 'Insurance company',
        out_of_state: 'Out-of-state defendant',
      }
      items.push({
        status: 'done',
        text: `Known party type: ${labels[defendantSource] ?? defendantSource}.`,
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Confirm who exactly needs to be served before sending papers.',
      })
    }

    if (defendantSource === 'rental_truck_company' || defendantSource === 'business') {
      items.push({
        status: 'info',
        text: `For ${defendantName}, service usually goes to its registered agent or another authorized business recipient. If you do not have that address yet, look up the registered agent and service address before sending the packet.`,
      })
    } else if (defendantSource === 'insurance_company') {
      items.push({
        status: 'needed',
        text: 'Do not serve the insurance company unless it is named as a defendant. Check the petition caption and redirect service to the named driver, company, property owner, or registered agent if needed.',
      })
    }

    if (answers.service_address_known === 'yes') {
      items.push({ status: 'done', text: 'Service address is identified.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Find a service address for the defendant or registered agent.',
      })
    }

    if (answers.service_method && answers.service_method !== 'not_sure') {
      const labels: Record<string, string> = {
        process_server: 'Private process server',
        sheriff_constable: 'Sheriff or constable',
        secretary_of_state: 'Secretary of State or special method',
      }
      items.push({
        status: 'done',
        text: `Service method: ${labels[answers.service_method] ?? answers.service_method}.`,
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Choose a service method: process server, sheriff/constable, or a special method approved for your situation.',
      })
    }

    if (answers.filing_court || answers.filing_county) {
      items.push({
        status: 'info',
        text: `Pick up or download the citation from ${filingCourt} in ${filingCounty}.`,
      })
    }

    if (answers.service_county_location === 'same_county') {
      items.push({
        status: 'info',
        text: `Because the service address is in the same county as the filing court, send the citation and petition to the sheriff/constable for ${filingCounty} or a certified private process server serving that county.`,
      })
    } else if (answers.service_county_location === 'different_texas_county') {
      items.push({
        status: 'info',
        text: `Because the service address is in a different Texas county, send the citation and petition to the sheriff or constable in ${serviceCounty}, or to a certified private process server serving ${serviceCounty}.`,
      })
    } else if (answers.service_county_location === 'outside_texas') {
      items.push({
        status: 'info',
        text: 'Because the service address is outside Texas, confirm the allowed method before sending papers. You may need an out-of-state process server, certified mail if the court allows it, or Secretary of State/long-arm service.',
      })
    } else if (answers.service_county_location === 'not_sure') {
      items.push({
        status: 'needed',
        text: 'Confirm whether the service address is in the filing county, another Texas county, or outside Texas before sending the packet.',
      })
    }

    if (answers.defendant_name || answers.service_recipient || answers.service_address) {
      items.push({
        status: 'info',
        text: `Serve ${serviceRecipient} for ${defendantName} at ${serviceAddress}.`,
      })
    }

    if (answers.service_packet_ready === 'yes') {
      items.push({ status: 'done', text: 'Service packet is ready.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Prepare the service packet with citation, petition, address, locating details, and service fee if required.',
      })
    }

    if (answers.return_of_service_plan === 'yes') {
      items.push({ status: 'done', text: 'Return of Service filing plan confirmed.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Confirm the server will file a Return of Service with the court.',
      })
    }

    items.push({
      status: 'info',
      text: 'The answer deadline does not start until service is completed and proof of service is filed.',
    })

    if (answers.filing_county) {
      items.push({
        status: 'info',
        text: `Confirm the Return of Service is filed back in the ${filingCounty} case.`,
      })
    }

    return items
  },
}
