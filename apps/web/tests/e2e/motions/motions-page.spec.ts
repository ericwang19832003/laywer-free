import { test, expect } from '../fixtures/test-fixtures'
import { mockAIRoutes } from '../fixtures/ai-mocks'

test.describe('Motions Page', () => {
  test('motions hub loads', async ({ page, testCase }) => {
    await mockAIRoutes(page)
    await page.goto(`/case/${testCase.id}/motions`)
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('heading', { name: 'Motions Hub' })).toBeVisible({ timeout: 10000 })
    await expect(
      page.getByText('Create and manage your motions and legal filings.')
    ).toBeVisible()
  })

  test('motion categories are displayed', async ({ page, testCase }) => {
    await mockAIRoutes(page)
    await page.goto(`/case/${testCase.id}/motions`)
    await page.waitForLoadState('networkidle')

    // Should show motion category sections
    await expect(page.getByText('Discovery').first()).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Pretrial').first()).toBeVisible()
  })

  test('back to dashboard link works', async ({ page, testCase }) => {
    await mockAIRoutes(page)
    await page.goto(`/case/${testCase.id}/motions`)
    await page.waitForLoadState('networkidle')

    await page.getByRole('link', { name: /Back to dashboard/i }).click()
    await expect(page).toHaveURL(new RegExp(`/case/${testCase.id}`), { timeout: 10000 })
  })
})
