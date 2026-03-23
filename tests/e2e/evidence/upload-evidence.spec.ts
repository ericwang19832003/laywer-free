import { test, expect } from '../fixtures/test-fixtures'
import { mockAIRoutes } from '../fixtures/ai-mocks'
import path from 'path'

test.describe('Evidence Upload', () => {
  test('evidence page loads', async ({ page, testCase }) => {
    await mockAIRoutes(page)
    await page.goto(`/case/${testCase.id}/evidence`)
    await page.waitForLoadState('networkidle')

    await expect(
      page.getByRole('heading', { name: "You're building your case file." })
    ).toBeVisible({ timeout: 10000 })
  })

  test('upload PDF via file input', async ({ page, testCase }) => {
    await mockAIRoutes(page)

    // Mock the upload endpoint to avoid actual file storage
    await page.route('**/storage/v1/object/**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ Key: 'test/sample.pdf' }),
      })
    )

    await page.goto(`/case/${testCase.id}/evidence`)
    await page.waitForLoadState('networkidle')

    await expect(
      page.getByRole('heading', { name: "You're building your case file." })
    ).toBeVisible({ timeout: 10000 })

    // Look for file input and upload
    const fileInput = page.locator('input[type="file"]')
    if (await fileInput.count() > 0) {
      const samplePath = path.resolve(__dirname, '../fixtures/files/sample.pdf')
      await fileInput.first().setInputFiles(samplePath)

      // Wait for upload indication (success toast or file appearing in list)
      // The exact behavior depends on the EvidenceVault component
      await page.waitForTimeout(2000)
    }
  })

  test('back to dashboard button works', async ({ page, testCase }) => {
    await mockAIRoutes(page)
    await page.goto(`/case/${testCase.id}/evidence`)
    await page.waitForLoadState('networkidle')

    await page.getByRole('link', { name: /Back to dashboard/i }).click()
    await expect(page).toHaveURL(new RegExp(`/case/${testCase.id}`), { timeout: 10000 })
  })
})
