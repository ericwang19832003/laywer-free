import type { GuidedStepConfig } from '../types'

export const familyDiscoveryGuideConfig: GuidedStepConfig = {
  title: 'Discovery — Getting the Information You Need',
  reassurance:
    'Discovery is a powerful tool that lets you compel the other party to share information. You have the same rights as any attorney to use these tools.',

  questions: [
    {
      id: 'discovery_overview',
      type: 'info',
      prompt:
        'Discovery is the process of getting information from the other party. In Texas family cases, you can:\n1. Send Interrogatories (written questions they must answer under oath)\n2. Request Production of Documents (financial records, texts, emails)\n3. Request Admissions (force them to admit or deny facts)\n4. Subpoena records from third parties (banks, employers)',
    },
    {
      id: 'info_needed',
      type: 'single_choice',
      prompt: 'What information do you need?',
      options: [
        { value: 'financial_records', label: 'Financial records' },
        { value: 'custody_evidence', label: 'Custody-related evidence' },
        { value: 'communication_records', label: 'Communication records (texts, emails)' },
        { value: 'all', label: 'All of the above' },
      ],
    },
    {
      id: 'financial_guidance',
      type: 'info',
      prompt:
        'FINANCIAL DISCOVERY:\nUse Interrogatories to ask about income, assets, and debts. Example questions:\n- "State your gross monthly income from all sources."\n- "Identify all bank accounts in which you have an interest."\n- "List all real property you own or have an interest in."\n\nUse Request for Production to get the actual documents backing up their answers.',
      showIf: (a) => a.info_needed === 'financial_records' || a.info_needed === 'all',
    },
    {
      id: 'custody_guidance',
      type: 'info',
      prompt:
        'CUSTODY DISCOVERY:\nUse Interrogatories to learn about their parenting plan. Example questions:\n- "Describe your typical daily schedule with the children."\n- "Identify all persons who provide childcare for the children."\n- "State whether you have ever been investigated by CPS."\n\nUse Request for Production to get school records, medical records, and any evidence of their parenting involvement.',
      showIf: (a) => a.info_needed === 'custody_evidence' || a.info_needed === 'all',
    },
    {
      id: 'communication_guidance',
      type: 'info',
      prompt:
        'COMMUNICATION DISCOVERY:\nUse Request for Production to demand:\n- Text messages between specific dates\n- Email correspondence related to the children or finances\n- Social media posts and messages\n\nUse Request for Admissions to force them to admit or deny specific statements they made.',
      showIf: (a) => a.info_needed === 'communication_records' || a.info_needed === 'all',
    },
    {
      id: 'financial_docs_info',
      type: 'info',
      prompt:
        'FINANCIAL DISCOVERY (most common in divorce):\n- Last 3 years of tax returns\n- Bank statements (all accounts)\n- Pay stubs (last 6 months)\n- Retirement account statements\n- Real estate appraisals\n- Business records (if self-employed)\n- Credit card statements\n- Loan documents',
    },
    {
      id: 'timing_info',
      type: 'info',
      prompt:
        'TIMING: Discovery must be completed before trial. Most courts set a discovery deadline (usually 30-60 days before trial). File discovery requests EARLY.',
    },
    {
      id: 'noncompliance_info',
      type: 'info',
      prompt:
        "IF THEY DON'T RESPOND: File a 'Motion to Compel Discovery' with the court. The judge can order them to respond and may sanction them (fines or adverse inference) for non-compliance.",
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    const need = answers.info_needed
    if (need === 'financial_records' || need === 'all') {
      items.push({ status: 'needed', text: 'Prepare Interrogatories and Request for Production targeting financial records.' })
    }
    if (need === 'custody_evidence' || need === 'all') {
      items.push({ status: 'needed', text: 'Prepare discovery requests for custody-related evidence.' })
    }
    if (need === 'communication_records' || need === 'all') {
      items.push({ status: 'needed', text: 'Prepare Request for Production for communication records.' })
    }

    items.push({ status: 'info', text: 'File discovery requests early — most courts set a deadline 30-60 days before trial.' })
    items.push({ status: 'info', text: "If they don't respond, file a Motion to Compel Discovery." })

    return items
  },
}
