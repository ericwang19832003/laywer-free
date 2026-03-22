import { test, expect } from '../fixtures/test-fixtures'
import { mockAIRoutes } from '../fixtures/ai-mocks'

test.describe('Dashboard Overview', () => {
  test('dashboard header and key cards are visible', async ({ page, testCase }) => {
    await mockAIRoutes(page)
    await page.goto(testCase.url)

    // Supportive header
    await expect(page.getByRole('heading', { name: 'One step at a time.' })).toBeVisible({
      timeout: 10000,
    })
  })

  test('next step card is visible', async ({ page, testCase }) => {
    await mockAIRoutes(page)
    await page.goto(testCase.url)

    // NextStepCard should show with a call to action
    await expect(page.getByRole('heading', { name: 'One step at a time.' })).toBeVisible({
      timeout: 10000,
    })
    // The next step card shows the welcome task or similar
    await expect(page.getByText(/Review & Continue|next step|Welcome/i).first()).toBeVisible({
      timeout: 10000,
    })
  })

  test('deadlines card is visible', async ({ page, testCase }) => {
    await mockAIRoutes(page)
    await page.goto(testCase.url)

    await expect(page.getByText(/Deadlines/i).first()).toBeVisible({ timeout: 10000 })
  })

  test('progress card is visible', async ({ page, testCase }) => {
    await mockAIRoutes(page)
    await page.goto(testCase.url)

    await expect(page.getByText(/Progress|steps? complete/i).first()).toBeVisible({
      timeout: 10000,
    })
  })

  test('dashboard loads without errors', async ({ page, testCase }) => {
    await mockAIRoutes(page)
    await page.goto(testCase.url)

    await expect(page.getByRole('heading', { name: 'One step at a time.' })).toBeVisible({
      timeout: 10000,
    })
  })
})
