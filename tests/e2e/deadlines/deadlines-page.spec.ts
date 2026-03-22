import { test, expect } from '../fixtures/test-fixtures'
import { mockAIRoutes } from '../fixtures/ai-mocks'

test.describe('Deadlines Page', () => {
  test('deadlines page loads with heading', async ({ page, testCase }) => {
    await mockAIRoutes(page)
    await page.goto(`/case/${testCase.id}/deadlines`)

    await expect(page.getByRole('heading', { name: 'Your Deadlines' })).toBeVisible({
      timeout: 10000,
    })
  })

  test('add deadline button opens form dialog', async ({ page, testCase }) => {
    await mockAIRoutes(page)
    await page.goto(`/case/${testCase.id}/deadlines`)

    await page.getByRole('button', { name: 'Add a Deadline' }).click()

    // Dialog heading
    await expect(page.getByRole('heading', { name: 'Add a deadline' })).toBeVisible()
    // Due date input should be visible
    await expect(page.locator('#due-date')).toBeVisible()
  })

  test('add manual deadline via form', async ({ page, testCase }) => {
    await mockAIRoutes(page)
    await page.goto(`/case/${testCase.id}/deadlines`)

    await page.getByRole('button', { name: 'Add a Deadline' }).click()

    // Type is a Radix Select (combobox), not native <select>
    await page.locator('#deadline-type').click()
    await page.getByRole('option', { name: /Hearing Date/i }).click()

    // Set a future date
    const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    const dateStr = futureDate.toISOString().slice(0, 16)
    await page.locator('#due-date').fill(dateStr)

    // Source is also a Radix Select
    await page.locator('#source').click()
    await page.getByRole('option', { name: /I confirmed this/i }).click()

    // Submit
    await page.getByRole('button', { name: 'Save Deadline' }).click()

    // Should show success
    await expect(page.getByText(/Got it|saved|Hearing/i).first()).toBeVisible({ timeout: 5000 })
  })

  test('back to dashboard link works', async ({ page, testCase }) => {
    await mockAIRoutes(page)
    await page.goto(`/case/${testCase.id}/deadlines`)

    await page.getByRole('link', { name: /Back to dashboard/i }).click()
    await expect(page).toHaveURL(new RegExp(`/case/${testCase.id}`), { timeout: 10000 })
  })
})
