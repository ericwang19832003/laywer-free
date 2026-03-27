import { test, expect } from '@playwright/test'

const TEST_EMAIL = 'e2e-test@example.com'
const TEST_PASSWORD = 'TestPassword123!'

test.describe('Login', () => {
  test('successful login redirects to /cases', async ({ page }) => {
    await page.goto('/?mode=login')

    await page.getByLabel('Email').fill(TEST_EMAIL)
    await page.getByLabel('Password').fill(TEST_PASSWORD)
    await page.locator('form').getByRole('button', { name: 'Sign In' }).click()

    await expect(page).toHaveURL(/\/cases/, { timeout: 10000 })
    await expect(page.getByRole('heading', { name: 'Cases' })).toBeVisible()
  })

  test('bad credentials show error message', async ({ page }) => {
    await page.goto('/?mode=login')

    await page.getByLabel('Email').fill('nobody@example.com')
    await page.getByLabel('Password').fill('wrongpassword')
    await page.locator('form').getByRole('button', { name: 'Sign In' }).click()

    // Friendly error: "That email/password combination didn't work."
    await expect(
      page.getByText(/didn.t work|invalid|incorrect/i)
    ).toBeVisible({ timeout: 5000 })
    await expect(page).not.toHaveURL(/\/cases/)
  })

  test('unauthenticated user visiting /cases is redirected', async ({ page }) => {
    await page.goto('/cases')

    // The middleware should redirect unauthenticated users
    // Could redirect to / or /login or /?mode=login
    await page.waitForTimeout(3000)
    const url = page.url()
    const isOnAuthPage = /^\/$/.test(new URL(url).pathname) ||
      url.includes('/login') ||
      url.includes('mode=login')
    const isOnCases = url.includes('/cases')

    // Either redirected to auth or middleware blocks access
    expect(isOnAuthPage || !isOnCases).toBeTruthy()
  })
})
