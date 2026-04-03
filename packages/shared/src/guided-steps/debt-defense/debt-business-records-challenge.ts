import type { GuidedStepConfig } from '../types'

export const debtBusinessRecordsChallengeConfig: GuidedStepConfig = {
  title: 'Challenging Their Evidence',
  reassurance:
    'Debt buyers often rely on weak evidence that can be challenged. They purchased your account in bulk and may not have the records to prove their case.',

  questions: [
    {
      id: 'business_records_intro',
      type: 'info',
      prompt:
        'Debt buyers usually don\'t have a witness who personally handled your account. Instead, they rely on a "Business Records Affidavit" (Texas Rule of Evidence 803(6) / Rule 902) to get their documents admitted without live testimony. You can challenge this.',
    },
    {
      id: 'affidavit_received',
      type: 'yes_no',
      prompt: 'Has the plaintiff filed a business records affidavit?',
      helpText:
        'This is a sworn statement they file to get documents admitted as evidence without bringing a live witness. Check your case file or any documents served on you.',
    },
    {
      id: 'affidavit_weaknesses',
      type: 'info',
      prompt:
        'COMMON WEAKNESSES TO CHALLENGE:\n\n- The affiant (person who signed) has no personal knowledge of YOUR account \u2014 they work for the debt buyer, not the original creditor\n- Records were not made "at or near the time" of the transactions \u2014 they were created after purchase\n- Records were not kept in the "regular course of business" of the ORIGINAL creditor\n- Chain of custody gaps \u2014 records passed through multiple companies\n- Lack of foundation \u2014 no testimony about how records were created or maintained',
      showIf: (answers) => answers.affidavit_received === 'yes',
    },
    {
      id: 'how_to_object',
      type: 'info',
      prompt:
        'HOW TO OBJECT \u2014 At trial, when they try to introduce documents through the affidavit, object: "Objection, Your Honor. Hearsay. The business records exception requires that records be made by someone with personal knowledge, at or near the time of the event, as part of regular business practice. The affiant works for [debt buyer], not [original creditor], and has no personal knowledge of the creation or maintenance of these records."',
    },
    {
      id: 'records_look_incomplete',
      type: 'yes_no',
      prompt:
        'Do the records appear incomplete, inconsistent, or contain unexplained charges?',
      helpText:
        'Look for gaps in statement dates, fees that appeared suddenly, balance jumps, or amounts that don\'t add up.',
    },
    {
      id: 'challenge_accuracy',
      type: 'info',
      prompt:
        'CHALLENGE THE ACCURACY \u2014 If statements have gaps, unexplained fees, or don\'t match what you remember, point this out. The plaintiff bears the burden of proving the exact amount owed. Discrepancies undermine their case.',
      showIf: (answers) => answers.records_look_incomplete === 'yes',
    },
    {
      id: 'written_objection_deadline',
      type: 'info',
      prompt:
        'FILE A WRITTEN OBJECTION \u2014 If you receive a business records affidavit before trial, you have 14 days (Justice Court Rule 503.3) to file a written objection. If you don\'t object in time, the affidavit may be admitted automatically. Mark this deadline!',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.affidavit_received === 'yes') {
      items.push({
        status: 'done',
        text: 'You identified that the plaintiff has filed a business records affidavit.',
      })
      items.push({
        status: 'needed',
        text: 'File a written objection to the affidavit within 14 days of receiving it (Justice Court Rule 503.3).',
      })
      items.push({
        status: 'info',
        text: 'Review the affidavit for common weaknesses: lack of personal knowledge, records not made at or near the time, chain of custody gaps.',
      })
    } else if (answers.affidavit_received === 'no') {
      items.push({
        status: 'info',
        text: 'No business records affidavit filed yet. Watch for one before trial \u2014 you have 14 days to object once received.',
      })
    }

    if (answers.records_look_incomplete === 'yes') {
      items.push({
        status: 'info',
        text: 'Records appear incomplete or inconsistent. Challenge the accuracy of the claimed amount at trial.',
      })
    } else if (answers.records_look_incomplete === 'no') {
      items.push({
        status: 'info',
        text: 'Even if records look complete, you can still challenge whether they meet the business records exception requirements.',
      })
    }

    items.push({
      status: 'info',
      text: 'Prepare your hearsay objection for trial: the affiant has no personal knowledge of the original creditor\'s record-keeping practices.',
    })

    return items
  },
}
