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
    // Create a case via the API (storageState provides auth cookies)
    const response = await page.request.post('/api/cases', {
      data: {
        role: 'plaintiff',
        state: 'TX',
        court_type: 'jp',
        dispute_type: 'small_claims',
      },
    })

    expect(response.ok()).toBeTruthy()
    const body = await response.json()
    const caseId = body.case.id

    await use({ id: caseId, url: `/case/${caseId}` })

    // Teardown: delete via admin client
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
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
