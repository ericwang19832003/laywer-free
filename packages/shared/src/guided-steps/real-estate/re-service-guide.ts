import type { GuidedStepConfig } from '../types'

export const reServiceGuideConfig: GuidedStepConfig = {
  title: 'How to Serve in a Real Estate Case',
  reassurance:
    'Real estate cases often involve multiple parties — sellers, agents, title companies, and HOAs. We will help you figure out who to serve and how.',

  questions: [
    // Who are you suing
    {
      id: 'defendant_type',
      type: 'single_choice',
      prompt: 'Who is the primary party you are suing?',
      options: [
        { value: 'individual_seller', label: 'Individual seller' },
        { value: 'individual_buyer', label: 'Individual buyer' },
        { value: 'real_estate_agent', label: 'Real estate agent or broker' },
        { value: 'title_company', label: 'Title company' },
        { value: 'builder', label: 'Builder or developer' },
        { value: 'hoa', label: 'HOA (Homeowners Association)' },
        { value: 'multiple', label: 'Multiple parties' },
      ],
    },

    // Individual service
    {
      id: 'individual_info',
      type: 'info',
      prompt:
        'SERVING AN INDIVIDUAL:\n- Personal service by a process server or constable at their home or workplace\n- If you cannot locate them, you can use substituted service (leave with someone over 16 at their usual residence) or service by posting (ask the court for permission)\n- Cost: $75-150 for a private process server, $75-100 for a constable',
      showIf: (answers) =>
        answers.defendant_type === 'individual_seller' || answers.defendant_type === 'individual_buyer',
    },

    // Agent/broker service
    {
      id: 'agent_info',
      type: 'info',
      prompt:
        'SERVING A REAL ESTATE AGENT OR BROKER:\n- Serve the individual agent personally at their home or office\n- If you are also suing their brokerage firm (LLC or corporation), serve the firm\'s registered agent through the Texas Secretary of State\n- Look up the brokerage\'s registered agent at sos.state.tx.us\n- You may also need to serve the Texas Real Estate Commission (TREC) if your claim involves a license violation',
      showIf: (answers) => answers.defendant_type === 'real_estate_agent',
    },

    // Title company service
    {
      id: 'title_company_info',
      type: 'info',
      prompt:
        'SERVING A TITLE COMPANY:\n- Title companies are typically LLCs or corporations\n- Serve their registered agent listed with the Texas Secretary of State (sos.state.tx.us)\n- If the registered agent cannot be found, you can serve the Texas Secretary of State as an agent for service under the Business Organizations Code\n- The citation must name the entity exactly as registered',
      showIf: (answers) => answers.defendant_type === 'title_company',
    },

    // Builder service
    {
      id: 'builder_info',
      type: 'info',
      prompt:
        'SERVING A BUILDER OR DEVELOPER:\n- Builders are usually LLCs or corporations — serve their registered agent at sos.state.tx.us\n- IMPORTANT: Under the Residential Construction Liability Act (RCLA, Chapter 27 of the Texas Property Code), you must give the builder 60 days written notice BEFORE filing suit\n- The RCLA notice must describe the defect and allow the builder to inspect and offer to repair\n- Failure to send the RCLA notice can result in your lawsuit being abated (paused)',
      showIf: (answers) => answers.defendant_type === 'builder',
    },

    // HOA service
    {
      id: 'hoa_info',
      type: 'info',
      prompt:
        'SERVING AN HOA:\n- Most HOAs are nonprofit corporations — serve their registered agent at sos.state.tx.us\n- If the HOA has no registered agent or it is outdated, serve:\n  1. The president of the HOA board\n  2. Any officer or director of the HOA\n  3. The HOA management company (if applicable)\n- Check the HOA\'s governing documents (CC&Rs) for any dispute resolution requirements — many require mediation or arbitration before filing suit',
      showIf: (answers) => answers.defendant_type === 'hoa',
    },

    // Multiple parties
    {
      id: 'multiple_parties_info',
      type: 'info',
      prompt:
        'SERVING MULTIPLE PARTIES:\nEach defendant must be served separately. Common multi-party scenarios in real estate:\n\n- Seller + listing agent + seller\'s brokerage\n- Builder + subcontractors\n- Seller + title company (for title defects)\n- HOA + management company\n\nYou need a separate citation for each defendant. Each must be served within 90 days of filing or you risk dismissal for want of prosecution.',
      showIf: (answers) => answers.defendant_type === 'multiple',
    },

    // Registered agent lookup
    {
      id: 'know_registered_agent',
      type: 'yes_no',
      prompt: 'Do you know the registered agent for any business entities you are suing?',
      showIf: (answers) =>
        answers.defendant_type === 'real_estate_agent' ||
        answers.defendant_type === 'title_company' ||
        answers.defendant_type === 'builder' ||
        answers.defendant_type === 'hoa' ||
        answers.defendant_type === 'multiple',
    },
    {
      id: 'registered_agent_lookup',
      type: 'info',
      prompt:
        'HOW TO FIND A REGISTERED AGENT:\n1. Go to sos.state.tx.us (Texas Secretary of State)\n2. Click "SOSDirect" or search for the business by name\n3. The filing will show the registered agent\'s name and address\n4. If the registered agent has resigned or cannot be located, you may serve the Texas Secretary of State directly (they will forward service to the entity\'s last known address)',
      showIf: (answers) => answers.know_registered_agent === 'no',
    },

    // Out-of-state parties
    {
      id: 'out_of_state',
      type: 'yes_no',
      prompt: 'Are any of the parties located outside of Texas?',
    },
    {
      id: 'out_of_state_info',
      type: 'info',
      prompt:
        'SERVING OUT-OF-STATE PARTIES:\n- Texas long-arm statute (CPRC Section 17.042) allows you to serve out-of-state defendants who have ties to Texas (e.g., owned property here, transacted business here)\n- Service methods for out-of-state parties:\n  1. Personal service in the other state by a process server authorized there\n  2. Service by the Texas Secretary of State (file with the court clerk, who forwards to SOS, who sends by certified mail)\n  3. Service by certified mail with return receipt requested (if the court authorizes it)\n- Out-of-state service costs more and takes longer — budget 2-4 extra weeks',
      showIf: (answers) => answers.out_of_state === 'yes',
    },

    // Service method
    {
      id: 'service_method',
      type: 'single_choice',
      prompt: 'How do you plan to serve the defendant(s)?',
      options: [
        { value: 'constable', label: 'County constable' },
        { value: 'private_server', label: 'Private process server' },
        { value: 'sos', label: 'Through the Secretary of State' },
        { value: 'unsure', label: 'Not sure yet' },
      ],
    },
    {
      id: 'constable_info',
      type: 'info',
      prompt:
        'CONSTABLE SERVICE:\n- Cost: $75-100\n- Give the citation and petition to the constable\'s office in the county where the defendant will be served\n- The constable will attempt service and file a return of service with the court\n- Usually takes 1-3 weeks\n- Reliable and affordable',
      showIf: (answers) => answers.service_method === 'constable',
    },
    {
      id: 'private_server_info',
      type: 'info',
      prompt:
        'PRIVATE PROCESS SERVER:\n- Cost: $75-150 (more for rush or difficult-to-serve defendants)\n- Must be certified by the Texas Supreme Court\n- Often faster than constables, especially for multiple defendants\n- Can serve across county lines without needing a different constable for each county',
      showIf: (answers) => answers.service_method === 'private_server',
    },
    {
      id: 'sos_info',
      type: 'info',
      prompt:
        'SECRETARY OF STATE SERVICE:\n- Used for out-of-state defendants or businesses with resigned registered agents\n- Cost: $40 (state fee) plus process server costs\n- Give the citation and petition to the court clerk, who forwards them to the Secretary of State\n- SOS sends the documents by certified mail to the defendant\n- Takes 3-6 weeks — the slowest option but sometimes the only one',
      showIf: (answers) => answers.service_method === 'sos',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    // Defendant type
    if (answers.defendant_type) {
      const labels: Record<string, string> = {
        individual_seller: 'Individual seller',
        individual_buyer: 'Individual buyer',
        real_estate_agent: 'Real estate agent or broker',
        title_company: 'Title company',
        builder: 'Builder or developer',
        hoa: 'Homeowners Association (HOA)',
        multiple: 'Multiple parties',
      }
      items.push({
        status: 'done',
        text: `Defendant type: ${labels[answers.defendant_type]}.`,
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Identify who you are suing.',
      })
    }

    // RCLA reminder for builders
    if (answers.defendant_type === 'builder') {
      items.push({
        status: 'info',
        text: 'RCLA REQUIRED: Send the builder 60 days written notice before filing suit (Texas Property Code Chapter 27). Failure to do so can abate your case.',
      })
    }

    // HOA dispute resolution reminder
    if (answers.defendant_type === 'hoa') {
      items.push({
        status: 'info',
        text: 'Check your HOA governing documents for mandatory mediation or arbitration clauses before filing suit.',
      })
    }

    // Registered agent
    if (answers.know_registered_agent === 'yes') {
      items.push({
        status: 'done',
        text: 'Registered agent identified for business entity defendants.',
      })
    } else if (answers.know_registered_agent === 'no') {
      items.push({
        status: 'needed',
        text: 'Look up the registered agent at sos.state.tx.us for each business entity defendant.',
      })
    }

    // Out of state
    if (answers.out_of_state === 'yes') {
      items.push({
        status: 'info',
        text: 'Out-of-state parties require special service procedures. Budget 2-4 extra weeks.',
      })
    }

    // Service method
    if (answers.service_method && answers.service_method !== 'unsure') {
      const methodLabels: Record<string, string> = {
        constable: 'County constable ($75-100)',
        private_server: 'Private process server ($75-150)',
        sos: 'Through the Secretary of State ($40 + costs)',
      }
      items.push({
        status: 'done',
        text: `Service method: ${methodLabels[answers.service_method]}.`,
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Choose a service method (constable, private process server, or Secretary of State).',
      })
    }

    // Multiple parties reminder
    if (answers.defendant_type === 'multiple') {
      items.push({
        status: 'needed',
        text: 'Obtain a separate citation for each defendant. Each must be served within 90 days of filing.',
      })
    }

    items.push({
      status: 'info',
      text: 'After service, verify the return of service has been filed with the court. The defendant has until 10:00 a.m. on the first Monday after 20 days from service to file an answer.',
    })

    return items
  },
}
