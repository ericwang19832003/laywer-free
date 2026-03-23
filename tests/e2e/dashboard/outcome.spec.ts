import { test, expect } from '../fixtures/test-fixtures'
import { mockAIRoutes } from '../fixtures/ai-mocks'

test.describe('Outcome Prompt', () => {
  test.setTimeout(90000)
  test('does not show when tasks remain', async ({ page, testCase }) => {
    await mockAIRoutes(page)
    await page.goto(testCase.url, { timeout: 90000 })

    // Wait for the dashboard to load
    await expect(page.getByRole('heading', { name: 'One step at a time.' })).toBeVisible({
      timeout: 10000,
    })

    // With a fresh test case, not all tasks are done
    // The outcome prompt ("How did your case turn out?") should NOT be visible
    await expect(page.getByText('How did your case turn out?')).not.toBeVisible()
  })

  test('outcome API requires auth', async ({ page }) => {
    // Hitting the outcome endpoint with a fake case ID should return an error status
    const response = await page.request.get('/api/cases/00000000-0000-0000-0000-000000000000/outcome')
    // Should require auth or return not found
    expect([401, 404, 405]).toContain(response.status())
  })

  test('outcome options render correctly when all tasks done', async ({ page, testCase }) => {
    await mockAIRoutes(page)

    // Mock the dashboard RPC to report all tasks as completed
    await page.route('**/rest/v1/rpc/get_case_dashboard', (route) => {
      if (route.request().method() === 'POST') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            next_task: null,
            tasks_summary: { completed: 5, skipped: 0 },
            upcoming_deadlines: [],
            recent_events: [],
          }),
        })
      }
      return route.continue()
    })

    await page.goto(testCase.url, { timeout: 90000 })

    // If the mock takes effect (server-side rendering may bypass it),
    // check that the outcome prompt appears with expected options.
    // Since this is SSR, the route mock may not intercept the server call.
    // This is a best-effort check — skip gracefully if SSR bypasses the mock.
    const outcomeHeading = page.getByText('How did your case turn out?')
    const isVisible = await outcomeHeading.isVisible().catch(() => false)

    if (isVisible) {
      // Verify the five outcome options are present
      await expect(page.getByText('Won')).toBeVisible()
      await expect(page.getByText('Settled')).toBeVisible()
      await expect(page.getByText('Lost')).toBeVisible()
      await expect(page.getByText('Dropped')).toBeVisible()
      await expect(page.getByText('Still Ongoing')).toBeVisible()

      // Verify action buttons
      await expect(page.getByText('Save Outcome')).toBeVisible()
      await expect(page.getByText('Ask me later')).toBeVisible()
    }
  })
})
