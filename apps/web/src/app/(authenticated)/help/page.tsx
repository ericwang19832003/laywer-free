import { SupportiveHeader } from '@/components/layout/supportive-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface FaqItem {
  q: string
  a: string
}

interface FaqSection {
  title: string
  items: FaqItem[]
}

const FAQ_SECTIONS: FaqSection[] = [
  {
    title: 'Getting Started',
    items: [
      {
        q: 'What is Lawyer Free?',
        a: 'Lawyer Free helps self-represented (pro se) litigants organize their legal cases with step-by-step guidance, document generation, and deadline tracking. It does not provide legal advice.',
      },
      {
        q: 'How do I create a case?',
        a: 'From the Cases page, click "Start a New Case" and fill in your basic case information including your county, your role (plaintiff or defendant), and the type of dispute.',
      },
      {
        q: 'Is this legal advice?',
        a: 'No. Lawyer Free provides legal information and document formatting assistance. It is not a substitute for a licensed attorney. Always consult a lawyer for legal advice about your specific situation.',
      },
    ],
  },
  {
    title: 'Tasks & Workflow',
    items: [
      {
        q: 'What are tasks?',
        a: 'Tasks are step-by-step actions that guide you through your case. They unlock sequentially \u2014 completing one task opens the next. Your dashboard shows your current task and progress.',
      },
      {
        q: 'Why are some tasks locked?',
        a: 'Tasks unlock based on your progress. Complete your current tasks to unlock new ones. The system ensures you handle things in the right order.',
      },
      {
        q: 'Can I go back to a completed task?',
        a: 'Yes. You can view completed tasks from your dashboard, but you cannot change their status back to incomplete.',
      },
    ],
  },
  {
    title: 'Documents & Filing',
    items: [
      {
        q: 'How do generated documents work?',
        a: 'You provide the facts of your case through a form, and the system generates a formatted draft document. You must review, edit, and finalize the document before filing it with the court.',
      },
      {
        q: 'How do I download a document?',
        a: 'After generating a document, use the "Download PDF" button to save it as a PDF file, or use the "Print" button to print directly from your browser.',
      },
      {
        q: 'Are generated documents ready to file?',
        a: 'No. All generated documents are drafts and starting points. You are responsible for reviewing, editing, and ensuring accuracy before filing with the court.',
      },
    ],
  },
  {
    title: 'Evidence & Discovery',
    items: [
      {
        q: 'What is the Evidence Vault?',
        a: 'The Evidence Vault is where you organize and categorize all evidence related to your case \u2014 documents, photos, communications, and other materials.',
      },
      {
        q: 'What is discovery?',
        a: 'Discovery is the legal process where both sides exchange information and evidence. The Discovery Starter Pack helps you create standard discovery requests.',
      },
    ],
  },
  {
    title: 'Motions',
    items: [
      {
        q: 'What motions can I create?',
        a: 'The Motions Hub offers several motion types including Motion to Compel, Motion for Summary Judgment, Settlement Demand Letter, Motion for Continuance, Response to Motion to Dismiss, Notice of Appeal, and Appellate Brief.',
      },
      {
        q: 'How do I choose the right motion?',
        a: 'Each motion type includes a description and reassurance text explaining when it applies. The system may also suggest specific motions based on your case status.',
      },
    ],
  },
  {
    title: 'Deadlines & Alerts',
    items: [
      {
        q: 'How are deadlines tracked?',
        a: 'Deadlines are automatically calculated based on your case events (like when you were served or when you filed). They appear on your dashboard with countdown timers.',
      },
      {
        q: 'What happens if I miss a deadline?',
        a: 'The system sends escalating alerts as deadlines approach and after they pass. Missing a legal deadline can have serious consequences \u2014 consult an attorney if you are at risk of missing one.',
      },
    ],
  },
]

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-warm-bg">
      <main className="mx-auto max-w-2xl px-4 py-10">
        <SupportiveHeader
          title="Help & FAQ"
          subtitle="Answers to common questions about using Lawyer Free."
        />

        <div className="space-y-4">
          {FAQ_SECTIONS.map((section) => (
            <Card key={section.title}>
              <CardHeader>
                <CardTitle className="text-base">{section.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-0">
                {section.items.map((item) => (
                  <details
                    key={item.q}
                    className="group border-b border-warm-border last:border-0"
                  >
                    <summary className="flex cursor-pointer items-center justify-between py-3 text-sm font-medium text-warm-text hover:text-primary transition-colors list-none">
                      {item.q}
                      <span className="ml-2 text-warm-muted group-open:rotate-180 transition-transform text-xs">
                        &#x25BC;
                      </span>
                    </summary>
                    <p className="pb-3 text-sm text-warm-muted leading-relaxed">
                      {item.a}
                    </p>
                  </details>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 rounded-lg border border-warm-border bg-white p-4 text-center">
          <p className="text-sm text-warm-muted">
            Need more help? Visit the{' '}
            <a
              href="https://www.txcourts.gov/programs-services/self-help/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              Texas Courts Self-Help Center
            </a>{' '}
            for additional resources.
          </p>
        </div>
      </main>
    </div>
  )
}
