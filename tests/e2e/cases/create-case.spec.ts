import { test, expect } from '../fixtures/test-fixtures'
import { mockAIRoutes } from '../fixtures/ai-mocks'

test.describe('Create Case Wizard', () => {
  test('full wizard flow: state → role → dispute → recommendation → dashboard', async ({
    page,
  }) => {
    await mockAIRoutes(page)
    await page.goto('/cases')

    // Open the new case dialog (may have two buttons — header + empty state)
    await page.getByRole('button', { name: '+ New Case' }).first().click()

    // Step 1: Select state (Texas)
    await expect(page.getByText('Which state is this case in?')).toBeVisible()
    await page.getByRole('button', { name: /Texas/i }).click()

    // Step 2: Select role (Plaintiff)
    await expect(page.getByText('I am the...')).toBeVisible()
    await page.getByRole('button', { name: /Plaintiff/i }).click()

    // Step 3: Select dispute type (Small claim)
    await expect(page.getByText('What is this dispute about?')).toBeVisible()
    await page.getByRole('button', { name: /Small claim/i }).click()

    // Step 4: Small claims sub-type — select first option
    await expect(page.getByText(/What type of small claim/i)).toBeVisible({ timeout: 3000 })
    // Click the first sub-type option (e.g., "Security Deposit")
    await page.getByRole('button', { name: /Security Deposit/i }).click()

    // Final step: Recommendation with "Accept & Get Started"
    await expect(page.getByText('Our recommendation')).toBeVisible({ timeout: 5000 })
    await page.getByRole('button', { name: /Accept & Get Started|Get Started/i }).click()

    // Should redirect to the case dashboard
    await expect(page).toHaveURL(/\/case\/[a-f0-9-]+/, { timeout: 15000 })
    await expect(page.getByText('One step at a time')).toBeVisible()
  })

  test('wizard back navigation works', async ({ page }) => {
    await page.goto('/cases')
    await page.getByRole('button', { name: '+ New Case' }).first().click()

    // Select Texas
    await expect(page.getByText('Which state is this case in?')).toBeVisible()
    await page.getByRole('button', { name: /Texas/i }).click()

    // Should be on role step
    await expect(page.getByText('I am the...')).toBeVisible()

    // Click the back button (← Back text link in wizard)
    await page.getByText('Back').first().click()

    // Should be back on state step
    await expect(page.getByText('Which state is this case in?')).toBeVisible()
  })
})
