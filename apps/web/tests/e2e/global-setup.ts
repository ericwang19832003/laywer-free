import { chromium, type FullConfig } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load env vars from .env.local
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') })

const TEST_EMAIL = 'e2e-test@example.com'
const TEST_PASSWORD = 'TestPassword123!'

async function globalSetup(config: FullConfig) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars for E2E tests'
    )
  }

  const admin = createClient(supabaseUrl, serviceRoleKey)

  // Clean up any existing test user
  const { data: existingUsers } = await admin.auth.admin.listUsers()
  const existing = existingUsers?.users?.find((u) => u.email === TEST_EMAIL)
  if (existing) {
    // Delete all cases owned by this user first
    await admin.from('cases').delete().eq('user_id', existing.id)
    await admin.auth.admin.deleteUser(existing.id)
  }

  // Create a fresh test user
  const { data: newUser, error: createError } = await admin.auth.admin.createUser({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    email_confirm: true,
  })

  if (createError || !newUser.user) {
    throw new Error(`Failed to create test user: ${createError?.message}`)
  }

  // Login via the browser to capture storageState
  const baseURL = config.projects[0]?.use?.baseURL || 'http://localhost:3000'
  const browser = await chromium.launch()
  const page = await browser.newPage()

  await page.goto(baseURL + '/?mode=login')

  await page.getByLabel('Email').fill(TEST_EMAIL)
  await page.getByLabel('Password').fill(TEST_PASSWORD)
  await page.locator('form').getByRole('button', { name: 'Sign In' }).click()

  // Wait for redirect to /cases
  await page.waitForURL('**/cases', { timeout: 15000 })

  // Save authenticated state
  await page.context().storageState({ path: 'tests/e2e/.auth/user.json' })

  await browser.close()
}

export default globalSetup
