import type { GuidedStepConfig } from '../types'

export const scCounterclaimDefenseConfig: GuidedStepConfig = {
  title: 'Responding to a Counterclaim',
  reassurance:
    "If the other side filed a counterclaim against you, don't panic. You have the right to defend yourself — and you may still win your original claim.",

  questions: [
    // What is a counterclaim
    {
      id: 'what_is_counterclaim',
      type: 'info',
      prompt:
        'WHAT IS A COUNTERCLAIM?\nA counterclaim is the defendant suing YOU back in the same case. Instead of just defending against your claim, they are saying you owe them money too. The judge will hear both sides and decide both claims at the same hearing.',
    },

    // Dispute type
    {
      id: 'dispute_type',
      type: 'single_choice',
      prompt: 'What type of dispute is your case about?',
      options: [
        { value: 'security_deposit', label: 'Security deposit' },
        { value: 'contract', label: 'Contract or agreement' },
        { value: 'car_accident', label: 'Car accident' },
        { value: 'property_damage', label: 'Property damage' },
        { value: 'other', label: 'Something else' },
      ],
    },

    // Common counterclaims by type
    {
      id: 'security_deposit_counterclaim',
      type: 'info',
      prompt:
        'COMMON LANDLORD COUNTERCLAIM:\nIf you sued for your security deposit, the landlord may counterclaim for damages beyond the deposit — unpaid rent, cleaning costs, or repair costs.\n\nYOUR DEFENSE: Show the unit was returned in reasonable condition (move-in/move-out photos), that damage was normal wear and tear, and that the landlord\'s repair estimates are inflated.',
      showIf: (answers) => answers.dispute_type === 'security_deposit',
    },

    {
      id: 'contract_counterclaim',
      type: 'info',
      prompt:
        'COMMON CONTRACT COUNTERCLAIM:\nThe other party may claim YOU breached the contract first, or that your breach caused them damages.\n\nYOUR DEFENSE: Show you performed your obligations under the contract, that any issues were minor or caused by the other party, and that their claimed damages are exaggerated or unrelated.',
      showIf: (answers) => answers.dispute_type === 'contract',
    },

    {
      id: 'car_accident_counterclaim',
      type: 'info',
      prompt:
        'COMMON CAR ACCIDENT COUNTERCLAIM:\nThe other driver may claim YOU caused the accident and that their vehicle damage or injuries are your fault.\n\nYOUR DEFENSE: Present the police report, photos of the scene, witness statements, and any evidence showing the other driver was at fault (traffic violations, distracted driving, etc.).',
      showIf: (answers) => answers.dispute_type === 'car_accident',
    },

    {
      id: 'property_damage_counterclaim',
      type: 'info',
      prompt:
        'COMMON PROPERTY DAMAGE COUNTERCLAIM:\nThe other party may claim your property caused damage to theirs, or that you are responsible for the situation.\n\nYOUR DEFENSE: Document the condition of all property involved, gather repair estimates from independent sources, and show the other party\'s negligence or responsibility.',
      showIf: (answers) => answers.dispute_type === 'property_damage',
    },

    // How to respond
    {
      id: 'how_to_respond',
      type: 'info',
      prompt:
        'HOW TO RESPOND TO A COUNTERCLAIM:\n1. Deny the allegations — explain why their claims are wrong\n2. Present YOUR evidence — show why your original claim is stronger\n3. Challenge their evidence — point out missing proof, exaggerated amounts, or inconsistencies\n4. Stay focused — address each specific allegation, don\'t get sidetracked\n5. Let the judge know you are prepared to address both your claim AND the counterclaim',
    },

    // Have evidence for defense
    {
      id: 'have_defense_evidence',
      type: 'yes_no',
      prompt: 'Do you have evidence to defend against the counterclaim?',
    },

    {
      id: 'defense_evidence_info',
      type: 'info',
      prompt:
        'GATHER YOUR DEFENSE EVIDENCE:\n- Documents that disprove their claims (photos, texts, emails, receipts)\n- Evidence that shows your side of the story\n- Proof that their damages are exaggerated or fabricated\n- Witnesses who can support your version of events\n- Any written agreements that contradict their counterclaim',
      showIf: (answers) => answers.have_defense_evidence === 'no',
    },

    // Offset explained
    {
      id: 'offset_info',
      type: 'info',
      prompt:
        'OFFSET — HOW THE JUDGE DECIDES:\nIf BOTH sides have valid claims, the judge may subtract one from the other. For example:\n- You prove they owe you $3,000\n- They prove you owe them $1,000\n- The judge awards you the difference: $2,000\n\nThis is why it\'s important to prove your claim is larger than theirs.',
    },

    // Preparing for both sides
    {
      id: 'prepared_for_both',
      type: 'yes_no',
      prompt:
        'Have you prepared to present your original claim AND defend against the counterclaim?',
    },

    {
      id: 'dual_preparation_info',
      type: 'info',
      prompt:
        'PREPARING FOR BOTH SIDES OF THE CASE:\n\n1. Organize your evidence into two groups:\n   - YOUR CLAIM: evidence that proves they owe you\n   - YOUR DEFENSE: evidence that disproves what they claim you owe\n\n2. Practice your presentation:\n   - First: present your claim clearly and with evidence\n   - Second: respond to each point in their counterclaim\n\n3. Know your numbers:\n   - Your total damages\n   - Why their claimed damages are wrong or inflated\n   - The net amount the judge should award you',
      showIf: (answers) => answers.prepared_for_both === 'no',
    },

    // Counterclaim amount
    {
      id: 'counterclaim_amount',
      type: 'text',
      prompt: 'How much is the counterclaim against you?',
      helpText:
        'Enter the dollar amount the other side is claiming you owe them.',
      placeholder: 'e.g. $2,000',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    // Dispute type context
    const typeLabels: Record<string, string> = {
      security_deposit: 'security deposit',
      contract: 'contract',
      car_accident: 'car accident',
      property_damage: 'property damage',
      other: 'dispute',
    }
    if (answers.dispute_type) {
      items.push({
        status: 'info',
        text: `Dispute type: ${typeLabels[answers.dispute_type]}. Review the common counterclaim defenses for this type of case.`,
      })
    }

    // Counterclaim amount
    if (answers.counterclaim_amount) {
      items.push({
        status: 'info',
        text: `Counterclaim amount: ${answers.counterclaim_amount}. Prepare evidence to disprove or reduce this amount.`,
      })
    }

    // Defense evidence
    if (answers.have_defense_evidence === 'yes') {
      items.push({
        status: 'done',
        text: 'Evidence to defend against counterclaim is gathered.',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Gather evidence to disprove the counterclaim: photos, texts, emails, receipts, and witness statements.',
      })
    }

    // Dual preparation
    if (answers.prepared_for_both === 'yes') {
      items.push({
        status: 'done',
        text: 'Prepared to present your claim and defend against the counterclaim.',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Organize evidence into two groups: (1) proving your claim and (2) disproving the counterclaim.',
      })
    }

    items.push({
      status: 'info',
      text: 'If both claims are valid, the judge may offset them — awarding the difference to the party with the larger proven claim.',
    })

    return items
  },
}
