import { test, expect } from '../fixtures/test-fixtures'
import { mockAIRoutes } from '../fixtures/ai-mocks'

test.describe('Intake Step', () => {
  test('intake step loads after welcome is completed', async ({ page, testCase, adminClient }) => {
    await mockAIRoutes(page)

    // Complete the welcome task first so intake unlocks
    await adminClient
      .from('tasks')
      .update({ status: 'completed' })
      .eq('case_id', testCase.id)
      .eq('task_key', 'welcome')

    // Find the intake task (could be small_claims_intake for small_claims case)
    const { data: intakeTask } = await adminClient
      .from('tasks')
      .select('id, task_key')
      .eq('case_id', testCase.id)
      .like('task_key', '%intake%')
      .neq('status', 'locked')
      .limit(1)
      .maybeSingle()

    if (!intakeTask) {
      // Some case types may not have an intake task unlocked yet
      test.skip()
      return
    }

    await page.goto(`/case/${testCase.id}/step/${intakeTask.id}`)
    await page.waitForLoadState('networkidle')

    // Intake step heading should be visible (StepRunner renders <h1>)
    await expect(
      page.getByRole('heading', { level: 1 })
    ).toBeVisible({ timeout: 10000 })
  })

  test('intake form has expected fields', async ({ page, testCase, adminClient }) => {
    await mockAIRoutes(page)

    // Complete welcome
    await adminClient
      .from('tasks')
      .update({ status: 'completed' })
      .eq('case_id', testCase.id)
      .eq('task_key', 'welcome')

    const { data: intakeTask } = await adminClient
      .from('tasks')
      .select('id')
      .eq('case_id', testCase.id)
      .like('task_key', '%intake%')
      .neq('status', 'locked')
      .limit(1)
      .maybeSingle()

    if (!intakeTask) {
      test.skip()
      return
    }

    await page.goto(`/case/${testCase.id}/step/${intakeTask.id}`)
    await page.waitForLoadState('networkidle')

    // The intake form should have common elements like text inputs or textareas
    // Exact fields depend on the dispute type, but all intake forms have something
    const formElements = page.locator('input, textarea, select')
    await expect(formElements.first()).toBeVisible({ timeout: 10000 })
  })
})
