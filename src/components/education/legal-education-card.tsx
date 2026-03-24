'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Lightbulb, 
  Info, 
  AlertTriangle, 
  HelpCircle,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  BookOpen
} from 'lucide-react'

interface EducationCardProps {
  topic: string
  children: React.ReactNode
  variant?: 'info' | 'tip' | 'example' | 'warning' | 'confused'
  title?: string
  collapsible?: boolean
  onDismiss?: () => void
  className?: string
}

const VARIANT_CONFIG = {
  info: {
    icon: Info,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    iconColor: 'text-blue-600',
    titleColor: 'text-blue-800',
    defaultTitle: 'Did you know?',
  },
  tip: {
    icon: Lightbulb,
    bgColor: 'bg-calm-green/10',
    borderColor: 'border-calm-green/30',
    iconColor: 'text-calm-green',
    titleColor: 'text-calm-green',
    defaultTitle: 'Helpful Tip',
  },
  example: {
    icon: BookOpen,
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    iconColor: 'text-purple-600',
    titleColor: 'text-purple-800',
    defaultTitle: 'Example',
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-calm-amber/10',
    borderColor: 'border-calm-amber/30',
    iconColor: 'text-calm-amber',
    titleColor: 'text-calm-amber',
    defaultTitle: 'Important',
  },
  confused: {
    icon: HelpCircle,
    bgColor: 'bg-calm-indigo/10',
    borderColor: 'border-calm-indigo/30',
    iconColor: 'text-calm-indigo',
    titleColor: 'text-calm-indigo',
    defaultTitle: 'Not sure?',
  },
}

