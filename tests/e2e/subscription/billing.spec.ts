import { test, expect } from '../fixtures/test-fixtures'

test.describe('Billing Settings', () => {
  test.beforeEach(async ({ page }) => {
    // Mock referral API to prevent loading state from blocking assertions
    await page.route('**/api/referrals', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          referralCode: 'TEST123',
          referralUrl: 'https://lawyerfree.com/r/TEST123',
          stats: { totalReferred: 0, signedUp: 0, converted: 0, credited: 0 },
        }),
      })
    )

    // Mock Gmail status
    await page.route('**/api/gmail/status', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ connected: false, email: null, configured: false }),
      })
    )

    await page.goto('/settings')

    // Billing section is below the fold — scroll to it
    // Wait for billing section to render (client component fetches data)
    await expect(page.getByText('Billing & Subscription')).toBeVisible({ timeout: 15000 })
    await page.locator('#billing').scrollIntoViewIfNeeded()
  })

  test('shows Billing & Subscription section', async ({ page }) => {
    await expect(page.getByText('Billing & Subscription')).toBeVisible()
  })

  test('shows current plan as Free', async ({ page }) => {
    await expect(page.getByText('Current Plan')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('#billing').getByText('Free')).toBeVisible()
  })

  test('shows AI usage meter', async ({ page }) => {
    const billing = page.locator('#billing')
    await expect(billing.getByText('AI Generations')).toBeVisible({ timeout: 10000 })
    await expect(billing.getByText(/\d+ left/)).toBeVisible()
  })

  test('shows Active Cases count', async ({ page }) => {
    const billing = page.locator('#billing')
    await expect(billing.getByText('Active Cases')).toBeVisible({ timeout: 10000 })
    await expect(billing.getByText(/\d+ remaining/)).toBeVisible()
  })

  test('shows upgrade buttons for free tier', async ({ page }) => {
    await expect(page.getByText('Billing & Subscription')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Upgrade to Essentials')).toBeVisible()
    await expect(page.getByText('$19/mo')).toBeVisible()
    await expect(page.getByText('Upgrade to Pro')).toBeVisible()
    await expect(page.getByText('$39/mo')).toBeVisible()
  })

  test('referral section shows referral link', async ({ page }) => {
    // Scroll further down to referral section
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await expect(page.getByText('Referral Program')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Your referral link')).toBeVisible()
    await expect(page.getByText('https://lawyerfree.com/r/TEST123')).toBeVisible()
  })

  test('referral section shows Copy Link button', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await expect(page.getByText('Referral Program')).toBeVisible({ timeout: 10000 })
    await expect(page.getByRole('button', { name: /Copy Link/i })).toBeVisible()
  })

  test('referral section shows Share via Email button', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await expect(page.getByText('Referral Program')).toBeVisible({ timeout: 10000 })
    await expect(page.getByRole('button', { name: /Share via Email/i })).toBeVisible()
  })

  test('referral section explains how it works', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await expect(page.getByText('Referral Program')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('How it works')).toBeVisible()
    await expect(page.getByText(/Share your link with a friend/)).toBeVisible()
  })
})
