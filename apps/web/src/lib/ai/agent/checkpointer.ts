import type { SupabaseClient } from '@supabase/supabase-js'
import type { BaseMessage } from '@langchain/core/messages'

export interface CheckpointData {
  messages: BaseMessage[]
  toolCallCount: number
}

export async function loadCheckpoint(
  supabase: SupabaseClient,
  caseId: string,
  userId: string
): Promise<CheckpointData | null> {
  const { data } = await supabase
    .from('agent_threads')
    .select('checkpoint')
    .eq('case_id', caseId)
    .eq('user_id', userId)
    .maybeSingle()

  return (data?.checkpoint as CheckpointData) ?? null
}

export async function saveCheckpoint(
  supabase: SupabaseClient,
  caseId: string,
  userId: string,
  checkpoint: CheckpointData
): Promise<void> {
  await supabase.from('agent_threads').upsert(
    {
      case_id: caseId,
      user_id: userId,
      thread_id: `${caseId}:${userId}`,
      checkpoint,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'case_id,user_id' }
  )
}
