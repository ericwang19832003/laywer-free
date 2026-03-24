import type { GuidedStepConfig } from '../types'

export const bizServiceGuideConfig: GuidedStepConfig = {
  title: 'How to Serve a Business Entity',
  reassurance:
    "Serving a business is different from serving a person — but we'll show you exactly how.",

  questions: [
    {
      id: 'entity_type',
      type: 'single_choice',
      prompt: 'What type of business entity are you suing?',
      options: [
        { value: 'llc', label: 'LLC (Limited Liability Company)' },
        { value: 'corporation', label: 'Corporation (Inc., Corp.)' },
        { value: 'partnership', label: 'Partnership (general or limited)' },
        { value: 'sole_proprietor', label: 'Sole proprietorship / DBA' },
      ],
    },
    {
      id: 'llc_info',
      type: 'info',
      prompt:
        'SERVING AN LLC:\n- Serve the registered agent listed with the Texas Secretary of State\n- If no registered agent: serve any manager or member of the LLC\n- The citation must name the LLC itself, not just the owner\n- Example: "ABC Holdings, LLC" — not "John Smith d/b/a ABC Holdings"',
      showIf: (answers) => answers.entity_type === 'llc',
    },
    {
      id: 'corporation_info',
      type: 'info',
      prompt:
        'SERVING A CORPORATION:\n- Serve the registered agent listed with the Texas Secretary of State\n- Alternative: serve the president, vice president, or any officer\n- For foreign corporations registered in Texas: serve their Texas registered agent\n- The citation must name the corporation exactly as registered',
      showIf: (answers) => answers.entity_type === 'corporation',
    },
    {
      id: 'partnership_info',
      type: 'info',
      prompt:
        'SERVING A PARTNERSHIP:\n- Serve any general partner\n- For limited partnerships: serve the registered agent or any general partner\n- You can also sue and serve individual partners for partnership debts\n- General partners have personal liability for partnership obligations',
      showIf: (answers) => answers.entity_type === 'partnership',
    },
    {
      id: 'sole_proprietor_info',
      type: 'info',
      prompt:
        'SERVING A SOLE PROPRIETOR:\n- Serve the individual owner directly — a sole proprietorship is not a separate legal entity\n- Name the defendant as: "John Smith d/b/a [Business Name]"\n- Serve them at their home or business address\n- Same personal service rules as any individual',
      showIf: (answers) => answers.entity_type === 'sole_proprietor',
    },
    {
      id: 'know_registered_agent',
      type: 'yes_no',
      prompt: 'Do you know the registered agent for this business?',
      showIf: (answers) =>
        answers.entity_type === 'llc' ||
        answers.entity_type === 'corporation' ||
        answers.entity_type === 'partnership',
    },
    {
      id: 'agent_lookup_info',
      type: 'info',
      prompt:
        'HOW TO FIND THE REGISTERED AGENT:\n1. Go to sos.state.tx.us\n2. Click "SOSDirect" or use the free search at sos.state.tx.us/corp/sosda/index.shtml\n3. Search by entity name\n4. The filing will show the registered agent name and address\n5. Print this page — you may need it as proof of the agent\'s address\n\nNote: The registered agent information must be current. Businesses are required to keep this updated.',
      showIf: (answers) => answers.know_registered_agent === 'no',
    },
    {
      id: 'is_out_of_state',
      type: 'yes_no',
      prompt: 'Is this business located outside of Texas?',
    },
    {
      id: 'out_of_state_registered',
      type: 'yes_no',
      prompt: 'Is the out-of-state business registered to do business in Texas?',
      showIf: (answers) => answers.is_out_of_state === 'yes',
    },
    {
      id: 'long_arm_info',
      type: 'info',
      prompt:
        'SERVICE ON OUT-OF-STATE COMPANIES — SECRETARY OF STATE LONG-ARM (\u00a717.044):\n\nIf the out-of-state business is NOT registered in Texas but has done business here, you can serve them through the Texas Secretary of State:\n\n1. The Secretary of State acts as the company\'s agent for service\n2. Deliver two copies of the citation and petition to the Secretary of State\n3. The Secretary of State forwards the documents to the business by certified mail\n4. You must also send a copy to the business by certified mail, return receipt requested\n5. The business has until the Monday after 20 days following the date the Secretary of State forwards the documents\n\nCost: Filing fee with the Secretary of State (currently around $40)\nRequirement: You must show the business "does business" in Texas (e.g., has customers here, performed services here, or committed a tort here)',
      showIf: (answers) =>
        answers.is_out_of_state === 'yes' && answers.out_of_state_registered === 'no',
    },
    {
      id: 'registered_out_of_state_info',
      type: 'info',
      prompt:
        'This business is registered in Texas even though it\'s based elsewhere. Serve their Texas registered agent just like a Texas business. Look them up at sos.state.tx.us.',
      showIf: (answers) =>
        answers.is_out_of_state === 'yes' && answers.out_of_state_registered === 'yes',
    },
    {
      id: 'agent_not_found',
      type: 'yes_no',
      prompt: 'Were you unable to locate or serve the registered agent?',
      showIf: (answers) =>
        answers.entity_type !== 'sole_proprietor' && answers.know_registered_agent === 'yes',
    },
    {
      id: 'agent_not_found_info',
      type: 'info',
      prompt:
        'IF THE REGISTERED AGENT CAN\'T BE FOUND:\n\n1. SERVE AN OFFICER OR MANAGER: You can serve any officer, director, manager, or general partner directly\n2. SUBSTITUTE SERVICE: Ask the court for an order allowing substitute service (Rule 106(b)) — service by posting at the business address, or by publication\n3. SECRETARY OF STATE AS AGENT: If the entity has failed to maintain a registered agent, the Secretary of State becomes their agent by default (Bus. Orgs. Code \u00a75.251)\n4. SERVICE BY PUBLICATION: As a last resort, publish citation in a newspaper — but this requires a court order and showing due diligence in attempting other methods',
      showIf: (answers) => answers.agent_not_found === 'yes',
    },
    {
      id: 'serve_individual',
      type: 'yes_no',
      prompt: 'Do you also need to serve an individual within the company (officer, director, or manager) personally?',
    },
    {
      id: 'serve_individual_info',
      type: 'info',
      prompt:
        'SERVING INDIVIDUALS WITHIN A COMPANY:\n- If you\'re suing both the company AND an individual (e.g., officer who committed fraud), you must serve each separately\n- Serve the individual personally at their home or usual place of business\n- The company and the individual are separate defendants — each needs their own citation\n- Common scenario: suing the LLC and its managing member for piercing the corporate veil',
      showIf: (answers) => answers.serve_individual === 'yes',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.entity_type) {
      const types: Record<string, string> = {
        llc: 'LLC',
        corporation: 'Corporation',
        partnership: 'Partnership',
        sole_proprietor: 'Sole proprietorship',
      }
      items.push({
        status: 'done',
        text: `Entity type: ${types[answers.entity_type]}.`,
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Identify the type of business entity you are suing.',
      })
    }

    if (answers.entity_type === 'sole_proprietor') {
      items.push({
        status: 'info',
        text: 'Serve the individual owner directly. Name them as "[Owner] d/b/a [Business Name]".',
      })
    } else if (answers.know_registered_agent === 'yes') {
      if (answers.agent_not_found === 'yes') {
        items.push({
          status: 'needed',
          text: 'Registered agent could not be served. Try serving an officer or request substitute service.',
        })
      } else {
        items.push({
          status: 'done',
          text: 'Registered agent identified.',
        })
      }
    } else if (answers.know_registered_agent === 'no') {
      items.push({
        status: 'needed',
        text: 'Look up the registered agent at sos.state.tx.us.',
      })
    }

    if (answers.is_out_of_state === 'yes') {
      if (answers.out_of_state_registered === 'no') {
        items.push({
          status: 'info',
          text: 'Out-of-state company not registered in Texas. Use Secretary of State long-arm service (\u00a717.044).',
        })
      } else {
        items.push({
          status: 'info',
          text: 'Out-of-state company registered in Texas. Serve their Texas registered agent.',
        })
      }
    }

    if (answers.serve_individual === 'yes') {
      items.push({
        status: 'needed',
        text: 'Serve the individual defendant separately with their own citation.',
      })
    }

    return items
  },
}
