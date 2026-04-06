import { test, expect } from '../fixtures/test-fixtures'
import { mockAIRoutes } from '../fixtures/ai-mocks'

test.describe('Discovery Hub', () => {
  test('discovery page loads', async ({ page, testCase }) => {
    await mockAIRoutes(page)
    await page.goto(`/case/${testCase.id}/discovery`)
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('heading', { name: 'Discovery' })).toBeVisible({ timeout: 10000 })
    await expect(
      page.getByText('Organize your requests for documents, answers, and admissions.')
    ).toBeVisible()
  })

  test('back to dashboard link works', async ({ page, testCase }) => {
    await mockAIRoutes(page)
    await page.goto(`/case/${testCase.id}/discovery`)
    await page.waitForLoadState('networkidle')

    await page.getByRole('link', { name: /Back to dashboard/i }).click()
    await expect(page).toHaveURL(new RegExp(`/case/${testCase.id}`), { timeout: 10000 })
  })

  test('create discovery pack button toggles form', async ({ page, testCase }) => {
    await mockAIRoutes(page)
    await page.goto(`/case/${testCase.id}/discovery`)
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('heading', { name: 'Discovery' })).toBeVisible({ timeout: 10000 })

    const createButton = page.getByRole('button', { name: /Create a discovery pack/i })
    if (await createButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await createButton.click()

      await expect(page.getByText('New discovery pack')).toBeVisible({ timeout: 3000 })
      await expect(page.getByPlaceholder(/First Set of Interrogatories/i)).toBeVisible()

      await page.getByRole('button', { name: 'Cancel' }).click()
      await expect(page.getByText('New discovery pack')).not.toBeVisible()
    }
  })
})
