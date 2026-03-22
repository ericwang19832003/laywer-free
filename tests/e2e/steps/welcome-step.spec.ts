import { test, expect } from '../fixtures/test-fixtures'
import { mockAIRoutes } from '../fixtures/ai-mocks'

test.describe('Welcome Step', () => {
  test('navigate to welcome step and complete it', async ({ page, testCase, adminClient }) => {
    await mockAIRoutes(page)

    const { data: welcomeTask } = await adminClient
      .from('tasks')
      .select('id')
      .eq('case_id', testCase.id)
      .eq('task_key', 'welcome')
      .single()

    expect(welcomeTask).toBeTruthy()

    await page.goto(`/case/${testCase.id}/step/${welcomeTask!.id}`)

    await expect(page.getByRole('heading', { name: /Welcome/i })).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Welcome to your case organizer.')).toBeVisible()

    // Complete the step
    await page.getByRole('button', { name: "I'm ready" }).click()

    // After completing, the page may show a success state or redirect
    // Wait for the button to disappear (indicates completion)
    await expect(page.getByRole('button', { name: "I'm ready" })).not.toBeVisible({
      timeout: 10000,
    })
  })

  test('back to dashboard link works', async ({ page, testCase, adminClient }) => {
    await mockAIRoutes(page)

    const { data: welcomeTask } = await adminClient
      .from('tasks')
      .select('id')
      .eq('case_id', testCase.id)
      .eq('task_key', 'welcome')
      .single()

    await page.goto(`/case/${testCase.id}/step/${welcomeTask!.id}`)

    await page.getByRole('link', { name: /Back to dashboard/i }).click()
    await expect(page).toHaveURL(new RegExp(`/case/${testCase.id}`), { timeout: 10000 })
  })
})
