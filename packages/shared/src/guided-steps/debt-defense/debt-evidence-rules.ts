import type { GuidedStepConfig } from '../types'

export const debtEvidenceRulesConfig: GuidedStepConfig = {
  title: 'Evidence Rules You Need to Know',
  reassurance:
    "Judges don't expect you to be a lawyer. But knowing 5 basic rules will make your evidence count.",

  questions: [
    {
      id: 'rule_hearsay',
      type: 'info',
      prompt:
        "RULE 1: HEARSAY \u2014 You can't use a document to prove what it says unless the author testifies or it falls under an exception. Example: A bill from the collector is hearsay \u2014 the collector must bring a witness who can authenticate it. But YOUR bank statements are YOUR records (business records exception).",
    },
    {
      id: 'rule_authentication',
      type: 'info',
      prompt:
        'RULE 2: AUTHENTICATION \u2014 Before a document can be evidence, someone must confirm it\'s real. For your documents: "Your Honor, this is my bank statement from [date]. I downloaded it from my bank\'s website." For collector documents: Ask "Can you prove this document is authentic? Who created it?"',
    },
    {
      id: 'rule_best_evidence',
      type: 'info',
      prompt:
        "RULE 3: BEST EVIDENCE \u2014 Use originals, not copies, when possible. If you only have copies, explain why: \"The original is in the collector's possession.\" Judges usually accept copies in small debt cases.",
    },
    {
      id: 'rule_relevance',
      type: 'info',
      prompt:
        "RULE 4: RELEVANCE \u2014 Every piece of evidence must relate to a fact in the case. Don't bring your entire filing cabinet. Bring ONLY documents that prove your specific defenses.",
    },
    {
      id: 'rule_objections',
      type: 'info',
      prompt:
        "RULE 5: OBJECTIONS YOU CAN MAKE:\n- \"Objection, hearsay\" \u2014 when collector uses a document without testimony\n- \"Objection, lack of foundation\" \u2014 when collector hasn't proven a document is real\n- \"Objection, relevance\" \u2014 when evidence doesn't relate to the case\n\nDon't be afraid to object. If the judge overrules you, that's OK \u2014 it shows you're paying attention.",
    },
    {
      id: 'jp_court_tip',
      type: 'info',
      prompt:
        'PRO TIP FOR JP COURT: Judges in JP court are often more relaxed about evidence rules. But in County and District court, rules are strictly enforced. Know which court you\'re in.',
    },
  ],

  generateSummary() {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    items.push({
      status: 'done',
      text: 'You reviewed the 5 key evidence rules: hearsay, authentication, best evidence, relevance, and objections.',
    })

    items.push({
      status: 'info',
      text: 'Remember: authenticate your own documents by stating what they are and where they came from.',
    })

    items.push({
      status: 'info',
      text: 'Challenge collector documents by asking who created them and whether they can be authenticated.',
    })

    items.push({
      status: 'needed',
      text: 'Confirm which court you are in (JP, County, or District) \u2014 evidence rules are enforced differently.',
    })

    return items
  },
}
