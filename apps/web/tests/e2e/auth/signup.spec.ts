import { test, expect } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../../../.env.local') })

test.describe('Signup', () => {
  const signupEmail = `e2e-signup-${Date.now()}@example.com`
  const signupPassword = 'NewUserPass123!'

  test.afterAll(async () => {
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { data: users } = await admin.auth.admin.listUsers()
    const user = users?.users?.find((u) => u.email === signupEmail)
    if (user) {
      await admin.from('cases').delete().eq('user_id', user.id)
      await admin.auth.admin.deleteUser(user.id)
    }
  })

  test('create account redirects to /cases', async ({ page }) => {
    await page.goto('/?mode=signup')

    // Signup form fields have id="signup-email" and id="signup-password"
    await page.locator('#signup-email').fill(signupEmail)
    await page.locator('#signup-password').fill(signupPassword)
    await page.locator('form').getByRole('button', { name: 'Create Account' }).click()

    // With confirmations disabled, should redirect to /cases
    await expect(page).toHaveURL(/\/cases/, { timeout: 15000 })
  })

  test('duplicate email shows error', async ({ page }) => {
    await page.goto('/?mode=signup')

    await page.locator('#signup-email').fill('e2e-test@example.com')
    await page.locator('#signup-password').fill('SomePassword123!')
    await page.locator('form').getByRole('button', { name: 'Create Account' }).click()

    // Should show friendly error: "An account with this email already exists."
    await expect(
      page.getByText(/already exists|already registered|try signing in/i)
    ).toBeVisible({ timeout: 5000 })
  })
})
