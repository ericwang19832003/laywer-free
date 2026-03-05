import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AuthorityWorkspace } from '@/components/research/authority-workspace'

export default async function ResearchAuthoritiesPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: caseData } = await supabase
    .from('cases')
    .select('id')
    .eq('id', id)
    .single()

  if (!caseData) redirect('/cases')

  const { data: rawAuthorities } = await supabase
    .from('case_authorities')
    .select(`
      id,
      cluster_id,
      status,
      pinned,
      folder_id,
      tags,
      added_at,
      cl_case_clusters (
        case_name,
        court_id,
        court_name,
        date_filed,
        citations,
        snippet
      ),
      authority_folders (
        id,
        name
      )
    `)
    .eq('case_id', id)
    .order('added_at', { ascending: false })

  const authorities = (rawAuthorities ?? []).map((a) => ({
    ...a,
    cl_case_clusters: Array.isArray(a.cl_case_clusters)
      ? a.cl_case_clusters[0] ?? null
      : a.cl_case_clusters,
    authority_folders: Array.isArray(a.authority_folders)
      ? a.authority_folders[0] ?? null
      : a.authority_folders,
  }))

  const { data: folders } = await supabase
    .from('authority_folders')
    .select('id, name, created_at')
    .eq('case_id', id)
    .order('created_at', { ascending: true })

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-warm-text">Authorities</h2>
        <p className="text-sm text-warm-muted mt-1">
          Manage saved cases and keep your research library organized.
        </p>
      </div>

      <AuthorityWorkspace
        caseId={id}
        initialAuthorities={authorities ?? []}
        initialFolders={(folders ?? []).map((f) => ({ id: f.id as string, name: f.name as string }))}
      />
    </div>
  )
}
