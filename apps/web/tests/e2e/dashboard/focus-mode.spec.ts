import { test, expect } from '../fixtures/test-fixtures'
import { mockAIRoutes } from '../fixtures/ai-mocks'

test.describe('Dashboard Focus Mode', () => {
  test.setTimeout(90000)
  test('shows priority cards and More section', async ({ page, testCase }) => {
    await mockAIRoutes(page)
    await page.goto(testCase.url, { timeout: 90000 })

    // Supportive header should be visible
    await expect(page.getByRole('heading', { name: 'One step at a time.' })).toBeVisible({
      timeout: 10000,
    })

    // "More tools & details" toggle should exist
    const moreButton = page.getByText('More tools & details')
    await expect(moreButton).toBeVisible({ timeout: 10000 })
  })

  test('More section expands and collapses', async ({ page, testCase }) => {
    await mockAIRoutes(page)
    await page.goto(testCase.url, { timeout: 90000 })

    // Initially collapsed — "More tools & details" visible
    const moreButton = page.getByText('More tools & details')
    await expect(moreButton).toBeVisible({ timeout: 10000 })

    // Expand
    await moreButton.click()

    // After expanding, "Show less" replaces the button text
    await expect(page.getByText('Show less')).toBeVisible()

    // Secondary cards should now be visible (e.g., notes, timeline, share, delete)
    await expect(page.getByText(/Notes/i).first()).toBeVisible({ timeout: 5000 })

    // Collapse
    await page.getByText('Show less').click()
    await expect(page.getByText('More tools & details')).toBeVisible()
  })

  test('priority cards are always visible without expanding More', async ({ page, testCase }) => {
    await mockAIRoutes(page)
    await page.goto(testCase.url, { timeout: 90000 })

    // Header
    await expect(page.getByRole('heading', { name: 'One step at a time.' })).toBeVisible({
      timeout: 10000,
    })

    // Progress card
    await expect(page.getByText(/Progress|steps? complete/i).first()).toBeVisible({
      timeout: 10000,
    })

    // Deadlines card
    await expect(page.getByText(/Deadlines/i).first()).toBeVisible({ timeout: 10000 })

    // Next step / welcome task
    await expect(page.getByText(/Review & Continue|next step|Welcome/i).first()).toBeVisible({
      timeout: 10000,
    })
  })
})
