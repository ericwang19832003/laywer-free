import { test, expect } from '@playwright/test'

test.describe('Dashboard Flow', () => {
  const testEmail = `test-${Date.now()}@example.com`
  const testPassword = 'testpassword123'

  test('full case lifecycle: signup -> create case -> welcome -> intake -> deadline', async ({
    page,
  }) => {
    // 1. Sign up
    await page.goto('/signup')
    await page.fill('input[type="email"]', testEmail)
    await page.fill('input[type="password"]', testPassword)
    await page.click('button[type="submit"]')

    // 2. Should be on /cases
    await expect(page).toHaveURL(/\/cases/)
    await expect(page.locator('text=Your Cases')).toBeVisible()

    // 3. Create a new case
    await page.click('text=Start a New Case')
    await page.click('text=Plaintiff') // Select role
    await page.fill('input[placeholder*="County"]', 'Travis')
    await page.click('text=Get Started')

    // 4. Should be on dashboard
    await expect(page).toHaveURL(/\/case\//)
    await expect(page.locator('text=One step at a time')).toBeVisible()

    // 5. Complete Welcome step
    await page.click('text=Review & Continue')
    await expect(page.locator('text=Welcome')).toBeVisible()
    await page.click("text=I'm ready")

    // 6. Back on dashboard, intake is next
    await expect(page).toHaveURL(/\/case\//)
    await expect(page.locator('text=Tell Us About Your Case')).toBeVisible()

    // 7. Complete Intake
    await page.click('text=Review & Continue')
    await page.fill('input[placeholder*="county"]', 'Travis')
    // Select court type
    // ... fill narrative
    await page.click('text=Review')
    await page.click('text=Confirm & Continue')

    // 8. Back on dashboard
    await expect(page).toHaveURL(/\/case\//)

    // 9. Add a deadline
    await page.click('text=Add a deadline')
    // ... fill deadline form

    // 10. Verify timeline shows events
    await expect(page.locator('text=Recent Activity')).toBeVisible()
  })
})
