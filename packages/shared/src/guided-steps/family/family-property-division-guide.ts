import type { GuidedStepConfig } from '../types'

export const familyPropertyDivisionGuideConfig: GuidedStepConfig = {
  title: 'Dividing Property and Debts',
  reassurance:
    'Property division can feel overwhelming, but understanding the rules gives you leverage. Texas law is on your side if you document everything.',

  questions: [
    {
      id: 'community_property_overview',
      type: 'info',
      prompt:
        "Texas is a COMMUNITY PROPERTY state. This means:\n- Property acquired DURING the marriage belongs to BOTH spouses equally\n- Property owned BEFORE marriage, inherited, or gifted is SEPARATE property\n- The court divides community property in a 'just and right' manner (not always 50/50)",
    },
    {
      id: 'own_home',
      type: 'yes_no',
      prompt: 'Do you own a home?',
    },
    {
      id: 'home_info',
      type: 'info',
      prompt:
        'HOME OPTIONS:\n- One spouse buys out the other (requires refinancing the mortgage into one name)\n- Sell the home and split the proceeds\n- One spouse keeps the home and the other gets equivalent value in other assets\n\nGet a formal appraisal to establish fair market value. If the home was purchased before marriage, the equity gained during marriage may still be community property.',
      showIf: (a) => a.own_home === 'yes',
    },
    {
      id: 'retirement_accounts',
      type: 'yes_no',
      prompt: 'Do you have retirement accounts?',
    },
    {
      id: 'retirement_info',
      type: 'info',
      prompt:
        "RETIREMENT ACCOUNTS:\nContributions made during the marriage are community property. To split a retirement account, you need a QDRO (Qualified Domestic Relations Order) — a court order that directs the plan administrator to divide the account.\n\nIMPORTANT: A QDRO must be drafted precisely. Many courts have sample QDRO forms. The plan administrator must approve it before the court signs it. Do NOT withdraw funds without a QDRO — you'll face taxes and penalties.",
      showIf: (a) => a.retirement_accounts === 'yes',
    },
    {
      id: 'business_owned',
      type: 'yes_no',
      prompt: 'Do either of you own a business?',
    },
    {
      id: 'business_info',
      type: 'info',
      prompt:
        "BUSINESS INTERESTS:\n- If the business was started during the marriage, it's likely community property\n- If started before marriage, the increase in value during marriage may be community property\n- A business valuation may be needed (can cost $2,000-$10,000+)\n- The court can award the business to one spouse and offset with other assets\n\nGather: tax returns, profit/loss statements, balance sheets, and business bank statements.",
      showIf: (a) => a.business_owned === 'yes',
    },
    {
      id: 'debts_info',
      type: 'info',
      prompt:
        "DEBTS ARE ALSO DIVIDED:\n- Credit card debt during marriage: community debt\n- Student loans: depends on when incurred and benefit to community\n- Mortgage: usually allocated with the house\n- Tax liability: divided equitably\n\nIMPORTANT: The court divides debts between you and your spouse, but creditors are NOT bound by the decree. If your name is on a joint debt, the creditor can still come after you even if the court assigned it to your spouse.",
    },
    {
      id: 'worksheet_info',
      type: 'info',
      prompt:
        'PROPERTY WORKSHEET:\nList all assets and debts, mark each as Community (C) or Separate (S), and estimate value. Bring this to mediation and trial.',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.own_home === 'yes') {
      items.push({ status: 'needed', text: 'Get a formal home appraisal and decide: buyout, sell, or offset.' })
    }

    if (answers.retirement_accounts === 'yes') {
      items.push({ status: 'needed', text: 'Obtain retirement account statements and prepare a QDRO.' })
    }

    if (answers.business_owned === 'yes') {
      items.push({ status: 'needed', text: 'Gather business financial records. Consider a professional business valuation.' })
    }

    items.push({ status: 'needed', text: 'Create a property worksheet listing all assets and debts as Community (C) or Separate (S).' })
    items.push({ status: 'info', text: "Creditors are NOT bound by the divorce decree — protect yourself on joint debts." })

    return items
  },
}