export function EducationCard({
  topic,
  children,
  variant = 'info',
  title,
  collapsible = false,
  onDismiss,
  className,
}: EducationCardProps) {
  const [expanded, setExpanded] = useState(!collapsible)
  const config = VARIANT_CONFIG[variant]
  const Icon = config.icon

  return (
    <div
      className={cn(
        'rounded-lg border p-4 transition-all',
        config.bgColor,
        config.borderColor,
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <Icon className={cn('h-5 w-5 shrink-0 mt-0.5', config.iconColor)} />
          <div className="flex-1">
            <h4 className={cn('font-semibold text-sm', config.titleColor)}>
              {title || config.defaultTitle}
            </h4>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {collapsible && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-warm-muted hover:text-warm-text transition-colors"
            >
              {expanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
          )}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-warm-muted hover:text-warm-text transition-colors text-sm"
            >
              Got it
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {expanded && (
        <div className="mt-3 text-sm text-warm-muted leading-relaxed">
          {children}
        </div>
      )}
    </div>
  )
}

// Pre-built education cards for common topics
export const COMMON_EDUCATION = {
  defendant: {
    title: "What is a defendant?",
    content: (
      <div className="space-y-3">
        <p>
          The <strong>defendant</strong> is the person or business you're 
          filing the lawsuit against. Think of them as "the other side" of your case.
        </p>
        <div>
          <p className="font-medium text-warm-text">Examples:</p>
          <ul className="list-disc pl-4 space-y-1 mt-1">
            <li>Suing a contractor → contractor is the defendant</li>
            <li>Suing a company → the company is the defendant</li>
            <li>Being sued → you are the defendant</li>
          </ul>
        </div>
        <p>
          The court needs to know who the defendant is so they can be officially 
          notified about the lawsuit.
        </p>
      </div>
    ),
  },

  damages: {
    title: "What are damages?",
    content: (
      <div className="space-y-3">
        <p>
          In legal terms, <strong>damages</strong> means the money you're asking 
          the court to award you. Think of it as answering: "How much do you want?"
        </p>
        <div>
          <p className="font-medium text-warm-text">Types of damages:</p>
          <ul className="list-disc pl-4 space-y-1 mt-1">
            <li><strong>Compensatory:</strong> To cover your actual losses (medical bills, lost wages, repair costs)</li>
            <li><strong>Consequential:</strong> To cover indirect costs (travel to medical appointments, etc.)</li>
            <li><strong>Punitive:</strong> Extra money to punish bad behavior (rare, harder to get)</li>
          </ul>
        </div>
        <p className="bg-calm-amber/10 p-2 rounded">
          💡 You can estimate even if you're not certain. The judge makes the final decision.
        </p>
      </div>
    ),
  },

  serviceOfProcess: {
    title: "What is service of process?",
    content: (
      <div className="space-y-3">
        <p>
          <strong>Service of process</strong> is the formal way of officially 
          telling someone about a lawsuit. It's how the defendant learns they need to respond.
        </p>
        <div>
          <p className="font-medium text-warm-text">The process:</p>
          <ol className="list-decimal pl-4 space-y-1 mt-1">
            <li>You file your petition with the court</li>
            <li>The court issues a "citation" (official notice)</li>
            <li>Someone delivers both documents to the defendant</li>
            <li>The defendant signs proof of service</li>
            <li>You file the proof with the court</li>
          </ol>
        </div>
        <p className="bg-calm-amber/10 p-2 rounded">
          ⚠️ You must serve the defendant within 30 days or the court may dismiss your case.
        </p>
      </div>
    ),
  },

  venue: {
    title: "What is venue?",
    content: (
      <div className="space-y-3">
        <p>
          <strong>Venue</strong> means the specific courthouse where your case 
          will be heard. It's about WHERE your case is filed.
        </p>
        <div>
          <p className="font-medium text-warm-text">How to choose:</p>
          <ul className="list-disc pl-4 space-y-1 mt-1">
            <li><strong>Where it happened:</strong> The county where the incident occurred</li>
            <li><strong>Where they live:</strong> The county where the defendant lives</li>
            <li><strong>Contract location:</strong> For contracts, where the agreement was made or performed</li>
          </ul>
        </div>
        <p>
          Most people file in the county where the incident happened.
        </p>
      </div>
    ),
  },

  jurisdiction: {
    title: "What is jurisdiction?",
    content: (
      <div className="space-y-3">
        <p>
          <strong>Jurisdiction</strong> is whether a court has the AUTHORITY 
          to hear your case. Think of it as: "Can this court decide this?"
        </p>
        <div>
          <p className="font-medium text-warm-text">Courts have limits:</p>
          <ul className="list-disc pl-4 space-y-1 mt-1">
            <li><strong>Subject matter:</strong> Some courts only handle certain types of cases</li>
            <li><strong>Dollar amount:</strong> JP courts handle up to $10,000, County up to $200,000</li>
            <li><strong>Location:</strong> Courts only cover their geographic area</li>
          </ul>
        </div>
        <p>
          We help you pick a court that has jurisdiction over your case.
        </p>
      </div>
    ),
  },

  statuteOfLimitations: {
    title: "What is the statute of limitations?",
    content: (
      <div className="space-y-3">
        <p>
          The <strong>statute of limitations</strong> is the DEADLINE to file your lawsuit. 
          If this passes, you may lose your right to sue forever.
        </p>
        <div>
          <p className="font-medium text-warm-text">Common deadlines in Texas:</p>
          <ul className="list-disc pl-4 space-y-1 mt-1">
            <li>Personal injury: 2 years</li>
            <li>Contract (written): 4 years</li>
            <li>Contract (oral): 2 years</li>
            <li>Property damage: 2 years</li>
          </ul>
        </div>
        <p className="bg-red-50 p-2 rounded border border-red-200">
          ⚠️ This is critical. If your deadline has passed, consult an attorney before proceeding.
        </p>
      </div>
    ),
  },

  causeOfAction: {
    title: "What is a cause of action?",
    content: (
      <div className="space-y-3">
        <p>
          A <strong>cause of action</strong> is the LEGAL REASON you believe 
          the defendant should be held responsible. It's why you think what happened is wrong in the eyes of the law.
        </p>
        <div>
          <p className="font-medium text-warm-text">Common causes of action:</p>
          <ul className="list-disc pl-4 space-y-1 mt-1">
            <li><strong>Breach of contract:</strong> They didn't keep their promise</li>
            <li><strong>Negligence:</strong> They were careless and it caused harm</li>
            <li><strong>Breach of warranty:</strong> A product or service didn't work as promised</li>
            <li><strong>Conversion:</strong> Someone took your property</li>
          </ul>
        </div>
        <p>
          You can include multiple causes of action in one petition.
        </p>
      </div>
    ),
  },

  standing: {
    title: "What is standing?",
    content: (
      <div className="space-y-3">
        <p>
          <strong>Standing</strong> means you have the RIGHT to sue. Not everyone can file a lawsuit about everything.
        </p>
        <div>
          <p className="font-medium text-warm-text">To have standing, you typically need:</p>
          <ul className="list-disc pl-4 space-y-1 mt-1">
            <li><strong>Injury:</strong> You were actually harmed</li>
            <li><strong>Causation:</strong> What they did caused your harm</li>
            <li><strong>Redressability:</strong> The court can actually help you</li>
          </ul>
        </div>
        <p>
          In simple terms: "Did what they did actually hurt you in a way the court can fix?"
        </p>
      </div>
    ),
  },

  smallClaims: {
    title: "What is Small Claims Court?",
    content: (
      <div className="space-y-3">
        <p>
          <strong>Small Claims Court</strong> is a special court designed for people to settle disputes 
          without hiring a lawyer. It's faster, cheaper, and simpler than regular civil court.
        </p>
        <div>
          <p className="font-medium text-warm-text">Key features:</p>
          <ul className="list-disc pl-4 space-y-1 mt-1">
            <li><strong>Maximum amount:</strong> Up to $10,000 (varies by state)</li>
            <li><strong>No lawyer required:</strong> You can represent yourself</li>
            <li><strong>Quick process:</strong> Usually resolved faster than regular lawsuits</li>
            <li><strong>Simpler rules:</strong> Less formal procedures</li>
          </ul>
        </div>
        <p>
          If your claim is under the limit, small claims might be your best option!
        </p>
      </div>
    ),
  },

  burdenOfProof: {
    title: "What is the Burden of Proof?",
    content: (
      <div className="space-y-3">
        <p>
          The <strong>burden of proof</strong> determines who has to prove what in a case. 
          As the plaintiff, you generally have to prove your case.
        </p>
        <div>
          <p className="font-medium text-warm-text">Different standards:</p>
          <ul className="list-disc pl-4 space-y-1 mt-1">
            <li><strong>Preponderance of evidence:</strong> "More likely than not" (51% vs 49%) - most civil cases</li>
            <li><strong>Clear and convincing:</strong> Higher standard, used for some fraud cases</li>
            <li><strong>Beyond reasonable doubt:</strong> Criminal cases only, very high standard</li>
          </ul>
        </div>
        <p className="bg-calm-green/10 p-2 rounded">
          For most civil cases, you just need to show your version is more likely true than not.
        </p>
      </div>
    ),
  },

  defaultJudgment: {
    title: "What is a Default Judgment?",
    content: (
      <div className="space-y-3">
        <p>
          A <strong>default judgment</strong> is a court ruling in your favor because the 
          defendant failed to respond to your lawsuit.
        </p>
        <div>
          <p className="font-medium text-warm-text">When it happens:</p>
          <ol className="list-decimal pl-4 space-y-1 mt-1">
            <li>You file and properly serve the defendant</li>
            <li>Defendant ignores the lawsuit (fails to respond)</li>
            <li>The deadline passes (usually 20-30 days)</li>
            <li>You request a default judgment from the court</li>
          </ol>
        </div>
        <p className="bg-calm-amber/10 p-2 rounded">
          If you get a default judgment, you win your case without going to trial!
        </p>
      </div>
    ),
  },

  counterclaim: {
    title: "What is a Counterclaim?",
    content: (
      <div className="space-y-3">
        <p>
          A <strong>counterclaim</strong> is when the defendant sues YOU back in response to your lawsuit.
        </p>
        <div>
          <p className="font-medium text-warm-text">Examples:</p>
          <ul className="list-disc pl-4 space-y-1 mt-1">
            <li>You sue for breach of contract → defendant says you breached first</li>
            <li>You sue for damages → defendant says your damages claim is inflated</li>
          </ul>
        </div>
        <p>
          If you're sued, you can file a counterclaim within your answer to the court.
        </p>
      </div>
    ),
  },

  evidence: {
    title: "What counts as evidence?",
    content: (
      <div className="space-y-3">
        <p>
          <strong>Evidence</strong> is anything you use to prove your side of the story. 
          Strong evidence makes your case convincing.
        </p>
        <div>
          <p className="font-medium text-warm-text">Types of evidence:</p>
          <ul className="list-disc pl-4 space-y-1 mt-1">
            <li><strong>Documents:</strong> Contracts, receipts, emails, letters, texts</li>
            <li><strong>Photos/Videos:</strong> Pictures of damage, injuries, or incidents</li>
            <li><strong>Witness testimony:</strong> People who saw what happened</li>
            <li><strong>Records:</strong> Medical records, police reports, repair estimates</li>
          </ul>
        </div>
        <p>
          Organize your evidence early - you need to be able to present it clearly.
        </p>
      </div>
    ),
  },

  mediation: {
    title: "What is Mediation?",
    content: (
      <div className="space-y-3">
        <p>
          <strong>Mediation</strong> is a meeting where a neutral person helps both sides 
          reach an agreement without going to trial.
        </p>
        <div>
          <p className="font-medium text-warm-text">Why consider it:</p>
          <ul className="list-disc pl-4 space-y-1 mt-1">
            <li><strong>Cheaper:</strong> Avoids expensive trial costs</li>
            <li><strong>Faster:</strong> Settlements can happen in weeks, not years</li>
            <li><strong>You control the outcome:</strong> Judges decide for you at trial; you decide in mediation</li>
            <li><strong>Less stressful:</strong> No guaranteed winner or loser</li>
          </ul>
        </div>
        <p>
          Many courts require mediation before trial. Even if not required, it can save time and money.
        </p>
      </div>
    ),
  },

  statuteOfRepose: {
    title: "Statute of Repose vs. Statute of Limitations",
    content: (
      <div className="space-y-3">
        <p>
          These are two different deadlines that can affect when you can file.
        </p>
        <div>
          <p className="font-medium text-warm-text">Statute of Limitations:</p>
          <p>Starts when the injury or harm DISCOVERS (or should have been discovered). 
          "You have X years from when you knew (or should have known) to file."</p>
        </div>
        <div className="mt-3">
          <p className="font-medium text-warm-text">Statute of Repose:</p>
          <p>Starts when the ACT happened, regardless of discovery. "No matter what, 
          you must file within X years of the event."</p>
        </div>
        <p className="bg-calm-amber/10 p-2 rounded">
          For construction defects, the repose period might be 10 years even if limitations hasn't run.
        </p>
      </div>
    ),
  },

  classAction: {
    title: "Class Action vs. Individual Lawsuit",
    content: (
      <div className="space-y-3">
        <p>
          You might have the option to join a <strong>class action</strong> or file 
          an <strong>individual lawsuit</strong>. Each has pros and cons.
        </p>
        <div>
          <p className="font-medium text-warm-text">Class Action:</p>
          <ul className="list-disc pl-4 space-y-1 mt-1">
            <li>You join hundreds/thousands of others with similar claims</li>
            <li>One lawsuit covers everyone</li>
            <li>You might get less money individually, but lawsuit costs are shared</li>
          </ul>
        </div>
        <div className="mt-3">
          <p className="font-medium text-warm-text">Individual Lawsuit:</p>
          <ul className="list-disc pl-4 space-y-1 mt-1">
            <li>Your case is unique to you</li>
            <li>You control all decisions</li>
            <li>You bear all costs yourself</li>
          </ul>
        </div>
      </div>
    ),
  },

  appeal: {
    title: "What is an Appeal?",
    content: (
      <div className="space-y-3">
        <p>
          An <strong>appeal</strong> is asking a higher court to review the decision 
          made by a lower court. It's not a new trial.
        </p>
        <div>
          <p className="font-medium text-warm-text">Key points:</p>
          <ul className="list-disc pl-4 space-y-1 mt-1">
            <li><strong>Not a redo:</strong> Appeals judges don't hear new evidence</li>
            <li><strong>Error review:</strong> They look for legal mistakes in your trial</li>
            <li><strong>Higher burden:</strong> You must show the judge made a significant error</li>
            <li><strong>Deadline:</strong> Usually 30-60 days after judgment (don't miss it!)</li>
          </ul>
        </div>
        <p className="bg-red-50 p-2 rounded border border-red-200">
          Appeals are complex. Consult an attorney if you're considering one.
        </p>
      </div>
    ),
  },

  discovery: {
    title: "What is Discovery?",
    content: (
      <div className="space-y-3">
        <p>
          <strong>Discovery</strong> is the process where both sides exchange information 
          and evidence before trial. It helps you learn the other side's case.
        </p>
        <div>
          <p className="font-medium text-warm-text">Discovery tools:</p>
          <ul className="list-disc pl-4 space-y-1 mt-1">
            <li><strong>Interrogatories:</strong> Written questions the other side must answer</li>
            <li><strong>Requests for production:</strong> Ask for documents, photos, records</li>
            <li><strong>Requests for admission:</strong> Ask them to confirm or deny specific facts</li>
            <li><strong>Depositions:</strong> Oral questions asked under oath</li>
          </ul>
        </div>
        <p>
          Discovery helps prevent surprises at trial and can lead to settlement.
        </p>
      </div>
    ),
  },

  summons: {
    title: "What is a Summons?",
    content: (
      <div className="space-y-3">
        <p>
          A <strong>summons</strong> is an official notice that accompanies your petition. 
          It tells the defendant they've been sued.
        </p>
        <div>
          <p className="font-medium text-warm-text">What it includes:</p>
          <ul className="list-disc pl-4 space-y-1 mt-1">
            <li>The court&apos;s name and address</li>
            <li>The deadline to respond (usually 20-30 days)</li>
            <li>Warning that failure to respond may result in default judgment</li>
            <li>Instructions for how to respond</li>
          </ul>
        </div>
        <p>
          The summons and petition are served together - both must reach the defendant.
        </p>
      </div>
    ),
  },

  injunctiveRelief: {
    title: "What is Injunctive Relief?",
    content: (
      <div className="space-y-3">
        <p>
          <strong>Injunctive relief</strong> is when you ask the court to ORDER someone to do 
          (or stop doing) something. It's not money - it's an action.
        </p>
        <div>
          <p className="font-medium text-warm-text">Types:</p>
          <ul className="list-disc pl-4 space-y-1 mt-1">
            <li><strong>Temporary restraining order (TRO):</strong> Emergency, short-term order</li>
            <li><strong>Preliminary injunction:</strong> Holds things in place during the lawsuit</li>
            <li><strong>Permanent injunction:</strong> Long-term court order after trial</li>
          </ul>
        </div>
        <p>
          Example: Asking the court to stop a business from using your copyrighted material.
        </p>
      </div>
    ),
  },

  ratification: {
    title: "What is Ratification?",
    content: (
      <div className="space-y-3">
        <p>
          <strong>Ratification</strong> is when someone approves or confirms an action 
          that was initially done on their behalf without proper authority.
        </p>
        <div>
          <p className="font-medium text-warm-text">Example:</p>
          <p>Someone orders supplies on behalf of your company without authorization. 
          If the company accepts and pays for those supplies, they've ratified the unauthorized order.</p>
        </div>
        <p className="bg-calm-amber/10 p-2 rounded">
          Ratification can create contract liability even without an initial agreement.
        </p>
      </div>
    ),
  },

  consideration: {
    title: "What is Consideration?",
    content: (
      <div className="space-y-3">
        <p>
          <strong>Consideration</strong> is something of value exchanged between parties 
          to a contract. It's what makes a promise legally binding.
        </p>
        <div>
          <p className="font-medium text-warm-text">Valid consideration includes:</p>
          <ul className="list-disc pl-4 space-y-1 mt-1">
            <li>Money paid or services rendered</li>
            <li>Promises to do (or not do) something</li>
            <li>Goods exchanged for goods</li>
          </ul>
        </div>
        <p className="bg-calm-amber/10 p-2 rounded">
          A promise without consideration is generally not enforceable as a contract.
        </p>
      </div>
    ),
  },

  resJudicata: {
    title: "What is Res Judicata?",
    content: (
      <div className="space-y-3">
        <p>
          <strong>Res judicata</strong> is a legal principle that prevents the same 
          case from being tried twice. "Once decided, it stays decided."
        </p>
        <div>
          <p className="font-medium text-warm-text">For it to apply:</p>
          <ul className="list-disc pl-4 space-y-1 mt-1">
            <li>A court must have made a final judgment</li>
            <li>The same parties must be involved</li>
            <li>The same claim or cause of action must be at issue</li>
          </ul>
        </div>
        <p>
          This protects defendants from being repeatedly sued for the same thing.
        </p>
      </div>
    ),
  },

  accordAndSatisfaction: {
    title: "What is Accord and Satisfaction?",
    content: (
      <div className="space-y-3">
        <p>
          <strong>Accord and satisfaction</strong> is when parties agree to settle 
          a dispute by doing something different than what was originally promised.
        </p>
        <div>
          <p className="font-medium text-warm-text">How it works:</p>
          <ul className="list-disc pl-4 space-y-1 mt-1">
            <li><strong>Accord:</strong> The agreement to accept something different</li>
            <li><strong>Satisfaction:</strong> The actual performance of that agreement</li>
          </ul>
        </div>
        <p className="bg-calm-amber/10 p-2 rounded">
          Example: Creditor agrees to accept $500 to settle a $1,000 debt - accord and satisfaction.
        </p>
      </div>
    ),
  },

  mitigation: {
    title: "Duty to Mitigate",
    content: (
      <div className="space-y-3">
        <p>
          The <strong>duty to mitigate</strong> means you must take reasonable steps 
          to reduce your damages after an injury. You can't make things worse on purpose.
        </p>
        <div>
          <p className="font-medium text-warm-text">What it means in practice:</p>
          <ul className="list-disc pl-4 space-y-1 mt-1">
            <li>Get medical treatment after an injury</li>
            <li>Find a new job if wrongfully terminated</li>
            <li>Repair property damage promptly</li>
            <li>Don't incur unnecessary expenses</li>
          </ul>
        </div>
        <p>
          If you fail to mitigate, the court may reduce your damages award.
        </p>
      </div>
    ),
  },
}

interface InlineEducationProps {
  topic: keyof typeof COMMON_EDUCATION
  variant?: EducationCardProps['variant']
  className?: string
}

export function InlineEducation({ topic, variant = 'confused', className }: InlineEducationProps) {
  const education = COMMON_EDUCATION[topic]
  if (!education) return null

  return (
    <EducationCard topic={topic} variant={variant} collapsible className={className}>
      {education.content}
    </EducationCard>
  )
}
