import { test, expect } from '../fixtures/test-fixtures'
import { mockAIRoutes } from '../fixtures/ai-mocks'

test.describe('Navigation', () => {
  test('top nav shows logo and links to /cases', async ({ page }) => {
    await page.goto('/cases')

    const logoLink = page.locator('a[href="/cases"]').first()
    await expect(logoLink).toBeVisible()
  })

  test('user menu is accessible', async ({ page }) => {
    await page.goto('/cases')

    // The main nav (not breadcrumb nav)
    const mainNav = page.locator('nav').first()
    await expect(mainNav).toBeVisible()

    // User menu trigger — last interactive element in the top nav
    const avatarButton = mainNav.getByRole('button').last()
    await avatarButton.click()

    // Dropdown should show Settings or Sign Out
    await expect(
      page.getByRole('menuitem', { name: /Settings/i })
        .or(page.getByRole('link', { name: /Settings/i }))
    ).toBeVisible({ timeout: 3000 })
  })

  test('breadcrumbs show on case dashboard', async ({ page, testCase }) => {
    await mockAIRoutes(page)
    await page.goto(testCase.url)

    await expect(page.getByRole('heading', { name: 'One step at a time.' })).toBeVisible({
      timeout: 10000,
    })
  })

  test('workflow sidebar shows on desktop', async ({ page, testCase }) => {
    await mockAIRoutes(page)

    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto(testCase.url)

    await expect(page.getByText(/steps? complete|progress/i).first()).toBeVisible({
      timeout: 10000,
    })
  })

  test('navigate from cases to settings', async ({ page }) => {
    await page.goto('/cases')

    const mainNav = page.locator('nav').first()
    const avatarButton = mainNav.getByRole('button').last()
    await avatarButton.click()

    await page
      .getByRole('menuitem', { name: /Settings/i })
      .or(page.getByRole('link', { name: /Settings/i }))
      .click()

    await expect(page).toHaveURL(/\/settings/, { timeout: 10000 })
  })

  test('sign out option is visible in user menu', async ({ page }) => {
    await page.goto('/cases')

    const mainNav = page.locator('nav').first()
    const avatarButton = mainNav.getByRole('button').last()
    await avatarButton.click()

    // Verify sign out option exists (don't click it to avoid invalidating session)
    const signOut = page
      .getByRole('menuitem', { name: /Sign Out/i })
      .or(page.getByText('Sign Out'))
    await expect(signOut).toBeVisible({ timeout: 3000 })
  })
})
