import type { SupabaseClient } from '@supabase/supabase-js'
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions'

export interface CheckpointData {
  messages: ChatCompletionMessageParam[]
  toolCallCount: number
}

export async function loadCheckpoint(
  supabase: SupabaseClient,
  caseId: string,
  userId: string
): Promise<CheckpointData | null> {
  const { data, error } = await supabase
    .from('agent_threads')
    .select('checkpoint')
    .eq('case_id', caseId)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw new Error(`Failed to load agent checkpoint: ${error.message}`)

  return (data?.checkpoint as CheckpointData) ?? null
}

export async function saveCheckpoint(
  supabase: SupabaseClient,
  caseId: string,
  userId: string,
  checkpoint: CheckpointData
): Promise<void> {
  const { error } = await supabase.from('agent_threads').upsert(
    {
      case_id: caseId,
      user_id: userId,
      thread_id: `${caseId}:${userId}`,
      checkpoint,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'case_id,user_id' }
  )

  if (error) throw new Error(`Failed to save agent checkpoint: ${error.message}`)
}
