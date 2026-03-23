import { test as base, expect } from '@playwright/test'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { mockAIRoutes } from './ai-mocks'

dotenv.config({ path: path.resolve(__dirname, '../../../.env.local') })

export const TEST_EMAIL = 'e2e-test@example.com'
export const TEST_PASSWORD = 'TestPassword123!'

type TestCase = {
  id: string
  url: string
}

type TestFixtures = {
  testCase: TestCase
  withAIMocks: void
  adminClient: SupabaseClient
}

export const test = base.extend<TestFixtures>({
  /**
   * Creates a test case via the real API and cleans it up after the test.
   */
  testCase: async ({ page }, use) => {
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Look up the test user
    const { data: users } = await admin.auth.admin.listUsers()
    const testUser = users?.users?.find((u) => u.email === TEST_EMAIL)
    if (!testUser) throw new Error('Test user not found')

    // Create the case directly via admin client to bypass subscription gate.
    // The seed_case_tasks trigger will auto-create tasks.
    const { data: newCase, error: insertError } = await admin
      .from('cases')
      .insert({
        user_id: testUser.id,
        role: 'plaintiff',
        jurisdiction: 'TX',
        court_type: 'jp',
        dispute_type: 'small_claims',
        status: 'active',
      })
      .select('id')
      .single()

    if (insertError || !newCase) {
      throw new Error(`Failed to create test case: ${insertError?.message}`)
    }

    const caseId = newCase.id

    await use({ id: caseId, url: `/case/${caseId}` })

    // Teardown: delete via admin client
    await admin.from('cases').delete().eq('id', caseId)
  },

  /**
   * Sets up AI route mocks before each test.
   */
  withAIMocks: [
    async ({ page }, use) => {
      await mockAIRoutes(page)
      await use()
    },
    { auto: false },
  ],

  /**
   * Provides a Supabase admin client for direct DB operations.
   */
  adminClient: async ({}, use) => {
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    await use(admin)
  },
})

export { expect }
