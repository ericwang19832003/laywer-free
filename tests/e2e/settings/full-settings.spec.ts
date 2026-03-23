import { test, expect } from '../fixtures/test-fixtures'

test.describe('Settings Page - All Sections', () => {
  test('billing section shows plan and usage', async ({ page }) => {
    await page.goto('/settings')
    // Billing section is below the fold — scroll to it
    const billing = page.locator('#billing')
    await billing.scrollIntoViewIfNeeded()
    await expect(page.getByText(/billing.*subscription/i)).toBeVisible()
    await expect(page.getByText(/current plan/i)).toBeVisible()
    await expect(page.getByText(/ai generations/i)).toBeVisible()
    await expect(page.getByText(/active cases/i)).toBeVisible()
  })

  test('billing section shows upgrade buttons', async ({ page }) => {
    await page.goto('/settings')
    const billing = page.locator('#billing')
    await billing.scrollIntoViewIfNeeded()
    await expect(page.getByText(/upgrade to essentials/i)).toBeVisible()
    await expect(page.getByText(/upgrade to pro/i)).toBeVisible()
    await expect(page.getByText(/\$19\/mo/)).toBeVisible()
    await expect(page.getByText(/\$39\/mo/)).toBeVisible()
  })

  test('referral section is visible', async ({ page }) => {
    await page.goto('/settings')
    // Referral is below billing — scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await expect(page.getByText(/referral/i)).toBeVisible()
    await expect(page.getByText(/how it works/i)).toBeVisible()
  })

  test('notification preferences section exists', async ({ page }) => {
    await page.goto('/settings')
    // Notification Preferences may be below the fold
    const heading = page.getByText(/notification preferences/i)
    await heading.scrollIntoViewIfNeeded()
    await expect(heading).toBeVisible()
  })
})
