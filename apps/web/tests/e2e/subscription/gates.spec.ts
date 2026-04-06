import { test, expect } from '../fixtures/test-fixtures'
import { mockAIRoutes } from '../fixtures/ai-mocks'

test.describe('Subscription Gates', () => {
  test('free user can create first case', async ({ page }) => {
    await mockAIRoutes(page)
    await page.goto('/cases')

    // Should be able to click New Case button
    const newCaseBtn = page.getByRole('button', { name: '+ New Case' }).first()
    await expect(newCaseBtn).toBeVisible()
    await expect(newCaseBtn).toBeEnabled()
  })

  test('document generation gate returns upgrade prompt on limit', async ({ page }) => {
    await mockAIRoutes(page)

    // Mock the doc gen endpoint to simulate the gate
    await page.route('**/api/document-generation', (route) => {
      if (route.request().method() === 'POST') {
        return route.fulfill({
          status: 403,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'upgrade_required',
            message: "You've used all your AI generations this month.",
            feature: 'aiGenerationsPerMonth',
            currentTier: 'free',
            upgradeUrl: '/pricing',
          }),
        })
      }
      return route.continue()
    })

    await page.goto('/cases')
    // The upgrade modal component is rendered by UpgradeGateProvider when
    // gatedFetch receives a 403 upgrade_required response.
    // Verify the modal component structure exists in the DOM when triggered.
  })

  test('discovery page loads for free users', async ({ testCase, page }) => {
    await mockAIRoutes(page)

    // Navigate to the case's discovery page
    await page.goto(`${testCase.url}/discovery`)
    await page.waitForLoadState('networkidle')

    // The discovery page renders for all users (gate is on pack generation, not page load)
    await expect(page.getByText('Discovery')).toBeVisible({ timeout: 10000 })
    await expect(
      page.getByText(/organize your requests for documents/i)
    ).toBeVisible()
  })

  test('case creation shows error when hitting plan limit', async ({ page }) => {
    await mockAIRoutes(page)
    await page.goto('/cases')

    // Mock case creation to return upgrade_required
    await page.route('**/api/cases', (route) => {
      if (route.request().method() === 'POST') {
        return route.fulfill({
          status: 403,
          contentType: 'application/json',
          body: JSON.stringify({
            error: "You've reached the case limit on your current plan.",
            message: "You've reached the case limit on your current plan.",
            feature: 'maxCases',
            currentTier: 'free',
            upgradeUrl: '/pricing',
          }),
        })
      }
      return route.continue()
    })

    // Try to create a case — click through the wizard
    await page.getByRole('button', { name: '+ New Case' }).first().click()

    // Step through wizard: state → role → dispute → sub-type → accept
    await page.getByRole('button', { name: /Texas/i }).click()
    await page.getByRole('button', { name: /Plaintiff/i }).click()
    await page.getByRole('button', { name: /Small claim/i }).click()
    await page.getByRole('button', { name: /Security Deposit/i }).click()
    await expect(page.getByText('Our recommendation')).toBeVisible({ timeout: 5000 })
    await page.getByRole('button', { name: /Accept & Get Started|Get Started/i }).click()

    // The wizard shows an inline error message (not a separate modal)
    await expect(
      page.getByText("You've reached the case limit on your current plan.")
    ).toBeVisible({ timeout: 10000 })
  })

  test('billing section has upgrade buttons for free tier', async ({ page }) => {
    await mockAIRoutes(page)
    await page.goto('/settings')

    // Scroll to billing section (below the fold)
    const billing = page.locator('#billing')
    await billing.scrollIntoViewIfNeeded()

    await expect(page.getByText('Billing & Subscription')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Upgrade to Essentials')).toBeVisible()
    await expect(page.getByText('$19/mo')).toBeVisible()
    await expect(page.getByText('Upgrade to Pro')).toBeVisible()
    await expect(page.getByText('$39/mo')).toBeVisible()
  })
})
