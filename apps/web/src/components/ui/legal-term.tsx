import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface GlossaryTerm {
  term: string
  definition: string
  example?: string
}

export const LEGAL_GLOSSARY: Record<string, GlossaryTerm> = {
  plaintiff: {
    term: 'You (the person filing)',
    definition: 'The person who starts the lawsuit by filing a petition. You\'re asking the court to help you.',
    example: 'If you\'re suing someone for money they owe you, you are the plaintiff.',
  },
  defendant: {
    term: 'The person you\'re suing',
    definition: 'The person or business the petition is filed against. They\'re the one you\'re asking the court to rule against.',
    example: 'If someone owes you money and won\'t pay, they\'re the defendant.',
  },
  venue: {
    term: 'Which court location',
    definition: 'The specific courthouse where your case will be heard. This is usually based on where the incident happened or where the defendant lives.',
    example: 'If the incident happened in Harris County, your venue would be a Harris County court.',
  },
  jurisdiction: {
    term: 'Court\'s authority',
    definition: 'Whether a court has the power to hear your case. Courts can only decide cases in certain areas or involving certain amounts.',
    example: 'Justice courts can typically only hear cases up to $20,000.',
  },
  cause_of_action: {
    term: 'Why you think this is wrong',
    definition: 'The legal reason you believe the defendant is responsible for harming you. This tells the court what law the defendant may have broken.',
    example: '"Negligence" is a cause of action if someone\'s carelessness caused your injury.',
  },
  summons: {
    term: 'Notice to the other party',
    definition: 'The official court document that formally tells the defendant about the lawsuit. It informs them of the deadline to respond.',
    example: 'After you file, the court will issue a summons to be delivered to the defendant.',
  },
  service_of_process: {
    term: 'Legally telling them about the lawsuit',
    definition: 'The formal process of delivering the petition and summons to the defendant so they\'re officially notified of the lawsuit.',
    example: 'A sheriff or process server can deliver the documents to the defendant.',
  },
  citation: {
    term: 'Court-issued notice',
    definition: 'The official court document that accompanies your petition. It tells the defendant what they need to do.',
    example: 'The citation will say something like "You have until [date] to file a written answer."',
  },
  answer: {
    term: 'Defendant\'s response',
    definition: 'The defendant\'s written response to your petition. They can admit, deny, or assert defenses to your claims.',
    example: 'If you\'re sued, you would file an "Answer" to respond to the claims against you.',
  },
  affirmative_defense: {
    term: 'Reason the defendant isn\'t responsible',
    definition: 'A reason the defendant gives for why they shouldn\'t be held liable, even if your facts are true.',
    example: '"The statute of limitations has passed" is an affirmative defense.',
  },
  discovery: {
    term: 'Gathering evidence from the other side',
    definition: 'The process where both parties exchange information and evidence before trial.',
    example: 'Interrogatories are written questions you can send to the defendant.',
  },
  interrogatories: {
    term: 'Written questions to the other party',
    definition: 'Formal questions the opposing party must answer in writing under oath.',
    example: 'You might ask: "Describe the accident in detail."',
  },
  request_for_production: {
    term: 'Request for documents or things',
    definition: 'A formal request for the other party to provide documents, photos, or other evidence.',
    example: 'You might request: "Produce all contracts between us."',
  },
  request_for_admission: {
    term: 'Ask them to confirm facts',
    definition: 'Written statements the other party must admit or deny.',
    example: 'You might ask them to admit: "The accident occurred on January 15, 2026."',
  },
  deposition: {
    term: 'Oath-based questioning',
    definition: 'A formal meeting where one party answers questions under oath while a court reporter records everything.',
    example: 'You can ask the defendant questions directly in a deposition.',
  },
  exhibit: {
    term: 'Evidence document',
    definition: 'A document, photo, or item presented as evidence in court.',
    example: 'A contract, receipt, or photo of damage would be an exhibit.',
  },
  motion: {
    term: 'Request to the court',
    definition: 'A formal written request asking the judge to make a ruling on a specific issue.',
    example: 'A "Motion for Summary Judgment" asks the court to rule in your favor without a trial.',
  },
  default_judgment: {
    term: 'Automatic win if they don\'t respond',
    definition: 'A judgment in your favor if the defendant fails to file an answer in time.',
    example: 'If the defendant ignores the lawsuit, you may be able to get a default judgment.',
  },
  statute_of_limitations: {
    term: 'Deadline to file your lawsuit',
    definition: 'The time limit for filing a lawsuit. If this deadline passes, you may lose your right to sue.',
    example: 'Most personal injury cases in Texas have a 2-year statute of limitations.',
  },
  fee_waiver: {
    term: 'Waiver of court fees',
    definition: 'If you can\'t afford court fees, you may be able to have them waived by proving financial hardship.',
    example: 'Many courts have forms to apply for a fee waiver.',
  },
  e_filing: {
    term: 'Filing documents online',
    definition: 'Submitting your court documents electronically through the court\'s online system.',
    example: 'In Texas, you can eFile through eFileTexas.gov.',
  },
  prayer_for_relief: {
    term: 'What you want the court to do',
    definition: 'The specific outcomes you\'re requesting from the judge.',
    example: '"I request judgment for $5,000 plus court costs."',
  },
  damages: {
    term: 'Money you\'re seeking',
    definition: 'The amount of compensation you\'re requesting from the court.',
    example: 'Economic damages cover medical bills; non-economic damages cover pain and suffering.',
  },
  preponderance_of_evidence: {
    term: 'More likely than not',
    definition: 'The standard of proof in civil cases. You must show your version of events is more likely true than not.',
    example: 'Think of it as just over 50% — you just need to tip the scales in your favor.',
  },
  counterclaim: {
    term: 'Your claim against their claim',
    definition: 'If you\'re sued, you can file claims against the plaintiff in your answer.',
    example: 'If they\'re suing you for $1,000, you might counterclaim for $2,000 you\'re owed.',
  },
  garnishment: {
    term: 'Taking money from their account or paycheck',
    definition: 'A court order allowing you to collect money directly from the defendant\'s employer or bank.',
    example: 'If you win, you might garnish the defendant\'s wages to collect what\'s owed.',
  },
  certified_mail: {
    term: 'Proof of mailing with signature',
    definition: 'A mailing service that provides proof of delivery with the recipient\'s signature.',
    example: 'Service by certified mail requires the recipient to sign for the documents.',
  },
  registered_agent: {
    term: 'Business\'s legal contact',
    definition: 'The person or company designated to receive legal documents on behalf of a business.',
    example: 'When suing a corporation, you often serve their registered agent.',
  },
  mediation: {
    term: 'Settlement meeting with a neutral person',
    definition: 'A facilitated negotiation where a neutral mediator helps both sides reach a settlement.',
    example: 'Many courts require mediation before trial.',
  },
  arbitration: {
    term: 'Private decision by a neutral person',
    definition: 'A private process where an arbitrator hears evidence and makes a binding decision.',
    example: 'Some contracts require arbitration instead of court.',
  },
  appeal: {
    term: 'Asking a higher court to review',
    definition: 'Requesting that a higher court review the trial court\'s decision.',
    example: 'If you lose at trial, you might appeal to the Court of Appeals.',
  },
}

interface LegalTermProps {
  termKey: string
  children?: React.ReactNode
  className?: string
}

export function LegalTerm({ termKey, children, className }: LegalTermProps) {
  const entry = LEGAL_GLOSSARY[termKey]
  if (!entry) return <span className={className}>{children}</span>

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex items-center gap-1 text-calm-indigo hover:text-calm-indigo/80 cursor-help font-medium',
            className
          )}
        >
          {children ?? entry.term}
          <HelpCircle className="h-3.5 w-3.5" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">{entry.term}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-sm text-warm-muted">{entry.definition}</p>
          {entry.example && (
            <div className="pt-3 border-t border-warm-border">
              <p className="text-xs text-warm-muted">
                <span className="font-medium text-calm-indigo">Example: </span>
                {entry.example}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function getPlainLanguage(termKey: string): string {
  return LEGAL_GLOSSARY[termKey]?.term ?? termKey
}

export function getDefinition(termKey: string): string {
  return LEGAL_GLOSSARY[termKey]?.definition ?? ''
}
