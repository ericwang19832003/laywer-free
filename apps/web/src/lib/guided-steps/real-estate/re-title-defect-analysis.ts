import type { GuidedStepConfig } from '../types'

export const reTitleDefectAnalysisConfig: GuidedStepConfig = {
  title: 'Understanding Your Title Defect',
  reassurance:
    'Title defects are more common than you think, and most can be resolved. We will help you understand what you are dealing with and your options.',

  questions: [
    // Type of defect
    {
      id: 'defect_type',
      type: 'single_choice',
      prompt: 'What type of title defect are you dealing with?',
      helpText:
        'If you are unsure, your title company or a title examiner can help identify the issue.',
      options: [
        { value: 'lien', label: 'Lien on the property (tax lien, mechanic\'s lien, judgment lien)' },
        { value: 'encumbrance', label: 'Encumbrance (easement, restriction, or covenant)' },
        { value: 'cloud', label: 'Cloud on title (unresolved claim or defective document)' },
        { value: 'chain_break', label: 'Break in the chain of title (missing deed or gap in ownership)' },
        { value: 'forgery', label: 'Forgery or fraud in a prior deed' },
        { value: 'boundary', label: 'Survey or boundary discrepancy' },
        { value: 'unsure', label: 'Not sure' },
      ],
    },

    // Lien info
    {
      id: 'lien_info',
      type: 'info',
      prompt:
        'LIENS ON PROPERTY:\n- Tax liens: Filed by the government for unpaid property taxes. These survive a sale and must be paid off.\n- Mechanic\'s liens: Filed by contractors or suppliers for unpaid work. Must be filed within specific deadlines to be valid.\n- Judgment liens: Created when a court judgment is recorded against a property owner. Abstract of judgment filed in the county records.\n\nCure options: Pay the lien, negotiate a release, challenge the validity of the lien (e.g., expired mechanic\'s lien), or file a quiet title action.',
      showIf: (answers) => answers.defect_type === 'lien',
    },

    // Encumbrance info
    {
      id: 'encumbrance_info',
      type: 'info',
      prompt:
        'ENCUMBRANCES:\n- Easements: Someone else has the right to use part of your property (utility easement, access easement, drainage easement)\n- Restrictive covenants: Rules about what you can build or how you can use the property (often from the subdivision developer)\n- Deed restrictions: Specific limitations written into the deed\n\nEncumbrances are NOT always defects — many are normal. They become a problem when they were not disclosed before purchase or when they prevent your intended use of the property.',
      showIf: (answers) => answers.defect_type === 'encumbrance',
    },

    // Cloud on title
    {
      id: 'cloud_info',
      type: 'info',
      prompt:
        'CLOUD ON TITLE:\nA "cloud" is any unresolved claim, document error, or ambiguity that casts doubt on who owns the property. Common examples:\n- A prior owner\'s heir claims they never signed off\n- A deed was recorded with the wrong legal description\n- An old mortgage was paid off but never released of record\n- A prior divorce decree did not properly convey the property\n\nCure: File a quiet title action asking the court to declare you the rightful owner and remove the cloud.',
      showIf: (answers) => answers.defect_type === 'cloud',
    },

    // Break in chain
    {
      id: 'chain_break_info',
      type: 'info',
      prompt:
        'BREAK IN CHAIN OF TITLE:\nA "chain of title" is the sequence of deeds from the original land grant to you. A break means there is a gap — for example:\n- A deed was never recorded\n- A prior owner died without a will and the estate was never probated\n- A deed conveyed property from someone who was not the record owner\n\nCure: You may need a corrective deed, an affidavit of heirship, a probate proceeding, or a quiet title action to fill the gap.',
      showIf: (answers) => answers.defect_type === 'chain_break',
    },

    // Forgery
    {
      id: 'forgery_info',
      type: 'info',
      prompt:
        'FORGERY OR FRAUD IN A PRIOR DEED:\nThis is the most serious title defect. A forged deed is void — it transfers nothing, even to an innocent buyer. This means:\n- The true owner can reclaim the property\n- Your title insurance is your primary protection\n- File a title insurance claim immediately\n- You may also have a fraud claim against the forger and negligence claims against the title company or notary\n\nImportant: Do NOT wait — file your title insurance claim and consult an attorney. Time limits apply.',
      showIf: (answers) => answers.defect_type === 'forgery',
    },

    // Title insurance
    {
      id: 'has_title_insurance',
      type: 'yes_no',
      prompt: 'Do you have a title insurance policy?',
      helpText:
        'Title insurance is typically purchased at closing. Check your closing documents for an "Owner\'s Policy of Title Insurance."',
    },
    {
      id: 'title_insurance_yes_info',
      type: 'info',
      prompt:
        'REVIEWING YOUR TITLE INSURANCE POLICY:\nYour policy has critical sections to review:\n\n1. COVERED RISKS (Section 1): Lists what the insurer will defend and pay for\n2. EXCLUSIONS (Section 2): Lists what is NOT covered (usually: government regulations, eminent domain, defects you created or agreed to)\n3. SCHEDULE A: Shows the insured amount, effective date, and property description\n4. SCHEDULE B: Lists SPECIFIC EXCEPTIONS — these are known issues the insurer will NOT cover\n\nKey question: Is your title defect listed as a Schedule B exception? If yes, it is likely excluded from coverage. If no, the insurer should cover it.',
      showIf: (answers) => answers.has_title_insurance === 'yes',
    },
    {
      id: 'title_insurance_no_info',
      type: 'info',
      prompt:
        'WITHOUT TITLE INSURANCE:\nYou have fewer options but are not without recourse:\n- You can still file a quiet title action to resolve the defect\n- If a seller conveyed property with a general warranty deed, the seller is personally liable for title defects (warranty of title)\n- If you purchased with a special warranty deed, the seller only warrants against defects that arose during their ownership\n- A quitclaim deed offers no title warranties at all\n\nFor future transactions, always purchase owner\'s title insurance.',
      showIf: (answers) => answers.has_title_insurance === 'no',
    },

    // Title commitment
    {
      id: 'has_title_commitment',
      type: 'yes_no',
      prompt: 'Do you have a title commitment (issued before closing)?',
      helpText:
        'The title commitment was issued by the title company before closing. It shows what the title company found during their title search.',
    },
    {
      id: 'title_commitment_info',
      type: 'info',
      prompt:
        'ANALYZING YOUR TITLE COMMITMENT:\nThe title commitment has three schedules:\n\n- Schedule A: Property description, proposed insured, and policy amount\n- Schedule B-1: Requirements that must be met before the policy is issued (e.g., pay off existing liens, obtain releases)\n- Schedule B-2: Exceptions that will appear in the final policy (items the insurer will NOT cover)\n\nIf Schedule B-1 requirements were not met before closing but the title company issued the policy anyway, the title company may be liable for negligence.',
      showIf: (answers) => answers.has_title_commitment === 'yes',
    },

    // Cure procedures
    {
      id: 'cure_info',
      type: 'info',
      prompt:
        'COMMON CURE PROCEDURES:\n\n1. Corrective deed: Fixes errors in a prior deed (wrong name, wrong legal description). The grantor signs a new deed.\n2. Release of lien: The lienholder signs a document releasing the lien (after payment or negotiation).\n3. Affidavit of heirship: Establishes who inherited property when an owner died without probate.\n4. Quiet title action: A lawsuit asking the court to declare you the true owner and remove all adverse claims.\n5. Curative affidavit: A sworn statement from someone with knowledge that corrects a title issue.\n\nCost: Corrective deeds and releases are cheap ($50-200 for preparation and recording). Quiet title actions cost $2,000-5,000+ depending on complexity.',
    },

    // File claim vs lawsuit
    {
      id: 'title_insurance_claim_process',
      type: 'info',
      prompt:
        'TITLE INSURANCE CLAIM PROCESS:\n\nUnder Texas Insurance Code Section 2702.103, your title insurer has a duty to defend you against covered title claims. Here is the process:\n\n1. NOTIFY YOUR INSURER: Send written notice of the defect to the title insurance company (not just the title agent). Include your policy number and a description of the defect.\n2. INSURER INVESTIGATES: The insurer will review your claim, examine the title, and determine coverage.\n3. INSURER MUST RESPOND: If covered, the insurer must either cure the defect, defend you in any lawsuit, or pay your claim up to the policy amount.\n4. IF DENIED: If the insurer denies your claim, you can file a complaint with the Texas Department of Insurance or sue the insurer for breach of contract and bad faith.\n\nWhen to file a claim first: Always file the title insurance claim before suing. The insurer may resolve the issue without litigation.\nWhen to file a lawsuit: If the insurer denies coverage, if the defect is not covered by your policy, or if you need to bring a quiet title action against a third party.',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    // Defect type
    if (answers.defect_type && answers.defect_type !== 'unsure') {
      const labels: Record<string, string> = {
        lien: 'Lien on the property',
        encumbrance: 'Encumbrance (easement, restriction, or covenant)',
        cloud: 'Cloud on title',
        chain_break: 'Break in the chain of title',
        forgery: 'Forgery or fraud in a prior deed',
        boundary: 'Survey or boundary discrepancy',
      }
      items.push({
        status: 'done',
        text: `Title defect identified: ${labels[answers.defect_type]}.`,
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Identify the type of title defect — consult a title examiner or review your title commitment.',
      })
    }

    // Forgery urgency
    if (answers.defect_type === 'forgery') {
      items.push({
        status: 'needed',
        text: 'URGENT: File a title insurance claim immediately and consult an attorney. Forged deeds are void and require swift action.',
      })
    }

    // Title insurance
    if (answers.has_title_insurance === 'yes') {
      items.push({
        status: 'done',
        text: 'Title insurance policy in hand.',
      })
      items.push({
        status: 'needed',
        text: 'Review your policy: check Schedule B exceptions to determine if your defect is covered.',
      })
      items.push({
        status: 'needed',
        text: 'File a written claim with your title insurer (not just the agent). Include your policy number and description of the defect.',
      })
    } else if (answers.has_title_insurance === 'no') {
      items.push({
        status: 'info',
        text: 'No title insurance. Your remedies depend on the type of deed you received (general warranty, special warranty, or quitclaim).',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Check your closing documents for an Owner\'s Policy of Title Insurance.',
      })
    }

    // Title commitment
    if (answers.has_title_commitment === 'yes') {
      items.push({
        status: 'done',
        text: 'Title commitment collected.',
      })
      items.push({
        status: 'needed',
        text: 'Review Schedule B-1 (requirements) and Schedule B-2 (exceptions) to determine if the title company missed something.',
      })
    } else if (answers.has_title_commitment === 'no') {
      items.push({
        status: 'needed',
        text: 'Request a copy of the title commitment from your title company or closing attorney.',
      })
    }

    items.push({
      status: 'info',
      text: 'Always file a title insurance claim before filing a lawsuit. The insurer must defend you under Texas Insurance Code Section 2702.103 if the defect is covered.',
    })

    return items
  },
}
