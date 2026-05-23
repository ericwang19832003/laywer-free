import type { GuidedStepConfig } from '../types'

export const agOptionConfig: GuidedStepConfig = {
  title: 'Child Support: AG Office vs. Filing on Your Own',
  reassurance:
    "Many parents don't know there's a completely free option for child support. Let's walk through both paths so you can choose what's best for your family.",

  questions: [
    {
      id: 'paths_overview',
      type: 'info',
      prompt:
        'You have two main paths for establishing or enforcing child support in Texas:\n\n' +
        "1. THE AG ROUTE (FREE) — The Texas Attorney General's Child Support Division will open your case, locate the other parent, establish paternity if needed, and get a court order for support. They handle the paperwork, court appearances, and enforcement — all at no cost to you.\n\n" +
        '2. FILE PRIVATELY — You file a Suit Affecting the Parent-Child Relationship (SAPCR) in district court yourself. You control the timeline, the terms you request, and the process. There are filing fees, but you get more flexibility and direct involvement.',
    },
    {
      id: 'filing_path',
      type: 'single_choice',
      prompt: 'Which path are you leaning toward?',
      helpText:
        "There's no wrong answer — we'll give you details on whichever option you're considering.",
      options: [
        {
          value: 'ag',
          label: 'AG Child Support Division (free, they handle everything)',
        },
        {
          value: 'private',
          label: 'File privately (I file, I control the timeline)',
        },
        { value: 'not_sure', label: "I'm not sure yet — tell me more about both" },
      ],
    },
    {
      id: 'ag_details',
      type: 'info',
      prompt:
        'AG CHILD SUPPORT DIVISION — WHAT TO KNOW:\n\n' +
        '• Apply online at texasattorneygeneral.gov/child-support or call 1-800-255-8014\n' +
        "• The AG represents the State of Texas, not you personally — they won't advocate for your specific preferences\n" +
        '• Cases can move slower because the AG handles a high volume\n' +
        "• You'll have less control over the specific terms (visitation schedule, support amount beyond guidelines)\n" +
        '• The AG can locate the other parent, establish paternity through genetic testing, and enforce orders through wage withholding, license suspension, or contempt\n\n' +
        'Best for: Parents who want a no-cost option and are okay with standard guideline support.',
      showIf: (answers) =>
        answers.filing_path === 'ag' || answers.filing_path === 'not_sure',
    },
    {
      id: 'private_details',
      type: 'info',
      prompt:
        'FILING PRIVATELY — WHAT TO KNOW:\n\n' +
        "• File a SAPCR (Suit Affecting the Parent-Child Relationship) in your county's district court\n" +
        '• Filing fees are typically $250–$350 depending on your county\n' +
        '• Fee waiver available — file a "Statement of Inability to Afford Payment of Court Costs" if you qualify\n' +
        "• You're responsible for serving the other parent (process server, constable, or waiver of service)\n" +
        '• You have more flexibility to negotiate custody, visitation, and support terms beyond the standard guidelines\n' +
        '• Cases often move faster because you control the timeline\n\n' +
        'Best for: Parents who want more control over terms and timeline and can handle the filing process.',
      showIf: (answers) =>
        answers.filing_path === 'private' || answers.filing_path === 'not_sure',
    },
    {
      id: 'government_benefits',
      type: 'yes_no',
      prompt:
        'Does your child currently receive Medicaid, SNAP, TANF, or WIC benefits?',
      helpText:
        "This matters because the AG's office may already be involved in your case if your child receives government benefits.",
    },
    {
      id: 'benefits_warning',
      type: 'info',
      prompt:
        'IMPORTANT — AG MAY ALREADY BE INVOLVED:\n\n' +
        "When a child receives Medicaid, SNAP, TANF, or WIC, the state has a legal interest in recovering support costs. The AG's Child Support Division may have already opened a case or may open one automatically.\n\n" +
        "Even if you choose to file privately, you MUST notify the county AG office via certified mail that you are pursuing child support independently. This avoids conflicting court orders and ensures your case doesn't get tangled with a separate AG action.\n\n" +
        "Contact your county's AG Child Support office to check whether a case already exists before filing.",
      showIf: (answers) => answers.government_benefits === 'yes',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.filing_path === 'ag') {
      items.push({
        status: 'done',
        text: 'Path chosen: AG Child Support Division (free). Apply at texasattorneygeneral.gov/child-support or call 1-800-255-8014.',
      })
    } else if (answers.filing_path === 'private') {
      items.push({
        status: 'done',
        text: 'Path chosen: File privately via SAPCR in district court. Filing fees $250–$350 (fee waiver available).',
      })
    } else if (answers.filing_path === 'not_sure') {
      items.push({
        status: 'needed',
        text: 'Still deciding between AG (free, less control) and private filing (fees apply, more flexibility). Review both options above.',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Choose a child support path: AG Division (free) or file privately.',
      })
    }

    if (answers.government_benefits === 'yes') {
      items.push({
        status: 'needed',
        text: 'Child receives government benefits — notify the county AG office via certified mail before filing privately. Check if an AG case already exists.',
      })
    } else if (answers.government_benefits === 'no') {
      items.push({
        status: 'done',
        text: 'No government benefits — no AG notification required.',
      })
    }

    if (
      answers.filing_path === 'private' &&
      answers.government_benefits !== 'yes'
    ) {
      items.push({
        status: 'info',
        text: "Next steps: Prepare your SAPCR petition, gather financial information for child support calculations, and file in your county's district court.",
      })
    }

    if (answers.filing_path === 'ag') {
      items.push({
        status: 'info',
        text: 'After applying, the AG will contact you about next steps. Processing can take several weeks.',
      })
    }

    return items
  },
}
