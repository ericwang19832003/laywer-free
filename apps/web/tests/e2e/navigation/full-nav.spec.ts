import { test, expect } from '../fixtures/test-fixtures'

test.describe('Full Navigation', () => {
  test('top nav has all main links', async ({ page }) => {
    await page.goto('/cases')
    // Check main nav items exist
    await expect(page.getByRole('link', { name: /lawyer free/i }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: /learn/i }).first()).toBeVisible()
  })

  test('cases page loads', async ({ page }) => {
    await page.goto('/cases')
    await expect(page).toHaveURL(/\/cases/)
  })

  test('settings page loads', async ({ page }) => {
    await page.goto('/settings')
    await expect(page.getByRole('heading', { name: /settings/i })).toBeVisible({ timeout: 10000 })
  })

  test('pricing page is accessible from any page', async ({ page }) => {
    await page.goto('/pricing')
    await expect(page.getByText(/your first case is free/i)).toBeVisible()
  })

  test('learn-more pages are accessible', async ({ page }) => {
    await page.goto('/learn-more/debt-collection')
    await expect(page).toHaveURL(/learn-more\/debt-collection/)

    await page.goto('/learn-more/eviction')
    await expect(page).toHaveURL(/learn-more\/eviction/)

    await page.goto('/learn-more/personal-injury')
    await expect(page).toHaveURL(/learn-more\/personal-injury/)
  })

  test('courts directory page loads', async ({ page }) => {
    await page.goto('/courts')
    await expect(page.getByText(/court directory/i)).toBeVisible()
  })
})
