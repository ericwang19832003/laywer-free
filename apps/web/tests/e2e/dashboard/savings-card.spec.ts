import { test, expect } from '../fixtures/test-fixtures'
import { mockAIRoutes } from '../fixtures/ai-mocks'

test.describe('Savings Card', () => {
  test.setTimeout(90000)
  test('does not show on fresh case with no outcome', async ({ page, testCase }) => {
    await mockAIRoutes(page)
    await page.goto(testCase.url, { timeout: 90000 })

    // Wait for the dashboard to fully load
    await expect(page.getByRole('heading', { name: 'One step at a time.' })).toBeVisible({
      timeout: 10000,
    })

    // Savings card shows "Congratulations!" only after a won/settled outcome
    // On a fresh case with no outcome, it should not be visible
    await expect(page.getByText('Congratulations!')).not.toBeVisible()
  })

  test('does not show "You saved" text on fresh case', async ({ page, testCase }) => {
    await mockAIRoutes(page)
    await page.goto(testCase.url, { timeout: 90000 })

    await expect(page.getByRole('heading', { name: 'One step at a time.' })).toBeVisible({
      timeout: 10000,
    })

    // The savings amount text should not appear
    await expect(page.getByText(/You saved an estimated/i)).not.toBeVisible()
  })

  test('does not show share button on fresh case', async ({ page, testCase }) => {
    await mockAIRoutes(page)
    await page.goto(testCase.url, { timeout: 90000 })

    await expect(page.getByRole('heading', { name: 'One step at a time.' })).toBeVisible({
      timeout: 10000,
    })

    // The "Share your success" button from SavingsCard should not appear
    await expect(page.getByText('Share your success')).not.toBeVisible()
  })
})
