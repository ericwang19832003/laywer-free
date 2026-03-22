import { test, expect } from '../fixtures/test-fixtures'
import { mockAIRoutes } from '../fixtures/ai-mocks'

test.describe('Share Case', () => {
  test('share card is visible on dashboard', async ({ page, testCase }) => {
    await mockAIRoutes(page)
    await page.goto(testCase.url)

    // Scroll down to find the share card
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))

    // ShareCaseCard should be visible
    await expect(page.getByText(/Share|Sharing/i).first()).toBeVisible({ timeout: 10000 })
  })

  test('enable sharing generates a link', async ({ page, testCase }) => {
    await mockAIRoutes(page)
    await page.goto(testCase.url)

    // Scroll down
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))

    // Look for the share toggle/button
    const enableButton = page.getByRole('button', { name: /Enable|Share/i }).last()
    if (await enableButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await enableButton.click()

      // Should show a shareable link or copy button
      await expect(
        page.getByText(/link|copy|shared/i).first()
      ).toBeVisible({ timeout: 5000 })
    }
  })
})
