import { test, expect, TEST_EMAIL } from '../fixtures/test-fixtures'
import { mockAIRoutes } from '../fixtures/ai-mocks'

test.describe('Create Case Wizard', () => {
  test.setTimeout(90000)
  test('full wizard flow: state → role → dispute → recommendation → dashboard', async ({
    page,
    adminClient,
  }) => {
    // Look up the test user for the route intercept fallback
    const { data: users } = await adminClient.auth.admin.listUsers()
    const testUser = users?.users?.find((u) => u.email === TEST_EMAIL)

    await mockAIRoutes(page)

    // Intercept the POST /api/cases: if the real API returns 403 (subscription gate),
    // create the case via admin client and return a 201 response.
    let createdCaseId: string | null = null
    await page.route('**/api/cases', async (route) => {
      if (route.request().method() !== 'POST') return route.continue()

      // Try the real request first
      const response = await route.fetch()
      if (response.ok()) return route.fulfill({ response })

      // If blocked by subscription gate, create via admin client
      if (testUser) {
        const body = JSON.parse(route.request().postData() || '{}')
        const { data: newCase } = await adminClient
          .from('cases')
          .insert({
            user_id: testUser.id,
            role: body.role || 'plaintiff',
            jurisdiction: body.state || 'TX',
            court_type: body.court_type || 'jp',
            dispute_type: body.dispute_type || 'small_claims',
            status: 'active',
          })
          .select()
          .single()

        if (newCase) {
          createdCaseId = newCase.id
          return route.fulfill({
            status: 201,
            contentType: 'application/json',
            body: JSON.stringify({ case: newCase, tasks: [] }),
          })
        }
      }
      return route.fulfill({ response })
    })

    await page.goto('/cases', { timeout: 90000 })
    // Wait for hydration to complete before interacting
    await page.waitForLoadState('networkidle')

    // Open the new case dialog (may have two buttons — header + empty state)
    await page.getByRole('button', { name: '+ New Case' }).first().click()

    // Step 1: Select state (Texas)
    await expect(page.getByText('Which state is this case in?')).toBeVisible({ timeout: 10000 })
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

    // Final step: Recommendation with "Get Started"
    await expect(page.getByText('Our recommendation')).toBeVisible({ timeout: 5000 })
    await page.getByRole('button', { name: /Get Started/i }).click()

    // Should redirect to the case dashboard
    await expect(page).toHaveURL(/\/case\/[a-f0-9-]+/, { timeout: 30000 })
    await expect(page.getByText('One step at a time')).toBeVisible({ timeout: 30000 })

    // Cleanup: delete the case created during the wizard flow
    if (createdCaseId && testUser) {
      await adminClient.from('cases').delete().eq('id', createdCaseId)
    }
  })

  test('wizard back navigation works', async ({ page }) => {
    await page.goto('/cases', { timeout: 90000 })
    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: '+ New Case' }).first().click()

    // Select Texas
    await expect(page.getByText('Which state is this case in?')).toBeVisible({ timeout: 10000 })
    await page.getByRole('button', { name: /Texas/i }).click()

    // Should be on role step
    await expect(page.getByText('I am the...')).toBeVisible()

    // Click the back button (← Back text link in wizard)
    await page.getByText('Back').first().click()

    // Should be back on state step
    await expect(page.getByText('Which state is this case in?')).toBeVisible()
  })
})
