/**
 * RLS Isolation Test
 *
 * Prerequisites:
 * 1. Run `supabase start` to start local Supabase
 * 2. Set SUPABASE_SERVICE_ROLE_KEY in .env.local
 * 3. Run `npm run test:rls` to execute
 *
 * This test creates two users, creates cases for each,
 * and verifies that neither can access the other's data.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Create admin client for setup/teardown
const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

describe('RLS Isolation', () => {
  let userAId: string
  let userBId: string
  let userAClient: ReturnType<typeof createClient>
  let userBClient: ReturnType<typeof createClient>
  let userACaseId: string

  beforeAll(async () => {
    // Create test users via admin API
    const { data: userA } = await adminClient.auth.admin.createUser({
      email: 'testa@test.com',
      password: 'testpassword123',
      email_confirm: true,
    })
    const { data: userB } = await adminClient.auth.admin.createUser({
      email: 'testb@test.com',
      password: 'testpassword123',
      email_confirm: true,
    })
    userAId = userA.user!.id
    userBId = userB.user!.id

    // Sign in as each user to get their clients
    // (Use anon key + signInWithPassword)
    const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

    userAClient = createClient(SUPABASE_URL, ANON_KEY)
    await userAClient.auth.signInWithPassword({
      email: 'testa@test.com',
      password: 'testpassword123',
    })

    userBClient = createClient(SUPABASE_URL, ANON_KEY)
    await userBClient.auth.signInWithPassword({
      email: 'testb@test.com',
      password: 'testpassword123',
    })
  })

  afterAll(async () => {
    // Cleanup test users
    if (userAId) await adminClient.auth.admin.deleteUser(userAId)
    if (userBId) await adminClient.auth.admin.deleteUser(userBId)
  })

  it('User A can create a case', async () => {
    const { data, error } = await userAClient
      .from('cases')
      .insert({ user_id: userAId, role: 'plaintiff', county: 'Travis' })
      .select()
      .single()

    expect(error).toBeNull()
    expect(data).toBeTruthy()
    userACaseId = data!.id
  })

  it('Trigger auto-creates tasks for User A case', async () => {
    const { data } = await userAClient
      .from('tasks')
      .select()
      .eq('case_id', userACaseId)

    expect(data).toHaveLength(4)
  })

  it('User B cannot see User A cases', async () => {
    const { data } = await userBClient
      .from('cases')
      .select()

    expect(data).toHaveLength(0)
  })

  it('User B cannot see User A tasks', async () => {
    const { data } = await userBClient
      .from('tasks')
      .select()
      .eq('case_id', userACaseId)

    expect(data).toHaveLength(0)
  })

  it('User B cannot see User A events', async () => {
    const { data } = await userBClient
      .from('task_events')
      .select()
      .eq('case_id', userACaseId)

    expect(data).toHaveLength(0)
  })
})
