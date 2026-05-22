import { createClient } from '@supabase/supabase-js'

export function getTestSupabase() {
  const url = process.env.SUPABASE_TEST_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_TEST_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  return createClient(url!, key!)
}

export interface SeededCase {
  caseId: string
  userId: string
  cleanup: () => Promise<void>
}

export async function seedTestCase(): Promise<SeededCase> {
  const supabase = getTestSupabase()

  const userId = crypto.randomUUID()
  const caseId = crypto.randomUUID()
  const now = new Date()

  // Insert case
  await supabase.from('cases').insert({
    id: caseId,
    user_id: userId,
    dispute_type: 'landlord_tenant',
    role: 'plaintiff',
    county: 'Travis',
    status: 'active',
    title: 'Test Landlord-Tenant Case',
  })

  // Insert deadlines — 2 overdue + 1 urgent + 1 upcoming
  await supabase.from('deadlines').insert([
    {
      case_id: caseId,
      key: 'serve_defendant',
      label: 'Serve defendant',
      due_at: new Date(now.getTime() - 3 * 86400000).toISOString(),
    },
    {
      case_id: caseId,
      key: 'file_answer',
      label: 'File answer with court',
      due_at: new Date(now.getTime() - 86400000).toISOString(),
    },
    {
      case_id: caseId,
      key: 'discovery_request',
      label: 'Send discovery requests',
      due_at: new Date(now.getTime() + 3 * 86400000).toISOString(),
    },
    {
      case_id: caseId,
      key: 'discovery_close',
      label: 'Close discovery',
      due_at: new Date(now.getTime() + 30 * 86400000).toISOString(),
    },
  ])

  // Insert evidence items
  await supabase.from('evidence_items').insert([
    { case_id: caseId, user_id: userId, name: 'Lease agreement.pdf', category: 'contract' },
    { case_id: caseId, user_id: userId, name: 'Move-in photos.zip', category: 'photos' },
    { case_id: caseId, user_id: userId, name: 'Text messages.pdf', category: 'communications' },
  ])

  // Insert tasks
  await supabase.from('tasks').insert([
    { case_id: caseId, task_key: 'pi_intake', title: 'Complete intake', status: 'completed' },
    { case_id: caseId, task_key: 'send_demand', title: 'Send demand letter', status: 'todo' },
    { case_id: caseId, task_key: 'file_complaint', title: 'File complaint', status: 'todo' },
    { case_id: caseId, task_key: 'discovery_starter_pack', title: 'Discovery starter pack', status: 'locked' },
    { case_id: caseId, task_key: 'hearing_prep', title: 'Prepare for hearing', status: 'locked' },
  ])

  const cleanup = async () => {
    await supabase.from('tasks').delete().eq('case_id', caseId)
    await supabase.from('evidence_items').delete().eq('case_id', caseId)
    await supabase.from('deadlines').delete().eq('case_id', caseId)
    await supabase.from('cases').delete().eq('id', caseId)
  }

  return { caseId, userId, cleanup }
}
