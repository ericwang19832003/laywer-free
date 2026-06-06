import type { GuidedStepConfig } from '../types'

export const ltPostEvictionRightsConfig: GuidedStepConfig = {
  title: 'Your Rights After Eviction',
  reassurance:
    'Even after an eviction order, you still have rights. The law sets clear timelines and protections for you during this process.',

  questions: [
    {
      id: 'post_eviction_overview',
      type: 'info',
      prompt:
        'If the court has ordered your eviction and you did not appeal in time (5 days), here is what happens next and what rights you still have.',
      acknowledgeLabel: "I understand the post-eviction process and what rights I still have",
    },
    {
      id: 'writ_timeline',
      type: 'info',
      prompt:
        'WRIT OF POSSESSION TIMELINE — Day 1–5: appeal window. Day 6+: landlord can request a Writ of Possession. Once issued, the constable gives you at least 24 HOURS written warning posted on your door. After 24 hours, the constable supervises the removal.',
      acknowledgeLabel: "I understand the writ of possession timeline and the 24-hour notice requirement",
    },
    {
      id: 'writ_received',
      type: 'yes_no',
      prompt: 'Have you received a 24-hour notice from the constable?',
    },
    {
      id: 'writ_received_info',
      type: 'info',
      prompt:
        'YOU HAVE 24 HOURS — Use this time to remove your belongings. The constable will supervise the lockout. Only a constable can execute the writ — the landlord CANNOT do a self-help eviction.',
      acknowledgeLabel: "I understand — I'll remove my belongings within the 24-hour window",
      showIf: (answers) => answers.writ_received === 'yes',
    },
    {
      id: 'belongings_info',
      type: 'info',
      prompt:
        'YOUR BELONGINGS — After the writ is executed, your belongings are typically placed outside (at the curb or parking lot). The landlord is NOT legally required to store them. Retrieve them as quickly as possible. Anything left behind may be treated as abandoned.',
      acknowledgeLabel: "I understand — I'll retrieve my belongings immediately after the writ is executed",
    },
    {
      id: 'landlord_lien_info',
      type: 'info',
      prompt:
        "LANDLORD'S LIEN (§ 54.021) — The landlord may claim a lien on certain personal property for unpaid rent. However, they must follow specific legal procedures and CANNOT simply take your belongings. Exempt property (clothing, tools of trade, personal items up to $50K/$100K) cannot be seized.",
      acknowledgeLabel: "I understand my exempt property cannot be seized and the landlord must follow legal procedures",
    },
    {
      id: 'need_emergency_help',
      type: 'yes_no',
      prompt: 'Do you need emergency housing assistance?',
    },
    {
      id: 'emergency_resources',
      type: 'info',
      prompt:
        'EMERGENCY RESOURCES — Call 211 (Texas helpline) for immediate housing assistance. Contact your local Emergency Rental Assistance program. Reach out to local shelters. Legal aid may help with last-minute appeals.',
      acknowledgeLabel: "I understand — I'll call 211 and contact emergency housing programs right away",
      showIf: (answers) => answers.need_emergency_help === 'yes',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.writ_received === 'yes') {
      items.push({
        status: 'needed',
        text: 'URGENT: 24-hour notice received. Remove your belongings immediately before the constable executes the writ.',
      })
    } else if (answers.writ_received === 'no') {
      items.push({
        status: 'info',
        text: 'No writ notice yet. The landlord can request one after the 5-day appeal window passes.',
      })
    }

    items.push({
      status: 'info',
      text: 'Only a constable can execute the writ. The landlord cannot do a self-help eviction.',
    })

    if (answers.need_emergency_help === 'yes') {
      items.push({
        status: 'needed',
        text: 'Call 211 for emergency housing assistance. Contact local shelters and Emergency Rental Assistance programs.',
      })
    }

    items.push({
      status: 'info',
      text: 'Exempt property (clothing, tools of trade, personal items up to $50K/$100K) cannot be seized under a landlord\'s lien.',
    })

    return items
  },
}
