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

    // Seed trigger creates multiple tasks; exact count may grow with migrations
    expect(data!.length).toBeGreaterThanOrEqual(4)
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

  // =============================================
  // Discovery Pack RLS tests
  // =============================================

  let userAPackId: string

  it('User A can create a discovery pack', async () => {
    const { data, error } = await userAClient
      .from('discovery_packs')
      .insert({
        case_id: userACaseId,
        title: 'First Set of Interrogatories',
        created_by: userAId,
      })
      .select()
      .single()

    expect(error).toBeNull()
    expect(data).toBeTruthy()
    expect(data!.status).toBe('draft')
    userAPackId = data!.id
  })

  it('User A can insert discovery items', async () => {
    const { data, error } = await userAClient
      .from('discovery_items')
      .insert([
        { pack_id: userAPackId, item_type: 'rog', item_no: 1, prompt_text: 'State your full name.' },
        { pack_id: userAPackId, item_type: 'rfp', item_no: 1, prompt_text: 'Produce all contracts.' },
        { pack_id: userAPackId, item_type: 'rfa', item_no: 1, prompt_text: 'Admit you received notice.' },
      ])
      .select()

    expect(error).toBeNull()
    expect(data).toHaveLength(3)
  })

  it('User A can select own discovery items', async () => {
    const { data, error } = await userAClient
      .from('discovery_items')
      .select()
      .eq('pack_id', userAPackId)
      .order('item_type')

    expect(error).toBeNull()
    expect(data).toHaveLength(3)
    expect(data!.map(d => d.item_type).sort()).toEqual(['rfa', 'rfp', 'rog'])
  })

  it('User A can insert a service log', async () => {
    const { data, error } = await userAClient
      .from('discovery_service_logs')
      .insert({
        pack_id: userAPackId,
        served_at: new Date().toISOString(),
        service_method: 'email',
        served_to_name: 'Opposing Counsel',
        served_to_email: 'opposing@example.com',
      })
      .select()
      .single()

    expect(error).toBeNull()
    expect(data).toBeTruthy()
  })

  it('User A can insert a discovery response', async () => {
    const { data, error } = await userAClient
      .from('discovery_responses')
      .insert({
        pack_id: userAPackId,
        received_at: new Date().toISOString(),
        response_type: 'answer',
        storage_path: 'cases/test/discovery/resp1.pdf',
        file_name: 'responses.pdf',
        mime_type: 'application/pdf',
        sha256: 'abc123',
      })
      .select()
      .single()

    expect(error).toBeNull()
    expect(data).toBeTruthy()
  })

  it('User B cannot see User A discovery packs', async () => {
    const { data } = await userBClient
      .from('discovery_packs')
      .select()

    expect(data).toHaveLength(0)
  })

  it('User B cannot see User A discovery items', async () => {
    const { data } = await userBClient
      .from('discovery_items')
      .select()
      .eq('pack_id', userAPackId)

    expect(data).toHaveLength(0)
  })

  it('User B cannot see User A discovery service logs', async () => {
    const { data } = await userBClient
      .from('discovery_service_logs')
      .select()
      .eq('pack_id', userAPackId)

    expect(data).toHaveLength(0)
  })

  it('User B cannot see User A discovery responses', async () => {
    const { data } = await userBClient
      .from('discovery_responses')
      .select()
      .eq('pack_id', userAPackId)

    expect(data).toHaveLength(0)
  })

  it('User B cannot insert into User A discovery pack', async () => {
    const { data, error } = await userBClient
      .from('discovery_items')
      .insert({
        pack_id: userAPackId,
        item_type: 'rog',
        item_no: 99,
        prompt_text: 'Malicious insert',
      })
      .select()

    // RLS blocks the insert — either error or empty result
    expect(data?.length ?? 0).toBe(0)
  })

  it('Unique constraint prevents duplicate item_no per type', async () => {
    const { error } = await userAClient
      .from('discovery_items')
      .insert({
        pack_id: userAPackId,
        item_type: 'rog',
        item_no: 1, // duplicate
        prompt_text: 'Duplicate attempt',
      })

    expect(error).toBeTruthy()
    expect(error!.code).toBe('23505') // unique_violation
  })

  // =============================================
  // Trial Binder RLS tests
  // =============================================

  let userABinderId: string

  it('User A can create a trial binder', async () => {
    const { data, error } = await userAClient
      .from('trial_binders')
      .insert({
        case_id: userACaseId,
        created_by: userAId,
      })
      .select()
      .single()

    expect(error).toBeNull()
    expect(data).toBeTruthy()
    expect(data!.status).toBe('queued')
    expect(data!.title).toBe('Trial Binder')
    userABinderId = data!.id
  })

  it('User A can read own trial binders', async () => {
    const { data, error } = await userAClient
      .from('trial_binders')
      .select()
      .eq('case_id', userACaseId)

    expect(error).toBeNull()
    expect(data).toHaveLength(1)
    expect(data![0].id).toBe(userABinderId)
  })

  it('User B cannot see User A trial binders', async () => {
    const { data } = await userBClient
      .from('trial_binders')
      .select()

    expect(data).toHaveLength(0)
  })

  it('User B cannot insert into User A case trial binders', async () => {
    const { data, error } = await userBClient
      .from('trial_binders')
      .insert({
        case_id: userACaseId,
        created_by: userBId,
      })
      .select()

    // RLS blocks the insert — either error or empty result
    expect(data?.length ?? 0).toBe(0)
  })

  it('User A can delete own trial binder', async () => {
    const { error } = await userAClient
      .from('trial_binders')
      .delete()
      .eq('id', userABinderId)

    expect(error).toBeNull()

    // Verify deleted
    const { data } = await userAClient
      .from('trial_binders')
      .select()
      .eq('id', userABinderId)

    expect(data).toHaveLength(0)
  })
})
