import { Building, FileText, Scale, Search, Gavel, CheckCircle2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface LearnTopicQuestion {
  prompt: string
  options: string[]
  correctIndex: number
  explanation: string
}

export interface LearnTopic {
  id: string
  title: string
  description: string
  icon: LucideIcon
  duration: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  lessons: number
  overview: string[]
  example: {
    title: string
    scenario: string
    lesson: string
  }
  checklist: string[]
  takeaways: string[]
  mistakes: string[]
  nextSteps: string[]
  ruleNotes: string[]
  quickCheck: LearnTopicQuestion[]
  progress?: number
}

export const LEARN_TOPICS: LearnTopic[] = [
  {
    id: 'basics',
    title: 'Court System Basics',
    description: 'Understand how courts work, the difference between state and federal courts, and which court is right for your case.',
    icon: Building,
    duration: '20 min',
    difficulty: 'beginner',
    lessons: 4,
    overview: [
      'Courts do not all do the same job. Trial courts decide facts, appellate courts review errors, and federal courts only hear matters that fall within federal jurisdiction.',
      'Before filing anything, you need to know both the right system and the right location. A good claim filed in the wrong court can still be delayed, transferred, or dismissed.',
    ],
    example: {
      title: 'Car crash dispute in the wrong court',
      scenario: 'A user files a routine car-accident property damage case in federal court because the defendant lives in another city. The clerk rejects it because there is no federal question and the amount in controversy does not support diversity jurisdiction.',
      lesson: 'The problem was not the claim itself. The problem was choosing the wrong court system before checking jurisdiction and venue.',
    },
    checklist: [
      'Identify the type of dispute before choosing the court.',
      'Check whether your issue belongs in justice, county, district, or federal court.',
      'Confirm the correct county or division for filing.',
      'Look up the court’s filing instructions and local forms.',
    ],
    takeaways: [
      'Jurisdiction answers whether a court may hear your dispute at all.',
      'Venue answers where the case should be filed within the court system.',
      'The first filing decision should be about fit, not convenience.',
    ],
    mistakes: [
      'Assuming the nearest courthouse is automatically the correct one.',
      'Confusing federal issues with federal jurisdiction.',
      'Ignoring local filing rules after choosing the right court.',
    ],
    nextSteps: [
      'Identify whether your dispute belongs in state, county, justice, or federal court.',
      'Confirm venue using where the defendant lives, does business, or where the events happened.',
      'Save the court name and clerk details before starting your petition.',
    ],
    ruleNotes: [
      'State courts handle most everyday civil disputes, while federal courts have limited jurisdiction.',
      'Even when more than one court might hear a case, venue rules still matter.',
      'Local rules can change filing formats, cover sheets, and deadlines even inside the same state.',
    ],
    quickCheck: [
      {
        prompt: 'What is the main difference between jurisdiction and venue?',
        options: [
          'Jurisdiction is about court power, while venue is about filing location',
          'Jurisdiction is about filing fees, while venue is about deadlines',
          'Jurisdiction applies only in federal court, while venue applies only in state court',
        ],
        correctIndex: 0,
        explanation: 'Jurisdiction asks whether the court can hear the case at all. Venue asks where that case should be filed within the system.',
      },
      {
        prompt: 'Why might a case be rejected even if the facts are strong?',
        options: [
          'Because the user did not attach every possible exhibit',
          'Because it was filed in the wrong court or wrong county',
          'Because the defendant denied the allegations',
        ],
        correctIndex: 1,
        explanation: 'A strong claim can still fail procedurally if it is filed in a court that lacks jurisdiction or in the wrong venue.',
      },
    ],
    progress: 0,
  },
  {
    id: 'filing',
    title: 'Filing Your First Petition',
    description: 'Learn what a petition is, what information you need, and step-by-step guidance on filing with the court.',
    icon: FileText,
    duration: '25 min',
    difficulty: 'beginner',
    lessons: 5,
    overview: [
      'Your first petition is the document that introduces the dispute to the court. It tells the court who the parties are, what happened, why the law supports your position, and what relief you want.',
      'A strong opening filing is usually simple and organized. The goal is clarity, not drama. Judges and clerks need a document that is easy to process and legally sufficient.',
    ],
    example: {
      title: 'A petition that buries the claim',
      scenario: 'A filer submits ten pages of background complaints but never clearly states who the defendants are or what relief is being requested.',
      lesson: 'Courts need a readable opening document. Clear facts, named parties, and a direct request usually matter more than length.',
    },
    checklist: [
      'List the correct plaintiff and defendant names.',
      'Write a short timeline of the key facts.',
      'State the legal claim or claims you are asserting.',
      'Say exactly what you want the court to order.',
      'Review signatures, attachments, and filing fees before filing.',
    ],
    takeaways: [
      'Name the correct parties and requested relief clearly.',
      'Stick to facts that support the legal claims you are making.',
      'Review formatting, signatures, attachments, and filing fees before submission.',
    ],
    mistakes: [
      'Adding every grievance instead of the facts that matter legally.',
      'Leaving out dates, names, or requested relief.',
      'Filing before checking local forms, verification, or fee requirements.',
    ],
    nextSteps: [
      'Write a short case timeline before drafting the petition.',
      'Gather exhibits and only attach what your court rules allow.',
      'Use the filing checklist in your case workflow before submitting.',
    ],
    ruleNotes: [
      'A petition is often judged first on sufficiency and clarity, not persuasive storytelling.',
      'Some courts require verified pleadings, cover sheets, or local forms in addition to the petition itself.',
      'The relief section should match the facts and legal claims you actually pleaded.',
    ],
    quickCheck: [
      {
        prompt: 'What is the primary job of a petition?',
        options: [
          'To tell the full emotional story in as much detail as possible',
          'To introduce the dispute clearly and state the relief requested',
          'To prove the case completely before discovery starts',
        ],
        correctIndex: 1,
        explanation: 'A petition starts the case. It should clearly identify the parties, facts, legal basis, and relief sought.',
      },
      {
        prompt: 'Which omission is most likely to weaken an opening filing?',
        options: [
          'Leaving out the exact relief you want',
          'Not including every text message you own',
          'Using short paragraphs',
        ],
        correctIndex: 0,
        explanation: 'The court needs to know what you are asking it to do. Missing requested relief creates ambiguity at the start of the case.',
      },
    ],
    progress: 0,
  },
  {
    id: 'service',
    title: 'Serving the Other Party',
    description: 'Understanding proper service of process - who, how, when, and why it matters for your case.',
    icon: Scale,
    duration: '15 min',
    difficulty: 'beginner',
    lessons: 3,
    overview: [
      'Service of process is how the other side formally receives notice of the lawsuit. Courts treat service seriously because it is tied to due process.',
      'Even a strong case can stall if service is late, incomplete, or done by the wrong person. You need both proper delivery and proof that it happened correctly.',
    ],
    example: {
      title: 'Texting the lawsuit to the defendant',
      scenario: 'A plaintiff texts a copy of the petition to the defendant and assumes that counts as service because the defendant replied angrily.',
      lesson: 'Actual notice is not always enough. Service usually has to follow specific court-approved methods and be documented properly.',
    },
    checklist: [
      'Check which service methods your court allows.',
      'Use an authorized server, constable, sheriff, or process server when required.',
      'Track the service deadline immediately after filing.',
      'File proof of service as soon as it is completed.',
    ],
    takeaways: [
      'Follow your jurisdiction’s approved service methods exactly.',
      'Keep the return or affidavit of service in your records.',
      'Do not assume informal notice is enough.',
    ],
    mistakes: [
      'Trying to serve papers yourself when your rules forbid it.',
      'Missing the service deadline after filing.',
      'Failing to file proof of service with the court.',
    ],
    nextSteps: [
      'Confirm who may serve papers in your court.',
      'Choose the service method that matches your case and defendant.',
      'Upload proof of service to your case file as soon as it is completed.',
    ],
    ruleNotes: [
      'Service rules are procedural, but courts enforce them strictly because they protect notice and fairness.',
      'Different defendants may require different service methods, especially businesses or out-of-state parties.',
      'If service fails, courts may require re-service before the case can move forward.',
    ],
    quickCheck: [
      {
        prompt: 'Why is proof of service important?',
        options: [
          'It shows the court that service happened in a valid way',
          'It replaces the petition itself',
          'It gives the plaintiff more damages',
        ],
        correctIndex: 0,
        explanation: 'Proof of service documents how and when service occurred so the court can verify notice requirements were met.',
      },
      {
        prompt: 'What is the safest assumption about informal notice?',
        options: [
          'If the other side knows about the case, formal service is optional',
          'Informal notice may still be insufficient if the rules require formal service',
          'Informal notice works automatically in small claims cases',
        ],
        correctIndex: 1,
        explanation: 'Procedural rules usually require approved service methods, not just actual awareness of the lawsuit.',
      },
    ],
    progress: 0,
  },
  {
    id: 'discovery',
    title: 'Discovery Explained',
    description: 'Learn how to gather evidence and information from the other side using legal discovery tools.',
    icon: Search,
    duration: '30 min',
    difficulty: 'intermediate',
    lessons: 6,
    overview: [
      'Discovery is the information-exchange phase of litigation. It helps both sides identify the facts, documents, witnesses, and positions that will shape settlement or trial.',
      'Good discovery is targeted. You are not asking for everything possible, you are asking for the information that advances proof, exposes weaknesses, and narrows disputes.',
    ],
    example: {
      title: 'Requesting everything under the sun',
      scenario: 'A party sends fifty broad requests asking for “all documents relating to the incident” without narrowing the time period, issue, or custodian.',
      lesson: 'Overbroad discovery creates objections and delay. Focused requests are easier to defend and more likely to produce useful material.',
    },
    checklist: [
      'List the facts you still need to prove.',
      'Choose the discovery tool that fits each fact.',
      'Set a calendar reminder for response deadlines.',
      'Plan how you will review and organize responses once they arrive.',
    ],
    takeaways: [
      'Each discovery tool serves a different purpose.',
      'Deadlines and objection handling matter as much as drafting.',
      'Your requests should connect directly to claims, defenses, or damages.',
    ],
    mistakes: [
      'Sending overly broad requests that invite valid objections.',
      'Ignoring response deadlines and waiver risks.',
      'Failing to organize incoming documents after you receive them.',
    ],
    nextSteps: [
      'List the facts you still need to prove.',
      'Match each fact to a discovery tool.',
      'Use the discovery pack builder to draft, track, and serve requests.',
    ],
    ruleNotes: [
      'Discovery scope is broad, but it is not unlimited.',
      'Objections can preserve issues, but unsupported objections often fail.',
      'The best discovery requests are tied to a theory of the case, not curiosity.',
    ],
    quickCheck: [
      {
        prompt: 'What usually makes a discovery request stronger?',
        options: [
          'Keeping it tied to a specific issue or fact you need to prove',
          'Making it as broad as possible so nothing is missed',
          'Asking for every document the other side has ever created',
        ],
        correctIndex: 0,
        explanation: 'Focused requests are more defensible and more likely to produce useful information than vague or sweeping demands.',
      },
      {
        prompt: 'Why do deadlines matter in discovery?',
        options: [
          'Because missing them can waive rights or delay your position',
          'Because they only affect lawyers, not pro se litigants',
          'Because they are optional if the other side ignores you',
        ],
        correctIndex: 0,
        explanation: 'Discovery is deadline-driven. Missing response or follow-up deadlines can hurt your leverage and sometimes your legal position.',
      },
    ],
    progress: 0,
  },
  {
    id: 'hearing',
    title: 'Preparing for Your Hearing',
    description: 'What to expect at your hearing, how to present your case, and tips for appearing in court.',
    icon: Gavel,
    duration: '20 min',
    difficulty: 'intermediate',
    lessons: 4,
    overview: [
      'A hearing is usually a focused argument or evidence presentation around a specific issue, not a chance to tell the whole story from scratch.',
      'Preparation matters more than volume. A calm outline, organized exhibits, and a clear ask usually outperform a long emotional presentation.',
    ],
    example: {
      title: 'Talking past the issue',
      scenario: 'A litigant spends ten minutes describing every unfair thing the other side did, but the hearing was only about whether to continue a deadline.',
      lesson: 'The judge is usually deciding one specific question. Your preparation should match that exact issue.',
    },
    checklist: [
      'Write down the exact ruling you want from the judge.',
      'Prepare a short outline with your best three points.',
      'Label exhibits in the order you plan to mention them.',
      'Practice answering likely questions in one or two sentences.',
    ],
    takeaways: [
      'Know the issue the judge is deciding that day.',
      'Bring a simple outline and labeled exhibits.',
      'Practice short answers to likely questions.',
    ],
    mistakes: [
      'Showing up without a clear ask for the court.',
      'Arguing with the other side instead of addressing the judge.',
      'Relying on memory rather than organized notes and exhibits.',
    ],
    nextSteps: [
      'Prepare a one-page hearing outline.',
      'Put exhibits in the order you plan to reference them.',
      'Practice your opening explanation out loud before the hearing date.',
    ],
    ruleNotes: [
      'Hearings may focus on procedure, evidence, scheduling, or temporary relief rather than final merits.',
      'Courtroom credibility often comes from organization and restraint.',
      'The record matters, so clarity and direct answers are usually better than long speeches.',
    ],
    quickCheck: [
      {
        prompt: 'What should guide your hearing preparation first?',
        options: [
          'The exact issue the judge is deciding that day',
          'Every bad act the other side has ever committed',
          'A plan to interrupt if the other side lies',
        ],
        correctIndex: 0,
        explanation: 'Hearing preparation should match the specific issue before the court, not the entire history of the case.',
      },
      {
        prompt: 'Which is usually more effective at a hearing?',
        options: [
          'A concise outline and organized exhibits',
          'A long speech without notes',
          'Responding only when the other side makes you angry',
        ],
        correctIndex: 0,
        explanation: 'Judges usually respond better to organized, issue-focused presentation than volume or emotion.',
      },
    ],
    progress: 0,
  },
  {
    id: 'judgments',
    title: 'Understanding Judgments',
    description: 'What happens after the court decides, how to collect on a judgment, and your options for appeal.',
    icon: CheckCircle2,
    duration: '15 min',
    difficulty: 'advanced',
    lessons: 3,
    overview: [
      'A judgment is the court’s formal decision on the issues before it. Once entered, it can trigger enforcement rights, appeal deadlines, and post-judgment motions.',
      'Winning does not automatically mean getting paid, and losing does not always mean the case is over. The next stage depends on the kind of judgment and your options under local rules.',
    ],
    example: {
      title: 'Winning but not collecting',
      scenario: 'A plaintiff wins a money judgment and assumes payment will arrive automatically. Months pass without collection efforts or enforcement steps.',
      lesson: 'A judgment gives legal rights, but enforcement often requires separate action, paperwork, and deadlines.',
    },
    checklist: [
      'Read the signed judgment line by line.',
      'Calendar appeal and post-judgment motion deadlines immediately.',
      'Decide whether the next move is compliance, collection, reconsideration, or appeal.',
      'Preserve the judgment and proof of entry in your records.',
    ],
    takeaways: [
      'Read the exact language of the judgment before reacting.',
      'Calendar appeal and post-judgment motion deadlines immediately.',
      'Collection requires a separate enforcement plan in many cases.',
    ],
    mistakes: [
      'Assuming a judgment automatically enforces itself.',
      'Missing the deadline to challenge or appeal the result.',
      'Ignoring interest, costs, or compliance terms in the signed order.',
    ],
    nextSteps: [
      'Save the signed judgment and note the entry date.',
      'Decide whether your next move is compliance, collection, reconsideration, or appeal.',
      'Build a post-judgment checklist in your case timeline.',
    ],
    ruleNotes: [
      'Finality matters because it controls when post-judgment deadlines begin.',
      'A judgment can resolve liability without immediately resolving collection.',
      'Post-judgment procedure is deadline-driven, so delay can permanently limit options.',
    ],
    quickCheck: [
      {
        prompt: 'What is one common mistake after receiving a judgment?',
        options: [
          'Assuming the judgment enforces itself automatically',
          'Reading the signed order carefully',
          'Calendaring appeal deadlines immediately',
        ],
        correctIndex: 0,
        explanation: 'A judgment often requires follow-up action, whether that means enforcement, compliance, or review.',
      },
      {
        prompt: 'Why does the entry date of a judgment matter?',
        options: [
          'It starts important deadlines for post-judgment action',
          'It only matters for the clerk’s filing cabinet',
          'It replaces the need to read the judgment itself',
        ],
        correctIndex: 0,
        explanation: 'The entry date can control when appeal and post-judgment deadlines begin running.',
      },
    ],
    progress: 0,
  },
]

export const LEARN_TOPIC_IDS = LEARN_TOPICS.map((topic) => topic.id)

export function getLearnTopic(topicId: string): LearnTopic | undefined {
  return LEARN_TOPICS.find((topic) => topic.id === topicId)
}

