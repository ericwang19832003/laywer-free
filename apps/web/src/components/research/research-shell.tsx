import { ResearchSidebar } from '@/components/research/research-sidebar'
import { SupportiveHeader } from '@/components/layout/supportive-header'

interface ResearchShellProps {
  caseId: string
  caseLabel: string
  authorityCount: number
  subtitle?: string
  children: React.ReactNode
}

export function ResearchShell({ caseId, caseLabel, authorityCount, subtitle, children }: ResearchShellProps) {
  return (
    <div className="min-h-screen bg-warm-bg">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <SupportiveHeader
          title="Research"
          subtitle={subtitle ?? 'Build your authority library and ask questions with citations.'}
        />

        <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
          <ResearchSidebar
            caseId={caseId}
            caseLabel={caseLabel}
            authorityCount={authorityCount}
          />

          <main className="rounded-2xl border border-warm-border bg-white/90 p-6 shadow-sm">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
