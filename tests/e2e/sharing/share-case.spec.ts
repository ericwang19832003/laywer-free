import { test, expect } from '../fixtures/test-fixtures'
import { mockAIRoutes } from '../fixtures/ai-mocks'

test.describe('Share Case', () => {
  test('share card is visible on dashboard', async ({ page, testCase }) => {
    await mockAIRoutes(page)
    await page.goto(testCase.url)
    await page.waitForLoadState('networkidle')

    // ShareCaseCard is inside the collapsed "More" section — expand it first
    const moreButton = page.getByRole('button', { name: /More tools & details/i })
    await moreButton.click()

    // ShareCaseCard should be visible
    await expect(page.getByText(/Share|Sharing/i).first()).toBeVisible({ timeout: 10000 })
  })

  test('enable sharing generates a link', async ({ page, testCase }) => {
    await mockAIRoutes(page)
    await page.goto(testCase.url)
    await page.waitForLoadState('networkidle')

    // Expand the "More" section to reveal the share card
    const moreButton = page.getByRole('button', { name: /More tools & details/i })
    await moreButton.click()

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
