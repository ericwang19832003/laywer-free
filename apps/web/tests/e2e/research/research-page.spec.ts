import { test, expect } from '../fixtures/test-fixtures'
import { mockAIRoutes } from '../fixtures/ai-mocks'

test.describe('Research Page', () => {
  test('research page loads with overview', async ({ page, testCase }) => {
    await mockAIRoutes(page)
    await page.goto(`/case/${testCase.id}/research`)
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('heading', { name: 'Overview' })).toBeVisible({ timeout: 10000 })
  })

  test('step 1 search card is visible', async ({ page, testCase }) => {
    await mockAIRoutes(page)
    await page.goto(`/case/${testCase.id}/research`)
    await page.waitForLoadState('networkidle')

    await expect(page.getByText('Search for case law')).toBeVisible({ timeout: 10000 })
    await expect(
      page.getByRole('link', { name: 'Go to Search' })
    ).toBeVisible()
  })

  test('step 2 ask card is visible', async ({ page, testCase }) => {
    await mockAIRoutes(page)
    await page.goto(`/case/${testCase.id}/research`)
    await page.waitForLoadState('networkidle')

    await expect(page.getByText('Ask a research question')).toBeVisible({ timeout: 10000 })
    await expect(
      page.getByRole('link', { name: 'Go to Ask' })
    ).toBeVisible()
  })

  test('saved authorities section is visible', async ({ page, testCase }) => {
    await mockAIRoutes(page)
    await page.goto(`/case/${testCase.id}/research`)
    await page.waitForLoadState('networkidle')

    await expect(page.getByText('Saved case law')).toBeVisible({ timeout: 10000 })
  })
})
