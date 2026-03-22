import { test, expect } from '../fixtures/test-fixtures'
import { mockAIRoutes } from '../fixtures/ai-mocks'

test.describe('Cases List', () => {
  test('page renders with heading and new case button', async ({ page }) => {
    await page.goto('/cases')

    await expect(page.getByRole('heading', { name: 'Cases' })).toBeVisible()
    await expect(page.getByRole('button', { name: '+ New Case' }).first()).toBeVisible()
  })

  test('case table shows created case', async ({ page, testCase }) => {
    await mockAIRoutes(page)
    await page.goto('/cases')

    // The table should render with at least one row
    const caseLink = page.locator(`a[href*="/case/${testCase.id}"]`)
    await expect(caseLink.first()).toBeVisible({ timeout: 10000 })
  })

  test('new case button opens wizard dialog', async ({ page }) => {
    await page.goto('/cases')

    await page.getByRole('button', { name: '+ New Case' }).first().click()

    // Dialog should appear with the wizard
    await expect(page.getByText('Start a new case')).toBeVisible()
    await expect(page.getByText('Which state is this case in?')).toBeVisible()
  })

  test('stats cards visible when cases exist', async ({ page, testCase }) => {
    await mockAIRoutes(page)
    await page.goto('/cases')

    // StatsCards should be visible
    await expect(page.getByText(/Active Cases|Tasks Completed/i).first()).toBeVisible({
      timeout: 10000,
    })
  })
})
