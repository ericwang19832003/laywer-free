import { test, expect } from '@playwright/test'

test.describe('Pricing Page', () => {
  test('displays all three pricing tiers', async ({ page }) => {
    await page.goto('/pricing')
    await expect(page.getByText('Your first case is free. Seriously.')).toBeVisible()
    await expect(page.getByText('Free')).toBeVisible()
    await expect(page.getByText('Essentials')).toBeVisible()
    await expect(page.getByText('Pro')).toBeVisible()
  })

  test('shows correct prices', async ({ page }) => {
    await page.goto('/pricing')
    await expect(page.getByText('$0')).toBeVisible()
    await expect(page.getByText('$19')).toBeVisible()
    await expect(page.getByText('$39')).toBeVisible()
    await expect(page.getByText('$149')).toBeVisible() // one-time option
  })

  test('FAQ accordion opens and closes', async ({ page }) => {
    await page.goto('/pricing')
    // Find first FAQ question
    const firstFaq = page.locator('details').first()
    await firstFaq.click()
    // Content should be visible after opening
    await expect(firstFaq.locator('p')).toBeVisible()
    // Click again to close
    await firstFaq.click()
  })

  test('Start Free CTA links to signup', async ({ page }) => {
    await page.goto('/pricing')
    const startFreeLink = page.getByRole('link', { name: /start free/i }).first()
    await expect(startFreeLink).toHaveAttribute('href', '/signup')
  })

  test('Essentials CTA includes plan parameter', async ({ page }) => {
    await page.goto('/pricing')
    const essentialsLink = page.getByRole('link', { name: /get essentials/i })
    await expect(essentialsLink).toHaveAttribute('href', '/signup?plan=essentials')
  })

  test('Pro CTA includes plan parameter', async ({ page }) => {
    await page.goto('/pricing')
    const proLink = page.getByRole('link', { name: /get pro/i })
    await expect(proLink).toHaveAttribute('href', '/signup?plan=pro')
  })

  test('always-free section lists safety features', async ({ page }) => {
    await page.goto('/pricing')
    await expect(
      page.getByText('These features are always free — no matter what.')
    ).toBeVisible()
    await expect(page.getByText('Deadline tracking')).toBeVisible()
    await expect(page.getByText('Court directory & fee info')).toBeVisible()
    await expect(page.getByText('Citation verification')).toBeVisible()
  })

  test('bottom CTA links to signup', async ({ page }) => {
    await page.goto('/pricing')
    await expect(page.getByText('Ready to take control of your case?')).toBeVisible()
    const bottomCta = page.getByRole('link', { name: /start free — no credit card/i })
    await expect(bottomCta).toHaveAttribute('href', '/signup')
  })

  test('page is responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/pricing')
    await expect(page.getByText('Your first case is free. Seriously.')).toBeVisible()
    // Cards should still render with prices visible
    await expect(page.getByText('$0')).toBeVisible()
    await expect(page.getByText('$19')).toBeVisible()
    await expect(page.getByText('$39')).toBeVisible()
  })
})
