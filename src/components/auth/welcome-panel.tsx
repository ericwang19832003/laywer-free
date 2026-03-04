import { ClipboardList, Calendar, FileText } from 'lucide-react'

const BENEFITS = [
  { icon: ClipboardList, text: 'Step-by-step case management' },
  { icon: Calendar, text: 'Know your deadlines and next moves' },
  { icon: FileText, text: 'AI-drafted legal documents' },
]

export function WelcomePanel() {
  return (
    <div className="flex flex-col justify-center h-full px-8 lg:px-16 py-12">
      <h1
        className="text-3xl lg:text-4xl font-bold leading-tight mb-2"
        style={{ color: '#1C1917' }}
      >
        Lawyer Free
      </h1>
      <p
        className="text-lg lg:text-xl mb-10 leading-relaxed"
        style={{ color: '#78716C' }}
      >
        Organize your legal situation with calm, structured guidance.
      </p>

      <div className="space-y-5">
        {BENEFITS.map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center gap-4">
            <div
              className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0"
              style={{ backgroundColor: '#F0EFFD' }}
            >
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm lg:text-base" style={{ color: '#1C1917' }}>
              {text}
            </span>
          </div>
        ))}
      </div>

      <p
        className="mt-12 text-sm"
        style={{ color: '#A8A29E' }}
      >
        Free to use. No lawyers required.
      </p>
    </div>
  )
}
