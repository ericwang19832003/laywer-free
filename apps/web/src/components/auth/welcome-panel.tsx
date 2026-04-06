import { ClipboardList, Calendar, FileText } from 'lucide-react'

const BENEFITS = [
  { icon: ClipboardList, text: 'AI-drafted legal documents in minutes' },
  { icon: Calendar, text: 'Automatic deadline tracking based on your court rules' },
  { icon: FileText, text: 'Step-by-step guidance from intake to resolution' },
]

export function WelcomePanel() {
  return (
    <div className="flex flex-col justify-center h-full px-8 lg:px-16 py-12">
      <h1
        className="text-3xl lg:text-4xl font-bold leading-tight mb-2 text-warm-text"
      >
        Facing a legal matter without a lawyer?
      </h1>
      <p
        className="text-lg lg:text-xl mb-10 leading-relaxed text-warm-muted"
      >
        Lawyer Free guides you step-by-step through filing, deadlines, evidence,
        and legal documents — so you can handle your case with confidence.
      </p>

      <div className="space-y-5">
        {BENEFITS.map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center gap-4">
            <div
              className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0 bg-primary/10"
            >
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm lg:text-base text-warm-text">
              {text}
            </span>
          </div>
        ))}
      </div>

      <p
        className="mt-12 text-sm text-stone-400"
      >
        Free to start. No lawyers required. Your data stays private.
      </p>
    </div>
  )
}
