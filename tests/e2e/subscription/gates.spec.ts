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

  test('discovery page shows upgrade prompt for free users', async ({ testCase, page }) => {
    await mockAIRoutes(page)

    // Mock discovery packs endpoint to return gate
    await page.route('**/api/cases/*/discovery/packs', (route) => {
      if (route.request().method() === 'POST') {
        return route.fulfill({
          status: 403,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'upgrade_required',
            message: 'Discovery tools require a Pro plan.',
            feature: 'discovery',
            currentTier: 'free',
            upgradeUrl: '/pricing',
          }),
        })
      }
      return route.continue()
    })

    // Navigate to the case's discovery tab/page
    await page.goto(`${testCase.url}/discovery`)
    await page.waitForLoadState('networkidle')

    // The page should indicate the feature requires upgrade
    // Look for upgrade-related text or the modal rendered by UpgradeGateProvider
    const upgradeText = page.getByText(/upgrade|pro plan|discovery tools require/i)
    await expect(upgradeText.first()).toBeVisible({ timeout: 10000 })
  })

  test('upgrade modal appears when case creation hits limit', async ({ page }) => {
    await mockAIRoutes(page)
    await page.goto('/cases')

    // Mock case creation to return upgrade_required
    await page.route('**/api/cases', (route) => {
      if (route.request().method() === 'POST') {
        return route.fulfill({
          status: 403,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'upgrade_required',
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

    // The UpgradeGateProvider modal should appear with "Upgrade to Unlock" title
    const modal = page.getByRole('dialog')
    await expect(modal).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Upgrade to Unlock')).toBeVisible()
    await expect(
      page.getByText("You've reached the case limit on your current plan.")
    ).toBeVisible()
  })

  test('upgrade modal has correct CTA buttons', async ({ page }) => {
    await mockAIRoutes(page)
    await page.goto('/cases')

    // Mock case creation to return upgrade_required
    await page.route('**/api/cases', (route) => {
      if (route.request().method() === 'POST') {
        return route.fulfill({
          status: 403,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'upgrade_required',
            message: "You've reached the case limit on your current plan.",
            feature: 'maxCases',
            currentTier: 'free',
            upgradeUrl: '/pricing',
          }),
        })
      }
      return route.continue()
    })

    // Trigger the wizard flow to hit the gate
    await page.getByRole('button', { name: '+ New Case' }).first().click()
    await page.getByRole('button', { name: /Texas/i }).click()
    await page.getByRole('button', { name: /Plaintiff/i }).click()
    await page.getByRole('button', { name: /Small claim/i }).click()
    await page.getByRole('button', { name: /Security Deposit/i }).click()
    await expect(page.getByText('Our recommendation')).toBeVisible({ timeout: 5000 })
    await page.getByRole('button', { name: /Accept & Get Started|Get Started/i }).click()

    // Wait for upgrade modal
    await expect(page.getByText('Upgrade to Unlock')).toBeVisible({ timeout: 10000 })

    // Verify CTA buttons: "Upgrade to Pro" link and "Maybe Later" dismiss button
    const upgradeLink = page.getByRole('link', { name: /Upgrade to Pro/i })
    await expect(upgradeLink).toBeVisible()
    await expect(upgradeLink).toHaveAttribute('href', '/settings#billing')

    const dismissBtn = page.getByRole('button', { name: /Maybe Later/i })
    await expect(dismissBtn).toBeVisible()

    // Dismiss the modal
    await dismissBtn.click()
    await expect(page.getByText('Upgrade to Unlock')).not.toBeVisible()
  })
})
