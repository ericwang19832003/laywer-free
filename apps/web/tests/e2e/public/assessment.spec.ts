import { test, expect } from '@playwright/test'

async function answerAllQuestions(page: import('@playwright/test').Page) {
  for (let i = 0; i < 5; i++) {
    await page
      .getByText(new RegExp(`Question ${i + 1} of`))
      .waitFor({ timeout: 5000 })
      .catch(() => {})

    // Click the first answer option (border-2 styled buttons)
    const answerOptions = page.locator('button.border-2')
    if ((await answerOptions.count()) > 0) await answerOptions.first().click()

    // Click "Next" or "See My Assessment" — use exact match to avoid Next.js dev tools button
    const isLast = i === 4
    const btnName = isLast ? 'See My Assessment' : 'Next'
    const actionButton = page.getByRole('button', { name: btnName, exact: true })
    await expect(actionButton).toBeEnabled({ timeout: 2000 }).catch(() => {})
    await actionButton.click().catch(() => {})

    await page.waitForTimeout(300)
  }
}

test.describe('Public Assessment Wizard', () => {
  test('small claims assessment wizard loads without auth', async ({ page }) => {
    await page.goto('/assess/small_claims')

    await expect(page.getByText(/Small Claims Case Assessment/i)).toBeVisible({ timeout: 10000 })
    await expect(page.getByText(/Question 1 of/i)).toBeVisible()
  })

  test('complete assessment and see results', async ({ page }) => {
    await page.goto('/assess/small_claims')
    await expect(page.getByText(/Small Claims Case Assessment/i)).toBeVisible({ timeout: 10000 })

    await answerAllQuestions(page)

    await expect(page.getByText('Your Case Assessment')).toBeVisible({ timeout: 5000 })
    await expect(page.getByText(/Case Viability/i)).toBeVisible()
  })

  test('results page has start your case CTA', async ({ page }) => {
    await page.goto('/assess/small_claims')
    await expect(page.getByText(/Small Claims Case Assessment/i)).toBeVisible({ timeout: 10000 })

    await answerAllQuestions(page)

    await expect(page.getByText('Your Case Assessment')).toBeVisible({ timeout: 5000 })
    await expect(
      page
        .getByRole('button', { name: /Start Your Case Free/i })
        .or(page.getByRole('link', { name: /Start Your Case Free/i }))
    ).toBeVisible()
  })
})
