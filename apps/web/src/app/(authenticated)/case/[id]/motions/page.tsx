import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SupportiveHeader } from '@/components/layout/supportive-header'
import { LegalDisclaimer } from '@/components/layout/legal-disclaimer'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  MOTION_CONFIGS,
  MOTION_CONFIGS_BY_CATEGORY,
} from '@lawyer-free/shared/motions/registry'

export default async function MotionsHubPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch case data
  const { data: caseRow } = await supabase
    .from('cases')
    .select('court_type, county, role')
    .eq('id', id)
    .single()

  // Fetch existing motions for this case
  const { data: motions } = await supabase
    .from('motions')
    .select('id, motion_type, status, created_at')
    .eq('case_id', id)
    .order('created_at', { ascending: false })

  // Fetch gatekeeper tasks that are 'todo' — these motions get a "Suggested" badge
  const { data: suggestedTasks } = await supabase
    .from('tasks')
    .select('task_key')
    .eq('case_id', id)
    .eq('status', 'todo')
    .in('task_key', [
      'motion_to_compel',
      'trial_prep_checklist',
      'appellate_brief',
      'motion_continuance',
      'mtd_response',
      'settlement_demand',
      'motion_summary_judgment',
    ])

  const suggestedTaskKeys = new Set(
    (suggestedTasks ?? []).map((t) => t.task_key)
  )

  const safeMotions = motions ?? []

  const categories = [
    { key: 'discovery' as const, label: 'Discovery' },
    { key: 'pretrial' as const, label: 'Pretrial' },
    { key: 'post_trial' as const, label: 'Post-Trial' },
  ]

  // Suppress unused variable warning — caseRow is available for future filtering
  void caseRow

  return (
    <div className="min-h-screen bg-warm-bg">
      <main className="mx-auto max-w-2xl px-4 py-10">
        <Link
          href={`/case/${id}`}
          className="text-sm text-warm-muted hover:text-warm-text mb-6 inline-block"
        >
          &larr; Back to dashboard
        </Link>

        <SupportiveHeader
          title="Motions Hub"
          subtitle="Create and manage your motions and legal filings."
        />

        <div className="space-y-8 mt-6">
          {categories.map(({ key, label }) => {
            const configs = MOTION_CONFIGS_BY_CATEGORY[key]
            if (!configs || configs.length === 0) return null

            return (
              <section key={key}>
                <h3 className="text-xs font-semibold text-warm-muted uppercase tracking-wider mb-3">
                  {label}
                </h3>
                <div className="space-y-3">
                  {configs.map((config) => (
                    <Card key={config.key}>
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-medium text-warm-text">
                              {config.title}
                            </h4>
                            {config.taskKey && suggestedTaskKeys.has(config.taskKey) && (
                              <span className="text-xs bg-calm-indigo/10 text-calm-indigo px-2 py-0.5 rounded-full">
                                Suggested
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-warm-muted mt-0.5">
                            {config.description}
                          </p>
                        </div>
                        <Button size="sm" asChild>
                          <Link href={`/case/${id}/motions/${config.key}`}>
                            Create
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )
          })}

          {safeMotions.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold text-warm-muted uppercase tracking-wider mb-3">
                Your Motions
              </h3>
              <div className="space-y-3">
                {safeMotions.map((m) => (
                  <Card key={m.id}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-warm-text">
                          {MOTION_CONFIGS[m.motion_type]?.title ??
                            m.motion_type}
                        </h4>
                        <p className="text-xs text-warm-muted">
                          {m.status} &middot;{' '}
                          {new Date(m.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link
                          href={`/case/${id}/motions/${m.motion_type}?motionId=${m.id}`}
                        >
                          {m.status === 'draft' ? 'Continue' : 'View'}
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>

        <LegalDisclaimer />
      </main>
    </div>
  )
}
